// ============================================================ UI
// All DOM UI in #ui: fades, letterbox, cards, prompts, dialogue (say/choose/ask), barks, JARVIS + SafeSense
// pop-ups, TWO's HUD (NO SERVICE · QUIET IN · Samples, HACK %), Chip View + Signal, strain meter, sample takes,
// time cards, objective, portraits, inventory panel, menus, and the CARDS painters for INSERT close-ups.
// Per frame only transform / opacity / text change. Everything time-based runs on game ticks.

// A recorded take's waveform, seeded by its id so it is the same every time (sample card + CARDS.take).
function uiWave(cx, x, y, w, h, key, col, bars = 48) {
  let s = 11; for (const c of String(key)) s = (s * 31 + c.charCodeAt(0)) % 2147483647;
  const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
  const bw = w / bars, mid = y + h / 2;
  cx.fillStyle = col;
  for (let i = 0; i < bars; i++) {
    const env = Math.sin(Math.PI * (i + 0.5) / bars) ** 0.6, a = (0.12 + 0.88 * r()) * env * h * 0.48;
    cx.fillRect(x + i * bw + bw * 0.18, mid - Math.max(1, a), bw * 0.64, Math.max(2, a * 2));
  }
}
// Reduce Flashing helpers: is a CSS colour bright (a white flash), and its slow dim-bloom stand-in
function uiRGB(c) {
  c = String(c || '').trim().toLowerCase();
  if (c === 'white') return [255, 255, 255];
  let m = /^#([0-9a-f]{3})$/.exec(c);
  if (m) return [...m[1]].map((h) => parseInt(h + h, 16));
  m = /^#([0-9a-f]{6})/.exec(c);
  if (m) return [0, 2, 4].map((i) => parseInt(m[1].slice(i, i + 2), 16));
  m = /^rgba?\(\s*(\d+)[ ,]+(\d+)[ ,]+(\d+)/.exec(c);
  return m ? [+m[1], +m[2], +m[3]] : null;
}
const uiBright = (c) => { const v = uiRGB(c); return !!v && (0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2]) / 255 > 0.72; };
// speaker id -> the actor(s) whose mouths move: CHARACTERS[id].actor ('manager' -> 'luka40'); a duo (CHARACTERS[id].duo,
// or Rue's 'a_b' + voice.also) -> both
const speakerParts = (id) => { const ch = CHARACTERS[id]; return ch && Array.isArray(ch.duo) ? ch.duo : ch && ch.voice && ch.voice.also ? String(id).split('_') : null; };
function speakerActors(id) {
  const ids = (speakerParts(id) || [id]).slice();
  for (let k = 0; k < ids.length; k++) { const c = CHARACTERS[ids[k]]; if (c && c.actor) ids[k] = c.actor; }
  return ids;
}
const uiMute = (c, k = 0.62) => { const v = uiRGB(c) || [255, 255, 255], g = [96, 102, 118]; return `rgb(${v.map((x, i) => Math.round(x + (g[i] - x) * k)).join(',')})`; };

const ui = (() => {
  const $ = (id) => document.getElementById(id);
  const root = $('ui'), fadeEl = $('fade'), flashEl = $('flash'), tcard = $('tcard'), acard = $('acard');
  const cardWrap = $('cardwrap'), cardCv = $('card'), toastEl = $('toast'), swapEl = $('swap'), promptEl = $('prompt');
  const timeEl = $('timecard'), chipEl = $('chipview'), sigEl = $('signal'), sigBar = sigEl.querySelector('i');
  const meterEl = $('meter'), meterLbl = meterEl.querySelector('span'), meterBar = meterEl.querySelector('i');
  const takeEl = $('take'), takeCv = takeEl.querySelector('canvas'), takeLbl = takeEl.querySelector('span');
  const pB = document.createElement('b'), pS = document.createElement('span');
  promptEl.append(pB, pS);
  const tweens = [];
  let lastPrompt, toastT = 0, takeT = 0, tcTok = 0, flTok = 0, chipOn = false, chipable = false;
  let sigV = -1, sigK = '', mtrV = -1, mtrL = null, mtrS = false;
  fadeEl._o = 1; flashEl._o = 0; tcard._o = 0; acard._o = 0; timeEl._o = 0;
  const CARD_SCALE = 2; // cards are painted at 2x for crisp text (spec 12) and fitted to the screen by CSS

  // opacity tween on game time; a new tween on the same element replaces (and resolves) the old one
  function fadeTo(el, to, dur) {
    for (let i = 0; i < tweens.length; i++) if (tweens[i].el === el) { const o = tweens[i]; tweens.splice(i, 1); o.res(); break; }
    if (!(dur > 0) || U.skipping()) { el._o = to; el.style.opacity = to; return Promise.resolve(); }
    return new Promise((res) => tweens.push({ el, a: el._o, b: to, dur, t: 0, res }));
  }

  const inv = { el: $('inv'), row: null, desc: null, acts: null, slots: [], spec: null, sel: 0, mode: 'items', act: 0, first: -1, t: 0 };
  inv.row = inv.el.querySelector('.row'); inv.desc = inv.el.querySelector('.desc'); inv.acts = [...inv.el.querySelectorAll('.acts button')];

  const U = {
    skipping: () => typeof flow !== 'undefined' && flow.skipping === true,
    sfx(name, o) { if (typeof sfx === 'function') sfx(name, o); },

    fade(to, dur = 0.5, color) {
      if (to === 'out') to = 1; else if (to === 'in') to = 0;
      // Reduce Flashing: a fade UP to a bright colour (a white-out) never snaps, and goes to a soft grey instead of white
      if (options.reduceFlashing && color && to > fadeEl._o && uiBright(color)) { color = uiMute(color, 0.3); if (dur > 0) dur = Math.max(dur, 1.2); }
      if (color) fadeEl.style.background = color; else if (to > 0) fadeEl.style.background = '#000';
      return fadeTo(fadeEl, to, dur);
    },
    // flash(dur, colour): a white (or orange…) flash. Reduce Flashing: a slow, dim bloom in a muted colour instead.
    flash(dur = 0.6, color = '#fff') {
      const k = ++flTok;
      if (U.skipping()) return fadeTo(flashEl, 0, 0);
      if (options.reduceFlashing) {
        flashEl.style.background = uiMute(color);
        return fadeTo(flashEl, 0.3, Math.max(0.45, dur * 0.6)).then(() => (k === flTok ? fadeTo(flashEl, 0, Math.max(1.2, dur * 1.6)) : undefined));
      }
      flashEl.style.background = color;
      flashEl._o = 1; flashEl.style.opacity = 1;
      return fadeTo(flashEl, 0, dur);
    },
    letterbox(on) { root.classList.toggle('lbon', !!on); },
    // the big centred title card; o.logo (or the text 'two') shows the game's logo: white, lowercase, hairline yellow rule
    async title(text, dur = 2.5, o = {}) {
      if (U.skipping()) return;
      tcard.textContent = text;
      tcard.classList.toggle('logo', o.logo ?? /^two$/i.test(String(text).trim()));
      await fadeTo(tcard, 1, 0.5); await wait(Math.max(0, dur - 1)); await fadeTo(tcard, 0, 0.5);
    },
    // ui.timeCard(time, place): small, low left, ~3 s in and out, never blocks (resolves when it has gone; nothing while skipping)
    async timeCard(time, place, dur = 3) {
      if (U.skipping() || !time) return;
      const k = ++tcTok;
      timeEl.children[0].textContent = time; timeEl.children[2].textContent = place || '';
      await fadeTo(timeEl, 1, 0.6); if (k !== tcTok) return;
      await wait(Math.max(0, dur - 1.2)); if (k !== tcTok) return;
      await fadeTo(timeEl, 0, 0.6);
    },
    async actCard(text) {
      if (U.skipping()) return;
      const i = text.indexOf(' — ');
      acard.children[0].textContent = i < 0 ? text : text.slice(0, i);
      acard.children[2].textContent = i < 0 ? '' : text.slice(i + 3);
      await fadeTo(acard, 1, 0.8); await wait(2.8); await fadeTo(acard, 0, 0.8);
    },

    // paints CARDS[kind] into any canvas at 2x the painter's native size (the painter still sees native w, h); returns [w, h] or null
    paintCard(cv, kind, data, scale = CARD_SCALE) {
      const f = CARDS[kind];
      if (!f) { console.warn('TWO: no CARDS.' + kind); return null; }
      const s = f.size || [800, 600], W = Math.round(s[0] * scale), H = Math.round(s[1] * scale);
      if (cv.width !== W) cv.width = W;
      if (cv.height !== H) cv.height = H;
      const cx = cv.getContext('2d');
      cx.setTransform(1, 0, 0, 1, 0, 0); cx.clearRect(0, 0, W, H);
      cx.setTransform(scale, 0, 0, scale, 0, 0);
      cx.save(); f(cx, s[0], s[1], data || {}); cx.restore();
      cx.setTransform(1, 0, 0, 1, 0, 0);
      return s;
    },
    card(kind, data) {
      if (!kind) { cardWrap.classList.add('off'); return; }
      const s = U.paintCard(cardCv, kind, data);
      if (!s) return;
      const k = Math.min((root.classList.contains('lbon') ? 0.62 : 0.7) * innerHeight / s[1], 0.86 * innerWidth / s[0]); // stays inside the 2.35:1 frame
      cardCv.style.width = Math.round(s[0] * k) + 'px'; cardCv.style.height = Math.round(s[1] * k) + 'px';
      cardWrap.classList.remove('off');
    },
    toast(text) { toastEl.textContent = text; toastEl.classList.add('show'); toastT = 2.2; },
    prompt(text) {
      if (text === lastPrompt) return;
      lastPrompt = text;
      if (!text) { promptEl.classList.add('off'); return; }
      const m = /^(YES|NO|SWAP|CHIP|HOLD)\b\s*(?:—\s*)?(.*)$/.exec(text);   // 'YES — Examine', 'SWAP — Luka', 'CHIP — Chip View', 'HOLD — Lift'
      pB.textContent = m ? m[1] : ''; pB.className = m && m[1] !== 'YES' ? m[1].toLowerCase() : ''; pB.style.display = m ? '' : 'none';
      pS.textContent = m ? m[2] : text;
      promptEl.classList.remove('off');
    },
    swapIndicator(activeId, otherId) {
      if (!activeId) { swapEl.classList.add('off'); return; }
      swapEl.children[1].src = portraitURL(activeId);
      swapEl.children[0].src = otherId ? portraitURL(otherId) : '';
      swapEl.children[0].style.display = otherId ? '' : 'none';
      swapEl.children[2].textContent = input.scheme === 'pad' ? 'Y' : input.scheme === 'touch' ? 'SWAP' : 'TAB';
      swapEl.classList.remove('off');
    },

    // ---------------------------------------------------------- TWO: Chip View, Signal, strain meter, sample takes, name glitch
    // Chip View visuals only (33-systems owns the logic): faint blue tint + scanlines over the world, under pop-ups and dialogue
    chipView(on) { on = !!on; if (on === chipOn) return; chipOn = on; chipEl.classList.toggle('on', on); },
    // Signal meter 0..1 (null hides). Safe to call every tick: the DOM is written only when the value moves.
    signal(v) {
      if (v == null) { if (sigV !== -1) { sigV = -1; sigEl.classList.add('off'); } return; }
      v = v < 0 ? 0 : v > 1 ? 1 : v;
      if (sigV === -1) sigEl.classList.remove('off');
      if (Math.abs(v - sigV) < 0.004 && !(v === 1 && sigV !== 1)) return;
      sigV = v; sigBar.style.transform = 'scaleX(' + v.toFixed(3) + ')';
      const k = v >= 0.999 ? 'full' : v >= 0.7 ? 'warn' : '';
      if (k !== sigK) { sigK = k; sigEl.className = k; }
    },
    // ui.meter(label, v 0..1 | null): strength / strain bar (roller door, brass plate, "Hold this"). Every-tick safe.
    meter(label, v) {
      if (v == null) { if (mtrV !== -1) { mtrV = -1; mtrL = null; meterEl.classList.add('off'); } return; }
      v = v < 0 ? 0 : v > 1 ? 1 : v;
      if (mtrV === -1) meterEl.classList.remove('off');
      if (label !== mtrL) { mtrL = label; meterLbl.textContent = label || ''; }
      if (Math.abs(v - mtrV) >= 0.004 || (v === 1 && mtrV !== 1)) { mtrV = v; meterBar.style.transform = 'scaleX(' + v.toFixed(3) + ')'; }
      const s = v > 0.82; if (s !== mtrS) { mtrS = s; meterEl.classList.toggle('strain', s); }
    },
    // ui.sampleCard(id): the "take" card — a little waveform + the sample's label, ~2.6 s, never blocks
    sampleCard(id, o = {}) {
      if (U.skipping()) return;
      const smp = (typeof SAMPLES !== 'undefined' && SAMPLES[id]) || {};
      const cx = takeCv.getContext('2d');
      cx.clearRect(0, 0, takeCv.width, takeCv.height);
      uiWave(cx, 0, 0, takeCv.width, takeCv.height, id, '#ffd9d4');
      takeLbl.textContent = o.label || smp.label || String(id);
      takeEl.classList.remove('on'); void takeEl.offsetWidth; takeEl.classList.add('on');   // restart the playhead sweep
      takeT = o.dur || 2.6;
    },
    // ui.nameGlitch(fromId, toId): the visible dialogue label (and portrait) switch with a one-frame glitch (3.3's reveal)
    nameGlitch(fromId, toId) { if (!U.skipping()) say.glitch(fromId, toId); },

    // ---------------------------------------------------------- inventory panel (modal while open)
    inventoryPanel(spec) {
      root.classList.toggle('invopen', !!spec);
      if (!spec) { inv.spec = null; inv.el.classList.add('off'); return null; }
      inv.spec = spec; inv.sel = 0; inv.mode = 'items'; inv.act = 0; inv.first = -1; inv.t = 0;
      const items = spec.items || [];
      inv.row.textContent = '';
      for (let k = 0; k < items.length; k++) {
        let s = inv.slots[k];
        if (!s) {
          s = document.createElement('div'); s.className = 'slot'; s._k = k;
          const c = document.createElement('canvas'); c.width = c.height = 96;
          s.append(c, document.createElement('span'));
          s.addEventListener('click', () => {
            if (!inv.spec) return;
            if (inv.mode === 'combine') { if (s._k !== inv.first) { inv.sel = s._k; invDo(); } return; }
            inv.sel = s._k; inv.mode = 'acts'; invPaint();
          });
          inv.slots[k] = s;
        }
        const it = items[k], cx = s.firstChild.getContext('2d');
        cx.clearRect(0, 0, 96, 96);
        const icon = it.icon || (ITEMS[it.id] && ITEMS[it.id].icon);
        if (typeof icon === 'function') { cx.save(); icon(cx, 96, 96); cx.restore(); }
        else { // generic glyph: a tag with the initial
          cx.fillStyle = '#3a4a86'; cx.beginPath(); cx.roundRect(14, 14, 68, 68, 12); cx.fill();
          cx.fillStyle = '#ffd21f'; cx.font = 'bold 38px "Trebuchet MS", sans-serif'; cx.textAlign = 'center'; cx.textBaseline = 'middle';
          cx.fillText((it.name || it.id || '?')[0].toUpperCase(), 48, 50);
        }
        s.lastChild.textContent = it.name || (ITEMS[it.id] && ITEMS[it.id].name) || it.id;
        inv.row.append(s);
      }
      if (!items.length) { const e = document.createElement('div'); e.className = 'empty'; e.textContent = 'Nothing in your pockets.'; inv.row.append(e); }
      inv.el.classList.remove('off');
      invPaint();
      return { close: () => { if (inv.spec === spec) U.inventoryPanel(null); } };
    },

    reset() { // back to a clean screen (title, quit)
      popup.clear(); U.card(null); U.prompt(null); objective(null); say.reset(); bark.clear(); U.letterbox(false);
      U.swapIndicator(null); U.inventoryPanel(null); hud.hide(true);
      U.chipView(false); U.signal(null); U.meter(null, null); takeT = 0; takeEl.classList.remove('on');
      tcTok++; fadeTo(flashEl, 0, 0); fadeTo(tcard, 0, 0); fadeTo(acard, 0, 0); fadeTo(timeEl, 0, 0);
    },
    init() { on('render', popup.render); popup.prewarm(16); on('flow:stop', () => bark.clear()); },

    update(dt) {
      for (let i = tweens.length - 1; i >= 0; i--) {
        const w = tweens[i];
        w.t += dt;
        const k = Math.min(1, w.t / w.dur);
        w.el._o = w.a + (w.b - w.a) * k; w.el.style.opacity = w.el._o;
        if (k >= 1) { tweens.splice(i, 1); w.res(); }
      }
      if (toastT > 0 && (toastT -= dt) <= 0) toastEl.classList.remove('show');
      if (takeT > 0 && (takeT -= dt) <= 0) takeEl.classList.remove('on');
      // the touch CHIP button exists only while Chase (2040) is the one you're playing (and his chip is allowed)
      const cp = state.active === 'chase40' && typeof flow !== 'undefined' && flow.roaming === true &&
        !(typeof chip !== 'undefined' && chip && (chip.allowed === false || chip.forced === true));
      if (cp !== chipable) { chipable = cp; document.body.classList.toggle('chipable', cp); }
      objective.update();
      hud.update(dt);
      bark.update(dt);
      if (inv.spec) { invUpdate(dt); return; }
      say.update(dt);
      popup.update(dt);
    },
  };

  function invPaint() {
    const items = inv.spec.items || [], it = items[inv.sel];
    for (let k = 0; k < items.length; k++) {
      inv.slots[k].classList.toggle('sel', k === inv.sel);
      inv.slots[k].classList.toggle('pick', k === inv.first && inv.mode === 'combine');
    }
    for (let k = 0; k < 3; k++) inv.acts[k].classList.toggle('sel', inv.mode === 'acts' && k === inv.act);
    inv.acts[0].parentNode.classList.toggle('dim', inv.mode !== 'acts');
    if (!it) { inv.desc.textContent = ''; return; }
    const def = ITEMS[it.id] || {};
    inv.desc.textContent = inv.mode === 'combine' ? `Combine ${items[inv.first].name} with… ${inv.first === inv.sel ? '' : it.name}` : (def.desc || it.name);
  }
  function invDo() {
    const s = inv.spec, items = s.items, id = items[inv.sel] && items[inv.sel].id;
    if (inv.mode === 'combine') { const a = items[inv.first].id; U.inventoryPanel(null); s.onCombine && s.onCombine(a, id); return; }
    if (!id) return;
    if (inv.act === 2) { if (items.length < 2) { U.sfx('clunk'); return; } inv.mode = 'combine'; inv.first = inv.sel; inv.sel = (inv.sel + 1) % items.length; invPaint(); return; }
    U.inventoryPanel(null);
    if (inv.act === 0) s.onExamine && s.onExamine(id); else s.onUse && s.onUse(id);
  }
  inv.acts.forEach((b, k) => b.addEventListener('click', () => { if (!inv.spec || !(inv.spec.items || []).length) return; if (inv.mode === 'combine') inv.mode = 'acts'; inv.act = k; invDo(); }));
  function invClose() { const s = inv.spec; U.inventoryPanel(null); s.onClose && s.onClose(); }
  function invUpdate(dt) {
    const s = inv.spec, n = (s.items || []).length, close = invClose;   // (no closure per tick)
    if (TEST.auto && (inv.t += dt) > 0.5) return close();
    const L = input.pressed('left') || input.pressed('up'), R = input.pressed('right') || input.pressed('down');
    input.consume('left'); input.consume('right'); input.consume('up'); input.consume('down');
    if (input.pressed('inventory')) { input.consume('inventory'); return close(); }
    let changed = L || R;
    if (inv.mode === 'acts') {
      if (L) inv.act = (inv.act + 2) % 3; if (R) inv.act = (inv.act + 1) % 3;
    } else if (n) {
      const d = L ? -1 : R ? 1 : 0;
      if (d) { inv.sel = (inv.sel + d + n) % n; if (inv.mode === 'combine' && inv.sel === inv.first) inv.sel = (inv.sel + d + n) % n; }
    }
    if (input.pressed('yes')) {
      input.consume('yes'); changed = true;
      if (inv.mode === 'items') { if (n) inv.mode = 'acts'; } else if (inv.mode === 'acts' || inv.sel !== inv.first) { invDo(); if (!inv.spec) return; }
    } else if (input.pressed('no')) {
      input.consume('no'); changed = true;
      if (inv.mode === 'items') return close();
      if (inv.mode === 'combine') { inv.mode = 'acts'; inv.sel = inv.first; } else inv.mode = 'items';
    }
    if (changed) invPaint();
  }
  return U;
})();

