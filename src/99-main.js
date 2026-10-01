// ============================================================ MAIN
// boot(): loader ("JARVIS is loading your game.": everything built, compiled and uploaded up front: audio, every set,
// every LOOKS rig (LOOKS[id].warm = n pools n of them), every drone model) -> "JARVIS is ready." [YES] -> the prologue
// on first launch -> title. ?autoplay starts at TEST.scene; ?setview=<set> boots straight into one set for inspection.
// The loop: fixed 60 Hz ticks (input, menus, UI, updaters, world.update) + interpolated world.render every frame.

async function boot() {
  loadPrefs();   // options + profile (02-core); a blocked or broken store just keeps the defaults
  document.body.classList.toggle('large', options.textSize === 'large');
  document.body.classList.toggle('calm', !!options.reduceFlashing);   // Reduce Flashing: CSS pulses and flickers go still
  ui.init(); menus.init();
  on('scene:end', (e) => {
    const id = e && typeof e === 'object' ? e.id : e;
    if (TEST.auto && (id === TEST.stop || id === 'PC')) TWO_TEST.done = true;
  });
  const hasWorld = () => typeof world !== 'undefined' && world.set;

  // ---------------------------------------------------------- loop
  const step = CONFIG.step;
  let last = performance.now(), acc = 0;
  function tick() {
    input.tick();
    menus.update();
    if (clock.paused) return;
    ui.update(step);
    clock.step();
    if (hasWorld()) world.update(step);
  }
  let reN = 0;
  function frame(now) {
    requestAnimationFrame(frame);
    const ms = now - last;
    last = now;
    perf.frame(ms);
    input.poll();
    acc += Math.min(ms / 1000, CONFIG.maxFrame) * (TEST.auto ? TEST.speed : 1) * clock.scale;   // (autoplay's speed scales slow motion too)
    for (let n = 0; acc >= step && n < 12; n++) { tick(); acc -= step; }
    if (acc >= step) acc %= step; // more than 12 ticks behind: drop it rather than spiral
    renderer.info.reset();
    if (hasWorld() && (!TEST.auto || TEST.re === 1 || ++reN % TEST.re === 0)) world.render(acc / step);
    emit('render', acc / step);
    perf.draw();
    if (renderer.info.programs.length > progN) {   // every shader should have been compiled by the loader
      progN = renderer.info.programs.length;
      if (TEST.auto) console.warn('TWO: shader compiled mid-game in ' + flow.sceneId + ' step ' + flow.stepIndex + ' (' + cam.name + ')');
    }
  }
  let progN = Infinity;
  requestAnimationFrame(frame);
  const nextFrame = () => new Promise((r) => requestAnimationFrame(() => r()));
  const ld = document.getElementById('loader');

  if (TEST.setview) return bootSetview(ld, nextFrame);

  // ---------------------------------------------------------- loader
  // "JARVIS is loading your game." The bar is honest about the work but now and then slips back a few percent
  // (Rue's bug list: "Progress bar goes backwards"). Purely cosmetic: the jobs never wait for it.
  const bar = ld.querySelector('.jv-prog i'), pct = ld.querySelector('.jv-prog span'), msg = ld.querySelector('.jv-msg');
  if (msg) msg.textContent = 'JARVIS is loading your game.';
  let realP = 0, shownP = -1, drawnPct = -1, dipT = 0, dipTo = 0, slips = 0;
  const paintP = (f) => {
    const k = Math.round(f * 100);
    if (k === drawnPct) return;
    drawnPct = k;
    if (bar) bar.style.transform = `scaleX(${f})`;
    if (pct) pct.textContent = k + '%';
  };
  const setP = (f) => {
    realP = f;
    if (shownP < 0) { shownP = f; paintP(f); }
    if (f > 0.12 && f < 0.94 && dipT <= 0 && slips < 4 && Math.random() < 0.12) {   // a slip: a few percent back, briefly
      slips++; dipT = 0.5 + Math.random() * 0.6; dipTo = Math.max(0, shownP - 0.02 - Math.random() * 0.05);
    }
  };
  const animP = (dt) => {
    let to = realP;
    if (dipT > 0) { dipT -= dt; to = dipTo; }
    shownP += (to - shownP) * Math.min(1, dt * (dipT > 0 ? 14 : 8));
    paintP(shownP);
  };
  addUpdate(animP);
  setP(0);

  // ---------------------------------------------------------- warm-up
  // One warm scene mirrors the sets' fixed light rig (hemi + dir + spot + FogExp2) so the same programs compile.
  let warm = null;
  const warmScene = () => {
    if (warm) return warm;
    const sc = new THREE.Scene();
    sc.background = new THREE.Color(0x2c3868);
    sc.fog = new THREE.FogExp2(0x2c3868, 0.002);
    sc.add(new THREE.HemisphereLight(0xfff2e0, 0x404058, 1.4));
    const dl = new THREE.DirectionalLight(0xffffff, 1.7); dl.position.set(1.2, 2.5, 3); sc.add(dl);
    const sp = new THREE.SpotLight(0xffffff, 0); sc.add(sp, sp.target);
    // program families only mid-game meshes use (transparent, instanced + colours: smears, fleets): compile them now
    const px = canvasTex(4, 4, () => {}, { key: 'warm_px' });
    for (const tr of [false, true]) for (const map of [null, px]) for (const col of [false, true]) {
      const im = new THREE.InstancedMesh(new THREE.BoxGeometry(0.001, 0.001, 0.001), mat(0xffffff, { transparent: tr, map, key: 'warm_family' }), 1);
      if (col) im.setColorAt(0, sc.background);
      im.frustumCulled = false; sc.add(im);
    }
    return (warm = { sc, cam: new THREE.PerspectiveCamera(30, 1, 0.05, 30), v: new THREE.Vector3(), s: new THREE.Vector3(), box: new THREE.Box3() });
  };
  // Build one rig of a look under the warm rig, compile + upload it, optionally bake its dialogue portrait from a
  // head-and-shoulders render of the real model, and hand it to the world's pool (its spawn then builds nothing).
  const warmRig = (id, bake) => {
    const w = warmScene(), rig = buildCharacter(id), v = w.v, c = w.cam, gl = renderer.domElement;
    w.sc.add(rig.root);
    if (rig.face && rig.face.set) rig.face.set('neutral');
    rig.root.updateMatrixWorld(true);
    if (typeof rig.eye === 'number') v.set(0, rig.eye - 0.04, 0); else { rig.parts.head.getWorldPosition(v); v.y += 0.08; }
    c.aspect = gl.width / gl.height; c.updateProjectionMatrix();
    c.position.set(v.x + 0.12, v.y + 0.05, v.z + 0.8); c.lookAt(v.x, v.y + 0.01, v.z);
    renderer.compile(w.sc, c);
    renderer.render(w.sc, c);
    if (bake) {
      const pc = document.createElement('canvas'), side = Math.min(gl.width, gl.height);
      pc.width = pc.height = 128;
      pc.getContext('2d').drawImage(gl, (gl.width - side) / 2, (gl.height - side) / 2, side, side, 0, 0, 128, 128); // same task as the render
      portraitURL.bake(id, pc);
    }
    w.sc.remove(rig.root);
    if (typeof world !== 'undefined' && world.adopt) world.adopt(id, rig);
  };
  const warmCharacter = (id) => {   // LOOKS[id].warm = n: n rigs in the pool (two of a look on screen at once)
    const n = Math.max(1, Math.min(12, (LOOKS[id] && LOOKS[id].warm) | 0));
    for (let k = 0; k < n; k++) warmRig(id, k === 0);
  };
  // A model that isn't an actor (drones): render it once under the warm rig so its programs and textures exist.
  const warmObject = (o) => {
    if (!o || !o.isObject3D) return;
    const w = warmScene(), c = w.cam, gl = renderer.domElement;
    w.sc.add(o); o.updateMatrixWorld(true);
    w.box.setFromObject(o); w.box.getCenter(w.v);
    const r = Math.max(0.3, w.box.getSize(w.s).length());
    c.aspect = gl.width / gl.height; c.updateProjectionMatrix();
    c.position.set(w.v.x + r * 0.6, w.v.y + r * 0.4, w.v.z + r * 1.2); c.lookAt(w.v);
    renderer.compile(w.sc, c); renderer.render(w.sc, c);
    w.sc.remove(o);
  };
  // Drone models (04-art / 33-systems), whichever hooks exist: DRONES.warm(warmObject) builds and warms its own pool;
  // else every builder in DRONE_MODELS (kind -> () => Object3D), else buildDrone(kind) for each DRONE_KINDS kind.
  const droneJobs = () => {
    const J = [];
    if (typeof DRONES !== 'undefined' && DRONES && typeof DRONES.warm === 'function') J.push(() => DRONES.warm(warmObject));
    else if (typeof DRONE_MODELS !== 'undefined' && DRONE_MODELS) for (const k in DRONE_MODELS) J.push(() => warmObject(typeof DRONE_MODELS[k] === 'function' ? DRONE_MODELS[k]() : DRONE_MODELS[k]));
    else if (typeof buildDrone === 'function') {
      const kinds = typeof DRONE_KINDS !== 'undefined' && Array.isArray(DRONE_KINDS) ? DRONE_KINDS : ['courtesy', 'guardian', 'popup', 'cleaning', 'noise', 'fun'];
      for (const k of kinds) J.push(() => warmObject(buildDrone(k)));
    }
    return J;
  };

  const jobs = [];
  if (typeof AUDIO !== 'undefined') jobs.push(() => AUDIO.prerender());
  if (typeof world !== 'undefined') for (const id in SETS) jobs.push(() => world.warm(id));
  if (typeof buildCharacter === 'function') for (const id in LOOKS) if (LOOKS[id]) jobs.push(() => warmCharacter(id));
  jobs.push(...droneJobs());
  await nextFrame();
  for (let i = 0; i < jobs.length; i++) {
    try { await jobs[i](); } catch (e) { console.error('TWO boot job failed', e); }
    setP((i + 1) / jobs.length);
    await nextFrame();
  }
  renderer.setRenderTarget(null); renderer.clear();
  perf.adapt = true;
  progN = renderer.info.programs.length;
  realP = 1; dipT = 0; shownP = 1; paintP(1); removeUpdate(animP);

  if (TEST.auto) {
    ld.classList.add('off');
    if (typeof AUDIO !== 'undefined') AUDIO.init();
    state = newState();
    TWO_TEST.ready = true;
    flow.start(TEST.scene || 'P', { select: !!TEST.scene, choice: TEST.ending });
    return;
  }

  // "JARVIS is ready. [YES]" — the first key/click unlocks audio inside the event itself
  if (msg) msg.textContent = 'JARVIS is ready.';
  ld.querySelector('.jv-prog').classList.add('off');
  const yes = document.createElement('button');
  yes.className = 'jv-b foc'; yes.textContent = 'YES';
  ld.querySelector('.jv-btns').append(yes);
  input.gesture = () => { if (typeof AUDIO !== 'undefined') AUDIO.init(); };
  TWO_TEST.ready = true;
  await new Promise((res) => {
    const f = () => { if (input.pressed('yes')) { input.consume('yes'); done(); } };
    const done = () => { removeUpdate(f); yes.onclick = null; res(); };
    yes.onclick = done;
    addUpdate(f);
  });
  ui.sfx('chime_ready');
  ld.classList.add('off');
  if (!profile.seenPrologue) { state = newState(); flow.start('P'); } else menus.title();   // P ends on the title (flow)
}

