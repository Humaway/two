// ============================================================ ART
// Canvas textures, the material library, static geometry (Builder), instancing, blob
// shadows, GPU rain, and the character rig (buildCharacter + LOOKS + ANIMS).
// Look: clean faceted low-poly. Everything is MeshLambertMaterial, flatShading, vertexColors
// (one program family); light is baked into vertex colours so sets read under hemi+dir.

// ------------------------------------------------------------ textures & materials
// canvasTex(w, h, paint(ctx,w,h), {repeat:[x,y], key, nearest}) -> sRGB CanvasTexture, mipmapped. `nearest: true`
// magnifies with point sampling (the PS1 look in close-ups; minification stays mip-filtered so text doesn't shimmer).
const canvasTex = (() => {
  const cache = new Map();
  return (w, h, paint, o = {}) => {
    if (o.key && cache.has(o.key)) return cache.get(o.key);
    const c = document.createElement('canvas'); c.width = w; c.height = h;
    paint(c.getContext('2d'), w, h);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
    if (o.nearest) t.magFilter = THREE.NearestFilter;
    if (o.repeat) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(o.repeat[0], o.repeat[1]); }
    if (o.key) cache.set(o.key, t);
    return t;
  };
})();

// mat(color, {emissive, emissiveIntensity, transparent, opacity, side, map, depthWrite, key}) -> cached
// MeshLambertMaterial. Shared: never animate a cached one unless you passed a unique `key`.
// With both `map` and `emissive`, the map is also the emissive map (self-lit screens: matTex(t, {emissive: 0xffffff})).
// Geometry without a colour attribute renders as if its vertex colour were white.
const mat = (() => {
  const cache = new Map();
  return (color = 0xffffff, o = {}) => {
    const c = new THREE.Color(color);
    const key = [c.getHexString(), o.emissive, o.emissiveIntensity, !!o.transparent, o.opacity ?? 1, o.side ?? 0,
      o.map ? o.map.uuid : '', o.depthWrite, o.key].join('|');
    let m = cache.get(key);
    if (m) return m;
    m = new THREE.MeshLambertMaterial({ color: c, flatShading: true, vertexColors: true, map: o.map || null,
      transparent: !!o.transparent, opacity: o.opacity ?? 1, side: o.side ?? THREE.FrontSide });
    if (o.transparent) { m.depthWrite = o.depthWrite ?? false; m.forceSinglePass = true; }   // double-sided glass in one pass (two passes re-pick the program every frame)
    if (o.emissive != null) { m.emissive.set(o.emissive); m.emissiveIntensity = o.emissiveIntensity ?? 1; if (o.map) m.emissiveMap = o.map; }
    m.defaultAttributeValues = { color: [1, 1, 1] };
    cache.set(key, m);
    return m;
  };
})();
const matTex = (tex, o = {}) => mat(o.color ?? 0xffffff, { ...o, map: tex });

// bakeLight(geometry, {dir, ambient, floor=true, y0}) writes (or multiplies into) a colour attribute:
// lambert from a fixed key direction, darker undersides, and (floor) an AO gradient that darkens
// walls/props toward the floor height y0 (default 0; instanced() uses the geometry's lowest point).
function bakeLight(g, o = {}) {
  const d = new THREE.Vector3(...(o.dir || [0.45, 0.8, 0.35])).normalize();
  const amb = o.ambient ?? 0.72, floor = o.floor !== false;
  const y0 = o.y0 ?? 0;
  if (!g.attributes.normal) g.computeVertexNormals();
  const p = g.attributes.position, n = g.attributes.normal, old = g.attributes.color;
  const col = new Float32Array(p.count * 3);
  for (let i = 0; i < p.count; i++) {
    const nx = n.getX(i), ny = n.getY(i), nz = n.getZ(i);
    let c = amb + (1 - amb) * Math.max(0, nx * d.x + ny * d.y + nz * d.z);
    if (ny < -0.5) c *= 0.82;
    if (floor && ny < 0.7) { const y = Math.min(1, Math.max(0, (p.getY(i) - y0) / 1.4)); c *= 0.7 + 0.3 * y * y * (3 - 2 * y); }
    for (let k = 0; k < 3; k++) col[i * 3 + k] = c * (old ? old.getComponent(i, k) : 1);
  }
  g.setAttribute('color', new THREE.BufferAttribute(col, 3));
  return g;
}

// ------------------------------------------------------------ Builder
// Static set geometry, merged per material. Positions are CENTRES (like a Mesh at that position).
//   b.box(w,h,d, m, [x,y,z], rotY)   b.cyl(rTop,rBot,h,seg, m, [x,y,z], rotY)
//   b.plane(w,h, m, [x,y,z], [rx,ry,rz])  (faces +Z before rotation)   b.geo(geometry, m, Matrix4|[x,y,z])
//   b.done({dir, ambient, floor}) -> Group with one baked mesh per material. Builders are single-use.
class Builder {
  constructor() { this.list = new Map(); }
  add(g, m) { let a = this.list.get(m); if (!a) this.list.set(m, a = []); a.push(g); return this; }
  box(w, h, d, m, p = [0, 0, 0], rotY = 0) {
    const g = new THREE.BoxGeometry(w, h, d); if (rotY) g.rotateY(rotY);
    return this.add(g.translate(p[0], p[1], p[2]), m);
  }
  cyl(rt, rb, h, seg = 8, m, p = [0, 0, 0], rotY = 0) {
    const g = new THREE.CylinderGeometry(rt, rb, h, seg); if (rotY) g.rotateY(rotY);
    return this.add(g.translate(p[0], p[1], p[2]), m);
  }
  plane(w, h, m, p = [0, 0, 0], r) {
    const g = new THREE.PlaneGeometry(w, h);
    if (r) g.applyMatrix4(new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(r[0], r[1], r[2])));
    return this.add(g.translate(p[0], p[1], p[2]), m);
  }
  geo(geometry, m, at = [0, 0, 0]) {
    const g = geometry.clone();
    if (at.isMatrix4) g.applyMatrix4(at); else g.translate(at[0], at[1], at[2]);
    return this.add(g, m);
  }
  done(o = {}) {
    const group = new THREE.Group();
    for (const [m, gs] of this.list) {
      const anyCol = gs.some((g) => g.attributes.color);
      const parts = gs.map((g0) => {
        const g = g0.index ? g0.toNonIndexed() : g0;
        if (!g.attributes.normal) g.computeVertexNormals();
        if (!g.attributes.uv) g.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(g.attributes.position.count * 2), 2));
        if (anyCol && !g.attributes.color) g.setAttribute('color', new THREE.BufferAttribute(new Float32Array(g.attributes.position.count * 3).fill(1), 3));
        for (const k of Object.keys(g.attributes)) if (!/^(position|normal|uv|color)$/.test(k)) g.deleteAttribute(k);
        g.morphAttributes = {};
        return g;
      });
      const merged = mergeGeometries(parts);
      for (const g of gs) g.dispose();
      for (const g of parts) g.dispose();
      bakeLight(merged, o);
      group.add(new THREE.Mesh(merged, m));
    }
    this.list.clear();
    return group;
  }
}

// instanced(geometry, material, [[x,y,z,rotY,scale|[sx,sy,sz]], ...]) -> InstancedMesh.
// Bakes light into the geometry once if it has no colour attribute (local y = height).
function instanced(g, m, list) {
  if (!g.attributes.color) { g.computeBoundingBox(); bakeLight(g, { y0: g.boundingBox.min.y }); }
  const im = new THREE.InstancedMesh(g, m, list.length);
  const q = new THREE.Quaternion(), p = new THREE.Vector3(), s = new THREE.Vector3(), mx = new THREE.Matrix4(), up = new THREE.Vector3(0, 1, 0);
  list.forEach((t, i) => {
    const sc = t[4] ?? 1;
    if (Array.isArray(sc)) s.set(sc[0], sc[1], sc[2]); else s.set(sc, sc, sc);
    im.setMatrixAt(i, mx.compose(p.set(t[0], t[1], t[2]), q.setFromAxisAngle(up, t[3] || 0), s));
  });
  im.instanceMatrix.needsUpdate = true;
  im.computeBoundingSphere();
  return im;
}

// blobShadow() -> small flat Mesh (shared geometry + one shared transparent material). Parent it under an actor.
const blobShadow = (() => {
  let geo, material;
  return () => {
    if (!geo) {
      geo = new THREE.PlaneGeometry(0.8, 0.8).rotateX(-Math.PI / 2);
      const tex = canvasTex(128, 128, (c, w, h) => {
        const gr = c.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
        gr.addColorStop(0, 'rgba(0,0,0,0.55)'); gr.addColorStop(0.5, 'rgba(0,0,0,0.35)'); gr.addColorStop(1, 'rgba(0,0,0,0)');
        c.fillStyle = gr; c.fillRect(0, 0, w, h);
      }, { key: 'blob' });
      material = new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false,
        polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 });
    }
    const m = new THREE.Mesh(geo, material);
    m.position.y = 0.01; m.renderOrder = 1; m.name = 'blob';
    return m;
  };
})();

// makeRain({box:[minX,minZ,maxX,maxZ], top=10, count=2500, bottom=0}) -> Points. Drops fall in the vertex
// shader: set rain.uniforms.uTime.value (seconds) and rain.uniforms.uAmount.value (0..1) — also on material.uniforms.
function makeRain({ box = [-10, -10, 10, 10], top = 10, count = 2500, bottom = 0 } = {}) {
  const pos = new Float32Array(count * 3), rnd = new Float32Array(count * 2);
  for (let i = 0; i < count; i++) {
    pos[i * 3] = box[0] + Math.random() * (box[2] - box[0]);
    pos[i * 3 + 1] = bottom + Math.random() * (top - bottom);
    pos[i * 3 + 2] = box[1] + Math.random() * (box[3] - box[1]);
    rnd[i * 2] = Math.random(); rnd[i * 2 + 1] = Math.random();
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  g.setAttribute('aRnd', new THREE.BufferAttribute(rnd, 2));
  const m = new THREE.ShaderMaterial({
    uniforms: THREE.UniformsUtils.merge([THREE.UniformsLib.fog, {
      uTime: { value: 0 }, uAmount: { value: 1 }, uTop: { value: top }, uBottom: { value: bottom },
      uColor: { value: new THREE.Color(0xd4dde6) },
    }]),
    vertexShader: `
      uniform float uTime, uAmount, uTop, uBottom;
      attribute vec2 aRnd;
      varying float vA; varying float vSize;
      #include <fog_pars_vertex>
      void main() {
        float h = uTop - uBottom;
        float y = uTop - mod(uTime * (7.5 + aRnd.y * 3.5) + aRnd.x * h, h);
        vec4 mvPosition = modelViewMatrix * vec4(position.x + (uTop - y) * 0.05, y, position.z, 1.0);
        gl_Position = projectionMatrix * mvPosition;
        vA = step(aRnd.y, uAmount) * (0.6 + 0.4 * aRnd.x);
        vSize = clamp(90.0 / max(-mvPosition.z, 0.1), 2.0, 90.0) * vA;
        gl_PointSize = vSize;
        #include <fog_vertex>
      }`,
    fragmentShader: `
      uniform vec3 uColor;
      varying float vA; varying float vSize;
      #include <fog_pars_fragment>
      void main() {
        vec2 c = gl_PointCoord - 0.5;
        float w = max(0.035, 0.9 / vSize);
        float a = (1.0 - smoothstep(w * 0.5, w, abs(c.x - c.y * 0.08))) * (1.0 - smoothstep(0.25, 0.5, abs(c.y)));
        if (a * vA < 0.02) discard;
        gl_FragColor = vec4(uColor, a * 0.5 * vA);
        #include <colorspace_fragment>
        #include <fog_fragment>
      }`,
    transparent: true, depthWrite: false, fog: true,
  });
  const pts = new THREE.Points(g, m);
  pts.frustumCulled = false; pts.name = 'rain';
  pts.uniforms = m.uniforms;
  return pts;
}

// ------------------------------------------------------------ characters
// One shared rig: a rigid-skinned SkinnedMesh (1 draw call) + a textured head mesh carrying the painted
// face + small attachment meshes. Actor faces +Z; character's left is +X. Bone rest pose = standing,
// arms down. Limb bones point down -Y: negative x rotation swings a limb forward.
// TWO: a 17th bone 'coat' (child of hips, pivot at the hip joint) carries long coat skirts; rig.update springs it from
// the root's motion (sway). Skinned attachments (coat, gloves, ponytail) share the skeleton and toggle with .visible.
// The wardrobe API (content): a.rig.show(name, on = true) toggles any rig.attach entry or a group ('santa', 'hood',
// 'hurt', 'chip', 'goggles', 'goggles_up'); a.rig.dress(state) resets the look and applies the story flags (it runs by
// itself whenever the rig is added to a scene, i.e. every world.spawn into a set); a.rig.chip('on'|'off'|'ping'|'amber'|
// 'red'|'dim'); a.rig.badgeFlip(on, 'lanyard'|'lanyard2'); a.rig.face.mark('blood'|'soot'|'bruise'|'graze', on);
// a.rig.face.browLift(0..1); a.rig.attach.santa_beard.userData.state('on'|'slip'|'chin'|'eyes'|'ear') / .slip(k);
// a.rig.attach.goggles.userData.up(bool); a.rig.attach.headphones_held is placed by hold_headphones_up / put_headphones_on.
// Badges paint their own textures (front + biro back); extras (cust26_, local40_, staff_, ...) get 128 px faces.
const buildCharacter = (() => {
  const TAU = Math.PI * 2;
  const PART = ['hips', 'torso', 'neck', 'head', 'armL', 'foreL', 'handL', 'armR', 'foreR', 'handR', 'legL', 'shinL', 'footL', 'legR', 'shinR', 'footR', 'coat'];
  const [HIPS, TORSO, NECK, HEAD, ARML, FOREL, HANDL, ARMR, FORER, HANDR, LEGL, SHINL, FOOTL, LEGR, SHINR, FOOTR, COAT] = PART.map((_, i) => i);
  const cols = new Map();
  const lin = (c) => cols.get(c) || (cols.set(c, new THREE.Color(c)), cols.get(c));
  const shade = (c, k) => '#' + new THREE.Color(c).multiplyScalar(k).getHexString();
  const mix = (a, b, k) => '#' + new THREE.Color(a).lerp(new THREE.Color(b), k).getHexString();
  let seed = 1;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);

  // ---- shared body atlas: white (plain vertex colour) + "Yes" logos + name badges
  const AT = 256, REG = { white: [0.75, 0.625] };   // white sample point sits inside a 128 px white block (clean mips)
  const tile = (n, x, y, w, h) => (REG[n] = [x / AT, 1 - (y + h) / AT, (x + w) / AT, 1 - y / AT]);
  // painted greyscale tiles (multiplied by the vertex colour): denim twill, faded knees, hair strands
  tile('denim', 2, 2, 58, 58); tile('knee_up', 66, 2, 58, 58); tile('knee_dn', 2, 66, 58, 58); tile('hair', 66, 66, 58, 58);
  tile('tweed', 166, 138, 40, 40); tile('knit', 212, 138, 40, 40);
  // TWO (the old badge row y 196-232 is free: badges have their own textures now): flannel check, quilted foam,
  // burn-scar mottle, bandage crepe, trench-coat gabardine, fake fur
  const T2 = ['plaid', 'quilt', 'scar', 'crepe', 'twill', 'fur'];
  T2.forEach((n, i) => tile(n, 2 + i * 36, 198, 32, 32));
  function drawYes(c, x, y, h, color) {           // handwritten "Yes", h = box height in px
    c.save(); c.translate(x, y); c.scale(h / 50, h / 50);
    c.strokeStyle = color; c.lineWidth = 6.5; c.lineCap = c.lineJoin = 'round'; c.beginPath();
    c.moveTo(6, 9); c.quadraticCurveTo(8, 25, 21, 27);
    c.moveTo(33, 7); c.quadraticCurveTo(31, 31, 23, 41); c.quadraticCurveTo(17, 50, 9, 45);
    c.moveTo(40, 29); c.quadraticCurveTo(53, 29, 52, 22); c.quadraticCurveTo(49, 15, 42, 21);
    c.quadraticCurveTo(36, 29, 42, 35); c.quadraticCurveTo(48, 39, 56, 33);
    c.moveTo(75, 21); c.quadraticCurveTo(67, 17, 64, 23); c.quadraticCurveTo(63, 28, 71, 30);
    c.quadraticCurveTo(79, 33, 75, 38); c.quadraticCurveTo(70, 42, 61, 37);
    c.stroke(); c.restore();
  }
  canvasTex.yes = drawYes;   // shared handwritten "Yes" painter for sets/cards: canvasTex.yes(ctx, x, y, height, color)
  let atlasMat = null, skinMat = null;   // skinned bodies get their own copy: one material on skinned + plain meshes re-picks its program at every switch
  const atlas = () => atlasMat || (atlasMat = matTex(canvasTex(AT, AT, (c) => {
    c.fillStyle = '#fff'; c.fillRect(0, 0, AT, AT);
    let q = 12345; const r = () => ((q = (q * 16807) % 2147483647) / 2147483647);
    const speck = (x0, y0, n, lo, hi) => { for (let i = 0; i < n; i++) { const v = lo + r() * (hi - lo) | 0; c.fillStyle = `rgb(${v},${v},${v + 4})`; c.fillRect(x0 + r() * 62, y0 + r() * 62, 1 + (r() < 0.3), 1); } };
    const denim = (x0, y0, base) => {
      c.fillStyle = base; c.fillRect(x0, y0, 64, 64); speck(x0, y0, 900, 150, 255);
      c.save(); c.beginPath(); c.rect(x0, y0, 64, 64); c.clip(); c.strokeStyle = 'rgba(40,40,60,0.12)'; c.lineWidth = 1;
      for (let i = -64; i < 64; i += 3) { c.beginPath(); c.moveTo(x0 + i, y0 + 64); c.lineTo(x0 + i + 64, y0); c.stroke(); }
      c.strokeStyle = 'rgba(255,255,255,0.18)'; for (let i = 0; i < 6; i++) { const x = x0 + r() * 64; c.beginPath(); c.moveTo(x, y0); c.lineTo(x + (r() - 0.5) * 4, y0 + 64); c.stroke(); }
      c.restore();
    };
    denim(0, 0, '#dcdcdc');
    for (const [x0, y0, up] of [[64, 0, 1], [0, 64, 0]]) {        // faded knee: bright toward the knee line, pants-dark at the far edge
      const g = c.createLinearGradient(0, y0 + (up ? 64 : 0), 0, y0 + (up ? 0 : 64));
      g.addColorStop(0, '#ffffff'); g.addColorStop(0.55, '#e8e8e8'); g.addColorStop(1, '#a9a9a9');
      c.fillStyle = g; c.fillRect(x0, y0, 64, 64);
      c.globalAlpha = 0.55; speck(x0, y0, 700, 120, 255); c.globalAlpha = 0.4;
      c.strokeStyle = 'rgba(255,255,255,0.7)'; for (let i = 0; i < 16; i++) { const y = y0 + (up ? 64 - r() * 28 : r() * 28); c.beginPath(); c.moveTo(x0 + 6 + r() * 16, y); c.lineTo(x0 + 40 + r() * 18, y + (r() - 0.5) * 3); c.stroke(); }
      c.globalAlpha = 1;
    }
    c.fillStyle = '#ececec'; c.fillRect(64, 64, 64, 64);           // hair: long strands
    for (let i = 0; i < 70; i++) { const x = 64 + r() * 64, v = 170 + r() * 85 | 0; c.strokeStyle = `rgb(${v},${v},${v})`; c.lineWidth = 0.8 + r() * 1.4; c.beginPath(); c.moveTo(x, 64); c.quadraticCurveTo(x + (r() - 0.5) * 6, 96, x + (r() - 0.5) * 4, 128); c.stroke(); }
    c.fillStyle = '#dedede'; c.fillRect(162, 134, 48, 48);         // tweed: herringbone + coloured-ish flecks
    c.save(); c.beginPath(); c.rect(162, 134, 48, 48); c.clip(); c.strokeStyle = 'rgba(60,50,40,0.22)'; c.lineWidth = 1;
    for (let x = 162; x < 212; x += 6) for (let y = 134; y < 184; y += 4) { c.beginPath(); c.moveTo(x, y); c.lineTo(x + 3, y + 3); c.lineTo(x + 6, y); c.stroke(); }
    for (let i = 0; i < 260; i++) { const v = 110 + r() * 145 | 0; c.fillStyle = `rgb(${v},${v - 6},${v - 12})`; c.fillRect(162 + r() * 48, 134 + r() * 48, 1, 1); }
    c.restore();
    c.fillStyle = '#e4e4e4'; c.fillRect(208, 134, 48, 48);         // knit: rib columns of V stitches
    c.save(); c.beginPath(); c.rect(208, 134, 48, 48); c.clip(); c.strokeStyle = 'rgba(40,40,40,0.28)'; c.lineWidth = 1.2;
    for (let x = 208; x < 256; x += 6) { for (let y = 134; y < 184; y += 5) { c.beginPath(); c.moveTo(x + 0.5, y); c.lineTo(x + 3, y + 3.5); c.lineTo(x + 5.5, y); c.stroke(); } c.fillStyle = 'rgba(0,0,0,0.12)'; c.fillRect(x + 5.5, 134, 0.8, 48); }
    c.restore();
    [['yes_black', CONFIG.colors.polo], ['yes_blue', CONFIG.colors.chaseBlue]].forEach(([n, bg], i) => {
      c.fillStyle = bg; c.fillRect(i * 80, 136, 80, 40);
      drawYes(c, i * 80 + 12, 141, 30, CONFIG.colors.yes);
      tile(n, i * 80 + 10, 139, 60, 34);
    });
    // TWO tiles (32 px, 4 px apart so mips don't bleed): see T2 above
    const X = (i) => 2 + i * 36, Y = 198, S = 32, clip = (i) => { c.save(); c.beginPath(); c.rect(X(i), Y, S, S); c.clip(); };
    // plaid: light ground, dark bands both ways (multiplied by the flannel colour = a two-tone check)
    clip(0); c.fillStyle = '#f2f2f2'; c.fillRect(X(0), Y, S, S); c.fillStyle = 'rgba(0,0,0,0.42)';
    for (const o of [0, 16]) { c.fillRect(X(0) + o, Y, 8, S); c.fillRect(X(0), Y + o, S, 8); }
    c.fillStyle = 'rgba(0,0,0,0.25)'; for (const o of [11, 27]) { c.fillRect(X(0) + o, Y, 1.5, S); c.fillRect(X(0), Y + o, S, 1.5); }
    c.restore();
    // quilt: padded diamonds with dark stitched seams and a soft highlight in each cell
    clip(1); c.fillStyle = '#e6e6e6'; c.fillRect(X(1), Y, S, S);
    for (let gx = -1; gx < 3; gx++) for (let gy = -1; gy < 3; gy++) { const cx = X(1) + gx * 16 + 8, cy = Y + gy * 16 + 8, g = c.createRadialGradient(cx - 2, cy - 2, 1, cx, cy, 10); g.addColorStop(0, '#ffffff'); g.addColorStop(1, '#cfcfcf'); c.fillStyle = g; c.beginPath(); c.moveTo(cx, cy - 8); c.lineTo(cx + 8, cy); c.lineTo(cx, cy + 8); c.lineTo(cx - 8, cy); c.closePath(); c.fill(); }
    c.strokeStyle = 'rgba(70,70,70,0.6)'; c.lineWidth = 1; c.beginPath();
    for (let i = -32; i <= 32; i += 16) { c.moveTo(X(1) + i, Y); c.lineTo(X(1) + i + S, Y + S); c.moveTo(X(1) + i + S, Y); c.lineTo(X(1) + i, Y + S); } c.stroke();
    c.restore();
    // scar: shiny mottled tissue, pale ridges on a darker ground
    clip(2); c.fillStyle = '#c8c8c8'; c.fillRect(X(2), Y, S, S);
    for (let i = 0; i < 26; i++) { const v = 150 + r() * 105 | 0; c.fillStyle = `rgba(${v},${v},${v},0.8)`; c.beginPath(); c.ellipse(X(2) + r() * S, Y + r() * S, 2 + r() * 5, 1 + r() * 2.5, r() * 3, 0, TAU); c.fill(); }
    c.strokeStyle = 'rgba(255,255,255,0.7)'; c.lineWidth = 1; for (let i = 0; i < 6; i++) { const y = Y + 3 + r() * 26; c.beginPath(); c.moveTo(X(2), y); c.quadraticCurveTo(X(2) + 16, y + (r() - 0.5) * 10, X(2) + S, y + (r() - 0.5) * 6); c.stroke(); }
    c.restore();
    // crepe: fine bandage weave
    clip(3); c.fillStyle = '#f4f4f4'; c.fillRect(X(3), Y, S, S); c.strokeStyle = 'rgba(0,0,0,0.13)'; c.lineWidth = 1;
    for (let i = 0; i < S; i += 2) { c.beginPath(); c.moveTo(X(3), Y + i + 0.5); c.lineTo(X(3) + S, Y + i + 0.5); c.stroke(); }
    c.strokeStyle = 'rgba(0,0,0,0.07)'; for (let i = 0; i < S; i += 3) { c.beginPath(); c.moveTo(X(3) + i + 0.5, Y); c.lineTo(X(3) + i + 0.5, Y + S); c.stroke(); }
    c.restore();
    // twill: diagonal gabardine ribs + worn, scuffed patches (a battered trench)
    clip(4); c.fillStyle = '#e8e8e8'; c.fillRect(X(4), Y, S, S); c.strokeStyle = 'rgba(0,0,0,0.12)'; c.lineWidth = 1;
    for (let i = -S; i < S; i += 3) { c.beginPath(); c.moveTo(X(4) + i, Y + S); c.lineTo(X(4) + i + S, Y); c.stroke(); }
    for (let i = 0; i < 7; i++) { c.fillStyle = r() < 0.5 ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.14)'; c.beginPath(); c.ellipse(X(4) + r() * S, Y + r() * S, 3 + r() * 6, 2 + r() * 4, r() * 3, 0, TAU); c.fill(); }
    c.restore();
    // fur: soft clumps (Santa trim, the fake beard)
    clip(5); c.fillStyle = '#e4e4e4'; c.fillRect(X(5), Y, S, S);
    for (let i = 0; i < 70; i++) { const v = 200 + r() * 55 | 0; c.fillStyle = `rgb(${v},${v},${v})`; c.beginPath(); c.arc(X(5) + r() * S, Y + r() * S, 1 + r() * 2.2, 0, TAU); c.fill(); }
    c.restore();
  }, { key: 'char_atlas', nearest: true })));

  // ---- geometry accumulation (build time only)
  let G = null;
  const I4 = new THREE.Matrix4(), _v = new THREE.Vector3();
  // G.bone(p, b) -> bone index (optional): re-home a vertex on another bone with the same rest frame (the coat bone
  // shares the hips origin, so a skirt authored in hips space can live on either). G.blend(p) -> [bone, weight] | null.
  function vert(b, p, col, uv) {
    if (G.bone) b = G.bone(p, b);
    _v.set(p[0], p[1], p[2]).applyMatrix4(G.m[b] || I4);
    G.P.push(_v.x, _v.y, _v.z); G.C.push(col.r, col.g, col.b); G.U.push(uv[0], uv[1]); G.S.push(b);
    const x = G.blend ? G.blend(p) : null;
    G.B.push(x ? x[0] : 0, x ? x[1] : 0);
  }
  const W2 = REG.white;
  function tri(b, p0, p1, p2, color, u0 = W2, u1 = W2, u2 = W2) { const c = lin(color); vert(b, p0, c, u0); vert(b, p1, c, u1); vert(b, p2, c, u2); }
  function quad(b, p0, p1, p2, p3, color, uv) {
    if (uv) { tri(b, p0, p1, p2, color, [uv[0], uv[1]], [uv[2], uv[1]], [uv[2], uv[3]]); tri(b, p0, p2, p3, color, [uv[0], uv[1]], [uv[2], uv[3]], [uv[0], uv[3]]); }
    else { tri(b, p0, p1, p2, color); tri(b, p0, p2, p3, color); }
  }
  // ring at height y around (xc, zc); angle 0 = +Z (front), increasing toward +X. Open arcs get n+1 points.
  function ring(n, y, rx, rz, zc = 0, xc = 0, a0 = 0, a1 = a0 + TAU) {
    const open = a1 - a0 < TAU - 1e-6, pts = [];
    for (let i = 0; i < n + (open ? 1 : 0); i++) { const a = a0 + (a1 - a0) * i / n; pts.push([xc + Math.sin(a) * rx, y, zc + Math.cos(a) * rz]); }
    pts.open = open; return pts;
  }
  // ring across Z (for shoes, along the foot): angle 0 = +Y, increasing toward -X
  function ringZ(n, z, rx, ry, yc = 0) {
    const pts = []; for (let i = 0; i < n; i++) { const a = TAU * i / n + Math.PI / n; pts.push([-Math.sin(a) * rx, yc + Math.cos(a) * ry, z]); } return pts;
  }
  // loft rings (listed bottom->top, or top->bottom with o.down). color: value or (segment, side) => value.
  // A colour function may return [colour, atlasTile]: that face then maps the tile (u across the ring, v bottom -> top).
  function loft(b, rings, color, o = {}) {
    const n = rings[0].length, open = rings[0].open, cf0 = typeof color === 'function' ? color : () => color;
    const cf = (s, i) => { const v = cf0(s, i); return Array.isArray(v) ? v[0] : v; };
    for (let s = 0; s < rings.length - 1; s++) for (let i = 0; i < (open ? n - 1 : n); i++) {
      const j = (i + 1) % n, a = rings[s][i], bb = rings[s][j], c = rings[s + 1][j], d = rings[s + 1][i], v = cf0(s, i);
      if (Array.isArray(v)) {
        const R = REG[v[1]], v0 = o.down ? R[3] : R[1], v1 = o.down ? R[1] : R[3], ua = [R[0], v0], ub = [R[2], v0], uc = [R[2], v1], ud = [R[0], v1];
        if (o.down) { tri(b, a, d, c, v[0], ua, ud, uc); tri(b, a, c, bb, v[0], ua, uc, ub); } else { tri(b, a, bb, c, v[0], ua, ub, uc); tri(b, a, c, d, v[0], ua, uc, ud); }
      } else if (o.down) quad(b, a, d, c, bb, v); else quad(b, a, bb, c, d, v);
    }
    if (open) return;
    const cap = (r, col, up) => {
      const m = [0, 0, 0]; r.forEach((p) => { m[0] += p[0] / n; m[1] += p[1] / n; m[2] += p[2] / n; });
      for (let i = 0; i < n; i++) { const j = (i + 1) % n; if (up) tri(b, r[i], r[j], m, col); else tri(b, r[j], r[i], m, col); }
    };
    if (o.capB !== false) cap(rings[0], cf(0, -1), !!o.down);
    if (o.capT !== false) cap(rings[rings.length - 1], cf(rings.length - 2, -1), !o.down);
  }
  function box(b, x, y, z, w, h, d, color, rotX = 0) {
    const hw = w / 2, hh = h / 2, hd = d / 2, cx = Math.cos(rotX), sx = Math.sin(rotX);
    const P = [[-hw, -hh, hd], [hw, -hh, hd], [hw, hh, hd], [-hw, hh, hd], [-hw, -hh, -hd], [hw, -hh, -hd], [hw, hh, -hd], [-hw, hh, -hd]]
      .map(([px, py, pz]) => [x + px, y + py * cx - pz * sx, z + py * sx + pz * cx]);
    [[0, 1, 2, 3], [5, 4, 7, 6], [1, 5, 6, 2], [4, 0, 3, 7], [3, 2, 6, 7], [4, 5, 1, 0]].forEach((f) => quad(b, P[f[0]], P[f[1]], P[f[2]], P[f[3]], color));
  }
  // square-section bar from p0 to p1, thickness t
  function bar(b, p0, p1, t, color) {
    const d = new THREE.Vector3(p1[0] - p0[0], p1[1] - p0[1], p1[2] - p0[2]).normalize();
    const u = new THREE.Vector3().crossVectors(d, Math.abs(d.y) < 0.9 ? new THREE.Vector3(0, 1, 0) : new THREE.Vector3(1, 0, 0)).normalize().multiplyScalar(t * 0.7);
    const v = new THREE.Vector3().crossVectors(d, u);
    const rg = (p) => [u, v, u.clone().negate(), v.clone().negate()].map((o) => [p[0] + o.x, p[1] + o.y, p[2] + o.z]);
    loft(b, [rg(p0), rg(p1)], color);
  }
  // thin chain/cord through points: a double-sided ribbon, width 2t across x (reads from the front and back)
  function wire(b, pts, t, color) {
    for (let i = 0; i < pts.length - 1; i++) {
      const p = pts[i], q = pts[i + 1];
      quad(b, [p[0] - t, p[1], p[2]], [q[0] - t, q[1], q[2]], [q[0] + t, q[1], q[2]], [p[0] + t, p[1], p[2]], color);
      quad(b, [p[0] + t, p[1], p[2]], [q[0] + t, q[1], q[2]], [q[0] - t, q[1], q[2]], [p[0] - t, p[1], p[2]], color);
    }
  }
  // a quad lying on loft face (ring s..s+1, side i), bilinear in (u,v), pushed out by `off`
  function onFace(rings, s, i, u0, u1, v0, v1, off = 0.003) {
    const n = rings[s].length, a = rings[s][i], b = rings[s][(i + 1) % n], c = rings[s + 1][(i + 1) % n], d = rings[s + 1][i];
    const nx = new THREE.Vector3().subVectors(new THREE.Vector3(...b), new THREE.Vector3(...a))
      .cross(new THREE.Vector3().subVectors(new THREE.Vector3(...d), new THREE.Vector3(...a))).normalize().multiplyScalar(off);
    const at = (u, v) => [0, 1, 2].map((k) => (a[k] * (1 - u) + b[k] * u) * (1 - v) + (d[k] * (1 - u) + c[k] * u) * v + nx.getComponent(k));
    return [at(u0, v0), at(u1, v0), at(u1, v1), at(u0, v1)];
  }
  function geoOf(fn, mats) {
    const prev = G; G = { P: [], C: [], U: [], S: [], B: [], m: mats || [] }; fn();
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(G.P, 3));
    g.setAttribute('color', new THREE.Float32BufferAttribute(G.C, 3));
    g.setAttribute('uv', new THREE.Float32BufferAttribute(G.U, 2));
    if (mats) {
      const n = G.S.length, si = new Uint16Array(n * 4), sw = new Float32Array(n * 4);
      for (let i = 0; i < n; i++) { si[i * 4] = G.S[i]; si[i * 4 + 1] = G.B[i * 2]; sw[i * 4] = 1 - G.B[i * 2 + 1]; sw[i * 4 + 1] = G.B[i * 2 + 1]; }
      g.setAttribute('skinIndex', new THREE.BufferAttribute(si, 4));
      g.setAttribute('skinWeight', new THREE.BufferAttribute(sw, 4));
    }
    g.computeVertexNormals();
    G = prev; return g;
  }

  // ---- head + painted face. Canvas is 128 "units" square (drawn at 256 px, 128 for extras), projected
  // front-on over the head: x -HX..HX -> 0..128, y crown -> row 0, chin -> row 128.
  const EXPR = {
    neutral: ['open', 'neutral', 'closed'], talk: ['open', 'raised', 'closed'], worried: ['open', 'worried', 'frown'],
    stunned: ['wide', 'raised', 'O'], laugh: ['happy', 'raised', 'smile'], sad: ['half', 'worried', 'frown'],
    crying: ['closed', 'worried', 'grimace', 1], determined: ['open', 'angry', 'closed'], smug: ['half', 'smug', 'smirk'],
    sleep: ['closed', 'neutral', 'closed'],
    // TWO
    happy: ['open', 'raised', 'grin'], hurt: ['half', 'worried', 'grimace'], suspicious: ['half', 'angry', 'closed'],
    tired: ['half', 'neutral', 'closed'], sheepish: ['open', 'worried', 'smirk'], scared: ['wide', 'worried', 'frown'],
    tearful: ['half', 'worried', 'frown', 1], fond: ['happy', 'neutral', 'grin'], still: ['half', 'neutral', 'closed'],
    hum: ['half', 'raised', 'closed'], wince: ['closed', 'angry', 'grimace'],
  };
  const EX = 21, EY = 55, BY = 44, MY = 98, hwOf = (L) => (L.headW ?? 1) * 1.08;
  function headGeo(L, hs) {
    const j = L.jaw ?? 1, hw = hwOf(L), HX = 0.095 * hs * hw, Y0 = -0.02 * hs, Y1 = 0.25 * hs;
    const rings = [[-0.004, 0.036 * j, 0.03, 0.058], [0.028, 0.064 * j, 0.062, 0.04], [0.068, 0.083 * (1 + (j - 1) * 0.7), 0.09, 0.017],
      [0.114, 0.091, 0.101, 0.006], [0.16, 0.092, 0.104, 0], [0.205, 0.084, 0.099, -0.006], [0.238, 0.058, 0.074, -0.012], [0.254, 0.022, 0.03, -0.012]]
      .map(([y, rx, rz, zc]) => ring(10, y * hs, rx * hs * hw, rz * hs, zc * hs));
    let earAt = 0;
    const g = geoOf(() => {
      loft(0, rings, L.skin, { capB: false });
      const h = hs, z = 0.104 * hs, nw = L.nose ?? 1;
      const top = [0, 0.142 * h, z], tip = [0, 0.078 * h, (0.104 + 0.022 * nw) * h], bl = [-0.017 * h * nw, 0.068 * h, z], br = [0.017 * h * nw, 0.068 * h, z];
      tri(0, top, bl, tip, L.skin); tri(0, top, tip, br, L.skin); tri(0, bl, br, tip, L.skin);
      // ears: a short wedge on the flat side of the skull, flaring out toward the back edge
      earAt = G.P.length / 3;
      const X = 0.0865 * hs * hw - 0.002, E = [[0.148, 0.004], [0.086, 0.002], [0.098, -0.024], [0.156, -0.03]];
      for (const sx of [-1, 1]) {
        const mk = (dx, db, dz) => { const r = E.map(([y, zz], i) => [sx * (X + dx + (i > 1 ? db : 0)), y * hs, zz * hs + (i > 1 ? dz : 0)]); return sx > 0 ? r : r.reverse(); };
        loft(0, [mk(-0.006, 0, 0), mk(0.006, 0.01, -0.004)], L.skin, { capB: false });
      }
    });
    // planar UVs from the front; faces turned away sample a skin patch (bottom-left corner)
    const p = g.attributes.position, uv = g.attributes.uv, a = new THREE.Vector3(), b = new THREE.Vector3(), c = new THREE.Vector3();
    for (let i = 0; i < p.count; i += 3) {
      a.fromBufferAttribute(p, i); b.fromBufferAttribute(p, i + 1); c.fromBufferAttribute(p, i + 2);
      const nz = b.clone().sub(a).cross(c.clone().sub(a)).normalize().z;
      for (let k = 0; k < 3; k++) {
        if (i >= earAt) uv.setXY(i + k, 0.914 + 0.07 * Math.min(1, Math.max(0, (0.004 * hs - p.getZ(i + k)) / (0.036 * hs))), 0.014 + 0.07 * Math.min(1, Math.max(0, (p.getY(i + k) - 0.086 * hs) / (0.07 * hs))));   // ear tile
        else if (nz < -0.35) uv.setXY(i + k, 0.03, 0.03);
        else uv.setXY(i + k, (p.getX(i + k) / HX + 1) / 2, (p.getY(i + k) - Y0) / (Y1 - Y0));
      }
    }
    g.deleteAttribute('color');
    return { g, rings };
  }

  function faceKit(L, S) {
    const k = S / 128, skin = L.skin, hair = L.hair || '#3a2a1e', line = L.lineCol || '#2a1b15';
    const browC = L.brow || shade(hair, 0.8), lid = shade(skin, 0.86), lip = L.lips || mix(skin, '#a4524c', 0.4);
    const base = document.createElement('canvas'); base.width = base.height = S;
    const c = base.getContext('2d'); c.scale(k, k); c.lineCap = c.lineJoin = 'round';
    const path = (pts, close = true) => { c.beginPath(); c.moveTo(pts[0], pts[1]); for (let i = 2; i < pts.length; i += 2) c.lineTo(pts[i], pts[i + 1]); if (close) c.closePath(); };
    seed = 7 + (L.h || 1) * 1000 | 0;
    c.fillStyle = skin; c.fillRect(0, 0, 128, 128);
    // cheeks, nose, age
    if (L.blush) for (const x of [40, 88]) { const g = c.createRadialGradient(x, 76, 0, x, 76, 12); g.addColorStop(0, `rgba(215,90,90,${L.blush})`); g.addColorStop(1, 'rgba(215,90,90,0)'); c.fillStyle = g; c.fillRect(x - 14, 60, 28, 32); }
    c.strokeStyle = shade(skin, 0.8); c.lineWidth = 1.6;
    c.beginPath(); c.moveTo(68, 62); c.quadraticCurveTo(71, 74, 70, 84); c.stroke();
    c.fillStyle = shade(skin, 0.62);
    c.beginPath(); c.ellipse(60.5, 88, 1.6, 0.9, 0.3, 0, TAU); c.ellipse(67.5, 88, 1.6, 0.9, -0.3, 0, TAU); c.fill();
    if (L.freckles) { c.fillStyle = shade(skin, 0.72); for (let i = 0; i < 26; i++) { c.beginPath(); c.arc(40 + rnd() * 48 + (i % 2 ? 0 : 0), 68 + rnd() * 14, 0.7, 0, TAU); c.fill(); } }
    if (L.age) {
      c.strokeStyle = `rgba(90,50,40,${0.25 + L.age * 0.3})`; c.lineWidth = 1.1;
      for (const s of [-1, 1]) {
        c.beginPath(); c.moveTo(64 + s * 12, 89); c.quadraticCurveTo(64 + s * 15, 96, 64 + s * 13, 104); c.stroke();
        c.beginPath(); c.moveTo(64 + s * (EX - 6), EY + 9.5); c.quadraticCurveTo(64 + s * EX, EY + 12.5, 64 + s * (EX + 7), EY + 8); c.stroke();
        c.beginPath(); c.moveTo(64 + s * (EX + 13), EY + 0.5); c.lineTo(64 + s * (EX + 16), EY - 1); c.moveTo(64 + s * (EX + 13), EY + 3); c.lineTo(64 + s * (EX + 16), EY + 4); c.stroke();
      }
      for (const y of [30, 35]) { c.beginPath(); c.moveTo(46, y); c.quadraticCurveTo(64, y - 2, 82, y); c.stroke(); }
    }
    if (L.tired) { c.strokeStyle = 'rgba(110,70,90,0.45)'; c.lineWidth = 2.2; for (const s of [-1, 1]) { c.beginPath(); c.moveTo(64 + s * (EX - 7), EY + 7.5); c.quadraticCurveTo(64 + s * EX, EY + 11.5, 64 + s * (EX + 7), EY + 6.5); c.stroke(); } }
    // beard / stubble / moustache (the beard reaches the canvas edges = the sides of the head, as sideburns)
    const beardPath = () => path([0, 46, 0, 80, 6, 98, 18, 112, 34, 122, 50, 127, 64, 128, 78, 127, 94, 122, 110, 112, 122, 98, 128, 80, 128, 46,
      117, 46, 116, 62, 110, 76, 100, 85, 86, 89, 76, 91, 64, 90, 52, 91, 42, 89, 28, 85, 18, 76, 12, 62, 11, 46]);
    const bc = L.beardCol || hair, lipPatch = shade(mix(skin, lip, 0.4), 0.72);
    if (L.beard === 'full') {
      c.fillStyle = bc; beardPath(); c.fill();
      c.strokeStyle = shade(bc, 0.68); c.lineWidth = 0.9;
      for (let i = 0; i < 120; i++) { const x = 4 + rnd() * 120, y = 88 + rnd() * 36; if (Math.abs(x - 64) < 62 - (y - 92) * 1.2) { c.beginPath(); c.moveTo(x, y); c.lineTo(x + (rnd() - 0.5) * 2, y + 3.5); c.stroke(); } }
      c.strokeStyle = shade(bc, 1.35); c.lineWidth = 0.7;
      for (let i = 0; i < 40; i++) { const x = 8 + rnd() * 112, y = 92 + rnd() * 26; if (Math.abs(x - 64) < 56 - (y - 92) * 1.2) { c.beginPath(); c.moveTo(x, y); c.lineTo(x + (rnd() - 0.5) * 2, y + 3); c.stroke(); } }
      c.fillStyle = lipPatch; c.beginPath(); c.ellipse(64, MY + 2.6, 6.5, 2.2, 0, 0, TAU); c.fill();          // lower lip showing through
      c.fillStyle = bc; path([46, 99, 50, 93, 57, 90.5, 64, 91.5, 71, 90.5, 78, 93, 82, 99, 76, 96.5, 64, 96, 52, 96.5]); c.fill();   // moustache
    } else if (L.beard === 'short') {         // TWO: a beard cut close (luka40): the full shape, thinner, the skin reading through
      c.save(); beardPath(); c.clip(); c.fillStyle = bc; c.globalAlpha = 0.62; c.fillRect(0, 44, 128, 84);
      c.globalAlpha = 0.5; for (let i = 0; i < 420; i++) c.fillRect(rnd() * 128, 70 + rnd() * 58, 0.9, 0.9);
      c.restore();
      c.fillStyle = lipPatch; c.beginPath(); c.ellipse(64, MY + 2.6, 6.5, 2.2, 0, 0, TAU); c.fill();
      c.globalAlpha = 0.8; c.fillStyle = bc; path([47, 99, 51, 94, 57, 91.5, 64, 92.5, 71, 91.5, 77, 94, 81, 99, 76, 97, 64, 96.5, 52, 97]); c.fill(); c.globalAlpha = 1;
    } else if (L.beard === 'stubble') {
      c.save(); beardPath(); c.clip(); c.fillStyle = bc; c.globalAlpha = 0.22; c.fillRect(0, 44, 128, 84);
      c.globalAlpha = 0.4; for (let i = 0; i < 320; i++) c.fillRect(rnd() * 128, 80 + rnd() * 48, 0.8, 0.8);
      c.globalAlpha = 0.18; c.fillStyle = skin; c.beginPath(); c.ellipse(64, MY + 1, 10, 4, 0, 0, TAU); c.fill(); c.restore();
    }
    if (L.beard && L.beardGrey) {             // TWO: greying flecks through the beard / stubble
      c.save(); beardPath(); c.clip(); c.fillStyle = '#d8d6d2';
      for (let i = 0; i < 260 * L.beardGrey; i++) { c.globalAlpha = 0.35 + rnd() * 0.5; c.fillRect(rnd() * 128, 74 + rnd() * 54, 1, 1.4); }
      c.restore(); c.globalAlpha = 1;
    }
    if (L.scar === 'jawR') {                  // TWO (luka40): a burn scar from the right jaw down the neck (canvas left = his right)
      c.save(); c.beginPath(); c.moveTo(0, 74); c.quadraticCurveTo(14, 80, 22, 96); c.quadraticCurveTo(30, 112, 40, 128); c.lineTo(0, 128); c.closePath(); c.clip();
      c.fillStyle = mix(skin, '#c8605a', 0.62); c.fillRect(0, 70, 44, 58);
      for (let i = 0; i < 46; i++) { c.fillStyle = rnd() < 0.5 ? mix(skin, '#f6d2c8', 0.75) : mix(skin, '#9a4a44', 0.65); c.globalAlpha = 0.75; c.beginPath(); c.ellipse(rnd() * 34, 78 + rnd() * 50, 1.2 + rnd() * 3.4, 0.7 + rnd() * 1.8, 0.9, 0, TAU); c.fill(); }
      c.globalAlpha = 0.6; c.strokeStyle = '#fff3ee'; c.lineWidth = 1; for (let i = 0; i < 5; i++) { c.beginPath(); c.moveTo(2 + i * 4, 80 + i * 2); c.quadraticCurveTo(12 + i * 4, 102, 22 + i * 3, 127); c.stroke(); }
      c.restore(); c.globalAlpha = 1;
    }
    if (L.rednose) { c.fillStyle = '#d42a2a'; c.beginPath(); c.ellipse(64, 80, 7, 6.5, 0, 0, TAU); c.fill(); c.fillStyle = 'rgba(255,255,255,0.6)'; c.beginPath(); c.arc(62, 77, 1.6, 0, TAU); c.fill(); }
    if (L.moustache) {
      c.fillStyle = L.moustache; path([45, 100, 48, 93, 56, 89.5, 64, 91, 72, 89.5, 80, 93, 83, 100, 77, 97, 64, 96, 51, 97]); c.fill();
      c.strokeStyle = shade(L.moustache, 0.75); c.lineWidth = 0.8;
      for (let i = 0; i < 14; i++) { const x = 50 + i * 2; c.beginPath(); c.moveTo(x, 92); c.lineTo(x + (x < 64 ? -1.5 : 1.5), 96.5); c.stroke(); }
    }
    // hair on the top rows (the hair mesh sits over it; this shows as the hairline and in portraits)
    const st = L.hairStyle || 'short';
    c.fillStyle = hair;
    if (st === 'bald') { c.fillRect(0, 36, 10, 30); c.fillRect(118, 36, 10, 30); c.fillStyle = 'rgba(255,255,255,0.18)'; c.beginPath(); c.ellipse(52, 14, 16, 6, -0.2, 0, TAU); c.fill(); }
    else if (st === 'messy' || st === 'shaggy') { const lo = st === 'shaggy' ? 78 : 60; path([0, 0, 128, 0, 128, lo, 121, 46, 116, 31, 106, 35, 98, 28, 90, 37, 82, 29, 74, 38, 66, 30, 58, 39, 50, 29, 42, 37, 34, 28, 26, 36, 18, 30, 10, 36, 6, lo, 0, lo]); }
    else if (st === 'bob') path([0, 0, 128, 0, 128, 104, 116, 100, 114, 60, 108, 36, 20, 36, 14, 60, 12, 100, 0, 104]);
    else {
      const long = /long|big|set|curly|mullet/.test(st), low = long ? 100 : 62;
      path([0, 0, 128, 0, 128, low, 122, low - 2, 120, 44, 112, 30, 90, 22, 64, st === 'slick' ? 25 : 21, 38, 22, st === 'tidy' ? 20 : 16, 30, 8, 44, 6, low - 2, 0, low]);
    }
    if (st !== 'bald') c.fill();
    if (L.hairGrey && st !== 'bald') {        // TWO: grey streaks combed back through the hairline
      c.save(); c.clip(); c.strokeStyle = '#cfccc6'; c.lineWidth = 1.1;
      for (let i = 0; i < 40 * L.hairGrey; i++) { const x0 = rnd() * 128; c.globalAlpha = 0.4 + rnd() * 0.5; c.beginPath(); c.moveTo(x0, 30); c.quadraticCurveTo(x0 + (rnd() - 0.5) * 8, 14, x0 + (rnd() - 0.5) * 6, 0); c.stroke(); }
      c.restore(); c.globalAlpha = 1;
    }
    c.fillStyle = skin; c.fillRect(0, 118, 10, 10);   // back-of-head patch
    c.fillRect(116, 116, 12, 12); c.fillStyle = shade(skin, 0.9); c.beginPath(); c.ellipse(121, 121.5, 1.6, 2.4, 0, 0, TAU); c.fill();   // ear tile (plain skin, faint concha)

    const canvas = document.createElement('canvas'); canvas.width = canvas.height = S;
    const x = canvas.getContext('2d'); x.lineCap = x.lineJoin = 'round';
    const tex = new THREE.CanvasTexture(canvas); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 4; tex.magFilter = THREE.NearestFilter;
    const lids = L.lids || 0, iris = L.eyes || '#5a3b28', irisD = shade(iris, 0.6), lidLine = shade(skin, 0.72);
    const ink = L.mouthInk || shade(lip, 0.45), inside = '#4a1818', teeth = '#f2eee4', tongue = '#b8565a', lipHi = mix(lip, skin, 0.35);
    const scl = L.eyeScale ?? 1;
    // eyes: almond with a heavier upper lid line; s = -1 for the canvas-left eye, +1 canvas-right (peak leans inward)
    function eye(cx, e, s) {
      x.strokeStyle = line; x.lineCap = 'round';
      if (e === 'closed' || e === 'happy') {
        x.lineWidth = 2.3; x.beginPath(); x.moveTo(cx - 9, EY + 0.5);
        x.quadraticCurveTo(cx, EY + (e === 'happy' ? -6.5 : 3.8), cx + 9, EY + 0.5); x.stroke();
        if (e === 'closed') { x.lineWidth = 1; x.strokeStyle = lidLine; x.beginPath(); x.moveTo(cx - 6, EY - 3.5); x.quadraticCurveTo(cx, EY - 5.5, cx + 6, EY - 3.5); x.stroke(); }
        return;
      }
      const wide = e === 'wide', h = (wide ? 8.2 : 6.4) * scl, w = (wide ? 10.4 : 9.8) * scl;
      const lidPath = () => { x.moveTo(cx - w, EY + 0.8); x.quadraticCurveTo(cx - s * 1.8, EY - h * 1.4, cx + w, EY - 0.3 * s); };
      x.beginPath(); lidPath(); x.quadraticCurveTo(cx + s * 1.2, EY + h * 1.1, cx - w, EY + 0.8); x.closePath();
      x.fillStyle = '#f7f3ec'; x.fill(); x.save(); x.clip();
      const ir = (wide ? 4.3 : 5.1) * scl, iy = EY + 0.3;
      x.fillStyle = irisD; x.beginPath(); x.arc(cx, iy, ir, 0, TAU); x.fill();
      x.fillStyle = iris; x.beginPath(); x.arc(cx, iy + 0.4, ir * 0.78, 0, TAU); x.fill();
      x.fillStyle = '#120c0a'; x.beginPath(); x.arc(cx, iy, ir * (wide ? 0.38 : 0.46), 0, TAU); x.fill();
      x.fillStyle = '#fff'; x.beginPath(); x.arc(cx - 1.6, iy - 1.8, 1.35, 0, TAU); x.fill();
      x.fillStyle = 'rgba(40,20,10,0.18)'; x.fillRect(cx - 11, EY - 10, 22, 3.4 + (wide ? 0 : 1.5));   // lid shadow on the white
      const cover = e === 'half' ? 0.55 : wide ? 0 : lids, cy = EY - 10 + 10 * cover * 1.2 + (e === 'half' ? 1.5 : 0);
      if (cover) { x.fillStyle = lid; x.fillRect(cx - 11, EY - 11, 22, cy - EY + 11); }
      x.restore();
      x.beginPath();
      if (cover) { x.moveTo(cx - w, EY + 0.8); x.quadraticCurveTo(cx, cy - 1.2, cx + w, EY - 0.3 * s); } else lidPath();
      x.lineWidth = L.lash ? 2.8 : 2.3; x.stroke();
      x.lineWidth = 0.9; x.strokeStyle = lidLine; x.beginPath(); x.moveTo(cx - w * 0.8, EY + 3 + (wide ? 2 : 0)); x.quadraticCurveTo(cx + s, EY + h * 1.05 + 0.4, cx + w * 0.85, EY + 1.5); x.stroke();
      if (!cover && !wide) { x.beginPath(); x.moveTo(cx - w * 0.7, EY - h - 0.6); x.quadraticCurveTo(cx - s * 1.5, EY - h * 1.62, cx + w * 0.75, EY - h * 0.7); x.stroke(); }   // lid crease
      if (L.lash) { x.strokeStyle = line; x.lineWidth = 1.5; x.beginPath(); x.moveTo(cx + s * (w - 0.5), EY - 0.6); x.quadraticCurveTo(cx + s * (w + 1.8), EY - 1.2, cx + s * (w + 2.6), EY - 3.2); x.stroke(); }
    }
    // brows: tapered filled strokes, thick at the inner end
    function brow(cx, s, b, lift = 0) {    // s = +1 for the brow on the canvas right (character's left); lift 0..1 raises it (Luke's suspicion)
      let yi = BY + 0.5, yo = BY + 1, arch = -2.6;
      if (b === 'worried' || (b === 'smug' && s < 0)) { yi = BY - 4.5; yo = BY + 2.2; arch = -0.8; }
      if (b === 'raised' || (b === 'smug' && s > 0)) { yi = BY - 3.5; yo = BY - 3; arch = -4; }
      if (b === 'angry') { yi = BY + 4; yo = BY - 1.8; arch = 0.6; }
      if (b === 'smug' && s < 0) { yi = BY + 1.5; yo = BY + 2; arch = -1; }
      if (lift) { yi -= 7 * lift; yo -= 9 * lift; arch -= 2.5 * lift; }
      const t = (L.browW || 3.3) * 1.05, xi = cx - s * 7, xo = cx + s * 10, xm = cx + s * 1.5, ym = Math.min(yi, yo) + arch;
      x.fillStyle = browC; x.beginPath();
      x.moveTo(xi, yi - t * 0.55); x.quadraticCurveTo(xm, ym - t * 0.5, xo, yo - t * 0.12);
      x.quadraticCurveTo(xo + s * 0.8, yo + t * 0.2, xo - s * 0.6, yo + t * 0.22);
      x.quadraticCurveTo(xm, ym + t * 0.55, xi, yi + t * 0.55); x.closePath(); x.fill();
    }
    function mouth(m) {
      x.lineCap = 'round'; x.lineWidth = 2.1; x.strokeStyle = ink;
      if (m === 'closed') {
        x.beginPath(); x.moveTo(54, MY - 0.3); x.quadraticCurveTo(64, MY + 1.8, 74, MY - 0.3); x.stroke();
        x.strokeStyle = lipHi; x.lineWidth = 1.7; x.beginPath(); x.moveTo(58.5, MY + 3.4); x.quadraticCurveTo(64, MY + 4.9, 69.5, MY + 3.4); x.stroke();
      } else if (m === 'grin') {                 // TWO: a closed smile
        x.beginPath(); x.moveTo(52, MY - 2.6); x.quadraticCurveTo(64, MY + 5.2, 76, MY - 2.6); x.stroke();
        x.lineWidth = 1.2; x.beginPath(); x.moveTo(51, MY - 4.2); x.lineTo(52.5, MY - 1.6); x.moveTo(77, MY - 4.2); x.lineTo(75.5, MY - 1.6); x.stroke();
        x.strokeStyle = lipHi; x.lineWidth = 1.6; x.beginPath(); x.moveTo(58.5, MY + 5); x.quadraticCurveTo(64, MY + 6.4, 69.5, MY + 5); x.stroke();
      } else if (m === 'frown') {
        x.beginPath(); x.moveTo(54, MY + 3.2); x.quadraticCurveTo(64, MY - 2.8, 74, MY + 3.2); x.stroke();
        x.strokeStyle = lipHi; x.lineWidth = 1.4; x.beginPath(); x.moveTo(59.5, MY + 3.8); x.quadraticCurveTo(64, MY + 3, 68.5, MY + 3.8); x.stroke();
      } else if (m === 'smirk') {
        x.beginPath(); x.moveTo(55, MY + 0.8); x.quadraticCurveTo(66, MY + 2.2, 75, MY - 3.4); x.stroke();
        x.lineWidth = 1.2; x.beginPath(); x.moveTo(74.5, MY - 5.2); x.quadraticCurveTo(76.5, MY - 3.5, 75.5, MY - 1.5); x.stroke();
      } else if (m === 'O') {
        x.fillStyle = inside; x.beginPath(); x.ellipse(64, MY + 1.6, 4.3, 5.4, 0, 0, TAU); x.fill();
        x.strokeStyle = lip; x.lineWidth = 1.8; x.stroke();
        x.fillStyle = tongue; x.beginPath(); x.ellipse(64, MY + 5, 2.6, 1.5, 0, 0, TAU); x.fill();
      } else if (m === 'grimace') {
        x.fillStyle = teeth; x.beginPath(); x.moveTo(52, MY - 1.5); x.quadraticCurveTo(64, MY - 3, 76, MY - 1.5); x.lineTo(74, MY + 5.5); x.quadraticCurveTo(64, MY + 7, 54, MY + 5.5); x.closePath(); x.fill();
        x.stroke(); x.lineWidth = 0.9; x.beginPath(); x.moveTo(53, MY + 2.2); x.quadraticCurveTo(64, MY + 1.6, 75, MY + 2.2);
        for (const tx of [58, 64, 70]) { x.moveTo(tx, MY - 2); x.lineTo(tx, MY + 6); } x.stroke();
      } else {   // 'A' and 'smile' (open)
        const sm = m === 'smile', shape = () => {
          x.beginPath();
          if (sm) { x.moveTo(52, MY - 2.5); x.quadraticCurveTo(64, MY + 0.5, 76, MY - 2.5); x.quadraticCurveTo(64, MY + 13, 52, MY - 2.5); }
          else { x.moveTo(56, MY); x.quadraticCurveTo(64, MY - 4, 72, MY); x.quadraticCurveTo(64, MY + 10.5, 56, MY); }
        };
        x.fillStyle = inside; shape(); x.fill(); x.save(); x.clip();
        x.fillStyle = teeth; x.fillRect(48, MY - 5, 32, sm ? 5.2 : 3.6);
        x.fillStyle = tongue; x.beginPath(); x.ellipse(64, sm ? MY + 9.5 : MY + 8, sm ? 7 : 4.5, 3, 0, 0, TAU); x.fill();
        x.restore(); x.strokeStyle = ink; x.lineWidth = 1.6; shape(); x.stroke();
      }
    }
    // marks (TWO): a bitmask of overlays painted after the features — 1 blood at the hairline (3.5+), 2 soot,
    // 4 a bruise on the cheekbone, 8 a graze on the chin. Drawn on the live canvas, so they toggle at runtime.
    function marks(mk) {
      if (mk & 2) { x.fillStyle = 'rgba(40,34,30,0.35)'; for (const [cx, cy, rx, ry] of [[36, 70, 9, 4], [92, 60, 6, 3], [70, 30, 10, 3], [24, 94, 5, 6]]) { x.beginPath(); x.ellipse(cx, cy, rx, ry, 0.4, 0, TAU); x.fill(); } }
      if (mk & 4) { const g = x.createRadialGradient(40, 66, 1, 40, 66, 10); g.addColorStop(0, 'rgba(110,60,110,0.55)'); g.addColorStop(1, 'rgba(110,60,110,0)'); x.fillStyle = g; x.fillRect(28, 54, 24, 24); }
      if (mk & 8) { x.strokeStyle = 'rgba(160,40,36,0.7)'; x.lineWidth = 1; for (let i = 0; i < 4; i++) { x.beginPath(); x.moveTo(70 + i * 2, 112); x.lineTo(74 + i * 2, 118); x.stroke(); } }
      if (mk & 1) {   // a cut at his right temple (canvas left), a dried trickle down past the brow
        x.fillStyle = '#8a1c18'; x.beginPath(); x.moveTo(30, 17); x.quadraticCurveTo(38, 14, 44, 19); x.quadraticCurveTo(37, 22, 30, 21); x.closePath(); x.fill();
        x.strokeStyle = 'rgba(150,26,22,0.85)'; x.lineWidth = 2; x.beginPath(); x.moveTo(34, 20); x.quadraticCurveTo(31, 30, 33, 38); x.quadraticCurveTo(34, 43, 30, 48); x.stroke();
        x.lineWidth = 1.2; x.beginPath(); x.moveTo(40, 20); x.quadraticCurveTo(41, 26, 39, 31); x.stroke();
      }
    }
    let dE, dB, dM, dT, dK = 0, dL = 0;
    function draw(e, b, m, tears, mk = 0, lift = 0) {
      if (e === dE && b === dB && m === dM && tears === dT && mk === dK && lift === dL) return;
      dE = e; dB = b; dM = m; dT = tears; dK = mk; dL = lift;
      x.setTransform(1, 0, 0, 1, 0, 0); x.drawImage(base, 0, 0); x.setTransform(k, 0, 0, k, 0, 0);
      eye(64 - EX, e, -1); eye(64 + EX, e, 1); brow(64 - EX, -1, b); brow(64 + EX, 1, b, lift); mouth(m);
      if (mk) marks(mk);
      if (tears) {
        x.strokeStyle = 'rgba(160,210,250,0.9)'; x.lineWidth = 2.6;
        x.beginPath(); x.moveTo(64 - EX + 3, EY + 5); x.quadraticCurveTo(64 - EX + 5, EY + 16, 64 - EX + 3, EY + 26);
        x.moveTo(64 + EX - 3, EY + 5); x.quadraticCurveTo(64 + EX - 5, EY + 16, 64 + EX - 3, EY + 26); x.stroke();
        x.fillStyle = '#fff'; x.beginPath(); x.arc(64 - EX + 4, EY + 14, 1, 0, TAU); x.arc(64 + EX - 4, EY + 18, 1, 0, TAU); x.fill();
      }
      tex.needsUpdate = true;
    }
    return { canvas, tex, draw };
  }

  // ---- hair (skinned to the head bone)
  function hair(L, hs) {
    const st = L.hairStyle || 'short', col = L.hair || '#3a2a1e', hw = hwOf(L);
    if (st === 'none') return;
    const f = { crop: 1.03, cap: 1.04, ponytail: 1.06, slick: 1.055, messy: 1.09, shaggy: 1.1, set: 1.16, big: 1.28, long: 1.09, bob: 1.12, curly: 1.17, bald: 1.04 }[st] || 1.065;
    const ragged = st === 'messy' || st === 'shaggy';   // shaggy (chase40): messy, grown out over the ears and the collar
    const band = st === 'bald', A0 = band ? 1.15 : 0, A1 = band ? TAU - 1.15 : TAU;
    const mk = (y, rx, rz, zc) => ring(10, y * hs, rx * hs * hw * f, rz * hs * f, zc * hs, 0, A0, A1);
    const rings = band ? [mk(0.1, 0.092, 0.104, 0), mk(0.19, 0.09, 0.103, -0.004)]
      : [mk(0.15, 0.092, 0.104, 0), mk(0.205, 0.086, 0.1, -0.006), mk(0.24, 0.06, 0.075, -0.012), mk(0.257, 0.02, 0.03, -0.012)];
    rings[0].forEach((p, i) => {   // rim: front up to the hairline, back down to the nape
      if (!band) p[1] += p[2] > 0 ? p[2] * 0.52 : p[2] * 0.78;
      if (p[2] < 0) p[2] *= 0.93;
      if (ragged && p[2] > 0.03) p[1] -= (i % 2 ? 0.022 : 0.006) * hs;
      if ((st === 'set' || st === 'big' || st === 'curly') && Math.abs(p[0]) > 0.05 * hs) p[1] -= 0.04 * hs;
    });
    if (!band) rings[1].forEach((p) => { p[1] += p[2] * 0.22; });
    if (st === 'slick') rings[1].concat(rings[2]).forEach((p) => { if (p[2] > 0) { p[1] += 0.016 * hs; p[2] += 0.006 * hs; } });
    if (ragged || st === 'curly' || st === 'set') rings.slice(1).forEach((r) => r.forEach((p, i) => { p[1] += (rnd() * 0.012 + (i % 2) * 0.006 + (ragged ? 0.01 : 0)) * hs; }));
    const grey = L.hairGrey ? mix(col, '#c9c6c0', 0.6) : col;
    const strands = L.hairGrey ? (s, i) => [rnd() < 0.2 * L.hairGrey + 0.04 ? grey : col, 'hair'] : [col, 'hair'], under = shade(col, 0.72);
    loft(HEAD, rings, strands, { capB: false });
    if (ragged) {        // fringe: a band tucked under the front of the cap, ragged tips hanging over the forehead, swept to one side
      const n = 8, bot = [], topR = [];
      for (let i = 0; i <= n; i++) {
        const u = i / n, a = -1.3 + 2.6 * u, a2 = a - 0.1, drop = (i % 2 ? 0.02 : 0.004) + (1 - u) * 0.014 + (i === 4 ? 0.006 : 0);
        topR.push([Math.sin(a) * 0.09 * hs * hw, 0.218 * hs, Math.cos(a) * 0.1 * hs]);
        bot.push([Math.sin(a2) * 0.098 * hs * hw * 1.02, (0.19 - drop) * hs, Math.cos(a2) * 0.113 * hs]);
      }
      bot.open = topR.open = true;
      loft(HEAD, [bot, topR], strands);
      loft(HEAD, [bot.map((p) => [p[0] * 0.97, p[1] + 0.002, p[2] * 0.96]), topR], under, { down: true });
    }
    const cur = (a0, a1, yTop, yBot, grow = 1) => {     // hanging hair: outer shell + a slightly smaller reversed one (so it reads from inside too)
      for (const [g, dn] of [[1, false], [0.94, true]]) loft(HEAD, [ring(10, yBot * hs, 0.1 * hs * hw * f * grow * g, 0.108 * hs * f * grow * g, -0.012 * hs, 0, a0, a1),
        ring(10, yTop * hs, 0.093 * hs * hw * f * g, 0.104 * hs * f * g, -0.004 * hs, 0, a0, a1)], dn ? under : strands, { down: dn });
    };
    if (st === 'long' || st === 'big') cur(1.05, TAU - 1.05, 0.17, st === 'big' ? -0.02 : -0.12, st === 'big' ? 1.45 : 1.2);
    if (st === 'bob') cur(0.95, TAU - 0.95, 0.16, 0.02, 1.12);
    if (st === 'mullet') cur(2.1, TAU - 2.1, 0.12, -0.06);
    if (st === 'shaggy') cur(1.62, TAU - 1.62, 0.15, 0.03, 1.12);
    if (st === 'set' || st === 'curly') cur(1.15, TAU - 1.15, 0.16, 0.06, 1.12);
    if (st === 'ponytail' && !L.tailSep) ponytail(L, hs);   // tailSep (luka40): built as its own skinned mesh so a hood can hide it
    if (st === 'bun') loft(HEAD, [[-0.045, 0.02], [-0.025, 0.042], [0, 0.05], [0.025, 0.042], [0.045, 0.018]]
      .map(([y, r]) => ring(8, (0.2 + y) * hs, r * hs, r * hs, -0.118 * hs)), col);
  }
  // gathered at the back of the crown with a dark tie, thick through the middle, tapering down past the collar
  function ponytail(L, hs) {
    const col = L.hair || '#3a2a1e', under = shade(col, 0.72), grey = L.hairGrey ? mix(col, '#c9c6c0', 0.6) : col;
    const tail = [[0.2, 0.022, -0.095], [0.178, 0.03, -0.118], [0.158, 0.03, -0.126], [0.12, 0.046, -0.146], [0.03, 0.05, -0.162], [-0.06, 0.04, -0.17], [-0.13, 0.024, -0.172], [-0.18, 0.006, -0.168]]
      .map(([y, r, z]) => ring(6, y * hs, r * hs, r * hs * 0.8, z * hs));
    G.blend = (p) => { const u = (0.1 * hs - p[1]) / (0.28 * hs); return u > 0 ? [TORSO, Math.min(0.7, u)] : null; };   // the hanging end settles on the back
    loft(HEAD, tail, (s, i) => (s === 1 ? '#18181a' : s === 0 ? under : [L.hairGrey && (s + i) % 3 === 0 ? grey : col, 'hair']), { down: true });
    G.blend = null;
  }

  // ---- attachments (small meshes on bones; origin = grip point or bone)
  const HELD = {
    phone: () => { box(0, 0, -0.05, 0, 0.011, 0.15, 0.072, '#1b1d22'); box(0, -0.0055, -0.05, 0, 0.002, 0.135, 0.062, '#2d4f86'); },
    brick: () => { box(0, 0, -0.06, 0, 0.05, 0.22, 0.062, '#8b8f94'); box(0, -0.026, -0.08, 0, 0.004, 0.12, 0.046, '#b9bdc1');
      box(0, -0.027, -0.02, 0, 0.004, 0.035, 0.04, '#5d7f63'); loft(0, [ring(4, 0.04, 0.006, 0.006, 0.02), ring(4, 0.17, 0.004, 0.004, 0.02)], '#2a2b2e'); },
    mug: (L) => { loft(0, [ring(8, -0.05, 0.042, 0.042), ring(8, 0.05, 0.044, 0.044)], L.mugCol || '#e9e3d6'); box(0, 0.052, 0, 0, 0.014, 0.06, 0.03, L.mugCol || '#e9e3d6'); },
    cup: () => { loft(0, [ring(8, -0.06, 0.036, 0.036), ring(8, -0.02, 0.04, 0.04), ring(8, 0.02, 0.043, 0.043), ring(8, 0.065, 0.046, 0.046), ring(8, 0.078, 0.042, 0.042)],
      (s) => (s === 1 ? '#8a5a35' : s === 3 ? '#2a2a2a' : '#f2efe8')); },
    textbook: (L) => { box(0, 0, 0, 0, 0.034, 0.24, 0.18, L.bookCol || '#7a2f2a'); box(0, 0, 0.001, 0.004, 0.03, 0.232, 0.176, '#efe8d6'); },
    newspaper: () => { box(0, 0, 0, 0, 0.012, 0.3, 0.22, '#dcd8cc'); box(0, -0.007, 0.08, 0, 0.002, 0.05, 0.18, '#3b3b3b'); },
    umbrella: (L) => { const c = L.umbrellaCol || '#1d1f24';
      loft(0, [ring(4, -0.1, 0.009, 0.009), ring(4, 0.72, 0.006, 0.006)], '#2a2622');
      loft(0, [ring(8, 0.6, 0.52, 0.52), ring(8, 0.78, 0.03, 0.03)], c, { capB: false });
      loft(0, [ring(8, 0.598, 0.52, 0.52), ring(8, 0.776, 0.03, 0.03)], shade(c, 0.7), { capB: false, down: true }); },
    stick: () => { loft(0, [ring(4, -0.84, 0.011, 0.011), ring(4, 0.03, 0.011, 0.011)], '#5a3a22'); box(0, 0, 0.04, 0.035, 0.022, 0.022, 0.09, '#5a3a22'); },
    handbag: (L) => { box(0, 0, -0.14, 0, 0.09, 0.15, 0.22, L.bagCol || '#5b3b58'); box(0, 0, -0.04, 0.07, 0.012, 0.09, 0.012, '#3a2436'); box(0, 0, -0.04, -0.07, 0.012, 0.09, 0.012, '#3a2436'); },
    whistle: () => { loft(0, [ring(6, -0.2, 0.008, 0.008), ring(6, 0.06, 0.007, 0.007)], (s) => '#b9bec4'); box(0, 0, 0.055, 0.008, 0.012, 0.012, 0.012, '#2a2a2a'); },
    recorder: () => { box(0, 0, -0.05, 0, 0.045, 0.1, 0.15, '#27292d'); box(0, -0.024, -0.03, 0, 0.004, 0.05, 0.1, '#7b8086'); box(0, -0.024, -0.075, 0.03, 0.004, 0.03, 0.03, '#b44'); },
  };
  // glasses: rectangular frames (front face + outer rim), ribbon temples; 'sun' = dark lenses
  function glasses(L, hs, kind, narrow = 1) {
    const hw = hwOf(L) * narrow, ex = (EX / 64) * 0.095 * hs * hw, y = 0.134 * hs, z = 0.118 * hs, th = kind === 'thick' ? 0.007 : 0.004;
    const rw = kind === 'thick' ? 0.042 : 0.036, rh = kind === 'thick' ? 0.033 : kind === 'reading' ? 0.021 : 0.026, col = L.frameCol || (kind === 'thick' ? '#1d1b1a' : '#3a3530');
    const sun = kind === 'sun', d = kind === 'thick' ? 0.008 : 0.005;
    const ribbon = (p, q) => { quad(0, [p[0], p[1] - th * 0.6, p[2]], [q[0], q[1] - th * 0.6, q[2]], [q[0], q[1] + th * 0.6, q[2]], [p[0], p[1] + th * 0.6, p[2]], col);
      quad(0, [p[0], p[1] + th * 0.6, p[2]], [q[0], q[1] + th * 0.6, q[2]], [q[0], q[1] - th * 0.6, q[2]], [p[0], p[1] - th * 0.6, p[2]], col); };
    for (const sx of [-1, 1]) {
      const cx = sx * ex, C = [[-1, 1], [1, 1], [1, -1], [-1, -1]];     // corners, clockwise from top-left
      const O = (i, zz) => [cx + C[i][0] * rw / 2, y + C[i][1] * rh / 2, zz], I = (i) => [cx + C[i][0] * (rw / 2 - th), y + C[i][1] * (rh / 2 - th), z + d / 2];
      if (sun) quad(0, O(3, z + d / 2), O(2, z + d / 2), O(1, z + d / 2), O(0, z + d / 2), '#141518');
      for (let i = 0; i < 4; i++) {
        const j = (i + 1) % 4;
        if (!sun) quad(0, O(i, z + d / 2), I(i), I(j), O(j, z + d / 2), col);
        quad(0, O(i, z + d / 2), O(j, z + d / 2), O(j, z - d / 2), O(i, z - d / 2), sun ? '#141518' : col);
      }
      const tx = sx * (ex + rw / 2), bx = sx * 0.094 * hs * hw, ty = y + rh * 0.3;
      ribbon([tx, ty, z], [sx * 0.085 * hs * hw, ty, 0.07 * hs]);
      ribbon([sx * 0.085 * hs * hw, ty, 0.07 * hs], [bx, ty - 0.004, -0.02 * hs]);
    }
    box(0, 0, y + rh * 0.25, z, ex * 2 - rw, th, th, sun ? '#141518' : col);
  }

  // ---- badge cards (TWO): each badge paints its own 128 x 176 texture, keyed by content: front (rows 0-78), back
  // (80-158), white strip (160-176) for the clip and edges. B = { name, sub, style: 'yes'|'hq', band, fade 0..1, scorch,
  // back: '1158' (biro), flip }. Nearest-filtered so close-ups stay crisp.
  const BUV = { front: [0, 1 - 78 / 176, 1, 1], back: [0, 1 - 158 / 176, 1, 1 - 80 / 176], white: 1 - 168 / 176 };
  const DIG = { 0: [[5, 0], [1, 3], [0, 8], [1, 13], [5, 16], [9, 13], [10, 8], [9, 3], [5, 0]], 1: [[2, 3], [6, 0], [6, 16]], 2: [[0, 4], [3, 0], [7, 0], [10, 3], [9, 7], [0, 16], [10, 16]],
    3: [[0, 2], [4, 0], [9, 2], [9, 6], [4, 8], [9, 10], [10, 14], [5, 16], [0, 14]], 4: [[7, 16], [7, 0], [0, 11], [10, 11]], 5: [[9, 0], [1, 0], [0, 7], [5, 6], [9, 8], [10, 12], [7, 16], [1, 15]],
    6: [[8, 0], [3, 3], [0, 9], [1, 14], [5, 16], [9, 13], [9, 10], [5, 8], [1, 10]], 7: [[0, 0], [10, 0], [4, 16]], 8: [[5, 8], [1, 5], [2, 1], [5, 0], [8, 1], [9, 5], [5, 8], [1, 11], [2, 15], [5, 16], [8, 15], [9, 11], [5, 8]],
    9: [[9, 6], [5, 8], [1, 6], [1, 2], [5, 0], [9, 2], [9, 8], [7, 16]] };
  function biro(c, text, cx, cy, h, col) {   // handwritten digits in ballpoint: a slightly wobbly stroke font
    const s = h / 16, w = 12 * s, x0 = cx - (text.length * w) / 2;
    let q = 991; const r = () => ((q = (q * 16807) % 2147483647) / 2147483647 - 0.5) * 1.2;
    c.strokeStyle = col; c.lineWidth = Math.max(1.6, h / 11); c.lineCap = c.lineJoin = 'round';
    [...text].forEach((ch, i) => {
      const P = DIG[ch]; if (!P) return;
      const ox = x0 + i * w + r(), oy = cy - h / 2 + r(), sl = 0.12;
      c.beginPath(); P.forEach(([x, y], j) => { const X = ox + (x + (16 - y) * sl) * s + r() * 0.5, Y = oy + y * s + r() * 0.5; if (j) c.lineTo(X, Y); else c.moveTo(X, Y); }); c.stroke();
    });
  }
  function paintBadge(c, B) {
    const W = 128, H = 78, st = B.style || 'yes', card = B.card || '#f6f5f1', ink = '#1b1c20';
    c.fillStyle = '#ffffff'; c.fillRect(0, 0, 128, 176);
    const face = (y0, fn) => { c.save(); c.translate(0, y0); c.beginPath(); c.rect(0, 0, W, H); c.clip(); fn();
      if (B.fade) { c.fillStyle = `rgba(232,226,206,${0.5 * B.fade})`; c.fillRect(0, 0, W, H); }
      if (B.scorch) { const g = c.createRadialGradient(W, y0 ? H : 0, 2, W, y0 ? H : 0, 46); g.addColorStop(0, 'rgba(30,18,10,0.95)'); g.addColorStop(0.45, 'rgba(70,40,20,0.6)'); g.addColorStop(1, 'rgba(120,80,40,0)'); c.fillStyle = g; c.fillRect(0, 0, W, H); }
      c.restore(); };
    face(0, () => {
      c.fillStyle = card; c.fillRect(0, 0, W, H);
      if (st === 'hq') {                      // Optus HQ corporate: navy band, photo, name, department
        c.fillStyle = B.band || CONFIG.colors.navy; c.fillRect(0, 0, W, 20);
        c.fillStyle = '#ffffff'; c.font = 'bold 12px Arial, sans-serif'; c.textAlign = 'left'; c.fillText('OPTUS', 6, 14); drawYes(c, 96, 2, 15, CONFIG.colors.yes);
        c.fillStyle = '#c9ced8'; c.fillRect(6, 26, 30, 44); c.fillStyle = '#8a93a6'; c.beginPath(); c.arc(21, 42, 8, 0, TAU); c.fill(); c.fillRect(9, 54, 24, 16);
        c.fillStyle = ink; c.font = 'bold 20px Arial, sans-serif'; c.fillText(B.name, 42, 48, 82);
        c.font = 'bold 10px Arial, sans-serif'; c.fillStyle = '#3a4a6a'; c.fillText(B.sub || '', 42, 64, 82);
      } else {                                // the store badge: black band with the Yes, the name big, an optional title
        c.fillStyle = B.band || CONFIG.colors.polo; c.fillRect(0, 0, W, 20); drawYes(c, 6, 2, 16, CONFIG.colors.yes);
        c.fillStyle = ink; c.textAlign = 'center';
        if (B.sub) { c.font = 'bold 27px Arial, sans-serif'; c.fillText(B.name, W / 2, 49, 118); c.font = 'bold 12px Arial, sans-serif'; c.fillStyle = '#444'; c.fillText(B.sub, W / 2, 68, 120); }
        else { c.font = 'bold 32px Arial, sans-serif'; c.fillText(B.name, W / 2, 59, 118); }
      }
    });
    face(80, () => {
      c.fillStyle = shade(card, 0.96); c.fillRect(0, 0, W, H);
      c.strokeStyle = 'rgba(0,0,0,0.06)'; c.lineWidth = 1; for (let y = 10; y < H; y += 12) { c.beginPath(); c.moveTo(4, y); c.lineTo(W - 4, y); c.stroke(); }
      if (B.back) biro(c, B.back, W / 2, H / 2 + 2, 40, B.backCol || '#24389a');
    });
  }
  const badgeTex = (B) => canvasTex(128, 176, (c) => paintBadge(c, B), { key: 'badge|' + [B.name, B.sub, B.style, B.band, B.fade, B.scorch, B.back, B.card].join('|'), nearest: true });

  const EMPTY = {}, NONE = [];
  const MARK = { blood: 1, soot: 2, bruise: 4, graze: 8 };
  const ease = (x) => x * x * (3 - 2 * x);

  // Rue's extras ids (sets still written against them) map onto TWO's; anything unknown falls back to cust26_a
  const ALIAS = { customer_a: 'cust26_a', customer_b: 'cust26_b', customer_c: 'cust26_c', customer_d: 'cust26_d' };
  const SMALL = /^(student|customer|cust26|local40|staff|whisper|passenger|sizzle|kid40|fam40)_?/;   // extras: 128 px faces
  let kitDone = false;

  return function buildCharacter(id) {
    const L = LOOKS[id] || LOOKS[ALIAS[id]] || LOOKS.cust26_a || LOOKS.customer_a;
    atlas();
    seed = [...id].reduce((a, ch) => a * 31 + ch.charCodeAt(0), 7) % 2147483646 + 1;
    const w = L.w ?? 1, hs = (L.head ?? 1) * 1.1, sh = L.sh ?? 1, belly = L.belly ?? 0, fem = L.fem ? 1 : 0, legF = (L.leg ?? 1) * 0.95;
    const footH = 0.08, shin = 0.42 * legF, thigh = 0.43 * legF, hipY = footH + shin + thigh + 0.02;
    const T = 0.47 * (L.torso ?? 1), neckL = 0.036 * (L.neckLen ?? 1), upper = 0.29 * (L.arm ?? 1), fore = 0.26 * (L.arm ?? 1);
    const ar = 0.05 * w * (L.arms ?? 1), chestRx = 0.158 * w * sh + belly * 0.012, shX = chestRx + ar * 0.35;
    const hipRx = 0.15 * w * (1 + fem * 0.12 + (L.hips ?? 0)) + belly * 0.02, hipX = hipRx * 0.6, nr = 0.055 * (L.neck ?? 1) * Math.sqrt(w);
    const total = hipY + 0.06 + T + neckL + 0.252 * hs, s = (L.h ?? 1.78) / total;
    const skin = L.skin, top = L.top || '#777', top2 = L.top2 || top, pants = L.pants || '#333', legCol = L.legCol || skin;
    const sleeve = L.sleeve || 'short', bottom = L.bottom || 'trousers', bare = bottom === 'skirt' || bottom === 'shorts';
    const k = T / 0.47;
    const TP = [[0, 0.143 * w * (1 - fem * 0.1) + belly * 0.032, 0.1 * w + belly * 0.06, belly * 0.04],
      [0.13 * k, 0.148 * w * (1 - fem * 0.06) + belly * 0.042, 0.105 * w + belly * 0.07, belly * 0.05],
      [0.28 * k, chestRx + (L.pads || 0) * 0.5, 0.11 * w + fem * 0.024 + belly * 0.04, fem * 0.014 + belly * 0.026],
      [0.418 * k, shX * 0.92 + (L.pads || 0), 0.096 * w + belly * 0.014, -0.006], [T, nr * 1.75, nr * 1.4, -0.01]];
    const armY = 0.405 * k - 0.03;       // shoulder joint (the shoulder ring above it rounds over the sleeve cap)
    const tpAt = (y) => { let i = 0; while (i < TP.length - 2 && y > TP[i + 1][0]) i++; const a = TP[i], b = TP[i + 1], u = Math.min(1, Math.max(0, (y - a[0]) / (b[0] - a[0]))); return [y, a[1] + (b[1] - a[1]) * u, a[2] + (b[2] - a[2]) * u, a[3] + (b[3] - a[3]) * u]; };
    const tRing = (y, g = 0, a0 = Math.PI / 10, a1) => { const p = tpAt(y); return ring(10, y, p[1] + g, p[2] + g, p[3], 0, a0, a1 ?? a0 + TAU); };
    // head surface at head-local height y (head units: multiply by hs, rx also by hwOf(L)) -> [rx, rz, zc]; from headGeo's rings
    const jw = L.jaw ?? 1, HRS = [[-0.004, 0.036 * jw, 0.03, 0.058], [0.028, 0.064 * jw, 0.062, 0.04], [0.068, 0.083 * (1 + (jw - 1) * 0.7), 0.09, 0.017], [0.114, 0.091, 0.101, 0.006],
      [0.16, 0.092, 0.104, 0], [0.205, 0.084, 0.099, -0.006], [0.238, 0.058, 0.074, -0.012], [0.254, 0.022, 0.03, -0.012]];
    const hr = (y) => { let i = 0; while (i < HRS.length - 2 && y > HRS[i + 1][0]) i++; const a = HRS[i], b = HRS[i + 1], u = Math.min(1, Math.max(0, (y - a[0]) / (b[0] - a[0]))); return [a[1] + (b[1] - a[1]) * u, a[2] + (b[2] - a[2]) * u, a[3] + (b[3] - a[3]) * u]; };
    const fz = (y) => { const p = tpAt(y); return p[3] + p[2] * Math.cos(Math.PI / 10); };   // torso front plane z
    const sz = (x, y) => { const p = tpAt(y), u = Math.min(0.98, Math.abs(x) / p[1]); return p[3] + p[2] * Math.sqrt(1 - u * u); };   // torso surface z (outside the facets)

    // bones
    const parts = {};
    for (const n of PART) { parts[n] = new THREE.Bone(); parts[n].name = n; }
    const at = (n, par, x, y, z) => { parts[par].add(parts[n]); parts[n].position.set(x, y, z); };
    parts.hips.position.set(0, hipY, 0);
    at('torso', 'hips', 0, 0.06, 0); at('neck', 'torso', 0, T, 0); at('head', 'neck', 0, neckL, 0);
    for (const [sx, S] of [[1, 'L'], [-1, 'R']]) {
      at('arm' + S, 'torso', sx * shX, armY, 0); at('fore' + S, 'arm' + S, 0, -upper, 0); at('hand' + S, 'fore' + S, 0, -fore, 0);
      at('leg' + S, 'hips', sx * hipX, -0.03, 0); at('shin' + S, 'leg' + S, 0, -thigh, 0); at('foot' + S, 'shin' + S, 0, -shin, 0);
    }
    at('coat', 'hips', 0, 0, 0);          // same rest frame as hips: skirts authored in hips space can be homed on it
    const body = new THREE.Group(); body.add(parts.hips); body.updateMatrixWorld(true);
    const torsoRings = TP.map((p) => tRing(p[0]));

    const geo = geoOf(() => {
      // torso: front strip (face 9) shows top2 for open jackets / v-necks; open collar shows skin at the throat
      // the waist seam (torso ring 0 / every hips-skinned ring at the waistline) is skinned half to hips, half to torso,
      // so the two sides stay welded however the torso bends or twists
      const tt = L.topTex ? [top, L.topTex] : top;
      const open = L.open, vneck = L.vneck, seamT = (p) => (p[1] < 0.002 ? [HIPS, 0.5] : null), seamH = (p) => (p[1] > 0.05 ? [TORSO, 0.5] : null);
      G.blend = seamT;
      loft(TORSO, torsoRings, (sg, i) => {
        if (i === 9 && sg === 3 && L.collar === 'open') return skin;
        if (i === 9 && (open || (vneck && sg >= 2))) return top2;
        if (vneck && sg === 3 && (i === 0 || i === 8)) return top2;
        return tt;
      }, { capB: false });
      G.blend = null;
      if (L.hivis) for (const y of [0.17 * k, 0.33 * k]) loft(TORSO, [tRing(y, 0.004), tRing(y + 0.03, 0.004)], '#d9dcd6', { capB: false, capT: false });
      G.blend = seamH;
      // pelvis
      const pel = [[-0.075, hipRx * 0.5, 0.075 * w, 0.005], [-0.045, hipRx * 0.96, 0.1 * w + belly * 0.03, 0.01 + belly * 0.012], [0.06, TP[0][1], TP[0][2], TP[0][3]]]
        .map(([y, rx, rz, zc]) => ring(10, y, rx, rz, zc, 0, Math.PI / 10));
      loft(HIPS, pel, (sg) => (sg === 1 && L.belt ? L.belt : bottom === 'skirt' ? legCol : bottom === 'jeans' ? [pants, 'denim'] : pants), { capT: false });
      G.blend = null;
      if (bottom === 'skirt' || L.coat) {       // skirt / coat hem around the hips (flares out)
        const len = bottom === 'skirt' ? (L.skirtLen ?? 0.5) : L.coat, g = bottom === 'skirt' ? 0.007 : 0.012, col = bottom === 'skirt' ? pants : top;
        const rtT = 0.086 * w * (L.thighs ?? 1) + belly * 0.006, mx = Math.max(hipRx + g + 0.012, (hipX + rtT) * 1.07 + g), mz = Math.max(0.108 * w + belly * 0.015 + g, rtT * 1.45 + g);   // clear the thighs
        const hem = [[-len, Math.max(hipRx + 0.03 + len * 0.12, mx + 0.01), Math.max(0.125 * w + belly * 0.02 + len * 0.1, mz + 0.01), 0.01], [-0.02, mx, mz, 0.01], [0.062, TP[0][1] + g, TP[0][2] + g, TP[0][3]]]
          .map(([y, rx, rz, zc]) => ring(10, y, rx, rz, zc, 0, Math.PI / 10));
        G.blend = (p) => (p[1] < -0.1 && p[2] > -0.03 ? [p[0] >= 0 ? LEGL : LEGR, Math.min(0.6, (-p[1] - 0.05) * 1.4) * Math.min(1, (p[2] + 0.03) * 12)] : seamH(p));
        loft(HIPS, hem, (sg, i) => (L.coat && L.open && i === 9 ? shade(top, 0.6) : L.coat && L.topTex ? [col, L.topTex] : col), { capB: false, capT: false });
        G.blend = null;
      }
      if (L.untuck) {                          // untucked shirt tail hanging straight over the waistband
        const u = L.untuck, g = 0.01;
        G.blend = seamH;
        loft(HIPS, [[-u, TP[0][1] + g, TP[0][2] + g, TP[0][3]], [0.062, TP[0][1] + g * 0.4, TP[0][2] + g * 0.4, TP[0][3]]]
          .map(([y, rx, rz, zc]) => ring(10, y, rx, rz, zc, 0, Math.PI / 10)), (sg, i) => top, { capB: false, capT: false });
        G.blend = null;
        loft(HIPS, [ring(10, -u + 0.002, TP[0][1] + g * 0.6, TP[0][2] + g * 0.6, TP[0][3], 0, Math.PI / 10), ring(10, -u + 0.03, TP[0][1] - 0.01, TP[0][2] - 0.01, TP[0][3], 0, Math.PI / 10)], shade(top, 0.6), { capB: false, capT: false, down: true });
      }
      if (L.apron) {
        G.blend = seamT;
        loft(TORSO, [tRing(0, 0.01, -0.8, 0.8), tRing(0.13 * k, 0.01, -0.74, 0.74), tRing(0.28 * k, 0.01, -0.62, 0.62), tRing(0.31 * k, 0.012, -0.6, 0.6)], L.apron);
        G.blend = (p) => (p[1] < -0.1 ? [p[0] >= 0 ? LEGL : LEGR, 0.6] : seamH(p));
        loft(HIPS, [ring(8, -0.45, hipRx + 0.07, 0.19 * w, 0.01, 0, -0.95, 0.95), ring(8, 0.062, TP[0][1] + 0.01, TP[0][2] + 0.01, TP[0][3], 0, -0.8, 0.8)], L.apron);
        G.blend = null;
      }
      G.blend = seamH;
      if (L.belt && bottom !== 'skirt') loft(HIPS, [ring(10, 0.035, TP[0][1] + 0.004, TP[0][2] + 0.004, TP[0][3], 0, Math.PI / 10), ring(10, 0.062, TP[0][1] + 0.004, TP[0][2] + 0.004, TP[0][3], 0, Math.PI / 10)], L.belt, { capB: false, capT: false });
      G.blend = null;
      // collar + placket + tie + buttons
      if (L.collar === 'polo' || L.collar === 'shirt' || L.collar === 'open') {
        const cc = L.collarCol || (L.collar === 'polo' ? top : top2), zt = TP[4][3] + TP[4][2], cr = (y, g) => ring(10, y, nr + g, nr * 0.95 + g, -0.004, 0, 0.55, TAU - 0.55);
        const pw = L.collar === 'polo' ? 1 : 0.6;
        loft(TORSO, [cr(T - 0.014, 0.01), cr(T + 0.026, 0.014)], shade(cc, 0.8));              // stand
        loft(TORSO, [cr(T + 0.026, 0.016), cr(T - 0.004, 0.016 + 0.02 * pw)], cc, { down: true });   // folded-over leaf
        for (const sx of [-1, 1]) {                                                               // collar points lying on the chest
          const p0 = [sx * 0.012, T + 0.01, zt + 0.006], p1 = [sx * (nr + 0.03 * pw), T - 0.004, sz(nr + 0.03 * pw, T - 0.004) + 0.012], p2 = [sx * 0.03, T - 0.035 - 0.04 * pw, sz(0.03, T - 0.035 - 0.04 * pw) + 0.01];
          if (sx > 0) tri(TORSO, p0, p2, p1, cc); else tri(TORSO, p0, p1, p2, cc);
        }
      }
      if (L.collar === 'polo') {
        const y0 = T - 0.035, y1 = T - 0.15, z0 = fz(y0) + 0.004, z1 = fz(y1) + 0.004;
        quad(TORSO, [-0.014, y1, z1], [0.014, y1, z1], [0.014, y0, z0], [-0.014, y0, z0], shade(top, 1.25));
        for (const y of [T - 0.07, T - 0.115]) box(TORSO, 0, y, fz(y) + 0.006, 0.008, 0.008, 0.004, shade(top, 0.6));
      }
      if (L.lapels) for (const sx of [-1, 1]) {     // notched lapels either side of the open front
        const P = (x, y, o = 0.008) => [sx * x, y, sz(x, y) + o], a = P(nr * 1.02, T - 0.008), b = P(nr + 0.062, 0.37 * k), c = P(nr + 0.03, 0.345 * k, 0.01), d = P(0.022, 0.2 * k, 0.006);
        const lc = shade(top, 1.22);
        if (sx > 0) { tri(TORSO, a, d, c, lc); tri(TORSO, a, c, b, lc); } else { tri(TORSO, a, c, d, lc); tri(TORSO, a, b, c, lc); }
      }
      if (L.tie) {
        const pts = [T - 0.045, 0.3 * k, 0.12 * k].map((y) => [y, fz(y) + 0.008]);
        box(TORSO, 0, T - 0.035, pts[0][1], 0.026, 0.022, 0.012, L.tie);
        quad(TORSO, [-0.02, pts[1][0], pts[1][1]], [0.02, pts[1][0], pts[1][1]], [0.009, pts[0][0], pts[0][1]], [-0.009, pts[0][0], pts[0][1]], L.tie);
        quad(TORSO, [0, pts[2][0] - 0.02, pts[2][1]], [0.024, pts[2][0], pts[2][1]], [0.02, pts[1][0], pts[1][1]], [-0.02, pts[1][0], pts[1][1]], L.tie);
        tri(TORSO, [0, pts[2][0] - 0.02, pts[2][1]], [-0.02, pts[1][0], pts[1][1]], [-0.024, pts[2][0], pts[2][1]], L.tie);
      }
      if (L.buttons) for (const y of [0.1, 0.2, 0.3].map((v) => v * k)) for (const sx of L.buttons === 2 ? [-1, 1] : [0]) box(TORSO, sx * 0.045, y, fz(y) + 0.006, 0.014, 0.014, 0.008, L.buttonCol || '#c9a23a');
      if (L.zip) quad(TORSO, [-0.005, 0.02, fz(0.02) + 0.004], [0.005, 0.02, fz(0.02) + 0.004], [0.005, T - 0.03, fz(T - 0.03) + 0.004], [-0.005, T - 0.03, fz(T - 0.03) + 0.004], L.zip);
      if (L.logo) quad(TORSO, ...onFace(torsoRings, 2, 0, 0.08, 0.9, 0.2, 0.72), '#ffffff', REG[L.logo]);
      // neck + hood
      const nc = L.neckCol || skin, neckScar = mix(skin, '#c4706a', 0.5);   // TWO: luka40's scar carries on down the right of the neck (sides 4-5, -X)
      loft(NECK, [ring(6, -0.03, nr, nr * 0.95, -0.004), ring(6, neckL + 0.035, nr * 0.92, nr * 0.9, 0.004)], L.scar === 'jawR' ? (sg, i) => (i === 4 || i === 5 ? [neckScar, 'scar'] : nc) : nc, { capB: false, capT: false });
      if (L.hood) loft(TORSO, [ring(8, T - 0.03, nr + 0.05, nr + 0.03, -0.035, 0, 1.4, TAU - 1.4), ring(8, T + 0.06, nr + 0.035, nr + 0.03, -0.045, 0, 1.4, TAU - 1.4)], L.hood);
      // arms
      for (const [sx, U, F, H] of [[1, ARML, FOREL, HANDL], [-1, ARMR, FORER, HANDR]]) {
        const a = Math.PI / 6, pads = (L.pads || 0) * 0.7;
        const up = sleeve === 'short' ? [[0.04, 0.6], [0.0, 1.03], [-0.13, 1.08], [-0.135, 0.86], [-upper, 0.8]]
          : sleeve === 'none' ? [[0.04, 0.6], [0.0, 1], [-upper, 0.8]] : [[0.045, 0.62 + pads * 8], [0.008, 1.03 + pads * 6], [-upper + 0.09, 0.93], [-upper, 0.88]];
        const sw2 = L.sleeveW ?? 1;
        // the cap leans in toward the collar so the shoulder line slopes into the sleeve instead of stepping out
        loft(U, up.map(([y, r], q) => ring(8, y, ar * r * (sleeve === 'none' ? 1 : sw2), ar * r * (sleeve === 'none' ? 1 : sw2), 0, q === 0 ? -sx * ar * 0.45 : q === 1 ? -sx * ar * 0.12 : 0, Math.PI / 8)), (sg, i) => {
          if (sleeve === 'short') return sg < 2 ? top : sg === 2 ? shade(top, 0.7) : skin;
          if (sleeve === 'none') return skin;
          return L.patches && sg === up.length - 2 && (i === 3 || i === 4) ? L.patches : L.topTex ? [top, L.topTex] : top;
        }, { down: true });
        const fa = sleeve === 'short' || sleeve === 'none' ? [[0.01, 0.8], [-0.07, 0.84], [-fore, 0.6]]
          : sleeve === 'rolled' ? [[0.01, 0.98], [-0.05, 1.12], [-0.085, 1.06], [-0.09, 0.74], [-fore, 0.6]]
          : [[0.01, 0.88], [-0.07, 0.9], [-fore + 0.035, 0.76], [-fore + 0.03, 0.66], [-fore, 0.6]];
        loft(F, fa.map(([y, r], q) => { const g = sleeve === 'rolled' ? (q < 3 ? sw2 : 1) : sleeve === 'long' ? (q < 3 ? sw2 : 1) : 1; return ring(6, y, ar * r * g, ar * r * g, 0, 0, a); }), (sg, i) => {
          if (sleeve === 'short' || sleeve === 'none') return skin;
          if (sleeve === 'rolled') return sg < 2 ? top : sg === 2 ? shade(top, 0.7) : skin;
          if (L.patches && sg === 0 && i === 2) return L.patches;
          return sg < 2 ? (L.topTex ? [top, L.topTex] : top) : sg === 2 ? shade(top, 0.7) : (L.cuff || skin);
        }, { down: true, capB: false });
        const hx = 0.021 * Math.sqrt(w) * (L.hands ?? 1), hz = 0.042 * Math.sqrt(w) * (L.hands ?? 1), hc = L.gloves || skin;
        // TWO: L.scarHand 'R' = burn scars across the back of the right hand (sides 3-5 face -X, the back of a hanging hand)
        const scarC = mix(skin, '#b85c54', 0.72), handC = sx < 0 && L.scarHand === 'R' && !L.gloves ? (sg, i) => (i >= 3 && i <= 5 && sg < 2 ? [scarC, 'scar'] : hc) : hc;
        loft(H, [[0.005, 0.9, 0.75], [-0.035, 1, 1.05], [-0.095, 0.9, 1.05], [-0.152, 0.7, 0.72]].map(([y, rx, rz]) => ring(6, y, hx * rx, hz * rz, 0, 0, 0)), handC, { down: true, capB: false });
        loft(H, [[-0.022, 0.012, 0.03], [-0.05, 0.011, 0.047], [-0.078, 0.008, 0.055]].map(([y, r, z]) => ring(4, y, r, r, z, 0, Math.PI / 4)), hc, { down: true, capB: false });   // (Rue left the thumb skin-coloured)
      }
      // legs
      for (const [sx, U, S, F] of [[1, LEGL, SHINL, FOOTL], [-1, LEGR, SHINR, FOOTR]]) {
        const a = Math.PI / 6, rt = 0.086 * w * (L.thighs ?? 1) + belly * 0.006, fade = L.fade || pants, fadeS = mix(pants, fade, 0.6);
        const th = bottom === 'shorts' ? [[0.035, 0.78], [0, 1.06], [-0.2 * legF, 1.03], [-0.205 * legF, 0.84], [-thigh, 0.64]]
          : bottom === 'jeans' ? [[0.035, 0.74], [0, 1], [-0.2 * legF, 0.92], [-thigh + 0.07, 0.72], [-thigh, 0.68]]
          : [[0.035, 0.74], [0, 1], [-0.2 * legF, 0.92], [-thigh, 0.68]];
        loft(U, th.map(([y, r]) => ring(6, y, rt * r, rt * r, 0, 0, a)), (sg, i) => {
          if (bottom === 'shorts') return sg < 2 ? pants : sg === 2 ? shade(pants, 0.7) : legCol;
          if (bottom === 'skirt') return legCol;
          if (bottom === 'jeans') return sg === 3 && (i === 5 || i === 0 || i === 4) ? [i === 5 ? fade : fadeS, 'knee_up'] : [pants, 'denim'];
          if (L.pleats && i === 5) return shade(pants, 0.8);
          return pants;
        }, { down: true, capB: false });
        const wel = L.shoes === 'welly';    // wellies: the shin below mid-calf is boot
        const sn = bare ? [[0, 0.62], [-0.12, 0.66], [-shin + 0.1, 0.46], [-shin + 0.02, 0.44], [-shin, 0.42]]
          : bottom === 'jeans' ? [[0, 0.7], [-0.14, 0.69], [-shin + 0.015, 0.68], [-shin, 0.44]] : [[0, 0.68], [-0.14, 0.67], [-shin + 0.015, 0.62], [-shin, 0.42]];
        loft(S, sn.map(([y, r]) => { const q = rt * r * (wel && y < -shin * 0.45 ? 1.25 : 1); return ring(6, y, q, q, 0, 0, a); }), (sg, i) => {
          if (wel && sg >= 1) return L.shoeCol;
          if (bare) return sg >= 2 && L.socks ? L.socks : legCol;
          if (bottom === 'jeans') return sg === 0 && (i === 5 || i === 0 || i === 4) ? [i === 5 ? fade : fadeS, 'knee_dn'] : [sg === 2 ? shade(pants, 0.75) : pants, 'denim'];
          if (L.pleats && i === 5) return shade(pants, 0.8);
          return sg === 2 ? shade(pants, 0.75) : pants;
        }, { down: true });
        // shoe
        const kind = L.shoes || 'shoe', sw = (L.feet ?? 1) * Math.sqrt(w), sc = L.shoeCol || '#222';
        const soleH = kind === 'sneaker' ? 0.024 : kind === 'thong' ? 0.012 : kind === 'boot' || kind === 'welly' ? 0.022 : 0.016;
        box(F, 0, -footH + soleH / 2, 0.058, 0.1 * sw, soleH, 0.28 * (L.feet ?? 1), L.soleCol || shade(sc, 0.6));
        const tall = kind === 'boot' || kind === 'welly' ? 0.02 : kind === 'thong' ? -0.012 : kind === 'loafer' || kind === 'shoe' ? -0.004 : 0;
        const up = [[-0.068, 0.045, 0.036 + tall, -0.034 + tall * 0.5], [0.03, 0.05, 0.034 + tall * 0.6, -0.036 + tall * 0.3], [0.13, 0.047, 0.024, -0.046], [0.186, 0.033, 0.014, -0.054]]
          .map(([z, rx, ry, yc]) => ringZ(6, z * (L.feet ?? 1), rx * sw, ry, yc - (0.08 - footH)));
        loft(F, up, (sg) => (kind === 'thong' ? skin : sg === 2 && L.toeCol ? L.toeCol : sc));
        if (kind === 'thong') box(F, 0, -footH + soleH + 0.004, 0.09, 0.07 * sw, 0.006, 0.012, L.soleCol || '#333');
      }
      hair(L, hs);
    }, PART.map((n) => parts[n].matrixWorld));

    if (!skinMat) { skinMat = atlasMat.clone(); skinMat.defaultAttributeValues = atlasMat.defaultAttributeValues; }
    const mesh = new THREE.SkinnedMesh(geo, skinMat);
    mesh.frustumCulled = false; mesh.name = 'body';
    body.add(mesh);
    body.updateMatrixWorld(true);
    mesh.bind(new THREE.Skeleton(PART.map((n) => parts[n])));
    const attach = {};

    // ---- skinned attachments (TWO): second SkinnedMeshes on the same skeleton, built at rest scale before body.scale.
    // They deform with the body and toggle with .visible: the trench / long coat, gloves, a ponytail that a hood can hide.
    const skinAtt = (name, fn, vis = true) => {
      const m = new THREE.SkinnedMesh(geoOf(fn, PART.map((n) => parts[n].matrixWorld)), skinMat);
      m.name = name; m.frustumCulled = false; m.visible = vis; body.add(m); m.bind(mesh.skeleton, mesh.bindMatrix);
      attach[name] = m; return m;
    };
    if (L.coatAtt) skinAtt('coat', () => coat(L.coatAtt));
    if (L.glovesAtt) skinAtt('gloves', () => {
      const gc = L.glovesAtt, hx = 0.021 * Math.sqrt(w) * (L.hands ?? 1) * 1.16, hz = 0.042 * Math.sqrt(w) * (L.hands ?? 1) * 1.14;
      for (const H of [HANDL, HANDR]) {
        loft(H, [[0.03, 0.95, 0.82], [0.005, 0.98, 0.8], [-0.035, 1, 1.05], [-0.095, 0.92, 1.05], [-0.152, 0.72, 0.74], [-0.16, 0.4, 0.4]].map(([y, rx, rz]) => ring(6, y, hx * rx, hz * rz, 0, 0, 0)),
          (sg) => (sg === 3 ? shade(gc, 1.25) : sg === 0 ? shade(gc, 0.8) : gc), { down: true, capB: false });
        loft(H, [[-0.02, 0.016, 0.03], [-0.05, 0.015, 0.048], [-0.08, 0.011, 0.057]].map(([y, r, z]) => ring(4, y, r, r, z, 0, Math.PI / 4)), gc, { down: true, capB: false });
      }
    });
    if (L.tailSep && (L.hairStyle || 'short') === 'ponytail') skinAtt('ponytail', () => ponytail(L, hs));

    // A long coat (TWO): open front, torso shell over the clothes, set-in sleeves, a skirt on the coat bone whose
    // front follows the thighs and whose back swings (rig.update springs the coat bone). C = { col, len, gap, collar:
    // 'trench' | 'funnel', lapels, belt, pockets, notes, sleeveW, lining }.
    function coat(C) {
      const col = C.col, g = C.g ?? 0.026, gap = C.gap ?? 0.42, len = C.len ?? 0.62, sw = C.sleeveW ?? 1.3;
      const lin = C.lining || shade(col, 0.5), dk = shade(col, 0.74), lt = shade(col, 1.16);
      const cloth = (sg, i) => [(sg * 13 + i * 7) % 5 === 0 ? shade(col, 0.9) : (sg * 5 + i * 11) % 7 === 0 ? shade(col, 1.06) : col, 'twill'];
      const seamT = (p) => (p[1] < 0.002 ? [HIPS, 0.5] : null);
      // torso shell (+ a lining so the open front reads from inside), and the collar
      const shell = (gg, a) => TP.map((p, i) => tRing(p[0], gg + (i === 3 ? 0.006 : 0), a, TAU - a));
      G.blend = seamT;
      loft(TORSO, shell(g, gap), cloth, { capB: false, capT: false });
      loft(TORSO, shell(g - 0.006, gap), lin, { capB: false, capT: false, down: true });
      // shoulder yoke: close the top ring onto the collar line
      G.blend = null;
      const zt = TP[4][3], nrC = nr + 0.012;
      if (C.collar === 'funnel') {            // luka40: a high funnel collar round the neck to the jaw
        const fr = (y, gg, a) => ring(10, y, nrC + gg, nrC * 0.96 + gg, zt + 0.004, 0, a, TAU - a);
        loft(TORSO, [fr(T - 0.03, 0.05, 0.62), fr(T + 0.03, 0.03, 0.6), fr(T + 0.1, 0.034, 0.58)], (sg) => (sg === 1 ? [lt, 'twill'] : [col, 'twill']), { capB: false, capT: false });
        loft(TORSO, [fr(T - 0.03, 0.044, 0.62), fr(T + 0.03, 0.024, 0.6), fr(T + 0.1, 0.028, 0.58)], lin, { capB: false, capT: false, down: true });
      } else {                                // trench: a turned-down collar (rig.show('collar_up') pops it)
        const cr = (y, gg, a = 0.8) => ring(10, y, nrC + gg, nrC * 0.95 + gg, zt, 0, a, TAU - a);
        loft(TORSO, [cr(T - 0.02, 0.03), cr(T + 0.035, 0.026)], dk, { capB: false, capT: false });
        loft(TORSO, [cr(T + 0.035, 0.03), cr(T - 0.03, 0.062, 0.7)], (sg) => [lt, 'twill'], { capB: false, capT: false, down: true });
        loft(TORSO, [cr(T + 0.035, 0.026), cr(T - 0.03, 0.056, 0.7)], lin, { capB: false, capT: false });
      }
      if (C.lapels !== false) for (const sx of [-1, 1]) {   // wide notched lapels folded back along the open front
        const P = (x, y, o) => [sx * x, y, sz(x, y) + g + o], a = P(nr + 0.02, T - 0.03, 0.012), b = P(nr + 0.085, 0.36 * k, 0.012), c = P(nr + 0.05, 0.33 * k, 0.014), d = P(0.07, 0.12 * k, 0.008);
        if (sx > 0) { tri(TORSO, a, d, c, lt); tri(TORSO, a, c, b, lt); } else { tri(TORSO, a, c, d, lt); tri(TORSO, a, b, c, lt); }
      }
      if (C.belt) {                           // a belt round the waist, open at the front, ends hanging
        G.blend = seamT;
        loft(TORSO, [tRing(0.0, g + 0.006, gap + 0.05, TAU - gap - 0.05), tRing(0.045, g + 0.006, gap + 0.05, TAU - gap - 0.05)], shade(col, 0.82), { capB: false, capT: false });
        G.blend = null;
        for (const sx of [-1, 1]) { const x = sx * (TP[0][1] + g) * Math.sin(gap + 0.08), z = (TP[0][2] + g) * Math.cos(gap + 0.08) + TP[0][3] + 0.01; box(HIPS, x, 0.0, z, 0.035, 0.12, 0.008, shade(col, 0.8)); }
      }
      // sleeves over the arms
      for (const [sx, U, F] of [[1, ARML, FOREL], [-1, ARMR, FORER]]) {
        const up = [[0.052, 0.7], [0.01, 1.12], [-upper + 0.09, 1.02], [-upper, 0.98]];
        loft(U, up.map(([y, r], q) => ring(8, y, ar * r * sw, ar * r * sw, 0, q === 0 ? -sx * ar * 0.45 : q === 1 ? -sx * ar * 0.12 : 0, Math.PI / 8)), cloth, { down: true });
        const fa = [[0.014, 0.98], [-0.07, 0.94], [-fore + 0.055, 0.84], [-fore + 0.05, 0.9], [-fore + 0.014, 0.9]];
        loft(F, fa.map(([y, r]) => ring(6, y, ar * r * sw, ar * r * sw, 0, 0, Math.PI / 6)), (sg, i) => (sg >= 2 ? [dk, 'twill'] : cloth(sg, i)), { down: true, capB: false, capT: false });
        loft(F, [ring(6, -fore + 0.05, ar * 0.84 * sw, ar * 0.84 * sw, 0, 0, Math.PI / 6), ring(6, -fore + 0.016, ar * 0.84 * sw, ar * 0.84 * sw, 0, 0, Math.PI / 6)], lin, { capB: false, capT: false });
      }
      // the skirt: in hips space; below the hip joint it lives on the coat bone. Front follows the thighs, the back
      // only a little (the coat bone's spring swings it), so the walk opens the front and the back trails.
      const rtT = 0.086 * w * (L.thighs ?? 1) + belly * 0.006;
      const mx = Math.max(hipRx + g + 0.016, (hipX + rtT) * 1.07 + g), mz = Math.max(0.108 * w + belly * 0.015 + g, rtT * 1.45 + g);
      const R = [[0.062, TP[0][1] + g, TP[0][2] + g, TP[0][3], gap], [-0.03, mx, mz, 0, gap + 0.03], [-0.2, mx + 0.035, mz + 0.035, -0.012, gap + 0.07],
        [-0.4, mx + 0.065, mz + 0.07, -0.026, gap + 0.12], [-len, mx + 0.09, mz + 0.1, -0.04, gap + 0.17]];
      const sk = (gg) => R.map(([y, rx, rz, zc, a]) => ring(12, y, rx + gg, rz + gg, zc, 0, a, TAU - a));
      G.bone = (p, b) => (p[1] < 0.02 ? COAT : b);
      G.blend = (p) => {
        if (p[1] > 0.05) return [TORSO, 0.5];
        const d = Math.min(1, Math.max(0, -p[1] / len)), f = p[2] / (Math.hypot(p[0], p[2]) || 1);
        return d > 0 ? [p[0] >= 0 ? LEGL : LEGR, Math.pow(d, 0.8) * (0.22 + 0.5 * Math.max(0, f))] : null;
      };
      loft(HIPS, sk(0), (sg, i) => (sg === R.length - 2 ? [shade(col, 0.86), 'twill'] : cloth(sg + 5, i)), { capB: false, capT: false, down: true });
      loft(HIPS, sk(-0.007), lin, { capB: false, capT: false });
      // deep pockets, flaps, and (Chase's) the things poking out of them: sticky notes, a cable
      if (C.pockets) {
        const sr = sk(0), out = (P) => [P[3], P[2], P[1], P[0]];   // skirt rings run top -> bottom: flip to face outward
        const lift = (P, h) => P.map((v, j) => (j < 2 ? [v[0], v[1] + h, v[2]] : v));   // raise the top edge
        for (const [i, sx] of [[1, 1], [10, -1]]) {
          const u0 = sx > 0 ? 0 : 0.4, u1 = sx > 0 ? 0.6 : 1;
          quad(HIPS, ...out(onFace(sr, 1, i, u0, u1, 0.12, 0.92, -0.004)), dk);
          quad(HIPS, ...out(onFace(sr, 1, i, u0 - 0.04, u1 + 0.04, 0.0, 0.3, -0.009)), shade(col, 0.66));
          if (C.notes) {
            const a = sx > 0 ? 0.08 : 0.55;
            quad(HIPS, ...out(lift(onFace(sr, 1, i, a, a + 0.18, 0.0, 0.1, -0.006), 0.035)), sx > 0 ? '#ffe45c' : '#ff9ec4');
            quad(HIPS, ...out(lift(onFace(sr, 1, i, a + 0.2, a + 0.34, 0.0, 0.1, -0.007), 0.024)), sx > 0 ? '#9fe0ff' : '#ffe45c');
            const m = onFace(sr, 1, i, a + 0.36, a + 0.4, 0.0, 0.0, -0.011)[0];
            wire(HIPS, [m, [m[0] + sx * 0.008, m[1] + 0.03, m[2]], [m[0] + sx * 0.026, m[1] + 0.022, m[2]], [m[0] + sx * 0.03, m[1] - 0.03, m[2]]], 0.004, '#1c1c1e');
          }
        }
      }
      G.bone = null; G.blend = null;
    }
    body.scale.setScalar(s);
    const root = new THREE.Group(); root.name = id; root.add(body);

    // head + face
    const H = headGeo(L, hs), fk = faceKit(L, SMALL.test(id) ? 128 : 256);
    const head = new THREE.Mesh(H.g, matTex(fk.tex)); head.name = 'face'; parts.head.add(head);

    // attachments (rigid meshes on bones; coordinates in the bone's space, body units, x hs on the head)
    const att = (name, bone, fn, vis = true, pos, rot, material) => {
      const m = new THREE.Mesh(geoOf(fn), material || atlas()); m.name = name; m.visible = vis;
      if (pos) m.position.set(pos[0], pos[1], pos[2]); if (rot) m.rotation.set(rot[0], rot[1], rot[2]);
      (bone.isObject3D ? bone : parts[bone]).add(m); attach[name] = m; return m;
    };
    // a PROPS piece held or worn (shared cached geometry, built in metres: scaled back out of the body's scale)
    const attP = (name, bone, id, o, vis, pos, rot) => {
      const m = PROPS[id](o || EMPTY); m.name = name; m.visible = vis; m.scale.setScalar(1 / s);
      if (pos) m.position.set(pos[0], pos[1], pos[2]); if (rot) m.rotation.set(rot[0], rot[1], rot[2]);
      (bone.isObject3D ? bone : parts[bone]).add(m); attach[name] = m; return m;
    };
    for (const [n, S] of [['gripL', 'handL'], ['gripR', 'handR']]) { const g = new THREE.Object3D(); g.name = n; g.position.set(0, -0.085, 0); parts[S].add(g); attach[n] = g; }
    const has = (n) => L.attach && L.attach.includes(n);
    const HP = Math.PI / 2;
    // hand-held props (hidden until content or an animation shows them)
    att('phone', attach.gripR, HELD.phone, false, [0, 0.02, 0.02], [0, 0, 0]);
    att('mug', attach.gripL, () => (L.mug === 'cup' ? HELD.cup() : HELD.mug(L)), !!L.mug, [0, -0.02, 0.06], [HP, 0, 0]);
    att('textbook', attach.gripR, () => (L.book === 'newspaper' ? HELD.newspaper() : HELD.textbook(L)), false, [0.03, 0, 0.05], [0, 0, 0]);
    att('umbrella', attach.gripR, () => HELD.umbrella(L), false, [0, 0, 0.02], [HP, 0, 0]);
    if (has('brick')) att('brick', attach.gripR, HELD.brick, false, [0, 0.03, 0.02], [0, 0, 0]);
    if (has('stick')) att('stick', attach.gripR, HELD.stick, true, [0, 0, 0.02], [0.08, 0, 0]);
    if (has('handbag')) att('handbag', attach.gripL, () => HELD.handbag(L), true, [0, 0.03, 0], [0, 0, 0]);
    if (has('whistle')) att('whistle', attach.gripR, HELD.whistle, true, [0, 0.01, 0.03], [HP, 0, 0]);
    if (has('recorder')) att('recorder', attach.gripR, HELD.recorder, false, [0, 0, 0.03], [0, 0, 0]);
    // TWO hand props (PROPS geometry): grip space, +Y up the forearm, +Z out of the palm's front
    if (has('remote')) attP('remote', attach.gripR, 'remote', { hand: true }, false, [0, 0.0, 0.03], [HP, 0, 0]);
    if (has('slate')) attP('slate', attach.gripR, 'slate', { hand: true }, false, [0, -0.02, 0.07], [0, HP, 0.15]);
    if (has('tether')) attP('tether', attach.gripR, 'tether_coil', { hand: true }, false, [0, -0.01, 0.03], [0, 0, HP]);
    if (has('tongs') || L.tongs) attP('tongs', attach.gripR, 'tongs', EMPTY, !!L.tongs, [0, 0.0, 0.02], [HP, 0, 0]);
    if (has('coaster')) attP('coaster', attach.gripR, 'coaster', EMPTY, false, [0, -0.01, 0.035], [0, HP, 0]);
    if (has('notepad')) { attP('notepad', attach.gripL, 'notepad', EMPTY, false, [0, -0.01, 0.05], [0, -HP, 0]); attP('biro', attach.gripR, 'biro', EMPTY, false, [0, 0.0, 0.02], [HP, 0, 0]); }
    if (has('food') || L.food) attP('food', attach.gripR, 'food', { kind: L.food || 'pie' }, false, [0, -0.005, 0.035], [0, 0, 0]);
    if (has('cracker')) attP('cracker', attach.gripR, 'cracker', EMPTY, false, [0, 0, 0.03], [HP, 0, 0]);
    // head-worn
    const HX = 0.095 * hs * hwOf(L), hw = hwOf(L);
    if (L.glasses) att('glasses', 'head', () => {
      glasses(L, hs, L.glasses);
      if (L.chain) for (const sx of [-1, 1]) wire(0, [[sx * HX * 0.99, 0.14 * hs, 0.02 * hs], [sx * HX * 0.93, 0.03 * hs, 0.03 * hs], [sx * 0.05 * hs, -0.07 * hs, 0.08 * hs], [0, -0.1 * hs, 0.1 * hs]], 0.004, '#d0b25c');
    }, true, L.glassesUp ? [0, 0.085 * hs, -0.012 * hs] : null, L.glassesUp ? [-0.32, 0, 0] : null);   // glassesUp: reading glasses pushed up on the head (Rue)
    // sunnies: pushed up onto the hair, or resting on the front of a cap
    if (L.sunnies) att('sunnies', 'head', () => glasses(L, hs, 'sun', 0.86), true, L.sunnies === 'cap' ? [0, 0.054 * hs, 0.046 * hs] : [0, 0.069 * hs, 0.01 * hs], [L.sunnies === 'cap' ? -0.3 : -0.25, 0, 0]);
    if (has('earbud')) att('earbud', 'head', () => { const ex = 0.0865 * hs * hw + 0.01; box(0, ex, 0.12 * hs, -0.008 * hs, 0.015, 0.015, 0.016, '#f6f6f4'); box(0, ex + 0.001, 0.098 * hs, -0.004 * hs, 0.007, 0.03, 0.007, '#ececea', -0.2); }, !L.earbudOff);
    if (has('pen')) att('pen', 'head', () => box(0, -(HX + 0.01), 0.15 * hs, -0.02 * hs, 0.007, 0.007, 0.13, '#2a4fa0', -0.35), true);
    if (has('goggles') || L.goggles) {        // safety goggles: on the eyes, or pushed up (userData.up(true))
      const g = att('goggles', 'head', () => { loft(0, [ring(10, 0.12 * hs, HX + 0.012, 0.112 * hs, -0.002), ring(10, 0.152 * hs, HX + 0.012, 0.112 * hs, -0.002)], '#3a3a3a', { capB: false, capT: false }); box(0, 0, 0.136 * hs, 0.12 * hs, 0.13 * hs, 0.044 * hs, 0.022, '#a9d0d8'); box(0, 0, 0.158 * hs, 0.12 * hs, 0.13 * hs, 0.006, 0.024, '#e8e8e8'); }, !!L.goggles);
      g.userData.up = (on) => { g.position.set(0, on ? 0.07 * hs : 0, on ? -0.012 * hs : 0); g.rotation.x = on ? -0.42 : 0; };
      if (L.goggles === 'up') g.userData.up(true);
    }
    const phonesCol = L.phonesCol || '#2a2a2e', phonesBand = L.phonesBand || '#4a4d55';
    const phonesOnHead = () => {
      for (let i = 0; i < 8; i++) { const a0 = -1.45 + 2.9 * i / 8, a1 = -1.45 + 2.9 * (i + 1) / 8, R = 0.128 * hs, y = 0.13 * hs;
        quad(0, [Math.sin(a0) * R, y + Math.cos(a0) * R, -0.014], [Math.sin(a1) * R, y + Math.cos(a1) * R, -0.014], [Math.sin(a1) * R, y + Math.cos(a1) * R, 0.014], [Math.sin(a0) * R, y + Math.cos(a0) * R, 0.014], phonesBand);
        quad(0, [Math.sin(a0) * R, y + Math.cos(a0) * R, 0.014], [Math.sin(a1) * R, y + Math.cos(a1) * R, 0.014], [Math.sin(a1) * R, y + Math.cos(a1) * R, -0.014], [Math.sin(a0) * R, y + Math.cos(a0) * R, -0.014], phonesBand); }
      for (const sx of [-1, 1]) { box(0, sx * (HX + 0.018), 0.12 * hs, -0.01, 0.034, 0.08 * hs, 0.074 * hs, phonesCol); box(0, sx * (HX + 0.002), 0.12 * hs, -0.01, 0.008, 0.07 * hs, 0.064 * hs, '#141416'); }
    };
    if (has('headphones_head')) att('headphones_head', 'head', phonesOnHead, false);
    if (has('chip') || L.chip) {                        // the Neural Chip light: a tiny emissive dot behind the RIGHT ear (-X); keyed material per look
      const m = mat(0xffffff, { emissive: 0x6fc8ff, emissiveIntensity: 1.5, key: 'chip_' + id });
      const CHR = { long: 1.24, big: 1.5, bob: 1.22, curly: 1.24, set: 1.22, mullet: 1.2, shaggy: 1.22, messy: 1.1 }[L.hairStyle] || 1.07;   // sit on the hair, not under it
      const c = att('chip_light', 'head', () => {
        box(0, 0, 0, 0, 0.017, 0.017, 0.01, '#bfe6ff');
        box(0, 0, 0, -0.004, 0.026, 0.026, 0.004, '#4a86aa');
      }, true, [-(0.083 * hs * hw * CHR), 0.112 * hs, -0.052 * hs * CHR], [0, -2.3, 0], m);
      const CH = { on: [0x6fc8ff, 1.5], off: [0x000000, 0], ping: [0xd8f2ff, 3], amber: [0xffb020, 1.6], red: [0xff3b30, 1.6], dim: [0x6fc8ff, 0.5] };
      c.userData.set = (st) => { const v = CH[st] || CH.on; m.emissive.setHex(v[0]); m.emissiveIntensity = v[1]; c.userData.state = st; };
      c.userData.state = 'on';
    }
    if (has('antlers') || L.antlers) att('antlers', 'head', () => {   // mandatory fun: a felt reindeer-antler headband
      const R = 0.136 * hs, y0 = 0.125 * hs, bc = '#3a2a22', ac = L.antlerCol || '#6a4a32';
      for (let i = 0; i < 8; i++) { const a0 = -1.5 + 3 * i / 8, a1 = -1.5 + 3 * (i + 1) / 8;
        quad(0, [Math.sin(a0) * R, y0 + Math.cos(a0) * R, -0.006], [Math.sin(a1) * R, y0 + Math.cos(a1) * R, -0.006], [Math.sin(a1) * R, y0 + Math.cos(a1) * R, 0.008], [Math.sin(a0) * R, y0 + Math.cos(a0) * R, 0.008], bc); }
      for (const sx of [-1, 1]) {
        const b0 = [sx * 0.055 * hs, 0.25 * hs, 0], b1 = [sx * 0.085 * hs, 0.33 * hs, -0.01], b2 = [sx * 0.13 * hs, 0.4 * hs, -0.02];
        bar(0, b0, b1, 0.011, ac); bar(0, b1, b2, 0.009, ac);
        bar(0, b1, [sx * 0.055 * hs, 0.39 * hs, 0.0], 0.008, ac); bar(0, [sx * 0.105 * hs, 0.36 * hs, -0.014], [sx * 0.155 * hs, 0.365 * hs, -0.01], 0.007, ac);
      }
      if (L.bells) for (const sx of [-1, 1]) box(0, sx * 0.07 * hs, 0.27 * hs, 0.012, 0.016, 0.016, 0.016, '#d8b440');
    }, true);
    const cap = L.cap;
    if (cap) att('cap', 'head', () => {
      const cc = L.capCol || '#1b2340';
      if (cap === 'porter' || cap === 'chauffeur') {
        loft(0, [ring(10, 0.19 * hs, 0.1 * hs, 0.114 * hs, -0.004), ring(10, 0.225 * hs, 0.101 * hs, 0.115 * hs, -0.004), ring(10, 0.29 * hs, 0.112 * hs, 0.128 * hs, -0.01)], (sg) => (sg === 0 ? '#111' : cc));
        box(0, 0, 0.19 * hs, 0.125 * hs, 0.17 * hs, 0.012, 0.07 * hs, '#101010', -0.3);
        if (cap === 'porter') box(0, 0, 0.245 * hs, 0.126 * hs, 0.03, 0.03, 0.01, '#c9a23a');
      } else if (cap === 'flat') {
        loft(0, [ring(10, 0.19 * hs, 0.1 * hs, 0.114 * hs, 0.004), ring(10, 0.23 * hs, 0.104 * hs, 0.124 * hs, 0.012), ring(10, 0.25 * hs, 0.06 * hs, 0.08 * hs, 0.02)], cc);
        box(0, 0, 0.205 * hs, 0.12 * hs, 0.15 * hs, 0.012, 0.05 * hs, shade(cc, 0.8), -0.4);
      } else if (cap === 'beanie') {
        loft(0, [ring(10, 0.16 * hs, 0.1 * hs, 0.112 * hs), ring(10, 0.2 * hs, 0.1 * hs, 0.112 * hs), ring(10, 0.25 * hs, 0.085 * hs, 0.098 * hs), ring(10, 0.29 * hs, 0.03 * hs, 0.035 * hs)], (sg) => (sg === 0 ? shade(cc, 0.75) : [cc, 'knit']));
      } else {
        loft(0, [ring(10, 0.175 * hs, 0.1 * hs, 0.112 * hs), ring(10, 0.235 * hs, 0.092 * hs, 0.103 * hs, -0.004), ring(10, 0.27 * hs, 0.05 * hs, 0.06 * hs, -0.01)], cc);
        box(0, 0, 0.18 * hs, 0.145 * hs, 0.15 * hs, 0.01, 0.1 * hs, shade(cc, 0.85), -0.12);
      }
    }, true);
    if (has('santa')) {                       // a cheap Santa hat, and a fake white beard on elastic worn OVER the real one
      att('santa', 'head', () => {
        const fur = ['#f3efe6', 'fur'], red = '#c41f2a', fr = (y, g, zc = -0.008) => ring(12, y * hs, (hr(y)[0] + g) * hs * hw, (hr(y)[1] + g) * hs, zc * hs);
        loft(0, [fr(0.162, 0.024), fr(0.19, 0.03), fr(0.218, 0.022)], fur, { capB: false, capT: false });
        loft(0, [fr(0.162, 0.018), fr(0.218, 0.016)], shade('#f3efe6', 0.7), { capB: false, capT: false, down: true });
        const cone = [[0.215, 0.09, 0.1, -0.01, 0], [0.26, 0.078, 0.088, -0.024, 0.006], [0.3, 0.056, 0.062, -0.05, 0.02], [0.33, 0.034, 0.038, -0.086, 0.04], [0.335, 0.012, 0.014, -0.122, 0.058]]
          .map(([y, rx, rz, zc, xc]) => ring(8, y * hs, rx * hs * hw, rz * hs, zc * hs, xc * hs));
        loft(0, cone, (sg) => (sg % 2 ? shade(red, 0.86) : red), { capB: false });
        loft(0, [[-0.016, 0.01], [-0.008, 0.02], [0.006, 0.021], [0.016, 0.009]].map(([y, r]) => ring(6, (0.322 + y) * hs, r * hs, r * hs, -0.13 * hs, 0.064 * hs)), fur);
      }, false);
      const bd = att('santa_beard', 'head', () => {
        const wh = '#f5f3ee', fur = (sg, i) => [(sg + i) % 3 ? wh : '#e6e3dc', 'fur'], A = 1.95;
        // the curtain: from the mouth line down past the chin, rising at the sides to the ears where the elastic hooks
        const lvl = [[-0.115, 0.04, 0.05, 0.068], [-0.075, 0.062, 0.07, 0.052], [-0.03, 0.078, 0.084, 0.034], [0.006, 0.086, 0.094, 0.022], [0.034, 0.088, 0.098, 0.018]];
        const curtain = (g) => lvl.map(([y, rx, rz, zc], li) => {
          const r = ring(10, y * hs, (rx + g) * hs * hw, (rz + g) * hs, zc * hs, 0, -A, A);
          r.forEach((p, j) => { const a = Math.abs(-A + 2 * A * j / 10) / A; p[1] += a * a * (0.09 + li * 0.006) * hs; });
          return r;
        });
        loft(0, curtain(0.016), fur, { capB: false, capT: false });
        loft(0, curtain(0.008), '#d9d5cc', { capB: false, capT: false, down: true });
        // moustache: a fat roll over the lip, the slit below it leaves the painted mouth showing
        const mo = [[0.05, 0.05, 0.098, 0.016], [0.066, 0.056, 0.104, 0.014], [0.08, 0.044, 0.098, 0.012]].map(([y, rx, rz, zc]) => ring(8, y * hs, rx * hs * hw, rz * hs, zc * hs, 0, -1.25, 1.25));
        loft(0, mo, fur, { capB: false, capT: false });
        // elastic over the ears round the back of the head
        for (const sx of [-1, 1]) wire(0, [[sx * 0.09 * hs * hw, 0.12 * hs, 0.0], [sx * 0.094 * hs * hw, 0.135 * hs, -0.04 * hs], [sx * 0.07 * hs * hw, 0.14 * hs, -0.095 * hs], [0, 0.142 * hs, -0.112 * hs]], 0.003, '#e9c8c0');
      }, false);
      // beard states: 'on', 'slip' (k 0..1: sagging over the mouth), 'chin' (pulled down under the chin), 'eyes' (pushed
      // up over the eyes, asleep), 'ear' (hanging off one ear: the laugh on the scooter). Pivot for 'ear': the left ear.
      const ST = { on: [0, 0, 0, 0, 0, 0, 1], chin: [0, -0.058, 0.03, -0.32, 0, 0, 1.06], eyes: [0, 0.088, 0.012, -0.08, 0, 0, 1.18], slip: [0, -0.03, 0.004, 0.05, 0, 0, 1] };
      const pv = new THREE.Vector3(0.09 * hs * hw, 0.12 * hs, 0), qe = new THREE.Quaternion(), ve = new THREE.Vector3();
      bd.userData.state = (st = 'on', kk = 1) => {
        bd.userData.st = st;
        if (st === 'ear') {                   // rotate about the left ear: position = pivot - R * pivot
          bd.rotation.set(0.15, 0.25, 1.05); bd.scale.set(1, 1, 1); qe.setFromEuler(bd.rotation);
          ve.copy(pv).applyQuaternion(qe); bd.position.set(pv.x - ve.x, pv.y - ve.y, pv.z - ve.z); return;
        }
        const v = ST[st] || ST.on, k1 = st === 'slip' ? kk : 1;
        bd.position.set(v[0] * hs * k1, v[1] * hs * k1, v[2] * hs * k1); bd.rotation.set(v[3] * k1, v[4] * k1, v[5] * k1); bd.scale.set(1 + (v[6] - 1) * k1, 1, 1 + (v[6] - 1) * 0.3 * k1);
      };
      bd.userData.slip = (kk) => bd.userData.state('slip', kk);
    }
    if (has('hood')) {                        // luka40: hood up (head) / hood down (folded on the shoulders); rig.show('hood', up)
      const hc = L.hoodCol || (L.coatAtt && L.coatAtt.col) || '#26272d', hin = shade(hc, 0.4);
      att('hood_up', 'head', () => {
        const lv = [[-0.09, 0.125, 0.13, -0.03, 1.35], [-0.02, 0.118, 0.13, -0.025, 1.18], [0.06, 0.12, 0.132, -0.018, 1.05], [0.14, 0.128, 0.138, -0.018, 0.95],
          [0.21, 0.118, 0.13, -0.022, 0.8], [0.26, 0.09, 0.106, -0.026, 0.12], [0.3, 0.05, 0.065, -0.03, 0.04], [0.318, 0.012, 0.02, -0.03, 0.02]];
        const sh = (g) => lv.map(([y, rx, rz, zc, a], li) => {
          const r = ring(12, y * hs, (rx + g) * hs * hw, (rz + g) * hs, zc * hs, 0, a, TAU - a);
          if (li === 0) r.forEach((p) => { if (p[2] < 0) p[1] -= 0.08 * hs * Math.min(1, -p[2] / (0.1 * hs)); });   // the back drapes onto the shoulders
          return r;
        });
        loft(0, sh(0), [hc, 'twill'], { capB: false, capT: false });
        loft(0, sh(-0.008), hin, { capB: false, capT: false, down: true });
      }, false);
      att('hood_down', 'torso', () => {
        const hr2 = (y, rx, rz, zc) => ring(10, y, nr + rx, nr * 0.95 + rz, zc, 0, 1.25, TAU - 1.25);
        const rs = [hr2(T - 0.13, 0.1, 0.085, -0.06), hr2(T - 0.06, 0.13, 0.11, -0.07), hr2(T + 0.0, 0.12, 0.11, -0.07), hr2(T + 0.04, 0.085, 0.085, -0.055)];
        loft(TORSO, rs, (sg) => [sg === 2 ? shade(hc, 1.15) : hc, 'twill'], { capB: false, capT: false });
        loft(TORSO, rs.map((r) => r.map((p) => [p[0] * 0.95, p[1], p[2] * 0.95])), hin, { capB: false, capT: false, down: true });
      }, true);
    }
    // torso / hips worn
    if (L.scarf) att('scarf', 'torso', () => {     // wrapped once round the neck, two striped ends hanging down the front
      const sc = L.scarf, z = (y, x) => sz(x, y) + 0.018;
      loft(0, [ring(10, T - 0.035, nr + 0.035, nr * 0.95 + 0.035, -0.004), ring(10, T + 0.035, nr + 0.03, nr * 0.95 + 0.03, -0.004)], sc[0], { capB: false, capT: false });
      for (const [sx, len] of [[1, 0.34], [-1, 0.28]]) {
        const n = 6, rs = [];
        for (let i = 0; i <= n; i++) { const y = T - 0.02 - len * i / n, xc = sx * (0.04 + 0.012 * i / n); rs.push(ring(4, y, 0.04, 0.011, z(y, Math.abs(xc)) + (sx > 0 ? 0.012 : 0), xc, Math.PI / 4)); }
        loft(0, rs, (sg) => sc[sg % sc.length], { down: true });
      }
    }, true);
    const cg = L.coatAtt ? (L.coatAtt.g ?? 0.026) + 0.012 : 0;   // worn over a coat collar: clear it
    if (has('headphones_neck')) att('headphones_neck', 'torso', () => {   // round the neck: band behind, cups on the collarbones, cushions in
      loft(0, [ring(10, T + 0.012, nr + 0.05 + cg, nr + 0.038 + cg, -0.008, 0, 1.75, TAU - 1.75), ring(10, T + 0.03, nr + 0.05 + cg, nr + 0.038 + cg, -0.008, 0, 1.75, TAU - 1.75)], phonesBand);
      const rX = (x, r, yc, zc) => { const o = []; for (let i = 0; i < 10; i++) { const a = TAU * i / 10; o.push([x, yc + Math.cos(a) * r, zc + Math.sin(a) * r]); } return o; };
      for (const sx of [-1, 1]) {             // round cups, axis across the body, resting on the collarbones
        const x = sx * (nr + 0.045 + cg), y = T - 0.012, z = 0.03 + cg * 0.4, rs = [rX(x - sx * 0.018, 0.04, y, z), rX(x + sx * 0.016, 0.042, y, z), rX(x + sx * 0.02, 0.034, y, z)];
        loft(0, sx > 0 ? rs : rs.slice().reverse(), (sg) => (sg === (sx > 0 ? 0 : 1) ? phonesCol : shade(phonesCol, 0.82)));
        loft(0, sx > 0 ? [rX(x - sx * 0.024, 0.03, y, z), rX(x - sx * 0.018, 0.036, y, z)] : [rX(x - sx * 0.018, 0.036, y, z), rX(x - sx * 0.024, 0.03, y, z)], '#141416');
      }
    }, !L.phonesOff);
    if (has('headphones_held')) att('headphones_held', 'torso', () => {   // a free-standing pair the hands hold up (anims place it)
      const g = new THREE.Matrix4().makeTranslation(0, -0.12 * hs, 0); G.m[0] = g; phonesOnHead(); G.m[0] = null;
    }, false);
    if (L.coatAtt && L.coatAtt.collar !== 'funnel') att('collar_up', 'torso', () => {   // the trench collar turned up (1.2: he turns it down)
      const nrC = nr + 0.012, zt = TP[4][3], cr = (y, gg, a) => ring(10, y, nrC + gg, nrC * 0.95 + gg, zt, 0, a, TAU - a);
      const col = L.coatAtt.col, rs = [cr(T - 0.03, 0.05, 0.62), cr(T + 0.04, 0.042, 0.6), cr(T + 0.13, 0.05, 0.56)];
      loft(0, rs, [shade(col, 1.12), 'twill'], { capB: false, capT: false });
      loft(0, rs.map((r) => r.map((p) => [p[0] * 0.94, p[1], p[2] * 0.94])), shade(col, 0.5), { capB: false, capT: false, down: true });
    }, false);
    if (has('hurt')) att('torn', 'torso', () => {   // 3.5+: rips in the polo with skin showing (with face mark 'blood': rig.show('hurt'))
      const tc = shade(top, 0.55);
      const patch = (cx, cy, rx, ry, colr, off, jag) => {
        const n = 9, pts = [];
        for (let i = 0; i < n; i++) { const a = TAU * i / n, rr = 1 - jag * (i % 2 ? rnd() : rnd() * 0.3), x = cx + Math.cos(a) * rx * rr, y = cy + Math.sin(a) * ry * rr; pts.push([x, y, sz(x, y) + off]); }
        const c0 = [cx, cy, sz(cx, cy) + off];
        for (let i = 0; i < n; i++) tri(0, c0, pts[i], pts[(i + 1) % n], colr);
      };
      patch(0.07, 0.3 * k, 0.05, 0.035, tc, 0.006, 0.5); patch(0.07, 0.3 * k, 0.038, 0.025, skin, 0.008, 0.5);
      patch(-0.08, 0.16 * k, 0.03, 0.07, tc, 0.006, 0.6); patch(-0.08, 0.16 * k, 0.018, 0.055, skin, 0.008, 0.6);
      patch(-0.02, 0.06 * k, 0.04, 0.02, tc, 0.006, 0.5); patch(-0.02, 0.06 * k, 0.03, 0.012, mix(skin, '#8a3a34', 0.25), 0.008, 0.5);
    }, false);
    if (has('bandage')) att('bandage', 'torso', () => {   // 3.7: the torn polo pulled up, the ribs bound in crepe
      const wr = ['#f2efe6', 'crepe'];
      loft(0, [tRing(0.01, 0.008), tRing(0.1 * k, 0.008)], skin, { capB: false, capT: false });
      loft(0, [tRing(0.1 * k, 0.014), tRing(0.16 * k, 0.016), tRing(0.22 * k, 0.014)], (sg) => [sg ? '#e8e4da' : '#f4f1ea', 'crepe'], { capB: false, capT: false });
      loft(0, [tRing(0.215 * k, 0.012), tRing(0.25 * k, 0.03), tRing(0.285 * k, 0.012)], shade(top, 0.8), { capB: false, capT: false });
      const y = 0.13 * k, z = sz(0.05, y) + 0.018; quad(0, [0.03, y - 0.03, z], [0.07, y - 0.05, z - 0.004], [0.08, y + 0.01, z - 0.006], [0.04, y + 0.02, z], wr[0]);
    }, false);
    if (has('brick_pocket')) attP('brick_pocket', 'hips', 'brick_phone', { pocket: true }, true, [0.12, -0.03, (TP[0][2] + 0.045)], [0.08, 0.2, 0.06]);   // Rue: in the cardigan pocket
    if (has('tether')) attP('tether_pocket', 'hips', 'tether_coil', { pocket: true }, false, [-0.085, -0.04, -(0.1 * w + belly * 0.03 + 0.02)], [HP, 0, 0]);
    if (has('ukulele')) attP('ukulele', 'torso', 'ukulele', EMPTY, false, [0.02, 0.1 * k, fz(0.1 * k) + 0.06], [0, 0, 0.42]);
    if (has('box')) attP('box', 'torso', 'box', EMPTY, false, [0, 0.16 * k, fz(0.2 * k) + 0.2], [0, 0, 0]);
    if (has('walkman')) att('walkman', 'hips', () => {     // clipped at the right hip, outside any jacket hem
      const wx = -((L.coat ? Math.max(hipRx + 0.036, TP[0][1] + 0.02) : hipRx) + 0.016);
      box(0, wx, 0.0, 0.035, 0.032, 0.12, 0.085, '#8797ab'); box(0, wx - 0.017, 0.025, 0.035, 0.004, 0.035, 0.055, '#34383e'); box(0, wx - 0.006, 0.065, 0.06, 0.016, 0.012, 0.016, '#e8742a');
      box(0, wx - 0.012, -0.03, 0.02, 0.006, 0.05, 0.03, '#b9c0c8');
    }, true);
    if (L.apronText) {                        // Luke (2040): KISS THE COOK (SAFELY), painted on a decal over the apron bib
      const t = canvasTex(128, 96, (c) => {
        c.fillStyle = L.apron; c.fillRect(0, 0, 128, 96); c.fillStyle = L.apronInk || '#7a1f2a'; c.textAlign = 'center';
        const ln = L.apronText.split('|'); ln.forEach((s2, i) => { c.font = `bold ${i === ln.length - 1 && ln.length > 1 ? 15 : 22}px Arial, sans-serif`; c.fillText(s2, 64, 28 + i * 26, 122); });
      }, { key: 'apron_' + id, nearest: true });
      const y0 = 0.15 * k, y1 = 0.27 * k, x0 = -0.075, x1 = 0.075;
      att('apron_text', 'torso', () => {
        const N = 4, pt = (u, v) => { const x = x0 + (x1 - x0) * u, y = y0 + (y1 - y0) * v; return [x, y, sz(x, y) + 0.0145]; };
        for (let i = 0; i < N; i++) { const u0 = i / N, u1 = (i + 1) / N; tri(0, pt(u0, 0), pt(u1, 0), pt(u1, 1), '#ffffff', [u0, 0], [u1, 0], [u1, 1]); tri(0, pt(u0, 0), pt(u1, 1), pt(u0, 1), '#ffffff', [u0, 0], [u1, 1], [u0, 1]); }
      }, true, null, null, matTex(t));
    }
    // lanyards: a strap round the collar to a badge clip; the badge card has its own painted texture (front + back)
    const lanyard = (name, B, o) => {
      const lc = o.col || CONFIG.colors.lanyard, drop = o.drop || 0, yb = (0.24 - drop) * k, gr = o.grow || 0, R = nr + 0.036 + gr, Rz = nr * 0.95 + 0.036 + gr, a = 1.1 - gr * 2;
      const g = att(name, 'torso', () => {
        const pts = (sx) => [[sx * Math.sin(a) * R, T + 0.012, -0.004 + Math.cos(a) * Rz], [sx * (nr * 0.9 + gr), T - 0.025, sz(nr * 0.9 + gr, T - 0.025) + 0.02 + gr * 0.4],
          [sx * (0.042 + gr * 0.5), (0.36 - drop * 0.5) * k, sz(0.042, 0.36 * k) + 0.012 + gr * 0.3], [sx * 0.008, yb + 0.01, Math.max(sz(0.008, yb), fz(yb - 0.08)) + 0.014]];
        for (const sx of [-1, 1]) {
          const p = pts(sx), sc = (i) => (o.scorch && sx > 0 && i === 2 ? '#2a1c14' : o.scorch && sx > 0 && i === 1 ? shade(lc, 0.55) : lc);
          const q = (P, s2, i) => (i ? [P[0] + s2 * 0.009, P[1], P[2]] : [P[0], P[1] + s2 * 0.009, P[2]]);
          quad(0, q(p[0], -1, 0), q(p[1], -1, 0), q(p[1], 1, 0), q(p[0], 1, 0), lc); quad(0, q(p[0], 1, 0), q(p[1], 1, 0), q(p[1], -1, 0), q(p[0], -1, 0), lc);
          for (let i = 1; i < 3; i++) quad(0, q(p[i], -1, i), q(p[i + 1], -1, i), q(p[i + 1], 1, i), q(p[i], 1, i), sc(i));
        }
        loft(0, [ring(8, T + 0.004, R, Rz, -0.004, 0, a, TAU - a), ring(8, T + 0.02, R - 0.004, Rz - 0.004, -0.004, 0, a, TAU - a)], lc);
      }, o.on !== false);
      const zb = Math.max(fz(yb), fz(yb - 0.08)) + 0.016 + gr * 0.3, bt = badgeTex(B);
      const badge = new THREE.Mesh(geoOf(() => {
        box(0, 0, -0.004, 0, 0.014, 0.014, 0.008, '#b8bcc2');
        quad(0, [-0.036, -0.056, 0.0012], [0.036, -0.056, 0.0012], [0.036, -0.012, 0.0012], [-0.036, -0.012, 0.0012], '#ffffff', BUV.front);
        quad(0, [0.036, -0.056, -0.0052], [-0.036, -0.056, -0.0052], [-0.036, -0.012, -0.0052], [0.036, -0.012, -0.0052], '#ffffff', BUV.back);
        box(0, 0, -0.034, -0.002, 0.074, 0.046, 0.0056, B.edge || '#e8e8e4');
        box(0, 0, -0.066, 0, 0.01, 0.018, 0.006, '#aeb3b8'); box(0, 0, -0.078, 0, 0.004, 0.012, 0.004, '#aeb3b8');
      }), matTex(bt));
      // the two card faces map their halves of the badge texture; everything else samples its white strip
      const uv = badge.geometry.attributes.uv, n = uv.count;
      for (let i = 0; i < n; i++) uv.setXY(i, 0.5, BUV.white);
      const F = [[BUV.front, 36], [BUV.back, 42]];   // vertex offsets of the two quads (after the 6-face clip box: 36 verts)
      for (const [R2, o0] of F) { const us = [[R2[0], R2[1]], [R2[2], R2[1]], [R2[2], R2[3]], [R2[0], R2[1]], [R2[2], R2[3]], [R2[0], R2[3]]]; for (let j = 0; j < 6; j++) uv.setXY(o0 + j, us[j][0], us[j][1]); }
      uv.needsUpdate = true;
      badge.position.set(0, yb + 0.01, zb); badge.name = 'badge'; g.add(badge); g.userData.badge = badge;
      badge.userData.flip = !!B.flip; badge.rotation.y = B.flip ? Math.PI : 0;
      return g;
    };
    if (L.lanyard) lanyard('lanyard', L.badge || { name: L.lanyard }, { col: L.lanyardCol, scorch: L.lanyardScorch, on: L.lanyardOn });
    if (L.lanyard2) lanyard('lanyard2', L.lanyard2.badge, { col: L.lanyard2.col, drop: 0.05, grow: 0.012, on: false });

    for (const n of L.hide || []) if (attach[n]) attach[n].visible = false;
    const DEF = [];                           // the look's default visibility of every attachment (dress() restores it)
    for (const n in attach) if (attach[n] && attach[n].isObject3D && n !== 'gripL' && n !== 'gripR') DEF.push([attach[n], attach[n].visible]);
    if (attach.headphones_head || attach.headphones_neck) attach.headphones = attach.headphones_head || attach.headphones_neck;   // Rue's name (TWO: use the explicit two)

    // ---- the rig object
    const P = PART.map((n) => parts[n]), NB = PART.length * 3;
    const rest = { hips: parts.hips.position.clone(), armL: parts.armL.position.clone(), armR: parts.armR.position.clone() };
    const snap = new Float32Array(NB + 9);
    const d = { T, shX, upper, fore, thigh, shin, footH, hipY, neckL, hs, hipX, s, nr, chestZ: fz(0.28 * k), bellyZ: fz(0.13 * k),
      headC: T + neckL + 0.12 * hs, armY, armOut: L.armOut ?? (0.06 + belly * 0.1) };
    const shownO = [null, null, null, null], shownW = [false, false, false, false]; let nShown = 0;
    let cur = null, lastT = 0, savedExpr = null, blinkT = 1 + Math.random() * 3, blink = false, flapT = 0, fi = 0, talked = false;
    const FLAP = ['A', 'closed', 'O', 'A', 'closed', 'A', 'O', 'closed'];
    const lerpPos = (q, j, kk) => q.set(snap[j] + (q.x - snap[j]) * kk, snap[j + 1] + (q.y - snap[j + 1]) * kk, snap[j + 2] + (q.z - snap[j + 2]) * kk);
    const face = {
      canvas: fk.canvas, tex: fk.tex, expr: 'neutral', e: 'open', b: 'neutral', m: 'closed', tears: 0, over: null, marks: 0, lift: 0,
      redraw() { fk.draw(blink && face.e !== 'closed' ? 'closed' : face.e, face.b, face.over || face.m, face.tears, face.marks, face.lift); },
      set(name) { const x = EXPR[name] || EXPR.neutral; face.expr = EXPR[name] ? name : 'neutral'; face.e = x[0]; face.b = x[1]; face.m = x[2]; face.tears = x[3] || 0; face.redraw(); },
      eyes(e) { face.e = e; face.redraw(); }, brows(b) { face.b = b; face.redraw(); }, mouth(m) { face.m = m; face.redraw(); },
      flap() { face.over = FLAP[fi++ % FLAP.length]; face.redraw(); },
      // TWO: mark('blood' | 'soot' | 'bruise' | 'graze', on) paints over the face; browLift(0..1) raises his LEFT brow (Luke's suspicion)
      mark(n, on = true) { const b = MARK[n] || 0; face.marks = on ? face.marks | b : face.marks & ~b; face.redraw(); },
      browLift(v) { face.lift = Math.max(0, Math.min(1, v)); face.redraw(); },
    };
    // coat sway: a damped spring on the coat bone, driven by the root's forward / sideways speed and yaw rate
    const cs = { on: !!L.coatAtt, x: 0, z: 0, vx: 0, vz: 0, px: NaN, pz: 0, ry: 0 };
    const vis = (n, on) => { if (attach[n]) attach[n].visible = on; };
    const rig = {
      id, look: L, root, body, mesh, parts, face, attach, d, height: L.h ?? 1.78, eye: (hipY + 0.06 + T + neckL + 0.134 * hs) * s,
      seated: false, talking: false, anim: null,
      talk(on) { rig.talking = !!on; },
      update(dt) {
        if ((blinkT -= dt) <= 0) { blink = !blink; blinkT = blink ? 0.12 : 2 + Math.random() * 4; face.redraw(); }
        if (rig.talking) { talked = true; if ((flapT -= dt) <= 0) { flapT = 0.07 + Math.random() * 0.06; face.flap(); } }
        else if (talked) { talked = false; face.over = null; face.redraw(); }
        if (cs.on && dt > 0) {
          const rp = root.position, ry = root.rotation.y;
          let f = 0, l = 0, yr = 0;
          if (cs.px === cs.px) {
            const vx = (rp.x - cs.px) / dt, vz = (rp.z - cs.pz) / dt;
            let dy = ry - cs.ry; dy -= Math.round(dy / TAU) * TAU;
            if (vx * vx + vz * vz < 64) { const sn = Math.sin(ry), cn = Math.cos(ry); f = vx * sn + vz * cn; l = vx * cn - vz * sn; yr = Math.max(-6, Math.min(6, dy / dt)); }
          }
          cs.px = rp.x; cs.pz = rp.z; cs.ry = ry;
          const tx = Math.max(-0.12, Math.min(0.34, f * 0.1)), tz = Math.max(-0.22, Math.min(0.22, -l * 0.07 - yr * 0.05));
          cs.vx += ((tx - cs.x) * 55 - cs.vx * 6.5) * dt; cs.x += cs.vx * dt;
          cs.vz += ((tz - cs.z) * 55 - cs.vz * 6.5) * dt; cs.z += cs.vz * dt;
        }
      },
      // pose(name, t, p): t = seconds since this animation started. Blends from the previous pose over 0.2 s.
      pose(name, t, p = EMPTY) {
        const A = ANIMS[(name === 'idle' && L.idle) || name] || ANIMS.idle;
        if (name !== cur || t < lastT - 1e-4) {
          for (let i = 0; i < P.length; i++) { const r = P[i].rotation; snap[i * 3] = r.x; snap[i * 3 + 1] = r.y; snap[i * 3 + 2] = r.z; }
          parts.hips.position.toArray(snap, NB); parts.armL.position.toArray(snap, NB + 3); parts.armR.position.toArray(snap, NB + 6);
          for (let i = 0; i < nShown; i++) { shownO[i].visible = shownW[i]; shownO[i] = null; } nShown = 0;
          if (savedExpr) { face.set(savedExpr); savedExpr = null; }
          if (face.over && !rig.talking) { face.over = null; face.redraw(); }
          const sh = typeof A.shows === 'function' ? A.shows(rig) : A.shows;   // a name, or a list of names (TWO)
          if (sh) for (let i = 0, n = Array.isArray(sh) ? sh.length : 1; i < n && nShown < 4; i++) {
            const a = attach[Array.isArray(sh) ? sh[i] : sh]; if (a) { shownO[nShown] = a; shownW[nShown++] = a.visible; a.visible = true; }
          }
          if (A.expr) { savedExpr = face.expr; face.set(A.expr); }
          cur = rig.anim = name;
        }
        lastT = t;
        for (let i = 0; i < P.length; i++) P[i].rotation.set(0, 0, 0);
        if (attach.lanyard) { const b = attach.lanyard.userData.badge; b.rotation.set(0, b.userData.flip ? Math.PI : 0, 0); }
        if (attach.lanyard2) { const b = attach.lanyard2.userData.badge; b.rotation.set(0, b.userData.flip ? Math.PI : 0, 0); }
        rig.lying = false;
        parts.hips.position.copy(rest.hips); parts.armL.position.copy(rest.armL); parts.armR.position.copy(rest.armR);
        if (A.upper) { if (p.sit || rig.seated) ANIMS.sit(rig, t, p); else if (p.walk) ANIMS.walk(rig, t, p); }
        A(rig, t, p);
        if (L.stoop && !rig.lying) { parts.torso.rotation.x += L.stoop; parts.neck.rotation.x -= L.stoop * 0.45; parts.head.rotation.x -= L.stoop * 0.35; }
        if (cs.on && !rig.seated && !rig.lying) { parts.coat.rotation.x += cs.x; parts.coat.rotation.z += cs.z; }
        if (t < 0.2) {
          const kk = ease(t / 0.2);
          for (let i = 0; i < P.length; i++) { const r = P[i].rotation; r.set(snap[i * 3] + (r.x - snap[i * 3]) * kk, snap[i * 3 + 1] + (r.y - snap[i * 3 + 1]) * kk, snap[i * 3 + 2] + (r.z - snap[i * 3 + 2]) * kk); }
          lerpPos(parts.hips.position, NB, kk); lerpPos(parts.armL.position, NB + 3, kk); lerpPos(parts.armR.position, NB + 6, kk);
        }
      },
      // ---- TWO wardrobe API
      // show(name, on = true): toggle an attachment, or a group: 'santa' (hat + beard, beard back in place), 'hood' (up:
      // hood_up on, hood_down + ponytail off), 'hurt' (torn polo + blood at the hairline), 'chip' (light on/off),
      // 'goggles' (on the eyes) / 'goggles_up' (pushed up). Unknown names are ignored. Returns the rig.
      show(n, on = true) {
        switch (n) {
          case 'santa': vis('santa', on); vis('santa_beard', on); if (attach.santa_beard) attach.santa_beard.userData.state('on'); break;
          case 'hood': vis('hood_up', on); vis('hood_down', !on); vis('ponytail', !on); break;
          case 'hurt': vis('torn', on); face.mark('blood', on); break;
          case 'chip': if (attach.chip_light) attach.chip_light.userData.set(on ? 'on' : 'off'); break;
          case 'goggles': case 'goggles_up': vis('goggles', on); if (attach.goggles) attach.goggles.userData.up(n === 'goggles_up'); break;
          default: vis(n, on);
        }
        return rig;
      },
      badgeFlip(on, which = 'lanyard') { const l = attach[which]; if (l) l.userData.badge.userData.flip = !!on; return rig; },
      chip(st) { if (attach.chip_light) attach.chip_light.userData.set(st); return rig; },   // 'on' | 'off' | 'ping' | 'amber' | 'red' | 'dim'
      // dress(state): back to the look's defaults, then the story so far (L.dress(rig, flags, inventory)). Runs by itself
      // whenever the rig is added to a scene (every world.spawn into a set), so pooled rigs never carry a scene's toggles.
      dress(st) {
        for (let i = 0; i < DEF.length; i++) DEF[i][0].visible = DEF[i][1];
        if (attach.santa_beard) attach.santa_beard.userData.state('on');
        if (attach.goggles) attach.goggles.userData.up(L.goggles === 'up');
        if (attach.chip_light) attach.chip_light.userData.set('on');
        for (const n of ['lanyard', 'lanyard2']) if (attach[n]) attach[n].userData.badge.userData.flip = !!((n === 'lanyard' ? L.badge : L.lanyard2 && L.lanyard2.badge) || EMPTY).flip;
        if (face.marks || face.lift) { face.marks = 0; face.lift = 0; face.redraw(); }
        if (typeof L.dress === 'function') L.dress(rig, (st && st.flags) || EMPTY, (st && st.inventory) || NONE);
        return rig;
      },
    };
    root.addEventListener('added', () => { if (typeof state !== 'undefined' && state) rig.dress(state); });
    // warm-up: hidden attachments (and, on the very first rig, every drone / prop / instanced family in ART_WARM_KIT)
    // ride along as scale-0 proxies sharing their geometry + material, so the boot render compiles and uploads them
    // without drawing a pixel (the portrait stays clean); each proxy removes itself after that first render.
    const proxy = (m) => {
      const q = m.isSkinnedMesh ? new THREE.SkinnedMesh(m.geometry, m.material) : new THREE.Mesh(m.geometry, m.material);
      if (q.isSkinnedMesh) q.bind(mesh.skeleton, mesh.bindMatrix);
      q.scale.setScalar(0); q.frustumCulled = false; q.onAfterRender = () => q.removeFromParent(); root.add(q);
    };
    for (const [o, v] of DEF) if (!v) o.traverse((m) => { if (m.isMesh) proxy(m); });
    if (!kitDone && typeof ART_WARM_KIT === 'function') {
      kitDone = true;
      try { const kit = ART_WARM_KIT(); kit.scale.setScalar(0); kit.traverse((m) => { if (m.isMesh || m.isPoints) m.frustumCulled = false; });
        const first = kit.getObjectByProperty('isMesh', true); if (first) first.onAfterRender = () => kit.removeFromParent(); root.add(kit);
      } catch (e) { console.warn('TWO: art warm kit failed', e); }
    }
    face.set(L.expr || 'neutral');
    rig.pose('idle', 1, EMPTY);
    return rig;
  };
})();

// ------------------------------------------------------------ LOOKS
// h height (m), w girth, sh shoulders, belly 0..1, head size, fem, stoop (rad). top/top2 (inner shirt shown by
// open/vneck), sleeve short|long|rolled|none, collar polo|shirt|open, bottom trousers|jeans|shorts|skirt,
// shoes sneaker|shoe|loafer|boot|welly|thong, coat = hem length below the waist (baked). attach = extra attachments.
// Build extras: belly (can exceed 1), arms/thighs/hands/feet/neck/neckLen multipliers, untuck (shirt tail length),
// lapels, sleeveW (baggy sleeves), topTex tweed|knit|plaid|twill (painted garment texture); jeans get denim + faded knees.
// Face: eyes (iris), brow, browW, lips, blush, freckles, age 0..1, tired, lids (heavy lids 0..1), lash, headW, jaw, nose,
// beard full|short|stubble (+ beardGrey 0..1), moustache (colour), hairGrey 0..1, scar 'jawR', rednose.
// hairStyle short|messy|shaggy|slick|tidy|ponytail|bald|bun|set|big|long|bob|curly|mullet|crop|cap|none.
// TWO wardrobe (see buildCharacter): coatAtt {col, len, collar 'trench'|'funnel', lapels, belt, pockets, notes, gap}
// (a skinned, throwable coat with sway), glovesAtt (colour), tailSep (ponytail as its own mesh, so a hood hides it),
// chip / antlers (booleans), goggles 'on'|'up', glassesUp, lanyard + lanyardCol + lanyardScorch + badge {name, sub,
// style 'yes'|'hq', band, fade, scorch, back, flip}, lanyard2 {col, badge}, phonesCol/phonesBand, phonesOff,
// earbudOff, apronText ('LINE|LINE'), apronInk, tongs, food 'pie'|'bar'|'snag', scarHand 'R'.
// attach: brick, remote, slate, tether (hand + back pocket), coaster, notepad (+ biro), food, cracker, box, ukulele,
// santa (hat + beard), hood (up/down), hurt (torn polo), bandage, goggles, earbud, chip, antlers, headphones_head,
// headphones_neck, headphones_held, brick_pocket. dress(rig, flags, inventory): story state applied at every spawn.
(() => {
  const polo = { top: CONFIG.colors.polo, sleeve: 'short', collar: 'polo', logo: 'yes_black' };
  const blue = { top: CONFIG.colors.chaseBlue, sleeve: 'short', collar: 'polo', logo: 'yes_blue' };
  const HQ = '#2a4f8f';                                  // Optus HQ lanyards
  const hq = (name, sub) => ({ lanyard: name, lanyardCol: HQ, badge: { name, sub, style: 'hq' } });
  const crew = ['phone', 'goggles', 'food', 'cracker'];  // what every hero may need in a hand (hidden until shown)
  // Luka's fake-eyes props etc. are hidden until content shows them; story flags re-dress pooled rigs at every spawn:
  // santa (Luka's disguise), headphones (Chase, from L12), chip_off (Chase (2040)), hurt / bandaged / lanyard_snapped
  // (Luka in 3.5 / 3.7), and the inventory (the tether in Chase's back pocket, Nadia's lanyard round Luka's neck).
  Object.assign(LOOKS, {
    luka: { ...polo, h: 1.78, w: 1.3, sh: 1.08, belly: 1.25, head: 1.0, neck: 1.3, neckLen: 0.7, jaw: 1.12, arms: 1.28, thighs: 1.12, hands: 1.12, feet: 1.08, armOut: 0.2, untuck: 0.07,
      skin: '#dfae8c', hair: '#4b3121', hairStyle: 'ponytail', beard: 'full', beardCol: '#3d2819', brow: '#35231a', browW: 3.2, eyes: '#4a3222',
      pants: '#141519', shoes: 'sneaker', shoeCol: '#16171b', soleCol: '#f1f1ef', toeCol: '#f1f1ef',
      lanyard: 'LUKA', lanyardCol: '#82aac4', badge: { name: 'LUKA', fade: 0.55, back: '1158' },   // 39 years in Rue's box: faded; biro on the back
      lanyard2: { col: HQ, badge: { name: 'NADIA', sub: 'NETWORK SAFETY', style: 'hq' } },
      attach: [...crew, 'santa', 'brick', 'remote', 'coaster', 'notepad', 'box', 'hurt', 'bandage'],
      dress: (r, f, inv) => { if (f.santa) r.show('santa'); if (f.hurt) r.show('hurt'); if (f.bandaged) r.show('bandage'); if (f.lanyard_snapped) r.show('lanyard', false); if (inv.includes('nadia_lanyard')) r.show('lanyard2'); } },
    chase: { ...blue, h: 1.8, w: 0.88, sh: 1, head: 1, headW: 0.95, jaw: 0.92, untuck: 0.05, thighs: 1.04, skin: '#ebba95', hair: '#5d3c22', hairStyle: 'messy', beard: 'stubble', beardCol: '#6a4a30',
      eyes: '#5d4a31', brow: '#4a301c', blush: 0.08, bottom: 'jeans', pants: '#46679d', fade: '#6282b4', shoes: 'sneaker', shoeCol: '#f3f3f1', soleCol: '#dcdcd8',
      lanyard: 'CHASE', lanyardCol: CONFIG.colors.lanyard, badge: { name: 'CHASE' },   // finally: bright and new
      phonesCol: '#ecebe7', phonesBand: '#9a9ea6', phonesOff: true,                // the big over-ear pair from the L12 archive
      attach: [...crew, 'earbud', 'headphones_head', 'headphones_neck', 'headphones_held', 'tether', 'brick', 'remote', 'coaster', 'slate', 'box', 'notepad'],
      dress: (r, f, inv) => { if (f.headphones) r.show('headphones_neck'); if (inv.includes('tether')) r.show('tether_pocket'); } },
    chase40: { ...blue, h: 1.8, w: 0.9, sh: 1.02, head: 1, headW: 0.95, jaw: 0.94, untuck: 0.05, thighs: 1.04, skin: '#e2b08e', hair: '#5a4433', hairGrey: 0.4, hairStyle: 'shaggy',
      beard: 'stubble', beardCol: '#6e6156', beardGrey: 0.7, eyes: '#5d4a31', brow: '#4f3a2a', tired: true, lids: 0.32, age: 0.35,
      bottom: 'jeans', pants: '#4d5f7e', fade: '#6c7c98', shoes: 'sneaker', shoeCol: '#8d8f93', soleCol: '#c9c9c4', scarHand: 'R',
      coatAtt: { col: '#a8865a', len: 0.66, collar: 'trench', belt: true, pockets: true, notes: true },   // the battered tan trench
      chip: true, lanyard: 'CHASE', lanyardCol: '#5c95b2', lanyardScorch: true, badge: { name: 'CHASE', sub: 'SENIOR CASUAL', fade: 0.3, scorch: true },
      phonesCol: '#26272b', phonesBand: '#5a5e66', earbudOff: true,                // never on his ears
      attach: [...crew, 'headphones_neck', 'brick', 'slate', 'remote', 'earbud', 'coaster'],
      dress: (r, f) => { if (f.chip_off) r.chip('off'); } },
    luka40: { h: 1.78, w: 1.22, sh: 1.08, belly: 0.9, neck: 1.25, neckLen: 0.72, jaw: 1.1, arms: 1.22, thighs: 1.1, hands: 1.1, feet: 1.08, armOut: 0.14,
      skin: '#d8a585', hair: '#5d4a3d', hairGrey: 0.7, hairStyle: 'ponytail', tailSep: true, beard: 'short', beardCol: '#584638', beardGrey: 0.7, brow: '#43342a', browW: 3.2, eyes: '#4a3222',
      scar: 'jawR', tired: true, lids: 0.38, age: 0.45, expr: 'still', idle: 'still',
      top: '#1b1c20', sleeve: 'long', collar: 'shirt', collarCol: '#1b1c20', pants: '#17181c', shoes: 'boot', shoeCol: '#141416', soleCol: '#232326',
      coatAtt: { col: '#26272d', len: 0.72, collar: 'funnel', lapels: false, gap: 0.36, lining: '#141519', sleeveW: 1.26 }, glovesAtt: '#141417', hoodCol: '#26272d',
      lanyard: 'LUKA', lanyardCol: '#a9c4d3', badge: { name: 'LUKA', fade: 0.85, back: '1158', flip: true },   // fourteen years paler, flipped
      phonesCol: '#ecebe7', phonesBand: '#9a9ea6', earbudOff: true,             // Chase's L12 pair (3.6) / Chase (2040)'s earbud (A1)
      attach: ['hood', 'headphones_head', 'earbud', 'phone'] },
    jordan: { expr: 'talk', ...blue, h: 1.72, w: 0.92, skin: '#8d5b3c', hair: '#1d1512', hairStyle: 'curly', eyes: '#3a2618', brow: '#1d1512', blush: 0.1,
      pants: '#c8b58f', shoes: 'sneaker', shoeCol: '#f3f3f1', soleCol: '#dcdcd8', lanyard: 'JORDAN', badge: { name: 'JORDAN' }, attach: ['phone'] },
    jordan40: { ...blue, h: 1.72, w: 0.98, belly: 0.35, skin: '#8a5a3c', hair: '#221915', hairGrey: 0.5, hairStyle: 'curly', beard: 'stubble', beardCol: '#2a1f18', beardGrey: 0.5, eyes: '#3a2618', brow: '#2a1d16', age: 0.35, lids: 0.12, blush: 0.08,
      pants: '#b8a680', shoes: 'sneaker', shoeCol: '#2a2c33', soleCol: '#dcdcd8', chip: true,
      lanyard: 'JORDAN', lanyardCol: CONFIG.colors.navy, badge: { name: 'JORDAN', sub: 'STORE MANAGER' }, attach: ['phone'] },
    luke: { ...polo, h: 1.83, w: 1.02, skin: '#e9bb9b', hair: '#8a6440', hairStyle: 'short', eyes: '#5a6f8a', brow: '#6a4a30', tired: true, lids: 0.2,
      pants: '#2b2d33', shoes: 'shoe', shoeCol: '#1a1a1a', lanyard: 'LUKE', badge: { name: 'LUKE', sub: 'STORE MANAGER' }, mug: 'mug', mugCol: '#f2efe8', idle: 'carry_mug', attach: ['phone'] },
    luke40: { h: 1.82, w: 1.08, belly: 0.45, skin: '#e89c7a', blush: 0.45, age: 0.6, hair: '#b5a693', hairStyle: 'short', eyes: '#5a6f8a', brow: '#9a8a76', lids: 0.1, expr: 'happy',
      top: '#7a2033', sleeve: 'short', apron: '#f2eee4', apronText: 'KISS THE COOK|(SAFELY)', apronInk: '#9a2230', bottom: 'shorts', pants: '#3e4450', socks: '#e4e0d6',
      shoes: 'sneaker', shoeCol: '#e8e8e4', soleCol: '#c8c8c4', tongs: true, attach: ['food'], food: 'snag' },
    rue: { h: 1.77, w: 0.98, stoop: 0.07, skin: '#e6bca0', hair: '#f0eeea', hairStyle: 'tidy', brow: '#d8d6d0', browW: 3.6, eyes: '#4f6e8a', age: 1, lids: 0.18,
      glasses: 'reading', glassesUp: true, topTex: 'knit', top: '#b9a37a', top2: '#dfe8f2', open: true, buttons: 1, buttonCol: '#6a5038', sleeve: 'long', collar: 'shirt', collarCol: '#dfe8f2',
      coat: 0.16, pants: '#86847e', shoes: 'loafer', shoeCol: '#5a3a24', attach: ['brick_pocket', 'brick', 'mug'], mugCol: '#f0ede6' },
    teddy: { topTex: 'knit', h: 1.68, w: 0.92, stoop: 0.15, armOut: 0.1, skin: '#e2b49a', blush: 0.22, age: 1, hair: '#e6e2da', hairStyle: 'cap', brow: '#d0ccc4', browW: 3.8, eyes: '#5a6a7a', lids: 0.3,
      top: '#7a4a3a', top2: '#e8e0cc', open: true, buttons: 1, buttonCol: '#3a2a20', sleeve: 'long', collar: 'shirt', collarCol: '#e8e0cc', coat: 0.14, pants: '#5a5650', shoes: 'shoe', shoeCol: '#3a2a20',
      cap: 'porter', capCol: '#1f2a44' },
    mia: { fem: true, h: 1.62, w: 0.86, head: 1.02, skin: '#f0c8a8', freckles: true, hair: '#8a5a3a', hairStyle: 'long', lips: '#c07070', lash: true, eyes: '#5a7a5a', brow: '#6a4a30', blush: 0.15,
      cap: 'beanie', capCol: '#c8742a', topTex: 'plaid', top: '#a8392e', top2: '#2a2a2e', open: true, sleeve: 'long', sleeveW: 1.3, untuck: 0.14,
      bottom: 'jeans', pants: '#2a2c34', fade: '#3a3e4a', shoes: 'sneaker', shoeCol: '#e8e4dc', soleCol: '#cfcfcf', chip: true, attach: ['ukulele'] },
    nadia: { fem: true, h: 1.66, w: 0.94, skin: '#c99a78', hair: '#2a1f1a', hairGrey: 0.25, hairStyle: 'bob', lips: '#a05a5a', lash: true, eyes: '#4a3a2a', brow: '#2a1f1a', tired: true, lids: 0.3, age: 0.3,
      topTex: 'knit', top: '#5f6e6a', top2: '#e8e4dc', open: true, buttons: 1, sleeve: 'long', collar: 'shirt', collarCol: '#e8e4dc', coat: 0.14, pants: '#2e3240', shoes: 'shoe', shoeCol: '#1e1e22',
      ...hq('NADIA', 'NETWORK SAFETY'), antlers: true, chip: true },
    jayden: { h: 1.82, w: 1.12, belly: 0.2, arms: 1.15, skin: '#c98a5f', hair: '#4a3020', hairStyle: 'crop', beard: 'stubble', beardCol: '#3a2418', eyes: '#4a5a3a', brow: '#3a2416',
      top: '#ff7b1c', hivis: true, sleeve: 'short', collar: 'polo', bottom: 'shorts', pants: '#3e4450', socks: '#c9c4b8', shoes: 'boot', shoeCol: '#8a5a2b', toeCol: '#9aa0a6',
      cap: 'cap', capCol: '#2c3440', sunnies: 'cap', chip: true, food: 'bar' },
    hr: { fem: true, h: 1.7, w: 0.92, skin: '#e8bf9e', hair: '#6a3a22', hairStyle: 'bun', lips: '#b0505a', lash: true, eyes: '#4a5a6a', brow: '#4a2a1a', blush: 0.12, expr: 'happy',
      lapels: true, top: '#1f2a4a', top2: '#f4f4f0', open: true, sleeve: 'long', cuff: '#f4f4f0', collar: 'shirt', collarCol: '#f4f4f0', coat: 0.12, bottom: 'skirt', pants: '#1f2a4a', skirtLen: 0.5, legCol: '#c9a088',
      shoes: 'shoe', shoeCol: '#1a1a1a', ...hq('MEL', 'PEOPLE & CULTURE'), antlers: true, chip: true, attach: ['notepad'] },
    desk: { h: 1.76, w: 1.0, skin: '#b07a55', hair: '#1e1612', hairStyle: 'crop', eyes: '#2a1a12', brow: '#1e1612', expr: 'happy',
      top: '#f2f2ee', sleeve: 'long', collar: 'shirt', tie: '#2a4f8f', pants: '#2a2e3a', shoes: 'shoe', shoeCol: '#1a1a1a', ...hq('DEV', 'FRONT DESK'), antlers: true, chip: true },
    passenger: { h: 1.74, w: 1.08, belly: 0.5, skin: '#dca888', age: 0.7, hair: '#bdbab4', hairStyle: 'bald', moustache: '#c8c4bc', eyes: '#5a6a7a', brow: '#a8a49c',
      top: '#4a6a4a', sleeve: 'short', collar: 'polo', pants: '#6a6458', shoes: 'shoe', shoeCol: '#3a2a20', chip: true },
    priya: { fem: true, h: 1.62, w: 0.9, skin: '#a8714f', hair: '#140f0d', hairStyle: 'long', lips: '#8a3a3a', lash: true, eyes: '#2a1a12', brow: '#140f0d', blush: 0.1,
      topTex: 'knit', top: '#c88a2e', top2: '#f0ece2', vneck: true, sleeve: 'long', pants: '#2a2e3a', shoes: 'shoe', shoeCol: '#1a1a1a', ...hq('PRIYA', 'BILLING'), antlers: true, chip: true },
    // 2026 Redcliffe customers: shorts, thongs, sunnies on heads (Rue's customer_a-d)
    cust26_a: { h: 1.79, w: 1.08, belly: 0.4, skin: '#d59a70', hair: '#6a4a2e', hairStyle: 'crop', beard: 'stubble', top: '#2f6fb0', sleeve: 'none', bottom: 'shorts', pants: '#c8b58f', shoes: 'thong', shoeCol: '#1a1a1a', soleCol: '#1a1a1a', sunnies: 'head' },
    cust26_b: { fem: true, h: 1.66, w: 0.94, skin: '#e8b48e', hair: '#c8a060', hairStyle: 'long', lips: '#c0606a', lash: true, top: '#f07a8a', sleeve: 'none', bottom: 'skirt', pants: '#f07a8a', skirtLen: 0.42, shoes: 'thong', shoeCol: '#e8d8b0', soleCol: '#e8d8b0', sunnies: 'head' },
    cust26_c: { h: 1.74, w: 1.05, belly: 0.5, skin: '#e0a888', age: 0.7, beard: 'stubble', beardCol: '#a0a0a0', hair: '#b0b0b0', hairStyle: 'cap', top: '#e8e0cc', sleeve: 'short', collar: 'polo', bottom: 'shorts', pants: '#5a6a50', shoes: 'sneaker', shoeCol: '#f0f0f0', soleCol: '#ccc', cap: 'cap', capCol: '#e4e4e0' },
    cust26_d: { h: 1.7, w: 0.86, head: 1.03, skin: '#b87a55', hair: '#3a2616', hairStyle: 'messy', top: '#2a2a2a', sleeve: 'short', bottom: 'shorts', pants: '#3a4a6a', shoes: 'thong', shoeCol: '#2a6ad0', soleCol: '#2a6ad0' },
    // 2040 Redcliffe locals: the same town, a blue light behind every ear
    local40_a: { fem: true, h: 1.68, w: 0.95, skin: '#e8bc9c', hair: '#3a2a22', hairStyle: 'bob', lips: '#b06070', lash: true, top: '#e8e4f0', sleeve: 'short', bottom: 'skirt', pants: '#5a6a8a', skirtLen: 0.5, shoes: 'shoe', shoeCol: '#e8e8e8', chip: true, expr: 'still' },
    local40_b: { h: 1.8, w: 1.1, belly: 0.4, skin: '#c48862', hair: '#2a1e16', hairStyle: 'crop', beard: 'stubble', top: '#5a8ab0', sleeve: 'short', collar: 'polo', bottom: 'shorts', pants: '#d0c4a4', shoes: 'thong', shoeCol: '#1a1a1a', soleCol: '#1a1a1a', chip: true },
    local40_c: { topTex: 'knit', h: 1.7, w: 1.0, stoop: 0.1, skin: '#e2b498', age: 0.95, hair: '#dcd8d0', hairStyle: 'bald', moustache: '#d4d0c8', top: '#8a9a7a', top2: '#ece6d4', vneck: true, sleeve: 'long', pants: '#6a6a66', shoes: 'shoe', shoeCol: '#3a2a20', chip: true },
    local40_d: { h: 1.66, w: 0.84, head: 1.04, skin: '#9a6648', hair: '#1a1210', hairStyle: 'curly', top: '#2a2a30', hood: '#262630', sleeve: 'long', bottom: 'shorts', pants: '#5a5a62', shoes: 'sneaker', shoeCol: '#e83a3a', soleCol: '#f0f0f0', chip: true },
    local40_e: { fem: true, h: 1.64, w: 1.0, belly: 0.3, skin: '#f0caa8', hair: '#c89a5a', hairStyle: 'set', age: 0.55, lips: '#b06070', top: '#f0a0b8', sleeve: 'short', bottom: 'shorts', pants: '#e8e4d8', shoes: 'sneaker', shoeCol: '#f0f0f0', chip: true, sunnies: 'head' },
    local40_f: { h: 1.85, w: 0.92, skin: '#d8a07a', hair: '#7a5a3a', hairStyle: 'messy', top: '#f2f2ee', sleeve: 'none', bottom: 'shorts', pants: '#2a6a8a', shoes: 'thong', shoeCol: '#2a2a2a', soleCol: '#2a2a2a', chip: true, sunnies: 'head' },
    // Optus HQ staff on Christmas Eve: antlers, chip lights, lanyards, a few in safety goggles (the 3.1 recipients)
    staff_a: { h: 1.8, w: 1.04, skin: '#e8bc9a', hair: '#7a5a3a', hairStyle: 'short', beard: 'stubble', top: '#e8eef6', sleeve: 'long', collar: 'shirt', pants: '#3a3e4a', shoes: 'shoe', shoeCol: '#1a1a1a', ...hq('TOM', 'COMPLIANCE'), antlers: true, chip: true, expr: 'happy' },
    staff_b: { fem: true, h: 1.6, w: 0.9, skin: '#e2b896', hair: '#141010', hairStyle: 'bob', lips: '#a04a5a', lash: true, topTex: 'knit', top: '#c84a4a', sleeve: 'long', pants: '#2a2a32', shoes: 'shoe', shoeCol: '#1a1a1a', ...hq('WEN', 'NETWORK SAFETY'), antlers: true, chip: true, goggles: 'on', expr: 'happy' },
    staff_c: { h: 1.84, w: 1.2, belly: 0.7, skin: '#e6b496', hair: '#a87a4a', hairStyle: 'bald', beard: 'full', beardCol: '#9a6a3a', top: '#3a5a8a', sleeve: 'short', collar: 'polo', pants: '#5a5a5a', shoes: 'shoe', shoeCol: '#2a2a2a', ...hq('GAZ', 'FACILITIES'), antlers: true, chip: true, rednose: true },
    staff_d: { fem: true, h: 1.72, w: 0.96, skin: '#8a5a3c', hair: '#1d1512', hairStyle: 'curly', lips: '#7a3a3a', lash: true, lapels: true, top: '#4a4a52', top2: '#f0f0ec', open: true, sleeve: 'long', collar: 'shirt', coat: 0.12, pants: '#4a4a52', shoes: 'shoe', shoeCol: '#1a1a1a', ...hq('KIM', 'LEGAL'), antlers: true, chip: true, goggles: 'up' },
    staff_e: { h: 1.75, w: 0.9, skin: '#c4946a', hair: '#2a1e16', hairStyle: 'slick', top: '#f0f0ec', sleeve: 'short', collar: 'shirt', tie: '#c8202a', pants: '#2a2e3a', shoes: 'shoe', shoeCol: '#1a1a1a', ...hq('RAJ', 'BILLING'), antlers: true, chip: true, goggles: 'on' },
    staff_f: { fem: true, h: 1.68, w: 1.02, belly: 0.3, skin: '#f0d0b8', freckles: true, hair: '#b8582a', hairStyle: 'long', lips: '#b05a5a', lash: true, topTex: 'knit', top: '#2a6a4a', sleeve: 'long', bottom: 'skirt', pants: '#2a2a2a', skirtLen: 0.5, legCol: '#3a3a3a', shoes: 'boot', shoeCol: '#1a1a1a', ...hq('SAL', 'PEOPLE & CULTURE'), antlers: true, chip: true, rednose: true },
    // the Valley at night, Quiet Hours: going-out clothes, a dressing gown in the NAP CLUB queue, everyone whispering
    whisper_a: { topTex: 'knit', h: 1.76, w: 1.06, belly: 0.4, skin: '#e2b496', hair: '#4a3a2a', hairStyle: 'messy', beard: 'stubble', top: '#7a5a8a', coat: 0.5, belt: '#6a4a7a', sleeve: 'long', sleeveW: 1.2, bottom: 'shorts', pants: '#3a3a4a', shoes: 'thong', shoeCol: '#3a3a3a', soleCol: '#3a3a3a', chip: true, expr: 'tired' },
    whisper_b: { fem: true, h: 1.66, w: 0.9, skin: '#f0c8a8', hair: '#d8b070', hairStyle: 'long', lips: '#c0505a', lash: true, top: '#1a1a1e', sleeve: 'none', bottom: 'skirt', pants: '#1a1a1e', skirtLen: 0.4, legCol: '#e8bc9c', shoes: 'shoe', shoeCol: '#c8202a', chip: true },
    whisper_c: { h: 1.78, w: 0.92, skin: '#7a4a32', hair: '#120d0b', hairStyle: 'crop', top: '#3a3a42', hood: '#34343c', zip: '#1a1a1a', sleeve: 'long', bottom: 'jeans', pants: '#222630', fade: '#323848', shoes: 'sneaker', shoeCol: '#f0f0f0', soleCol: '#ddd', chip: true },
    whisper_d: { topTex: 'knit', h: 1.72, w: 1.02, stoop: 0.06, skin: '#e6c0a4', age: 0.8, hair: '#c8c4bc', hairStyle: 'short', glasses: 'reading', top: '#4a5a3a', top2: '#e0dccc', open: true, buttons: 1, sleeve: 'long', collar: 'shirt', coat: 0.14, pants: '#4a4a4a', shoes: 'shoe', shoeCol: '#3a2a20', chip: true },
    whisper_e: { fem: true, h: 1.62, w: 0.96, skin: '#c8946e', hair: '#2a1a12', hairStyle: 'bun', lips: '#9a4a4a', lash: true, top: '#f0b8c8', topTex: 'knit', sleeve: 'long', pants: '#f0b8c8', shoes: 'thong', shoeCol: '#f0f0f0', soleCol: '#f0f0f0', chip: true, expr: 'sleep' },
    whisper_f: { h: 1.82, w: 1.0, skin: '#e8c0a0', hair: '#c8a060', hairStyle: 'slick', top: '#2a3a5a', zip: '#c8c8c8', sleeve: 'long', sleeveW: 1.25, bottom: 'jeans', pants: '#1a1e28', shoes: 'boot', shoeCol: '#3a2a20', chip: true },
    // the Shorncliffe train in the storm
    passenger_a: { h: 1.8, w: 1.0, skin: '#d8a888', hair: '#3a2a20', hairStyle: 'short', top: '#2a5a8a', hood: '#24527e', zip: '#1a1a1a', sleeve: 'long', pants: '#3a3a40', shoes: 'shoe', shoeCol: '#1a1a1a', chip: true },
    passenger_b: { fem: true, h: 1.68, w: 0.92, skin: '#e8c0a0', hair: '#1a1210', hairStyle: 'bob', lips: '#a04a5a', lash: true, lapels: true, top: '#5a4a5a', top2: '#f0ece8', open: true, sleeve: 'long', coat: 0.3, buttons: 1, bottom: 'skirt', pants: '#2a2a2e', skirtLen: 0.5, legCol: '#3a3030', shoes: 'boot', shoeCol: '#1a1a1a', chip: true },
    passenger_c: { h: 1.68, w: 0.84, head: 1.04, skin: '#a87050', hair: '#1a1210', hairStyle: 'messy', top: '#c8c8c0', sleeve: 'short', bottom: 'shorts', pants: '#2a2a32', shoes: 'sneaker', shoeCol: '#2a2a2a', soleCol: '#f0f0f0', chip: true, attach: ['headphones_neck'], phonesCol: '#3a7ac8' },
    passenger_d: { topTex: 'knit', fem: true, h: 1.56, w: 0.96, stoop: 0.12, skin: '#f0d0bc', blush: 0.2, age: 1, hair: '#e8e4dc', hairStyle: 'set', lips: '#b07080', top: '#4a7a9a', top2: '#f0ece4', vneck: true, sleeve: 'long', bottom: 'skirt', pants: '#5a5a6a', skirtLen: 0.55, legCol: '#d8c0b0', shoes: 'shoe', shoeCol: '#3a2e2a', chip: true, glasses: 'reading' },
    // Sandgate sizzle queue (2040 locals): a tradie, a mum, an old man with a dog lead and no dog, a teen, netball kit
    sizzle_a: { h: 1.8, w: 1.1, belly: 0.4, skin: '#c88a60', hair: '#5a3a22', hairStyle: 'cap', top: '#e8c020', hivis: true, sleeve: 'short', bottom: 'shorts', pants: '#2e3a4a', socks: '#bdb7aa', shoes: 'boot', shoeCol: '#7a5030', cap: 'cap', capCol: '#e8e4dc', chip: true },
    sizzle_b: { fem: true, h: 1.66, w: 0.96, skin: '#e8bc98', hair: '#8a5a2a', hairStyle: 'bun', lips: '#b0606a', top: '#7ac0b0', sleeve: 'short', bottom: 'shorts', pants: '#3a4a6a', shoes: 'sneaker', shoeCol: '#f0f0f0', soleCol: '#ddd', chip: true, sunnies: 'head' },
    sizzle_c: { h: 1.7, w: 1.0, stoop: 0.12, skin: '#e0b090', age: 0.9, hair: '#e0dcd4', hairStyle: 'cap', top: '#d8d0b8', sleeve: 'short', collar: 'shirt', bottom: 'shorts', pants: '#7a7462', socks: '#f0ece0', shoes: 'shoe', shoeCol: '#4a3a2a', cap: 'flat', capCol: '#6a6050', chip: true },
    sizzle_d: { h: 1.72, w: 0.84, head: 1.03, skin: '#e8b890', freckles: true, hair: '#c87a3a', hairStyle: 'messy', top: '#3a3a3a', sleeve: 'short', bottom: 'shorts', pants: '#7a7a7a', shoes: 'sneaker', shoeCol: '#2a2a2a', soleCol: '#f0f0f0', chip: true },
    sizzle_e: { fem: true, h: 1.74, w: 0.94, skin: '#8a5a3e', hair: '#1a1210', hairStyle: 'bun', lips: '#7a3a3a', top: '#1e3a8a', sleeve: 'none', bottom: 'skirt', pants: '#1e3a8a', skirtLen: 0.36, socks: '#f0f0f0', shoes: 'sneaker', shoeCol: '#f0f0f0', soleCol: '#ddd', chip: true },
    kid40: { h: 1.24, w: 0.82, head: 1.16, leg: 0.92, skin: '#e8bc98', freckles: true, blush: 0.2, hair: '#8a5a2a', hairStyle: 'messy', top: '#e8402a', sleeve: 'short', bottom: 'shorts', pants: '#2a4a8a', shoes: 'sneaker', shoeCol: '#3a8ae8', soleCol: '#f0f0f0' },
  });
})();

// ------------------------------------------------------------ ANIMS
// RIGKIT: the IK + pose helpers (arm, leg, ik, toTorso, blend2, towards, ...) for content anims written outside this file.
// ANIM_ONE: default durations of the one-shot anims (TWO's; the world's ONE table has Rue's).
let RIGKIT = null;
const ANIM_ONE = { tether_throw: 0.7, chip_ping: 0.9, coat_throw: 0.9, put_headphones_on: 2.2, get_up_hurt: 3.2, brush_shoulder: 1, pull_cracker: 1.6, stumble: 0.35, bow: 1.8, hands_halt: 2.8 };
// ANIMS[name](rig, t, p): writes rotations (and hips/shoulder offsets) into rig.parts; no allocation.
// rig.pose() resets to rest first, then blends. Flags: .upper (arms/head only: keeps a seated lower body when
// rig.seated or p.sit, walking legs with p.walk), .shows (attachment made visible while playing), .expr.
// One-shots read p.dur. Useful p: speed (walk/run/pedal), h (seat/saddle height m), yaw (glance), still (lanyard).
Object.assign(ANIMS, (() => {
  const S = Math.sin, C = Math.cos, PI = Math.PI, abs = Math.abs, max = Math.max, min = Math.min;
  const cl = (v, a, b) => (v < a ? a : v > b ? b : v), ez = (x) => x * x * (3 - 2 * x);
  const _d = new THREE.Vector3(), _u = new THREE.Vector3(), _p = new THREE.Vector3(), _x = new THREE.Vector3(), _z = new THREE.Vector3(), _m = new THREE.Matrix4();
  // two-bone IK: aim `up` so the end of `lo` lands on (tx,ty,tz) in up's parent space; pole = elbow/knee hint
  function ik(up, lo, tx, ty, tz, a, b, px, py, pz, knee) {
    const o = up.position;
    _d.set(tx - o.x, ty - o.y, tz - o.z);
    const dist = cl(_d.length(), abs(a - b) + 0.01, (a + b) * 0.998);
    _d.normalize();
    const al = Math.acos(cl((a * a + dist * dist - b * b) / (2 * a * dist), -1, 1));
    const bend = PI - Math.acos(cl((a * a + b * b - dist * dist) / (2 * a * b), -1, 1));
    _p.set(px, py, pz).addScaledVector(_d, -_p.dot(_d)).normalize();
    _u.copy(_d).multiplyScalar(C(al)).addScaledVector(_p, S(al));
    _z.copy(_d).addScaledVector(_u, -_d.dot(_u)).normalize();
    if (knee) _z.negate();
    _u.negate();                                   // bone +Y points back up the limb
    _x.crossVectors(_u, _z);
    up.rotation.setFromRotationMatrix(_m.makeBasis(_x, _u, _z));
    lo.rotation.set(knee ? bend : -bend, 0, 0);
  }
  // arm target in torso space (sd +1 = left). Default pole: elbow down, back, out.
  const arm = (r, sd, x, y, z, px = 0.5, py = -1, pz = -0.4) => ik(sd > 0 ? r.parts.armL : r.parts.armR, sd > 0 ? r.parts.foreL : r.parts.foreR, sd * x, y, z, r.d.upper, r.d.fore, sd * px, py, pz, false);
  // ankle target in hips space
  const leg = (r, sd, x, y, z, pz = 1) => ik(sd > 0 ? r.parts.legL : r.parts.legR, sd > 0 ? r.parts.shinL : r.parts.shinR, sd * x, y, z, r.d.thigh, r.d.shin, 0, 0.3, pz, true);
  const flat = (r) => { const P = r.parts; P.footL.rotation.x = -(P.legL.rotation.x + P.shinL.rotation.x); P.footR.rotation.x = -(P.legR.rotation.x + P.shinR.rotation.x); };
  function hang(r, t = 0) {
    const P = r.parts, o = r.d.armOut, sw = 0.03 * S(t * 1.1);
    P.armL.rotation.set(sw, 0, o); P.armR.rotation.set(-sw, 0, -o); P.foreL.rotation.x = -0.14; P.foreR.rotation.x = -0.14;
  }
  const breathe = (r, t, a = 1) => { r.parts.torso.rotation.x += 0.018 * S(t * 1.6) * a; r.parts.head.rotation.x -= 0.012 * S(t * 1.6) * a; };
  const base = (r, t) => { if (!r.seated) hang(r, t); breathe(r, t); };
  const once = (t, p, def) => cl(t / (p.dur || def), 0, 1);
  const hipsY = (r, m) => m / r.d.s;              // world metres -> body units
  const gait = (r, t, sp, legA, knee, armA, fore, bob, lean) => {
    const P = r.parts, st = r.look.bottom === 'skirt' ? 0.7 : r.look.stoop ? 0.75 : 1, w = t * sp, s = S(w), c = C(w);
    r.seated = false; r.floorSit = false;
    P.legL.rotation.x = -legA * s * st; P.legR.rotation.x = legA * s * st;
    P.shinL.rotation.x = 0.08 + knee * max(0, c) * st; P.shinR.rotation.x = 0.08 + knee * max(0, -c) * st;
    P.footL.rotation.x = -0.25 * max(0, -s) * st + 0.15 * max(0, c); P.footR.rotation.x = -0.25 * max(0, s) * st + 0.15 * max(0, -c);
    P.armL.rotation.set(armA * s, 0, r.d.armOut); P.armR.rotation.set(-armA * s, 0, -r.d.armOut);
    P.foreL.rotation.x = fore - 0.2 * max(0, -s); P.foreR.rotation.x = fore - 0.2 * max(0, s);
    P.hips.position.y += bob * C(2 * w) - bob; P.hips.rotation.y = 0.08 * s; P.torso.rotation.set(lean, -0.13 * s, 0); P.head.rotation.y = 0.06 * s;
    return s;
  };
  function sit(r, t, p) {
    if (r.floorSit) return floorSit(r, t, p);   // TWO: sitting on the floor (sit_floor_wall) keeps its legs under upper anims
    const P = r.parts, d = r.d, hy = hipsY(r, p.h ?? 0.46) + 0.12;
    r.seated = true; P.coat.rotation.x = -1.3;   // a long coat's skirt folds forward under the thighs
    P.hips.position.y = hy;
    leg(r, 1, d.hipX * 1.15, d.footH - hy + 0.03, 0.4); leg(r, -1, d.hipX * 1.15, d.footH - hy + 0.03, 0.4); flat(r);
    arm(r, 1, d.shX * 0.72, 0.0, 0.3, 1, -0.2, -1); arm(r, -1, d.shX * 0.72, 0.0, 0.3, 1, -0.2, -1);
    P.handL.rotation.x = 0.5; P.handR.rotation.x = 0.5;
    P.torso.rotation.x = 0.04; breathe(r, t);
  }
  const A = {
    idle(r, t) { base(r, t); if (!r.seated) r.parts.hips.rotation.z = 0.012 * S(t * 0.6); r.parts.head.rotation.y = 0.06 * S(t * 0.37); },
    walk(r, t, p) { gait(r, t, 7.2 * (p.speed || 1), 0.46, 0.8, 0.38, -0.25, 0.018, 0.04); },
    run(r, t, p) { gait(r, t, 10.5 * (p.speed || 1), 0.8, 1.35, 0.75, -1.3, 0.03, 0.18); },
    carry(r, t, p) {
      gait(r, t, 5.6 * (p.speed || 1), 0.32, 0.5, 0, -0.2, 0.012, -0.04);
      const d = r.d; arm(r, 1, 0.16, 0.26, d.chestZ + 0.22, 1, -1, -0.6); arm(r, -1, 0.16, 0.26, d.chestZ + 0.22, 1, -1, -0.6);
    },
    swagger(r, t, p) {
      const P = r.parts, s = gait(r, t, 6.2 * (p.speed || 1), 0.5, 0.75, 0.55, -0.35, 0.026, -0.02);
      P.hips.rotation.y = 0.16 * s; P.hips.rotation.z = 0.04 * s; P.torso.rotation.y = -0.3 * s; P.torso.rotation.z = 0.05 * s;
      P.armL.rotation.z += 0.22; P.armR.rotation.z -= 0.22; P.head.rotation.x = -0.14; P.neck.rotation.x = -0.05; P.head.rotation.y = 0.12 * s;
    },
    sit,
    stand(r, t, p) {
      const P = r.parts, d = r.d, k = ez(once(t, p, 1)), hy0 = hipsY(r, p.h ?? 0.46) + 0.12, hy = hy0 + (d.hipY - hy0) * k;
      r.seated = false; r.floorSit = false;
      P.hips.position.y = hy;
      const fz = 0.4 * (1 - k); leg(r, 1, d.hipX * 1.15, d.footH - hy + 0.03 * (1 - k), fz); leg(r, -1, d.hipX * 1.15, d.footH - hy + 0.03 * (1 - k), fz); flat(r);
      P.torso.rotation.x = 0.55 * S(k * PI) + 0.04 * (1 - k);
      if (k < 0.5) { arm(r, 1, d.shX * 0.72, 0.0, 0.3, 1, -0.2, -1); arm(r, -1, d.shX * 0.72, 0.0, 0.3, 1, -0.2, -1); } else hang(r);
    },
    lie(r, t) {
      const P = r.parts; r.seated = false; r.lying = true;
      P.hips.rotation.x = -PI / 2; P.hips.position.y = 0.13;
      P.armL.rotation.set(0, 0, 0.18); P.armR.rotation.set(0, 0, -0.18); P.foreL.rotation.x = -0.1; P.foreR.rotation.x = -0.1;
      P.footL.rotation.z = 0.35; P.footR.rotation.z = -0.35; P.head.rotation.x = -0.1; P.torso.rotation.x = 0.012 * S(t * 1.4);
    },
    lie_tangled(r, t) {
      const P = r.parts; r.seated = false; r.lying = true;
      P.hips.rotation.set(-PI / 2 + 0.08, 0, 0.3); P.hips.position.y = 0.15;
      P.torso.rotation.set(0.012 * S(t * 1.2), -0.25, 0.12);
      P.legL.rotation.set(-1.1, 0, 0.25); P.shinL.rotation.x = 1.7; P.footL.rotation.x = -0.3;
      P.legR.rotation.set(-0.12, 0, -0.45); P.shinR.rotation.x = 0.25; P.footR.rotation.z = -0.4;
      P.armL.rotation.set(0.25, 0, 2.6 + 0.05 * S(t * 0.7)); P.foreL.rotation.x = -0.35;
      P.armR.rotation.set(0.2, 0, -1.0); P.foreR.rotation.x = -0.25 - 0.1 * max(0, S(t * 1.3));
      P.head.rotation.set(0.12 + 0.08 * max(0, S(t * 0.8)), 0.55, 0.1);
    },
    turn(r, t) {
      const P = r.parts, w = t * 9; r.seated = false; hang(r, t);
      P.legL.rotation.x = -0.28 * max(0, S(w)); P.shinL.rotation.x = 0.55 * max(0, S(w));
      P.legR.rotation.x = -0.28 * max(0, -S(w)); P.shinR.rotation.x = 0.55 * max(0, -S(w));
      P.hips.position.y += 0.01 * abs(S(w)) - 0.01;
    },
    point(r, t) {
      const P = r.parts, d = r.d; base(r, t);
      arm(r, -1, d.shX * 0.8, d.armY + 0.04, 0.62 + 0.02 * S(t * 5), 1, -0.4, -0.3);
      P.torso.rotation.y = -0.12; P.head.rotation.y = -0.08; P.handR.rotation.x = -0.15;
    },
    phone(r, t) {
      const P = r.parts, d = r.d; base(r, t);
      arm(r, -1, 0.1 * d.hs, d.headC - 0.17, 0.07, 0.5, -1, 0.3);
      P.handR.rotation.set(0.25, 0, 0.15); P.head.rotation.z = 0.12; P.head.rotation.x = 0.04 * S(t * 0.8);
    },
    type(r, t) {
      const P = r.parts, d = r.d, y = r.seated ? 0.2 : -0.02; breathe(r, t);
      arm(r, 1, 0.1, y + 0.01 * max(0, S(t * 13)), 0.36, 1, -0.6, -0.6); arm(r, -1, 0.1, y + 0.01 * max(0, S(t * 13 + 2)), 0.36, 1, -0.6, -0.6);
      P.handL.rotation.x = 0.35; P.handR.rotation.x = 0.35; P.head.rotation.x = 0.18; P.torso.rotation.x += 0.08;
    },
    pedal(r, t, p) {
      const P = r.parts, d = r.d, hy = hipsY(r, p.h ?? 0.84) + 0.1, R = 0.17 / d.s, cy = hipsY(r, 0.33) - hy, cz = 0.24;
      const th = t * 6.5 * (p.speed ?? 1);
      r.seated = false;
      P.hips.position.y = hy; P.hips.position.z = -0.05;
      leg(r, 1, d.hipX, cy + R * S(th), cz + R * C(th)); leg(r, -1, d.hipX, cy + R * S(th + PI), cz + R * C(th + PI)); flat(r);
      P.footL.rotation.x += 0.2 * S(th); P.footR.rotation.x += 0.2 * S(th + PI);
      P.torso.rotation.x = 0.32 + 0.02 * S(th * 2);
      arm(r, 1, 0.2, d.T * 0.55, 0.42, 1, -0.6, -0.4); arm(r, -1, 0.2, d.T * 0.55, 0.42, 1, -0.6, -0.4);
      P.head.rotation.x = -0.25;
    },
    pull(r, t) {
      const P = r.parts, d = r.d, y = d.footH - (d.hipY - 0.08) + 0.02, yank = max(0, S(t * 5));
      r.seated = false;
      P.hips.position.y -= 0.08; P.hips.position.z -= 0.05 * yank;
      leg(r, 1, d.hipX, y, 0.28); leg(r, -1, d.hipX, y, -0.3); flat(r);
      P.torso.rotation.x = -0.28 - 0.14 * yank;
      arm(r, 1, 0.06, d.armY - 0.06, 0.52, 1, -1, -0.2); arm(r, -1, 0.06, d.armY - 0.06, 0.52, 1, -1, -0.2);
      P.head.rotation.x = 0.25; P.handL.rotation.x = 0.4; P.handR.rotation.x = 0.4;
    },
    hands_head(r, t) {
      const P = r.parts, d = r.d; breathe(r, t);
      arm(r, 1, 0.1 * d.hs, d.headC + 0.1 * d.hs, -0.02, 1, 0.2, -0.3); arm(r, -1, 0.1 * d.hs, d.headC + 0.1 * d.hs, -0.02, 1, 0.2, -0.3);
      P.handL.rotation.set(0, 0, 1.2); P.handR.rotation.set(0, 0, -1.2);
      P.head.rotation.x = -0.06 + 0.03 * S(t * 0.7); P.torso.rotation.y = 0.05 * S(t * 0.5);
    },
    head_hands(r, t) {
      const P = r.parts, d = r.d, lean = r.seated ? 0.5 : 0.3;
      P.torso.rotation.x = lean + 0.02 * S(t * 1.3); P.neck.rotation.x = 0.25; P.head.rotation.x = 0.35;
      const hy = d.T + (d.neckL + 0.12 * d.hs) * C(0.6), hz = (d.neckL + 0.12 * d.hs) * S(0.6) + 0.02;
      arm(r, 1, 0.088 * d.hs, hy - 0.05, hz + 0.03, 0.6, -0.5, 1); arm(r, -1, 0.088 * d.hs, hy - 0.05, hz + 0.03, 0.6, -0.5, 1);
      P.handL.rotation.set(-0.2, 0, -0.35); P.handR.rotation.set(-0.2, 0, 0.35);
    },
    lanyard(r, t, p) {
      const P = r.parts, d = r.d, k = d.T / 0.47, z = max(d.chestZ, d.bellyZ) + 0.07, click = max(0, S(t * 2.6)) ** 8;
      base(r, t); r.parts.torso.rotation.x += 0.04;
      arm(r, -1, 0.02 - 0.02 * click, 0.16 * k, z + 0.04, 1, -1, -0.2);
      if (!r.seated) arm(r, 1, d.shX * 0.9 - 0.12 * click, 0.02 + 0.1 * click, 0.08 + 0.06 * click, 1, -1, -0.4);
      P.handR.rotation.set(-0.9, p.still ? 0 : 0.5 * S(t * 3), 0.5); P.handL.rotation.set(-0.6 * click, 0, 0);
      P.head.rotation.x = 0.28;
      if (r.attach.lanyard && !p.still) r.attach.lanyard.userData.badge.rotation.y += 0.8 * S(t * 3);   // (+=: a flipped badge stays flipped)
    },
    nod(r, t, p) { base(r, t); const u = once(t, p, 0.9); r.parts.head.rotation.x = 0.22 * (1 - C(u * 4 * PI)) / 2; r.parts.neck.rotation.x = 0.06 * (1 - C(u * 4 * PI)) / 2; },
    shake(r, t, p) { base(r, t); const u = once(t, p, 1); r.parts.head.rotation.y = 0.35 * S(u * 6 * PI) * (1 - u); },
    shrug(r, t, p) {
      const P = r.parts, d = r.d, k = S(once(t, p, 1.2) * PI); breathe(r, t);
      P.armL.position.y += 0.035 * k; P.armR.position.y += 0.035 * k;
      if (!r.seated) { arm(r, 1, d.shX + 0.08 * k, 0.12 + 0.06 * k, 0.12 + 0.12 * k, 1, -0.3, -0.6); arm(r, -1, d.shX + 0.08 * k, 0.12 + 0.06 * k, 0.12 + 0.12 * k, 1, -0.3, -0.6); }
      P.handL.rotation.y = -0.9 * k; P.handR.rotation.y = 0.9 * k; P.head.rotation.z = 0.12 * k;
    },
    laugh(r, t) {
      const P = r.parts, d = r.d; if (!r.seated) hang(r, t);
      P.torso.rotation.x = -0.1 - 0.05 * abs(S(t * 8)); P.head.rotation.x = -0.18 - 0.04 * S(t * 8);
      arm(r, 1, 0.06, 0.14 * d.T / 0.47 + 0.01 * S(t * 16), d.bellyZ + 0.07, 1, -0.3, -1);
      P.armL.position.y += 0.008 * S(t * 16); P.armR.position.y += 0.008 * S(t * 16);
    },
    cry(r, t) {
      const P = r.parts, d = r.d;
      P.torso.rotation.x = 0.22 + 0.025 * S(t * 11); P.neck.rotation.x = 0.15; P.head.rotation.x = 0.3;
      const hy = d.T + (d.neckL + 0.1 * d.hs) * C(0.45), hz = (d.neckL + 0.1 * d.hs) * S(0.45) + 0.09;
      arm(r, 1, 0.05, hy - 0.06, hz + 0.06, 0.3, -1, 0.2); arm(r, -1, 0.05, hy - 0.06, hz + 0.06, 0.3, -1, 0.2);
      P.handL.rotation.set(-0.6, 0, -0.3); P.handR.rotation.set(-0.6, 0, 0.3);
      P.armL.position.y += 0.006 * S(t * 11); P.armR.position.y += 0.006 * S(t * 11);
    },
    wave(r, t) {
      const P = r.parts, d = r.d; base(r, t);
      arm(r, -1, d.shX + 0.12 + 0.05 * S(t * 9), d.headC + 0.03, 0.12, 1, -0.6, 0.1);
      P.handR.rotation.z = 0.3 * S(t * 9);
    },
    pour(r, t) {
      const P = r.parts, d = r.d; base(r, t);
      arm(r, 1, 0.05, 0.22, d.chestZ + 0.24, 1, -1, -0.3); arm(r, -1, 0.02, 0.34 + 0.02 * S(t * 2), d.chestZ + 0.28, 1, -0.8, -0.3);
      P.handR.rotation.z = -0.7; P.head.rotation.x = 0.25;
    },
    drink(r, t) {
      const P = r.parts, d = r.d, c = (t % 4) / 4, k = c < 0.4 ? ez(min(1, c / 0.12)) * ez(min(1, (0.4 - c) / 0.12)) : 0; base(r, t);
      arm(r, 1, 0.12 - 0.07 * k, 0.24 + (d.headC - 0.35) * k, d.chestZ + 0.2 - 0.04 * k, 1, -0.6, -0.4);
      P.handL.rotation.x = -0.3 * k; P.head.rotation.x = -0.15 * k;
    },
    carry_mug(r, t) { const d = r.d; base(r, t); arm(r, 1, 0.13, 0.2, d.chestZ + 0.2, 1, -0.8, -0.4); },
    look_up(r, t) { base(r, t); r.parts.head.rotation.x = -0.45; r.parts.neck.rotation.x = -0.2; },
    look_down(r, t) { base(r, t); r.parts.head.rotation.x = 0.42; r.parts.neck.rotation.x = 0.15; },
    write(r, t) {
      const P = r.parts, y = r.seated ? 0.2 : -0.02; breathe(r, t);
      arm(r, 1, 0.12, y, 0.32, 1, -0.6, -0.5); arm(r, -1, 0.03 + 0.015 * S(t * 9), y + 0.01 + 0.005 * S(t * 23), 0.36 + 0.012 * C(t * 7), 1, -0.6, -0.5);
      P.handR.rotation.x = 0.5; P.handL.rotation.x = 0.4; P.head.rotation.x = 0.35; P.torso.rotation.x += 0.1;
    },
    give(r, t, p) {
      const P = r.parts, d = r.d, k = min(1, S(once(t, p, 1.4) * PI) * 1.5); base(r, t);
      arm(r, -1, d.shX * (1 - 0.4 * k), 0.05 + 0.25 * k, 0.12 + 0.4 * k, 1, -1, -0.3);
      P.handR.rotation.x = -0.4 * k; P.torso.rotation.x += 0.08 * k;
    },
    lanyard_on(r, t, p) {
      const P = r.parts, d = r.d, u = once(t, p, 2); breathe(r, t);
      let y, z;
      if (u < 0.4) { const k = ez(u / 0.4); y = 0.3 + (d.headC + 0.22 - 0.3) * k; z = 0.3 - 0.16 * k; }
      else if (u < 0.75) { const k = ez((u - 0.4) / 0.35); y = d.headC + 0.22 - (d.headC + 0.22 - d.T) * k; z = 0.14 - 0.02 * k; }
      else { const k = ez((u - 0.75) / 0.25); y = d.T - 0.2 * k; z = 0.12 + 0.05 * k; }
      arm(r, 1, 0.09, y, z, 1, -0.2, -0.3); arm(r, -1, 0.09, y, z, 1, -0.2, -0.3);
      P.head.rotation.x = u > 0.4 && u < 0.7 ? 0.15 : -0.1 * S(u * PI);
      if (r.attach.lanyard) r.attach.lanyard.visible = u > 0.55;
    },
    hug(r, t) {
      const P = r.parts, d = r.d; breathe(r, t);
      if (r.id === 'luka') {            // doesn't know what to do with his hands
        arm(r, 1, d.shX + 0.16 + 0.03 * S(t * 1.7), 0.18 + 0.03 * S(t * 2.3), 0.2, 1, -0.6, -0.5);
        arm(r, -1, d.shX + 0.16 + 0.03 * S(t * 1.9 + 1), 0.18 + 0.03 * S(t * 2.1 + 1), 0.2, 1, -0.6, -0.5);
        P.handL.rotation.y = -0.8; P.handR.rotation.y = 0.8; P.torso.rotation.x = -0.08; P.head.rotation.x = -0.1;
      } else {
        arm(r, 1, 0.12, d.T * 0.62, 0.36, 1, 0, -0.2); arm(r, -1, 0.12, d.T * 0.62, 0.36, 1, 0, -0.2);
        P.torso.rotation.x = 0.12; P.head.rotation.set(0.1, 0.35, 0.1);
      }
    },
    knock(r, t, p) {
      const P = r.parts, d = r.d, u = once(t, p, 1.2), k = u < 0.85 ? abs(S(u * 3 * PI / 0.85)) : 0; base(r, t);
      if (u < 0.92) arm(r, -1, 0.12, d.headC - 0.12, 0.44 - 0.07 * k, 1, -1, -0.2);
      P.handR.rotation.x = -0.3;
    },
    duck(r, t) {
      const P = r.parts, d = r.d, hy = d.hipY * 0.6; r.seated = false;
      P.hips.position.y = hy; leg(r, 1, d.hipX * 1.1, d.footH - hy, 0.12); leg(r, -1, d.hipX * 1.1, d.footH - hy, 0.12); flat(r);
      P.torso.rotation.x = 0.6 + 0.015 * S(t * 2); P.head.rotation.x = -0.3; P.neck.rotation.x = -0.1;
      arm(r, 1, 0.13, 0.02, 0.3, 1, -0.3, -0.6); arm(r, -1, 0.13, 0.02, 0.3, 1, -0.3, -0.6);
    },
    sleep(r, t, p) {
      const P = r.parts, d = r.d;
      if (r.seated) {
        sit(r, t, p);   // keep the seated hips and legs (pose() resets them before a non-upper anim)
        P.torso.rotation.x = 0.75 + 0.015 * S(t * 1.1); P.neck.rotation.x = 0.1; P.head.rotation.set(0.25, 0.6, 0.25);
        arm(r, 1, 0.02, 0.3, 0.3, 1, 0, -0.2); arm(r, -1, 0.02, 0.32, 0.32, 1, 0, -0.2);
        P.handL.rotation.z = 1.2; P.handR.rotation.z = -1.2;
      } else {
        r.lying = true;
        P.hips.rotation.z = PI / 2; P.hips.position.y = 0.16;
        P.legL.rotation.x = -0.9; P.shinL.rotation.x = 1.3; P.legR.rotation.x = -0.7; P.shinR.rotation.x = 1.1;
        P.torso.rotation.x = 0.25 + 0.012 * S(t * 1.1); P.head.rotation.x = 0.2;
        P.armL.rotation.set(-1.1, 0, 0.1); P.foreL.rotation.x = -1.2; P.armR.rotation.set(-1.3, 0, -0.2); P.foreR.rotation.x = -1.4;
      }
    },
    fake_call(r, t) {
      const P = r.parts, d = r.d; breathe(r, t);
      arm(r, -1, 0.1 * d.hs, d.headC - 0.17, 0.07, 0.5, -1, 0.3);
      P.handR.rotation.set(0.25, 0, 0.15);
      arm(r, 1, 0.2 + 0.1 * S(t * 2.3), 0.28 + 0.08 * S(t * 3.1), 0.3 + 0.08 * S(t * 1.7), 1, -0.6, -0.5);
      P.handL.rotation.set(-0.3 * S(t * 2.3), -0.8, 0);
      P.head.rotation.set(0.06 * S(t * 4), 0.1 * S(t * 0.9), 0.1); P.torso.rotation.y = 0.1 * S(t * 0.9); P.hips.rotation.z = 0.015 * S(t * 0.6);
    },
    back_turn(r, t) {
      const P = r.parts, d = r.d; breathe(r, t); r.seated = false;
      P.hips.rotation.y = PI * ez(min(1, t / 0.6));
      arm(r, 1, -0.05, 0.3, d.chestZ + 0.07, 1, -0.8, -0.2); arm(r, -1, -0.05, 0.28, d.chestZ + 0.11, 1, -0.8, -0.2);
      P.head.rotation.x = -0.1;
    },
    chew(r, t) {
      base(r, t); r.parts.head.rotation.x += 0.03 * S(t * 8);
      const m = S(t * 8) > 0 ? 'closed' : 'O';
      if (!r.talking && r.face.over !== m) { r.face.over = m; r.face.redraw(); }
    },
    tap(r, t) {
      const P = r.parts, y = r.seated ? 0.2 : -0.02; base(r, t);
      arm(r, -1, 0.12, y + 0.02, 0.36, 1, -0.8, -0.4); P.handR.rotation.x = 0.2 + 0.45 * max(0, S(t * 9));
    },
    clap(r, t) {
      const P = r.parts, d = r.d, k = abs(S(t * 7)); breathe(r, t);
      arm(r, 1, 0.02 + 0.06 * k, 0.28, d.chestZ + 0.22, 1, -1, -0.3); arm(r, -1, 0.02 + 0.06 * k, 0.28, d.chestZ + 0.22, 1, -1, -0.3);
      P.handL.rotation.x = -0.6; P.handR.rotation.x = -0.6;
    },
    wipe(r, t) {
      const P = r.parts; breathe(r, t);
      P.torso.rotation.x = 0.35;
      arm(r, -1, 0.1 + 0.07 * C(t * 5), -0.02, 0.44 + 0.06 * S(t * 5), 1, -0.6, -0.4); arm(r, 1, 0.18, 0.0, 0.4, 1, -0.6, -0.4);
      P.handR.rotation.x = 0.9; P.handL.rotation.x = 0.9; P.head.rotation.x = 0.1;
    },
    umbrella(r, t) { const P = r.parts, d = r.d; if (!r.seated) hang(r, t); breathe(r, t); arm(r, -1, 0.08, 0.3, d.chestZ + 0.16, 1, -1, -0.2); P.handR.rotation.x = -0.1; },
    reading(r, t) {
      const P = r.parts, d = r.d; base(r, t);
      arm(r, 1, 0.08, 0.28, d.chestZ + 0.22, 1, -1, -0.3); arm(r, -1, 0.1, 0.28, d.chestZ + 0.22, 1, -1, -0.3);
      P.handR.rotation.set(-0.5, 0, 0); P.head.rotation.x = 0.32;
    },
    glance(r, t, p) {
      base(r, t);
      const u = once(t, p, 1.3), k = u < 0.25 ? ez(u / 0.25) : u > 0.75 ? ez((1 - u) / 0.25) : 1, y = p.yaw ?? 0.9;
      r.parts.head.rotation.y = y * 0.65 * k; r.parts.neck.rotation.y = y * 0.35 * k;
    },
    whistle(r, t) {
      const P = r.parts, d = r.d; breathe(r, t);
      arm(r, -1, 0.02, d.headC - 0.22, 0.2, 1, -1, -0.2); arm(r, 1, 0.03, d.headC - 0.28, 0.25, 1, -1, -0.2);
      P.handR.rotation.x = -0.9; P.handL.rotation.x = -0.9 + 0.1 * S(t * 7); P.head.rotation.x = 0.12; P.torso.rotation.z = 0.04 * S(t * 2);
    },
  };
  // ---------------------------------------------------------------- TWO
  // toTorso(r, y, z): a point in HIPS space (body units; y up from the hip joint, z forward) -> torso space, through the
  // torso's current lean (set torso.rotation.x first). Leaves the result in TY / TZ (no allocation).
  let TY = 0, TZ = 0;
  const toTorso = (r, y, z) => { const th = r.parts.torso.rotation.x, yy = y - 0.06, c = C(th), s = S(th); TY = yy * c + z * s; TZ = -yy * s + z * c; };
  const wy = (r, m, hy) => hipsY(r, m) - (hy ?? r.parts.hips.position.y);   // a world height (m, from the feet) -> hips space
  // blend between two whole poses (each a pose fn): slerp every bone, lerp the hips position. Scratch is preallocated.
  const NBN = 17, QA = [], QB = [], qq = new THREE.Quaternion(), HA = new THREE.Vector3(), HB = new THREE.Vector3();
  for (let i = 0; i < NBN; i++) { QA.push(new THREE.Quaternion()); QB.push(new THREE.Quaternion()); }
  const BN = ['hips', 'torso', 'neck', 'head', 'armL', 'foreL', 'handL', 'armR', 'foreR', 'handR', 'legL', 'shinL', 'footL', 'legR', 'shinR', 'footR', 'coat'];
  const zero = (r) => { const P = r.parts; for (let i = 0; i < NBN; i++) P[BN[i]].rotation.set(0, 0, 0); P.hips.position.y = r.d.hipY; P.hips.position.z = 0; P.hips.position.x = 0; };
  function blend2(r, t, p, fa, fb, k) {
    const P = r.parts;
    zero(r); fa(r, t, p); for (let i = 0; i < NBN; i++) QA[i].setFromEuler(P[BN[i]].rotation); HA.copy(P.hips.position);
    zero(r); fb(r, t, p); for (let i = 0; i < NBN; i++) QB[i].setFromEuler(P[BN[i]].rotation); HB.copy(P.hips.position);
    for (let i = 0; i < NBN; i++) { const o = P[BN[i]].rotation; qq.copy(QA[i]).slerp(QB[i], k); o.setFromQuaternion(qq, o.order); }
    P.hips.position.lerpVectors(HA, HB, k);
  }
  // upper-body blend from idle toward another pose (keeps the legs the pre-pass gave: walk / sit)
  const UN = ['torso', 'neck', 'head', 'armL', 'foreL', 'handL', 'armR', 'foreR', 'handR'], UQ = UN.map(() => new THREE.Quaternion());
  function towards(r, t, p, fn, k) {
    const P = r.parts;
    fn(r, t, p); for (let i = 0; i < UN.length; i++) { const o = P[UN[i]].rotation; UQ[i].setFromEuler(o); o.set(0, 0, 0); }
    A.idle(r, t, p);
    for (let i = 0; i < UN.length; i++) { const o = P[UN[i]].rotation; qq.setFromEuler(o).slerp(UQ[i], k); o.setFromQuaternion(qq, o.order); }
  }
  function floorSit(r, t, p) {           // on the floor, back to a wall, knees up (p.slump: head down)
    const P = r.parts, d = r.d, hy = hipsY(r, 0.1) + 0.06;
    r.seated = true; r.floorSit = true; P.coat.rotation.x = -1.45;
    P.hips.position.y = hy; P.hips.position.z = -0.04;
    leg(r, 1, d.hipX * 1.35, d.footH - hy + 0.03, 0.44, 1); leg(r, -1, d.hipX * 1.15, d.footH - hy + 0.03, 0.38, 1); flat(r);
    P.torso.rotation.x = -0.16 + (p.slump ? 0.42 : 0); breathe(r, t);
    toTorso(r, 0.1, 0.3); arm(r, 1, 0.18, TY, TZ, 1, -0.5, -0.6); arm(r, -1, 0.15, TY - 0.03, TZ - 0.02, 1, -0.5, -0.6);
    P.handL.rotation.x = 0.4; P.handR.rotation.x = 0.4; P.head.rotation.x = p.slump ? 0.45 : 0.05;
  }
  function kneel(r, t) {                  // on the left knee, right foot planted
    const P = r.parts, d = r.d, hy = d.thigh + 0.1;
    r.seated = false; r.floorSit = false;
    P.hips.position.y = hy; P.legL.rotation.x = 0.08; P.shinL.rotation.x = 1.52; P.footL.rotation.x = -0.25;
    P.legR.rotation.x = -1.42; P.shinR.rotation.x = 1.42; P.footR.rotation.x = 0.02;
    P.torso.rotation.x = 0.12; hang(r, t); breathe(r, t);
  }
  function hurtStand(r, t, p) {           // can't straighten all the way: hunched, his right hand holding his left ribs
    const P = r.parts, d = r.d;
    if (!r.seated && !p.walk) { P.hips.position.y -= 0.025; leg(r, 1, d.hipX, d.footH - d.hipY + 0.03, 0.04); leg(r, -1, d.hipX, d.footH - d.hipY + 0.03, -0.03); flat(r); }
    P.torso.rotation.x += 0.26 + 0.015 * S(t * 2.2); P.torso.rotation.z = 0.05; P.head.rotation.x = 0.12; P.neck.rotation.x = -0.05;
    arm(r, -1, -0.07, 0.17 * (d.T / 0.47), d.chestZ + 0.03, 1, -1, 0.3); P.handR.rotation.set(0.1, 0, 0.6);
    arm(r, 1, d.shX + 0.06, -0.05, 0.08, 1, -1, -0.4);
  }
  const lieSide = (r, t) => {             // on the floor on his side, curled (where get_up_hurt starts)
    const P = r.parts; r.seated = false; r.floorSit = false; r.lying = true;
    P.hips.rotation.z = PI / 2; P.hips.position.y = 0.16; P.legL.rotation.x = -0.7; P.shinL.rotation.x = 1.1; P.legR.rotation.x = -0.5; P.shinR.rotation.x = 0.9;
    P.torso.rotation.x = 0.3; P.head.rotation.x = 0.15; P.armL.rotation.set(-1.0, 0, 0.1); P.foreL.rotation.x = -1.0; P.armR.rotation.set(-1.2, 0, -0.2); P.foreR.rotation.x = -1.3;
  };
  const kneelUp = (r, t) => {             // kneeling, one hand up on the wall at his left
    kneel(r, t); const P = r.parts, d = r.d; P.torso.rotation.x = 0.3; P.torso.rotation.z = -0.1;
    arm(r, 1, d.shX + 0.32, d.armY + 0.12, 0.05, 1, -0.6, -0.4); P.handL.rotation.set(0, 0, 1.2);
    arm(r, -1, -0.06, 0.16, r.d.chestZ + 0.03, 1, -1, 0.3);
  };
  const standHurt = (r, t) => { hurtStand(r, t, EMPTY_P); };
  const EMPTY_P = {};
  const drive = (r, t, p, laugh) => {     // seated on the hover-scooter: hands on the bars, feet on the footboard
    const P = r.parts, d = r.d, hy = hipsY(r, p.h ?? 0.65) + 0.12;
    r.seated = false; r.floorSit = false; P.coat.rotation.x = -1.2;
    P.hips.position.y = hy;
    leg(r, 1, d.hipX * 1.25, wy(r, p.fy ?? 0.46, hy) + d.footH, hipsY(r, p.fz ?? 0.36), 1); leg(r, -1, d.hipX * 1.25, wy(r, p.fy ?? 0.46, hy) + d.footH, hipsY(r, p.fz ?? 0.36), 1); flat(r);
    const sh = laugh ? abs(S(t * 9)) : 0;
    P.torso.rotation.x = 0.2 + 0.01 * S(t * 3) - (laugh ? 0.12 + 0.05 * sh : 0);
    toTorso(r, wy(r, p.by ?? 0.94, hy), hipsY(r, p.bz ?? 0.5));
    arm(r, 1, 0.24, TY, TZ, 1, -0.4, -0.6);
    if (laugh) arm(r, -1, 0.06, 0.12 * (d.T / 0.47) + 0.01 * S(t * 16), d.bellyZ + 0.07, 1, -0.3, -1); else arm(r, -1, 0.24, TY, TZ, 1, -0.4, -0.6);
    P.handL.rotation.set(-0.3, 0, -0.4); P.handR.rotation.set(-0.3, 0, 0.4);
    P.head.rotation.x = laugh ? -0.25 - 0.05 * S(t * 9) : -0.12;
  };
  const held = (r, x, y, z, rx = 0) => { const h = r.attach.headphones_held; if (h) { h.position.set(x, y, z); h.rotation.set(rx, 0, 0); } };
  Object.assign(A, {
    // polish: two hands rubbing in counter-phase circles at counter height; p.low = crouched at a low surface
    polish(r, t, p) {
      const P = r.parts, d = r.d, w = t * 5.5, c = C(w), s2 = S(w); breathe(r, t);
      if (p.low) { const hy = d.hipY * 0.7; r.seated = false; P.hips.position.y = hy; leg(r, 1, d.hipX * 1.15, d.footH - hy, 0.16); leg(r, -1, d.hipX * 1.15, d.footH - hy, 0.0); flat(r); P.torso.rotation.x = 0.55; }
      else P.torso.rotation.x += 0.32;
      const y = p.low ? 0.02 : -0.02, z = 0.42;
      arm(r, 1, 0.14 + 0.05 * c, y + 0.008 * s2, z + 0.05 * s2, 1, -0.6, -0.4); arm(r, -1, 0.14 - 0.05 * c, y - 0.008 * s2, z - 0.05 * s2, 1, -0.6, -0.4);
      P.handL.rotation.x = 0.9; P.handR.rotation.x = 0.9; P.head.rotation.x = 0.22; P.neck.rotation.x = 0.08;
    },
    // lift_strain: squat, grip a low edge (p.h0 m), heave it up to p.h1 m over p.dur (or ~2 s and hold, trembling)
    lift_strain(r, t, p) {
      const P = r.parts, d = r.d, u = p.dur ? once(t, p, 2) : min(1, t / 2), k = ez(u), tr = 0.011 * S(t * 31) + 0.006 * S(t * 47);
      r.seated = false; r.floorSit = false;
      const h0 = p.h0 ?? 0.32, h1 = p.h1 ?? 1.2, hm = h0 + (h1 - h0) * k, hy = d.hipY * (0.62 + 0.38 * min(1, k * 1.3));
      P.hips.position.y = hy; P.hips.position.z = -0.05 * (1 - k);
      leg(r, 1, d.hipX * 1.3, d.footH - hy, 0.12 + 0.06 * (1 - k)); leg(r, -1, d.hipX * 1.3, d.footH - hy, -0.04 + 0.06 * (1 - k)); flat(r);
      P.torso.rotation.x = 0.6 * (1 - k) + 0.06 + tr * 0.4;
      toTorso(r, wy(r, hm, hy), 0.34 + 0.06 * (1 - k));
      arm(r, 1, 0.17, TY + tr, TZ, 1, -0.6, -0.5); arm(r, -1, 0.17, TY - tr, TZ, 1, -0.6, -0.5);
      P.handL.rotation.x = -0.5; P.handR.rotation.x = -0.5; P.head.rotation.x = -0.1 - 0.25 * k; P.neck.rotation.x = -0.05;
    },
    // climb: ladder / pole rungs in front; alternating hands above the head and knees (the world moves the root up)
    climb(r, t, p) {
      const P = r.parts, d = r.d, w = t * PI * 1.4 * (p.speed || 1), sL = max(0, S(w)), sR = max(0, S(w + PI));
      r.seated = false; r.floorSit = false;
      P.torso.rotation.x = 0.06; P.head.rotation.x = -0.28;
      arm(r, 1, 0.13, d.headC + 0.06 + 0.12 * sL, 0.24, 1, -0.5, -0.8); arm(r, -1, 0.13, d.headC + 0.06 + 0.12 * sR, 0.24, 1, -0.5, -0.8);
      P.handL.rotation.x = -0.6; P.handR.rotation.x = -0.6;
      const fy = d.footH - d.hipY;
      leg(r, 1, d.hipX, fy + 0.24 * sL, 0.12 + 0.08 * sL); leg(r, -1, d.hipX, fy + 0.24 * sR, 0.12 + 0.08 * sR); flat(r);
    },
    // hands_rise: Chase's tell. Hands rise to the top of his head and stay (p.dur ~0.9); p.stop: stop ~60% and come down
    hands_rise(r, t, p) {
      const dur = p.dur || (p.stop ? 2.4 : 0.9), u = t / dur, K = 0.6;
      const k = p.stop ? (u < 0.4 ? K * S((u / 0.4) * PI / 2) : u < 0.62 ? K : u < 0.95 ? K * (1 - S(((u - 0.62) / 0.33) * PI / 2)) : 0) : ez(min(1, u));
      towards(r, t, p, A.hands_head, k);
    },
    // Rue's port: hands rise toward head-in-hands, three-quarters of the way, and back
    hands_halt(r, t, p) {
      const u = t / (p.dur || 2.8), K = 0.75, H2 = PI / 2;
      towards(r, t, p, A.head_hands, u < 0.4 ? K * S((u / 0.4) * H2) : u < 0.62 ? K : u < 0.95 ? K * (1 - S(((u - 0.62) / 0.33) * H2)) : 0);
    },
    head_in_hands(r, t, p) { A.head_hands(r, t, p); },
    scooter_drive(r, t, p) { drive(r, t, p, false); },
    scooter_laugh(r, t, p) { drive(r, t, p, true); },   // the helpless laugh at the wheel (2.5)
    // pillion: behind the driver, hands at the driver's waist (p.rec: right hand out, recording on the phone)
    scooter_pillion(r, t, p) {
      const P = r.parts, d = r.d, hy = hipsY(r, p.h ?? 0.65) + 0.12;
      r.seated = false; r.floorSit = false; P.coat.rotation.x = -1.2;
      P.hips.position.y = hy;
      leg(r, 1, d.hipX * 1.5, wy(r, p.fy ?? 0.46, hy) + d.footH, hipsY(r, 0.16), 1); leg(r, -1, d.hipX * 1.5, wy(r, p.fy ?? 0.46, hy) + d.footH, hipsY(r, 0.16), 1); flat(r);
      P.torso.rotation.x = 0.1 + 0.01 * S(t * 3);
      toTorso(r, wy(r, 0.86, hy), hipsY(r, 0.22));
      arm(r, 1, 0.15, TY, TZ, 1, -0.6, -0.6);
      if (p.rec) { arm(r, -1, d.shX + 0.3, d.armY + 0.02, 0.15, 1, -0.6, -0.3); P.handR.rotation.set(0, 0, 0.5); } else arm(r, -1, 0.15, TY, TZ, 1, -0.6, -0.6);
      P.head.rotation.y = p.rec ? -0.5 : 0.25; P.head.rotation.x = -0.05;
    },
    // tether_throw: the lasso swing overhead, then the release forward (one-shot ~0.7 s)
    tether_throw(r, t, p) {
      const P = r.parts, d = r.d, u = once(t, p, 0.7); breathe(r, t);
      if (u < 0.55) { const w = (u / 0.55) * PI * 4; arm(r, -1, 0.1 + 0.12 * C(w), d.headC + 0.16, 0.06 + 0.12 * S(w), 1, -0.2, 0.2); P.torso.rotation.y = -0.15; }
      else { const k = ez((u - 0.55) / 0.45); arm(r, -1, 0.08 - 0.05 * k, d.armY + 0.16 - 0.08 * k, 0.2 + 0.38 * k, 1, -0.6, -0.2); P.torso.rotation.y = -0.15 + 0.35 * k; P.torso.rotation.x = 0.1 * k; }
      arm(r, 1, d.shX * 0.9, 0.12, 0.22, 1, -1, -0.4); P.head.rotation.x = -0.1;
    },
    // tether_yank: braced, both hands on the line, yanking (loops; p.dur = one yank)
    tether_yank(r, t, p) {
      const P = r.parts, d = r.d, k = p.dur ? S(once(t, p, 0.6) * PI) : max(0, S(t * 5)), y = d.footH - (d.hipY - 0.08) + 0.02;
      r.seated = false; r.floorSit = false; P.hips.position.y -= 0.08; P.hips.position.z -= 0.05 * k;
      leg(r, 1, d.hipX, y, 0.28); leg(r, -1, d.hipX, y, -0.3); flat(r);
      P.torso.rotation.x = -0.2 - 0.18 * k; P.torso.rotation.y = -0.2;
      arm(r, 1, 0.04, d.armY - 0.02, 0.5 - 0.08 * k, 1, -1, -0.2); arm(r, -1, 0.1, d.armY - 0.12 - 0.04 * k, 0.26 - 0.22 * k, 1, -1, -0.3);
      P.handL.rotation.x = 0.4; P.handR.rotation.x = 0.4; P.head.rotation.x = 0.15;
    },
    // chip_ping: two fingers to the right temple (the chip), a jolt as it fires, the hand back down (one-shot ~0.9 s)
    chip_ping(r, t, p) {
      const P = r.parts, d = r.d, u = once(t, p, 0.9), up = u < 0.25 ? ez(u / 0.25) : u > 0.8 ? ez((1 - u) / 0.2) : 1, jolt = u > 0.35 && u < 0.6 ? S(((u - 0.35) / 0.25) * PI) : 0;
      base(r, t);
      arm(r, -1, d.shX + 0.03 + (0.11 * d.hs - d.shX - 0.03) * up, -0.12 + (d.headC - 0.03 + 0.12) * up, 0.06 - 0.04 * up, 0.5, -1, 0.3);
      P.handR.rotation.set(0.15 * up, 0, 0.35 * up);
      P.head.rotation.z = 0.12 * up; P.head.rotation.x = -0.14 * jolt; P.torso.rotation.x -= 0.1 * jolt; P.neck.rotation.z = 0.06 * jolt;
    },
    // coat_throw: shrug the coat off the shoulders by the lapels, sweep it up and over, follow through (one-shot ~0.9 s)
    coat_throw(r, t, p) {
      const P = r.parts, d = r.d, u = once(t, p, 0.9); breathe(r, t);
      let x, y, z;
      if (u < 0.35) { const k = ez(u / 0.35); x = 0.06 + 0.12 * k; y = d.T - 0.04 + (d.headC + 0.06 - d.T) * k; z = d.chestZ + 0.05 - 0.04 * k; P.torso.rotation.x = -0.12 * k; }
      else if (u < 0.7) { const k = ez((u - 0.35) / 0.35); x = 0.18 - 0.06 * k; y = d.headC + 0.06 + 0.12 * S(k * PI) - 0.1 * k; z = 0.01 + 0.55 * k; P.torso.rotation.x = -0.12 + 0.3 * k; }
      else { const k = ez((u - 0.7) / 0.3); x = 0.12; y = d.headC - 0.04 - 0.45 * k; z = 0.56 - 0.12 * k; P.torso.rotation.x = 0.18 - 0.1 * k; }
      arm(r, 1, x, y, z, 1, -0.6, -0.4); arm(r, -1, x, y, z, 1, -0.6, -0.4); P.head.rotation.x = -0.1;
    },
    // type_phone: thumbs on a phone at chest height, head down (shows the phone)
    type_phone(r, t) {
      const P = r.parts, d = r.d, z = d.chestZ + 0.16, y = 0.17 * (d.T / 0.47); breathe(r, t);
      arm(r, -1, 0.025, y + 0.004 * max(0, S(t * 11)), z, 1, -1, -0.3); arm(r, 1, 0.04, y - 0.012 + 0.004 * max(0, S(t * 13 + 1)), z - 0.01, 1, -1, -0.3);
      P.handR.rotation.set(-0.9, 0.3, 0); P.handL.rotation.set(-0.9, -0.3, 0); P.head.rotation.x = 0.38; P.neck.rotation.x = 0.1;
    },
    // hold_headphones_up: the pair held up in both hands at face height (shows headphones_held)
    hold_headphones_up(r, t) {
      const P = r.parts, d = r.d, y = d.headC - 0.12 + 0.01 * S(t * 2), z = 0.3; breathe(r, t);
      arm(r, 1, 0.13, y, z, 1, -0.6, -0.5); arm(r, -1, 0.13, y, z, 1, -0.6, -0.5);
      P.handL.rotation.set(-0.5, 0, -0.5); P.handR.rotation.set(-0.5, 0, 0.5); held(r, 0, y + 0.07, z + 0.05, -0.25); P.head.rotation.x = 0.04;
    },
    // put_headphones_on: lift the pair over someone's head p.z m in front (crown at p.h m) and settle them on (one-shot ~2.2 s)
    put_headphones_on(r, t, p) {
      const P = r.parts, d = r.d, u = once(t, p, 2.2), top = hipsY(r, p.h ?? 1.8) - d.hipY - 0.06, zf = hipsY(r, p.z ?? 0.5); breathe(r, t);
      let y, z, x;
      if (u < 0.4) { const k = ez(u / 0.4); y = d.headC - 0.12 + (top + 0.06 - d.headC + 0.12) * k; z = 0.3 + (zf - 0.3) * k; x = 0.13 + 0.03 * k; }
      else if (u < 0.75) { const k = ez((u - 0.4) / 0.35); y = top + 0.06 - 0.2 * k; z = zf; x = 0.16 - 0.02 * k; }
      else { y = top - 0.14; z = zf; x = 0.14; }
      arm(r, 1, x, y, z, 1, -0.5, -0.5); arm(r, -1, x, y, z, 1, -0.5, -0.5);
      P.handL.rotation.set(-0.6, 0, -0.5); P.handR.rotation.set(-0.6, 0, 0.5); held(r, 0, y + 0.07, z + 0.05, -0.2);
      P.torso.rotation.x = 0.06; P.head.rotation.x = -0.15;
    },
    // laugh_big: helpless, doubled over, rocking, a hand on a thigh and one on the belly
    laugh_big(r, t, p) {
      const P = r.parts, d = r.d, sh = abs(S(t * 9)), w = 0.5 + 0.5 * S(t * 0.9);
      if (!r.seated) hang(r, t);
      P.torso.rotation.x = 0.32 + 0.16 * w + 0.04 * sh; P.head.rotation.x = -0.32 * (1 - w) + 0.06 * sh;
      toTorso(r, -0.24, 0.17); arm(r, 1, 0.13, TY + 0.01 * sh, TZ, 1, -0.4, -0.6);
      arm(r, -1, 0.06, 0.12 * (d.T / 0.47) + 0.012 * S(t * 18), d.bellyZ + 0.07, 1, -0.3, -1);
      P.armL.position.y += 0.006 * S(t * 18); P.armR.position.y += 0.006 * S(t * 18);
    },
    kneel,
    // bandage: kneeling beside someone, wrapping their ribs (p.h m: the wrap's height, p.z m: how far in front)
    bandage(r, t, p) {
      kneel(r, t); const P = r.parts, w = t * 2.6, hy = P.hips.position.y;
      P.torso.rotation.x = 0.38;
      toTorso(r, wy(r, p.h ?? 0.5, hy), hipsY(r, p.z ?? 0.4));
      arm(r, 1, 0.08 + 0.1 * C(w), TY + 0.06 * S(w), TZ + 0.05 * S(w), 1, -0.6, -0.4); arm(r, -1, 0.12 - 0.04 * C(w), TY + 0.02, TZ - 0.04, 1, -0.6, -0.4);
      P.handL.rotation.x = 0.4; P.handR.rotation.x = 0.4; P.head.rotation.x = 0.35;
    },
    // sit_bench: sat on a bench (p.h m, 0.45), hands on the thighs, a little slumped
    sit_bench(r, t, p) {
      sit(r, t, p); const P = r.parts, d = r.d;
      P.torso.rotation.x = 0.12 + 0.015 * S(t * 1.6); P.head.rotation.x = 0.06;
      arm(r, 1, d.shX * 0.6, -0.04, 0.34, 1, -0.2, -1); arm(r, -1, d.shX * 0.6, -0.04, 0.34, 1, -0.2, -1);
    },
    sit_floor_wall(r, t, p) { floorSit(r, t, p); },
    // sleep_back: asleep on his back on the floor (under a coat), hands on his chest, head rolled to one side
    sleep_back(r, t) {
      A.lie(r, t); const P = r.parts;
      const d = r.d; P.head.rotation.set(0.0, 0.55, 0.08); P.torso.rotation.x = 0.018 * S(t * 1.1);
      arm(r, 1, 0.07, 0.17 * (d.T / 0.47), d.chestZ + 0.05, 0.4, -1, -0.2); arm(r, -1, 0.04, 0.1 * (d.T / 0.47), d.bellyZ + 0.06, 0.4, -1, -0.2);
      P.handL.rotation.set(0, 0, -0.3); P.handR.rotation.set(0, 0, 0.3);
      P.legL.rotation.z = 0.06; P.legR.rotation.x = -0.25; P.shinR.rotation.x = 0.5;
    },
    // get_up_hurt: from the floor to a hunched stand, a hand on the wall, then the ribs (one-shot ~3.2 s)
    get_up_hurt(r, t, p) {
      const u = once(t, p, 3.2);
      if (u < 0.35) blend2(r, t, p, lieSide, kneel, ez(u / 0.35));
      else if (u < 0.65) blend2(r, t, p, kneel, kneelUp, ez((u - 0.35) / 0.3));
      else blend2(r, t, p, kneelUp, standHurt, ez((u - 0.65) / 0.35));
      r.seated = false; r.floorSit = false; r.lying = u < 0.2;
    },
    hurt_stand(r, t, p) { hurtStand(r, t, p); },
    // wave_arm: big fast sweeps overhead (shooing drones)
    wave_arm(r, t) {
      const P = r.parts, d = r.d, w = S(t * 11); base(r, t);
      arm(r, -1, d.shX + 0.05 + 0.25 * w, d.headC + 0.12 - 0.05 * abs(w), 0.2, 1, -0.6, 0.2);
      P.handR.rotation.z = 0.5 * w; P.torso.rotation.y = -0.1 * w; P.head.rotation.x = -0.15;
    },
    // swat: Chase (2040) batting away pop-ups nobody else can see
    swat(r, t) {
      const P = r.parts, d = r.d, a = S(t * 7.3), b = S(t * 5.1 + 1.3); breathe(r, t);
      arm(r, -1, 0.05 + 0.18 * a, d.headC - 0.04 + 0.06 * b, 0.32, 1, -0.7, -0.2); arm(r, 1, 0.05 - 0.15 * b, d.headC - 0.1 + 0.05 * a, 0.3, 1, -0.7, -0.2);
      P.handR.rotation.z = 0.6 * a; P.handL.rotation.z = -0.6 * b; P.head.rotation.set(-0.05, 0.15 * a, 0.08 * b); P.torso.rotation.y = 0.08 * a;
    },
    // sizzle_flip: tongs at the hotplate, turning snags with a flick of the wrist (shows tongs)
    sizzle_flip(r, t) {
      const P = r.parts, d = r.d, cyc = (t % 1.6) / 1.6, flip = cyc > 0.55 && cyc < 0.8 ? S(((cyc - 0.55) / 0.25) * PI) : 0, dip = cyc < 0.5 ? S((cyc / 0.5) * PI) : 0; base(r, t);
      arm(r, -1, 0.1 + 0.08 * S(t * 0.8), -0.04 - 0.03 * dip + 0.06 * flip, 0.38, 1, -0.8, -0.4); P.handR.rotation.set(0.2, 0, 2.2 * flip);
      arm(r, 1, d.shX + 0.03, 0.02, 0.02, 1, -1, 0.4); P.handL.rotation.z = 0.8;
      P.torso.rotation.x += 0.12; P.head.rotation.x = 0.3;
    },
    // hum: eyes half shut, head swaying, mouth closed (Blend In; Chase humming unfinished melodies)
    hum(r, t, p) {
      A.idle(r, t, p); const P = r.parts; P.head.rotation.z = 0.06 * S(t * 1.6); P.head.rotation.x += 0.03 * S(t * 3.2);
      if (!r.talking && r.face.over !== 'closed') { r.face.over = 'closed'; r.face.redraw(); }
    },
    // pull_cracker: reach the cracker end to the middle (p.z m to the partner's halfway), yank, hold up the half
    pull_cracker(r, t, p) {
      const P = r.parts, d = r.d, u = once(t, p, 1.6), yank = u > 0.62 ? ez(min(1, (u - 0.62) / 0.12)) : 0, hold = u > 0.8 ? ez((u - 0.8) / 0.2) : 0, z = hipsY(r, p.z ?? 0.3); breathe(r, t);
      arm(r, -1, 0.0 + 0.1 * hold, 0.2 + 0.28 * hold, z - 0.2 * yank, 1, -0.8, -0.3); P.handR.rotation.x = -0.3;
      arm(r, 1, d.shX * 0.85, 0.04, 0.1, 1, -1, -0.4);
      P.torso.rotation.x = 0.06 - 0.16 * yank; P.head.rotation.x = 0.12 * (1 - yank) - 0.12 * yank;
    },
    // brush_shoulder: the left hand flicks something off the right shoulder, twice (one-shot ~1 s)
    brush_shoulder(r, t, p) {
      const P = r.parts, d = r.d, u = once(t, p, 1), k = u < 0.15 ? ez(u / 0.15) : u > 0.85 ? ez((1 - u) / 0.15) : 1, b = u > 0.15 && u < 0.85 ? S(u * 4 * PI) : 0; base(r, t);
      arm(r, 1, (d.shX + 0.04) * (1 - k) - d.shX * 0.75 * k, -0.15 * (1 - k) + (d.armY + 0.06) * k, 0.06 + 0.04 * b * k, 1, -0.8, -0.2);
      P.handL.rotation.set(0.2 * b, 0, 0.6 * k); P.head.rotation.y = -0.4 * k; P.head.rotation.x = 0.15 * k;
    },
    // piano_play: hands on the keys at keyboard height (seated on the stool, or standing), walking the phrase
    piano_play(r, t) {
      const P = r.parts, y = r.seated ? 0.14 : -0.02, z = 0.34; breathe(r, t);
      arm(r, 1, 0.12 + 0.05 * S(t * 1.3), y + 0.012 * max(0, S(t * 9)), z, 1, -0.6, -0.5); arm(r, -1, 0.1 + 0.05 * S(t * 1.1 + 2), y + 0.012 * max(0, S(t * 11 + 1)), z, 1, -0.6, -0.5);
      P.handL.rotation.x = 0.3 + 0.15 * max(0, S(t * 9)); P.handR.rotation.x = 0.3 + 0.15 * max(0, S(t * 11)); P.head.rotation.x = 0.15 + 0.05 * S(t * 3.07); P.torso.rotation.x += 0.08 + 0.02 * S(t * 3.07);
    },
    // uke: Mia's ukulele against her, left hand on the neck, right hand strumming (seated or standing)
    uke(r, t) {
      const P = r.parts, d = r.d, k = d.T / 0.47, st = S(t * 7.5); breathe(r, t);
      arm(r, -1, -0.02 + 0.015 * st, 0.12 * k + 0.035 * st, d.bellyZ + 0.12, 1, -0.8, -0.4); P.handR.rotation.set(-0.4, 0, 0.3 + 0.25 * st);
      arm(r, 1, 0.26, 0.22 * k, d.chestZ + 0.14, 1, -0.9, -0.5); P.handL.rotation.set(-0.8, 0, -0.5);
      P.head.rotation.x = 0.25; P.head.rotation.z = 0.05 * S(t * 1.5);
    },
    // carry_box: a box held in front in both hands (shows box); an upper anim, so it walks
    carry_box(r, t) {
      const P = r.parts, d = r.d, y = 0.14 * (d.T / 0.47), z = d.chestZ + 0.2; breathe(r, t);
      arm(r, 1, 0.22, y, z, 1, -1, -0.3); arm(r, -1, 0.22, y, z, 1, -1, -0.3); P.handL.rotation.set(0, 0, -0.4); P.handR.rotation.set(0, 0, 0.4); P.torso.rotation.x -= 0.05;
    },
    // write_note: pad in the left hand, biro in the right, scribbling (shows notepad + biro)
    write_note(r, t, p) {
      const P = r.parts, d = r.d, y = r.seated ? 0.2 : 0.12 * (d.T / 0.47), z = d.chestZ + 0.16; breathe(r, t);
      arm(r, 1, 0.07, y, z, 1, -1, -0.4); P.handL.rotation.set(-0.9, -0.4, 0);
      arm(r, -1, 0.0 + 0.012 * S(t * 9), y + 0.03 + 0.006 * S(t * 23), z + 0.01 * C(t * 7), 1, -0.8, -0.4); P.handR.rotation.x = -0.5;
      P.head.rotation.x = 0.4; P.neck.rotation.x = 0.1;
    },
    // eat: a bite every 2.6 s, chewing between (shows food: a mince pie, Jayden's muesli bar, a snag in bread)
    eat(r, t) {
      const P = r.parts, d = r.d, c = (t % 2.6) / 2.6, k = c < 0.35 ? ez(min(1, c / 0.12)) * ez(min(1, (0.35 - c) / 0.12)) : 0; base(r, t);
      arm(r, -1, 0.1 - 0.06 * k, 0.2 + (d.headC - 0.32) * k, d.chestZ + 0.18 - 0.04 * k, 1, -0.6, -0.4); P.handR.rotation.x = -0.4 * k;
      const m = c > 0.35 && c < 0.9 ? (S(t * 14) > 0 ? 'closed' : 'O') : null;
      if (!r.talking && r.face.over !== m) { r.face.over = m; r.face.redraw(); }
    },
    // still: Future Luka. Barely breathing, no drift.
    still(r, t) { hang(r, 0); breathe(r, t, 0.45); },
    push(r, t, p) {                       // shoulder into something heavy (a trolley, a cabinet, a door)
      const P = r.parts, d = r.d; breathe(r, t);
      if (!p.walk && !r.seated) { P.hips.position.y -= 0.05; leg(r, 1, d.hipX, d.footH - d.hipY + 0.05, 0.22); leg(r, -1, d.hipX, d.footH - d.hipY + 0.05, -0.26); flat(r); }
      P.torso.rotation.x += 0.38; arm(r, 1, 0.16, 0.3, 0.44, 1, -1, -0.4); arm(r, -1, 0.16, 0.3, 0.44, 1, -1, -0.4); P.handL.rotation.x = -1.1; P.handR.rotation.x = -1.1; P.head.rotation.x = -0.25;
    },
    reach_up(r, t) { const P = r.parts, d = r.d; breathe(r, t); arm(r, 1, 0.14, d.headC + 0.36, 0.16, 1, -0.2, -0.6); arm(r, -1, 0.14, d.headC + 0.36, 0.16, 1, -0.2, -0.6); P.handL.rotation.x = -0.4; P.handR.rotation.x = -0.4; P.head.rotation.x = -0.4; },
    shush(r, t) { const P = r.parts, d = r.d; base(r, t); arm(r, -1, 0.03, d.headC - 0.2, 0.13, 1, -1, -0.3); P.handR.rotation.set(-1.25, 0, 0.1); P.head.rotation.x = 0.06; },
    think(r, t) { const P = r.parts, d = r.d; base(r, t); arm(r, -1, 0.04, d.headC - 0.25, 0.12, 1, -1, -0.3); P.handR.rotation.set(-1.0, 0, 0.3); arm(r, 1, 0.06, 0.1, d.bellyZ + 0.08, 1, -0.4, -1); P.head.rotation.set(0.05, 0.1, 0.06); },
    arms_crossed(r, t) { const P = r.parts, d = r.d; breathe(r, t); arm(r, 1, -0.06, 0.2, d.chestZ + 0.08, 1, -1, -0.4); arm(r, -1, -0.06, 0.18, d.chestZ + 0.12, 1, -1, -0.4); P.handL.rotation.z = -0.5; P.handR.rotation.z = 0.5; },
    hands_hips(r, t) { const P = r.parts, d = r.d; breathe(r, t); arm(r, 1, d.shX + 0.06, 0.0, 0.0, 1, -0.6, 0.8); arm(r, -1, d.shX + 0.06, 0.0, 0.0, 1, -0.6, 0.8); P.handL.rotation.z = 1.0; P.handR.rotation.z = -1.0; },
    gesture(r, t) { const P = r.parts, d = r.d, a = S(t * 2.3), b = S(t * 3.1 + 1); base(r, t); arm(r, -1, d.shX * 0.6 + 0.05 * a, 0.12 + 0.05 * b, 0.3 + 0.04 * a, 1, -1, -0.4); P.handR.rotation.set(-0.3, 0.6 + 0.3 * b, 0); P.head.rotation.y = 0.05 * a; },
    brick_call(r, t, p) { A.phone(r, t, p); },   // Rue's brick phone at the ear (phone shows the smartphone)
    // ---- Rue's content anims, ported
    stumble(r, t, pp) {
      const P = r.parts, u = Math.min(1, t / (pp.dur || 0.35)), k = S(u * PI), o = r.d.armOut || 0.1;
      r.seated = false; P.hips.position.z -= 0.05 * k; P.hips.position.y -= 0.03 * k;
      P.legR.rotation.x = 0.5 * k; P.shinR.rotation.x = 0.08 + 0.6 * k; P.footR.rotation.x = -0.3 * k; P.legL.rotation.x = -0.18 * k; P.shinL.rotation.x = 0.08 + 0.25 * k;
      P.torso.rotation.x = -0.3 * k; P.head.rotation.x = 0.22 * k; P.armL.rotation.set(-0.4 * k, 0, o + 0.9 * k); P.armR.rotation.set(-0.4 * k, 0, -o - 0.9 * k);
      P.foreL.rotation.x = -0.14 - 0.5 * k; P.foreR.rotation.x = -0.14 - 0.5 * k;
    },
    bop(r, t, p) { if (!p.walk) A.idle(r, t, p); const k = (1 - C(t * 2 * PI * 92 / 60)) / 2; r.parts.head.rotation.x += 0.16 * k; r.parts.neck.rotation.x += 0.05 * k; },   // nodding along at 92 bpm
    fold(r, t, p) { A.clap(r, 0, p); const P = r.parts; P.handL.rotation.x = 0.1; P.handR.rotation.x = 0.1; P.torso.rotation.x += 0.015 * S(t * 1.6); },
    bow(r, t, p) { A.idle(r, t, p); const k = S(min(1, t / (p.dur || 1.8)) * PI); r.parts.torso.rotation.x += 0.62 * k; r.parts.head.rotation.x += 0.18 * k; },
    lift_head(r, t, p) { A.idle(r, t, p); const u = min(1, t / (p.dur || 2.8)), k = 1 - u * u * (3 - 2 * u), P = r.parts; P.torso.rotation.x += 0.3 * k; P.neck.rotation.x += 0.2 * k; P.head.rotation.x += 0.4 * k; },
    back_hand(r, t, p) { A.idle(r, t, p); const P = r.parts; P.armL.rotation.set(0.45, 0, 1.0); P.foreL.rotation.set(-0.5, 0, 0); P.handL.rotation.set(0, 0, 0.3); P.torso.rotation.z -= 0.06; P.head.rotation.y = 0.35; },
    mouth_bare(r, t, p) { A.drink(r, min(t, 0.9), p); },
  });
  for (const n of ['reading', 'drink', 'phone', 'pour']) A[n + '_bare'] = (r, t, p) => A[n](r, t, p);   // the pose without its prop
  RIGKIT = { ik, arm, leg, flat, hang, breathe, base, once, hipsY, gait, sit, toTorso, torso: () => [TY, TZ], blend2, towards, kneel, floorSit, cl, ez };
  for (const n of ('idle phone type point hands_head head_hands lanyard nod shake shrug laugh cry wave pour drink carry_mug look_up look_down write give lanyard_on hug knock fake_call chew tap clap wipe umbrella reading glance whistle'
    + ' polish hands_rise hands_halt head_in_hands tether_throw chip_ping coat_throw type_phone hold_headphones_up put_headphones_on laugh_big hurt_stand wave_arm swat sizzle_flip hum pull_cracker brush_shoulder piano_play uke carry_box write_note eat still push reach_up shush think arms_crossed hands_hips gesture brick_call bop fold bow lift_head back_hand mouth_bare reading_bare drink_bare phone_bare pour_bare').split(' ')) A[n].upper = true;
  A.phone.shows = 'phone'; A.brick_call.shows = A.fake_call.shows = 'brick';
  A.pour.shows = A.drink.shows = A.carry_mug.shows = 'mug'; A.reading.shows = 'textbook'; A.umbrella.shows = 'umbrella';
  A.type_phone.shows = 'phone'; A.tether_throw.shows = 'tether'; A.sizzle_flip.shows = 'tongs'; A.pull_cracker.shows = 'cracker'; A.carry_box.shows = 'box';
  A.write_note.shows = ['notepad', 'biro']; A.eat.shows = 'food'; A.hold_headphones_up.shows = A.put_headphones_on.shows = 'headphones_held'; A.uke.shows = 'ukulele';
  A.laugh.expr = 'laugh'; A.cry.expr = 'crying'; A.sleep.expr = 'sleep';
  A.laugh_big.expr = A.scooter_laugh.expr = 'laugh'; A.lift_strain.expr = 'wince'; A.get_up_hurt.expr = A.hurt_stand.expr = 'hurt'; A.hum.expr = 'hum'; A.sleep_back.expr = 'sleep';
  A.chip_ping.expr = 'wince'; A.still.expr = 'still';
  // one-shot defaults (s): play(name) returns to the previous anim after this long. The world's ONE table should
  // include ANIM_ONE (Object.assign(ONE, ANIM_ONE)); until it does, play them with { dur, loop: false }.
  for (const n in ANIM_ONE) A[n].one = ANIM_ONE[n];
  return A;
})());

// ------------------------------------------------------------ PROPS, DRONES (TWO)
// PROPS[id](opts) -> Object3D in metres (origin on the floor at its centre unless noted; facing +Z). Built once per
// (id, opts) with a vertex-coloured Builder (one material + a light / screen material where needed), then cloned:
// geometry and materials are shared, so a prop costs one draw call per material. Named sub-parts and the userData API
// are listed per prop. Hand props (remote, slate, tongs, ...) double as rig attachments (buildCharacter's attP).
//   des({key})            chrome smart kettle; userData.show('DES' | 'boil' | 'tea' | 'off' | any text), screen = { canvas, ctx, tex, paint(fn) }
//   kettle()              plain white jug kettle (Rue's backroom)
//   brick_phone()         1980s brick phone standing on its base (antenna up)
//   remote()              cream receiver gaffer-taped to a display Neural Chip, a coil of 2040 cable and a jack
//   slate({key})          the music slate: thin glass tablet; userData.screen (paint(fn), list(title, lines))
//   neural_chip({light})  a chip on a tiny velvet pillow in a tethered cradle; userData.setLight(state)
//   hover_car({col})      a car hovering a foot off the road; userData.setGlow(state), blink(side 'L'|'R'|null)
//   hover_scooter({col})  two-seat hire hover-scooter; userData.seat / pillion / bars / feet (local metres), setGlow
//   hover_trolley()       shopping trolley floating a foot up, CAUTION: TROLLEY; userData.setGlow
//   padded_bollard()      bollard in quilted cream foam      safesense_kiosk({key}) userData.show(text), setLight
//   tether_coil({hand, pocket})  the coiled display security tether with its broken cradle clip
//   tether_line()         the thrown tether: userData.span(ax, ay, az, bx, by, bz) stretches it between two points (no allocation)
//   scan_cone({len, half}) a drone's floor cone (transparent); userData.setLight(state)   hug_field() the soft blue escort field
//   santa_hat(), santa_beard(), headphones(), ukulele(), tongs(), coaster(), notepad(), biro(), food({kind}), cracker(),
//   box(), gift(), coat_thrown({col}), foam()  (safety foam bloom: userData.grow(k))
// PROPS.parts(id, opts) -> [{ geometry, material }] for InstancedMesh repeats (bollards, cars). buildDrone(kind) and
// DRONE_INSTANCED below. All of it is warmed at boot (ART_WARM_KIT rides on the first character built).
const PROPS = {};
const DRONE_LIGHTS = { patrol: 0x6fc8ff, curious: 0xffb020, escort: 0xff3b30, yes: 0xffd21f, white: 0xe8f6ff, green: 0x5ae08a, off: null };
const droneLightMat = (() => { const M = {}; return (st) => M[st] || (M[st] = (() => { const c = st in DRONE_LIGHTS ? DRONE_LIGHTS[st] : DRONE_LIGHTS.patrol; return c == null ? mat(0x23272e) : mat(0x000000, { emissive: c, emissiveIntensity: 1.25 }); })()); })();   // cached: setLight allocates nothing
const ART_KIT = (() => {
  const C = new THREE.Color(), XF = new THREE.Matrix4(), E = new THREE.Euler(), Q = new THREE.Quaternion(), V = new THREE.Vector3(), S = new THREE.Vector3();
  // colour every vertex: a hex, or fn(x, y, z, nx, ny, nz) -> colour
  function paint(g, hex, fn) {
    if (!g.attributes.normal) g.computeVertexNormals();
    const p = g.attributes.position, n = g.attributes.normal, a = new Float32Array(p.count * 3);
    for (let i = 0; i < p.count; i++) { C.set(fn ? fn(p.getX(i), p.getY(i), p.getZ(i), n.getX(i), n.getY(i), n.getZ(i)) : hex); a[i * 3] = C.r; a[i * 3 + 1] = C.g; a[i * 3 + 2] = C.b; }
    g.setAttribute('color', new THREE.BufferAttribute(a, 3)); return g;
  }
  const place = (g, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0, sx = 1, sy = sx, sz = sx) => g.applyMatrix4(XF.compose(V.set(x, y, z), Q.setFromEuler(E.set(rx, ry, rz)), S.set(sx, sy, sz)));
  // a recorder on a fresh Builder; every adder returns the recorder. m = material (default: the shared white vertex-colour one)
  function kit() {
    const b = new Builder(), W = mat(0xffffff);
    const k = {
      add(g, hex, m, fn) { b.add(paint(g, hex, fn), m || W); return k; },
      box(w, h, d, hex, x, y, z, rx, ry, rz, m) { return k.add(place(new THREE.BoxGeometry(w, h, d), x, y, z, rx, ry, rz), hex, m); },
      cyl(rt, rb, h, seg, hex, x, y, z, rx, ry, rz, m, fn) { return k.add(place(new THREE.CylinderGeometry(rt, rb, h, seg), x, y, z, rx, ry, rz), hex, m, fn); },
      arc(r, h, seg, a0, al, hex, x, y, z, rx, ry, rz, m) { return k.add(place(new THREE.CylinderGeometry(r, r, h, seg, 1, true, a0, al), x, y, z, rx, ry, rz), hex, m); },
      sph(r, hex, x, y, z, sx = 1, sy = sx, sz = sx, m, ws = 8, hs = 6, fn) { return k.add(place(new THREE.SphereGeometry(r, ws, hs), x, y, z, 0, 0, 0, sx, sy, sz), hex, m, fn); },
      lathe(pts, seg, hex, x = 0, y = 0, z = 0, m, fn, sx = 1, sz = sx) { return k.add(place(new THREE.LatheGeometry(pts.map(([r, yy]) => new THREE.Vector2(r, yy)), seg), x, y, z, 0, 0, 0, sx, 1, sz), hex, m, fn); },
      torus(R, r, rs, ts, hex, x, y, z, rx, ry, rz, m, arcL = Math.PI * 2) { return k.add(place(new THREE.TorusGeometry(R, r, rs, ts, arcL), x, y, z, rx, ry, rz), hex, m); },
      tube(pts, r, segs, hex, m, rad = 4) { return k.add(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts.map((p) => new THREE.Vector3(p[0], p[1], p[2]))), segs, r, rad, false), hex, m); },
      plane(w, h, hex, x, y, z, rx, ry, rz, m) { return k.add(place(new THREE.PlaneGeometry(w, h), x, y, z, rx, ry, rz), hex, m); },
      done(o) { return b.done({ floor: false, ...o }); },
    };
    return k;
  }
  const helix = (r, len, turns, n, y0 = 0) => { const pts = []; for (let i = 0; i <= n; i++) { const u = i / n, a = u * turns * Math.PI * 2; pts.push([Math.cos(a) * r, y0 + u * len, Math.sin(a) * r]); } return pts; };
  // cached prop groups: built once per key, then cloned (geometry + materials shared; userData API added per clone)
  const cache = new Map();
  const cached = (key, build) => { let g = cache.get(key); if (!g) { g = build(); g.name = key; cache.set(key, g); } return g.clone(); };
  // self-lit screens: screen(key, w, h, paint) -> { canvas, ctx, tex, mat, w, h, paint(fn) }; one per key, shared by clones
  const SCR = new Map();
  function screen(key, w, h, paint0) {
    let s = SCR.get(key); if (s) return s;
    const tex = canvasTex(w, h, (c) => { if (paint0) paint0(c, w, h); }, { key: 'scr_' + key, nearest: true });
    const canvas = tex.image;
    s = { key, canvas, ctx: canvas.getContext('2d'), tex, w, h, mat: matTex(tex, { emissive: 0xffffff }), paint(fn) { fn(s.ctx, w, h); tex.needsUpdate = true; return s; } };
    SCR.set(key, s); return s;
  }
  const lights = (o) => { const L = []; o.traverse((m) => { if (m.isMesh && m.material && m.material.userData && m.material.userData.light) L.push(m); }); return L; };
  return { paint, place, kit, helix, cached, screen, lights };
})();
// light materials are tagged so clones can find their light meshes; setLight swaps materials (no per-drone material)
for (const st in DRONE_LIGHTS) droneLightMat(st).userData.light = true;
const droneSetLight = (o, st) => { const m = droneLightMat(st); for (const l of o.userData.lights) l.material = m; o.userData.state = st; };

(() => {
  const { kit, helix, cached, screen } = ART_KIT, PI = Math.PI, H = PI / 2, TAU = PI * 2, LT = () => droneLightMat('patrol');
  const font = (px, w = 'bold') => `${w} ${px}px Arial, sans-serif`;
  // ---- Des: the chrome kettle on a phone plan
  const desPaint = (mode) => (c, w, h) => {
    c.fillStyle = '#03101a'; c.fillRect(0, 0, w, h);
    if (mode === 'off') return;
    c.fillStyle = '#86d8ff'; c.textAlign = 'center'; c.textBaseline = 'middle';
    if (mode === 'boil') { c.font = font(17); c.fillText('BOILING', w / 2, 20); c.strokeStyle = '#86d8ff'; c.lineWidth = 2; c.strokeRect(14, 38, w - 28, 12); c.fillRect(17, 41, (w - 34) * 0.7, 6); }
    else if (mode === 'tea') { c.font = font(32); c.fillText('Tea?', w / 2, h / 2 + 2); }
    else { const t = mode == null || mode === 'DES' ? 'DES' : String(mode); c.font = font(t.length > 6 ? 18 : 34); c.fillText(t, w / 2, h / 2 + 2, w - 10); }
    c.fillStyle = 'rgba(134,216,255,0.18)'; c.fillRect(0, 0, w, 3);
  };
  PROPS.des = (o = {}) => {
    const sc = screen(o.key || 'des', 128, 64, desPaint('DES'));
    const g = cached('des|' + sc.key, () => {
      const k = kit(), chrome = (x, y, z, nx, ny, nz) => { const a = Math.atan2(nx, nz), v = 0.5 + 0.5 * Math.sin(a * 2 + 0.6) * Math.cos(y * 18); return v > 0.75 ? '#f4f6f8' : v > 0.45 ? '#c3c8cf' : v > 0.2 ? '#9097a0' : '#6c727a'; };
      k.cyl(0.11, 0.115, 0.022, 16, '#25272b', 0, 0.011, 0);
      k.lathe([[0.001, 0.022], [0.086, 0.022], [0.096, 0.06], [0.098, 0.14], [0.091, 0.2], [0.072, 0.236], [0.05, 0.246], [0.001, 0.248]], 16, null, 0, 0, 0, null, chrome);
      k.cyl(0.052, 0.054, 0.012, 14, '#2c2f34', 0, 0.252, 0); k.box(0.03, 0.016, 0.014, '#2c2f34', 0, 0.265, 0);
      k.cyl(0.012, 0.022, 0.07, 8, null, 0, 0.19, 0.105, 0.85, 0, 0, null, chrome);           // spout
      k.box(0.02, 0.15, 0.022, '#2c2f34', 0, 0.14, -0.13); k.box(0.02, 0.022, 0.05, '#2c2f34', 0, 0.21, -0.108); k.box(0.02, 0.022, 0.05, '#2c2f34', 0, 0.075, -0.108);
      k.box(0.086, 0.05, 0.008, '#121418', 0, 0.105, 0.097);                                    // screen bezel
      k.plane(0.074, 0.037, '#ffffff', 0, 0.105, 0.1015, 0, 0, 0, sc.mat);
      return k.done();
    });
    g.userData.screen = sc; g.userData.show = (mode) => sc.paint(desPaint(mode)); g.userData.mode = 'DES';
    return g;
  };
  PROPS.kettle = () => cached('kettle', () => {
    const k = kit();
    k.cyl(0.1, 0.105, 0.02, 14, '#2e3034', 0, 0.01, 0);
    k.lathe([[0.001, 0.02], [0.085, 0.02], [0.09, 0.1], [0.082, 0.2], [0.06, 0.23], [0.001, 0.232]], 14, '#efeeea');
    k.box(0.016, 0.12, 0.036, '#3a74c0', 0.0, 0.11, 0.088, 0, 0, 0);                           // water window
    k.box(0.022, 0.16, 0.026, '#e4e3df', 0, 0.13, -0.12); k.box(0.022, 0.022, 0.05, '#e4e3df', 0, 0.2, -0.1); k.box(0.022, 0.022, 0.05, '#e4e3df', 0, 0.06, -0.1);
    k.box(0.05, 0.03, 0.06, '#efeeea', 0, 0.2, 0.08, -0.4, 0, 0);
    return k.done();
  });
  // ---- the brick phone (Rue's): grey, keypad, green LCD, antenna. pocket: the same piece (worn in Rue's cardigan)
  PROPS.brick_phone = () => cached('brick_phone', () => {
    const k = kit();
    k.box(0.056, 0.2, 0.046, '#8b8f94', 0, 0.1, 0); k.box(0.05, 0.03, 0.004, '#3a4a3a', 0, 0.165, 0.024); k.box(0.042, 0.022, 0.003, '#8cc08a', 0, 0.165, 0.0265);
    for (let r = 0; r < 4; r++) for (let c = 0; c < 3; c++) k.box(0.011, 0.008, 0.004, '#d8dadc', (c - 1) * 0.015, 0.125 - r * 0.016, 0.024);
    k.box(0.04, 0.018, 0.006, '#5d6064', 0, 0.025, 0.024); k.cyl(0.005, 0.007, 0.13, 6, '#232427', 0.016, 0.26, -0.008);
    return k.done();
  });
  // ---- the Remote: a cream phone receiver gaffer-taped to a display Neural Chip; coil cable; a jack
  PROPS.remote = () => cached('remote', () => {
    const k = kit(), cream = '#e0d4b4';
    k.box(0.036, 0.15, 0.03, cream, 0, 0, 0); k.box(0.05, 0.045, 0.05, cream, 0, 0.085, 0.012, 0.25, 0, 0); k.box(0.05, 0.045, 0.05, cream, 0, -0.085, 0.012, -0.25, 0, 0);
    k.cyl(0.018, 0.018, 0.004, 10, '#a89c80', 0, 0.09, 0.038, H, 0, 0); k.cyl(0.018, 0.018, 0.004, 10, '#a89c80', 0, -0.09, 0.038, H, 0, 0);
    k.box(0.03, 0.044, 0.012, '#f2f4f6', 0, 0.0, -0.022); k.box(0.006, 0.006, 0.004, '#6fc8ff', 0, 0.012, -0.029);   // the display chip on the back
    for (const y of [-0.02, 0.02]) k.box(0.042, 0.012, 0.046, '#9aa0a6', 0, y, -0.004);                                // gaffer tape
    k.tube(helix(0.008, 0.09, 7, 70, 0).map(([x, y, z]) => [x, -0.11 - y, z + 0.004]), 0.0022, 70, '#d8cfb2');            // the coil of 2040 cable
    k.cyl(0.004, 0.004, 0.03, 6, '#b9bec4', 0, -0.215, 0.004); k.cyl(0.0025, 0.0018, 0.014, 6, '#e8e8e8', 0, -0.236, 0.004);   // a jack that fits nothing
    return k.done();
  });
  // ---- the music slate: a thin glass tablet; its screen is a shared canvas (key 'slate')
  const slateList = (title, lines) => (c, w, h) => {
    c.fillStyle = '#0d1116'; c.fillRect(0, 0, w, h); c.fillStyle = '#1d2a36'; c.fillRect(0, 0, w, 26);
    c.fillStyle = '#d8e6f0'; c.font = font(15); c.textAlign = 'left'; c.textBaseline = 'middle'; c.fillText(title, 10, 13);
    c.font = font(11, 'normal'); lines.forEach((l, i) => { c.fillStyle = i % 2 ? '#13191f' : '#0f1418'; c.fillRect(0, 30 + i * 16, w, 16); c.fillStyle = '#9fb6c8'; c.fillText(l, 10, 38 + i * 16, w - 20); });
  };
  PROPS.slate = (o = {}) => {
    const sc = screen(o.key || 'slate', 256, 160, slateList('two  ·  2,847 items', ['two_v1.wav', 'two_v2_FINAL.wav', 'two_v2_FINAL_real.wav', 'two_v3_bridge_idea.wav', '...', 'two_v1204_dont.wav', '...', 'two_v2847.wav']));
    const g = cached('slate|' + sc.key, () => {
      const k = kit();
      k.box(0.24, 0.006, 0.155, '#202328', 0, 0.003, 0); k.box(0.244, 0.004, 0.159, '#5a5f66', 0, 0.001, 0);
      k.plane(0.228, 0.143, '#ffffff', 0, 0.0065, 0, -H, 0, 0, sc.mat);
      return k.done();
    });
    g.userData.screen = sc; g.userData.list = (title, lines) => sc.paint(slateList(title, lines));
    return g;
  };
  // ---- a Neural Chip on a velvet pillow in a tethered cradle (the 2040 display wall)
  PROPS.neural_chip = (o = {}) => {
    const g = cached('neural_chip', () => {
      const k = kit();
      k.box(0.09, 0.03, 0.07, '#dfe3e8', 0, 0.015, 0); k.box(0.08, 0.008, 0.06, '#c4cad2', 0, 0.034, 0);
      k.box(0.064, 0.014, 0.048, '#2c2f6e', 0, 0.044, 0); k.box(0.056, 0.008, 0.04, '#363a80', 0, 0.053, 0);   // velvet pillow
      k.sph(0.011, '#f4f6f8', 0, 0.062, 0, 1.6, 0.6, 1); k.box(0.004, 0.003, 0.004, '#ffffff', 0.014, 0.064, 0, 0, 0, 0, LT());   // the chip + its light
      k.tube([[0.0, 0.03, -0.035], [0.0, 0.02, -0.06], [0.01, 0.006, -0.08], [0.03, 0.004, -0.1], [0.05, 0.004, -0.11]], 0.003, 12, '#1c1c1e');
      return k.done();
    });
    g.userData.lights = ART_KIT.lights(g); g.userData.setLight = (st) => droneSetLight(g, st); if (o.light) g.userData.setLight(o.light);
    return g;
  };
  // ---- hover-cars: about a foot off the road; underside glow, lights, indicators (Turning left. Are you sure?)
  PROPS.hover_car = (o = {}) => {
    const col = o.col || '#d84a3a';
    const g = cached('hover_car|' + col, () => {
      const k = kit(), y0 = 0.3, dk = '#1a2430', trim = '#2a2c30';
      k.box(4.1, 0.5, 1.72, col, 0, y0 + 0.27, 0); k.box(4.2, 0.18, 1.6, col, 0, y0 + 0.1, 0);
      k.box(2.2, 0.48, 1.52, col, 0, y0 + 0.74, -0.25); k.box(2.22, 0.36, 1.54, dk, 0, y0 + 0.74, -0.25);   // cabin + glass band
      k.box(0.06, 0.4, 1.4, dk, 0, y0 + 0.74, 0.88, 0.5, 0, 0); k.box(0.06, 0.38, 1.4, dk, 0, y0 + 0.72, -1.36, -0.45, 0, 0);
      k.box(1.5, 0.06, 1.62, artShade(col, 0.85), 0, y0 + 1.0, -0.25);
      k.box(0.12, 0.1, 1.74, trim, 0, y0 + 0.1, 2.08); k.box(0.12, 0.1, 1.74, trim, 0, y0 + 0.1, -2.08);
      for (const [x, z] of [[0.62, 1.45], [-0.62, 1.45], [0.62, -1.45], [-0.62, -1.45]]) k.cyl(0.32, 0.36, 0.08, 10, '#3a3d44', x, y0 - 0.02, z);   // hover pads
      for (const sx of [-1, 1]) { k.box(0.32, 0.1, 0.04, '#fffbe8', sx * 0.6, y0 + 0.36, 2.06, 0, 0, 0, LT()); k.box(0.3, 0.08, 0.04, '#ff3030', sx * 0.62, y0 + 0.38, -2.06, 0, 0, 0, droneLightMat('escort')); }
      for (const [x, z] of [[0.62, 1.45], [-0.62, 1.45], [0.62, -1.45], [-0.62, -1.45]]) k.cyl(0.26, 0.26, 0.02, 10, '#ffffff', x, y0 - 0.07, z, 0, 0, 0, LT());
      return k.done();
    });
    const glow = [];
    g.traverse((m) => { if (m.isMesh && m.material === LT()) glow.push(m); });
    g.userData.lights = glow; g.userData.setGlow = (st) => droneSetLight(g, st);
    for (const sx of [1, -1]) {   // indicators: separate tiny meshes (shared geometry) so they can blink
      const b = new THREE.Mesh(artSharedGeo('car_blink' + sx, () => ART_KIT.place(new THREE.BoxGeometry(0.14, 0.08, 0.06), sx * 0.86, 0.66, 2.04)), droneLightMat('off')); b.name = sx > 0 ? 'blinkL' : 'blinkR'; g.add(b);
    }
    const bL = g.getObjectByName('blinkL'), bR = g.getObjectByName('blinkR');
    g.userData.blink = (side, on = true) => { bL.material = on && side === 'L' ? droneLightMat('curious') : droneLightMat('off'); bR.material = on && side === 'R' ? droneLightMat('curious') : droneLightMat('off'); };
    return g;
  };
  PROPS.hover_scooter = (o = {}) => {
    const col = o.col || '#2ab8a8';
    const g = cached('hover_scooter|' + col, () => {
      const k = kit(), wh = '#eef0f2', dk = '#26292e';
      k.box(0.5, 0.18, 1.4, wh, 0, 0.32, 0); k.box(0.52, 0.06, 1.42, col, 0, 0.42, 0);              // hull + stripe
      k.box(0.36, 0.1, 0.72, dk, 0, 0.6, -0.14); k.box(0.34, 0.1, 0.42, '#30343a', 0, 0.56, -0.12);  // two-up seat
      k.box(0.44, 0.03, 0.4, '#3a3e44', 0, 0.42, 0.42);                                                  // footboard
      k.box(0.14, 0.55, 0.12, wh, 0, 0.62, 0.62, -0.25, 0, 0); k.box(0.62, 0.035, 0.035, dk, 0, 0.94, 0.7);   // stem, bars
      for (const sx of [-1, 1]) k.box(0.06, 0.045, 0.045, '#111', sx * 0.3, 0.94, 0.7);
      k.box(0.22, 0.12, 0.05, col, 0, 0.76, 0.7); k.box(0.12, 0.05, 0.03, '#fffbe8', 0, 0.42, 0.72, 0, 0, 0, LT());
      k.box(0.22, 0.05, 0.03, '#ff3030', 0, 0.42, -0.72, 0, 0, 0, droneLightMat('escort'));
      k.cyl(0.22, 0.26, 0.06, 12, dk, 0, 0.2, 0.32); k.cyl(0.22, 0.26, 0.06, 12, dk, 0, 0.2, -0.36);
      k.cyl(0.18, 0.18, 0.02, 12, '#ffffff', 0, 0.165, 0.32, 0, 0, 0, LT()); k.cyl(0.18, 0.18, 0.02, 12, '#ffffff', 0, 0.165, -0.36, 0, 0, 0, LT());
      return k.done();
    });
    Object.assign(g.userData, { seat: [0, 0.65, -0.02], pillion: [0, 0.65, -0.36], bars: [0, 0.94, 0.7], feet: [0.13, 0.44, 0.4] });
    g.userData.lights = []; g.traverse((m) => { if (m.isMesh && m.material === LT()) g.userData.lights.push(m); });
    g.userData.setGlow = (st) => droneSetLight(g, st);
    return g;
  };
  PROPS.hover_trolley = () => {
    const sc = screen('trolley_sign', 128, 48, (c, w, h) => { c.fillStyle = '#ffd21f'; c.fillRect(0, 0, w, h); c.fillStyle = '#141414'; for (let i = -2; i < 12; i++) { c.beginPath(); c.moveTo(i * 14, 0); c.lineTo(i * 14 + 7, 0); c.lineTo(i * 14 - 5, 8); c.lineTo(i * 14 - 12, 8); c.fill(); } c.font = font(15); c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('CAUTION:', w / 2, 21); c.fillText('TROLLEY', w / 2, 37); });
    const g = cached('hover_trolley', () => {
      const k = kit(), st = '#b8bec6';
      for (const [x, z] of [[-0.26, -0.4], [0.26, -0.4], [-0.24, 0.42], [0.24, 0.42]]) k.box(0.02, 0.5, 0.02, st, x, 0.66, z);
      for (const y of [0.42, 0.66, 0.9]) { k.box(0.54, 0.018, 0.018, st, 0, y, -0.41); k.box(0.5, 0.018, 0.018, st, 0, y, 0.42); k.box(0.018, 0.018, 0.84, st, -0.26, y, 0); k.box(0.018, 0.018, 0.84, st, 0.26, y, 0); }
      for (let i = 1; i < 6; i++) { k.box(0.008, 0.48, 0.008, st, -0.26, 0.66, -0.4 + i * 0.137); k.box(0.008, 0.48, 0.008, st, 0.26, 0.66, -0.4 + i * 0.137); }
      k.box(0.5, 0.02, 0.8, '#8a9098', 0, 0.42, 0); k.box(0.6, 0.035, 0.035, '#e8402a', 0, 1.02, -0.5); k.box(0.02, 0.14, 0.02, st, -0.26, 0.96, -0.46); k.box(0.02, 0.14, 0.02, st, 0.26, 0.96, -0.46);
      k.box(0.46, 0.08, 0.7, '#3a3e44', 0, 0.3, 0); k.cyl(0.18, 0.18, 0.02, 10, '#ffffff', 0, 0.255, 0, 0, 0, 0, LT());
      k.plane(0.34, 0.13, '#ffffff', 0, 0.7, 0.432, 0, 0, 0, sc.mat);
      return k.done();
    });
    g.userData.lights = []; g.traverse((m) => { if (m.isMesh && m.material === LT()) g.userData.lights.push(m); }); g.userData.setGlow = (st) => droneSetLight(g, st);
    return g;
  };
  // ---- padded bollards: a steel post sleeved in quilted cream foam
  const quilt = () => matTex(canvasTex(64, 64, (c) => {
    c.fillStyle = '#eee6d2'; c.fillRect(0, 0, 64, 64); c.strokeStyle = 'rgba(120,100,70,0.45)'; c.lineWidth = 2;
    for (let i = -64; i <= 64; i += 16) { c.beginPath(); c.moveTo(i, 0); c.lineTo(i + 64, 64); c.moveTo(i + 64, 0); c.lineTo(i, 64); c.stroke(); }
    c.fillStyle = 'rgba(255,255,255,0.35)'; for (let x = 0; x < 64; x += 16) for (let y = 0; y < 64; y += 16) { c.beginPath(); c.arc(x + 8, y + 4, 4, 0, TAU); c.fill(); }
  }, { key: 'quilt_foam', nearest: true, repeat: [3, 2] }));
  PROPS.quiltMat = quilt;
  PROPS.padded_bollard = () => cached('padded_bollard', () => {
    const k = kit();
    k.cyl(0.11, 0.11, 0.06, 10, '#3a3e44', 0, 0.93, 0); k.cyl(0.05, 0.11, 0.04, 10, '#3a3e44', 0, 0.98, 0);
    k.cyl(0.16, 0.16, 0.82, 10, '#ffffff', 0, 0.47, 0, 0, 0, 0, quilt()); k.cyl(0.165, 0.165, 0.05, 10, '#d8ccb0', 0, 0.06, 0);
    return k.done();
  });
  // ---- SafeSense kiosk: a rounded white pill with a screen and a blue glow ring
  const kioskPaint = (msg) => (c, w, h) => {
    const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#f4f8fc'); g.addColorStop(1, '#dce8f4'); c.fillStyle = g; c.fillRect(0, 0, w, h);
    c.fillStyle = '#3a8ad8'; c.font = font(12); c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('SafeSense', w / 2, 16);
    c.fillStyle = '#1c2a3a'; c.font = font(msg.length > 14 ? 13 : 17); const ln = msg.split('|'); ln.forEach((l, i) => c.fillText(l, w / 2, 62 + i * 20 - (ln.length - 1) * 10, w - 12));
    c.fillStyle = '#3a8ad8'; c.beginPath(); c.roundRect ? c.roundRect(34, 118, 60, 24, 12) : c.rect(34, 118, 60, 24); c.fill(); c.fillStyle = '#fff'; c.font = font(13); c.fillText('YES', w / 2, 130);
  };
  PROPS.safesense_kiosk = (o = {}) => {
    const sc = screen(o.key || 'kiosk', 128, 160, kioskPaint('Are you sure?'));
    const g = cached('kiosk|' + sc.key, () => {
      const k = kit();
      k.lathe([[0.001, 0], [0.24, 0], [0.26, 0.04], [0.2, 0.12], [0.16, 0.6], [0.2, 1.3], [0.22, 1.48], [0.16, 1.6], [0.001, 1.62]], 16, '#f1f3f6', 0, 0, 0, null, null, 1, 0.75);
      k.box(0.3, 0.38, 0.06, '#d8e0ea', 0, 1.2, 0.13); k.plane(0.26, 0.325, '#ffffff', 0, 1.2, 0.161, 0, 0, 0, sc.mat);
      k.torus(0.25, 0.018, 4, 18, '#ffffff', 0, 0.06, 0, H, 0, 0, LT());
      return k.done();
    });
    g.userData.screen = sc; g.userData.show = (msg) => sc.paint(kioskPaint(msg));
    g.userData.lights = ART_KIT.lights(g); g.userData.setLight = (st) => droneSetLight(g, st);
    return g;
  };
  // ---- the display security tether: a grey coil with the broken cradle clip on the end
  PROPS.tether_coil = (o = {}) => cached('tether_coil|' + (o.hand ? 'h' : o.pocket ? 'p' : 'f'), () => {
    const k = kit(), r = o.pocket ? 0.018 : 0.026, len = o.pocket ? 0.05 : o.hand ? 0.08 : 0.12, turns = o.pocket ? 5 : 8;
    k.tube(helix(r, len, turns, turns * 10, -len / 2), 0.0035, turns * 10, '#6a6e74');
    k.box(0.024, 0.016, 0.03, '#eceef0', 0, len / 2 + 0.012, 0); k.box(0.026, 0.01, 0.012, '#c8ccd2', 0, len / 2 + 0.024, 0.006, 0.4, 0, 0);
    k.tube([[r, -len / 2, 0], [r + 0.01, -len / 2 - 0.02, 0.01], [r + 0.004, -len / 2 - 0.045, 0.02]], 0.0035, 8, '#6a6e74');
    return k.done();
  });
  // the thrown tether: a unit-length cable along +Z, stretched between two points every frame by span()
  PROPS.tether_line = () => {
    const g = cached('tether_line', () => { const k = kit(); k.cyl(0.006, 0.006, 1, 5, '#6a6e74', 0, 0, 0.5, H, 0, 0); k.torus(0.08, 0.008, 4, 12, '#6a6e74', 0, 0, 1.0, 0, 0, 0); return k.done(); });
    const a = new THREE.Vector3(), b = new THREE.Vector3(), up = new THREE.Vector3(0, 1, 0);
    g.userData.span = (ax, ay, az, bx, by, bz) => { a.set(ax, ay, az); b.set(bx, by, bz); g.position.copy(a); const d = a.distanceTo(b); g.scale.set(1, 1, Math.max(0.001, d)); g.lookAt(b); };
    return g;
  };
  // ---- drone cone (floor fan) and the escort hug field: transparent, self-lit
  PROPS.scan_cone = (o = {}) => {
    const len = o.len ?? 3, half = o.half ?? 0.45;
    const g = cached('scan_cone|' + len + '|' + half, () => {
      const geo = new THREE.CircleGeometry(len, 14, -H - half, half * 2); geo.rotateX(-H);   // the fan points +Z geo.translate(0, 0.02, 0);
      const k = kit(); k.add(geo, '#ffffff', mat(0x000000, { emissive: 0x6fc8ff, emissiveIntensity: 0.9, transparent: true, opacity: 0.22, side: THREE.DoubleSide, key: 'cone_patrol' }));
      return k.done();
    });
    const CM = {}; for (const st of ['patrol', 'curious', 'escort', 'yes']) CM[st] = mat(0x000000, { emissive: DRONE_LIGHTS[st], emissiveIntensity: 0.9, transparent: true, opacity: 0.22, side: THREE.DoubleSide, key: 'cone_' + st });
    const ms = []; g.traverse((m) => { if (m.isMesh) ms.push(m); });
    g.userData.setLight = (st) => { for (let i = 0; i < ms.length; i++) ms[i].material = CM[st] || CM.patrol; g.userData.state = st; };
    return g;
  };
  PROPS.hug_field = () => cached('hug_field', () => {
    const k = kit(); k.sph(0.55, '#ffffff', 0, 0.9, 0, 1, 1.75, 1, mat(0x9fd8ff, { emissive: 0x3a8ac8, emissiveIntensity: 0.6, transparent: true, opacity: 0.25, side: THREE.DoubleSide, key: 'hug' }), 12, 8);
    return k.done();
  });
  // ---- hand props (also rig attachments)
  PROPS.tongs = () => cached('tongs', () => { const k = kit(); for (const sx of [-1, 1]) k.box(0.012, 0.3, 0.006, '#b9bec4', sx * 0.012, 0.1, 0, 0, 0, sx * 0.05); k.box(0.03, 0.04, 0.012, '#1c1c1e', 0, -0.04, 0); return k.done(); });
  PROPS.coaster = () => cached('coaster', () => { const k = kit(); k.cyl(0.05, 0.05, 0.004, 14, '#e8dcc0', 0, 0, 0); k.cyl(0.042, 0.042, 0.0045, 14, '#b02a2a', 0, 0.0004, 0); k.box(0.05, 0.0002, 0.012, '#2a3f9a', 0, 0.0026, 0.01); return k.done(); });
  PROPS.notepad = () => cached('notepad', () => { const k = kit(); k.box(0.08, 0.008, 0.08, '#ffe45c', 0, 0, 0); k.box(0.076, 0.004, 0.06, '#fff27a', 0, 0.005, 0.008); return k.done(); });
  PROPS.biro = () => cached('biro', () => { const k = kit(); k.cyl(0.004, 0.004, 0.14, 6, '#f2f2f2', 0, 0, 0); k.cyl(0.0042, 0.0042, 0.016, 6, '#2a3f9a', 0, 0.07, 0); k.cyl(0.003, 0.0005, 0.012, 6, '#c8c8c8', 0, -0.076, 0); return k.done(); });
  PROPS.food = (o = {}) => cached('food|' + (o.kind || 'pie'), () => {
    const k = kit(), kind = o.kind || 'pie';
    if (kind === 'bar') { k.box(0.03, 0.11, 0.014, '#c8962a', 0, 0.02, 0); k.box(0.032, 0.05, 0.016, '#2a7a3a', 0, -0.02, 0); }
    else if (kind === 'snag') { k.box(0.06, 0.03, 0.14, '#efd9a8', 0, 0, 0); k.cyl(0.013, 0.013, 0.16, 8, '#8a3a22', 0, 0.016, 0, H, 0, 0); k.box(0.03, 0.006, 0.12, '#c8301e', 0, 0.03, 0); }
    else { k.cyl(0.035, 0.03, 0.022, 10, '#d8a050', 0, 0, 0); k.cyl(0.036, 0.036, 0.006, 10, '#e8b868', 0, 0.013, 0); k.box(0.012, 0.004, 0.012, '#f4f0e8', 0, 0.017, 0, 0, 0.6, 0); }
    return k.done();
  });
  PROPS.cracker = () => cached('cracker', () => {   // one end of a Christmas cracker (each puller holds an end)
    const k = kit(); k.cyl(0.018, 0.018, 0.1, 8, '#c41f2a', 0, 0.05, 0); k.cyl(0.012, 0.02, 0.03, 8, '#d8b440', 0, 0.115, 0); k.cyl(0.02, 0.012, 0.025, 8, '#d8b440', 0, -0.012, 0);
    k.box(0.04, 0.012, 0.004, '#f4f0e8', 0, 0.05, 0.018); return k.done();
  });
  PROPS.box = () => cached('box', () => { const k = kit(); k.box(0.4, 0.28, 0.32, '#c49a62', 0, 0, 0); k.box(0.41, 0.02, 0.08, '#d8c8a0', 0, 0.141, 0); k.box(0.2, 0.002, 0.16, '#3a3a3a', 0.04, 0.0, 0.161); return k.done(); });
  PROPS.gift = () => cached('gift', () => { const k = kit(); k.box(0.18, 0.06, 0.12, '#2a6a4a', 0, 0.03, 0); k.box(0.184, 0.062, 0.02, '#d8b440', 0, 0.03, 0); k.box(0.02, 0.064, 0.124, '#d8b440', 0, 0.03, 0); k.box(0.04, 0.02, 0.03, '#d8b440', 0, 0.07, 0); return k.done(); });
  PROPS.ukulele = () => cached('ukulele', () => {   // body at the origin, neck along +X (the left hand); stickers on the front
    const k = kit(), wood = '#c88a4a';
    k.lathe([[0.001, -0.012], [0.07, -0.012], [0.074, 0.0], [0.07, 0.012], [0.001, 0.012]], 12, wood, 0, 0, 0, null, null, 1.3, 1);
    k.add(ART_KIT.place(new THREE.LatheGeometry([[0.001, -0.012], [0.058, -0.012], [0.06, 0], [0.058, 0.012], [0.001, 0.012]].map(([r, y]) => new THREE.Vector2(r, y)), 12), 0.1, 0, 0), wood);
    k.cyl(0.018, 0.018, 0.026, 10, '#2a1a10', 0.04, 0, 0.0, H, 0, 0);
    k.box(0.22, 0.012, 0.03, '#5a3a22', 0.27, 0, 0); k.box(0.06, 0.014, 0.04, '#5a3a22', 0.4, 0, 0);
    for (const [x, z, c] of [[-0.05, 0.03, '#ff5ab0'], [0.02, -0.03, '#ffd21f'], [-0.07, -0.02, '#5ac8ff'], [0.11, 0.02, '#7ae05a']]) k.box(0.022, 0.003, 0.018, c, x, 0.0125, z, 0, x * 9, 0);
    for (let i = 0; i < 4; i++) k.box(0.36, 0.002, 0.0015, '#e8e8e8', 0.22, 0.0075, -0.009 + i * 0.006);
    const g = k.done(); g.children.forEach((m) => m.geometry.rotateX(H)); return g;   // lie it face-forward (+Z)
  });
  PROPS.headphones = (o = {}) => cached('headphones|' + (o.col || '#ecebe7'), () => {   // a free-standing pair (dropped / on a hook)
    const k = kit(), c = o.col || '#ecebe7';
    k.torus(0.1, 0.012, 4, 14, '#9a9ea6', 0, 0.1, 0, 0, 0, 0, null, PI);
    for (const sx of [-1, 1]) { k.cyl(0.045, 0.045, 0.035, 10, c, sx * 0.1, 0.0, 0, 0, 0, H); k.cyl(0.036, 0.036, 0.008, 10, '#141416', sx * 0.08, 0.0, 0, 0, 0, H); }
    return k.done();
  });
  PROPS.santa_hat = () => cached('santa_hat', () => {
    const k = kit(); k.torus(0.1, 0.025, 6, 14, '#f3efe6', 0, 0.02, 0, H, 0, 0);
    k.lathe([[0.1, 0.02], [0.085, 0.07], [0.06, 0.12], [0.03, 0.16], [0.001, 0.18]], 10, '#c41f2a'); k.sph(0.025, '#f3efe6', 0.0, 0.185, 0);
    return k.done();
  });
  PROPS.santa_beard = () => cached('santa_beard', () => { const k = kit(); k.sph(0.11, '#f5f3ee', 0, 0.02, 0, 1, 0.35, 0.8); k.sph(0.07, '#ebe8e0', 0, 0.035, 0.05, 1, 0.3, 0.6); k.torus(0.1, 0.002, 3, 12, '#e9c8c0', 0, 0.03, -0.02, H, 0, 0, null, PI); return k.done(); });
  PROPS.coat_thrown = (o = {}) => cached('coat_thrown|' + (o.col || '#a8865a'), () => {   // the trench in flight / over a drone: a draped cloth
    const k = kit(), c = o.col || '#a8865a', geo = new THREE.SphereGeometry(0.55, 10, 6, 0, TAU, 0, PI * 0.62);
    const p = geo.attributes.position; for (let i = 0; i < p.count; i++) { const x = p.getX(i), z = p.getZ(i); p.setY(i, p.getY(i) * 0.7 + 0.06 * Math.sin(x * 9) * Math.cos(z * 7)); }
    geo.computeVertexNormals(); k.add(geo, null, null, (x, y, z) => (Math.sin(x * 13 + z * 7) > 0.6 ? artShade(c, 0.82) : c));
    const inner = geo.clone(); inner.scale(0.97, 0.97, 0.97); if (inner.index) inner.setIndex(new THREE.BufferAttribute(inner.index.array.slice().reverse(), 1)); k.add(inner, artShade(c, 0.5));
    return k.done();
  });
  PROPS.foam = () => {   // safety foam: soft white quilted blobs; grow(k 0..1) blooms it up to the chest
    const g = cached('foam', () => { const k = kit(); for (const [x, z, r] of [[0, 0, 0.5], [0.32, 0.2, 0.34], [-0.3, 0.22, 0.32], [0.2, -0.3, 0.3], [-0.24, -0.26, 0.33]]) k.sph(r, '#f6f4ee', x, 0.2, z, 1, 1.5, 1, null, 10, 7, (x2, y2) => (Math.sin(x2 * 30) * Math.sin(y2 * 30) > 0.3 ? '#e4e0d4' : '#f8f6f0')); return k.done(); });
    g.userData.grow = (kk) => { g.scale.set(0.2 + 0.8 * kk, 0.05 + 0.95 * kk, 0.2 + 0.8 * kk); };
    return g;
  };
  // instancing helper: the geometry + material pairs of a prop (one per material), for InstancedMesh repeats
  PROPS.parts = (id, o) => { const g = PROPS[id](o || {}), out = []; g.traverse((m) => { if (m.isMesh) out.push({ geometry: m.geometry, material: m.material }); }); return out; };
  Object.defineProperty(PROPS, 'parts', { enumerable: false }); Object.defineProperty(PROPS, 'quiltMat', { enumerable: false });
})();
function artShade(c, k) { return '#' + new THREE.Color(c).multiplyScalar(k).getHexString(); }

// ------------------------------------------------------------ drones
// buildDrone(kind) -> Group, origin at the drone's centre, facing +Z; the caller bobs and moves it (and keeps a blob
// shadow on the floor). kinds: 'courtesy' (small white pod, soft blue light), 'guardian' (bigger, shield shell),
// 'popup' (projector lens), 'cleaning' (a disc), 'noise' (with a claw), 'fun' (the Fun Monitor, with its beam),
// 'lifeguard', 'door'. userData: kind, setLight('patrol' | 'curious' | 'escort' | 'yes' | 'white' | 'green' | 'off'),
// state, lights (meshes), radius; guardian: shield + setShield(on); popup / fun: beam (hidden) + setBeam(on);
// noise: setClaw(k 0 closed .. 1 open); cleaning: brush (spin it: brush.rotation.y); door: screen + show(text).
const DRONE_KINDS = ['courtesy', 'guardian', 'popup', 'cleaning', 'noise', 'fun', 'lifeguard', 'door'];   // (boot warms each)
const buildDrone = (() => {
  const { kit, cached, screen } = ART_KIT, PI = Math.PI, H = PI / 2, LT = () => droneLightMat('patrol');
  const WH = '#eef1f4', GR = '#c3cad3', VIS = '#1a2028';
  // the pod: a lathed egg, a dark visor band with the light "eye", a soft light ring underneath
  function pod(k, s = 1, body = WH, low = GR) {
    k.lathe([[0.001, -0.17], [0.08, -0.16], [0.17, -0.1], [0.21, -0.02], [0.206, 0.04], [0.17, 0.11], [0.1, 0.16], [0.001, 0.175]].map(([r, y]) => [r * s, y * s]), 14, null, 0, 0, 0, null, (x, y) => (y < -0.06 * s ? low : body));
    k.arc(0.212 * s, 0.07 * s, 10, -0.95, 1.9, VIS, 0, 0.03 * s, 0);
    k.box(0.12 * s, 0.022 * s, 0.012, '#ffffff', 0, 0.035 * s, 0.208 * s, 0, 0, 0, LT());
    k.torus(0.08 * s, 0.013 * s, 4, 14, '#ffffff', 0, -0.165 * s, 0, H, 0, 0, LT());
    k.cyl(0.012 * s, 0.016 * s, 0.03 * s, 6, GR, 0, 0.185 * s, 0);
    for (const sx of [-1, 1]) k.box(0.04 * s, 0.03 * s, 0.1 * s, GR, sx * 0.205 * s, -0.02 * s, -0.02 * s);
  }
  const doorPaint = (t) => (c, w, h) => { c.fillStyle = '#0a1a28'; c.fillRect(0, 0, w, h); c.fillStyle = '#8fdcff'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.font = 'bold 18px Arial, sans-serif'; c.fillText(t, w / 2, 22, w - 8); c.lineWidth = 3; c.strokeStyle = '#8fdcff'; c.beginPath(); c.arc(w / 2, 40, 10, 0.2, PI - 0.2); c.stroke(); };
  const BUILD = {
    courtesy: (k) => pod(k),
    guardian: (k) => { pod(k, 1.55, '#e2e6ec', '#5a626e'); for (const sx of [-1, 1]) k.box(0.1, 0.16, 0.26, '#4a5260', sx * 0.33, 0.0, -0.02); k.box(0.3, 0.04, 0.04, '#4a5260', 0, 0.2, 0.25); },
    popup: (k) => { pod(k); k.cyl(0.05, 0.06, 0.09, 10, '#4a5260', 0, -0.02, 0.22, H, 0, 0); k.cyl(0.042, 0.042, 0.01, 10, '#ffffff', 0, -0.02, 0.27, H, 0, 0, LT()); k.box(0.02, 0.1, 0.12, GR, 0, 0.2, -0.04); },
    cleaning: (k) => {
      k.lathe([[0.001, -0.05], [0.24, -0.05], [0.26, -0.02], [0.25, 0.03], [0.18, 0.06], [0.001, 0.065]], 16, null, 0, 0, 0, null, (x, y) => (y < -0.03 ? GR : WH));
      k.torus(0.255, 0.01, 4, 20, '#ffffff', 0, -0.005, 0, H, 0, 0, LT()); k.box(0.08, 0.016, 0.01, '#ffffff', 0, 0.03, 0.24, 0, 0, 0, LT());
    },
    noise: (k) => { pod(k); k.cyl(0.07, 0.07, 0.012, 10, '#3a3e44', 0, 0.06, 0.2, H, 0, 0); k.cyl(0.03, 0.04, 0.06, 8, '#4a5260', 0, -0.2, 0); },
    fun: (k) => {
      pod(k);
      ['#e8402a', '#ffd21f', '#3ac85a', '#3a8ae8', '#e85ab8', '#ffd21f', '#3ac85a', '#e8402a'].forEach((c, i) => { const a = i / 8 * PI * 2; k.box(0.03, 0.03, 0.02, c, Math.sin(a) * 0.205, -0.045, Math.cos(a) * 0.205, 0, a, 0); });
      k.lathe([[0.06, 0], [0.001, 0.13]], 8, null, 0, 0.17, 0, null, (x, y) => (Math.floor((y - 0.17) * 40) % 2 ? '#ffd21f' : '#e8402a')); k.sph(0.016, '#f4f0e8', 0, 0.305, 0);
    },
    lifeguard: (k) => {
      pod(k, 1.2, '#ffd23a', '#d8202a');
      k.torus(0.16, 0.035, 6, 14, '#e8e4dc', 0, -0.3, 0, H, 0, 0); for (let i = 0; i < 4; i++) { const a = i * H + 0.4; k.box(0.06, 0.075, 0.075, '#d8202a', Math.sin(a) * 0.16, -0.3, Math.cos(a) * 0.16, 0, a, 0); }
      for (const sx of [-1, 1]) k.box(0.006, 0.12, 0.006, '#3a3e44', sx * 0.1, -0.24, 0);
      k.cyl(0.06, 0.03, 0.1, 8, '#f2f2f2', 0, 0.07, 0.27, H, 0, 0);
    },
    door: (k, sc) => { pod(k, 1.1); k.box(0.2, 0.11, 0.02, VIS, 0, 0.03, 0.225); k.plane(0.18, 0.09, '#ffffff', 0, 0.03, 0.2365, 0, 0, 0, sc.mat); k.box(0.08, 0.03, 0.02, '#c41f2a', 0, -0.07, 0.22); },
  };
  return function buildDrone(kind = 'courtesy') {
    if (!BUILD[kind]) kind = 'courtesy';
    const sc = kind === 'door' ? screen('door_drone', 128, 64, doorPaint('WELCOME!')) : null;
    const g = cached('drone_' + kind, () => { const k = kit(); BUILD[kind](k, sc); return k.done(); });
    const u = g.userData;
    u.kind = kind; u.lights = ART_KIT.lights(g); u.state = 'patrol'; u.setLight = (st) => droneSetLight(g, st);
    u.radius = kind === 'guardian' ? 0.36 : kind === 'cleaning' ? 0.27 : 0.22;
    if (kind === 'guardian') {
      const sh = new THREE.Mesh(artSharedGeo('shield', () => new THREE.IcosahedronGeometry(0.5, 1)), mat(0x9fd8ff, { emissive: 0x3a8ac8, emissiveIntensity: 0.7, transparent: true, opacity: 0.26, side: THREE.DoubleSide, key: 'shield' }));
      sh.name = 'shield'; g.add(sh); u.shield = sh; u.setShield = (on) => { sh.visible = !!on; };
    }
    if (kind === 'popup' || kind === 'fun') {
      const len = kind === 'fun' ? 4 : 2.5, bm = new THREE.Mesh(artSharedGeo('beam_' + kind, () => { const c = new THREE.ConeGeometry(kind === 'fun' ? 1.1 : 0.7, len, 12, 1, true); c.rotateX(-H); c.translate(0, 0, len / 2 + 0.2); return c; }),
        mat(0x000000, { emissive: kind === 'fun' ? 0xffe68a : 0x9fd8ff, emissiveIntensity: 0.8, transparent: true, opacity: 0.14, side: THREE.DoubleSide, key: 'beam_' + kind }));
      bm.name = 'beam'; bm.visible = false; if (kind === 'fun') bm.rotation.x = 0.55; g.add(bm); u.beam = bm; u.setBeam = (on) => { bm.visible = !!on; };
    }
    if (kind === 'noise') {                   // three fingers on pivots round the hub: setClaw(1) open .. 0 closed
      const fg = artSharedGeo('claw_finger', () => { const k = kit(); k.box(0.016, 0.09, 0.02, '#4a5260', 0, -0.045, 0); k.box(0.014, 0.06, 0.018, '#3a3e44', 0, -0.1, 0.018, 0.6, 0, 0); return k.done().children[0].geometry; });
      const piv = [];
      for (let i = 0; i < 3; i++) { const p = new THREE.Object3D(); p.position.set(0, -0.23, 0); p.rotation.y = i * PI * 2 / 3; const f = new THREE.Mesh(fg, mat(0xffffff)); f.position.z = 0.035; p.add(f); g.add(p); piv.push(f); }
      u.setClaw = (kk) => { for (const f of piv) f.rotation.x = -0.15 - 0.75 * kk; }; u.setClaw(0.3);
    }
    if (kind === 'cleaning') {
      const br = new THREE.Mesh(artSharedGeo('brush', () => { const k = kit(); k.cyl(0.18, 0.2, 0.025, 12, '#3a3e44', 0, -0.065, 0); k.box(0.36, 0.02, 0.03, '#5a6068', 0, -0.07, 0); k.box(0.03, 0.02, 0.36, '#5a6068', 0, -0.07, 0); return k.done().children[0].geometry; }), mat(0xffffff));
      br.name = 'brush'; g.add(br); u.brush = br;
    }
    if (sc) { u.screen = sc; u.show = (t) => sc.paint(doorPaint(t)); }
    return g;
  };
})();
// one geometry per name, built on first use and shared by every clone (drone shells, beams, claw fingers)
const artSharedGeo = (() => { const m = new Map(); return (n, fn) => m.get(n) || (m.set(n, fn()), m.get(n)); })();

// DRONE_INSTANCED: the courtesy pod for fleets (the L30 hangar's hundreds, the roof ring of 400, the title ring).
// geo + mat: the body (lights excluded) in one vertex-coloured material, for an InstancedMesh with per-instance
// colour (setColorAt tints the white shell: Yes yellow after Luka takes them). lightGeo + lightMat: the eye + under-ring
// as a second InstancedMesh, unlit, coloured per instance (setColorAt with DRONE_LIGHTS colours). make(n, {state, tint})
// builds both: { group, body, light, set(i, x, y, z, rotY, scale), tint(i, hex), glow(i, state|hex), commit() } with
// preallocated scratch (call set/tint/glow freely per frame, then commit()). frustumCulled is off (they move).
const DRONE_INSTANCED = (() => {
  let G = null, LG = null, LM = null;
  const build = () => {
    if (G) return;
    const k = ART_KIT.kit(), PI = Math.PI, H = PI / 2;
    k.lathe([[0.001, -0.17], [0.08, -0.16], [0.17, -0.1], [0.21, -0.02], [0.206, 0.04], [0.17, 0.11], [0.1, 0.16], [0.001, 0.175]], 12, null, 0, 0, 0, null, (x, y) => (y < -0.06 ? '#c3cad3' : '#eef1f4'));
    k.arc(0.212, 0.07, 8, -0.95, 1.9, '#1a2028', 0, 0.03, 0); k.cyl(0.012, 0.016, 0.03, 6, '#c3cad3', 0, 0.185, 0);
    G = k.done().children[0].geometry;
    const l = ART_KIT.kit(); l.box(0.12, 0.022, 0.012, '#ffffff', 0, 0.035, 0.208); l.torus(0.08, 0.013, 4, 12, '#ffffff', 0, -0.165, 0, H, 0, 0);
    LG = l.done().children[0].geometry; LG.deleteAttribute('color');
    LM = new THREE.MeshBasicMaterial({ color: 0xffffff });
  };
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), p = new THREE.Vector3(), sc = new THREE.Vector3(), up = new THREE.Vector3(0, 1, 0), c = new THREE.Color();
  return {
    get geo() { build(); return G; }, get mat() { return mat(0xffffff); }, get lightGeo() { build(); return LG; }, get lightMat() { build(); return LM; },
    make(n, o = {}) {
      build();
      const body = new THREE.InstancedMesh(G, mat(0xffffff), n), light = new THREE.InstancedMesh(LG, LM, n), group = new THREE.Group();
      body.frustumCulled = light.frustumCulled = false; body.name = 'drones'; light.name = 'drone_lights'; group.add(body, light);
      const r = {
        group, body, light,
        set(i, x, y, z, rotY = 0, s = 1) { m4.compose(p.set(x, y, z), q.setFromAxisAngle(up, rotY), sc.set(s, s, s)); body.setMatrixAt(i, m4); light.setMatrixAt(i, m4); return r; },
        tint(i, hex) { body.setColorAt(i, c.set(hex)); return r; },
        glow(i, st) { light.setColorAt(i, c.set(typeof st === 'string' && st in DRONE_LIGHTS ? (DRONE_LIGHTS[st] ?? 0x23272e) : st)); return r; },
        commit() { body.instanceMatrix.needsUpdate = light.instanceMatrix.needsUpdate = true; if (body.instanceColor) body.instanceColor.needsUpdate = true; if (light.instanceColor) light.instanceColor.needsUpdate = true; return r; },
      };
      for (let i = 0; i < n; i++) { r.set(i, 0, -1000, 0); r.tint(i, o.tint ?? 0xffffff); r.glow(i, o.state || 'patrol'); }
      return r.commit();
    },
  };
})();

// The boot warm-up kit: one of everything above (all states' materials, shields/beams shown, the instanced families
// with and without colour). buildCharacter hangs it, at scale 0, on the first rig it builds; the warm render compiles
// and uploads it all, then it removes itself (see buildCharacter). Nothing here is built mid-game afterwards.
function ART_WARM_KIT() {
  const g = new THREE.Group();
  for (const kind of ['courtesy', 'guardian', 'popup', 'cleaning', 'noise', 'fun', 'lifeguard', 'door']) g.add(buildDrone(kind));
  for (const id in PROPS) { try { g.add(PROPS[id]()); } catch (e) { console.warn('TWO: prop ' + id, e); } }
  const fleet = DRONE_INSTANCED.make(2, { tint: 0xffd21f, state: 'yes' }); g.add(fleet.group);
  const plain = new THREE.InstancedMesh(DRONE_INSTANCED.geo, DRONE_INSTANCED.mat, 1); plain.setMatrixAt(0, new THREE.Matrix4()); g.add(plain);
  for (const st in DRONE_LIGHTS) { const m = new THREE.Mesh(artSharedGeo('warm_dot', () => new THREE.BoxGeometry(0.01, 0.01, 0.01)), droneLightMat(st)); g.add(m); }
  g.traverse((o) => { o.visible = true; });
  return g;
}