// ------------------------------------------------------------ dialogue: say / choose / ask
const { say, choose, ask } = (() => {
  const box = document.getElementById('dlg'), face = box.querySelector('.face'), nameEl = box.querySelector('.who span'), tagEl = box.querySelector('.who i');
  const txt = box.querySelector('.txt'), optsEl = box.querySelector('.opts'), more = box.querySelector('.more');
  const node = document.createTextNode(''); txt.append(node);
  const btns = [];
  const D = { mode: null, res: null, id: '', faceId: null, text: '', len: 0, i: 0, acc: 0, cps: 48, beats: [], bi: 0, pause: 0, typing: false,
    n: 0, fast: false, q: false, censor: false, cwait: false, auto: 0, after: 0, talk: [], sel: 0, n2: 0, dis: [], opt: null, shown: false, hide: 0,
    framed: true, keep: -1 };
  // The box lingers 0.07 s after a line in case another line (or a choice) follows. A slow frame runs several ticks
  // before the awaiting code gets to call choose(), so it never hides before a frame has been drawn since the line
  // ended (framed), and a choose() within KEEP s of a line keeps that line (the question) above its options.
  const KEEP = 0.3;
  on('render', () => { D.framed = true; });

  let glitchT = 0;
  const talk = (on) => { if (typeof world !== 'undefined' && world.talk) for (let k = 0; k < D.talk.length; k++) world.talk(D.talk[k], on); };
  const blip = (rising) => { if (typeof AUDIO !== 'undefined') AUDIO.blip(D.id, rising); };
  function showBox() {
    D.hide = 0;
    if (D.shown) return;
    D.shown = true; box.classList.remove('off'); box.parentNode.classList.add('talking');
    if (typeof AUDIO !== 'undefined') AUDIO.duck(true);
  }
  function hideBox() {
    if (!D.shown) return;
    D.shown = false; box.classList.add('off'); box.parentNode.classList.remove('talking'); optsEl.classList.add('off'); more.classList.add('off');
    if (typeof AUDIO !== 'undefined') AUDIO.duck(false);
  }
  function finish(v) { // resolve the current request; the box lingers a few ticks in case another line follows
    const r = D.res;
    if (D.mode === 'say') D.keep = clock.t + KEEP;
    D.mode = null; D.res = null; D.hide = 0; D.cwait = false; D.framed = false;
    more.classList.add('off'); optsEl.classList.add('off');
    if (r) r(v);
  }
  function header(id, opts) {
    const ch = CHARACTERS[id];
    nameEl.textContent = opts.name || (ch && ch.name) || String(id).toUpperCase();
    tagEl.textContent = opts.tag || '';
    box.classList.remove('noname', 'notext');
    const fid = opts.actor || id;   // opts.actor: a generic speaker ('passenger') with this actor's face (and mouth)
    if (opts.portrait === false) box.classList.add('noface');
    else { box.classList.remove('noface'); if (D.faceId !== fid) { face.src = portraitURL(fid); D.faceId = fid; } }
  }
  function opts(labels, askMode, dis) {
    optsEl.classList.toggle('ask', askMode);
    optsEl.textContent = '';
    for (let k = 0; k < labels.length; k++) {
      let b = btns[k];
      if (!b) {
        b = btns[k] = document.createElement('button'); b._k = k;
        b.addEventListener('click', () => { if (D.mode === 'choose') pick(b._k); else if (D.mode === 'ask') answer(b._k === 0); });
        b.addEventListener('pointerenter', () => { if (D.mode === 'choose') { D.sel = b._k; mark(); } });
      }
      b.textContent = labels[k];
      b.classList.toggle('dis', dis.includes(k));
      optsEl.append(b);
    }
    D.n2 = labels.length;
    optsEl.classList.remove('off');
    mark();
  }
  const mark = () => { for (let k = 0; k < D.n2; k++) btns[k].classList.toggle('sel', D.mode === 'choose' && k === D.sel); };

  function say(id, text, o = {}) {
    if (ui.skipping()) return Promise.resolve();
    text = String(text ?? '');
    if (D.res) finish();
    return new Promise((res) => {
      showBox(); header(id, o);
      // '^' = a beat: pause CONFIG.beat there, render nothing, collapse the doubled space
      let out = ''; const beats = [];
      for (let k = 0; k < text.length; k++) {
        const c = text[k];
        if (c === '^') { if (text[k + 1] === ' ' && (out === '' || out.endsWith(' '))) k++; beats.push(out.length); continue; }
        out += c;
      }
      const sp = o.speed || 'normal';
      Object.assign(D, { mode: 'say', res, id, text: out, beats, bi: 0, i: 0, acc: 0, pause: 0, typing: true, n: 0, after: 0, cwait: false,
        cps: CONFIG.text[sp] * CONFIG.text[options.textSpeed] / CONFIG.text.normal, fast: sp === 'fast' || options.textSpeed === 'fast',
        q: /\?[\s…—"')]*$/.test(out), censor: o.censor || false, auto: o.auto || 0 });
      // censor: true | 'pop-up text'. A line already written up to the cut (ends in —) is typed in full.
      D.len = D.censor && !/—$/.test(out) ? Math.max(1, Math.floor(out.length * 0.75)) : out.length;
      D.talk = o.actor ? [o.actor] : speakerActors(id);   // 'manager' moves luka40's mouth; duets move both
      node.data = ''; optsEl.classList.add('off'); more.classList.add('off');
      talk(true);
    });
  }
  function typed() {
    D.typing = false; talk(false); D.after = 0;
    if (!D.censor) { more.classList.remove('off'); return; }
    // the swearing censor: JARVIS slams a pop-up over the speaker's face
    state.flags.seen_swearing = true;
    const who = D.talk[0], hasActor = typeof world !== 'undefined' && world.actor && world.actor(who);
    const p = popup({ msg: typeof D.censor === 'string' ? D.censor : 'Language detected. This interaction has been flagged for coaching.', icon: 'warn', buttons: ['OK'], at: hasActor ? { actor: who } : 'center', shake: true });
    D.cwait = true;
    const res = D.res, done = () => { if (D.res === res && D.cwait) finish(); };
    p.done.then(done);
    if (typeof cam !== 'undefined' && cam.cutscene) wait(1.2).then(done);
  }
  function step(dt) { // typewriter: appends to one text node
    if (D.pause > 0) { if ((D.pause -= dt) <= 0) talk(true); return; }
    D.acc += dt * D.cps;
    while (D.acc >= 1 && D.i < D.len) {
      if (D.bi < D.beats.length && D.beats[D.bi] === D.i) { D.bi++; D.pause = CONFIG.beat; D.acc = 0; talk(false); return; }
      const c = D.text.charCodeAt(D.i);
      node.appendData(D.text[D.i]); D.i++; D.acc -= 1;
      const letter = (c >= 48 && c <= 57) || (c >= 65 && c <= 90) || (c >= 97 && c <= 122) || (c >= 192 && c < 0x2000);
      if (letter && (!D.fast || (D.n++ & 1) === 0)) blip(D.q && D.i > D.len - 6);
    }
    if (D.i >= D.len) typed();
  }
  function pick(k) {
    if (D.dis.includes(k)) { ui.sfx('clunk'); return; }
    finish(k);
  }
  function answer(v) {
    if ((v && D.opt.yesDisabled) || (!v && D.opt.noDisabled)) { ui.sfx('clunk'); return; }
    finish(v);
  }
  const autoPick = () => { const t = D.opt.test; if (t != null && !D.dis.includes(t)) return t; for (let k = 0; k < D.n2; k++) if (!D.dis.includes(k)) return k; return 0; };
  const autoAnswer = () => { let v = D.opt.test ?? true; if (v && D.opt.yesDisabled) v = false; else if (!v && D.opt.noDisabled) v = true; return v; };

  // choose(labels, { disabled, test, prompt, who, name, tag, portrait }): prompt = the question, shown with the options
  // (who = its speaker: name + portrait, else a plain line like ask's); without a prompt the line just said stays up.
  function choose(labels, o = {}) {
    if (D.res) finish();
    D.opt = o; D.dis = o.disabled || []; D.n2 = labels.length;
    if (ui.skipping()) return Promise.resolve(autoPick());
    return new Promise((res) => {
      if (o.prompt != null && o.prompt !== '') {
        if (o.who) header(o.who, o); else { box.classList.add('noname', 'noface'); D.faceId = null; }
        box.classList.remove('notext');
        node.data = String(o.prompt).replace(/ ?\^ ?/g, ' ').trim();   // a beat means nothing in a question shown whole
      } else if (!D.shown && !(clock.t <= D.keep)) { node.data = ''; box.classList.add('noname', 'noface', 'notext'); D.faceId = null; }
      D.keep = -1;
      showBox(); more.classList.add('off');
      D.mode = 'choose'; D.res = res; D.after = 0;
      D.sel = 0; while (D.sel < labels.length - 1 && D.dis.includes(D.sel)) D.sel++;
      opts(labels, false, D.dis);
    });
  }
  function ask(question, o = {}) {
    if (D.res) finish();
    D.opt = o; D.dis = []; D.n2 = 2;
    if (ui.skipping()) return Promise.resolve(autoAnswer());
    return new Promise((res) => {
      showBox(); more.classList.add('off'); D.keep = -1;
      box.classList.add('noname', 'noface'); box.classList.remove('notext'); D.faceId = null;
      node.data = question;
      D.mode = 'ask'; D.res = res; D.after = 0;
      const dis = []; if (o.yesDisabled) dis.push(0); if (o.noDisabled) dis.push(1);
      opts(['YES', 'NO'], true, dis);
    });
  }

  // 3.3's reveal: the label (and portrait) on screen switch from one speaker to another with a one-frame glitch.
  // Later say(toId) lines simply show toId's own name (CHARACTERS[toId].name).
  say.glitch = (fromId, toId) => {
    const ch = CHARACTERS[toId];
    if (!D.shown) { D.faceId = null; return; }
    nameEl.textContent = (ch && ch.name) || String(toId).toUpperCase(); tagEl.textContent = '';   // (the filter drops away)
    if (!box.classList.contains('noface')) { face.src = portraitURL(toId); D.faceId = toId; }
    box.classList.add('glitch'); glitchT = 0.02; // one or two frames at 60 Hz (game time, so it pauses)
    ui.sfx('glitch', { vol: 0.5 });
  };
  say.busy = () => D.mode !== null && !D.cwait;
  say.reset = () => { D.mode = null; D.res = null; D.cwait = false; D.keep = -1; talk(false); hideBox(); glitchT = 0; box.classList.remove('glitch'); };
  say.update = (dt) => {
    if (glitchT > 0 && (glitchT -= dt) <= 0) box.classList.remove('glitch');
    if (D.mode === null) { if (D.shown && (D.hide += dt) > 0.07 && D.framed) hideBox(); return; }
    const skip = ui.skipping();
    if (D.mode === 'say') {
      if (skip) { talk(false); return finish(); }
      if (D.typing) {
        if (input.pressed('yes')) { input.consume('yes'); node.data = D.text.slice(0, D.len); D.i = D.len; D.bi = D.beats.length; D.pause = 0; typed(); }
        else step(dt);
        return;
      }
      if (D.cwait) return; // the censor pop-up owns YES now
      D.after += dt;
      if ((D.auto > 0 && D.after >= D.auto) || (TEST.auto && D.after >= 0.15)) return finish();
      if (input.pressed('yes')) { input.consume('yes'); finish(); }
      return;
    }
    D.after += dt;
    if (D.mode === 'choose') {
      if (skip || (TEST.auto && D.after >= 0.3)) return finish(autoPick());
      if (input.pressed('up')) { input.consume('up'); D.sel = (D.sel - 1 + D.n2) % D.n2; mark(); }
      if (input.pressed('down')) { input.consume('down'); D.sel = (D.sel + 1) % D.n2; mark(); }
      if (input.pressed('yes')) { input.consume('yes'); pick(D.sel); }
    } else if (D.mode === 'ask') {
      if (skip || (TEST.auto && D.after >= 0.3)) return finish(autoAnswer());
      if (input.pressed('yes')) { input.consume('yes'); answer(true); }
      else if (input.pressed('no')) { input.consume('no'); answer(false); }
    }
  };
  return { say, choose, ask };
})();

// ------------------------------------------------------------ barks: lines over gameplay that never pause it
// bark(id, text, o) -> Promise (resolves when the line has been read): a corner box with portrait, name, tag and text
// for the boss, the scooter chase and drones in stealth. Its own queue and typewriter on game time: it never touches the
// dialogue box, never takes YES, never ducks the music and never makes say.busy() true, so pop-ups keep their input.
// o: { name, tag, portrait: false, speed: 'slow'|'normal'|'fast', hold (s after typing), now (drop the queue, speak now) }.
// Skipping (or a scene change) resolves and drops every bark.
const bark = (() => {
  const box = document.getElementById('bark'), face = box.querySelector('.face'), nameEl = box.querySelector('.who span'), tagEl = box.querySelector('.who i');
  const node = document.createTextNode(''); box.querySelector('.txt').append(node);
  const q = [];
  let cur = null, shown = false, faceId = null, linger = 0;
  const B = { text: '', len: 0, i: 0, acc: 0, cps: 48, beats: [], bi: 0, pause: 0, typing: false, hold: 0, t: 0, n: 0, fast: false, q: false, talk: [] };
  const talk = (on) => { if (typeof world !== 'undefined' && world.talk) for (let k = 0; k < B.talk.length; k++) world.talk(B.talk[k], on); };
  const sceneNow = () => (typeof flow !== 'undefined' ? flow.sceneId : null);

  function bark(id, text, o = {}) {
    if (ui.skipping()) return Promise.resolve();
    return new Promise((res) => {
      if (o.now) bark.clear();
      q.push({ id, text: String(text ?? ''), o, res, scene: sceneNow() });
    });
  }
  function begin(r) {
    cur = r;
    const o = r.o, ch = CHARACTERS[r.id];
    nameEl.textContent = o.name || (ch && ch.name) || String(r.id).toUpperCase();
    tagEl.textContent = o.tag || '';
    const fid = o.actor || r.id;
    if (o.portrait === false) box.classList.add('noface');
    else { box.classList.remove('noface'); if (faceId !== fid) { face.src = portraitURL(fid); faceId = fid; } }
    let out = ''; const beats = [];   // '^' = a beat, as in say()
    for (let k = 0; k < r.text.length; k++) {
      const c = r.text[k];
      if (c === '^') { if (r.text[k + 1] === ' ' && (out === '' || out.endsWith(' '))) k++; beats.push(out.length); continue; }
      out += c;
    }
    const sp = o.speed || 'normal';
    B.text = out; B.len = out.length; B.beats = beats; B.bi = 0; B.i = 0; B.acc = 0; B.pause = 0; B.typing = true; B.t = 0; B.n = 0;
    B.cps = CONFIG.text[sp] * CONFIG.text[options.textSpeed] / CONFIG.text.normal; B.fast = sp === 'fast' || options.textSpeed === 'fast';
    B.q = /\?[\s…—"')]*$/.test(out);
    B.hold = o.hold ?? Math.min(4, 1.2 + out.length * 0.03);
    if (TEST.auto) B.hold = Math.min(B.hold, 0.5);
    B.talk = o.actor ? [o.actor] : speakerActors(r.id);
    node.data = '';
    if (!shown) { shown = true; box.classList.add('on'); }
    talk(true);
  }
  function end() {
    const r = cur; cur = null; talk(false); linger = 0.25;
    if (r) r.res();
  }
  bark.update = (dt) => {
    if (!cur && !q.length) { if (shown && (linger -= dt) <= 0) { shown = false; box.classList.remove('on'); } return; }
    if (ui.skipping()) { bark.clear(); return; }
    const sc = sceneNow();
    if (cur && cur.scene !== sc) { bark.clear(); return; }   // the scene moved on under it
    if (!cur) { const r = q.shift(); if (r.scene !== sc) { r.res(); return; } begin(r); }
    if (B.typing) {
      if (B.pause > 0) { if ((B.pause -= dt) <= 0) talk(true); return; }
      B.acc += dt * B.cps;
      while (B.acc >= 1 && B.i < B.len) {
        if (B.bi < B.beats.length && B.beats[B.bi] === B.i) { B.bi++; B.pause = CONFIG.beat; B.acc = 0; talk(false); return; }
        const c = B.text.charCodeAt(B.i);
        node.appendData(B.text[B.i]); B.i++; B.acc -= 1;
        const letter = (c >= 48 && c <= 57) || (c >= 65 && c <= 90) || (c >= 97 && c <= 122) || (c >= 192 && c < 0x2000);
        if (letter && (!B.fast || (B.n++ & 1) === 0) && typeof AUDIO !== 'undefined') AUDIO.blip(cur.id, B.q && B.i > B.len - 6);
      }
      if (B.i >= B.len) { B.typing = false; talk(false); }
      return;
    }
    if ((B.t += dt) >= B.hold) end();
  };
  bark.clear = () => {
    const r = cur; cur = null; talk(false);
    if (r) r.res();
    while (q.length) q.shift().res();
    if (shown) { shown = false; box.classList.remove('on'); }
  };
  bark.busy = () => !!cur || q.length > 0;
  return bark;
})();

// ------------------------------------------------------------ JARVIS (2026) + SafeSense (2040) pop-ups (pooled DOM)
// popup(spec) -> { el, done, close, progress(v), setMsg(text), moon(on) }. spec.style: 'jarvis' (default: Rue's grey window,
// blue bar, square buttons, ding) | 'safesense' (rounded translucent glass, blue glow, pill buttons, the two-note chirp).
// spec.emptySlot: an inert button-shaped gap where NO should be. spec.note: small text under the message. spec.moon: the
// Do Not Disturb moon. spec.at may also be { pos: [x, y, z] }: pinned to a world point (screens, the glass wall, Chip View).
const popup = (() => {
  const layer = document.getElementById('pops');
  const pool = [], live = [], v3 = new THREE.Vector3();
  let seq = 0;
  const HTML = '<div class="jv"><div class="jv-bar"><span class="jv-logo">JARVIS</span><span class="jv-t"></span><i class="jv-moon"></i><i class="jv-x">&times;</i></div>' +
    '<div class="jv-body"><div class="ic"></div><div class="jv-msg"></div></div><div class="jv-note"></div><div class="jv-spin"></div>' +
    '<div class="jv-prog"><div><i></i></div><span></span></div><div class="jv-btns"></div></div>';

  function make() {
    const w = document.createElement('div'); w.className = 'jvw off'; w.innerHTML = HTML;
    const q = (s) => w.querySelector(s);
    const p = { w, box: w.firstChild, logo: q('.jv-logo'), title: q('.jv-t'), ic: q('.ic'), msg: q('.jv-msg'), note: q('.jv-note'), spin: q('.jv-spin'), prog: q('.jv-prog'), bar: q('.jv-prog i'),
      pct: q('.jv-prog span'), btns: q('.jv-btns'), bs: [], slot: null, open: false, tok: 0, spec: null, res: null, age: 0, life: 0, n: 0, focus: 0, tickT: 0,
      pr: null, prT: 0, actor: null, wpos: null, hasPos: false, vis: true, stack: false, z: 0, px: 0, py: 0 };
    layer.append(w);
    return p;
  }
  function button(p, k) {
    let b = p.bs[k];
    if (b) return b;
    b = p.bs[k] = document.createElement('button'); b.className = 'jv-b'; b._k = k;
    b.addEventListener('click', () => { if (p.open) close(p, b._k); });
    b.addEventListener('pointerenter', (e) => {
      if (!p.open) return;
      focus(p, b._k);
      if (runs(p, b)) { const r = b.getBoundingClientRect(); dodge(b, e.clientX < r.left + r.width / 2 ? 60 : -60); }
    });
    return b;
  }
  const runs = (p, b) => !!p.spec.dodge && p.spec.dodge.includes(b._k) && b._d < 2;
  function dodge(b, dx) { // run away 60 px from the pointer (or from YES), twice, then give up
    b._d++;
    if (Math.abs(b._x + dx) > 130) dx = -dx;
    b._x += dx; b._y = b._d === 1 ? -14 : 10;
    b.style.transform = `translate(${b._x}px,${b._y}px)`;
  }
  const focus = (p, k) => { p.focus = k; for (let i = 0; i < p.n; i++) p.bs[i].classList.toggle('foc', i === k); };
  const place = (p, x, y) => { p.w.style.transform = `translate(${x}px,${y}px) translate(-50%,-50%)`; };
  function setProg(p, v) { p.bar.style.transform = `scaleX(${Math.max(0, Math.min(1, v / 100))})`; p.pct.textContent = Math.round(v) + '%'; }
  function track(p) {
    if (typeof cam === 'undefined') return;
    if (p.hasPos) v3.copy(p.wpos);
    else {
      if (typeof world === 'undefined' || !world.actor) return;
      const a = world.actor(p.actor);
      if (!a) return;
      a.headPos(v3);
    }
    const s = cam.project(v3);
    if (!s) return;
    const vis = s.visible !== false;
    if (p.hasPos && vis !== p.vis) { p.vis = vis; p.w.style.visibility = vis ? '' : 'hidden'; }   // a world point behind the lens: hide
    if (vis && (Math.abs(s.x - p.px) > 0.4 || Math.abs(s.y - p.py) > 0.4)) { p.px = s.x; p.py = s.y; place(p, s.x, s.y); }   // restyle only when it moved
  }
  function close(p, i) {
    if (!p.open) return;
    p.open = false; p.tok++;
    p.w.classList.add('off');
    live.splice(live.indexOf(p), 1); pool.push(p);
    p.res(i);
  }

  function popup(spec) {
    const s = spec || {}, p = pool.pop() || make(), ss = s.style === 'safesense';
    p.open = true; p.spec = s; p.age = 0; p.life = s.dur || 0; p.tickT = 0;
    p.box.className = 'jv' + (ss ? ' ss' : '') + (s.shake ? ' shake' : '') + (s.moon ? ' moon' : '') + (s.cls ? ' ' + s.cls : '');
    p.box.style.width = s.w ? s.w + 'px' : '';
    p.logo.textContent = ss ? 'SafeSense' : 'JARVIS';   // the pool reuses windows across styles
    const t = s.title ?? (ss ? 'SafeSense' : 'JARVIS');
    p.title.textContent = t === 'JARVIS' || t === 'SafeSense' ? '' : t;
    const icon = s.icon || (ss ? 'none' : 'warn');
    p.ic.className = 'ic ' + icon;
    p.ic.textContent = icon === 'error' ? '✕' : icon === 'info' ? 'i' : icon === 'warn' ? '!' : '';
    p.msg.textContent = s.msg || '';
    p.note.textContent = s.note || '';
    p.spin.classList.toggle('off', !s.spinner);
    p.pr = null; p.prog.classList.add('off');
    if (s.progress) {
      let { from = 0, to = 100, dur = 1 } = s.progress;
      if (from <= 1 && to <= 1) { from *= 100; to *= 100; }
      p.pr = { from, to, dur }; p.prT = 0; setProg(p, from); p.prog.classList.remove('off');
    }
    const labels = s.buttons || ['OK'];
    p.btns.textContent = ''; p.n = labels.length;
    for (let k = 0; k < labels.length; k++) {
      const b = button(p, k);
      b.textContent = labels[k]; b._d = 0; b._x = 0; b._y = 0; b.style.transform = '';
      p.btns.append(b);
    }
    if (s.emptySlot) { if (!p.slot) { p.slot = document.createElement('span'); p.slot.className = 'ss-slot'; } p.btns.append(p.slot); }   // where NO should be
    if (p.n) focus(p, 0);
    // position: centre (stacked +18 px per open unanchored pop-up), [x%, y%], over an actor's head, or pinned to a world point
    p.actor = null; p.hasPos = false; p.stack = false;
    if (!p.vis) { p.vis = true; p.w.style.visibility = ''; }
    let x = innerWidth / 2, y = innerHeight / 2;
    const at = s.at;
    if (Array.isArray(at)) { const k = at[0] <= 1 && at[1] <= 1 ? 1 : 0.01; x = at[0] * k * innerWidth; y = at[1] * k * innerHeight; }
    else if (at && at.actor) p.actor = at.actor;
    else if (at && at.pos) { (p.wpos || (p.wpos = new THREE.Vector3())).set(at.pos[0], at.pos[1], at.pos[2]); p.hasPos = true; }
    else if (at !== 'center') {
      let n = 0; for (let i = 0; i < live.length; i++) if (live[i].stack) n++;
      x += (n % 14) * 18; y += (n % 14) * 18; p.stack = true;
    }
    place(p, x, y); p.px = x; p.py = y;
    p.z = (s.z || 0) * 10000 + (++seq);
    p.w.style.zIndex = p.z;
    live.push(p);
    p.w.classList.remove('off'); // un-hiding restarts the CSS pop/shake animation
    if (p.actor || p.hasPos) track(p);
    if (s.ding !== false) ui.sfx(ss ? 'ss_chirp' : 'ding');
    const tok = p.tok;
    const done = new Promise((r) => { p.res = r; });
    return {
      el: p.w, done,
      close: () => { if (p.tok === tok) close(p, -1); },
      progress: (pct) => { if (p.tok !== tok) return; p.pr = null; p.prog.classList.remove('off'); setProg(p, pct); },   // drive the bar yourself (percent)
      setMsg: (m) => { if (p.tok === tok) p.msg.textContent = m; },
      moon: (on) => { if (p.tok === tok) p.box.classList.toggle('moon', on !== false); },
    };
  }

  const autoK = (p) => { let k = 0; while (k < p.n - 1 && p.spec.dodge && p.spec.dodge.includes(k)) k++; return k; };   // the first button that doesn't run away
  // clear(): every pop-up closes with -1, except while a cutscene is being skipped (flow.skip): one with buttons then
  // answers as autoplay would, so a skipped { popup, wait } branches exactly as a played one
  popup.clear = () => { const sk = ui.skipping(); while (live.length) { const p = live[live.length - 1]; close(p, sk && p.n ? autoK(p) : -1); } };
  popup.count = () => live.length;
  popup.prewarm = (n) => { for (let i = pool.length + live.length; i < n; i++) pool.push(make()); };   // build the DOM behind the loader, not mid-storm
  popup.update = (dt) => {
    const skip = ui.skipping();
    let top = null;
    for (let i = live.length - 1; i >= 0; i--) {
      const p = live[i];
      p.age += dt;
      if (p.pr) { p.prT += dt; const k = p.pr.dur > 0 ? Math.min(1, p.prT / p.pr.dur) : 1; if (k < 1 || p.prT - dt < p.pr.dur) setProg(p, p.pr.from + (p.pr.to - p.pr.from) * k); }
      if (p.spec.spinner && (p.tickT += dt) >= 1) { p.tickT -= 1; ui.sfx('tick', { vol: 0.3 }); }
      if (p.life > 0 && p.age >= p.life) { close(p, -1); continue; }
      if (p.n && (skip || (TEST.auto && p.age >= 0.3))) { close(p, autoK(p)); continue; }   // autoplay presses the first button that doesn't run away
      if (p.n && (!top || p.z > top.z)) top = p;
    }
    if (!top || say.busy()) return;
    if (input.pressed('yes')) { // keys / pad / touch YES: a runaway button runs from YES too
      input.consume('yes'); const b = top.bs[top.focus];
      if (runs(top, b)) dodge(b, -60); else close(top, top.focus);
    } else if (top.n > 1 && (input.pressed('left') || input.pressed('right'))) {
      const d = input.pressed('right') ? 1 : -1; input.consume('left'); input.consume('right');
      focus(top, (top.focus + d + top.n) % top.n);
    } else if (input.pressed('no') && !(typeof flow !== 'undefined' && flow.cutscene)) { // NO answers a [NO] / [Cancel] button (in cutscenes NO fast-forwards)
      for (let k = 0; k < top.n; k++) { const t = top.bs[k].textContent; if (t === 'NO' || t === 'Cancel') { input.consume('no'); close(top, k); break; } }
    }
  };
  popup.render = () => { for (let i = 0; i < live.length; i++) if (live[i].actor || live[i].hasPos) track(live[i]); };
  return popup;
})();

// ------------------------------------------------------------ HUD (top right pill) + HACK % (centre top)
// The model lives in the saved state; a falsy / null part is hidden:
//   state.noService: true      the signal icon + NO SERVICE (once bars > 0 it reads "Optus": they're home)
//   state.quiet: 'hh:mm:ss'    QUIET IN hh:mm:ss (story time; hud.quiet() also takes seconds for the boss's countdown)
//   state.bars: 0..4           the signal icon's bars (the endings fill it to four)
//   state.hud.samples: true (live count of state.samples) | n | false      Samples: n
//   state.hud.hack: true + state.hack 0..100                               the big HACK % bar
// hud.set(null) clears it all; hud.set({ noService, quiet, samples, bars, hack }) changes only the keys given
// (Rue's `battery` is accepted and not drawn). hud.hide() hides both without touching the model; hud.show() brings
// them back; hud.refresh() re-reads the state. Every setter is safe to call per tick (the DOM is written on change).
const hud = (() => {
  const el = document.getElementById('hud'), sig = el.children[0], qt = el.children[1], sm = el.children[2];
  const barEls = sig.querySelectorAll('.bars i'), ns = sig.querySelector('.ns'), qtB = qt.querySelector('b'), smB = sm.querySelector('b');
  const hackEl = document.getElementById('hack'), hackPct = hackEl.querySelector('.hd span'), hackBar = hackEl.querySelector('.bar i');
  const anims = [];
  let hidden = false, shownN = -1, qSec = -1, hackI = -1, hackR = -1, hackK = '';
  const X = () => { let h = state.hud; if (!h || typeof h !== 'object') h = state.hud = { samples: false, hack: false }; return h; };
  const two = (n) => (n < 10 ? '0' : '') + n;
  const fmt = (q) => { if (q == null || q === false) return null; if (typeof q !== 'number') return String(q); q = Math.max(0, Math.round(q)); return two(Math.floor(q / 3600)) + ':' + two(Math.floor(q / 60) % 60) + ':' + two(q % 60); };
  const sampOn = (v) => v === true || typeof v === 'number';
  const count = (x) => (typeof x.samples === 'number' ? x.samples : state.samples ? state.samples.length : 0);
  function render() {
    const x = X(), b = state.bars || 0;
    const s1 = !!state.noService || state.bars != null, s2 = state.quiet != null, s3 = sampOn(x.samples);
    el.classList.toggle('off', hidden || !(s1 || s2 || s3));
    sig.classList.toggle('off', !s1); qt.classList.toggle('off', !s2); sm.classList.toggle('off', !s3);
    sig.classList.add('lead'); qt.classList.toggle('lead', !s1); sm.classList.toggle('lead', !s1 && !s2);   // no separator before the first part
    for (let k = 0; k < 4; k++) barEls[k].classList.toggle('on', k < b);
    ns.textContent = b > 0 ? 'Optus' : 'NO SERVICE'; ns.classList.toggle('ok', b > 0); ns.classList.toggle('off', !state.noService && !(b > 0));
    qtB.textContent = state.quiet || '';
    shownN = count(x); smB.textContent = shownN;
    hackRender(true);
  }
  function hackRender(force) {
    const v = X().hack ? +state.hack || 0 : null;
    if (v == null || hidden) { if (hackI !== -1 || force) { hackI = -1; hackR = -1; hackEl.classList.add('off'); } return; }
    if (hackI === -1) hackEl.classList.remove('off');
    const r = Math.round(Math.max(0, Math.min(100, v)) * 5) / 5, i = Math.floor(r);   // bar in 0.2% steps, label in whole percent
    if (r !== hackR) { hackR = r; hackBar.style.transform = 'scaleX(' + (r / 100).toFixed(3) + ')'; }
    if (i !== hackI) { hackI = i; hackPct.textContent = i + '%'; }
  }
  function settle() { for (let i = 0; i < anims.length; i++) anims[i].res(); anims.length = 0; }
  const setHack = (v) => { const x = X(); if (v == null || v === false) x.hack = false; else { x.hack = true; if (typeof v === 'number') state.hack = v; } };
  return {
    show() { hidden = false; render(); },
    hide(on = true) { hidden = !!on; render(); },
    refresh: () => render(),
    set(v) {
      settle();
      const x = X();
      if (!v) { state.noService = false; state.quiet = null; state.bars = null; state.battery = null; x.samples = false; x.hack = false; }
      else {
        if ('noService' in v) state.noService = !!v.noService;
        if ('quiet' in v) { state.quiet = fmt(v.quiet); qSec = -1; }
        if ('samples' in v) x.samples = sampOn(v.samples) ? v.samples : false;
        if ('bars' in v) state.bars = v.bars == null ? null : Math.max(0, Math.min(4, Math.round(v.bars)));
        if ('hack' in v) setHack(v.hack);
        if ('battery' in v) state.battery = v.battery;   // (Rue's 1987 battery: kept in state, not drawn in TWO)
      }
      hidden = false; render();
    },
    // QUIET IN: 'hh:mm:ss' or seconds (the boss's compressed countdown); null hides it
    quiet(q) {
      if (typeof q === 'number') { const r = Math.max(0, Math.round(q)); if (r === qSec && state.quiet != null) return; qSec = r; } else qSec = -1;
      const f = fmt(q);
      if (f === state.quiet) return;
      const was = state.quiet != null; state.quiet = f;
      if (was && f != null) qtB.textContent = f; else render();
    },
    samples(n) { X().samples = n === undefined ? true : sampOn(n) ? n : false; render(); },   // no argument: the live count
    bars(n) { state.bars = n == null ? null : Math.max(0, Math.min(4, Math.round(n))); render(); },
    noService(on = true) { state.noService = !!on; render(); },
    // the big HACK % bar: pct 0..100 (also written to state.hack), null hides it. o: { stalled, back } (a bug stall / drifting backwards)
    hack(pct, o) {
      setHack(pct == null ? null : +pct);
      const k = o && o.stalled ? 'stall' : o && o.back ? 'back' : '';
      if (k !== hackK) { hackK = k; hackEl.classList.toggle('stall', k === 'stall'); hackEl.classList.toggle('back', k === 'back'); }
      hackRender(false);
    },
    // count bars / hack a whole step at a time: hud.animate({ bars: 4 }, 2). Skipping jumps to the end.
    animate(v, dur = 1) {
      const ps = [];
      if ('hack' in v && v.hack != null) X().hack = true;
      for (const key of ['bars', 'hack']) {
        if (!(key in v) || v[key] == null) continue;
        const to = Math.round(v[key]);
        if (ui.skipping()) { state[key] = to; continue; }
        const from = Math.round(state[key] || 0), n = Math.abs(to - from);
        state[key] = from;
        if (!n) continue;
        ps.push(new Promise((res) => anims.push({ key, to, step: dur / n, t: 0, res })));
      }
      render();
      return Promise.all(ps);
    },
    update(dt) {
      for (let i = anims.length - 1; i >= 0; i--) {
        const a = anims[i];
        a.t += dt;
        while (a.t >= a.step && state[a.key] !== a.to) { a.t -= a.step; state[a.key] += Math.sign(a.to - state[a.key]); render(); }
        if (state[a.key] === a.to) { anims.splice(i, 1); a.res(); }
      }
      const x = state.hud;   // the live sample count (no allocation: compare, then write one text node)
      if (x && x.samples === true && !hidden) { const n = state.samples ? state.samples.length : 0; if (n !== shownN) { shownN = n; smB.textContent = n; } }
    },
  };
})();

// ------------------------------------------------------------ objective (top left)
const objective = (() => {
  const el = document.getElementById('obj');
  let text = null, items = null, hidden = false;
  function render() {
    el.textContent = '';
    if (text == null && !items) { el.classList.add('off'); return; }
    if (text != null) { const d = document.createElement('div'); d.className = 'line'; d.append(text); el.append(d); }
    if (items) for (const it of items) { const d = document.createElement('div'); d.className = 'it' + (it.done ? ' done' : ''); d.textContent = it.text; el.append(d); }
    el.classList.remove('off');
  }
  function objective(t) { text = t ?? null; items = null; render(); }
  objective.list = (arr) => { items = arr && arr.length ? arr : null; render(); };
  objective.update = () => {
    const h = !options.objective || (typeof cam !== 'undefined' && cam.cutscene === true);
    if (h !== hidden) { hidden = h; el.classList.toggle('hide', h); }
  };
  return objective;
})();

// ------------------------------------------------------------ portraits (baked at boot from a 3D bust; painted / silhouette fallback)
// Order: CHARACTERS[id].silhouette (THE MANAGER, FIGURE, VOICE: a silhouette until they're revealed) -> a painted stand-in
// for speakers with no body (Des the kettle, SafeSense, drones, voices down the line; or CHARACTERS[id].portrait) -> a
// baked bust -> a duo (split) -> the actor's look (CHARACTERS[id].actor) -> a live face texture -> a plain silhouette.
const portraitURL = (() => {
  const urls = {}, cvs = {}, sil = {}, S = 128, PI2 = Math.PI * 2;
  const alias = { student: 'student_a', voice: null, operator: null, assistant: null };
  // speakers without a body: a painted portrait (CHARACTERS[id].portrait can name one of these kinds too)
  const PAINT = { des: 'kettle', safesense: 'safesense', drone: 'drone', door_drone: 'drone', lifeguard: 'lifeguard', operator: 'line',
    voicemail: 'line', margaret: 'line', voice1: 'line', voice2: 'line', train: 'pa', hovercar: 'car' };
  const blank = () => { const c = document.createElement('canvas'); c.width = c.height = S; return c; };
  function bg(x, a = '#34437a', b = '#1b2448') {
    const g = x.createLinearGradient(0, 0, 0, S); g.addColorStop(0, a); g.addColorStop(1, b);
    x.fillStyle = g; x.fillRect(0, 0, S, S);
  }
  const arcs = (x, cx, cy, col = '#ffd21f') => { x.strokeStyle = col; x.lineWidth = 4; x.lineCap = 'round'; for (let k = 1; k <= 2; k++) { x.beginPath(); x.arc(cx, cy, 8 * k, -0.9, 0.9); x.stroke(); } };
  function silhouette(id) {
    const c = blank(), x = c.getContext('2d');
    if (id === 'manager') { // hood up, high collar, drones idling round him like fireflies
      bg(x, '#26304f', '#0d1222');
      x.fillStyle = '#05070d';
      x.beginPath(); x.moveTo(64, 20); x.bezierCurveTo(92, 20, 98, 50, 94, 78); x.lineTo(34, 78); x.bezierCurveTo(30, 50, 36, 20, 64, 20); x.fill();   // the hood
      x.beginPath(); x.moveTo(8, 132); x.lineTo(20, 92); x.quadraticCurveTo(40, 72, 64, 74); x.quadraticCurveTo(88, 72, 108, 92); x.lineTo(120, 132); x.fill(); // the coat
      x.fillStyle = '#0b1020'; x.beginPath(); x.ellipse(64, 56, 19, 24, 0, 0, PI2); x.fill();                  // the dark under the hood
      for (const [dx, dy, r] of [[20, 30, 2.4], [104, 22, 2], [112, 60, 2.6], [14, 70, 1.8]]) {
        x.fillStyle = 'rgba(191,230,255,.35)'; x.beginPath(); x.arc(dx, dy, r * 2.6, 0, PI2); x.fill();
        x.fillStyle = '#eaf6ff'; x.beginPath(); x.arc(dx, dy, r, 0, PI2); x.fill();
      }
      return c;
    }
    if (id === 'figure' || id === 'voice') { // a trench coat out of the smoke; a blue chip light behind the right ear
      bg(x, '#4a536c', '#1f2638');
      x.fillStyle = 'rgba(210,214,224,.1)'; for (let i = 0; i < 9; i++) { x.beginPath(); x.ellipse(-6 + i * 17, 112 - (i % 3) * 9 - (i & 1) * 26, 34, 11, 0.2 * (i % 3), 0, PI2); x.fill(); }   // smoke
      x.fillStyle = '#121620';
      x.beginPath(); x.arc(64, 52, 23, 0, PI2); x.fill();
      x.beginPath(); x.moveTo(4, 132); x.lineTo(18, 96); x.lineTo(46, 80); x.lineTo(64, 104); x.lineTo(82, 80); x.lineTo(110, 96); x.lineTo(124, 132); x.fill();   // collar up
      x.fillStyle = 'rgba(143,208,255,.45)'; x.beginPath(); x.arc(41, 58, 7, 0, PI2); x.fill();
      x.fillStyle = '#bfe6ff'; x.beginPath(); x.arc(41, 58, 2.4, 0, PI2); x.fill();
      if (id === 'voice') arcs(x, 96, 40, '#8fd0ff');
      return c;
    }
    bg(x);
    x.fillStyle = '#5d6a99';
    x.beginPath(); x.arc(64, 54, 25, 0, PI2); x.fill();
    x.beginPath(); x.ellipse(64, 132, 48, 44, 0, Math.PI, 0); x.fill();
    if (id === 'operator' || id === 'voice') arcs(x, 92, 40); // a phone line: little sound arcs
    return c;
  }
  function painted(kind, id) {
    const c = blank(), x = c.getContext('2d');
    if (kind === 'kettle') { // Des: a chrome kettle, its little screen glowing DES
      bg(x, '#3a4870', '#18203c');
      const g = x.createLinearGradient(30, 0, 100, 0); g.addColorStop(0, '#7d8896'); g.addColorStop(0.45, '#eef2f6'); g.addColorStop(1, '#6b7684');
      x.fillStyle = g; x.beginPath(); x.moveTo(36, 112); x.lineTo(42, 44); x.quadraticCurveTo(64, 30, 86, 44); x.lineTo(92, 112); x.closePath(); x.fill();
      x.fillStyle = '#2b313b'; x.fillRect(30, 108, 68, 10); x.fillRect(56, 30, 16, 7);
      x.strokeStyle = '#59626e'; x.lineWidth = 7; x.beginPath(); x.moveTo(90, 54); x.quadraticCurveTo(112, 62, 92, 96); x.stroke();      // handle
      x.fillStyle = '#9aa4b0'; x.beginPath(); x.moveTo(40, 60); x.lineTo(20, 48); x.lineTo(22, 56); x.lineTo(40, 72); x.fill();          // spout
      x.fillStyle = '#0d1a2c'; x.fillRect(48, 70, 32, 16);
      x.shadowColor = '#8fd0ff'; x.shadowBlur = 8; x.fillStyle = '#bfe6ff'; x.font = 'bold 11px "Courier New", monospace'; x.textAlign = 'center'; x.fillText('DES', 64, 82); x.shadowBlur = 0;
      return c;
    }
    if (kind === 'safesense') { // a glass pill with a soft blue glow
      bg(x, '#dfeefa', '#9cc4ea');
      x.shadowColor = 'rgba(80,160,255,.9)'; x.shadowBlur = 18;
      x.fillStyle = 'rgba(255,255,255,.88)'; x.beginPath(); x.roundRect(22, 42, 84, 44, 22); x.fill(); x.shadowBlur = 0;
      const g = x.createRadialGradient(46, 60, 2, 50, 64, 16); g.addColorStop(0, '#fff'); g.addColorStop(0.5, '#8fd0ff'); g.addColorStop(1, '#2f86e0');
      x.fillStyle = g; x.beginPath(); x.arc(50, 64, 12, 0, PI2); x.fill();
      x.fillStyle = '#2f86e0'; x.font = 'bold 15px system-ui, sans-serif'; x.textAlign = 'left'; x.fillText('?', 72, 70);
      return c;
    }
    if (kind === 'drone' || kind === 'lifeguard') { // a Courtesy Drone: a white pod with a soft blue light
      bg(x, kind === 'lifeguard' ? '#5aa6d6' : '#2c3a66', kind === 'lifeguard' ? '#1d5a86' : '#141b36');
      const g = x.createLinearGradient(0, 36, 0, 96); g.addColorStop(0, '#ffffff'); g.addColorStop(1, '#c5ccd8');
      x.fillStyle = g; x.beginPath(); x.ellipse(64, 66, 40, 28, 0, 0, PI2); x.fill();
      x.fillStyle = '#d7dde6'; x.fillRect(16, 46, 22, 5); x.fillRect(90, 46, 22, 5);
      x.fillStyle = 'rgba(143,208,255,.5)'; x.beginPath(); x.arc(64, 70, 15, 0, PI2); x.fill();
      x.fillStyle = '#3a9cff'; x.beginPath(); x.arc(64, 70, 8, 0, PI2); x.fill();
      x.fillStyle = '#eaf6ff'; x.beginPath(); x.arc(61, 67, 3, 0, PI2); x.fill();
      if (kind === 'lifeguard') { x.fillStyle = '#e8473c'; x.fillRect(58, 40, 12, 4); x.fillRect(62, 36, 4, 12); }
      return c;
    }
    if (kind === 'pa') { // an announcement speaker
      bg(x, '#3b4a7c', '#1a2346');
      x.fillStyle = '#c9ced8'; x.beginPath(); x.moveTo(30, 52); x.lineTo(54, 52); x.lineTo(84, 30); x.lineTo(84, 98); x.lineTo(54, 76); x.lineTo(30, 76); x.closePath(); x.fill();
      arcs(x, 92, 64);
      return c;
    }
    if (kind === 'car') { // a hover-car, a foot off the road
      bg(x, '#6ab8f6', '#2f6aa8');
      x.fillStyle = '#eef2f6'; x.beginPath(); x.roundRect(18, 52, 92, 30, 14); x.fill();
      x.fillStyle = '#26324a'; x.beginPath(); x.roundRect(36, 40, 52, 22, 10); x.fill();
      x.fillStyle = 'rgba(143,208,255,.7)'; x.fillRect(26, 92, 76, 4);
      return c;
    }
    const s = silhouette(id); arcs(s.getContext('2d'), 92, 40);   // 'line': someone down a phone line
    return s;
  }
  function fromFace(fc) {
    const c = blank(), x = c.getContext('2d');
    bg(x);
    const k = Math.max(S / fc.width, S / fc.height);
    x.drawImage(fc, (S - fc.width * k) / 2, (S - fc.height * k) / 2, fc.width * k, fc.height * k);
    return c;
  }
  const pnt = {};
  function canvasFor(id) {
    const ch = CHARACTERS[id], pk = (ch && ch.portrait) || (PAINT[id] && !(ch && ch.actor) ? PAINT[id] : null);
    if (pk) return pnt[id] || (pnt[id] = painted(pk, id));   // no body: Des is a kettle even if an old look of that name was baked
    if (cvs[id]) return cvs[id];
    const duo = speakerParts(id);
    if (duo) { // two speakers at once: split portrait
      const [a, b] = duo, c = blank(), x = c.getContext('2d');
      x.drawImage(canvasFor(a), S / 4, 0, S / 2, S, 0, 0, S / 2, S);
      x.drawImage(canvasFor(b), S / 4, 0, S / 2, S, S / 2, 0, S / 2, S);
      x.fillStyle = '#ffd21f'; x.fillRect(S / 2 - 1, 0, 2, S);
      return (cvs[id] = c);
    }
    const look = id in alias ? alias[id] : (ch && ch.actor) || id;   // a speaker with an actor alias wears that actor's face
    if (look && look !== id) { const lc = cvs[look] || (CHARACTERS[look] || (typeof LOOKS !== 'undefined' && LOOKS[look]) ? canvasFor(look) : null); if (lc) return (cvs[id] = lc); }
    let fc = null;
    try {
      const a = look && typeof world !== 'undefined' && world.actor && world.actor(look);
      if (a && a.rig && a.rig.face) fc = a.rig.face.canvas;
      else if (look && LOOKS[look] && typeof buildCharacter === 'function') fc = buildCharacter(look).face.canvas;
    } catch (e) { fc = null; }
    return (cvs[id] = fc ? fromFace(fc) : silhouette(id));
  }
  const silOf = (id) => !!(CHARACTERS[id] && CHARACTERS[id].silhouette);
  function portraitURL(id) {
    if (silOf(id)) { const k = '~' + id; return urls[k] || (urls[k] = (sil[id] || (sil[id] = silhouette(id))).toDataURL()); }
    return urls[id] || (urls[id] = canvasFor(id).toDataURL());
  }
  portraitURL.bake = (id, canvas) => { cvs[id] = canvas; delete urls[id]; };
  portraitURL.canvas = (id) => (silOf(id) ? sil[id] || (sil[id] = silhouette(id)) : canvasFor(id));   // for cards (People)
  return portraitURL;
})();

// ------------------------------------------------------------ menus: title, main, options, controls, chapter select, extras, pause
const menus = (() => {
  const titleEl = document.getElementById('title'), root = document.getElementById('menu'), uiEl = document.getElementById('ui'); // uiEl.menuon hides the touch controls
  const head = root.querySelector('.head'), body = root.querySelector('.body'), list = root.querySelector('.list'), foot = root.querySelector('.foot');
  const btns = [];
  let items = [], sel = 0, back = null, onTitle = false, typed = '', orbitT = 0, mainSel = 0, exSel = 0, jSel = 0, pIdx = 0;
  let song = null, playing = null; // the Jukebox: an AUDIO.song handle, and 'pudding' | 'two' | null
  const M = { mode: null, paused: false };

  const CONTROLS = [
    ['Move', 'WASD or arrows', 'Left stick', 'Left virtual stick'],
    ['YES (confirm, examine, advance)', 'Enter, Space, left click', 'A', 'YES button'],
    ['NO (cancel, fast-forward)', 'Escape, Backspace, right click', 'B', 'NO button'],
    ['Run', 'Shift', 'RB', 'Push the stick further'],
    ['SWAP', 'Tab', 'Y', 'SWAP button'],
    ['CHIP (Chip View, Chase (2040) only)', 'Q', 'LB', 'CHIP button'],
    ['Inventory', 'I', 'X', 'BAG button'],
    ['Pause', 'P', 'Start', 'Pause icon'],
  ];
  // Extras: People. One card per named character except Rue, who is only ever his brick phone (no caption).
  const PEOPLE = [
    { id: 'luka', name: 'Luka', text: 'The 2IC. The one who could.' },
    { id: 'chase', name: 'Chase', text: 'Pudding. Finished two songs now.' },
    { id: 'chase40', name: 'Chase (2040)', text: 'Senior casual. They made it up for him.' },
    { id: 'luka40', name: 'Luka (2040)', text: 'Head of Network Safety since 2031. He chose NO.' },
    { id: 'jordan', name: 'Jordan', text: 'Jordan ran the store for two days on his own at Christmas, and nobody thanked him. Thank you, Jordan.' },
    { id: 'luke40', name: 'Luke', text: "Luke still does sausages. Sausages still don't hang up on him." },
    { id: 'teddy', name: 'Teddy', text: 'Teddy has said yes to everyone since Monday.' },
    { id: 'mia', name: 'Mia', text: 'Mia played a gig at the Starlight. Forty people came. It was loud.' },
    { id: 'nadia', name: 'Nadia', text: 'Nadia let her team do something dangerous. It went fine.' },
    { id: 'jayden', name: 'Jayden', text: 'Jayden poured his slab on time. His dad is still filthy.' },
    { id: 'des', name: 'Des (a kettle)', text: "Des (a kettle) asks everyone if they'd like tea. Everyone says yes." },
    { id: 'margaret', name: 'Margaret', text: 'Has been coming here since it was a video shop. Can wait.' },
    { brick: true },
  ];
  // The Bug List, 2040 Edition: BUGS_2040 (config) if it exists: strings or { text, seen? }. This is the fallback.
  const BUGS40 = ['Are you sure? Are you sure you\'re sure?', 'Buttons that run away', 'Progress bar goes backwards', 'Password rules change while you type',
    'Error 4044 — identity conflict', 'Sends MFA codes to dead phones'];

  // audio, guarded: names the AUDIO build doesn't have fall back to the next one (AUDIO.buffers lists what was baked)
  const AU = () => (typeof AUDIO !== 'undefined' ? AUDIO : null);
  const baked = (store, n) => { const a = AU(), b = a && a.buffers && a.buffers[store]; return !b || n in b; };
  const cue = (...ns) => { for (const n of ns) if (baked('M', n)) return n; return ns[0]; };
  const titleMusic = () => cue('title', 'pads', 'store40');
  const mus = (c, o) => { if (typeof music === 'function') music(c, o); };

  const VOL = { get: (k) => { const n = Math.round((options[k] ?? 1) * 10); return '■'.repeat(n) + '□'.repeat(10 - n); },
    adj: (k, d) => { options[k] = Math.max(0, Math.min(1, Math.round((options[k] ?? 1) * 10 + d) / 10)); } };
  const cyc = (key, vals, names, label) => ({
    label, val: () => '‹ ' + names[Math.max(0, vals.indexOf(options[key]))] + ' ›',
    adj: (d) => { const i = Math.max(0, vals.indexOf(options[key])); options[key] = vals[(i + d + vals.length) % vals.length]; applyOptions(); },
  });

  function applyOptions() {
    document.body.classList.toggle('large', options.textSize === 'large');
    document.body.classList.toggle('calm', !!options.reduceFlashing);   // Reduce Flashing: the Signal's pulse, the AR flicker
    saveOptions();
    emit('options', options);
  }
  function btn(k) {
    let b = btns[k];
    if (b) return b;
    b = btns[k] = document.createElement('button'); b._k = k;
    b.append(document.createElement('span'), document.createElement('em'));
    b.addEventListener('click', (e) => {
      if (M.mode !== 'menu') return;
      sel = b._k;
      const it = items[sel];
      // a value (‹ Modern ›, a volume) by click or tap: the left half of the value steps back, anywhere else forward
      // (touch has no left/right in menus, and a volume that only went up could never come down again)
      if (it && it.adj && !it.act && !it.dis) { const r = b.lastChild.getBoundingClientRect(); ui.sfx('pop', { vol: 0.5 }); it.adj(e.clientX < r.left + r.width / 2 ? -1 : 1); paint(); return; }
      paint(); act();
    });
    b.addEventListener('pointerenter', () => { if (M.mode === 'menu' && sel !== b._k) { sel = b._k; paint(); } });
    return b;
  }
  function show(h, its, bk, o = {}) {
    head.textContent = h || ''; items = its; back = bk || null;
    sel = Math.max(0, Math.min(o.sel || 0, its.length - 1));
    body.textContent = '';
    if (o.body) body.append(o.body); else if (o.html) body.innerHTML = o.html;
    foot.textContent = o.foot ?? (bk ? 'YES — Select · NO — Back' : 'YES — Select');
    const low = o.low && !M.paused;
    root.className = low ? 'low' : 'dim'; uiEl.classList.add('menuon');
    titleEl.classList.toggle('off', !(onTitle && low));
    list.textContent = '';
    for (let k = 0; k < its.length; k++) list.append(btn(k));
    paint();
    M.mode = 'menu';
  }
  function paint() {
    for (let k = 0; k < items.length; k++) {
      const it = items[k], b = btns[k];
      b.firstChild.textContent = it.label;
      b.lastChild.textContent = it.val ? it.val() : (it.sub || '');
      b.lastChild.style.display = it.val || it.sub ? '' : 'none';
      b.className = (k === sel ? 'sel' : '') + (it.dis ? ' dis' : '');
    }
    if (btns[sel] && items.length > 8) btns[sel].scrollIntoView({ block: 'nearest' });
  }
  function act() {
    const it = items[sel];
    if (!it) return;
    if (it.dis) { ui.sfx('clunk'); return; }
    if (it.act) { ui.sfx('pop', { vol: 0.5 }); it.act(); } else if (it.adj) { it.adj(1); paint(); }
  }
  const confirm = (q, yes, no) => show(q, [{ label: 'YES', act: yes }, { label: 'NO', act: no }], no);

  // ---------------------------------------------------------- screens
  function mainMenu() {
    const go = (fn) => () => { mainSel = sel; fn(); }, its = [];   // (coming back, the selection is where you left it)
    if (hasSave()) its.push({ label: 'Continue', act: cont });
    its.push({ label: 'New Game', act: () => (hasSave() ? confirm('Start a new game? Your saved game will be replaced.', newGame, mainMenu) : newGame()) });
    its.push({ label: 'Options', act: go(() => optionsMenu(mainMenu)) });
    if (profile.completed) {
      its.push({ label: 'Chapter Select', act: go(() => sceneSelect(mainMenu, 'CHAPTER SELECT')) });
      its.push({ label: 'Extras', act: go(() => { exSel = 0; extras(); }) });
    }
    show('', its, null, { low: true, sel: mainSel });
  }
  function optionsMenu(to) {
    const its = [
      cyc('controls', ['modern', 'tank'], ['Modern', 'Tank'], 'Controls'),
      cyc('textSpeed', ['slow', 'normal', 'fast'], ['Slow', 'Normal', 'Fast'], 'Text speed'),
      cyc('textSize', ['normal', 'large'], ['Normal', 'Large'], 'Text size'),
      ...[['music', 'Music volume'], ['sfx', 'SFX volume'], ['voice', 'Voice volume']].map(([k, l]) => ({ label: l, val: () => VOL.get(k), adj: (d) => { VOL.adj(k, d); applyOptions(); } })),
      cyc('reduceFlashing', [false, true], ['Off', 'On'], 'Reduce Flashing'),
      cyc('objective', [true, false], ['On', 'Off'], 'Objective text'),
      cyc('storyMode', [false, true], ['Off', 'On'], 'Story Mode'),
      cyc('holdToPress', [false, true], ['Hold', 'Press'], 'Hold to confirm'),
      { label: 'Back', act: to },
    ];
    show('OPTIONS', its, to, { foot: '‹ › Change · NO — Back' });
  }
  function controlsMenu(to) {
    const rows = CONTROLS.map((r) => `<tr><td>${r[0]}</td><td>${r[1]}</td><td>${r[2]}</td><td>${r[3]}</td></tr>`).join('');
    show('CONTROLS', [{ label: 'Back', act: to }], to, { html: `<table><tr><th>ACTION</th><th>KEYBOARD AND MOUSE</th><th>GAMEPAD</th><th>TOUCH</th></tr>${rows}</table>` });
  }
  // every scene in story order with its title; each starts with what a player would have by then (flow's grants)
  function sceneSelect(to, h = 'CHAPTER SELECT') {
    const its = SCENE_ORDER.map((id) => ({ label: id, sub: (SCENES[id] && SCENES[id].title) || '', dis: !SCENES[id], act: () => playScene(id, (/^([AB])\d/.exec(id) || [])[1] || null) }));
    its.push({ label: 'Back', act: to });
    show(h, its, to);
  }
  function saved() { return loadGame() || state; }
  const seenEnding = (k) => { const e = profile.endingsSeen; return !!e && (Array.isArray(e) ? e.includes(k) : !!e[k]); };
  function extras() {
    const go = (fn) => () => { exSel = sel; fn(); };
    show('EXTRAS', [
      { label: 'Endings', act: go(endings) },
      { label: 'Jukebox', act: go(() => { jSel = 0; jukebox(); }) },
      { label: 'The Bug List, 2040 Edition', act: go(bugList) },
      { label: 'People', act: go(() => people(0)) },
      { label: 'Pudding Discography', act: go(discography) },
      { label: 'Credits', act: go(credits) },
      { label: 'Back', act: mainMenu },
    ], mainMenu, { sel: exSel });
  }
  function endings() { // which have been seen; replay either (from the start of its first scene, on that branch)
    const its = [['A', 'A1', 'Keep'], ['B', 'B1', 'Again']].map(([k, id, t]) => ({
      label: `Ending ${k} — ${(SCENES[id] && SCENES[id].title) || t}`, sub: seenEnding(k) ? 'Seen · Replay' : 'Not seen yet', dis: !SCENES[id], act: () => playScene(id, k) }));
    its.push({ label: 'Back', act: extras });
    show('ENDINGS', its, extras);
  }
  function jukebox() {
    const s = saved(), got = (k) => !!(s.samples && s.samples.includes(k));
    const its = [
      { label: (playing === 'pudding' ? '■  ' : '▶  ') + 'Opt Us In (Dublin ’87)', sub: 'Pudding · 1987', act: () => toggle('pudding') },
      { label: (playing === 'two' ? '■  ' : '▶  ') + 'two', sub: s.pattern ? 'Pudding · your mix' : 'Pudding', act: () => toggle('two') },
    ];
    if (typeof SAMPLES !== 'undefined') for (const k in SAMPLES) {
      const smp = SAMPLES[k];
      its.push({ label: '♪  ' + (smp.label || k), sub: got(k) ? smp.where || 'Recorded' : '— — —', act: () => { jSel = sel; ui.sfx(smp.sfx || k); } });
    }
    its.push({ label: 'Back', act: () => { stopJuke(true); extras(); } });
    show('JUKEBOX', its, () => { stopJuke(true); extras(); }, { sel: jSel });
  }
  function stopJuke(restore) {
    const was = playing;
    if (song) { try { song.stop(); } catch (e) { /* already ended */ } song = null; }
    playing = null;
    if (was && restore && onTitle) mus(titleMusic(), { fade: 0.6 });
  }
  function toggle(which) {
    jSel = sel;
    const was = playing;
    stopJuke(was === which);
    if (was !== which) {
      const A = AU();
      if (which === 'pudding') { mus('pudding', { fade: 0.4 }); playing = 'pudding'; }
      else if (A && A.song) {
        const s = saved();
        mus(null, { fade: 0.4 });
        try {
          const h = A.song({ pattern: s.pattern || null, samples: s.samples || [], onEnd: () => { if (song !== h) return; song = null; playing = null; if (onTitle) mus(titleMusic()); if (M.mode === 'menu' && head.textContent === 'JUKEBOX') jukebox(); } });
          song = h; playing = 'two';
        } catch (e) { console.warn('TWO: jukebox', e); }
      }
    }
    jukebox();
  }
  function bugList() {
    const src = typeof BUGS_2040 !== 'undefined' && Array.isArray(BUGS_2040) && BUGS_2040.length ? BUGS_2040 : BUGS40, fl = saved().flags || {};
    const items = src.map((b) => (typeof b === 'string' ? { text: b } : { text: b.text, y: b.y, done: b.seen ? !!fl[b.seen] : b.done !== false }));
    cardScreen('THE BUG LIST, 2040 EDITION', 'buglist40', { items });
  }
  function people(i) {
    pIdx = (i + PEOPLE.length) % PEOPLE.length;
    const p = PEOPLE[pIdx], c = document.createElement('canvas');
    if (p.brick) ui.paintCard(c, 'brick', { lit: true }); else ui.paintCard(c, 'person', p);
    show('PEOPLE', [
      { label: '‹  ' + (p.brick ? '' : p.name) + '  ›', val: () => pIdx + 1 + ' / ' + PEOPLE.length, adj: (d) => people(pIdx + d) },
      { label: 'Back', act: extras },
    ], extras, { body: c, foot: '‹ › Browse · NO — Back' });
  }
  function discography() { cardScreen('PUDDING DISCOGRAPHY', 'discography', { a: seenEnding('A'), b: seenEnding('B') }); }
  function cardScreen(h, kind, data) {
    const c = document.createElement('canvas');
    ui.paintCard(c, kind, data);
    show(h, [{ label: 'Back', act: extras }], extras, { body: c });
  }
  function credits() {
    show('CREDITS', [{ label: 'Back', act: extras }], extras, { html: `<div class="cr"><p class="two">two</p><p>A comedy adventure. The sequel to Rue.</p>
      <p><b>STARRING</b>Luka · Chase · Luka (2040) · Chase (2040)</p>
      <p><b>WITH</b>Jordan · Luke · Teddy · Mia · Nadia · Jayden · Des (a kettle) · and Rue</p>
      <p><b>MUSIC</b>“two” by Pudding<br>“Opt Us In (Dublin ’87)” by Pudding, the national hold music</p>
      <p><i>No drones were harmed in the making of this game. Several were tethered.</i><br><i>Optus Cloud+ is not a real product. Please remember things yourself.</i><br><i>Nobody can fix JARVIS.</i></p>
      <p>A work of affectionate parody. Not affiliated with or endorsed by Optus. SafeSense, the Courtesy Drones, Neural Chips, the Opt-Out and Optus Cloud+ are made up. Luka and Chase are real coworkers, written with affection.</p></div>` });
  }
  function pauseMenu() {
    const F = typeof flow !== 'undefined' ? flow : null;
    const its = [{ label: 'Resume', act: M.resume }];
    if (F && F.roaming && typeof inventory !== 'undefined') its.push({ label: 'Inventory', act: () => { M.resume(); inventory.open(); } });
    // offered by the mini-game host after two failures (never for the Choice): flow.skipOffer
    if (F && F.skipOffer) its.push({ label: 'Skip this mini-game', act: () => confirm('Skip this mini-game?', () => { M.resume(); if (typeof F.skipOffer === 'function') F.skipOffer(); else if (typeof F.skipMinigame === 'function') F.skipMinigame(); }, pauseMenu) });
    if (F && F.cutscene) its.push({ label: 'Skip Scene', act: () => confirm('Skip?', () => { M.resume(); if (F.skip) F.skip(); else F.skipping = true; }, pauseMenu) });
    its.push({ label: 'Options', act: () => optionsMenu(pauseMenu) });
    its.push({ label: 'Controls', act: () => controlsMenu(pauseMenu) });
    its.push({ label: 'Quit to Title', act: () => confirm('Quit to the title screen? This scene will restart from its beginning.', quit, pauseMenu) });
    show('PAUSED', its, M.resume);
  }

  // ---------------------------------------------------------- leaving the title
  function leave() {
    stopJuke(false);
    onTitle = false; M.mode = null; uiEl.classList.remove('menuon');
    titleEl.classList.add('off'); root.classList.add('off');
    mus(null, { fade: 0.8 });
  }
  // a fresh state; with select, flow adds every earlier scene's grants. An ending's scenes carry their branch in state.choice.
  function playScene(id, choice) {
    leave(); state = newState();
    if (choice) state.choice = choice;
    flow.start(id, choice ? { select: true, choice } : { select: true });
    if (choice) state.choice = choice;   // (flow's select rebuilds state synchronously, before its first await)
  }
  function newGame() { leave(); state = newState(); flow.start('1.1'); }
  function cont() { const s = loadGame(); if (!s) return; leave(); state = s; flow.start(s.scene); }
  function quit() {
    M.resume();
    if (typeof flow !== 'undefined' && flow.stop) flow.stop();
    M.title();
  }
  // the title: Redcliffe, 2040, at dusk, a ring of drones outside, the camera slowly circling (fallback: whatever set exists)
  const TITLE_SETS = ['reddy40', 'reddy26', 'reddy'];
  async function titleSet() {
    const id = TITLE_SETS.find((k) => SETS[k]) || Object.keys(SETS)[0];
    if (!id || typeof world === 'undefined') return;
    const def = SETS[id], env = def.env && def.env.dusk ? 'dusk' : undefined;
    if (world.setId !== id) await world.load(id, { env }); else if (env) world.env(env);
    if (typeof def.dress === 'function') { try { def.dress('title'); } catch (e) { console.warn('TWO: title dress', e); } }
    else { const ring = world.prop && world.prop('drone_ring'); if (ring) ring.visible = true; }
    const amb = (world.set && world.set.ambience) || {};
    if (typeof AUDIO !== 'undefined') { AUDIO.ambience(amb); AUDIO.setRoom(amb.room || 'none'); }
    for (const a of (world.actors instanceof Map ? [...world.actors.keys()] : Object.keys(world.actors || {}))) world.despawn(a);
    if (typeof player !== 'undefined') player.enabled = false;
    orbit(); orbitT = 0;
  }
  function orbit() {
    try {
      if (world.anchor && world.anchor('title_center')) cam.shot({ shot: 'INSERT', at: 'title_center', move: 'orbit', from: 0, to: 360, dur: 240 });
      else cam.shot({ shot: 'WIDE', on: [1, 2, -7], dist: 30, height: 9, facing: true, move: 'orbit', from: 0, to: 360, dur: 240 });   // round the store
    } catch (e) { try { cam.override('set', { name: 'title_orbit' }); } catch (e2) { /* no camera yet */ } }
  }

  M.init = () => {
    on('key', (code) => { // J-A-R-V-I-S on the title opens the chapter select
      if (!onTitle || M.mode === 'wait' || !code.startsWith('Key')) return;
      typed = (typed + code[3]).slice(-6);
      if (typed === 'JARVIS') { typed = ''; titleEl.classList.add('withmenu'); sceneSelect(mainMenu); }
    });
    on('reddy40:lightning', () => { if (onTitle) ui.sfx('thunder', { vol: 0.45 }); });   // the storm over the bay, on the title
  };
  M.title = async () => {
    M.paused = false; clock.paused = false; clock.scale = 1; auPause(false);
    ui.reset();
    if (!profile.seenPrologue) { profile.seenPrologue = true; saveOptions(); }
    if (TEST.auto) { // autoplay never stops at the title: P runs into 1.1; anything else means we're done
      if (!TWO_TEST.done && TEST.stop !== 'P' && flow.sceneId === 'P') { state = newState(); flow.start('1.1'); }
      else TWO_TEST.done = true;
      return;
    }
    M.mode = 'wait'; onTitle = true; typed = ''; mainSel = 0; uiEl.classList.add('menuon');
    root.classList.add('off');
    await ui.fade(1, 0.4);
    // a clean slate under the black: a scene quit mid-way may have left a song, a muffle (3.5), the ringing or beds on
    const A = AU(); if (A && A.stopAll) A.stopAll();
    try { await titleSet(); } catch (e) { console.warn('TWO: title scene', e); }
    mus(titleMusic());
    titleEl.classList.remove('off', 'withmenu');
    M.mode = 'press';
    ui.fade(0, 1.2);
  };
  const auPause = (on) => { const A = AU(); if (A && A.pause) A.pause(on); };   // songs + AUDIO.seq hold their place while paused
  M.pause = () => { M.paused = true; clock.paused = true; auPause(true); pauseMenu(); };
  M.resume = () => { M.paused = false; clock.paused = false; auPause(false); M.mode = null; root.classList.add('off'); uiEl.classList.remove('menuon'); };
  M.update = () => {
    if (onTitle && (orbitT += CONFIG.step) > 240) { orbitT = 0; orbit(); }
    if (M.mode === null) {
      if (input.pressed('pause') && typeof flow !== 'undefined' && flow.sceneId) { input.consume('pause'); M.pause(); }
      return;
    }
    if (M.mode === 'press') {
      if (input.pressed('yes')) { input.consume('yes'); ui.sfx('chime_ready'); titleEl.classList.add('withmenu'); mainMenu(); }
      return;
    }
    if (M.mode !== 'menu') return;
    const n = items.length;
    if (input.pressed('up')) { sel = (sel - 1 + n) % n; paint(); }
    if (input.pressed('down')) { sel = (sel + 1) % n; paint(); }
    const it = items[sel];
    if (it && it.adj && (input.pressed('left') || input.pressed('right'))) { it.adj(input.pressed('left') ? -1 : 1); paint(); }
    if (input.pressed('yes')) act();
    else if ((input.pressed('no') || (M.paused && input.pressed('pause'))) && back) back();
    for (let i = 0; i < M.keys.length; i++) input.consume(M.keys[i]);
  };
  M.keys = ['yes', 'no', 'up', 'down', 'left', 'right', 'pause', 'inventory', 'swap', 'chip'];
  return M;
})();

// ------------------------------------------------------------ CARDS: readable INSERT close-ups
// Each painter draws just the object on a transparent canvas (ui.card adds nothing else). `.size` = native px.
Object.assign(CARDS, (() => {
  const HAND = '"Segoe Print", "Bradley Hand", "Marker Felt", "Chalkboard SE", "Comic Sans MS", "Comic Neue", cursive';
  const SANS = '"Trebuchet MS", "Segoe UI", system-ui, sans-serif';
  const SYS = 'system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif';
  const MONO = '"Courier New", ui-monospace, Menlo, Consolas, monospace';
  const SERIF = 'Georgia, "Times New Roman", serif';
  const PI2 = Math.PI * 2, BIRO = '#1d2f8f';
  const MONTHS = ['JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE', 'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'];
  let seed = 1;
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const seedOf = (s) => { seed = 7; for (const c of String(s)) seed = (seed * 31 + c.charCodeAt(0)) % 2147483647; seed = seed || 1; };
  const rr = (cx, x, y, w, h, r) => { cx.beginPath(); cx.roundRect(x, y, w, h, r); };
  const shadow = (cx, b = 24, oy = 10, a = 0.35) => { cx.shadowColor = `rgba(0,0,0,${a})`; cx.shadowBlur = b; cx.shadowOffsetY = oy; };
  const noShadow = (cx) => { cx.shadowColor = 'transparent'; cx.shadowBlur = 0; cx.shadowOffsetY = 0; };
  const hm = (t) => { const m = /(\d{1,2}):(\d{2})/.exec(String(t || '12:00')); return m ? [+m[1], +m[2]] : [12, 0]; };
  const tilt = (cx, w, h, a) => { cx.translate(w / 2, h / 2); cx.rotate(a); cx.translate(-w / 2, -h / 2); };
  function wrap(cx, text, maxW) {
    const out = [];
    for (const para of String(text).split('\n')) {
      let line = '';
      for (const word of para.split(' ')) {
        const t = line ? line + ' ' + word : word;
        if (line && cx.measureText(t).width > maxW) { out.push(line); line = word; } else line = t;
      }
      out.push(line);
    }
    return out;
  }
  function fit(cx, text, font, maxW, maxH, size, lh = 1.2) { // biggest size <= size that wraps into the box
    let lines;
    for (;;) {
      cx.font = font(size); lines = wrap(cx, text, maxW);
      let wide = false; for (const l of lines) if (cx.measureText(l).width > maxW) wide = true;
      if ((!wide && lines.length * size * lh <= maxH) || size < 10) return { size, lines };
      size *= 0.92;
    }
  }
  function hand(cx, text, x, y, size, color, o = {}) { // handwriting: each letter wobbles a little
    cx.save();
    cx.font = `${o.bold ? 'bold ' : ''}${size}px ${HAND}`; cx.fillStyle = color; cx.strokeStyle = color;
    cx.lineJoin = 'round'; cx.lineWidth = size * (o.felt ? 0.07 : 0.025); cx.textAlign = 'left'; cx.textBaseline = 'alphabetic';
    const w = cx.measureText(text).width;
    let px = o.align === 'center' ? x - w / 2 : o.align === 'right' ? x - w : x;
    for (const ch of String(text)) {
      const cw = cx.measureText(ch).width;
      cx.save();
      cx.translate(px + cw / 2, y + (rnd() - 0.5) * size * 0.08);
      cx.rotate((rnd() - 0.5) * 0.1 + (o.slant || 0));
      if (o.felt || o.pen) cx.strokeText(ch, -cw / 2, 0);
      cx.fillText(ch, -cw / 2, 0);
      cx.restore();
      px += cw;
    }
    cx.restore();
    return w;
  }
  function hands(cx, x, y, r, hh, mm, sec, col) {
    const line = (a, len, wd, c) => {
      cx.strokeStyle = c; cx.lineWidth = wd; cx.lineCap = 'round';
      cx.beginPath(); cx.moveTo(x - Math.sin(a) * len * 0.16, y + Math.cos(a) * len * 0.16); cx.lineTo(x + Math.sin(a) * len, y - Math.cos(a) * len); cx.stroke();
    };
    line(((hh % 12) + mm / 60) / 12 * PI2, r * 0.52, r * 0.075, col);
    line(mm / 60 * PI2, r * 0.8, r * 0.05, col);
    if (sec != null) line(sec / 60 * PI2, r * 0.84, r * 0.018, '#d8342b');
    cx.fillStyle = sec != null ? '#d8342b' : col; cx.beginPath(); cx.arc(x, y, r * 0.055, 0, PI2); cx.fill();
  }
  function skull(cx, x, y, s, col) { // the doodle next to Recontracts
    cx.save(); cx.strokeStyle = col; cx.fillStyle = col; cx.lineWidth = Math.max(1.5, s * 0.08); cx.lineCap = 'round'; cx.lineJoin = 'round';
    cx.beginPath(); cx.arc(x, y, s * 0.42, Math.PI * 0.8, Math.PI * 2.2); cx.lineTo(x + s * 0.26, y + s * 0.52); cx.lineTo(x - s * 0.26, y + s * 0.52); cx.closePath(); cx.stroke();
    for (const e of [-1, 1]) { cx.beginPath(); cx.arc(x + e * s * 0.16, y + s * 0.04, s * 0.1, 0, PI2); cx.fill(); }
    cx.beginPath(); for (let i = -1; i <= 1; i++) { cx.moveTo(x + i * s * 0.1, y + s * 0.34); cx.lineTo(x + i * s * 0.1, y + s * 0.52); } cx.stroke();
    cx.restore();
  }
  function brass(cx, x, y, w, h) {
    const g = cx.createLinearGradient(x, y, x + w * 0.35, y + h * 1.4);
    g.addColorStop(0, '#8a6424'); g.addColorStop(0.3, '#f1d27c'); g.addColorStop(0.55, '#b98e3c'); g.addColorStop(0.8, '#f3db93'); g.addColorStop(1, '#a57b30');
    return g;
  }
  function engrave(cx, text, x, y, font) {
    cx.font = font; cx.textAlign = 'center'; cx.textBaseline = 'middle';
    cx.fillStyle = 'rgba(255,244,196,.85)'; cx.fillText(text, x + 1.5, y + 2);
    cx.fillStyle = '#3f2c0c'; cx.fillText(text, x, y);
  }
  function screw(cx, x, y, r) {
    cx.fillStyle = '#8a6a2c'; cx.beginPath(); cx.arc(x, y, r, 0, PI2); cx.fill();
    cx.strokeStyle = '#4a3610'; cx.lineWidth = 2; cx.beginPath(); cx.moveTo(x - r * 0.7, y - r * 0.3); cx.lineTo(x + r * 0.7, y + r * 0.3); cx.stroke();
  }

  // ---------------------------------------------------------- painters
  function postit(cx, w, h, d) {
    seedOf(d.text);
    const s = Math.min(w, h) * 0.8, c = s * 0.13, x = -s / 2, y = -s / 2;
    cx.translate(w / 2, h / 2); cx.rotate(-0.035);
    shadow(cx, 30, 14);
    cx.fillStyle = '#ffe56a';
    cx.beginPath(); cx.moveTo(x, y); cx.lineTo(x + s, y); cx.lineTo(x + s, y + s - c); cx.lineTo(x + s - c, y + s); cx.lineTo(x, y + s); cx.closePath(); cx.fill();
    noShadow(cx);
    let g = cx.createLinearGradient(0, y, 0, y + s * 0.22); g.addColorStop(0, 'rgba(200,160,20,.28)'); g.addColorStop(1, 'rgba(200,160,20,0)');
    cx.fillStyle = g; cx.fillRect(x, y, s, s * 0.22);
    g = cx.createLinearGradient(x + s - c, y + s - c, x + s, y + s); g.addColorStop(0, '#fff4b8'); g.addColorStop(1, '#d6b536');
    cx.fillStyle = g; cx.beginPath(); cx.moveTo(x + s, y + s - c); cx.lineTo(x + s - c, y + s); cx.lineTo(x + s - c * 1.08, y + s - c * 1.08); cx.closePath(); cx.fill();
    const f = fit(cx, d.text || '', (z) => `${z}px ${HAND}`, s * 0.8, s * 0.74, s * 0.17, 1.2);
    const top = -(f.lines.length - 1) * f.size * 1.2 / 2 + f.size * 0.3;
    f.lines.forEach((l, i) => hand(cx, l, 0, top + i * f.size * 1.2, f.size, '#1d2447', { align: 'center', felt: true }));
  }
  postit.size = [640, 640];

  function clock(cx, w, h, d) {
    const [hh, mm] = hm(d.time), r = w * 0.36, x = w / 2, y = h * 0.42;
    shadow(cx, 30, 12);
    cx.fillStyle = '#23252b'; cx.beginPath(); cx.arc(x, y, r, 0, PI2); cx.fill();
    noShadow(cx);
    const g = cx.createRadialGradient(x - r * 0.2, y - r * 0.3, r * 0.1, x, y, r); g.addColorStop(0, '#ffffff'); g.addColorStop(1, '#e9e2d0');
    cx.fillStyle = g; cx.beginPath(); cx.arc(x, y, r * 0.9, 0, PI2); cx.fill();
    cx.fillStyle = '#23252b';
    for (let i = 0; i < 60; i++) {
      const big = i % 5 === 0, l = r * (big ? 0.11 : 0.045), wd = r * (big ? 0.035 : 0.012);
      cx.save(); cx.translate(x, y); cx.rotate(i / 60 * PI2); cx.fillRect(-wd / 2, -r * 0.86, wd, l); cx.restore();
    }
    cx.font = `bold ${r * 0.16}px ${SANS}`; cx.textAlign = 'center'; cx.textBaseline = 'middle';
    for (let i = 1; i <= 12; i++) { const a = i / 12 * PI2; cx.fillText(i, x + Math.sin(a) * r * 0.62, y - Math.cos(a) * r * 0.62); }
    hands(cx, x, y, r, hh, mm, d.sec ?? 7, '#1c1e24');
    const t = String(d.time || ''), ty = y + r + h * 0.1;
    cx.font = `bold ${h * 0.075}px ${MONO}`;
    const tw = cx.measureText(t).width + h * 0.07;
    shadow(cx, 12, 4);
    cx.fillStyle = '#141d3a'; rr(cx, x - tw / 2, ty - h * 0.055, tw, h * 0.11, h * 0.03); cx.fill(); noShadow(cx);
    cx.fillStyle = '#ffd21f'; cx.fillText(t, x, ty + 3);
  }
  clock.size = [640, 720];

  function phone(cx, w, h, d) {
    const tone = d.tone || 'light', lines = d.lines || [];
    const pw = w * 0.9, ph = h * 0.96, px = (w - pw) / 2, py = (h - ph) / 2, R = pw * 0.13;
    shadow(cx, 30, 12);
    cx.fillStyle = '#15171c'; rr(cx, px, py, pw, ph, R); cx.fill(); noShadow(cx);
    cx.strokeStyle = '#4a505c'; cx.lineWidth = 3; rr(cx, px + 1.5, py + 1.5, pw - 3, ph - 3, R); cx.stroke();
    const m = pw * 0.045, sx = px + m, sy = py + m, sw = pw - 2 * m, sh = ph - 2 * m;
    const dark = tone !== 'light', fg = dark ? '#eef2fa' : '#1b2130';
    cx.save(); rr(cx, sx, sy, sw, sh, R - m); cx.clip();
    cx.fillStyle = tone === 'dead' ? '#040506' : dark ? '#0f1320' : '#f3f5f9'; cx.fillRect(sx, sy, sw, sh);
    if (tone === 'dead') { // black glass reflecting two faces
      for (const [fx, fy] of [[0.34, 0.4], [0.68, 0.45]]) {
        const g = cx.createRadialGradient(sx + sw * fx, sy + sh * fy, 4, sx + sw * fx, sy + sh * fy, sw * 0.2);
        g.addColorStop(0, 'rgba(200,210,230,.13)'); g.addColorStop(1, 'rgba(200,210,230,0)'); cx.fillStyle = g; cx.fillRect(sx, sy, sw, sh);
        cx.fillStyle = 'rgba(200,210,230,.05)'; cx.beginPath(); cx.ellipse(sx + sw * fx, sy + sh * (fy + 0.26), sw * 0.22, sh * 0.1, 0, Math.PI, 0); cx.fill();
      }
    } else {
      const bh = sh * 0.06, by = sy + bh * 0.62, noSvc = d.status === 'noservice' || tone === 'noservice';
      cx.fillStyle = fg; cx.font = `600 ${bh * (noSvc ? 0.38 : 0.5)}px ${SYS}`; cx.textBaseline = 'middle'; cx.textAlign = 'left';
      cx.fillText(noSvc ? 'No Service' : d.time || '11:41', sx + sw * 0.08, by);
      let rx = sx + sw * 0.92;
      const bat = d.battery ?? 64;
      cx.strokeStyle = fg; cx.lineWidth = 2; rr(cx, rx - 34, by - 8, 30, 16, 4); cx.stroke();
      cx.fillStyle = bat <= 10 ? '#ff4a3d' : fg; cx.fillRect(rx - 32, by - 6, 26 * Math.max(0.08, bat / 100), 12);
      cx.textAlign = 'right';
      if (d.battery != null) { cx.fillStyle = fg; cx.fillText(d.battery + '%', rx - 42, by); rx -= 104; } else rx -= 48;
      if (!noSvc) for (let i = 0; i < 4; i++) { cx.fillStyle = fg; cx.fillRect(rx - 34 + i * 9, by + 7 - (i + 1) * 4, 6, (i + 1) * 4); }
      cx.fillStyle = '#000'; rr(cx, sx + sw / 2 - sw * 0.14, sy + bh * 0.28, sw * 0.28, bh * 0.52, bh * 0.26); cx.fill();
      let y = sy + bh * 2.2;
      cx.textAlign = 'left'; cx.textBaseline = 'alphabetic';
      if (d.title) {
        cx.fillStyle = dark ? '#1b2340' : '#e1e6f0'; cx.fillRect(sx, sy + bh * 1.2, sw, sh * 0.1);
        cx.fillStyle = fg; cx.font = `bold ${sh * 0.04}px ${SYS}`;
        cx.fillText(d.title, sx + sw * 0.07, sy + bh * 1.2 + sh * 0.064, sw * 0.86);
        y = sy + bh * 1.2 + sh * 0.1 + sh * 0.06;
      }
      if (lines.length && lines.length <= 2 && lines.every((l) => String(l).length <= 14)) {
        cx.textAlign = 'center'; cx.font = `bold ${sh * 0.075}px ${SYS}`; cx.fillStyle = fg;
        lines.forEach((l, i) => cx.fillText(l, sx + sw / 2, sy + sh * 0.52 + (i - (lines.length - 1) / 2) * sh * 0.1));
      } else {
        const z = sh * 0.043;
        cx.font = `${z}px ${SYS}`; cx.fillStyle = fg;
        for (const l of lines) { for (const s of wrap(cx, l, sw * 0.84)) { cx.fillText(s, sx + sw * 0.08, y); y += z * 1.35; } y += z * 0.6; }
      }
      cx.globalAlpha = 0.5; cx.fillStyle = fg; rr(cx, sx + sw * 0.35, sy + sh - bh * 0.45, sw * 0.3, 5, 3); cx.fill(); cx.globalAlpha = 1;
    }
    const g = cx.createLinearGradient(sx, sy, sx + sw, sy + sh); g.addColorStop(0, 'rgba(255,255,255,.08)'); g.addColorStop(0.45, 'rgba(255,255,255,0)');
    cx.fillStyle = g; cx.fillRect(sx, sy, sw, sh);
    cx.restore();
  }
  phone.size = [420, 800];

  function brick(cx, w, h, d) {
    const bw = w * 0.66, bx = (w - bw) / 2, by = h * 0.15, bh = h * 0.97 - by;
    cx.fillStyle = '#2b2d31'; rr(cx, bx + bw * 0.74, h * 0.03, bw * 0.1, by, 8); cx.fill();
    cx.fillStyle = '#3a3d42'; rr(cx, bx + bw * 0.715, h * 0.015, bw * 0.15, h * 0.035, 10); cx.fill();
    shadow(cx, 30, 12);
    const g = cx.createLinearGradient(bx, 0, bx + bw, 0); g.addColorStop(0, '#5d6166'); g.addColorStop(0.5, '#7d8288'); g.addColorStop(1, '#4b4f54');
    cx.fillStyle = g; rr(cx, bx, by, bw, bh, 30); cx.fill(); noShadow(cx);
    cx.strokeStyle = 'rgba(255,255,255,.18)'; cx.lineWidth = 3; rr(cx, bx + 5, by + 5, bw - 10, bh - 10, 26); cx.stroke();
    cx.fillStyle = '#2a2c30';
    for (let i = 0; i < 4; i++) { rr(cx, bx + bw * 0.3, by + bh * 0.035 + i * 11, bw * 0.4, 5, 3); cx.fill(); }
    const lx = bx + bw * 0.12, ly = by + bh * 0.13, lw = bw * 0.76, lh = bh * 0.21, on = !!d.lit;
    cx.fillStyle = '#1d1f22'; rr(cx, lx, ly, lw, lh, 10); cx.fill();
    if (on) { cx.shadowColor = 'rgba(170,230,90,.8)'; cx.shadowBlur = 26; }
    cx.fillStyle = on ? '#b8e07a' : '#8a927f'; rr(cx, lx + 12, ly + 12, lw - 24, lh - 24, 4); cx.fill(); noShadow(cx);
    cx.fillStyle = 'rgba(0,0,0,.07)'; cx.fillRect(lx + 12, ly + 12, lw - 24, (lh - 24) * 0.22);
    if (on) { cx.fillStyle = '#2a3a1a'; for (let i = 0; i < 4; i++) cx.fillRect(lx + 26 + i * 9, ly + lh - 28 - i * 4, 6, 6 + i * 4); }
    if (d.text) { cx.fillStyle = '#1e2a12'; cx.font = `bold ${lh * 0.28}px ${MONO}`; cx.textAlign = 'center'; cx.textBaseline = 'middle'; cx.fillText(d.text, lx + lw / 2, ly + lh / 2, lw - 44); }
    const keys = ['SND', 'CLR', 'END', '1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'];
    const kw = bw * 0.2, kh = bh * 0.068, kx = bx + bw * 0.15, ky = by + bh * 0.42;
    cx.font = `bold ${kh * 0.45}px ${SANS}`; cx.textAlign = 'center'; cx.textBaseline = 'middle';
    keys.forEach((k, i) => {
      const x = kx + (i % 3) * kw * 1.25, y = ky + Math.floor(i / 3) * kh * 1.45;
      cx.fillStyle = i === 0 ? '#3f7d4a' : i === 2 ? '#9c3a33' : '#2e3034'; rr(cx, x, y, kw, kh, kh * 0.45); cx.fill();
      cx.fillStyle = '#e8e8e8'; cx.fillText(k, x + kw / 2, y + kh / 2 + 1);
    });
  }
  brick.size = [520, 760];

  function screen(cx, w, h, d) {
    const st = d.style || 'jarvis', lines = d.lines || [], beige = st === 'green';
    shadow(cx, 30, 12);
    cx.fillStyle = beige ? '#cfc6ae' : '#1c1e23'; rr(cx, w * 0.03, h * 0.03, w * 0.94, h * 0.94, 26); cx.fill(); noShadow(cx);
    const sx = w * 0.07, sy = h * 0.08, sw = w * 0.86, sh = h * 0.8;
    cx.save(); rr(cx, sx, sy, sw, sh, beige ? 30 : 6); cx.clip();
    cx.fillStyle = st === 'green' ? '#04120a' : st === 'crash' ? '#1f44a8' : '#eef1f6'; cx.fillRect(sx, sy, sw, sh);
    let y = sy + sh * 0.14, z = sh * 0.062, font = SYS, col = '#28303f';
    const x = sx + sw * 0.06;
    if (st === 'jarvis') {
      cx.fillStyle = '#2f6fd6'; cx.fillRect(sx, sy, sw, sh * 0.12);
      cx.fillStyle = '#fff'; cx.font = `italic 800 ${sh * 0.055}px ${SYS}`; cx.textBaseline = 'middle'; cx.fillText('JARVIS', x, sy + sh * 0.062);
      cx.globalAlpha = 0.8; cx.font = `${sh * 0.034}px ${SYS}`; cx.fillText('Sales & Service  ·  Redcliffe', x + sh * 0.27, sy + sh * 0.064); cx.globalAlpha = 1;
      y = sy + sh * 0.27; z = sh * 0.07;
    } else if (st === 'green') { font = MONO; col = '#3dff72'; cx.shadowColor = 'rgba(60,255,110,.5)'; cx.shadowBlur = 10; }
    else col = '#ffffff';
    cx.textBaseline = 'alphabetic'; cx.textAlign = 'left';
    lines.forEach((l, i) => {
      const first = i === 0 && st === 'crash', s = first ? z * 1.4 : z;
      cx.font = `${first ? 'bold ' : ''}${s}px ${font}`;
      for (const t of wrap(cx, l, sw * 0.88)) {
        if (d.hl && t.includes(d.hl)) {
          const a = cx.measureText(t.slice(0, t.indexOf(d.hl))).width, b = cx.measureText(d.hl).width;
          cx.save(); noShadow(cx); cx.fillStyle = 'rgba(255,210,31,.55)'; cx.fillRect(x + a - 5, y - s * 0.86, b + 10, s * 1.12); cx.restore();
        }
        cx.fillStyle = col; cx.fillText(t, x, y); y += s * 1.35;
      }
      y += s * 0.35;
    });
    if (st === 'green') { cx.fillStyle = col; cx.fillRect(x, y - z * 1.25, z * 0.55, z); }
    cx.restore();
    const g = cx.createLinearGradient(sx, sy, sx + sw * 0.6, sy + sh); g.addColorStop(0, 'rgba(255,255,255,.09)'); g.addColorStop(0.5, 'rgba(255,255,255,0)');
    cx.fillStyle = g; rr(cx, sx, sy, sw, sh, beige ? 30 : 6); cx.fill();
    if (beige) { cx.fillStyle = '#3dff72'; cx.fillRect(w * 0.86, h * 0.925, 12, 6); }
  }
  screen.size = [960, 660];

  function newspaper(cx, w, h, d) {
    seedOf(d.headline || d.masthead);
    tilt(cx, w, h, -0.02);
    const x = w * 0.05, y = h * 0.05, pw = w * 0.9, ph = h * 0.9, mid = x + pw / 2, ink = '#22201c';
    shadow(cx, 26, 10);
    const g = cx.createLinearGradient(x, y, x + pw, y + ph); g.addColorStop(0, '#f1ebdb'); g.addColorStop(1, '#e0d6bd');
    cx.fillStyle = g; cx.fillRect(x, y, pw, ph); noShadow(cx);
    cx.fillStyle = ink; cx.textAlign = 'center'; cx.textBaseline = 'alphabetic';
    cx.font = `bold ${ph * 0.12}px ${SERIF}`;
    cx.fillText(d.masthead || 'The Dublin Evening Post', mid, y + ph * 0.16, pw * 0.9);
    cx.fillRect(x + pw * 0.04, y + ph * 0.2, pw * 0.92, 3); cx.fillRect(x + pw * 0.04, y + ph * 0.2 + 7, pw * 0.92, 1.5);
    cx.font = `italic ${ph * 0.036}px ${SERIF}`;
    cx.textAlign = 'left'; cx.fillText('No. 31,412', x + pw * 0.05, y + ph * 0.262);
    cx.textAlign = 'center'; cx.fillText(d.date || '', mid, y + ph * 0.262);
    cx.textAlign = 'right'; cx.fillText('Price 45p', x + pw * 0.95, y + ph * 0.262);
    cx.fillRect(x + pw * 0.04, y + ph * 0.285, pw * 0.92, 1.5);
    cx.textAlign = 'left';
    const f = fit(cx, d.headline || '', (z) => `bold ${z}px ${SERIF}`, pw * 0.9, ph * 0.22, ph * 0.1, 1.08);
    f.lines.forEach((l, i) => cx.fillText(l, x + pw * 0.05, y + ph * 0.37 + i * f.size * 1.08));
    const top = y + ph * 0.37 + (f.lines.length - 1) * f.size * 1.08 + ph * 0.05, bot = y + ph * 0.94;
    const px = x + pw * 0.05, pwid = pw * 0.36;
    cx.fillStyle = '#aaa393'; cx.fillRect(px, top, pwid, bot - top);
    cx.fillStyle = 'rgba(40,36,30,.3)';
    for (let i = 0; i < 90; i++) { cx.beginPath(); cx.arc(px + rnd() * pwid, top + rnd() * (bot - top), 2 + rnd() * 5, 0, PI2); cx.fill(); }
    cx.fillStyle = 'rgba(40,36,30,.5)';
    for (let c = 0; c < 3; c++) {
      const x0 = px + pwid + pw * 0.03 + c * pw * 0.18;
      for (let ly = top + 4; ly < bot; ly += 13) cx.fillRect(x0, ly, pw * (0.15 - (rnd() < 0.15 ? rnd() * 0.08 : 0)), 5);
    }
    cx.strokeStyle = 'rgba(120,80,30,.2)'; cx.lineWidth = 8; cx.beginPath(); cx.arc(x + pw * 0.86, y + ph * 0.8, ph * 0.1, 0.3, 5.9); cx.stroke();
  }
  newspaper.size = [900, 640];

  function poster(cx, w, h, d) {
    const lines = d.lines || [];
    tilt(cx, w, h, 0.012);
    const x = w * 0.06, y = h * 0.04, pw = w * 0.88, ph = h * 0.92;
    shadow(cx, 22, 8); cx.fillStyle = '#f5eedb'; cx.fillRect(x, y, pw, ph); noShadow(cx);
    cx.strokeStyle = '#7a1f2b'; cx.lineWidth = 3; cx.strokeRect(x + 16, y + 16, pw - 32, ph - 32);
    for (const px of [x + 30, x + pw - 30]) {
      cx.fillStyle = '#c0282d'; cx.beginPath(); cx.arc(px, y + 28, 11, 0, PI2); cx.fill();
      cx.fillStyle = 'rgba(255,255,255,.55)'; cx.beginPath(); cx.arc(px - 3, y + 24, 4, 0, PI2); cx.fill();
    }
    cx.textAlign = 'center'; cx.textBaseline = 'alphabetic';
    let yy = y + ph * 0.07;
    if (lines[0]) {
      const f = fit(cx, String(lines[0]).toUpperCase(), (z) => `bold ${z}px ${SERIF}`, pw * 0.78, ph * 0.24, 54, 1.1);
      cx.fillStyle = '#7a1f2b';
      for (const l of f.lines) { yy += f.size * 1.1; cx.fillText(l, w / 2, yy); }
      yy += 18; cx.fillRect(w / 2 - 60, yy, 120, 3); yy += 14;
    }
    const rest = lines.slice(1);
    const z0 = Math.min(31, (y + ph * 0.9 - yy) / Math.max(1, rest.length * 3.3));
    for (const l of rest) {
      const star = String(l).startsWith('*'), t = star ? l.slice(1).trim() : l, z = star ? z0 * 1.15 : z0;
      cx.font = `${star ? 'bold ' : ''}${z}px ${SERIF}`;
      const ws = wrap(cx, t, pw * 0.78);
      if (star) { cx.fillStyle = 'rgba(255,210,31,.5)'; cx.fillRect(x + pw * 0.07, yy + z * 0.35, pw * 0.86, ws.length * z * 1.3 + z * 0.3); }
      cx.fillStyle = '#26221c';
      for (const s of ws) { yy += z * 1.3; cx.fillText(s, w / 2, yy); }
      yy += z * 0.8;
    }
  }
  poster.size = [600, 800];

  function badge(cx, w, h, d) {
    const back = d.back != null && d.back !== false, old = !!d.old;
    seedOf(String(d.name) + d.back);
    const cw = w * 0.62, ch = h * 0.6, x = (w - cw) / 2, y = h * 0.34;
    cx.fillStyle = old ? '#86a9bd' : '#3fb6e8';
    cx.beginPath(); cx.moveTo(w / 2 - 74, 0); cx.lineTo(w / 2 - 12, y - 46); cx.lineTo(w / 2 + 12, y - 46); cx.lineTo(w / 2 + 74, 0); cx.closePath(); cx.fill();
    cx.fillStyle = 'rgba(0,0,0,.12)'; cx.beginPath(); cx.moveTo(w / 2 - 2, 0); cx.lineTo(w / 2, y - 46); cx.lineTo(w / 2 + 2, 0); cx.fill();
    const g = cx.createLinearGradient(w / 2 - 20, 0, w / 2 + 20, 0); g.addColorStop(0, '#8d949c'); g.addColorStop(0.5, '#eef1f4'); g.addColorStop(1, '#7c838b');
    cx.fillStyle = g; rr(cx, w / 2 - 18, y - 56, 36, 42, 7); cx.fill(); rr(cx, w / 2 - 6, y - 18, 12, 34, 3); cx.fill();
    shadow(cx, 24, 10);
    cx.fillStyle = old ? '#efe7d2' : '#fdfdfb'; rr(cx, x, y, cw, ch, 18); cx.fill(); noShadow(cx);
    cx.fillStyle = '#2a2d33'; rr(cx, w / 2 - 34, y + 14, 68, 12, 6); cx.fill();
    cx.textAlign = 'center'; cx.textBaseline = 'alphabetic';
    if (!back) {
      cx.fillStyle = '#15161a'; cx.fillRect(x, y + 38, cw, ch * 0.22);
      hand(cx, 'Yes', x + cw * 0.08, y + 38 + ch * 0.165, ch * 0.16, '#ffd21f', { felt: true, bold: true });
      const f = fit(cx, String(d.name || '').toUpperCase(), (z) => `bold ${z}px ${SANS}`, cw * 0.84, ch * 0.34, ch * 0.3, 1);
      cx.fillStyle = '#16171b'; cx.font = `bold ${f.size}px ${SANS}`; cx.fillText(f.lines[0], w / 2, y + ch * 0.78);
    } else {
      cx.fillStyle = '#a0a6ae'; cx.font = `${ch * 0.05}px ${SYS}`;
      cx.fillText('If found, please return to your nearest store.', w / 2, y + ch * 0.93, cw * 0.9);
      hand(cx, String(d.back), w / 2 - ch * 0.04, y + ch * 0.7, ch * 0.34, '#2340b0', { align: 'center', pen: true, slant: -0.06 });
    }
  }
  badge.size = [640, 520];

  function calendar(cx, w, h, d) {
    const m = /([A-Za-z]+)\s*(\d{4})/.exec(d.month || 'October 2026') || [0, 'October', '2026'];
    const mi = Math.max(0, MONTHS.findIndex((n) => n.startsWith(m[1].toUpperCase().slice(0, 3)))), yr = +m[2];
    seedOf(String(d.month) + d.circle);
    const x = w * 0.06, y = h * 0.04, pw = w * 0.88, ph = h * 0.93;
    shadow(cx, 24, 10); cx.fillStyle = '#fbfaf6'; cx.fillRect(x, y, pw, ph); noShadow(cx);
    const px = x + pw * 0.05, py = y + ph * 0.05, pwid = pw * 0.9, phh = ph * 0.3;
    cx.save(); cx.beginPath(); cx.rect(px, py, pwid, phh); cx.clip();
    if (yr < 2000) { // this month's picture is a donkey
      let g = cx.createLinearGradient(0, py, 0, py + phh); g.addColorStop(0, '#a9c4dc'); g.addColorStop(1, '#e3ecf2'); cx.fillStyle = g; cx.fillRect(px, py, pwid, phh);
      cx.fillStyle = '#7fa35a'; cx.beginPath(); cx.ellipse(px + pwid * 0.3, py + phh * 1.1, pwid * 0.6, phh * 0.55, 0, 0, PI2); cx.fill();
      cx.fillStyle = '#6a904a'; cx.beginPath(); cx.ellipse(px + pwid * 0.85, py + phh * 1.15, pwid * 0.5, phh * 0.5, 0, 0, PI2); cx.fill();
      const dx = px + pwid * 0.5, dy = py + phh * 0.62, s = phh * 0.28, col = '#8a7d70';
      cx.fillStyle = col;
      for (const lx of [-0.8, -0.45, 0.45, 0.8]) cx.fillRect(dx + lx * s - 4, dy, 8, s * 0.95);
      cx.beginPath(); cx.ellipse(dx, dy, s * 1.05, s * 0.55, 0, 0, PI2); cx.fill();
      cx.beginPath(); cx.moveTo(dx + s * 0.8, dy - s * 0.2); cx.lineTo(dx + s * 1.2, dy - s * 0.9); cx.lineTo(dx + s * 1.45, dy - s * 0.7); cx.lineTo(dx + s * 1.1, dy); cx.fill();
      cx.beginPath(); cx.ellipse(dx + s * 1.45, dy - s * 0.72, s * 0.34, s * 0.22, 0.5, 0, PI2); cx.fill();
      cx.beginPath(); cx.ellipse(dx + s * 1.18, dy - s * 1.12, s * 0.08, s * 0.32, -0.3, 0, PI2); cx.ellipse(dx + s * 1.34, dy - s * 1.1, s * 0.08, s * 0.32, 0.2, 0, PI2); cx.fill();
      cx.fillStyle = '#e8e2d8'; cx.beginPath(); cx.ellipse(dx + s * 1.66, dy - s * 0.64, s * 0.14, s * 0.12, 0, 0, PI2); cx.fill();
      cx.fillStyle = '#222'; cx.beginPath(); cx.arc(dx + s * 1.42, dy - s * 0.82, 2.5, 0, PI2); cx.fill();
      cx.strokeStyle = col; cx.lineWidth = 4; cx.beginPath(); cx.moveTo(dx - s, dy - s * 0.1); cx.quadraticCurveTo(dx - s * 1.35, dy + s * 0.2, dx - s * 1.25, dy + s * 0.6); cx.stroke();
    } else { // a city before dawn
      const g = cx.createLinearGradient(0, py, 0, py + phh); g.addColorStop(0, '#1d2a55'); g.addColorStop(0.7, '#e7925a'); g.addColorStop(1, '#f6c27a'); cx.fillStyle = g; cx.fillRect(px, py, pwid, phh);
      for (let bx = px; bx < px + pwid; bx += 18 + rnd() * 22) {
        const bw = 16 + rnd() * 26, bh = phh * (0.25 + rnd() * 0.6);
        cx.fillStyle = '#18203c'; cx.fillRect(bx, py + phh - bh, bw, bh);
        cx.fillStyle = 'rgba(255,214,120,.7)';
        for (let wy = py + phh - bh + 6; wy < py + phh - 4; wy += 9) for (let wx = bx + 3; wx < bx + bw - 4; wx += 7) if (rnd() < 0.3) cx.fillRect(wx, wy, 3, 4);
      }
    }
    cx.restore();
    for (let i = 0; i < 13; i++) { cx.strokeStyle = '#50555c'; cx.lineWidth = 4; cx.beginPath(); cx.ellipse(x + pw * 0.1 + i * pw * 0.067, y + 2, 5, 13, 0, 0, PI2); cx.stroke(); }
    cx.fillStyle = '#c0392b'; cx.font = `bold ${ph * 0.052}px ${SANS}`; cx.textAlign = 'center'; cx.textBaseline = 'alphabetic';
    cx.fillText(`${MONTHS[mi]} ${yr}`, w / 2, y + ph * 0.42);
    const gx = x + pw * 0.06, gw = pw * 0.88, cwid = gw / 7, gy = y + ph * 0.48, rh = ph * 0.062;
    cx.font = `bold ${rh * 0.38}px ${SANS}`; cx.fillStyle = '#6b7079';
    'MTWTFSS'.split('').forEach((c, i) => cx.fillText(c, gx + cwid * (i + 0.5), gy));
    const first = (new Date(yr, mi, 1).getDay() + 6) % 7, days = new Date(yr, mi + 1, 0).getDate();
    cx.font = `${rh * 0.5}px ${SANS}`;
    let cpos = null;
    for (let dd = 1; dd <= days; dd++) {
      const k = first + dd - 1, col = k % 7, row = Math.floor(k / 7), tx = gx + cwid * (col + 0.5), ty = gy + rh * (row + 1.05);
      cx.fillStyle = col === 6 ? '#c0392b' : '#2b2f36'; cx.fillText(dd, tx, ty);
      if (+d.circle === dd) cpos = [tx, ty - rh * 0.17];
    }
    cx.fillStyle = 'rgba(0,0,0,.07)';
    for (let r = 0; r <= 6; r++) cx.fillRect(gx, gy + rh * (r + 0.3), gw, 1.5);
    if (cpos) {
      cx.strokeStyle = '#d42a1e'; cx.lineWidth = 5; cx.lineCap = 'round';
      cx.beginPath(); cx.ellipse(cpos[0], cpos[1], cwid * 0.5, rh * 0.52, -0.12, 0.3, PI2 + 0.6); cx.stroke();
    }
    if (d.text) {
      const z = Math.min(ph * 0.05, (pw * 0.86) / Math.max(1, String(d.text).length * 0.55));
      hand(cx, d.text, w / 2, y + ph * 0.955, z, '#d42a1e', { align: 'center', felt: true });
    }
  }
  calendar.size = [600, 800];

  function watch(cx, w, h, d) {
    const [hh, mm] = hm(d.time), x = w / 2, y = h / 2, r = w * 0.3;
    cx.fillStyle = '#5a3a22'; rr(cx, x - r * 0.62, 0, r * 1.24, h, 14); cx.fill();
    cx.strokeStyle = 'rgba(255,230,190,.35)'; cx.setLineDash([8, 7]); cx.lineWidth = 2;
    for (const s of [-1, 1]) { cx.beginPath(); cx.moveTo(x + s * r * 0.5, 0); cx.lineTo(x + s * r * 0.5, h); cx.stroke(); }
    cx.setLineDash([]);
    shadow(cx, 26, 10);
    const g = cx.createLinearGradient(x - r, y - r, x + r, y + r); g.addColorStop(0, '#f3f4f6'); g.addColorStop(0.5, '#9ea3aa'); g.addColorStop(1, '#e1e3e6');
    cx.fillStyle = g; cx.beginPath(); cx.arc(x, y, r * 1.12, 0, PI2); cx.fill(); noShadow(cx);
    cx.fillStyle = '#b8bcc2'; rr(cx, x + r * 1.08, y - 14, 22, 28, 5); cx.fill();
    cx.fillStyle = '#0f1a33'; cx.beginPath(); cx.arc(x, y, r, 0, PI2); cx.fill();
    cx.fillStyle = '#e9e4d6';
    for (let i = 0; i < 12; i++) { cx.save(); cx.translate(x, y); cx.rotate(i / 12 * PI2); cx.fillRect(-(i % 3 ? 3 : 6), -r * 0.92, i % 3 ? 6 : 12, r * (i % 3 ? 0.1 : 0.16)); cx.restore(); }
    cx.fillStyle = '#c7cfb9'; rr(cx, x - r * 0.42, y + r * 0.3, r * 0.84, r * 0.3, 6); cx.fill();
    cx.fillStyle = '#1b2414'; cx.font = `bold ${r * 0.22}px ${MONO}`; cx.textAlign = 'center'; cx.textBaseline = 'middle';
    cx.fillText(String(d.time || ''), x, y + r * 0.46);
    hands(cx, x, y, r, hh, mm, null, '#f4f1e8');
  }
  watch.size = [560, 640];

  function label(cx, w, h, d) { // cassette with a felt-tip label
    seedOf(d.text);
    const x = w * 0.05, y = h * 0.06, cw = w * 0.9, ch = h * 0.88;
    shadow(cx, 28, 12); cx.fillStyle = '#26282d'; rr(cx, x, y, cw, ch, 22); cx.fill(); noShadow(cx);
    for (const [sx, sy] of [[0.035, 0.05], [0.965, 0.05], [0.035, 0.94], [0.965, 0.94], [0.5, 0.94]]) screw(cx, x + cw * sx, y + ch * sy, 8);
    const lx = x + cw * 0.07, ly = y + ch * 0.08, lw = cw * 0.86, lh = ch * 0.64;
    cx.save(); rr(cx, lx, ly, lw, lh, 10); cx.clip();
    cx.fillStyle = '#f6f1e3'; cx.fillRect(lx, ly, lw, lh);
    cx.fillStyle = '#e8743b'; cx.fillRect(lx, ly + lh * 0.82, lw, lh * 0.18);
    cx.fillStyle = 'rgba(70,110,200,.3)'; for (let i = 1; i <= 3; i++) cx.fillRect(lx + lw * 0.1, ly + lh * 0.1 * i + lh * 0.05, lw * 0.8, 2);
    cx.restore();
    cx.strokeStyle = '#26282d'; cx.lineWidth = 2; cx.strokeRect(lx + 14, ly + 14, 34, 34);
    cx.fillStyle = '#26282d'; cx.font = `bold 26px ${SANS}`; cx.textAlign = 'center'; cx.textBaseline = 'middle'; cx.fillText('A', lx + 31, ly + 32);
    const z = Math.min(lh * 0.24, (lw * 0.74) / Math.max(1, String(d.text || '').length * 0.62));
    hand(cx, d.text || '', w / 2, ly + lh * 0.34, z, '#16171c', { align: 'center', felt: true });
    const wx = lx + lw * 0.2, wy = ly + lh * 0.45, ww = lw * 0.6, wh = lh * 0.3;
    cx.fillStyle = '#3b3431'; rr(cx, wx, wy, ww, wh, wh / 2); cx.fill();
    cx.fillStyle = '#5a3a28'; cx.beginPath(); cx.arc(wx + wh * 0.62, wy + wh / 2, wh * 0.46, 0, PI2); cx.fill();
    cx.beginPath(); cx.arc(wx + ww - wh * 0.62, wy + wh / 2, wh * 0.3, 0, PI2); cx.fill();
    for (const rx of [wx + wh * 0.62, wx + ww - wh * 0.62]) {
      cx.fillStyle = '#f0ede6'; cx.beginPath(); cx.arc(rx, wy + wh / 2, wh * 0.2, 0, PI2); cx.fill();
      cx.fillStyle = '#3b3431'; cx.beginPath(); cx.arc(rx, wy + wh / 2, wh * 0.08, 0, PI2); cx.fill();
      for (let i = 0; i < 6; i++) { const a = i / 6 * PI2; cx.fillRect(rx + Math.cos(a) * wh * 0.1 - 3, wy + wh / 2 + Math.sin(a) * wh * 0.1 - 3, 6, 6); }
    }
    cx.fillStyle = 'rgba(255,255,255,.12)'; rr(cx, wx + 8, wy + 5, ww - 16, wh * 0.25, wh * 0.12); cx.fill();
    cx.fillStyle = '#1c1e22';
    cx.beginPath(); cx.moveTo(x + cw * 0.18, y + ch); cx.lineTo(x + cw * 0.24, y + ch * 0.8); cx.lineTo(x + cw * 0.76, y + ch * 0.8); cx.lineTo(x + cw * 0.82, y + ch); cx.fill();
    cx.fillStyle = '#0c0d10'; for (const hx of [0.32, 0.4, 0.6, 0.68]) { cx.beginPath(); cx.arc(x + cw * hx, y + ch * 0.9, 7, 0, PI2); cx.fill(); }
  }
  label.size = [900, 580];

  function list(cx, w, h, d) { // handwritten list; paper 'sheet' | 'notebook' | 'printout'; skull = targets sheet showing through
    const its = (d.items || []).map((it) => (typeof it === 'string' ? { text: it } : it));
    seedOf(String(d.title) + its.length);
    let x = w * 0.07, y = h * 0.04, pw = w * 0.86, ph = h * 0.92;
    if (d.frame) {
      shadow(cx, 26, 10);
      const g = cx.createLinearGradient(0, 0, w, h); g.addColorStop(0, '#6b4424'); g.addColorStop(1, '#3a2312');
      cx.fillStyle = g; cx.fillRect(w * 0.02, h * 0.015, w * 0.96, h * 0.97); noShadow(cx);
      cx.fillStyle = '#e9e4d8'; cx.fillRect(w * 0.07, h * 0.05, w * 0.86, h * 0.9);
      x = w * 0.13; y = h * 0.09; pw = w * 0.74; ph = h * 0.82;
    } else { tilt(cx, w, h, -0.012); shadow(cx, 22, 8); }
    const paper = d.paper || 'sheet';
    cx.fillStyle = paper === 'notebook' ? '#fbf8ee' : '#fdfdfb'; cx.fillRect(x, y, pw, ph); noShadow(cx);
    cx.save(); cx.beginPath(); cx.rect(x, y, pw, ph); cx.clip();
    if (paper === 'notebook') {
      cx.fillStyle = 'rgba(80,130,210,.28)'; for (let ly = y + ph * 0.12; ly < y + ph; ly += ph * 0.052) cx.fillRect(x, ly, pw, 1.5);
      cx.fillStyle = 'rgba(220,60,60,.4)'; cx.fillRect(x + pw * 0.1, y, 2, ph);
    }
    if (paper === 'printout' || d.skull) { // the other side, mirrored and faint
      cx.save(); cx.translate(x * 2 + pw, 0); cx.scale(-1, 1); cx.globalAlpha = 0.08; cx.fillStyle = '#222';
      if (paper === 'printout') {
        cx.font = `${ph * 0.028}px ${MONO}`;
        const err = ['JARVIS SYSTEMS  ERROR REPORT', 'ERR 4044: SESSION FORGOT USER', 'ERR 4044: USER FORGOT SESSION', 'RETRY? Y/N', 'TICKET NOT LOGGED (TICKET SYSTEM DOWN)'];
        for (let i = 0; i < 18; i++) cx.fillText(err[i % err.length], x + pw * 0.1, y + ph * 0.06 + i * ph * 0.05);
      } else {
        cx.font = `bold ${ph * 0.04}px ${SANS}`; cx.fillText('SALES TARGETS — WK 39', x + pw * 0.08, y + ph * 0.08);
        cx.font = `${ph * 0.032}px ${SANS}`;
        ['Mobile', 'Home Internet', 'Accessories', 'Insurance', 'Recontracts', 'Upgrades'].forEach((r, i) => {
          const ry = y + ph * (0.16 + i * 0.07);
          cx.fillText(r, x + pw * 0.08, ry); cx.fillRect(x + pw * 0.06, ry + ph * 0.02, pw * 0.88, 2);
          if (r === 'Recontracts') { cx.globalAlpha = 0.22; skull(cx, x + pw * 0.5, ry - ph * 0.012, ph * 0.05, '#1d2f8f'); cx.globalAlpha = 0.08; }
        });
      }
      cx.restore();
    }
    if (paper === 'printout') { cx.fillStyle = '#e9e9ee'; for (let ly = y + 14; ly < y + ph; ly += 30) { cx.beginPath(); cx.arc(x + 14, ly, 6, 0, PI2); cx.arc(x + pw - 14, ly, 6, 0, PI2); cx.fill(); } }
    cx.restore();
    const n = its.length + (d.title ? 1.6 : 0), tick = d.ticks ? 1.3 : 0.9;
    let z = Math.min(ph * 0.07, (ph * 0.84) / Math.max(n, 1) / 1.32);
    cx.font = `100px ${HAND}`;
    let mw = 1; for (const it of its) mw = Math.max(mw, cx.measureText(it.text).width / 100);
    z = Math.min(z, (pw * 0.8) / (mw + tick));
    let yy = y + ph * 0.07 + z;
    const lx = x + pw * (paper === 'notebook' ? 0.13 : 0.08);
    if (d.title) {
      const tw = hand(cx, d.title, lx, yy, z * 1.2, BIRO, { pen: true, bold: true });
      cx.strokeStyle = BIRO; cx.lineWidth = 2.5; cx.beginPath(); cx.moveTo(lx, yy + z * 0.25);
      for (let k = 1; k <= 8; k++) cx.lineTo(lx + tw * k / 8, yy + z * 0.25 + (rnd() - 0.5) * 4); cx.stroke();
      yy += z * 1.6 * 1.25;
    }
    for (const it of its) {
      let tx = lx + z * 0.9;
      if (d.ticks) {
        cx.strokeStyle = BIRO; cx.lineWidth = 2.2; cx.strokeRect(lx, yy - z * 0.72, z * 0.72, z * 0.72);
        if (it.done) { cx.lineWidth = 3.5; cx.lineCap = 'round'; cx.beginPath(); cx.moveTo(lx + z * 0.12, yy - z * 0.4); cx.lineTo(lx + z * 0.32, yy - z * 0.1); cx.lineTo(lx + z * 0.85, yy - z * 1.0); cx.stroke(); }
        tx = lx + z * 1.2;
      } else hand(cx, '–', lx, yy, z, BIRO);
      hand(cx, it.text, tx, yy, z, BIRO, { pen: true });
      yy += z * 1.32;
    }
    if (d.frame) { const g = cx.createLinearGradient(0, 0, w, h); g.addColorStop(0, 'rgba(255,255,255,.14)'); g.addColorStop(0.4, 'rgba(255,255,255,0)'); cx.fillStyle = g; cx.fillRect(w * 0.07, h * 0.05, w * 0.86, h * 0.9); }
  }
  list.size = [700, 800];

  function polaroid(cx, w, h, d) {
    const fw = w * 0.84, fh = h * 0.9, x = (w - fw) / 2, y = (h - fh) / 2;
    tilt(cx, w, h, d.front ? -0.03 : 0.04);
    shadow(cx, 26, 10);
    if (!d.front) { // we only ever see the back
      cx.fillStyle = '#2b2825'; cx.fillRect(x, y, fw, fh); noShadow(cx);
      cx.strokeStyle = 'rgba(255,255,255,.08)'; cx.lineWidth = 6; cx.strokeRect(x + 3, y + 3, fw - 6, fh - 6);
      seedOf('polaroid'); cx.fillStyle = 'rgba(255,255,255,.035)'; for (let i = 0; i < 400; i++) cx.fillRect(x + rnd() * fw, y + rnd() * fh, 2, 2);
      return;
    }
    cx.fillStyle = '#fbfbf6'; cx.fillRect(x, y, fw, fh); noShadow(cx);
    const m = fw * 0.07, iw = fw - 2 * m;
    const c = document.createElement('canvas'); c.width = c.height = 240; const p = c.getContext('2d');
    let g = p.createLinearGradient(0, 0, 0, 240); g.addColorStop(0, '#b9c3cc'); g.addColorStop(1, '#8e969c'); p.fillStyle = g; p.fillRect(0, 0, 240, 240);
    p.fillStyle = '#8c857a'; p.fillRect(0, 40, 240, 200);                      // the gate's stone front
    p.fillStyle = '#2e2b28'; p.beginPath(); p.moveTo(80, 200); p.lineTo(80, 110); p.arc(120, 110, 40, Math.PI, 0); p.lineTo(160, 200); p.fill(); // arch
    p.fillStyle = '#6d675f'; p.fillRect(0, 196, 240, 44);                      // cobbles
    const fig = (q, fx, shirt, legs, hair, tall) => {
      q.fillStyle = legs; q.fillRect(fx - 11, 170 - tall, 9, 60 + tall); q.fillRect(fx + 2, 170 - tall, 9, 60 + tall);
      q.fillStyle = shirt; q.beginPath(); q.roundRect(fx - 17, 118 - tall, 34, 58, 8); q.fill();
      q.fillStyle = '#e4c2a2'; q.beginPath(); q.arc(fx, 102 - tall, 13, 0, PI2); q.fill();
      q.fillStyle = hair; q.beginPath(); q.arc(fx, 97 - tall, 13, Math.PI, 0); q.fill();
    };
    // "two blurry figures in polos and a young man in a blazer": only the two of them are blurred
    const bc = document.createElement('canvas'); bc.width = bc.height = 240; const bq = bc.getContext('2d');
    fig(bq, 66, '#16171b', '#1a1a1e', '#4a3222', 0); bq.fillStyle = '#ffd21f'; bq.fillRect(56, 128, 6, 4); // Luka
    fig(p, 120, '#23305a', '#b9ad94', '#3a2a1c', 6); p.fillStyle = '#e6dff0'; p.fillRect(116, 114, 8, 18);  // Rue, blazer
    fig(bq, 174, '#1f6fe0', '#5b7fae', '#5a3b24', -2);                            // Chase
    const s = document.createElement('canvas'); s.width = s.height = 44; s.getContext('2d').drawImage(bc, 0, 0, 44, 44);
    cx.save(); cx.imageSmoothingQuality = 'high'; cx.filter = 'blur(1px)'; cx.drawImage(c, x + m, y + m, iw, iw);
    cx.filter = 'blur(2px)'; cx.drawImage(s, x + m, y + m, iw, iw); cx.restore();
    cx.fillStyle = 'rgba(245,238,220,.2)'; cx.fillRect(x + m, y + m, iw, iw);
    const dev = d.dev ?? 1;
    if (dev < 1) { cx.fillStyle = `rgba(48,56,46,${(1 - dev) * 0.95})`; cx.fillRect(x + m, y + m, iw, iw); }
  }
  polaroid.size = [560, 660];

  function plaque(cx, w, h, d) {
    const x = w * 0.05, y = h * 0.12, pw = w * 0.9, ph = h * 0.76;
    shadow(cx, 20, 8); cx.fillStyle = brass(cx, x, y, pw, ph); rr(cx, x, y, pw, ph, 14); cx.fill(); noShadow(cx);
    cx.strokeStyle = 'rgba(70,48,12,.55)'; cx.lineWidth = 3; rr(cx, x + 22, y + 22, pw - 44, ph - 44, 8); cx.stroke();
    for (const [sx, sy] of [[0, 0], [1, 0], [0, 1], [1, 1]]) screw(cx, x + 12 + sx * (pw - 24), y + 12 + sy * (ph - 24), 7);
    const t = String(d.text || '').toUpperCase(), f = fit(cx, t, (z) => `bold ${z}px ${SERIF}`, pw * 0.8, ph * 0.6, ph * 0.3, 1.15);
    if ('letterSpacing' in cx) cx.letterSpacing = Math.round(f.size * 0.12) + 'px';
    f.lines.forEach((l, i) => engrave(cx, l, w / 2, y + ph / 2 + (i - (f.lines.length - 1) / 2) * f.size * 1.15, `bold ${f.size}px ${SERIF}`));
  }
  plaque.size = [900, 360];

  function nameplate(cx, w, h, d) {
    const parts = String(d.text || '').split(' — ');
    shadow(cx, 24, 12);
    cx.fillStyle = '#4a2c17'; cx.beginPath(); cx.moveTo(w * 0.04, h * 0.3); cx.lineTo(w * 0.96, h * 0.3); cx.lineTo(w * 0.985, h * 0.92); cx.lineTo(w * 0.015, h * 0.92); cx.closePath(); cx.fill();
    noShadow(cx);
    cx.fillStyle = '#6e452a'; cx.beginPath(); cx.moveTo(w * 0.09, h * 0.12); cx.lineTo(w * 0.91, h * 0.12); cx.lineTo(w * 0.96, h * 0.3); cx.lineTo(w * 0.04, h * 0.3); cx.closePath(); cx.fill();
    seedOf('grain'); cx.strokeStyle = 'rgba(30,15,5,.35)'; cx.lineWidth = 2;
    for (let i = 0; i < 12; i++) { const gy = h * (0.34 + rnd() * 0.55); cx.beginPath(); cx.moveTo(w * 0.03, gy); cx.bezierCurveTo(w * 0.3, gy + rnd() * 20 - 10, w * 0.7, gy + rnd() * 20 - 10, w * 0.97, gy); cx.stroke(); }
    const px = w * 0.1, py = h * 0.38, pw = w * 0.8, ph = h * 0.44;
    cx.fillStyle = brass(cx, px, py, pw, ph); rr(cx, px, py, pw, ph, 8); cx.fill();
    cx.strokeStyle = 'rgba(70,48,12,.5)'; cx.lineWidth = 2; rr(cx, px + 10, py + 10, pw - 20, ph - 20, 4); cx.stroke();
    if ('letterSpacing' in cx) cx.letterSpacing = '4px';
    const f = fit(cx, parts[0].toUpperCase(), (z) => `bold ${z}px ${SERIF}`, pw * 0.86, ph * 0.5, ph * 0.34, 1);
    engrave(cx, f.lines.join(' '), w / 2, py + ph * (parts[1] ? 0.4 : 0.5), `bold ${f.size}px ${SERIF}`);
    if (parts[1]) { if ('letterSpacing' in cx) cx.letterSpacing = '10px'; engrave(cx, parts[1].toUpperCase(), w / 2, py + ph * 0.74, `${ph * 0.15}px ${SERIF}`); }
  }
  nameplate.size = [960, 380];

  function tv(cx, w, h, d) {
    const news = d.kind === 'news';
    shadow(cx, 28, 12);
    cx.fillStyle = news ? '#5b3a22' : '#3b3d42'; rr(cx, w * 0.03, h * 0.04, w * 0.94, h * 0.9, 34); cx.fill(); noShadow(cx);
    if (news) { seedOf('wood'); cx.strokeStyle = 'rgba(0,0,0,.18)'; cx.lineWidth = 2; for (let i = 0; i < 16; i++) { const gy = h * (0.08 + i * 0.053); cx.beginPath(); cx.moveTo(w * 0.05, gy); cx.bezierCurveTo(w * 0.3, gy + rnd() * 12, w * 0.6, gy - rnd() * 12, w * 0.95, gy); cx.stroke(); } }
    const sx = w * 0.08, sy = h * 0.1, sw = news ? w * 0.66 : w * 0.84, sh = h * 0.7;
    cx.fillStyle = '#0d0d0f'; rr(cx, sx - 12, sy - 12, sw + 24, sh + 24, 44); cx.fill();
    cx.save(); rr(cx, sx, sy, sw, sh, 38); cx.clip();
    if (news) {
      cx.fillStyle = '#0d1b3d'; cx.fillRect(sx, sy, sw, sh);
      cx.fillStyle = '#c8231f'; cx.fillRect(sx, sy + sh * 0.08, sw, sh * 0.13);
      cx.fillStyle = '#fff'; cx.font = `bold ${sh * 0.085}px ${SANS}`; cx.textAlign = 'left'; cx.textBaseline = 'middle';
      cx.fillText('NEWSFLASH', sx + sw * 0.07, sy + sh * 0.145);
      cx.font = `bold ${sh * 0.07}px ${SANS}`; cx.fillText(d.text || 'SHARES IN FREEFALL', sx + sw * 0.07, sy + sh * 0.3, sw * 0.86);
      [['NEW YORK', '−508.00'], ['LONDON', '−249.60'], ['TOKYO', '−620.18'], ['HONG KONG', '−420.81']].forEach(([n, v], i) => {
        const ry = sy + sh * (0.44 + i * 0.12);
        cx.fillStyle = '#dfe6f5'; cx.font = `bold ${sh * 0.06}px ${MONO}`; cx.fillText(n, sx + sw * 0.07, ry);
        cx.fillStyle = '#ff4637'; cx.textAlign = 'right'; cx.fillText('▼ ' + v, sx + sw * 0.93, ry); cx.textAlign = 'left';
      });
    } else {
      let g = cx.createLinearGradient(sx, sy, sx, sy + sh); g.addColorStop(0, '#f2bb7c'); g.addColorStop(1, '#8a4f2a'); cx.fillStyle = g; cx.fillRect(sx, sy, sw, sh);
      seedOf('bokeh'); for (let i = 0; i < 14; i++) { cx.fillStyle = `rgba(255,236,190,${0.08 + rnd() * 0.12})`; cx.beginPath(); cx.arc(sx + rnd() * sw, sy + rnd() * sh * 0.6, 12 + rnd() * 30, 0, PI2); cx.fill(); }
      const mx = sx + sw / 2, hy = sy + sh * 0.36, hr = sh * 0.15;
      cx.fillStyle = '#1d2a4d'; cx.beginPath(); cx.ellipse(mx, sy + sh * 1.02, sw * 0.3, sh * 0.42, 0, 0, PI2); cx.fill();
      cx.fillStyle = '#f4f4f0'; cx.beginPath(); cx.moveTo(mx - sw * 0.07, sy + sh * 0.62); cx.lineTo(mx + sw * 0.07, sy + sh * 0.62); cx.lineTo(mx, sy + sh * 0.84); cx.fill();
      cx.fillStyle = '#dcb38f'; cx.fillRect(mx - hr * 0.35, hy + hr * 0.7, hr * 0.7, hr * 0.8);
      cx.fillStyle = '#e8c4a2'; cx.beginPath(); cx.ellipse(mx, hy, hr * 0.78, hr, 0, 0, PI2); cx.fill();
      cx.beginPath(); cx.ellipse(mx - hr * 0.8, hy + hr * 0.1, hr * 0.14, hr * 0.22, 0, 0, PI2); cx.ellipse(mx + hr * 0.8, hy + hr * 0.1, hr * 0.14, hr * 0.22, 0, 0, PI2); cx.fill();
      cx.fillStyle = '#d6d9df'; cx.beginPath(); cx.ellipse(mx, hy - hr * 0.55, hr * 0.84, hr * 0.5, 0, Math.PI * 1.02, Math.PI * 1.98); cx.fill();
      cx.fillRect(mx - hr * 0.8, hy - hr * 0.6, hr * 0.2, hr * 0.5); cx.fillRect(mx + hr * 0.6, hy - hr * 0.6, hr * 0.2, hr * 0.5);
      cx.strokeStyle = '#3a3a40'; cx.lineWidth = 3;
      for (const e of [-1, 1]) { rr(cx, mx + e * hr * 0.36 - hr * 0.22, hy - hr * 0.08, hr * 0.44, hr * 0.28, 6); cx.stroke(); cx.fillStyle = '#2a2a30'; cx.beginPath(); cx.arc(mx + e * hr * 0.36, hy + hr * 0.06, 3.5, 0, PI2); cx.fill(); }
      cx.beginPath(); cx.moveTo(mx - hr * 0.14, hy); cx.lineTo(mx + hr * 0.14, hy); cx.stroke();
      cx.strokeStyle = '#8a4f3a'; cx.lineWidth = 3.5; cx.beginPath(); cx.arc(mx, hy + hr * 0.35, hr * 0.3, 0.35, Math.PI - 0.35); cx.stroke();
      cx.fillStyle = 'rgba(20,29,58,.88)'; cx.fillRect(sx, sy + sh * 0.78, sw, sh * 0.13);
      cx.fillStyle = '#ffd21f'; cx.fillRect(sx + sw * 0.06, sy + sh * 0.8, 6, sh * 0.09);
      cx.fillStyle = '#fff'; cx.font = `${sh * 0.055}px ${SANS}`; cx.textAlign = 'left'; cx.textBaseline = 'middle';
      cx.fillText(d.text || 'A message from Rue, CEO', sx + sw * 0.09, sy + sh * 0.845, sw * 0.82);
    }
    const g = cx.createRadialGradient(sx + sw * 0.35, sy + sh * 0.25, 10, sx + sw / 2, sy + sh / 2, sw * 0.75);
    g.addColorStop(0, 'rgba(255,255,255,.13)'); g.addColorStop(0.5, 'rgba(255,255,255,0)'); g.addColorStop(1, 'rgba(0,0,0,.35)');
    cx.fillStyle = g; cx.fillRect(sx, sy, sw, sh);
    cx.restore();
    if (news) {
      const kx = sx + sw + (w * 0.97 - sx - sw) / 2;
      for (const ky of [0.25, 0.45]) { cx.fillStyle = '#1b1b1d'; cx.beginPath(); cx.arc(kx, h * ky, w * 0.04, 0, PI2); cx.fill(); cx.fillStyle = '#9a9aa0'; cx.fillRect(kx - 2, h * ky - w * 0.035, 4, w * 0.03); }
      cx.fillStyle = '#2a1a0e'; for (let i = 0; i < 7; i++) cx.fillRect(kx - w * 0.05, h * (0.6 + i * 0.035), w * 0.1, 4);
    } else {
      cx.fillStyle = '#26282c'; for (let i = 0; i < 4; i++) { rr(cx, w * (0.62 + i * 0.07), h * 0.85, w * 0.05, h * 0.03, 4); cx.fill(); }
      cx.fillStyle = '#ff3b30'; cx.beginPath(); cx.arc(w * 0.12, h * 0.865, 6, 0, PI2); cx.fill();
    }
  }
  tv.size = [880, 660];

  function battery(cx, w, h, d) { // the 1987 HUD, big: BATTERY 1% · NO SERVICE
    const pct = d.pct ?? 1, bars = d.bars ?? 0;
    shadow(cx, 26, 10); cx.fillStyle = 'rgba(14,20,40,.95)'; rr(cx, w * 0.03, h * 0.08, w * 0.94, h * 0.84, 24); cx.fill(); noShadow(cx);
    cx.fillStyle = '#ffd21f'; cx.fillRect(w * 0.08, h * 0.08, w * 0.84, 4);
    const bx = w * 0.09, by = h * 0.3, bw = w * 0.34, bh = h * 0.3;
    cx.strokeStyle = '#fff'; cx.lineWidth = 8; rr(cx, bx, by, bw, bh, 12); cx.stroke();
    cx.fillStyle = '#fff'; rr(cx, bx + bw + 4, by + bh * 0.3, 16, bh * 0.4, 5); cx.fill();
    cx.fillStyle = pct <= 5 ? '#ff4a3d' : '#7fe07a'; if (pct > 0) cx.fillRect(bx + 12, by + 12, Math.max(10, (bw - 24) * pct / 100), bh - 24);
    cx.fillStyle = '#fff'; cx.font = `bold ${h * 0.08}px ${SANS}`; cx.textAlign = 'left'; cx.textBaseline = 'alphabetic';
    cx.fillText('BATTERY', bx, h * 0.76); cx.font = `bold ${h * 0.2}px ${SANS}`; cx.textAlign = 'right'; cx.fillText(pct + '%', w * 0.54, h * 0.76); cx.textAlign = 'left';
    const sx = w * 0.63, base = h * 0.6;
    for (let i = 0; i < 4; i++) { cx.fillStyle = i < bars ? '#fff' : 'rgba(255,255,255,.2)'; rr(cx, sx + i * w * 0.07, base - (i + 1) * h * 0.07, w * 0.045, (i + 1) * h * 0.07, 4); cx.fill(); }
    cx.font = `bold ${h * 0.08}px ${SANS}`; cx.fillStyle = bars ? '#fff' : '#ff9d92';
    cx.fillText(bars ? `${bars} BAR${bars > 1 ? 'S' : ''}` : 'NO SERVICE', sx, h * 0.76);
  }
  battery.size = [760, 380];

  function filofax(cx, w, h, d) {
    seedOf(d.text);
    shadow(cx, 26, 10);
    const g = cx.createLinearGradient(0, 0, w, h); g.addColorStop(0, '#6a3421'); g.addColorStop(1, '#43200f');
    cx.fillStyle = g; rr(cx, w * 0.02, h * 0.04, w * 0.96, h * 0.92, 26); cx.fill(); noShadow(cx);
    cx.strokeStyle = 'rgba(240,200,150,.4)'; cx.setLineDash([9, 7]); cx.lineWidth = 2; rr(cx, w * 0.035, h * 0.065, w * 0.93, h * 0.87, 20); cx.stroke(); cx.setLineDash([]);
    const pages = [[w * 0.065, w * 0.42], [w * 0.515, w * 0.42]], py = h * 0.09, ph = h * 0.82;
    for (const [px, pw] of pages) {
      cx.fillStyle = '#fbf5e3'; rr(cx, px, py, pw, ph, 6); cx.fill();
      cx.fillStyle = 'rgba(80,120,190,.22)'; for (let ly = py + ph * 0.2; ly < py + ph - 10; ly += ph * 0.075) cx.fillRect(px + 16, ly, pw - 32, 1.5);
    }
    cx.fillStyle = '#6b6254'; cx.font = `bold ${h * 0.045}px ${SERIF}`; cx.textAlign = 'left'; cx.textBaseline = 'alphabetic';
    cx.fillText(d.head || 'OCTOBER 1987', pages[0][0] + 26, py + ph * 0.12);
    cx.font = `${h * 0.03}px ${SERIF}`; cx.fillStyle = '#8b8373';
    ['Mon 19', 'Tue 20', 'Wed 21', 'Thu 22', 'Fri 23', 'Sat 24', 'Sun 25', 'Mon 26', 'Tue 27', 'Wed 28'].forEach((t, i) => cx.fillText(t, pages[0][0] + 26, py + ph * (0.19 + i * 0.075)));
    cx.fillText(d.head2 || 'NOTES', pages[1][0] + 26, py + ph * 0.12);
    for (let i = 0; i < 6; i++) {
      const ry = py + ph * (0.12 + i * 0.15), rg = cx.createLinearGradient(w / 2 - 30, 0, w / 2 + 30, 0);
      rg.addColorStop(0, '#6d7278'); rg.addColorStop(0.5, '#f1f3f5'); rg.addColorStop(1, '#6d7278');
      cx.strokeStyle = rg; cx.lineWidth = 7; cx.beginPath(); cx.ellipse(w / 2, ry, 30, 12, 0, Math.PI, 0); cx.stroke();
    }
    const lines = String(d.text || '').split(' — ');
    cx.font = `100px ${HAND}`;
    const z = Math.min(h * 0.085, (pages[1][1] * 0.82) / Math.max(...lines.map((l) => cx.measureText(l).width / 100)));
    lines.forEach((l, i) => hand(cx, l, pages[1][0] + 30, py + ph * (0.33 + i * 0.15), z, '#15204f', { pen: true }));
  }
  filofax.size = [960, 620];

  function wheel(cx, w, h, d) { // the machine's date wheel: DD / MM / YYYY  hh:mm
    shadow(cx, 26, 10); cx.fillStyle = '#15171c'; rr(cx, w * 0.02, h * 0.04, w * 0.96, h * 0.92, 40); cx.fill(); noShadow(cx);
    const sx = w * 0.06, sy = h * 0.1, sw = w * 0.88, sh = h * 0.8;
    cx.fillStyle = '#0b1020'; rr(cx, sx, sy, sw, sh, 22); cx.fill();
    cx.fillStyle = '#8fa3d9'; cx.font = `bold ${sh * 0.06}px ${SYS}`; cx.textAlign = 'left'; cx.textBaseline = 'alphabetic';
    cx.fillText('DIAL  ·  WHEN?', sx + sw * 0.04, sy + sh * 0.12);
    const F = [['dd', 2, 1, 31, 'DD'], ['mm', 2, 1, 12, 'MM'], ['yyyy', 4, 1900, 2100, 'YYYY'], ['hh', 2, 0, 23, 'hh'], ['mi', 2, 0, 59, 'mm']];
    const SEP = ['/', '/', '', ':'], unit = sw * 0.052, gap = sw * 0.035, dh = sh * 0.56, dy = sy + sh * 0.2;
    let total = 0; for (const f of F) total += f[1] * unit + unit * 0.8; total += gap * 4;
    let x = sx + (sw - total) / 2;
    F.forEach(([k, len, lo, hi, lab], i) => {
      const dw = len * unit + unit * 0.8, v = d[k], n = +v;
      const g = cx.createLinearGradient(0, dy, 0, dy + dh);
      g.addColorStop(0, '#2a2f3b'); g.addColorStop(0.3, '#d9dce3'); g.addColorStop(0.5, '#ffffff'); g.addColorStop(0.7, '#d9dce3'); g.addColorStop(1, '#2a2f3b');
      cx.fillStyle = g; rr(cx, x, dy, dw, dh, 10); cx.fill();
      const pad = (q) => String(q).padStart(len, '0'), mx = x + dw / 2, my = dy + dh / 2;
      cx.textAlign = 'center'; cx.textBaseline = 'middle';
      if (k === 'yyyy' && d.spin) { // years blurring past
        cx.fillStyle = 'rgba(40,44,54,.35)'; cx.font = `bold ${dh * 0.26}px ${SANS}`;
        for (let j = -2; j <= 2; j++) cx.fillText(pad(Number.isFinite(n) ? n + j * 7 : ''), mx, my + j * dh * 0.2);
        cx.fillStyle = 'rgba(255,255,255,.5)'; for (let j = 0; j < 6; j++) cx.fillRect(x + 8, dy + dh * (0.15 + j * 0.14), dw - 16, 2);
      } else {
        if (Number.isFinite(n)) {
          const wrapv = (q) => (q < lo ? hi : q > hi ? lo : q);
          cx.fillStyle = 'rgba(40,44,54,.45)'; cx.font = `bold ${dh * 0.2}px ${SANS}`;
          cx.fillText(pad(wrapv(n - 1)), mx, my - dh * 0.3); cx.fillText(pad(wrapv(n + 1)), mx, my + dh * 0.3);
        }
        cx.fillStyle = '#10131a'; cx.font = `bold ${dh * 0.3}px ${SANS}`; cx.fillText(v == null ? '--' : pad(v), mx, my + 2);
      }
      cx.fillStyle = '#8fa3d9'; cx.font = `bold ${sh * 0.05}px ${SYS}`; cx.fillText(lab, mx, dy + dh + sh * 0.08);
      x += dw;
      if (SEP[i] !== undefined) { cx.fillStyle = '#dfe5f5'; cx.font = `bold ${dh * 0.26}px ${SANS}`; cx.fillText(SEP[i], x + gap / 2, my); x += gap; }
    });
    cx.strokeStyle = 'rgba(255,210,31,.8)'; cx.lineWidth = 2;
    cx.strokeRect(sx + (sw - total) / 2 - 10, dy + dh * 0.33, total + 20, dh * 0.34);
  }
  wheel.size = [960, 500];

  // ---------------------------------------------------------- TWO's built-in kinds
  function person(cx, w, h, d) { // Extras · People: a Polaroid of someone you met (their portrait, pixel-crisp), name in felt tip, one line in biro
    seedOf('person' + (d.id || d.name));
    const fw = w * 0.82, fh = h * 0.92, x = (w - fw) / 2, y = (h - fh) / 2;
    tilt(cx, w, h, (rnd() - 0.5) * 0.07);
    shadow(cx, 26, 10);
    cx.fillStyle = '#fbfbf6'; cx.fillRect(x, y, fw, fh); noShadow(cx);
    const m = fw * 0.07, iw = fw - 2 * m;
    cx.fillStyle = '#1b2448'; cx.fillRect(x + m, y + m, iw, iw);
    const pc = d.id && typeof portraitURL !== 'undefined' && portraitURL.canvas ? portraitURL.canvas(d.id) : null;
    if (pc) { cx.save(); cx.imageSmoothingEnabled = false; cx.drawImage(pc, x + m, y + m, iw, iw); cx.restore(); }
    cx.fillStyle = 'rgba(245,238,220,.12)'; cx.fillRect(x + m, y + m, iw, iw);   // a little faded
    const ny = y + m + iw + fh * 0.085;
    hand(cx, d.name || '', x + fw / 2, ny, fh * 0.058, '#1a1a1a', { felt: true, align: 'center' });
    if (d.text) {
      const f = fit(cx, d.text, (sz) => `${sz}px ${HAND}`, iw, y + fh - ny - fh * 0.06, fh * 0.034, 1.2);
      let ly = ny + f.size * 1.55;
      for (const l of f.lines) { hand(cx, l, x + fw / 2, ly, f.size, BIRO, { pen: true, align: 'center' }); ly += f.size * 1.2; }
    }
  }
  person.size = [560, 720];

  function take(cx, w, h, d) { // a recorded sample: Chase's 2026 phone recorder, the take's waveform (the same one as the take card)
    const smp = (typeof SAMPLES !== 'undefined' && SAMPLES[d.id]) || {};
    shadow(cx, 24, 10);
    cx.fillStyle = '#14161c'; rr(cx, w * 0.04, h * 0.06, w * 0.92, h * 0.88, 34); cx.fill(); noShadow(cx);
    cx.fillStyle = '#ff4a3d'; cx.beginPath(); cx.arc(w * 0.11, h * 0.2, 10, 0, PI2); cx.fill();
    cx.font = `bold 22px ${SYS}`; cx.textBaseline = 'middle'; cx.textAlign = 'left'; cx.fillStyle = '#ff8a7a';
    cx.fillText('REC  ·  TAKE ' + (d.take || 1), w * 0.15, h * 0.2);
    uiWave(cx, w * 0.09, h * 0.3, w * 0.82, h * 0.36, d.id || 'take', '#ffd9d4', 64);
    cx.fillStyle = '#fff'; cx.font = `bold 34px ${SANS}`; cx.fillText(d.label || smp.label || String(d.id || ''), w * 0.09, h * 0.76, w * 0.82);
    if (smp.where || d.where) { cx.fillStyle = '#8f9abb'; cx.font = `18px ${SYS}`; cx.fillText(d.where || smp.where, w * 0.09, h * 0.86, w * 0.82); }
  }
  take.size = [720, 360];

  function discography(cx, w, h, d) { // Extras · Pudding Discography: a cassette J-card; "two" is listed once you've heard how it ends
    seedOf('pudding discography');
    tilt(cx, w, h, -0.02);
    const x = w * 0.06, y = h * 0.08, cw = w * 0.88, ch = h * 0.84;
    shadow(cx, 24, 10); cx.fillStyle = '#f3ecd8'; cx.fillRect(x, y, cw, ch); noShadow(cx);
    cx.fillStyle = '#ffd21f'; cx.fillRect(x, y, cw * 0.11, ch);   // the spine
    cx.save(); cx.translate(x + cw * 0.055, y + ch / 2); cx.rotate(-Math.PI / 2); hand(cx, 'PUDDING', 0, 12, 34, '#141d3a', { felt: true, align: 'center' }); cx.restore();
    const lx = x + cw * 0.18;
    hand(cx, 'Pudding', lx, y + ch * 0.2, 64, '#141d3a', { felt: true });
    hand(cx, 'discography', lx + 4, y + ch * 0.31, 30, BIRO, { pen: true });
    cx.fillStyle = 'rgba(29,47,143,.35)'; cx.fillRect(lx, y + ch * 0.36, cw * 0.74, 2);
    const rows = [['Opt Us In (Dublin ’87)', '1987', true], ['two (2026)', '', !!d.a], ['two (2026–2040)', '', !!d.b]];
    rows.forEach(([t, yr, on], i) => {
      const ry = y + ch * (0.52 + i * 0.15);
      hand(cx, (i + 1) + '.', lx, ry, 32, BIRO, { pen: true });
      hand(cx, on ? t : '— — —', lx + 46, ry, 34, on ? BIRO : 'rgba(29,47,143,.45)', { pen: true });
      if (on && yr) hand(cx, yr, x + cw * 0.93, ry, 28, BIRO, { pen: true, align: 'right' });
    });
  }
  discography.size = [760, 560];

  function buglist40(cx, w, h, d) { // Extras · The Bug List, 2040 Edition: framed, two columns (still there since 2026 | new in 2040)
    const its = (d.items || []).map((b) => (typeof b === 'string' ? { text: b } : b));
    seedOf('buglist40 ' + its.length);
    shadow(cx, 26, 10);
    const g = cx.createLinearGradient(0, 0, w, h); g.addColorStop(0, '#6b4424'); g.addColorStop(1, '#3a2312');
    cx.fillStyle = g; cx.fillRect(w * 0.015, h * 0.02, w * 0.97, h * 0.96); noShadow(cx);
    const x = w * 0.055, y = h * 0.07, pw = w * 0.89, ph = h * 0.86;
    cx.fillStyle = '#efeadf'; cx.fillRect(x, y, pw, ph);
    const tw = hand(cx, 'The Bug List', x + pw * 0.05, y + ph * 0.12, ph * 0.075, BIRO, { pen: true, bold: true });
    cx.strokeStyle = BIRO; cx.lineWidth = 2.5; cx.beginPath(); cx.moveTo(x + pw * 0.05, y + ph * 0.14);
    for (let k = 1; k <= 8; k++) cx.lineTo(x + pw * 0.05 + tw * k / 8, y + ph * 0.14 + (rnd() - 0.5) * 4); cx.stroke();
    hand(cx, d.sub || '2040 Edition', x + pw * 0.05 + tw + pw * 0.04, y + ph * 0.115, ph * 0.06, '#c8342b', { felt: true, slant: -0.04 });
    const hasY = its.some((i) => i.y), half = Math.ceil(its.length / 2);
    const cols = hasY ? [its.filter((i) => !(i.y >= 2040)), its.filter((i) => i.y >= 2040)] : [its.slice(0, half), its.slice(half)];
    const heads = hasY ? ['Still there (since 2026)', 'New in 2040'] : ['', ''];
    const top = y + ph * 0.25, colW = pw * 0.43, colH = ph * 0.7;
    // the biggest size at which both columns (long entries wrapped onto a second line) fit
    let z = ph * 0.05, lines;
    for (;;) {
      cx.font = `${z}px ${HAND}`;
      lines = cols.map((col) => col.map((it) => wrap(cx, it.text, colW - z * 1.4)));
      const rows = Math.max(...lines.map((col) => col.reduce((a, l) => a + l.length, 0) + (heads[0] ? 1.2 : 0)));
      if (rows * z * 1.3 <= colH || z < 9) break;
      z *= 0.93;
    }
    cols.forEach((col, ci) => {
      const lx = x + pw * (0.05 + ci * 0.48);
      let yy = top;
      if (heads[ci]) { hand(cx, heads[ci], lx, yy, z * 0.95, '#6b6f7a', { pen: true }); yy += z * 1.55; }
      col.forEach((it, k) => {
        cx.strokeStyle = BIRO; cx.lineWidth = 2; cx.strokeRect(lx, yy - z * 0.7, z * 0.7, z * 0.7);
        if (it.done !== false) { cx.lineWidth = 3; cx.lineCap = 'round'; cx.beginPath(); cx.moveTo(lx + z * 0.12, yy - z * 0.38); cx.lineTo(lx + z * 0.3, yy - z * 0.1); cx.lineTo(lx + z * 0.82, yy - z * 0.95); cx.stroke(); }
        for (const l of lines[ci][k]) { hand(cx, l, lx + z * 1.15, yy, z, BIRO, { pen: true }); yy += z * 1.18; }
        yy += z * 0.14;
      });
    });
    const sh = cx.createLinearGradient(0, 0, w, h); sh.addColorStop(0, 'rgba(255,255,255,.14)'); sh.addColorStop(0.4, 'rgba(255,255,255,0)');
    cx.fillStyle = sh; cx.fillRect(x, y, pw, ph);   // the glass
  }
  buglist40.size = [1000, 720];

  // the painters' kit, for content cards that want to match (not enumerable: never a card kind)
  Object.defineProperty(CARDS, '_kit', { configurable: true, value: { HAND, SANS, SYS, MONO, SERIF, BIRO, rnd, seedOf, rr, shadow, noShadow, tilt, wrap, fit, hand, hands, skull, brass, engrave, screw, wave: uiWave } });
  return { postit, clock, phone, brick, screen, newspaper, poster, badge, calendar, watch, label, list, polaroid, plaque, nameplate, tv, battery, filofax, wheel, person, take, discography, buglist40 };
})());
