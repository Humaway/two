// ============================================================ CONTENT: 2.4 ("Every Sunday"), 2.5 ("Are You Sure You're Sure?")
// BUILD_PROMPT §8. Every line is final and word for word; '^' = a beat. Shot tags are quoted in the comments.
// Sets: rue_house (docs/sets/rue_house.md: knock24 -> explore24 -> tea24 -> gate24), bridge (docs/sets/bridge.md:
// checkpoint25 -> gate25 -> alarm25 -> chase25 -> end25) and the hq_top cutaway (dress s25, env cutaway, the drone footage
// on the glass). Rue appears here and nowhere else: he is spawned by this file in 2.4 only.
// Mini-games: MINIGAMES.roleplay + reason_cards (45-mg-teddy.js: "Afternoon, Santa." … "It doesn't like any of them.",
// the SafeSense rejections and "…Christmas is a protected holiday. ^ Reason accepted.") and MINIGAMES.scooter
// (46-mg-scooter.js: the dash asks, "Gotcha! ^ For your safety!", "After you!"; the 2.5_laugh cutscene below runs at its
// halfway mark; endLine: false, so the drones' end line is said here, over the drones stopped at the edge).
// Systems: Chip View + AR (PENINSULA LOCKDOWN), chip.forceOff (the prompt), DRONES + stealth (the sweeper, the queue,
// the gate) and the scan (hint 4: ERROR 4044 — IDENTITY CONFLICT, played silently: nobody points it at Luka).
// Music: 2.4 none (Rue's Walkman, a tiny speaker inside the house, then it stops); 2.5 'checkpoint', 'scooter' for the
// chase, none at the mangroves or in the Manager's office. Honest moments (the tea, the gate) play straight.
// The third and last shortened word: "Pass the bics. ^ Biscuits." (the reaction: the two of them look at each other).
(() => {
  const PI = Math.PI, H = PI / 2;
  const say = (id, text, o) => Object.assign({ say: id, text }, o);
  const slow = (id, text, o) => say(id, text, Object.assign({ speed: 'slow' }, o));
  const sk = (c) => c.flow.skipping;
  const P = (c, n) => c.world.prop(n);
  const act = (c, id) => c.world.actor(id);
  const V1 = new THREE.Vector3();
  const v3 = (p) => [p.x ?? p[0], p.y ?? p[1], p.z ?? p[2]];
  // one tick later (even while skipping): a set re-dresses itself on its first tick in a new scene, so content that
  // dresses after it (Continue) runs then
  const nextTick = () => new Promise((res) => { const f = () => { removeUpdate(f); res(); }; addUpdate(f); });
  // a tween on the game clock, snapped at once while skipping or when the scene changes
  function tween(c, dur, fn) {
    const sid = c.flow.sceneId;
    if (c.flow.skipping || !(dur > 0)) { fn(1); return; }
    let t = 0;
    const f = (dt) => { t = Math.min(1, t + dt / dur); if (flow.sceneId !== sid || flow.skipping) t = 1; fn(t * t * (3 - 2 * t)); if (t >= 1) removeUpdate(f); };
    addUpdate(f);
  }
  // a capped wait for a condition (resolves on a skip, a scene change or the cap)
  const until = (c, f, cap = 20) => { const t0 = clock.t, sid = c.flow.sceneId; return waitUntil(() => f() || c.flow.skipping || flow.sceneId !== sid || clock.t - t0 > cap); };
  // a computed close-up: the lens `dist` m from his eyes, `yaw` rad off his facing (+ = toward his left), pushing in
  // `push` m over `dur` s. Read at step time (faces placed under the cut); nothing while skipping.
  function closeOn(c, id, o = {}) {
    if (sk(c)) return;
    const a = act(c, id);
    if (!a) return;
    c.ui.card(null);
    a.eyePos(V1);
    const turning = !!(a.fc && a.fc.on);
    if (turning) {   // mid-turn (a face step is not awaited): frame where the turn ends
      const dr = a.fc.a1 - a.rotY, dx = V1.x - a.pos.x, dz = V1.z - a.pos.z, cs = Math.cos(dr), sn = Math.sin(dr);
      V1.x = a.pos.x + dx * cs + dz * sn; V1.z = a.pos.z - dx * sn + dz * cs;
    }
    const ry = (turning ? a.fc.a1 : a.rotY) + (o.yaw || 0), d = o.dist || 0.95, pu = o.push ?? 0.12, ly = V1.y - 0.05 + (o.ly || 0);
    const sx = Math.sin(ry), sz = Math.cos(ry), y = V1.y + (o.dy ?? -0.02), lx = V1.x + (o.lx || 0), lz = V1.z + (o.lz || 0);
    c.cam.shot({ shot: 'CAM', pos: [V1.x + sx * d, y, V1.z + sz * d], look: [lx, ly, lz], fov: o.fov || 36,
      to: { pos: [V1.x + sx * (d - pu), y, V1.z + sz * (d - pu)], look: [lx, ly, lz], fov: o.fov || 36 }, dur: o.dur || 7, ease: 'linear' });
  }
  const CLOSE = (id, o) => ({ do: (c) => closeOn(c, id, o) });
  // a glide between two explicit lenses
  const glideCam = (pos, look, fov, to, dur = 6, ease = 'linear') => ({ shot: 'CAM', pos, look, fov, to, dur, ease });
  // a set anchor's lens with a slow push of `push` m toward its look (data read at load: the set files come first)
  function aPush(setId, name, push = 0.2, dur = 8, o = {}) {
    const S = SETS[setId], an = S && S.anchors && S.anchors[name];
    const extra = o.card ? { card: o.card } : null;
    if (!an) return Object.assign({ shot: 'INSERT', at: name }, extra);
    const f = v3(an.from), t = v3(an.at), d = Math.hypot(t[0] - f[0], t[1] - f[1], t[2] - f[2]) || 1, k = push / d, fov = o.fov || an.fov || 40;
    return Object.assign({ shot: 'CAM', pos: f, look: t, fov, to: { pos: [f[0] + (t[0] - f[0]) * k, f[1] + (t[1] - f[1]) * k, f[2] + (t[2] - f[2]) * k], look: t, fov: o.fovTo || fov }, dur, ease: 'linear' }, extra);
  }
  // Luka's tell: a glance at Chase before he speaks (a head turn; the feet stay). Also anyone's look.
  const glance = (from, to, dur = 1.0) => ({ do: (c) => {
    if (sk(c)) return;
    const a = act(c, from), b = typeof to === 'string' ? act(c, to) : null, tx = b ? b.pos.x : to[0], tz = b ? b.pos.z : to[2];
    if (!a || tx == null) return;
    let d = Math.atan2(tx - a.pos.x, tz - a.pos.z) - a.rotY; d = Math.atan2(Math.sin(d), Math.cos(d));
    a.play('glance', { yaw: Math.max(-1.3, Math.min(1.3, d)), dur });
  } });
  // seat an actor at once (keeps under skips; the pose is state)
  const seat = (id, h = 0.45) => ({ do: (c) => { const a = act(c, id); if (!a) return; a.play('sit', { h }); a.rig.seated = true; } });
  const unseat = (id) => ({ do: (c) => { const a = act(c, id); if (!a) return; a.rig.seated = false; a.rig.floorSit = false; a.play('idle'); } });
  // act when the typewriter reaches `sub` in `line` (any text speed); '^' beats are not typed, so index the typed text
  const typedIndex = (line, sub) => { const out = line.replace(/ ?\^ ?/g, (m, i) => (i === 0 ? '' : ' ')).replace(/ {2,}/g, ' '); return out.indexOf(sub); };
  function onText(line, sub, fn) {
    const i = typedIndex(line, sub);
    return { do: (c) => {
      if (sk(c)) { fn(c); return; }
      const el = document.querySelector('#dlg .txt'), n = el && [...el.childNodes].find((x) => x.nodeType === 3), t0 = clock.t;
      return waitUntil(() => c.flow.skipping || !n || i < 0 || n.data.startsWith(sub, i) || clock.t - t0 > 30).then(() => fn(c));
    } };
  }
  // wear / take off parts of a rig (pooled rigs: spawn re-dresses them; content restores what it changes)
  const wear = (id, part, on) => ({ do: (c) => { const a = act(c, id); if (a && a.rig.attach[part]) a.rig.show(part, on); } });
  // Luka's Santa beard: 'on' | 'slip' | 'chin' | 'ear'
  const beard = (st) => ({ do: (c) => { const l = act(c, 'luka'), b = l && l.rig.attach.santa_beard; if (b) b.userData.state(st); } });
  // autoplay: SWAP until `id` leads (bounded: SWAP may be off)
  const swapTo = (c, id) => { for (let i = 0; i < 3 && c.state.active !== id; i++) c.flow.swapNext(); if (c.state.active !== id) console.error('TWO: could not swap to ' + id); };
  const prop = (n, fn) => ({ do: (c) => { const o = P(c, n); if (o) fn(o.userData, c); } });

  // ---------------------------------------------------------- CARDS (readable INSERTs this file owns)
  // 2.4: Rue's corkboard, the last pages. Every Sunday ticked in red, LADS in blue biro, from late 2026 to 17 December
  // 2034. Sunday 24 December 2034 and every page after: blank.
  const MONTHS = ['JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE', 'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'];
  const ladsOn = (y, m, d) => y < 2034 || (y === 2034 && (m < 11 || d <= 17));
  function corkPage(cx, K_, yr, mi, x, y, pw, ph, rot, pin) {
    cx.save(); cx.translate(x + pw / 2, y + ph / 2); cx.rotate(rot); cx.translate(-pw / 2, -ph / 2);
    K_.shadow(cx, 16, 6, 0.4); cx.fillStyle = '#f7f3e8'; cx.fillRect(0, 0, pw, ph); K_.noShadow(cx);
    cx.fillStyle = 'rgba(120,100,60,.08)'; cx.fillRect(0, ph * 0.86, pw, ph * 0.14);
    cx.textAlign = 'center'; cx.textBaseline = 'alphabetic';
    cx.fillStyle = '#b8322a'; cx.font = `bold ${Math.round(pw * 0.085)}px ${K_.SANS}`; cx.fillText(`${MONTHS[mi]} ${yr}`, pw / 2, ph * 0.1);
    const gx = pw * 0.04, gw = pw * 0.92, cw = gw / 7, gy = ph * 0.17, rh = ph * 0.13;
    cx.font = `bold ${Math.round(pw * 0.042)}px ${K_.SANS}`; cx.fillStyle = '#7a7f86';
    'MTWTFSS'.split('').forEach((ch, i) => { cx.fillStyle = i === 6 ? '#b8322a' : '#7a7f86'; cx.fillText(ch, gx + cw * (i + 0.5), gy); });
    cx.fillStyle = 'rgba(0,0,0,.09)';
    for (let r = 0; r <= 6; r++) cx.fillRect(gx, gy + rh * (r + 0.18), gw, 1.5);
    for (let i = 1; i < 7; i++) cx.fillRect(gx + cw * i, gy + rh * 0.18, 1.5, rh * 6);
    const first = (new Date(yr, mi, 1).getDay() + 6) % 7, days = new Date(yr, mi + 1, 0).getDate();
    for (let dd = 1; dd <= days; dd++) {
      const k = first + dd - 1, col = k % 7, row = Math.floor(k / 7), tx = gx + cw * col, ty = gy + rh * (row + 0.18);
      cx.textAlign = 'left'; cx.font = `${Math.round(pw * 0.04)}px ${K_.SANS}`; cx.fillStyle = col === 6 ? '#b8322a' : '#3a3e46';
      cx.fillText(String(dd), tx + cw * 0.08, ty + rh * 0.3);
      if (col === 6 && ladsOn(yr, mi, dd)) {
        // the tick (red felt) and LADS (blue biro)
        cx.strokeStyle = '#c42a20'; cx.lineWidth = Math.max(3, pw * 0.012); cx.lineCap = 'round'; cx.lineJoin = 'round';
        cx.beginPath(); cx.moveTo(tx + cw * 0.5, ty + rh * 0.24); cx.lineTo(tx + cw * 0.64, ty + rh * 0.4); cx.lineTo(tx + cw * 0.92, ty + rh * 0.06); cx.stroke();
        K_.hand(cx, 'LADS', tx + cw * 0.5, ty + rh * 0.9, Math.round(cw * 0.42), '#1d2f8f', { align: 'center', bold: true });
      }
    }
    // the pin
    cx.fillStyle = 'rgba(0,0,0,.3)'; cx.beginPath(); cx.ellipse(pw / 2 + 4, 12, 11, 7, 0, 0, 7); cx.fill();
    cx.fillStyle = pin; cx.beginPath(); cx.arc(pw / 2, 8, 11, 0, 7); cx.fill();
    cx.fillStyle = 'rgba(255,255,255,.45)'; cx.beginPath(); cx.arc(pw / 2 - 3, 5, 4, 0, 7); cx.fill();
    cx.restore();
  }
  CARDS.s24_cork = (cx, w, h) => {
    const K_ = CARDS._kit;
    K_.seedOf('s24_cork');
    // the cork and its frame
    K_.shadow(cx, 30, 12); cx.fillStyle = '#4a2f18'; K_.rr(cx, 6, 6, w - 12, h - 12, 12); cx.fill(); K_.noShadow(cx);
    cx.fillStyle = '#b8824a'; cx.fillRect(30, 30, w - 60, h - 60);
    for (let i = 0; i < 2600; i++) { cx.fillStyle = K_.rnd() < 0.5 ? 'rgba(96,56,24,.30)' : 'rgba(236,190,128,.26)'; cx.fillRect(30 + K_.rnd() * (w - 64), 30 + K_.rnd() * (h - 64), 2 + K_.rnd() * 3, 2 + K_.rnd() * 3); }
    // January 2035 (under, right), December 2034 (the big one), November 2034 (on top, left): every page's Sunday column
    // (the right-hand one) stays in view
    corkPage(cx, K_, 2035, 0, 852, 128, 400, 560, 0.035, '#2a4a8a');
    corkPage(cx, K_, 2034, 11, 372, 62, 520, 700, 0.01, '#b8322a');
    corkPage(cx, K_, 2034, 10, 44, 136, 400, 560, -0.04, '#2a6a3a');
  };
  CARDS.s24_cork.size = [1300, 830];

  // ============================================================ 2.4 — "Every Sunday"
  const S24 = { tok: 0, phase: '', side: 1 };
  const S24_FLAGS = ['s24_bell', 's24_door', 's24_phone_down', 's24_brick', 's24_ex_polaroid', 's24_ex_cork', 's24_ex_walkman', 's24_ex_card', 's24_ex_tin', 's24_tea', 's24_gate'];
  const RUE_KETTLE = [-4.62, 2.40, -7.70, PI + 0.35];    // by the stove (the kettle mark itself is the player's save spot)
  const WALKMAN_AT = [-5.55, 3.1, -1.08];
  // 10:30, the yard: gate shut, screen door shut, the Walkman playing inside
  function open24(c) {
    for (const f of S24_FLAGS) delete c.state.flags[f];
    S24.tok++; S24.phase = 'knock';
    const SB = SETS.rue_house;
    if (SB && SB.dress && c.world.setId === 'rue_house') SB.dress('knock24');
    c.state.flags.santa = true;
    const l = act(c, 'luka'); if (l) { l.habit = null; l.rig.show('santa', true); }
    const c4 = act(c, 'chase40'); if (c4) c4.habit = null;
  }
  // Rue's examine lines: he stops where he is, turns to Chase and says it (he doesn't walk to the thing: let him be)
  const RUE_STOP = { do: (c) => { const a = act(c, 'rue'); if (a) { a.place([a.pos.x, a.pos.y, a.pos.z, a.rotY]); a.play('idle'); } } };
  const V2 = new THREE.Vector3();
  // the shot for one of Rue's lines in the roam: the two of them face each other at a talking distance (under the cut,
  // Rue steps back if he's on top of Chase), and the lens is Chase's eyeline: just in front of his face, a little to one
  // side, on Rue head and shoulders. Nobody stands between (Chase is behind the lens; Luka trails Chase).
  // open floor in the front room Rue can stand on to talk (clear of the armchairs, the tables, the sideboard, the arch)
  const RUE_SPOTS = [[-4.0, -4.3], [-3.9, -3.35], [-4.4, -1.0], [-1.0, -2.3], [0.8, -1.6], [1.4, -3.3], [-5.2, -3.6], [-2.9, -1.9]];
  function rueShot(c) {
    if (sk(c)) return;
    const r = act(c, 'rue'), ch = act(c, 'chase'); if (!r || !ch) return;
    const dOf = (x, z) => Math.hypot(x - ch.pos.x, z - ch.pos.z);
    const d = dOf(r.pos.x, r.pos.z);
    if (d >= 3.4) { r.face('chase', 0.5); closeOn(c, 'rue', { dist: 1.15, yaw: 0.18, fov: 38, push: 0.1, dur: 7, ly: 0.05 }); return; }
    if (d < 1.5) {   // right beside him (the side table): under the cut Rue is a step away, on open floor, facing him
      let best = null, bs = 1e9;
      const l = act(c, 'luka');
      for (const [x, z] of RUE_SPOTS) {   // (all in the front room: nothing between them above table height)
        const dc = dOf(x, z); if (dc < 1.5 || dc > 3.2) continue;
        const sc = Math.abs(dc - 1.9) + 0.3 * Math.hypot(x - r.pos.x, z - r.pos.z) + (l && Math.hypot(x - l.pos.x, z - l.pos.z) < 0.8 ? 5 : 0);
        if (sc < bs) { bs = sc; best = [x, z]; }
      }
      if (best) r.place([best[0], r.pos.y, best[1], r.rotY]);
    }
    const a = Math.atan2(ch.pos.x - r.pos.x, ch.pos.z - r.pos.z);
    r.place([r.pos.x, r.pos.y, r.pos.z, a]); r.face(a, 0.05);
    ch.place([ch.pos.x, ch.pos.y, ch.pos.z, a + PI]); ch.face(a + PI, 0.05);
    // Luka (trailing Chase) out of Rue's single: if he's beside Rue or in the line, he steps in behind Chase's shoulder
    const lk = act(c, 'luka');
    if (lk) {
      const ex = r.pos.x - ch.pos.x, ez = r.pos.z - ch.pos.z, el = Math.hypot(ex, ez) || 1, t = ((lk.pos.x - ch.pos.x) * ex + (lk.pos.z - ch.pos.z) * ez) / el;
      const off = Math.abs((lk.pos.x - ch.pos.x) * ez - (lk.pos.z - ch.pos.z) * ex) / el;
      if (t > 0.2 && off < 1.0) {
        for (const sd of [1, -1]) {
          const x = ch.pos.x - ex / el * 0.9 + ez / el * 0.55 * sd, z = ch.pos.z - ez / el * 0.9 - ex / el * 0.55 * sd;
          if (c.world.lineClear(ch.pos.x, ch.pos.z, x, z, 0.15)) { lk.place([x, lk.pos.y, z, a + PI]); break; }
        }
      }
    }
    r.eyePos(V1); ch.eyePos(V2);
    const dx = V1.x - V2.x, dz = V1.z - V2.z, L = Math.hypot(dx, dz) || 1, ux = dx / L, uz = dz / L, sd = (S24.side = -S24.side) * 0.2;
    // the lens sits a third of the way from Chase to Rue (never closer than 1.05 m to Rue), a little to one side
    const k = Math.max(0, Math.min(0.32, L - 1.05)), px = V2.x + ux * k - uz * sd, pz = V2.z + uz * k + ux * sd, py = V2.y - 0.03;
    c.cam.shot({ shot: 'CAM', pos: [px, py, pz], look: [V1.x, V1.y - 0.05, V1.z], fov: L < 1.6 ? 36 : 32,
      to: { pos: [px + ux * 0.1, py, pz + uz * 0.1], look: [V1.x, V1.y - 0.05, V1.z], fov: L < 1.6 ? 36 : 32 }, dur: 7, ease: 'linear' });
  }
  const rueSays = (text, o = {}) => [
    RUE_STOP,
    { do: rueShot },
    { expr: [['rue', o.expr || 'happy']] },
    { wait: 0.4 },
    slow('rue', text),
  ];
  // his slow round while the tea brews: kettle -> the side table (the brick phone comes out of his pocket) -> the arch
  // -> kettle …; he waits whenever someone is talking (a hotspot is running) and walks on afterwards
  const ROUTE = [['s24_rue_side', 5.5, true], ['s24_rue_arch', 8], [RUE_KETTLE, 7], ['s24_rue_arch', 6], ['s24_rue_side', 6], [RUE_KETTLE, 8]];
  async function phoneDown(c) {
    const a = act(c, 'rue');
    if (a) a.play('give', { dur: 1.4 });
    await c.wait(0.65);
    if (a) a.rig.show('brick_pocket', false);
    const ph = P(c, 'brick_phone'); if (ph) ph.userData.show(true);
    c.state.flags.s24_phone_down = true;
    if (!sk(c)) c.sfx('clunk', { vol: 0.12, rate: 1.6, at: [-5.53, 3.0, -0.66] });
    await c.wait(0.8);
  }
  function potter(c) {
    const tok = S24.tok;
    const alive = () => flow.sceneId === '2.4' && S24.tok === tok && S24.phase === 'explore';
    (async () => {
      await c.wait(1.6);
      let i = 0;
      while (alive()) {
        await waitUntil(() => !alive() || (!flow.busy && !flow.cutscene));
        if (!alive()) return;
        const a = act(c, 'rue'); if (!a) return;
        const leg = ROUTE[i % ROUTE.length], to = leg[0], m = typeof to === 'string' ? c.world.mark(to) : to;
        if (!m) return;
        await a.moveTo(to, { speed: 0.72 });
        if (!alive()) return;
        if (Math.hypot(a.pos.x - m[0], a.pos.z - m[2]) > 0.25) { await c.wait(0.3); continue; }   // stopped short: someone spoke to him
        a.face(m[3] || 0, 0.6);
        if (leg[2] && !c.state.flags.s24_phone_down) await phoneDown(c);
        i++;
        const t0 = clock.t;
        await waitUntil(() => !alive() || clock.t - t0 > leg[1]);
      }
    })();
  }
  // into the front room (end of 2.4_door, and Continue): explore24, Rue by the kettle, the boys just inside the door
  function inside24(c) {
    const SB = SETS.rue_house;
    if (SB && SB.dress) SB.dress('explore24');
    const r = act(c, 'rue');
    if (r) { r.place('s24_rue_arch'); r.rig.show('brick_pocket', true); r.rig.show('brick', false); r.play('idle'); r.setExpr('neutral'); }
    const ch = act(c, 'chase'), l = act(c, 'luka');
    if (ch) ch.place([-1.25, 2.4, -2.15, -2.3]);
    if (l) l.place([-0.6, 2.4, -1.6, -2.4]);
    const sd = P(c, 'screen_door'); if (sd) sd.userData.open(0);
  }
  // the record offer after the trill (spec 2.4: "Record? (hold YES)"): hold YES for CONFIG.record s; NO or 6 s: not now
  async function recordOffer(c, id) {
    if (c.state.samples.includes(id) || c.state.active !== 'chase') return;
    if (TEST.auto) { c.flow.learnSample(id); testLog('sample ' + id); return; }
    if (sk(c)) return;
    await until(c, () => !input.held('yes'), 1.5);
    const sid = c.flow.sceneId, t0 = clock.t;
    c.ui.prompt('Record? (hold YES)');
    const ok = await new Promise((res) => {
      let held = 0, on = false;
      const f = (dt) => {
        if (flow.sceneId !== sid) { removeUpdate(f); res(false); return; }
        if (input.holding('yes')) {
          held += dt;
          if (held >= 0.2 && !on) { on = true; c.ui.prompt('YES — Recording…'); c.ui.sfx('dictaphone'); }
          if (held >= CONFIG.record) { removeUpdate(f); res(true); }
          return;
        }
        if (on) { on = false; held = 0; c.ui.prompt('Record? (hold YES)'); }
        if (input.pressed('no') || clock.t - t0 > 6) { removeUpdate(f); res(false); }
      };
      addUpdate(f);
    });
    c.ui.prompt(null);
    if (input.unlatch) input.unlatch('yes');
    if (!ok || c.flow.sceneId !== sid) return;
    c.ui.sfx((SAMPLES[id] && SAMPLES[id].sfx) || 'beep');
    testLog('sample ' + id);
    c.flow.learnSample(id);
  }
  const TRILL = { do: (c) => { const ph = P(c, 'brick_phone'); if (ph) ph.userData.test(); if (!sk(c)) c.sfx('smp_brick', { vol: 0.75, at: [-5.53, 3.05, -0.66] }); } };
  const examined = (s) => ['s24_ex_polaroid', 's24_ex_cork', 's24_ex_walkman', 's24_ex_card', 's24_ex_tin'].reduce((n, f) => n + (s.flags[f] ? 1 : 0), 0);

  SCENES['2.4'] = {
    title: 'Every Sunday', set: 'rue_house', env: 'morning24', time: '10:30', place: 'Scarborough',
    playable: ['chase'], swap: false, follow: 'luka', music: null,
    hud: { noService: false, quiet: '25:28:00', samples: false, bars: null },
    spawn: { chase: [-5.0, 0, 15.15, H], luka: [-5.9, 0, 14.75, H], chase40: [-4.1, 0, 14.85, H] },
    hotspots: [
      // ---- PLAY "Knock."
      // Chase (2040) at the gate. Interacting with him again: "I'll wait here."
      { id: 'h24_c40', at: 'chase40', r: 1.6, verb: 'Talk', by: 'chase40', when: (s) => !s.flags.s24_door, text: "I'll wait here." },
      // the little brass bell by the door (Chase rings it)
      { id: 'h24_bell', at: [0.95, 2.40, 0.40], r: 0.9, verb: 'Ring', only: 'chase', when: (s) => !s.flags.s24_bell, flag: 's24_bell',
        steps: [
          { move: 'chase', to: 'bell' },
          { face: 'chase', to: PI, dur: 0.2 },
          glideCam([-1.15, 3.95, 1.75], [0.85, 3.85, 0.4], 40, { pos: [-0.95, 3.95, 1.6], look: [0.85, 3.88, 0.4], fov: 38 }, 5),
          { act: [['chase', 'reach_up', { dur: 1.2, loop: false }]] },
          { wait: 0.55 },
          prop('brass_bell', (u) => u.ring()),
          { wait: 1.6 },
        ] },
      // ---- PLAY "Rue's front room." Rue's lines play when Chase examines things near him.
      // The 1987 Polaroid on the mantel (a copy)
      { id: 'h24_polaroid', at: [-6.40, 2.40, -2.30], r: 0.9, only: 'chase', when: (s) => S24.phase === 'explore', flag: 's24_ex_polaroid',
        steps: [
          RUE_STOP,
          { face: 'chase', to: [-6.70, 2.4, -2.30], dur: 0.3 },
          aPush('rue_house', 'polaroid_copy', 0.1, 5),
          { wait: 2.0 },
          ...rueSays("I had a copy made before I gave yous the real one. ^ Des took it."),
        ] },
      // A wall calendar, actually a corkboard of eight years of calendar pages
      { id: 'h24_cork', at: [-0.80, 2.40, -4.40], r: 1.0, only: 'chase', when: (s) => S24.phase === 'explore', flag: 's24_ex_cork',
        steps: [
          RUE_STOP,
          { place: 'chase', at: [0.72, 2.4, -3.8, -2.1] },
          { place: 'luka', at: [1.75, 2.4, -2.3, -2.2] },
          aPush('rue_house', 'corkboard', 0.5, 6),
          { wait: 2.6 },
          aPush('rue_house', 'corkboard_end', 0.06, 5, { card: ['s24_cork', {}] }),
          { wait: 3.2 },
          { expr: [['chase', 'sad']] },
          CLOSE('chase', { yaw: -0.35, dist: 1.0, fov: 36, push: 0.06, dur: 6 }),
          { wait: 0.6 },
          slow('chase', '…Every Sunday.'),
          { wait: 0.4 },
          { expr: [['chase', 'neutral']] },
        ] },
      // The Walkman: a cassette inside labelled PUDDING (COPY 4)
      { id: 'h24_walkman', at: [-5.20, 2.40, -1.12], r: 0.62, only: 'chase', when: (s) => S24.phase === 'explore', flag: 's24_ex_walkman',
        steps: [
          RUE_STOP,
          { face: 'chase', to: -H, dur: 0.3 },
          aPush('rue_house', 'walkman', 0.08, 5),
          { wait: 1.8 },
          ...rueSays("Fourth copy. I wore the others out. ^ Still the only song I listen to. It's got a kettle in it.", { expr: 'fond' }),
        ] },
      // The brick phone, once Rue has set it down on the side table: Rue's line, the TEST key, the old trill, Record?
      { id: 'h24_brick', at: [-5.20, 2.40, -0.52], r: 0.62, only: 'chase', verb: 'Examine', when: (s) => S24.phase === 'explore' && !!s.flags.s24_phone_down,
        steps: [
          RUE_STOP,
          { face: 'chase', to: -H, dur: 0.3 },
          aPush('rue_house', 'brick_phone_table', 0.06, 5),
          { wait: 1.4 },
          { if: (s) => !s.flags.s24_brick, then: rueSays('Go on. Ring it. ^ Still works.'), else: [] },
          aPush('rue_house', 'brick_phone_table', 0.05, 5),
          { act: [['chase', 'give', { dur: 1.2 }]] },
          { wait: 0.5 },
          TRILL,
          { wait: 1.9 },
          { do: (c) => { c.state.flags.s24_brick = true; return recordOffer(c, 'brick'); } },
        ] },
      // A framed Optus Christmas card, 2036, signed by "The Board"
      { id: 'h24_card', at: [2.30, 2.40, -2.90], r: 0.9, only: 'chase', when: (s) => S24.phase === 'explore', flag: 's24_ex_card',
        steps: [
          RUE_STOP,
          { face: 'chase', to: H, dur: 0.3 },
          aPush('rue_house', 'xmas_card_2036', 0.08, 5),
          { wait: 2.0 },
          ...rueSays("Year before they let me go. ^ 'Let me go.' Lovely way to put it.", { expr: 'tired' }),
        ] },
      // A biscuit tin (Arnott's-style, generic): see below (2.4_tea 6). A look, no line.
      { id: 'h24_tin', at: [-3.70, 2.40, -1.80], r: 0.8, only: 'chase', when: (s) => S24.phase === 'explore', flag: 's24_ex_tin',
        steps: [
          { face: 'chase', to: PI, dur: 0.3 },
          aPush('rue_house', 'bic_tin', 0.08, 4),
          { wait: 1.8 },
        ] },
      // Kettle (save): RUE: "Put the kettle on? ^ I've just put it on. You can put it on again." (his line in its own
      // shot, then the ask; the steam comes out of the kettle itself: `at` is its anchor, puff() finds the prop)
      { id: 'h24_kettle', at: 'kettle_rue', r: 1.05, verb: 'Use', when: (s) => S24.phase === 'explore',
        kettle: { steps: rueSays("Put the kettle on? ^ I've just put it on. You can put it on again."), boil: (c) => { const k = P(c, 'kettle_rue'); if (k) k.userData.boil(true); } } },
    ],
    steps: [
      ['cutscene', '2.4_knock'],
      ['control', 'chase'],
      ['follow', 'luka'],
      ['objective', 'Knock.'],
      ['roam', {
        until: 's24_bell',
        async auto(c) {
          const T = (id) => c.hotspots.trigger(id);
          await c.runSteps([{ move: 'chase', to: [-0.4, 0, 12.6] }]);
          await T('h24_c40');
          await c.runSteps([{ move: 'chase', to: 'stair_foot' }, { move: 'chase', to: 'stair_top' }, { move: 'chase', to: 'bell' }]);
          await T('h24_bell');
        },
      }],
      ['objective', null],
      ['cutscene', '2.4_door'],
      ['control', 'chase'],
      ['follow', 'luka'],
      ['do', (c) => { S24.phase = 'explore'; potter(c); }],
      ['roam', {
        until: (s) => !!s.flags.s24_brick && examined(s) >= 2,
        hint: { after: 70, steps: [{ do: (c) => { if (!c.state.flags.s24_brick && c.state.flags.s24_phone_down) c.ui.toast('Rue has put his brick phone down on the side table.'); } }] },
        async auto(c) {
          const T = (id) => c.hotspots.trigger(id);
          const to = (where) => c.runSteps([{ move: 'chase', to: where }]);
          await to([-2.6, 2.4, -6.9]);
          await to([-3.2, 2.4, -7.75]);
          await T('h24_kettle');
          await to([-2.6, 2.4, -5.6]);
          await to([-0.8, 2.4, -3.95]);
          await T('h24_cork');
          await to([-4.6, 2.4, -0.95]);
          await T('h24_walkman');
          await until(c, () => c.state.flags.s24_phone_down, 40);
          await T('h24_brick');
          if (!c.state.samples.includes('brick')) console.error('TWO 2.4: the brick phone trill was not recorded');
          await to([-5.9, 2.4, -2.3]);
          await T('h24_polaroid');
          await to([-3.7, 2.4, -1.6]);
          await T('h24_tin');
          await to([1.9, 2.4, -2.9]);
          await T('h24_card');
        },
      }],
      ['do', () => { S24.phase = 'tea'; }],
      ['cutscene', '2.4_tea'],
      ['cutscene', '2.4_gate'],
    ],
    grants: { flags: { santa: true, s24_door: true, s24_brick: true, s24_tea: true, s24_gate: true }, items: ['brick_phone'], samples: ['brick'], quiet: '25:28:00', noService: false },
  };

  // Opening (PLAY "Knock."): the house from across the road; the three come along the footpath; the gate. Chase (2040)
  // stops at the gate and won't come in.
  CUTSCENES['2.4_knock'] = [
    { do: (c) => nextTick().then(() => open24(c)) },
    { fade: 'out', dur: 0 },
    { loop: 'walkman', vol: 0.45, lp: 650, at: WALKMAN_AT },          // inside: the Walkman, very quietly, through its little speaker
    aPush('rue_house', 'house_wide', 1.2, 11),
    { fade: 'in', dur: 1.2 },
    { move: 'chase', to: [-0.2, 0, 14.55], nowait: true },
    { move: 'luka', to: [-1.15, 0, 14.95], nowait: true },
    { move: 'chase40', to: [0.85, 0, 14.75] },
    { face: 'chase', to: PI, dur: 0.4 }, { face: 'luka', to: PI, dur: 0.4 }, { face: 'chase40', to: PI, dur: 0.4 },
    prop('gate', (u) => u.open(1)),
    { sfx: 'clunk', vol: 0.25, rate: 2.2 },
    { wait: 0.7 },
    { move: 'chase', to: 's24_start_chase', nowait: true },
    { move: 'luka', to: 's24_start_luka', nowait: true },
    { move: 'chase40', to: [-0.15, 0, 14.05], speed: 1.2 },
    { place: 'chase', at: 's24_start_chase' }, { place: 'luka', at: 's24_start_luka' },
    // Chase (2040) stops at the gate and won't come in
    { face: 'chase', to: 'chase40', dur: 0.5 }, { face: 'luka', to: 'chase40', dur: 0.5 },
    { move: 'chase40', to: 's24_c40_gate', speed: 1.0 },
    { face: 'chase40', to: PI, dur: 0.4 },
    { expr: [['chase40', 'sad']] },
    CLOSE('chase40', { yaw: 0.35, dist: 1.25, fov: 36, push: 0.1, dur: 6, ly: 0.04 }),
    { wait: 0.4 },
    slow('chase40', "I'll wait here."),
    { wait: 0.5 },
    prop('gate', (u) => u.open(0)),
    { sfx: 'clunk', vol: 0.3, rate: 2.0 },
    { face: 'chase', to: PI, dur: 0.5 }, { face: 'luka', to: PI, dur: 0.5 },
  ];

  // Cutscene — "2.4_door."
  CUTSCENES['2.4_door'] = [
    { do: (c) => {
      S24.phase = 'door';
      const r = c.world.spawn('rue', 's24_rue_door');
      if (r) { r.habit = null; r.rig.show('brick_pocket', true); r.rig.show('brick', false); r.setExpr('neutral'); r.play('idle'); }
      const ch = act(c, 'chase'), l = act(c, 'luka');
      if (ch) ch.place('s24_chase_door');
      if (l) l.place('s24_luka_door');
      const c4 = act(c, 'chase40'); if (c4) c4.place('s24_c40_gate');
    } },
    // the tape stops inside; footsteps; the door
    { loop: 'walkman', stop: true, fade: 0.25 },
    { sfx: 'cassette_eject', vol: 0.18, rate: 1.3, at: WALKMAN_AT },
    // [MID · the door opens] RUE, 72, in a cardigan in the heat, reading glasses on his head, the brick phone in his
    // cardigan pocket.
    aPush('rue_house', 's24_door_mid', 0.35, 9),
    { wait: 0.9 },
    { sfx: 'creak', vol: 0.4, rate: 1.2 },
    prop('screen_door', (u) => u.open(1)),
    { wait: 1.1 },
    // He looks at Chase. At Luka. For a long time. (3 s.)
    glance('rue', 'chase', 1.5),
    { wait: 1.5 },
    glance('rue', 'luka', 1.6),
    { wait: 1.6 },
    slow('rue', '…Lads.'),
    // [CLOSE · Rue] His eyes go to Luka's Santa beard.
    CLOSE('rue', { yaw: 0.1, dist: 1.0, fov: 36, push: 0.08, dur: 6 }),
    glance('rue', 'luka', 2.6),
    { do: (c) => { const r = act(c, 'rue'); if (r && !sk(c)) r.rig.face.browLift(0.7); } },
    { wait: 1.3 },
    say('rue', "That's a terrible beard."),
    { do: (c) => { const r = act(c, 'rue'); if (r) r.rig.face.browLift(0); } },
    CLOSE('luka', { yaw: 0.15, dist: 1.0, fov: 36, push: 0.06, dur: 5 }),
    say('luka', "It's a disguise."),
    CLOSE('rue', { yaw: 0.1, dist: 1.0, fov: 36, push: 0.06, dur: 5 }),
    say('rue', "It's over your beard."),
    CLOSE('luka', { yaw: 0.15, dist: 1.0, fov: 36, push: 0.06, dur: 5 }),
    say('luka', "That's the disguise."),
    CLOSE('rue', { yaw: -0.05, dist: 1.05, fov: 36, push: 0.08, dur: 6 }),
    { expr: [['rue', 'fond']] },
    { wait: 0.8 },
    say('rue', 'Tea?'),
    CLOSE('chase', { yaw: -0.2, dist: 1.0, fov: 36, push: 0.06, dur: 5 }),
    { wait: 0.4 },
    say('chase', '…Yes, please.'),
    // in: Rue turns back into the house, the boys after him
    aPush('rue_house', 's24_door_mid', 0.25, 6),
    { expr: [['rue', 'neutral']] },
    { move: 'rue', to: [-0.6, 2.4, -1.9], speed: 0.8, nowait: true },
    { wait: 1.0 },
    { move: 'chase', to: [0.1, 2.4, -0.9], nowait: true },
    { wait: 0.6 },
    { move: 'luka', to: [-0.3, 2.4, 0.15], nowait: true },
    { wait: 1.4 },
    { fade: 'out', dur: 0.6 },
    { do: (c) => inside24(c) },
    { flag: 's24_door' },
    // the front room: Rue slow in the arch
    aPush('rue_house', 's24_explore_room', 0.4, 8),
    { fade: 'in', dur: 0.8 },
    { move: 'rue', to: RUE_KETTLE, speed: 0.72, nowait: true },
    { wait: 2.6 },
  ];

  // Cutscene — "2.4_tea." Front room, three in armchairs (Chase (2040) still out at the gate, visible through the louvres).
  // the master: Luka's profile at the left edge, Chase across the coffee table, Rue in his armchair; the louvres behind
  // (the set's s24_tea_wide sits right behind Luka's head: a red blob in the corner)
  const TEA_WIDE = glideCam([-4.2, 4.25, -4.7], [-3.05, 3.1, -0.7], 62, { pos: [-4.1, 4.2, -4.55], look: [-3.05, 3.1, -0.7], fov: 60 }, 14);
  const TEA_RUE = aPush('rue_house', 's24_tea_rue', 0.4, 12, { fov: 30, fovTo: 28 });
  const BOYS = aPush('rue_house', 's24_twoshot_boys', 0.12, 6, { fov: 50, fovTo: 48 });   // (wider: Chase whole)
  // Rue's look out through the louvres: from just inside the front wall, standing height, so Chase (2040) at his gate reads
  // over the verandah rail (the seated eyeline, s24_louvre_pov, sees him only through the dowels)
  const C40_TEA = [-0.35, 0, 13.95, PI];
  const LOUVRE = glideCam([-3.2, 4.35, -0.4], [-0.35, 1.5, 13.95], 14, { pos: [-3.15, 4.33, -0.2], look: [-0.35, 1.5, 13.95], fov: 12 }, 6);
  const PHONE_T = aPush('rue_house', 'brick_phone_table', 0.08, 8);
  const TIN = aPush('rue_house', 'bic_tin', 0.06, 5);
  const LINE16 = "This line's from 1987. It's older than everything he owns. He can't see it. He can't hear it. ^ Yous used to ring me on it. Every Sunday. Eight years. ^ Then it stopped.";
  CUTSCENES['2.4_tea'] = [
    { do: (c) => {
      S24.phase = 'tea';
      const SB = SETS.rue_house; if (SB && SB.dress) SB.dress('tea24', { keepEnv: true });
      const r = act(c, 'rue');
      if (r) { r.place('s24_seat_rue'); r.rig.show('brick_pocket', false); r.rig.show('brick', false); r.setExpr('neutral'); }
      const l = act(c, 'luka'), ch = act(c, 'chase');
      if (l) l.place('s24_seat_luka');
      if (ch) ch.place('s24_seat_chase');
      const c4 = act(c, 'chase40'); if (c4) { c4.place(C40_TEA); c4.play('idle'); }
      const st = P(c, 'storm_bank'); if (st) st.userData.set(0.45);
    } },
    seat('rue'), seat('luka'), seat('chase'),
    { expr: [['luka', 'neutral'], ['chase', 'neutral']] },
    TEA_WIDE,
    { wait: 1.6 },
    { act: [['rue', 'drink', { dur: 2.2, loop: false }]] },
    { wait: 2.4 },
    slow('rue', "You're from before. ^ How long before?"),
    CLOSE('chase', { yaw: 0.2, dist: 1.0, fov: 36, push: 0.06, dur: 5 }),
    say('chase', "Christmas '26."),
    TEA_RUE,
    { wait: 0.8 },
    slow('rue', "…The two days. ^ You went missing at Christmas. Luke rang me in a state. I told him not to worry. ^ I'd had practice."),
    CLOSE('luka', { yaw: 0.25, dist: 1.0, fov: 36, push: 0.06, dur: 6 }),
    glance('luka', 'chase', 1.0), { wait: 0.6 },
    say('luka', 'Did you know? ^ Where we went?'),
    CLOSE('rue', { yaw: 0.25, dist: 1.0, fov: 36, push: 0.14, dur: 16 }),
    { wait: 0.5 },
    slow('rue', 'No. Thirty-nine years I knew everything that was coming for you two. Then October 2026 came, and after that I knew nothing at all. ^ It\'s been lovely.'),
    // RUE: (reaching for the tin)
    TIN,
    { act: [['rue', 'give', { dur: 1.6 }]] },
    { wait: 0.5 },
    say('rue', 'Pass the bics. ^ Biscuits.'),
    prop('bic_tin', (u) => u.open(true)),
    { sfx: 'clunk', vol: 0.12, rate: 2.4, at: [-3.5, 2.9, -2.25] },
    // [TWO-SHOT · Luka and Chase] They look at each other.
    BOYS,
    glance('luka', 'chase', 2.0), glance('chase', 'luka', 2.0),
    { wait: 1.9 },
    CLOSE('rue', { yaw: 0.25, dist: 1.05, fov: 36, push: 0.06, dur: 5 }),
    { expr: [['rue', 'fond']] },
    say('rue', 'I got it from yous.'),
    CLOSE('luka', { yaw: 0.25, dist: 1.0, fov: 36, push: 0.06, dur: 6 }),
    { expr: [['luka', 'worried']] },
    say('luka', 'Was it hard? Knowing? All that time?'),
    CLOSE('rue', { yaw: 0.25, dist: 1.0, fov: 36, push: 0.14, dur: 12 }),
    { expr: [['rue', 'still']] },
    { wait: 0.8 },
    slow('rue', 'Knowing is the heaviest thing I ever carried. ^ I wouldn\'t have put it down for anything.'),
    // (Rue looks through the louvres at the man standing at his gate.)
    glance('rue', C40_TEA, 3.6),
    { wait: 1.0 },
    LOUVRE,
    { do: (c) => { const st = P(c, 'storm_bank'); if (st) st.userData.build(0.5); } },
    { wait: 1.8 },
    slow('rue', 'Is he coming in?'),
    CLOSE('chase', { yaw: 0.2, dist: 1.0, fov: 36, push: 0.06, dur: 5 }),
    say('chase', "He's not ready."),
    CLOSE('rue', { yaw: 0.25, dist: 1.05, fov: 36, push: 0.06, dur: 5 }),
    slow('rue', 'Nobody ever is.'),
    CLOSE('chase', { yaw: 0.2, dist: 1.0, fov: 36, push: 0.06, dur: 5 }),
    say('chase', 'We need your phone.'),
    // RUE: (nodding at the brick phone on the side table)
    CLOSE('rue', { yaw: 0.25, dist: 1.05, fov: 36, push: 0.04, dur: 4 }),
    { act: [['rue', 'nod']] },
    { wait: 0.8 },
    PHONE_T,
    // (back to him on "Yous used to ring me on it.")
    { par: [slow('rue', LINE16), onText(LINE16, 'Yous used', (cc) => closeOn(cc, 'rue', { yaw: 0.25, dist: 1.0, fov: 36, push: 0.12, dur: 12 }))] },
    // [CLOSE · Rue, to Luka]
    glance('rue', 'luka', 30),
    CLOSE('rue', { yaw: -0.3, dist: 1.0, fov: 36, push: 0.16, dur: 24, ly: 0.05 }),
    { expr: [['rue', 'still']] },
    { wait: 0.8 },
    slow('rue', "I promoted you, you know. 2031. Head of Network Safety. You made every part of this company safer than it had ever been. ^ You never once let anyone help you carry anything. I should have seen it. ^ That's the trouble with people who can, Luka. They think they have to."),
    // LUKA: (twisting his lanyard)
    { act: [['rue', 'idle']] },
    CLOSE('luka', { yaw: 0.25, dist: 1.5, fov: 40, push: 0.12, dur: 8, dy: -0.04, ly: -0.16 }),
    { expr: [['luka', 'sad']] },
    { act: [['luka', 'lanyard']] },
    { wait: 1.6 },
    slow('luka', '…Yeah.'),
    { wait: 1.4 },
    { fade: 'out', dur: 1.0 },
  ];
  // Cutscene — "2.4_gate."
  const YARD = aPush('rue_house', 's24_yard_wide', 0.6, 9);
  const GATE_TWO = aPush('rue_house', 's24_gate_two', 0.2, 8);
  const HANDS = aPush('rue_house', 's24_hands', 0.05, 5);
  // from behind Rue on the verandah, high under the roof: his back, his right hand on the rail, the three small on the
  // street going toward the water (the set's s24_verandah_wide sits at his head: a blur of white hair)
  const VERANDAH = glideCam([-2.3, 4.45, 0.75], [14.0, 1.6, 16.5], 46, { pos: [-2.15, 4.42, 0.9], look: [14.0, 1.6, 16.5], fov: 44 }, 14);
  const C40_AWAY = 0.75;   // Chase (2040) at the gate, turned down the street toward the water: he can't look at him
  // Rue on his stairs: the right hand sliding down the handrail (x -0.65, 0.92 m over the treads; he walks at x -0.35)
  const railWalk = (on) => ({ do: (c) => { const r = act(c, 'rue'); if (r) r.walkAnim = on ? 'walk_rail' : 'walk'; } });
  CUTSCENES['2.4_gate'] = [
    { do: (c) => {
      S24.phase = 'gate';
      const SB = SETS.rue_house; if (SB && SB.dress) SB.dress('gate24');   // building24: the storm bank has grown and darkened
      const st = P(c, 'storm_bank'); if (st) { st.userData.set(0.55); st.userData.build(0.85); }
      const car = P(c, 'hovercar_street'); if (car) car.userData.off();
      const r = act(c, 'rue');
      if (r) { r.rig.seated = false; r.place('s24_rue_stair_top'); r.play('idle'); r.rig.show('brick_pocket', false); r.rig.show('brick', true); r.setExpr('neutral'); }
      const l = act(c, 'luka'), ch = act(c, 'chase'), c4 = act(c, 'chase40');
      if (l) { l.rig.seated = false; l.place('s24_luka_yard'); l.play('idle'); l.setExpr('neutral'); }
      if (ch) { ch.rig.seated = false; ch.place('s24_chase_yard'); ch.play('idle'); ch.setExpr('neutral'); }
      if (c4) { c4.place([-0.6, 0, 13.95, C40_AWAY]); c4.play('idle'); c4.setExpr('still'); }
    } },
    // [WIDE · the front yard] Rue comes down the stairs, slowly, one hand on the rail. Chase (2040) stands at the gate.
    // He can't look at him.
    YARD,
    { fade: 'in', dur: 1.0 },
    railWalk(true),
    { move: 'rue', to: 's24_rue_stair_foot', speed: 0.62 },
    railWalk(false),
    { move: 'rue', to: [-0.25, 0, 9.4], speed: 0.7, nowait: true },
    CLOSE('chase40', { yaw: -0.25, dist: 1.2, fov: 36, push: 0.1, dur: 6 }),
    { wait: 2.8 },
    { place: 'rue', at: [-0.2, 0, 11.3, 0] },
    { move: 'rue', to: 's24_rue_gate', speed: 0.7, nowait: true },
    GATE_TWO,
    { wait: 1.9 },
    { place: 'rue', at: 's24_rue_gate' },
    { wait: 0.4 },
    slow('rue', 'Chase.'),
    { wait: 0.6 },
    CLOSE('chase40', { yaw: 0.95, dist: 1.1, fov: 36, push: 0.06, dur: 6 }),
    glance('chase40', 'rue', 2.4),
    { wait: 0.9 },
    slow('chase40', '…Rue.'),
    CLOSE('rue', { yaw: 0.2, dist: 1.05, fov: 36, push: 0.08, dur: 7 }),
    slow('rue', 'It rang every Sunday for eight years. Then it didn\'t.'),
    { face: 'chase40', to: 'rue', dur: 1.2 },
    CLOSE('chase40', { yaw: 0.0, dist: 1.05, fov: 36, push: 0.06, dur: 6 }),
    { expr: [['chase40', 'sad']] },
    { wait: 0.8 },
    slow('chase40', "I'm sorry."),
    CLOSE('rue', { yaw: 0.2, dist: 1.05, fov: 36, push: 0.16, dur: 22 }),
    { expr: [['rue', 'still']] },
    slow('rue', "I know. ^ I was the same, once. I'd leave before anyone could leave me. ^ Yous taught me to stay. ^ I'm not cross, son. I'm just old, and I missed you."),
    // [CLOSE · Chase (2040)] He breaks a little. Not much. Enough.
    CLOSE('chase40', { yaw: 0.0, dist: 0.95, fov: 34, push: 0.1, dur: 6 }),
    { expr: [['chase40', 'tearful']] },
    { wait: 2.6 },
    // Rue holds out the brick phone and puts it in Chase (2040)'s scarred hand. Closes the fingers over it.
    HANDS,
    { act: [['rue', 'give', { dur: 1.6 }], ['chase40', 'give', { dur: 1.6 }]] },
    { wait: 0.8 },
    wear('rue', 'brick', false), wear('chase40', 'brick', true),
    { item: 'brick_phone' },
    { wait: 1.2 },
    CLOSE('rue', { yaw: 0.2, dist: 1.05, fov: 36, push: 0.06, dur: 6 }),
    say('rue', 'Bring it back.'),
    CLOSE('chase40', { yaw: 0.0, dist: 1.0, fov: 36, push: 0.06, dur: 6 }),
    slow('chase40', "I'll bring it back."),
    CLOSE('rue', { yaw: 0.2, dist: 1.05, fov: 36, push: 0.12, dur: 18 }),
    { wait: 0.4 },
    slow('rue', '…Yous will.'),
    { wait: 0.6 },
    slow('rue', "There's no word for yes in Irish. Did you know that? A porter told me once. You answer with what you'll do. ^ Will you ring me on Sunday?"),
    // CHASE (2040): (a long beat)
    CLOSE('chase40', { yaw: 0.0, dist: 0.95, fov: 34, push: 0.08, dur: 8 }),
    { wait: 2.6 },
    slow('chase40', '…I will.'),
    { wait: 0.8 },
    // [WIDE · from the verandah] The three of them walk off down the street toward the water, the storm building over the
    // bay. Rue watches them go with one hand on the rail.
    prop('gate', (u) => u.open(1)),
    { sfx: 'clunk', vol: 0.25, rate: 2.2 },
    { do: (c) => {
      const r = act(c, 'rue'); if (r) { r.walkAnim = 'walk'; r.place('s24_rue_watch'); r.play('hand_rail', { h: 1.0, x: 0.3 }); r.setExpr('still'); }
      const l = act(c, 'luka'), ch = act(c, 'chase'), c4 = act(c, 'chase40');
      if (l) l.place([12.0, 0, 14.7, H]); if (ch) ch.place([11.2, 0, 15.3, H]); if (c4) { c4.place([13.0, 0, 15.0, H]); c4.setExpr('neutral'); }
    } },
    VERANDAH,
    { move: 'luka', to: [60, 0, 14.7], speed: 1.25, nowait: true },
    { move: 'chase', to: [59.2, 0, 15.3], speed: 1.25, nowait: true },
    { move: 'chase40', to: [61, 0, 15.0], speed: 1.25, nowait: true },
    { wait: 3.6 },
    // RUE: (to himself)
    CLOSE('rue', { yaw: 0.8, dist: 1.1, fov: 36, push: 0.08, dur: 8, ly: 0.04 }),
    { expr: [['rue', 'fond']] },
    { wait: 0.6 },
    slow('rue', 'Go on. ^ Yes.', { tag: 'to himself' }),
    { wait: 1.6 },
    { fade: 'out', dur: 1.4 },
    { do: (c) => c.world.prebuild('bridge') },   // under black: 2.5's set
  ];

  // ============================================================ 2.5 — "Are You Sure You're Sure?"
  const S25 = { tok: 0, chipNow: false, upd: null, listening: false };
  const S25_FLAGS = ['s25_chip', 's25_name', 's25_reason', 's25_scan', 's25_gate', 's25_dock', 's25_laugh', 's25_chase', 's25_said_no'];
  const CHASERS = ['d25_c1', 'd25_c2', 'd25_c3', 'd25_c4', 'd25_c5', 'd25_c6'];
  const DOCK = [[12.2, 4.1], [11.25, 2.45], [13.15, 2.45], [-9.2, 4.1], [-10.15, 2.45], [-8.25, 2.45]];   // dock_e1..3, dock_w1..3
  // a drone's hover height eased over dur (the systems tick writes y = floor + hover)
  function hoverTo(c, id, h, dur) {
    const d = DRONES.get(id); if (!d) return;
    const h0 = d.hover;
    tween(c, dur, (k) => { const q = DRONES.get(id); if (q) q.hover = h0 + (h - h0) * k; });
  }
  function duties25() {
    const F = state.flags;
    if (!F.s25_reason) {
      objective.list([
        { text: 'Chip off.', done: !!F.chip_off },
        { text: 'Talk to Teddy (Luka).', done: !!F.s25_name },
        { text: 'Find a reason (Chase).', done: !!F.s25_reason },
      ]);
    } else {
      objective.list([
        { text: 'Chip off.', done: true },
        { text: 'Talk to Teddy (Luka).', done: true },
        { text: 'Find a reason (Chase).', done: true },
        { text: 'Boom gate (optional)', done: state.samples.includes('boom') },
      ]);
    }
  }
  // 13:00, the checkpoint: three gates down, the queue, Teddy at his desk; Chase (2040)'s chip on (he has to switch it off)
  function open25(c) {
    for (const f of S25_FLAGS) delete c.state.flags[f];
    delete c.state.flags.chip_off;
    S25.tok++; S25.chipNow = false;
    const SB = SETS.bridge;
    if (SB && SB.dress && c.world.setId === 'bridge') SB.dress('checkpoint25');
    if (SB && SB.unmount) SB.unmount();
    DRONES.clear(); AR.clear();
    for (const a of (SB && SB.ar) || []) AR.add(a.id === 'ar_lockdown' ? Object.assign({}, a, { size: 2.6 }) : a.id === 'ar_lockdown2' ? Object.assign({}, a, { size: 2.1 }) : a);   // the gantry's red AR, readable from the walk
    DRONES.spawn('d25_sweep', { path: [[-3.0, -20.0], [13.5, -20.0]], speed: 1.3, hover: 2.2, cone: { len: 3.8, half: 0.5 } });
    DRONES.spawn('d25_queue', { path: [[0, -24], [0, -6]], speed: 0.8, hover: 3.0, cone: { len: 4.0, half: 0.45 } });
    DRONES.spawn('d25_gate', { at: [3.6, 0, 1.8], face: PI, hover: 2.6, cone: { len: 3.0, half: 0.45 } });
    chip.hot = [{ box: [6.0, -46.5, 13.3, 8.2], mul: 1.6 }];   // "faster at checkpoints"
    const t = act(c, 'teddy'); if (t) { t.place('teddy_seat'); t.play('sit', { h: 0.5 }); t.rig.seated = true; t.setExpr('tired'); t.habit = null; }
    const c4 = act(c, 'chase40'); if (c4) { c4.rig.chip('on'); c4.habit = null; c4.rig.show('brick', false); }
    const l = act(c, 'luka'); if (l) { l.habit = null; l.rig.show('santa', true); const b = l.rig.attach.santa_beard; if (b) b.userData.state('on'); }
    c.state.flags.santa = true;
    watch25(); listen25();
  }
  // one updater for the scene: the chip-off prompt when Chase (2040) reaches the trigger, the dock trigger
  function inBox(a, x0, z0, x1, z1) { return !!a && a.pos.x > x0 && a.pos.x < x1 && a.pos.z > z0 && a.pos.z < z1; }
  // all three at the scooters: the one you play inside the dock, the other two at least through the gate
  const docked = () => inBox(world.actor(state.active), 6.2, 1.2, 10.8, 8.4) && inBox(world.actor('luka'), 5.6, 0.0, 11.6, 9.0) && inBox(world.actor('chase'), 5.6, 0.0, 11.6, 9.0) && inBox(world.actor('chase40'), 5.6, 0.0, 11.6, 9.0);
  function watch25() {
    if (S25.upd) return;
    const f = () => {
      if (flow.sceneId !== '2.5') { removeUpdate(f); S25.upd = null; return; }
      if (flow.skipping || !flow.roaming || flow.busy) return;
      const F = state.flags;
      if (!F.chip_off && !S25.chipNow && inBox(world.actor('chase40'), 6.0, -33.5, 13.3, -28.5)) { S25.chipNow = true; hotspots.trigger('h25_chip'); return; }
      if (F.s25_gate && !F.s25_dock && docked()) F.s25_dock = true;
    };
    S25.upd = f; addUpdate(f);
  }
  function listen25() {
    if (S25.listening) return;
    S25.listening = true;
    // Teddy's weary thumb on NO each time the booth speaker asks a car (the set presses the button 1.2 s later)
    on('bridge:ask', () => {
      if (flow.sceneId !== '2.5' || flow.skipping) return;
      wait(1.0).then(() => { const t = world.actor('teddy'); if (flow.sceneId === '2.5' && t && !flow.cutscene) t.play('tap', { dur: 0.6, loop: false }); });
    });
    on('sample:add', (k) => {
      if (flow.sceneId !== '2.5') return;
      if (k === 'boom') { const g = world.prop('gate_L'); if (g && !flow.skipping) g.userData.cycle(); }   // Teddy obligingly lowers and lifts it again
      if (flow.roaming) duties25();
    });
  }
  function stealth25() {
    stealth.begin({
      escortAfter: 1.5, forgetAfter: 1.8,
      checkpoints: [
        { id: 'start', box: [6.0, -46.5, 13.3, -24.5], at: { chase40: 's25_start_c40', luka: 's25_start_luka', chase: 's25_start_chase' } },
        { id: 'cross', box: [6.0, -24.5, 13.3, -12.0], at: { chase40: [9.0, 0, -23.6, 0], luka: [8.0, 0, -24.2, 0], chase: [10.0, 0, -24.3, 0] } },
        { id: 'plaza', box: [6.0, -12.0, 13.3, 8.2], at: { chase40: 's25_wait_c40', luka: [8.2, 0, -7.0, 0], chase: [9.6, 0, -7.4, 0] } },
      ],
    });
  }

  SCENES['2.5'] = {
    title: "Are You Sure You're Sure?", set: 'bridge', env: 'noon25', time: '13:00', place: 'Ted Smout Bridge, Clontarf',
    playable: ['chase40', 'luka', 'chase'], swap: false, follow: true, music: 'checkpoint',
    hud: { noService: false, quiet: '22:58:00', samples: true, bars: null },
    spawn: { luka: 's25_start_luka', chase: 's25_start_chase', chase40: 's25_start_c40', teddy: 'teddy_seat' },
    hotspots: [
      // 1. Chip off (the trigger at s25_chip runs it; NO = the soft-fail escort)
      { id: 'h25_chip', at: [9.0, 0, -31.0], r: 0.01, when: () => false, steps: 'chip25', do: (c) => chipChoice(c) },
      // 2. Talk to Teddy (Luka): Role Play at the hatch
      { id: 'h25_teddy', at: [8.0, 0, -3.4], r: 0.9, only: 'luka', verb: 'Talk', when: (s) => !!s.flags.chip_off && !s.flags.s25_name,
        do: async (c) => {
          await c.runSteps([{ move: 'luka', to: 's25_hatch' }, { face: 'luka', to: 'teddy', dur: 0.3 }]);
          await c.flow.minigame('roleplay', { flag: 's25_name' });
          await c.cam.release(0.6);
          duties25();
          if (!sk(c) && !TEST.auto && c.state.active === 'luka') c.ui.toast('The reason cards are on the side of the booth: SWAP to Chase.');
        } },
      // 3. Find a reason (Chase): the JARVIS-era reason-card panel on the booth's side, and the blank card on Teddy's desk
      { id: 'h25_panel', at: [9.45, 0, -1.80], r: 0.85, only: 'chase', verb: 'Use', when: (s) => !!s.flags.s25_name && !s.flags.s25_reason,
        do: async (c) => {
          await c.runSteps([{ move: 'chase', to: 's25_panel_chase' }, { face: 'chase', to: -H, dur: 0.3 }]);
          await c.flow.minigame('reason_cards', { flag: 's25_reason' });
          await c.cam.release(0.6);
          duties25();
        } },
      // Teddy's kettle (save)
      { id: 'h25_kettle', at: [7.30, 0, -3.40], r: 0.6, verb: 'Use', kettle: true },
      // the Boom gate (sample): Chase records the clunk-and-whine as Teddy lowers it and lifts it again
      { id: 'h25_boom', at: [6.55, 0, 0.4], r: 1.2, only: 'chase', sample: 'boom', when: (s) => !!s.flags.s25_gate && !s.samples.includes('boom'),
        do: (c) => { const g = P(c, 'gate_L'); if (g) g.userData.cycle(); return c.wait(1.2); } },
    ],
    steps: [
      ['cutscene', '2.5_checkpoint'],
      ['control', 'chase40'],
      ['follow', true],
      ['swap', true],
      ['objective', 'Cross the bridge.'],
      ['do', () => { duties25(); stealth25(); }],
      ['roam', {
        until: 's25_reason',
        hint: { after: 120, steps: [{ do: (c) => {
          const F = c.state.flags;
          if (!F.chip_off) c.ui.toast('Walk Chase (2040) up to the checkpoint.');
          else if (!F.s25_name) c.ui.toast('Luka can talk to Teddy at the hatch: SWAP to Luka.');
          else c.ui.toast('The reason cards are on the side of the booth: SWAP to Chase.');
        } }] },
        async auto(c) {
          const T = (id) => c.hotspots.trigger(id);
          const to = (id, where) => c.runSteps([{ move: id, to: where }]);
          const F = c.state.flags;
          swapTo(c, 'chase40');
          await to('chase40', [9.4, 0, -36.0]);
          await to('chase40', 's25_chip');
          await until(c, () => F.chip_off || S25.chipNow, 3);
          if (!F.chip_off && !S25.chipNow) { S25.chipNow = true; await T('h25_chip'); }
          await until(c, () => F.chip_off, 30);
          if (!F.chip_off) console.error('TWO 2.5: the chip is still on');
          // past the sweeper when its cone points back over the road
          await until(c, () => { const d = DRONES.get('d25_sweep'); return !d || d.x < 2; }, 25);
          await to('chase40', [11.6, 0, -13.0]);
          await to('chase40', 's25_wait_c40');
          swapTo(c, 'luka');
          await to('luka', [8.0, 0, -6.0]);
          await T('h25_kettle');
          await T('h25_teddy');
          if (!F.s25_name) console.error('TWO 2.5: Teddy never said his name');
          swapTo(c, 'chase');
          await to('chase', [10.6, 0, -4.2]);
          await T('h25_panel');
          if (!F.s25_reason) console.error('TWO 2.5: no reason accepted');
        },
      }],
      ['objective', null],
      ['cutscene', '2.5_scan'],
      ['control', 'chase'],
      ['follow', true],
      ['objective', 'Cross the bridge.'],
      ['do', () => duties25()],
      ['roam', {
        until: 's25_dock',
        hint: { after: 60, steps: [{ do: (c) => { c.ui.toast('The scooters are behind the booth, through the gate.'); } }] },
        async auto(c) {
          const T = (id) => c.hotspots.trigger(id);
          const to = (id, where) => c.runSteps([{ move: id, to: where }]);
          swapTo(c, 'chase');
          await to('chase', [6.55, 0, -2.4]);
          await to('chase', 's25_boom_rec');
          await T('h25_boom');
          if (!c.state.samples.includes('boom')) console.error('TWO 2.5: the Boom gate was not recorded');
          await to('chase', [7.6, 0, 2.6]);
          await to('chase', [8.2, 0, 4.6]);
          // Luka and Chase (2040) trail him in (autoplay's player.trail); the roam's watcher only runs in play, so the
          // dock check is made here
          await until(c, docked, 10);
          if (docked()) c.state.flags.s25_dock = true;
          else { const at = (id) => { const a = act(c, id); return a ? id + ' ' + a.pos.x.toFixed(2) + ',' + a.pos.z.toFixed(2) : id + ' -'; }; console.error('TWO 2.5: the party did not reach the scooter dock: ' + ['chase', 'luka', 'chase40'].map(at).join(' | ')); c.state.flags.s25_dock = true; }
        },
      }],
      ['objective', null],
      ['cutscene', '2.5_alarm'],
      ['do', (c) => { const sid = c.flow.sceneId; wait(0.2).then(() => { if (flow.sceneId === sid) c.ui.fade(0, sk(c) ? 0 : 0.6); }); }],
      ['minigame', 'scooter', { onHalfway: '2.5_laugh', endLine: false }],
      ['cutscene', '2.5_edge'],
      ['cutscene', '2.5_manager'],
    ],
    grants: { flags: { santa: true, chip_off: true, s25_chip: true, s25_name: true, s25_reason: true, s25_scan: true, s25_gate: true, s25_dock: true, s25_laugh: true, s25_chase: true },
      names: ['Teddy'], samples: ['boom', 'whir', 'laugh'], quiet: '22:58:00', noService: false },
  };

  // Cutscene — "2.5_checkpoint."
  CUTSCENES['2.5_checkpoint'] = [
    { do: (c) => nextTick().then(() => open25(c)) },
    { fade: 'out', dur: 0 },
    // [WIDE · low, the checkpoint] PENINSULA LOCKDOWN in red AR (Chip View only; to the boys the signs are blank). Three
    // boom gates. Two drone towers. Courtesy Drones hover over a queue of stopped hover-cars. In a tiny booth with a
    // desk fan and a transistor radio sits TEDDY, 84, pressing a big physical button marked NO every few seconds.
    aPush('bridge', 's25_wide_low', 1.2, 12),
    { fade: 'in', dur: 1.2 },
    { wait: 2.8 },
    // (the gantry, blank to the boys; through Chase (2040)'s chip: PENINSULA LOCKDOWN in red)
    glideCam([3.6, 1.45, -41.8], [0.0, 5.9, -30.1], 46, { pos: [3.4, 1.5, -41.0], look: [0.0, 6.0, -30.1], fov: 44 }, 6),
    { wait: 1.2 },
    { do: (c) => { if (!sk(c)) { AR.show(true); chip.show(true); c.sfx('chip_on', { vol: 0.3 }); } } },
    { wait: 2.4 },
    { do: (c) => { chip.show(false); AR.show(null); } },
    { wait: 0.5 },
    // SAFESENSE: (from the booth speaker, to each car)
    aPush('bridge', 's25_speaker', 0.4, 8),
    prop('booth_speaker', (u) => u.pulse()),
    { sfx: 'ss_chirp', vol: 0.5, at: [8.0, 2.95, -2.95] },
    say('safesense', "Crossing requires human confirmation. Are you sure? ^ Are you sure you're sure?", { tag: 'booth speaker' }),
    // TEDDY: (pressing NO)
    aPush('bridge', 's25_teddy_hatch', 0.25, 7),
    { act: [['teddy', 'tap', { dur: 0.7, loop: false }]] },
    { wait: 0.35 },
    prop('no_button', (u) => u.press()),
    aPush('bridge', 's25_no_button', 0.06, 3),
    { wait: 0.9 },
    aPush('bridge', 's25_teddy_hatch', 0.2, 7),
    { expr: [['teddy', 'tired']] },
    slow('teddy', 'No. ^ Sorry.'),
    // CHASE (2040) explains: turned to the two of them, over Chase's shoulder, the checkpoint behind (the set's s25_explain
    // sees his back)
    { face: 'luka', to: 'chase40', dur: 0.5 }, { face: 'chase', to: 'chase40', dur: 0.5 }, { face: 'chase40', to: [8.2, 0, -42.9], dur: 0.5 },
    glideCam([8.75, 1.62, -44.6], [9.9, 1.45, -40.5], 40, { pos: [8.82, 1.62, -44.3], look: [9.9, 1.45, -40.5], fov: 38 }, 12),
    { wait: 0.5 },
    slow('chase40', "There's a bug. The system needs a human to say yes before anyone crosses. So they kept one human. ^ That's Teddy. ^ In a lockdown, Teddy has to say no to everyone."),
    { face: 'luka', to: 0, dur: 0.5 }, { face: 'chase', to: 0, dur: 0.5 }, { face: 'chase40', to: 0, dur: 0.5 },
  ];

  // PLAY 1. Chip off: on approach a tower pings for chip signals; a prompt over Chase (2040). NO: the soft-fail escort.
  CUTSCENES.chip25 = [
    { letterbox: true },
    { place: 'chase40', at: 's25_chip' },
    { face: 'chase40', to: 0, dur: 0.15, wait: true },   // (whatever turn the walk left him in: facing the checkpoint)
    { do: (c) => { const a = act(c, 'chase40'); if (a) a.rig.chip('ping'); } },
    glideCam([5.6, 2.2, -25.0], [9.0, 1.4, -31.0], 42, { pos: [6.0, 2.0, -26.0], look: [9.0, 1.45, -31.0], fov: 40 }, 5),
    { sfx: 'drone_scan', vol: 0.45 },
    { wait: 1.0 },
    CLOSE('chase40', { yaw: 0.55, dist: 1.1, fov: 38, push: 0.06, dur: 6 }),
    { wait: 0.3 },
    { popup: { style: 'safesense', title: 'SafeSense', msg: 'Switch chip off?', buttons: ['YES', 'NO'], icon: 'none', at: { actor: 'chase40' }, w: 240, ding: false,
      get dodge() { return FAIL25 && !state.flags.s25_said_no ? [0] : undefined; } }, wait: true },
    { do: (c) => { const a = act(c, 'chase40'); if (a) a.rig.chip('on'); } },
    { letterbox: false },
  ];
  const FAIL25 = TEST.auto && /[?&]s25fail=1/.test(location.search);
  async function chipChoice(c) {
    if (c.flow.result !== 0) {   // NO: the towers hear him: the immediate soft-fail escort
      c.state.flags.s25_said_no = true;
      const a = act(c, 'chase40'); if (a) a.rig.chip('amber');
      S25.chipNow = false;      // after the Safe Room: the prompt again
      await stealth.softFail('chase40');
      const b = act(c, 'chase40'); if (b) b.rig.chip('on');
      return;
    }
    // YES: his light goes dark. He's blind to AR for the rest of the scene.
    await c.playCutscene([
      { do: (cc) => { chip.forceOff(true, 'Chip off.'); cc.state.flags.chip_off = true; cc.state.flags.s25_chip = true; const a = act(cc, 'chase40'); if (a) a.rig.chip('off'); } },
      { act: [['chase40', 'chip_ping']] },
      { sfx: 'chip_on', vol: 0.45, rate: 0.6 },
      { wait: 1.1 },
    ], { letterbox: false });
    duties25();
  }

  // PLAY 4 + 5. The scan (Hint 4), then Teddy says yes. "As the gate system starts, a drone glides down and scans each of
  // them in turn."
  const SCAN_WIDE = aPush('bridge', 's25_scan_wide', 0.8, 14);
  const scanPop = (msg, where) => ({ do: (c) => { if (!sk(c)) popup({ style: 'safesense', title: 'SafeSense', msg, icon: 'none', buttons: [], at: where, w: 230, dur: 1.9, ding: false }); } });
  // [CLOSE · the drone, its light flickering blue to white]: from below, past Luka's shoulder
  const DRONE_CLOSE = glideCam([7.35, 1.55, -5.55], [8.0, 2.85, -4.1], 36, { pos: [7.45, 1.6, -5.35], look: [8.0, 2.88, -4.1], fov: 33 }, 5);
  function flicker(c, dur) {   // blue <-> white, faster as it goes
    if (sk(c)) { DRONES.light('d25_scan', 'white'); return; }
    let t = 0, last = '';
    const sid = c.flow.sceneId;
    const f = (dt) => {
      t += dt;
      if (flow.sceneId !== sid || flow.skipping || t >= dur) { removeUpdate(f); DRONES.light('d25_scan', 'white'); return; }
      const st = Math.sin(t * (6 + t * 10)) > 0 ? 'white' : 'patrol';
      if (st !== last) { last = st; DRONES.light('d25_scan', st); }
    };
    addUpdate(f);
  }
  // (The drone wobbles, turns in a slow circle and floats off, confused.)
  function confused(c) {
    const sid = c.flow.sceneId;
    const pts = [[8.9, -4.2], [8.6, -3.7], [7.7, -3.7], [7.1, -4.4], [7.6, -5.4], [8.7, -5.3], [9.0, -4.6]];
    if (sk(c)) { DRONES.remove('d25_scan'); return; }
    hoverTo(c, 'd25_scan', 2.9, 2.5);
    (async () => {
      for (const p of pts) { if (flow.sceneId !== sid || !DRONES.get('d25_scan')) return; await DRONES.goTo('d25_scan', [p[0], 0, p[1]], { speed: 0.9 }); }
      for (const p of [[12.0, -9.0], [18.0, -14.0]]) { if (flow.sceneId !== sid || !DRONES.get('d25_scan')) return; await DRONES.goTo('d25_scan', [p[0], 0, p[1]], { speed: 1.4 }); }
      if (flow.sceneId === sid) DRONES.remove('d25_scan');
    })();
  }
  CUTSCENES['2.5_scan'] = [
    { do: (c) => {
      stealth.end();
      const l = act(c, 'luka'), ch = act(c, 'chase'), c4 = act(c, 'chase40');
      if (l) l.place('s25_scan_luka'); if (ch) ch.place('s25_scan_chase'); if (c4) c4.place('s25_scan_c40');
      const sc = P(c, 'booth_screen'); if (sc) sc.userData.show('accept');
      const tw = P(c, 'tower_drones'); if (tw) tw.userData.hide(3);
      if (SETS.bridge && SETS.bridge.askLoop) SETS.bridge.askLoop(false);
      DRONES.spawn('d25_scan', { at: [12.2, 0, 4.1], face: PI, hover: 7.75, cone: { len: 1.5, half: 0.6 }, ai: false, showPath: false });
      DRONES.light('d25_scan', 'patrol');
    } },
    SCAN_WIDE,
    { sfx: 'drone_scan', vol: 0.4, at: [12.2, 7.75, 4.1] },
    { do: (c) => hoverTo(c, 'd25_scan', 2.5, 3.2) },
    { do: (c) => DRONES.goTo('d25_scan', [9.7, 0, -3.7], { speed: 3.4 }) },
    // blue cone over Chase (CLEARED: VISITOR)
    { do: (c) => { DRONES.face('d25_scan', [9.7, 0, -6.0]); } },
    { sfx: 'drone_scan', vol: 0.55, at: [9.7, 2.5, -3.7] },
    { wait: 0.7 },
    scanPop('CLEARED: VISITOR', { actor: 'chase' }),
    { wait: 1.5 },
    // over Chase (2040) (CHIP OFF — CLEARED: SAD)
    { do: (c) => DRONES.goTo('d25_scan', [10.9, 0, -4.0], { speed: 1.6 }) },
    { do: (c) => { DRONES.face('d25_scan', [10.9, 0, -6.2]); } },
    { sfx: 'drone_scan', vol: 0.55, at: [10.9, 2.5, -4.0] },
    { wait: 0.7 },
    scanPop('CHIP OFF — CLEARED: SAD', { actor: 'chase40' }),
    { wait: 1.6 },
    // over Luka—
    { do: (c) => DRONES.goTo('d25_scan', [8.0, 0, -4.1], { speed: 1.6 }) },
    { do: (c) => { DRONES.face('d25_scan', [8.0, 0, -6.4]); const d = DRONES.get('d25_scan'); if (d) d.hover = 2.6; } },
    { sfx: 'drone_scan', vol: 0.55, at: [8.0, 2.6, -4.1] },
    { wait: 0.6 },
    // [CLOSE · the drone, its light flickering blue to white] A small pop-up floats over it: ERROR 4044 — IDENTITY CONFLICT.
    DRONE_CLOSE,
    { do: (c) => flicker(c, 1.8) },
    { sfx: 'drone_q', vol: 0.5, at: [8.0, 2.6, -4.1] },
    { wait: 1.2 },
    { do: (c) => { if (!sk(c)) popup({ style: 'safesense', title: 'SafeSense', msg: 'ERROR 4044 — IDENTITY CONFLICT', icon: 'error', buttons: [], at: { pos: [8.0, 3.0, -4.1] }, w: 300, dur: 4.2, ding: false }); } },
    { sfx: 'sad_beep', vol: 0.35, at: [8.0, 2.6, -4.1] },
    { wait: 1.4 },
    { expr: [['luka', 'stunned']] },
    CLOSE('luka', { yaw: -0.3, dist: 1.0, fov: 36, push: 0.06, dur: 7, ly: 0.12 }),
    slow('luka', "Error 4044. ^ That's the one where it forgets who you are, then forgets who it is."),
    // (The drone wobbles, turns in a slow circle and floats off, confused.)
    { do: (c) => confused(c) },
    glideCam([6.3, 1.5, -8.8], [8.2, 2.5, -4.4], 40, { pos: [6.2, 1.5, -9.2], look: [9.4, 2.6, -5.0], fov: 42 }, 7),
    { wait: 3.4 },
    { face: 'chase40', to: [14.0, 0, -11.0], dur: 1.0 },
    CLOSE('chase40', { yaw: 0.2, dist: 1.05, fov: 36, push: 0.06, dur: 6 }),
    { expr: [['chase40', 'worried'], ['luka', 'neutral']] },
    { wait: 0.6 },
    slow('chase40', '…They never do that.'),
    CLOSE('chase', { yaw: -0.2, dist: 1.0, fov: 36, push: 0.06, dur: 6 }),
    say('chase', 'Nobody can fix JARVIS.'),
    { do: (c) => { if (DRONES.get('d25_scan') && sk(c)) DRONES.remove('d25_scan'); } },
    { flag: 's25_scan' },
    // 5. Teddy says yes. Teddy's thumb hovers.
    { place: 'luka', at: 's25_hatch' },
    { face: 'chase', to: 'teddy', dur: 0.4 }, { face: 'chase40', to: 'teddy', dur: 0.4 },
    aPush('bridge', 's25_no_button', 0.05, 5),
    { act: [['teddy', 'point', { dur: 2.4, loop: false }]] },
    { wait: 0.9 },
    prop('booth_speaker', (u) => u.pulse()),
    { sfx: 'ss_chirp', vol: 0.45, at: [8.0, 2.95, -2.95] },
    say('safesense', 'Are you sure?', { tag: 'booth speaker' }),
    aPush('bridge', 's25_teddy_hatch', 0.15, 7),
    slow('teddy', 'Yes.'),
    prop('booth_speaker', (u) => u.pulse()),
    { sfx: 'ss_chirp', vol: 0.45, at: [8.0, 2.95, -2.95] },
    say('safesense', "Are you sure you're sure?", { tag: 'booth speaker' }),
    // TEDDY: (to Luka)
    { face: 'teddy', to: 'luka', dur: 0.6 },
    { expr: [['teddy', 'worried']] },
    aPush('bridge', 's25_teddy_hatch', 0.2, 6),
    { wait: 0.6 },
    slow('teddy', '…Am I?'),
    aPush('bridge', 's25_roleplay_rev', 0.15, 5),
    { expr: [['luka', 'fond']] },
    { wait: 0.4 },
    say('luka', 'Yeah.'),
    { place: 'luka', at: [7.35, 0, -4.15, 0.35] },
    aPush('bridge', 's25_teddy_hatch', 0.15, 7),
    { expr: [['teddy', 'neutral']] },
    { wait: 0.5 },
    slow('teddy', 'Yes.'),
    // (The boom gate lifts.)
    prop('booth_screen', (u) => u.show('confirmed')),
    { sfx: 'accepted', vol: 0.4, at: [7.12, 1.4, -2.2] },
    aPush('bridge', 's25_gate_lift', 0.4, 7),
    { wait: 0.3 },
    prop('gate_L', (u) => u.lift(true)),
    { flag: 's25_gate' },
    { wait: 2.6 },
    aPush('bridge', 's25_teddy_hatch', 0.15, 7),
    { expr: [['teddy', 'happy']] },
    slow('teddy', 'Merry Christmas, lads.'),
    CLOSE('chase', { yaw: 0.0, dist: 1.0, fov: 36, push: 0.06, dur: 5 }),
    { expr: [['chase', 'happy']] },
    say('chase', 'Merry Christmas, Teddy.'),
    // TEDDY: (very quietly, to himself)
    aPush('bridge', 's25_teddy_hatch', 0.25, 8),
    { expr: [['teddy', 'still']] },
    { wait: 0.8 },
    slow('teddy', '…Teddy.', { tag: 'quietly' }),
    { wait: 0.8 },
    { face: 'teddy', to: 'luka', dur: 0.5 },
    { expr: [['teddy', 'tired']] },
    slow('teddy', "Take the scooters. Behind the booth. ^ They're slow. Everything's slow."),
    { expr: [['chase', 'neutral'], ['luka', 'neutral']] },
    { do: (c) => { const SB = SETS.bridge; if (SB && SB.dress) SB.dress('gate25', { keepEnv: true }); const t = act(c, 'teddy'); if (t) t.face(PI, 0.6); } },
    { do: (c) => { const ch = act(c, 'chase'); if (ch) ch.place([7.0, 0, -4.6, 0.3]); } },
  ];

  // Cutscene — "2.5_alarm." As they reach two little hire hover-scooters behind the booth, every drone tower turns red.
  const TOWERS = glideCam([3.0, 1.3, 14.2], [10.0, 3.7, 3.0], 54, { pos: [3.3, 1.3, 13.4], look: [10.0, 4.0, 3.0], fov: 52 }, 7);
  const PEEL = glideCam([10.8, 1.7, 8.6], [3.6, 3.6, -1.2], 50, { pos: [10.6, 1.65, 8.2], look: [3.6, 3.4, -1.2], fov: 48 }, 6);
  CUTSCENES['2.5_alarm'] = [
    { do: (c) => {
      const l = act(c, 'luka'), ch = act(c, 'chase'), c4 = act(c, 'chase40');
      if (l) l.place('s25_dock_luka'); if (ch) ch.place('s25_dock_chase'); if (c4) c4.place('s25_dock_c40');
      const SB = SETS.bridge; if (SB && SB.dress) SB.dress('alarm25', { keepEnv: true });
      for (let i = 0; i < 6; i++) {
        DRONES.spawn(CHASERS[i], { at: [DOCK[i][0], 0, DOCK[i][1]], face: i < 3 ? -H : H, hover: 7.75, cone: false, ai: false, showPath: false });
        DRONES.light(CHASERS[i], 'escort');
      }
    } },
    { music: null, fade: 0.3 },
    TOWERS,
    { sfx: 'drone_red', vol: 0.6, at: [12.2, 9, 3] },
    { do: (c) => { for (let i = 0; i < 6; i++) hoverTo(c, CHASERS[i], 9.2, 1.4); } },
    { face: 'luka', to: [12.2, 0, 3.0], dur: 0.5 }, { face: 'chase', to: [12.2, 0, 3.0], dur: 0.5 }, { face: 'chase40', to: [12.2, 0, 3.0], dur: 0.5 },
    { wait: 1.2 },
    say('drone', 'Unauthorised crossing! ^ For your safety, please stop!'),
    // Six drones peel off the towers.
    PEEL,
    { do: (c) => {
      const T = [[6.6, -1.0], [4.4, -2.2], [8.8, -2.4], [1.2, -1.8], [3.0, -3.0], [-0.6, -2.6]];
      for (let i = 0; i < 6; i++) { DRONES.goTo(CHASERS[i], [T[i][0], 0, T[i][1]], { speed: 4.2 }); hoverTo(c, CHASERS[i], 3.2 + (i % 3) * 0.4, 2.4); DRONES.face(CHASERS[i], [7.6, 0, 3.2]); }
    } },
    { sfx: 'whoosh', vol: 0.4 },
    { wait: 1.6 },
    { expr: [['luka', 'scared'], ['chase', 'scared']] },
    { face: 'luka', to: [6.0, 0, -1.0], dur: 0.4 }, { face: 'chase', to: [6.0, 0, -1.0], dur: 0.4 }, { face: 'chase40', to: [6.0, 0, -1.0], dur: 0.4 },
    CLOSE('chase40', { yaw: 0.35, dist: 1.0, fov: 38, push: 0.1, dur: 4 }),
    { expr: [['chase40', 'determined']] },
    { wait: 0.4 },
    say('chase40', 'Go.'),
    { music: 'scooter' },
    { wait: 0.7 },
    { fade: 'out', dur: 0.3 },
  ];

  // Cutscene — "2.5_laugh" (scripted, halfway across; can't be missed). The mini-game holds the chase in chase.cruise()
  // with the six drones in formation behind; it grants the laugh sample afterwards (always).
  function laughOn(c) {
    const l = act(c, 'luka');
    if (l) { l.play('scooter_laugh'); l.setExpr('laugh'); const b = l.rig.attach.santa_beard; if (b) b.userData.state('ear'); }
    if (!sk(c) && c.AUDIO && c.AUDIO.laugh) c.AUDIO.laugh();
  }
  const laughCry = (c, id) => { const a = act(c, id); if (a) a.setExpr('laugh_cry'); };   // laughing and crying at the same time
  CUTSCENES['2.5_laugh'] = [
    // [TRACK · side-on, the two scooters and six drones in a neat line behind them, everyone at exactly 25 km/h]
    { shot: 'WIDE', on: ['luka', 'chase', 'chase40'], move: 'track', track: 'alongside', side: 'right', dist: 15, height: 0.95, offset: -4.5, fov: 40 },
    { wait: 1.4 },
    say('drone', 'Please stop!'),
    { expr: [['luka', 'determined']] },
    say('luka', "We're going TWENTY-FIVE."),
    say('drone', 'So are we!'),
    { wait: 0.4 },
    // [CLOSE · Luka, driving] It hits him: the absurdity, the two days, the bench, all of it. He starts to laugh, and it's
    // a proper helpless laugh. The Santa beard flaps off one ear. He can't stop.
    { shot: 'CLOSE', on: 'luka', move: 'track', track: 'ahead', dist: 1.35, height: 0.05 },
    { expr: [['luka', 'stunned']] },
    { wait: 0.9 },
    { do: (c) => laughOn(c) },
    { wait: 3.0 },
    { do: (c) => { if (!sk(c) && c.AUDIO && c.AUDIO.laugh) c.AUDIO.laugh(); } },
    // [CLOSE · Chase (2040) on the other scooter] He hears it. His face. He hasn't heard that laugh in six years.
    { shot: 'CLOSE', on: 'chase40', move: 'track', track: 'ahead', dist: 1.35, height: 0.05 },
    { expr: [['chase40', 'stunned']] },
    { wait: 1.6 },
    { expr: [['chase40', 'tearful']] },
    { wait: 1.0 },
    say('chase40', 'CHASE. ^ GET THAT.'),
    // [CLOSE · Chase on the back] He fumbles his phone up and records, laughing too.
    { shot: 'CLOSE', on: 'chase', move: 'track', track: 'alongside', side: 'right', dist: 1.3, height: 0.05, offset: 0.15 },
    { do: (c) => { const a = act(c, 'chase'); if (a) { a.rig.show('phone', true); a.play('scooter_pillion', { rec: true }); a.setExpr('laugh'); } } },
    { sfx: 'dictaphone', vol: 0.4 },
    { wait: 1.2 },
    { do: (c) => { if (!sk(c) && c.AUDIO && c.AUDIO.laugh) c.AUDIO.laugh(); } },
    { wait: 1.6 },
    // [WIDE] Chase (2040) is laughing and crying at the same time and doesn't care which. (A wide lens close to him: his
    // face reads, Luka and Chase on the other scooter and the six drones behind)
    { shot: 'WIDE', on: 'chase40', move: 'track', track: 'ahead', dist: 3.0, height: 0.35, offset: 0.6, fov: 50 },
    { do: (c) => { const a = act(c, 'chase40'); if (a) a.play('scooter_laugh'); laughCry(c, 'chase40'); } },
    { wait: 3.4 },
  ];

  // End of chase. At the Brighton end they swerve off the road onto a boardwalk into the mangroves. The drones stop at
  // the edge.
  CUTSCENES['2.5_edge'] = [
    { do: (c) => {
      const SB = SETS.bridge;
      if (SB && SB.unmount) SB.unmount();
      if (SB && SB.dress) SB.dress('end25', { keepEnv: true });
      for (const [id, m] of [['luka', 's25_bw_luka'], ['chase', 's25_bw_chase'], ['chase40', 's25_bw_c40']]) { const a = act(c, id); if (a) { a.place(m); a.play('idle'); a.setExpr('neutral'); } }
      const ch = act(c, 'chase'); if (ch) ch.rig.show('phone', false);
      const l = act(c, 'luka'); if (l) { const b = l.rig.attach.santa_beard; if (b) b.userData.state('on'); }
      const M = SB && SB.marks;
      if (M) for (let i = 0; i < 6; i++) { const m = M['d25_edge_' + (i + 1)], d = DRONES.get(CHASERS[i]); if (m && d && (Math.abs(d.z - m[2]) > 3 || sk(c))) { DRONES.spawn(CHASERS[i], { at: [m[0], 0, m[2]], face: m[3], hover: m[1], cone: false, ai: false, showPath: false }); DRONES.light(CHASERS[i], 'escort'); } }
      c.flow.setFollow(null);
    } },
    { music: null, fade: 1.0 },
    { env: 'mangrove25', dur: 5 },
    aPush('bridge', 's25_edge', 0.6, 10),
    { wait: 1.4 },
    { do: (c) => { for (const id of CHASERS) DRONES.light(id, 'patrol'); } },
    say('drone', 'Uneven terrain detected. ^ For your safety, pursuit has ended. ^ Have a lovely day!'),
    { do: (c) => { for (let i = 0; i < 6; i++) DRONES.face(CHASERS[i], [40, 0, 830]); } },
    { wait: 0.6 },
    aPush('bridge', 's25_bw_hide', 0.3, 8),
    { expr: [['luka', 'tired'], ['chase', 'tired'], ['chase40', 'still']] },
    { wait: 2.8 },
    { fade: 'out', dur: 0.9 },
    { do: (c) => c.world.prebuild('hq_top') },
  ];

  // Cutscene — "2.5_manager" (a cutaway). [WIDE · from behind the figure] The Manager's office. On the glass wall, small
  // and low-res, drone footage: two hover-scooters disappearing into the mangroves. The figure doesn't move.
  CUTSCENES['2.5_manager'] = [
    { set: 'hq_top', env: 'cutaway', spawn: { luka40: 's25_mgr' } },
    { do: (c) => { if (c.hud && c.hud.hide) c.hud.hide(); } },   // a cutaway: not the party's HUD
    { do: (c) => nextTick().then(() => {
      const SB = SETS.hq_top; if (SB && SB.dress) SB.dress('s25');
      const m = act(c, 'luka40'); if (m) { m.habit = null; m.rig.show('hood', true); m.play('idle'); m.place('s25_mgr'); }
      const g = P(c, 'glass_ui'); if (g && g.userData.popup) g.userData.popup('footage');
    }) },
    aPush('hq_top', 's25_wide', 0.4, 12),
    { fade: 'in', dur: 1.2 },
    { wait: 2.6 },
    slow('manager', '…Bring them in. ^ Gently.'),
    { do: (c) => { const d = P(c, 'aide_drone'); if (d && d.userData.talk) d.userData.talk(true); } },
    say('drone', 'Yes, sir.'),
    { do: (c) => { const d = P(c, 'aide_drone'); if (d && d.userData.talk) d.userData.talk(false); } },
    { wait: 1.6 },
    { fade: 'out', dur: 1.2 },
  ];
})();
