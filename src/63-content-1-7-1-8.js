// ============================================================ CONTENT: 1.7 ("One Foot Off the Ground") and 1.8 ("Order of Service")
// BUILD_PROMPT §8. Every line is final and word for word; '^' = a beat. Shot tags are quoted in the comments.
// Sets: parade (Region P, docs/sets/parade.md) and flat (docs/sets/flat.md); 1.8 step 27 cuts back to parade.
// No mini-games. 1.7 is a roam (gentle Courtesy Drone patrols with stealth checkpoints, three samples, four human
// moments, examines, the café urn as the kettle); 1.8 is a small roam that ends at the fridge, then the order of service:
// played straight, no music, one stare, no release.
// Extras who speak in 1.7 are pooled actors spawned by look id (the speaker ids below alias them, so the dialogue box
// wears their baked bust): the man on the jetty (sizzle_c), the kid at the skate bowl (local40_d), the woman at the
// chip-shop window (sizzle_e).
(() => {
  const PI = Math.PI, H = PI / 2;
  const say = (id, text, o) => Object.assign({ say: id, text }, o);
  const slow = (id, text, o) => say(id, text, Object.assign({ speed: 'slow' }, o));
  const sk = (c) => c.flow.skipping;
  const P = (c, n) => c.world.prop(n);
  const act = (c, id) => c.world.actor(id);
  const V1 = new THREE.Vector3();
  const put = (id, x, z, ry) => ({ place: id, at: [x, 0, z, ry] });
  // one tick later (even while skipping): a set re-dresses itself on its first tick in a new scene, so content that
  // dresses from flags (Continue) runs after it
  const nextTick = () => new Promise((res) => { const f = () => { removeUpdate(f); res(); }; addUpdate(f); });
  // a tween on the game clock, snapped at once while skipping or when the scene changes (no allocation per tick)
  function tween(c, dur, fn) {
    const sid = c.flow.sceneId;
    if (c.flow.skipping || !(dur > 0)) { fn(1); return; }
    let t = 0;
    const f = (dt) => { t = Math.min(1, t + dt / dur); if (flow.sceneId !== sid || flow.skipping) t = 1; fn(t * t * (3 - 2 * t)); if (t >= 1) removeUpdate(f); };
    addUpdate(f);
  }
  // the active character says it (examine lines; who "noticed" depends on the swap)
  const me = (text) => ({ do: (c) => c.say(c.state.active, text) });
  // the active character turns to something (a hotspot's little cutscene)
  const meFace = (to) => ({ do: (c) => { const a = act(c, c.state.active); if (a) a.face(to, sk(c) ? 0 : 0.3); } });
  // over the active character's shoulder at a thing (examines: framed from wherever he stands; walls handled by OTS)
  const ots = (on, o = {}) => ({ do: (c) => { if (sk(c)) return; c.cam.shot(Object.assign({ shot: 'OTS', on, over: c.state.active, fov: 42 }, o)); } });
  // a computed close-up: the lens `dist` m from his eyes, `yaw` rad off his facing (+ = toward his left), pushing in
  // `push` m over `dur` s. Read at step time (faces placed under the cut); nothing while skipping.
  function closeOn(c, id, o = {}) {
    if (sk(c)) return;
    const a = act(c, id);
    if (!a) return;
    c.ui.card(null);
    a.eyePos(V1);
    const ry = a.rotY + (o.yaw || 0), d = o.dist || 0.95, pu = o.push ?? 0.12, ly = V1.y - 0.05 + (o.ly || 0);
    const sx = Math.sin(ry), sz = Math.cos(ry), y = V1.y + (o.dy ?? -0.02), f = o.fov || 36;
    c.cam.shot({ shot: 'CAM', pos: [V1.x + sx * d, y, V1.z + sz * d], look: [V1.x, ly, V1.z], fov: f,
      to: { pos: [V1.x + sx * (d - pu), y, V1.z + sz * (d - pu)], look: [V1.x, ly, V1.z], fov: o.fovTo || f }, dur: o.dur || 7, ease: 'linear' });
  }
  const CLOSE = (id, o) => ({ do: (c) => closeOn(c, id, o) });
  // a close on `id` from whichever side of his face (±mag off his facing) keeps `from` furthest out of the frame
  function closeAway(c, id, from, o = {}) {
    const a = act(c, id), b = act(c, from);
    if (!a || !b) return;
    const m = o.mag || 0.7, d = o.dist || 0.95;
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
  // `id` steps up beside the active character (side 1: on his right, -1: his left; about a metre off) and turns to him
  function beside(c, id, side = 1) {
    const a = act(c, c.state.active), b = act(c, id);
    if (!a || !b) return;
    const ry = a.rotY, x = a.pos.x - side * Math.cos(ry) * 1.0 - Math.sin(ry) * 0.25, z = a.pos.z + side * Math.sin(ry) * 1.0 - Math.cos(ry) * 0.25;
    return b.moveTo([x, 0, z], { collide: true }).then(() => b.face(c.state.active, sk(c) ? 0 : 0.3));
  }
  // walk the active character through waypoints (autoplay: the roams are solved on foot, through the real hotspots)
  async function walk(c, pts, run = true) {
    const sid = c.flow.sceneId;
    c.player.enabled = true;   // the party's followers walk the leader's trail only while the player is enabled
    for (const p of pts) {
      const a = act(c, c.state.active);
      if (!a || c.flow.sceneId !== sid) break;
      await a.moveTo(p, { run });
    }
    await c.wait(run ? 0.6 : 0.4);   // let them catch up
    c.player.enabled = false;
  }
  const swapTo = (c, id) => { if (c.state.active !== id) c.flow.swapNext(); };

  // ---------------------------------------------------------- the people of the Parade (1.7's human moments)
  // Speaker ids alias the pooled extras' actors (mouths, baked busts); minor voices (spec §4: generic blips).
  Object.assign(CHARACTERS, {
    jettyman: { name: 'MAN', actor: 'sizzle_c', voice: { wave: 'square', f: 132, len: 0.06, soft: true, filter: 1600 } },
    skatekid: { name: 'KID', actor: 'local40_d', voice: { wave: 'triangle', f: 310, len: 0.032 } },
    chipswoman: { name: 'WOMAN', actor: 'sizzle_e', voice: { wave: 'triangle', f: 236, len: 0.045, soft: true } },
  });
  // the kid "practising standing on" a skateboard that isn't there: arms out, riding a board in a light wind
  if (!ANIMS.s17_balance) {
    ANIMS.s17_balance = (r, t, p) => {
      ANIMS.idle(r, t, p);
      const Pt = r.parts, s = Math.sin(t * 1.25), s2 = Math.sin(t * 2.3 + 1);
      Pt.armL.rotation.set(0.12 * s2, 0, 1.2 + 0.16 * s); Pt.armR.rotation.set(-0.12 * s2, 0, -1.2 + 0.16 * s);
      Pt.foreL.rotation.x = -0.2; Pt.foreR.rotation.x = -0.2;
      Pt.torso.rotation.z += 0.06 * s; Pt.head.rotation.z -= 0.05 * s; Pt.head.rotation.x += 0.12;
    };
  }

  // ---------------------------------------------------------- CARDS (readable INSERTs this file owns)
  // The order of service, opened flat in Luka's hands: Celebrating the life of LUKA · "I'll do it." · Redcliffe ·
  // January 2035, and a photo of an older Luka laughing at something off-frame.
  function lukaLaughing(cx, x, y, w, h) {
    cx.save();
    cx.beginPath(); cx.rect(x, y, w, h); cx.clip();
    // outdoors, out of focus: a sunny bay, a band of foreshore, warm bokeh
    let g = cx.createLinearGradient(0, y, 0, y + h);
    g.addColorStop(0, '#a9d4ea'); g.addColorStop(0.42, '#d8ecf0'); g.addColorStop(0.43, '#7fb8c8'); g.addColorStop(0.62, '#8fb87a'); g.addColorStop(1, '#5d7d52');
    cx.fillStyle = g; cx.fillRect(x, y, w, h);
    const K = CARDS._kit; K.seedOf('luka-photo');
    for (let i = 0; i < 18; i++) { cx.fillStyle = `rgba(255,${240 + (K.rnd() * 15) | 0},${200 + (K.rnd() * 40) | 0},${0.12 + K.rnd() * 0.14})`; cx.beginPath(); cx.arc(x + K.rnd() * w, y + K.rnd() * h * 0.6, 6 + K.rnd() * 18, 0, 7); cx.fill(); }
    const u = w / 300, hx = x + w * 0.56, hy = y + h * 0.42;   // the head turned to frame-left: he's laughing at someone off it
    // shoulders: a black polo
    cx.fillStyle = '#17181c'; cx.beginPath(); cx.ellipse(x + w * 0.52, y + h * 1.02, w * 0.5, h * 0.3, 0, 0, 7); cx.fill();
    cx.fillStyle = '#26272c'; cx.beginPath(); cx.moveTo(hx - 42 * u, y + h * 0.75); cx.lineTo(hx - 10 * u, y + h * 0.86); cx.lineTo(hx + 28 * u, y + h * 0.74); cx.lineTo(hx + 34 * u, y + h * 0.8); cx.lineTo(hx - 12 * u, y + h * 0.95); cx.lineTo(hx - 48 * u, y + h * 0.8); cx.fill();
    // neck
    cx.fillStyle = '#c8916c'; cx.fillRect(hx - 22 * u, hy + 50 * u, 44 * u, 50 * u);
    // the ponytail behind (he's turned left, so it swings right)
    cx.fillStyle = '#4a3020'; cx.beginPath(); cx.ellipse(hx + 52 * u, hy + 8 * u, 16 * u, 46 * u, -0.5, 0, 7); cx.fill();
    // head
    cx.save(); cx.translate(hx, hy); cx.rotate(-0.16);
    cx.fillStyle = '#d9a07a'; cx.beginPath(); cx.ellipse(0, 0, 50 * u, 64 * u, 0, 0, 7); cx.fill();
    cx.fillStyle = '#c98e68'; cx.beginPath(); cx.ellipse(40 * u, 4 * u, 12 * u, 18 * u, 0, 0, 7); cx.fill();   // ear
    // hair pulled back
    cx.fillStyle = '#4a3020'; cx.beginPath(); cx.ellipse(6 * u, -36 * u, 54 * u, 36 * u, 0.1, Math.PI * 1.02, Math.PI * 2.05); cx.fill();
    cx.beginPath(); cx.ellipse(10 * u, -40 * u, 48 * u, 26 * u, 0.1, 0, 7); cx.fill();
    // a full dark beard, the mouth wide open in it
    cx.fillStyle = '#2e1f17'; cx.beginPath(); cx.moveTo(-50 * u, 0); cx.quadraticCurveTo(-52 * u, 70 * u, 0, 82 * u); cx.quadraticCurveTo(48 * u, 72 * u, 46 * u, 2 * u); cx.quadraticCurveTo(30 * u, 22 * u, 0, 20 * u); cx.quadraticCurveTo(-30 * u, 22 * u, -50 * u, 0); cx.fill();
    cx.fillStyle = '#5a1e1e'; cx.beginPath(); cx.ellipse(-6 * u, 42 * u, 20 * u, 15 * u, -0.1, 0, 7); cx.fill();
    cx.fillStyle = '#f2ece2'; cx.fillRect(-22 * u, 30 * u, 32 * u, 6 * u);
    // nose
    cx.fillStyle = '#c4865f'; cx.beginPath(); cx.moveTo(-10 * u, -6 * u); cx.lineTo(-20 * u, 20 * u); cx.lineTo(-4 * u, 22 * u); cx.fill();
    // eyes squeezed shut with laughing, cheeks up, brows up
    cx.strokeStyle = '#2a1a12'; cx.lineWidth = 4 * u; cx.lineCap = 'round';
    for (const ex of [-26, 12]) { cx.beginPath(); cx.arc(ex * u, -10 * u, 10 * u, Math.PI * 1.1, Math.PI * 1.9); cx.stroke(); }
    cx.lineWidth = 2 * u; cx.strokeStyle = 'rgba(120,70,40,.6)';
    for (const ex of [-40, 26]) { cx.beginPath(); cx.moveTo(ex * u, -8 * u); cx.lineTo((ex + (ex < 0 ? -6 : 6)) * u, -2 * u); cx.stroke(); }
    cx.strokeStyle = '#3a2418'; cx.lineWidth = 5 * u;
    for (const ex of [-26, 12]) { cx.beginPath(); cx.moveTo((ex - 12) * u, -30 * u); cx.quadraticCurveTo(ex * u, -40 * u, (ex + 12) * u, -32 * u); cx.stroke(); }
    cx.restore();
    // the print: warm fade, a little grain, a soft vignette
    cx.fillStyle = 'rgba(255,214,160,.10)'; cx.fillRect(x, y, w, h);
    for (let i = 0; i < 500; i++) { cx.fillStyle = K.rnd() < 0.5 ? 'rgba(255,255,255,.05)' : 'rgba(0,0,0,.05)'; cx.fillRect(x + K.rnd() * w, y + K.rnd() * h, 2, 2); }
    g = cx.createRadialGradient(x + w / 2, y + h / 2, w * 0.3, x + w / 2, y + h / 2, w * 0.8); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(40,20,10,.35)');
    cx.fillStyle = g; cx.fillRect(x, y, w, h);
    cx.restore();
  }
  // a thumb holding the card's edge (Luka's hands: the INSERT is his)
  function thumb(cx, x, y, a) {
    const K = CARDS._kit;
    cx.save(); cx.translate(x, y); cx.rotate(a);
    K.shadow(cx, 10, 4, 0.3); cx.fillStyle = '#c98e68'; K.rr(cx, -30, -46, 60, 120, 28); cx.fill(); K.noShadow(cx);
    cx.fillStyle = '#b87c58'; K.rr(cx, -30, 20, 60, 54, 20); cx.fill();                       // the knuckle in shadow
    cx.fillStyle = '#e8c4ae'; K.rr(cx, -19, -38, 38, 34, 13); cx.fill();                      // the nail
    cx.fillStyle = 'rgba(255,255,255,.35)'; K.rr(cx, -12, -34, 14, 10, 5); cx.fill();
    cx.restore();
  }
  CARDS.order_service = (cx, w, h) => {
    const K = CARDS._kit;
    K.tilt(cx, w, h, -0.012);
    const pw = w * 0.94, ph = h * 0.86, x = (w - pw) / 2, y = (h - ph) / 2 - h * 0.02, mid = x + pw / 2;
    K.shadow(cx, 28, 12); cx.fillStyle = '#f3ecdc'; cx.fillRect(x, y, pw, ph); K.noShadow(cx);
    // the fold: each half bows a little toward the light; the crease where it sat folded on a fridge for six years
    let g = cx.createLinearGradient(x, 0, mid, 0); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(0.85, 'rgba(0,0,0,.03)'); g.addColorStop(1, 'rgba(0,0,0,.12)');
    cx.fillStyle = g; cx.fillRect(x, y, pw / 2, ph);
    g = cx.createLinearGradient(mid, 0, x + pw, 0); g.addColorStop(0, 'rgba(0,0,0,.08)'); g.addColorStop(0.2, 'rgba(255,255,255,.05)'); g.addColorStop(1, 'rgba(0,0,0,0)');
    cx.fillStyle = g; cx.fillRect(mid, y, pw / 2, ph);
    cx.strokeStyle = 'rgba(150,135,110,.5)'; cx.lineWidth = 2; cx.strokeRect(x + 22, y + 22, pw / 2 - 44, ph - 44); cx.strokeRect(mid + 22, y + 22, pw / 2 - 44, ph - 44);
    // left: the words
    const lx = x + pw / 4;
    cx.textAlign = 'center'; cx.textBaseline = 'middle';
    cx.fillStyle = '#6a6052'; cx.font = `italic 34px ${K.SERIF}`; cx.fillText('Celebrating the life of', lx, y + ph * 0.25);
    if ('letterSpacing' in cx) cx.letterSpacing = '12px';
    cx.fillStyle = '#26221c'; cx.font = `bold 104px ${K.SERIF}`; cx.fillText('LUKA', lx + 6, y + ph * 0.41);
    if ('letterSpacing' in cx) cx.letterSpacing = '0px';
    cx.strokeStyle = '#a89878'; cx.lineWidth = 2; cx.beginPath(); cx.moveTo(lx - 70, y + ph * 0.52); cx.lineTo(lx + 70, y + ph * 0.52); cx.stroke();
    cx.fillStyle = '#3a342a'; cx.font = `italic 46px ${K.SERIF}`; cx.fillText('“I’ll do it.”', lx, y + ph * 0.63);
    cx.fillStyle = '#6a6052'; cx.font = `30px ${K.SERIF}`; cx.fillText('Redcliffe · January 2035', lx, y + ph * 0.84);
    // right: the photo, printed with a narrow white border
    const fw = pw / 2 - 120, fh = ph - 150, fx = mid + 60, fy = y + 75;
    K.shadow(cx, 6, 2, 0.2); cx.fillStyle = '#fbfaf6'; cx.fillRect(fx - 8, fy - 8, fw + 16, fh + 16); K.noShadow(cx);
    lukaLaughing(cx, fx, fy, fw, fh);
    // his thumbs on the bottom corners
    thumb(cx, x + 34, y + ph + 6, 0.22); thumb(cx, x + pw - 34, y + ph + 6, -0.22);
  };
  CARDS.order_service.size = [960, 640];

  // The sticky note wall: hundreds of notes, all about one song; five of them, close to, in Chase's hand.
  const HERO_NOTES = ['two — bridge??', 'two — 2nd verse too long', 'two — make it better', 'two — NOT YET', 'two — for L.'];
  const NOTE_C = ['#f7a8c0', '#a8e8c8', '#a8d0f0', '#f8c8a0', '#f4ec9a'];
  CARDS.sticky_wall = (cx, w, h) => {
    const K = CARDS._kit;
    cx.fillStyle = '#e8e0cf'; cx.fillRect(0, 0, w, h);
    const g = cx.createRadialGradient(w / 2, h / 2, w * 0.2, w / 2, h / 2, w * 0.75); g.addColorStop(0, 'rgba(255,240,210,.0)'); g.addColorStop(1, 'rgba(40,30,20,.35)');
    K.seedOf('sticky-wall');
    const note = (nx, ny, s, a, col, text, size) => {
      cx.save(); cx.translate(nx, ny); cx.rotate(a);
      K.shadow(cx, 6, 3, 0.25); cx.fillStyle = col; cx.fillRect(-s / 2, -s / 2, s, s); K.noShadow(cx);
      cx.fillStyle = 'rgba(0,0,0,.07)'; cx.fillRect(-s / 2, -s / 2, s, s * 0.14);
      if (text) {
        const f = K.fit(cx, text, (z) => `${z}px ${K.HAND}`, s * 0.84, s * 0.72, size, 1.15);
        f.lines.forEach((l, i) => K.hand(cx, l, -s * 0.42, -s * 0.12 + (i - (f.lines.length - 1) / 2) * f.size * 1.15 + f.size * 0.4, f.size, '#1d2f8f'));
      } else {   // the rest: "two —" and a scrawl
        K.hand(cx, 'two —', -s * 0.4, -s * 0.12, s * 0.2, 'rgba(29,47,143,.75)');
        cx.strokeStyle = 'rgba(29,47,143,.55)'; cx.lineWidth = 1.6;
        for (let r = 0; r < 2; r++) { cx.beginPath(); const yy = s * (0.1 + r * 0.16); cx.moveTo(-s * 0.38, yy); for (let k = -0.38; k < 0.3 + K.rnd() * 0.08; k += 0.05) cx.lineTo(s * k, yy + (K.rnd() - 0.5) * s * 0.06); cx.stroke(); }
      }
      cx.restore();
    };
    for (let row = 0; row < 9; row++) for (let col = 0; col < 15; col++) {
      const s = 62 + K.rnd() * 10;
      note(28 + col * 68 + (K.rnd() - 0.5) * 14, 30 + row * 70 + (K.rnd() - 0.5) * 14, s, (K.rnd() - 0.5) * 0.35, NOTE_C[(K.rnd() * 5) | 0], null);
    }
    const HP = [[170, 160, -0.06], [500, 140, 0.04], [820, 190, -0.03], [300, 430, 0.05], [690, 450, -0.05]];
    HERO_NOTES.forEach((t, i) => note(HP[i][0], HP[i][1], 210, HP[i][2], NOTE_C[i], t, 40));
    cx.fillStyle = g; cx.fillRect(0, 0, w, h);
  };
  CARDS.sticky_wall.size = [1000, 640];

  // The bookshelf: a row of identical notebooks labelled two 1, two 2 … two 31.
  CARDS.notebooks = (cx, w, h) => {
    const K = CARDS._kit;
    K.shadow(cx, 22, 10); cx.fillStyle = '#5a4a3a'; cx.fillRect(10, h * 0.86, w - 20, h * 0.1); K.noShadow(cx);   // the shelf
    cx.fillStyle = '#2b2219'; cx.fillRect(10, h * 0.06, w - 20, h * 0.8);                                        // the back of the case
    const n = 31, sw = (w - 60) / n, top = h * 0.12, bot = h * 0.86;
    K.seedOf('notebooks');
    for (let i = 0; i < n; i++) {
      const x0 = 30 + i * sw, lean = i === n - 1 ? 0.05 : 0, th = top + K.rnd() * 6;
      cx.save(); cx.translate(x0 + sw / 2, bot); cx.rotate(lean);
      const gg = cx.createLinearGradient(-sw / 2, 0, sw / 2, 0); gg.addColorStop(0, '#16171b'); gg.addColorStop(0.5, '#2c2e34'); gg.addColorStop(1, '#141519');
      cx.fillStyle = gg; cx.fillRect(-sw / 2 + 1, th - bot, sw - 2, bot - th);
      cx.fillStyle = '#c9c3b2'; cx.fillRect(-sw / 2 + 1, th - bot + 6, sw - 2, 3);                               // the elastic band
      cx.fillStyle = '#f4f1e8'; cx.fillRect(-sw / 2 + 4, th - bot + 22, sw - 8, (bot - th) * 0.55);               // the label
      cx.save(); cx.translate(0, th - bot + 22 + (bot - th) * 0.275); cx.rotate(-Math.PI / 2);
      K.hand(cx, 'two ' + (i + 1), 0, sw * 0.18, Math.min(26, sw * 0.62), '#1d2f8f', { align: 'center', pen: true });
      cx.restore(); cx.restore();
    }
  };
  CARDS.notebooks.size = [1000, 460];

  // =================================================================== 1.7 — "One Foot Off the Ground"
  // Region P of SETS.parade (+X along the Parade to the chip shop, +Z the bay). Footpath z -7..-3, road z -3..5 (zebras
  // x -16..-12 and 22..26), promenade z 5..8, plaza x -20..-4, jetty x -13.75..-10.25 to z 54, park x -4..42.
  // [CRANE · down out of a blazing sky]: the sun, then down over the roofs to the Parade, the palms in their lights, the
  // hover-cars a foot off the road, the strollers with their chip lights, the jetty into a flat blue bay.
  const CRANE_A = { shot: 'CAM', pos: [-8, 62, -36], look: [80, 336, 231], fov: 55, to: { pos: [-13, 24, -14], look: [-10.5, 3, 40], fov: 52 }, dur: 3.8, ease: 'in' };
  const CRANE_B = { shot: 'CAM', pos: [-13, 24, -14], look: [-10.5, 3, 40], fov: 52, to: { pos: [-26, 3.6, -3.2], look: [-9, 0.8, 30], fov: 50 }, dur: 5.6, ease: 'linear' };
  // the lifeguard drone over Suttons Beach, the family in the shallows below it (both clear of the dialogue box)
  const LIFEGUARD = { shot: 'CAM', pos: [10.6, 1.7, 20.2], look: [15.0, 0.0, 31.5], fov: 48, to: { pos: [11.0, 1.65, 21.2], look: [15.0, 0.05, 31.5], fov: 47 }, dur: 7, ease: 'linear' };
  const TRACK = { shot: 'TRACK', size: 'WIDE', on: ['luka', 'chase', 'chase40'], track: 'alongside', side: 'right', height: 0.1 };
  const CAR_TURN = { shot: 'CAM', pos: [-33.5, 2.4, 5.4], look: [-44.0, 0.7, 4.0], fov: 40, to: { pos: [-33.8, 2.4, 5.6], look: [-46.6, 0.8, 10.0], fov: 40 }, dur: 3.4, ease: 'linear' };
  // [MID · a bronze plaque on the foreshore: BRISBANE 2032], then the reverse from behind the plinth: three faces
  const PLAQUE = { shot: 'CAM', pos: [-2.25, 1.32, 6.85], look: [-2.0, 0.8, 8.42], fov: 34, to: { pos: [-2.15, 1.18, 7.3], look: [-2.0, 0.8, 8.42], fov: 33 }, dur: 4, ease: 'linear' };
  const PLAQUE_REV = { shot: 'CAM', pos: [-1.6, 1.3, 10.6], look: [-1.75, 1.5, 7.1], fov: 44, to: { pos: [-1.62, 1.32, 10.15], look: [-1.75, 1.5, 7.1], fov: 43 }, dur: 6, ease: 'linear' };
  const AT_PLAQUE = { luka: [-2.75, 7.2], chase: [-1.75, 7.05], c40: [-0.75, 7.35] }, PLAQUE_PT = [-2.0, 0, 8.5];
  const C40_POV = [-0.75, 0, 7.35, PI];   // turned to the shops for the chip (clear of the lamp and the kerb bollards)
  const DUSK = { shot: 'CAM', pos: [27.2, 1.9, 4.8], look: [35.0, 2.7, -7.0], fov: 45, to: { pos: [28.4, 2.1, 3.7], look: [35.0, 2.8, -7.0], fov: 43 }, dur: 9, ease: 'linear' };
  const PATHS17 = {   // the hero car's legs (added to SETS.parade.paths, which drive() reads by name)
    s17_pass: [[-3, 3.0], [-44, 3.0], [-47, 6.5], [-47, 14]],
    s17_turn: [[-39.5, 3.0], [-44, 3.0], [-47, 6.5], [-47, 16]],
    s18_pass: [[17, -1.0], [52, -1.0]],
  };
  function paths() { const p = SETS.parade && SETS.parade.paths; if (p) for (const k in PATHS17) if (!p[k]) p[k] = PATHS17[k]; }
  const drive = (name, speed) => ({ do: (c) => { paths(); const h = P(c, 'hovercar_hero'); if (h) h.userData.drive(name, speed); } });
  const indicate = (on) => ({ do: (c) => { const h = P(c, 'hovercar_hero'); if (h) h.userData.indicate(on); } });
  // the Cloud+ billboard in Chase (2040)'s chip view (the plant: big and readable over the blank rooftop billboard)
  const CLOUD = { id: 's17_cloud', kind: 'ad', text: 'OPTUS CLOUD+ · NEVER FORGET ANYTHING AGAIN · $14.99/month', at: [-4, 8.5, -11.9], w: 4.3, size: 3.7, maxD: 80 };

  // objective: the samples, ticked as they're recorded (optional)
  const SAMP17 = [['hover', 'Hover hum'], ['bay', 'Bay'], ['chip', 'Chip chime']];
  function duties17() { objective.list(SAMP17.map(([k, t]) => ({ text: t + ' (optional)', done: state.samples.includes(k) }))); }
  let listening = false;
  function listen() {
    if (listening) return;
    listening = true;
    on('sample:add', (k) => {
      if (flow.sceneId !== '1.7') return;
      duties17();
      if (flow.skipping) return;
      if (k === 'hover') { const p = world.prop('hovercar_parked'); if (p) { p.userData.highlight(true); wait(1.6).then(() => { if (flow.sceneId === '1.7') p.userData.highlight(false); }); } }
      if (k === 'bay') { const p = world.prop('pelican_hero'); if (p && p.userData.clack) p.userData.clack(); }
      if (k === 'chip') { const p = world.prop('kiosk'); if (p && p.userData.chime) p.userData.chime(); }
    });
  }

  // dressing from flags (Continue restarts at step 0): the Parade at 13:40, the three locals in their places
  function dress17(c) {
    paths(); listen();
    if (SETS.parade && SETS.parade.dress && c.world.setId === 'parade') SETS.parade.dress('day17');
    c.state.flags.chip_off = true;                 // 1.6: "Aeroplane mode. For the brain." (his light stays dark)
    const man = act(c, 'sizzle_c'), kid = act(c, 'local40_d'), wom = act(c, 'sizzle_e');
    if (man) { man.place('jetty_man'); man.play('sit', { h: 0.45 }); }   // on the T-head bench, looking out to sea
    if (kid) { kid.place('skate_kid'); kid.play('s17_balance'); }
    if (wom) { wom.place('chips_woman'); wom.play('idle'); }
    const l = P(c, 'lifeguard_drone'); if (l) l.userData.talk(false);
    if (typeof chip !== 'undefined') chip.lightOn(null);
  }
  // the human moments: a two-shot of whoever is talking to him (computed at fire time), and the local turns to answer
  function moment(c, id, o = {}) {
    const a = act(c, c.state.active), b = act(c, id);
    if (!a || !b) return;
    a.face(id, sk(c) ? 0 : 0.3);
    if (!o.stay) b.face(c.state.active, sk(c) ? 0 : 0.4);
    if (sk(c)) return;
    if (o.cam) c.cam.shot(o.cam(a, b));
    else c.cam.shot({ shot: 'OTS', on: id, over: c.state.active, fov: o.fov || 40, dist: o.dist || 1.4 });
  }
  // the man at the end of the jetty, seen from the sea: he looks out past the lens; whoever talks to him stands behind
  const FROM_SEA = (a) => { const x = a.pos.x < -12 ? -10.8 : -13.2;
    return { shot: 'CAM', pos: [x, 1.6, 60.9], look: [(a.pos.x - 12) / 2, 0.8, 58.5], fov: 44, to: { pos: [x, 1.55, 60.6], look: [(a.pos.x - 12) / 2, 0.8, 58.5], fov: 43 }, dur: 8, ease: 'linear' }; };
  const TALK = (id, speaker, text, o = {}) => ({
    id: 'h17_' + speaker, at: id, r: o.r || 1.8, verb: 'Talk', flag: 's17_' + speaker,
    steps: [{ do: (c) => moment(c, id, o) }, { wait: 0.5 }, say(speaker, text), { wait: 0.3 }],
  });

  SCENES['1.7'] = {
    title: 'One Foot Off the Ground', set: 'parade', env: 'day', time: '13:40', place: 'Redcliffe Parade',
    playable: ['luka', 'chase'], swap: false, music: 'seaside',
    hud: { noService: true, quiet: '46:18:00', samples: true, bars: null },
    spawn: {
      luka: 's17_luka_start', chase: 's17_chase_start', chase40: 's17_c40_start',
      sizzle_c: 'jetty_man', local40_d: 'skate_kid', sizzle_e: 'chips_woman',
    },
    hotspots: [
      // examine lines (the active character; the blank sign gets an answer from Chase (2040), who knows it by heart)
      { id: 'h17_sign', at: 'sign_look', r: 1.5, flag: 's17_sign',
        steps: [meFace('blank_sign'), { wait: 0.35 }, { do: (c) => { beside(c, 'chase40', -1); } },   // he comes up on his other side
          ots('blank_sign', { fov: 44, dist: 1.4 }), { wait: 0.6 }, me("That sign's blank."), { wait: 0.2 },
          { do: (c) => closeAway(c, 'chase40', c.state.active, { dist: 1.15, fov: 38, push: 0.1, dur: 6 }) },
          { wait: 0.3 },
          say('chase40', "It says 'Welcome to Redcliffe'. And an ad for teeth.")] },
      { id: 'h17_tree', at: 'tree_look', r: 1.7, flag: 's17_tree',
        steps: [meFace([8.4, 0, 13.2]), { wait: 0.3 }, ots([8.4, 2.0, 13.2], { fov: 54, dist: 1.6 }), { wait: 0.6 }, me("They've bubble-wrapped Christmas.")] },
      { id: 'h17_bollard', at: 'bollard_look', r: 1.1, flag: 's17_bollard',
        steps: [meFace([-10.4, 0, 5.15]), { wait: 0.3 }, { shot: 'CAM', pos: [-8.9, 2.3, 7.9], look: [-10.35, 0.7, 5.4], fov: 46, to: { pos: [-9.05, 2.2, 7.7], look: [-10.35, 0.7, 5.4], fov: 45 }, dur: 5, ease: 'linear' }, { wait: 0.4 },
          { do: (c) => { const a = act(c, c.state.active); if (a && !sk(c)) a.play('give', { dur: 1.2, loop: false }); } }, { wait: 0.9 },
          me("It's soft. The bollard's soft.")] },
      // the four human moments
      TALK('sizzle_c', 'jettyman', "Haven't had a call in four years. ^ Do Not Disturb. For safety. ^ I forget why.", { stay: true, r: 2.2, cam: FROM_SEA }),
      TALK('local40_d', 'skatekid', "Confiscated. ^ I'm practising standing on it."),
      TALK('sizzle_e', 'chipswoman', "I tried to message my sister. It said it might upset her. ^ It was 'Merry Christmas'."),
      { id: 'h17_kiosk', at: 'kiosk', r: 1.45, verb: 'Talk', sample: 'chip', flag: 's17_kiosk',
        steps: [meFace([12.0, 0, 8.4]), { wait: 0.3 }, ots([12.0, 1.35, 8.3], { fov: 40, dist: 1.4 }),
          { prop: 'kiosk', fn: (o) => { if (o.userData.chime && !flow.skipping) o.userData.chime(); } }, { sfx: 'ss_chirp', vol: 0.5 },
          { wait: 0.4 }, say('safesense', 'Feeling lonely? Have you tried being safe?')] },
      // samples (Chase, hold YES): a parked hover-car idling, the waves under the jetty with a pelican's clack
      { id: 'h17_hover', at: 'sample_hover', r: 1.5, sample: 'hover' },
      { id: 'h17_bay', at: 'sample_bay', r: 1.4, sample: 'bay' },
      // the café's tea urn: the save point
      { id: 'h17_urn', at: 'urn', r: 1.6, verb: 'Use', kettle: true },
      // the door beside the fish-and-chip shop
      { id: 'h17_door', at: 'flat_door', r: 1.5, verb: 'Go in', once: true, flag: 's17_home', do: () => {} },
    ],
    steps: [
      ['cutscene', '1.7_crane'],
      ['control', 'luka'],
      ['follow', ['chase', 'chase40']],
      ['swap', true],
      ['objective', "Get to Chase's flat before dark."],
      ['do', (c) => {   // the afternoon: gentle patrols, stealth checkpoints (Safe Room retry), the light going gold
        duties17();
        const PA = SETS.parade.paths, cone = { len: 4.5, half: 0.5 };
        DRONES.spawn('d17_plaza', { path: PA.s17_patrol_plaza, loop: true, speed: 0.8, pause: 1.2, cone });
        DRONES.spawn('d17_park', { path: PA.s17_patrol_park, loop: true, speed: 0.75, pause: 1.0, cone });
        DRONES.spawn('d17_fp', { path: PA.s17_patrol_fp, speed: 0.9, pause: 1.6, cone });
        stealth.begin({
          escortAfter: 1.8, forgetAfter: 1.6,
          checkpoints: [
            { id: 'plaza', box: [-44, 5, -4, 60], at: 's17_cp_plaza' },
            { id: 'park', box: [-4, 5, 42, 24], at: 's17_cp_park' },
            { id: 'fp', box: [-44, -7, 22, -3], at: 's17_cp_fp' },
            { id: 'chips', box: [22, -7, 42, 5], at: 's17_cp_chips' },
          ],
        });
        if (!sk(c)) c.world.env('golden', 260);
      }],
      ['roam', {
        until: 's17_home',
        // a look down the Parade at the door beside the chip shop (no words)
        hint: { after: 150, steps: [{ shot: 'CAM', pos: [30.0, 1.8, 2.0], look: [36.6, 1.4, -7.0], fov: 34, to: { pos: [30.4, 1.8, 1.4], look: [36.6, 1.4, -7.0], fov: 32 }, dur: 3, ease: 'linear' }, { wait: 2.4 }] },
        async auto(c) {   // on foot, through the real hotspots: examines, samples (Chase), the four people, the urn, the door
          const T = (id) => c.hotspots.trigger(id);
          swapTo(c, 'luka');
          await walk(c, [[-6.5, 0, 6.6], 'bollard_look']); await T('h17_bollard');
          await walk(c, ['sign_look']); await T('h17_sign');
          swapTo(c, 'chase');
          await walk(c, [[-18.0, 0, 10.0], 'sample_hover']); await T('h17_hover');
          await walk(c, [[-18.0, 0, 10.4], [-12.0, 0, 11.0], [-12.0, 0, 19.0], 'sample_bay']); await T('h17_bay');
          swapTo(c, 'luka');
          await walk(c, [[-12.0, 0, 26.0], [-12.0, 0, 54.0], 'jetty_man_talk']); await T('h17_jettyman');
          await walk(c, [[-12.0, 0, 54.0], [-12.0, 0, 18.0], [-6.0, 0, 9.5], 'tree_look']); await T('h17_tree');
          swapTo(c, 'chase');
          await walk(c, [[11.0, 0, 7.0], 'kiosk']); await T('h17_kiosk');
          await walk(c, ['skate_kid_talk']); await T('h17_skatekid');
          await walk(c, [[24.0, 0, 6.5], [24.0, 0, -4.6], [3.4, 0, -5.4]]); await T('h17_urn');
          await walk(c, [[24.0, 0, -4.8], 'chips_woman_talk']); await T('h17_chipswoman');
          if (!SAMP17.every(([k]) => c.state.samples.includes(k))) console.error('TWO 1.7: samples not recorded: ' + c.state.samples.join(','));
          await walk(c, [[36.2, 0, -5.0]]); await T('h17_door');
        },
      }],
      ['objective', null],
      ['follow', null],
      ['cutscene', '1.7_dusk'],
    ],
    grants: { flags: { chip_off: true, s17_home: true }, samples: ['chip', 'hover', 'bay'], noService: true, quiet: '46:18:00' },
  };

  CUTSCENES['1.7_crane'] = [
    { do: (c) => nextTick().then(() => dress17(c)) },
    { fade: 'out', dur: 0 },
    // [CRANE · down out of a blazing sky] Redcliffe, 2040. The jetty stretches into a flat blue bay. Christmas lights
    // wrapped round the palm trunks. Hover-cars glide along the Parade about a foot off the bitumen. People with blue
    // lights behind their ears. A lifeguard drone hovers over Suttons Beach. Pelicans, unchanged.
    CRANE_A,
    { fade: 'in', dur: 1.0 },
    { wait: 2.8 },
    CRANE_B,
    { wait: 5.4 },
    // LIFEGUARD DRONE (over a speaker, to a family in the shallows)
    LIFEGUARD,
    { prop: 'lifeguard_drone', fn: (o) => o.userData.talk(true) },
    { wait: 0.7 },
    say('lifeguard', 'Swimming is a risk. Are you sure? ^ Please exit the ocean.', { tag: 'over a speaker' }),
    { prop: 'lifeguard_drone', fn: (o) => o.userData.talk(false) },
    { prop: 'family', fn: (o) => { if (o.userData.exit) o.userData.exit(); } },
    { wait: 1.6 },
    // [TRACK · alongside the three of them] A hover-car glides past at walking pace.
    { place: 'luka', at: 's17_luka_start' }, { place: 'chase', at: 's17_chase_start' }, { place: 'chase40', at: 's17_c40_start' },
    TRACK,
    { move: 'luka', to: [AT_PLAQUE.luka[0], 0, AT_PLAQUE.luka[1]], face: false, nowait: true },
    { move: 'chase', to: [AT_PLAQUE.chase[0], 0, AT_PLAQUE.chase[1]], face: false, nowait: true },
    { move: 'chase40', to: [AT_PLAQUE.c40[0], 0, AT_PLAQUE.c40[1]], face: false, nowait: true },
    drive('s17_pass', 2.3),
    { sfx: 'hover_by', vol: 0.5 },
    { wait: 3.4 },
    { face: 'chase', to: [-6, 0, 3], dur: 0.6 },
    say('chase', 'They hover.'),
    say('chase40', 'About a foot.'),
    { face: 'chase', to: 'chase40', dur: 0.4 },
    say('chase', 'Only a FOOT?'),
    say('chase40', 'They used to do three. The Manager made it one. ^ For safety.'),
    // HOVER-CAR (chirping, turning)
    drive('s17_turn', 2.4), indicate(true),
    CAR_TURN,
    // (under the cut: the three of them arrive at the plaque, reading it)
    { place: 'luka', at: [AT_PLAQUE.luka[0], 0, AT_PLAQUE.luka[1], 0.52] },
    { place: 'chase', at: [AT_PLAQUE.chase[0], 0, AT_PLAQUE.chase[1], -0.17] },
    { place: 'chase40', at: [AT_PLAQUE.c40[0], 0, AT_PLAQUE.c40[1], -0.83] },
    { wait: 0.9 },
    say('hovercar', 'Turning left. Are you sure?', { tag: 'chirping' }),
    { wait: 0.6 },
    // [MID · a bronze plaque on the foreshore: BRISBANE 2032]
    PLAQUE,
    { wait: 3.0 },
    { face: 'luka', to: PLAQUE_PT, dur: 0 }, { face: 'chase', to: PLAQUE_PT, dur: 0 }, { face: 'chase40', to: PLAQUE_PT, dur: 0 },
    { act: [['luka', 'look_down'], ['chase', 'look_down'], ['chase40', 'idle']] },
    PLAQUE_REV,
    { wait: 1.2 },
    { act: [['chase', 'idle']] },
    say('chase', 'Did we win?'),
    { face: 'chase', to: 'chase40', dur: 0.5 },
    { act: [['luka', 'idle']] },
    { place: 'chase40', at: [AT_PLAQUE.c40[0], 0, AT_PLAQUE.c40[1], -0.83] },
    CLOSE('chase40', { yaw: -0.35, dist: 1.0, fov: 36, push: 0.08, dur: 4 }),
    { wait: 0.3 },
    say('chase40', 'We hosted.'),
    { wait: 0.4 },
    // [POV · Chase (2040)'s chip view, one second] He switches his chip on to check the time. The Parade explodes
    // with AR: signs, prices, and over everything a billboard the size of a building: OPTUS CLOUD+ · NEVER FORGET
    // ANYTHING AGAIN · $14.99/month. A pop-up: Signal detected. He switches it off. The Parade is plain again.
    { place: 'chase40', at: C40_POV }, { face: 'chase', to: 'luka', dur: 0 }, { face: 'luka', to: PLAQUE_PT, dur: 0 },
    CLOSE('chase40', { yaw: -0.35, dist: 0.95, fov: 36, push: 0.08, dur: 3 }),
    { wait: 0.4 },
    { act: [['chase40', 'chip_ping']] },
    { wait: 0.45 },
    { do: (c) => { if (typeof chip !== 'undefined') chip.lightOn(true); } },
    { sfx: 'chip_on', vol: 0.6 },
    { wait: 0.5 },
    { do: (c) => {
      const a = act(c, 'chase40');
      if (a && !sk(c)) { a.eyePos(V1); c.cam.shot({ shot: 'CAM', pos: [V1.x, 1.62, V1.z], look: [-3.0, 6.6, -12.0], fov: 60, to: { pos: [V1.x, 1.62, V1.z - 0.05], look: [-3.2, 7.2, -12.0], fov: 57 }, dur: 3, ease: 'linear' }); }
      for (const a2 of SETS.parade.ar || []) if (a2.id !== 'ar_lane_tag' && a2.id !== 'ar_cloud_billboard') AR.add(a2);
      AR.add(CLOUD);
    } },
    { wait: 0.05 },
    { do: (c) => { chip.show(true); AR.remove('_ad_cloud'); } },   // the view comes on in this lens; the billboard is the Cloud+ ad
    { wait: 1.5 },
    { popup: { style: 'safesense', title: 'SafeSense', msg: 'Signal detected.', buttons: [], icon: 'none', at: [0.5, 0.7], w: 240, dur: 1.4, ding: false } },
    { sfx: 'ss_chirp', vol: 0.6 },
    { wait: 1.1 },
    { do: (c) => { chip.show(false); chip.lightOn(null); } },
    { sfx: 'line_click', vol: 0.4 },
    { popup: null, clear: true },
    { wait: 0.9 },
    { do: (c) => AR.clear() },
    CLOSE('chase40', { yaw: -0.25, dist: 1.1, fov: 40, push: 0.08, dur: 4 }),
    { wait: 0.3 },
    say('chase40', 'Twenty to two.'),
    { wait: 0.3 },
  ];

  // Exit: the door beside the fish-and-chip shop. Dusk. Cut.
  CUTSCENES['1.7_dusk'] = [
    { do: (c) => { stealth.end(); DRONES.clear(); c.world.prebuild('flat'); } },
    { place: 'chase40', at: [31.6, 0, -5.2, H] }, { place: 'luka', at: [30.4, 0, -4.4, H] }, { place: 'chase', at: [29.4, 0, -4.9, H] },
    { env: 'dusk', dur: 3 },
    DUSK,
    { move: 'chase40', to: 's17_exit_c40' },
    { move: 'luka', to: 's17_exit_luka', nowait: true },
    { move: 'chase', to: 's17_exit_chase', nowait: true },
    { face: 'chase40', to: PI, dur: 0.3 },
    { sfx: 'clunk', vol: 0.35 },
    { prop: 'flat_door', fn: (o) => o.userData.open(true) },
    { sfx: 'creak', vol: 0.4 },
    { wait: 0.6 },
    { move: 'chase40', to: 'flat_door_in' }, { despawn: 'chase40' },
    { move: 'luka', to: 'flat_door_in' }, { despawn: 'luka' },
    { move: 'chase', to: 'flat_door_in' }, { despawn: 'chase' },
    { prop: 'flat_door', fn: (o) => o.userData.open(false) },
    { sfx: 'clunk', vol: 0.3 },
    { wait: 1.4 },
    { prop: 'flat_window', fn: (o) => o.userData.lit(true) },   // upstairs, the kitchen light comes on
    { wait: 1.8 },
    { fade: 'out', dur: 1.2 },
  ];

  // =================================================================== 1.8 — "Order of Service"
  // SETS.flat: local = parade - (32, 3.6, -7); +Z out to the bay, +X the kitchen. The fridge door face is x 3.29 (the
  // card under the pelican at (3.29, 1.42, -3.12)); the entry door x 1.2..2.1 on the partition z -3.6; bench x 3.4..4.
  const DOORWAY = { shot: 'CAM', pos: [-1.0, 1.65, -0.6], look: [2.0, 1.2, -3.3], fov: 50, to: { pos: [-0.7, 1.62, -0.85], look: [2.0, 1.2, -3.3], fov: 48 }, dur: 6, ease: 'linear' };
  const PAN = { shot: 'CAM', pos: [-0.8, 1.6, -0.8], look: [-3.9, 1.4, -2.0], fov: 48, to: { pos: [-0.8, 1.6, -0.8], look: [2.8, 1.1, -1.8], fov: 48 }, dur: 5.5, ease: 'in' };
  const LEAVING = { shot: 'CAM', pos: [2.9, 1.66, -0.9], look: [1.65, 1.25, -3.9], fov: 46, to: { pos: [2.85, 1.64, -1.05], look: [1.65, 1.25, -3.9], fov: 45 }, dur: 5, ease: 'linear' };
  // the order of service
  const L_FRIDGE = [2.62, 0, -3.15, H], L_READ = [2.78, 0, -3.05, -H], C_READ = [3.02, 0, -2.5, -2.4], C40_IN = [1.62, 0, -3.25, 1.4];
  const HANDS_FRIDGE = { shot: 'CAM', pos: [2.98, 1.52, -2.58], look: [3.29, 1.40, -3.12], fov: 30, to: { pos: [2.99, 1.51, -2.62], look: [3.29, 1.40, -3.12], fov: 29 }, dur: 4, ease: 'linear' };
  const HANDS_CARD = { shot: 'CAM', pos: [3.08, 1.85, -3.3], look: [2.45, 1.1, -3.05], fov: 40, card: ['order_service', {}] };
  const ROOM_WIDE = { shot: 'CAM', pos: [-2.9, 1.72, 0.4], look: [-1.39, 1.1, -2.76], fov: 60, to: { pos: [-2.7, 1.7, 0.15], look: [-0.6, 1.1, -2.8], fov: 58 }, dur: 7, ease: 'linear' };
  const DOOR_WIDE = { shot: 'CAM', pos: [-1.0, 1.65, -0.6], look: [2.0, 1.2, -3.3], fov: 50 };
  const KITCHEN_LOCKED = { shot: 'CAM', pos: [1.6, 2.0, -3.45], look: [2.6, 1.0, -1.2], fov: 58 };   // from the doorway: the three, the parcel, the window and its lights
  const FRIDGE_MM = { shot: 'CAM', pos: [2.92, 1.5, -2.9], look: [3.29, 1.43, -3.12], fov: 28, to: { pos: [2.95, 1.49, -2.92], look: [3.29, 1.43, -3.12], fov: 27 }, dur: 4, ease: 'linear' };
  const EXT = { shot: 'CAM', pos: [34.4, 1.6, 9.8], look: [34.4, 3.0, -7.0], fov: 42, to: { pos: [34.4, 1.7, 8.6], look: [34.4, 3.15, -7.0], fov: 40 }, dur: 9, ease: 'linear' };

  // dressing from flags: the evening, the parcel downstairs with him, the card crooked under its pelican
  function dress18(c) {
    if (SETS.flat && SETS.flat.dress && c.world.setId === 'flat') SETS.flat.dress('evening18');
    const f = c.state.flags;
    const sh = P(c, 'keyboard_sheet'); if (sh) sh.userData.lift(!!f.s18_sheet);
    const cd = P(c, 'fridge_card'); if (cd) cd.userData.state('under');
    const ch = P(c, 'chips_parcel'); if (ch) ch.visible = false;
    const ed = P(c, 'entry_door'); if (ed) ed.userData.open(false);
    const bd = P(c, 'bedroom_door'); if (bd) bd.userData.open(0);
  }
  // Luka's hands on the card
  function cardInHand(c, on) {
    const l = act(c, 'luka'), cd = P(c, 'fridge_card');
    if (!l || !cd) return;
    if (on) {
      cd.userData.state('out');
      l.hold('order_card', 'R');
      const o = l.held; if (o) { o.rotation.set(-1.2, 0.0, PI); o.position.set(-0.06, -0.04, 0.05); }
      l.play('reading_bare');
    } else {
      l.hold(null);
      cd.userData.state('under');
      l.play('idle');
    }
  }
  // Chase (2040)'s parcel of chips: in his hand, or going cold on the bench
  function parcel(c, where) {
    const a = act(c, 'chase40'), p = P(c, 'chips_parcel');
    if (!p) return;
    if (where === 'hand') { p.visible = true; if (a) a.hold('chips_parcel', 'R'); }
    else { if (a && a.held === p) a.hold(null); p.visible = where === 'bench'; }
  }
  // the millimetre: the card back under the magnet, crooked, then straight
  function straighten(c) {
    const cd = P(c, 'fridge_card');
    if (!cd) return;
    cd.userData.state('under');
    cd.rotation.x = 0.09;
    tween(c, 1.4, (k) => { cd.rotation.x = 0.09 * (1 - k); if (k >= 1) cd.userData.state('back'); });
  }
  // Luka's habit: he glances at Chase before he speaks
  const glance = (from, to, dur = 1.1) => ({ do: (c) => {
    if (sk(c)) return;
    const a = act(c, from), b = act(c, to);
    if (!a || !b) return;
    let d = Math.atan2(b.pos.x - a.pos.x, b.pos.z - a.pos.z) - a.rotY; d = Math.atan2(Math.sin(d), Math.cos(d));
    a.play('glance', { yaw: Math.max(-1.3, Math.min(1.3, d)), dur });
  } });

  SCENES['1.8'] = {
    title: 'Order of Service', set: 'flat', env: 'evening', time: '19:40', place: "Chase's flat, Redcliffe",
    playable: ['luka', 'chase'], swap: false, music: null,
    hud: { noService: false, quiet: '40:18:00', samples: false, bars: null },
    spawn: { chase40: 's18_landing_c40', luka: 's18_landing_luka', chase: 's18_landing_chase' },
    hotspots: [
      // Sticky note wall (Chase): hundreds of notes, all about one song
      { id: 'h18_sticky', at: 's18_sticky_chase', r: 1.0, only: 'chase', flag: 's18_sticky',
        steps: [meFace([-4.0, 0, -1.8]), { wait: 0.3 }, { shot: 'OTS', on: [-3.99, 1.7, -1.8], over: 'chase', fov: 44, card: ['sticky_wall', {}] }, { wait: 2.0 },
          say('chase', "…It's all one song.")] },
      // Keyboard under the sheet: dusty. (If Chase lifts the sheet, a thin grey line where a hand used to rest.)
      { id: 'h18_keys', at: 's18_keys', r: 0.95, flag: 's18_keys',
        steps: [meFace([-3.78, 0, -2.8]), { wait: 0.3 }, { shot: 'CAM', pos: [-3.0, 1.55, -1.45], look: [-3.75, 0.85, -2.75], fov: 46, to: { pos: [-3.05, 1.5, -1.6], look: [-3.75, 0.85, -2.75], fov: 44 }, dur: 5, ease: 'linear' }, { wait: 0.5 }, me("Hasn't been played in years."),
          { if: (s) => s.active === 'chase', then: [
            { act: [['chase', 'give', { dur: 1.0, loop: false }]] }, { wait: 0.4 },
            { prop: 'keyboard_sheet', fn: (o) => o.userData.lift(true) }, { flag: 's18_sheet' },
            { sfx: 'cloth_swish', vol: 0.3 },
            { shot: 'CAM', pos: [-3.45, 1.32, -1.9], look: [-3.78, 0.84, -2.9], fov: 32, to: { pos: [-3.47, 1.28, -1.98], look: [-3.78, 0.84, -2.9], fov: 30 }, dur: 3, ease: 'linear' },
            { wait: 2.6 }] }] },
      // Bookshelf: a row of identical notebooks labelled two 1, two 2 … two 31
      { id: 'h18_shelf', at: 's18_shelf', r: 0.95, flag: 's18_shelf',
        steps: [meFace([0.25, 0, -3.3]), { wait: 0.3 }, { shot: 'CAM', pos: [0.95, 1.42, -2.5], look: [0.25, 1.24, -3.3], fov: 32, card: ['notebooks', {}] }, { wait: 3.2 }] },
      // Balcony: the bay at dusk, the Ted Smout Bridge lit far off to the right, drone lights blinking along it
      { id: 'h18_balcony', at: 's18_balcony', r: 1.1, flag: 's18_balcony',
        steps: [meFace([-60, 0, 385]), { wait: 0.4 }, ots([-130, 2.0, 385], { fov: 40, dist: 1.1 }), { wait: 1.2 }, me("That's the bridge."), { wait: 0.4 }] },
      // The fridge (Luka): magnets, a takeaway menu, and a folded piece of card under a pelican magnet
      { id: 'h18_fridge', at: 'fridge_card', r: 0.95, only: 'luka', once: true, flag: 's18_card', do: () => {} },
      // the kettle (a kettle that does not talk): the save point
      { id: 'h18_kettle', at: 's21_kettle', r: 0.95, verb: 'Use', kettle: true },
    ],
    steps: [
      ['cutscene', '1.8_arrive'],
      ['control', 'chase'],
      ['follow', 'luka'],
      ['swap', true],
      ['objective', 'Look around.'],
      ['roam', {
        until: 's18_card',
        // a look at the fridge door: the folded card under the pelican (no words)
        hint: { after: 100, steps: [{ shot: 'CAM', pos: [1.5, 1.55, -1.6], look: [3.29, 1.42, -3.12], fov: 20, to: { pos: [1.6, 1.55, -1.7], look: [3.29, 1.42, -3.12], fov: 18 }, dur: 3, ease: 'linear' }, { wait: 2.2 }] },
        async auto(c) {
          const T = (id) => c.hotspots.trigger(id);
          swapTo(c, 'chase');
          await walk(c, [[0.3, 0, -1.7], 's18_sticky_chase'], false); await T('h18_sticky');
          await walk(c, ['s18_keys'], false); await T('h18_keys');
          await walk(c, [[-0.6, 0, -1.9], 's18_shelf'], false); await T('h18_shelf');
          await walk(c, [[-1.6, 0, -1.4], [-2.2, 0, -0.3], 's18_balcony'], false); await T('h18_balcony');
          await walk(c, [[-2.2, 0, -0.3], [0.6, 0, -1.7], 'kettle'], false); await T('h18_kettle');
          swapTo(c, 'luka');
          if (c.state.active !== 'luka') console.error('TWO 1.8: the fridge is Luka\'s');
          await walk(c, [[L_FRIDGE[0], 0, L_FRIDGE[2]]], false); await T('h18_fridge');
        },
      }],
      ['objective', null],
      ['swap', false],
      ['follow', null],
      ['cutscene', '1.8_order'],
    ],
    grants: { flags: { chip_off: true, s18_card: true, s18_order: true }, quiet: '40:18:00', noService: false },
  };

  // Cutscene — arrival (short). A tiny one-bedroom above a fish-and-chip shop. Sticky notes everywhere. A keyboard
  // under a sheet. A dying plant (a different one). A kettle that does not talk. A couch. A balcony with blinking
  // Christmas lights.
  CUTSCENES['1.8_arrive'] = [
    { do: (c) => nextTick().then(() => dress18(c)) },
    { fade: 'out', dur: 0 },
    DOORWAY,
    { fade: 'in', dur: 0.8 },
    { sfx: 'footstep', vol: 0.3 }, { wait: 0.35 }, { sfx: 'footstep', vol: 0.3 }, { wait: 0.4 },
    { sfx: 'clunk', vol: 0.4 },
    { prop: 'entry_door', fn: (o) => o.userData.open(true) },
    { sfx: 'creak', vol: 0.35 },
    { wait: 0.5 },
    { move: 'chase40', to: 's18_arr_c40', nowait: true },
    { wait: 0.5 },
    { move: 'luka', to: [1.0, 0, -2.35], nowait: true },
    { wait: 0.4 },
    { move: 'chase', to: [1.95, 0, -2.6], nowait: true },
    { wait: 1.4 },
    PAN,
    { wait: 5.6 },
    { place: 'chase40', at: 's18_arr_c40' }, put('luka', 1.0, -2.35, 1.0), put('chase', 1.95, -2.6, 0.5),
    { face: 'luka', to: 'chase40', dur: 0 }, { face: 'chase', to: 'chase40', dur: 0 },
    CLOSE('chase40', { yaw: -0.6, dist: 1.25, fov: 38, push: 0.12, dur: 5 }),
    say('chase40', "I'll get chips. ^ Don't touch anything."),
    // (He goes downstairs.)
    LEAVING,
    { move: 'chase40', to: 's18_out_c40' },
    { despawn: 'chase40' },
    { prop: 'entry_door', fn: (o) => o.userData.open(false) },
    { sfx: 'clunk', vol: 0.35 },
    { wait: 0.6 },
    { face: 'chase', to: 'luka', dur: 0.4 }, { face: 'luka', to: 'chase', dur: 0.4 },
    { wait: 0.45 },
    { shot: 'OTS', on: 'chase', over: 'luka', fov: 40, dist: 1.0 },
    { wait: 0.3 },
    say('chase', "We're going to touch everything."),
    { shot: 'OTS', on: 'luka', over: 'chase', fov: 40, dist: 1.0 },
    glance('luka', 'chase', 0.9), { wait: 0.6 },
    say('luka', 'Obviously.'),
  ];

  // Cutscene — "1.8_order". No music. Played straight: no release.
  CUTSCENES['1.8_order'] = [
    { do: (c) => { c.music(null, { fade: 0.4 }); } },
    // staging under the first cut: Luka at the fridge, Chase at the sticky notes, the parcel downstairs with Chase (2040)
    { place: 'luka', at: L_FRIDGE }, { place: 'chase', at: 's18_sticky_chase' },
    { expr: [['luka', 'neutral'], ['chase', 'neutral']] },
    { act: [['luka', 'idle'], ['chase', 'idle']] },
    // [INSERT · Luka's hands] He slides the card out from under the magnet and opens it. An order of service:
    // Celebrating the life of LUKA · "I'll do it." · Redcliffe · January 2035. A photo of an older Luka laughing at
    // something off-frame.
    HANDS_FRIDGE,
    { wait: 1.3 },
    { act: [['luka', 'give', { dur: 1.4, loop: false }]] },
    { wait: 0.7 },
    { sfx: 'card_slide', vol: 0.25 },
    { do: (c) => cardInHand(c, true) },
    { wait: 0.6 },
    { place: 'luka', at: L_READ },
    { act: [['luka', 'reading_bare']] },
    { sfx: 'cloth_swish', vol: 0.12 },
    HANDS_CARD,
    { wait: 3.8 },
    // [CLOSE · Luka, locked] No music. The fridge hums. He doesn't move.
    { expr: [['luka', 'still']] },
    { do: (c) => { if (sk(c)) return; const a = act(c, 'luka'); if (!a) return; c.ui.card(null); a.eyePos(V1); c.cam.shot({ shot: 'CAM', pos: [V1.x - 0.9, V1.y - 0.1, V1.z + 0.05], look: [V1.x, V1.y - 0.06, V1.z], fov: 34 }); } },
    { wait: 3.4 },
    // [WIDE] Chase looks up from the sticky notes. Sees Luka's stillness.
    ROOM_WIDE,
    { wait: 1.2 },
    { act: [['chase', 'glance', { yaw: 1.2, dur: 1.6 }]] },
    { wait: 0.9 },
    { face: 'chase', to: 'luka', dur: 0.7 },
    { wait: 0.7 },
    say('chase', "What's that?"),
    // (Luka doesn't answer. Chase comes over. Reads it over Luka's shoulder.)
    { wait: 1.0 },
    { move: 'chase', to: [0.2, 0, -1.9] },
    { move: 'chase', to: [C_READ[0], 0, C_READ[2]] },
    { face: 'chase', to: C_READ[3], dur: 0.4 },
    { act: [['chase', 'look_down']] },
    { wait: 0.5 },
    // [CLOSE · Chase] His face.
    { place: 'chase', at: [3.05, 0, -2.2, -2.6] }, { act: [['chase', 'look_down']] },
    { expr: [['chase', 'stunned']] },
    CLOSE('chase', { yaw: 1.0, dist: 1.0, fov: 36, push: 0.06, dur: 5, ly: 0.06, dy: 0.04 }),   // from the room side: Luka out of frame
    { wait: 2.4 },
    { expr: [['chase', 'sad']] },
    { wait: 1.2 },
    // [WIDE · the doorway] Chase (2040) comes in with a paper parcel of fish and chips and sees them. He stops.
    { spawn: 'chase40', at: 's18_landing_c40' },
    { do: (c) => parcel(c, 'hand') },
    DOOR_WIDE,
    { sfx: 'footstep', vol: 0.25 }, { wait: 0.3 },
    { sfx: 'clunk', vol: 0.35 },
    { prop: 'entry_door', fn: (o) => o.userData.open(true) },
    { wait: 0.4 },
    { move: 'chase40', to: 's18_door_c40' },
    { move: 'chase40', to: [C40_IN[0], 0, C40_IN[2]], face: false },
    { face: 'chase40', to: C40_IN[3], dur: 0.3 },
    { act: [['chase', 'idle']] },
    { face: 'chase', to: 'chase40', dur: 0.5 },
    { expr: [['chase40', 'still']] },
    // Stare, 3 s.
    { stare: 3 },
    // the conversation: Luka and Chase (2040) face each other across the tiny kitchen; Chase between them
    { face: 'luka', to: -1.74, dur: 0 }, { face: 'chase40', to: 1.40, dur: 0 },
    { act: [['luka', 'idle']] },
    { expr: [['chase40', 'sad']] },
    CLOSE('chase40', { yaw: -0.45, dist: 1.0, fov: 36, push: 0.1, dur: 8 }),
    slow('chase40', '…I was going to tell you.'),
    CLOSE('luka', { yaw: 0.75, dist: 0.95, fov: 36, push: 0.1, dur: 6 }),
    slow('luka', 'When?'),
    CLOSE('chase40', { yaw: -0.45, dist: 1.0, fov: 36, push: 0.1, dur: 6 }),
    slow('chase40', 'After.'),
    { face: 'chase', to: 'chase40', dur: 0 },
    { expr: [['chase', 'worried']] },
    { do: (c) => closeAway(c, 'chase', 'chase40', { dist: 1.0, fov: 36, push: 0.1, dur: 6 }) },
    say('chase', 'After WHAT?'),
    CLOSE('chase40', { yaw: -0.45, dist: 1.0, fov: 36, push: 0.1, dur: 9 }),
    slow('chase40', "After you'd helped. ^ I didn't think you'd come if you knew."),
    { expr: [['luka', 'sad']] },
    CLOSE('luka', { yaw: 0.75, dist: 0.9, fov: 36, push: 0.12, dur: 8 }),
    slow('luka', 'How?', { tag: 'quiet' }),
    CLOSE('chase40', { yaw: -0.45, dist: 0.95, fov: 36, push: 0.12, dur: 12 }),
    slow('chase40', 'Fire. Data centre at Murarrie. Six years ago Monday. ^ You went back in.'),
    CLOSE('luka', { yaw: 0.75, dist: 0.85, fov: 36, push: 0.1, dur: 6 }),
    slow('luka', '…For who?'),
    CLOSE('chase40', { yaw: -0.45, dist: 0.9, fov: 36, push: 0.08, dur: 6 }),
    slow('chase40', 'Everyone else.'),
    CLOSE('luka', { yaw: 0.75, dist: 0.82, fov: 36, push: 0.1, dur: 6 }),
    slow('luka', 'Did I get them out?'),
    { expr: [['chase40', 'tearful']] },
    CLOSE('chase40', { yaw: -0.45, dist: 0.88, fov: 36, push: 0.12, dur: 9 }),
    slow('chase40', 'Everyone. ^ Everyone but you.'),
    { wait: 0.8 },
    // [WIDE · locked] The three of them in the tiny kitchen. The parcel of chips going cold on the bench. The
    // Christmas lights blink on the balcony.
    put('chase40', 2.95, -1.55, -1.96), { do: (c) => parcel(c, 'bench') },
    put('chase', 2.45, -0.8, -2.56), put('luka', 1.6, -2.1, 0.3),
    { act: [['chase40', 'idle'], ['chase', 'idle'], ['luka', 'reading_bare']] },
    { expr: [['chase40', 'sad'], ['chase', 'sad'], ['luka', 'still']] },
    KITCHEN_LOCKED,
    { wait: 2.6 },
    say('chase', "That's what 'not around' means."),
    say('chase40', 'Yeah.'),
    // LUKA (reading the card again)
    { act: [['luka', 'reading_bare']] },
    CLOSE('luka', { yaw: 0.2, dist: 0.9, fov: 36, push: 0.08, dur: 6, ly: -0.06, dy: -0.06 }),
    { wait: 1.0 },
    slow('luka', "…'I'll do it.'"),
    { do: (c) => closeAway(c, 'chase40', 'chase', { dist: 1.0, fov: 38, push: 0.08, dur: 7 }) },
    slow('chase40', 'You said it all the time. Drove everyone mad.'),
    { wait: 0.6 },
    // [INSERT] Luka folds the card carefully, slides it back under the pelican magnet, and straightens it by one
    // millimetre.
    { place: 'luka', at: L_FRIDGE },
    HANDS_FRIDGE,
    { wait: 0.5 },
    { sfx: 'cloth_swish', vol: 0.1 },
    { act: [['luka', 'give', { dur: 1.6, loop: false }]] },
    { wait: 0.6 },
    { do: (c) => cardInHand(c, false) },
    { sfx: 'card_slide', vol: 0.2 },
    { do: (c) => { const cd = P(c, 'fridge_card'); if (cd) cd.rotation.x = 0.09; } },
    { wait: 0.8 },
    FRIDGE_MM,
    { wait: 0.6 },
    { do: (c) => straighten(c) },
    { wait: 1.8 },
    // LUKA: "…Chips are getting cold."
    { face: 'luka', to: 0, dur: 0 },
    { act: [['luka', 'idle']] },
    { expr: [['luka', 'sad']] },
    CLOSE('luka', { yaw: 0, dist: 1.0, fov: 36, push: 0.06, dur: 5 }),
    { wait: 0.6 },
    glance('luka', 'chase', 1.0), { wait: 0.8 },
    say('luka', '…Chips are getting cold.'),
    { wait: 0.8 },
    // [WIDE · exterior, from the Parade, looking up at the window] Three figures at a small table, eating in silence. A
    // hover-car glides past a foot off the road. Its indicator chirps: "Are you sure?"
    { set: 'parade', env: 'evening' },
    { do: (c) => nextTick().then(() => { paths(); if (SETS.parade && SETS.parade.dress) SETS.parade.dress('evening18'); const w = P(c, 'flat_window'); if (w) w.userData.lit(true); }) },
    EXT,
    { wait: 1.0 },
    drive('s18_pass', 3.2), indicate(true),
    { wait: 3.6 },
    say('hovercar', 'Are you sure?', { tag: 'chirping' }),
    { wait: 1.8 },
    // Title: END OF ACT ONE.
    { fade: 'out', dur: 1.2 },
    { title: 'END OF ACT ONE', dur: 3 },
  ];
})();
