// ============================================================ MINI-GAMES: Role Play + Reason Cards (spec 9.7, scene 2.5) — Teddy's booth
// Rue's Role Play (ref/rue/21, docs/engine/08-minigames-b.md §7, §10.6) simplified for the checkpoint, then Chase's half:
// the JARVIS-era reason-card panel on the side of the booth, painted as an INSERT card on the overlay (Rue's card-table
// look, ref/rue/16). No allocation in update()/draw(): canvases, gradients and strings are made in start() / layout();
// the scripted beats (lines, card moves) allocate only when they happen.
//
// ------------------------------------------------------------ MINIGAMES.roleplay  (Luka at Teddy's hatch)
// Luka (as Santa) picks a topic: "The gate" · "The computer" · "Your name" · "How long have you been here?". Teddy only
// opens up after "Your name": every other topic gets a short closed reply (written for the game: the spec has no lines
// for them), then Teddy turns back to the queue, presses his big NO, and greets Luka again as if he'd never seen him
// ("Afternoon, Santa." — so the scripted exchange always runs straight on from it). Topics already asked are greyed (a
// clunk). "Your name" plays spec 2.5 PLAY 2 word for word, in order (the "Name learned: Teddy" toast lands on "…Teddy.").
// Can't fail.
// Call:  ['minigame', 'roleplay', { shot, cams, greet, flag, learn }]
//   shot   the two-shot through the hatch for the choices (default: INSERT on anchor 's25_roleplay', else a TWO on
//          'luka' + 'teddy'); per-line cuts use anchors 's25_teddy_hatch' / 's25_roleplay_rev' / 's25_no_button' when
//          the set has them (else CLOSE / OTS on the actors). cams: false = no cuts, the shot stays.
//   greet  false = the scene has already played TEDDY "Afternoon, Santa." (only the re-greetings play)
//   flag   set when he's told his name (default 's25_name'); learn: false = no { name: 'Teddy' } (state.names + toast)
// Expects actors 'luka' (Santa) at the hatch and 'teddy' in the booth facing him (bridge marks s25_hatch / teddy_seat).
// Drives prop 'no_button' (userData.press()) when the set has it.
// Result: { done: true, name: true, asked: [topic labels in the order picked] }   (skipped: + skipped, state applied)
// Autoplay: one closed topic ("The computer") then "Your name" (&fast=1: "Your name" straight away).
//
// ------------------------------------------------------------ MINIGAMES.reason_cards  (Chase at the booth's panel)
// The grey JARVIS-era backup panel: five plastic cards in slots, WORK · FAMILY · MEDICAL · LEISURE · OTHER (labels printed
// below), a reader slot with an LED, a BACKUP — DO NOT REMOVE sticker. Put a card in the reader (drag it there, tap it,
// or ←/→ + YES) and SafeSense reads it and rejects it ("Family is a risk factor." …, MEDICAL's line written in the same
// pattern); it comes back out greyed. With all five rejected Chase finds the blank card and the marker on Teddy's desk:
// a close-up of the card, and he writes CHRISTMAS (hold YES / A, draw on the card with a finger or the mouse, or type);
// then he puts it in the reader: "…Christmas is a protected holiday. ^ Reason accepted." Can't fail.
// Call:  ['minigame', 'reason_cards', { shot, deskShot, flag }]
//   shot      under the panel (default: INSERT on anchor 's25_panel', else MID on 'chase'); deskShot for the blank card
//             (default: INSERT on 's25_desk_card', else CLOSE on 'chase'); anchor 's25_screen' is cut to on "accepted".
//   flag      set when the reason is accepted (default 's25_reason')
// Drives props when the set has them (bridge.md §4): reason_panel.userData.pull(i) / insert(i | 'xmas') / led('off' |
// 'red' | 'green'), desk_card.userData.show(bool) / written(bool), booth_screen.userData.show('reject' | 'accept'),
// booth_speaker.userData.pulse(). Chase plays 'give' at the reader and 'write_note' at the desk.
// Result: { ok: true, reason: 'CHRISTMAS', tried: ['FAMILY', …] }   (skipped: + skipped, state applied)
// Autoplay: FAMILY, WORK, LEISURE, OTHER, MEDICAL, writes CHRISTMAS, inserts it.
(() => {
  const TAU = Math.PI * 2;
  const FONT = '"Trebuchet MS", "Segoe UI", system-ui, sans-serif';
  const SYS = 'system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif';
  const HAND = '"Marker Felt", "Comic Sans MS", "Chalkboard SE", "Segoe Print", "Bradley Hand", "Trebuchet MS", sans-serif';
  const NAVY = '#141d3a', YEL = '#ffd21f', ICE = '#8fd0ff';
  const SO = { vol: 1, rate: 1 };
  const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
  const ease = (x) => x * x * (3 - 2 * x);
  const ABORT = {};
  function snd(api, n, vol, rate) { SO.vol = vol; SO.rate = rate || 1; api.sfx(n, SO); }
  const anchorShot = (w, name) => (w.anchor(name) ? { shot: 'INSERT', at: name } : null);
  function propCall(w, name, fn, a) {                   // prop.userData[fn](a) when the set has it (bridge.md §4)
    const p = w.prop(name), u = p && p.userData;
    if (u && typeof u[fn] === 'function') { try { u[fn](a); } catch (e) { /* the set's business */ } }
  }
  function rr(c, x, y, w, h, r) { c.beginPath(); c.roundRect(x, y, w, h, r); }

  // ============================================================ roleplay
  MINIGAMES.roleplay = (() => {
    const TOPICS = ['The gate', 'The computer', 'Your name', 'How long have you been here?'];
    const NAME = 2;
    const GREET = 'Afternoon, Santa.';
    // closed replies: Luka asks, Teddy shuts it down (game lines; Teddy: 84, weary, polite, three years unasked)
    const CLOSED = [
      [['luka', "What's the story with the gate?"], ['teddy', 'Goes up. Goes down. ^ Mostly down.']],
      [['luka', "What's the computer want?"], ['teddy', "Wants to know if I'm sure. ^ I'm never sure."]],
      null,
      [['luka', 'How long have you been here?'], ['teddy', 'Since the radio had cricket on it. ^ It\'s all safety tips now.']],
    ];
    // spec 2.5 PLAY 2, word for word and in order (TEDDY's "Afternoon, Santa." is the greeting that always precedes it)
    const OPEN = [
      ['luka', "Afternoon. ^ What's your name?", 'neutral'],
      ['teddy', '…Teddy.', 'stunned'],
      ['luka', 'Luka. ^ Santa. Santa Luka.', 'happy'],
      ['teddy', "Three years in this box and nobody's asked me my name. ^ They just look at the gate.", 'sad'],
      ['luka', 'Can you let us through?', 'neutral'],
      ['teddy', "Computer needs a reason it likes. I've tried them all. It doesn't like any of them.", 'tired'],
    ];
    const O_NONE = {};
    let api = null, P = null, run = 0, done = true, asked = [], talking = false, told = false, cams = true;
    let luka = null, teddy = null, base = null, shotT = null, shotL = null, shotNo = null;

    async function script(k) {
      const live = () => { if (k !== run || done) throw ABORT; };
      const W = async (s) => { live(); await wait(s); live(); };
      const cut = (s) => { if (cams && s) api.cam.shot(s); };
      const S = async (id, text, expr) => {
        live();
        const a = id === 'teddy' ? teddy : id === 'luka' ? luka : null;
        if (a && expr) a.setExpr(expr);
        talking = true;
        await api.say(id, text, O_NONE);
        talking = false;
        live();
      };
      const auto = TEST.auto ? (TEST.fast ? [NAME] : [1, NAME]) : null;
      await W(0.35);
      let first = true;
      for (let n = 0; ; n++) {
        cut(base);
        if (teddy && luka) teddy.face('luka', 0.35);
        if (!first || P.greet !== false) await S('teddy', GREET, 'tired');
        first = false;
        if (!told) { told = true; if (!TEST.auto) ui.toast('Pick something to talk about.'); }
        const dis = [];
        for (let i = 0; i < asked.length; i++) dis.push(asked[i]);
        live();
        const pick = await api.choose(TOPICS, { disabled: dis, test: auto ? auto[Math.min(n, auto.length - 1)] : NAME });
        live();
        if (asked.indexOf(pick) < 0) asked.push(pick);
        if (pick === NAME) break;
        const L = CLOSED[pick];
        for (let i = 0; i < L.length; i++) await S(L[i][0], L[i][1], L[i][0] === 'teddy' ? 'tired' : null);
        // back to the queue: the weary thumb on NO, then a new face at the hatch (as far as he's concerned)
        if (teddy && luka) teddy.face(teddy.rotY + 0.5, 0.4);
        cut(shotNo);
        await W(0.45);
        if (teddy) teddy.play('tap', { dur: 0.6, loop: false });
        propCall(api.world, 'no_button', 'press');
        snd(api, 'clunk', 0.45, 0.8);
        await W(0.3);
        snd(api, 'ss_chirp', 0.18, 0.9);
        await W(0.65);
      }
      // he opens up
      for (let i = 0; i < OPEN.length; i++) {
        const [id, text, expr] = OPEN[i];
        cut(id === 'teddy' ? shotT : shotL);
        await S(id, text, expr);
        if (i === 1) { await api.play(learnSteps()); live(); }
        if (i === 3) await W(0.3);
      }
      cut(base);
      if (teddy) teddy.setExpr('tired');
      if (luka) luka.setExpr('neutral');
      await W(0.4);
    }
    function learnSteps() {
      const st = [];
      if (P.learn !== false) st.push({ name: 'Teddy' });
      st.push({ flag: P.flag || 's25_name' });
      return st;
    }
    function fin(extra) {
      if (done) return;
      const r = { done: true, name: true, asked: asked.map((i) => TOPICS[i]) };
      if (extra) Object.assign(r, extra);
      api.finish(r);
    }

    return {
      start(params, a) {
        api = a; P = params || {}; run++; done = false; asked = []; talking = false;
        const w = a.world;
        luka = w.actor('luka') || null; teddy = w.actor('teddy') || null;
        cams = P.cams !== false;
        base = P.shot || anchorShot(w, 's25_roleplay') || (luka && teddy ? { shot: 'TWO', on: ['luka', 'teddy'] } : null);
        shotT = anchorShot(w, 's25_teddy_hatch') || (teddy ? { shot: 'CLOSE', on: 'teddy' } : base);
        shotL = anchorShot(w, 's25_roleplay_rev') || (luka && teddy ? { shot: 'OTS', on: 'luka', over: 'teddy' } : base);
        shotNo = anchorShot(w, 's25_no_button') || base;
        if (base) a.cam.shot(base);
        if (luka && teddy) { luka.face('teddy', 0.3); }
        const k = run;
        script(k).then(() => { if (k === run) fin(); }, (e) => {
          if (e === ABORT) return;
          console.error('TWO: roleplay', e);
          if (k === run) fin();
        });
      },
      update() {},
      draw() {},
      end(r) {
        const wasTalking = talking;
        done = true; run++;
        if (wasTalking && typeof say !== 'undefined' && say.reset) say.reset();
        talking = false;
        if (r && r.skipped) {                                 // as if he'd told them: his name, the flag
          if (P.learn !== false && state.names.indexOf('Teddy') < 0) state.names.push('Teddy');
          state.flags[P.flag || 's25_name'] = true;
        }
        if (teddy) teddy.setExpr('neutral');
        if (luka) luka.setExpr('neutral');
        luka = teddy = null;
      },
      skipResult: () => ({ done: true, name: true, asked: asked.map((i) => TOPICS[i]) }),
      autoplay() { /* the script plays itself: say/choose auto-advance and choose() takes its `test` topic */ },
    };
  })();

  // ============================================================ reason_cards
  MINIGAMES.reason_cards = (() => {
    const CARDS = [
      { word: 'WORK', col: '#2f6fd6', line: 'Work is a risk factor.' },
      { word: 'FAMILY', col: '#3d9a5c', line: 'Family is a risk factor.' },
      { word: 'MEDICAL', col: '#d4463a', line: 'Medical is a risk factor. ^ Please see a doctor.' },   // (written for the game, same pattern)
      { word: 'LEISURE', col: '#e8892a', line: 'Leisure is a risk factor.' },
      { word: 'OTHER', col: '#7b8494', line: 'Other is a risk factor.' },
    ];
    const XMAS_LINE = '…Christmas is a protected holiday. ^ Reason accepted.';
    const XMAS = 'CHRISTMAS', XN = XMAS.length, X = 5;          // the written card is card 5
    const AUTO_ORDER = [1, 0, 3, 4, 2];
    const CW = 104, CH = 140, SHOW = 118, SHOW_RD = 84;          // card size; how much of it stands out of a slot / the reader
    const O_NONE = {};
    // layout in design units: landscape 800 x 400, portrait 520 x 600 (two rows)
    const LAND = { w: 800, h: 340, slots: [[100, 254], [222, 254], [344, 254], [466, 254], [588, 254]], reader: [714, 254], hold: [400, 330] };
    const PORT = { w: 520, h: 590, slots: [[95, 250], [260, 250], [425, 250], [95, 506], [260, 506]], reader: [425, 506], hold: [260, 572] };
    let api = null, ov = null, ctx = null, P = null, run = 0, done = true, AUTO = false, autoT = 0, autoN = 0;
    let L = LAND, W = 0, H = 0, sch = '', dpr = 1, ps = 1, px = 0, py = 0, pw = 0, ph = 0;
    let panelC = null, lipC = null, faceC = [], deskC = null, vig = null, fHint = '', fTitle = '', fFont = '', hint = '', hintW = 0;
    const cx = new Float32Array(6), cy = new Float32Array(6), mode = new Uint8Array(6);   // card centre; 0 slot, 1 reader, 2 free, 3 hidden
    const rej = new Uint8Array(6);
    let phase = 'panel', busy = false, focus = 0, led = 0, ledT = 0, talking = false, tried = [], panelA = 1, deskA = 0, fadeA = 1;
    let tw = { i: -1, x0: 0, y0: 0, x1: 0, y1: 0, t: 0, d: 1, m: 0, res: null };
    let grab = -1, gox = 0, goy = 0, gx0 = 0, gy0 = 0, gT = 0, gMoved = 0, wk = 0, wkShown = -1, lastPx = -1, lastPy = -1, keyFn = null;
    let chase = null, chaseAnim = null, baseShot = null, deskShot = null;
    let xmasReady = false;
    const LXW = new Float32Array(XN + 1);                      // the handwriting's letter offsets at 100 px (measured once)

    const live = (k) => k === run && !done;
    const homeX = (i) => (i === X ? L.hold[0] : L.slots[i][0]);
    const homeY = (i) => (i === X ? L.hold[1] : L.slots[i][1] - SHOW + CH / 2 + (rej[i] ? 26 : 0));
    const rdX = () => L.reader[0], rdTop = () => L.reader[1] - SHOW + CH / 2 - 50, rdIn = () => L.reader[1] - SHOW_RD + CH / 2;

    // ---------------------------------------------------------- painting (once per layout)
    function icon(c, kind, x, y, s) {                         // a little white pictogram on the card's band
      c.save(); c.translate(x, y); c.scale(s, s); c.fillStyle = '#ffffff'; c.strokeStyle = '#ffffff'; c.lineWidth = 2; c.lineCap = 'round';
      if (kind === 0) { rr(c, -9, -5, 18, 12, 2); c.fill(); c.beginPath(); c.moveTo(-4, -5); c.lineTo(-4, -8); c.lineTo(4, -8); c.lineTo(4, -5); c.stroke(); }
      else if (kind === 1) { c.beginPath(); c.arc(-5, -5, 3.2, 0, TAU); c.arc(5, -4, 2.6, 0, TAU); c.fill(); rr(c, -9.5, -1, 9, 9, 3); c.fill(); rr(c, 1.2, 0, 7.5, 8, 3); c.fill(); }
      else if (kind === 2) { c.fillRect(-3, -9, 6, 18); c.fillRect(-9, -3, 18, 6); }
      else if (kind === 3) { c.beginPath(); c.arc(0, -1, 4.5, 0, TAU); c.fill(); for (let i = 0; i < 8; i++) { const a = i * TAU / 8; c.beginPath(); c.moveTo(Math.cos(a) * 6.5, -1 + Math.sin(a) * 6.5); c.lineTo(Math.cos(a) * 9, -1 + Math.sin(a) * 9); c.stroke(); } }
      else if (kind === 4) { c.font = 'bold 18px ' + SYS; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('?', 0, 0.5); }
      c.restore();
    }
    function paintCard(i) {                                   // one card face at the current scale
      const s = ps * dpr, cv = faceC[i] || (faceC[i] = document.createElement('canvas'));
      const w = Math.ceil(CW * s) + 2, h = Math.ceil(CH * s) + 2;
      if (cv.width !== w || cv.height !== h) { cv.width = w; cv.height = h; }
      const c = cv.getContext('2d');
      c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, w, h); c.setTransform(s, 0, 0, s, s, s);
      c.fillStyle = '#f4efe2'; rr(c, 0, 0, CW, CH, 7); c.fill();
      c.strokeStyle = 'rgba(0,0,0,0.18)'; c.lineWidth = 1; rr(c, 0.5, 0.5, CW - 1, CH - 1, 7); c.stroke();
      if (i < 5) {
        const k = CARDS[i];
        c.save(); rr(c, 0, 0, CW, CH, 7); c.clip(); c.fillStyle = k.col; c.fillRect(0, 0, CW, 42); c.restore();
        icon(c, i, CW / 2, 22, 1.1);
        c.fillStyle = NAVY; c.font = '800 ' + (k.word.length > 6 ? 16 : 18) + 'px ' + SYS; c.textAlign = 'center'; c.textBaseline = 'middle';
        c.fillText(k.word, CW / 2, 64);
        c.fillStyle = 'rgba(20,29,58,0.4)'; c.font = '600 7.5px ' + SYS; c.fillText('REASON FOR TRAVEL', CW / 2, 84);
        c.fillStyle = 'rgba(20,29,58,0.12)'; for (let j = 0; j < 4; j++) c.fillRect(14, 100 + j * 7, CW - 28, 2);   // the mag stripe ridges
      } else {                                                // the blank card: grey band, then Chase's CHRISTMAS
        c.save(); rr(c, 0, 0, CW, CH, 7); c.clip(); c.fillStyle = '#c9ccd1'; c.fillRect(0, 0, CW, 42); c.restore();
        c.fillStyle = 'rgba(20,29,58,0.45)'; c.font = '700 9px ' + SYS; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('REASON:', CW / 2, 22);
        if (xmasReady) {                                      // his handwriting, small (the same letters as the close-up)
          c.fillStyle = '#16181c'; c.font = '900 15px ' + HAND; c.save(); c.translate(CW / 2, 66); c.rotate(-0.06);
          const tw = c.measureText(XMAS).width, k = Math.min(1, (CW - 12) / tw); c.scale(k, 1); c.fillText(XMAS, 0, 0); c.restore();
        }
      }
    }
    function paintPanel() {                                   // the static panel + the slot lips (drawn over the cards)
      const s = ps * dpr, w = Math.ceil(L.w * s) + 4, h = Math.ceil(L.h * s) + 4;
      for (const cv of [panelC, lipC]) if (cv.width !== w || cv.height !== h) { cv.width = w; cv.height = h; }
      let c = panelC.getContext('2d');
      c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, w, h); c.setTransform(s, 0, 0, s, 2 * s, 2 * s);
      // body: grey JARVIS-era plastic, bevel, four screws
      c.save(); c.shadowColor = 'rgba(0,0,0,0.5)'; c.shadowBlur = 18; c.shadowOffsetY = 6;
      const g = c.createLinearGradient(0, 0, 0, L.h); g.addColorStop(0, '#c4c7cc'); g.addColorStop(1, '#a4a8ae');
      c.fillStyle = g; rr(c, 0, 0, L.w, L.h, 20); c.fill(); c.restore();
      c.lineWidth = 2; c.strokeStyle = 'rgba(255,255,255,0.55)'; rr(c, 2, 2, L.w - 4, L.h - 4, 18); c.stroke();
      c.strokeStyle = 'rgba(0,0,0,0.18)'; rr(c, 6, 6, L.w - 12, L.h - 12, 15); c.stroke();
      for (const [sx, sy] of [[18, 18], [L.w - 18, 18], [18, L.h - 18], [L.w - 18, L.h - 18]]) {
        c.fillStyle = '#8a8f99'; c.beginPath(); c.arc(sx, sy, 5, 0, TAU); c.fill();
        c.strokeStyle = '#5d626b'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(sx - 3, sy - 3); c.lineTo(sx + 3, sy + 3); c.stroke();
      }
      // header: the JARVIS mark + what this is
      c.fillStyle = '#2f6fd6'; rr(c, 34, 26, 18, 18, 3); c.fill(); c.fillStyle = '#1d4fa8'; c.fillRect(43, 35, 9, 9);
      c.fillStyle = '#2f6fd6'; c.font = 'italic 800 18px ' + SYS; c.textAlign = 'left'; c.textBaseline = 'middle'; c.fillText('JARVIS', 60, 36);
      c.fillStyle = '#41464f'; c.font = '700 15px ' + SYS; c.fillText('REASON FOR TRAVEL', 140, 36.5);
      c.fillStyle = '#5d626b'; c.font = '12px ' + SYS; c.fillText('Insert one card.', 140, 56);
      // the sticker
      c.save(); c.translate(L.w - 118, 40); c.rotate(-0.05);
      c.fillStyle = '#f6f3ea'; rr(c, -82, -15, 164, 30, 3); c.fill(); c.strokeStyle = 'rgba(0,0,0,0.15)'; c.lineWidth = 1; rr(c, -82, -15, 164, 30, 3); c.stroke();
      c.fillStyle = '#c0392b'; c.font = '800 12px ' + SYS; c.textAlign = 'center'; c.fillText('BACKUP — DO NOT REMOVE', 0, 1);
      c.restore();
      // slot recesses (behind the cards) and the printed labels
      for (let i = 0; i < 5; i++) {
        const [sx, sy] = L.slots[i];
        c.fillStyle = '#4a4e56'; rr(c, sx - 58, sy - 6, 116, 14, 5); c.fill();
      }
      // the reader: a raised housing, its own slot, the LED socket, the arrow
      const [rx, ry] = L.reader;
      c.fillStyle = '#9599a0'; rr(c, rx - 68, ry - 150, 136, 200, 12); c.fill();
      c.strokeStyle = 'rgba(255,255,255,0.45)'; c.lineWidth = 1.5; rr(c, rx - 67, ry - 149, 134, 198, 11); c.stroke();
      c.fillStyle = '#3a3e46'; rr(c, rx - 58, ry - 6, 116, 14, 5); c.fill();
      c.fillStyle = '#2b2e34'; c.beginPath(); c.arc(rx, ry - 126, 10, 0, TAU); c.fill();
      c.fillStyle = 'rgba(65,70,79,0.6)'; c.beginPath(); c.moveTo(rx - 9, ry - 100); c.lineTo(rx + 9, ry - 100); c.lineTo(rx, ry - 88); c.closePath(); c.fill();
      // the lips: the front edge of every slot, drawn over the card that stands in it
      c = lipC.getContext('2d');
      c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, w, h); c.setTransform(s, 0, 0, s, 2 * s, 2 * s);
      const lip = (x, y) => {
        const lg = c.createLinearGradient(0, y, 0, y + 46); lg.addColorStop(0, '#b5b9bf'); lg.addColorStop(1, '#a7abb1');
        c.fillStyle = lg; c.fillRect(x - 62, y + 2, 124, 44);
        c.fillStyle = '#2a2d33'; rr(c, x - 54, y - 2, 108, 6, 3); c.fill();
        c.fillStyle = 'rgba(255,255,255,0.5)'; c.fillRect(x - 60, y + 4, 120, 1.5);
      };
      for (let i = 0; i < 5; i++) lip(L.slots[i][0], L.slots[i][1]);
      lip(rx, ry);
      for (let i = 0; i < 5; i++) { c.fillStyle = '#41464f'; c.font = '800 14px ' + SYS; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(CARDS[i].word, L.slots[i][0], L.slots[i][1] + 30); }
      c.fillStyle = '#41464f'; c.fillText('READER', rx, ry + 30);
    }
    function paintDesk() {                                    // Teddy's desk: wood, the blank card, nothing written yet
      const s = ps * dpr, w = Math.ceil(L.w * s) + 4, h = Math.ceil(L.h * s) + 4;
      if (deskC.width !== w || deskC.height !== h) { deskC.width = w; deskC.height = h; }
      const c = deskC.getContext('2d');
      c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, w, h); c.setTransform(s, 0, 0, s, 2 * s, 2 * s);
      c.save(); c.shadowColor = 'rgba(0,0,0,0.5)'; c.shadowBlur = 18; c.shadowOffsetY = 6;
      c.fillStyle = '#8a6a48'; rr(c, 0, 0, L.w, L.h, 16); c.fill(); c.restore();
      c.save(); rr(c, 0, 0, L.w, L.h, 16); c.clip();
      for (let i = 0; i < 26; i++) { c.fillStyle = i % 3 ? 'rgba(60,38,20,0.10)' : 'rgba(255,230,190,0.07)'; c.fillRect(0, i * (L.h / 26) + ((i * 7) % 5), L.w, 2 + (i % 4)); }
      // what else is on his desk: a crossword, a mug ring, the corner of the dog photo
      c.fillStyle = 'rgba(245,240,226,0.9)'; c.save(); c.translate(L.w * 0.16, L.h * 0.32); c.rotate(-0.18); c.fillRect(-60, -46, 120, 92);
      c.strokeStyle = 'rgba(0,0,0,0.35)'; c.lineWidth = 1; for (let i = 0; i <= 6; i++) { c.beginPath(); c.moveTo(-40 + i * 13, -30); c.lineTo(-40 + i * 13, 48); c.stroke(); c.beginPath(); c.moveTo(-40, -30 + i * 13); c.lineTo(38, -30 + i * 13); c.stroke(); }
      c.fillStyle = 'rgba(0,0,0,0.55)'; c.font = 'bold 9px ' + SYS; c.textAlign = 'left'; c.fillText('CROSSWORD', -54, -38);
      c.restore();
      c.strokeStyle = 'rgba(70,40,20,0.35)'; c.lineWidth = 4; c.beginPath(); c.arc(L.w * 0.84, L.h * 0.74, 30, 0.3, 5.6); c.stroke();
      c.fillStyle = '#e8e2d2'; c.save(); c.translate(L.w * 0.86, L.h * 0.2); c.rotate(0.22); c.fillRect(-50, -36, 100, 72);
      c.fillStyle = '#c9a26a'; c.fillRect(-42, -28, 84, 56); c.fillStyle = '#7a5530'; c.beginPath(); c.ellipse(-4, 6, 22, 15, 0, 0, TAU); c.fill(); c.beginPath(); c.arc(16, -8, 10, 0, TAU); c.fill();
      c.restore();
      c.restore();
    }
    function layout() {
      W = innerWidth; H = innerHeight; sch = api.input.scheme; dpr = ov.canvas.width / W || 1;
      const touch = sch === 'touch', narrow = W < 600;
      L = H > W * 1.05 ? PORT : LAND;
      const top = touch && narrow ? 118 : narrow ? 58 : 64, bot = touch ? (narrow ? 330 : 40) : 236, side = touch && !narrow ? 196 : 16;   // (clear of the pause button)
      ps = Math.min((W - 2 * side) / L.w, (H - top - bot) / L.h, 1.25);
      if (ps * L.w < Math.min(W - 24, 360)) ps = Math.min(W - 24, 360) / L.w;
      pw = L.w * ps; ph = L.h * ps; px = (W - pw) / 2; py = top + Math.max(0, (H - top - bot - ph) / 2);
      fHint = (narrow ? 13 : 14.5) + 'px ' + FONT; fTitle = 'bold ' + (narrow ? 15 : 17) + 'px ' + FONT;
      vig = ctx.createRadialGradient(W / 2, H * 0.45, Math.min(W, H) * 0.25, W / 2, H * 0.45, Math.max(W, H) * 0.8);
      vig.addColorStop(0, 'rgba(0,0,0,0.35)'); vig.addColorStop(1, 'rgba(0,0,0,0.75)');
      ctx.font = '900 100px ' + HAND; LXW[0] = 0;
      for (let i = 0; i < XN; i++) LXW[i + 1] = LXW[i] + ctx.measureText(XMAS[i]).width + 6;
      { const s = ps * 2.45, w = CW * s, h = CH * s * 0.78; fFont = '900 ' + Math.round(100 * Math.min(w * 0.84 / LXW[XN], h * 0.24 / 100)) + 'px ' + HAND; }
      paintPanel(); paintDesk();
      for (let i = 0; i < 6; i++) paintCard(i);
      for (let i = 0; i < 6; i++) if (mode[i] === 0 || (i === X && mode[i] === 2 && tw.i !== X && grab !== X)) { cx[i] = homeX(i); cy[i] = homeY(i); }
      setHint();
    }
    function setHint() {
      const s = api.input.scheme;
      if (phase === 'desk') hint = s === 'touch' ? 'Draw on the card to write' : s === 'pad' ? 'Hold A to write' : 'Hold YES to write · or draw · or type';
      else if (phase === 'xmas') hint = s === 'touch' ? 'Drag it into the reader' : s === 'pad' ? 'A — put it in the reader' : 'YES or drag it into the reader';
      else hint = s === 'touch' ? 'Drag a card into the reader' : s === 'pad' ? 'Stick to choose · A to try it' : '← → to choose · YES to try it · or drag one to the reader';
      ctx.font = fHint; hintW = ctx.measureText(hint).width;
    }

    // ---------------------------------------------------------- moving cards
    function tween(i, x, y, d, m) {
      tw.i = i; tw.x0 = cx[i]; tw.y0 = cy[i]; tw.x1 = x; tw.y1 = y; tw.t = 0; tw.d = d; tw.m = m; mode[i] = 2;
      return new Promise((r) => { tw.res = r; });
    }
    function tweenTick(dt) {
      if (tw.i < 0) return;
      tw.t += dt;
      const k = ease(Math.min(1, tw.t / tw.d)), i = tw.i;
      cx[i] = tw.x0 + (tw.x1 - tw.x0) * k; cy[i] = tw.y0 + (tw.y1 - tw.y0) * k;
      if (tw.t >= tw.d) { mode[i] = tw.m; tw.i = -1; const r = tw.res; tw.res = null; if (r) r(); }
    }
    async function insert(i) {                                // a card into the reader: read, then rejected or accepted
      if (busy || done) return;
      busy = true; grab = -1;
      const k = run, w = api.world;
      if (i < 5) propCall(w, 'reason_panel', 'pull', i);
      if (chase) chase.play('give', { dur: 1.1, loop: false });
      snd(api, 'whoosh', 0.18, 1.5);
      await tween(i, rdX(), rdTop(), 0.42, 2); if (!live(k)) return;
      await tween(i, rdX(), rdIn(), 0.22, 1); if (!live(k)) return;
      snd(api, 'clunk', 0.4, 1.3);
      propCall(w, 'reason_panel', 'insert', i === X ? 'xmas' : i);
      led = 3; ledT = 0;                                      // reading: amber blink
      await wait(0.7); if (!live(k)) return;
      if (i === X) {                                          // accepted
        led = 2; propCall(w, 'reason_panel', 'led', 'green'); propCall(w, 'booth_screen', 'show', 'accept'); propCall(w, 'booth_speaker', 'pulse');
        snd(api, 'chime_ready', 0.55);
        const sh = anchorShot(w, 's25_screen'); if (sh) api.cam.shot(sh);
        await line('safesense', XMAS_LINE); if (!live(k)) return;
        await api.play([{ flag: P.flag || 's25_reason' }]); if (!live(k)) return;
        phase = 'out';
        await wait(0.6); if (!live(k)) return;
        fin();
        return;
      }
      led = 1; propCall(w, 'reason_panel', 'led', 'red'); propCall(w, 'booth_screen', 'show', 'reject'); propCall(w, 'booth_speaker', 'pulse');
      snd(api, 'sad_beep', 0.45);
      if (tried.indexOf(CARDS[i].word) < 0) tried.push(CARDS[i].word);
      await line('safesense', CARDS[i].line); if (!live(k)) return;
      snd(api, 'pop', 0.25, 0.8);
      await tween(i, rdX(), rdTop(), 0.25, 2); if (!live(k)) return;
      rej[i] = 1;
      await tween(i, homeX(i), homeY(i) - 70, 0.42, 2); if (!live(k)) return;
      await tween(i, homeX(i), homeY(i), 0.2, 0); if (!live(k)) return;
      snd(api, 'clunk', 0.25, 1.6);
      led = 0; propCall(w, 'reason_panel', 'led', 'off');
      let n = 0; for (let j = 0; j < 5; j++) n += rej[j];
      if (n >= 5) { await toDesk(k); return; }
      focus = nextFocus(focus, 1);
      busy = false;
    }
    async function line(id, text) {
      talking = true;
      await api.say(id, text, O_NONE);
      talking = false;
    }
    async function toDesk(k) {                                // all five out: the blank card and the marker on his desk
      await wait(0.5); if (!live(k)) return;
      phase = 'desk'; wk = 0; wkShown = -1; setHint();
      if (deskShot) api.cam.shot(deskShot);
      if (chase) { chaseAnim = chaseAnim || chase.anim; chase.play('write_note'); }
      propCall(api.world, 'desk_card', 'show', true);
      busy = false;
    }
    async function written() {                               // CHRISTMAS: back to the panel with it in his hand
      busy = true;
      const k = run;
      xmasReady = true; paintCard(X);
      propCall(api.world, 'desk_card', 'written', true);
      snd(api, 'pop', 0.3, 1.2);
      await wait(0.55); if (!live(k)) return;
      propCall(api.world, 'desk_card', 'show', false);
      if (chase) chase.play(chaseAnim && chaseAnim !== 'write_note' ? chaseAnim : 'idle');
      if (baseShot) api.cam.shot(baseShot);
      phase = 'xmas'; setHint();
      cx[X] = homeX(X); cy[X] = homeY(X) + 60; mode[X] = 2;
      await tween(X, homeX(X), homeY(X), 0.35, 2); if (!live(k)) return;
      focus = X; busy = false;
    }
    function nextFocus(f, d) {
      for (let n = 0; n < 6; n++) { f = (f + d + 5) % 5; if (!rej[f]) return f; }
      return f;
    }
    function cardAt(sx, sy) {                                  // which card is under a screen point (topmost first)
      const u = (sx - px) / ps, v = (sy - py) / ps;
      if (phase === 'xmas' && mode[X] === 2 && Math.abs(u - cx[X]) < CW / 2 + 6 && Math.abs(v - cy[X]) < CH / 2 + 6) return X;
      if (phase !== 'panel') return -1;
      for (let i = 0; i < 5; i++) {
        if (rej[i]) continue;
        const top = cy[i] - CH / 2, bot = L.slots[i][1] + 10;
        if (Math.abs(u - cx[i]) < CW / 2 + 6 && v > top - 6 && v < bot) return i;
      }
      return -1;
    }
    const nearReader = (i) => Math.abs(cx[i] - rdX()) < 90 && cy[i] < L.reader[1] + 30 && cy[i] > L.reader[1] - 230;

    // ---------------------------------------------------------- input
    function play(dt) {
      const I = api.input, Pt = I.pointer;
      if (phase === 'desk') { writeInput(dt); return; }
      if (phase !== 'panel' && phase !== 'xmas') return;
      if (busy || talking) return;                            // (the dialogue box takes its own YES first: ui ticks before us)
      // the pointer: grab, drag, drop (or a tap = try it)
      if (Pt.pressed) {
        const i = cardAt(Pt.x, Pt.y);
        I.consume('yes');
        if (i >= 0) {
          grab = i; focus = i; mode[i] = 2;
          gox = cx[i] - (Pt.x - px) / ps; goy = cy[i] - (Pt.y - py) / ps; gx0 = Pt.x; gy0 = Pt.y; gT = 0; gMoved = 0;
          if (i < 5) propCall(api.world, 'reason_panel', 'pull', i);
          snd(api, 'tick', 0.25, 1.4);
        }
      }
      if (grab >= 0) {
        gT += dt;
        cx[grab] = (Pt.x - px) / ps + gox; cy[grab] = (Pt.y - py) / ps + goy;
        gMoved = Math.max(gMoved, Math.hypot(Pt.x - gx0, Pt.y - gy0));
        if (!Pt.down) {
          const i = grab; grab = -1;
          if (nearReader(i) || (gMoved < 12 && gT < 0.4)) insert(i);
          else { tween(i, homeX(i), homeY(i), 0.25, i === X ? 2 : 0); }
        }
        return;
      }
      // hover picks the focus; keys / stick move it; YES tries it
      if (Pt.x !== lastPx || Pt.y !== lastPy) { lastPx = Pt.x; lastPy = Pt.y; const i = cardAt(Pt.x, Pt.y); if (i >= 0) focus = i; }
      if (phase === 'xmas') { focus = X; if (I.pressed('yes')) { I.consume('yes'); insert(X); } return; }
      if (rej[focus]) focus = nextFocus(focus, 1);
      if (I.pressed('left')) { I.consume('left'); focus = nextFocus(focus, -1); snd(api, 'tick', 0.18, 1.2); }
      if (I.pressed('right')) { I.consume('right'); focus = nextFocus(focus, 1); snd(api, 'tick', 0.18, 1.2); }
      if (I.pressed('yes')) { I.consume('yes'); insert(focus); }
    }
    function writeInput(dt) {
      const I = api.input, Pt = I.pointer;
      if (busy) return;
      let add = 0;
      if (I.holding('yes') && !Pt.down) add += dt * 4.2;        // hold YES / A (or a pressed "hold")
      if (Pt.down) {                                            // the mouse / a finger drawing on the card
        if (lastPx >= 0) add += Math.hypot(Pt.x - lastPx, Pt.y - lastPy) / Math.max(18, 30 * ps);
        else add += dt * 2;
      }
      lastPx = Pt.down ? Pt.x : -1; lastPy = Pt.y;
      if (Pt.pressed) I.consume('yes');
      wk = Math.min(XN, wk + Math.min(add, 0.5));
      const n = Math.floor(wk);
      if (n !== wkShown) { if (n > wkShown && wkShown >= 0) snd(api, 'creak', 0.12, 2.6); wkShown = n; }
      if (wk >= XN) { I.unlatch('yes'); written(); }
    }
    function onKey(code) {                                     // typing writes the next letter (whatever you type)
      if (done || phase !== 'desk' || busy) return;
      if (/^Key[A-Z]$/.test(code)) wk = Math.min(XN, Math.floor(wk) + 1);
    }

    function autoTick(dt) {
      if (busy || talking) { autoT = 0; return; }
      autoT += dt;
      if (phase === 'panel' && autoT > (TEST.fast ? 0.15 : 0.45)) {
        while (autoN < AUTO_ORDER.length && rej[AUTO_ORDER[autoN]]) autoN++;
        if (autoN < AUTO_ORDER.length) { focus = AUTO_ORDER[autoN]; insert(focus); autoT = 0; }
      } else if (phase === 'desk' && autoT > 0.3) {
        wk = Math.min(XN, wk + dt * 6);
        const n = Math.floor(wk); if (n !== wkShown) { if (wkShown >= 0) snd(api, 'creak', 0.12, 2.6); wkShown = n; }
        if (wk >= XN) written();
      } else if (phase === 'xmas' && autoT > 0.4) insert(X);
    }

    function fin(extra) {
      if (done) return;
      const r = { ok: true, reason: XMAS, tried: tried.slice() };
      if (extra) Object.assign(r, extra);
      api.finish(r);
    }

    return {
      start(params, a) {
        api = a; ov = a.overlay; ctx = ov.ctx; P = params || {};
        run++; done = false; AUTO = false; autoT = 0; autoN = 0;
        phase = 'panel'; busy = false; focus = 1; led = 0; ledT = 0; talking = false; tried = []; panelA = 0; deskA = 0; fadeA = 1;
        grab = -1; wk = 0; wkShown = -1; lastPx = lastPy = -1; xmasReady = false; tw.i = -1; tw.res = null;
        rej.fill(0); mode.fill(0); mode[X] = 3;
        if (!panelC) { panelC = document.createElement('canvas'); lipC = document.createElement('canvas'); deskC = document.createElement('canvas'); }
        W = H = 0;
        const w = a.world;
        chase = w.actor('chase') || null; chaseAnim = null;
        baseShot = P.shot || anchorShot(w, 's25_panel') || (chase ? { shot: 'MID', on: 'chase' } : null);
        deskShot = P.deskShot || anchorShot(w, 's25_desk_card') || (chase ? { shot: 'CLOSE', on: 'chase' } : null);
        if (baseShot) a.cam.shot(baseShot);
        propCall(w, 'reason_panel', 'led', 'off');
        if (!keyFn) keyFn = (code) => onKey(code);
        off('key', keyFn); on('key', keyFn);
        ov.show(true);
      },
      update(dt) {
        if (done || !api) return;
        if (W !== innerWidth || H !== innerHeight || api.input.scheme !== sch || ov.canvas.width / innerWidth !== dpr) layout();
        tweenTick(dt);
        ledT += dt;
        if (phase === 'out') { fadeA = Math.max(0, fadeA - dt * 2); return; }
        panelA = phase === 'desk' ? Math.max(0, panelA - dt * 3) : Math.min(1, panelA + dt * 3);
        deskA = phase === 'desk' ? Math.min(1, deskA + dt * 3) : Math.max(0, deskA - dt * 3);
        if (AUTO) autoTick(dt); else play(dt);
      },
      draw() {
        if (done || !ctx || !W) return;
        const c = ctx, d = dpr;
        c.setTransform(d, 0, 0, d, 0, 0); c.clearRect(0, 0, W, H);
        c.globalAlpha = fadeA;
        c.fillStyle = vig; c.fillRect(0, 0, W, H);
        if (panelA > 0) {
          c.globalAlpha = fadeA * panelA;
          const oy = (1 - panelA) * 30;
          c.drawImage(panelC, px - 2 * ps, py - 2 * ps + oy, panelC.width / d, panelC.height / d);
          // cards in slots and in the reader (clipped at their mouths), then the lips over them
          c.setTransform(d * ps, 0, 0, d * ps, d * px, d * (py + oy));
          for (let i = 0; i < 6; i++) {
            if (mode[i] !== 0 && mode[i] !== 1) continue;
            const mouth = mode[i] === 1 ? L.reader[1] : i < 5 ? L.slots[i][1] : 0;
            c.save(); c.beginPath(); c.rect(cx[i] - CW, cy[i] - CH, CW * 2, mouth - (cy[i] - CH) + 1); c.clip();
            c.drawImage(faceC[i], cx[i] - CW / 2 - 1, cy[i] - CH / 2 - 1, CW + 2, CH + 2);
            if (rej[i] && mode[i] === 0) { c.fillStyle = 'rgba(150,154,160,0.62)'; rr(c, cx[i] - CW / 2, cy[i] - CH / 2, CW, CH, 7); c.fill(); }   // greyed: tried
            c.restore();
          }
          c.globalAlpha = fadeA * panelA;
          c.setTransform(d, 0, 0, d, 0, 0);
          c.drawImage(lipC, px - 2 * ps, py - 2 * ps + oy, lipC.width / d, lipC.height / d);
          c.setTransform(d * ps, 0, 0, d * ps, d * px, d * (py + oy));
          // the LED: off / red / green / amber blinking while it reads
          const lx = L.reader[0], ly = L.reader[1], on = led === 3 ? ((ledT * 8) | 0) % 2 === 0 : led > 0;
          if (on) {
            const col = led === 1 ? '#ff4e3d' : led === 2 ? '#5ad17a' : '#ffb02e';
            c.fillStyle = col; c.shadowColor = col; c.shadowBlur = 16; c.beginPath(); c.arc(lx, ly - 126, 7, 0, TAU); c.fill(); c.shadowBlur = 0;
            c.fillStyle = 'rgba(255,255,255,0.7)'; c.beginPath(); c.arc(lx - 2, ly - 128, 2.2, 0, TAU); c.fill();
          } else { c.fillStyle = '#54585f'; c.beginPath(); c.arc(lx, ly - 126, 7, 0, TAU); c.fill(); }
          // free cards on top (lifted, flying, held), with a drop shadow
          for (let i = 0; i < 6; i++) {
            if (mode[i] !== 2) continue;
            c.fillStyle = 'rgba(0,0,0,0.3)'; rr(c, cx[i] - CW / 2 + 6, cy[i] - CH / 2 + 9, CW, CH, 8); c.fill();
            c.drawImage(faceC[i], cx[i] - CW / 2 - 1, cy[i] - CH / 2 - 1, CW + 2, CH + 2);
          }
          // the focus ring (the card a YES would try)
          if (!busy && !talking && grab < 0 && (phase === 'panel' || phase === 'xmas') && !AUTO) {
            const i = focus;
            if (i >= 0 && i <= X && !rej[i]) {
              const top = cy[i] - CH / 2 - 4, hgt = mode[i] === 0 ? (i < 5 ? L.slots[i][1] - top : CH + 8) : CH + 8;
              c.lineWidth = 3; c.strokeStyle = ICE; c.shadowColor = ICE; c.shadowBlur = 10;
              rr(c, cx[i] - CW / 2 - 4, top, CW + 8, hgt, 9); c.stroke(); c.shadowBlur = 0;
            }
          }
          c.setTransform(d, 0, 0, d, 0, 0);
        }
        if (deskA > 0) {                                        // the desk close-up: the blank card, the marker, the writing
          c.globalAlpha = fadeA * deskA;
          c.drawImage(deskC, px - 2 * ps, py - 2 * ps, deskC.width / d, deskC.height / d);
          const s = ps * 2.45, ccx = px + pw * 0.5, ccy = py + ph * 0.5, w = CW * s, h = CH * s * 0.78;
          c.setTransform(d, 0, 0, d, 0, 0);
          c.fillStyle = 'rgba(0,0,0,0.3)'; rr(c, ccx - w / 2 + 8, ccy - h / 2 + 10, w, h, 14); c.fill();
          c.fillStyle = '#f4efe2'; rr(c, ccx - w / 2, ccy - h / 2, w, h, 14); c.fill();
          c.save(); rr(c, ccx - w / 2, ccy - h / 2, w, h, 14); c.clip(); c.fillStyle = '#c9ccd1'; c.fillRect(ccx - w / 2, ccy - h / 2, w, h * 0.27); c.restore();
          c.fillStyle = 'rgba(20,29,58,0.45)'; c.font = 'bold ' + Math.round(9 * s * 0.9) + 'px ' + SYS; c.textAlign = 'center'; c.textBaseline = 'middle';
          c.fillText('REASON:', ccx, ccy - h / 2 + h * 0.135);
          // the handwriting, letter by letter, and the marker's tip on the newest one
          const k100 = Math.min(w * 0.84 / LXW[XN], h * 0.24 / 100), fs = Math.round(100 * k100), x0 = ccx - LXW[XN] * k100 / 2, y0 = ccy + h * 0.08;
          c.fillStyle = '#16181c'; c.font = fFont; c.textAlign = 'center';
          let tipX = x0, tipY = y0;
          for (let i = 0; i < XN; i++) {
            const a = clamp(wk - i, 0, 1);
            if (a <= 0) break;
            const lw = (LXW[i + 1] - LXW[i]) * k100, x = x0 + LXW[i] * k100 + lw / 2, y = y0 + Math.sin(i * 1.7) * fs * 0.05 - i * fs * 0.012;
            c.save(); c.globalAlpha = fadeA * deskA * a; c.translate(x, y); c.rotate(-0.06 + Math.sin(i * 2.3) * 0.05); c.scale(0.7 + 0.3 * a, 0.7 + 0.3 * a);
            c.fillText(XMAS[i], 0, 0); c.restore();
            tipX = x + lw * (a - 0.5); tipY = y + fs * 0.12;
          }
          c.globalAlpha = fadeA * deskA;
          // the marker: black barrel, white band, its tip where the ink is
          c.save(); c.translate(tipX + 2, tipY - 2); c.rotate(-0.75);
          c.fillStyle = 'rgba(0,0,0,0.25)'; rr(c, 6, 6, 18 * s * 0.4, 120 * s * 0.4, 7 * s * 0.3); c.fill();
          c.fillStyle = '#1b1c20'; c.beginPath(); c.moveTo(0, 0); c.lineTo(5 * s * 0.4, 14 * s * 0.4); c.lineTo(-5 * s * 0.4, 14 * s * 0.4); c.closePath(); c.fill();
          c.fillStyle = '#26272c'; rr(c, -8 * s * 0.4, 14 * s * 0.4, 16 * s * 0.4, 110 * s * 0.4, 5 * s * 0.4); c.fill();
          c.fillStyle = '#e8e8ee'; c.fillRect(-8 * s * 0.4, 52 * s * 0.4, 16 * s * 0.4, 16 * s * 0.4);
          c.fillStyle = '#16181c'; c.font = 'bold ' + Math.round(6 * s * 0.4) + 'px ' + SYS; c.fillText('PERM', 0, 60 * s * 0.4);
          c.restore();
        }
        // the title strip + the hint pill under the panel
        if (phase !== 'out') {
          c.globalAlpha = fadeA;
          const ty = py - 26;
          c.fillStyle = '#ffffff'; c.font = fTitle; c.textAlign = 'center'; c.textBaseline = 'middle';
          c.shadowColor = 'rgba(0,0,0,0.85)'; c.shadowBlur = 4;
          c.fillText(phase === 'desk' ? "Teddy's desk: a blank card and a marker" : 'Find a reason the computer likes', W / 2, ty);
          c.shadowBlur = 0; c.shadowColor = 'transparent';
          if (!busy && !talking && !AUTO) {
            const hy = py + ph + 22 + (phase === 'xmas' ? (L.hold[1] + CH / 2 - L.h) * ps : 0), w = hintW + 30;
            c.fillStyle = 'rgba(20,29,58,0.88)'; rr(c, W / 2 - w / 2, hy - 16, w, 32, 16); c.fill();
            c.fillStyle = '#ffffff'; c.font = fHint; c.fillText(hint, W / 2, hy + 1);
          }
        }
        c.globalAlpha = 1;
      },
      end(r) {
        const wasTalking = talking;
        done = true; run++;
        if (wasTalking && typeof say !== 'undefined' && say.reset) say.reset();
        talking = false;
        if (keyFn) off('key', keyFn);
        if (tw.res) { const res = tw.res; tw.res = null; tw.i = -1; res(); }
        const w = api && api.world;
        if (r && r.skipped && w) {                             // as if it had been accepted
          state.flags[P.flag || 's25_reason'] = true;
          propCall(w, 'reason_panel', 'insert', 'xmas'); propCall(w, 'reason_panel', 'led', 'green');
          propCall(w, 'desk_card', 'show', false); propCall(w, 'booth_screen', 'show', 'accept');
        }
        if (chase && chase.anim === 'write_note') chase.play(chaseAnim && chaseAnim !== 'write_note' ? chaseAnim : 'idle');
        chase = null;
        if (api) api.input.unlatch();
        if (ctx) { ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, ov.canvas.width, ov.canvas.height); ctx.globalAlpha = 1; }
      },
      skipResult: () => ({ ok: true, reason: XMAS, tried: tried.slice() }),
      // tests: card centres and the reader on screen (CSS px), the phase, what's been rejected
      debug: () => {
        const cards = []; for (let i = 0; i < 6; i++) cards.push([px + cx[i] * ps, py + cy[i] * ps]);
        return { cards, reader: [px + rdX() * ps, py + (L.reader[1] - 60) * ps], deskCard: [px + pw / 2, py + ph / 2], phase, busy, talking, rej: Array.from(rej), wk, focus, done };
      },
      autoplay(a) { if (done || api !== a) return; AUTO = true; autoT = 0; autoN = 0; },
    };
  })();
})();
