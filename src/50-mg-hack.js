// ============================================================ MINI-GAME: Hack (spec 9.12) — L21, the boss's bug stalls (3.4)
// Luka's phone screen as a full-screen card: a SafeSense "desktop" that keeps throwing pop-ups at him. Each pop-up is
// beaten by a known JARVIS bug (Rue's restart ritual + JARVIS Sale pop-up bugs, ref/rue/12). DOM in #mg, built once;
// the pop-ups reuse the engine's SafeSense glass classes (.jv.ss) but live inside the card with their own input rules
// (cornering a runaway OK, NO pushes a bar forwards, YES twice), which the engine's popup() queue can't express.
//
// params  seq: ['sure', 'runaway', 'backwards', 'password', 'e4044']  bugs in order (default: L21's three)
//         single: 'backwards' | …   one pop-up, no ACCESS screen (the boss's stalls)
//         green1987: true          L21's opening: the green 1987 terminal on the brick phone's screen, then the
//                                  2040 system floods it, then Luka's line (intro: false mutes it, or a string)
//         access: 'Maintenance hatch'   the line under ACCESS (L21)
//         hud: false               L21 drives the big HACK % bar (0 -> 100 over the seq) unless false; keepHud: true
//                                  leaves it up after the game. Never touched with `single` or embedded.
//         time: '10:52'            the phone's clock;  shot: a cam.shot step applied at start
// result  { ok: true, access: bool, bugs: n, misses: n, bug? }   skipped: { skipped: true, ok: true, access, bug? }
// fails   two misses (NO on "Are you sure?", a bar run down to 0, a password the rules changed under, a lapsed
//         4044) = one api.fail(); the host offers "Skip this?" after two. Never from embed().
// embed   MINIGAMES.hack.embed(api, { bug: 'runaway' }) -> { done: Promise<result>, update(dt), draw(), end(), active }
//         for the boss (one mini-game slot): forward update/draw while the stall is up; it removes itself when done.
// input   YES / NO (keys, pad, touch, the pop-up's own buttons), left/right move the focus; runaway: the mouse or a
//         finger herds the OK (keys/pad: the stick moves a cursor, YES taps); password: type (keyboard) or YES and
//         Luka types the word for the rule on screen. NO can be held (or, with "press instead", pressed) on the bar.
// autoplay  plays every pop-up properly (YES YES NO, herds the OK into a corner, mashes NO, times the words, YES YES).
(() => {
  const SEQ_L21 = ['sure', 'runaway', 'backwards'];
  const KNOWN = { sure: 1, runaway: 1, backwards: 1, password: 1, e4044: 1 };
  // Luka's bug list (the 2026 entries of BUGS_2040) and what he knows to do about each, on a Post-it
  const TIP = {
    sure: ["Asks if you're sure you're sure", '→ YES, YES. Third time it takes anything.'],
    runaway: ['Buttons that run away', '→ Corner it.'],
    backwards: ['Progress bar goes backwards', '→ Press NO.'],
    password: ['Password rules change while you type', '→ Be quick.'],
    e4044: ['Error 4044', '→ YES twice. It forgets.'],
  };
  const TITLE = { sure: '', runaway: '', backwards: 'Update', password: 'Account', e4044: 'Error' };
  const ASK = ['Are you sure?', "Are you sure you're sure?", "Are you sure you're sure you're sure?"];
  const RULES = [   // [rule, test, the word Luka types for it]
    ['Must contain a number', (v) => /\d/.test(v), 'tw0'],
    ['Must not contain a number', (v) => v.length > 0 && !/\d/.test(v), 'two'],
    ['Must be exactly three letters', (v) => /^[a-z]{3}$/i.test(v), 'tea'],
    ['Must contain a capital letter', (v) => /[A-Z]/.test(v), 'Des'],
    ['Must not contain the letter E', (v) => v.length > 0 && !/e/i.test(v), 'nah'],
    ['Must be safe', (v) => /safe/i.test(v), 'safe'],
  ];
  const RULE_NO = RULES.map((r) => '✗  ' + r[0]), RULE_OK = RULES.map((r) => '✓  ' + r[0]);
  const PREF = RULES.map((r) => { const a = []; for (let i = 1; i <= r[2].length; i++) a.push(r[2].slice(0, i)); return a; });
  const WORD_OK = ['', 'One word down. Two to go.', 'Two down. One to go.', ''];
  const TOASTS = [
    ['SafeSense', 'Your desktop has been tidied. For your safety.'], ['Wellbeing', 'Your posture has been noted.'],
    ['SafeSense', 'You have 3 new safety tips.'], ['Hydration', 'Have you had a glass of water?'],
    ['SafeSense', 'This device is from 1987. Please replace it.'], ['Calm', 'Breathe in. Breathe out. Thank you.'],
    ['Cloud+', 'Remembering things for you.'], ['SafeSense', 'Reminder: you are safe.'],
  ];
  const FLOOD = ['SafeSense', 'Unsafe device detected.', 'This device is from 1987.', 'Updating…', 'Are you sure?', 'Hello!',
    'Please hold.', 'For your safety.', 'Installing calm.', 'Device not found.', 'Have you tried being safe?', 'Welcome to SafeSense.'];
  const LCD = 'JARVIS 1987\nLINE: OLD\nDO NOT UNPLUG\n> ';
  const INTRO = 'Nobody can fix JARVIS. ^ But I know how it breaks.';
  const SCALE = [], PCT = [];
  for (let i = 0; i <= 100; i++) { SCALE.push('scaleX(' + (i / 100) + ')'); PCT.push(i + '%'); }
  const SO = { tick: { vol: 0.35 }, chirp: { vol: 0.45 }, soft: { vol: 0.5 }, low: { vol: 0.3 }, clunk: { vol: 0.4 } };
  const CSS = `
.hk{position:fixed;inset:0;pointer-events:none!important;font-family:system-ui,-apple-system,"Segoe UI",Roboto,Arial,sans-serif;color:#1c2a44;user-select:none;-webkit-user-select:none}
.hk *{box-sizing:border-box}
.hk-dim{position:absolute;inset:0;background:radial-gradient(ellipse at 50% 45%,rgba(8,12,24,.6),rgba(3,5,10,.92))}
.hk-card{position:absolute;inset:6px;border-radius:30px;background:#07090d;box-shadow:inset 0 0 0 1px #2b303b,0 18px 50px rgba(0,0,0,.6);pointer-events:auto;opacity:0;transition:opacity .5s}
.hk-card::after{content:"";position:absolute;left:2px;top:50%;width:5px;height:5px;margin-top:-2.5px;border-radius:50%;background:#1d2330;box-shadow:0 0 0 1px #313a4d}
.hk.on .hk-card{opacity:1}
.hk-scr{position:absolute;inset:9px;border-radius:22px;overflow:hidden;background:radial-gradient(130% 100% at 72% 0%,#fff 0%,#e9f5ff 32%,#cbe6fb 66%,#aed6f5 100%)}
.hk-bar{position:absolute;left:0;right:0;top:0;height:34px;display:flex;align-items:center;gap:12px;padding:0 20px;font-size:13px;font-weight:600;color:#3e5b86;background:linear-gradient(rgba(255,255,255,.65),rgba(255,255,255,0))}
.hk-logo{display:flex;align-items:center;gap:6px;color:#2f86e0;letter-spacing:.02em}
.hk-logo::before{content:"";width:12px;height:12px;border-radius:50%;background:radial-gradient(circle at 35% 35%,#fff 0 18%,#8fd0ff 50%,#2f86e0);box-shadow:0 0 7px #8fd0ff}
.hk-sp{flex:1}
.hk-bat{display:flex;align-items:center;gap:5px;color:#c8483a}
.hk-bat i{position:relative;width:22px;height:11px;border:1.5px solid #3e5b86;border-radius:3px}
.hk-bat i::before{content:"";position:absolute;left:1px;top:1px;bottom:1px;width:2px;background:#e0503e}
.hk-bat i::after{content:"";position:absolute;right:-4px;top:2.5px;width:2px;height:4px;background:#3e5b86;border-radius:0 1px 1px 0}
.hk-wall{position:absolute;inset:0;pointer-events:none}
.hk-orb{position:absolute;left:50%;top:54%;width:66vmin;height:66vmin;transform:translate(-50%,-50%);border-radius:50%;background:radial-gradient(circle at 40% 38%,rgba(255,255,255,.95) 0 8%,rgba(143,208,255,.35) 40%,rgba(47,134,224,.12) 62%,rgba(47,134,224,0) 72%)}
.hk-ring{position:absolute;left:50%;top:54%;border-radius:50%;border:2px solid rgba(47,134,224,.11);transform:translate(-50%,-50%)}
.hk-slogan{position:absolute;right:28px;bottom:22px;font-size:clamp(15px,2.4vw,30px);font-weight:300;color:rgba(47,110,180,.4)}
.hk-icons{position:absolute;left:24px;top:56px;display:grid;grid-template-columns:repeat(2,68px);gap:16px 10px}
.hk-ic{display:flex;flex-direction:column;align-items:center;gap:6px;font-size:11.5px;font-weight:600;color:#46638f}
.hk-ic b{position:relative;width:50px;height:50px;border-radius:14px;background:linear-gradient(160deg,#fff,#d5eafb);box-shadow:0 3px 10px rgba(30,80,140,.18),inset 0 0 0 1px rgba(255,255,255,.95)}
.hk-ic b i{position:absolute;left:13px;top:13px;width:24px;height:24px;border-radius:50%;opacity:.85}
.hk-ic b::after{content:"";position:absolute;right:-4px;bottom:-4px;width:15px;height:12px;border-radius:3px;background:#7d93b5;box-shadow:0 0 0 2px #eef6ff}
.hk-toasts{position:absolute;right:18px;top:48px;width:min(300px,28vw);display:flex;flex-direction:column;gap:8px}
.hk-to{padding:9px 13px 10px;border-radius:14px;background:rgba(255,255,255,.74);box-shadow:0 0 0 1px rgba(191,230,255,.7),0 6px 16px rgba(30,70,130,.16);font-size:12.5px;line-height:1.3;color:#2b3f62;animation:hkin .4s cubic-bezier(.2,.9,.3,1.2)}
.hk-to b{display:block;font-size:10.5px;letter-spacing:.06em;color:#2f86e0;margin-bottom:2px;text-transform:uppercase}
@keyframes hkin{from{transform:translateX(34px);opacity:0}}
.hk-stage{position:absolute;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;pointer-events:auto}
.hk .hk-pop.jv{position:relative;width:min(470px,100%);max-width:100%;font-size:16px}
.hk .hk-pop .jv-bar{height:34px}
.hk .hk-pop .jv-msg{font-size:clamp(16px,2vw,20px);line-height:1.35;white-space:pre-line}
.hk .hk-pop .jv-body{padding:10px 24px 14px}
.hk .hk-pop .jv-note{min-height:0;font-size:13px}
.hk .hk-pop .jv-b{min-width:112px;font-size:15px;padding:8px 26px}
.hk .hk-pop .jv-prog{padding:0 24px 14px;font-size:13px;color:#4f6a93}
.hk .hk-pop .jv-prog div{height:10px}
.hk .hk-pop.hk-sh{animation:hksh .42s ease-out}
@keyframes hksh{15%{transform:translateX(-11px)}30%{transform:translateX(10px)}45%{transform:translateX(-7px)}60%{transform:translateX(5px)}80%{transform:translateX(-2px)}}
.hk-x{padding:0 24px 12px}
.hk-in{display:block;width:100%;height:42px;border-radius:12px;border:1.5px solid rgba(47,134,224,.35);background:rgba(255,255,255,.88);padding:0 14px;font:600 19px "Courier New",ui-monospace,Menlo,Consolas,monospace;letter-spacing:.06em;color:#1c2a44;outline:0;user-select:text;-webkit-user-select:text;pointer-events:auto}
.hk-in:focus{border-color:#2f86e0;box-shadow:0 0 0 3px rgba(95,178,255,.35)}
.hk-rule{margin-top:10px;font-size:15px;font-weight:700;color:#c2410c;text-align:left}
.hk-rule.ok{color:#15803d}
.hk-rt{height:4px;margin-top:7px;border-radius:2px;background:rgba(47,134,224,.15);overflow:hidden}
.hk-rt i{display:block;height:100%;background:#2f86e0;transform-origin:0 50%}
.hk-wp{display:flex;gap:7px;justify-content:center;margin-top:12px}
.hk-wp i{width:12px;height:12px;border-radius:50%;background:rgba(47,134,224,.16);box-shadow:inset 0 0 0 1.5px rgba(47,134,224,.4)}
.hk-wp i.on{background:#2f86e0;box-shadow:0 0 8px rgba(95,178,255,.85)}
.hk-ok{position:absolute;left:0;top:0;width:108px;height:42px;margin:-21px 0 0 -54px;border-radius:999px;display:flex;align-items:center;justify-content:center;font-weight:600;letter-spacing:.06em;font-size:15px;color:#fff;background:linear-gradient(#66b6ff,#2f86e0);box-shadow:0 0 14px rgba(95,178,255,.65),inset 0 1px 0 rgba(255,255,255,.55);will-change:transform}
.hk-ok.trap{animation:hktr .1s linear infinite alternate}
.hk-ok.hot{outline:2px solid #fff;outline-offset:2px}
.hk-ok.tired{background:linear-gradient(#a8cdef,#74a3d3);box-shadow:0 0 6px rgba(95,178,255,.4)}
@keyframes hktr{from{rotate:-4deg}to{rotate:4deg}}
.hk-cur{position:absolute;left:0;top:0;width:30px;height:30px;margin:-15px 0 0 -15px;border-radius:50%;border:3px solid #ffd21f;box-shadow:0 0 0 2px rgba(20,29,58,.55),0 0 12px rgba(255,210,31,.6);will-change:transform;pointer-events:none}
.hk-cur::after{content:"";position:absolute;left:50%;top:50%;width:6px;height:6px;margin:-3px 0 0 -3px;border-radius:50%;background:#ffd21f}
.hk-note{position:absolute;left:2%;top:50%;width:min(214px,22vw);padding:12px 14px 16px;background:linear-gradient(#fff6a0,#ffe970);box-shadow:0 8px 18px rgba(30,40,70,.25);transform:translateY(-50%) rotate(-4deg);font-family:"Segoe Print","Bradley Hand","Marker Felt","Comic Sans MS",cursive;color:#1d2f8f;pointer-events:none}
.hk-note small{display:block;margin-bottom:6px;font:700 9.5px system-ui,sans-serif;letter-spacing:.2em;color:rgba(29,47,143,.55)}
.hk-note b{display:block;font-size:14px;line-height:1.25}
.hk-note span{display:block;margin-top:9px;font-size:16px;font-weight:700;line-height:1.25}
.hk-hint{padding:5px 14px;border-radius:999px;font-size:13px;font-weight:600;color:#3e5b86;background:rgba(255,255,255,.62);box-shadow:0 0 0 1px rgba(191,230,255,.8);text-align:center}
.hk-pips{position:absolute;top:0;left:50%;transform:translateX(-50%);display:flex;gap:8px}
.hk-pips i{width:10px;height:10px;border-radius:50%;background:rgba(47,134,224,.18)}
.hk-pips i.on{background:#2f86e0}
.hk-pips i.now{background:#fff;box-shadow:0 0 0 2px #2f86e0,0 0 10px rgba(95,178,255,.8)}
.hk-fl{position:absolute;left:0;top:0;padding:9px 15px;border-radius:15px;background:rgba(250,253,255,.9);box-shadow:0 0 0 1px rgba(191,230,255,.8),0 0 20px rgba(120,190,255,.55);font-size:14px;font-weight:600;color:#1c2a44;white-space:nowrap;opacity:0;transition:transform .34s cubic-bezier(.2,.9,.3,1.2),opacity .25s;pointer-events:none}
.hk-fl.on{opacity:1}
.hk-brick{position:absolute;left:50%;top:50%;height:min(86vh,740px,136vw);aspect-ratio:520/760;transform:translate(-50%,-50%);transition:opacity .45s,transform .6s}
.hk-brick.gone{opacity:0;transform:translate(-50%,-50%) scale(1.25)}
.hk-brick canvas{display:block;width:100%;height:100%;filter:drop-shadow(0 14px 24px rgba(0,0,0,.55))}
.hk-lcd{position:absolute;left:27.2%;top:27.2%;width:45.5%;height:14.1%;padding:3% 5%;border-radius:3px;background:#04120a;box-shadow:inset 0 0 14px rgba(0,0,0,.85);font-family:"Courier New",ui-monospace,monospace;font-weight:700;line-height:1.22;color:#3dff72;text-shadow:0 0 6px rgba(61,255,114,.65);white-space:pre;overflow:hidden}
.hk-lcd i{display:inline-block;width:.6em;height:1em;vertical-align:-.15em;background:#3dff72;animation:hkbl 1s steps(1) infinite}
@keyframes hkbl{50%{opacity:0}}
.hk-acc{position:absolute;inset:0;padding-top:min(110px,22vh);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:min(16px,2.4vh);background:radial-gradient(circle at 50% 48%,rgba(255,255,255,.96),rgba(206,232,251,.97));opacity:0;transition:opacity .4s;pointer-events:none}
.hk-acc.on{opacity:1}
.hk-acc b{font-size:clamp(36px,min(9vw,15vh),104px);font-weight:200;letter-spacing:.34em;padding-left:.34em;color:#2f86e0;text-shadow:0 0 26px rgba(95,178,255,.6)}
.hk-acc span{font-size:15px;font-weight:700;letter-spacing:.16em;color:#46638f;text-transform:uppercase}
.hk-lock{position:relative;width:46px;height:40px;margin-top:22px;border-radius:8px;background:linear-gradient(#66b6ff,#2f86e0);box-shadow:0 0 16px rgba(95,178,255,.7)}
.hk-lock::before{content:"";position:absolute;left:9px;top:-22px;width:28px;height:30px;border:5px solid #2f86e0;border-bottom:0;border-radius:15px 15px 0 0;transition:transform .5s cubic-bezier(.3,1.6,.5,1);transform-origin:100% 100%}
.hk-acc.on .hk-lock::before{transform:translate(12px,-8px) rotate(24deg)}
@media (max-width:760px),(max-height:520px){
 .hk-icons,.hk-toasts,.hk-slogan{display:none}
 .hk-note{position:relative;left:auto;top:auto;width:auto;max-width:96%;padding:7px 12px 8px;transform:rotate(-1.5deg)}
 .hk-note small{display:none}
 .hk-note b{display:inline;font-size:12px}
 .hk-note span{display:inline;margin:0 0 0 6px;font-size:13px}
 .hk .hk-pop .jv-body{padding:8px 18px 10px}
 .hk-x{padding:0 18px 10px}
 .hk-hint{font-size:12px}
}
@media (max-aspect-ratio:4/5){.hk-card::after{left:50%;top:2px;margin:0 0 0 -2.5px}}`;

  // ---------------------------------------------------------- DOM, built once
  let F = null;
  const h = (tag, cls, parent, text) => {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    if (parent) parent.appendChild(e);
    return e;
  };
  // allocation-free transforms for the things that move every frame (CSS Typed OM; a string fallback elsewhere)
  function mover(el) {
    try {
      if (el.attributeStyleMap && typeof CSSTranslate === 'function' && typeof CSSTransformValue === 'function' && window.CSS && CSS.px) {
        const x = CSS.px(0), y = CSS.px(0), tf = new CSSTransformValue([new CSSTranslate(x, y)]);
        return (px, py) => { x.value = px; y.value = py; el.attributeStyleMap.set('transform', tf); };
      }
    } catch (e) { /* fall through */ }
    return (px, py) => { el.style.transform = 'translate(' + px + 'px,' + py + 'px)'; };
  }
  function build() {
    if (!document.getElementById('hk-css')) { const st = h('style', null, document.head, CSS); st.id = 'hk-css'; }
    const root = h('div', 'hk');
    root.dataset.noyes = '';
    root.addEventListener('mousedown', (e) => { if (e.target.tagName !== 'INPUT') e.preventDefault(); });
    h('div', 'hk-dim', root);
    const card = h('div', 'hk-card', root); card.dataset.noyes = '';
    const scr = h('div', 'hk-scr', card);
    const wall = h('div', 'hk-wall', scr);
    h('div', 'hk-orb', wall);
    for (const s of ['84vmin', '112vmin', '146vmin']) { const r = h('div', 'hk-ring', wall); r.style.width = r.style.height = s; }
    h('div', 'hk-slogan', wall, 'Have you tried being safe?');
    const bar = h('div', 'hk-bar', scr);
    h('span', 'hk-logo', bar, 'SafeSense'); h('span', 'hk-sp', bar);
    const clock = h('span', null, bar, '10:52');
    const bat = h('span', 'hk-bat', bar, '3%'); h('i', null, bat);
    const icons = h('div', 'hk-icons', scr);
    for (const [n, c] of [['Safety', '#2f86e0'], ['Calm', '#5cc39a'], ['Cloud+', '#7fb6ff'], ['Quiet', '#8a8fd6'], ['Settings', '#9aa7b8'], ['Help', '#f0a35a']]) {
      const ic = h('div', 'hk-ic', icons); const b = h('b', null, ic); h('i', null, b).style.background = c; h('span', null, ic, n);
    }
    const toasts = h('div', 'hk-toasts', scr), toast = [];
    for (let i = 0; i < 3; i++) { const e = h('div', 'hk-to off', toasts); toast.push({ el: e, b: h('b', null, e), s: h('span', null, e), age: 0 }); }
    const acc = h('div', 'hk-acc', scr);
    h('div', 'hk-lock', acc); h('b', null, acc, 'ACCESS'); const accLine = h('span', null, acc);
    // the stage: the safe middle of the screen (clear of the HACK bar, the touch controls); pop-up, Post-it, OK, cursor
    const stage = h('div', 'hk-stage', root); stage.dataset.noyes = '';
    const pips = h('div', 'hk-pips', stage), pip = [];
    for (let i = 0; i < 5; i++) pip.push(h('i', null, pips));
    const note = h('div', 'hk-note', stage);
    h('small', null, note, 'THE BUG LIST'); const noteB = h('b', null, note), noteS = h('span', null, note);
    const pop = h('div', 'jv ss hk-pop off', stage);
    const pbar = h('div', 'jv-bar', pop); h('span', 'jv-logo', pbar, 'SafeSense'); const ttl = h('span', 'jv-t', pbar);
    const body = h('div', 'jv-body', pop), ic = h('div', 'ic none', body), msg = h('div', 'jv-msg', body);
    const x = h('div', 'hk-x', pop);
    const prog = h('div', 'jv-prog', x), pdiv = h('div', null, prog), pfill = h('i', null, pdiv), ppct = h('span', null, prog, '0%');
    const pw = h('div', null, x);
    const inp = h('input', 'hk-in', pw);
    inp.type = 'text'; inp.spellcheck = false; inp.autocomplete = 'off'; inp.maxLength = 14; inp.tabIndex = -1; inp.placeholder = 'New password';
    inp.setAttribute('autocapitalize', 'off'); inp.setAttribute('autocorrect', 'off');
    const rule = h('div', 'hk-rule', pw), rt = h('div', 'hk-rt', pw), rtFill = h('i', null, rt);
    const wp = h('div', 'hk-wp', x), wpi = [];
    for (let i = 0; i < 3; i++) wpi.push(h('i', null, wp));
    const pnote = h('div', 'jv-note', pop);
    const btns = h('div', 'jv-btns', pop), bs = [];
    for (let i = 0; i < 2; i++) {
      const b = h('button', 'jv-b', btns); b.type = 'button'; b.tabIndex = -1; b._k = i;
      b.addEventListener('click', () => { if (F.live) F.click = b._k; });
      b.addEventListener('pointerenter', () => { if (F.live) F.hover = b._k; });
      bs.push(b);
    }
    const slot = h('span', 'ss-slot', btns);
    const hint = h('div', 'hk-hint', stage);
    const ok = h('div', 'hk-ok off', stage, 'OK');
    const cur = h('div', 'hk-cur off', stage);
    // the L21 opening: Rue's brick phone (the engine's own card painter), its little screen, then the flood
    const brick = h('div', 'hk-brick off', root);
    const bcv = h('canvas', null, brick);
    const lcd = h('div', 'hk-lcd', brick), lcdText = document.createTextNode(''); lcd.appendChild(lcdText); h('i', null, lcd);
    const flood = [];
    for (let i = 0; i < FLOOD.length; i++) flood.push(h('div', 'hk-fl', root, FLOOD[i]));
    // the password field types for itself (the engine ignores keys typed into a field)
    inp.addEventListener('input', () => { if (F.live) F.typed = true; });
    inp.addEventListener('keydown', (e) => {
      if (!F.live) return;
      if (e.code === 'Enter' || e.code === 'NumpadEnter') { e.preventDefault(); F.click = 0; }
      else if (e.code === 'Escape') { e.preventDefault(); inp.blur(); }
    });
    inp.addEventListener('pointerdown', () => { if (F.live && typeof input !== 'undefined' && input.scheme !== 'touch') inp.focus(); });
    F = { root, card, scr, clock, toast, acc, accLine, stage, pips, pip, note, noteB, noteS, pop, ttl, ic, msg, x, prog, pfill, ppct, pw, inp, rule, rt, rtFill,
      wp, wpi, pnote, btns, bs, slot, hint, ok, cur, brick, bcv, lcd, lcdText, flood,
      moveOk: mover(ok), moveCur: mover(cur), live: false, click: -1, hover: -1, typed: false };
  }

  // ---------------------------------------------------------- session state (one at a time: the host has one slot)
  let api = null, P = null, done = null, embedded = false, run = 0, phase = 'end', auto = false;
  let seq = SEQ_L21, single = false, bi = 0, bug = '', t = 0, pt = 0, W = 0, H = 0, sch = '', narrow = false;
  let stL = 0, stT = 0, stW = 0, stH = 0, blocked = false, misses = 0, hudOn = false, hackShown = 0, hackTo = 0;
  let foc = 0, nb = 0, lab0 = '', lab1 = '', won = false, wonT = 0, nextT = 0, toastT = 0, toastI = 0, lcdI = 0, lcdT = 0, introSaid = false, introDone = false;
  // bug state
  let ask = 0, waitT = 0;                                                  // sure
  let ox = 0, oy = 0, cx = 0, cy = 0, minX = 0, maxX = 0, minY = 0, maxY = 0, dodges = 0, tired = false, cornered = false, mouse = false, lpx = -1, lpy = -1, curOn = false;
  let drOx = -1, drOy = -1, drCx = -1, drCy = -1, drCur = false, drTrap = false, drHot = false;
  let prog = 0, drP = -1;                                                  // backwards
  let rule = 0, ruleT = 0, ruleDur = 4.2, words = 0, demo = false, typeTo = -1, typeN = 0, typeT = 0, subT = -1, drR = -1, ruleSat = false; // password
  let armed = 0, forget = 0;                                               // e4044
  let apT = 0, apN = 0;                                                    // autoplay

  const story = () => typeof options !== 'undefined' && options.storyMode === true;
  const pressed = (a) => api.input.pressed(a);
  const sfx = (n, o) => { if (api && api.sfx) api.sfx(n, o); };
  // while Luka talks over the card, a click anywhere advances his line (as everywhere else); otherwise the card eats clicks
  function clickThrough(on) {
    for (const e of [F.root, F.card, F.stage]) { if (on) delete e.dataset.noyes; else e.dataset.noyes = ''; }
  }
  function shake() { const p = F.pop; p.classList.remove('hk-sh'); void p.offsetWidth; p.classList.add('hk-sh'); }
  function setNote(s) { F.pnote.textContent = s; }

  function layout() {
    const touch = sch === 'touch', port = H > W;
    narrow = W < 760 || H < 520 || W < H * 0.8;
    let top = port ? 184 : 112, bottom = touch && port ? 212 : 22, left = 22, right = 22;
    if (touch && !port) { left = Math.min(196, W * 0.22); right = Math.min(236, W * 0.27); top = 104; bottom = 18; }
    if (H < 520 && !port) top = 96;
    stL = left; stT = top; stW = Math.max(200, W - left - right); stH = Math.max(160, H - top - bottom);
    const s = F.stage.style;
    s.left = stL + 'px'; s.top = stT + 'px'; s.width = stW + 'px'; s.height = stH + 'px';
    minX = 60; maxX = stW - 60; minY = 32; maxY = stH - 27;
    if (ox) { ox = Math.max(minX, Math.min(maxX, ox)); oy = Math.max(minY, Math.min(maxY, oy)); }
    cx = Math.max(0, Math.min(stW, cx)); cy = Math.max(0, Math.min(stH, cy));
    F.lcd.style.fontSize = Math.max(8, Math.min(H * 0.86, 740, W * 1.36) * 0.0215) + 'px';
    setHint();
  }
  function setHint() {
    const s = api.input.scheme, kb = s === 'kb', pad = s === 'pad';
    let t = '';
    if (bug === 'sure') t = kb ? 'YES / NO  (Enter / Esc)' : pad ? 'A — YES   ·   B — NO' : 'YES / NO';
    else if (bug === 'runaway') t = kb ? 'Chase it into a corner with the mouse (or the arrows), then click it.' : pad ? 'Stick — chase it into a corner   ·   A — press OK' : 'Chase it into a corner with your finger, then tap it.';
    else if (bug === 'backwards') t = kb ? 'NO (Esc) pushes it forwards. Hold it, or tap it.' : pad ? 'B pushes it forwards. Hold it, or tap it.' : 'NO pushes it forwards. Hold it, or tap it.';
    else if (bug === 'password') t = kb ? 'Type a word that fits the rule, then Enter. (Or press OK and Luka types.)' : pad ? 'A — Luka types a word that fits the rule' : 'YES — Luka types a word that fits the rule';
    else if (bug === 'e4044') t = kb ? 'YES, YES. Quickly.' : pad ? 'A, A. Quickly.' : 'YES, YES. Quickly.';
    F.hint.textContent = t; F.hint.classList.toggle('off', !t);
  }
  function buttons(a, b) { // the pop-up's own buttons ('' hides one)
    lab0 = a; lab1 = b; nb = (a ? 1 : 0) + (b ? 1 : 0);
    F.bs[0].textContent = a; F.bs[0].classList.toggle('off', !a);
    F.bs[1].textContent = b; F.bs[1].classList.toggle('off', !b);
    F.btns.classList.toggle('off', !a && !b && bug !== 'runaway');
    F.slot.classList.toggle('off', bug !== 'runaway');
    focus(0);
  }
  function focus(k) { foc = k; F.bs[0].classList.toggle('foc', k === 0 && !!lab0); F.bs[1].classList.toggle('foc', k === 1 && !!lab1); }
  function miss() {
    misses++;
    sfx('sad_beep', SO.soft);
    if (!embedded && misses % 2 === 0 && api.fail) api.fail();
  }
  function win(text) {
    if (won) return;
    won = true; wonT = 0;
    if (text != null) F.msg.textContent = text;
    buttons('', '');
    F.btns.classList.add('off'); F.ok.classList.add('off'); F.cur.classList.add('off'); curOn = false;
    if (bug === 'password') F.inp.blur();
    sfx('pop'); sfx('chip_on', SO.low);
    if (typeof testLog === 'function') testLog('hack ' + bug + ' cleared');
    if (hudOn) hackTo = 100 * (bi + 1) / seq.length;
    api.input.unlatch('no');
  }

  // ---------------------------------------------------------- one pop-up
  function setup(b) {
    bug = b; won = false; wonT = 0; pt = 0; apT = 0.45; apN = 0;
    const p = F.pop;
    F.ttl.textContent = TITLE[b];
    F.ic.className = b === 'e4044' ? 'ic error' : 'ic none'; F.ic.textContent = b === 'e4044' ? '✕' : '';
    F.noteB.textContent = TIP[b][0]; F.noteS.textContent = TIP[b][1]; F.note.classList.remove('off');
    if (hudOn && bi === 0 && !hackShown) api.hud.hack(0);
    F.prog.classList.toggle('off', b !== 'backwards'); F.pw.classList.toggle('off', b !== 'password'); F.wp.classList.toggle('off', b !== 'password' && b !== 'e4044');
    F.x.classList.toggle('off', b === 'sure' || b === 'runaway');
    setNote('');
    for (let i = 0; i < 3; i++) F.wpi[i].className = '';
    F.wpi[2].classList.toggle('off', b === 'e4044');
    F.ok.classList.add('off'); F.ok.classList.remove('trap', 'tired', 'hot'); F.cur.classList.add('off'); curOn = false;
    drOx = drOy = drCx = drCy = -1; drCur = drTrap = drHot = false; drP = -1; drR = -1;
    if (b === 'sure') { ask = 0; waitT = 0; F.msg.textContent = ASK[0]; buttons('YES', 'NO'); }
    else if (b === 'runaway') { F.msg.textContent = 'Select OK to continue.'; buttons('', ''); dodges = 0; tired = false; cornered = false; }
    else if (b === 'backwards') { prog = 62; F.msg.textContent = 'Installing a safety update.\nCancel update?'; buttons('YES', 'NO'); }
    else if (b === 'password') {
      F.msg.textContent = 'Your password has expired.\nFor your safety, choose a new one.';
      rule = 0; ruleT = 0; ruleDur = story() ? 6.5 : 4.2; words = 0; demo = false; typeTo = -1; typeN = 0; subT = -1; ruleSat = false;
      F.inp.value = ''; F.rule.textContent = RULE_NO[0]; F.rule.className = 'hk-rule';
      buttons('OK', '');
    } else if (b === 'e4044') { armed = 0; forget = 0; F.msg.textContent = 'Error 4044\nUser not found. Retry?'; buttons('YES', 'NO'); }
    setHint();
    for (let i = 0; i < seq.length; i++) { F.pip[i].classList.toggle('on', i < bi); F.pip[i].classList.toggle('now', i === bi); }
    p.classList.remove('off', 'hk-sh'); F.stage.classList.remove('off');
    if (b === 'runaway') for (let i = 0; i < 3; i++) { F.toast[i].age = 0; F.toast[i].el.classList.add('off'); }
    sfx('ss_chirp');
    if (b === 'runaway') {   // the OK starts in its slot, then it's off
      const r = F.slot.getBoundingClientRect();
      ox = r.left + r.width / 2 - stL; oy = r.top + r.height / 2 - stT;
      if (!(ox > 0)) { ox = stW / 2; oy = stH * 0.62; }
      ox = Math.max(minX, Math.min(maxX, ox)); oy = Math.max(minY, Math.min(maxY, oy));
      cx = stW / 2; cy = stH - 30; mouse = false; lpx = api.input.pointer.x; lpy = api.input.pointer.y;
      F.ok.classList.remove('off');
    }
    if (b === 'password' && api.input.scheme === 'kb' && !auto) F.inp.focus();
    if (typeof testLog === 'function') testLog('hack ' + b);
  }

  // YES / NO / a pop-up button, already resolved to a label
  function act(label) {
    if (won) return;
    if (bug === 'sure') {
      if (waitT > 0) return;
      if (ask === 2) { win(label === 'NO' ? "Great. We'll take that as a yes." : "Great. That's a yes."); return; }   // the third ask takes anything
      if (label === 'YES') { ask++; F.msg.textContent = ASK[ask]; F.pop.classList.add('off'); void F.pop.offsetWidth; F.pop.classList.remove('off'); sfx('ss_chirp'); focus(0); }
      else { F.msg.textContent = 'Cancelled. For your safety.'; buttons('', ''); waitT = 1.0; miss(); }
    } else if (bug === 'backwards') {
      if (label === 'NO') { prog += 9; sfx('tick', SO.tick); if (prog >= 100) { prog = 100; win('Update complete.\nNothing was updated.'); } }
      else { prog = Math.max(0, prog - 10); setNote('Cancelling is not safe.'); sfx('sad_beep', SO.low); shake(); }
    } else if (bug === 'password') {
      if (label === 'NO') { if (F.inp.value) { F.inp.value = ''; typeTo = -1; checkSat(); } return; }
      submit();
    } else if (bug === 'e4044') {
      if (forget > 0) return;
      if (label === 'NO') { armed = 0; F.wpi[0].className = F.wpi[1].className = ''; F.msg.textContent = 'Error 4044\nUser not found. Retry?'; setNote('User not found.'); miss(); return; }
      if (armed > 0) { F.wpi[1].className = 'on'; armed = 0; forget = 1.5; F.msg.textContent = 'Error 40…'; sfx('key_beep'); return; }
      armed = story() ? 1.5 : 0.9; F.wpi[0].className = 'on'; F.msg.textContent = 'Error 4044\nRetrying… Retry?'; setNote(''); sfx('key_beep'); shake();
    }
  }

  // ---- password
  function checkSat() {
    const v = F.inp.value, s = v.length > 0 && RULES[rule][1](v);
    if (s !== ruleSat) { ruleSat = s; F.rule.textContent = s ? RULE_OK[rule] : RULE_NO[rule]; F.rule.className = s ? 'hk-rule ok' : 'hk-rule'; }
  }
  function changeRule(interrupt) {
    const busy = F.inp.value.length > 0 || typeTo >= 0;
    if (interrupt && busy) {
      F.inp.value = ''; typeTo = -1; subT = -1;
      setNote('Password rules have changed. For your safety.'); shake();
      if (demo) miss(); else sfx('sad_beep', SO.low);
    }
    demo = true;
    rule = rule === RULES.length - 1 ? 1 : rule + 1;
    ruleT = 0; ruleSat = !checkNow(); checkSat();
  }
  const checkNow = () => F.inp.value.length > 0 && RULES[rule][1](F.inp.value);
  function submit() {
    if (typeTo >= 0) return;
    const v = F.inp.value;
    if (!v.length) { typeTo = rule; typeN = 0; typeT = 0.12; F.inp.blur(); setNote(''); return; }   // Luka types the word for this rule
    if (RULES[rule][1](v)) {
      F.wpi[words].className = 'on'; words++; F.inp.value = ''; sfx('pop');
      if (words >= 3) { win('Password accepted.\nDo not write it on a Post-it.'); return; }
      setNote(WORD_OK[words]);
      changeRule(false);
    } else { F.inp.value = ''; checkSat(); setNote('Password does not meet requirements.'); shake(); miss(); }
  }

  // ---------------------------------------------------------- the per-tick game
  function update(dt) {
    if (phase === 'end') return;
    const I = api.input, s = I.scheme;
    if (W !== innerWidth || H !== innerHeight || s !== sch) {
      const was = sch; W = innerWidth; H = innerHeight; sch = s; layout();
      if (was === 'kb' && s !== 'kb') F.inp.blur();
    }
    t += dt;
    if (hudOn && Math.abs(hackTo - hackShown) > 0.01) { hackShown += (hackTo - hackShown) * Math.min(1, dt * 5); if (Math.abs(hackTo - hackShown) < 0.3) hackShown = hackTo; api.hud.hack(hackShown); }
    // the desktop's background chatter
    if ((phase === 'bug' && bug !== 'runaway') || phase === 'next') {   // (not while the OK runs about: it would hide behind them)
      for (let i = 0; i < 3; i++) { const o = F.toast[i]; if (o.age > 0 && (o.age -= dt) <= 0) o.el.classList.add('off'); }
      if ((toastT -= dt) <= 0) {
        toastT = 4.6;
        const o = F.toast[toastI % 3], m = TOASTS[toastI % TOASTS.length]; toastI++;
        o.b.textContent = m[0]; o.s.textContent = m[1]; o.age = 4.2; o.el.classList.add('off'); void o.el.offsetWidth; o.el.classList.remove('off');
      }
    }
    if (phase === 'brick') {
      lcdT -= dt;
      while (lcdT <= 0 && lcdI < LCD.length) { F.lcdText.appendData(LCD[lcdI]); if (lcdI++ % 2 === 0 && LCD[lcdI - 1] !== '\n') sfx('tick', SO.tick); lcdT += 0.05; }
      if (lcdI >= LCD.length && (pt += dt) > 0.9) { phase = 'flood'; pt = -0.001; startFlood(); }
      return;
    }
    if (phase === 'flood') {
      const was = pt; pt += dt;
      for (let i = 0; i < F.flood.length; i++) { const at = i * 0.075; if (was < at && pt >= at) floodTile(i); }
      if (was < 0.85 && pt >= 0.85) { F.root.classList.add('on'); F.brick.classList.add('gone'); }
      if (was < 1.75 && pt >= 1.75) for (let i = 0; i < F.flood.length; i++) F.flood[i].classList.remove('on');
      if (pt >= 2.1) { F.brick.classList.add('off'); phase = P.intro === false ? 'next' : 'line'; nextT = 0.2; }
      return;
    }
    if (phase === 'line') {
      if (!introSaid) {
        introSaid = true; const id = run; clickThrough(true);
        Promise.resolve(api.say('luka', typeof P.intro === 'string' ? P.intro : INTRO)).then(() => { if (id === run) introDone = true; });
      }
      if (introDone) { phase = 'next'; nextT = 0.15; clickThrough(false); }
      return;
    }
    if (phase === 'next') {
      if ((nextT -= dt) <= 0) { phase = 'bug'; setup(seq[bi]); }
      return;
    }
    if (phase === 'access') {
      if ((pt += dt) >= 2.0) close(result());
      return;
    }
    if (phase !== 'bug') return;

    pt += dt;
    if (won) {
      if ((wonT += dt) >= 0.95) {
        F.pop.classList.add('off'); bi++;
        if (bi < seq.length) { phase = 'next'; nextT = 0.35; }
        else if (single) close(result());
        else { phase = 'access'; pt = 0; F.acc.classList.add('on'); F.stage.classList.add('off'); sfx('chime_ready'); if (typeof testLog === 'function') testLog('hack access'); }
      }
      return;
    }

    // ---- input (dialogue first; one tick of debounce after it)
    const talking = typeof say !== 'undefined' && say.busy && say.busy();
    let yes = false, no = false, click = F.click, hov = F.hover;
    F.click = -1; F.hover = -1;
    if (talking || blocked) click = -1;
    else { yes = pressed('yes'); no = pressed('no'); }
    blocked = talking;
    if (yes) I.consume('yes');
    if (no) I.consume('no');
    if (auto) { click = -1; yes = no = false; const a = autoTick(dt); yes = a === 1; no = a === 2; }
    if (hov >= 0) focus(hov);
    if (nb > 1 && (pressed('left') || pressed('right') || pressed('up') || pressed('down')) && bug !== 'runaway') focus(foc ? 0 : 1);

    if (bug === 'runaway') { runaway(dt, yes); return; }
    if (bug === 'sure' && waitT > 0 && (waitT -= dt) <= 0) { ask = 0; F.msg.textContent = ASK[0]; buttons('YES', 'NO'); sfx('ss_chirp'); }
    if (bug === 'backwards') {
      prog -= (story() ? 3.5 : 6) * dt;
      if (I.holding('no') && !no) prog += 14 * dt;
      if (prog <= 0) { prog = 45; setNote('Update failed. Restarting update.'); shake(); miss(); }
      if (prog >= 100) { prog = 100; win('Update complete.\nNothing was updated.'); return; }
    }
    if (bug === 'password') {
      if (F.typed) { F.typed = false; typeTo = -1; checkSat(); if (F.inp.value) { sfx('key_beep', SO.low); if (F.inp.value.length === 1) setNote(''); } }
      if (typeTo >= 0) {   // Luka types it, a letter at a time
        if ((typeT -= dt) <= 0) {
          const a = PREF[typeTo];
          F.inp.value = a[typeN++]; checkSat(); sfx('key_beep', SO.low); typeT = 0.11;
          if (typeN >= a.length) { typeTo = -1; subT = 0.3; }
        }
      } else if (subT > 0 && (subT -= dt) <= 0) { subT = -1; submit(); if (won) return; }
      if (!demo && F.inp.value.length >= 2) changeRule(true);   // the first time, the rule changes mid-word: that's the bug
      else if ((ruleT += dt) >= ruleDur) changeRule(true);
    }
    if (bug === 'e4044') {
      if (forget > 0) {
        const was = forget; forget -= dt;
        if (was > 0.95 && forget <= 0.95) F.msg.textContent = '…What was I asking?';
        if (forget <= 0) { forget = 0; win(null); }
        return;
      }
      if (armed > 0 && (armed -= dt) <= 0) { armed = 0; F.wpi[0].className = ''; F.msg.textContent = 'Error 4044\nUser not found. Retry?'; setNote('Error 4044. Still.'); miss(); }
    }
    if (click >= 0) { act(click ? lab1 : lab0); return; }
    if (no) { act(lab1 === 'NO' ? 'NO' : lab0 === 'NO' ? 'NO' : bug === 'password' ? 'NO' : ''); return; }
    if (yes && nb) act(foc ? lab1 : lab0);
  }

  // ---- the OK that runs away: herd it into a corner, then press it
  function runaway(dt, yes) {
    const I = api.input, Pt = I.pointer, sp = story() ? 330 : 540, FLEE = 135;
    // the cursor: the mouse / a finger, or the stick and arrows
    let tap = false;
    if (!auto) {
      if (Pt.x !== lpx || Pt.y !== lpy || Pt.pressed) { lpx = Pt.x; lpy = Pt.y; cx = Pt.x - stL; cy = Pt.y - stT; mouse = I.scheme === 'kb'; }
      const m = I.move;
      if (m.x || m.y) { cx += m.x * 430 * dt; cy -= m.y * 430 * dt; mouse = false; }
      cx = cx < 0 ? 0 : cx > stW ? stW : cx; cy = cy < 0 ? 0 : cy > stH ? stH : cy;
      tap = Pt.pressed;
    }
    curOn = auto || !mouse;
    const hit = Math.abs(cx - ox) < 62 && Math.abs(cy - oy) < 29;
    if ((yes || tap) && hit) {
      if (cornered || tired) { win('Thank you for your patience.'); return; }
      // not cornered: it hops away from the tap
      let dx = ox - cx, dy = oy - cy; const d = Math.hypot(dx, dy) || 1; dx /= d; dy /= d;
      if (d < 2) { dx = ox < stW / 2 ? 1 : -1; dy = 0; }
      ox += dx * 95; oy += dy * 60; dodges++; sfx('whoosh', SO.low);
      if (dodges >= 10) tire();
    }
    if (!tired) {
      let dx = ox - cx, dy = oy - cy; const d = Math.hypot(dx, dy);
      if (d < FLEE) {
        if (d < 1) { dx = ox < stW / 2 ? -1 : 1; dy = oy < stH / 2 ? -1 : 1; } else { dx /= d; dy /= d; }
        const v = sp * (0.4 + 0.6 * (1 - d / FLEE));
        ox += dx * v * dt; oy += dy * v * dt;
      }
      if (pt > 40) tire();
    }
    ox = ox < minX ? minX : ox > maxX ? maxX : ox; oy = oy < minY ? minY : oy > maxY ? maxY : oy;
    cornered = (ox <= minX + 1 || ox >= maxX - 1) && (oy <= minY + 1 || oy >= maxY - 1);
  }
  function tire() { if (tired) return; tired = true; F.ok.classList.add('tired'); setNote('OK has stopped running. For its safety.'); }

  // ---------------------------------------------------------- autoplay: the same inputs a player gives (1 = YES, 2 = NO)
  function autoTick(dt) {
    if (bug === 'runaway') {
      const cxn = ox < stW / 2 ? minX : maxX, cyn = oy < stH / 2 ? minY : maxY;
      let gx, gy;
      if (cornered || tired) { gx = ox; gy = oy; }
      else { let dx = ox - cxn, dy = oy - cyn; const d = Math.hypot(dx, dy) || 1; gx = ox + dx / d * 70; gy = oy + dy / d * 70; }
      const ddx = gx - cx, ddy = gy - cy, dd = Math.hypot(ddx, ddy), st = 900 * dt;
      if (dd > st) { cx += ddx / dd * st; cy += ddy / dd * st; } else { cx = gx; cy = gy; }
      if (pt > 7) tire();
      return (cornered || tired) && Math.abs(cx - ox) < 8 && Math.abs(cy - oy) < 8 && (apT -= dt) <= 0 ? 1 : 0;
    }
    if ((apT -= dt) > 0) return 0;
    if (bug === 'sure') { if (waitT > 0) return 0; apT = 0.35; return ask === 2 ? 2 : 1; }
    if (bug === 'backwards') { apT = 0.09; return 2; }
    if (bug === 'e4044') { if (forget > 0) return 0; apT = armed > 0 ? 1 : 0.22; return 1; }
    if (bug === 'password') {
      if (typeTo >= 0 || subT > 0 || F.inp.value) return 0;
      if (!demo || ruleT < 0.4) { apT = 0.3; return 1; }
    }
    return 0;
  }

  // ---------------------------------------------------------- the L21 opening: the brick phone, then the flood
  function startFlood() {
    const r = F.lcd.getBoundingClientRect(), x0 = r.left + r.width / 2, y0 = r.top + r.height / 2;
    let seed = 11;
    const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    for (let i = 0; i < F.flood.length; i++) {
      const e = F.flood[i], col = i % 4, row = (i / 4) | 0;
      const tx = Math.max(12, Math.min(W * (0.06 + col * 0.23 + rnd() * 0.08), W - e.offsetWidth - 14)), ty = H * (0.14 + row * 0.27 + rnd() * 0.1);
      e._to = 'translate(' + Math.round(tx) + 'px,' + Math.round(ty) + 'px) scale(1)';
      e.style.transform = 'translate(' + Math.round(x0 - 60) + 'px,' + Math.round(y0 - 16) + 'px) scale(.2)';
    }
  }
  function floodTile(i) {
    const e = F.flood[i];
    e.classList.add('on'); void e.offsetWidth; e.style.transform = e._to;
    sfx('ss_chirp', SO.chirp);
  }

  // ---------------------------------------------------------- draw: DOM writes, only when something changed
  function draw() {
    if (phase !== 'bug') return;
    if (bug === 'runaway' && !won) {
      const qx = Math.round(ox * 2) / 2, qy = Math.round(oy * 2) / 2;
      if (qx !== drOx || qy !== drOy) { drOx = qx; drOy = qy; F.moveOk(qx, qy); }
      const trap = cornered && !tired && Math.abs(cx - ox) < 150 && Math.abs(cy - oy) < 110;
      if (trap !== drTrap) { drTrap = trap; F.ok.classList.toggle('trap', trap); }
      const hot = Math.abs(cx - ox) < 62 && Math.abs(cy - oy) < 29 && (cornered || tired);
      if (hot !== drHot) { drHot = hot; F.ok.classList.toggle('hot', hot); }
      if (curOn !== drCur) { drCur = curOn; F.cur.classList.toggle('off', !curOn); }
      if (curOn) { const a = Math.round(cx), b = Math.round(cy); if (a !== drCx || b !== drCy) { drCx = a; drCy = b; F.moveCur(a, b); } }
    } else if (bug === 'backwards') {
      const p = Math.max(0, Math.min(100, Math.round(prog)));
      if (p !== drP) { drP = p; F.pfill.style.transform = SCALE[p]; F.ppct.textContent = PCT[p]; }
    } else if (bug === 'password') {
      const r = won ? 0 : Math.max(0, Math.min(100, Math.round((1 - ruleT / ruleDur) * 50) * 2));
      if (r !== drR) { drR = r; F.rtFill.style.transform = SCALE[r]; }
    }
  }

  // ---------------------------------------------------------- open / close (shared by start() and embed())
  function result() { return { ok: true, access: !single, bugs: seq.length, misses, bug: single ? seq[0] : undefined }; }
  function open(a, params, onDone, emb) {
    if (!F) build();
    api = a; P = params || {}; done = onDone; embedded = !!emb; run++;
    const list = [];
    const sg = P.single || P.bug;
    if (sg) list.push(KNOWN[sg] ? sg : 'sure');
    else if (Array.isArray(P.seq)) { for (const b of P.seq) if (KNOWN[b]) list.push(b); }
    if (!list.length) for (const b of SEQ_L21) list.push(b);
    seq = list; single = !!sg; bi = 0; bug = ''; misses = 0; won = false; blocked = false; t = 0; pt = 0;
    auto = embedded ? !!TEST.auto && P.auto !== false : false;
    hudOn = !single && !embedded && P.hud !== false && !!a.hud && typeof a.hud.hack === 'function';
    hackShown = hackTo = 0;
    F.note.classList.add('off'); F.hint.classList.add('off');
    F.click = F.hover = -1; F.typed = false; F.live = true;
    F.clock.textContent = P.time || '10:52';
    F.accLine.textContent = P.access || 'Maintenance hatch';
    F.acc.classList.remove('on'); F.stage.classList.add('off'); F.pop.classList.add('off');
    for (let i = 0; i < 5; i++) F.pip[i].classList.toggle('off', i >= seq.length || seq.length < 2 || hudOn);   // the HACK bar already counts
    for (let i = 0; i < 3; i++) { F.toast[i].age = 0; F.toast[i].el.classList.add('off'); }
    toastT = 2.2; toastI = 0;
    for (let i = 0; i < F.flood.length; i++) F.flood[i].classList.remove('on');
    W = H = 0; sch = '';
    a.ui.appendChild(F.root);
    if (P.green1987) {
      phase = 'brick'; F.root.classList.remove('on');
      F.brick.classList.remove('off', 'gone');
      if (typeof ui !== 'undefined' && ui.paintCard) ui.paintCard(F.bcv, 'brick', { lit: false }, 2);
      F.lcdText.data = ''; lcdI = 0; lcdT = 0.5; introSaid = false; introDone = false;
    } else { phase = 'next'; nextT = 0.25; F.root.classList.add('on'); F.brick.classList.add('off'); }
    if (P.shot && a.cam && a.cam.shot) a.cam.shot(P.shot);
  }
  function close(r) {
    if (phase === 'end') return;
    phase = 'end'; run++; F.live = false;
    F.inp.blur(); clickThrough(false);
    if (hudOn && !P.keepHud && api.hud) api.hud.hack(null);
    hudOn = false;
    if (api && api.input) api.input.unlatch('no');
    F.root.remove();
    const d = done; done = null;
    if (d && r) d(r);
  }

  const M = {
    start(params, a) { open(a, params, (r) => a.finish(r), false); },
    update(dt) { update(dt); },
    draw() { draw(); },
    end() { close(null); },
    skipResult() { return { ok: true, access: !single, bug: single ? seq[0] : undefined }; },
    autoplay(a) {
      if (phase === 'end' || api !== a) M.start(a.params || {}, a);
      auto = true;
    },
    // the boss: MINIGAMES.hack.embed(api, { bug }) while its own mini-game keeps the slot
    embed(a, params) {
      let res = null;
      const p = new Promise((r) => { res = r; });
      open(a, params, (r) => res(r), true);
      const me = run;
      return {
        done: p,
        update(dt) { if (run === me) update(dt); },
        draw() { if (run === me) draw(); },
        end() { if (run === me) close({ ok: false, aborted: true }); },
        get active() { return run === me && phase !== 'end'; },
      };
    },
  };
  MINIGAMES.hack = M;
})();
