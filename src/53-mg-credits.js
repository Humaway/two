// ============================================================ MINI-GAME: Credits (scene C)
// Rue's credits (ref/rue/18, docs/engine/08-minigames-b.md §3, §10.4) re-cut for TWO: one song-long timeline in which
// every DOM element is a paused Web Animation scrubbed from draw() (transform/opacity only), over five low-poly vignettes
// shot live on the real sets in their credits states. The timeline is in song seconds and follows the song's own clock
// ("two" from state.pattern + state.samples, then the 1987 Pudding coda: AUDIO.song({ coda: true }), ~135 s), so the
// cards land on the music: the vignettes cut on section starts, "Nobody can fix JARVIS." lands on the restart chime and
// the last card holds through the coda. Pausing freezes the picture; the music (which never pauses) wins on resume.
//
//   0      INTRO   black: TWO (the logo: white, lowercase type, a hairline Yes-yellow rule)
//   bar 2  VERSE   the bench (parade W, credits) · bar 6 the bridge across the bay (parade W, telephoto)
//   bar 10 CHORUS  the checkpoint (bridge, credits25: all gates up, cars through) · bar 14 Teddy at the hatch
//                  over them, one slow crawl in a masked column: Starring · With · Samples collected (state.samples,
//                  each with its SAMPLES[id].where, Luka (laughing) — Ted Smout Bridge, 25 km/h forced last)
//   bar 18 VERSE2  the Valley in neon (valley, lit_dry / credits_neon)   } People you met: a Polaroid per person, one
//   bar 26 BRIDGE  the Starlight stage (valley, gig; Mia on stage)        } every 2 bars, Rue's brick phone last (no caption)
//   bar 34 FINAL   the roof's ring of yellow drones (hq_roof, credits_dusk / credits): no text, a slow crane, two angles
//   bar 39         black: the three parody cards, white on black, one each (the third on the restart chime, bar 43)
//   coda           the last card by state.choice: A "Pudding — two · Plays: n" (n ticks up slowly) · B "Pudding — two ·
//                  Sent 25 December 2040 · “Sorry for the wait.”"; then a 1.2 s fade to black (left black for the next
//                  scene, as Rue's)
//
// Sets are only ever changed under black: each vignette cut dips through the black veil; a set that isn't live yet is
// prebuilt (world.prebuild, three frames) while the veil holds black, and the veil only lifts once it is shown, so a
// slow build lengthens the dip instead of showing a hitch (the music keeps time; a vignette whose slot has passed is
// skipped). Builds are timed for moments when no text moves: parade/bridge during the TWO card's hold, the valley at
// bar 18 (the crawl has gone), the roof at bar 34 (the last Polaroid has gone), the next scene's set during the last
// card. At most three sets are live (world.liveMax). A missing set is replaced by the nearest vignette whose set exists
// (else the cards play over black). Long black stretches set api.opaque(true) so the world isn't drawn under them.
//
// Call:   ['minigame', 'credits', {}]    params (all optional, for tests): autoLen (autoplay length, game s; default 8)
// Result: { done: true } · { done: true, skipped: true } (NO after 3 s asks "Skip credits?", test: false)
// Scene:  SCENES.C = { set: 'parade', env: 'wp_washed', playable: [], swap: false, hud: null, music: null,
//           timeCard: false, steps: [['minigame', 'credits', {}]] }  (no set also works: the game loads its own)
// Autoplay: the whole timeline compressed into params.autoLen game seconds (sets still load, under black), no song,
//   the last card from state.choice || TEST.ending || 'A'; finishes without the fade.
MINIGAMES.credits = (() => {
  const STARRING = ['Luka', 'Chase', 'Luka (2040)', 'Chase (2040)'];
  const WITH = ['Jordan', 'Luke', 'Teddy', 'Mia', 'Nadia', 'Jayden', 'Des (a kettle)', 'and Rue'];
  const PEOPLE = [   // [portrait id, name on the Polaroid, the line]
    ['teddy', 'Teddy', 'Teddy has said yes to everyone since Monday.'],
    ['mia', 'Mia', 'Mia played a gig at the Starlight. Forty people came. It was loud.'],
    ['nadia', 'Nadia', 'Nadia let her team do something dangerous. It went fine.'],
    ['jayden', 'Jayden', 'Jayden poured his slab on time. His dad is still filthy.'],
    ['luke40', 'Luke', "Luke still does sausages. Sausages still don't hang up on him."],
    ['jordan', 'Jordan', 'Jordan ran the store for two days on his own at Christmas, and nobody thanked him. Thank you, Jordan.'],
    ['des', 'Des (a kettle)', "Des (a kettle) asks everyone if they'd like tea. Everyone says yes."],
  ];
  const PARODY = ['No drones were harmed in the making of this game. Several were tethered.',
    'Optus Cloud+ is not a real product. Please remember things yourself.',
    'Nobody can fix JARVIS.'];
  const LAUGH = ['Luka (laughing)', 'Ted Smout Bridge, 25 km/h'];
  const ROT = [-3, 2.5, -1.5, 3, -2.5, 1.5, -2, 1];                      // each Polaroid's tilt (deg)
  const TICK = [1.7, 1.3, 2.4, 1.1, 1.9, 1.5, 2.2, 1.2, 1.6, 2.0];       // A: seconds between plays (cycled)
  // The vignettes, in bars of "two". off: frame the subject right of the text column. push / side / rise: the slow
  // drift over the shot, as fractions of the lens-to-subject distance. who: an actor posed there.
  const VIG = [
    { set: 'parade', env: 'wp_washed', dress: 'credits', an: 'credits_bench', b0: 2, b1: 6, off: 1, push: 0.12, side: 0.05, rise: 0.02 },
    { set: 'parade', env: 'wp_washed', dress: 'credits', an: 'credits_bridge', b0: 6, b1: 10, off: 1, push: 0, side: 0.008, rise: 0 },
    { set: 'bridge', env: 'credits25', dress: 'credits25', an: 'credits_checkpoint', b0: 10, b1: 14, off: 0, push: 0.04, side: 0.015, rise: 0, who: 'teddy' },
    { set: 'bridge', env: 'credits25', dress: 'credits25', an: 's25_teddy_hatch', b0: 14, b1: 18, off: 1, push: 0.1, side: -0.03, rise: 0, who: 'teddy' },
    { set: 'valley', env: 'lit_dry', dress: 'credits_neon', an: 'cr_valley_neon', b0: 18, b1: 26, off: 1, push: 0.08, side: -0.04, rise: 0.02 },
    { set: 'valley', env: 'gig', dress: 'gig', an: 'cr_starlight_gig', b0: 26, b1: 34, off: 1, push: 0.18, side: 0.01, rise: -0.01, who: 'mia',
      lens: { from: [-32.2, 3.5, -25.5], at: [-35.4, 1.5, -13.4], fov: 40 } },   // a little off-axis (head-on, the pars wash Mia out), over the crowd
    { set: 'hq_roof', env: 'credits_dusk', dress: 'credits', an: 'credits_ring_a', b0: 34, b1: 37, off: 0, push: 0.05, side: 0, rise: 0.12 },
    { set: 'hq_roof', env: 'credits_dusk', dress: 'credits', an: 'credits_ring_b', b0: 37, b1: 39, off: 0, push: 0.1, side: -0.07, rise: 0.01 },
  ];
  const CSS = `.tcr{position:absolute;inset:0;overflow:hidden;color:#f4f1ea;font-family:var(--game);text-align:center;pointer-events:none}
.tcr>div{position:absolute}
.tcr-veil{inset:0;background:#000}
.tcr-scrim{inset:0;opacity:0;background:linear-gradient(90deg,rgba(5,7,16,.8) 0%,rgba(5,7,16,.62) 30%,rgba(5,7,16,.18) 52%,rgba(5,7,16,0) 64%)}
.tcr-logo{inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;opacity:0;font-family:var(--title);font-weight:300;font-size:min(18vh,16vw);letter-spacing:.02em;text-transform:lowercase;color:#fff}
.tcr-logo::after{content:"";width:1.1em;height:2px;margin-top:.12em;background:var(--yes);box-shadow:0 0 6px rgba(255,210,31,.45)}
.tcr-col{left:0;top:0;bottom:0;width:44%;overflow:hidden;-webkit-mask-image:linear-gradient(transparent,#000 15%,#000 85%,transparent);mask-image:linear-gradient(transparent,#000 15%,#000 85%,transparent)}
.tcr-w{position:absolute;left:0;right:0;top:0;height:100%}
.tcr-roll{padding:0 8% 0 10%}
.tcr-roll section{margin:0 0 11vh}
.tcr h2{font-size:clamp(11px,1.9vh,15px);letter-spacing:.34em;padding-left:.34em;text-transform:uppercase;color:var(--yes);margin:0 0 2.6vh;font-weight:bold;text-shadow:0 1px 4px rgba(0,0,0,.8)}
.tcr-roll p{margin:0 0 1.5vh;font-size:clamp(17px,3.6vh,30px);line-height:1.2;text-shadow:0 2px 8px rgba(0,0,0,.75)}
.tcr-roll .smp p{font-size:clamp(14px,2.7vh,22px);line-height:1.3;margin-bottom:1.9vh}
.tcr-roll .smp i{font-style:normal;color:#bdb6a6}
.tcr-roll .smp .last{color:#fff;font-size:clamp(16px,3.2vh,26px);margin-top:3.2vh}
.tcr-ppl{left:0;top:0;bottom:0;width:44%}
.tcr-ppl h2{position:absolute;left:0;right:0;top:6vh;margin:0;opacity:0}
.tcr-pc{position:absolute;left:0;right:0;top:9vh;bottom:2vh;display:flex;flex-direction:column;align-items:center;justify-content:center;opacity:0}
.tcr-pc canvas{height:min(52vh,38vw);width:auto;filter:drop-shadow(0 12px 18px rgba(0,0,0,.55))}
.tcr-pc p{max-width:17em;margin:2.4vh 6% 0;text-wrap:balance;font-size:clamp(14px,2.9vh,23px);line-height:1.35;text-shadow:0 2px 8px rgba(0,0,0,.8)}
.tcr-par{inset:0;display:flex;align-items:center;justify-content:center;padding:0 8vw;opacity:0}
.tcr-par p{max-width:21em;margin:0;text-wrap:balance;font-size:clamp(17px,3.8vh,31px);line-height:1.55;color:#fff}
.tcr-last{inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:0 6vw;opacity:0}
.tcr-last h1{margin:0 0 4vh;font-family:var(--title);font-weight:300;font-size:clamp(24px,min(8.5vh,10.5vw),70px);white-space:nowrap;letter-spacing:.02em;color:#fff}
.tcr-last p{margin:0 0 1.8vh;font-size:clamp(16px,3.8vh,30px);color:#d9d3c5}
.tcr-last b{font-family:var(--mono);font-weight:normal;color:var(--yes);display:inline-block;min-width:3ch;text-align:left;padding-left:.4ch}
.tcr-last .sorry{font-style:italic;color:#fff;margin-top:1.6vh}
#ui.touchui .tcr-col,#ui.touchui .tcr-ppl{bottom:140px}
@media (max-aspect-ratio:1/1){.tcr-scrim{background:linear-gradient(0deg,rgba(5,7,16,.86) 0%,rgba(5,7,16,.66) 42%,rgba(5,7,16,0) 64%)}
.tcr-col{width:auto;right:0;top:40%}.tcr-ppl{width:auto;right:0;top:34%}.tcr-ppl h2{top:1vh}.tcr-pc{top:5vh}
.tcr-pc canvas{height:min(34vh,64vw)}#ui.touchui .tcr-col,#ui.touchui .tcr-ppl{bottom:190px}}`;

  const DEG = Math.PI / 180;
  const NOAMB = { loops: [], room: 'none' };
  const UPV = new THREE.Vector3(0, 1, 0), P0 = new THREE.Vector3(), L0 = new THREE.Vector3(), DIR = new THREE.Vector3(), RT = new THREE.Vector3();
  const NUMS = []; for (let i = 0; i < 100; i++) NUMS.push(String(i));
  let api = null, song = null, anims = [], V = [], rd = {}, ticks = null, nEl = null, veilEl = null, cast = null;
  let BAR = 60 / 92 * 4, DUR = 135, codaAt = 116, lastIn = 117, endAt = 136, autoLen = 8;
  let gt = 0, s = 0, shown = -1, showAt = 0, veil = 1, veilDrawn = -1, opq = null, nShown = -1, msDrawn = -1, pbNext = '';
  let asking = false, closing = false, done = true, auto = false, pbEarly = false, pbLate = false;

  const el = (tag, cls, parent, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text) e.textContent = text; if (parent) parent.append(e); return e; };
  const clamp01 = (x) => (x < 0 ? 0 : x > 1 ? 1 : x);
  // a paused animation over the whole song; pts = [[songSec, opacity, transform?], …] (sorted)
  function anim(e, pts) {
    const f = [], first = pts[0], last = pts[pts.length - 1];
    f.push({ offset: 0, opacity: first[1], transform: first[2] || 'none' });
    for (const p of pts) f.push({ offset: clamp01(p[0] / DUR), opacity: p[1], transform: p[2] || 'none' });
    f.push({ offset: 1, opacity: last[1], transform: last[2] || 'none' });
    for (let i = 1; i < f.length; i++) if (f[i].offset < f[i - 1].offset) f[i].offset = f[i - 1].offset;
    const a = e.animate(f, { duration: DUR * 1000, fill: 'both' }); a.pause(); anims.push(a);
  }
  function move(e, pts) {   // transform only: [[songSec, transform], …]
    const f = [{ offset: 0, transform: pts[0][1] }];
    for (const p of pts) f.push({ offset: clamp01(p[0] / DUR), transform: p[1] });
    f.push({ offset: 1, transform: pts[pts.length - 1][1] });
    const a = e.animate(f, { duration: DUR * 1000, fill: 'both' }); a.pause(); anims.push(a);
  }

  // ---------------------------------------------------------- Polaroids (painted once, in start)
  const cardScale = () => Math.max(0.75, Math.min(1.5, (devicePixelRatio || 1) * innerHeight * 0.52 / 720));
  function brickPolaroid(cv, sc) {   // the person card's frame with Rue's brick phone in the photo, no caption
    const w = 560, h = 720, c = cv.getContext('2d');
    cv.width = Math.round(w * sc); cv.height = Math.round(h * sc);
    c.setTransform(sc, 0, 0, sc, 0, 0);
    const fw = w * 0.82, fh = h * 0.92, x = (w - fw) / 2, y = (h - fh) / 2, m = fw * 0.07, iw = fw - 2 * m;
    c.shadowColor = 'rgba(0,0,0,.35)'; c.shadowBlur = 26; c.shadowOffsetY = 10;
    c.fillStyle = '#fbfbf6'; c.fillRect(x, y, fw, fh);
    c.shadowColor = 'transparent'; c.shadowBlur = 0; c.shadowOffsetY = 0;
    const g = c.createRadialGradient(x + m + iw * 0.5, y + m + iw * 0.45, iw * 0.05, x + m + iw * 0.5, y + m + iw * 0.5, iw * 0.75);
    g.addColorStop(0, '#2c375e'); g.addColorStop(1, '#151b36');
    c.fillStyle = g; c.fillRect(x + m, y + m, iw, iw);
    const ph = document.createElement('canvas');
    if (typeof ui !== 'undefined' && ui.paintCard && ui.paintCard(ph, 'brick', { lit: true }, 0.75)) {
      const bh = iw * 0.9, bw = bh * ph.width / ph.height;
      c.save(); c.translate(x + m + iw / 2, y + m + iw * 0.52); c.rotate(-0.12);
      c.drawImage(ph, -bw / 2, -bh / 2, bw, bh); c.restore();
    }
    c.fillStyle = 'rgba(245,238,220,.12)'; c.fillRect(x + m, y + m, iw, iw);   // a little faded, like the others
    c.setTransform(1, 0, 0, 1, 0, 0);
  }

  // ---------------------------------------------------------- the DOM and its timeline
  function build(root, st) {
    if (!document.getElementById('tcr-css')) el('style', null, document.head, CSS).id = 'tcr-css';
    const box = el('div', 'tcr', root);
    veilEl = el('div', 'tcr-veil', box);
    const scrim = el('div', 'tcr-scrim', box);
    const col = el('div', 'tcr-col', box), w = el('div', 'tcr-w', col), roll = el('div', 'tcr-roll', w);
    let sec = el('section', null, roll); el('h2', null, sec, 'Starring'); for (const n of STARRING) el('p', null, sec, n);
    sec = el('section', null, roll); el('h2', null, sec, 'With'); for (const n of WITH) el('p', null, sec, n);
    sec = el('section', 'smp', roll); el('h2', null, sec, 'Samples collected');
    const smp = (st.samples || []).filter((k) => k !== 'laugh' && typeof SAMPLES !== 'undefined' && SAMPLES[k]);
    for (const k of smp) { const p = el('p', null, sec, SAMPLES[k].label); el('i', null, p, ' — ' + SAMPLES[k].where); }
    const lp = el('p', 'last', sec, LAUGH[0]); el('i', null, lp, ' — ' + LAUGH[1]);
    const ppl = el('div', 'tcr-ppl', box), ph = el('h2', null, ppl, 'People you met');
    const sc = cardScale(), pcs = [];
    for (const [id, name, line] of PEOPLE) {
      const d = el('div', 'tcr-pc', ppl), cv = el('canvas', null, d);
      if (typeof ui !== 'undefined' && ui.paintCard) ui.paintCard(cv, 'person', { id, name }, sc);
      el('p', null, d, line); pcs.push(d);
    }
    { const d = el('div', 'tcr-pc', ppl); brickPolaroid(el('canvas', null, d), sc); pcs.push(d); }
    const logo = el('div', 'tcr-logo', box, 'TWO');
    const pars = PARODY.map((t) => { const d = el('div', 'tcr-par', box); el('p', null, d, t); return d; });
    const last = el('div', 'tcr-last', box);
    el('h1', null, last, 'Pudding — two');
    const ending = (st.choice || (typeof TEST !== 'undefined' && TEST.ending) || 'A') === 'B' ? 'B' : 'A';
    if (ending === 'A') { const p = el('p', null, last, 'Plays:'); nEl = el('b', null, p, '0'); }
    else { el('p', null, last, 'Sent 25 December 2040'); el('p', 'sorry', last, '“Sorry for the wait.”'); nEl = null; }

    // the timeline (song seconds)
    const B = (n) => n * BAR, rs = B(2) + 0.4, re = B(18) - 0.75, pp0 = B(18) + 0.8, pstep = (B(34) - 0.3 - pp0) / pcs.length;
    anim(logo, [[0.15, 0], [1.1, 1], [B(2) - 1.0, 1], [B(2) - 0.3, 0]]);
    anim(scrim, [[B(2) - 0.2, 0], [B(2) + 0.7, 1], [B(34) - 0.6, 1], [B(34), 0]]);
    move(w, [[rs, 'translateY(100%)'], [re, 'translateY(0)']]);
    move(roll, [[rs, 'translateY(0)'], [re, 'translateY(-100%)']]);
    anim(ph, [[pp0 - 0.1, 0], [pp0 + 0.6, 1], [B(34) - 0.8, 1], [B(34) - 0.2, 0]]);
    pcs.forEach((d, i) => {
      const a = pp0 + i * pstep, b = a + pstep, r = ROT[i % ROT.length];
      anim(d, [[a, 0, `translateY(6vh) rotate(${r + 2}deg)`], [a + 0.65, 1, `translateY(0) rotate(${r}deg)`],
        [b - 0.5, 1, `translateY(-1.2vh) rotate(${r - 0.5}deg)`], [b, 0, `translateY(-6vh) rotate(${r - 1.5}deg)`]]);
    });
    const p0 = B(39) - 0.1, p1 = B(41), p2 = B(43);   // the third lands on the restart chime
    anim(pars[0], [[p0, 0], [p0 + 0.7, 1], [p1 - 0.7, 1], [p1 - 0.15, 0]]);
    anim(pars[1], [[p1, 0], [p1 + 0.6, 1], [p2 - 0.65, 1], [p2 - 0.15, 0]]);
    anim(pars[2], [[p2, 0], [p2 + 0.12, 1], [codaAt - 0.6, 1], [codaAt, 0]]);
    anim(last, [[lastIn, 0], [lastIn + 1.1, 1]]);
    if (nEl) {   // plays: the first a moment after the card is up, then slowly, irregularly
      const tk = []; let x = lastIn + 1.8;
      for (let i = 0; x < DUR + 4 && i < NUMS.length - 1; i++) { tk.push(x); x += TICK[i % TICK.length]; }
      ticks = Float32Array.from(tk);
    }
  }

  // ---------------------------------------------------------- vignettes
  function plan() {   // VIG in song seconds; a vignette whose set is missing borrows the nearest one that exists
    const have = (g) => typeof SETS !== 'undefined' && !!SETS[g.set];
    V = VIG.map((g, i) => {
      let src = g;
      if (!have(g)) {
        src = null;
        for (let d = 1; d < VIG.length && !src; d++) { const a = VIG[i - d], b = VIG[i + d]; src = a && have(a) ? a : b && have(b) ? b : null; }
      }
      return src ? Object.assign({}, src, { t0: g.b0 * BAR, t1: g.b1 * BAR }) : null;
    }).filter(Boolean);
  }
  function vigAt(x) { for (let i = 0; i < V.length; i++) if (x >= V[i].t0 && x < V[i].t1) return i; return -1; }
  function ready(id) {   // 2 = live (prebuilt, or already there); requests a prebuild the first time
    const r = rd[id];
    if (r) return r === 2;
    rd[id] = 1;
    try { Promise.resolve(world.prebuild(id)).then(() => { rd[id] = 2; }, () => { rd[id] = 2; }); } catch (e) { rd[id] = 2; }
    return false;
  }
  const toGame = (x) => (auto ? x * autoLen / DUR : x);
  function shoot(g) {
    const an = g.lens || world.anchor(g.an);
    if (!an || !an.from) {   // no anchor: the set's first camera
      const cams = world.set && world.set.cams, k = cams && Object.keys(cams)[0];
      if (k) api.cam.shot({ shot: 'SET', cam: k });
      return;
    }
    if (g.lens) { P0.fromArray(an.from); L0.fromArray(an.at); } else { P0.copy(an.from); L0.copy(an.at); }
    DIR.subVectors(L0, P0); const dist = DIR.length() || 1; DIR.multiplyScalar(1 / dist);
    RT.crossVectors(DIR, UPV); if (RT.lengthSq() < 1e-6) RT.set(1, 0, 0); RT.normalize();
    const fov = an.fov || 40, tv = Math.tan(fov * DEG / 2), asp = innerWidth / Math.max(1, innerHeight);
    if (g.off && asp > 1.1) L0.addScaledVector(RT, -dist * 0.3 * tv * asp);            // the subject sits right of the text
    else if (g.off && asp < 0.9) L0.y -= dist * 0.26 * tv * (16 / 9) / asp;             // portrait: above the text
    const pos = P0.toArray(), look = L0.toArray();
    P0.addScaledVector(DIR, dist * g.push).addScaledVector(RT, dist * g.side).addScaledVector(UPV, dist * g.rise);
    L0.addScaledVector(RT, dist * g.side * 0.6);
    api.cam.shot({ shot: 'CAM', pos, look, fov, to: { pos: P0.toArray(), look: L0.toArray(), fov }, dur: toGame(g.t1 - s + 0.3), ease: 'linear' });
  }
  function uncast() { if (cast) { try { world.despawn(cast); } catch (e) { /* gone with its set */ } cast = null; } }
  function pose(id) {
    const a = world.actor(id);
    if (!a) return;
    if (typeof testLog === 'function') testLog('credits: ' + id + ' at ' + (id === 'teddy' ? 'credits_teddy' : 'cr_mia_stage'));
    if (id === 'teddy') { a.rig.seated = true; a.play('sit', { h: 0.5 }); a.setExpr('happy'); }
    else if (id === 'mia') { if (a.rig.show) a.rig.show('ukulele', true); a.play('uke'); a.setExpr('hum'); }
  }
  function show(i) {
    const g = V[i];
    shown = i; showAt = s;
    try {
      const sameSet = world.setId === g.set;
      Promise.resolve(world.load(g.set, { env: g.env })).catch((e) => console.error('TWO: credits load ' + g.set, e));
      if (world.setId !== g.set) { g.bad = true; return; }   // it didn't build: the cards play over black
      const def = world.set;
      if (g.dress && def && typeof def.dress === 'function') def.dress(g.dress);
      const A = api.AUDIO, amb = def && def.ambience;
      if (!sameSet && A && A.ambience) { A.ambience(amb || NOAMB); if (A.setRoom) A.setRoom((amb && amb.room) || 'none'); }
      if (cast && cast !== g.who) uncast();
      if (g.who && !cast) {
        const mk = g.who === 'teddy' ? 'credits_teddy' : 'cr_mia_stage';
        if (world.mark(mk)) { world.spawn(g.who, mk); cast = g.who; pose(g.who); }
      }
      shoot(g);
    } catch (e) { console.error('TWO: credits vignette ' + g.an, e); }
  }
  function blackout() {   // a long black stretch (the parody cards, the last card): no set on screen, no beds
    shown = -1; uncast();
    const A = api.AUDIO; if (A && A.ambience) { A.ambience(NOAMB); if (A.setRoom) A.setRoom('none'); }
  }

  // ---------------------------------------------------------- close / skip
  function close(r) {
    if (closing || done) return;
    closing = true;
    if (asking && typeof say !== 'undefined' && say.reset) say.reset();   // a pending "Skip credits?" can't leak into PC
    if (r.skipped && song) { try { song.stop(0.9); } catch (e) { /* stopped */ } song = null; }
    const fin = () => { if (!done) { done = true; api.finish(r); } };
    if (!auto && typeof ui !== 'undefined' && ui.fade) ui.fade(1, r.skipped ? 0.9 : 1.2).then(fin); else fin();
  }

  return {
    start(params, a) {
      api = a; anims = []; rd = {}; cast = null; ticks = null; nEl = null;
      gt = s = 0; shown = -1; showAt = 0; veil = 1; veilDrawn = -1; opq = null; nShown = -1; msDrawn = -1;
      asking = closing = auto = pbEarly = pbLate = false; done = false; song = null;
      autoLen = (params && params.autoLen) || 8;
      const st = a.state || state, A = a.AUDIO;
      const two = A && A.TWO;
      BAR = (two && two.bar) || 60 / 92 * 4;
      const songLen = (two && two.duration) || 43 * BAR + 3.4;
      codaAt = songLen + 0.4;
      if (typeof music === 'function') music(null, { fade: 0.8 });
      if (A && A.song && !TEST.auto) {
        try { song = A.song({ pattern: st.pattern || null, samples: st.samples || [], coda: true }); } catch (e) { console.error('TWO: credits song', e); song = null; }
      }
      DUR = song && song.duration > codaAt ? song.duration : codaAt + 5 * BAR + 6.5;   // "two" + the 0.4 s gap + the coda (5 bars + its bell)
      lastIn = codaAt + 0.5;
      endAt = DUR + 0.8;
      plan();
      build(a.ui, st);
      const nx = typeof flow !== 'undefined' && flow.nextId ? flow.nextId(flow.sceneId) : null;
      pbNext = (nx && typeof SCENES !== 'undefined' && SCENES[nx] && SCENES[nx].set) || '';
      veilEl.style.opacity = '1';
      a.opaque(true); opq = true;
    },
    update(dt) {
      if (done || closing) return;
      gt += dt;
      // song time: the song's own clock once it has begun (it never pauses), else game time
      if (auto) s = gt * DUR / autoLen;
      else if (song && song.start >= 0 && !song.stopped) s = song.t;
      else if (song && song.start < 0 && !song.stopped && gt < 1.2) s = 0;   // the song is a moment from starting
      else s += dt;
      if (song && song.duration + 0.8 > endAt) endAt = song.duration + 0.8;   // the real coda can run a little longer than its estimate
      if (s >= endAt) return close({ done: true });
      // set builds while nothing moves: parade + bridge during TWO's hold, the next scene's set during the last card
      if (!pbEarly && s > 1.3) { pbEarly = true; for (let i = 0; i < V.length && i < 3; i++) ready(V[i].set); }
      if (!pbLate && s > lastIn + 3) { pbLate = true; if (pbNext && SETS[pbNext]) ready(pbNext); }
      const w = vigAt(s);
      if (w !== shown) {
        if (w < 0) blackout();
        else if (ready(V[w].set)) show(w);   // else the veil holds black until the set is live
      }
      if (shown < 0 || V[shown].bad) veil = 1;
      else { const g = V[shown]; veil = 1 - clamp01(Math.min((s - showAt) / 0.7, (g.t1 - s) / 0.5)); }
      const o = veil > 0.995;
      if (o !== opq) { opq = o; api.opaque(o); }
      if (!asking && !auto && gt > 3 && api.input.pressed('no')) {
        api.input.consume('no'); asking = true;
        api.ask('Skip credits?', { test: false }).then((y) => { asking = false; if (y) close({ done: true, skipped: true }); });
      }
    },
    draw() {
      if (done) return;
      const ms = Math.round(Math.min(s, DUR) * 1000);
      if (ms !== msDrawn) { msDrawn = ms; for (let i = 0; i < anims.length; i++) anims[i].currentTime = ms; }
      const q = Math.round(veil * 64);
      if (q !== veilDrawn) { veilDrawn = q; veilEl.style.opacity = q / 64; }
      if (nEl && ticks) {
        let n = 0; while (n < ticks.length && s >= ticks[n]) n++;
        if (n !== nShown) { nShown = n; nEl.textContent = NUMS[n]; }
      }
    },
    end() {
      done = true;
      if (song) { try { song.stop(0.6); } catch (e) { /* stopped */ } song = null; }
      for (let i = 0; i < anims.length; i++) anims[i].cancel();
      anims = []; uncast(); nEl = null; veilEl = null;
      // the screen is left black (the host clears #mg; the next scene's start fades in from the black)
    },
    autoplay() { auto = true; if (song) { try { song.stop(0.2); } catch (e) { /* stopped */ } song = null; } },
  };
})();
