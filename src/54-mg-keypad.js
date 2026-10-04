// ============================================================ MINI-GAME: KEYPAD (2.2's limiter; 2.8's Safe Box relabels it)
// Rue's Alarm keypad on 2040 SafeSense glass: a white pill panel, an LCD, a brass-framed 3 x 4 grid (1-9, C, 0, OK).
// Moved here from 64-content-2-1-2-3.js (same id, params, result and DOM: 67-content's MINIGAMES.safebox_keypad drives
// it and relabels .k22t span / .k22lt).
//
// Call:  ['minigame', 'keypad', { digits: 4, code: '2032', shot, onKey(d), test, title, prompt, okText, badText }]
//        or await c.flow.minigame('keypad', { ... })
//   digits   how many digits (4)          code     the right code ('2032')        test   autoplay's code (default code)
//   shot     a camera under the panel     onKey(d) each digit typed (a 3D keypad's press animation)
//   title    the panel's small label ('SERVICE'); prompt the LCD's line ('ENTER SERVICE CODE'); okText on success
//            ('LIMITER OFF'); badText on a wrong code ('INCORRECT CODE')
// Result: { ok: true, code } | { cancel: true } (NO on an empty display walks away) (+ skipped: opens it).
// Wrong codes buzz, clear and count a failure (two: the pause menu offers a skip, which opens it). Keyboard digits,
// arrows + YES on the grid, NO deletes, mouse / touch on the keys. Autoplay types the code.
MINIGAMES.keypad = (() => {
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
  let M, root, box, lcd, lcdTop, led, titleEl, keys = [], api, Pm, code = '', fi = 0, focusEl = null, run = 0, phase = 'end', busy = false;
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
    el('b', null, top, 'SafeSense'); titleEl = el('span', null, top, 'SERVICE'); led = el('i', 'k22led', top);
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
    else if (code.length < Pm.digits) { code += l; api.sfx('key_type'); lcdTop.textContent = Pm.prompt; show(); if (Pm.onKey) try { Pm.onKey(l); } catch (e) { /* cosmetic */ } }
    else api.sfx('sad_beep');
  }
  function submit() {
    if (code.length < Pm.digits) { api.sfx('sad_beep'); return; }
    const id = run;
    if (code === String(Pm.code)) {
      busy = true; led.classList.add('g'); lcdTop.textContent = Pm.okText; api.sfx('access_granted');
      wait(0.6).then(() => { if (id === run) fin({ ok: true, code }); });
      return;
    }
    api.sfx('sad_beep'); lcdTop.textContent = Pm.badText; code = ''; show();
    box.classList.remove('bad'); void box.offsetWidth; box.classList.add('bad');
    if (api.fail) api.fail();
  }
  function fin(res) { if (phase === 'end') return; phase = 'end'; api.finish(res); }
  function onKey(e) { const d = digitOf(e); if (!d || phase !== 'run' || busy) return; fi = LAB.indexOf(d); focus(); press(fi); }
  M = {
    start(params, a) {
      api = a; Pm = Object.assign({ digits: 4, code: '2032', title: 'SERVICE', prompt: 'ENTER SERVICE CODE', okText: 'LIMITER OFF', badText: 'INCORRECT CODE' }, params || {}); run++; phase = 'run'; busy = false;
      if (!root) build();
      a.ui.appendChild(root);
      led.classList.remove('g'); box.classList.remove('bad');
      code = ''; fi = 0; focus(); show(); lcdTop.textContent = Pm.prompt; titleEl.textContent = Pm.title;
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
