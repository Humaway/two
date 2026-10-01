// ============================================================ MINI-GAMES: Hold NO (3.6 "Your call") + The Choice (3.7)
// Both are Rue's final YES (ref/rue/17, docs/engine/08-minigames-b.md §2, §10.2) re-cut for TWO: the same hold curve
// (fill over 3 s while held, rewind 0.9/s when released, irreversible at full, finish 0.35 s later), a filling ring and
// the house prompt pill, all painted on the overlay. Nothing here starts, stops or ducks music: the scene owns the song
// (3.6 "two") and the sustained chord (3.7). options.holdToPress: a press latches the hold (the ring still takes 3 s);
// NO, the other button or a tap elsewhere cancels it. No allocation in update()/draw(): every canvas, gradient, string
// and vector is made in start() / layout().
//
// ------------------------------------------------------------ MINIGAMES.hold_no  (3.6 "Your call")
// Future Luka at the glass: the SafeSense pop-up OPT OUT ALL USERS? [YES] [NO] with a cursor on it, both buttons live.
// Moving the cursor toward YES makes his hand shake (3D: his reaching arm trembles; 2D: the cursor jitters) and the
// cursor drifts back toward NO by itself; the second time, LUKA (2040): "…No." and YES greys out (the cursor is held in
// the NO half from then on). NO: hold to confirm, 3 s, a ring filling round the NO button. Can't fail; no skip offer.
// Input: the mouse moves the cursor (hold the button on NO, or right-click-hold anywhere); touch: drag it, hold a finger
// on NO, or hold the NO button; keys / pad: arrows / stick move it, hold NO (Esc / B) anywhere, or YES (Enter / A) with
// the cursor on NO. Holding NO glides the cursor onto the NO button.
//
// Call:  ['minigame', 'hold_no', { shot, glass, actor, line }]
//   shot    a cam.shot step for the game (default: a lens behind Future Luka's shoulder onto the glass, when the glass
//           and the actor are known; else CLOSE on him; else the scene's camera is left alone)
//   glass   where the pop-up lives in the world, so the painted pop-up sits on it: [x, y, z] (centre) or
//           { at: [x, y, z] | anchor/mark/prop name, w = 3.2, h = 1.8 } or false (screen space). Default: hq_top's glass
//           panel ((-3.0, 2.15, -11.24), 3.2 x 1.8) when the set has prop 'glass_ui', else anchor 'glass_popup''s `at`.
//           The painted pop-up is sized to the glass on screen, kept within readable limits (and never off screen).
//   actor   'luka40' (default): his right arm reaches for the glass (ANIMS.glass_reach, registered here) and follows
//           the cursor; his previous anim comes back at the end.
//   line    the attempt-2 line (default spec 3.6: LUKA (2040) "…No."); false = none.
// Drives prop 'glass_ui' when the set has it (hq_top §4: popup('yes_no' | 'yes_grey'), cursor(u, v), hold(k)) so the
// 3D glass matches the painted one; it is left showing 'yes_no' with the NO ring full for the "[INSERT] NO." that follows.
// Result: { done: true, no: true, attempts, yesGreyed }   (skipped: { skipped: true, done: true, no: true })
// Events: emit('hold_no:attempt', n), emit('hold_no:done').
// Autoplay: two reaches toward YES (the shake, the drift back, "…No.", YES greying), then holds NO at 4x;
// &fast=1: straight to the NO hold.
//
// ------------------------------------------------------------ MINIGAMES.choice  (3.7 "Storage Full", THE CHOICE)
// The STORAGE FULL pop-up over the two-shot of their hands on the Remote (Rue's 3.4 framing: Luka's grazed right hand and
// Chase's left hand, painted with Rue's hand painter, resting on the Remote, the receiver gaffer-taped to a display chip).
// Both buttons live, nothing greyed, no timer, no hint (a quiet "Hold to confirm" appears only after a press that let go
// too soon). Hold YES (keep the memories) or NO (clear them) for 3 s; releasing before the ring fills cancels without
// penalty; switching buttons empties the other ring; only one fills at a time. Never skippable (noSkip); never fails.
// Input: YES / NO keys, pad A / B, the touch YES / NO buttons, or a mouse button / finger held on either pill.
//
// Call:  ['minigame', 'choice', { shot, hands, test }]
//   shot   cam.shot under the pop-up (default: INSERT on anchor 's37_hands' when the set has it, else a CLOSE two-shot
//          of 'luka' and 'chase', else the scene's camera)
//   hands  false = don't paint the hands and the Remote (when the 3D shot already shows them)
//   test   autoplay's answer (default TEST.ending || 'A')
// On a choice: state.choice = 'A' (YES) | 'B' (NO), profile.endingsSeen[choice] = true, saveGame(), emit('choice', c).
// Result: { choice: 'A' | 'B' }. Autoplay fills TEST.ending's ring (else YES) at 4x, through the same code path.
(() => {
  const TAU = Math.PI * 2, HP = Math.PI / 2;
  const HOLD = 3, REWIND = 0.9, AUTO_K = 4, END_T = 0.35;
  const YEL = '#ffd21f', NAVY = '#141d3a', SS = '#2f86e0', INK = '#1c2a44', MUTE = '#7d8fae';
  const FONT = '"Trebuchet MS", "Segoe UI", system-ui, sans-serif';
  const SYS = 'system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif';
  const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
  const smooth = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
  const SO = { vol: 1, rate: 1 };
  const NODASH = [];

  // ---------------------------------------------------------- shared painters (design units; caller sets the transform)
  function rr(c, x, y, w, h, r) { c.beginPath(); c.roundRect(x, y, w, h, r); }
  function glassBody(c, w, h, r) {                       // SafeSense glass: translucent white, ice rim, soft blue glow
    c.save();
    c.shadowColor = 'rgba(120,190,255,0.6)'; c.shadowBlur = 28;
    c.fillStyle = 'rgba(250,253,255,0.9)'; rr(c, 0, 0, w, h, r); c.fill();
    c.restore();
    const g = c.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, 'rgba(255,255,255,0.55)'); g.addColorStop(0.45, 'rgba(255,255,255,0)'); g.addColorStop(1, 'rgba(191,230,255,0.18)');
    c.fillStyle = g; rr(c, 0, 0, w, h, r); c.fill();
    c.lineWidth = 1.2; c.strokeStyle = 'rgba(255,255,255,0.95)'; rr(c, 0.6, 0.6, w - 1.2, h - 1.2, r); c.stroke();
    c.lineWidth = 1; c.strokeStyle = 'rgba(191,230,255,0.75)'; rr(c, -1, -1, w + 2, h + 2, r + 1); c.stroke();
  }
  function logo(c, x, y) {                               // the SafeSense drop + name
    const g = c.createRadialGradient(x - 2, y - 2, 0.5, x, y, 6.5);
    g.addColorStop(0, '#ffffff'); g.addColorStop(0.35, '#8fd0ff'); g.addColorStop(1, SS);
    c.save(); c.shadowColor = '#8fd0ff'; c.shadowBlur = 7; c.fillStyle = g; c.beginPath(); c.arc(x, y, 6, 0, TAU); c.fill(); c.restore();
    c.fillStyle = SS; c.font = '600 13px ' + SYS; c.textAlign = 'left'; c.textBaseline = 'middle'; c.fillText('SafeSense', x + 11, y + 0.5);
  }
  function pill(c, cx, cy, w, h, label, grey) {
    const x = cx - w / 2, y = cy - h / 2;
    c.save();
    if (grey) { c.fillStyle = '#d5dce6'; rr(c, x, y, w, h, h / 2); c.fill(); c.fillStyle = '#9aa6b8'; }
    else {
      c.shadowColor = 'rgba(95,178,255,0.55)'; c.shadowBlur = 12;
      const g = c.createLinearGradient(0, y, 0, y + h); g.addColorStop(0, '#66b6ff'); g.addColorStop(1, SS);
      c.fillStyle = g; rr(c, x, y, w, h, h / 2); c.fill(); c.shadowBlur = 0;
      c.fillStyle = 'rgba(255,255,255,0.4)'; rr(c, x + 3, y + 1.5, w - 6, h * 0.42, h * 0.3); c.fill();
      c.fillStyle = '#ffffff';
    }
    c.font = '700 ' + Math.round(h * 0.42) + 'px ' + SYS; c.textAlign = 'center'; c.textBaseline = 'middle';
    c.fillText(label, cx, cy + 0.5);
    c.restore();
  }
  // a pill-shaped ring: the outline of a w x h pill (r = h / 2) from 12 o'clock clockwise, the first k (0..1) of it
  function pillPath(c, cx, cy, w, h, k) {
    const r = h / 2, s = w / 2 - r, L = 4 * s + TAU * r;
    let left = k * L;
    c.beginPath(); c.moveTo(cx, cy - r);
    let d = Math.min(left, s); c.lineTo(cx + d, cy - r); left -= d; if (left <= 0) return;
    d = Math.min(left, Math.PI * r); c.arc(cx + s, cy, r, -HP, -HP + d / r); left -= d; if (left <= 0) return;
    d = Math.min(left, 2 * s); c.lineTo(cx + s - d, cy + r); left -= d; if (left <= 0) return;
    d = Math.min(left, Math.PI * r); c.arc(cx - s, cy, r, HP, HP + d / r); left -= d; if (left <= 0) return;
    d = Math.min(left, s); c.lineTo(cx - s + d, cy - r);
  }
  function ringOn(c, cx, cy, w, h, k, lw) {              // track + Yes-yellow arc with a navy edge (reads on glass and dark)
    c.lineCap = 'round'; c.setLineDash(NODASH);
    c.lineWidth = lw; c.strokeStyle = 'rgba(47,134,224,0.22)'; pillPath(c, cx, cy, w, h, 1); c.stroke();
    if (k <= 0) return;
    c.lineWidth = lw + 2.4; c.strokeStyle = NAVY; pillPath(c, cx, cy, w, h, k); c.stroke();
    c.lineWidth = lw; c.strokeStyle = YEL; pillPath(c, cx, cy, w, h, k); c.stroke();
  }
  // the house prompt pill (Rue's): navy, a key chip, white text. key 'YES' = yellow chip, anything else light grey.
  function promptPill(c, x, y, key, text, wTxt, fKey, fTxt, a) {
    const ch = 22, kw = key.length > 2 ? 48 : 40, w = 7 + kw + 9 + wTxt + 16, h = 34;
    const x0 = x - w / 2;
    c.globalAlpha = a;
    c.fillStyle = 'rgba(20,29,58,0.88)'; rr(c, x0, y - h / 2, w, h, h / 2); c.fill();
    c.fillStyle = key === 'YES' ? YEL : '#e8e8ee'; rr(c, x0 + 7, y - ch / 2, kw, ch, ch / 2); c.fill();
    c.fillStyle = NAVY; c.font = fKey; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(key, x0 + 7 + kw / 2, y + 1);
    c.fillStyle = '#ffffff'; c.font = fTxt; c.textAlign = 'left'; c.fillText(text, x0 + 7 + kw + 9, y + 1);
    c.globalAlpha = 1;
  }
  function arrow(c, x, y, s) {                           // the system cursor: white arrow, dark edge
    c.save(); c.translate(x, y); c.scale(s, s);
    c.beginPath(); c.moveTo(0, 0); c.lineTo(0, 17); c.lineTo(4.2, 13.2); c.lineTo(7.1, 19.6); c.lineTo(9.9, 18.4); c.lineTo(7.1, 12.2); c.lineTo(12.4, 12.2); c.closePath();
    c.fillStyle = '#ffffff'; c.fill(); c.lineWidth = 1.3; c.lineJoin = 'round'; c.strokeStyle = '#141d3a'; c.stroke();
    c.restore();
  }

  // ---------------------------------------------------------- Rue's hand painter (ref/rue/17:106-132), + grazes
  function capsule(c, x, y, ang, len, w, skin, dark, nail) {
    c.save(); c.translate(x, y); c.rotate(ang);
    c.fillStyle = skin; c.beginPath(); c.roundRect(-w / 2, -len, w, len + 0.4, w / 2); c.fill();
    c.fillStyle = dark; c.beginPath(); c.roundRect(w * 0.08, -len + 0.4, w * 0.42, len, [0, w / 2, w / 2, 0]); c.fill();
    if (nail) { c.fillStyle = nail; c.beginPath(); c.roundRect(-w * 0.3, -len + 0.28, w * 0.6, w * 0.72, w * 0.26); c.fill(); }
    c.restore();
  }
  // right hand, palm down, fingers up (-y); mirrored for a left hand. 1 unit = s px, wrist at (x, y).
  function hand(c, x, y, ang, s, mir, skin, dark, nail, sleeve, cuff, hairy, broad, graze) {
    const poly = (pts) => { c.beginPath(); c.moveTo(pts[0], pts[1]); for (let i = 2; i < pts.length; i += 2) c.lineTo(pts[i], pts[i + 1]); c.closePath(); c.fill(); };
    c.save(); c.translate(x, y); c.rotate(ang); c.scale(mir ? -s * broad : s * broad, s);
    c.fillStyle = 'rgba(0,0,0,.28)'; c.filter = `blur(${Math.max(1, s * 0.6)}px)`; poly([-2.6, 1, 2.8, 1, 3, -5.8, -2.2, -6.4]); c.filter = 'none';
    c.fillStyle = skin; poly([-2.3, 0, 2.1, 0, 3.1, 14, -3.4, 14]);
    c.fillStyle = dark; poly([1.1, 0, 2.1, 0, 3.1, 14, 1.4, 14]);
    if (hairy) { c.strokeStyle = 'rgba(58,34,20,.55)'; c.lineWidth = 0.11; c.beginPath(); for (let i = 0; i < 26; i++) { const hx = -2 + (i * 37 % 45) / 10, hy = 1.5 + (i * 53 % 70) / 10; c.moveTo(hx, hy); c.lineTo(hx + 0.35, hy - 0.5); } c.stroke(); }
    c.fillStyle = sleeve; poly([-4.2, 6.2, 4, 6.2, 4.8, 18, -5, 18]);
    c.fillStyle = cuff; poly([-4.2, 6.2, 4, 6.2, 4.06, 7.1, -4.28, 7.1]);
    capsule(c, -2.1, -1.2, -0.72, 3.4, 1.55, skin, dark, nail);
    c.fillStyle = skin; poly([-2.3, 0, -2.8, -2.6, -2.5, -4.9, -0.9, -5.3, 0.7, -5.1, 2.3, -4.5, 2.4, -1.4, 2.1, 0]);
    c.fillStyle = dark; poly([0.8, -2.2, 2.3, -4.5, 2.4, -1.4, 2.1, 0, 1.1, 0]);
    const F = [[-1.85, -4.6, -0.07, 4.1, 1.4], [-0.6, -4.95, -0.02, 4.5, 1.42], [0.65, -4.8, 0.05, 4.2, 1.36], [1.8, -4.25, 0.13, 3.3, 1.2]];
    for (const f of F) capsule(c, f[0], f[1], f[2], f[3], f[4], skin, dark, nail);
    c.strokeStyle = dark; c.lineWidth = 0.14; c.lineCap = 'round'; c.beginPath();
    for (const f of F) { c.moveTo(f[0] - 0.35, f[1] + 0.2); c.lineTo(f[0] + 0.3, f[1] + 0.1); }
    c.stroke();
    if (graze) {                                         // 3.5's wall: grazed knuckles and a scrape on the back of the hand
      c.lineCap = 'round';
      c.strokeStyle = 'rgba(150,40,30,.75)'; c.lineWidth = 0.22; c.beginPath();
      for (const f of F) { c.moveTo(f[0] - 0.3, f[1] + 0.55); c.lineTo(f[0] + 0.25, f[1] + 0.35); }
      c.stroke();
      c.strokeStyle = 'rgba(170,60,45,.5)'; c.lineWidth = 0.14; c.beginPath();
      c.moveTo(-1.2, -2.6); c.lineTo(0.6, -3.2); c.moveTo(-0.9, -2.0); c.lineTo(0.9, -2.7); c.moveTo(-0.4, -1.4); c.lineTo(1.2, -2.0);
      c.stroke();
    }
    c.restore();
  }
  // the Remote, top-down: a display chip (green board, gold contacts, a little screen) with a cream phone receiver
  // gaffer-taped across it and its coiled cord running off to the brick phone. Centre (x, y), u = px per unit (R / 10).
  function remote(c, x, y, u) {
    c.save(); c.translate(x, y); c.scale(u, u);
    c.fillStyle = 'rgba(0,0,0,.35)'; c.filter = `blur(${Math.max(1, u * 1.2)}px)`; rr(c, -12.2, -6.2, 25, 14.4, 1.6); c.fill(); c.filter = 'none';
    c.fillStyle = '#1f5a3d'; rr(c, -12.5, -7, 25, 14, 1.2); c.fill();                          // the board
    c.strokeStyle = 'rgba(140,200,150,.35)'; c.lineWidth = 0.18; c.beginPath();
    for (let i = 0; i < 9; i++) { const yy = -5.6 + i * 1.35; c.moveTo(-11.6, yy); c.lineTo(-8 + (i * 7 % 5), yy); c.lineTo(-7 + (i * 7 % 5), yy + 0.7); c.lineTo(-1, yy + 0.7); }
    c.stroke();
    c.fillStyle = '#d8b04a'; for (let i = 0; i < 12; i++) c.fillRect(-11.6 + i * 1.95, 6.0, 1.1, 0.8);              // edge contacts
    c.fillStyle = '#111418'; rr(c, 4.4, -5.8, 6.6, 3.8, 0.5); c.fill();                          // its little screen
    c.fillStyle = '#7dffa8'; c.font = 'bold 1.25px ' + SYS; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('LINE OPEN', 7.7, -3.9);
    c.fillStyle = '#2a2d33'; rr(c, -10.8, -5.6, 3.2, 3.2, 0.3); c.fill();                        // a chip
    c.fillStyle = '#8a8f99'; for (let i = 0; i < 4; i++) { c.fillRect(-11.4, -5.2 + i * 0.75, 0.5, 0.35); c.fillRect(-7.5, -5.2 + i * 0.75, 0.5, 0.35); }
    // the receiver: two cups and a handle, cream plastic
    c.save(); c.rotate(-0.06);
    c.fillStyle = 'rgba(0,0,0,.25)'; rr(c, -9.6, -0.9, 19.6, 4.6, 2.2); c.fill();
    c.fillStyle = '#efe4c8'; rr(c, -9.8, -1.6, 19.6, 3.6, 1.6); c.fill();
    c.beginPath(); c.ellipse(-8.2, 0.2, 2.9, 3.4, 0, 0, TAU); c.fill(); c.beginPath(); c.ellipse(8.2, 0.2, 2.9, 3.4, 0, 0, TAU); c.fill();
    c.fillStyle = '#d7caa8'; c.beginPath(); c.ellipse(-8.2, 0.9, 2.5, 2.4, 0, 0, Math.PI); c.fill(); c.beginPath(); c.ellipse(8.2, 0.9, 2.5, 2.4, 0, 0, Math.PI); c.fill();
    c.fillStyle = 'rgba(255,255,255,.45)'; rr(c, -6, -1.3, 12, 0.8, 0.4); c.fill();
    c.fillStyle = '#b8ab8a'; for (let i = 0; i < 5; i++) { c.beginPath(); c.arc(-8.9 + (i % 3) * 0.7, -0.5 + (i > 2 ? 0.8 : 0), 0.22, 0, TAU); c.fill(); }
    // two strips of silver gaffer tape over the handle, onto the board
    c.fillStyle = 'rgba(178,182,188,.92)';
    for (const tx of [-3.2, 2.6]) { c.beginPath(); c.moveTo(tx - 1.1, -4.6); c.lineTo(tx + 1.2, -4.8); c.lineTo(tx + 1.4, 4.4); c.lineTo(tx + 0.6, 4.7); c.lineTo(tx - 0.1, 4.4); c.lineTo(tx - 0.9, 4.8); c.closePath(); c.fill(); }
    c.strokeStyle = 'rgba(255,255,255,.35)'; c.lineWidth = 0.14; c.beginPath();
    for (const tx of [-3.2, 2.6]) for (let i = 0; i < 6; i++) { c.moveTo(tx - 0.8, -4 + i * 1.5); c.lineTo(tx + 1.1, -4.1 + i * 1.5); }
    c.stroke();
    c.restore();
    // the coiled cord, off to the right (the brick phone)
    c.strokeStyle = '#e6dcc0'; c.lineWidth = 0.55; c.beginPath(); c.moveTo(10.6, 0.8);
    for (let i = 0; i <= 60; i++) { const t = i / 60, px = 10.6 + t * 7.4, py = 0.8 + Math.sin(t * Math.PI) * 6 + Math.sin(t * 38) * 0.8; c.lineTo(px, py); }
    c.stroke();
    c.restore();
  }

  // the soggy present the Remote sits on (hq_roof: P1, "one soggy present box as a table"), its top seen from the
  // hands' side: red paper gone dark with rain, a green ribbon, water stains. Centre-top (x, y), u = px per unit.
  function present(c, x, y, u, H) {
    const top = y, bot = H + 4, wT = 34 * u, wB = 46 * u;
    c.save();
    c.beginPath(); c.moveTo(x - wT, top); c.lineTo(x + wT, top); c.lineTo(x + wB, bot); c.lineTo(x - wB, bot); c.closePath();
    const g = c.createLinearGradient(0, top, 0, bot); g.addColorStop(0, '#6e2420'); g.addColorStop(1, '#8e302a');
    c.fillStyle = g; c.fill(); c.clip();
    c.strokeStyle = 'rgba(255,220,200,.08)'; c.lineWidth = u * 0.5; c.beginPath();
    for (let i = -8; i <= 8; i++) { c.moveTo(x + i * 6 * u, top); c.lineTo(x + i * 8 * u, bot); }   // the paper's stripes
    c.stroke();
    for (let i = 0; i < 7; i++) {                            // wet patches
      const bx = x + ((i * 37) % 70 - 35) * u, by = top + ((i * 53) % 30 + 4) * u, br = (5 + (i * 29) % 7) * u;
      const rg = c.createRadialGradient(bx, by, 0, bx, by, br); rg.addColorStop(0, 'rgba(30,6,6,.35)'); rg.addColorStop(1, 'rgba(30,6,6,0)');
      c.fillStyle = rg; c.fillRect(bx - br, by - br, br * 2, br * 2);
    }
    c.fillStyle = '#2d6a4f'; c.beginPath(); c.moveTo(x - 2.6 * u, top); c.lineTo(x + 2.6 * u, top); c.lineTo(x + 3.4 * u, bot); c.lineTo(x - 3.4 * u, bot); c.closePath(); c.fill();
    c.fillStyle = 'rgba(255,255,255,.12)'; c.fillRect(x - 1.6 * u, top, 0.8 * u, bot - top);
    c.restore();
    c.fillStyle = 'rgba(0,0,0,.35)'; c.fillRect(x - wT, top - 0.6 * u, wT * 2, 0.8 * u);     // the box's far edge
  }
  // Rue's brick phone, antenna up, green LCD, rubber keys (the Remote is wired into it)
  function brick(c, x, y, u) {
    c.save(); c.translate(x, y); c.rotate(0.12); c.scale(u, u);
    c.fillStyle = 'rgba(0,0,0,.35)'; c.filter = `blur(${Math.max(1, u * 1.2)}px)`; rr(c, -3.6, -9, 8, 20, 1.6); c.fill(); c.filter = 'none';
    c.fillStyle = '#1e2024'; rr(c, -1.2, -15, 1.4, 7, 0.6); c.fill();                           // antenna
    c.fillStyle = '#2b2e34'; rr(c, -4, -9.5, 8, 20, 1.6); c.fill();
    c.fillStyle = '#3a3e46'; rr(c, -3.4, -9, 6.8, 2.2, 1); c.fill();
    c.fillStyle = '#9fd48a'; rr(c, -2.9, -6.4, 5.8, 3.4, 0.4); c.fill();                       // the LCD
    c.fillStyle = '#2f4a26'; c.font = 'bold 1.3px ' + SYS; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('LINE', 0, -4.7);
    c.fillStyle = '#4a4e57';
    for (let r = 0; r < 4; r++) for (let k = 0; k < 3; k++) { rr(c, -2.9 + k * 2.05, -1.6 + r * 2.4, 1.7, 1.6, 0.5); c.fill(); }
    c.restore();
  }

  // ---------------------------------------------------------- Future Luka's reach (3D): registered once, here
  // ANIMS.glass_reach: the right arm up toward the glass, the hand following the cursor. a.p.reach 0..1 (how far out),
  // a.p.side -1 (his right, NO) .. +1 (his left, YES), a.p.tremble 0..1. The mini-game writes them every tick.
  if (typeof ANIMS !== 'undefined' && !ANIMS.glass_reach) {
    ANIMS.glass_reach = (r, t, p) => {
      const K = typeof RIGKIT !== 'undefined' ? RIGKIT : null;
      if (!K) return;
      const P = r.parts, d = r.d, k = p.reach ?? 0.7, sd = clamp(p.side ?? 0, -1, 1), tr = p.tremble || 0;
      K.base(r, t);
      const jx = tr * (0.016 * Math.sin(t * 41) + 0.009 * Math.sin(t * 67 + 1.3)), jy = tr * (0.012 * Math.sin(t * 53 + 0.7) + 0.007 * Math.sin(t * 29));
      K.arm(r, -1, d.shX * 0.75 - sd * 0.2 + jx, d.armY + 0.02 + 0.08 * k + jy, 0.3 + 0.3 * k, 1, -0.5, -0.3);
      P.handR.rotation.x = -0.35 - 0.25 * k + tr * 0.12 * Math.sin(t * 47); P.handR.rotation.z = 0.15 * sd;
      P.torso.rotation.y = -0.05 + 0.08 * sd; P.head.rotation.x = -0.12 - 0.05 * k; P.head.rotation.y = 0.06 * sd;
    };
    ANIMS.glass_reach.upper = true;
  }

  // ============================================================ hold_no
  MINIGAMES.hold_no = (() => {
    const DW = 400, DH = 236, RAD = 22;
    const YX = 140, NX = 260, BY = 150, BW = 104, BH = 38;        // the pills (design units)
    const START_U = 222, START_V = 100, HALF_U = 207;              // the cursor's start; the NO half after YES greys
    const T_FAR = 46, T_NEAR = 10, ATTEMPT = 12, MIN_D = 5, REARM = 40;
    const LINE = '…No.';                                            // spec 3.6, LUKA (2040), the second attempt
    const HQ_GLASS = [-3.0, 2.15, -11.24];                          // hq_top's glass panel (docs/sets/hq_top.md §2)
    const O_LINE = { auto: 1.2 };
    let api = null, ov = null, ctx = null, P = null, done = true, run = 0, AUTO = false, autoS = 0, autoT = 0;
    let p = 0, endT = 0, attempts = 0, armed = true, drift = 0, yesOff = false, shake = 0, tremble = 0, t = 0, saying = false;
    let cu = START_U, cv = START_V, tu = START_U, tv = START_V, lpx = -1, lpy = -1, ptrLatch = false, keyHold = false, onNo = false, holdingNow = false, snap = false;
    let actor = null, prevAnim = null, reach = 0.6, side = 0, glassP = null, gsent = { u: -1, v: -1, k: -1, mode: '' }, gTick = 0;
    let glassW = 3.2, glassOn = false, label = null, labelT = 0;
    const gC = new THREE.Vector3(), gR = new THREE.Vector3(), tv3 = new THREE.Vector3();
    // layout (screen)
    let W = 0, H = 0, sch = '', dpr = 1, popC = null, popX = 0, popY = 0, popS = 1, popW = 0, popH = 0, minW = 0, maxW = 0, botRes = 0;
    let fKey = '', fTxt = '', hint = '', hintW = 0, fTag = '', placed = false, staticDirty = true, paintS = 0;
    let vig = null;

    const live = (k) => k === run && !done;
    function glassSpec(w) {                                 // -> sets gC / glassW / glassOn from params or the set
      glassOn = false;
      const g = P.glass;
      if (g === false) return;
      let at = null;
      if (Array.isArray(g)) at = g;
      else if (g && typeof g === 'object') { at = g.at; if (g.w > 0) glassW = g.w; }
      else if (w.prop('glass_ui')) { at = HQ_GLASS; glassW = 3.2; }
      else { const an = w.anchor('glass_popup'); if (an) at = an.at || null; }
      if (typeof at === 'string') {                         // anchor / mark / prop name
        const an = w.anchor(at), mk = w.mark(at), pr = w.prop(at);
        if (an && an.at) at = an.at; else if (mk) at = mk; else if (pr) { pr.getWorldPosition(tv3); at = [tv3.x, tv3.y, tv3.z]; } else at = null;
      }
      if (!at) return;
      if (at.isVector3) gC.copy(at); else gC.set(at[0], at[1] ?? 2, at[2]);
      glassOn = true;
    }
    function defaultShot(w) {
      if (P.shot) return P.shot;
      if (glassOn && actor) {                               // three-quarter back from his right: his face, the reaching arm, the glass
        let fx = gC.x - actor.pos.x, fz = gC.z - actor.pos.z;   // facing: toward the glass
        const l = Math.hypot(fx, fz);
        if (l < 0.05) { fx = Math.sin(actor.rotY); fz = Math.cos(actor.rotY); } else { fx /= l; fz /= l; }
        const rx = -fz, rz = fx, x = actor.pos.x, y = actor.pos.y, z = actor.pos.z;   // his right
        // close on his right, a little behind: he holds the left third, the glass (and the pop-up) the right two
        return { shot: 'CAM', pos: [x + rx * 1.2 - fx * 0.3, y + 1.72, z + rz * 1.2 - fz * 0.3], look: [x - rx * 0.44 + fx * 0.85, y + 1.82, z - rz * 0.44 + fz * 0.85], fov: 52 };
      }
      if (actor) return { shot: 'CLOSE', on: P.actor || 'luka40' };
      return null;
    }
    function glassUI() { return glassP && glassP.userData && typeof glassP.userData.popup === 'function' ? glassP.userData : null; }
    function syncGlass(force) {                             // the 3D panel follows the painted one (on change, <= 30 Hz)
      const g = glassUI();
      if (!g) return;
      const mode = yesOff ? 'yes_grey' : 'yes_no';
      if (mode !== gsent.mode) { gsent.mode = mode; g.popup(mode); }
      if (!force && (gTick ^= 1)) return;
      const u = cu / DW, v = cv / DH;
      if (typeof g.cursor === 'function' && (force || Math.abs(u - gsent.u) > 0.004 || Math.abs(v - gsent.v) > 0.004)) { gsent.u = u; gsent.v = v; g.cursor(u, v); }
      if (typeof g.hold === 'function' && (force || Math.abs(p - gsent.k) > 0.01 || (p >= 1 && gsent.k < 1))) { gsent.k = p; g.hold(p); }
    }

    // ---------------------------------------------------------- the pop-up (static part painted once per size / state)
    function paintStatic() {
      staticDirty = false; paintS = popS;
      const s = popS * dpr, pw = Math.ceil((DW + 60) * s), ph = Math.ceil((DH + 60) * s);
      if (popC.width !== pw || popC.height !== ph) { popC.width = pw; popC.height = ph; }
      const c = popC.getContext('2d');
      c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, pw, ph);
      c.setTransform(s, 0, 0, s, 30 * s, 30 * s);
      glassBody(c, DW, DH, RAD);
      logo(c, 22, 22);
      c.fillStyle = INK; c.font = '600 27px ' + SYS; c.textAlign = 'center'; c.textBaseline = 'middle';
      c.fillText('OPT OUT ALL USERS?', DW / 2, 82);
      pill(c, YX, BY, BW, BH, 'YES', yesOff);
      pill(c, NX, BY, BW, BH, 'NO', false);
      c.fillStyle = MUTE; c.font = '12px ' + SYS; c.fillText('Scheduled: Monday 24 December 2040 · 11:58', DW / 2, 214);
    }
    function layout() {
      W = innerWidth; H = innerHeight; sch = api.input.scheme; dpr = ov.canvas.width / W || 1;
      const touch = sch === 'touch', narrow = W < 600;
      botRes = touch ? (narrow ? 250 : 120) : 150;
      minW = Math.min(W - 24, 360); maxW = Math.max(minW, Math.min(W - 24, 620, W * 0.5, (H - botRes - 90) * DW / DH));   // he stays in frame
      fKey = 'bold 13px ' + FONT; fTxt = (narrow ? 14 : 15) + 'px ' + FONT; fTag = 'bold 13px ' + FONT;
      setHint();
      vig = ctx.createRadialGradient(W / 2, H * 0.45, Math.min(W, H) * 0.3, W / 2, H * 0.45, Math.max(W, H) * 0.8);
      vig.addColorStop(0, 'rgba(0,0,0,0)'); vig.addColorStop(1, 'rgba(0,0,0,0.5)');
      placed = false; place(); staticDirty = true;
    }
    function setHint() {
      hint = options.holdToPress === true ? 'Press to confirm' : 'Hold for three seconds';
      ctx.font = fTxt; hintW = ctx.measureText(hint).width;
    }
    function place() {                                       // the pop-up on the glass (projected), else upper centre
      let x = W / 2, y = Math.min(H * 0.4, (H - botRes) / 2), w = Math.min(maxW, Math.max(minW, W * 0.5));
      if (glassOn && typeof cam !== 'undefined' && cam.camera) {
        const pr = cam.project(gC);
        if (pr.visible) {
          const px = pr.x, py = pr.y;
          gR.setFromMatrixColumn(cam.camera.matrixWorld, 0).multiplyScalar(glassW * 0.5).add(gC);
          const q = cam.project(gR), sw = Math.hypot(q.x - px, q.y - py) * 2;
          x = px; y = py; w = clamp(sw * 0.94, minW, maxW);
        }
      }
      const s = w / DW, h = DH * s;
      x = clamp(x, w / 2 + 12, W - w / 2 - 12); y = clamp(y, h / 2 + 56, Math.max(h / 2 + 56, H - botRes - h / 2 - 46));
      popS = s; placed = true;
      if (Math.abs(s - paintS) > paintS * 0.12) staticDirty = true;   // repaint only on a real change of size (a camera ease scales the bitmap)
      popX = x - (DW * popS) / 2; popY = y - (DH * popS) / 2; popW = DW * popS; popH = DH * popS;
    }
    const toU = (sx) => (sx - popX) / popS, toV = (sy) => (sy - popY) / popS;
    function dYes(u, v) { const dx = Math.max(YX - BW / 2 - u, 0, u - (YX + BW / 2)), dy = Math.max(BY - BH / 2 - v, 0, v - (BY + BH / 2)); return Math.hypot(dx, dy); }
    const overNo = (u, v, m) => Math.abs(u - NX) <= BW / 2 + m && Math.abs(v - BY) <= BH / 2 + m;

    // ---------------------------------------------------------- input -> the cursor target and the hold
    function readInput(dt) {
      const I = api.input, Pt = I.pointer, htp = options.holdToPress === true, noPress = I.pressed('no');
      if (Pt.pressed) {                                      // a click / tap: the pointer owns it (not the engine's YES latch)
        I.unlatch(); I.consume('yes');
        if (htp && !noPress) ptrLatch = overNo(toU(Pt.x), toV(Pt.y), 8) ? !ptrLatch : false;   // tap NO: it holds; again / elsewhere: let go
      }
      if (Pt.x !== lpx || Pt.y !== lpy || Pt.pressed) {     // the mouse / a finger moved: the cursor goes there
        if (lpx >= 0 || Pt.pressed) { tu = toU(Pt.x); tv = toV(Pt.y); }
        lpx = Pt.x; lpy = Pt.y;
      }
      const m = I.move;
      if (m.x || m.y) { const sp = 240 * dt * (I.run ? 1.6 : 1); tu = cu + m.x * sp; tv = cv - m.y * sp; snap = true; }   // keys / stick: direct
      onNo = overNo(cu, cv, 4);
      let hold;
      if (htp) {                                             // "press instead": NO (or YES on the NO button) starts it, again stops it
        if (noPress) { ptrLatch = !ptrLatch; I.unlatch(); }
        else if (I.pressed('yes') && onNo) { ptrLatch = !ptrLatch; I.unlatch(); }
        hold = keyHold = ptrLatch;
      } else {
        keyHold = I.held('no');                              // Esc / B / the touch NO button / a right-click held anywhere
        hold = keyHold || (Pt.down && overNo(cu, cv, 8)) || (I.held('yes') && !Pt.down && onNo);
      }
      if (keyHold) { tu = NX + 6; tv = BY + 4; }            // NO anywhere: the hand goes to the NO button
      return hold;
    }
    function autoInput() {                                    // the autoplayer's hand: two reaches toward YES, then NO
      autoT += clock.dt;
      if (autoS === 0) { if (autoT > (TEST.fast ? 0.1 : 0.5)) { autoS = TEST.fast ? 3 : 1; autoT = 0; } tu = START_U; tv = START_V; return false; }
      if (autoS === 1 || autoS === 2) {
        if (drift > 0 || saying) { autoT = 0; return false; }
        tu = YX + 30; tv = BY - 6;
        if (attempts >= autoS) { autoS++; autoT = 0; }
        if (autoS === 3) autoT = -0.4;
        return false;
      }
      if (saying || drift > 0 || autoT < 0) return false;
      tu = NX + 6; tv = BY + 4;
      return overNo(cu, cv, 4);
    }

    function step(dt, want) {                                 // move the cursor toward (tu, tv), with the resistance near YES
      tu = clamp(tu, 6, DW - 6); tv = clamp(tv, 6, DH - 6);
      if (drift > 0) {                                        // the hand pulls itself back toward NO
        drift -= dt;
        tu = NX - 10; tv = BY - 34;
      }
      if (yesOff && tu < HALF_U) tu = HALF_U;
      const k = drift > 0 ? 1 - Math.exp(-dt * 3.2) : snap ? 1 : 1 - Math.exp(-dt * 12);
      snap = false;
      let nu = cu + (tu - cu) * k, nv = cv + (tv - cv) * k;
      if (yesOff && nu < HALF_U) nu = HALF_U;
      // resistance: the closer to YES, the harder; never onto it
      let d = dYes(nu, nv);
      if (d < MIN_D) {                                       // push it back out to MIN_D along the line from the button
        const ex = clamp(nu, YX - BW / 2, YX + BW / 2), ey = clamp(nv, BY - BH / 2, BY + BH / 2);
        let dx = nu - ex, dy = nv - ey, l = Math.hypot(dx, dy);
        if (l < 0.001) { dx = 1; dy = 0; l = 1; }
        nu = ex + dx / l * MIN_D; nv = ey + dy / l * MIN_D; d = MIN_D;
      }
      const tr = smooth(T_FAR, T_NEAR, d);
      if (drift <= 0 && !yesOff) nu += tr * 48 * dt;          // near YES the hand keeps easing back toward NO by itself
      cu = nu; cv = nv;
      tremble = Math.max(tr * (yesOff ? 0.4 : 1), shake);
      // an attempt: once per excursion (re-armed once the cursor is well away again)
      if (armed && !yesOff && drift <= 0 && d < ATTEMPT) attempt();
      if (!armed && d > REARM && drift <= 0) armed = true;
    }
    async function attempt() {
      armed = false; attempts++; shake = 1; drift = 1.15;
      emit('hold_no:attempt', attempts);
      if (attempts < 2 || yesOff) return;
      yesOff = true; staticDirty = true;                      // YES greys out (the 3D glass too)
      SO.vol = 0.35; SO.rate = 0.9; api.sfx('clunk', SO);
      const line = P.line === undefined ? LINE : P.line;
      if (!line) return;
      const k = run;
      saying = true;
      await api.say('luka40', line, O_LINE);
      if (live(k)) saying = false;
    }

    function fin() {
      if (done) return;
      emit('hold_no:done');
      api.finish({ done: true, no: true, attempts, yesGreyed: yesOff });
    }
    function setReach(dt) {                                   // his arm follows the cursor and the hold
      if (!actor) return;
      const tk = 0.55 + 0.35 * (1 - clamp(Math.abs(cu - DW / 2) / DW, 0, 1)) + 0.1 * p;
      reach += (tk - reach) * Math.min(1, dt * 4);
      const ts = clamp((DW / 2 - cu) / (DW * 0.32), -1, 1);
      side += (ts - side) * Math.min(1, dt * 6);
      actor.p.reach = reach; actor.p.side = side; actor.p.tremble = tremble;
    }

    return {
      start(params, a) {
        api = a; ov = a.overlay; ctx = ov.ctx; P = params || {};
        run++; done = false; AUTO = false; autoS = 0; autoT = 0; snap = false;
        p = 0; endT = 0; attempts = 0; armed = true; drift = 0; yesOff = false; shake = 0; tremble = 0; t = 0; saying = false;
        cu = tu = START_U; cv = tv = START_V; lpx = lpy = -1; ptrLatch = false; keyHold = false; onNo = false; holdingNow = false;
        reach = 0.6; side = 0; gsent.u = gsent.v = gsent.k = -1; gsent.mode = ''; gTick = 0; labelT = 0;
        W = H = 0; placed = false; staticDirty = true; paintS = 0; glassW = 3.2;
        if (!popC) popC = document.createElement('canvas');
        const w = a.world;
        actor = w.actor(P.actor || 'luka40') || null;
        glassP = w.prop('glass_ui') || null;
        glassSpec(w);
        prevAnim = actor ? actor.anim : null;
        if (actor && P.anim !== false) { actor.p.reach = reach; actor.p.side = 0; actor.p.tremble = 0; actor.play('glass_reach'); }
        const sh = defaultShot(w);
        if (sh) a.cam.shot(sh);
        try { label = portraitURL.canvas('luka40'); } catch (e) { label = null; }
        syncGlass(true);
        ov.show(true);
      },
      update(dt) {
        if (done || !api) return;
        t += dt;
        if (labelT < 4) labelT += dt;
        if (p >= 1) { if ((endT += dt) >= END_T) fin(); return; }
        const want = AUTO ? autoInput() : readInput(dt);
        holdingNow = want;
        step(dt, want);
        if (shake > 0) shake = Math.max(0, shake - dt * 0.9);
        p = want ? Math.min(1, p + dt * (AUTO ? AUTO_K : 1) / HOLD) : Math.max(0, p - dt * REWIND);
        if (p >= 1) { api.input.unlatch(); SO.vol = 0.3; SO.rate = 1; api.sfx('ss_chirp', SO); }
        setReach(dt);
        syncGlass(p >= 1);
      },
      draw() {
        if (done || !ctx) return;
        if (W !== innerWidth || H !== innerHeight || api.input.scheme !== sch || ov.canvas.width / innerWidth !== dpr) layout();
        place();
        if (staticDirty) paintStatic();
        const c = ctx, d = dpr;
        c.setTransform(d, 0, 0, d, 0, 0); c.clearRect(0, 0, W, H);
        c.fillStyle = vig; c.fillRect(0, 0, W, H);
        // the pop-up (static), then the live bits in design units
        c.drawImage(popC, popX - 30 * popS, popY - 30 * popS, (DW + 60) * popS, (DH + 60) * popS);
        c.setTransform(d * popS, 0, 0, d * popS, d * popX, d * popY);
        if (onNo && p <= 0) { c.lineWidth = 2; c.strokeStyle = 'rgba(47,134,224,0.6)'; rr(c, NX - BW / 2 - 3, BY - BH / 2 - 3, BW + 6, BH + 6, BH / 2 + 3); c.stroke(); }
        if (p > 0 || holdingNow) ringOn(c, NX, BY, BW + 16, BH + 16, p, 4.5);
        const j = tremble * 2.2;
        const jx = j * (Math.sin(t * 61) + 0.6 * Math.sin(t * 97 + 1)), jy = j * (Math.sin(t * 73 + 2) + 0.5 * Math.sin(t * 41));
        arrow(c, cu + jx, cv + jy, 1.15);
        c.setTransform(d, 0, 0, d, 0, 0);
        // the house prompt pill under the pop-up, until the hold starts
        const ha = 1 - smooth(0, 0.04, p);
        if (ha > 0) promptPill(c, popX + popW / 2, popY + popH + 30, 'NO', hint, hintW, fKey, fTxt, ha);
        // who you are, for a moment: the only time the player is Future Luka
        if (labelT < 4 && label) {
          const a = labelT < 0.4 ? labelT / 0.4 : labelT > 3.2 ? (4 - labelT) / 0.8 : 1, x = 16, y = sch === 'touch' && W < 600 ? 56 : 16;
          c.globalAlpha = a * 0.92; c.fillStyle = 'rgba(20,29,58,0.88)'; rr(c, x, y, 170, 50, 12); c.fill();
          c.globalAlpha = a; c.save(); rr(c, x + 6, y + 6, 38, 38, 8); c.clip(); c.drawImage(label, x + 6, y + 6, 38, 38); c.restore();
          c.fillStyle = YEL; c.font = fTag; c.textAlign = 'left'; c.textBaseline = 'middle'; c.fillText('LUKA (2040)', x + 54, y + 25);
          c.globalAlpha = 1;
        }
      },
      end(r) {
        const wasSaying = saying;
        done = true; run++;
        if (wasSaying && typeof say !== 'undefined' && say.reset) say.reset();
        if (r && r.skipped) { p = 1; syncGlass(true); }
        if (actor) {
          actor.p.reach = 0; actor.p.side = 0; actor.p.tremble = 0;
          if (actor.anim === 'glass_reach') actor.play(prevAnim && prevAnim !== 'glass_reach' ? prevAnim : 'idle');
        }
        actor = null; glassP = null;
        if (api) api.input.unlatch();
        if (ctx) { ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, ov.canvas.width, ov.canvas.height); ctx.globalAlpha = 1; }
      },
      skipResult: () => ({ done: true, no: true, attempts, yesGreyed: yesOff }),
      // tests: where things are on screen right now (CSS px) and the game's state
      debug: () => ({ yes: [popX + YX * popS, popY + BY * popS], no: [popX + NX * popS, popY + BY * popS], cursor: [popX + cu * popS, popY + cv * popS], p, attempts, yesOff, done }),
      autoplay(a) { if (done || api !== a) return; AUTO = true; autoS = 0; autoT = 0; },
    };
  })();

  // ============================================================ choice
  MINIGAMES.choice = (() => {
    const DW = 480, DH = 336, RAD = 24;
    const YX = 155, NX = 325, BY = 262, BW = 120, BH = 42;
    const CAP = ['Keep the memories', 'Clear the memories'];
    let api = null, ov = null, ctx = null, P = null, done = true, run = 0, AUTO = false, autoK = 0, autoT = 0;
    const pk = [0, 0];
    let cur = -1, picked = -1, endT = 0, tried = false, triedA = 0, ptrLatch = -1, hover = -1;
    let W = 0, H = 0, sch = '', dpr = 1, popC = null, handC = null, popX = 0, popY = 0, popS = 1, popW = 0, popH = 0, staticDirty = true;
    let vig = null, fHint = '', handsOn = true, hx = 0, hy = 0, hs = 1, wantKey = -1;

    function paintStatic() {
      staticDirty = false;
      const s = popS * dpr, pw = Math.ceil((DW + 60) * s), ph = Math.ceil((DH + 60) * s);
      if (popC.width !== pw || popC.height !== ph) { popC.width = pw; popC.height = ph; }
      const c = popC.getContext('2d');
      c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, pw, ph);
      c.setTransform(s, 0, 0, s, 30 * s, 30 * s);
      glassBody(c, DW, DH, RAD);
      logo(c, 22, 22);
      c.textAlign = 'center'; c.textBaseline = 'middle';
      // the warning drop + STORAGE FULL, centred together
      c.font = '800 25px ' + SYS;
      const tw = c.measureText('STORAGE FULL').width, ix = DW / 2 - (tw + 30) / 2 + 11, tx = ix + 19 + tw / 2;
      const g = c.createRadialGradient(ix - 2, 56, 1, ix, 58, 11);
      g.addColorStop(0, '#ffffff'); g.addColorStop(0.4, '#ffc58f'); g.addColorStop(1, '#f08a3a');
      c.fillStyle = g; c.beginPath(); c.arc(ix, 58, 11, 0, TAU); c.fill();
      c.fillStyle = '#ffffff'; c.font = '800 14px ' + SYS; c.fillText('!', ix, 58.5);
      c.fillStyle = INK; c.font = '800 25px ' + SYS; c.fillText('STORAGE FULL', tx, 59);
      c.fillStyle = '#3c4c6a'; c.font = '15px ' + SYS; c.fillText('To complete this call, the following will be cleared:', DW / 2, 100);
      c.fillStyle = INK; c.font = '800 24px ' + SYS; c.fillText('2 days, 6 hours, 54 minutes.', DW / 2, 134);
      c.fillStyle = SS; c.font = 'italic 15px ' + SYS; c.fillText('Never forget anything again!', DW / 2, 170);
      c.fillStyle = INK; c.font = '700 16px ' + SYS; c.fillText('Upgrade to Optus Cloud+ and keep them instead?', DW / 2, 205);
      pill(c, YX, BY, BW, BH, 'YES', false);
      pill(c, NX, BY, BW, BH, 'NO', false);
      c.fillStyle = '#4a5a78'; c.font = '600 13px ' + SYS;
      c.fillText(CAP[0], YX, BY + 44); c.fillText(CAP[1], NX, BY + 44);
    }
    function paintHands() {                                 // the Remote and both hands, once per size (Rue's handsCv)
      handC.width = Math.ceil(W * dpr); handC.height = Math.ceil(H * dpr);
      const c = handC.getContext('2d');
      c.setTransform(dpr, 0, 0, dpr, 0, 0); c.clearRect(0, 0, W, H);
      if (!handsOn) return;
      const R = hs, s = R * 0.19;
      present(c, hx, hy - R * 1.05, R / 10, H);
      brick(c, hx + R * 2.15, hy + R * 0.05, R / 10);
      remote(c, hx, hy, R / 10);
      hand(c, hx - R * 1.05, hy + R * 1.75, 0.42, s, false, '#dfae8c', '#b98a6a', '#efcab0', '#15161a', '#2a2b31', true, 1.1, true);   // Luka's right, grazed
      hand(c, hx + R * 1.05, hy + R * 1.75, -0.42, s, true, '#ebba95', '#c99a78', '#f6dccb', '#1f6fe0', '#4b8df0', false, 0.92, false); // Chase's left
    }
    function layout() {
      W = innerWidth; H = innerHeight; sch = api.input.scheme; dpr = ov.canvas.width / W || 1;
      const touch = sch === 'touch', narrow = W < 600, portrait = H > W * 1.1;
      // the hands: Rue's proportions, the Remote low in the frame; the pop-up as large as fits above it (it may sit
      // over the Remote's top edge on a short landscape phone rather than shrink below readable)
      hs = Math.min(W * (portrait ? 0.22 : 0.16), H * 0.15);
      const top = narrow ? 50 : 36, avW = Math.min(W - 24, 700);
      const sFull = Math.min(avW / DW, (H - top - 30) / DH, 1.4);
      const sHands = Math.min(sFull, (H - top - 12 - (handsOn ? hs * (portrait ? 3.1 : 1.95) : (touch ? (narrow ? 230 : 30) : 40))) / DH);
      popS = Math.max(sHands, Math.min(sFull, 380 / DW)); popW = DW * popS; popH = DH * popS;
      popX = (W - popW) / 2; popY = top;
      hx = W / 2; hy = Math.max(H - hs * (portrait ? 2.2 : 1.15), popY + popH + hs * 0.8);
      fHint = (narrow ? 13 : 14) + 'px ' + FONT;
      vig = ctx.createRadialGradient(W / 2, H * 0.5, Math.min(W, H) * 0.25, W / 2, H * 0.5, Math.max(W, H) * 0.75);
      vig.addColorStop(0, 'rgba(0,0,0,0.22)'); vig.addColorStop(1, 'rgba(0,0,0,0.7)');
      staticDirty = true; paintHands();
    }
    const toU = (sx) => (sx - popX) / popS, toV = (sy) => (sy - popY) / popS;
    function pillAt(u, v) {
      if (Math.abs(v - BY) > BH / 2 + 8) return -1;
      if (Math.abs(u - YX) <= BW / 2 + 8) return 0;
      if (Math.abs(u - NX) <= BW / 2 + 8) return 1;
      return -1;
    }
    function readInput() {                                   // -> 0 YES, 1 NO, -1 nothing
      const I = api.input, Pt = I.pointer, htp = options.holdToPress === true;
      const u = toU(Pt.x), v = toV(Pt.y), at = pillAt(u, v);
      hover = at;
      if (Pt.pressed) {                                      // a mouse button / finger: only the pills count
        I.unlatch(); I.consume('yes'); I.consume('no');
        if (htp) ptrLatch = at >= 0 && at !== ptrLatch ? at : -1;   // tap a pill: it fills; tap it again (or elsewhere): stop
      }
      if (htp) {                                             // "press instead": a press starts that ring, the same press again stops it
        if (I.pressed('yes')) { ptrLatch = ptrLatch === 0 ? -1 : 0; I.unlatch(); }
        if (I.pressed('no')) { ptrLatch = ptrLatch === 1 ? -1 : 1; I.unlatch(); }
        return ptrLatch;
      }
      if (Pt.down) return at;
      if (I.pressed('yes')) wantKey = 0;
      if (I.pressed('no')) wantKey = 1;
      const y = I.held('yes'), n = I.held('no');
      if (y && n) return wantKey;
      return y ? 0 : n ? 1 : -1;
    }
    function choose(k) {
      picked = k; endT = 0;
      const c = k === 0 ? 'A' : 'B';
      state.choice = c;
      if (profile && profile.endingsSeen) profile.endingsSeen[c] = true;
      try { saveGame(); } catch (e) { /* storage blocked */ }
      api.input.unlatch();
      SO.vol = 0.3; SO.rate = 1; api.sfx('ss_chirp', SO);
      emit('choice', c);
    }
    function fin() { if (done) return; api.finish({ choice: picked === 0 ? 'A' : 'B' }); }

    return {
      noSkip: true,
      start(params, a) {
        api = a; ov = a.overlay; ctx = ov.ctx; P = params || {};
        run++; done = false; AUTO = false; autoT = 0;
        pk[0] = pk[1] = 0; cur = -1; picked = -1; endT = 0; tried = false; triedA = 0; ptrLatch = -1; hover = -1; wantKey = -1;
        handsOn = P.hands !== false;
        W = H = 0; staticDirty = true;
        if (!popC) popC = document.createElement('canvas');
        if (!handC) handC = document.createElement('canvas');
        const w = a.world;
        if (P.clear !== false && popup.count && popup.count()) popup.clear();   // content's STORAGE FULL makes way for this one
        const sh = P.shot || (w.anchor('s37_hands') ? { shot: 'INSERT', at: 's37_hands' } : w.actor('luka') && w.actor('chase') ? { shot: 'TWO', on: ['luka', 'chase'], size: 'CLOSE' } : null);
        if (sh) a.cam.shot(sh);
        ov.show(true);
      },
      update(dt) {
        if (done || !api) return;
        if (picked >= 0) { if ((endT += dt) >= END_T + 0.35) fin(); return; }
        let k;
        if (AUTO) { autoT += dt; k = autoT > (TEST.fast ? 0.15 : 0.8) ? autoK : -1; }
        else k = readInput();
        if (k >= 0) {
          pk[1 - k] = 0;                                       // switching buttons empties the other ring
          pk[k] = Math.min(1, pk[k] + dt * (AUTO ? AUTO_K : 1) / HOLD);
          cur = k;
          if (pk[k] >= 1) choose(k);
        } else {
          if (cur >= 0 && pk[cur] > 0 && pk[cur] < 1) { tried = true; }   // let go too soon: it cancels, no penalty
          cur = -1;
          pk[0] = Math.max(0, pk[0] - dt * REWIND * 1.8); pk[1] = Math.max(0, pk[1] - dt * REWIND * 1.8);
        }
        if (tried && triedA < 1) triedA = Math.min(1, triedA + dt * 2);
      },
      draw() {
        if (done || !ctx) return;
        if (W !== innerWidth || H !== innerHeight || api.input.scheme !== sch || ov.canvas.width / innerWidth !== dpr) layout();
        if (staticDirty) paintStatic();
        const c = ctx, d = dpr;
        c.setTransform(d, 0, 0, d, 0, 0); c.clearRect(0, 0, W, H);
        c.fillStyle = vig; c.fillRect(0, 0, W, H);
        if (handsOn) {                                         // both pressing a little while a ring fills
          const dn = cur >= 0 && picked < 0 ? hs * 0.03 : 0;
          c.drawImage(handC, 0, dn, W, H);
        }
        const fade = picked >= 0 ? smooth(0, END_T + 0.35, endT) : 0;
        c.drawImage(popC, popX - 30 * popS, popY - 30 * popS, popC.width / d, popC.height / d);
        c.setTransform(d * popS, 0, 0, d * popS, d * popX, d * popY);
        for (let k = 0; k < 2; k++) {
          const x = k === 0 ? YX : NX;
          if (picked >= 0 && k !== picked) {                 // the other one dims once it's decided
            c.globalAlpha = 0.55 * fade; c.fillStyle = 'rgba(245,248,252,1)'; rr(c, x - BW / 2 - 2, BY - BH / 2 - 2, BW + 4, BH + 4, BH / 2 + 2); c.fill();
            c.globalAlpha = 1;
            continue;
          }
          if (hover === k && pk[k] <= 0 && picked < 0) { c.lineWidth = 2; c.strokeStyle = 'rgba(47,134,224,0.6)'; rr(c, x - BW / 2 - 3, BY - BH / 2 - 3, BW + 6, BH + 6, BH / 2 + 3); c.stroke(); }
          if (pk[k] > 0) ringOn(c, x, BY, BW + 16, BH + 16, pk[k], 4.5);
        }
        c.setTransform(d, 0, 0, d, 0, 0);
        if (triedA > 0 && picked < 0) {                       // only after a press that let go too soon
          c.globalAlpha = triedA * 0.9; c.fillStyle = '#ffffff'; c.font = fHint; c.textAlign = 'center'; c.textBaseline = 'middle';
          c.shadowColor = 'rgba(0,0,0,0.8)'; c.shadowBlur = 4;
          c.fillText(options.holdToPress === true ? 'Press to confirm · press again to stop' : 'Hold to confirm', W / 2, popY + popH + 20);
          c.shadowBlur = 0; c.shadowColor = 'transparent'; c.globalAlpha = 1;
        }
      },
      end(r) {
        done = true; run++;
        if (api) api.input.unlatch();
        if (ctx) { ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, ov.canvas.width, ov.canvas.height); ctx.globalAlpha = 1; }
      },
      skipResult: () => ({}),
      debug: () => ({ yes: [popX + YX * popS, popY + BY * popS], no: [popX + NX * popS, popY + BY * popS], pk: pk.slice(), picked, tried, done }),
      autoplay(a) {
        if (done || api !== a) return;
        const want = (P.test || TEST.ending || 'A').toUpperCase();
        autoK = want === 'B' ? 1 : 0; AUTO = true; autoT = 0;
      },
    };
  })();
})();
