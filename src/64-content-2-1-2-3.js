// ============================================================ CONTENT: 2.1 ("Senior Casual"), 2.2 ("Bee Gees Way"), 2.3 ("The Bench")
// BUILD_PROMPT §8. Every line is final and word for word; '^' = a beat. Shot tags are quoted in the comments.
// Sets: flat (docs/sets/flat.md: 2.1 dawn21 -> morning21) and parade (docs/sets/parade.md: 2.2 Region P lane22, the
// Bee Gees Way laneway; 2.3 Region W bench23, the Woody Point headland). No music in 2.1 until the plan (pads), none in
// 2.2 (cicadas, hover traffic, then the piano is the music) and none in 2.3 (wind, water, the bell buoy).
// Mini-games: MINIGAMES.piano (44-mg-piano.js: the phrase, Chase playing on to the dead stop, the sneak playback, and
// the drone's "Excuse me! That's quite loud!") and the limiter keypad (MINIGAMES.keypad, src/54-mg-keypad.js: Rue's
// Alarm keypad, 2040 SafeSense). Systems: Chip View + AR (the SERVICE CODE 2032 tag),
// strengthHold (Luka lifts the brass plate), DRONES + stealth (the lane drone, the lure over the piano, the Safe Room).
// Hints (spec §7 ledger): 2 (the polished bench) and 3 (the QUIET login code) are played silently in 2.3. Honest
// moments play straight: no music, no gag on top.
(() => {
  const PI = Math.PI, H = PI / 2;
  const say = (id, text, o) => Object.assign({ say: id, text }, o);
  const slow = (id, text, o) => say(id, text, Object.assign({ speed: 'slow' }, o));
  const sk = (c) => c.flow.skipping;
  const P = (c, n) => c.world.prop(n);
  const act = (c, id) => c.world.actor(id);
  const V1 = new THREE.Vector3(), V2 = new THREE.Vector3();
  // one tick later (even while skipping): a set re-dresses itself on its first tick in a new scene, so content that
  // dresses from flags (Continue) runs after it
  const nextTick = () => new Promise((res) => { const f = () => { removeUpdate(f); res(); }; addUpdate(f); });
  // a tween on the game clock, snapped at once while skipping or when the scene changes
  function tween(c, dur, fn) {
    const sid = c.flow.sceneId;
    if (c.flow.skipping || !(dur > 0)) { fn(1); return; }
    let t = 0;
    const f = (dt) => { t = Math.min(1, t + dt / dur); if (flow.sceneId !== sid || flow.skipping) t = 1; fn(t * t * (3 - 2 * t)); if (t >= 1) removeUpdate(f); };
    addUpdate(f);
  }
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
  // Luka's tell: a glance at Chase before he speaks (a head turn; the feet stay)
  const glance = (from, to, dur = 1.0) => ({ do: (c) => {
    if (sk(c)) return;
    const a = act(c, from), b = act(c, to);
    if (!a || !b) return;
    let d = Math.atan2(b.pos.x - a.pos.x, b.pos.z - a.pos.z) - a.rotY; d = Math.atan2(Math.sin(d), Math.cos(d));
    a.play('glance', { yaw: Math.max(-1.3, Math.min(1.3, d)), dur });
  } });
  // seat an actor at once (keeps under skips; the pose is state)
  const seat = (id, h = 0.46, anim = 'sit') => ({ do: (c) => { const a = act(c, id); if (!a) return; a.play('sit', { h }); a.rig.seated = true; if (anim !== 'sit') a.play(anim, { h }); } });
  const unseat = (id) => ({ do: (c) => { const a = act(c, id); if (!a) return; a.rig.seated = false; a.rig.floorSit = false; a.play('idle'); } });
  // act when the typewriter reaches `sub` in `line` (any text speed); '^' beats are not typed, so index the typed text
  const typedIndex = (line, sub) => { const out = line.replace(/ ?\^ ?/g, (m, i) => (i === 0 ? '' : ' ')).replace(/ {2,}/g, ' '); return out.indexOf(sub); };
  function onText(line, sub, fn) {
    const i = typedIndex(line, sub);
    return { do: (c) => {
      if (sk(c)) { fn(c); return; }
      const el = document.querySelector('#dlg .txt'), n = el && [...el.childNodes].find((x) => x.nodeType === 3);
      const t0 = clock.t;
      return waitUntil(() => c.flow.skipping || !n || n.length >= i || clock.t - t0 > 30).then(() => fn(c));
    } };
  }
  // wear / take off parts of a rig (pooled rigs: spawn re-dresses them; content restores what it changes)
  const wear = (id, part, on) => ({ do: (c) => { const a = act(c, id); if (a && a.rig.attach[part]) a.rig.show(part, on); } });
  // Luka's Santa beard: 'on' | 'slip' | 'chin'
  const beard = (st) => ({ do: (c) => { const l = act(c, 'luka'), b = l && l.rig.attach.santa_beard; if (b) b.userData.state(st); } });
  // autoplay: SWAP until `id` leads (bounded: SWAP may be off)
  const swapTo = (c, id) => { for (let i = 0; i < 3 && c.state.active !== id; i++) c.flow.swapNext(); if (c.state.active !== id) console.error('TWO: could not swap to ' + id); };
  const flagOff = (list) => ({ do: (c) => { for (const f of list) delete c.state.flags[f]; } });

  // ---------------------------------------------------------- anims this file owns (guarded; no allocation per tick)
  const K = () => RIGKIT;
  // Chase (2040)'s right hand on the bedroom doorframe (2.1_dont step 13): reaching out to his right at head height
  if (!ANIMS.s21_frame) {
    ANIMS.s21_frame = (r, t, p) => {
      const k = K(); if (!k) return ANIMS.idle(r, t, p);
      k.base(r, t);
      const P_ = r.parts, d = r.d;
      k.arm(r, -1, d.shX + 0.12, 0.42 * (d.T / 0.47), 0.3, 1, -0.4, -0.6);
      P_.handR.rotation.set(0.2, 0, 1.25);
      P_.torso.rotation.z = -0.05; P_.head.rotation.z = 0.04;
    };
  }
  // the two Chases on the piano bench, same slumped shoulders (2.2_piano step 6): seated, forearms on the thighs
  if (!ANIMS.s22_slump) {
    ANIMS.s22_slump = (r, t, p) => {
      const k = K(); if (!k) return ANIMS.sit(r, t, p);
      ANIMS.sit_bench(r, t, p);
      const P_ = r.parts, d = r.d;
      P_.torso.rotation.x = 0.36 + 0.012 * Math.sin(t * 1.4); P_.neck.rotation.x = 0.1; P_.head.rotation.x = 0.16;
      k.arm(r, 1, d.shX * 0.55, -0.14, 0.4, 1, -0.4, -1); k.arm(r, -1, d.shX * 0.55, -0.14, 0.4, 1, -0.4, -1);
      P_.handL.rotation.x = 0.7; P_.handR.rotation.x = 0.7;
    };
  }
  // Luka pushes the slipping beard back up (one shot)
  if (!ANIMS.s22_beard_up) {
    ANIMS.s22_beard_up = (r, t, p) => {
      const k = K(); if (!k) return ANIMS.idle(r, t, p);
      if (p.kneel) k.kneel(r, t); else k.base(r, t);
      const u = k.once(t, p, 0.8), a = u < 0.5 ? k.ez(u / 0.5) : k.ez((1 - u) / 0.5), d = r.d;
      k.arm(r, -1, 0.04 + 0.06 * (1 - a), (d.headC - 0.22) * a - 0.05 * (1 - a), 0.14 + 0.16 * a, 1, -1, -0.3);
      r.parts.handR.rotation.set(-0.6 * a, 0, 0.3);
    };
    ANIMS.s22_beard_up.upper = true;
  }
  // Chase (2040) on the path holding his own elbow (2.3 step 6)
  if (!ANIMS.s23_elbow) {
    ANIMS.s23_elbow = (r, t, p) => {
      const k = K(); if (!k) return ANIMS.idle(r, t, p);
      k.base(r, t);
      const P_ = r.parts, d = r.d;
      k.arm(r, 1, d.shX + 0.02, 0.0, 0.14, 1, -1, -0.2);                           // the left arm hangs a little forward
      k.arm(r, -1, -(d.shX - 0.02), 0.02, 0.17, 1, -0.8, -0.2);                    // the right hand across, on the left elbow
      P_.handR.rotation.set(0, 0, -0.6); P_.head.rotation.x = 0.12; P_.torso.rotation.x += 0.05;
    };
  }
  // Chase (2040) holds the slate up between them (2.3 step 25), seated
  if (!ANIMS.s23_slate) {
    ANIMS.s23_slate = (r, t, p) => {
      const k = K(); if (!k) return ANIMS.sit(r, t, p);
      ANIMS.sit(r, t, p);
      const d = r.d;
      k.arm(r, -1, -0.04, 0.24 * (d.T / 0.47), d.chestZ + 0.3, 1, -0.8, -0.4);
      r.parts.handR.rotation.set(-0.9, 0.5, 0); r.parts.head.rotation.x = 0.12;
    };
  }

  // ---------------------------------------------------------- CARDS (readable INSERTs this file owns)
  // 2.1: the music slate on the desk. One folder: two. Inside: 2,847 items. The insert scrolls: two_v1.wav,
  // two_v2_FINAL.wav, two_v2_FINAL_real.wav, two_v3_bridge_idea.wav … two_v1204_dont.wav … two_v2847.wav.
  const SLATE_TOP = ['two_v1.wav', 'two_v2_FINAL.wav', 'two_v2_FINAL_real.wav', 'two_v3_bridge_idea.wav'];
  const slateRow = (i) => (i < 4 ? SLATE_TOP[i] : i === 2846 ? 'two_v2847.wav' : i === 1203 ? 'two_v1204_dont.wav' : 'two_v' + (i + 1) + '.wav');
  CARDS.s21_slate = (cx, w, h, d) => {
    const K_ = CARDS._kit, mode = d.mode || 'folder';
    K_.tilt(cx, w, h, -0.015);
    // the tablet: a thin glass slab, dark bezel, a cool rim of dawn light
    K_.shadow(cx, 30, 12); cx.fillStyle = '#16191f'; K_.rr(cx, w * 0.04, h * 0.05, w * 0.92, h * 0.9, 34); cx.fill(); K_.noShadow(cx);
    cx.strokeStyle = 'rgba(191,230,255,.35)'; cx.lineWidth = 3; K_.rr(cx, w * 0.04 + 2, h * 0.05 + 2, w * 0.92 - 4, h * 0.9 - 4, 32); cx.stroke();
    const sx = w * 0.08, sy = h * 0.11, sw = w * 0.84, sh = h * 0.78;
    cx.save(); K_.rr(cx, sx, sy, sw, sh, 10); cx.clip();
    cx.fillStyle = '#0e1626'; cx.fillRect(sx, sy, sw, sh);
    cx.fillStyle = '#16233a'; cx.fillRect(sx, sy, sw, 52);
    cx.textBaseline = 'middle'; cx.fillStyle = '#bfe6ff'; cx.font = `bold 24px ${K_.SYS}`; cx.textAlign = 'left'; cx.fillText('SLATE', sx + 22, sy + 27);
    cx.textAlign = 'right'; cx.font = `22px ${K_.SYS}`; cx.fillText('4:58 am', sx + sw - 22, sy + 27);
    if (mode === 'folder') {
      const fx = sx + sw / 2, fy = sy + sh * 0.5;
      cx.strokeStyle = '#bfe6ff'; cx.lineWidth = 6; cx.fillStyle = 'rgba(191,230,255,.12)';
      cx.beginPath(); cx.moveTo(fx - 110, fy - 80); cx.lineTo(fx - 40, fy - 80); cx.lineTo(fx - 22, fy - 62); cx.lineTo(fx + 110, fy - 62); cx.lineTo(fx + 110, fy + 50); cx.lineTo(fx - 110, fy + 50); cx.closePath(); cx.fill(); cx.stroke();
      cx.textAlign = 'center'; cx.fillStyle = '#ffffff'; cx.font = `bold 58px ${K_.SYS}`; cx.fillText('two', fx, fy - 2);
      cx.fillStyle = '#bfe6ff'; cx.font = `34px ${K_.SYS}`; cx.fillText('2,847 items', fx, fy + 104);
    } else {
      cx.fillStyle = '#1d2a36'; cx.fillRect(sx, sy + 52, sw, 46);
      cx.textAlign = 'left'; cx.fillStyle = '#d8e6f0'; cx.font = `bold 26px ${K_.SYS}`; cx.fillText('two  ·  2,847 items', sx + 22, sy + 76);
      const rowH = 40, top = sy + 98, rows = Math.ceil((sh - 98) / rowH) + 1, n = 2847, maxFirst = n - (rows - 1);
      const k = Math.max(0, Math.min(1, d.scroll || 0)), e = k * k * (3 - 2 * k);
      const first = e * maxFirst, i0 = Math.floor(first), off = (first - i0) * rowH, fast = d.fast || (k > 0.08 && k < 0.92);
      for (let r = 0; r < rows; r++) {
        const i = i0 + r; if (i >= n) break;
        const y = top + r * rowH - off;
        cx.fillStyle = i % 2 ? '#13191f' : '#0f1418'; cx.fillRect(sx, y, sw, rowH);
        const hi = i === 2846 || i === 1203;
        cx.fillStyle = hi ? '#ffffff' : '#9fb6c8'; cx.font = `${hi ? 'bold ' : ''}25px ${K_.MONO}`;
        if (fast && !hi) { cx.globalAlpha = 0.55; cx.fillText(slateRow(i), sx + 26, y + rowH / 2 - 3); cx.fillText(slateRow(i), sx + 26, y + rowH / 2 + 3); cx.globalAlpha = 1; }
        else cx.fillText(slateRow(i), sx + 26, y + rowH / 2);
        cx.fillStyle = 'rgba(191,230,255,.4)'; cx.font = `20px ${K_.SYS}`; cx.textAlign = 'right'; cx.fillText(i === 2846 ? 'today' : '', sx + sw - 22, y + rowH / 2); cx.textAlign = 'left';
      }
      // the scroll bar
      cx.fillStyle = 'rgba(191,230,255,.15)'; cx.fillRect(sx + sw - 10, top, 6, sh - 98);
      cx.fillStyle = '#bfe6ff'; cx.fillRect(sx + sw - 10, top + (sh - 98 - 30) * e, 6, 30);
    }
    cx.restore();
    const g = cx.createLinearGradient(sx, sy, sx + sw * 0.7, sy + sh); g.addColorStop(0, 'rgba(255,220,230,.10)'); g.addColorStop(0.45, 'rgba(255,255,255,0)');
    cx.fillStyle = g; K_.rr(cx, sx, sy, sw, sh, 10); cx.fill();
  };
  CARDS.s21_slate.size = [900, 620];

  // a little painted person for the photos (head + hair + shoulders): kept simple, PS1 posterised
  function person(cx, x, y, s, o) {
    // shoulders / top
    cx.fillStyle = o.top; cx.beginPath(); cx.ellipse(x, y + s * 1.55, s * 1.25, s * 0.85, 0, PI, 0); cx.fill();
    cx.fillRect(x - s * 1.25, y + s * 1.55, s * 2.5, s * 0.6);
    // neck
    cx.fillStyle = o.skinD; cx.fillRect(x - s * 0.28, y + s * 0.65, s * 0.56, s * 0.5);
    if (o.ponytail) { cx.fillStyle = o.hair; cx.beginPath(); cx.ellipse(x + s * 0.72, y + s * 0.3, s * 0.2, s * 0.6, -0.4, 0, 7); cx.fill(); }
    // head
    cx.fillStyle = o.skin; cx.beginPath(); cx.ellipse(x, y, s * 0.68, s * 0.84, 0, 0, 7); cx.fill();
    // hair
    cx.fillStyle = o.hair;
    if (o.shaggy) { cx.beginPath(); cx.ellipse(x, y - s * 0.42, s * 0.78, s * 0.55, 0, PI * 0.95, PI * 2.05); cx.fill(); for (let i = -3; i <= 3; i++) { cx.beginPath(); cx.ellipse(x + i * s * 0.2, y - s * 0.55, s * 0.17, s * 0.3, i * 0.2, 0, 7); cx.fill(); } }
    else { cx.beginPath(); cx.ellipse(x, y - s * 0.45, s * 0.72, s * 0.48, 0, PI, 0); cx.fill(); cx.fillRect(x - s * 0.72, y - s * 0.48, s * 1.44, s * 0.2); }
    // beard
    if (o.beard) { cx.fillStyle = o.beard; cx.beginPath(); cx.moveTo(x - s * 0.66, y + s * 0.05); cx.quadraticCurveTo(x - s * 0.6, y + s * 0.95, x, y + s * 1.0); cx.quadraticCurveTo(x + s * 0.6, y + s * 0.95, x + s * 0.66, y + s * 0.05); cx.quadraticCurveTo(x, y + s * 0.42, x - s * 0.66, y + s * 0.05); cx.fill(); }
    if (o.stubble) { cx.fillStyle = 'rgba(90,70,50,.35)'; cx.beginPath(); cx.ellipse(x, y + s * 0.45, s * 0.55, s * 0.38, 0, 0, PI); cx.fill(); }
    // eyes and mouth
    cx.fillStyle = '#2a1a12';
    if (o.laugh) { cx.strokeStyle = '#2a1a12'; cx.lineWidth = s * 0.07; for (const ex of [-0.26, 0.26]) { cx.beginPath(); cx.arc(x + ex * s, y - s * 0.02, s * 0.12, PI * 1.1, PI * 1.9); cx.stroke(); } cx.fillStyle = '#5a1e1e'; cx.beginPath(); cx.ellipse(x, y + s * 0.42, s * 0.24, s * 0.16, 0, 0, PI); cx.fill(); }
    else { for (const ex of [-0.26, 0.26]) { cx.beginPath(); cx.arc(x + ex * s, y - s * 0.02, s * 0.07, 0, 7); cx.fill(); } cx.fillRect(x - s * 0.2, y + s * 0.42, s * 0.4, s * 0.06); }
    if (o.badge) {   // a lanyard and a badge
      cx.strokeStyle = o.lanyard || '#2f6fe0'; cx.lineWidth = s * 0.09;
      cx.beginPath(); cx.moveTo(x - s * 0.35, y + s * 1.05); cx.lineTo(x - s * 0.1, y + s * 2.0); cx.moveTo(x + s * 0.35, y + s * 1.05); cx.lineTo(x + s * 0.1, y + s * 2.0); cx.stroke();
      cx.fillStyle = '#ffffff'; cx.fillRect(x - s * 0.42, y + s * 1.95, s * 0.84, s * 0.5);
      cx.fillStyle = '#c8342b'; cx.fillRect(x - s * 0.42, y + s * 1.95, s * 0.84, s * 0.14);
      cx.fillStyle = '#141d3a'; cx.font = `bold ${s * 0.2}px ${CARDS._kit.SANS}`; cx.textAlign = 'center'; cx.textBaseline = 'middle'; cx.fillText(o.badge, x, y + s * 2.28);
    }
  }
  // 2.1: A framed photo on the shelf: Chase (2040) and Luka (older), 2031, behind a festival barrier the afternoon before
  // the gig, Luka wearing Chase's ARTIST lanyard as a joke.
  CARDS.s21_photo = (cx, w, h) => {
    const K_ = CARDS._kit;
    K_.tilt(cx, w, h, 0.02);
    K_.shadow(cx, 30, 12); cx.fillStyle = '#2b2622'; cx.fillRect(w * 0.06, h * 0.06, w * 0.88, h * 0.88); K_.noShadow(cx);
    cx.fillStyle = '#efe8d8'; cx.fillRect(w * 0.1, h * 0.11, w * 0.8, h * 0.78);
    const x0 = w * 0.14, y0 = h * 0.16, W = w * 0.72, Hh = h * 0.68;
    cx.save(); cx.beginPath(); cx.rect(x0, y0, W, Hh); cx.clip();
    let g = cx.createLinearGradient(0, y0, 0, y0 + Hh); g.addColorStop(0, '#86c4ec'); g.addColorStop(0.55, '#f6deb4'); g.addColorStop(1, '#e8c890');
    cx.fillStyle = g; cx.fillRect(x0, y0, W, Hh);
    // the little stage behind: truss, the banner, a palm
    cx.fillStyle = '#5a5e66'; cx.fillRect(x0 + W * 0.06, y0 + Hh * 0.05, 8, Hh * 0.5); cx.fillRect(x0 + W * 0.86, y0 + Hh * 0.05, 8, Hh * 0.5); cx.fillRect(x0 + W * 0.06, y0 + Hh * 0.05, W * 0.81, 8);
    cx.fillStyle = '#d8504a'; cx.fillRect(x0 + W * 0.17, y0 + Hh * 0.11, W * 0.6, Hh * 0.1);
    cx.fillStyle = '#ffffff'; cx.font = `bold ${Hh * 0.06}px ${K_.SANS}`; cx.textAlign = 'center'; cx.textBaseline = 'middle'; cx.fillText('REDCLIFFE FESTIVAL 2031', x0 + W * 0.47, y0 + Hh * 0.165);
    cx.fillStyle = '#4a7a3a'; cx.beginPath(); cx.arc(x0 + W * 0.94, y0 + Hh * 0.24, Hh * 0.12, 0, 7); cx.fill(); cx.fillStyle = '#6a5038'; cx.fillRect(x0 + W * 0.93, y0 + Hh * 0.3, 8, Hh * 0.3);
    // the two of them, Chase laughing at Luka's straight face
    person(cx, x0 + W * 0.33, y0 + Hh * 0.47, Hh * 0.13, { top: '#1e2026', skin: '#e2b08e', skinD: '#c8946e', hair: '#6a4a2e', shaggy: true, stubble: true, laugh: true });
    person(cx, x0 + W * 0.64, y0 + Hh * 0.45, Hh * 0.14, { top: '#17181c', skin: '#dfae8c', skinD: '#c4906c', hair: '#4b3121', ponytail: true, beard: '#3d2819', badge: 'ARTIST', lanyard: '#2f6fe0' });
    // the festival barrier: steel crowd-control panels across the front
    cx.fillStyle = '#b8bec4'; cx.fillRect(x0, y0 + Hh * 0.74, W, 7); cx.fillRect(x0, y0 + Hh * 0.95, W, 7);
    for (let i = 0; i < 26; i++) cx.fillRect(x0 + i * W / 25, y0 + Hh * 0.74, 4, Hh * 0.22);
    cx.fillStyle = '#8a9096'; for (const fx of [0.02, 0.5, 0.98]) cx.fillRect(x0 + W * fx - 5, y0 + Hh * 0.7, 10, Hh * 0.3);
    // print fade + grain
    cx.fillStyle = 'rgba(255,214,160,.10)'; cx.fillRect(x0, y0, W, Hh);
    K_.seedOf('photo2031'); for (let i = 0; i < 500; i++) { cx.fillStyle = K_.rnd() < 0.5 ? 'rgba(255,255,255,.05)' : 'rgba(0,0,0,.05)'; cx.fillRect(x0 + K_.rnd() * W, y0 + K_.rnd() * Hh, 2, 2); }
    cx.restore();
    g = cx.createLinearGradient(w * 0.1, h * 0.11, w * 0.6, h * 0.9); g.addColorStop(0, 'rgba(255,255,255,.14)'); g.addColorStop(0.5, 'rgba(255,255,255,0)');
    cx.fillStyle = g; cx.fillRect(w * 0.1, h * 0.11, w * 0.8, h * 0.78);
  };
  CARDS.s21_photo.size = [760, 600];

  // 2.1_dont step 13: [INSERT] Chase (2040)'s right hand on the doorframe: the burn scars. The back of his right hand
  // flat against the white jamb, fingers up; the scars a glossy pink-white mottle across the back of the hand and wrist.
  CARDS.s21_hand = (cx, w, h) => {
    const K_ = CARDS._kit, skin = '#e2b08e', sk2 = '#d39f7c', dk = '#b27e5e';
    // the dark bedroom beyond, the jamb (white paint, a softened edge), the wall (cream) on the right
    K_.shadow(cx, 26, 10); cx.fillStyle = '#2a2622'; K_.rr(cx, w * 0.04, h * 0.04, w * 0.92, h * 0.92, 18); cx.fill(); K_.noShadow(cx);
    cx.save(); K_.rr(cx, w * 0.04, h * 0.04, w * 0.92, h * 0.92, 18); cx.clip();
    cx.fillStyle = '#d9cdb6'; cx.fillRect(w * 0.6, 0, w * 0.4, h);
    let g = cx.createLinearGradient(w * 0.28, 0, w * 0.62, 0); g.addColorStop(0, '#bdb6a8'); g.addColorStop(0.18, '#ece6da'); g.addColorStop(0.85, '#f4efe4'); g.addColorStop(1, '#d6cfc0');
    cx.fillStyle = g; cx.fillRect(w * 0.28, 0, w * 0.34, h);
    cx.fillStyle = 'rgba(0,0,0,.12)'; cx.fillRect(w * 0.6, 0, 6, h);
    // forearm from the lower right
    const ox = w * 0.47, oy = h * 0.5;
    cx.fillStyle = sk2; cx.beginPath(); cx.moveTo(ox + 30, oy + 70); cx.lineTo(w + 20, h * 0.86); cx.lineTo(w + 20, h + 20); cx.lineTo(ox + 70, h + 20); cx.lineTo(ox - 40, oy + 110); cx.closePath(); cx.fill();
    // fingers (index .. little), flat on the jamb, pointing up; nails, knuckle creases
    const F = [[-58, 150, 0.06], [-20, 172, 0.0], [18, 162, -0.05], [52, 124, -0.12]];
    for (const [fx, len, a] of F) {
      cx.save(); cx.translate(ox + fx, oy - 30); cx.rotate(a);
      cx.fillStyle = skin; K_.rr(cx, -17, -len, 34, len + 20, 16); cx.fill();
      cx.fillStyle = 'rgba(255,236,226,.85)'; K_.rr(cx, -11, -len + 4, 22, 24, 9); cx.fill();
      cx.strokeStyle = dk; cx.lineWidth = 2.5;
      for (const k of [0.38, 0.68]) { cx.beginPath(); cx.moveTo(-12, -len * k); cx.quadraticCurveTo(0, -len * k + 5, 12, -len * k); cx.stroke(); }
      cx.restore();
    }
    // the back of the hand
    cx.fillStyle = skin; cx.beginPath();
    cx.moveTo(ox - 80, oy - 34); cx.quadraticCurveTo(ox, oy - 52, ox + 74, oy - 40); cx.quadraticCurveTo(ox + 96, oy + 30, ox + 52, oy + 100);
    cx.quadraticCurveTo(ox - 10, oy + 122, ox - 64, oy + 96); cx.quadraticCurveTo(ox - 96, oy + 40, ox - 80, oy - 34); cx.fill();
    // the thumb, out to the left along the jamb
    cx.save(); cx.translate(ox - 74, oy + 56); cx.rotate(-0.95);
    cx.fillStyle = skin; K_.rr(cx, -16, -110, 34, 120, 16); cx.fill();
    cx.fillStyle = 'rgba(255,236,226,.85)'; K_.rr(cx, -10, -106, 22, 24, 9); cx.fill();
    cx.restore();
    // knuckles
    cx.fillStyle = 'rgba(178,126,94,.45)'; for (const [fx] of F) { cx.beginPath(); cx.ellipse(ox + fx, oy - 40, 13, 8, 0, 0, 7); cx.fill(); }
    // the burn scars: across the back of the hand, over the knuckles, down the wrist; tight, glossy, ridged
    cx.save(); cx.beginPath();
    cx.moveTo(ox - 70, oy - 20); cx.quadraticCurveTo(ox + 10, oy - 60, ox + 80, oy - 26); cx.lineTo(ox + 110, oy + 130); cx.lineTo(ox - 30, oy + 150); cx.closePath(); cx.clip();
    K_.seedOf('scar21');
    for (let i = 0; i < 34; i++) {
      const sx2 = ox - 60 + K_.rnd() * 170, sy2 = oy - 50 + K_.rnd() * 200, r = 10 + K_.rnd() * 26;
      cx.fillStyle = K_.rnd() < 0.5 ? 'rgba(226,150,150,.7)' : 'rgba(246,212,204,.8)';
      cx.beginPath(); cx.ellipse(sx2, sy2, r * 1.4, r, K_.rnd() * PI, 0, 7); cx.fill();
    }
    cx.strokeStyle = 'rgba(184,108,108,.55)'; cx.lineWidth = 2.5;
    for (let i = 0; i < 9; i++) { cx.beginPath(); const y0 = oy - 36 + i * 20; cx.moveTo(ox - 60, y0); for (let x = -60; x < 110; x += 16) cx.lineTo(ox + x, y0 + (K_.rnd() - 0.5) * 9 + x * 0.12); cx.stroke(); }
    g = cx.createLinearGradient(ox - 60, oy - 40, ox + 80, oy + 60); g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(0.5, 'rgba(255,255,255,.22)'); g.addColorStop(1, 'rgba(255,255,255,0)');
    cx.fillStyle = g; cx.fillRect(ox - 80, oy - 60, 220, 230);
    cx.restore();
    cx.restore();
  };
  CARDS.s21_hand.size = [640, 600];

  // 2.1_plan: three sticky notes on the table, one per step (as on the 3-D notes)
  const PLAN = [['1. OFF THE', 'PENINSULA'], ['2. VALLEY', 'BY MON AM'], ['3. HQ —', 'UNSEEN']], PLAN_C = ['#f4ec9a', '#f7a8c0', '#a8e8c8'];
  CARDS.s21_plan = (cx, w, h, d) => {
    const K_ = CARDS._kit, n = d.n ?? 3;
    // the table top: pale laminate, a crumb or two
    K_.shadow(cx, 26, 10); cx.fillStyle = '#d9cdb4'; K_.rr(cx, w * 0.03, h * 0.06, w * 0.94, h * 0.88, 18); cx.fill(); K_.noShadow(cx);
    K_.seedOf('plan'); for (let i = 0; i < 30; i++) { cx.fillStyle = `rgba(150,100,50,${0.2 + K_.rnd() * 0.3})`; cx.fillRect(w * 0.05 + K_.rnd() * w * 0.9, h * 0.1 + K_.rnd() * h * 0.8, 3, 3); }
    const s = h * 0.56, xs = [w * 0.2, w * 0.5, w * 0.8], rs = [-0.06, 0.04, -0.02];
    for (let k = 0; k < n; k++) {
      cx.save(); cx.translate(xs[k], h * 0.5); cx.rotate(rs[k]);
      K_.shadow(cx, 8, 4, 0.25); cx.fillStyle = PLAN_C[k]; cx.fillRect(-s / 2, -s / 2, s, s); K_.noShadow(cx);
      cx.fillStyle = 'rgba(0,0,0,.07)'; cx.fillRect(-s / 2, -s / 2, s, s * 0.13);
      K_.hand(cx, PLAN[k][0], 0, -s * 0.06, s * 0.17, '#141a36', { align: 'center', felt: true });
      K_.hand(cx, PLAN[k][1], 0, s * 0.2, s * 0.17, '#141a36', { align: 'center', felt: true });
      cx.restore();
    }
  };
  CARDS.s21_plan.size = [960, 420];

  // 2.2: the SafeSense limiter on the piano: MAX 40 dB, a red LED, the heavy brass plate bolted over the keypad
  CARDS.s22_limiter = (cx, w, h, d) => {
    const K_ = CARDS._kit, green = !!d.green, up = !!d.up;
    K_.shadow(cx, 26, 10); cx.fillStyle = '#eef2f6'; K_.rr(cx, w * 0.05, h * 0.08, w * 0.9, h * 0.84, 40); cx.fill(); K_.noShadow(cx);
    cx.strokeStyle = 'rgba(95,178,255,.55)'; cx.lineWidth = 4; K_.rr(cx, w * 0.05 + 4, h * 0.08 + 4, w * 0.9 - 8, h * 0.84 - 8, 36); cx.stroke();
    cx.textBaseline = 'middle'; cx.textAlign = 'left';
    cx.fillStyle = '#5a8ab8'; cx.font = `italic 28px ${K_.SYS}`; cx.fillText('SafeSense', w * 0.1, h * 0.2);
    cx.fillStyle = '#1c2a3e'; cx.font = `bold 72px ${K_.SYS}`; cx.fillText('MAX 40 dB', w * 0.1, h * 0.45);
    cx.fillStyle = '#5a6a7e'; cx.font = `30px ${K_.SYS}`; cx.fillText('for your safety', w * 0.1, h * 0.66);
    // the LED
    cx.fillStyle = green ? '#3ad16a' : '#e53935'; cx.shadowColor = cx.fillStyle; cx.shadowBlur = 24; cx.beginPath(); cx.arc(w * 0.13, h * 0.82, 14, 0, 7); cx.fill(); K_.noShadow(cx);
    cx.fillStyle = '#5a6a7e'; cx.font = `22px ${K_.SYS}`; cx.fillText(green ? 'LIMITER OFF' : 'LIMITER ON', w * 0.17, h * 0.82);
    // the keypad, and over it the brass plate on its hinge (closed, or lifted)
    const kx = w * 0.62, ky = h * 0.2, kw = w * 0.28, kh = h * 0.66;
    cx.fillStyle = '#2a2e36'; K_.rr(cx, kx, ky, kw, kh, 12); cx.fill();
    const L = '123456789*0#';
    for (let i = 0; i < 12; i++) { const x = kx + 14 + (i % 3) * (kw - 28) / 3, y = ky + 16 + Math.floor(i / 3) * (kh - 32) / 4; cx.fillStyle = '#c9ccd2'; K_.rr(cx, x + 3, y + 3, (kw - 28) / 3 - 6, (kh - 32) / 4 - 6, 6); cx.fill(); cx.fillStyle = '#20242c'; cx.font = `bold 30px ${K_.SYS}`; cx.textAlign = 'center'; cx.fillText(L[i], x + (kw - 28) / 6, y + (kh - 32) / 8); }
    cx.textAlign = 'left';
    if (!up) {
      K_.shadow(cx, 18, 8); cx.fillStyle = K_.brass(cx, kx - 10, ky - 14, kw + 20, kh + 26); K_.rr(cx, kx - 10, ky - 14, kw + 20, kh + 26, 10); cx.fill(); K_.noShadow(cx);
      for (const [a, b] of [[0, 0], [1, 0], [0, 1], [1, 1]]) K_.screw(cx, kx + 6 + a * (kw - 12), ky + 4 + b * (kh - 6), 9);
      cx.fillStyle = '#7a5a20'; cx.fillRect(kx - 10, ky - 14, kw + 20, 10);   // the hinge along the top edge
      K_.engrave(cx, 'SERVICE', kx + kw / 2, ky + kh / 2, `bold 34px ${K_.SERIF}`);
    } else {
      cx.fillStyle = K_.brass(cx, kx - 10, ky - 60, kw + 20, 50); K_.rr(cx, kx - 10, ky - 64, kw + 20, 50, 8); cx.fill();   // propped up, edge-on
    }
  };
  CARDS.s22_limiter.size = [960, 460];

  // 2.3: [INSERT] IN MEMORY OF LUKA · 2IC · "I'll do it." · He was the one who could.
  CARDS.s23_plaque = (cx, w, h) => {
    const K_ = CARDS._kit, x = w * 0.05, y = h * 0.1, pw = w * 0.9, ph = h * 0.8;
    K_.shadow(cx, 20, 8); cx.fillStyle = K_.brass(cx, x, y, pw, ph); K_.rr(cx, x, y, pw, ph, 12); cx.fill(); K_.noShadow(cx);
    cx.strokeStyle = 'rgba(70,48,12,.55)'; cx.lineWidth = 3; K_.rr(cx, x + 20, y + 20, pw - 40, ph - 40, 6); cx.stroke();
    for (const [a, b] of [[0, 0], [1, 0], [0, 1], [1, 1]]) K_.screw(cx, x + 12 + a * (pw - 24), y + 12 + b * (ph - 24), 7);
    if ('letterSpacing' in cx) cx.letterSpacing = '6px';
    K_.engrave(cx, 'IN MEMORY OF LUKA · 2IC', w / 2, y + ph * 0.27, `bold ${ph * 0.15}px ${K_.SERIF}`);
    if ('letterSpacing' in cx) cx.letterSpacing = '1px';
    K_.engrave(cx, '“I’ll do it.”', w / 2, y + ph * 0.53, `italic bold ${ph * 0.15}px ${K_.SERIF}`);
    K_.engrave(cx, 'He was the one who could.', w / 2, y + ph * 0.77, `${ph * 0.12}px ${K_.SERIF}`);
    if ('letterSpacing' in cx) cx.letterSpacing = '0px';
    // salt-air polish: a long clean highlight (nothing on it)
    const g = cx.createLinearGradient(x, y, x + pw, y + ph); g.addColorStop(0.3, 'rgba(255,255,255,0)'); g.addColorStop(0.42, 'rgba(255,250,230,.32)'); g.addColorStop(0.5, 'rgba(255,255,255,0)');
    cx.fillStyle = g; K_.rr(cx, x, y, pw, ph, 12); cx.fill();
  };
  CARDS.s23_plaque.size = [960, 380];

  // 2.3: the music slate held up between them: Luka's number, the voicemail greeting playing
  CARDS.s23_voicemail = (cx, w, h) => {
    const K_ = CARDS._kit;
    K_.tilt(cx, w, h, 0.03);
    K_.shadow(cx, 30, 12); cx.fillStyle = '#16191f'; K_.rr(cx, w * 0.05, h * 0.06, w * 0.9, h * 0.88, 30); cx.fill(); K_.noShadow(cx);
    const sx = w * 0.09, sy = h * 0.12, sw = w * 0.82, sh = h * 0.76;
    cx.save(); K_.rr(cx, sx, sy, sw, sh, 10); cx.clip();
    cx.fillStyle = '#0e1626'; cx.fillRect(sx, sy, sw, sh);
    cx.fillStyle = '#16233a'; cx.fillRect(sx, sy, sw, 46);
    cx.textBaseline = 'middle'; cx.textAlign = 'left'; cx.fillStyle = '#bfe6ff'; cx.font = `bold 22px ${K_.SYS}`; cx.fillText('SLATE', sx + 20, sy + 24);
    cx.textAlign = 'right'; cx.font = `20px ${K_.SYS}`; cx.fillText('8:52 am', sx + sw - 20, sy + 24);
    cx.textAlign = 'center'; cx.fillStyle = '#ffffff'; cx.font = `bold 46px ${K_.SYS}`; cx.fillText('Luka', sx + sw / 2, sy + sh * 0.3);
    cx.fillStyle = '#9fb6c8'; cx.font = `24px ${K_.SYS}`; cx.fillText('Voicemail greeting', sx + sw / 2, sy + sh * 0.43);
    cx.fillStyle = '#bfe6ff'; K_.seedOf('vm');
    for (let x = sx + 40; x < sx + sw - 40; x += 7) { const a = 6 + Math.abs(Math.sin(x * 0.045) * 26 + Math.sin(x * 0.17) * 10) * (0.55 + K_.rnd() * 0.45); cx.fillRect(x, sy + sh * 0.64 - a / 2, 4, a); }
    cx.fillStyle = 'rgba(14,22,38,.55)'; cx.fillRect(sx + sw * 0.46, sy + sh * 0.5, sw * 0.5, sh * 0.28);   // not played yet past here
    cx.fillStyle = '#ffffff'; cx.fillRect(sx + sw * 0.46, sy + sh * 0.5, 3, sh * 0.28);
    cx.fillStyle = '#9fb6c8'; cx.font = `22px ${K_.MONO}`; cx.fillText('0:03 / 0:06', sx + sw / 2, sy + sh * 0.88);
    cx.restore();
  };
  CARDS.s23_voicemail.size = [760, 520];

  // the limiter keypad (2.2's 'keypad' mini-game: Rue's Alarm keypad, 2040 SafeSense) lives in src/54-mg-keypad.js

  // =================================================================== 2.1 — "Senior Casual"
  // SETS.flat: +Z out to the bay (balcony door, kitchen window), +X the kitchen. Marks/anchors from src/13-set-flat.js.
  const S21_FLAGS = ['s21_slate', 's21_play', 's21_photo', 's21_kettle_line', 's21_plan', 's21_box', 's21_done', 'santa'];
  const COUCH = [-1.62, 0, -2.42, 0];            // Chase sitting up on the couch, facing the balcony
  const STAND = [-1.55, 0, -1.85, -0.35];        // off the couch
  // a set anchor's lens as the start of a glide to `to` (anchor data read at load: the set files come first)
  function aGlide(setId, name, to, dur = 6, ease = 'linear') {
    const an = SETS[setId] && SETS[setId].anchors && SETS[setId].anchors[name];
    if (!an) return { shot: 'INSERT', at: name };
    return glideCam(an.from.slice(), an.at.slice(), an.fov || 40, to, dur, ease);
  }
  // [WIDE · from inside, through the balcony door] (the set's s21_dawn_wide, easing in toward the glass)
  const DAWN_WIDE = aGlide('flat', 's21_dawn_wide', { pos: [-1.05, 1.78, -2.55], look: [-2.75, 1.05, 1.35], fov: 49 }, 8);
  // the room from the corner (the gameplay camera's own angle: control hands over without a jump)
  const ROOM = { shot: 'CAM', pos: [2.0, 2.45, -0.12], look: [-1.6, 0.9, -2.1], fov: 58 };
  const DOOR_MID = glideCam([-1.9, 1.5, -1.4], [-0.95, 1.38, -3.75], 40, { pos: [-1.72, 1.48, -1.82], look: [-0.95, 1.38, -3.75], fov: 38 }, 6);
  const LUKA_OTS = glideCam([-3.6, 1.62, -1.65], [-2.82, 1.08, 1.4], 40, { pos: [-3.58, 1.6, -1.45], look: [-2.82, 1.1, 1.4], fov: 38 }, 5);
  const HAND = { shot: 'INSERT', at: 's21_hand_frame', card: ['s21_hand', {}] };
  const BAL_LOCKED = { shot: 'CAM', pos: [-2.28, 1.52, -1.95], look: [-2.28, 1.3, 1.05], fov: 40 };   // one locked two-shot, side-on (heads clear of the bars)
  // dawn behind them, a soft fill from the room so faces read in the locked shot (the dawn preset, lit from inside)
  const BAL_LIGHT = { hemi: [0xdccfdc, 0x4a3e46, 1.0], dir: [0xffc8b4, 0.6, [2, 5, -9]], spot: [0xffb0a0, 1.4] };
  // the table from the window side, as wide as the kitchen allows: all three faces and the toast inside the bars
  const PLAN_WIDE = glideCam([2.3, 1.8, -0.1], [2.25, 0.85, -1.55], 66, { pos: [2.3, 1.76, -0.17], look: [2.25, 0.86, -1.55], fov: 63 }, 8);
  const PLAN_TOP = glideCam([2.3, 1.5, -0.84], [2.3, 0.76, -0.97], 40, { pos: [2.3, 1.38, -0.88], look: [2.3, 0.76, -0.97], fov: 40 }, 6);
  // from the foot of the bed, past the box: Luka's face as he kneels to it, the box open below (the set's s21_box looks
  // down at the box alone: the kneeling head is above the letterbox)
  const BOX = glideCam([-2.2, 1.55, -3.95], [-1.4, 0.88, -5.35], 50, { pos: [-2.15, 1.5, -4.05], look: [-1.4, 0.86, -5.35], fov: 48 }, 5);
  const SANTA_MID = glideCam([0.35, 1.58, -4.3], [-1.05, 1.42, -5.4], 40, { pos: [0.1, 1.56, -4.5], look: [-1.05, 1.44, -5.4], fov: 38 }, 7);

  function reset21(c) {
    for (const f of S21_FLAGS) delete c.state.flags[f];
    const i = c.state.inventory.indexOf('santa'); if (i >= 0) c.state.inventory.splice(i, 1);
  }
  // 4:52 am: Luka on the balcony with the tea towel, Chase asleep on the couch, Chase (2040) asleep in the bedroom (in his
  // T-shirt: the scene spawns him with look chase40_tee). Both lie down: lie(true) makes the seat and the mattress floor.
  function open21(c) {
    reset21(c);
    const SF = SETS.flat;
    if (SF && SF.dress && c.world.setId === 'flat') SF.dress('dawn21');
    if (SF && SF.lie) SF.lie(true);
    const l = act(c, 'luka'), ch = act(c, 'chase'), c4 = act(c, 'chase40');
    if (l) { l.hold(null); l.place('s21_bal_polish'); l.hold('tea_towel', 'R'); l.play('polish'); l.setExpr('tired'); }
    if (ch) { ch.rig.seated = false; ch.place('s21_couch_lie'); ch.play('lie'); ch.setExpr('sleep'); }
    if (c4) { c4.rig.seated = false; c4.place('s21_bed_lie'); c4.play('sleep_back'); c4.setExpr('sleep'); }
    const sl = P(c, 'slate_desk'); if (sl) sl.userData.screen('off');
    if (SETS.flat.snore) SETS.flat.snore(true);
  }

  SCENES['2.1'] = {
    title: 'Senior Casual', set: 'flat', env: 'dawn', time: 'Sunday 23 December 2040, 4:52 am', place: "Chase's flat, Redcliffe",
    playable: ['chase', 'luka'], swap: false, music: null,
    hud: { noService: false, quiet: '31:06:00', samples: false, bars: null },
    spawn: { luka: 's21_bal_polish', chase: 's21_couch_lie', chase40: { at: 's21_bed_lie', look: 'chase40_tee' } },
    hotspots: [
      // The music slate on the desk (Chase): a thin glass tablet. One folder: two. Inside: 2,847 items.
      { id: 'h21_slate', at: 's21_slate_chase', r: 0.95, only: 'chase', when: (s) => !s.flags.s21_slate, flag: 's21_slate',
        steps: [
          { face: 'chase', to: [-3.72, 0, -0.95], dur: 0.3 },
          { prop: 'slate_desk', fn: (o) => o.userData.screen('folder') },
          { shot: 'INSERT', at: 's21_slate', card: ['s21_slate', { mode: 'folder' }] },
          { sfx: 'tap_pay', vol: 0.25 },
          { wait: 1.3 },
          { prop: 'slate_desk', fn: (o) => o.userData.screen('list') },
          { sfx: 'tap_pay', vol: 0.2 },
          { do: (c) => slateScroll(c) },
          { wait: 0.4 },
          say('chase', "Two thousand eight hundred and forty-seven. ^ He's still on the bridge."),
        ] },
      // When Chase reaches for the slate's play button -> cutscene 2.1_dont
      { id: 'h21_play', at: 's21_slate_chase', r: 0.95, only: 'chase', verb: 'Play', when: (s) => !!s.flags.s21_slate && !s.flags.s21_play, flag: 's21_play',
        steps: [
          { face: 'chase', to: [-3.72, 0, -0.95], dur: 0.3 },
          { act: [['chase', 'tap', { dur: 0.8, loop: false }]] },
          { prop: 'slate_desk', fn: (o) => o.userData.screen('play') },
          { wait: 0.5 },
        ] },
      // A framed photo on the shelf (Chase)
      { id: 'h21_photo', at: 's21_photo_chase', r: 0.9, only: 'chase', flag: 's21_photo',
        steps: [
          { face: 'chase', to: [0.0, 0, -3.36], dur: 0.3 },
          { shot: 'INSERT', at: 's21_photo', card: ['s21_photo', {}] },
          { wait: 1.4 },
          say('chase', 'Redcliffe Festival. 2031.'),
        ] },
      // Kettle (save): this kettle doesn't talk
      { id: 'h21_kettle', at: 's21_kettle', r: 0.95, verb: 'Use', kettle: true,
        steps: [{ if: (s) => s.active === 'chase' && !s.flags.s21_kettle_line, then: [{ wait: 0.6 }, say('chase', 'Normal kettle. ^ Weird.'), { flag: 's21_kettle_line' }] }] },
      // A box of Christmas decorations under the bed (Luka)
      { id: 'h21_box', at: 's21_box_luka', r: 1.0, only: 'luka', verb: 'Search', when: (s) => !!s.flags.s21_plan, once: true, flag: 's21_box',
        steps: [
          { face: 'luka', to: [-1.7, 0, -5.4], dur: 0.3 },
          { act: [['luka', 'kneel']] },
          { wait: 0.4 },
          { prop: 'deco_box', fn: (o) => o.userData.state('out') },
          { sfx: 'bin_scrape', vol: 0.35 },
          { wait: 0.7 },
          { prop: 'deco_box', fn: (o) => o.userData.state('open') },
          { sfx: 'cloth_swish', vol: 0.3 },
          BOX,
          { wait: 2.2 },
        ] },
    ],
    steps: [
      ['cutscene', '2.1_dawn'],
      ['control', 'chase'],
      ['objective', 'Look around (quietly).'],
      ['roam', {
        until: 's21_play',
        hint: { after: 100, steps: [{ shot: 'INSERT', at: 's21_slate' }, { wait: 1.8 }] },   // a look at the slate on the desk
        async auto(c) {
          const T = (id) => c.hotspots.trigger(id);
          for (const id of ['h21_photo', 'h21_kettle', 'h21_slate', 'h21_play']) await T(id);
        },
      }],
      ['objective', null],
      ['cutscene', '2.1_dont'],
      ['cutscene', '2.1_balcony'],
      ['cutscene', '2.1_plan'],
      ['control', 'luka'],
      ['objective', 'Find Luka a disguise.'],
      ['roam', {
        until: 's21_box',
        hint: { after: 90, steps: [BOX, { wait: 1.6 }] },   // the box under the bed
        async auto(c) {
          if (c.state.active !== 'luka') console.error('TWO 2.1: the box is Luka\'s');
          await c.hotspots.trigger('h21_kettle');
          await c.runSteps([{ move: 'luka', to: [-0.95, 0, -2.9] }, { move: 'luka', to: [-0.95, 0, -4.2] }, { move: 'luka', to: 's21_box_luka' }]);
          await c.hotspots.trigger('h21_box');
        },
      }],
      ['objective', null],
      ['cutscene', '2.1_santa'],
    ],
    grants: { flags: { santa: true, s21_done: true }, items: ['santa'], quiet: '31:06:00', noService: false },
  };

  // the slate's list scrolls (two_v1 … two_v1204_dont … two_v2847): a card repaint loop, ends on skip
  function slateScroll(c) {
    if (sk(c)) return;
    return (async () => {
      const n = 18;
      for (let i = 0; i <= n && !c.flow.skipping; i++) { c.ui.card('s21_slate', { mode: 'list', scroll: i / n }); if (i % 3 === 0) c.sfx('tick', { vol: 0.12 }); await c.wait(i < 3 ? 0.22 : 0.12); }
      if (!c.flow.skipping) c.ui.card('s21_slate', { mode: 'list', scroll: 1, fast: false });
    })();
  }

  // Cutscene — dawn.
  CUTSCENES['2.1_dawn'] = [
    { do: (c) => nextTick().then(() => open21(c)) },
    { fade: 'out', dur: 0 },
    // [WIDE · from inside, through the balcony door] Pink-grey dawn over the bay. Storm clouds sit far out on the
    // horizon. On the balcony, Luka is polishing the railing with a tea towel. Slowly. Thoroughly. He hasn't slept.
    DAWN_WIDE,
    { fade: 'in', dur: 1.4 },
    { sfx: 'cloth_swish', vol: 0.12 },
    { wait: 1.6 },
    { sfx: 'cloth_swish', vol: 0.1 },
    { wait: 2.2 },
    // [CLOSE · Chase on the couch] He wakes, sees Luka through the glass, and watches him for a while.
    { do: (c) => lyingLens(c, 'close') },
    { wait: 1.6 },
    { expr: [['chase', 'tired']] },
    { wait: 1.0 },
    { do: (c) => { const a = act(c, 'chase'); if (a && !sk(c)) a.play('glance', { yaw: 0.35, dur: 5 }); } },
    { wait: 1.4 },
    { do: (c) => lyingLens(c, 'ots') },
    { wait: 3.4 },
    // Control to Chase: up off the couch (under the cut to the room)
    { do: (c) => { const a = act(c, 'chase'); if (SETS.flat.lie) SETS.flat.lie(false); if (a) { a.place(COUCH); a.play('sit', { h: 0.42 }); a.rig.seated = true; a.setExpr('tired'); } } },
    ROOM,
    { wait: 0.6 },
    { act: [['chase', 'stand', { h: 0.42, dur: 1 }]] },
    { wait: 1.0 },
    unseat('chase'),
    { move: 'chase', to: STAND },
  ];
  // Chase lying on the couch, head on the east arm, feet to the west: 'close' = his face from the balcony side, a little
  // above; 'ots' = from past his head (over the arm), the glass and Luka polishing beyond. Computed from his eyes.
  function lyingLens(c, kind) {
    if (sk(c)) return;
    const a = act(c, 'chase'); if (!a) return;
    a.eyePos(V1);
    if (kind === 'close') c.cam.shot(glideCam([V1.x - 0.42, V1.y + 0.5, V1.z + 0.78], [V1.x - 0.2, V1.y - 0.04, V1.z], 38, { pos: [V1.x - 0.38, V1.y + 0.45, V1.z + 0.66], look: [V1.x - 0.2, V1.y - 0.03, V1.z], fov: 36 }, 7));
    else c.cam.shot(glideCam([V1.x + 0.42, V1.y + 0.42, V1.z - 0.3], [-2.75, 1.0, 1.25], 40, { pos: [V1.x + 0.38, V1.y + 0.4, V1.z - 0.22], look: [-2.75, 1.02, 1.25], fov: 37 }, 6));
  }

  // Cutscene — "2.1_dont."
  CUTSCENES['2.1_dont'] = [
    { do: (c) => {
      const ch = act(c, 'chase'), c4 = act(c, 'chase40');
      if (ch) { ch.place('s21_slate_chase'); ch.hold('slate_desk', 'R'); ch.play('reading_bare'); ch.setExpr('neutral'); }
      if (c4) { c4.rig.seated = false; c4.place('s21_door_c40'); c4.play('idle'); c4.setExpr('neutral'); }
      if (SETS.flat.lie) SETS.flat.lie(false);
      if (SETS.flat.snore) SETS.flat.snore(false);
      const bd = P(c, 'bedroom_door'); if (bd) bd.userData.open(1.4);
    } },
    { sfx: 'creak', vol: 0.3 },
    // [MID · the bedroom doorway] Chase (2040), awake, in a T-shirt, hair everywhere.
    DOOR_MID,
    { wait: 1.0 },
    say('chase40', "Don't."),
    { face: 'chase', to: 'chase40', dur: 0.5 },
    { do: (c) => { const a = act(c, 'chase'); if (a) a.play('idle'); } },
    CLOSE('chase', { yaw: -0.45, dist: 1.0, fov: 36, push: 0.1, dur: 6 }),
    say('chase', "It's my song."),
    CLOSE('chase40', { yaw: 0.4, dist: 1.0, fov: 36, push: 0.1, dur: 6 }),
    say('chase40', "It's MY song."),
    CLOSE('chase', { yaw: -0.45, dist: 0.95, fov: 36, push: 0.1, dur: 6 }),
    say('chase', "It's literally the same song."),
    CLOSE('chase40', { yaw: 0.4, dist: 0.95, fov: 36, push: 0.1, dur: 6 }),
    say('chase40', "It's not ready."),
    CLOSE('chase', { yaw: -0.45, dist: 0.92, fov: 36, push: 0.1, dur: 6 }),
    say('chase', "It's been fourteen years."),
    CLOSE('chase40', { yaw: 0.4, dist: 0.92, fov: 36, push: 0.1, dur: 6 }),
    say('chase40', 'It had to be good.'),
    CLOSE('chase', { yaw: -0.45, dist: 0.88, fov: 36, push: 0.1, dur: 6 }),
    { expr: [['chase', 'worried']] },
    say('chase', 'Good enough for WHAT?'),
    // [CLOSE · Chase (2040)] He looks past Chase, through the glass, at Luka on the balcony polishing the rail.
    { face: 'chase40', to: -0.34, dur: 0.9 },
    { expr: [['chase40', 'sad']] },
    CLOSE('chase40', { yaw: 0.75, dist: 0.9, fov: 34, push: 0.1, dur: 8 }),
    { wait: 1.6 },
    slow('chase40', '…For him.'),
    // (Chase follows his look. He understands. He puts the slate down.)
    { face: 'chase', to: 0.17, dur: 0.8 },
    LUKA_OTS,
    { wait: 2.2 },
    { expr: [['chase', 'sad']] },
    { do: (c) => { const a = act(c, 'chase'); if (a) a.hold(null); const sl = P(c, 'slate_desk'); if (sl) sl.userData.screen('off'); } },
    { sfx: 'tick', vol: 0.15 },
    { wait: 0.6 },
    // [INSERT] Chase (2040)'s right hand on the doorframe: the burn scars.
    { face: 'chase40', to: -0.65, dur: 0 },
    { act: [['chase40', 's21_frame']] },
    HAND,
    { wait: 2.6 },
    { face: 'chase', to: 'chase40', dur: 0.5 },
    CLOSE('chase', { yaw: -0.4, dist: 0.95, fov: 36, push: 0.08, dur: 6 }),
    say('chase', 'What happened to your hand?'),
    CLOSE('chase40', { yaw: 0.35, dist: 0.95, fov: 36, push: 0.1, dur: 10 }),
    slow('chase40', "Pulled a server out of a fire. ^ It's why I stopped playing."),
    CLOSE('chase', { yaw: -0.4, dist: 0.9, fov: 36, push: 0.08, dur: 6 }),
    say('chase', 'Is it?'),
    // CHASE (2040): (a long beat) "…No."
    CLOSE('chase40', { yaw: 0.3, dist: 0.95, fov: 34, push: 0.16, dur: 8 }),
    { wait: 2.4 },
    slow('chase40', '…No.'),
    { wait: 1.0 },
    { fade: 'out', dur: 0.8 },
  ];

  // Cutscene — "2.1_balcony." Chase goes out with two teas. One locked two-shot, side-on, the bay behind them, the
  // railing between them and the drop. Luka keeps polishing for the first few lines.
  CUTSCENES['2.1_balcony'] = [
    { do: (c) => {
      const ch = act(c, 'chase'), l = act(c, 'luka'), c4 = act(c, 'chase40');
      const bd = P(c, 'balcony_door'); if (bd) bd.userData.open(1);
      if (c4) c4.place([-0.2, 0, -5.2, PI]);                       // gone back to the bedroom
      if (l) { l.place([-3.0, 0, 1.18, 1.05]); l.hold('tea_towel', 'R'); l.play('polish'); l.setExpr('tired'); }
      const t = P(c, 'teas'); if (t) t.userData.state('bench');
      if (ch) { ch.place([-1.75, 0, -1.2, 0.2]); ch.play('idle'); ch.hold('teas', 'R'); ch.play('carry_mug'); ch.setExpr('neutral'); }
    } },
    { env: BAL_LIGHT, dur: 0 },
    BAL_LOCKED,
    { fade: 'in', dur: 0.8 },
    { move: 'chase', to: 's21_bal_chase' },
    { do: (c) => { const a = act(c, 'chase'), t = P(c, 'teas'); if (a) { a.hold(null); a.play('idle'); } if (t) t.userData.state('rail'); } },
    { sfx: 'tick', vol: 0.15 },
    { wait: 0.6 },
    say('chase', 'Did you sleep?'),
    glance('luka', 'chase', 0.9), { wait: 0.4 },
    say('luka', 'Bit. You?'),
    say('chase', 'Bit.'),
    // (Neither of them did.)
    { wait: 1.2 },
    glance('luka', 'chase', 0.9), { wait: 0.4 },
    say('luka', 'I keep doing the maths.'),
    say('chase', 'What maths?'),
    say('luka', "Yesterday I said 'just say yes', and a man exploded out of a display I'd polished for two hours."),
    say('chase', "That's on him."),
    say('luka', "I said 'go left', and you got zapped."),
    say('chase', 'It was a little bit of smoke.'),
    say('luka', 'And then he told me I go back into a fire, and you end up with that hand.'),
    { expr: [['chase', 'worried']] },
    say('chase', "That's not—"),
    slow('luka', "Every version where I'm the one making the call, someone I care about gets hurt."),
    { face: 'chase', to: 'luka', dur: 0.4 },
    slow('chase', "Mate. ^ That's just what being the one who makes the call is."),
    glance('luka', 'chase', 1.0), { wait: 0.5 },
    { expr: [['luka', 'sad']] },
    slow('luka', "Then maybe I shouldn't be the one."),
    // (He stops polishing. Looks at the tea towel in his hand like he's only just noticed it.)
    { face: 'luka', to: 1.25, dur: 0.8 },
    { act: [['luka', 'reading_bare']] },
    { expr: [['luka', 'still']] },
    { wait: 2.2 },
    say('chase', "You're polishing a balcony."),
    say('luka', 'It was dirty.'),
    { expr: [['chase', 'fond']] },
    say('chase', "It's a balcony."),
    { wait: 1.4 },
    { fade: 'out', dur: 1.0 },
  ];

  // Cutscene — "2.1_plan." Toast at the small table, in Rue's tradition. Chase (2040) lays it out with sticky notes on
  // the table, one per step.
  const PLAN_LINE = 'Three things. ^ One: get off the peninsula. There\'s a lockdown on the bridge since yesterday, because of us. ^ Two: get to the Valley by tomorrow morning. ^ Three: get into HQ without him seeing.';
  const planNotes = (n) => ({ do: (c) => { const p = P(c, 'plan_notes'); if (p) p.userData.show(n); if (n && !sk(c)) c.sfx('tick', { vol: 0.2 }); } });
  CUTSCENES['2.1_plan'] = [
    { do: (c) => {
      c.state.flags.s21_plan = true;
      if (SETS.flat && SETS.flat.dress) SETS.flat.dress('morning21');
      const pn = P(c, 'plan_notes'); if (pn) pn.userData.show(0);
      const l = act(c, 'luka'), ch = act(c, 'chase'), c4 = act(c, 'chase40');
      if (l) { l.hold(null); l.place('s21_plan_luka'); l.play('sit', { h: 0.46 }); l.rig.seated = true; l.setExpr('tired'); }
      if (ch) { ch.place('s21_plan_chase'); ch.play('sit', { h: 0.5 }); ch.rig.seated = true; ch.setExpr('neutral'); }
      if (c4) { c4.place('s21_plan_c40'); c4.play('sit', { h: 0.46 }); c4.rig.seated = true; c4.setExpr('neutral'); }
      const bd = P(c, 'bedroom_door'); if (bd) bd.userData.open(1.4);
      const bx = P(c, 'deco_box'); if (bx) bx.userData.state('under');
    } },
    { env: 'morning', dur: 0 },
    { music: 'pads', fade: 4 },
    PLAN_WIDE,
    { fade: 'in', dur: 1.2 },
    { wait: 1.4 },
    CLOSE('chase40', { yaw: 0.3, dist: 1.1, fov: 38, push: 0.12, dur: 12, dy: 0 }),
    { act: [['chase40', 'write_note', { dur: 1.0, loop: false }]] },
    { par: [
      say('chase40', PLAN_LINE),
      { do: (c) => c.runSteps([
        onText(PLAN_LINE, 'One:', (c2) => planNotes(1).do(c2)),
        onText(PLAN_LINE, 'Two:', (c2) => planNotes(2).do(c2)),
        onText(PLAN_LINE, 'Three:', (c2) => planNotes(3).do(c2)),
      ]) },
    ] },
    planNotes(3),
    // the three notes on the table
    Object.assign({ card: ['s21_plan', { n: 3 }] }, PLAN_TOP),
    { wait: 2.6 },
    CLOSE('luka', { yaw: 0.35, dist: 1.0, fov: 36, push: 0.1, dur: 6, dy: 0 }),
    glance('luka', 'chase', 0.9), { wait: 0.4 },
    say('luka', 'Is there a way?'),
    CLOSE('chase40', { yaw: 0.3, dist: 1.05, fov: 36, push: 0.12, dur: 10, dy: 0 }),
    say('chase40', "There's a phone. The oldest working line in the country. It's from 1987. JARVIS can't touch it. He can't touch it."),
    CLOSE('chase', { yaw: 0.0, dist: 1.0, fov: 36, push: 0.08, dur: 6, dy: 0 }),
    say('chase', "…Rue's phone."),
    CLOSE('chase40', { yaw: 0.3, dist: 1.0, fov: 36, push: 0.08, dur: 6, dy: 0 }),
    say('chase40', "Rue's phone."),
    CLOSE('chase', { yaw: 0.0, dist: 0.95, fov: 36, push: 0.08, dur: 6, dy: 0 }),
    say('chase', 'So we ask Rue.'),
    CLOSE('chase40', { yaw: 0.3, dist: 0.95, fov: 36, push: 0.1, dur: 6, dy: 0 }),
    { wait: 0.6 },
    say('chase40', '…You ask Rue.'),
    CLOSE('chase', { yaw: 0.0, dist: 0.95, fov: 36, push: 0.08, dur: 6, dy: 0 }),
    say('chase', 'Why us?'),
    CLOSE('chase40', { yaw: 0.3, dist: 0.9, fov: 36, push: 0.1, dur: 6, dy: 0 }),
    { expr: [['chase40', 'sad']] },
    slow('chase40', "Because I haven't rung him in six years."),
    { wait: 0.6 },
    PLAN_WIDE,
    glance('luka', 'chase', 0.9), { wait: 0.4 },
    say('luka', 'And me? People here knew me.'),
    { expr: [['chase40', 'neutral']] },
    CLOSE('chase40', { yaw: 0.3, dist: 1.0, fov: 36, push: 0.1, dur: 6, dy: 0 }),
    say('chase40', 'You need a disguise.'),
    { wait: 0.4 },
    // Control to Luka (up from the table, under a short dip to the kitchen's own angle)
    { fade: 'out', dur: 0.35 },
    { shot: 'CAM', pos: [-0.6, 2.35, -0.3], look: [1.6, 0.9, -1.9], fov: 58 },
    unseat('luka'), unseat('chase'), unseat('chase40'),
    { place: 'luka', at: [1.15, 0, -1.75, -2.5] }, { place: 'chase', at: [2.2, 0, -2.3, 0] }, { place: 'chase40', at: [3.05, 0, -1.6, -1.2] },
    { fade: 'in', dur: 0.5 },
  ];

  // Luka puts on the hat and the beard, over his real beard. [MID · Luka turns round]
  CUTSCENES['2.1_santa'] = [
    { do: (c) => {
      const kit = P(c, 'santa_kit'); if (kit) kit.visible = false;
      const l = act(c, 'luka'); if (l) { l.place('s21_box_luka'); l.play('idle'); l.rig.show('santa'); }
      const ch = act(c, 'chase'), c4 = act(c, 'chase40');
      if (ch) { ch.place('s21_watch_chase'); ch.play('idle'); ch.setExpr('neutral'); }
      if (c4) { c4.place('s21_watch_c40'); c4.play('arms_crossed'); c4.setExpr('neutral'); }
    } },
    { flag: 'santa' },
    { item: 'santa' },
    { sfx: 'cloth_swish', vol: 0.35 },
    { face: 'luka', to: 0.34, dur: 0.9 },
    { place: 'luka', at: 's21_turn_luka' },
    SANTA_MID,
    { wait: 1.6 },
    CLOSE('chase', { yaw: 0.1, dist: 1.0, fov: 36, push: 0.08, dur: 6 }),
    { expr: [['chase', 'stunned']] },
    say('chase', "You've got a beard over your beard."),
    SANTA_MID,
    glance('luka', 'chase', 0.8), { wait: 0.3 },
    say('luka', "It's a disguise."),
    CLOSE('chase40', { yaw: 0.2, dist: 1.1, fov: 36, push: 0.1, dur: 7 }),
    say('chase40', "It's Christmas. ^ Nobody looks at Santa."),
    { flag: 's21_done' },
    { wait: 0.8 },
    { fade: 'out', dur: 1.0 },
  ];

  // =================================================================== 2.2 — "Bee Gees Way"
  // Region P of SETS.parade: the lane x 6..11 runs -Z from the Parade (z -7) to the statues (z -33.9); the piano at
  // (8.3, -20) with its keys on the +X face and the limiter on its +Z end; the exit pocket x 11..14, z -35..-31.
  const S22_FLAGS = ['s22_code', 's22_plate', 's22_green', 's22_played', 's22_sneak', 's22_out'];
  const DRONE = 'd22';
  const DRONE_HOME = [10.0, 0, -31.0];
  // where the drone hangs (the set's s22_drone_piano): just past the piano's south end, clear of the bench lenses
  const PIANO_TOP = ((m) => (m ? [m[0], m[1], m[2]] : [8.35, 1.9, -21.6]))(SETS.parade && SETS.parade.marks && SETS.parade.marks.s22_drone_piano);
  const POCKET = [11.1, -35.2, 14.3, -30.8];
  const inBox = (b, x, z) => x >= b[0] && x <= b[2] && z >= b[1] && z <= b[3];
  const TAG = new THREE.Vector3(8.3, 1.55, -19.1);
  const S22 = { phase: '', guardT: 0, upd: null, listening: false, handle: null };
  // from the Parade footpath, all three from behind as they walk in, the statues at the far end
  const LANE_TRACK = glideCam([8.5, 2.0, 0.2], [8.5, 1.35, -14.0], 42, { pos: [8.5, 1.85, -4.6], look: [8.5, 1.35, -30.0], fov: 40 }, 6.5, 'linear');
  const STATUES = glideCam([8.5, 1.7, -23.5], [8.5, 1.45, -33.8], 34, { pos: [8.5, 1.65, -25.2], look: [8.5, 1.5, -33.8], fov: 32 }, 7);
  const DRONE_END = glideCam([8.4, 1.55, -25.8], [10.0, 1.9, -31.0], 38, { pos: [8.6, 1.6, -26.6], look: [10.0, 1.9, -31.0], fov: 36 }, 5);
  const PLATE_LENS = { shot: 'CAM', pos: [9.75, 1.45, -16.9], look: [8.25, 0.85, -19.0], fov: 46 };   // Luka heaving the brass plate up
  const KEYPAD = { shot: 'CAM', pos: [8.36, 1.1, -18.66], look: [8.37, 0.88, -19.12], fov: 32 };
  const AR_TAG = glideCam([7.2, 1.62, -16.9], [8.3, 1.5, -19.1], 38, { pos: [7.45, 1.6, -17.4], look: [8.3, 1.5, -19.1], fov: 34 }, 3);
  const LANE_BAY = glideCam([9.75, 1.32, -19.25], [-45.0, 6.0, 380], 19, { pos: [9.75, 1.32, -19.15], look: [-45.0, 6.0, 380], fov: 17 }, 7);   // the bridge between the lamp and the palm
  // from the lane's end (in front of the statues), up the lane to the piano; then panning with Chase into the pocket
  const EXIT_WIDE = { shot: 'CAM', pos: [7.5, 2.3, -32.5], look: [8.7, 1.0, -20.5], fov: 40 };
  const EXIT_PAN = { shot: 'CAM', pos: [7.5, 2.3, -32.5], look: [8.0, 1.0, -24.5], fov: 44, to: { pos: [7.6, 2.2, -32.6], look: [12.2, 1.0, -32.6], fov: 50 }, dur: 3.6, ease: 'linear' };

  function reset22(c) { for (const f of S22_FLAGS) delete c.state.flags[f]; }
  function duties22() {
    objective.list([
      { text: 'Piano (optional)', done: state.samples.includes('piano') },
      { text: 'Cicadas (optional)', done: state.samples.includes('cicadas') },
    ]);
  }
  // 07:30: the lane, the drone at the far end facing in; limiter locked, plate bolted, bollards down
  function open22(c) {
    reset22(c);
    if (SETS.parade && SETS.parade.dress && c.world.setId === 'parade') SETS.parade.dress('lane22');
    const led = P(c, 'limiter_light'); if (led) led.userData.set('red');
    const pl = P(c, 'limiter_plate'); if (pl) { pl.userData.prop(false); pl.userData.lift(0); }
    const bo = P(c, 'lane_bollards'); if (bo) bo.userData.up(false);
    if (typeof MINIGAMES.piano.stop === 'function') MINIGAMES.piano.stop();
    AR.clear();
    for (const a of (SETS.parade && SETS.parade.ar) || []) AR.add(a);
    DRONES.clear();
    DRONES.spawn(DRONE, { at: DRONE_HOME, face: 0, hover: 1.9, cone: { len: 6.2, half: 0.5 }, sweep: 38, sweepPeriod: 6 });
    S22.phase = 'lane'; S22.guardT = 0; S22.handle = null;
    watch22();
    listen22();
  }
  // one updater for the scene: the drone guards its post up close (anyone within 2.4 m of it is noticed), and Chase
  // (2040)'s Chip View reads the tag when he's near it with it on screen. Allocation-free; removes itself on scene change.
  function watch22() {
    if (S22.upd) return;
    const f = (dt) => {
      if (flow.sceneId !== '2.2') { removeUpdate(f); S22.upd = null; return; }
      if (flow.skipping || !flow.roaming || flow.busy) return;
      const d = DRONES.get(DRONE);
      if (S22.phase === 'lane' && d && stealth.active && (S22.guardT -= dt) <= 0) {
        const ids = PARTY22;
        for (let i = 0; i < 3; i++) {
          const a = world.actor(ids[i]);
          if (a && Math.hypot(a.pos.x - d.x, a.pos.z - d.z) < 2.4 && (d.st === 'patrol')) { DRONES.alert(a.id); S22.guardT = 2.5; break; }
        }
      }
      if (S22.phase === 'lane' && !state.flags.s22_code && chip.on && state.active === 'chase40') {
        const a = world.actor('chase40');
        if (a && Math.hypot(a.pos.x - TAG.x, a.pos.z - TAG.z) < 4.6) {
          const p = cam.project(TAG);
          if (p.visible) { state.flags.s22_code = true; hotspots.trigger('h22_code'); }
        }
      }
    };
    S22.upd = f; addUpdate(f);
  }
  const PARTY22 = ['luka', 'chase', 'chase40'];
  // if Chase stops too early, the drone turns back
  function listen22() {
    if (S22.listening) return;
    S22.listening = true;
    on('piano:stop', (reason) => {
      if (flow.sceneId !== '2.2' || S22.phase !== 'sneak' || state.flags.s22_out) return;
      testLog('2.2 piano stopped (' + reason + '): the drone turns back');
      DRONES.release(DRONE);
    });
    on('sample:add', () => { if (flow.sceneId === '2.2' && (flow.roaming || flow.busy) && !flow.cutscene) duties22(); });
  }
  function stealthLane() {
    stealth.begin({
      escortAfter: 1.6, forgetAfter: 1.8,
      checkpoints: [{ id: 'lane', box: [1.4, -36, 14.5, -2], at: { luka: [7.6, 0, -10.6, PI], chase: [9.3, 0, -11.0, PI], chase40: [8.5, 0, -9.8, PI] } }],
    });
  }
  // Chase on the stool (the sneak's anchor): seated at the keys
  function seatChase(c) {
    const a = act(c, 'chase'); if (!a) return;
    a.place('s22_piano_chase'); a.play('sit', { h: 0.48 }); a.rig.seated = true;
  }
  // the drone over the piano, transfixed: its cone collapses onto the lid while the piano plays
  // the drone hovers over the piano's south end, held there facing Chase at the keys (amber, its cone across the bench):
  // a drone held 'idle' by DRONES.face doesn't scan, so the others can slip past behind it along the west wall. If the
  // piano stops, it is released and turns back to its post (and scans on the way). (A lure would do, but its cone's
  // collapse sweeps a wide, short fan for ~0.4 s that catches anyone crouched right beside the piano.)
  const CHASE_SEAT = [9.45, 0, -20.3];
  function droneOnPiano(c) {
    const d = DRONES.get(DRONE); if (!d) return;
    const hold = () => { if (flow.sceneId !== '2.2') return; DRONES.face(DRONE, CHASE_SEAT); DRONES.light(DRONE, 'curious'); };
    if (Math.hypot(d.x - PIANO_TOP[0], d.z - PIANO_TOP[2]) > 0.3) DRONES.goTo(DRONE, [PIANO_TOP[0], 0, PIANO_TOP[2]], { speed: 200 }).then(hold);
    else hold();
  }
  // the sneak: Chase plays on (verse + chorus, round and round) while the others slip past along the west wall
  function sneakOn(c) {
    seatChase(c);
    if (!sk(c) && MINIGAMES.piano.play) S22.handle = MINIGAMES.piano.play({ from: 0, loop: [0, 16], player: 'chase', stopOnMove: true, loudness: MINIGAMES.piano.loudness || 0.8 });
    droneOnPiano(c);
  }
  function sneakSetup(c) {
    S22.phase = 'sneak';
    c.state.flags.s22_sneak = true;
    const l = act(c, 'luka'), c4 = act(c, 'chase40');
    if (l) { l.rig.seated = false; l.place(LUKA_HIDE); l.play('idle'); }
    if (c4) { c4.rig.seated = false; c4.place(SNEAK_C40); c4.play('idle'); }
    sneakOn(c);
    // (stealth is already off since the piano: stealth.end() would calm the lured drone back to its post)
    stealth.begin({
      targets: ['luka', 'chase40'], escortAfter: 1.4, forgetAfter: 1.8,
      checkpoints: [{ id: 'sneak', box: [1.4, -36, 15, -2], at: { luka: LUKA_HIDE, chase40: SNEAK_C40, chase: 's22_piano_chase' } }],
      onRetry: () => sneakOn(c),
    });
  }
  const SNEAK_C40 = [6.55, 0, -20.9, PI];        // behind the piano with Luka: the lured drone's cone faces up the lane
  const inPocket = (id) => { const a = world.actor(id); return !!a && inBox(POCKET, a.pos.x, a.pos.z); };

  // Public Piano: Chase sits and plays the first phrase of "two" (the mini-game), then plays on into the cutscene
  async function playPiano(c) {
    stealth.end();
    S22.phase = 'piano';
    c.flow.setFollow(null);   // the others step back to watch
    await c.runSteps([
      { move: 'luka', to: [7.3, 0, -16.9, 2.6], nowait: true }, { move: 'chase40', to: 's22_c40_edge', nowait: true },
      { move: 'chase', to: 's22_piano_chase' }, { face: 'chase', to: -H, dur: 0.2 },
    ]);
    seatChase(c);
    c.music(null, { fade: 0.6 });
    const r = await c.flow.minigame('piano', { continue: true, drone: DRONE, droneTo: [PIANO_TOP[0], 0, PIANO_TOP[2]] });
    S22.handle = (r && r.handle) || MINIGAMES.piano.handle || null;
  }

  SCENES['2.2'] = {
    title: 'Bee Gees Way', set: 'parade', env: 'morning', time: '07:30', place: 'Bee Gees Way, Redcliffe',
    playable: ['luka', 'chase', 'chase40'], swap: false, music: null,
    hud: { noService: false, quiet: '28:28:00', samples: true, bars: null },
    spawn: { luka: 's22_enter_luka', chase: 's22_enter_chase', chase40: 's22_enter_c40' },
    hotspots: [
      // the limiter: the SafeSense box on the piano (anyone): MAX 40 dB, locked
      { id: 'h22_limiter', at: [8.3, 0, -18.5], r: 1.0, when: (s) => !s.flags.s22_green,
        steps: [
          { shot: 'INSERT', at: 's22_limiter', card: ['s22_limiter', {}] },
          { do: (c) => { c.ui.card('s22_limiter', { up: !!c.state.flags.s22_plate }); } },
          { wait: 2.2 },
          { do: (c) => {
            if (sk(c)) return;
            const f = c.state.flags;
            if (!f.s22_code) c.ui.toast('Chase (2040)’s chip can read AR tags: hold CHIP.');
            else if (!f.s22_plate) c.ui.toast('The keypad is under the brass plate. Luka can lift it.');
          } },
        ] },
      // Chip View read (triggered by the watcher when Chase (2040) has it on near the box): SERVICE CODE 2032
      { id: 'h22_code', at: [8.3, 0, -19.1], r: 0.01, when: () => false, flag: 's22_code',
        steps: [
          { do: (c) => { if (!sk(c)) { AR.show(true); chip.show(true); } } },
          AR_TAG,
          { face: 'chase40', to: [8.3, 0, -19.1], dur: 0.4 },
          { wait: 1.6 },
          { do: (c) => { chip.show(false); AR.show(null); } },
          CLOSE('chase40', { yaw: 0.5, dist: 1.0, fov: 36, push: 0.08, dur: 5 }),
          say('chase40', "Olympics. Everything's 2032."),
        ] },
      // the brass plate: only Luka can lift it (strength)
      { id: 'h22_plate', at: 's22_plate_luka', r: 0.9, only: 'luka', verb: 'Lift', when: (s) => !s.flags.s22_plate,
        do: async (c) => {
          await c.runSteps([{ move: 'luka', to: 's22_plate_luka' }]);
          const pl = P(c, 'limiter_plate');
          if (!sk(c)) c.cam.shot(PLATE_LENS);
          const ok = await strengthHold({ who: 'luka', label: 'Lift', dur: 1.6, at: [8.3, 0, -19.2], anim: 'lift_strain',
            onProgress: (k) => { if (pl) pl.userData.lift(k); }, onFull: () => { if (pl) pl.userData.prop(true); } });
          if (!ok) { if (pl) pl.userData.lift(0); await c.cam.release(0.4); return; }   // let go: the plate drops back
          if (pl) pl.userData.prop(true);
          c.state.flags.s22_plate = true;
          c.sfx('clunk', { vol: 0.4 });
          await c.wait(0.6);
          await c.cam.release(0.6);
        } },
      // the keypad under the plate: whoever's active types 2032
      { id: 'h22_keypad', at: 's22_keypad', r: 0.85, verb: 'Type', when: (s) => !!s.flags.s22_plate && !s.flags.s22_green,
        do: async (c) => {
          await c.runSteps([{ move: c.state.active, to: 's22_keypad' }]);
          const kp = P(c, 'keypad');
          const r = await c.flow.minigame('keypad', { digits: 4, code: '2032', test: '2032', shot: KEYPAD, onKey: (d) => { if (kp) kp.userData.press(d); } });
          await c.cam.release(0.4);
          if (!r || !r.ok) return;   // walked away
          c.state.flags.s22_green = true;
          const led = P(c, 'limiter_light'); if (led) led.userData.set('green');
          await c.playCutscene([{ shot: 'INSERT', at: 's22_limiter', card: ['s22_limiter', { green: true, up: true }] }, { wait: 1.6 }], { letterbox: false });
        } },
      // the piano (Chase): play — or hold to record a chord (the Piano sample) once the limiter is off
      { id: 'h22_piano', at: [9.75, 0, -20.2], r: 1.0, only: 'chase', verb: 'Play', sample: 'piano', when: (s) => !!s.flags.s22_green && !s.flags.s22_played, flag: 's22_played',
        do: (c) => playPiano(c) },
      // the cicadas in the laneway palm (Chase records)
      { id: 'h22_cicadas', at: [9.2, 0, -24.4], r: 1.5, sample: 'cicadas', when: (s) => !s.samples.includes('cicadas') },
      // the sneak: Chase back on the stool if he stopped
      { id: 'h22_replay', at: [9.75, 0, -20.2], r: 1.0, only: 'chase', verb: 'Play', when: (s) => !!s.flags.s22_sneak && !s.flags.s22_out && !MINIGAMES.piano.playing,
        do: (c) => { sneakOn(c); } },
      // the café's tea urn: the save point
      { id: 'h22_urn', at: [3.2, 1.55, -7.05], r: 1.45, verb: 'Use', kettle: true },   // at: the urn's lid (the steam rises from it)
    ],
    steps: [
      ['cutscene', '2.2_lane'],
      ['control', 'luka'],
      ['follow', true],
      ['swap', true],
      ['objective', 'Get past the drone.'],
      ['do', () => { duties22(); stealthLane(); }],
      ['roam', {
        until: 's22_played',
        hint: { after: 150, steps: [{ do: (c) => { if (!c.state.flags.s22_code) c.ui.toast('Chase (2040)’s chip can read AR tags: hold CHIP.'); } }] },
        async auto(c) {
          const T = (id) => c.hotspots.trigger(id);
          const to = (id, where) => c.runSteps([{ move: id, to: where }]);
          await T('h22_urn');
          await T('h22_limiter');
          // Chase (2040): Chip View on, near the box, the tag on screen
          swapTo(c, 'chase40');
          await to('chase40', 's22_chip_c40');
          await chip.peek(1.2);
          if (!c.state.flags.s22_code) await T('h22_code');
          // Luka lifts the brass plate
          swapTo(c, 'luka');
          await T('h22_plate');
          if (!c.state.flags.s22_plate) console.error('TWO 2.2: the plate did not lift');
          await T('h22_keypad');
          if (!c.state.flags.s22_green) console.error('TWO 2.2: the limiter is still on');
          // Chase: the cicadas, then the piano
          swapTo(c, 'chase');
          await to('chase', [9.2, 0, -23.8]);
          await T('h22_cicadas');
          await T('h22_piano');
          if (!c.state.samples.includes('piano') || !c.state.samples.includes('cicadas')) console.error('TWO 2.2: samples not recorded: ' + c.state.samples.join(','));
        },
      }],
      ['cutscene', '2.2_piano'],
      ['control', 'luka'],
      ['follow', null],
      ['do', (c) => sneakSetup(c)],
      ['roam', {
        until: () => inPocket('luka') && inPocket('chase40'),
        hint: { after: 60, steps: [{ do: (c) => { c.ui.toast('Walk Luka and Chase (2040) past along the wall: SWAP to each.'); } }] },
        async auto(c) {
          const to = (id, where) => c.runSteps([{ move: id, to: where }]);
          swapTo(c, 'luka');
          for (const w of ['s22_sneak_2', 's22_sneak_3', 's22_exit']) await to('luka', w);
          swapTo(c, 'chase40');
          for (const w of ['s22_sneak_2', 's22_sneak_3', [12.4, 0, -33.6, H]]) await to('chase40', w);
          if (!(inPocket('luka') && inPocket('chase40'))) console.error('TWO 2.2: the sneak did not reach the exit');
        },
      }],
      ['objective', null],
      ['cutscene', '2.2_out'],
    ],
    grants: { flags: { s22_green: true, s22_played: true, s22_out: true }, samples: ['piano', 'cicadas'], quiet: '28:28:00', noService: false },
  };

  // Cutscene — "2.2_lane."
  CUTSCENES['2.2_lane'] = [
    { do: (c) => nextTick().then(() => open22(c)) },
    { fade: 'out', dur: 0 },
    // [TRACK · behind the three of them entering the lane] The statues at the end.
    LANE_TRACK,
    { fade: 'in', dur: 1.0 },
    { move: 'luka', to: 's22_stop_luka', nowait: true },
    { move: 'chase', to: 's22_stop_chase', nowait: true },
    { move: 'chase40', to: 's22_stop_c40' },
    { place: 'luka', at: 's22_stop_luka' }, { place: 'chase', at: 's22_stop_chase' },
    STATUES,
    { wait: 1.0 },
    say('chase', 'Who are they?'),
    CLOSE('chase40', { yaw: 0.35, dist: 1.1, fov: 36, push: 0.1, dur: 9 }),
    say('chase40', 'Three brothers. Started here. Sang at the speedway for coins.'),
    CLOSE('chase', { yaw: -0.4, dist: 1.0, fov: 36, push: 0.08, dur: 6 }),
    say('chase', 'And then?'),
    CLOSE('chase40', { yaw: 0.35, dist: 1.0, fov: 36, push: 0.1, dur: 8 }),
    say('chase40', 'And then they finished songs. ^ Hundreds of them.'),
    // DRONE (at the end of the lane)
    DRONE_END,
    { do: (c) => { DRONES.light(DRONE, 'curious'); } },
    { sfx: 'drone_ok', vol: 0.5, at: [10.0, 1.9, -31.0] },
    { wait: 0.5 },
    say('drone', 'Good morning! This lane is closed for your safety.'),
    { do: (c) => { DRONES.light(DRONE, 'patrol'); } },
    { wait: 0.4 },
  ];

  // Cutscene — "2.2_piano" (triggers when Chase first finishes the phrase, before the sneak; the drone is still
  // drifting toward the piano).
  // The bench is east of the keys (both Chases face -X): faces read from the front corners of the bench, low, past the
  // piano's ends (the lid is 1.34 m high: seated heads sit just under it from anywhere behind the piano).
  // faces from over the piano's lid (body x 8.0..8.6, lid 1.3 m): the keys' point of view, the lens just above the lid
  const CH_FACE = glideCam([8.42, 1.52, -20.08], [9.4, 1.1, -20.3], 36, { pos: [8.5, 1.5, -20.12], look: [9.4, 1.1, -20.3], fov: 34 }, 8);
  const C40_FACE = glideCam([8.42, 1.52, -19.82], [9.4, 1.1, -19.6], 36, { pos: [8.5, 1.5, -19.78], look: [9.4, 1.1, -19.6], fov: 34 }, 8);
  // turned to each other along the bench: from over the lid's far corner, so the one turned toward it is near frontal
  const TURN_CH = glideCam([8.42, 1.56, -19.32], [9.4, 1.1, -20.3], 36, { pos: [8.5, 1.55, -19.4], look: [9.4, 1.1, -20.3], fov: 35 }, 7);
  const TURN_C40 = glideCam([8.42, 1.56, -20.58], [9.4, 1.1, -19.6], 36, { pos: [8.5, 1.55, -20.5], look: [9.4, 1.1, -19.6], fov: 35 }, 7);
  const MIRROR = glideCam([11.45, 1.5, -19.95], [9.3, 1.0, -19.95], 40, { pos: [11.2, 1.48, -19.95], look: [9.3, 1.0, -19.95], fov: 39 }, 10);   // from behind: the same slumped backs
  // over the lid: both faces side by side, the same posture (the set's s22_piano_cam sits higher and wider: the faces read small)
  const BOTH_FRONT = glideCam([7.85, 1.92, -19.95], [9.45, 1.15, -19.95], 36, { pos: [7.95, 1.82, -19.95], look: [9.45, 1.12, -19.95], fov: 34 }, 8);
  const LUKA_HIDE = [7.0, 0, -21.5, 1.02];        // crouched behind the piano's south end, facing the bench
  const PIANO_SHOTS = [   // [bar, shot]: cut on the music (Chase's playing-on runs 6x under autoplay)
    [4, glideCam([10.45, 1.75, -20.95], [8.6, 0.98, -20.05], 40, { pos: [10.2, 1.65, -20.7], look: [8.6, 0.98, -20.05], fov: 38 }, 9)],                 // over his shoulder at the keys
    [7, glideCam([7.1, 0.62, -27.6], [9.2, 1.75, -20.2], 44, { pos: [7.15, 0.62, -27.2], look: [9.0, 1.85, -20.6], fov: 42 }, 9)],                      // low: the drone drifting up the lane toward him
    [10, glideCam([7.85, 1.3, -20.92], [7.0, 1.15, -21.5], 42, { pos: [7.78, 1.28, -20.97], look: [7.0, 1.15, -21.5], fov: 40 }, 8)],                   // Luka crouched behind the piano, listening
    [12, { shot: 'CAM', pos: [11.0, 0.9, -25.0], look: [9.0, 1.1, -19.0], fov: 46, to: { pos: [10.6, 4.6, -26.5], look: [8.6, 1.0, -19.0], fov: 50 }, dur: 9, ease: 'linear' }],   // crane up: the lane, the festoon
    [16, glideCam([8.42, 1.54, -20.08], [9.4, 1.24, -20.3], 36, { pos: [8.5, 1.52, -20.12], look: [9.4, 1.24, -20.3], fov: 34 }, 8)],                                                                                                                                       // verse 2: his face
    [19, glideCam([9.95, 0.75, -18.9], [8.35, 1.95, -21.6], 46, { pos: [10.05, 0.72, -19.1], look: [8.35, 1.95, -21.6], fov: 44 }, 7)],                // the drone at the piano, amber
    [21, glideCam([5.9, 1.75, -14.3], [8.6, 1.2, -19.8], 40, { pos: [6.15, 1.72, -14.7], look: [8.6, 1.2, -19.8], fov: 38 }, 8)],                    // over Chase (2040)'s shoulder: Chase small at the piano
    [23, glideCam([8.5, 1.52, -20.15], [9.4, 1.24, -20.3], 31, { pos: [8.56, 1.5, -20.17], look: [9.4, 1.24, -20.3], fov: 29 }, 6)],                    // close: the last bars of verse 2
  ];
  function pianoMontage(c) {
    if (sk(c)) return;
    return (async () => {
      const h = S22.handle || MINIGAMES.piano.handle;
      const live = () => !!h && h.playing && !c.flow.skipping;
      for (const [b, s] of PIANO_SHOTS) {
        if (!live()) break;
        await waitUntil(() => !live() || h.bar >= b);
        if (!live()) break;
        c.cam.shot(s);
      }
      if (h) await waitUntil(() => c.flow.skipping || !h.playing);
    })();
  }
  const look = (id, yaw, dur = 9) => ({ do: (c) => { const a = act(c, id); if (a && !sk(c)) a.play('glance', { yaw, dur, loop: false }); } });
  CUTSCENES['2.2_piano'] = [
    // under the first cut: Luka crouched behind the piano, Chase (2040) at the edge of the lane
    { do: (c) => {
      const l = act(c, 'luka'), c4 = act(c, 'chase40');
      if (l) { l.rig.seated = false; l.place(LUKA_HIDE); l.play('kneel'); l.setExpr('stunned'); }
      if (c4) { c4.rig.seated = false; c4.place('s22_c40_edge'); c4.play('idle'); c4.setExpr('neutral'); }
      const ch = act(c, 'chase'); if (ch && !sk(c)) { ch.setExpr('hum'); }
    } },
    // Chase keeps playing past the phrase into the rest of "two" as far as he's written it: verse, chorus, second
    // verse. Then it stops dead where the bridge should be.
    { do: (c) => pianoMontage(c) },
    { do: (c) => { if (MINIGAMES.piano.stop) MINIGAMES.piano.stop(); seatChase(c); const ch = act(c, 'chase'); if (ch) { ch.setExpr('still'); } } },
    { wait: 1.2 },
    // [CLOSE · Chase (2040), at the edge of the lane] He's gone very still.
    { expr: [['chase40', 'still']] },
    CLOSE('chase40', { yaw: 0.3, dist: 1.15, fov: 34, push: 0.12, dur: 8 }),
    { wait: 1.6 },
    slow('chase40', "Where'd you get that?"),
    look('chase', 1.05),
    TURN_CH,
    say('chase', "It's track two. I've been working on it since October."),
    CLOSE('chase40', { yaw: 0.3, dist: 1.05, fov: 34, push: 0.1, dur: 8 }),
    slow('chase40', "I know. ^ I'm still working on it."),
    // [TWO-SHOT · the two Chases] Chase (2040) sits down on the other end of the piano bench. Mirror composition:
    // the same posture, the same slumped shoulders, fourteen years apart.
    MIRROR,
    { move: 'chase40', to: [10.05, 0, -18.7] },
    { move: 'chase40', to: [9.95, 0, -19.6] },
    { face: 'chase40', to: -H, dur: 0.4 },
    { place: 'chase40', at: 's22_piano_c40' },
    { act: [['chase40', 's22_slump', { h: 0.48 }], ['chase', 's22_slump', { h: 0.48 }]] },
    { expr: [['chase40', 'sad'], ['chase', 'sad']] },
    { wait: 2.0 },
    say('chase', "It's the bridge. The second verse goes into the bridge and it's—"),
    BOTH_FRONT,
    say('chases', '—not right.', { tag: 'together' }),
    // (Beat.)
    { wait: 0.8 },
    { act: [['chase40', 'sit_bench', { h: 0.48 }], ['chase', 'sit_bench', { h: 0.48 }]] },
    TURN_CH,
    look('chase', 1.1, 3),
    say('chase', "Why don't you just finish it?"),
    TURN_C40,
    look('chase40', -1.1, 3),
    say('chase40', "Why don't YOU?"),
    // (Chase looks at the keys. A long pause, 3 s.)
    { act: [['chase', 's22_slump', { h: 0.48 }]] },
    glideCam([8.47, 1.46, -20.0], [9.35, 1.0, -20.3], 34, { pos: [8.55, 1.44, -20.05], look: [9.35, 1.0, -20.3], fov: 31 }, 8),   // looking down at the keys
    { wait: 3.0 },
    { act: [['chase', 'sit_bench', { h: 0.48 }]] },
    CH_FACE,
    slow('chase', "…Because if I finish it and it's bad, that's it. That's what I am. ^ As long as it's not finished, it could still be good."),
    C40_FACE,
    slow('chase40', "Yeah. ^ I've been 'could still be good' for fourteen years. ^ It's not good. It's just not finished."),
    BOTH_FRONT,
    look('chase', 1.1, 3.5),
    say('chase', 'Did you ever play it? Anywhere?'),
    C40_FACE,
    slow('chase40', '2031. Redcliffe Festival. Pudding was on the bill. Ten past four, the little stage by the jetty. ^ I pulled out the night before.'),
    TURN_CH,
    look('chase', 1.1, 2.5),
    say('chase', 'Why?'),
    C40_FACE,
    say('chase40', "The bridge wasn't right."),
    { expr: [['chase', 'stunned']] },
    { act: [['chase', 'sit_bench', { h: 0.48 }]] },
    BOTH_FRONT,
    look('chase', 1.2, 4),
    say('chase', 'You cancelled a GIG because of a BRIDGE?'),
    // CHASE (2040): (looking down the lane toward the bay, where the Ted Smout Bridge is visible on the horizon)
    { act: [['chase40', 'sit_bench', { h: 0.48 }]] },
    look('chase40', 1.25, 9),
    { wait: 0.6 },
    LANE_BAY,
    { wait: 0.8 },
    slow('chase40', '…I cancel everything because of a bridge.'),
    // LUKA: (hissing from behind the piano, through the Santa beard)
    { place: 'luka', at: LUKA_HIDE },
    { act: [['luka', 'kneel']] },
    { expr: [['luka', 'worried']] },
    CLOSE('luka', { yaw: -0.45, dist: 0.95, fov: 38, push: 0.08, dur: 6 }),
    beard('slip'),
    { do: (c) => droneOnPiano(c) },
    say('luka', 'Can the bridge talk happen on the other side of the drone?', { tag: 'hissing', speed: 'fast' }),
    { act: [['luka', 's22_beard_up', { kneel: true, dur: 0.8, loop: false }]] },
    { wait: 0.35 },
    beard('on'),
    { wait: 0.5 },
    // Back to play for the sneak.
    unseat('chase40'),
    { place: 'chase40', at: SNEAK_C40 },
  ];

  // Then Chase stops playing and walks out behind them.
  CUTSCENES['2.2_out'] = [
    { flag: 's22_out' },
    { do: (c) => { stealth.end(); const l = act(c, 'luka'), c4 = act(c, 'chase40'); if (l) l.place([12.9, 0, -32.4, -2.4]); if (c4) c4.place([12.2, 0, -33.5, -2.0]); } },
    EXIT_WIDE,
    { wait: 0.8 },
    { do: (c) => { if (MINIGAMES.piano.stop) MINIGAMES.piano.stop(); const d = DRONES.get(DRONE); if (d) { DRONES.face(DRONE, [9.45, 0, -20.3]); DRONES.light(DRONE, 'curious'); } } },
    { sfx: 'drone_q', vol: 0.4, at: [8.3, 2.2, -20.0] },
    { wait: 0.5 },
    unseat('chase'),
    { move: 'chase', to: [9.5, 0, -21.4], run: true },
    { move: 'chase', to: [7.5, 0, -22.6], run: true },
    EXIT_PAN,
    { move: 'chase', to: [8.4, 0, -30.2], run: true },
    { move: 'chase', to: [12.0, 0, -32.5] },
    { face: 'luka', to: 'chase', dur: 0.4 },
    { wait: 0.4 },
    { move: 'luka', to: [14.0, 0, -32.6], nowait: true },
    { move: 'chase40', to: [14.0, 0, -33.3], nowait: true },
    { move: 'chase', to: [14.0, 0, -32.0], nowait: true },
    { do: (c) => { DRONES.light(DRONE, 'patrol'); } },
    { wait: 1.0 },
    { fade: 'out', dur: 1.0 },
    { do: (c) => { DRONES.clear(); AR.clear(); } },
  ];

  // =================================================================== 2.3 — "The Bench"
  // Region W of SETS.parade (world = local + (-300, 0, 0)): the bench at (-300, 0) facing +Z (the bay), its top rail at
  // z -0.24 (y 0.8..0.9) with the brass plaque on its rear face; the path z -9.1..-6.9; the bay and the bridge ahead.
  const S23_FLAGS = ['s23_plaque', 's23_rail', 's23_sit'];
  const PATH_WIDE = { shot: 'CAM', pos: [-304.0, 1.7, -30.0], look: [-306.0, 1.0, -8.0], fov: 22 };   // locked, long lens
  const BENCH_FRONT = glideCam([-299.65, 1.22, 3.1], [-300.0, 0.9, 0.05], 40, { pos: [-299.7, 1.18, 2.7], look: [-300.0, 0.9, 0.05], fov: 40 }, 8);
  const SIT_WIDE = glideCam([-295.6, 1.55, 4.8], [-300.6, 0.75, -2.2], 46, { pos: [-295.9, 1.5, 4.5], look: [-300.6, 0.75, -2.2], fov: 45 }, 9);
  // locked, from behind the bench and up the path: the two on the bench against the bay, Chase (2040) alone on the path
  const BEHIND = { shot: 'CAM', pos: [-298.5, 2.0, -14.0], look: [-300.2, 0.9, 0.5], fov: 36 };
  const ELBOW = [-300.35, 0, -8.4, 0.1];           // Chase (2040) on the path, behind them
  const THREE_SHOT = glideCam([-300.0, 0.98, 3.6], [-300.0, 0.86, 0.05], 40, { pos: [-300.0, 0.97, 3.25], look: [-300.0, 0.86, 0.05], fov: 40 }, 12);
  // over the seat, down onto the top rail: his hand sliding along it, the shine, his head bowed behind
  const RAIL = glideCam([-300.75, 1.22, 0.36], [-300.95, 0.9, -0.24], 36, { pos: [-300.45, 1.21, 0.345], look: [-300.63, 0.9, -0.24], fov: 34 }, 3.4);
  const SEAT = glideCam([-300.3, 1.5, -0.5], [-300.25, 0.47, 0.05], 34, { pos: [-300.3, 1.35, -0.45], look: [-300.25, 0.47, 0.06], fov: 32 }, 4);
  // from beside his shoulder (the set's s23_plaque); the card covers it
  const PLAQUE = { shot: 'INSERT', at: 's23_plaque', card: ['s23_plaque', {}] };
  const STORM = (u) => ({ do: (c) => { const s = P(c, 'storm_clouds'); if (s) s.userData.build(u); } });

  function open23(c) {
    for (const f of S23_FLAGS) delete c.state.flags[f];
    if (SETS.parade && SETS.parade.dress && c.world.setId === 'parade') SETS.parade.dress('bench23');
    DRONES.clear(); AR.clear();
    const b = P(c, 'bench'); if (b) { b.userData.polished(true); b.userData.glint(null); }
    const s = P(c, 'storm_clouds'); if (s) s.userData.build(0.25);
    c.state.flags.santa = true;
  }
  // [INSERT · Luka's finger running along the top rail] It's polished to a mirror shine. Not a grain of salt or dust.
  // Fresh frangipani lying on the seat. Leaning in from behind the bench, his right hand on the top rail (0.9 m up,
  // 0.48 m ahead of him) slides along it from his right to his left (the RAIL lens pans with it).
  function railHand(c) {
    const a = act(c, 'luka'); if (!a) return;
    a.play('hand_rest', { sd: -1, h: 0.9, z: 0.48, x: 0.42 });
    if (sk(c)) { a.p.x = 0.08; return; }
    tween(c, 3.3, (k) => { a.p.x = 0.42 - 0.34 * k; });
  }
  function railRun(c) {
    const b = P(c, 'bench'); if (!b) return;
    if (sk(c)) { b.userData.glint(null); return; }
    tween(c, 3.2, (k) => { b.userData.glint(k < 1 ? 0.18 + 0.64 * k : null); });
  }

  SCENES['2.3'] = {
    title: 'The Bench', set: 'parade', env: 'wp_morning', time: '08:40', place: 'Woody Point',
    playable: ['luka'], swap: false, music: null,
    hud: { noService: false, quiet: '27:18:00', samples: false, bars: null },
    spawn: { luka: 's23_walk_luka', chase: 's23_walk_chase', chase40: 's23_walk_c40' },
    hotspots: [
      // Examine the plaque
      { id: 'h23_plaque', at: [-300.0, 0, -0.85], r: 0.75, verb: 'Read', flag: 's23_plaque',
        steps: [{ face: 'luka', to: 0, dur: 0.3 }, PLAQUE, { wait: 3.4 }] },
      // Examine the bench (Hint 2)
      { id: 'h23_rail', at: [-301.0, 0, -0.72], r: 0.6, flag: 's23_rail',
        steps: [
          { place: 'luka', at: [-300.55, 0, -0.72, 0] },
          { do: (c) => railHand(c) },
          RAIL,
          { do: (c) => railRun(c) },
          { sfx: 'glass_squeak', vol: 0.18 },
          { wait: 1.6 },
          { sfx: 'glass_squeak', vol: 0.14 },
          { wait: 1.7 },
          SEAT,
          { wait: 1.6 },
          { act: [['luka', 'idle']] },
          CLOSE('luka', { yaw: 0.0, dist: 1.0, fov: 36, push: 0.06, dur: 5 }),
          say('luka', "Someone's done a good job."),
        ] },
      // Sit down? [YES] [NO]
      { id: 'h23_sit', at: [-300.0, 0, 0.85], r: 1.0, verb: 'Sit', flag: 's23_sit',
        ask: { q: 'Sit down?', test: true, no: [say('luka', '…Yeah. In a sec.')] } },
      // the coffee cart's urn by the picnic shelter: the save point
      { id: 'h23_urn', at: [-288.65, 1.5, -10.35], r: 1.2, verb: 'Use', kettle: true },   // at: urn_w's lid (the steam rises from it)
    ],
    steps: [
      ['cutscene', '2.3_path'],
      ['control', 'luka'],
      ['objective', 'Go and look.'],
      ['roam', {
        until: 's23_sit',
        async auto(c) {
          const T = (id) => c.hotspots.trigger(id);
          await T('h23_urn');
          await c.runSteps([{ move: 'luka', to: [-300.0, 0, -0.85, 0] }]);
          await T('h23_plaque');
          await T('h23_rail');
          await c.runSteps([{ move: 'luka', to: [-298.6, 0, 0.9] }, { move: 'luka', to: 's23_sit_prompt' }]);
          await T('h23_sit');
        },
      }],
      ['objective', null],
      ['cutscene', '2.3_bench'],
    ],
    grants: { flags: { s23_sit: true }, quiet: '27:18:00', noService: false },
  };

  // Cutscene — "2.3_path."
  CUTSCENES['2.3_path'] = [
    { do: (c) => nextTick().then(() => open23(c)) },
    { fade: 'out', dur: 0 },
    // [WIDE · locked, long lens] The three of them walking along the foreshore path. Chase (2040) slows, then stops
    // where the path meets the grass.
    PATH_WIDE,
    { fade: 'in', dur: 1.0 },
    { move: 'luka', to: 's23_luka_stop', nowait: true },
    { move: 'chase', to: 's23_chase_stop', nowait: true },
    { move: 'chase40', to: [-309.5, 0, -7.9], speed: 1.55 },
    { move: 'chase40', to: 's23_c40_stop', speed: 0.85 },
    { place: 'luka', at: 's23_luka_stop' }, { place: 'chase', at: 's23_chase_stop' },
    { face: 'luka', to: 'chase40', dur: 0.6 }, { face: 'chase', to: 'chase40', dur: 0.6 },
    { expr: [['chase40', 'still']] },
    CLOSE('chase40', { yaw: -0.38, dist: 1.2, fov: 36, push: 0.1, dur: 8 }),   // (clear of the pines behind him)
    { wait: 0.6 },
    slow('chase40', "…I don't come here."),
    CLOSE('chase', { yaw: -0.4, dist: 1.1, fov: 36, push: 0.08, dur: 6 }),
    say('chase', 'Where is here?'),
    // (Chase (2040) nods at the bench. Doesn't move.)
    { face: 'chase40', to: [-300.0, 0, 0.0], dur: 0.6 },
    { act: [['chase40', 'nod', { dur: 0.9 }]] },
    glideCam([-307.6, 1.85, -10.2], [-300.0, 0.6, 0.0], 32, { pos: [-307.4, 1.82, -9.95], look: [-300.0, 0.6, 0.0], fov: 31 }, 6),   // past him (whole), the bench
    { wait: 2.4 },
    { face: 'luka', to: [-300.0, 0, 0.0], dur: 0.6 },
  ];

  // Cutscene — "2.3_bench."
  const VM = "Hey, it's Luka. I'm probably at work. Leave a message. ^ Chase, if it's you, I'm not doing your shift.";
  CUTSCENES['2.3_bench'] = [
    STORM(0.4),
    { do: (c) => { const l = act(c, 'luka'); if (l) { l.place([-300.0, 0, 0.75, PI]); } const ch = act(c, 'chase'), c4 = act(c, 'chase40'); if (ch) ch.place('s23_chase_stop'); if (c4) c4.place('s23_c40_stop'); } },
    // [MID · from the front] Luka sits on his own memorial bench. He pulls the Santa beard down under his chin.
    BENCH_FRONT,
    { move: 'luka', to: [-300.0, 0, 0.3, PI] },
    { face: 'luka', to: 0, dur: 0.5 },
    { place: 'luka', at: 's23_seat_luka' },
    seat('luka', 0.45, 'sit_bench'),
    { wait: 0.8 },
    { act: [['luka', 's22_beard_up', { dur: 0.8, loop: false }]] },
    { wait: 0.3 },
    beard('chin'),
    { expr: [['luka', 'still']] },
    { wait: 0.8 },
    say('luka', 'Bit weird. ^ Sitting on yourself.'),
    // [WIDE] Chase comes and sits next to him.
    SIT_WIDE,
    { move: 'chase', to: [-298.7, 0, 0.9] },
    { move: 'chase', to: [-299.36, 0, 0.6] },
    { face: 'chase', to: 0, dur: 0.4 },
    { place: 'chase', at: 's23_seat_chase' },
    seat('chase', 0.45, 'sit_bench'),
    { wait: 0.6 },
    say('chase', 'Good bench, though.'),
    // LUKA: (after a moment)
    { wait: 1.2 },
    say('luka', '…Yeah. ^ It is.'),
    // [WIDE · locked, from behind the bench, the bay and the bridge ahead] The two of them. Behind, on the path, Chase
    // (2040) stands holding his own elbow.
    { place: 'chase40', at: ELBOW },
    { act: [['chase40', 's23_elbow']] },
    { expr: [['chase40', 'sad']] },
    BEHIND,
    // Hold 3 s.
    { wait: 3.0 },
    // Chase (2040) walks over, slowly, and sits on Luka's other side. Three on the bench.
    { act: [['chase40', 'idle']] },
    { move: 'chase40', to: [-301.45, 0, -1.2], speed: 1.1 },
    { move: 'chase40', to: [-301.4, 0, 0.75], speed: 1.1 },
    { move: 'chase40', to: [-300.64, 0, 0.6], speed: 1.1 },
    { face: 'chase40', to: 0, dur: 0.4 },
    { place: 'chase40', at: 's23_seat_c40' },
    seat('chase40', 0.45, 'sit_bench'),
    // (Rue's three-shot, now in daylight.)
    THREE_SHOT,
    { wait: 1.4 },
    STORM(0.5),
    slow('chase40', 'Six years tomorrow.'),
    CLOSE('luka', { yaw: 0.0, dist: 1.0, fov: 36, push: 0.08, dur: 6 }),
    glance('luka', 'chase40', 1.0), { wait: 0.4 },
    say('luka', 'Tell me.'),
    CLOSE('chase40', { yaw: -0.45, dist: 1.0, fov: 36, push: 0.16, dur: 22 }),
    slow('chase40', "It was a Sunday. Christmas Eve. Storm coming in off the bay. ^ You rang me at six in the morning. 'Can you come in? Need to get the servers out before it hits. I'll do it, I just need another pair of hands.'"),
    CLOSE('luka', { yaw: 0.1, dist: 0.95, fov: 36, push: 0.08, dur: 6 }),
    { expr: [['luka', 'sad']] },
    slow('luka', '…I rang you.'),
    CLOSE('chase40', { yaw: -0.45, dist: 0.95, fov: 36, push: 0.12, dur: 12 }),
    slow('chase40', 'Lightning hit the substation at twenty to eleven. The whole place went up. ^ You got me out first. Dragged me out by the lanyard.'),
    // (He touches the scorch mark on his lanyard strap.)
    { act: [['chase40', 'lanyard', { still: true }]] },
    { shot: 'INSERT', at: 'chase40', dist: 0.75 },
    { wait: 1.8 },
    { act: [['chase40', 'sit_bench', { h: 0.45 }]] },
    CLOSE('chase40', { yaw: -0.45, dist: 0.92, fov: 36, push: 0.12, dur: 10 }),
    slow('chase40', 'Then you looked back at the door. Four people still in there. And you said—'),
    CLOSE('luka', { yaw: 0.1, dist: 0.9, fov: 36, push: 0.06, dur: 6 }),
    slow('luka', "'I'll do it.'", { tag: 'quietly' }),
    CLOSE('chase40', { yaw: -0.45, dist: 0.9, fov: 36, push: 0.12, dur: 12 }),
    slow('chase40', "'I'll do it.' ^ You got all four out. ^ Then the roof came down."),
    // (Silence. Water. The bell buoy.)
    glideCam([-300.0, 1.1, 5.5], [-300.0, 0.9, 0.05], 36, { pos: [-300.0, 1.05, 5.1], look: [-300.0, 0.9, 0.05], fov: 36 }, 8),
    { sfx: 'bell', vol: 0.18, at: [-290.0, 0, 70.0] },
    { wait: 2.6 },
    CLOSE('luka', { yaw: 0.1, dist: 0.9, fov: 36, push: 0.08, dur: 6 }),
    slow('luka', 'I rang you.'),
    CLOSE('chase', { yaw: 0.25, dist: 0.95, fov: 36, push: 0.06, dur: 5 }),
    { expr: [['chase', 'worried']] },
    say('chase', 'Luka—'),
    CLOSE('luka', { yaw: 0.1, dist: 0.88, fov: 36, push: 0.1, dur: 8 }),
    slow('luka', 'I rang you and asked you to come in, and you got hurt.'),
    CLOSE('chase40', { yaw: -0.45, dist: 0.95, fov: 36, push: 0.08, dur: 8 }),
    slow('chase40', 'I got a hand. ^ You got a bench.'),
    THREE_SHOT,
    { wait: 0.8 },
    say('chase', 'What was the funeral like?'),
    CLOSE('chase40', { yaw: -0.45, dist: 1.0, fov: 36, push: 0.18, dur: 20 }),
    slow('chase40', "Half of Redcliffe. Margaret came in a wheelchair. ^ I wrote your eulogy forty-one times. Never got it right. On the day, I stood up there for four minutes and didn't say anything. ^ Then I sat down."),
    CLOSE('chase', { yaw: 0.25, dist: 0.95, fov: 36, push: 0.06, dur: 6 }),
    say('chase', '…What would you have said?'),
    // CHASE (2040): (a long beat, 3 s)
    CLOSE('chase40', { yaw: -0.45, dist: 0.95, fov: 34, push: 0.12, dur: 8 }),
    { wait: 3.0 },
    slow('chase40', "…Doesn't matter now."),
    // [CLOSE · Chase (2040)] He takes out his music slate, taps it, and holds it up between them. A voicemail greeting
    // plays, and it's Past Luka's actual voice, tinny:
    { do: (c) => { const a = act(c, 'chase40'); if (a && a.rig.attach.slate) { a.rig.show('slate', true); const s = a.rig.attach.slate.userData; if (s && s.list) s.list('Luka', ['Voicemail', 'Greeting', '▶ 0:06']); } } },
    { act: [['chase40', 's23_slate', { h: 0.45 }]] },
    { sfx: 'tap_pay', vol: 0.2 },
    Object.assign({ card: ['s23_voicemail', {}] }, glideCam([-300.7, 1.12, 1.35], [-300.45, 1.0, 0.3], 36, { pos: [-300.68, 1.1, 1.15], look: [-300.45, 1.0, 0.3], fov: 34 }, 8)),
    { wait: 0.6 },
    { do: (c) => { if (!sk(c) && c.AUDIO && c.AUDIO.voicemail) c.AUDIO.voicemail(); } },
    say('voicemail', VM, { tag: 'tinny' }),
    { wait: 0.6 },
    CLOSE('luka', { yaw: 0.1, dist: 0.88, fov: 36, push: 0.08, dur: 7 }),
    slow('luka', '…I recorded that last week.'),
    CLOSE('chase40', { yaw: -0.45, dist: 0.95, fov: 36, push: 0.08, dur: 7 }),
    slow('chase40', "I've listened to it about four thousand times."),
    // (Chase laughs. Chase (2040) laughs. Luka doesn't.)
    THREE_SHOT,
    { act: [['chase', 'laugh', { dur: 1.6, loop: false }], ['chase40', 'laugh', { dur: 1.8, loop: false }]] },
    { expr: [['chase', 'laugh'], ['chase40', 'laugh'], ['luka', 'still']] },
    { wait: 2.0 },
    { act: [['chase', 'sit_bench', { h: 0.45 }], ['chase40', 'sit_bench', { h: 0.45 }]] },
    { expr: [['chase', 'sad'], ['chase40', 'neutral']] },
    wear('chase40', 'slate', false),
    CLOSE('chase40', { yaw: -0.45, dist: 0.95, fov: 36, push: 0.1, dur: 12 }),
    slow('chase40', 'Kept paying for your number. Thirty-five dollars a month. ^ JARVIS still sends codes to it. Bug off the old list.'),
    CLOSE('luka', { yaw: 0.1, dist: 0.9, fov: 36, push: 0.06, dur: 6 }),
    say('luka', "'Sends MFA codes to dead phones.'"),
    CLOSE('chase40', { yaw: -0.45, dist: 0.95, fov: 36, push: 0.1, dur: 12 }),
    slow('chase40', "That's how I found out about Monday. A login code came through for an account I didn't have. Called QUIET. ^ So I logged in."),
    // LUKA: (after a while)
    THREE_SHOT,
    STORM(0.7),
    { wait: 1.8 },
    glance('luka', 'chase40', 1.0), { wait: 0.4 },
    slow('luka', 'What was I like? ^ After I got promoted. Before.'),
    CLOSE('chase40', { yaw: -0.45, dist: 0.95, fov: 36, push: 0.1, dur: 9 }),
    slow('chase40', 'Careful. ^ You got so careful.'),
    // [WIDE · locked, behind the bench] The three of them looking at the bay, the bridge on the horizon, storm clouds
    // building behind it. Hold 3 s.
    STORM(0.8),
    { shot: 'CAM', pos: [-298.5, 2.0, -13.0], look: [-300.5, 0.7, 4.0], fov: 40 },
    { wait: 3.0 },
    // LUKA: (pulling the Santa beard back up)
    { act: [['luka', 's22_beard_up', { dur: 0.8, loop: false }]] },
    { wait: 0.3 },
    beard('on'),
    say('luka', 'Right. ^ Rue.'),
    { wait: 0.8 },
    { fade: 'out', dur: 1.2 },
  ];
})();
