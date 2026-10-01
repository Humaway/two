// ============================================================ CONTENT: 2.1 ("Senior Casual"), 2.2 ("Bee Gees Way"), 2.3 ("The Bench")
// BUILD_PROMPT §8. Every line is final and word for word; '^' = a beat. Shot tags are quoted in the comments.
// Sets: flat (docs/sets/flat.md: 2.1 dawn21 -> morning21) and parade (docs/sets/parade.md: 2.2 Region P lane22, the
// Bee Gees Way laneway; 2.3 Region W bench23, the Woody Point headland). No music in 2.1 until the plan (pads), none in
// 2.2 (cicadas, hover traffic, then the piano is the music) and none in 2.3 (wind, water, the bell buoy).
// Mini-games: MINIGAMES.piano (44-mg-piano.js: the phrase, Chase playing on to the dead stop, the sneak playback, and
// the drone's "Excuse me! That's quite loud!") and the limiter keypad, ported here from Rue's Alarm keypad
// (MINIGAMES.keypad, only if nobody else has registered one). Systems: Chip View + AR (the SERVICE CODE 2032 tag),
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
    const ry = a.rotY + (o.yaw || 0), d = o.dist || 0.95, pu = o.push ?? 0.12, ly = V1.y - 0.05 + (o.ly || 0);
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
      if (r.seated || p.kneel) k.kneel(r, t); else k.base(r, t);
      const u = k.once(t, p, 0.8), a = u < 0.5 ? k.ez(u / 0.5) : k.ez((1 - u) / 0.5), d = r.d;
      k.arm(r, -1, 0.04 + 0.06 * (1 - a), (d.headC - 0.22) * a - 0.05 * (1 - a), 0.14 + 0.16 * a, 1, -1, -0.3);
      r.parts.handR.rotation.set(-0.6 * a, 0, 0.3);
    };
    ANIMS.s22_beard_up.upper = true;
  }
  // Luka's finger along the top rail (2.3, hint 2): leaning in, the right hand sweeping along the rail
  if (!ANIMS.s23_finger) {
    ANIMS.s23_finger = (r, t, p) => {
      const k = K(); if (!k) return ANIMS.idle(r, t, p);
      k.base(r, t);
      const u = k.ez(k.once(t, p, 3.2)), P_ = r.parts;
      P_.torso.rotation.x += 0.32; P_.head.rotation.x = 0.42; P_.head.rotation.y = -0.25 + 0.5 * u;
      k.arm(r, -1, 0.28 - 0.38 * u, -0.06, 0.5, 1, -0.6, -0.4);
      P_.handR.rotation.set(0.9, 0, 0.2);
    };
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
    cx.fillStyle = '#1c2a3e'; cx.font = `bold 92px ${K_.SYS}`; cx.fillText('MAX 40 dB', w * 0.1, h * 0.45);
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

  // ---------------------------------------------------------- the limiter keypad (Rue's Alarm keypad, 2040 SafeSense)
  // ['minigame', 'keypad', { digits: 4, code: '2032', shot, onKey(d), test }] -> { ok: true, code } | { cancel: true }.
  // Wrong codes buzz, clear and count a failure (two: the pause menu offers a skip, which opens it). Keyboard digits,
  // arrows + YES on the grid, NO deletes (empty: walks away), mouse / touch on the keys. Autoplay types the code.
  if (!MINIGAMES.keypad) MINIGAMES.keypad = (() => {
    const CSS = `
.k22{position:absolute;inset:0;display:flex;align-items:center;justify-content:flex-end;padding:0 7vw 14vh;pointer-events:none!important;font:14px/1.3 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;user-select:none;-webkit-user-select:none}
.k22 *{box-sizing:border-box}
.k22p{width:min(290px,86vw);padding:14px 16px 12px;background:linear-gradient(#f6f8fb,#dde4ec);border:1px solid #b8c4d0;border-radius:24px;box-shadow:0 0 22px rgba(95,178,255,.35),0 14px 30px rgba(0,0,0,.45);pointer-events:auto;color:#3a4656}
.k22t{display:flex;align-items:center;gap:7px;font-size:10px;letter-spacing:.14em;margin-bottom:9px}
.k22t b{flex:1;font-size:12px;letter-spacing:.18em;color:#2a6fb8;font-style:italic}
.k22led{width:10px;height:10px;border-radius:50%;background:#e53935;box-shadow:0 0 8px #e53935}
.k22led.g{background:#3ad16a;box-shadow:0 0 10px #3ad16a}
.k22lcd{background:#0e1626;color:#bfe6ff;border-radius:12px;padding:7px 10px 8px;margin-bottom:12px;box-shadow:inset 0 2px 6px rgba(0,0,0,.5)}
.k22lt{font:700 10px ui-monospace,Menlo,Consolas,monospace;letter-spacing:.16em;opacity:.85}
.k22ld{font:700 30px/1.2 ui-monospace,Menlo,Consolas,monospace;letter-spacing:.24em;text-align:center}
.k22g{display:grid;grid-template-columns:repeat(3,1fr);gap:9px;padding:10px;border-radius:14px;background:linear-gradient(135deg,#8a6424,#f1d27c 30%,#b98e3c 55%,#f3db93 80%,#a57b30)}
.k22k{height:46px;border-radius:10px;background:linear-gradient(#fbfbf9,#d6d9de);border:1px solid #8a8e96;box-shadow:0 3px 0 #6a6e76;font:700 21px system-ui,sans-serif;color:#20242c;cursor:pointer}
.k22k:active{transform:translateY(2px);box-shadow:0 1px 0 #6a6e76}
.k22k.x{font-size:15px;color:#2a6fb8}
.k22p .f{outline:3px solid #5fb2ff;outline-offset:2px}
.k22h{margin-top:9px;font-size:11px;text-align:center;color:#6a7686}
.k22p.bad .k22lcd{animation:k22s .32s}
@keyframes k22s{25%{transform:translateX(-7px)}75%{transform:translateX(7px)}}
@media (max-width:700px),(max-aspect-ratio:4/5){.k22{justify-content:center;padding:0 16px 22vh}.k22k{height:38px}}`;
    const LAB = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', 'OK'];
    let M, root, box, lcd, lcdTop, led, keys = [], api, Pm, code = '', fi = 0, focusEl = null, run = 0, phase = 'end', busy = false;
    const el = (tag, cls, parent, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; if (parent) parent.appendChild(e); return e; };
    const digitOf = (e) => ((e.code.length === 6 && e.code.startsWith('Digit')) || (e.code.length === 7 && e.code.startsWith('Numpad')) ? e.code[e.code.length - 1] : '');
    const gridMove = (I, i) => (I.pressed('left') ? (i % 3 ? i - 1 : i + 2) : I.pressed('right') ? (i % 3 === 2 ? i - 2 : i + 1)
      : I.pressed('up') ? (i + 9) % 12 : I.pressed('down') ? (i + 3) % 12 : -1);
    function build() {
      root = el('div', 'k22');
      el('style', null, root, CSS);
      root.addEventListener('mousedown', (e) => e.preventDefault());
      box = el('div', 'k22p', root); box.dataset.noyes = '';
      const top = el('div', 'k22t', box);
      el('b', null, top, 'SafeSense'); el('span', null, top, 'SERVICE'); led = el('i', 'k22led', top);
      const scr = el('div', 'k22lcd', box);
      lcdTop = el('div', 'k22lt', scr); lcd = el('div', 'k22ld', scr);
      const grid = el('div', 'k22g', box);
      keys = LAB.map((l, i) => { const b = el('button', 'k22k' + (l === 'C' || l === 'OK' ? ' x' : ''), grid, l); b.type = 'button'; b.tabIndex = -1; b.onclick = () => { if (phase === 'run') { fi = i; focus(); press(i); } }; return b; });
      el('div', 'k22h', box, 'YES — enter  ·  NO — delete');
    }
    const focus = () => { if (focusEl) focusEl.classList.remove('f'); focusEl = keys[fi]; if (focusEl) focusEl.classList.add('f'); };
    function show() { let s = ''; for (let i = 0; i < Pm.digits; i++) s += (i ? ' ' : '') + (code[i] || '_'); lcd.textContent = s; }
    function press(i) {
      if (busy) return;
      const l = LAB[i];
      if (l === 'OK') submit();
      else if (l === 'C') { code = ''; api.sfx('key_beep'); show(); }
      else if (code.length < Pm.digits) { code += l; api.sfx('key_type'); lcdTop.textContent = 'ENTER SERVICE CODE'; show(); if (Pm.onKey) try { Pm.onKey(l); } catch (e) { /* cosmetic */ } }
      else api.sfx('sad_beep');
    }
    function submit() {
      if (code.length < Pm.digits) { api.sfx('sad_beep'); return; }
      const id = run;
      if (code === String(Pm.code)) {
        busy = true; led.classList.add('g'); lcdTop.textContent = 'LIMITER OFF'; api.sfx('access_granted');
        wait(0.6).then(() => { if (id === run) fin({ ok: true, code }); });
        return;
      }
      api.sfx('sad_beep'); lcdTop.textContent = 'INCORRECT CODE'; code = ''; show();
      box.classList.remove('bad'); void box.offsetWidth; box.classList.add('bad');
      if (api.fail) api.fail();
    }
    function fin(res) { if (phase === 'end') return; phase = 'end'; api.finish(res); }
    function onKey(e) { const d = digitOf(e); if (!d || phase !== 'run' || busy) return; fi = LAB.indexOf(d); focus(); press(fi); }
    M = {
      start(params, a) {
        api = a; Pm = Object.assign({ digits: 4, code: '2032' }, params || {}); run++; phase = 'run'; busy = false;
        if (!root) build();
        a.ui.appendChild(root);
        led.classList.remove('g'); box.classList.remove('bad');
        code = ''; fi = 0; focus(); show(); lcdTop.textContent = 'ENTER SERVICE CODE';
        addEventListener('keydown', onKey);
        if (Pm.shot) a.cam.shot(Pm.shot);
      },
      update() {
        if (phase !== 'run' || busy || (api.popup.count && api.popup.count())) return;
        const I = api.input, g = gridMove(I, fi);
        if (g >= 0) { fi = g; focus(); }
        else if (I.pressed('yes')) { if (code.length >= Pm.digits) submit(); else press(fi); }
        else if (I.pressed('no')) { if (code) { code = code.slice(0, -1); api.sfx('key_beep'); show(); } else fin({ cancel: true }); }
      },
      draw() {},
      end() { run++; phase = 'end'; removeEventListener('keydown', onKey); if (root) root.remove(); },
      skipResult: (a) => ({ ok: true, code: String((a && a.params && a.params.code) || '2032') }),
      autoplay(a) {
        if (phase === 'end' || api !== a) M.start(a.params || {}, a);
        const id = run, c = String(Pm.test || Pm.code);
        (async () => {
          for (let i = 0; i < c.length; i++) { await wait(0.2); if (id !== run) return; fi = LAB.indexOf(c[i]); focus(); press(fi); }
          await wait(0.2); if (id !== run) return; submit();
        })();
      },
    };
    return M;
  })();

  // =================================================================== 2.1 — "Senior Casual"
  // SETS.flat: +Z out to the bay (balcony door, kitchen window), +X the kitchen. Marks/anchors from src/13-set-flat.js.
  const S21_FLAGS = ['s21_slate', 's21_play', 's21_photo', 's21_kettle_line', 's21_plan', 's21_box', 's21_done', 'santa'];
  const COUCH = [-1.62, 0, -2.42, 0];            // Chase asleep sitting up on the couch, facing the balcony
  const STAND = [-1.55, 0, -1.85, -0.35];        // off the couch
  // [WIDE · from inside, through the balcony door]
  const DAWN_WIDE = glideCam([-0.55, 1.95, -3.3], [-2.65, 0.95, 1.4], 54, { pos: [-1.05, 1.78, -2.55], look: [-2.75, 1.05, 1.35], fov: 49 }, 8);
  // Chase on the couch (asleep, then sitting up): a loose close that holds both head heights
  const COUCH_CLOSE = glideCam([-1.0, 1.2, -1.42], [-1.62, 1.04, -2.42], 40, { pos: [-1.08, 1.18, -1.56], look: [-1.62, 1.06, -2.42], fov: 38 }, 8);
  // over Chase's right shoulder on the couch: Luka through the glass, Chase's head at the frame's edge
  const COUCH_OTS = glideCam([-1.02, 1.42, -3.25], [-2.95, 1.0, 1.2], 40, { pos: [-1.05, 1.4, -3.05], look: [-2.95, 1.02, 1.2], fov: 37 }, 6);
  // the room from the corner (the gameplay camera's own angle: control hands over without a jump)
  const ROOM = { shot: 'CAM', pos: [2.0, 2.45, -0.12], look: [-1.6, 0.9, -2.1], fov: 58 };
  const DOOR_MID = glideCam([-1.9, 1.5, -1.4], [-0.95, 1.38, -3.75], 40, { pos: [-1.72, 1.48, -1.82], look: [-0.95, 1.38, -3.75], fov: 38 }, 6);
  const LUKA_OTS = glideCam([-3.6, 1.62, -1.65], [-2.82, 1.08, 1.4], 40, { pos: [-3.58, 1.6, -1.45], look: [-2.82, 1.1, 1.4], fov: 38 }, 5);
  const HAND = { shot: 'INSERT', at: 's21_hand_frame', card: ['s21_hand', {}] };
  const BAL_LOCKED = { shot: 'CAM', pos: [-2.28, 1.42, -1.95], look: [-2.28, 1.0, 1.05], fov: 38 };   // one locked two-shot, side-on
  // dawn behind them, a soft fill from the room so faces read in the locked shot (the dawn preset, lit from inside)
  const BAL_LIGHT = { hemi: [0xdccfdc, 0x4a3e46, 1.0], dir: [0xffc8b4, 0.6, [2, 5, -9]], spot: [0xffb0a0, 1.4] };
  const PLAN_WIDE = glideCam([2.3, 1.72, -0.22], [2.3, 0.85, -1.55], 62, { pos: [2.3, 1.66, -0.32], look: [2.3, 0.86, -1.55], fov: 60 }, 8);
  const PLAN_TOP = glideCam([2.3, 1.5, -0.84], [2.3, 0.76, -0.97], 40, { pos: [2.3, 1.38, -0.88], look: [2.3, 0.76, -0.97], fov: 40 }, 6);
  const BOX = glideCam([-0.85, 1.32, -4.55], [-1.7, 0.2, -5.4], 42, { pos: [-0.95, 1.18, -4.75], look: [-1.7, 0.2, -5.4], fov: 40 }, 5);
  const SANTA_MID = glideCam([0.35, 1.58, -4.3], [-1.05, 1.42, -5.4], 40, { pos: [0.1, 1.56, -4.5], look: [-1.05, 1.44, -5.4], fov: 38 }, 7);

  function reset21(c) {
    for (const f of S21_FLAGS) delete c.state.flags[f];
    const i = c.state.inventory.indexOf('santa'); if (i >= 0) c.state.inventory.splice(i, 1);
  }
  // Chase (2040) at dawn: T-shirt, no coat, no lanyard, nothing round his neck; dressed for the plan
  function c40Dressed(c, on) {
    const a = act(c, 'chase40'); if (!a) return;
    for (const p of ['coat', 'lanyard', 'headphones_neck']) if (a.rig.attach[p]) a.rig.show(p, on);
  }
  // 4:52 am: Luka on the balcony with the tea towel, Chase asleep sitting up on the couch, Chase (2040) asleep in the bedroom
  function open21(c) {
    reset21(c);
    if (SETS.flat && SETS.flat.dress && c.world.setId === 'flat') SETS.flat.dress('dawn21');
    const l = act(c, 'luka'), ch = act(c, 'chase'), c4 = act(c, 'chase40');
    if (l) { l.hold(null); l.place('s21_bal_polish'); l.hold('tea_towel', 'R'); l.play('polish'); l.setExpr('tired'); }
    if (ch) { ch.place(COUCH); ch.play('sit', { h: 0.42 }); ch.rig.seated = true; ch.play('sleep', { h: 0.42 }); ch.setExpr('sleep'); }
    if (c4) { c4.place('s21_bed_c40'); c4.play('sit', { h: 0.55 }); c4.rig.seated = true; c4.play('sleep', { h: 0.55 }); c4.setExpr('sleep'); c40Dressed(c, false); }
    const sl = P(c, 'slate_desk'); if (sl) sl.userData.screen('off');
    if (SETS.flat.snore) SETS.flat.snore(true);
  }

  SCENES['2.1'] = {
    title: 'Senior Casual', set: 'flat', env: 'dawn', time: 'Sunday 23 December 2040, 4:52 am', place: "Chase's flat, Redcliffe",
    playable: ['chase', 'luka'], swap: false, music: null,
    hud: { noService: false, quiet: '31:06:00', samples: false, bars: null },
    spawn: { luka: 's21_bal_polish', chase: COUCH, chase40: 's21_bed_c40' },
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
    COUCH_CLOSE,
    { wait: 1.4 },
    { expr: [['chase', 'tired']] },
    { act: [['chase', 'sit', { h: 0.42 }]] },
    { wait: 0.9 },
    { do: (c) => { const a = act(c, 'chase'); if (a && !sk(c)) a.play('glance', { yaw: -0.3, dur: 1.4 }); } },
    { wait: 1.2 },
    COUCH_OTS,
    { wait: 3.4 },
    // Control to Chase.
    ROOM,
    { act: [['chase', 'stand', { h: 0.42, dur: 1 }]] },
    { wait: 1.0 },
    unseat('chase'),
    { move: 'chase', to: STAND },
  ];

  // Cutscene — "2.1_dont."
  CUTSCENES['2.1_dont'] = [
    { do: (c) => {
      const ch = act(c, 'chase'), c4 = act(c, 'chase40');
      if (ch) { ch.place('s21_slate_chase'); ch.hold('slate_desk', 'R'); ch.play('reading_bare'); ch.setExpr('neutral'); }
      if (c4) { c4.rig.seated = false; c4.place('s21_door_c40'); c4.play('idle'); c4.setExpr('neutral'); }
      c40Dressed(c, false);
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
      if (l) { l.place('s21_bal_luka'); l.hold('tea_towel', 'R'); l.play('polish'); l.setExpr('tired'); }
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
      c40Dressed(c, true);
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
    // Control to Luka (up from the table)
    unseat('luka'), unseat('chase'), unseat('chase40'),
    { place: 'luka', at: [1.15, 0, -1.75, -2.5] }, { place: 'chase', at: [2.2, 0, -2.3, 0] }, { place: 'chase40', at: [3.05, 0, -1.6, -1.2] },
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
  const PIANO_TOP = [8.3, 1.34, -20.0];
  const POCKET = [11.1, -35.2, 14.3, -30.8];
  const inBox = (b, x, z) => x >= b[0] && x <= b[2] && z >= b[1] && z <= b[3];
  const TAG = new THREE.Vector3(8.3, 1.55, -19.1);
  const S22 = { phase: '', guardT: 0, upd: null, listening: false, handle: null };
  const LANE_TRACK = glideCam([8.6, 1.75, -1.2], [8.5, 1.3, -14.0], 44, { pos: [8.55, 1.7, -7.6], look: [8.5, 1.35, -30.0], fov: 40 }, 6.5, 'out');
  const STATUES = glideCam([8.5, 1.7, -23.5], [8.5, 1.45, -33.8], 34, { pos: [8.5, 1.65, -25.2], look: [8.5, 1.5, -33.8], fov: 32 }, 7);
  const DRONE_END = glideCam([8.4, 1.55, -25.8], [10.0, 1.9, -31.0], 38, { pos: [8.6, 1.6, -26.6], look: [10.0, 1.9, -31.0], fov: 36 }, 5);
  const KEYPAD = { shot: 'CAM', pos: [8.36, 1.1, -18.66], look: [8.37, 0.88, -19.12], fov: 32 };
  const AR_TAG = glideCam([7.2, 1.62, -16.9], [8.3, 1.5, -19.1], 38, { pos: [7.45, 1.6, -17.4], look: [8.3, 1.5, -19.1], fov: 34 }, 3);
  const PIANO_CAM = { shot: 'CAM', pos: [7.15, 2.0, -19.95], look: [9.55, 1.2, -19.95], fov: 42 };   // the mirror, from behind the piano
  const LANE_BAY = glideCam([9.75, 1.32, -19.25], [-17.0, 4.0, 380], 22, { pos: [9.75, 1.32, -19.15], look: [-17.0, 4.0, 380], fov: 20 }, 7);
  const HISS = glideCam([7.75, 1.25, -23.3], [7.0, 1.0, -21.5], 40, { pos: [7.62, 1.2, -23.0], look: [7.0, 1.0, -21.5], fov: 38 }, 5);
  const EXIT_WIDE = glideCam([7.0, 2.7, -27.6], [11.6, 0.9, -32.6], 50, { pos: [7.2, 2.6, -28.2], look: [12.0, 0.9, -32.8], fov: 48 }, 8);

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
  // (no sample sound: Chase's playing is the lure; dur long enough to outlast any sneak). The cone collapses over ~0.4 s,
  // so it is done under a cutscene, or with the sneakers behind it (they start behind the piano, the cone faces the lane)
  function droneOnPiano(c) {
    const d = DRONES.get(DRONE); if (!d || d.st === 'lured') return;
    const go = () => { if (flow.sceneId === '2.2') DRONES.lure(PIANO_TOP, 's22_quiet', { r: 60, dur: 9999, over: true, y: 2.2, disc: 0.5 }); };
    if (Math.hypot(d.x - PIANO_TOP[0], d.z - PIANO_TOP[2]) > 0.3) DRONES.goTo(DRONE, [PIANO_TOP[0], 0, PIANO_TOP[2]], { speed: 200 }).then(go);
    else go();
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
    if (l) { l.rig.seated = false; l.place('s22_luka_hide'); l.play('idle'); }
    if (c4) { c4.rig.seated = false; c4.place(SNEAK_C40); c4.play('idle'); }
    sneakOn(c);
    stealth.end();
    stealth.begin({
      targets: ['luka', 'chase40'], escortAfter: 1.4, forgetAfter: 1.8,
      checkpoints: [{ id: 'sneak', box: [1.4, -36, 15, -2], at: { luka: 's22_luka_hide', chase40: SNEAK_C40, chase: 's22_piano_chase' } }],
      onRetry: () => sneakOn(c),
    });
  }
  const SNEAK_C40 = [6.55, 0, -20.9, PI];        // behind the piano with Luka: the lured drone's cone faces up the lane
  const inPocket = (id) => { const a = world.actor(id); return !!a && inBox(POCKET, a.pos.x, a.pos.z); };

  // Public Piano: Chase sits and plays the first phrase of "two" (the mini-game), then plays on into the cutscene
  async function playPiano(c) {
    stealth.end();
    S22.phase = 'piano';
    await c.runSteps([{ move: 'chase', to: 's22_piano_chase' }, { face: 'chase', to: -H, dur: 0.2 }]);
    seatChase(c);
    c.music(null, { fade: 0.6 });
    const r = await c.flow.minigame('piano', { continue: true, drone: DRONE });
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
          const ok = await strengthHold({ who: 'luka', label: 'Lift', dur: 1.6, at: [8.3, 0, -19.2], anim: 'lift_strain',
            onProgress: (k) => { if (pl) pl.userData.lift(k); }, onFull: () => { if (pl) pl.userData.prop(true); } });
          if (!ok) { if (pl) pl.userData.lift(0); return; }   // let go: the plate drops back
          if (pl) pl.userData.prop(true);
          c.state.flags.s22_plate = true;
          c.sfx('clunk', { vol: 0.4 });
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
      { id: 'h22_urn', at: 'urn', r: 1.45, verb: 'Use', kettle: true },
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
  const PIANO_SHOTS = [   // [bar, shot]: cut on the music (Chase's playing-on runs 6x under autoplay)
    [4, glideCam([10.45, 1.75, -20.95], [8.6, 0.98, -20.05], 40, { pos: [10.2, 1.65, -20.7], look: [8.6, 0.98, -20.05], fov: 38 }, 9)],                // over his shoulder at the keys
    [7, glideCam([8.95, 0.62, -18.4], [9.6, 2.1, -29.0], 40, { pos: [8.9, 0.62, -18.6], look: [9.0, 2.2, -24.5], fov: 40 }, 9)],                     // low: the drone drifting up the lane
    [10, glideCam([5.9, 1.25, -23.6], [7.05, 1.0, -21.4], 40, { pos: [6.1, 1.2, -23.2], look: [7.05, 1.0, -21.4], fov: 38 }, 8)],                  // Luka crouched behind the piano
    [12, { shot: 'CAM', pos: [11.0, 0.9, -25.0], look: [9.0, 1.1, -19.0], fov: 46, to: { pos: [10.6, 4.6, -26.5], look: [8.6, 1.0, -19.0], fov: 50 }, dur: 9, ease: 'linear' }],   // crane up: the lane, the festoon
    [16, glideCam([12.2, 1.35, -19.4], [9.4, 1.15, -20.3], 34, { pos: [11.5, 1.3, -19.6], look: [9.4, 1.15, -20.3], fov: 32 }, 10)],              // verse 2: in front of him, a slow push
    [19, glideCam([9.6, 0.75, -17.6], [8.3, 2.3, -20.0], 46, { pos: [9.8, 0.7, -17.9], look: [8.3, 2.2, -20.0], fov: 44 }, 7)],                     // the drone over the piano, amber
    [21, glideCam([5.9, 1.75, -14.3], [8.6, 1.2, -19.8], 40, { pos: [6.15, 1.72, -14.7], look: [8.6, 1.2, -19.8], fov: 38 }, 8)],                   // over Chase (2040)'s shoulder: Chase small at the piano
    [23, glideCam([11.1, 1.3, -20.1], [9.45, 1.22, -20.3], 34, { pos: [10.75, 1.28, -20.15], look: [9.45, 1.22, -20.3], fov: 32 }, 6)],             // close: the last bars of verse 2
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
  CUTSCENES['2.2_piano'] = [
    // under the first cut: Luka crouched behind the piano, Chase (2040) at the edge of the lane
    { do: (c) => {
      const l = act(c, 'luka'), c4 = act(c, 'chase40');
      if (l) { l.rig.seated = false; l.place('s22_luka_hide'); l.play('kneel'); l.setExpr('stunned'); }
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
    glideCam([7.8, 1.6, -14.2], [6.6, 1.55, -15.4], 36, { pos: [7.62, 1.59, -14.38], look: [6.6, 1.55, -15.4], fov: 34 }, 7),
    { wait: 1.6 },
    slow('chase40', "Where'd you get that?"),
    { face: 'chase', to: 'chase40', dur: 0.6 },
    CLOSE('chase', { yaw: 0.5, dist: 1.0, fov: 36, push: 0.08, dur: 7 }),
    say('chase', "It's track two. I've been working on it since October."),
    CLOSE('chase40', { yaw: -0.35, dist: 1.0, fov: 36, push: 0.1, dur: 8 }),
    slow('chase40', "I know. ^ I'm still working on it."),
    // [TWO-SHOT · the two Chases] Chase (2040) sits down on the other end of the piano bench. Mirror composition:
    // the same posture, the same slumped shoulders, fourteen years apart.
    { face: 'chase', to: -H, dur: 0.5 },
    PIANO_CAM,
    { move: 'chase40', to: [10.05, 0, -18.9] },
    { move: 'chase40', to: [9.95, 0, -19.6] },
    { face: 'chase40', to: -H, dur: 0.4 },
    { place: 'chase40', at: 's22_piano_c40' },
    { act: [['chase40', 's22_slump', { h: 0.48 }], ['chase', 's22_slump', { h: 0.48 }]] },
    { expr: [['chase40', 'sad'], ['chase', 'sad']] },
    { wait: 1.8 },
    say('chase', "It's the bridge. The second verse goes into the bridge and it's—"),
    say('chases', '—not right.', { tag: 'together' }),
    // (Beat.)
    { wait: 0.8 },
    say('chase', "Why don't you just finish it?"),
    say('chase40', "Why don't YOU?"),
    // (Chase looks at the keys. A long pause, 3 s.)
    glideCam([11.0, 1.3, -20.45], [9.45, 1.18, -20.3], 34, { pos: [10.7, 1.28, -20.4], look: [9.45, 1.16, -20.3], fov: 32 }, 7),
    { wait: 3.0 },
    slow('chase', "…Because if I finish it and it's bad, that's it. That's what I am. ^ As long as it's not finished, it could still be good."),
    glideCam([11.0, 1.3, -19.45], [9.45, 1.2, -19.6], 34, { pos: [10.7, 1.28, -19.5], look: [9.45, 1.18, -19.6], fov: 32 }, 12),
    slow('chase40', "Yeah. ^ I've been 'could still be good' for fourteen years. ^ It's not good. It's just not finished."),
    PIANO_CAM,
    say('chase', 'Did you ever play it? Anywhere?'),
    glideCam([11.0, 1.3, -19.45], [9.45, 1.2, -19.6], 34, { pos: [10.75, 1.28, -19.5], look: [9.45, 1.18, -19.6], fov: 32 }, 12),
    slow('chase40', '2031. Redcliffe Festival. Pudding was on the bill. Ten past four, the little stage by the jetty. ^ I pulled out the night before.'),
    glideCam([11.0, 1.3, -20.45], [9.45, 1.18, -20.3], 34, { pos: [10.8, 1.28, -20.4], look: [9.45, 1.16, -20.3], fov: 32 }, 6),
    say('chase', 'Why?'),
    PIANO_CAM,
    say('chase40', "The bridge wasn't right."),
    { expr: [['chase', 'stunned']] },
    { act: [['chase', 'sit_bench', { h: 0.48 }]] },
    say('chase', 'You cancelled a GIG because of a BRIDGE?'),
    // CHASE (2040): (looking down the lane toward the bay, where the Ted Smout Bridge is visible on the horizon)
    { do: (c) => { const a = act(c, 'chase40'); if (a && !sk(c)) a.play('glance', { yaw: 1.25, dur: 9 }); } },
    { wait: 0.6 },
    LANE_BAY,
    { wait: 0.8 },
    slow('chase40', '…I cancel everything because of a bridge.'),
    // LUKA: (hissing from behind the piano, through the Santa beard)
    { act: [['luka', 'kneel']] },
    { expr: [['luka', 'worried']] },
    HISS,
    beard('slip'),
    { do: (c) => droneOnPiano(c) },
    say('luka', 'Can the bridge talk happen on the other side of the drone?', { tag: 'hissing', speed: 'fast' }),
    { act: [['luka', 's22_beard_up', { kneel: true, dur: 0.8 }]] },
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
    unseat('chase'),
    { move: 'chase', to: [9.5, 0, -21.4], run: true },
    { move: 'chase', to: [7.1, 0, -22.0], run: true },
    { move: 'chase', to: [7.1, 0, -31.2], run: true },
    { move: 'chase', to: [12.0, 0, -32.6] },
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
  const BEHIND = { shot: 'CAM', pos: [-297.6, 2.0, -14.5], look: [-301.0, 0.8, 3.0], fov: 44 };   // locked, from behind the bench
  const THREE_SHOT = glideCam([-300.0, 0.98, 3.6], [-300.0, 0.86, 0.05], 40, { pos: [-300.0, 0.97, 3.25], look: [-300.0, 0.86, 0.05], fov: 40 }, 12);
  const RAIL = glideCam([-301.3, 1.08, -0.78], [-300.85, 0.87, -0.24], 30, { pos: [-300.7, 1.08, -0.78], look: [-300.25, 0.87, -0.24], fov: 30 }, 3.4);
  const SEAT = glideCam([-300.3, 1.5, -0.5], [-300.25, 0.47, 0.05], 34, { pos: [-300.3, 1.35, -0.45], look: [-300.25, 0.47, 0.06], fov: 32 }, 4);
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
  // Fresh frangipani lying on the seat.
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
          { act: [['luka', 's23_finger', { dur: 3.2, loop: false }]] },
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
    ],
    steps: [
      ['cutscene', '2.3_path'],
      ['control', 'luka'],
      ['objective', 'Go and look.'],
      ['roam', {
        until: 's23_sit',
        async auto(c) {
          const T = (id) => c.hotspots.trigger(id);
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
    CLOSE('chase40', { yaw: 0.6, dist: 1.2, fov: 36, push: 0.1, dur: 8 }),
    { wait: 0.6 },
    slow('chase40', "…I don't come here."),
    CLOSE('chase', { yaw: -0.4, dist: 1.1, fov: 36, push: 0.08, dur: 6 }),
    say('chase', 'Where is here?'),
    // (Chase (2040) nods at the bench. Doesn't move.)
    { face: 'chase40', to: [-300.0, 0, 0.0], dur: 0.6 },
    { act: [['chase40', 'nod', { dur: 0.9 }]] },
    glideCam([-306.6, 1.55, -9.6], [-300.0, 0.6, 0.0], 34, { pos: [-306.4, 1.55, -9.3], look: [-300.0, 0.6, 0.0], fov: 32 }, 6),   // over his shoulder: the bench
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
    { act: [['luka', 's22_beard_up', { dur: 0.8 }]] },
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
    { place: 'chase40', at: 's23_c40_elbow' },
    { act: [['chase40', 's23_elbow']] },
    { expr: [['chase40', 'sad']] },
    BEHIND,
    // Hold 3 s.
    { wait: 3.0 },
    // Chase (2040) walks over, slowly, and sits on Luka's other side. Three on the bench.
    { act: [['chase40', 'idle']] },
    { move: 'chase40', to: [-301.5, 0, -1.2], speed: 1.1 },
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
    CLOSE('chase40', { yaw: -0.25, dist: 1.0, fov: 36, push: 0.16, dur: 22 }),
    slow('chase40', "It was a Sunday. Christmas Eve. Storm coming in off the bay. ^ You rang me at six in the morning. 'Can you come in? Need to get the servers out before it hits. I'll do it, I just need another pair of hands.'"),
    CLOSE('luka', { yaw: 0.1, dist: 0.95, fov: 36, push: 0.08, dur: 6 }),
    { expr: [['luka', 'sad']] },
    slow('luka', '…I rang you.'),
    CLOSE('chase40', { yaw: -0.25, dist: 0.95, fov: 36, push: 0.12, dur: 12 }),
    slow('chase40', 'Lightning hit the substation at twenty to eleven. The whole place went up. ^ You got me out first. Dragged me out by the lanyard.'),
    // (He touches the scorch mark on his lanyard strap.)
    { act: [['chase40', 'lanyard', { still: true }]] },
    { shot: 'INSERT', at: 'chase40', dist: 0.75 },
    { wait: 1.8 },
    { act: [['chase40', 'sit_bench', { h: 0.45 }]] },
    CLOSE('chase40', { yaw: -0.25, dist: 0.92, fov: 36, push: 0.12, dur: 10 }),
    slow('chase40', 'Then you looked back at the door. Four people still in there. And you said—'),
    CLOSE('luka', { yaw: 0.1, dist: 0.9, fov: 36, push: 0.06, dur: 6 }),
    slow('luka', "'I'll do it.'", { tag: 'quietly' }),
    CLOSE('chase40', { yaw: -0.25, dist: 0.9, fov: 36, push: 0.12, dur: 12 }),
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
    CLOSE('chase40', { yaw: -0.25, dist: 0.95, fov: 36, push: 0.08, dur: 8 }),
    slow('chase40', 'I got a hand. ^ You got a bench.'),
    THREE_SHOT,
    { wait: 0.8 },
    say('chase', 'What was the funeral like?'),
    CLOSE('chase40', { yaw: -0.25, dist: 1.0, fov: 36, push: 0.18, dur: 20 }),
    slow('chase40', "Half of Redcliffe. Margaret came in a wheelchair. ^ I wrote your eulogy forty-one times. Never got it right. On the day, I stood up there for four minutes and didn't say anything. ^ Then I sat down."),
    CLOSE('chase', { yaw: 0.25, dist: 0.95, fov: 36, push: 0.06, dur: 6 }),
    say('chase', '…What would you have said?'),
    // CHASE (2040): (a long beat, 3 s)
    CLOSE('chase40', { yaw: -0.25, dist: 0.95, fov: 34, push: 0.12, dur: 8 }),
    { wait: 3.0 },
    slow('chase40', "…Doesn't matter now."),
    // [CLOSE · Chase (2040)] He takes out his music slate, taps it, and holds it up between them. A voicemail greeting
    // plays, and it's Past Luka's actual voice, tinny:
    { do: (c) => { const a = act(c, 'chase40'); if (a && a.rig.attach.slate) { a.rig.show('slate', true); const s = a.rig.attach.slate.userData; if (s && s.list) s.list('Luka', ['Voicemail', 'Greeting', '▶ 0:06']); } } },
    { act: [['chase40', 's23_slate', { h: 0.45 }]] },
    { sfx: 'tap_pay', vol: 0.2 },
    glideCam([-300.95, 1.12, 1.25], [-300.55, 1.0, 0.25], 36, { pos: [-300.9, 1.1, 1.05], look: [-300.55, 1.0, 0.25], fov: 34 }, 8),
    { wait: 0.6 },
    { do: (c) => { if (!sk(c) && c.AUDIO && c.AUDIO.voicemail) c.AUDIO.voicemail(); } },
    say('voicemail', VM, { tag: 'tinny' }),
    { wait: 0.6 },
    CLOSE('luka', { yaw: 0.1, dist: 0.88, fov: 36, push: 0.08, dur: 7 }),
    slow('luka', '…I recorded that last week.'),
    CLOSE('chase40', { yaw: -0.25, dist: 0.95, fov: 36, push: 0.08, dur: 7 }),
    slow('chase40', "I've listened to it about four thousand times."),
    // (Chase laughs. Chase (2040) laughs. Luka doesn't.)
    THREE_SHOT,
    { act: [['chase', 'laugh', { dur: 1.6, loop: false }], ['chase40', 'laugh', { dur: 1.8, loop: false }]] },
    { expr: [['chase', 'laugh'], ['chase40', 'laugh'], ['luka', 'still']] },
    { wait: 2.0 },
    { act: [['chase', 'sit_bench', { h: 0.45 }], ['chase40', 'sit_bench', { h: 0.45 }]] },
    { expr: [['chase', 'sad'], ['chase40', 'neutral']] },
    wear('chase40', 'slate', false),
    CLOSE('chase40', { yaw: -0.25, dist: 0.95, fov: 36, push: 0.1, dur: 12 }),
    slow('chase40', 'Kept paying for your number. Thirty-five dollars a month. ^ JARVIS still sends codes to it. Bug off the old list.'),
    CLOSE('luka', { yaw: 0.1, dist: 0.9, fov: 36, push: 0.06, dur: 6 }),
    say('luka', "'Sends MFA codes to dead phones.'"),
    CLOSE('chase40', { yaw: -0.25, dist: 0.95, fov: 36, push: 0.1, dur: 12 }),
    slow('chase40', "That's how I found out about Monday. A login code came through for an account I didn't have. Called QUIET. ^ So I logged in."),
    // LUKA: (after a while)
    THREE_SHOT,
    STORM(0.7),
    { wait: 1.8 },
    glance('luka', 'chase40', 1.0), { wait: 0.4 },
    slow('luka', 'What was I like? ^ After I got promoted. Before.'),
    CLOSE('chase40', { yaw: -0.25, dist: 0.95, fov: 36, push: 0.1, dur: 9 }),
    slow('chase40', 'Careful. ^ You got so careful.'),
    // [WIDE · locked, behind the bench] The three of them looking at the bay, the bridge on the horizon, storm clouds
    // building behind it. Hold 3 s.
    STORM(0.8),
    { shot: 'CAM', pos: [-298.5, 2.0, -13.0], look: [-300.5, 0.7, 4.0], fov: 40 },
    { wait: 3.0 },
    // LUKA: (pulling the Santa beard back up)
    { act: [['luka', 's22_beard_up', { dur: 0.8 }]] },
    { wait: 0.3 },
    beard('on'),
    say('luka', 'Right. ^ Rue.'),
    { wait: 0.8 },
    { fade: 'out', dur: 1.2 },
  ];
})();
