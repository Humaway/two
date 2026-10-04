// ============================================================ CONTENT: 2.8 ("Quiet Hours"), 2.9 ("Lights Out"), 2.10 ("3:00 am")
// BUILD_PROMPT §8. Every line is final and word for word; '^' = a beat. Shot tags are quoted in the comments.
// Set: valley (src/18-set-valley.js, docs/sets/valley.md): quiet28 -> transit28 -> dusty28 (2.8), night29 (2.9), three210
// (2.10); envs quiet / starlight / lights_out / annst / three_am / dawn; lamps; the s28_ / s29_ / s210_ marks and anchors.
// 2.8: the crane into the Valley in Quiet Hours (whispers), Mia and the hold music on her ukulele, the confiscation into the
//   Safe Box on the lamp pole (the noise drone's swoop), the idea-engine ORBIT around Chase speeding up and Chase (2040)'s
//   "…I used to do that.", then PLAY "Get the ukulele back." (needs all three: Chase (2040) reads the Safe Box's AR code in
//   Chip View, a new code every attempt, the Signal soft-fails back to the start; Chase drops his phone on café table C
//   and plays a sample at full volume, louder = longer, the laugh gets the drone's own line (33-systems); Luka climbs the
//   bollard and the rungs (hold YES; the pole wobbles if he's slow) while the drone is busy, "Second-in-Climbing", and
//   types the code; the phone has to be back before the drone finishes "investigating" it, or the drone finds its owner).
//   Then Mia gets her ukulele back, the Ukulele sample ("Make it sound good."), "Finish it, yeah?", the walk past the
//   Chinatown gate to the stage door, and a short Starlight explore (posters, desk, stage, the green-room kettle).
//   Continue: a kettle save on the street after the puzzle, or in the Starlight, resumes there (phases by flag).
// 2.9: the locked low floor setup (an 80 s push), Luka takes the brick phone, PLAY "Leave." (a sneak on the low cams: the
//   creaks and running stir the sleepers, a soft fail puts him back on his spot), "Write a note? [YES]" at the bar and the
//   coaster INSERT (I'll do it. — L.), left on Chase's chest, the stage door in the rain played straight, the brick phone
//   back in Chase's hand, Lights Out in reverse, and the only cut: Chase (2040)'s eyes are open.
// 2.10: the promise at the half-alive desk, MINIGAMES.sequencer (its own lines: "Fine.", the bridge beat, ONE MORE PASS /
//   IT'S DONE), the bounce (EXPORT two, a progress bar that doesn't go backwards, "Backup."), the headphones, "Not yet.",
//   dawn through the high window (WIDE, locked), END OF ACT TWO.
// Honest moments play straight: 2.9_door, 2.9_lights_out up to the release ("Would yous two shut up…"), 2.10 (no music
// stings; the song only where the sequencer plays it and as headphone bleed).
(() => {
  const PI = Math.PI, H = PI / 2;
  const say = (id, text, o) => Object.assign({ say: id, text }, o);
  const slow = (id, text, o) => say(id, text, Object.assign({ speed: 'slow' }, o));
  const sk = (c) => c.flow.skipping;
  const act = (c, id) => c.world.actor(id);
  const UD = (c, n) => { const o = c.world.prop(n); return o ? o.userData : null; };
  const V1 = new THREE.Vector3(), V2 = new THREE.Vector3();
  const VS = () => SETS.valley;
  const AN = (n) => { const s = VS(); return s && s.anchors ? s.anchors[n] : null; };
  // one tick later (even while skipping): the set re-dresses itself on its first tick in a new scene
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
    if (turning) {
      const dr = a.fc.a1 - a.rotY, dx = V1.x - a.pos.x, dz = V1.z - a.pos.z, cs = Math.cos(dr), sn = Math.sin(dr);
      V1.x = a.pos.x + dx * cs + dz * sn; V1.z = a.pos.z - dx * sn + dz * cs;
    }
    const ry = (turning ? a.fc.a1 : a.rotY) + (o.yaw || 0), d = (o.dist || 0.95) * 1.22, pu = o.push ?? 0.12, ly = V1.y - 0.05 + (o.ly || 0);
    const sx = Math.sin(ry), sz = Math.cos(ry), y = V1.y + (o.dy ?? -0.02), lx = V1.x + (o.lx || 0), lz = V1.z + (o.lz || 0);
    c.cam.shot({ shot: 'CAM', pos: [V1.x + sx * d, y, V1.z + sz * d], look: [lx, ly, lz], fov: o.fov || 36,
      to: { pos: [V1.x + sx * (d - pu), y + (o.rise || 0), V1.z + sz * (d - pu)], look: [lx, ly, lz], fov: o.fovTo || o.fov || 36 }, dur: o.dur || 7, ease: 'linear' });
  }
  const CLOSE = (id, o) => ({ do: (c) => closeOn(c, id, o) });
  // a two-shot of a and b: the lens off the line between their eyes on side `side`, `dist` m from the midpoint
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
  // a glide between two explicit lenses (o: ease, card)
  const glideCam = (pos, look, fov, to, dur = 6, o) => Object.assign({ shot: 'CAM', pos, look, fov, to: to ? { pos: to[0] || pos, look: to[1] || look, fov: to[2] ?? fov } : undefined, dur, ease: 'linear' }, o);
  const GLIDE = (pos, look, fov, to, dur, o) => ({ do: (c) => { if (!sk(c)) c.cam.shot(glideCam(pos, look, fov, to, dur, o)); } });
  // a set anchor's lens with a slow push of `push` m toward its look (read at step time: the set file comes first)
  function aShot(name, push = 0.2, dur = 8, o = {}) {
    const an = AN(name);
    if (!an) { console.warn('TWO 2.8-2.10: no anchor ' + name); return null; }
    const f = an.from, t = an.at, d = Math.hypot(t[0] - f[0], t[1] - f[1], t[2] - f[2]) || 1, k = push / d, fov = o.fov || an.fov || 40;
    const s = { shot: 'CAM', pos: f.slice(), look: t.slice(), fov, dur, ease: o.ease || 'linear' };
    if (push || o.rise || o.fovTo) s.to = { pos: [f[0] + (t[0] - f[0]) * k, f[1] + (t[1] - f[1]) * k + (o.rise || 0), f[2] + (t[2] - f[2]) * k], look: t.slice(), fov: o.fovTo || fov };
    return s;
  }
  const aPush = (name, push, dur, o) => ({ do: (c) => { if (sk(c)) return; const s = aShot(name, push, dur, o); if (s) c.cam.shot(s); } });
  // Luka's tell (and anyone's look): a head turn toward someone or a point; the feet stay
  function glanceAt(c, from, to, dur = 1.0) {
    if (sk(c)) return;
    const a = act(c, from), b = typeof to === 'string' ? act(c, to) : null, tx = b ? b.pos.x : to[0], tz = b ? b.pos.z : to[2];
    if (!a || tx == null) return;
    let d = Math.atan2(tx - a.pos.x, tz - a.pos.z) - a.rotY; d = Math.atan2(Math.sin(d), Math.cos(d));
    a.play('glance', { yaw: Math.max(-1.3, Math.min(1.3, d)), dur });
  }
  const glance = (from, to, dur) => ({ do: (c) => glanceAt(c, from, to, dur) });
  // seat / lie / stand at once (state: kept under skips)
  function seatA(a, at, h = 0.45, anim = 'sit') { if (!a) return; if (at) a.place(at); a.rig.seated = true; a.play(anim, { h }); }
  function standA(a, at) { if (!a) return; a.rig.seated = false; a.rig.floorSit = false; a.rig.lying = false; if (at) a.place(at); a.play('idle'); }
  function lieA(a, at) { if (!a) return; a.rig.seated = false; a.rig.floorSit = false; if (at) a.place(at); a.play('sleep_back'); }
  // Luka's Santa beard: 'on' | 'slip' | 'chin' | 'eyes' | 'ear'
  function beardSet(c, st) { const l = act(c, 'luka'), b = l && l.rig.attach.santa_beard; if (b && b.userData.state) b.userData.state(st); }
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
  // an actor walks a route in the background (scripted). Resolves on arrival, on a skip (it lands at the end at once),
  // on a scene change, or when GEN moves on (a retry); `then(a)` runs on arrival or landing.
  let GEN = 0;
  function route(c, id, pts, o = {}) {
    const a = act(c, id), sid = c.flow.sceneId, g = GEN;
    if (!a || !pts.length) return Promise.resolve();
    const last = pts[pts.length - 1], live = () => c.flow.sceneId === sid && g === GEN;
    let done = false;
    const land = () => { done = true; a.place(last); if (o.face != null) a.face(o.face, 0); if (o.then) o.then(a); };
    if (sk(c)) { land(); return Promise.resolve(); }
    (async () => {
      for (const p of pts) { if (!live() || done) return; await a.moveTo(p, { run: !!o.run, speed: o.speed }); }
      if (!live() || done) return;
      done = true;
      if (o.face != null) a.face(o.face, 0.35);
      if (o.then) o.then(a);
    })();
    return waitUntil(() => done || c.flow.skipping || !live()).then(() => { if (!done && c.flow.skipping && live()) land(); });
  }
  const yawTo = (from, to) => Math.atan2(to[0] - from[0], to[2] - from[2]);
  const toast = (c, t) => { if (!sk(c) && c.ui.toast) c.ui.toast(t); };

  // ============================================================ CARDS (readable INSERTs this file owns)
  // 2.8: the Safe Box code, as Chase (2040)'s Chip View shows it on the box's quilted side (a new one every attempt)
  CARDS.s28_code = (cx, w, h, d) => {
    const K = CARDS._kit, code = String((d && d.code) || '0000');
    K.seedOf('s28_code');
    const x = w * 0.04, y = h * 0.05, bw = w * 0.92, bh = h * 0.9;
    K.shadow(cx, 26, 10, 0.4); cx.fillStyle = '#ece2cc'; K.rr(cx, x, y, bw, bh, 36); cx.fill(); K.noShadow(cx);
    cx.save(); K.rr(cx, x, y, bw, bh, 36); cx.clip();
    // quilted padding: soft puffs between diamond stitching
    const g = 92;
    for (let r = -1; r < bh / g + 2; r++) for (let q = -1; q < bw / g + 2; q++) {
      const px = x + q * g + (r % 2 ? g / 2 : 0), py = y + r * g * 0.62;
      const rg = cx.createRadialGradient(px - 10, py - 12, 4, px, py, g * 0.62);
      rg.addColorStop(0, 'rgba(255,252,242,0.95)'); rg.addColorStop(1, 'rgba(196,182,152,0.0)');
      cx.fillStyle = rg; cx.beginPath(); cx.ellipse(px, py, g * 0.55, g * 0.36, 0, 0, 7); cx.fill();
    }
    cx.strokeStyle = 'rgba(150,132,100,0.55)'; cx.lineWidth = 3; cx.setLineDash([10, 8]);
    for (let k = -8; k < 16; k++) {
      cx.beginPath(); cx.moveTo(x + k * g, y); cx.lineTo(x + k * g + bh * 1.45, y + bh); cx.stroke();
      cx.beginPath(); cx.moveTo(x + k * g, y + bh); cx.lineTo(x + k * g + bh * 1.45, y); cx.stroke();
    }
    cx.setLineDash([]);
    cx.restore();
    // the AR pane (Chip View): translucent glass, a blue glow, scanlines
    const px = w * 0.16, py = h * 0.17, pw = w * 0.68, ph = h * 0.64;
    cx.save(); cx.shadowColor = 'rgba(95,178,255,0.95)'; cx.shadowBlur = 46; cx.fillStyle = 'rgba(234,246,255,0.86)'; K.rr(cx, px, py, pw, ph, 30); cx.fill(); cx.restore();
    cx.strokeStyle = 'rgba(110,184,255,0.95)'; cx.lineWidth = 5; K.rr(cx, px, py, pw, ph, 30); cx.stroke();
    cx.textAlign = 'center'; cx.textBaseline = 'middle';
    cx.fillStyle = '#2a6fb8'; cx.font = `bold ${Math.round(ph * 0.1)}px ${K.SYS}`;
    cx.fillText('R E L E A S E   C O D E', px + pw / 2, py + ph * 0.18);
    cx.fillStyle = '#12304e'; cx.font = `bold ${Math.round(ph * 0.42)}px ${K.MONO}`;
    cx.fillText(code.split('').join(' '), px + pw / 2, py + ph * 0.55);
    cx.fillStyle = '#5a7a98'; cx.font = `italic ${Math.round(ph * 0.075)}px ${K.SYS}`;
    cx.fillText('SafeSense · single use', px + pw / 2, py + ph * 0.86);
    cx.fillStyle = 'rgba(120,190,255,0.10)'; for (let sy = py + 4; sy < py + ph; sy += 7) cx.fillRect(px + 6, sy, pw - 12, 2);
  };
  CARDS.s28_code.size = [900, 560];
  // 2.9: a beer coaster off the Starlight's bar, in biro: I'll do it. — L.
  CARDS.s29_coaster = (cx, w, h) => {
    const K = CARDS._kit;
    K.seedOf('s29_coaster');
    const X = w / 2, Y = h / 2, R = Math.min(w, h) * 0.44;
    cx.save(); cx.translate(X, Y); cx.rotate(-0.08); cx.translate(-X, -Y);
    K.shadow(cx, 30, 12, 0.5); cx.fillStyle = '#efe5cf'; cx.beginPath(); cx.arc(X, Y, R, 0, 7); cx.fill(); K.noShadow(cx);
    // pulp texture, a scalloped edge, an old wet ring
    for (let i = 0; i < 900; i++) { const a = K.rnd() * 7, r = Math.sqrt(K.rnd()) * R; cx.fillStyle = K.rnd() < 0.5 ? 'rgba(160,140,100,0.10)' : 'rgba(255,255,255,0.18)'; cx.fillRect(X + Math.cos(a) * r, Y + Math.sin(a) * r, 3, 3); }
    cx.strokeStyle = '#cdbb94'; cx.lineWidth = 10; cx.beginPath(); cx.arc(X, Y, R - 6, 0, 7); cx.stroke();
    cx.strokeStyle = 'rgba(150,110,60,0.22)'; cx.lineWidth = 14; cx.beginPath(); cx.arc(X + R * 0.22, Y + R * 0.3, R * 0.42, 0.4, 5.6); cx.stroke();
    // the printed rim: THE STARLIGHT · ANN ST, faded red
    cx.fillStyle = 'rgba(176,52,60,0.75)'; cx.font = `bold ${Math.round(R * 0.1)}px ${K.SANS}`; cx.textAlign = 'center'; cx.textBaseline = 'middle';
    const rim = 'THE STARLIGHT  ·  ANN ST  ·  FORTITUDE VALLEY  ·  ';
    for (let i = 0; i < rim.length; i++) { const a = -PI * 0.92 + (i / rim.length) * PI * 1.84; cx.save(); cx.translate(X + Math.cos(a) * R * 0.82, Y + Math.sin(a) * R * 0.82); cx.rotate(a + H); cx.fillText(rim[i], 0, 0); cx.restore(); }
    // the biro
    K.hand(cx, 'I’ll do it.', X, Y + R * 0.02, Math.round(R * 0.3), '#1d2f8f', { align: 'center', pen: true });
    K.hand(cx, '— L.', X + R * 0.28, Y + R * 0.42, Math.round(R * 0.24), '#1d2f8f', { align: 'center', pen: true });
    cx.restore();
  };
  CARDS.s29_coaster.size = [820, 820];
  // 2.10: the slate's EXPORT. The file name typed, the progress bar (it doesn't go backwards), two.wav · saved, the copy
  CARDS.s210_export = (cx, w, h, d) => {
    const K = CARDS._kit, name = (d && d.name) || '', pct = Math.max(0, Math.min(1, (d && d.pct) || 0));
    const x = w * 0.04, y = h * 0.06, sw = w * 0.92, sh = h * 0.88;
    K.shadow(cx, 30, 12, 0.5); cx.fillStyle = '#05080e'; K.rr(cx, x - 14, y - 14, sw + 28, sh + 28, 40); cx.fill(); K.noShadow(cx);
    const g = cx.createLinearGradient(0, y, 0, y + sh); g.addColorStop(0, '#0e1a2a'); g.addColorStop(1, '#070d16');
    cx.fillStyle = g; K.rr(cx, x, y, sw, sh, 26); cx.fill();
    cx.textBaseline = 'middle';
    cx.fillStyle = '#bfe6ff'; cx.font = `bold ${Math.round(sh * 0.085)}px ${K.SYS}`; cx.textAlign = 'center';
    cx.fillText('EXPORT', x + sw / 2, y + sh * 0.11);
    cx.fillStyle = 'rgba(191,230,255,0.25)'; cx.fillRect(x + sw * 0.06, y + sh * 0.19, sw * 0.88, 3);
    cx.textAlign = 'left'; cx.fillStyle = '#7fa6c8'; cx.font = `${Math.round(sh * 0.05)}px ${K.SYS}`;
    cx.fillText('File name', x + sw * 0.08, y + sh * 0.29);
    const fx = x + sw * 0.08, fy = y + sh * 0.34, fw = sw * 0.84, fh = sh * 0.14;
    cx.strokeStyle = d && d.saved ? '#3e5c78' : '#5fb2ff'; cx.lineWidth = 4; K.rr(cx, fx, fy, fw, fh, 12); cx.stroke();
    cx.fillStyle = '#ffffff'; cx.font = `${Math.round(fh * 0.56)}px ${K.MONO}`;
    cx.fillText(name, fx + fw * 0.04, fy + fh / 2);
    const tw = cx.measureText(name).width;
    cx.fillStyle = '#5a7590'; cx.fillText('.wav', fx + fw * 0.04 + tw, fy + fh / 2);
    if (!(d && d.saved) && !(pct > 0)) { cx.fillStyle = '#5fb2ff'; cx.fillRect(fx + fw * 0.04 + tw + 2, fy + fh * 0.2, 5, fh * 0.6); }
    // the bar
    const bx = fx, by = y + sh * 0.58, bw = fw, bh = sh * 0.075;
    cx.fillStyle = '#132438'; K.rr(cx, bx, by, bw, bh, bh / 2); cx.fill();
    if (pct > 0) { cx.fillStyle = '#5ae8d6'; K.rr(cx, bx, by, Math.max(bh, bw * pct), bh, bh / 2); cx.fill(); }
    cx.fillStyle = '#9fc4e2'; cx.font = `${Math.round(sh * 0.045)}px ${K.MONO}`; cx.textAlign = 'right';
    cx.fillText(Math.round(pct * 100) + '%', bx + bw, by + bh * 1.9);
    cx.textAlign = 'left';
    if (d && d.saved) {
      cx.fillStyle = '#ffffff'; cx.font = `bold ${Math.round(sh * 0.075)}px ${K.SYS}`;
      cx.fillText('two.wav · saved', bx, y + sh * 0.8);
      cx.strokeStyle = '#5ae8d6'; cx.lineWidth = 7; cx.lineCap = 'round';
      const kx = bx + bw - sh * 0.1, ky = y + sh * 0.8; cx.beginPath(); cx.moveTo(kx - 22, ky); cx.lineTo(kx - 6, ky + 16); cx.lineTo(kx + 24, ky - 18); cx.stroke();
    }
    if (d && d.copy != null) {
      cx.fillStyle = '#7fa6c8'; cx.font = `${Math.round(sh * 0.05)}px ${K.SYS}`;
      cx.fillText('Copy to: phone', bx, y + sh * 0.91);
      cx.fillStyle = '#132438'; K.rr(cx, bx + bw * 0.42, y + sh * 0.895, bw * 0.4, sh * 0.03, 6); cx.fill();
      cx.fillStyle = '#5ae8d6'; K.rr(cx, bx + bw * 0.42, y + sh * 0.895, bw * 0.4 * Math.max(0.04, Math.min(1, d.copy)), sh * 0.03, 6); cx.fill();
    }
  };
  CARDS.s210_export.size = [960, 600];
  // the BAG: the coaster's examine shows the card (the line stays config's)
  if (typeof ITEMS !== 'undefined' && ITEMS.coaster) {
    const line = ITEMS.coaster.examine;
    ITEMS.coaster.examine = async (c) => {
      if (!sk(c)) c.ui.card('s29_coaster');
      try { if (typeof line === 'function') await line(c); else await c.wait(2.4); } finally { c.ui.card(null); }
    };
  }

  // ============================================================ 2.8 — "Quiet Hours"
  const DN = 'd28_noise', DH = ['d28_high_a', 'd28_high_b'], DH_Y = [7.5, 8.0];
  const POST = [-2.5, 0, 26.4], POST_Y = 2.6, POST_FACE = -0.9;
  const TABLE_C = [3.6, 0.78, 31.4];
  const BOX = new THREE.Vector3(-3.6, 3.31, 28.2);
  const CLIMB = [[-3.6, 0, 26.95], [-3.7, 0.9, 27.55], [-3.75, 1.55, 27.85]];
  const MIA_SEAT = [-5.55, 0, 30.4, H];
  // the three inside the Starlight, where they stop after coming in (sl_wide_dusty frames them)
  const IN_END = { luka: [-30.2, 0, -19.6, -2.4], chase: [-31.4, 0, -20.6, -2.2], chase40: [-29.6, 0, -21.2, -2.6] };
  const S28_PUZ = ['s28_code', 's28_lured', 's28_pole', 's28_top', 's28_uke', 's28_uke_down', 's28_phone_back', 's28_got'];
  const S28_ALL = S28_PUZ.concat(['s28_given', 's28_leave', 's28_left', 's28_posters', 's28_desk', 's28_stage', 's28_2ic']);
  const S28 = { phase: 'street', code: '0000', phoneOn: false, lureLive: false, reAi: false, readT: 0, upd: null, listening: false, c: null };
  const CL = { on: false, stage: 0, k: 0, t: 0, wob: false, top: false, down: false, dk: 0, frz: false, held: null };
  const CLIMB_P = { speed: 1 }, HANG_P = { speed: 0.04 };
  const fresh28 = (s) => !s.flags.s28_given && !s.flags.s28_left;
  const post28 = (s) => !!s.flags.s28_given && !s.flags.s28_left;
  function dressV(st) { const S = VS(); if (S && S.dress && world.setId === 'valley') S.dress(st); }
  function lampV(n) { const S = VS(); if (S && S.lamp && world.setId === 'valley') S.lamp(n); }
  function newCode() {
    let s;
    do { s = String(1000 + Math.floor(Math.random() * 9000)); } while (s === S28.code);
    return s;
  }
  // Mia on her bench with her ukulele (playing: the strum)
  function miaSit(c, playing) {
    const m = act(c, 'mia');
    if (!m) return;
    m.rig.show('ukulele', true);
    seatA(m, MIA_SEAT, 0.45, playing ? 'uke' : 'sit');
    m.setExpr(playing ? 'hum' : 'neutral');
  }
  // Mia on the bench, from the mall side: face and ukulele above the dialogue box
  const MIA_MID = (dur) => GLIDE([-3.65, 1.42, 31.25], [-5.45, 0.92, 30.35], 40, [[-3.8, 1.4, 31.18], null, 39], dur);
  function duties28() {
    const F = state.flags;
    if (S28.phase !== 'street' || F.s28_got) return;
    objective.list([
      { text: F.s28_code ? 'The code: ' + S28.code.split('').join(' ') : 'The code (Chase (2040), hold CHIP)', done: !!F.s28_code },
      { text: 'The lure (Chase, a café table)', done: !!F.s28_lured },
      { text: 'The climb (Luka)', done: !!F.s28_uke },
      { text: 'Phone back before the drone finishes “investigating” it', done: !!F.s28_phone_back && !S28.phoneOn },
    ]);
  }
  // the scene's state for the phase it starts in (Continue resumes after the puzzle or in the Starlight)
  function open28(c) {
    const F = c.state.flags;
    S28.phase = F.s28_left ? 'in' : F.s28_given ? 'post' : 'street';
    if (S28.phase === 'street') for (const f of S28_ALL) delete F[f];
    GEN++;
    S28.c = c; S28.phoneOn = false; S28.lureLive = false; S28.readT = 0;
    Object.assign(CL, { on: false, top: false, down: false, frz: false, held: null });
    F.santa = true;
    delete F.chip_off;   // in the Valley he switches his chip back on (2.8's code)
    if (typeof chip !== 'undefined') chip.lightOn(null);
    listen28();
    const l = act(c, 'luka'), ch = act(c, 'chase'), c4 = act(c, 'chase40');
    if (l) { l.rig.show('santa', true); l.habit = null; l.hold(null); l.setExpr('tired'); }
    beardSet(c, 'on');
    if (ch) { ch.hold(null); ch.rig.show('phone', false); ch.setExpr('neutral'); }
    if (c4) { c4.habit = null; c4.setExpr('tired'); }
    if (S28.phase === 'street') {
      dressV('quiet28');
      standA(l, 's28_enter_luka'); standA(ch, 's28_enter_chase'); standA(c4, 's28_enter_c40');
      miaSit(c, true);
      const p = UD(c, 'pole_mia'); if (p) p.meter(null);
    } else if (S28.phase === 'post') {
      dressV('transit28');
      miaSit(c, false);
      standA(l, [-3.4, 0, 30.2, -H]); standA(ch, [-3.0, 0, 31.9, -2.2]); standA(c4, [-2.5, 0, 29.1, -1.9]);
      parkNoise(false);
    } else {
      c.world.env('starlight');
      dressV('dusty28');
      c.world.despawn('mia');
      standA(l, IN_END.luka); standA(ch, IN_END.chase); standA(c4, IN_END.chase40);
    }
  }
  // the noise drone, docked at its post over the bollard (ai: the puzzle's eyes)
  function parkNoise(ai) {
    DRONES.spawn(DN, { kind: 'noise', at: POST, face: POST_FACE, hover: POST_Y, cone: { len: 3.4, half: 0.6 }, showPath: false, ai: !!ai });
  }
  // 2.8_mia step 14: the swoop (paths.d28_swoop): down onto Mia, the claw takes the ukulele, up to the Safe Box on the pole
  // (it docks the ukulele in it), then the post. The flight is goTo legs; goTo's y eases the height along each leg.
  async function swoop(c) {
    const m = act(c, 'mia');
    const end = () => {
      const d = DRONES.get(DN); if (d) { d.hover = POST_Y; }
      DRONES.goTo(DN, POST, { speed: 9, y: POST_Y }); DRONES.face(DN, POST_FACE); DRONES.claw(DN, 0.3, 0);
      const b = UD(c, 'safebox_mia'); if (b) { b.content('uke'); b.door(0); }
      const u = UD(c, 'uke_prop'); if (u) u.place('safebox');
      if (m) { m.rig.show('ukulele', false); seatA(m, MIA_SEAT, 0.45, 'sit'); m.setExpr('tired'); }
    };
    DRONES.spawn(DN, { kind: 'noise', at: [-1.0, 0, 22.0], face: [-4.9, 0, 30.2], hover: 7.0, cone: { len: 3.4, half: 0.6 }, showPath: false, ai: false });
    if (sk(c)) { end(); return; }
    const sid = c.flow.sceneId, alive = () => c.flow.sceneId === sid && !sk(c);
    const leg = (to, h1, speed) => DRONES.goTo(DN, to, { speed, y: h1 });   // the height eases with the flight
    sfx('drone_q', { vol: 0.5 });
    await leg([-4.75, 0, 30.25], 1.55, 4.2);
    if (!alive()) { end(); return; }
    // the claw takes the ukulele
    DRONES.claw(DN, 1, 0.2); await c.wait(0.25);
    sfx('claw', { vol: 0.7 });
    if (m) { m.rig.show('ukulele', false); m.play('sit', { h: 0.45 }); m.setExpr('stunned'); }
    const d = DRONES.get(DN), u = UD(c, 'uke_prop');
    if (d && u) u.follow(d.obj, [0, -0.38, 0.1]);
    DRONES.claw(DN, 0.15, 0.25);
    await c.wait(0.35);
    if (!alive()) { end(); return; }
    await leg([-3.6, 0, 28.2], 4.15, 2.6);
    if (!alive()) { end(); return; }
    // the box opens, the ukulele goes in, the box shuts
    const b = UD(c, 'safebox_mia');
    if (b) b.door(1);
    await c.wait(0.5);
    DRONES.claw(DN, 1, 0.2);
    if (u) u.place('safebox');
    if (b) b.content('uke');
    sfx('dock_clunk', { vol: 0.6 });
    await c.wait(0.35);
    if (b) b.door(0);
    DRONES.claw(DN, 0.3, 0.3);
    await leg(POST, POST_Y, 1.6);
    DRONES.face(DN, POST_FACE);
    if (m) m.setExpr('tired');
  }

  // ---- the puzzle: "Get the ukulele back." (needs all three)
  function spawnHigh() {
    DRONES.spawn(DH[0], { path: [[-3.0, 16.0], [-3.0, 50.0]], speed: 0.6, hover: DH_Y[0], cone: false, ai: false, showPath: false });
    DRONES.spawn(DH[1], { path: [[3.5, 50.0], [3.5, 16.0]], speed: 0.6, hover: DH_Y[1], cone: false, ai: false, showPath: false });
  }
  // back to the start of the puzzle (first time, and every retry): a new code, the ukulele in the box, the phone in
  // Chase's pocket, nobody on the pole
  function reset28(c) {
    GEN++;
    const F = c.state.flags;
    for (const f of S28_PUZ) delete F[f];
    S28.code = newCode();
    AR.set('ar_box_code', { text: S28.code });
    const b = UD(c, 'safebox_mia'); if (b) { b.door(0); b.content('uke'); b.led('red'); }
    const u = UD(c, 'uke_prop'); if (u) u.place('safebox');
    const ph = UD(c, 'phone_drop'); if (ph) ph.show(false);
    const p = UD(c, 'pole_mia'); if (p) p.meter(null);
    S28.phoneOn = false; S28.lureLive = false; S28.reAi = false; S28.readT = 0;
    if (CL.frz) player.frozenT = 0;
    Object.assign(CL, { on: false, stage: 0, k: 0, t: 0, wob: false, top: false, down: false, dk: 0, frz: false, held: null });
    for (let i = 0; i < 2; i++) { const d = DRONES.get(DH[i]); if (d) d.hover = DH_Y[i]; }
    const nd = DRONES.get(DN); if (nd) nd.ai = true;
    const l = act(c, 'luka'); if (l && (l.anim === 'climb' || l.anim === 'reach_up' || l.pos.y > 0.05)) standA(l, 's28_plan_luka');
    const ch = act(c, 'chase'); if (ch) ch.rig.show('phone', false);
    ui.prompt(null);
    duties28();
    testLog('2.8 puzzle reset: code ' + S28.code);
  }
  function puzzleOn(c) {
    if (S28.phase !== 'street') return;
    AR.clear();
    for (const a of (VS() && VS().ar) || []) AR.add(a);
    parkNoise(true);
    spawnHigh();
    reset28(c);
    stealth.begin({
      escortAfter: 1.4, forgetAfter: 2,
      checkpoints: [{ id: 'puzzle', box: [-8.0, 11.0, 8.0, 57.0], at: { luka: 's28_plan_luka', chase: 's28_plan_chase', chase40: 's28_plan_c40' } }],
      onRetry: () => { if (c.flow.sceneId === '2.8' && S28.phase === 'street') reset28(c); },
    });
    watch28();
    objective('Get the ukulele back.');
    duties28();
  }
  function puzzleOff(c) {
    if (S28.phase !== 'street') return;
    stealth.end();
    if (CL.frz) { player.frozenT = 0; CL.frz = false; }
    CL.on = false; S28.reAi = false; S28.lureLive = false;
    const d = DRONES.get(DN); if (d) d.ai = false;
    for (let i = 0; i < 2; i++) { const e = DRONES.get(DH[i]); if (e) e.hover = DH_Y[i]; }
    objective(null);
    c.state.flags.s28_got = true;
  }
  function listen28() {
    if (S28.listening) return;
    S28.listening = true;
    // Signal full: the two high drones come down to him (the soft fail turns everything red, the Safe Room follows)
    on('signal:full', () => {
      if (flow.sceneId !== '2.8' || S28.phase !== 'street' || !stealth.active) return;
      const a = world.actor('chase40');
      if (!a) return;
      for (let i = 0; i < 2; i++) DRONES.goTo(DH[i], [a.pos.x + (i ? 1.2 : -1.2), 0, a.pos.z + 0.8], { speed: 3.2, y: 1.8 });
    });
  }
  // the scene's watcher: the code in Chip View, the climb, the lure running out with the phone still on the table, the
  // party leaving the mall (allocation-free; removes itself when the scene changes)
  function watch28() {
    if (S28.upd) return;
    S28.upd = scope('2.8', tick28, () => { S28.upd = null; if (CL.frz) player.frozenT = 0; CL.on = false; CL.frz = false; });
  }
  function tick28(dt) {
    if (world.setId !== 'valley') return;
    const F = state.flags;
    if (flow.skipping || flow.cutscene || stealth.busy || !(flow.roaming || TEST.auto)) return;
    if (S28.reAi && S28.phase === 'street' && !F.s28_got && DRONES.state(DN) !== 'return') { S28.reAi = false; const d = DRONES.get(DN); if (d) d.ai = true; }
    if (S28.phase === 'street' && !F.s28_got) {
      // the code: Chip View on, near enough, the box on screen
      if (!F.s28_code && !flow.busy && chip.on && state.active === 'chase40') {
        const a = world.actor('chase40');
        if (a && Math.hypot(a.pos.x - BOX.x, a.pos.z - BOX.z) < 6.5 && cam.project(BOX).visible) {
          S28.readT += dt;
          if (S28.readT > 0.7) { F.s28_code = true; hotspots.trigger('h28_code'); }
        } else S28.readT = 0;
      } else S28.readT = 0;
      // the lure ran out with the phone still on the table: the drone has found its owner
      if (S28.lureLive && !flow.busy) {
        const st = DRONES.state(DN);
        if (st === 'return' || st === 'patrol' || st === 'idle') {
          S28.lureLive = false;
          const d = DRONES.get(DN); if (d) d.ai = true;   // back on watch
          if (S28.phoneOn) { testLog('2.8 the lure ran out with the phone on the table'); stealth.softFail('chase'); }
        }
      }
      climbTick(dt);
    } else if (S28.phase === 'post') {
      const a = player.actor;
      if (!F.s28_leave && !flow.busy && a && a.pos.z < 21.8 && a.pos.x > -8 && a.pos.x < 8) F.s28_leave = true;
    }
  }
  // the climb: hold YES to go up the padded bollard and the maintenance rungs (two stages); the pole wobbles when he's
  // slow; NO climbs down. Not a busy action: the drone keeps watching while he's up there.
  function climbStart(c) {
    const l = act(c, 'luka');
    if (!l || CL.on) return;
    standA(l, [CLIMB[0][0], CLIMB[0][1], CLIMB[0][2], 0]);
    Object.assign(CL, { on: true, stage: 0, k: 0, t: 0, wob: false, top: false, down: false, dk: 0, held: null });
    c.state.flags.s28_pole = true;
    l.play('climb', HANG_P);
    ui.prompt('HOLD — Climb');
    if (!c.state.flags.s28_2ic) {
      c.state.flags.s28_2ic = true;
      testLog('2.8 climb: "Second-in-Climbing" (Rue’s "Second-in-Cycling", twisted; here only)');
      if (!sk(c)) { bark('chase', 'You’re the 2IC.'); bark('luka', 'That’s not what 2IC means.'); bark('chase', 'Second-in-Climbing.'); }
    }
  }
  function climbTick(dt) {
    if (!CL.on) return;
    const l = world.actor('luka');
    if (!l) return;
    const me = state.active === 'luka';
    if (me && !flow.busy) { if (player.frozenT < 0.5) player.frozen(1); CL.frz = true; }
    else if (CL.frz && !me) { player.frozenT = 0; CL.frz = false; }
    if (flow.busy) return;
    if (CL.down) {   // down the rungs and off the bollard
      CL.dk = Math.min(1, CL.dk + dt / 1.3);
      const u = 1 - CL.dk, s = u >= 0.5 ? 1 : 0, k = u >= 0.5 ? (u - 0.5) * 2 : u * 2, A = CLIMB[s], B = CLIMB[s + 1], e = k * k * (3 - 2 * k);
      l.pos.set(A[0] + (B[0] - A[0]) * e, A[1] + (B[1] - A[1]) * e, A[2] + (B[2] - A[2]) * e);
      if (CL.dk >= 1) climbEnd(l);
      return;
    }
    if (CL.top) return;
    if (me && !TEST.auto && input.pressed('no')) { input.consume('no'); CL.down = true; CL.dk = 1 - (CL.stage + CL.k) / 2; ui.prompt(null); return; }
    const held = me && (TEST.auto || input.holding('yes'));
    if (held !== CL.held) { CL.held = held; l.play('climb', held ? CLIMB_P : HANG_P); }
    CL.t += dt;
    if (CL.t > 4 && !CL.wob) { CL.wob = true; const p = world.prop('pole_mia'); if (p) p.userData.wobble(0.035); }
    if (held) CL.k += dt / (TEST.auto ? 0.8 : 1.3);
    if (CL.k >= 1) {
      CL.stage++; CL.k = 0; CL.t = 0; CL.wob = false;
      sfx('thud', { vol: 0.25, rate: 1.4 });
      if (CL.stage >= 2) {
        CL.stage = 2; CL.top = true; state.flags.s28_top = true;
        l.pos.set(CLIMB[2][0], CLIMB[2][1], CLIMB[2][2]); l.play('reach_up');
        ui.prompt(null); hotspots.reset();
        return;
      }
    }
    const A = CLIMB[CL.stage], B = CLIMB[CL.stage + 1], e = CL.k * CL.k * (3 - 2 * CL.k);
    l.pos.set(A[0] + (B[0] - A[0]) * e, A[1] + (B[1] - A[1]) * e, A[2] + (B[2] - A[2]) * e);
  }
  function climbEnd(l) {
    CL.on = false; CL.down = false; CL.top = false;
    if (CL.frz) { player.frozenT = 0; CL.frz = false; }
    l.place([-3.75, 0, 26.45, PI]);
    l.play('idle');
    const F = state.flags;
    delete F.s28_pole; delete F.s28_top;
    if (F.s28_uke) F.s28_uke_down = true;
    if (F.s28_uke_down && F.s28_phone_back && !S28.phoneOn) F.s28_got = true;
    ui.prompt(null); hotspots.reset();
    duties28();
  }
  // Luka types the code at the top
  async function typeCode(c) {
    const F = c.state.flags;
    if (!F.s28_code) { toast(c, 'The code is AR. Chase (2040) can read it in Chip View.'); return; }
    const b = UD(c, 'safebox_mia');
    const shot = glideCam([-2.72, 3.85, 27.3], [-3.42, 3.22, 27.9], 36, [[-2.76, 3.82, 27.34], null, 35], 6);
    // the 2.2 keypad (54-mg-keypad), labelled for the box
    const r = await c.flow.minigame('keypad', { digits: 4, code: S28.code, test: S28.code, shot, onKey: (k) => { if (b) b.press(k); },
      title: 'SAFE BOX', prompt: 'ENTER RELEASE CODE', okText: 'RELEASED', badText: 'INCORRECT CODE' });
    if (c.flow.sceneId !== '2.8') return;
    if (r && r.ok) {
      if (b) { b.led('green'); b.door(1); }
      if (!sk(c)) sfx('access_granted', { vol: 0.35 });
      await c.wait(0.6);
      if (b) b.content(null);
      const l = act(c, 'luka'), u = UD(c, 'uke_prop');
      if (l && u) u.follow(l.rig.parts.handR, [0.0, -0.1, 0.06]);
      F.s28_uke = true;
      CL.down = true; CL.dk = 0;
      if (l) l.play('climb', CLIMB_P);
      duties28();
      testLog('2.8 the box is open');
    }
    await c.cam.release(0.4);
  }
  // Chase puts his phone on table C and plays a sample at full volume: drones within 9.5 m come and look (louder = longer)
  async function dropPhone(c) {
    const ch = act(c, 'chase');
    if (!ch) return;
    const side = ch.pos.x > TABLE_C[0] ? 's28_pick' : 's28_drop';
    await c.runSteps([{ move: 'chase', to: side }, { face: 'chase', to: [TABLE_C[0], 0, TABLE_C[2]], dur: 0.2 }]);
    // across the table at him: his face, the phone over the table, Mia's bench behind (the set's s28_cafe_table anchor
    // looks down at the bare table past his elbow)
    if (!sk(c)) {
      const w = side === 's28_drop' ? 1 : -1, x0 = TABLE_C[0];
      c.cam.shot(glideCam([x0 + 1.3 * w, 1.55, 32.3], [x0 - 0.5 * w, 1.0, 31.3], 46, [[x0 + 1.18 * w, 1.52, 32.22], null, 45], 6));
    }
    const list = c.state.samples.filter((k) => SAMPLES[k]);
    if (!list.length) list.push('radio');
    const labels = list.map((k) => SAMPLES[k].label).concat(['Cancel']);
    let best = 0;   // autoplay: the laugh, else the longest lure
    for (let j = 0; j < list.length; j++) { const a = SAMPLES[list[j]].lure, b = SAMPLES[list[best]].lure; if (list[j] === 'laugh' || (list[best] !== 'laugh' && a && b && a.dur > b.dur)) best = j; }
    const i = await c.choose(labels, { test: best });
    if (!(i >= 0 && i < list.length)) { await c.cam.release(0.3); return; }
    const k = list[i], L = (SAMPLES[k] && SAMPLES[k].lure) || { r: 5, dur: 4 }, dur = 4 + 2.2 * L.dur;
    ch.rig.show('phone', true);
    ch.play('give', { dur: 0.9, loop: false });
    await c.wait(0.5);
    ch.rig.show('phone', false);
    const ph = UD(c, 'phone_drop'); if (ph) { ph.show(true); ph.pulse(true, Math.min(1, L.dur / 10)); }
    S28.phoneOn = true;
    DRONES.lure(TABLE_C, k, { r: 9.5, dur, over: true, y: 2.1, disc: 0.6, transfixed: true });   // transfixed by the noise: it sees nothing else until it's done
    S28.lureLive = true;
    c.state.flags.s28_lured = true;
    delete c.state.flags.s28_phone_back;
    duties28();
    testLog('2.8 lure ' + k + ' for ' + dur.toFixed(1) + ' s');
    // the drone turns to the sound and floats over to it
    if (!sk(c)) c.cam.shot(glideCam([4.4, 2.0, 35.8], [-0.6, 2.0, 27.6], 50, [[4.2, 2.05, 35.4], [0.8, 1.9, 29.2], 48], 2.4));   // clear of table D's umbrella
    await c.wait(1.6);
    await c.cam.release(0.4);
  }
  async function pickPhone(c) {
    const ch = act(c, 'chase');
    if (!ch) return;
    const side = ch.pos.x > TABLE_C[0] ? 's28_pick' : 's28_drop';
    await c.runSteps([{ move: 'chase', to: side }, { face: 'chase', to: [TABLE_C[0], 0, TABLE_C[2]], dur: 0.2 }]);
    ch.play('give', { dur: 0.8, loop: false });
    await c.wait(0.35);
    const ph = UD(c, 'phone_drop'); if (ph) ph.show(false);
    S28.phoneOn = false; S28.lureLive = false;
    if (DRONES.state(DN) === 'lured') { DRONES.release(DN); const d = DRONES.get(DN); if (d) d.ai = false; S28.reAi = true; }   // the sound stops: back to its post (on watch again there)
    else { const d = DRONES.get(DN); if (d) d.ai = true; }
    c.state.flags.s28_phone_back = true;
    if (c.state.flags.s28_uke_down) c.state.flags.s28_got = true;
    duties28();
    testLog('2.8 phone back');
  }

  // ---- after the puzzle: Mia, the Ukulele sample, the urn; leave the mall
  function postOn(c) {
    if (S28.phase === 'in') return;
    S28.phase = 'post';
    const F = c.state.flags;
    F.s28_given = true; F.s28_got = true;
    watch28();
    objective('The Starlight. Ann Street.');
    duties28p();
  }
  function duties28p() { objective.list([{ text: 'Ukulele (optional)', done: state.samples.includes('uke') }]); }
  function postOff(c) { if (S28.phase === 'post') objective(null); }
  // "Make it sound good." Chase holds his phone out; Mia strums; the take
  async function recordUke(c) {
    await c.runSteps([
      { move: 'chase', to: [-4.35, 0, 29.55] }, { face: 'chase', to: 'mia', dur: 0.25 },
      { do: (cc) => {
        const a = act(cc, 'chase'); if (a) { a.rig.show('phone', true); a.play('give', { dur: 3.2, loop: false }); }
        const l = act(cc, 'luka'), c4 = act(cc, 'chase40');
        if (l && l.pos.z > 28.6 && l.pos.x < -1.6) l.place([-2.2, 0, 28.9, -2.0]);
        if (c4 && c4.pos.z > 28.6 && c4.pos.x < -1.6) c4.place([-1.9, 0, 30.5, -1.9]);
      } },
      GLIDE([-3.55, 1.38, 32.6], [-5.0, 1.1, 30.1], 44, [[-3.65, 1.38, 32.45], null, 43], 6),
      { wait: 0.4 },
      say('mia', 'Make it sound good.', { expr: 'neutral' }),
      { do: (cc) => { const m = act(cc, 'mia'); if (m) { m.play('uke'); m.setExpr('hum'); } } },
      { sfx: 'smp_uke', vol: 0.7 },
      { wait: 1.4 },
      { sample: 'uke' },
      { do: (cc) => { testLog('sample uke'); const a = act(cc, 'chase'); if (a) a.rig.show('phone', false); const m = act(cc, 'mia'); if (m) { m.play('sit', { h: 0.45 }); m.setExpr('neutral'); } duties28p(); } },
      { wait: 0.6 },
    ]);
    await c.cam.release(0.5);
  }

  // ---- the Starlight (short)
  function insideOn(c) {
    S28.phase = 'in';
    c.state.flags.s28_left = true;
    objective('The Starlight.');
    duties28i();
  }
  function duties28i() {
    const F = state.flags;
    objective.list([
      { text: 'Gig posters', done: !!F.s28_posters },
      { text: 'The mixing desk', done: !!F.s28_desk },
      { text: 'The stage', done: !!F.s28_stage },
      { text: 'Kettle (green room)', done: !!F.s28_kettle },
    ]);
  }
  function insideOff(c) { objective(null); }
  const tick28i = (f) => ({ do: () => { state.flags[f] = true; duties28i(); } });

  SCENES['2.8'] = {
    title: 'Quiet Hours', set: 'valley', env: 'quiet', time: '19:30', place: 'Fortitude Valley',
    playable: ['luka', 'chase', 'chase40'], swap: false, music: 'quiet',
    hud: { noService: false, quiet: '16:28:00', samples: true, bars: null },
    spawn: { luka: 's28_enter_luka', chase: 's28_enter_chase', chase40: 's28_enter_c40', mia: 's28_mia' },
    hotspots: [
      // the café's tea urn on the street: the save point (spec 13.1)
      { id: 'h28_urn', at: [7.75, 1.1, 30.0], r: 1.3, verb: 'Use', kettle: true, when: (s) => !s.flags.s28_left },
      // the code: read in Chip View (the watcher triggers it; never live by hand)
      { id: 'h28_code', at: [0, 0, -999], r: 0.01, when: () => false,
        steps: [
          { do: (c) => { duties28(); if (!sk(c)) { const s = aShot('s28_box_code', 0.06, 4); if (s) c.cam.shot(s); AR.show(false); c.ui.card('s28_code', { code: S28.code }); c.sfx('chip_chime', { vol: 0.4 }); } } },
          { wait: 2.6 },
          { do: (c) => { c.ui.card(null); AR.show(null); testLog('2.8 code read: ' + S28.code); } },
        ] },
      // the lure: Chase's phone on café table C
      { id: 'h28_drop', at: [TABLE_C[0], 0, TABLE_C[2]], r: 1.45, only: 'chase', verb: 'Put your phone down', when: (s) => S28.phase === 'street' && !S28.phoneOn && !s.flags.s28_got, do: (c) => dropPhone(c) },
      { id: 'h28_pick', at: [TABLE_C[0], 0, TABLE_C[2]], r: 1.45, only: 'chase', verb: 'Take your phone', when: () => S28.phoneOn, do: (c) => pickPhone(c) },
      // the climb (Luka only), the keypad at the top
      { id: 'h28_climb', at: [CLIMB[0][0], 0, CLIMB[0][2]], r: 0.95, only: 'luka', verb: 'Climb', when: (s) => S28.phase === 'street' && !CL.on && !s.flags.s28_uke, do: (c) => climbStart(c) },
      { id: 'h28_keypad', at: [CLIMB[2][0], 0, CLIMB[2][2]], r: 0.9, only: 'luka', verb: 'Type the code', when: () => CL.on && CL.top && !CL.down, do: (c) => typeCode(c) },
      // after the puzzle: the Ukulele sample (Chase), at Mia
      { id: 'h28_uke_sample', at: 'mia', r: 1.7, only: 'chase', verb: 'Record', when: (s) => S28.phase === 'post' && !s.samples.includes('uke'), do: (c) => recordUke(c) },
      // the Starlight: posters, desk, stage, the green-room kettle
      { id: 'h28_posters', at: [-41.7, 0, -23.5], r: 1.6, when: (s) => S28.phase === 'in',
        steps: [
          aPush('sl_poster_hero', 0.1, 6),
          { do: (c) => c.runSteps([say(c.state.active, 'Every band that played here before the Quiet.')]) },
          CLOSE('chase40', { dist: 1.0, yaw: 0.2, fov: 34 }),
          say('chase40', 'I saw half of these.', { expr: 'fond' }),
          tick28i('s28_posters'),
        ] },
      { id: 'h28_desk', at: [-34.7, 0, -25.25], r: 1.45, when: (s) => S28.phase === 'in',
        steps: [
          aPush('sl_desk', 0.12, 7),
          say('chase', 'Does it work?'),
          CLOSE('chase40', { dist: 1.0, yaw: 0.25, fov: 34 }),
          say('chase40', 'Everything works if you shout at it.', { expr: 'tired' }),
          tick28i('s28_desk'),
        ] },
      { id: 'h28_stage', at: [-35.5, 0, -17.3], r: 1.6, when: (s) => S28.phase === 'in',
        steps: [
          aPush('sl_stage', 0.25, 7),
          say('chase', 'Ever played here?'),
          CLOSE('chase40', { dist: 1.0, yaw: 0.25, fov: 34, push: 0.08 }),
          { wait: 0.6 },
          slow('chase40', '…Nearly.', { expr: 'still' }),
          { wait: 0.5 },
          tick28i('s28_stage'),
        ] },
      { id: 'h28_kettle', at: [-43.3, 1.0, -14.0], r: 1.15, verb: 'Use', kettle: true, flag: 's28_kettle', when: (s) => S28.phase === 'in',
        do: () => { const g = world.prop('green_room'); if (g && g.userData.kettle_steam && !flow.skipping) g.userData.kettle_steam(); duties28i(); } },
    ],
    steps: [
      ['cutscene', '2.8_crane'],
      ['cutscene', '2.8_mia'],
      ['cutscene', '2.8_plan'],
      // ▶ PLAY — "Get the ukulele back." (needs all three)
      ['control', 'chase40'],
      ['follow', null],
      ['swap', true],
      ['do', (c) => puzzleOn(c)],
      ['roam', {
        until: (s) => !!(s.flags.s28_got || s.flags.s28_given || s.flags.s28_left),
        hint: { after: 150, steps: [{ do: (c) => { const F = c.state.flags; toast(c, !F.s28_code ? 'Chase (2040): hold CHIP near the pole to read the Safe Box.' : !F.s28_lured ? 'Chase: put your phone down on a café table.' : 'Luka: climb the bollard while the drone is busy.'); } }] },
        async auto(c) {
          if (S28.phase !== 'street' || c.state.flags.s28_got) return;
          const T = (id) => c.hotspots.trigger(id), F = c.state.flags, gone = () => c.flow.sceneId !== '2.8';
          for (let tries = 0; tries < 3 && !gone() && !F.s28_got; tries++) {
            const n0 = stealth.captures || 0, caught = () => (stealth.captures || 0) > n0 || stealth.busy;
            await until(() => !stealth.busy || gone(), 20);
            // the code: Chase (2040) to his read spot, Chip View on
            swapTo(c, 'chase40');
            await walk(c, ['s28_c40_read'], false);
            if (typeof chip !== 'undefined') chip.peek(1.6);
            await until(() => F.s28_code || gone(), 4);
            if (!F.s28_code) { F.s28_code = true; await T('h28_code'); }
            await until(() => !flow.busy || gone(), 6);
            // the lure: Chase drops his phone on table C (autoplay picks the laugh)
            swapTo(c, 'chase');
            await walk(c, ['s28_drop']);
            await T('h28_drop');
            if (!S28.phoneOn) { console.error('TWO 2.8: the phone is not on the table'); break; }
            await until(() => { const d = DRONES.get(DN); return !d || Math.hypot(d.x - TABLE_C[0], d.z - TABLE_C[2]) < 1.6 || caught() || gone(); }, 12);
            // the climb (Luka), the code at the top, down again
            swapTo(c, 'luka');
            await walk(c, [[-2.2, 0, 25.4], [CLIMB[0][0], 0, CLIMB[0][2]]]);
            if (!caught()) await T('h28_climb');
            await until(() => CL.top || caught() || gone(), 12);
            if (!caught()) await T('h28_keypad');
            await until(() => F.s28_uke_down || caught() || gone(), 12);
            // the phone back before the drone gives up on it
            swapTo(c, 'chase');
            if (!caught()) await T('h28_pick');
            await until(() => F.s28_got || caught() || gone(), 4);
            if (F.s28_got || gone()) break;
            console.error('TWO 2.8: the puzzle failed under autoplay (try ' + (tries + 1) + ')');
          }
        },
      }],
      ['do', (c) => puzzleOff(c)],
      ['cutscene', '2.8_starlight'],
      ['control', 'chase'],
      ['follow', true],
      ['do', (c) => postOn(c)],
      ['roam', {
        until: (s) => !!(s.flags.s28_leave || s.flags.s28_left),
        async auto(c) {
          if (S28.phase !== 'post') return;
          swapTo(c, 'chase');
          await c.hotspots.trigger('h28_uke_sample');
          if (!c.state.samples.includes('uke')) console.error('TWO 2.8: the Ukulele sample was not recorded');
          await walk(c, [[5.6, 0, 29.4]], false);
          await c.hotspots.trigger('h28_urn');
          await walk(c, [[2.0, 0, 24.0], [0.6, 0, 21.0]]);
          c.state.flags.s28_leave = true;
        },
      }],
      ['do', (c) => postOff(c)],
      ['cutscene', '2.8_leave'],
      ['do', (c) => insideOn(c)],
      // ▶ PLAY — The Starlight (short)
      ['roam', {
        until: (s) => !!(s.flags.s28_posters && s.flags.s28_desk && s.flags.s28_stage),
        async auto(c) {
          const T = (id) => c.hotspots.trigger(id);
          swapTo(c, 'chase');
          await walk(c, [[-31.0, 0, -21.0], [-34.7, 0, -24.6]], false);
          await T('h28_desk');
          await walk(c, [[-38.0, 0, -22.6], [-41.2, 0, -23.4]], false);
          await T('h28_posters');
          await walk(c, [[-38.0, 0, -20.2], [-42.0, 0, -18.6], [-42.35, 0, -16.6], [-42.4, 0, -14.6]], false);
          await T('h28_kettle');
          await walk(c, [[-42.3, 0, -17.4], [-41.6, 0, -18.6], [-36.0, 0, -17.9]], false);
          await T('h28_stage');
        },
      }],
      ['do', (c) => insideOff(c)],
      ['cutscene', '2.8_end'],
    ],
    grants: { flags: { santa: true, chip_off: false, s28_got: true, s28_given: true, s28_leave: true, s28_left: true, s28_posters: true, s28_desk: true, s28_stage: true },
      samples: ['uke'], quiet: '15:38:00', noService: false },
  };

  // Cutscene — "2.8_crane." Fortitude Valley at night in Quiet Hours; then the three walk the mall.
  const ENTER_TO = { luka: [-0.2, 0, 25.6], chase: [0.9, 0, 26.2], chase40: [-1.4, 0, 26.9] };
  CUTSCENES['2.8_crane'] = [
    { do: (c) => nextTick().then(() => open28(c)) },
    { if: fresh28, then: [
      { fade: 'out', dur: 0 },
      { loop: 'uke', vol: 0.45, at: [-5.4, 1.0, 30.4] },
      // [CRANE · down] the tower's countdown band in the storm (QUIET IN 16:28:00), down past the dimmed neon and the
      // NAP CLUB sign to Ann Street and the head of the mall: foam on every bollard, whispers, shushing drones
      { do: (c) => {
        testLog('2.8 crane: the neon at “safe brightness”');
        if (sk(c)) return;
        const a = AN('s28_crane_a'), b = AN('s28_crane_b');
        if (a && b) c.cam.shot({ shot: 'CAM', pos: a.from.slice(), look: a.at.slice(), fov: a.fov, to: { pos: b.from.slice(), look: b.at.slice(), fov: b.fov }, dur: 5.5, ease: 'in' });
      } },
      { fade: 'in', dur: 1.4 },
      { sfx: 'thunder_far', vol: 0.6 },
      { wait: 4.1 },
      { do: (c) => {
        if (sk(c)) return;
        const b = AN('s28_crane_b');
        if (b) c.cam.shot({ shot: 'CAM', pos: b.from.slice(), look: b.at.slice(), fov: b.fov, to: { pos: [-1.3, 3.7, 5.8], look: [0.0, 0.9, 17.0], fov: 48 }, dur: 4.6, ease: 'out' });
      } },
      { wait: 4.4 },
      // they start down the mall, away from the lens
      { do: (c) => {
        route(c, 'luka', [ENTER_TO.luka], { speed: 1.25, face: -0.5 });
        route(c, 'chase', [[1.35, 0, 15.6], ENTER_TO.chase], { speed: 1.25, face: -0.7 });
        route(c, 'chase40', [ENTER_TO.chase40], { speed: 1.25, face: -1.05 });
      } },
      { wait: 1.6 },
      // [TRACK · the three of them walking the mall] (set anchors s28_track_a -> _b: the lens keeps ahead of them all the
      // way to their marks)
      { do: (c) => {
        if (sk(c)) return;
        const a = AN('s28_track_a'), b = AN('s28_track_b');
        if (a && b) c.cam.shot({ shot: 'CAM', pos: a.from.slice(), look: a.at.slice(), fov: a.fov, to: { pos: b.from.slice(), look: b.at.slice(), fov: b.fov }, dur: 10.5, ease: 'linear' });
      } },
      { wait: 3.0 },
      say('chase', 'This used to be the loudest place in Brisbane.', { tag: 'whisper', expr: 'worried' }),
      say('chase40', 'That’s why it went first.', { tag: 'whisper', expr: 'tired' }),
      { do: (c) => until(() => { const a = act(c, 'chase40'); return !a || sk(c) || Math.hypot(a.pos.x - ENTER_TO.chase40[0], a.pos.z - ENTER_TO.chase40[2]) < 0.2; }, 3) },
    ] },
  ];

  // Cutscene — "2.8_mia."
  CUTSCENES['2.8_mia'] = [
    { if: fresh28, then: [
      { do: (c) => { for (const id in ENTER_TO) { const a = act(c, id); if (a && Math.hypot(a.pos.x - ENTER_TO[id][0], a.pos.z - ENTER_TO[id][2]) > 0.3) a.place(ENTER_TO[id]); } } },
      { face: 'luka', to: 'mia', dur: 0.4 }, { face: 'chase', to: 'mia', dur: 0.4 },
      // [MID] On a bench in the mall, MIA plays at whisper volume. A QR tip sign; nobody tips. The 1987 Pudding song.
      aPush('s28_mia_mid', 0.3, 7),
      { wait: 3.0 },
      // [CLOSE · Chase (2040)] He stops dead.
      { face: 'chase40', to: 'mia', dur: 0.5 },
      aPush('s28_c40_close', 0.1, 6),
      { expr: [['chase40', 'stunned']] },
      { wait: 1.3 },
      say('chase40', '…What’s that?', { expr: 'stunned' }),
      // Mia, still playing
      MIA_MID(8),
      say('mia', 'The Optus hold music. First song I ever learned. ^ My nan used to put me on hold so I’d go to sleep.'),
      // CHASE (pointing at Chase (2040))
      { do: (c) => { if (!sk(c)) c.cam.shot(glideCam([-4.6, 1.45, 31.85], [-0.2, 1.5, 26.4], 46, [[-4.75, 1.45, 31.75], null, 44], 9)); } },
      { face: 'chase', to: 'chase40', dur: 0.3 },
      { act: [['chase', 'point']] },
      say('chase', 'That’s his song.', { expr: 'happy' }),
      { act: [['chase', 'idle']] },
      { face: 'chase', to: 'mia', dur: 0.3 },
      MIA_MID(6),
      say('mia', 'Sure it is, grandpa.', { expr: 'neutral' }),
      CLOSE('chase40', { dist: 1.0, yaw: 0.2, fov: 34, push: 0.06 }),
      say('chase40', 'It is, actually.', { expr: 'still' }),
      MIA_MID(6),
      say('mia', 'Then why’d you only make one?'),
      // (Chase (2040) has no answer.)
      CLOSE('chase40', { dist: 0.95, yaw: 0.15, fov: 32, push: 0.08, dur: 5 }),
      { expr: [['chase40', 'sad']] },
      { wait: 1.8 },
      { do: (c) => { if (!sk(c)) c.cam.shot(glideCam([-4.6, 1.45, 31.85], [-0.2, 1.5, 26.4], 46, [[-4.7, 1.45, 31.8], null, 45], 8)); } },
      say('chase', 'He’s working on a second one.', { expr: 'determined' }),
      MIA_MID(5),
      say('mia', 'Since when?'),
      CLOSE('chase40', { dist: 0.95, yaw: 0.2, fov: 32, push: 0.05 }),
      { wait: 0.6 },
      slow('chase40', '…2026.', { expr: 'tired' }),
      MIA_MID(5),
      say('mia', 'Wow.', { expr: 'stunned' }),
      { do: (c) => { const p = UD(c, 'pole_mia'); if (p) p.meter(41.5); } },
      { wait: 0.3 },
      // [WIDE] A noise drone swoops down: a claw takes the ukulele; the drone docks it in the padded Safe Box on the pole
      GLIDE([2.4, 2.5, 35.4], [-2.9, 2.0, 28.8], 50, [[2.1, 2.45, 35.0], null, 48], 9),
      { sfx: 'meter_full', vol: 0.4 },
      { par: [
        { do: (c) => swoop(c) },
        { do: (c) => c.wait(0.5).then(() => { if (!sk(c)) c.sfx('drone_red', { vol: 0.4 }); }) },
        { do: (c) => c.wait(1.0).then(() => c.runSteps([say('drone', 'Instrument exceeds 40 dB! ^ Confiscated for your safety!')])) },
      ] },
      { loop: 'uke', stop: true, fade: 0.2 },
      { do: (c) => { const p = UD(c, 'pole_mia'); if (p) p.meter(null); } },
      { wait: 0.4 },
      // MIA: the third one this month (the trumpet and the tambourine in the other poles' boxes)
      GLIDE([-3.4, 0.9, 32.4], [-5.0, 1.3, 30.0], 50, [[-3.5, 0.92, 32.25], null, 48], 6),   // low: Mia, the bench, the pole going up
      say('mia', 'That’s the third one this month.', { expr: 'tired' }),
    ] },
  ];

  // Cutscene — "2.8_plan." Chase looks from the drone to the pole to the café tables: the idea engine.
  CUTSCENES['2.8_plan'] = [
    { if: fresh28, then: [
      { do: (c) => {
        const m = { luka: [1.55, 0, 28.15, -2.3], chase: 's28_plan_chase', chase40: 's28_plan_c40' };
        for (const id in m) { const a = act(c, id); if (a) { a.place(m[id]); a.play('idle'); } }
        const c4 = act(c, 'chase40'); if (c4) c4.setExpr('tired');
      } },
      // [MID · Chase, looking from the drone to the pole to the café tables]
      CLOSE('chase', { dist: 1.75, yaw: 0.35, fov: 42, push: 0.15, dur: 7 }),
      glance('chase', [-2.5, 0, 26.4], 1.2),
      { wait: 1.2 },
      glance('chase', [-3.6, 0, 28.2], 1.1),
      { wait: 1.1 },
      glance('chase', [3.6, 0, 31.4], 1.2),
      { wait: 1.1 },
      { expr: [['chase', 'happy']] },
      // "Okay. ^ Okay okay okay. ^ Hear me out." — [ORBIT · around Chase, speeding up] Rue's idea-engine shot
      { par: [
        say('chase', 'Okay. ^ Okay okay okay. ^ Hear me out.', { expr: 'happy' }),
        { do: (c) => c.wait(1.05).then(() => { if (!sk(c) && c.flow.sceneId === '2.8') c.cam.shot({ shot: 'ORBIT', size: 'MID', on: 'chase', dist: 2.4, height: 0.05, from: 25, to: -70, ease: 'in', dur: 4.2, spin: true }); }) },
      ] },
      { act: [['chase', 'gesture']] },
      { wait: 1.6 },
      // [CLOSE · Chase (2040), watching his younger self do it]
      { act: [['chase', 'idle']] },
      { face: 'chase40', to: 'chase', dur: 0.3 },
      CLOSE('chase40', { dist: 1.0, yaw: 0.3, fov: 32, push: 0.1, dur: 6 }),
      { wait: 1.0 },
      slow('chase40', '…I used to do that.', { tag: 'quietly', expr: 'still' }),
      { wait: 0.6 },
    ] },
  ];

  // Cutscene — "2.8_starlight." Luka gives Mia her ukulele back.
  CUTSCENES['2.8_starlight'] = [
    { if: (s) => !s.flags.s28_given, then: [
      { do: (c) => {
        const ch = act(c, 'chase'), c4 = act(c, 'chase40'), l = act(c, 'luka');
        if (ch) { ch.hold(null); ch.rig.show('phone', false); standA(ch, [-3.0, 0, 31.9, -2.2]); }
        if (c4) standA(c4, [-2.5, 0, 29.1, -1.9]);
        if (l && Math.hypot(l.pos.x + 4.4, l.pos.z - 30.4) > 3.5) standA(l, [-2.4, 0, 30.6, -H]);
        miaSit(c, false);
        const m = act(c, 'mia'); if (m) { m.rig.show('ukulele', false); m.setExpr('tired'); }
      } },
      GLIDE([-3.0, 1.45, 32.9], [-5.0, 1.0, 30.2], 46, [[-3.1, 1.45, 32.75], null, 45], 8),
      { move: 'luka', to: [-4.45, 0, 29.95] },
      { face: 'luka', to: 'mia', dur: 0.25 },
      { act: [['luka', 'give', { dur: 1.2, loop: false }]] },
      { wait: 0.5 },
      // MIA (taking the ukulele)
      { do: (c) => { const u = UD(c, 'uke_prop'); if (u) u.hide(); const m = act(c, 'mia'); if (m) { m.rig.show('ukulele', true); m.setExpr('neutral'); } c.state.flags.s28_given = true; dressV('transit28'); } },
      { wait: 0.4 },
      GLIDE([-3.9, 1.32, 31.7], [-5.45, 1.0, 30.4], 40, [[-4.0, 1.3, 31.6], null, 39], 8),
      say('mia', '…Thanks.'),
      say('mia', 'You need somewhere to sleep? You look like you need somewhere to sleep.', { expr: 'neutral' }),
      GLIDE([-6.3, 1.5, 28.4], [-4.7, 1.3, 30.6], 46, [[-6.2, 1.5, 28.55], null, 45], 9),
      say('mia', 'The Starlight. Ann Street. Shut when Quiet Hours came in. Back door doesn’t lock. Nobody goes there.'),
      glance('luka', 'chase', 0.9),
      { act: [['luka', 'nod']] },
      { wait: 0.8 },
    ] },
    { do: (c) => { if (S28.phase === 'in' || c.state.flags.s28_left) return; c.state.flags.s28_given = true; S28.phase = 'post'; parkNoise(false); } },
  ];

  // Cutscene — "2.8_leave." As they leave, Mia calls after Chase (2040); the walk past the Chinatown gate to the stage door.
  const GATE_FROM = { luka: [-16.8, 0, 9.0, -H], chase: [-15.9, 0, 9.5, -H], chase40: [-17.8, 0, 8.7, -H] };
  CUTSCENES['2.8_leave'] = [
    { if: (s) => !s.flags.s28_left, then: [
      { do: (c) => {
        dressV('transit28');
        miaSit(c, false);
        const marks = { luka: 's28_leave_luka', chase: 's28_leave_chase', chase40: 's28_leave_c40' };
        for (const id in marks) { const a = act(c, id); if (a && a.pos.z > 23.5) standA(a, marks[id]); }
        route(c, 'luka', [[-0.4, 0, 16.0]], { speed: 1.3 });
        route(c, 'chase', [[0.8, 0, 16.4]], { speed: 1.3 });
        route(c, 'chase40', [[-1.0, 0, 19.2]], { speed: 1.05 });
      } },
      // from behind Mia as they go
      aPush('s28_leave', 0.35, 9),
      { wait: 1.4 },
      // MIA (at whisper volume)
      say('mia', 'Hey. Grandpa. ^ Finish it, yeah?', { tag: 'whisper' }),
      { do: (c) => { GEN++; const a = act(c, 'chase40'); if (a) a.place([a.pos.x, 0, a.pos.z]); } },
      { face: 'chase40', to: 'mia', dur: 0.6, wait: true },
      CLOSE('chase40', { dist: 1.05, yaw: 0.15, fov: 32, push: 0.08, dur: 6 }),
      { wait: 1.1 },
      slow('chase40', '…Yeah.', { expr: 'still' }),
      { wait: 1.0 },
      { fade: 'out', dur: 0.7 },
      // the S footpath of Ann Street, past the Chinatown gate: the lanterns still, a bag tumbling past them
      { do: (c) => {
        GEN++;
        for (const id in GATE_FROM) standA(act(c, id), GATE_FROM[id]);
        route(c, 'luka', ['s28_t_gate_luka', [-30.0, 0, 6.0]], { speed: 1.4 });
        route(c, 'chase', ['s28_t_gate_chase', [-29.2, 0, 6.6]], { speed: 1.4 });
        route(c, 'chase40', ['s28_t_gate_c40', [-30.8, 0, 6.4]], { speed: 1.3 });
        if (!sk(c)) c.cam.shot(glideCam([-15.0, 1.6, 5.2], [-19.6, 1.55, 9.4], 46, [[-24.6, 1.6, 5.2], [-29.4, 1.9, 10.4], 46], 7));
      } },
      { fade: 'in', dur: 0.6 },
      { wait: 5.4 },
      { fade: 'out', dur: 0.6 },
      // the stage door, across Ann Street: Luka pushes it (it opens: the back door doesn't lock)
      { do: (c) => {
        GEN++;
        standA(act(c, 'luka'), [-28.4, 0, -7.6, PI]); standA(act(c, 'chase'), [-29.55, 0, -8.35, 2.8]); standA(act(c, 'chase40'), [-26.75, 0, -8.7, -2.9]);
        route(c, 'luka', ['s28_door_out'], { speed: 1.2, face: PI });
      } },
      aPush('s28_stage_door_ext', 0.4, 6),
      { fade: 'in', dur: 0.5 },
      { wait: 1.2 },
      { act: [['luka', 'push', { dur: 1.2, loop: false }]] },
      { wait: 0.4 },
      { do: (c) => { const d = UD(c, 'stage_door'); if (d) d.open(1); } },
      { sfx: 'creak', vol: 0.45 },
      { wait: 1.4 },
      { do: (c) => { route(c, 'luka', [[-28.4, 0, -10.6]], { speed: 1.0 }); } },
      { wait: 0.8 },
      { fade: 'out', dur: 0.8 },
      // inside: the Starlight, dusty and dead, by phone torch
      { env: 'starlight' },
      { do: (c) => {
        GEN++;
        dressV('dusty28');
        c.world.despawn('mia');
        c.state.flags.s28_left = true;
        standA(act(c, 'luka'), [-28.5, 0, -15.0, PI]); standA(act(c, 'chase'), [-28.0, 0, -13.8, PI]); standA(act(c, 'chase40'), [-28.8, 0, -12.6, PI]);
        route(c, 'luka', [[-28.6, 0, -17.2], IN_END.luka], { speed: 1.1, face: IN_END.luka[3] });
        route(c, 'chase', [[-28.4, 0, -16.6], [-29.4, 0, -18.4], IN_END.chase], { speed: 1.1, face: IN_END.chase[3] });
        route(c, 'chase40', [[-28.5, 0, -16.2], [-29.0, 0, -19.4], IN_END.chase40], { speed: 0.95, face: IN_END.chase40[3] });
      } },
      aPush('sl_wide_dusty', 0.8, 9),
      { fade: 'in', dur: 0.9 },
      { wait: 4.2 },
    ] },
    { do: (c) => { c.state.flags.s28_left = true; S28.phase = 'in'; } },
  ];

  // the end of 2.8: the three of them in the dead venue (back where they came in: the wide frames them); the torch clicks off
  CUTSCENES['2.8_end'] = [
    { do: (c) => { GEN++; for (const id in IN_END) standA(act(c, id), IN_END[id]); } },
    aPush('sl_wide_dusty', 0.6, 6),
    { wait: 2.2 },
    { sfx: 'tick', vol: 0.4 },
    { do: () => lampV('off') },
    { wait: 0.6 },
    { fade: 'out', dur: 1.2 },
    { do: (c) => { AR.clear(); DRONES.clear(); } },
  ];

  // ============================================================ 2.9 — "Lights Out"
  const S29_FLAGS = ['s29_note', 's29_left', 's29_door', 's29_stay'];
  const SLEEP = { chase: 's29_chase', luka: 's29_luka', chase40: 's29_c40' };
  const HEADS = [[-35.6, -22.8], [-36.6, -22.8], [-38.3, -23.1]];
  const LUKA_UP = [-37.1, 0, -23.35, PI];
  const DOOR_BOX = [-29.0, -12.6, -27.8, -11.3];
  const Z29 = { on: false, stir: 0, px: 0, pz: 0, inC: [false, false, false, false, false], warned: false, upd: null };
  // the long locked floor setup (Rue's Lights Out): an 80 s push in from the set's anchors
  function floorPush(c) {
    if (sk(c)) return;
    const a = AN('s29_floor'), b = AN('s29_floor_end');
    if (a && b) c.cam.shot({ shot: 'CAM', pos: a.from.slice(), look: a.at.slice(), fov: a.fov, to: { pos: b.from.slice(), look: b.at.slice(), fov: b.fov }, dur: 80, ease: 'linear' });
  }
  // the push finishes on them whatever the reading speed: glide the rest of the way from wherever it is
  function settlePush(c) {
    if (sk(c)) return;
    const b = AN('s29_floor_end'), cm = c.world.camera;
    if (!b || !cm) return;
    const p = cm.position;
    if (Math.hypot(p.x - b.from[0], p.y - b.from[1], p.z - b.from[2]) < 0.02) return;
    cm.getWorldDirection(V1);
    c.cam.shot({ shot: 'CAM', pos: [p.x, p.y, p.z], look: [p.x + V1.x * 1.4, p.y + V1.y * 1.4, p.z + V1.z * 1.4], fov: cm.fov, to: { pos: b.from.slice(), look: b.at.slice(), fov: b.fov }, dur: 2.4 });
  }
  // the venue floor at 01:10: three bodies under coats between the stage and the bar, heads toward the bar
  function sleepers(c, who) {
    const co = UD(c, 'coats_sleep');
    if (co) { co.show(7); for (let i = 0; i < 3; i++) co.lift(i, 0); }
    for (const id of who) { const a = act(c, id); if (a) { a.hold(null); lieA(a, SLEEP[id]); a.setExpr('sleep'); } }
  }
  function open29(c) {
    const F = c.state.flags;
    for (const f of S29_FLAGS) delete F[f];
    F.santa = true;
    GEN++;
    dressV('night29');
    sleepers(c, ['chase', 'luka', 'chase40']);
    const l = act(c, 'luka'); if (l) { l.rig.show('santa', true); l.rig.show('brick', false); l.rig.show('coaster', false); }
    beardSet(c, 'on');
    const ch = act(c, 'chase'); if (ch) { ch.rig.show('coaster', false); ch.rig.show('brick', false); ch.rig.show('phone', false); }
    const d = UD(c, 'stage_door'); if (d) d.open(0);
    const k = UD(c, 'coaster'); if (k) k.place('bar');
    Object.assign(Z29, { on: false, stir: 0, warned: false }); for (let i = 0; i < 5; i++) Z29.inC[i] = false;
  }
  function duties29() {
    const F = state.flags;
    objective.list([
      { text: 'A note (the bar)', done: !!F.s29_note },
      { text: 'Leave it with Chase', done: !!F.s29_left },
      { text: 'The stage door', done: !!F.s29_door },
    ]);
  }
  // the stir: running, walking right past a sleeper's head and the creaky boards wake people; at 100 someone rolls over
  // and mumbles and Luka goes back to his spot (no game over). Allocation-free.
  const CREAKS = () => (VS() && VS().creaks) || [];
  function tick29(dt) {
    if (!Z29.on || world.setId !== 'valley' || flow.skipping || flow.busy || flow.cutscene || !(flow.roaming || TEST.auto)) return;
    const a = world.actor('luka');
    if (!a || state.active !== 'luka') return;
    const F = state.flags;
    const moved = Math.hypot(a.pos.x - Z29.px, a.pos.z - Z29.pz) > 0.25 * dt;
    Z29.px = a.pos.x; Z29.pz = a.pos.z;
    Z29.stir = Math.max(0, Z29.stir - 10 * dt);
    if (moved && player.running) Z29.stir += 55 * dt;
    else if (moved) for (let i = 0; i < 3; i++) if (i !== 1 && Math.hypot(a.pos.x - HEADS[i][0], a.pos.z - HEADS[i][1]) < 0.9) { Z29.stir += 16 * dt; break; }
    const C = CREAKS();
    for (let i = 0; i < C.length && i < 5; i++) {
      const inside = Math.hypot(a.pos.x - C[i][0], a.pos.z - C[i][1]) < C[i][2];
      if (inside && !Z29.inC[i]) { Z29.stir += 45; sfx('creak', { vol: 0.55, rate: 1.25 }); testLog('2.9 creak ' + i); }
      Z29.inC[i] = inside;
    }
    if (Z29.stir > 55 && !Z29.warned) {   // someone shifts in their sleep
      Z29.warned = true;
      const co = world.prop('coats_sleep'); if (co) co.userData.lift(Z29.near = nearSleeper(a), 0.12);
      sfx('cloth_swish', { vol: 0.3 });
    } else if (Z29.stir < 25 && Z29.warned) { Z29.warned = false; const co = world.prop('coats_sleep'); if (co) co.userData.lift(Z29.near || 0, 0); }
    if (Z29.stir >= 100) { Z29.stir = 0; hotspots.trigger('h29_stir'); return; }
    if (F.s29_left && !F.s29_door && a.pos.x > DOOR_BOX[0] && a.pos.x < DOOR_BOX[2] && a.pos.z > DOOR_BOX[1] && a.pos.z < DOOR_BOX[3]) { F.s29_door = true; duties29(); }
  }
  function nearSleeper(a) {   // coats_sleep index: 0 Chase, 1 Luka, 2 Chase (2040)
    let best = 0, bd = 1e9;
    for (let i = 0; i < 3; i++) { const d = Math.hypot(a.pos.x - HEADS[i][0], a.pos.z - HEADS[i][1]); if (i !== 1 && d < bd) { bd = d; best = i; } }
    return best;
  }
  function sneakOn(c) {
    Z29.on = true;
    const a = act(c, 'luka'); if (a) { Z29.px = a.pos.x; Z29.pz = a.pos.z; }
    if (!Z29.upd) Z29.upd = scope('2.9', tick29, () => { Z29.upd = null; Z29.on = false; });
    objective('Leave.');
    duties29();
  }
  function sneakOff(c) { Z29.on = false; objective(null); }

  SCENES['2.9'] = {
    title: 'Lights Out', set: 'valley', env: 'lights_out', time: 'Monday 24 December 2040, 01:10', place: 'The Starlight, Ann Street',
    playable: ['luka'], swap: false, music: null,
    hud: { noService: false, quiet: '10:48:00', samples: false, bars: null },
    spawn: { chase: 's29_chase', luka: 's29_luka', chase40: 's29_c40' },
    hotspots: [
      // at the bar: "Write a note? [YES]" (the only option)
      { id: 'h29_note', at: [-37.0, 0, -29.9], r: 1.05, only: 'luka', verb: 'Write a note', when: (s) => !s.flags.s29_note,
        ask: { q: 'Write a note?', noDisabled: true, test: true,
          yes: [
            { face: 'luka', to: [-37.0, 0, -31.0], dur: 0.25 },
            { do: (c) => { const a = act(c, 'luka'); if (a) { a.rig.show('coaster', true); a.play('write_note'); } } },
            { sfx: 'marker_squeak', vol: 0.15, rate: 1.6 },
            // [INSERT] On a beer coaster, in biro: I'll do it. — L.
            { do: (c) => { const k = UD(c, 'coaster'); if (k) k.write(); if (!sk(c)) { const s = aShot('s29_coaster', 0.06, 5); if (s) c.cam.shot(s); c.ui.card('s29_coaster'); } } },
            { wait: 3.2 },
            { do: (c) => { c.ui.card(null); const k = UD(c, 'coaster'); if (k) k.place([-37.0, -3.0, -31.0]); const a = act(c, 'luka'); if (a) a.play('idle'); } },
            { item: 'coaster' },
            { flag: 's29_note' },
            { do: () => duties29() },
          ] } },
      // on Chase's chest
      { id: 'h29_leave', at: [-34.9, 0, -22.4], r: 0.95, only: 'luka', verb: 'Leave it', when: (s) => !!s.flags.s29_note && !s.flags.s29_left,
        steps: [
          { move: 'luka', to: [-34.85, 0, -22.45] }, { face: 'luka', to: [-35.6, 0, -22.35], dur: 0.25 },
          { wait: 0.3 },
          { do: (c) => { const a = act(c, 'luka'); if (a) a.play('kneel'); } },
          GLIDE([-35.9, 1.25, -20.9], [-35.4, 0.25, -22.35], 40, [[-35.86, 1.2, -21.0], null, 38], 4),
          { wait: 0.8 },
          { do: (c) => { const k = UD(c, 'coaster'); if (k) k.place('chest_chase'); const a = act(c, 'luka'); if (a) a.rig.show('coaster', false); } },
          { sfx: 'cloth_swish', vol: 0.2 },
          { wait: 1.2 },
          { do: (c) => { const a = act(c, 'luka'); if (a) a.play('idle'); } },
          { flag: 's29_left' },
          { do: () => duties29() },
        ] },
      // the soft fail (the watcher triggers it): someone rolls over and mumbles; back to his spot
      { id: 'h29_stir', at: [0, 0, -999], r: 0.01, when: () => false,
        do: async (c) => {
          const co = UD(c, 'coats_sleep'), n = Z29.near || 0;
          if (co) co.lift(n, 0.3);
          if (!sk(c)) c.sfx('groan', { vol: 0.25, lp: 900 });
          testLog('2.9 someone stirs: back to the spot');
          await c.wait(0.9);
          await c.ui.fade(1, 0.4);
          const a = act(c, 'luka'); if (a) standA(a, LUKA_UP);
          if (co) co.lift(n, 0);
          Z29.stir = 0; Z29.warned = false;
          await c.wait(0.3);
          c.ui.fade(0, 0.5);
        } },
      // the green-room kettle (a save point, if he wants one)
      { id: 'h29_kettle', at: [-43.3, 1.0, -14.0], r: 1.1, only: 'luka', verb: 'Use', kettle: true,
        do: () => { const g = world.prop('green_room'); if (g && g.userData.kettle_steam && !flow.skipping) g.userData.kettle_steam(); } },
    ],
    steps: [
      ['cutscene', '2.9_floor'],
      // ▶ PLAY — "Leave."
      ['control', 'luka'],
      ['do', (c) => sneakOn(c)],
      ['roam', {
        until: 's29_door',
        async auto(c) {
          const T = (id) => c.hotspots.trigger(id), F = c.state.flags;
          // threads between the creaks, at a walk
          await walk(c, [[-37.6, 0, -24.4], [-37.6, 0, -27.4], [-37.0, 0, -29.6]], false);
          await T('h29_note');
          await walk(c, [[-37.6, 0, -27.4], [-37.6, 0, -24.6], [-34.6, 0, -23.6], [-34.85, 0, -22.6]], false);
          await T('h29_leave');
          await walk(c, [[-33.6, 0, -21.0], [-31.4, 0, -19.6], [-28.6, 0, -19.0], [-28.6, 0, -16.4], [-29.3, 0, -15.2], [-29.2, 0, -13.2], [-28.4, 0, -12.1]], false);
          await until(() => F.s29_door, 3);
          if (!F.s29_door) { console.error('TWO 2.9: did not reach the stage door (' + [F.s29_note, F.s29_left].join(',') + ')'); F.s29_door = true; }
        },
      }],
      ['do', (c) => sneakOff(c)],
      ['cutscene', '2.9_door'],
      ['cutscene', '2.9_lights_out'],
    ],
    grants: { flags: { santa: true, s29_note: true, s29_left: true, s29_door: true, s29_stay: true }, items: ['coaster'], quiet: '10:48:00', noService: false },
  };

  // Cutscene — "2.9_floor." One locked setup, low on the floor: three bodies under coats, heads toward camera; the storm
  // on the roof, neon through a high window turning the rain-shadows pink and teal. Chase (2040) snores softly.
  CUTSCENES['2.9_floor'] = [
    { do: (c) => nextTick().then(() => open29(c)) },
    { fade: 'out', dur: 0 },
    { do: (c) => floorPush(c) },
    { loop: 'snore', vol: 0.32, at: [-38.3, 0.25, -23.1] },
    { fade: 'in', dur: 1.6 },
    { wait: 3.2 },
    { sfx: 'thunder_far', vol: 0.5 },
    { wait: 1.6 },
    // Then: Luka sits up, carefully.
    { do: (c) => { const co = UD(c, 'coats_sleep'); if (co) co.lift(1, 0.6); const a = act(c, 'luka'); if (a) { a.place([-36.6, 0, -22.45, 0]); a.play('sit_floor_wall'); a.setExpr('tired'); } } },
    { sfx: 'cloth_swish', vol: 0.25 },
    { wait: 1.8 },
    // He looks at Chase.
    glance('luka', 'chase', 2.4),
    { expr: [['luka', 'sad']] },
    { wait: 2.4 },
    // He reaches over and takes the brick phone out of Chase (2040)'s coat pocket.
    // (from sitting, shuffled over: a kneel would put his head out of the low locked frame)
    { do: (c) => { const co = UD(c, 'coats_sleep'); if (co) co.lift(1, 1); const a = act(c, 'luka'); if (a) { a.place([-37.45, 0, -22.75, -H]); a.play('sit_floor_wall'); a.play('give', { dur: 2.4, loop: false }); } } },
    { wait: 1.4 },
    { do: (c) => { const a = act(c, 'luka'); if (a) a.rig.show('brick', true); } },
    { sfx: 'cloth_swish', vol: 0.3 },
    { wait: 1.0 },
    glance('luka', 'chase40', 1.4),
    { wait: 1.4 },
    { do: (c) => { if (!sk(c)) c.cam.shot({ shot: 'CAM', pos: [-43.3, 0.55, -19.2], look: [-29.0, 0.35, -21.0], fov: 40 }); } },
    { do: (c) => { const a = act(c, 'luka'); if (a) { a.rig.show('brick', false); standA(a, LUKA_UP); a.setExpr('tired'); } } },
    { wait: 1.0 },
  ];

  // Cutscene — "2.9_door." The stage door, Ann Street in the rain. Played straight.
  const L_TURN = [-28.4, 0, -11.6, PI], C_WING = [-29.0, 0, -14.9, 0.1], C_NEAR = [-28.8, 0, -13.6, 0.1], C_CLOSE = [-28.6, 0, -12.6, 0.1];
  CUTSCENES['2.9_door'] = [
    { do: (c) => {
      c.state.flags.s29_door = true;
      standA(act(c, 'luka'), [-28.4, 0, -11.5, 0]);   // inside, behind the shut door: it opens on him
      const ch = act(c, 'chase');
      if (ch) { standA(ch, C_WING); ch.rig.show('coaster', true); ch.setExpr('neutral'); }
      const k = UD(c, 'coaster'); if (k) k.place([-28.0, -3.0, -14.0]);
      const co = UD(c, 'coats_sleep'); if (co) { co.show(4); }
    } },
    // [MID · the stage door, from outside on Ann Street, rain falling between camera and Luka] He pushes the bar.
    { env: 'annst' },
    aPush('s29_door_out', 0.3, 8),
    { act: [['luka', 'push', { dur: 1.2, loop: false }]] },
    { wait: 0.5 },
    { do: (c) => { const d = UD(c, 'stage_door'); if (d) d.open(1); } },
    { sfx: 'creak', vol: 0.4 },
    { wait: 0.9 },
    // into the doorway, the rain in front of him
    { move: 'luka', to: [-28.4, 0, -11.2], speed: 0.7 },
    { wait: 0.5 },
    // CHASE (off, behind him)
    say('chase', 'Where are you going?', { tag: 'off' }),
    { expr: [['luka', 'stunned']] },
    { face: 'luka', to: PI, dur: 0.6, wait: true },
    // [REVERSE · Chase in the dark of the venue, the coaster in his hand] He's been awake the whole time.
    // (Luka to his turn mark under the cut: the anchors are set for it)
    { do: (c) => { const a = act(c, 'luka'); if (a) { a.place(L_TURN); a.play('idle'); } } },
    aPush('s29_reverse', 0.15, 7, { fovTo: 33 }),
    { wait: 1.4 },
    aPush('s29_luka_close', 0.12, 8),
    say('luka', 'HQ.', { expr: 'determined' }),
    aPush('s29_reverse', 0.12, 6, { fov: 32, fovTo: 31 }),
    say('chase', 'On your own.', { expr: 'neutral' }),
    aPush('s29_luka_close', 0.18, 8),
    say('luka', 'If it’s just me, it’s just me that gets hurt.', { expr: 'sad' }),
    { move: 'chase', to: C_NEAR, speed: 0.9 },
    GLIDE([-27.62, 1.6, -11.7], [-28.85, 1.42, -13.6], 36, [[-27.66, 1.6, -11.82], null, 35], 6),
    say('chase', 'That’s not how it works.', { expr: 'determined' }),
    // side-on from the wing: both of them in profile, the doorway's light and the rain behind Luka
    GLIDE([-30.9, 1.6, -12.5], [-28.6, 1.35, -12.55], 46, [[-30.75, 1.59, -12.5], null, 45], 10),
    say('luka', 'Every version where I’m near you, something happens to you. ^ I said ‘go left’, and you got zapped. I ring you on a Sunday, and—', { expr: 'sad' }),
    // (he points back into the dark, where Chase (2040) is asleep)
    { face: 'luka', to: [-37.5, 0, -22.0], dur: 0.3 },
    { act: [['luka', 'point']] },
    say('luka', '—his HAND, Chase.', { expr: 'tearful' }),
    { act: [['luka', 'idle']] },
    { face: 'luka', to: 'chase', dur: 0.3 },
    GLIDE([-27.62, 1.6, -11.7], [-28.85, 1.42, -13.6], 35, [[-27.66, 1.6, -11.84], null, 34], 7),
    say('chase', 'So you’re going to go and do it on your own and not tell anyone.', { expr: 'determined' }),
    aPush('s29_luka_close', 0.24, 8),
    say('luka', 'I’m going to keep you safe.', { expr: 'determined' }),
    GLIDE([-27.62, 1.6, -11.7], [-28.85, 1.42, -13.6], 34, [[-27.66, 1.6, -11.86], null, 33], 8),
    say('chase', 'That’s what you DID.', { expr: 'determined' }),
    say('chase', 'You went back in on your own, and he got fourteen years of not finishing anything.', { expr: 'sad' }),
    aPush('s29_luka_close', 0.3, 8, { fovTo: 33 }),
    say('luka', 'That’s not fair.', { expr: 'tearful' }),
    GLIDE([-30.9, 1.6, -12.5], [-28.6, 1.35, -12.55], 45, [[-30.78, 1.59, -12.5], null, 44], 9),
    slow('chase', 'No. ^ It’s not.', { expr: 'sad' }),
    // (Rain. A long beat, 3 s.)
    aPush('s29_door_wide', 0.5, 5, { fov: 24 }),
    { wait: 3 },
    { move: 'chase', to: C_CLOSE, speed: 0.8 },
    { face: 'chase', to: 'luka', dur: 0.3 },
    TWO('chase', 'luka', { side: 1, dist: 1.6, fov: 42, dur: 9 }),
    say('chase', 'You don’t get to decide that for me.', { expr: 'determined' }),
    say('chase', 'If I get hurt, I get hurt. That’s mine. You don’t get to take it off me.', { expr: 'sad' }),
    // [CLOSE · Luka] His hand goes to his lanyard. Twists it. Stops.
    { do: (c) => closeOn(c, 'luka', { dist: 1.0, yaw: 0.35, fov: 36, dy: -0.12, ly: -0.12, dur: 7, push: 0.1 }) },
    { act: [['luka', 'lanyard']] },
    { wait: 1.6 },
    { act: [['luka', 'lanyard', { still: true }]] },
    { wait: 0.7 },
    { act: [['luka', 'idle']] },
    slow('luka', '…I don’t know how to not.', { expr: 'tearful' }),
    TWO('chase', 'luka', { side: 1, dist: 1.5, fov: 40, dur: 8 }),
    slow('chase', 'Then don’t know how. ^ Just stay.', { expr: 'neutral' }),
    // [INSERT] Luka puts the brick phone in Chase's hand.
    // (Chase a step back under the cut: the two reaching hands meet over the brick instead of crossing)
    { do: (c) => { const a = act(c, 'luka'); if (a) a.rig.show('brick', true); const ch = act(c, 'chase'); if (ch) { ch.rig.show('coaster', false); ch.place([C_CLOSE[0], 0, C_CLOSE[2] - 0.22, C_CLOSE[3]]); } } },
    aPush('s29_hands', 0.12, 5),
    { act: [['luka', 'give', { dur: 1.8, loop: false }]] },
    { wait: 0.5 },
    { act: [['chase', 'give', { dur: 1.6, loop: false }]] },
    { wait: 0.5 },
    { do: (c) => { const a = act(c, 'luka'); if (a) a.rig.show('brick', false); const ch = act(c, 'chase'); if (ch) ch.rig.show('brick', true); } },
    { flag: 's29_stay' },
    { wait: 1.6 },
    { fade: 'out', dur: 1.0 },
    { do: (c) => { const d = UD(c, 'stage_door'); if (d) d.open(0); const ch = act(c, 'chase'); if (ch) ch.rig.show('brick', false); } },
  ];

  // Cutscene — "2.9_lights_out." The same locked floor setup, the two of them back under their coats. (Rue's 2.9, in reverse.)
  CUTSCENES['2.9_lights_out'] = [
    { env: 'lights_out' },
    { loop: 'snore', stop: true, fade: 0.1 },
    { do: (c) => {
      sleepers(c, ['chase', 'luka', 'chase40']);
      const k = UD(c, 'coaster'); if (k) k.place('chest_chase');
      for (const id of ['luka', 'chase', 'chase40']) { const a = act(c, id); if (a) a.setExpr(id === 'chase40' ? 'still' : 'neutral'); }
    } },
    { do: (c) => floorPush(c) },
    { fade: 'in', dur: 1.2 },
    { wait: 1.6 },
    slow('luka', 'Chase? ^ You awake?'),
    slow('chase', 'No.'),
    { wait: 0.9 },
    slow('luka', '…Thanks.'),
    slow('chase', 'For what?'),
    slow('luka', 'Being awake.'),
    // (Beat.)
    { wait: 1.3 },
    slow('chase', 'Night, Luka.'),
    slow('luka', 'Night, mate.'),
    { do: (c) => settlePush(c) },
    { do: (c) => { for (const id of ['luka', 'chase']) { const a = act(c, id); if (a) a.setExpr('sleep'); } } },
    { wait: 1.2 },
    // (Two seconds of dark and rain.)
    { fade: 'out', dur: 0.9 },
    { wait: 2 },
    // [CLOSE · Chase (2040), in the dark] The only cut. His eyes are open. They have been the whole time.
    { expr: [['chase40', 'neutral']] },
    aPush('s29_c40_dark', 0.07, 9),
    { fade: 'in', dur: 0.6 },
    { wait: 1.4 },
    slow('chase40', 'Would yous two shut up. Some of us have a—', { expr: 'still' }),
    // (He stops.)
    { wait: 0.8 },
    slow('chase40', '…Some of us have a song to finish.', { expr: 'still' }),
    { wait: 0.6 },
    // (He gets up.)
    { do: (c) => { const co = UD(c, 'coats_sleep'); if (co) co.lift(2, 1); const a = act(c, 'chase40'); if (a) { a.place([-38.3, 0, -22.6, 0]); a.play('sit_floor_wall'); } } },
    GLIDE([-37.2, 1.0, -21.0], [-38.3, 0.75, -22.6], 44, [[-37.25, 1.05, -21.1], null, 43], 3),
    { sfx: 'cloth_swish', vol: 0.3 },
    { wait: 1.2 },
    { fade: 'out', dur: 0.9 },
  ];

  // ============================================================ 2.10 — "3:00 am"
  let SONG = null;
  function stopSong(f = 0.4) { if (SONG) { try { SONG.stop(f); } catch (e) { /* gone */ } SONG = null; } }
  // the desk at 3 am: Chase (2040) on the stool behind the half-alive desk, Chase on the amp, Luka asleep on the floor
  function open210(c) {
    const F = c.state.flags;
    F.santa = true;
    GEN++;
    dressV('three210');
    const c4 = act(c, 'chase40'), ch = act(c, 'chase'), l = act(c, 'luka');
    if (c4) { c4.hold(null); seatA(c4, 's210_c40_desk', 0.62); c4.setExpr('tired'); }
    if (ch) { ch.hold(null); ch.rig.show('brick', false); ch.rig.show('coaster', false); ch.rig.show('phone', false); ch.rig.show('headphones_head', false); seatA(ch, 's210_chase_amp', 0.5); ch.setExpr('neutral'); }
    if (l) { lieA(l, 's210_luka_sleep'); l.setExpr('sleep'); l.rig.show('santa', true); }
    beardSet(c, 'eyes');
    const hp = UD(c, 'headphones_desk'); if (hp) hp.show(true);
    const sl = UD(c, 'slate_desk'); if (sl) { sl.screen('seq'); sl.slide(0); }
    const ds = UD(c, 'foh_desk'); if (ds) ds.state('half');
    const ck = UD(c, 'wall_clock_sl'); if (ck) ck.set(3, 0);
    stopSong(0);
  }

  SCENES['2.10'] = {
    title: '3:00 am', set: 'valley', env: 'three_am', time: '3:00 am', place: 'The Starlight',
    playable: ['chase'], swap: false, music: null,
    hud: { noService: false, quiet: '08:58:00', samples: false, bars: null },
    spawn: { chase40: 's210_c40_desk', chase: 's210_chase_amp', luka: 's210_luka_sleep' },
    hotspots: [],
    steps: [
      ['cutscene', '2.10_promise'],
      // ▶ PLAY — Sequencer: "two" (9.10). The ONE MORE PASS / IT'S DONE loop and its lines live in the mini-game.
      ['minigame', 'sequencer', {}],
      ['cutscene', '2.10_bounce'],
    ],
    grants: { get pattern() { return MINIGAMES.sequencer && MINIGAMES.sequencer.pattern ? MINIGAMES.sequencer.pattern(state.samples) : null; },
      flags: { santa: true, s210_done: true }, quiet: '08:06:00', noService: false },
  };

  // Cutscene — "2.10_promise."
  CUTSCENES['2.10_promise'] = [
    { do: (c) => nextTick().then(() => open210(c)) },
    { fade: 'out', dur: 0 },
    // [WIDE · the stage] the dead desk half-alive, cables everywhere, the slate plugged in, headphones; Chase on an amp
    aPush('s210_wide_stage', 0.5, 9),
    { fade: 'in', dur: 1.2 },
    { wait: 2.4 },
    TWO('chase40', 'chase', { side: 1, dist: 2.6, fov: 44, dur: 10 }),
    { wait: 0.4 },
    say('chase40', 'Can I ask you something?', { expr: 'tired' }),
    say('chase', 'You’re me. You can just remember.', { expr: 'smug' }),
    { do: (c) => closeOn(c, 'chase40', { dist: 1.05, yaw: 0.35, fov: 34, dur: 8 }) },
    slow('chase40', 'I don’t remember this.', { expr: 'still' }),
    { do: (c) => closeOn(c, 'chase', { dist: 1.0, yaw: -0.4, fov: 34, dur: 6 }) },
    { wait: 0.4 },
    say('chase', '…Right.', { expr: 'neutral' }),
    { do: (c) => closeOn(c, 'chase40', { dist: 1.0, yaw: 0.35, fov: 33, dur: 10, push: 0.15 }) },
    say('chase40', 'Promise me something.', { expr: 'still' }),
    say('chase', 'What?', { tag: 'off' }),
    slow('chase40', 'Keep making music. ^ Bad music. Finish it. Put it out. Let people hear the bad bits. Let them hear the bridge that isn’t right.', { expr: 'tired' }),
    TWO('chase40', 'chase', { side: 1, dist: 2.5, fov: 44, dur: 12 }),
    slow('chase40', 'A song nobody hears isn’t perfect. ^ It’s just quiet.', { expr: 'still' }),
    { do: (c) => closeOn(c, 'chase40', { dist: 0.95, yaw: 0.3, fov: 32, dur: 8, push: 0.1 }) },
    slow('chase40', 'Don’t do what I did.', { expr: 'sad' }),
    // [CLOSE · Chase]
    { do: (c) => closeOn(c, 'chase', { dist: 0.95, yaw: -0.35, fov: 32, dur: 7, push: 0.1 }) },
    { wait: 1.2 },
    slow('chase', '…I will.', { expr: 'neutral' }),
    // CHASE (2040) (sliding the slate across the desk to him)
    aPush('s210_desk_two', 0.15, 6),
    { act: [['chase40', 'give', { dur: 1.4, loop: false }]] },
    { do: (c) => { const sl = UD(c, 'slate_desk'); if (sl) sl.slide(1); } },
    { sfx: 'card_slide', vol: 0.35 },
    { wait: 0.6 },
    say('chase40', 'Then finish it.', { expr: 'still' }),
    // held into the sequencer (its own lens is INSERT s210_desk_two): no ease back to the room camera in between
    { do: (c) => { const s = aShot('s210_desk_two', 0, 1); if (s) c.cam.shot(s); c.cam.cutscene = false; } },
  ];

  // Cutscene — "2.10_bounce."
  CUTSCENES['2.10_bounce'] = [
    { do: (c) => {
      const ck = UD(c, 'wall_clock_sl'), r = c.flow.result;
      testLog('2.10 sequencer: ' + (r ? ['passes ' + r.passes, r.quick ? 'quick' : '', r.dragged ? 'dragged' : '', r.time || ''].join(' ') : '-'));
      if (!c.state.pattern && MINIGAMES.sequencer && MINIGAMES.sequencer.pattern) c.state.pattern = MINIGAMES.sequencer.pattern(c.state.samples);
      const ds = UD(c, 'foh_desk'); if (ds) ds.state('half');
      const sl = UD(c, 'slate_desk'); if (sl) sl.screen('export');
      const ch = act(c, 'chase'); if (ch) { ch.rig.show('headphones_head', false); ch.rig.show('headphones_held', false); ch.rig.show('phone', false); }
      const hp = UD(c, 'headphones_desk'); if (hp) hp.show(true);
      if (ck && r && r.time) { const m = /(\d+):(\d+)/.exec(r.time); if (m) ck.set(+m[1], +m[2]); }
    } },
    // [INSERT · the slate] EXPORT. A file name field. Chase types: two. A progress bar fills, and it doesn't go backwards.
    { do: (c) => { if (!sk(c)) { const s = aShot('s210_slate', 0.05, 9); if (s) c.cam.shot(s); c.ui.card('s210_export', { name: '' }); } } },
    { wait: 0.9 },
    { do: async (c) => {
      const w = 'two';
      for (let i = 1; i <= w.length && !sk(c); i++) { c.ui.card('s210_export', { name: w.slice(0, i) }); c.sfx('key_type', { vol: 0.3, rate: 0.95 + i * 0.04 }); await c.wait(0.32); }
      for (let p = 0; p <= 1.0001 && !sk(c); p += 0.04) { c.ui.card('s210_export', { name: w, pct: p }); await c.wait(p < 0.6 ? 0.07 : 0.1); }
    } },
    { do: (c) => { const sl = UD(c, 'slate_desk'); if (sl) sl.screen('saved'); if (!sk(c)) { c.ui.card('s210_export', { name: 'two', pct: 1, saved: true }); c.sfx('chime_ready', { vol: 0.3 }); } } },
    { wait: 1.4 },
    // He copies it to his phone too.
    { do: (c) => { const a = act(c, 'chase'); if (a) { a.rig.show('phone', true); a.play('type_phone'); } } },
    { do: async (c) => { for (let p = 0; p <= 1.0001 && !sk(c); p += 0.1) { c.ui.card('s210_export', { name: 'two', pct: 1, saved: true, copy: p }); await c.wait(0.08); } } },
    { do: (c) => { c.ui.card(null); closeOn(c, 'chase', { dist: 1.05, yaw: -0.45, fov: 36, dur: 5 }); } },
    say('chase', 'Backup.', { expr: 'smug' }),
    { do: (c) => { const a = act(c, 'chase'); if (a) { a.rig.show('phone', false); a.play('sit', { h: 0.5 }); } } },
    // [CLOSE · Chase, lit by the slate] He puts the headphones on and presses play. Only the faint bleed.
    aPush('s210_chase_close', 0.12, 12),
    { act: [['chase', 'hold_headphones_up']] },
    { do: (c) => { const hp = UD(c, 'headphones_desk'); if (hp) hp.show(false); } },
    { wait: 1.0 },
    { do: (c) => { const a = act(c, 'chase'); if (a) { a.rig.show('headphones_held', false); a.rig.show('headphones_head', true); a.play('sit', { h: 0.5 }); a.setExpr('still'); } } },
    { wait: 0.5 },
    { sfx: 'button_press', vol: 0.25 },
    { do: (c) => { stopSong(0); if (!sk(c) && typeof AUDIO !== 'undefined' && AUDIO.song) SONG = AUDIO.song({ pattern: c.state.pattern, from: 'INTRO', to: 'CHORUS', bleed: true, gain: 0.9 }); } },
    { wait: 3.2 },
    { expr: [['chase', 'sad']] },
    { wait: 2.2 },
    // (Rue 3.3: "He takes the headphones off and just sits there.") He takes them off and just sits there.
    { do: (c) => {
      testLog('2.10: ' + 'He takes the headphones off and just sits there.');
      stopSong(0.5);
      const a = act(c, 'chase'); if (a) { a.rig.show('headphones_head', false); a.setExpr('still'); }
      const hp = UD(c, 'headphones_desk'); if (hp) hp.show(true);
    } },
    { wait: 2.4 },
    TWO('chase40', 'chase', { side: 1, dist: 2.6, fov: 44, dur: 10 }),
    slow('chase40', 'Is it done?', { expr: 'still' }),
    say('chase', 'It’s done.', { expr: 'neutral' }),
    { do: (c) => closeOn(c, 'chase40', { dist: 1.0, yaw: 0.35, fov: 33, dur: 8 }) },
    slow('chase40', '…Can I hear it?', { expr: 'still' }),
    { do: (c) => closeOn(c, 'chase', { dist: 1.0, yaw: -0.4, fov: 33, dur: 6 }) },
    say('chase', 'Not yet.', { expr: 'neutral' }),
    // CHASE (2040) (a small smile, a long beat)
    { do: (c) => closeOn(c, 'chase40', { dist: 1.0, yaw: 0.35, fov: 33, dur: 8, push: 0.08 }) },
    { expr: [['chase40', 'sheepish']] },
    { wait: 2.6 },
    slow('chase40', '…Okay.', { expr: 'sheepish' }),
    { wait: 0.6 },
    // [WIDE · locked, the whole venue] Luka asleep under his coat with the Santa beard over his eyes. Through the high
    // window the rain thins and a grey-blue dawn starts. Hold 3 s.
    { do: (c) => { if (!sk(c)) { const an = AN('s210_locked'); if (an) c.cam.shot({ shot: 'CAM', pos: an.from.slice(), look: an.at.slice(), fov: an.fov }); } } },
    { env: 'dawn', dur: 3 },
    { do: (c) => {
      const w = UD(c, 'window_light'); if (w) w.light(0x8aa0c8, 0.8);
      const b = UD(c, 'mirror_ball'); if (b) b.sparkle(0.55);
      const ck = UD(c, 'wall_clock_sl'); if (ck) ck.set(4, 40);
      c.world.prebuild('hq_atrium');
    } },
    { wait: 3 },
    { fade: 'out', dur: 1.0 },
    // Title: END OF ACT TWO.
    { title: 'END OF ACT TWO', dur: 3 },
    { do: () => stopSong(0) },
  ];
})();
