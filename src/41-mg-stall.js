// ============================================================ MINI-GAME: STALL (spec 9.2, scene 1.3)
// A dialogue-choice duel in the corridor: Luke asks, Luka picks one of three answers (all bad, some worse; the "best"
// one lowers suspicion). Luke's SUSPICION (0–100) is his left eyebrow: a panel, top right, shows his face (the live
// face texture of actor 'luke', so the 3D brow and the panel brow are the same brow) with a small bar under it, and
// a.rig.face.browLift() raises it as the meter fills. At 100 Luke pushes past to the backroom door, opens it, sees the
// trench coat: "…Who's that?" / "Chase's uncle." — the meter drops to 50 and the round starts again (api.fail(): two
// of those offer "Skip this?"). You can't fail for good. Five rounds (script in spec 1.3), played in two halves around
// the forced SWAP to Chase's wiring: rounds 1–3, then the alarms distract Luke and control goes back to the scene;
// then rounds 4–5. While the player is away on the other side Luke's suspicion rises on its own (params.drift).
//
// Call:  ['minigame', 'stall', { rounds: [1, 2, 3] }]   ...the SWAP to Chase, the wiring...
//        ['minigame', 'stall', { rounds: [4, 5], drift: true }]
//   rounds     which rounds this call plays (default [1, 2, 3]); [1, 2, 3, 4, 5] plays the lot in one go
//   suspicion  the starting level (default 30 for a call that starts at round 1, else where the last call left it)
//   drift      seconds the player spent away (suspicion +0.6/s, at most +30, never past 92), or true = measure it:
//              the time since the previous call finished. Shown as the meter climbing at the start of the call.
//   shot       the base camera (default: OTS over Luke's shoulder onto Luka, the backroom door behind him);
//   cams       false = no per-line cuts (otherwise each line cuts to an OTS on whoever is speaking, CLOSE for beats;
//              the door and trench-coat beats always cut)
//   testDoor   autoplay only: pick the worst answers until the first door event (to exercise it)
// Expects actors 'luka' and 'luke' facing each other in the corridor (reddy26 marks s13_stall_luka / s13_stall_luke);
// 'chase40' in the backroom (the trench coat at the door window and behind the door), 'jordan' anywhere (off).
// Uses marks s13_luke_door, s13_c40_pass_a / _b and prop backroom_door (userData.open) when the set has them.
// Result: { half: 1 | 2, done, suspicion, doors, round }  (round = the next round to play; done after round 5 ends)
//   (+ skipped / auto). Events: emit('stall:door', doors). MINIGAMES.stall.level() = suspicion now, drift included
//   (for a scene that wants ui.meter('SUSPICION', level / 100) while the player is on Chase's side).
MINIGAMES.stall = (() => {
  const PI = Math.PI, TAU = PI * 2;
  const DELTA = { '+': 18, '++': 32, '-': -12, '--': -25, '': 0 };
  const DELTA_STORY = { '+': 11, '++': 20, '-': -15, '--': -30, '': 0 };
  const DRIFT = 0.6, DRIFT_MAX = 30, DRIFT_TOP = 92, CREEP = 1.6, CREEP_AFTER = 6, CREEP_TOP = 95;
  // spec 1.3, word for word. a = Luka's answer, d = the suspicion it earns, r = the replies [speaker, line, tag]
  const R = {
    1: { q: 'What was that bang?', best: 1, opts: [
      { a: 'Christmas.', d: '+', r: [['luke', "Christmas doesn't bang."]] },
      { a: 'The display.', d: '-', r: [['luke', 'The DISPLAY banged?'], ['luka', 'Bit.']] },
      { a: 'What bang?', d: '++', r: [['luke', 'The one that blew the doors open.'], ['luka', '…Christmas.']] },
    ] },
    2: { q: 'Why is there smoke?', best: 0, opts: [
      { a: "New displays smoke. When they're new.", d: '-', r: [['luke', '…Do they?'], ['luka', 'Brand new.']] },
      { a: 'What smoke?', d: '++', r: [['luke', 'THAT smoke.']] },
      { a: 'Jordan did it.', d: '+', r: [['jordan', 'I was up a LADDER.', 'off']] },
    ] },
    3: { q: "Where's Chase?", best: 0, opts: [
      { a: 'Toilet.', d: '-', r: [['luke', 'During an explosion?'], ['luka', 'Especially during an explosion.']] },
      { a: 'Lunch.', d: '+', r: [['luke', "It's twelve."], ['luka', 'Early lunch.']] },
      { a: 'What Chase?', d: '++', r: [['luke', 'Luka.']] },
    ] },
    4: { q: 'Is there a man in a trench coat in the backroom?', best: 0, opts: [
      { a: "That's Chase's uncle.", d: '-', r: [['chase40', 'Hi.', 'off'], ['luke', 'He looks exactly like Chase.'], ['luka', 'Genes.']] },
      { a: 'No.', d: '++', beat: 'coat' },          // (the trench coat walks past the door window)
      { a: 'Which man?', d: '+', beat: 'look' },
    ] },
    5: { q: 'If I open that door, am I going to have to fill out a form?', rub: true, best: 0, opts: [   // (rubbing his eyes)
      { a: 'Yes.', d: '--', r: [['luke', "…I'll open it after lunch."]], end: true },
      { a: 'No.', d: '+', r: [['luke', "You're lying."]], again: true },
      { a: 'Several.', d: '', r: [['luke', "…I'll open it after lunch."]], end: true },
    ] },
  };
  const LABELS = {};
  for (const n in R) LABELS[n] = R[n].opts.map((o) => o.a);
  const DOOR_LINES = [['luke', "…Who's that?"], ['luka', "Chase's uncle."]];   // at 100 (spec 9.2 / 1.3)
  const DOOR_DEF = [6.4, 0, -23.25, PI], PASS_A = [5.2, 0, -24.65, PI / 2], PASS_B = [7.9, 0, -24.65, PI / 2];
  const OTS_LUKE = { shot: 'OTS', on: 'luke', over: 'luka' };        // Luke asks: over Luka's shoulder
  const OTS_LUKA = { shot: 'OTS', on: 'luka', over: 'luke' };        // Luka answers: over Luke's shoulder, the door behind him
  const CLOSE_LUKE = { shot: 'CLOSE', on: 'luke' };
  const O_Q = { auto: 0.35 }, O_OFF = { tag: 'off' }, O_NONE = {}, O_CH = { test: 0 }, SO = { vol: 1, rate: 1 };
  const FONT = '"Trebuchet MS", "Segoe UI", system-ui, sans-serif';
  const COL_LOW = '#5ad17a', COL_MID = '#ffb02e', COL_HIGH = '#ff4e3d', NAVY = 'rgba(20,29,58,0.9)';

  let lastSus = 30, lastEnd = -1;                        // between the two halves
  let api = null, ov = null, ctx = null, P = null, done = true, run = 0, AUTO = false, cams = true, base = null;
  let rounds = null, roundNow = 1, half = 1, sus = 30, shown = 30, flashT = 0, dropT = 0, tickAcc = 0, doors = 0;
  let choosing = false, hes = 0, talking = false, t = 0, driftAdd = 0, driftT = 0, driftMsg = '', turned = false;
  let luke = null, luka = null, faceC = null, fallC = null, liftQ = -1, band = -1, twitchT = 1.2, twitch = 0;
  let homeLuke = null, homeLuka = null, txtEl = null, armQ = 0, armT = 0, armN = 1, chP = null;
  let W = 0, H = 0, sch = '', PS = 120, PW = 144, PH = 220, px = 0, py = 14, pip = 10, fName = '', fLbl = '', fSmall = '';

  const live = (k) => k === run && !done;
  const story = () => options.storyMode === true;
  const delta = (d) => (story() ? DELTA_STORY : DELTA)[d] || 0;
  const rr = (c, x, y, w, h, r) => { c.beginPath(); c.roundRect(x, y, w, h, r); };

  function addSus(d, top = 100) {
    const o = sus;
    if (d > 0) sus = Math.min(Math.max(top, o), o + d); else sus = Math.max(0, o + d);
    if (sus > o) { flashT = 0.6; if (sus >= 100) { SO.vol = 0.55; SO.rate = 1; api.sfx('sting', SO); } }
    else if (sus < o) { dropT = 0.7; SO.vol = 0.3; SO.rate = 0.9; api.sfx('pop', SO); }
  }
  function settle(k, min = 0.35) {
    const t0 = clock.t;
    return waitUntil(() => !live(k) || (Math.abs(shown - sus) < 0.5 && clock.t - t0 > min) || clock.t - t0 > 3);
  }
  async function line(k, id, text, tag) {
    if (!live(k)) return false;
    if (cams) { if (id === 'luke' && luke) api.cam.shot(OTS_LUKE); else if (id === 'luka' && luka) api.cam.shot(OTS_LUKA); }
    talking = true;
    await api.say(id, text, tag === 'off' ? O_OFF : O_NONE);
    talking = false;
    return live(k);
  }
  // steps that stop the moment the game is over (skipped, aborted)
  const guard = (k, steps) => steps.map((s) => ({ if: () => live(k), then: [s], else: [] }));
  const at = (name, def) => api.world.mark(name) || def;
  function pickFor(RD) {                                  // autoplay's answer: the best one (or the worst, to test the door)
    if (!(AUTO && P.testDoor && doors === 0)) return RD.best;
    let w = 0;
    for (let i = 1; i < RD.opts.length; i++) if (delta(RD.opts[i].d) > delta(RD.opts[w].d)) w = i;
    return w;
  }

  // ---------------------------------------------------------- beats
  async function door(k) {                               // suspicion full: Luke goes to look
    doors++;
    api.fail();
    emit('stall:door', doors);
    const w = api.world, c40 = w.actor('chase40'), bd = w.prop('backroom_door');
    const steps = [];
    if (luke && luka && homeLuke && homeLuka) {
      const dm = at('s13_luke_door', DOOR_DEF), hx = homeLuka[0], hz = homeLuka[2];
      const dx = dm[0] - hx, dz = dm[2] - hz, dl = Math.hypot(dx, dz) || 1, ux = dx / dl, uz = dz / dl;
      const aside = [hx + uz * 0.6, 0, hz - ux * 0.6], behind = [dm[0] - ux * 1.3 + uz * 0.4, 0, dm[2] - uz * 1.3 - ux * 0.4];
      steps.push(
        { expr: [['luke', 'determined'], ['luka', 'scared']] },
        { shot: 'MID', on: ['luke', 'luka'] },
        { move: 'luka', to: aside, speed: 2.2, face: false, nowait: true },
        { wait: 0.3 },
        { shot: 'TRACK', on: 'luke', track: 'behind' },
        { par: [{ move: 'luke', to: dm, speed: 2.3 }, { do: (c) => c.runSteps([{ wait: 0.7 }, { move: 'luka', to: behind, run: true }]) }] },
      );
      if (bd) steps.push({ prop: 'backroom_door', fn: (o) => { o.userData.open = true; } }, { sfx: 'creak', vol: 0.5 });
      if (c40) steps.push({ face: 'chase40', to: 'luke' }, { shot: 'OTS', on: 'chase40', over: 'luke' }, { wait: 0.5 }, { act: [['chase40', 'nod']] });
      else steps.push({ shot: 'CLOSE', on: 'luke' }, { wait: 0.4 });
      steps.push(
        { say: DOOR_LINES[0][0], text: DOOR_LINES[0][1], expr: 'suspicious' },
        { shot: 'CLOSE', on: 'luka' },
        { say: DOOR_LINES[1][0], text: DOOR_LINES[1][1], expr: 'sheepish' },
        { wait: 0.3 },
      );
      if (bd) steps.push({ prop: 'backroom_door', fn: (o) => { o.userData.open = false; } });
      steps.push(
        { do: () => { if (live(k)) { sus = 50; dropT = 0.9; } } },
        { shot: 'TRACK', on: 'luke', track: 'ahead' },
        { par: [{ move: 'luke', to: homeLuke }, { move: 'luka', to: homeLuka, speed: 2.0 }] },
        { face: 'luke', to: 'luka' }, { face: 'luka', to: 'luke' },
        { expr: [['luka', 'neutral']] },
        base || OTS_LUKA,
      );
    } else {
      steps.push({ say: DOOR_LINES[0][0], text: DOOR_LINES[0][1] }, { say: DOOR_LINES[1][0], text: DOOR_LINES[1][1] }, { do: () => { if (live(k)) { sus = 50; dropT = 0.9; } } });
    }
    talking = true;
    await api.play(guard(k, steps));
    talking = false;
    if (!live(k)) return;
    sus = 50; dropT = Math.max(dropT, 0.5);
    SO.vol = 0.3; SO.rate = 0.8; api.sfx('pop', SO);
    if (base) api.cam.shot(base);
    await settle(k, 0.6);
  }
  async function coatPass(k) {                           // round 4, "No.": the trench coat walks past the door window
    const c40 = api.world.actor('chase40');
    if (!c40 || !homeLuke) { await wait(0.8); return; }
    const dm = at('s13_luke_door', DOOR_DEF), pa = at('s13_c40_pass_a', PASS_A), pb = at('s13_c40_pass_b', PASS_B);
    const back = [c40.pos.x, c40.pos.y, c40.pos.z, c40.rotY];
    const dx = dm[0] - homeLuke[0], dz = dm[2] - homeLuke[2], dl = Math.hypot(dx, dz) || 1, ux = dx / dl, uz = dz / dl;
    const lens = { shot: 'CAM', pos: [homeLuke[0] - ux * 0.35 - uz * 0.5, 1.74, homeLuke[2] - uz * 0.35 + ux * 0.5], look: [dm[0] + ux * 0.65, 1.5, dm[2] + uz * 0.65], fov: 22 };
    talking = true;
    await api.play(guard(k, [
      { place: 'chase40', at: pa },
      lens,
      { wait: 0.35 },
      { move: 'chase40', to: pb, speed: 1.4 },
      { wait: 0.5 },
      { place: 'chase40', at: back },
      CLOSE_LUKE,
      { expr: [['luke', 'suspicious']] },
      { wait: 0.7 },
    ]));
    talking = false;
  }
  async function alarms(k) {                             // end of the first half: the display alarms whoop, Luke looks round
    SO.vol = 0.7; SO.rate = 1; api.sfx('alarm', SO);
    if (luke && luka) {
      if (base) api.cam.shot(base);
      luke.setExpr('worried');
      luke.face(Math.atan2(luke.pos.x - luka.pos.x, luke.pos.z - luka.pos.z), 0.45);
      turned = true;
    }
    await wait(1.5);
  }

  function result(extra) {
    const r = { half, done: rounds.indexOf(5) >= 0, suspicion: Math.round(sus), doors, round: rounds[rounds.length - 1] + 1 };
    if (extra) Object.assign(r, extra);
    return r;
  }
  function fin(extra) { if (done) return; api.finish(result(extra)); }

  async function main(k) {
    await wait(0.25);
    if (!live(k)) return;
    if (base) api.cam.shot(base);
    if (turned && luke) { luke.face('luka', 0.4); turned = false; await wait(0.45); if (!live(k)) return; }
    if (driftAdd > 0) {                                  // he's been stewing while you were with Chase
      driftT = 3.4; addSus(driftAdd, DRIFT_TOP);
      await settle(k, 0.8); if (!live(k)) return;
    }
    let i = 0;
    while (i < rounds.length) {
      const n = rounds[i], RD = R[n];
      roundNow = n;
      if (luka) luka.setExpr('neutral');
      if (RD.rub && luke) {                              // (rubbing his eyes)
        if (cams) api.cam.shot(CLOSE_LUKE);
        luke.setExpr('tired'); luke.play('head_hands', { dur: 1.6, loop: false });
        await wait(1.1); if (!live(k)) return;
      }
      if (cams && luke) api.cam.shot(OTS_LUKE);
      // the answers open under the question the tick it's fully typed (update() watches the dialogue text), so the
      // question stays on screen while you choose even when a slow frame runs several ticks at once
      talking = true; O_CH.test = pickFor(RD); armN = n; armQ = RD.q.length; armT = 0; chP = null;
      await api.say('luke', RD.q, O_Q);
      armQ = 0;
      if (!live(k)) return;
      if (!chP) { chP = api.choose(LABELS[n], O_CH); choosing = true; hes = 0; }
      const pick = await chP;
      chP = null; choosing = false; talking = false;
      if (!live(k)) return;
      const o = RD.opts[pick] || RD.opts[RD.best];
      if (luka) luka.setExpr(o.d[0] === '-' ? 'smug' : o.d ? 'sheepish' : 'neutral');
      if (!await line(k, 'luka', o.a)) return;
      if (o.beat === 'coat') { await coatPass(k); if (!live(k)) return; }
      if (o.beat === 'look') { if (cams && luke) api.cam.shot(CLOSE_LUKE); if (luke) luke.setExpr('suspicious'); await wait(1.2); if (!live(k)) return; }
      if (o.r) for (let j = 0; j < o.r.length; j++) if (!await line(k, o.r[j][0], o.r[j][1], o.r[j][2])) return;
      addSus(delta(o.d));                                // the verdict: his eyebrow goes up (or, now and then, down)
      await settle(k); if (!live(k)) return;
      if (sus >= 100) { await door(k); if (!live(k)) return; continue; }   // the same round again, at half
      if (o.end) return fin();
      if (o.again) continue;
      i++;
    }
    if (rounds.indexOf(5) < 0) { await alarms(k); if (!live(k)) return; }   // control goes back to the scene: SWAP
    fin();
  }

  // ---------------------------------------------------------- the panel (overlay): Luke's face, the eyebrow, the bar
  function layout() {
    W = innerWidth; H = innerHeight; sch = api.input.scheme;
    const narrow = W < 600 || H < 430, touch = sch === 'touch';
    PS = narrow ? 86 : 116; PW = PS + 24; pip = narrow ? 8 : 10; PH = 34 + PS + 12 + 16 + 12 + 12;
    px = W - PW - (touch ? 70 : 16); py = narrow ? 10 : 16;
    fName = 'bold ' + (narrow ? 13 : 15) + 'px ' + FONT; fLbl = 'bold ' + (narrow ? 10 : 11) + 'px ' + FONT; fSmall = (narrow ? 11 : 12.5) + 'px ' + FONT;
  }
  function brow() {                                      // quantised: the face texture redraws only on a new level
    if (!luke) return;
    let q = Math.round(shown / 5);
    if (twitch > 0) q += 2;
    if (q !== liftQ) { liftQ = q; luke.rig.face.browLift(Math.min(1, q / 20)); }
    const b = shown >= 55 ? 1 : 0;
    if (b !== band) { band = b; if (luke.expr !== 'tired' || b) luke.setExpr(b ? 'suspicious' : 'neutral'); }
  }

  return {
    level() {                                            // for the scene, between halves: the suspicion with drift so far
      if (lastEnd < 0 || typeof clock === 'undefined') return lastSus;
      const k = story() ? 0.5 : 1;
      return lastSus >= DRIFT_TOP ? lastSus : Math.min(DRIFT_TOP, lastSus + Math.min(DRIFT_MAX * k, (clock.t - lastEnd) * DRIFT * k));
    },
    reset() { lastSus = 30; lastEnd = -1; turned = false; },
    start(params, a) {
      api = a; ov = a.overlay; ctx = ov.ctx; P = params || {};
      run++; done = false; AUTO = false; t = 0; W = H = 0; sch = '';
      rounds = (Array.isArray(P.rounds) && P.rounds.length ? P.rounds : [1, 2, 3]).filter((n) => R[n]);
      if (!rounds.length) rounds = [1, 2, 3];
      half = rounds.indexOf(5) >= 0 ? 2 : 1; roundNow = rounds[0]; doors = 0;
      if (rounds[0] === 1 && P.suspicion == null) { lastSus = 30; lastEnd = -1; turned = false; }   // a fresh stall
      sus = P.suspicion != null ? Math.max(0, Math.min(100, +P.suspicion || 0)) : rounds[0] === 1 ? 30 : lastSus;
      if (sus >= 100) sus = 50;
      const secs = P.drift === true ? (lastEnd >= 0 ? clock.t - lastEnd : 0) : +P.drift || 0, kd = story() ? 0.5 : 1;
      driftAdd = Math.round(Math.max(0, Math.min(DRIFT_MAX * kd, secs * DRIFT * kd, DRIFT_TOP - sus)));
      driftMsg = '+' + driftAdd + ' while you were away'; driftT = 0;
      shown = sus; flashT = dropT = tickAcc = 0; choosing = false; hes = 0; talking = false;
      const w = a.world;
      luke = w.actor('luke') || null; luka = w.actor('luka') || null;
      faceC = luke && luke.rig && luke.rig.face ? luke.rig.face.canvas : null;
      fallC = null;
      if (!faceC) try { fallC = portraitURL.canvas('luke'); } catch (e) { fallC = null; }
      homeLuke = luke ? [luke.pos.x, luke.pos.y, luke.pos.z, luke.rotY] : null;
      homeLuka = luka ? [luka.pos.x, luka.pos.y, luka.pos.z, luka.rotY] : null;
      cams = P.cams !== false && !!(luke && luka);
      base = P.shot || (cams ? OTS_LUKA : null);
      liftQ = -1; band = -1; twitch = 0; twitchT = 1.2; armQ = 0; chP = null;
      txtEl = document.querySelector('#dlg .txt');
      if (luke) brow();
      ov.show(true);
      main(run);
    },
    update(dt) {
      if (done || !api) return;
      if (W !== innerWidth || H !== innerHeight || api.input.scheme !== sch) layout();
      t += dt;
      if (armQ > 0 && !chP && txtEl) {                  // (a quarter-second beat first, so a YES mashed through the typing can't pick)
        const tn = txtEl.firstChild;
        if (tn && tn.nodeType === 3 && tn.length >= armQ && (armT += dt) >= 0.25) { armQ = 0; chP = api.choose(LABELS[armN], O_CH); choosing = true; hes = 0; }
      }
      // Luke's patience while you dither over an answer (never in Story Mode, never past 95 on its own)
      if (choosing && !AUTO && !story()) { hes += dt; if (hes > CREEP_AFTER && sus < CREEP_TOP) sus = Math.min(CREEP_TOP, sus + CREEP * dt); }
      if (shown < sus) {
        const st = Math.min(sus - shown, 42 * dt); shown += st; tickAcc += st;
        if (tickAcc >= 4) { tickAcc = 0; SO.vol = 0.22; SO.rate = 0.75 + shown / 90; api.sfx('tick', SO); }
      } else if (shown > sus) shown = Math.max(sus, shown - 55 * dt);
      if (flashT > 0) flashT -= dt;
      if (dropT > 0) dropT -= dt;
      if (driftT > 0) driftT -= dt;
      if (twitch > 0) twitch -= dt;
      if (shown >= 75 && (twitchT -= dt) <= 0) { twitchT = 0.9 + ((t * 7.3) % 0.8); twitch = 0.12; }
      brow();
    },
    draw() {
      if (done || !ctx || !W) return;
      const s = ov.canvas.width / W;
      ctx.setTransform(s, 0, 0, s, 0, 0); ctx.clearRect(0, 0, W, H);
      const sh = flashT > 0 ? Math.sin(t * 70) * 2.4 * Math.min(1, flashT * 2) : 0;
      const x = px + sh, y = py, v = shown / 100;
      ctx.shadowColor = 'rgba(0,0,0,0.35)'; ctx.shadowBlur = 0; ctx.shadowOffsetY = 4;
      ctx.fillStyle = NAVY; rr(ctx, x, y, PW, PH, 14); ctx.fill();
      ctx.shadowOffsetY = 0; ctx.shadowColor = 'transparent';
      ctx.fillStyle = '#ffd21f'; rr(ctx, x + 8, y, PW - 16, 3, 1.5); ctx.fill();
      // header: LUKE + the five rounds
      ctx.textBaseline = 'middle'; ctx.textAlign = 'left'; ctx.font = fName; ctx.fillStyle = '#ffd21f';
      ctx.fillText('LUKE', x + 12, y + 19);
      for (let r = 1; r <= 5; r++) {
        const cx = x + PW - 12 - (5 - r) * pip - 3, cy = y + 19;
        ctx.beginPath(); ctx.arc(cx, cy, pip * 0.32, 0, TAU);
        if (r < roundNow) { ctx.fillStyle = '#c4cbe0'; ctx.fill(); }
        else if (r === roundNow) { ctx.fillStyle = '#ffd21f'; ctx.fill(); }
        else { ctx.lineWidth = 1.2; ctx.strokeStyle = 'rgba(196,203,224,0.5)'; ctx.stroke(); }
      }
      // the face: his left eyebrow is the meter
      const fx = x + 12, fy = y + 32;
      ctx.save(); rr(ctx, fx, fy, PS, PS, 10); ctx.clip();
      ctx.fillStyle = '#26325e'; ctx.fillRect(fx, fy, PS, PS);
      if (faceC) { const fw = faceC.width, fh = faceC.height; ctx.drawImage(faceC, fw * 0.11, fh * 0.12, fw * 0.78, fh * 0.78, fx, fy, PS, PS); }
      else if (fallC) ctx.drawImage(fallC, fx, fy, PS, PS);
      if (v > 0.6) { ctx.globalAlpha = (v - 0.6) * 0.5 * (0.75 + 0.25 * Math.sin(t * 6)); ctx.fillStyle = COL_HIGH; ctx.fillRect(fx, fy, PS, PS); ctx.globalAlpha = 1; }
      ctx.restore();
      ctx.lineWidth = 2; ctx.strokeStyle = 'rgba(255,255,255,0.18)'; rr(ctx, fx, fy, PS, PS, 10); ctx.stroke();
      // SUSPICION and the bar under the portrait
      const ly = fy + PS + 13, by = ly + 10, bw = PS, bh = 9;
      ctx.font = fLbl; ctx.fillStyle = '#97a2c2'; ctx.fillText('SUSPICION', fx, ly);
      ctx.fillStyle = 'rgba(255,255,255,0.12)'; rr(ctx, fx, by, bw, bh, bh / 2); ctx.fill();
      ctx.fillStyle = v >= 0.75 ? COL_HIGH : v >= 0.4 ? COL_MID : COL_LOW;
      if (v > 0.005) { rr(ctx, fx, by, Math.max(bh, bw * v), bh, bh / 2); ctx.fill(); }
      ctx.fillStyle = 'rgba(20,29,58,0.55)';
      for (let i = 1; i < 10; i++) ctx.fillRect(fx + bw * i / 10 - 0.5, by + 2, 1, bh - 4);
      if (flashT > 0) { ctx.globalAlpha = Math.min(1, flashT * 1.6); ctx.fillStyle = '#ffffff'; rr(ctx, fx + Math.max(0, bw * v - 10), by - 1, 10, bh + 2, 4); ctx.fill(); ctx.globalAlpha = 1; }
      if (dropT > 0) { ctx.globalAlpha = Math.min(1, dropT * 1.4) * 0.8; ctx.strokeStyle = COL_LOW; ctx.lineWidth = 2; rr(ctx, fx - 2, by - 2, bw + 4, bh + 4, (bh + 4) / 2); ctx.stroke(); ctx.globalAlpha = 1; }
      if (driftT > 0 && driftAdd > 0) {
        ctx.globalAlpha = Math.min(1, driftT); ctx.font = fSmall; ctx.textAlign = 'right'; ctx.fillStyle = '#ffb02e';
        ctx.shadowColor = 'rgba(0,0,0,0.8)'; ctx.shadowBlur = 3;
        ctx.fillText(driftMsg, x + PW, y + PH + 13);
        ctx.shadowBlur = 0; ctx.shadowColor = 'transparent'; ctx.globalAlpha = 1;
      }
    },
    end(r) {
      done = true; run++;
      if (talking && typeof say !== 'undefined' && say.reset) say.reset();   // skipped mid-line: close the box
      choosing = false; talking = false;
      lastSus = r && r.skipped ? 50 : Math.min(99, Math.round(sus)); lastEnd = typeof clock !== 'undefined' ? clock.t : -1;
      const over = !r || r.aborted || r.error || (r.done || (r.skipped && half === 2));
      if (luke) {
        if (over) { luke.rig.face.browLift(0); luke.setExpr('neutral'); turned = false; }
        else if (r && r.skipped) { luke.setExpr('worried'); turned = false; }
      }
      if (luka) luka.setExpr('neutral');
      if (r && r.skipped && homeLuke && luke && luka) { luke.place(homeLuke); luka.place(homeLuka); }
      luke = luka = null; faceC = fallC = null;
      if (ctx) { ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, ov.canvas.width, ov.canvas.height); ctx.globalAlpha = 1; }
      if (ov) ov.show(false);
    },
    skipResult: () => (rounds ? { half, done: rounds.indexOf(5) >= 0, suspicion: 50, doors, round: rounds[rounds.length - 1] + 1 } : { half: 1, done: false }),
    // ?autoplay=1: the game plays itself (say/choose auto-advance; choose picks the best answer); &fast=1: the end state
    autoplay(a) {
      if (done || api !== a) return;
      if (TEST.fast) {
        sus = Math.min(Math.max(sus, DRIFT_TOP), sus + driftAdd);
        for (let i = 0; i < rounds.length; i++) { const RD = R[rounds[i]]; sus = Math.max(0, Math.min(100, sus + delta(RD.opts[RD.best].d))); }
        fin({ auto: true });
        return;
      }
      AUTO = true;
    },
  };
})();