// ------------------------------------------------------------ ?setview=<setId>&env=<preset>: set inspection
// Boots straight into one set: no scene, no UI chrome, no letterbox, no warm-up of the rest, fixed pixel ratio.
// window.TWO_TEST.views() -> [{ kind: 'cam' | 'anchor', name }]; await TWO_TEST.view(kind, name) puts the camera exactly
// there (cams: their fixed/pan base framing, as a SET shot; anchors: from -> at with their fov, as an INSERT), renders
// two frames and resolves { calls, tris, textures, geometries }. TWO_TEST.envs() -> preset names; TWO_TEST.setEnv(name).
async function bootSetview(ld, nextFrame) {
  const id = TEST.setview, def = SETS[id];
  ld.classList.add('off');
  const uiEl = document.getElementById('ui');
  if (uiEl) uiEl.style.display = 'none';
  document.getElementById('overlay').classList.add('off');
  perf.adapt = false;
  if (!def) { console.error('TWO: setview: no set ' + id + ' (have: ' + Object.keys(SETS).join(', ') + ')'); TWO_TEST.ready = true; return; }
  try { await world.load(id, TEST.env ? { env: TEST.env } : {}); } catch (e) { console.error('TWO: setview: ' + id + ' failed to build', e); TWO_TEST.ready = true; return; }
  if (typeof player !== 'undefined') player.enabled = false;
  const frames = async (n) => { // n rendered frames with at least n ticks in between (the camera moves in a tick)
    const f0 = clock.frame;
    for (let k = 0; k < n || clock.frame < f0 + n; k++) await nextFrame();
  };
  const stats = () => {
    const r = renderer.info.render, m = renderer.info.memory;
    return { calls: r.calls, tris: r.triangles, textures: m.textures, geometries: m.geometries };
  };
  Object.assign(TWO_TEST, {
    set: id,
    views: () => [
      ...Object.keys(def.cams || {}).map((name) => ({ kind: 'cam', name })),
      ...Object.keys(def.anchors || {}).map((name) => ({ kind: 'anchor', name })),
    ],
    async view(kind, name) {
      if (kind === 'cam') { if (!(def.cams || {})[name]) throw new Error('no cam ' + name); cam.shot({ shot: 'SET', cam: name }); }
      else if (kind === 'anchor') { if (!(def.anchors || {})[name]) throw new Error('no anchor ' + name); cam.shot({ shot: 'INSERT', at: name }); }
      else throw new Error('kind must be cam or anchor');
      await frames(2);
      return stats();
    },
    envs: () => Object.keys(def.env || {}),
    async setEnv(name) { world.env(name, 0); await frames(2); return stats(); },
    stats,
  });
  await frames(2);
  TWO_TEST.ready = true;
}

boot();
