// ============================================================ CONTENT: 3.7 ("Storage Full")
// BUILD_PROMPT §8 3.7. Every line is final and word for word; '^' = a beat. Shot tags are quoted in the comments.
// Set: hq_roof (golden37 dress, env golden: docs/sets/hq_roof.md, src/22-set-hq-roof.js; every mark/anchor is the set's).
// No roam, no kettle (the roof has none), no samples. Five cutscenes (3.7_roof, _sorry, _staying, _storage, _fears), then
// THE CHOICE (MINIGAMES.choice in 52-mg-hold.js: both buttons live, hold 3 s, writes state.choice and the profile; the
// flow branches 3.7 -> A1 / B1 on it). The Choice gets no release: a single sustained chord (music 'sustain'), nobody
// speaks, nothing after it. The honest moments play straight: no music under them at all, only the roof's own beds (the
// Valley's music drifting up, the wind, the drones' hum, drips).
// Story flags: hurt + lanyard_snapped (3.5) are restated here so 3.7 stands on its own (Continue, Chapter Select);
// bandaged is set at the start (the torn polo is already pulled up and the wrap is going on); santa is off (Luka dropped
// the hat and beard on the sleigh in 3.2: they lie on the roof as the set's props). Luka (2040)'s hood is down.
(() => {
  const PI = Math.PI, H = PI / 2;
  const say = (id, text, o) => Object.assign({ say: id, text }, o);
  const slow = (id, text, o) => say(id, text, Object.assign({ speed: 'slow' }, o));
  const sk = (c) => c.flow.skipping;
  const P = (c, n) => c.world.prop(n);
  const act = (c, id) => c.world.actor(id);
  const V1 = new THREE.Vector3();
  const ID = '3.7';
  const put = (id, at) => ({ place: id, at });
  const fx = (id, fn) => ({ do: (c) => { const a = act(c, id); if (a) fn(a.rig.face, a); } });
  const ud = (c, n) => { const o = P(c, n); return o ? o.userData : null; };
  // a cue at a word inside one long line: the dialogue box's text node has typed past `sub` (its length is read, so the
  // waitUntil predicate allocates nothing; '^' beats are dropped from the shown text the way say() drops them)
  function shownText(t) {
    let out = '';
    for (let k = 0; k < t.length; k++) { const ch = t[k]; if (ch === '^') { if (t[k + 1] === ' ' && (out === '' || out.endsWith(' '))) k++; continue; } out += ch; }
    return out;
  }
  const withCue = (line, sub, fn, cap = 20) => {
    const n = shownText(line.text).indexOf(sub) + sub.length;
    return { par: [line, { do: async (c) => {
      const el = document.querySelector('#dlg .txt'), node = el && el.firstChild, t0 = clock.t;
      await waitUntil(() => c.flow.skipping || !node || node.length >= n || clock.t - t0 > cap);
      if (c.flow.sceneId === ID) fn(c);
    } }] };
  };
  // a head turn without moving the feet (one-shot; the seated/kneeling legs stay: glance is an upper anim)
  function glanceAt(c, id, to, dur = 1.4) {
    const a = act(c, id), b = typeof to === 'string' ? act(c, to) : null;
    if (!a || sk(c)) return;
    const tx = b ? b.pos.x : to[0], tz = b ? b.pos.z : to[1];
    let rel = Math.atan2(tx - a.pos.x, tz - a.pos.z) - a.rotY;
    while (rel > PI) rel -= 2 * PI;
    while (rel < -PI) rel += 2 * PI;
    a.play('glance', { yaw: Math.max(-1.3, Math.min(1.3, rel)), dur });
  }
  const glance = (id, to, dur) => ({ do: (c) => { glanceAt(c, id, to, dur); } });
  // a computed close-up: the lens `dist` m from his eyes, `yaw` rad off his facing (+ = toward his left), pushing in
  // `push` m over `dur` s (linear). Read at step time (place/face under the cut first); nothing while skipping.
  function closeOn(c, id, o = {}) {
    if (sk(c)) return;
    const a = act(c, id);
    if (!a) return;
    a.eyePos(V1);
    const ry = a.rotY + (o.yaw || 0), d = o.dist || 0.95, pu = o.push ?? 0.12, ly = V1.y - 0.05 + (o.ly || 0);
    const sx = Math.sin(ry), sz = Math.cos(ry), y = V1.y + (o.dy ?? -0.02), f = o.fov || 36;
    c.cam.shot({ shot: 'CAM', pos: [V1.x + sx * d, y, V1.z + sz * d], look: [V1.x, ly, V1.z], fov: f,
      to: { pos: [V1.x + sx * (d - pu), y, V1.z + sz * (d - pu)], look: [V1.x, ly, V1.z], fov: o.fovTo || f }, dur: o.dur || 7, ease: 'linear' });
  }
  const CLOSE = (id, o) => ({ do: (c) => { closeOn(c, id, o); } });
  // an anchor's lens with a slow push (amount = the end distance as a share of the start)
  const lensPush = (n, amount, dur, o) => Object.assign({ shot: 'INSERT', at: n, move: 'push', amount, dur, ease: 'linear' }, o);
  // the set's spot as a lamp; the ring's light (0..1), the Remote's little screen
  const lamp = (name) => ({ do: (c) => { const s = SETS.hq_roof; if (s.lamp) s.lamp(name); } });
  const screen = (m) => ({ do: (c) => { const u = ud(c, 'remote_rig'); if (u && u.screen) u.screen(m); } });
  // back on his feet: a floor-sit survives 'idle' and every upper anim (and a skipped walk plays no gait to clear it)
  const up = (list) => ({ do: (c) => { for (const [id, anim, o] of list) { const a = act(c, id); if (!a) continue; a.rig.seated = false; a.rig.floorSit = false; a.play(anim || 'idle', o || {}); } } });
  // a walk through waypoints (the ring's gap), not awaited by the caller; jumps straight there while skipping
  async function via(c, id, pts, o) {
    const sid = c.flow.sceneId;
    for (const p of pts) { const a = act(c, id); if (!a || c.flow.sceneId !== sid) return; await a.moveTo(p, o); }
  }

  // ---------------------------------------------------------- anims this file owns (guarded; no allocation per tick)
  const K = () => (typeof RIGKIT !== 'undefined' ? RIGKIT : null);
  let TY = 0, TZ = 0;
  // a point in hips space -> torso space through the torso's current lean (RIGKIT.toTorso without the array)
  function toT(r, y, z) { const th = r.parts.torso.rotation.x, yy = y - 0.06, cc = Math.cos(th), ss = Math.sin(th); TY = yy * cc + z * ss; TZ = -yy * ss + z * cc; }
  // reach arm `sd` (+1 left, -1 right) `x` out from the centre line to a point `hM` m above the feet and `zM` m ahead
  function reach(r, k, sd, x, hM, zM, px, py, pz) { toT(r, k.hipsY(r, hM) - r.parts.hips.position.y, k.hipsY(r, zM)); k.arm(r, sd, x, TY, TZ, px, py, pz); }
  function defAnims() {
    // Chase kneeling at the Remote on the present, wiring it into the brick phone (hands busy at the table top)
    if (!ANIMS.s37_wire) ANIMS.s37_wire = (r, t, p) => {
      const k = K(); if (!k) return ANIMS.idle(r, t, p);
      k.kneel(r, t); const Pt = r.parts, w = t * 3.1;
      Pt.torso.rotation.x = 0.3 + 0.02 * Math.sin(t * 1.3);
      reach(r, k, 1, 0.1 + 0.03 * Math.sin(w), 0.7 + 0.02 * Math.sin(w * 1.7), 0.42, 0.5, -1, -0.4);
      reach(r, k, -1, 0.06 + 0.02 * Math.cos(w * 0.8), 0.69, 0.44 + 0.02 * Math.sin(w * 1.3), 0.5, -1, -0.4);
      Pt.handL.rotation.x = 0.5; Pt.handR.rotation.x = 0.5; Pt.head.rotation.x = 0.4; Pt.neck.rotation.x = 0.1;
    };
    // at the parapet, facing the city, forearms on the cap (cap top y 1.2, 0.5 m ahead); p.hand: Luka (2040)'s left hand
    // goes to the right shoulder of the man on his left (Chase (2040), 0.7 m off) and stays there
    if (!ANIMS.s37_lean) ANIMS.s37_lean = (r, t, p) => {
      const k = K(); if (!k) return ANIMS.idle(r, t, p);
      const Pt = r.parts;
      Pt.hips.position.z = -0.05;
      Pt.torso.rotation.x = (p.hand ? 0.14 : 0.32) + 0.012 * Math.sin(t * 1.4);
      reach(r, k, -1, 0.1, 1.24, 0.52, 0.6, -0.6, -0.2);
      if (p.hand) { reach(r, k, 1, 0.55, 1.36, 0.2, 0.3, -1, -0.5); Pt.handL.rotation.set(0.2, 0, -0.5); }
      else reach(r, k, 1, 0.1, 1.24, 0.52, 0.6, -0.6, -0.2);
      Pt.head.rotation.x = p.hand ? 0.12 : -0.08; Pt.neck.rotation.x = 0.02;
      if (p.look) Pt.head.rotation.y = p.look;
    };
    // Chase (2040) wiping his face with the back of his right hand, head down (standing at the parapet)
    if (!ANIMS.s37_wipe) ANIMS.s37_wipe = (r, t, p) => {
      const k = K(); if (!k) return ANIMS.idle(r, t, p);
      k.base(r, t); const Pt = r.parts, d = r.d, u = Math.min(1, t / 0.5), s = Math.sin(t * 4.2);
      Pt.torso.rotation.x += 0.12;
      k.arm(r, -1, 0.02 + 0.03 * s * u, (d.headC - 0.08) * u - 0.05 * (1 - u), 0.15 + 0.1 * (1 - u), 1, -1, -0.3);
      Pt.handR.rotation.set(-0.7, 0.3, 0.5);
      reach(r, k, 1, 0.1, 1.24, 0.5, 0.6, -0.6, -0.2);
      Pt.head.rotation.x = 0.22; Pt.neck.rotation.x = 0.08;
    };
    // a hand resting on the Remote on the present (table top 0.6, the Remote 0.62..0.7): sd the hand that rests on it,
    // p.x/p.z its offset; the other hand hangs. Standing, leaning in over it.
    if (!ANIMS.s37_rest) ANIMS.s37_rest = (r, t, p) => {
      const k = K(); if (!k) return ANIMS.idle(r, t, p);
      k.base(r, t); const Pt = r.parts, sd = p.sd || 1;
      Pt.torso.rotation.x = 0.36 + 0.01 * Math.sin(t * 1.3);
      reach(r, k, sd, p.x ?? 0.16, 0.72, p.z ?? 0.4, 0.5, -1, -0.4);
      if (sd > 0) Pt.handL.rotation.set(0.9, 0, -0.2); else Pt.handR.rotation.set(0.9, 0, 0.2);
      Pt.head.rotation.x = 0.3; Pt.neck.rotation.x = 0.1;
    };
    // Luka (2040) leaning in to read the small print on the Remote's screen (hands behind his back)
    if (!ANIMS.s37_peer) ANIMS.s37_peer = (r, t, p) => {
      const k = K(); if (!k) return ANIMS.idle(r, t, p);
      k.base(r, t); const Pt = r.parts, d = r.d, u = Math.min(1, t / 0.8), e = u * u * (3 - 2 * u);
      Pt.torso.rotation.x += 0.36 * e; Pt.neck.rotation.x = 0.1 * e; Pt.head.rotation.x = 0.28 * e;
      k.arm(r, 1, 0.12, 0.02, -(d.chestZ + 0.06), 0.5, -1, 0.6); k.arm(r, -1, 0.12, 0.02, -(d.chestZ + 0.06), 0.5, -1, 0.6);
    };
    ANIMS.s37_peer.upper = true;
    // Luka walking hurt: a short careful gait, hunched over his ribs
    if (!ANIMS.s37_limp) ANIMS.s37_limp = (r, t, p) => {
      const k = K(); if (!k) return ANIMS.walk(r, t, p);
      k.gait(r, t, 5.4 * (p.speed || 1), 0.3, 0.55, 0.08, -0.3, 0.022, 0.06);
      ANIMS.hurt_stand(r, t, LIMP);
    };
    // the older two leaning back on the parapet, hands back on the cap, watching (fears)
    if (!ANIMS.s37_back) ANIMS.s37_back = (r, t, p) => {
      const k = K(); if (!k) return ANIMS.idle(r, t, p);
      k.base(r, t); const Pt = r.parts;
      Pt.hips.position.z = -0.06; Pt.torso.rotation.x = -0.1 + 0.012 * Math.sin(t * 1.2);
      reach(r, k, 1, 0.24, 1.12, -0.36, 0.6, -1, 0.4); reach(r, k, -1, 0.24, 1.12, -0.36, 0.6, -1, 0.4);
      Pt.head.rotation.x = 0.08;
    };
  }
  const LIMP = { walk: true };
  defAnims();

  // ---------------------------------------------------------- the STORAGE FULL pop-up (SafeSense, 2040-styled)
  // Built over the pooled DOM pop-up: the message is laid out like the Choice's painted one (52-mg-hold.js) so the
  // mini-game's pop-up lands on the same picture; the YES / NO pills are drawn but inert (in the cutscene YES advances
  // the talk, not the pop-up), each with what it does underneath: YES keeps the memories, NO clears them.
  const SYS = 'system-ui,-apple-system,"Segoe UI",Roboto,Arial,sans-serif';
  const MSG = '<div style="font-family:' + SYS + ';text-align:center;line-height:1.3">' +
    '<div style="display:flex;align-items:center;justify-content:center;gap:10px;margin:0 0 10px">' +
    '<i style="display:inline-block;width:22px;height:22px;border-radius:50%;background:radial-gradient(circle at 38% 35%,#fff 0 16%,#ffc58f 50%,#f08a3a);color:#fff;font:800 13px/22px ' + SYS + ';font-style:normal;box-shadow:0 0 10px rgba(255,170,90,.6)">!</i>' +
    '<b style="font-size:min(25px,6.4vw);font-weight:800;letter-spacing:.02em;color:#1c2a44">STORAGE FULL</b></div>' +
    '<div style="font-size:min(15px,3.9vw);color:#3c4c6a">To complete this call, the following will be cleared:</div>' +
    '<div style="font-size:min(23px,5.6vw);font-weight:800;color:#1c2a44;margin:6px 0 12px">2 days, 6 hours, 54 minutes.</div>' +
    '<div style="font-size:min(15px,3.9vw);font-style:italic;color:#2f86e0">Never forget anything again!</div>' +
    '<div style="font-size:min(16px,4.1vw);font-weight:700;color:#1c2a44;margin-top:8px">Upgrade to Optus Cloud+ and keep them instead?</div></div>';
  const PILL = 'display:inline-block;min-width:96px;padding:7px 22px;border-radius:999px;font-weight:600;letter-spacing:.06em;font-size:14px;color:#fff;background:linear-gradient(#5aa6f2,#2f86e0);box-shadow:0 0 12px rgba(95,178,255,.55)';
  const CAP = 'display:block;margin-top:7px;font:600 13px ' + SYS + ';color:#4a5a78;letter-spacing:0';
  // On a portrait phone the 2.35:1 bars cover most of the screen and pop-ups sit under them (#pops z 5 < .lb z 6), so
  // while the pop-up is up the bars slide away there (and come back for the close-ups in between).
  const HELD = { p: null, tf: '', lbOff: false };
  const tall = () => innerHeight > innerWidth;
  function storageFull(c) {
    HELD.p = null;
    if (sk(c)) return;
    const w = Math.min(480, innerWidth - 24);
    const p = c.popup({ style: 'safesense', title: 'SafeSense', icon: 'none', buttons: [], at: [0.5, 0.43], w });
    const el = p.el, m = el.querySelector('.jv-msg'), row = el.querySelector('.jv-btns');
    if (m) m.innerHTML = MSG;
    if (row) {
      for (const [b, cap] of [['YES', 'Keep the memories'], ['NO', 'Clear the memories']]) {
        const s = document.createElement('span');
        s.style.cssText = 'display:inline-flex;flex-direction:column;align-items:center;margin:2px 14px 0';
        s.innerHTML = '<span style="' + PILL + '">' + b + '</span><span style="' + CAP + '">' + cap + '</span>';
        row.append(s);
      }
    }
    HELD.p = p;
    if (tall()) { HELD.lbOff = true; c.ui.letterbox(false); }
  }
  // "The pop-up waits": parked off screen through the close-ups, back on the JARVIS-CAM (the pool's place() resets it)
  const park = { do: (c) => { const p = HELD.p; if (p && p.el) { HELD.tf = p.el.style.transform; p.el.style.transform = 'translate(-9999px,0)'; } if (HELD.lbOff) c.ui.letterbox(true); } };
  const unpark = { do: (c) => { const p = HELD.p; if (p && p.el && !p.el.classList.contains('off')) { p.el.style.transform = HELD.tf; if (HELD.lbOff) c.ui.letterbox(false); } } };
  const dropPop = { do: (c) => { if (HELD.p) HELD.p.close(); HELD.p = null; if (HELD.lbOff) c.ui.letterbox(true); HELD.lbOff = false; } };

  // ---------------------------------------------------------- dressing (Continue / Chapter Select restart at step 0)
  // pooled rigs leave the scene standing: a floor-sit would otherwise survive into A1 / B1's first upper anim
  const RIGS = [];
  let rested = true;
  function rest() {
    if (rested) return;
    rested = true;
    for (const r of RIGS) { r.seated = false; r.floorSit = false; }
    RIGS.length = 0;
  }
  if (typeof on === 'function') on('flow:stop', rest);
  function dress37(c) {
    const f = c.state.flags;
    f.hurt = true; f.lanyard_snapped = true; f.bandaged = true; delete f.santa;
    for (const id of ['luka', 'chase', 'luka40', 'chase40']) {
      const a = act(c, id);
      if (!a) continue;
      a.rig.dress(c.state);
      if (id === 'luka40') a.rig.show('hood', false);
      if (!RIGS.includes(a.rig)) RIGS.push(a.rig);
      a.setExpr(id === 'luka40' ? 'still' : 'neutral');
    }
    rested = false;
    const s = SETS.hq_roof;
    if (s.dress) s.dress('golden37');   // (the set's auto dress for 3.7, applied now so the lamp below isn't clobbered)
    const u = ud(c, 'ring'); if (u) { if (u.level) u.level(1, 0); if (u.flicker) u.flicker(true); }
    const rr = ud(c, 'remote_rig'); if (rr && rr.screen) rr.screen('off');
    if (s.lamp) s.lamp('ring');
    HELD.p = null; HELD.lbOff = false;
  }

  // ---------------------------------------------------------- framings and blocking (the set's marks and anchors where they fit)
  const LUKA_SIT = 's37_luka_sit', L40_KNEEL = 's37_l40_kneel';
  const RX = -0.12, RY = 0.74, RZ = -18.86;                         // the Remote's little screen (remote_rig, facing south)
  const toRemote = (x, z) => Math.atan2(RX - x, RZ - z);
  // the four round the Remote for the JARVIS-CAM: a shallow arc 1.7-2.2 m out from the screen so every face clears the
  // next one (the set's s37_st_* marks put Future Luka straight behind Luka from the screen's side)
  const ARC = { luka40: [0.91, 0, -17.51], luka: [0.18, 0, -17.73], chase: [-0.36, 0, -17.77], chase40: [-1.10, 0, -17.53] };
  for (const k in ARC) ARC[k][3] = toRemote(ARC[k][0], ARC[k][2]);
  const FOUR = ['chase', 'luka', 'luka40', 'chase40'];
  function gathered(c) {   // (a waitUntil predicate: no allocation)
    for (let i = 0; i < 4; i++) { const id = FOUR[i], a = act(c, id); if (a && Math.abs(a.pos.x - ARC[id][0]) + Math.abs(a.pos.z - ARC[id][2]) > 0.06) return false; }
    return true;
  }
  // [JARVIS-CAM] from just behind and above the Remote's screen (its back in the foot of frame), aimed at their eyes
  const JCAM = { shot: 'JARVIS', at: [RX, RY, RZ], from: [-0.12, 1.12, -19.5], on: FOUR, size: 'CLOSE', move: 'push', amount: 0.94, dur: 10, ease: 'linear' };
  // the talk that follows: the older two face each other across the Remote's south side, the past selves by the box
  const TALK = { luka40: [0.91, 0, -17.5, -H], chase40: [-1.1, 0, -17.5, H], chase: [-0.4, 0, -18.4, 0.35], luka: [0.7, 0, -18.5, -0.6] };
  const OLDER_L40 = (o) => CLOSE('luka40', Object.assign({ yaw: 0.35, dist: 1.25, push: 0.12, dur: 8, fov: 34 }, o));     // the lift house behind him
  const OLDER_C40 = (o) => CLOSE('chase40', Object.assign({ yaw: -0.35, dist: 1.25, push: 0.12, dur: 8, fov: 34 }, o));   // the Valley behind him
  const SUN_C40 = (o) => CLOSE('chase40', Object.assign({ yaw: 0.4, dist: 1.25, push: 0.3, dur: 18, fov: 34 }, o));       // the low gold sun behind him
  const HANDS = { shot: 'INSERT', at: 's37_hands' };
  // the opening crane: from over the top of the Yes sign (never through its letters) down onto the roof (s37_crane_b)
  const CRANE = { shot: 'CAM', pos: [1.5, 17.5, -35.3], look: [0.0, 1.0, -4.0], fov: 52, to: { pos: [-3.0, 6.0, -33.0], look: [0.0, -4.0, 10.0], fov: 56 }, dur: 7 };
  // Luka against the parapet, Future Luka kneeling at his side: both heads in, Luka three-quarter front
  const BANDAGE = { shot: 'CAM', pos: [-3.6, 1.35, -13.7], look: [-2.05, 0.95, -12.15], fov: 40, to: { pos: [-3.42, 1.31, -13.46], look: [-2.05, 0.93, -12.15], fov: 40 }, dur: 12, ease: 'linear' };
  // behind the two older men at the parapet, high: the drop, the river and the Story Bridge below them
  const BEHIND = { shot: 'CAM', pos: [4.25, 2.3, -14.6], look: [4.25, 1.0, -10.5], fov: 40, to: { pos: [4.25, 2.22, -14.3], look: [4.25, 1.0, -10.5], fov: 40 }, dur: 6, ease: 'out' };
  // the walk along the parapet to Luka, from the north-west outside the ring
  const ALONG = { shot: 'CAM', pos: [-5.6, 1.6, -15.6], look: [-2.3, 0.75, -12.2], fov: 44, to: { pos: [-5.2, 1.5, -15.2], look: [-2.6, 0.75, -12.1], fov: 42 }, dur: 5 };
  // the two Lukas against the parapet, three-quarter front from outside the ring
  const STAYING = { shot: 'CAM', pos: [-1.75, 1.0, -13.2], look: [-2.8, 0.85, -11.95], fov: 40, to: { pos: [-2.0, 0.97, -12.92], look: [-2.8, 0.86, -11.95], fov: 40 }, dur: 24, ease: 'linear' };
  // the four gathering at the Remote: high, from the crown side, the ring round them and the city beyond the parapet
  const GATHER = { shot: 'CAM', pos: [0.5, 2.9, -23.2], look: [0.0, 0.8, -15.4], fov: 48, to: { pos: [0.35, 2.7, -22.6], look: [0.0, 0.95, -16.9], fov: 44 }, dur: 6 };
  // the older two at the parapet, from the Remote (Luka's eyeline when he nods at them)
  const OLDER = { shot: 'CAM', pos: [2.3, 1.45, -15.6], look: [4.2, 1.35, -11.95], fov: 34, to: { pos: [2.5, 1.45, -15.2], look: [4.2, 1.35, -11.95], fov: 32 }, dur: 6, ease: 'linear' };
  // the past selves across the Remote, side-on from the south through the ring's gap: the Yes sign above them
  const ACROSS = { shot: 'CAM', pos: [0.0, 1.3, -15.9], look: [0.0, 1.25, -18.95], fov: 40, to: { pos: [0.0, 1.3, -16.4], look: [0.0, 1.25, -18.95], fov: 40 }, dur: 6, ease: 'linear' };
  const PARAPET_TWO = { shot: 'CAM', pos: [4.2, 1.5, -14.6], look: [4.2, 1.35, -11.95], fov: 36, to: { pos: [4.2, 1.5, -14.25], look: [4.2, 1.35, -11.95], fov: 36 }, dur: 9, ease: 'linear' };
  const OTS_ON_CHASE = { shot: 'OTS', on: 'chase', over: 'luka', fov: 30, move: 'push', amount: 0.9, dur: 7, ease: 'linear' };
  const OTS_ON_LUKA = { shot: 'OTS', on: 'luka', over: 'chase', fov: 30, move: 'push', amount: 0.9, dur: 7, ease: 'linear' };

  // ============================================================ SCENE 3.7
  SCENES['3.7'] = {
    title: 'Storage Full', set: 'hq_roof', env: 'golden', time: '18:40', place: 'Optus Tower, the roof',
    playable: [], swap: false, music: null, hud: null,
    spawn: { luka: LUKA_SIT, luka40: L40_KNEEL, chase: 's37_chase_remote', chase40: 's37_c40_edge' },
    steps: [
      ['do', dress37],
      ['cutscene', '3.7_roof'],
      ['cutscene', '3.7_sorry'],
      ['cutscene', '3.7_staying'],
      ['cutscene', '3.7_storage'],
      ['cutscene', '3.7_fears'],
      // ▶ THE CHOICE. The pop-up sits over the frame (the mini-game paints their hands on the Remote under it, Rue's 3.4
      // framing). Both buttons are live. Nothing is greyed out. No timer. No hint. The music is a single sustained chord.
      // The characters say nothing more. Hold 3 s. (Result -> state.choice, the profile -> A1 / B1.)
      ['minigame', 'choice', { shot: HANDS }],
    ],
    grants: { flags: { hurt: true, lanyard_snapped: true, bandaged: true, santa: false } },
  };

  // ------------------------------------------------------------ Cutscene — "3.7_roof."
  CUTSCENES['3.7_roof'] = [
    put('luka', LUKA_SIT), put('luka40', L40_KNEEL), put('chase', 's37_chase_remote'), put('chase40', 's37_c40_edge'),
    { act: [['luka', 'sit_floor_wall'], ['luka40', 'bandage', { h: 0.42, z: 0.62 }], ['chase', 's37_wire'], ['chase40', 's37_lean']] },
    { expr: [['luka', 'hurt'], ['luka40', 'still'], ['chase', 'determined'], ['chase40', 'sad']] },
    // 1. [WIDE · the roof at golden hour] The storm has gone. Everything is washed and steaming. The river shines. The
    // Story Bridge. The Valley loud and alive below. The cardboard Santa sleigh has collapsed; the beard lies in a puddle.
    CRANE,
    { wait: 7 },
    // 2. [MID] A ring of four hundred yellow drones sits on the roof like candles: a power bank. In the middle, Chase
    // (2040)'s Remote is wired by Chase into Rue's brick phone.
    lensPush('s37_remote_mid', 0.8, 5.5),
    { wait: 0.8 }, { sfx: 'plug_click', vol: 0.3, at: [0.0, 0.7, -18.9] },
    { wait: 1.6 }, { sfx: 'plug_click', vol: 0.25, at: [0.0, 0.7, -18.9] },
    { wait: 1.8 },
    // 3. [CLOSE] Luka sits against the parapet with his torn polo pulled up and his ribs being bandaged. Future Luka
    // kneels beside him, wrapping the bandage, careful and quiet.
    lamp('parapet'),
    BANDAGE,
    { wait: 2.4 },
    // 4.
    say('luka40', 'Hold still.'),
    // 5.
    say('luka', 'You hold still.', { expr: 'sheepish' }),
    // 6. (Future Luka nearly smiles.)
    fx('luka40', (f) => { f.mouth('smirk'); }),
    { wait: 1.6 },
    fx('luka40', (f) => { f.mouth('closed'); }),
    { wait: 0.5 },
  ];

  // ------------------------------------------------------------ Cutscene — "3.7_sorry."
  // Future Luka finishes, stands, and goes over to Chase (2040) at the edge of the roof. One locked two-shot, side by
  // side at the parapet, the city below. (He walks in from behind them, over the drop; then the two-shot holds, locked,
  // through every line but the scripted CLOSE.)
  const SORRY = { shot: 'INSERT', at: 's37_sorry_two', locked: true };
  CUTSCENES['3.7_sorry'] = [
    { act: [['luka40', 'idle']] }, put('luka40', [1.2, 0, -12.5, H]),
    put('chase40', 's37_c40_edge'), { act: [['chase40', 's37_lean']] },
    { expr: [['luka', 'neutral'], ['luka40', 'still'], ['chase40', 'sad']] },
    lamp('ring'),
    BEHIND,
    { wait: 0.4 },
    { move: 'luka40', to: [3.9, 0, -11.95, 0] },
    { face: 'luka40', to: 0 },
    { act: [['luka40', 's37_lean']] },
    { wait: 1.6 },
    SORRY,
    { wait: 0.6 },
    // 7.
    slow('chase40', 'Six years.'),
    // 8.
    say('luka40', 'I know.'),
    // 9.
    say('chase40', "You don't get to decide that for me.", { expr: 'determined' }),
    // 10.
    say('luka40', 'I know. ^ I decided it for everyone.', { expr: 'sad' }),
    // 11.
    say('chase40', "I'm still angry."),
    // 12.
    say('luka40', 'Good.'),
    // 13.
    say('chase40', "I'm going to be angry for a while.", { expr: 'sad' }),
    // 14.
    slow('luka40', "I'll wait. ^ ^ …Sorry for the wait."),
    // 15. [CLOSE · Chase (2040)] He laughs, and it turns into something else halfway through.
    lensPush('s37_c40_close', 0.86, 7),
    { expr: [['chase40', 'laugh']] }, { act: [['chase40', 'laugh']] },
    { wait: 1.3 },
    { expr: [['chase40', 'crying']] }, { act: [['chase40', 'cry']] },
    { wait: 2.4 },
    // 16. (Future Luka puts a hand on his shoulder and leaves it there.)
    { act: [['chase40', 's37_lean']] }, { expr: [['chase40', 'tearful']] },
    SORRY,
    { act: [['luka40', 's37_lean', { hand: true }]] },
    { wait: 2.2 },
    // 17. (wiping his face)
    { act: [['chase40', 's37_wipe']] },
    { wait: 1.2 },
    say('chase40', '…Tea?'),
    // 18.
    { act: [['chase40', 's37_lean']] },
    slow('luka40', 'Yes, please.'),
    { wait: 1.2 },
  ];

  // ------------------------------------------------------------ Cutscene — "3.7_staying."
  // Future Luka sits down next to his past self against the parapet.
  CUTSCENES['3.7_staying'] = [
    { act: [['luka40', 'idle']] },
    put('luka40', [-0.4, 0, -12.35, -H - 0.15]),
    { expr: [['chase40', 'still'], ['luka', 'tired'], ['luka40', 'still']] },
    lamp('parapet'),
    ALONG,
    { do: (c) => { glanceAt(c, 'luka', 'luka40', 2.6); } },
    { move: 'luka40', to: [-3.2, 0, -12.45] },
    put('luka40', 's37_l40_sit'), { act: [['luka40', 'sit_floor_wall']] },
    { wait: 0.5 },
    STAYING,
    { wait: 1.2 },
    // 19.
    slow('luka40', 'I thought loving someone meant making sure nothing could ever hurt them.'),
    // 20.
    slow('luka', "It's staying when it does."),
    // 21. (a long look)
    glance('luka40', 'luka', 3.4),
    { wait: 2.0 },
    say('luka40', "When'd you get so smart?", { expr: 'fond' }),
    // 22. (nodding at Chase)
    withCue(say('luka', 'Last night. ^ He told me.', { expr: 'sheepish' }), 'He told', (c) => { glanceAt(c, 'luka', 'chase', 1.6); }),
    { wait: 1.0 },
  ];

  // ------------------------------------------------------------ Cutscene — "3.7_storage."
  CUTSCENES['3.7_storage'] = [
    put('chase', 's37_chase_remote'), { act: [['chase', 's37_wire']] }, { expr: [['chase', 'determined']] },
    // (the others are coming over from the parapet, out of this shot: they reach the ring's gap as it cuts)
    put('luka', [-0.25, 0, -12.9, PI]), put('luka40', [0.35, 0, -12.7, PI]), put('chase40', [1.1, 0, -12.3, -0.7]),
    up([['luka', 'hurt_stand'], ['luka40', 'idle'], ['chase40', 'idle']]),
    { expr: [['luka', 'hurt'], ['luka40', 'still'], ['chase40', 'still']] },
    lamp('ring'), screen('check'),
    // 23. [MID · Chase at the Remote, running the pre-call check]
    lensPush('s37_check', 0.82, 9),
    { sfx: 'key_beep', vol: 0.3, at: [0.0, 0.7, -18.9] }, { wait: 0.4 }, { sfx: 'key_beep', vol: 0.3, at: [0.0, 0.7, -18.9] }, { wait: 0.3 }, { sfx: 'beep', vol: 0.3, at: [0.0, 0.7, -18.9] },
    { wait: 0.6 },
    // 24. (the ring dims on "3%")
    withCue(say('chase', "Brick phone's live. Line's open. Drones are at… ^ 3%."), '3%', (c) => { const u = ud(c, 'ring'); if (u) u.level(0.35, sk(c) ? 0 : 0.9); }),
    // the others come in through the ring's gap while he gets up
    GATHER,
    up([['chase', 'idle']]),
    { do: (c) => {
      const l = act(c, 'luka'); if (l) l.walkAnim = 's37_limp';
      via(c, 'luka', [ARC.luka], { speed: 1.0 });
      via(c, 'luka40', [ARC.luka40], { speed: 1.1 });
      via(c, 'chase40', [[0.3, 0, -13.0], ARC.chase40], { speed: 1.5 });
      via(c, 'chase', [ARC.chase], { speed: 0.8 });
    } },
    withCue(say('chase', 'Four hundred drones at 3% is enough.'), 'enough', (c) => { const u = ud(c, 'ring'); if (u) u.level(1, sk(c) ? 0 : 1.6); }),
    { do: (c) => { const t0 = clock.t; return waitUntil(() => c.flow.skipping || clock.t - t0 > 6 || gathered(c)); } },
    { do: (c) => { const l = act(c, 'luka'); if (l) l.walkAnim = 'walk'; } },
    put('luka', ARC.luka), put('luka40', ARC.luka40), put('chase40', ARC.chase40), put('chase', ARC.chase),
    up([['luka', 'hurt_stand'], ['luka40', 'idle'], ['chase40', 'idle'], ['chase', 'idle']]),
    // 25. [JARVIS-CAM · from behind the Remote's little screen, the framing from Rue's Storage Full] A pop-up lands over
    // their faces, 2040-styled: STORAGE FULL. (YES keeps the memories. NO clears them.)
    JCAM,
    { wait: 0.6 },
    { do: storageFull },
    { expr: [['chase', 'stunned'], ['luka', 'worried'], ['chase40', 'worried']] },
    { wait: 2.8 },
    // 26.
    say('chase', '…Cloud+. ^ We can keep it.'),
    park,
    // 27. (leaning in, reading the small print, because of course he does) — the screen's light on his face
    put('luka40', [0.55, 0, -18.25, toRemote(0.55, -18.25)]), up([['luka40', 's37_peer']]),
    { shot: 'JARVIS', at: [RX, RY, RZ], from: [-0.2, 0.92, -19.4], on: 'luka40', size: 'CLOSE', move: 'push', amount: 0.92, dur: 9, ease: 'linear' },
    { wait: 0.8 },
    say('luka40', "If you keep it, you go home knowing. All of it. You won't do what we did. ^ You won't become us."),
    // (they turn to each other; the past selves stand by the box)
    put('luka40', TALK.luka40), put('chase40', TALK.chase40), put('chase', TALK.chase), put('luka', TALK.luka),
    up([['luka40', 'idle'], ['chase40', 'idle']]),
    { expr: [['chase40', 'neutral'], ['luka40', 'still'], ['chase', 'worried'], ['luka', 'worried']] },
    { wait: 0.05 },   // (one tick: the computed lenses below read where their eyes are now)
    // 28.
    OLDER_C40(),
    say('chase40', "That's good."),
    // 29.
    OLDER_L40(),
    say('luka40', 'It means we stop.'),
    // 30.
    { expr: [['chase40', 'stunned']] },
    OLDER_C40({ dur: 5, push: 0.08 }),
    say('chase40', '…Stop?'),
    // 31.
    OLDER_L40({ dur: 9 }),
    say('luka40', "There's no us at the end of it. We get overwritten. ^ Like a save file."),
    // 32.
    CLOSE('chase', { yaw: -0.3, dist: 1.2, push: 0.08, dur: 5, fov: 36 }),
    say('chase', "That's dark."),
    // 33.
    OLDER_L40({ dur: 4, push: 0.05 }),
    say('luka40', "It's JARVIS."),
    // 34.
    { expr: [['chase40', 'worried']] },
    OLDER_C40({ dur: 5 }),
    say('chase40', 'And if they clear it?'),
    // 35.
    { expr: [['luka40', 'sad']] },
    OLDER_L40({ dur: 18, push: 0.3 }),
    slow('luka40', 'They go home, and they live it. All of it. ^ The fire. The six years. The bench. Every bit.'),
    slow('luka40', "And one day it's the twenty-second of December, and you build a machine out of display chips, and you go to the gap."),
    // 36. [CLOSE · Chase (2040)] It lands.
    { expr: [['chase40', 'stunned']] },
    SUN_C40(),
    { wait: 1.8 },
    { expr: [['chase40', 'sad']] },
    // 37.
    slow('chase40', "…That's why I didn't remember. ^ I've stood here. ^ Last time. And I said clear."),
    { wait: 0.8 },
    slow('chase40', 'This was never the bit that went wrong. ^ This was the bit that fixed it.', { expr: 'still' }),
    { wait: 1.0 },
    // (they all look back at the pop-up, still waiting on the Remote)
    put('luka', ARC.luka), put('luka40', ARC.luka40), put('chase40', ARC.chase40), put('chase', ARC.chase),
    up([['luka', 'hurt_stand'], ['luka40', 'idle'], ['chase40', 'idle'], ['chase', 'idle']]),
    { expr: [['chase', 'worried'], ['luka', 'worried'], ['luka40', 'still'], ['chase40', 'still']] },
    { wait: 0.05 },
    JCAM,
    { wait: 0.1 },
    unpark,
    { wait: 2.0 },
    dropPop,
  ];

  // ------------------------------------------------------------ Cutscene — "3.7_fears."
  // The four of them on the roof. The two past selves face each other across the Remote. Each one's fear is choosing for
  // him, and they both hear it.
  CUTSCENES['3.7_fears'] = [
    { popup: null, clear: true },
    put('chase', 's37_f_chase'), put('luka', 's37_f_luka'),
    put('luka40', [2.4, 0, -13.2, 0.9]), put('chase40', [3.1, 0, -13.4, 0.9]),
    up([['chase', 'idle'], ['luka', 'hurt_stand'], ['luka40', 'idle'], ['chase40', 'idle']]),
    { expr: [['chase', 'worried'], ['luka', 'determined'], ['luka40', 'still'], ['chase40', 'still']] },
    lamp('ring'), screen('call'),
    lensPush('s37_fears_wide', 0.86, 8),
    { move: 'luka40', to: 's37_f_l40', nowait: true },
    { move: 'chase40', to: 's37_f_c40' },
    { face: 'luka40', to: PI }, { face: 'chase40', to: PI },
    { act: [['luka40', 's37_back'], ['chase40', 's37_back']] },
    { wait: 0.8 },
    // 38. (he glances at Chase (2040))
    OTS_ON_CHASE,
    withCue(say('chase', "If we keep it, I don't lose fourteen years. I don't become— ^ sorry."), 'become—', (c) => { glanceAt(c, 'chase', 'chase40', 1.6); }),
    // 39.
    CLOSE('chase40', { yaw: 0.2, dist: 1.25, push: 0.12, dur: 5, fov: 34 }),
    say('chase40', 'No. Say it.'),
    // 40.
    OTS_ON_CHASE,
    slow('chase', "I don't become you."),
    // 41.
    OTS_ON_LUKA,
    say('luka', 'If we keep it, they stop.'),
    // 42.
    OTS_ON_CHASE,
    say('chase', "They don't DIE, they just—", { auto: 0.2 }),
    // 43.
    CLOSE('luka', { yaw: 0.5, dist: 1.15, push: 0.16, dur: 9, fov: 34 }),
    say('luka', "They stop. ^ Because of us. ^ I'm not doing that to them."),
    // 44.
    OTS_ON_CHASE,
    say('chase', 'So we go home and you walk into a fire, and he loses six years?', { expr: 'determined' }),
    // 45. (He nods at the two older men, side by side at the parapet.)
    OTS_ON_LUKA,
    withCue(say('luka', '…And then they get this.'), 'they get', (c) => { glanceAt(c, 'luka', [4.2, -11.95], 2.6); }),
    OLDER,
    { wait: 2.6 },
    // 46. (They look at each other. They both hear it.)
    { expr: [['chase', 'sad'], ['luka', 'sad']] },
    ACROSS,
    { wait: 2.4 },
    // 47.
    OTS_ON_CHASE,
    say('chase', "That's your fear talking."),
    // 48.
    OTS_ON_LUKA,
    say('luka', "And that's yours."),
    // 49.
    PARAPET_TWO,
    say('chase40', "Don't pick for us."),
    // 50.
    say('luka40', "I've done enough picking for people."),
    // 51.
    CLOSE('chase40', { yaw: -0.15, dist: 1.25, push: 0.12, dur: 7, fov: 34 }),
    slow('chase40', "It's your call. ^ It was always your call."),
    // 52.
    CLOSE('luka40', { yaw: 0.15, dist: 1.25, push: 0.22, dur: 12, fov: 34 }),
    slow('luka40', "There's no version where nobody gets hurt. ^ I looked. ^ For six years, I looked."),
    { wait: 0.6 },
    // 53. [TWO-SHOT · tight, their hands side by side on the Remote, the framing from Rue's 3.4] Luka's grazed hand and
    // Chase's hand. The chord comes in under it and holds; nobody speaks again. (They step in and reach; the tight
    // two-shot of the hands is the Choice's own frame, painted over the INSERT.)
    { music: 'sustain', fade: 3 },
    { expr: [['chase', 'still'], ['luka', 'still']] },
    ACROSS,
    { move: 'chase', to: [-0.62, 0, -18.92, H], speed: 0.9, nowait: true },
    { move: 'luka', to: [0.46, 0, -18.98, -H], speed: 0.9 },
    { face: 'chase', to: H }, { face: 'luka', to: -H },
    up([['chase', 's37_rest', { sd: 1, x: 0.14, z: 0.42 }], ['luka', 's37_rest', { sd: -1, x: 0.18, z: 0.46 }]]),
    { wait: 2.4 },
    // (under the cut they stand clear of the INSERT's frame: the mini-game paints the hands)
    put('chase', [-0.88, 0, -18.95, H]), put('luka', [0.88, 0, -18.95, -H]), up([['chase', 'idle'], ['luka', 'hurt_stand']]),
    { do: (c) => { c.cam.shot(HANDS); c.cam.cutscene = false; } },
  ];
})();
