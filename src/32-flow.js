// ============================================================ FLOW
// Cutscene step runner, scene flow (branching after 3.7, time cards, endings), hotspots (kettle + Des, sample
// recording by Chase), inventory, three-way SWAP with followers, roam and the minigame host (skip after two failures).
// Every async run captures the generation G; flow.start/stop bump it so stale runs just stop.

const { flow, hotspots, inventory, runSteps, playCutscene } = (() => {
  let G = 0, cutDepth = 0, cardOn = false, inited = false, mg = null, panelOpen = false;
  const loops = {}; // audio loops started by steps: name -> [handles] (alarms layer)
  const ovEl = document.getElementById('overlay'), mgEl = document.getElementById('mg');
  const NOAMB = { rain: false, loops: [], room: 'none' };
  const mgFails = {};  // minigame id -> failures this scene (api.fail(), or a { failed } result); two -> "Skip this?"
  const STARE_HIDE = ['hud', 'obj', 'swap', 'prompt', 'toast', 'hack', 'bark', 'take', 'timecard', 'signal', 'meter'].map((id) => document.getElementById(id)).filter(Boolean); // a stare has no UI

  const audio = () => (typeof AUDIO !== 'undefined' ? AUDIO : null);
  const sfxFn = (n, o) => ui.sfx(n, o);
  const mus = (c, o) => { if (typeof music === 'function') music(c, o); };
  const silence = (on) => { if (typeof music === 'function' && music.silence) music.silence(on); };
  const barkFn = (id, text, o) => (typeof bark === 'function' ? bark(id, text, o) : null);
  const ctx = () => ({ world, cam, flow, state, ui, say, ask, choose, popup, hud, wait, sfx: sfxFn, music: mus, AUDIO: audio(),
    player, inventory, hotspots, runSteps, playCutscene, bark: barkFn });
  // An actor by id; a speaker id with no actor of its own maps through CHARACTERS[id].actor ('manager' -> 'luka40').
  const actorFor = (id) => world.actor(id) || (CHARACTERS[id] && CHARACTERS[id].actor ? world.actor(CHARACTERS[id].actor) : undefined);
  const actorOf = (id) => { const a = actorFor(id); if (!a) console.warn('TWO: no actor ' + id); return a; };
  const itemName = (id) => (ITEMS[id] && ITEMS[id].name) || id;
  const hudShow = () => { if (typeof hud.refresh === 'function') hud.refresh(); else if (typeof hud.show === 'function') hud.show(); };

  // ---------------------------------------------------------- state helpers
  function setFlag(n, v = true) { state.flags[n] = v; emit('flag:set', { name: n, value: v }); }
  function learnName(n) { if (state.names.includes(n)) return; state.names.push(n); ui.toast('Name learned: ' + n); }
  function learnSample(k) { // the waveform card when the UI has one (never while skipping), else a toast; HUD count refresh
    if (state.samples.includes(k)) return;
    state.samples.push(k);
    emit('sample:add', k);
    if (!flow.skipping && typeof ui.sampleCard === 'function') ui.sampleCard(k);
    else ui.toast('Sample recorded: ' + ((SAMPLES[k] && SAMPLES[k].label) || k));
    hudShow();
  }
  const SCALARS = ['battery', 'bars', 'pattern', 'active', 'hack', 'choice', 'quiet', 'noService'];
  function grant(g) {
    if (g.flags) Object.assign(state.flags, g.flags);
    for (const [k, to] of [['items', 'inventory'], ['names', 'names'], ['samples', 'samples'], ['bugs', 'bugs']])
      if (g[k]) for (const v of g[k]) if (!state[to].includes(v)) state[to].push(v);
    if (g.removeItems) for (const v of g.removeItems) { const i = state.inventory.indexOf(v); if (i >= 0) state.inventory.splice(i, 1); }   // given away in that scene
    for (const k of SCALARS) if (k in g) state[k] = g[k];
    if (g.state) Object.assign(state, g.state);   // anything else a later scene reads
  }
  // Ending branches: A1/A2 are 'A', B1/B2 'B' (or a scene's own `branch`); everything else belongs to both.
  const branchOf = (id) => (SCENES[id] && SCENES[id].branch) || (/^[AB][12]$/.test(id) ? id[0] : null);

  // ---------------------------------------------------------- sets and actors
  async function loadSet(id, env) {
    await world.load(id, { env });
    const amb = (world.set && world.set.ambience) || NOAMB, A = audio();
    if (A) { A.ambience(amb); A.setRoom(amb.room || 'none'); }
  }
  function spawnMap(m) {
    for (const id in m) {
      const w = m[id];
      if (w && typeof w === 'object' && !Array.isArray(w)) world.spawn(id, w.at, w); else world.spawn(id, w);
    }
  }
  function despawnAll() {
    const A = world.actors;
    for (const id of (A instanceof Map ? [...A.keys()] : Object.keys(A || {}))) world.despawn(id);
  }
  // Followers: flow.follow is null, one id or a list of ids (the non-active playables that trail the player; one that
  // isn't in the list holds its position). player.follower takes one id or a list (a single id stays a single id).
  const folList = [];
  function followers() { // -> folList: flow.follow minus the active character, only actors that exist
    folList.length = 0;
    const f = flow.follow;
    if (!f) return folList;
    if (Array.isArray(f)) { for (let i = 0; i < f.length; i++) if (f[i] !== state.active && world.actor(f[i])) folList.push(f[i]); }
    else if (f !== state.active && world.actor(f)) folList.push(f);
    return folList;
  }
  function applyFollow() { const l = followers(); player.follower(l.length > 1 ? l.slice() : l[0] || null); }
  function setFollow(f) { // ['follow', id | [ids] | true (every other playable) | null]
    flow.follow = f === true || f === 'all' ? playables().filter((id) => id !== state.active) : Array.isArray(f) ? f.slice() : f || null;
    applyFollow();
  }
  function recontrol() {
    if (world.actor(state.active)) player.control(state.active);
    applyFollow();
  }
  async function changeSet(id, env, spawn) {
    await loadSet(id, env);
    if (spawn) spawnMap(spawn);
    recontrol();
  }
  const playables = () => flow.playable || (flow.scene && flow.scene.playable) || [];
  function nextPlayable() { // SWAP cycles through playable in order, skipping anyone not on this set
    const pl = playables(), n = pl.length;
    if (n < 2) return null;
    const i0 = pl.indexOf(state.active);
    for (let k = 1; k < n; k++) {
      const id = pl[(i0 + k + n) % n], a = world.actor(id);
      if (id !== state.active && a && (!player.actor || a.set === player.actor.set)) return id;
    }
    return null;
  }
  const swapTut = () => (input.scheme === 'pad' ? 'SWAP — Y' : input.scheme === 'touch' ? 'SWAP — Tap SWAP' : 'SWAP — Tab');
  let tutOn = false; // the "SWAP — Tab" prompt is up (first time SWAP is offered in a playthrough)
  function showSwap() {
    const o = nextPlayable(), live = flow.roaming && flow.swap && o;
    if (live) ui.swapIndicator(state.active, o); else ui.swapIndicator(null);
    if (live && !state.flags.tut_swap && !tutOn) { tutOn = true; ui.prompt(swapTut()); }
    else if (!live && tutOn) { tutOn = false; ui.prompt(null); }
  }
  function doSwap() {
    const prev = state.active, nx = nextPlayable();
    if (!nx) return null;
    state.active = nx; player.control(nx);
    const f = flow.follow, pl = playables(); // the one we left takes the new active one's place (kept in playable order)
    if (Array.isArray(f)) { const i = f.indexOf(nx); if (i >= 0) { f[i] = prev; f.sort((a, b) => pl.indexOf(a) - pl.indexOf(b)); } }
    else if (f) flow.follow = prev;
    applyFollow();
    if (tutOn) { tutOn = false; ui.prompt(null); }
    state.flags.tut_swap = true;
    hotspots.reset(); showSwap(); ui.sfx('pop', { vol: 0.5 });
    emit('swap', nx);
    return nx;
  }

  // ---------------------------------------------------------- cutscene steps
  function runAny(x) { return typeof x === 'function' ? x(ctx()) : playCutscene(x, { letterbox: false }); }

  async function runSteps(steps, o) {
    if (!steps) return;
    if (o && o.letterbox) ui.letterbox(true);
    const g = G;
    for (let i = 0; i < steps.length; i++) {
      if (g !== G) return;
      try { const p = step(steps[i]); if (p) await p; } catch (e) { console.error('TWO: step failed', steps[i], e); }
    }
  }

  async function playCutscene(c, o = {}) {
    const steps = typeof c === 'string' ? CUTSCENES[c] : c;
    if (!steps) { console.warn('TWO: no cutscene ' + c); return; }
    if (typeof c === 'string') testLog('cutscene ' + c);
    const g = G, lb = o.letterbox !== false;
    cutDepth++;
    if (TEST.fast) flow.skipping = true; // test mode: every cutscene runs as if skipped
    player.enabled = false; ui.prompt(null); hotspots.reset();
    if (lb) ui.letterbox(true);
    await runSteps(steps);
    if (g !== G) return;
    cutDepth--;
    if (cutDepth) return;
    if (cardOn) { ui.card(null); cardOn = false; }
    if (!o.keep) { // the last shot eases into the gameplay camera as the bars slide away
      if (lb) ui.letterbox(false);
      if (cam.cutscene) await cam.release(flow.skipping ? 0 : 0.8);
      if (g !== G) return;
    }
    if (!cutDepth) { flow.skipping = false; clock.scale = 1; flow.slowmo = 1; slowT = 0; }
    if (flow.roaming && !flow.busy) player.enabled = true;
  }

  function step(s) {
    const sk = flow.skipping;
    if ('shot' in s) {
      if (sk) return;
      cam.shot(s);
      if (s.card) { ui.card(s.card[0], s.card[1]); cardOn = true; } else if (cardOn) { ui.card(null); cardOn = false; }
      return;
    }
    if ('say' in s) {
      if (sk) return;
      const a = actorFor(s.say); // optional cues on a line: {say, text, expr: 'worried', act: 'lanyard'} (speaker -> actor)
      if (a && s.expr) a.setExpr(s.expr);
      if (a && typeof s.act === 'string') a.play(s.act);
      return say(s.say, s.text, s);
    }
    // TWO's UI steps (each guarded: the UI may not have them yet). Checked before `place`: a time card has a `place`.
    if ('bark' in s) { // {bark: id, text, wait?}: a corner line over gameplay; wait: true awaits it, a number waits that long
      if (sk) return;
      const p = barkFn(s.bark, s.text, s);
      if (s.wait === true && p && p.then) return p;
      if (s.wait > 0) return wait(s.wait);
      return;
    }
    if ('nameGlitch' in s) { if (!sk && typeof ui.nameGlitch === 'function') ui.nameGlitch(s.nameGlitch[0], s.nameGlitch[1]); return; }
    if ('timeCard' in s) { // {timeCard: 'Thursday 24 December 2026, 18:58', place?, wait?}: not awaited unless wait
      if (sk || typeof ui.timeCard !== 'function') return;
      const p = ui.timeCard(s.timeCard, s.place);
      return s.wait && p && p.then ? p : undefined;
    }
    if ('slowmo' in s) { // {slowmo: 0.3, dur: 1.5}: slow motion for dur seconds on screen (not awaited; never while skipping)
      if (sk) { flow.slowmo = 1; slowT = 0; return; }
      flow.slowmo = Math.max(0.05, Math.min(1, +s.slowmo || 1)); slowT = s.dur > 0 ? s.dur : 0;
      return;
    }
    if ('quiet' in s) { // {quiet: 'hh:mm:ss' | null}: the HUD's QUIET IN (state; applied when skipping too)
      state.quiet = s.quiet;
      if (typeof hud.quiet === 'function') hud.quiet(s.quiet); else hudShow();
      return;
    }
    if ('choice' in s) return choose(s.choice, s).then((i) => { flow.result = i; if (s.flag) setFlag(s.flag, i); });
    if ('ask' in s) return ask(s.ask, s).then((v) => { flow.result = v; if (s.flag) setFlag(s.flag, v); return runSteps(v ? s.yes : s.no); });
    if ('popup' in s) {
      if (s.clear) popup.clear();
      if (!s.popup || sk) return;
      const p = popup(s.popup);
      if (s.wait) return p.done.then((i) => { flow.result = i; });
      return;
    }
    if (typeof s.spawn === 'string') { world.spawn(s.spawn, s.at, s); return; } // {spawn, at, look?, set?} (set = spawn into that live set, e.g. a split's right half)
    if ('set' in s) return changeSet(s.set, s.env, s.spawn);
    if ('hold' in s) { const a = actorOf(s.hold); if (a) a.hold(s.prop ?? null, s.hand); return; }
    if ('music' in s) { mus(s.music, sk ? { cut: true } : s); return; }
    if ('par' in s) return Promise.all(s.par.map((x) => runSteps([x])));
    if ('if' in s) return runSteps(s.if(state) ? s.then : s.else);
    if ('do' in s) return s.do(ctx());
    if ('stare' in s) return stare(s);
    if ('move' in s) return move(s);
    if ('face' in s) { const a = actorOf(s.face); if (a) a.face(s.to, sk ? 0 : s.dur); return; }
    if ('expr' in s) { for (const [id, e] of s.expr) { const a = actorOf(id); if (a) a.setExpr(e); } return; }
    if ('act' in s) { for (const [id, anim, o] of s.act) { const a = actorOf(id); if (a) a.play(anim, o || {}); } return; }
    if ('despawn' in s) { world.despawn(s.despawn); return; }
    if ('place' in s) { const a = actorOf(s.place); if (a) a.place(s.at); return; }
    if ('prop' in s) {
      const o = world.prop(s.prop);
      if (!o) { console.warn('TWO: no prop ' + s.prop); return; }
      if ('visible' in s) o.visible = s.visible;
      if (s.pos) o.position.set(s.pos[0], s.pos[1], s.pos[2]);
      if ('rotY' in s) o.rotation.y = s.rotY;
      if (s.fn) s.fn(o);
      return;
    }
    if ('sfx' in s) { if (!sk) ui.sfx(s.sfx, s); return; }
    if ('loop' in s) {
      const l = loops[s.loop] || (loops[s.loop] = []), A = audio();
      if (s.stop) { for (const h of l) h.stop(s.fade ?? 0.5); l.length = 0; } else if (A) l.push(A.loop(s.loop, s));
      return;
    }
    if ('wait' in s) return wait(s.wait);
    if ('flash' in s) return ui.flash(s.flash, s.color);
    if ('fade' in s) return ui.fade(s.fade, s.dur ?? 0.5, s.color);
    if ('letterbox' in s) { ui.letterbox(s.letterbox); return; }
    if ('hud' in s) { if (!s.hud) hud.set(null); else if (s.anim) hud.animate(s.hud, s.anim); else hud.set(s.hud); return; }
    if ('flag' in s) { setFlag(s.flag, 'value' in s ? s.value : true); return; }
    if ('item' in s) {
      if (s.remove) inventory.remove(s.item);
      else if (!inventory.has(s.item)) { inventory.add(s.item); ui.toast('New item: ' + itemName(s.item)); }
      return;
    }
    if ('name' in s) { learnName(s.name); return; }
    if ('sample' in s) { learnSample(s.sample); return; }
    if ('objective' in s) { if (Array.isArray(s.objective)) objective.list(s.objective); else objective(s.objective); return; }
    if ('env' in s) { world.env(s.env, sk ? 0 : s.dur || 0); return; }
    if ('split' in s) { world.split(s.split, s); return; } // world builds/shows both sets itself
    if ('timelapse' in s) return timelapse(s.timelapse);
    if ('title' in s) return ui.title(s.title, s.dur);
    if ('actCard' in s) return ui.actCard(s.actCard);
    console.warn('TWO: unknown step', s);
  }

  function move(s) {
    const a = actorOf(s.move);
    if (!a) return;
    const p = a.moveTo(s.to, s); // world jumps straight there while flow.skipping
    if (s.nowait || flow.skipping) return;
    let done = false;
    p.then(() => { done = true; });
    return waitUntil(() => done).then(() => { if (!done) a.moveTo(s.to, s); }); // skipped mid-walk: jump there
  }

  // The stare (spec 1.5): 2–4 s, never longer; camera locked, music silent, no UI at all (no counter, no HUD, no
  // objective, no prompt); the world and its ambient sounds carry on. YES ends it after 1 s.
  const STARE_MAX = 4;
  const stareUI = (on) => { for (let i = 0; i < STARE_HIDE.length; i++) STARE_HIDE[i].style.visibility = on ? '' : 'hidden'; };
  function stare(s) {
    if (flow.skipping) return;
    const len = Math.min(STARE_MAX, s.stare || 3), amb = (s.ambient || []).slice().sort((a, b) => a[1] - b[1]), t0 = clock.t;
    let k = 0;
    cam.lock(true); silence(true); ui.prompt(null); stareUI(false);
    return waitUntil(() => {
      const t = clock.t - t0;
      for (; k < amb.length && amb[k][1] <= t; k++) ui.sfx(amb[k][0]);
      if (t >= len) return true;
      if (t >= 1 && input.pressed('yes')) { input.consume('yes'); return true; }
      return false;
    }).then(() => { cam.lock(false); silence(false); stareUI(true); });
  }

  function timelapse(tl) {
    const keys = tl.keys || [], fired = keys.map(() => false);
    const fire = (i) => { if (fired[i]) return; fired[i] = true; return runSteps(keys[i].steps); };
    const rest = async () => { for (let i = 0; i < keys.length; i++) await fire(i); }; // keys a skip jumped over still apply
    if (flow.skipping) return rest();
    let done = false;
    world.timelapse(Object.assign({}, tl, { keys: keys.map((k, i) => ({ t: k.t, do() { fire(i); } })) })).then(() => { done = true; });
    return waitUntil(() => done).then(rest);
  }

  // ---------------------------------------------------------- busy runs (hotspot actions, inventory, hints)
  async function busyRun(fn) {
    const g = G;
    flow.busy = true; player.enabled = false; ui.prompt(null); hotspots.reset();
    try { await fn(); } catch (e) { console.error('TWO: action failed', e); }
    if (g !== G) return;
    flow.busy = false;
    if (flow.roaming) player.enabled = true;
  }

  // ---------------------------------------------------------- hotspots
  const hotspots = (() => {
    const list = [], used = new Set();
    let near = null, nearSel = null, holdH = null, holdT = 0, holdOn = false, hx = 0, hz = 0;
    // Samples: only Chase (2026) records, with his phone (no recorder item in TWO).
    const canRecord = (h) => !!h.sample && state.active === 'chase' && !state.samples.includes(h.sample);
    const acts = (h) => !!(h.text != null || h.steps || h.ask || h.use || h.kettle || h.des || h.door || h.do);
    function live(h) {
      if (used.has(h) || (h.once && h.flag && state.flags[h.flag])) return false;
      if (h.only && h.only !== state.active) return false;
      if (h.when && !h.when(state)) return false;
      return acts(h) || canRecord(h);
    }
    function where(h) { // -> hx, hz; false when the spot isn't in this set
      const at = h.at ?? h.id;
      if (Array.isArray(at)) { hx = at[0]; hz = at[2]; return true; }
      const a = world.actor(at);
      if (a) { hx = a.pos.x; hz = a.pos.z; return a !== player.actor; }
      if (h._set !== world.setId) { // anchors/marks don't move: resolve once per set
        h._set = world.setId;
        const an = world.anchor(at), p = an ? an.at : world.mark(at);
        h._x = p ? p.x ?? p[0] : NaN; h._z = p ? p.z ?? p[2] : NaN;
      }
      hx = h._x; hz = h._z;
      return hx === hx;
    }
    function label(h) {
      const sel = inventory.selected;
      if (sel) return 'YES — Use ' + itemName(sel);
      const v = h.verb || 'Examine', base = v === 'YES' || v === 'NO' ? v : 'YES — ' + v;
      if (!canRecord(h)) return base;
      return acts(h) ? base + ' · hold to record' : 'YES — Hold to record';
    }
    function update(dt) {
      const me = player.actor;
      if (!me) return;
      if (holdH) { // hold YES for CONFIG.record s with the phone (or a press, with options.holdToPress); a tap does the spot's normal action
        const h = holdH;
        if (input.holding('yes')) {
          holdT += dt;
          if (holdT >= 0.2 && !holdOn) { holdOn = true; ui.prompt('YES — Recording…'); ui.sfx('dictaphone'); }
          if (holdT < CONFIG.record) return;
          holdH = null; near = false; player.enabled = true; input.unlatch('yes');   // false: re-label next tick even if nothing is near
          record(h);
          return;
        }
        holdH = null; near = false; player.enabled = true;
        if (acts(h)) busyRun(() => fire(h));
        return;
      }
      let best = null, bd = 1e9;
      for (let i = 0; i < list.length; i++) {
        const h = list[i];
        if (!live(h) || !where(h)) continue;
        const dx = hx - me.pos.x, dz = hz - me.pos.z, d = dx * dx + dz * dz, r = h.r || 1.2;
        if (d <= r * r && d < bd) { bd = d; best = h; }
      }
      if (best !== near || inventory.selected !== nearSel) { near = best; nearSel = inventory.selected; ui.prompt(best ? label(best) : tutOn ? swapTut() : null); }
      if (inventory.selected && input.pressed('no')) { input.consume('no'); inventory.selected = null; return; }   // NO puts the item away, near a spot or not
      if (!best) return;
      const key = best.verb === 'NO' && !inventory.selected ? 'no' : 'yes';
      if (!input.pressed(key)) return;
      input.consume(key);
      if (canRecord(best) && !inventory.selected) { holdH = best; holdT = 0; holdOn = false; player.enabled = false; return; }
      busyRun(() => fire(best));
    }
    function speak(h) {
      let t = h.text, who = h.by || state.active;
      if (Array.isArray(t)) { h._n = ((h._n ?? -1) + 1) % t.length; t = t[h._n]; }
      if (t && typeof t === 'object') { const k = state.active in t ? state.active : Object.keys(t)[0]; if (!h.by) who = k; t = t[k]; }
      return say(who, t);
    }
    function record(h) { // the take: the sample's own sound, the waveform card, the count
      ui.sfx((SAMPLES[h.sample] && SAMPLES[h.sample].sfx) || 'beep');
      testLog('sample ' + h.sample);
      learnSample(h.sample);
    }
    async function kettle(h) { // `des: true`: Des asks first (spec 13.1)
      if (h.des) await say('des', 'Tea?');
      if (!(await ask('Put the kettle on?'))) return false;
      if (player.actor && where(h)) player.actor.face([hx, hz]);
      ui.sfx('kettle'); // boils, clicks off, steam rises
      const at = h.at ?? h.id, steam = { n: 16, speed: 0.25, life: 1.8, color: 0xf2f2f2 };
      await wait(1.8); world.puff(at, steam);
      await wait(1.4); world.puff(at, steam);
      return true;
    }
    function placeParty(mark) { // spawn (not place) so actors also move across into a new set; followers in a line behind
      const m = typeof mark === 'string' ? world.mark(mark) : mark, fl = followers().slice();
      world.spawn(state.active, mark);
      if (m) {
        const r = m[3] || 0;
        for (let i = 0; i < fl.length; i++) { const d = 0.8 * (i + 1); world.spawn(fl[i], [m[0] - Math.sin(r) * d, m[1], m[2] - Math.cos(r) * d, r]); }
      }
      recontrol();
    }
    async function door(h) {
      const d = h.door, kind = d.kind || 'jarvis', to = d.to && typeof d.to === 'object' && !Array.isArray(d.to) ? d.to : { mark: d.to };
      if (kind === 'jarvis') { // "takes nine seconds": ~2 s of spinner, then a jump cut
        const p = popup({ msg: 'JARVIS is loading this door.', spinner: true, buttons: [], icon: 'info' });
        const key = 'door_seen_' + h.id, first = d.first && !state.flags[key];
        if (first) state.flags[key] = true;
        await Promise.all([wait(2), first ? playCutscene(d.first, { letterbox: false }) : null]);
        p.close();
      } else if (kind === 'wood') { ui.sfx('creak'); await ui.fade(1, 0.35); }
      else ui.sfx('door_slide');
      if (to.set && to.set !== world.setId) { if (kind !== 'wood') await ui.fade(1, 0.25); await loadSet(to.set, to.env); }
      placeParty(to.mark);
      if (kind === 'wood' || to.set) ui.fade(0, 0.35);
    }
    async function fire(h) {
      const sel = inventory.selected;
      let done = true, boiled = false;
      inventory.selected = null;
      testLog('hotspot ' + h.id + (sel ? ' use ' + sel : ''));
      if (sel) {
        const u = h.use && h.use[sel];
        if (!u) { await say(state.active, "That won't work."); return; }
        await runAny(u);
      } else {
        if (h.text != null) await speak(h);
        if (h.kettle || h.des) { if (!(await kettle(h))) return; boiled = true; }
        if (h.ask) {
          const y = await ask(h.ask.q, h.ask), b = y ? h.ask.yes : h.ask.no;
          if (b) await runAny(b);
          if (!y) return;
        }
        if (h.steps) await playCutscene(h.steps, { letterbox: false });
        if (h.door) await door(h);
        if (h.do) await h.do(ctx());
        done = !h.use; // a spot with `use` only completes through the right item
      }
      if (done && h.flag) setFlag(h.flag, true);
      if (done && h.once) used.add(h);
      if (boiled && saveGame()) ui.toast('Saved.');   // (storage blocked: no false "Saved.")
    }
    return {
      list, used, update,
      reset() { near = null; holdH = null; },
      trigger(x) { // run a spot by id (autoplay helpers, content); a recordable spot also records (Chase active)
        const h = typeof x === 'string' ? list.find((e) => e.id === x) : x;
        if (!h) { console.warn('TWO: no hotspot ' + x); return Promise.resolve(); }
        return busyRun(async () => { const sel = inventory.selected; if (acts(h) || sel) await fire(h); if (!sel && canRecord(h)) record(h); });
      },
    };
  })();

  // ---------------------------------------------------------- inventory
  const inventory = {
    selected: null,
    has: (id) => state.inventory.includes(id),
    add(id) { if (state.inventory.includes(id)) return; state.inventory.push(id); emit('item:add', id); },
    remove(id) {
      const i = state.inventory.indexOf(id);
      if (i >= 0) state.inventory.splice(i, 1);
      if (inventory.selected === id) inventory.selected = null;
    },
    open() {
      if (panelOpen) return;
      const free = (flow.roaming || mg) && !flow.busy && !cutDepth; // actions only in play, never mid-cutscene
      panelOpen = true;
      const pe = player.enabled;
      player.enabled = false; ui.prompt(null); hotspots.reset();
      const close = () => { panelOpen = false; player.enabled = pe; };
      const act = (fn) => { close(); if (free) busyRun(fn); };
      ui.inventoryPanel({
        items: state.inventory.map((id) => ({ id, name: itemName(id), icon: ITEMS[id] && ITEMS[id].icon })),
        onExamine: (id) => act(async () => {
          const it = ITEMS[id] || {};
          if (it.examine) await runAny(it.examine); else await say(state.active, it.desc || itemName(id));
          if (it.flip && (await ask(it.flip.q || 'Flip it?', it.flip))) await runAny(it.flip.steps);
        }),
        onUse: (id) => { close(); if (free) { inventory.selected = id; ui.toast('Using: ' + itemName(id)); } },
        onCombine: (a, b) => act(() => {
          const c = (ITEMS[a] && ITEMS[a].combine && ITEMS[a].combine[b]) || (ITEMS[b] && ITEMS[b].combine && ITEMS[b].combine[a]);
          return c ? runAny(c) : say(state.active, "That won't work.");
        }),
        onClose: close,
      });
    },
  };

  // ---------------------------------------------------------- minigame host
  function clearOverlay() {
    const c = ovEl.getContext('2d'), d = devicePixelRatio || 1;
    c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, ovEl.width, ovEl.height); c.setTransform(d, 0, 0, d, 0, 0);
  }
  // Two failures of the same minigame in a scene (api.fail() calls, or runs that finish { failed: true }) offer a skip:
  // flow.skipOffer turns on and the pause menu's "Skip this mini-game" calls flow.skipMinigame(). Never for noSkip (the Choice).
  function offerSkip(id, m) {
    if (m.noSkip || flow.skipOffer || (mgFails[id] || 0) < 2) return;
    flow.skipOffer = true;
    if (!TEST.auto) ui.toast('Skip this? It’s in the pause menu.');
    emit('minigame:skipoffer', id);
  }
  function minigame(id, params) {
    const m = MINIGAMES[id];
    if (!m) { console.warn('TWO: minigame ' + id + ' is not built'); return Promise.resolve({ missing: true }); }
    testLog('minigame ' + id);
    clearOverlay(); ovEl.classList.remove('off'); mgEl.textContent = '';
    return new Promise((res) => {
      const me = { m, id, paused: 0, api: null, fails: 0 };
      const api = me.api = {
        finish(r) {
          if (mg !== me) return;
          mg = null; flow.skipOffer = false;
          if (r && r.failed && !me.fails) mgFails[id] = (mgFails[id] || 0) + 1;   // a failed run counts once
          try { if (m.end) m.end(r); } catch (e) { console.error('TWO: minigame ' + id + ' end()', e); }
          clearOverlay(); ovEl.classList.add('off'); mgEl.textContent = '';   // hidden between minigames (start shows it)
          flow.result = r; res(r);
        },
        fail() { if (mg !== me) return; me.fails++; mgFails[id] = (mgFails[id] || 0) + 1; offerSkip(id, m); },   // one failure (a retry inside the game)
        get fails() { return mgFails[id] || 0; },
        overlay: { canvas: ovEl, ctx: ovEl.getContext('2d'), get w() { return innerWidth; }, get h() { return innerHeight; },
          show(b) { ovEl.classList.toggle('off', !b); } },
        ui: mgEl, world, cam, input, sfx: typeof sfx === 'function' ? sfx : sfxFn, AUDIO: audio(), say, ask, choose, popup, hud,
        async play(steps) { me.paused++; try { await runSteps(steps); } finally { me.paused--; } },
        params: params || {}, state,
      };
      mg = me;
      flow.skipOffer = false; offerSkip(id, m);   // already failed twice this scene (a content retry loop): offer at once
      try {
        m.start(api.params, api);
        if (TEST.auto) {
          if (m.autoplay) Promise.resolve(m.autoplay(api)).catch((e) => { console.error('TWO: minigame ' + id + ' autoplay()', e); api.finish({ error: true }); });
          else wait(0.5).then(() => api.finish({ auto: true }));
        }
      } catch (e) { console.error('TWO: minigame ' + id + ' start()', e); api.finish({ error: true }); }
    });
  }

  // ---------------------------------------------------------- per tick / per frame
  let slowT = 0; // seconds of slow motion left (on screen)
  function tick(dt) {
    if (slowT > 0 && (slowT -= dt / flow.slowmo) <= 0) { slowT = 0; flow.slowmo = 1; }
    clock.scale = (cutDepth && input.held('no') ? 3 : 1) * (flow.skipping ? 1 : flow.slowmo); // hold NO to fast-forward a cutscene; slow motion
    if (mg && !mg.paused && !panelOpen && mg.m.update) {
      try { mg.m.update(dt); } catch (e) { console.error('TWO: minigame update()', e); mg.api.finish({ error: true }); }
    }
    if (!flow.roaming || flow.busy || panelOpen || cutDepth) return;
    if (input.pressed('inventory')) { input.consume('inventory'); inventory.open(); return; }
    if (flow.swap && input.pressed('swap')) { input.consume('swap'); doSwap(); }
    hotspots.update(dt);
  }
  function draw() {
    if (!mg || !mg.m.draw) return;
    try { mg.m.draw(); } catch (e) { console.error('TWO: minigame draw()', e); mg.api.finish({ error: true }); }
  }

  // ---------------------------------------------------------- roam
  async function roam(o) {
    const g = G, u = o.until;
    const solved = () => {
      if (typeof u === 'function') return !!u(state);
      if (Array.isArray(u)) { for (let i = 0; i < u.length; i++) if (!state.flags[u[i]]) return false; return true; }
      return u ? !!state.flags[u] : false;
    };
    if (TEST.auto) {
      if (o.auto) await o.auto(ctx());
      else if (typeof u !== 'function') for (const f of [].concat(u || [])) setFlag(f, true);
      if (u && !solved()) console.warn('TWO: roam auto() left `until` unsolved in ' + flow.sceneId);
      return;
    }
    if (cam.cutscene) cam.release(); // e.g. a minigame's shot straight into play: ease back to the gameplay camera
    flow.roaming = true; player.enabled = true; hotspots.reset(); showSwap();
    const t0 = clock.t;
    let hinted = !o.hint;
    await waitUntil(() => {
      if (g !== G) return true;
      if (flow.busy || panelOpen || cutDepth) return false;
      if (solved()) return true;
      if (!hinted && clock.t - t0 >= (o.hint.after ?? 120)) { hinted = true; busyRun(() => playCutscene(o.hint.steps, { letterbox: false })); }
      return false;
    });
    if (g !== G) return;
    flow.roaming = false; player.enabled = false; inventory.selected = null; tutOn = false;
    ui.prompt(null); hotspots.reset(); ui.swapIndicator(null);
  }

  // ---------------------------------------------------------- scenes
  function sceneStep(st, nx) {
    const a = st[1], o = st[2] || {};
    switch (st[0]) {
      case 'cutscene': {
        const lb = o.letterbox !== false; // keep the bars and the shot when another cutscene or the scene's end follows
        return playCutscene(a, { letterbox: lb, keep: lb && (!nx || (nx[0] === 'cutscene' && !(nx[2] && nx[2].letterbox === false))) });
      }
      case 'steps': return playCutscene(a, { letterbox: false });
      case 'objective': if (Array.isArray(a)) objective.list(a); else objective(a); return;
      case 'control': state.active = a; if (actorOf(a)) player.control(a); applyFollow(); showSwap(); return;
      case 'playable': flow.playable = a ? a.slice() : null; showSwap(); return;   // change who SWAP cycles through mid-scene
      case 'roam': return roam(a || {});
      case 'minigame': player.enabled = false; return minigame(a, st[2]);
      case 'wait': return wait(a);
      case 'set': return (async () => { const g = G; await ui.fade(1, 0.4); if (g !== G) return; await changeSet(a, o.env, o.spawn); ui.fade(0, 0.5); })();
      case 'cam': cam.override(a, st[2]); return;
      case 'swap': flow.swap = !!a; showSwap(); return;   // the first time it's live in play: the "SWAP — Tab" prompt
      case 'follow': setFollow(a); return;                // id | [ids] | true (every other playable) | null
      case 'do': return a(ctx());
      case 'save': saveGame(); return;
    }
    console.warn('TWO: unknown scene step ' + st[0]);
  }

  function stop() {
    G++;
    if (mg) mg.api.finish({ aborted: true });
    flow.skipping = false; flow.roaming = false; flow.busy = false; flow.sceneId = null; flow.skipOffer = false; flow.slowmo = 1; slowT = 0;
    panelOpen = false; cutDepth = 0; clock.scale = 1; inventory.selected = null; tutOn = false;
    for (const n in loops) { for (const h of loops[n]) h.stop(0.4); loops[n].length = 0; }
    player.enabled = false;
    ui.inventoryPanel(null); ui.prompt(null); ui.swapIndicator(null); hotspots.reset();
    stareUI(true); silence(false); cam.lock(false);
    emit('flow:stop'); // systems (drones, Chip View, AR, barks) clear themselves
  }
  function toTitle() { stop(); menus.title(); }
  function theEnd() { testLog('end of built content'); if (TEST.auto) TWO_TEST.done = true; else toTitle(); }

  // The scene after `id`: its own next(state) (or id), the ending branch after 3.7, A2/B2 -> C, else SCENE_ORDER.
  function nextId(id) {
    const sc = SCENES[id];
    if (sc && sc.next) return typeof sc.next === 'function' ? sc.next(state) : sc.next;
    if (id === '3.7') return (state.choice || TEST.ending || 'A') === 'B' ? 'B1' : 'A1';
    if (id === 'A2' || id === 'B2') return 'C';
    return SCENE_ORDER[SCENE_ORDER.indexOf(id) + 1];
  }
  function next(id = flow.sceneId) {
    const nx = nextId(id);
    if (nx && SCENES[nx]) return start(nx);
    theEnd();
  }
  // Chapter Select / &scene=: a fresh state plus the grants of every scene a player passes on the way to `id`, along
  // the target's branch (A1/A2 vs B1/B2; C and PC follow o.choice, else a choice already in state, else &ending, else A).
  function selectState(id, o) {
    const had = state && state.choice;
    state = newState();
    const k = SCENE_ORDER.indexOf(id), br = branchOf(id) || (k > SCENE_ORDER.indexOf('3.7') ? o.choice || had || TEST.ending || 'A' : null);
    for (const x of SCENE_ORDER) {
      if (x === id) break;
      const b = branchOf(x);
      if (b && b !== br) continue;
      if (SCENES[x] && SCENES[x].grants) grant(SCENES[x].grants);
    }
    if (br) state.choice = br;
    if (k > SCENE_ORDER.indexOf('1.3')) state.flags.tut_swap = true;   // the SWAP tutorial was 1.3's
  }

  async function start(id, o = {}) {
    if (!inited) { inited = true; addUpdate(tick); on('render', draw); }
    stop();
    const g = G, sc = SCENES[id];
    flow.sceneId = id; flow.scene = sc || null; flow.stepIndex = 0; flow.result = null;
    TWO_TEST.scene = id; TWO_TEST.step = null;
    testLog('scene ' + id);
    if (!sc) { console.warn('TWO: scene ' + id + ' is not built'); return theEnd(); }
    try {
      if (o.select) selectState(id, o); // scene select: a fresh state plus everything earlier scenes guarantee
      state.scene = id;
      if (id === 'A1' || id === 'B1') { // an ending has been seen (Extras -> Endings), saved now, not at PC
        if (!state.choice) state.choice = id[0];
        profile.endingsSeen[id[0]] = true; saveOptions();
        emit('ending', id[0]);
      }
      await ui.fade(1, 0.5);
      if (g !== G) return;
      popup.clear(); ui.card(null); cardOn = false; objective(null); ui.letterbox(false);
      if (cam.cutscene) cam.release(0);
      cam.override(null); world.split(null);
      despawnAll();
      if (sc.set) await loadSet(sc.set, sc.env);
      if (g !== G) return;
      if (sc.spawn) spawnMap(sc.spawn);
      const pl = sc.playable || [];
      if (pl.length && !pl.includes(state.active)) state.active = pl[0];
      flow.swap = !!sc.swap; flow.follow = null; flow.playable = null; player.follower(null);
      for (const k in mgFails) delete mgFails[k];
      recontrol();
      if (sc.follow) setFollow(sc.follow);   // a scene may start with followers: follow: true | id | [ids]
      if ('hud' in sc) hud.set(sc.hud); else if (typeof hud.show === 'function') hud.show(); else hud.set({ battery: state.battery, bars: state.bars });
      if ('music' in sc) mus(sc.music);
      hotspots.list.length = 0; hotspots.used.clear();
      if (sc.hotspots) hotspots.list.push(...sc.hotspots);
      if (id !== 'P') saveGame(); // Continue resumes at the start of this scene
      if (ACTS[id]) await ui.actCard(ACTS[id]);
      if (g !== G) return;
      // The scene's time card ("Tuesday 22 December 2026, 11:31" + place), small and not awaited: it plays over the
      // first shot. Not the scene title: several titles are the scene's own punchline.
      if (sc.time && sc.timeCard !== false && typeof ui.timeCard === 'function') ui.timeCard(sc.time, sc.place);
      ui.fade(0, 0.8); // the first step runs in this same tick, so an opening shot (or {fade}) wins
      const steps = sc.steps || [];
      for (let i = 0; i < steps.length; i++) {
        if (g !== G) return;
        const st = steps[i];
        flow.stepIndex = i; TWO_TEST.step = i + ' ' + st[0];
        testLog('scene ' + id + ' step ' + i + ' ' + st[0] + (typeof st[1] === 'string' ? ' ' + st[1] : ''));
        try { await sceneStep(st, steps[i + 1]); } catch (e) { console.error('TWO: scene ' + id + ' step ' + i + ' (' + st[0] + ') failed', e); }
      }
      if (g !== G) return;
    } catch (e) { console.error('TWO: scene ' + id + ' failed', e); return; }
    emit('scene:end', { id });
    testLog('scene ' + id + ' end');
    if (id === 'PC') { profile.completed = true; saveOptions(); } // Chapter Select and Extras unlock
    if (TEST.auto && (id === TEST.stop || id === 'PC')) { TWO_TEST.done = true; return; }
    if (id === 'PC') return toTitle();
    if (id === 'P' && !TEST.auto) return toTitle(); // first launch: the prologue, then the title
    next(id);
  }

  const flow = {
    skipping: false, scene: null, sceneId: null, stepIndex: 0, result: null,
    swap: false, follow: null, playable: null, roaming: false, busy: false, skipOffer: false,
    slowmo: 1,                        // slow-motion factor multiplied into clock.scale (the {slowmo, dur} step; reset when the cutscene ends)
    get cutscene() { return cutDepth > 0; }, // a cutscene (or a spot's steps) is running: the pause menu offers Skip Scene
    get minigameId() { return mg ? mg.id : null; },
    start, next, nextId, stop, minigame,
    skip() { // pause menu: run the rest of this cutscene instantly (state steps still apply)
      if (!cutDepth) return;
      flow.skipping = true; flow.slowmo = 1; slowT = 0; popup.clear();
      if (cardOn) { ui.card(null); cardOn = false; }
    },
    skipMinigame() { // pause menu "Skip this mini-game" (only once offered): finish it as skipped (+ its skipResult)
      if (!mg || !flow.skipOffer || mg.m.noSkip) return false;
      const m = mg.m, extra = typeof m.skipResult === 'function' ? m.skipResult(mg.api) : m.skipResult;
      testLog('minigame ' + mg.id + ' skipped');
      mg.api.finish(Object.assign({ skipped: true }, extra || {}));
      return true;
    },
    swapNext: () => doSwap(),         // SWAP from code (the boss's stall prompt, systems); -> the new active id or null
    setFollow,                        // same as the ['follow', x] scene step
    holdPos(id, on = true) {          // "Hold this": `id` stops following and keeps its spot (on = false: follow again)
      const f = flow.follow, l = Array.isArray(f) ? f : f ? [f] : [];
      const i = l.indexOf(id);
      if (on && i >= 0) l.splice(i, 1); else if (!on && i < 0 && id !== state.active) l.push(id);
      flow.follow = l.length ? l : null;
      applyFollow();
    },
    learnSample,                      // for systems/minigames that record outside a hotspot
  };

  return { flow, hotspots, inventory, runSteps, playCutscene };
})();
