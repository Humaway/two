// ============================================================ MINI-GAME: Neural Chip Sale (spec 9.4, scene 1.5)
// Rue's JARVIS Sale (ref/rue/12) for 2040: a SafeSense glass terminal over Chase's shoulder, a four-step chip-swap form
// (Customer · Verify · Swap · Opt in) that hates him, and Jayden across the counter. DOM in #mg, built once; the
// in-window pop-ups reuse the engine's SafeSense glass classes (.jv.ss) but live inside the terminal with their own
// rule (dismiss them in the order they arrived), which the engine's popup() queue (newest first) can't express.
//
//   1 Customer  Search types JAYDEN, autocorrect makes it JADE PLANT; fix it by picking letters from a strip
//               (◀ ▶ / stick / drag / wheel / tap a letter; YES picks, NO deletes).
//   2 Verify    MFA: "Code sent to customer's brain. Customer's brain is on 3%." — a 3 s wait while Jayden charges (he
//               eats a muesli bar). Then the verbal consent phrase, shown only in AR: the Chip View tutorial. The
//               terminal asks; the prompt says SWAP to Chase (2040), then hold CHIP; the terminal slides away, the
//               camera finds Jayden over Chase (2040)'s shoulder, Chip View tints the screen, the phrase floats over
//               Jayden beside a thought bubble; CHASE (2040) says it, Jayden repeats it; SWAP back to Chase.
//   3 Swap      the progress bar goes backwards: NO pushes it forwards (YES "cancels", which is worse).
//   4 Opt in    the OK runs away from the cursor: corner it (mouse / finger herds it; stick / arrows move a cursor and
//               YES presses), then "Are you sure you're sure?" [YES].
//   Throughout: SafeSense pop-ups land on the field you need; dismiss them oldest first (YES always takes the oldest;
//   clicking a newer one shakes it). Jayden's THOUGHT pop-ups float up over his head on a soft timer (ahead of par:
//   "he's good"; behind: "is this taking long"; before the MFA: "I'm hungry"). A swap timer against the store average
//   shows how quick Chase is. No fail (spec 9.4), so api.fail() is never called; about two minutes.
//
// SWAP inside the game: the host only handles SWAP while roaming, and flow.swapNext() would hand player control and
// re-route the followers mid-sale, so the game does its own: state.active, ui.swapIndicator, emit('swap', id), the
// camera, and chip.show() (the documented cosmetic Chip View for mini-games: no Signal); body.chipable shows the
// touch CHIP button while it's wanted. Everything is restored in end() (state.active back to the player).
//
// Call (scene 1.5, after the setup cutscene; actors placed, Chase at the terminal):
//   ['minigame', 'chip_sale', { time: '12:20' }]
// params  shot     the terminal camera (a cam.shot step); default: over Chase's right shoulder at the terminal, Jayden
//                  across the counter on the right (computed from the actors)
//         c40Shot  the Chip View camera; default: over Chase (2040)'s shoulder onto Jayden (computed)
//         time     the terminal clock ('12:20');  avg: the store average shown beside the timer (seconds, 2832)
//         player   who the terminal belongs to (default 'chase');  other: who has the chip (default 'chase40')
//         customer the customer's actor id (default 'jayden')
// actors  chase at the terminal (reddy40 s15_chase_terminal [6.4, 0, −10.0, 0]), chase40 beside him
//         (s15_c40_aside [7.3, 0, −10.35, −0.4]), jayden across the counter (s15_jayden_counter [6.4, 0, −7.85, π]).
//         Missing actors are tolerated (no shot moves, no anims, thoughts pinned to the screen).
// result  { ok: true, time: s (game time), slips: n (newer pop-ups clicked first), pops: n (dismissed), consent: true }
//         + auto: true under autoplay, skipped: true from the pause menu's skip (never offered: no fails). Flags:
//         state.flags.s15_sold, s15_consent (the AR phrase was read), s15_chipview (the Chip View tutorial ran).
// events  testLog 'chip_sale <step>', 'chip_sale swap <id>', 'chip_sale chip view', 'chip_sale done <s>'.
// autoplay plays it properly and deterministically (seeded pop-ups): picks the letters, dismisses pop-ups in order,
//          SWAPs, holds CHIP, lets the lines play, SWAPs back, mashes NO, herds the OK into a corner; quicker with &fast=1.
// options  storyMode: fewer pop-ups, a slower backwards bar, a slower OK that tires sooner. holdToPress: CHIP and the
//          NO push read input.holding(), so a press latches. Sounds: ss_chirp, key_beep, tick, pop, sad_beep, whoosh,
//          chip_chime, chime_ready, knock (pitched up: the muesli bar). MINIGAMES.chip_sale.peek() is a test hook.
(() => {
  // ---------------------------------------------------------- the script (spec 9.4 / 1.5)
  const WORD = 'JAYDEN', WRONG = 'JADE PLANT', ABC = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const MFA_MSG = "Code sent to customer's brain. Customer's brain is on 3%.";
  const CHARGES = 'Please wait while the customer charges.';
  const CONSENT = 'verbal consent phrase';
  const TUT = 'SWAP to Chase (2040), then hold CHIP (Q / LB / the CHIP button).';
  const PHRASE = 'I SAY YES TO MY CHIP';
  const C40_LINE = "'I say yes to my chip.'", J_LINE = 'I say yes to my chip.';
  const TH_LONG = 'THOUGHT: is this taking long', TH_HUNGRY = "THOUGHT: I'm hungry", TH_GOOD = "THOUGHT: he's good";
  const STEPS = ['Customer', 'Verify', 'Swap', 'Opt in'];
  // SafeSense nags (the 1.5 POV list first), [message, button]
  const POPS = [
    ['Are you sure?', 'YES'], ['Upgrade to Cloud+?', 'NOT NOW'], ['Never forget anything again!', 'OK'],
    ["Verify identity of customer's brain", 'VERIFY'], ["Are you sure you're sure?", 'YES'], ['Have you tried being safe?', 'YES'],
    ['You have 3 new safety tips.', 'LATER'], ['Reminder: offer the customer Cloud+.', 'OK'], ['How are we doing? ★☆☆☆☆', 'SUBMIT'],
    ['This field has been made safer.', 'OK'], ['The customer is standing very still. Is the customer okay?', 'YES'],
  ];
  const POP_JADE = ['Did you mean: JADE PLANT?', 'IGNORE'];
  const PAR = [36, 78, 98, 122];                 // par seconds by the end of each step (THOUGHTs only; ×1.3 in Story Mode)
  const AVG = 2832;                              // the store average swap: 47:12
  const NUMS = ['1', '2', '3', '4'];
  const SCALE = [], PCT = [], TIMES = [], PREF = [], REST = [];
  for (let i = 0; i <= 100; i++) { SCALE.push('scaleX(' + (i / 100) + ')'); PCT.push(i + '%'); }
  const two = (n) => (n < 10 ? '0' : '') + n;
  for (let s = 0; s < 3600; s++) TIMES.push(two(Math.floor(s / 60)) + ':' + two(s % 60));
  for (let i = 0; i <= WORD.length; i++) { PREF.push(WORD.slice(0, i)); REST.push(WORD.slice(i)); }
  const SO = { tick: { vol: 0.3 }, soft: { vol: 0.45 }, low: { vol: 0.3 }, chirp: { vol: 0.4 }, key: { vol: 0.35 }, munch: { vol: 0.22, rate: 1.7 } };
  const CSS = `
.cs{position:fixed;inset:0;pointer-events:none!important;font-family:var(--sys);color:#1c2a44;user-select:none;-webkit-user-select:none;--cw:44px}
.cs *{box-sizing:border-box}
.cs .off{display:none!important}
.cs-term{position:absolute;left:0;top:0;width:600px;height:460px;display:flex;flex-direction:column;border-radius:22px;overflow:hidden;font-size:15px;
 background:linear-gradient(158deg,rgba(255,255,255,.97),rgba(238,247,255,.96) 55%,rgba(218,236,252,.96));
 box-shadow:0 0 0 1px rgba(255,255,255,.95),0 0 0 4px rgba(143,208,255,.28),0 0 36px rgba(120,190,255,.5),0 22px 46px rgba(8,24,60,.5);
 pointer-events:auto;transition:transform .5s cubic-bezier(.3,.9,.25,1),opacity .4s;opacity:0;transform:translateY(24px) scale(.97)}
.cs.on .cs-term{opacity:1;transform:none}
.cs.on .cs-term.away{opacity:0;transform:translateY(105vh)}
.cs-term::after{content:"";position:absolute;left:0;right:0;top:0;height:46%;border-radius:22px 22px 60% 60%/22px 22px 26px 26px;background:linear-gradient(rgba(255,255,255,.42),rgba(255,255,255,0));pointer-events:none}
.cs-bar{flex:none;display:flex;align-items:center;gap:.8em;height:2.5em;padding:0 1.2em;font-size:.82em;font-weight:600;color:#5a7299}
.cs-logo{display:flex;align-items:center;gap:.45em;color:#2f86e0;letter-spacing:.02em}
.cs-logo::before{content:"";width:1em;height:1em;border-radius:50%;background:radial-gradient(circle at 35% 35%,#fff 0 18%,#8fd0ff 50%,#2f86e0);box-shadow:0 0 7px #8fd0ff}
.cs-ttl{flex:1;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:#46638f}
.cs-tm{display:flex;align-items:baseline;gap:.5em;white-space:nowrap;font-variant-numeric:tabular-nums}
.cs-tm b{font-family:var(--mono);font-size:1.15em;color:#2f86e0;letter-spacing:.02em}
.cs-tm small{font-weight:500;color:#8aa0c0}
.cs-clk{font-variant-numeric:tabular-nums;color:#46638f}
.cs-steps{flex:none;display:flex;align-items:center;gap:.45em;padding:.15em 1.1em .7em}
.cs-st{display:flex;align-items:center;gap:.45em;padding:.28em .85em .28em .3em;border-radius:999px;font-weight:600;font-size:.88em;color:#7d90b0;background:rgba(47,134,224,.07);white-space:nowrap;transition:background .3s,color .3s,box-shadow .3s}
.cs-st b{width:1.6em;height:1.6em;border-radius:50%;display:flex;align-items:center;justify-content:center;background:rgba(47,134,224,.22);color:#fff;font-size:.85em}
.cs-st.on{color:#1c2a44;background:#fff;box-shadow:0 0 0 1.5px #2f86e0,0 0 12px rgba(95,178,255,.55)}
.cs-st.on b{background:#2f86e0}
.cs-st.ok{color:#2c7f53}
.cs-st.ok b{background:#3bb26f}
.cs-ln{flex:1;min-width:.5em;height:2px;border-radius:1px;background:rgba(47,134,224,.18)}
.cs-ln.ok{background:#3bb26f}
.cs-body{flex:1;min-height:0;position:relative;margin:0 .9em .2em;border-radius:16px;background:rgba(255,255,255,.72);box-shadow:inset 0 0 0 1px rgba(191,230,255,.9),inset 0 2px 8px rgba(30,80,150,.06)}
.cs-pane{position:absolute;inset:0;display:flex;flex-direction:column;justify-content:center;justify-content:safe center;gap:.85em;padding:.9em 1.3em;overflow:hidden}
.cs-h{font-size:1.18em;font-weight:600;color:#1c2a44;display:flex;align-items:center;gap:.6em}
.cs-h small{font-size:.72em;font-weight:500;color:#7d90b0}
.cs-row{display:flex;align-items:center;gap:.8em;min-width:0}
.cs-lab{flex:none;width:8.6em;font-size:.88em;font-weight:600;color:#46638f;line-height:1.2}
.cs-lab small{display:block;font-weight:500;color:#8aa0c0;font-size:.86em}
.cs-f{flex:1;min-width:0;min-height:2.45em;display:flex;align-items:center;gap:.05em;padding:.25em .9em;border-radius:12px;background:rgba(255,255,255,.95);box-shadow:inset 0 0 0 1.5px rgba(47,134,224,.3);font:700 1.18em/1.15 var(--mono);letter-spacing:.14em;color:#1c2a44;white-space:nowrap;overflow:hidden;transition:box-shadow .2s,color .2s}
.cs-f.msg{font:500 .9em/1.3 var(--sys);letter-spacing:0;white-space:normal;color:#46638f}
.cs-f.bad{color:#c2410c;box-shadow:inset 0 0 0 2px rgba(240,138,58,.75),0 0 10px rgba(240,138,58,.35)}
.cs-f.good{color:#15803d;box-shadow:inset 0 0 0 2px rgba(59,178,111,.7),0 0 10px rgba(59,178,111,.3)}
.cs-f.live{box-shadow:inset 0 0 0 2px #2f86e0,0 0 12px rgba(95,178,255,.45)}
.cs-f i{font-style:normal;opacity:.22}
.cs-f u{text-decoration:none;display:inline-block;width:.12em;height:1.1em;margin:0 .06em;background:#2f86e0;animation:csbl 1s steps(1) infinite}
.cs-f u.off{display:none}
@keyframes csbl{50%{opacity:0}}
.cs-tk{flex:none;width:1.4em;height:1.4em;border-radius:50%;background:#3bb26f;color:#fff;font:800 .8em/1.4em var(--sys);text-align:center;box-shadow:0 0 8px rgba(59,178,111,.5);visibility:hidden}
.cs-tk.on{visibility:visible;animation:cstk .35s cubic-bezier(.3,1.6,.5,1)}
@keyframes cstk{from{transform:scale(.2)}}
.cs-b{flex:none;height:2.45em;min-width:6.4em;padding:0 1.3em;border-radius:999px;font:600 .92em var(--sys);letter-spacing:.06em;color:#fff;background:linear-gradient(#66b6ff,#2f86e0);box-shadow:0 0 12px rgba(95,178,255,.55),inset 0 1px 0 rgba(255,255,255,.55);white-space:nowrap}
.cs-b:active{background:#2a74c4}
.cs-b.foc{outline:3px solid #ffd21f;outline-offset:2px}
.cs-term.popping .cs-pane .cs-b.foc{outline-color:transparent}
.cs-b.dis{background:#c7d3e3;box-shadow:none;color:#f4f7fb}
.cs-b.ghost{color:#2f86e0;background:rgba(255,255,255,.9);box-shadow:inset 0 0 0 1.5px rgba(47,134,224,.45)}
.cs-note{min-height:1.3em;font-size:.86em;color:#7d90b0;font-style:italic;text-align:center;transition:color .2s}
.cs-note.warn{color:#c2410c;font-style:normal;font-weight:600}
.cs-cust{display:flex;align-items:center;gap:.8em;padding:.5em .8em;border-radius:14px;background:rgba(47,134,224,.06)}
.cs-av{flex:none;position:relative;width:2.6em;height:2.6em;border-radius:50%;background:radial-gradient(circle at 50% 38%,#e7b48c 0 26%,transparent 27%),linear-gradient(#ffd21f 0 0) 50% 100%/100% 36% no-repeat,#9fb4cf;box-shadow:inset 0 0 0 2px #fff,0 0 0 1.5px rgba(47,134,224,.4);overflow:hidden}
.cs-av::before{content:"";position:absolute;left:24%;top:9%;width:52%;height:22%;border-radius:50% 50% 10% 10%;background:#2c3440}
.cs-av::after{content:"";position:absolute;left:0;right:0;bottom:22%;height:5%;background:#c9cfd6}
.cs-cn{flex:1;min-width:0;font-size:.86em;color:#7d90b0;line-height:1.3}
.cs-cn b{display:block;font:700 1.12em var(--mono);letter-spacing:.1em;color:#1c2a44}
.cs-cn em{font-style:normal;color:#c2410c;font-weight:600}
.cs-strip{position:relative;height:3.3em;border-radius:14px;overflow:hidden;background:linear-gradient(#f3f9ff,#d9ebfb);box-shadow:inset 0 0 0 1.5px rgba(47,134,224,.32),inset 0 7px 12px rgba(20,60,120,.1);touch-action:none;cursor:grab}
.cs-strip::before,.cs-strip::after{content:"";position:absolute;top:0;bottom:0;width:18%;z-index:2;pointer-events:none}
.cs-strip::before{left:0;background:linear-gradient(90deg,#e4f1fc,rgba(228,241,252,0))}
.cs-strip::after{right:0;background:linear-gradient(270deg,#e4f1fc,rgba(228,241,252,0))}
.cs-trk{position:absolute;left:0;top:0;height:100%;display:flex;z-index:1;will-change:transform}
.cs-trk i{flex:none;width:var(--cw);height:100%;display:flex;align-items:center;justify-content:center;font:700 1.3em var(--mono);font-style:normal;color:#5a7299;transition:color .12s}
.cs-trk i.on{color:#0e2a55;font-size:1.55em}
.cs-lens{position:absolute;left:50%;top:.32em;bottom:.32em;width:var(--cw);margin-left:calc(var(--cw) / -2);border-radius:10px;z-index:0;background:#fff;box-shadow:0 0 0 2px #2f86e0,0 0 14px rgba(95,178,255,.7);pointer-events:none}
.cs-strip.no .cs-lens{animation:csno .32s;box-shadow:0 0 0 2px #f08a3a,0 0 14px rgba(240,138,58,.6)}
@keyframes csno{20%{transform:translateX(-5px)}45%{transform:translateX(5px)}70%{transform:translateX(-3px)}}
.cs-sr{display:flex;align-items:center;gap:.5em}
.cs-sr .cs-strip{flex:1;min-width:0}
.cs-ar{flex:none;width:2.6em;height:2.6em;border-radius:50%;font-size:1em;color:#2f86e0;background:#fff;box-shadow:inset 0 0 0 1.5px rgba(47,134,224,.45),0 2px 6px rgba(30,80,140,.15)}
.cs-ar:active{background:#e3f0fd}
.cs-brain{display:flex;align-items:center;gap:.9em;padding:.6em .9em;border-radius:14px;background:rgba(255,236,224,.75);box-shadow:inset 0 0 0 1.5px rgba(240,138,58,.4)}
.cs-brain.ok{background:rgba(226,247,234,.8);box-shadow:inset 0 0 0 1.5px rgba(59,178,111,.45)}
.cs-bat{flex:none;position:relative;width:3em;height:1.5em;border-radius:5px;box-shadow:inset 0 0 0 2px #46638f;padding:3px}
.cs-bat::after{content:"";position:absolute;right:-.3em;top:.42em;width:.25em;height:.66em;border-radius:0 2px 2px 0;background:#46638f}
.cs-bat i{display:block;height:100%;border-radius:2px;background:#e0503e;transform-origin:0 50%}
.cs-brain.ok .cs-bat i{background:#3bb26f}
.cs-bt{flex:1;min-width:0;font-size:.88em;line-height:1.3;color:#7a3e1c}
.cs-bt b{display:block;font-weight:600;color:#1c2a44}
.cs-brain.ok .cs-bt{color:#2c7f53}
.cs-ring{flex:none;width:1.8em;height:1.8em;border-radius:50%;border:3px solid rgba(240,138,58,.25);border-top-color:#f08a3a;animation:csrot .9s linear infinite}
.cs-brain.ok .cs-ring{display:none}
@keyframes csrot{to{transform:rotate(360deg)}}
.cs-tut{display:flex;flex-direction:column;align-items:center;gap:.55em;padding:.75em 1em;border-radius:16px;text-align:center;background:linear-gradient(160deg,rgba(47,134,224,.12),rgba(143,208,255,.25));box-shadow:inset 0 0 0 1.5px rgba(47,134,224,.45),0 0 18px rgba(95,178,255,.35);animation:cstut 1.6s ease-in-out infinite}
@keyframes cstut{50%{box-shadow:inset 0 0 0 1.5px rgba(47,134,224,.75),0 0 26px rgba(95,178,255,.6)}}
.cs-tut b{font-size:1.06em;line-height:1.3;color:#14305e}
.cs-keys{display:flex;flex-wrap:wrap;justify-content:center;align-items:center;gap:.45em;font-size:.88em;color:#46638f}
.cs-k{padding:.22em .7em;border-radius:7px;background:#fff;font-weight:700;color:#2f86e0;box-shadow:0 0 0 1.5px #2f86e0,0 3px 0 #2f86e0}
.cs-k.now{background:#ffd21f;color:#141d3a;box-shadow:0 0 0 1.5px #b8950a,0 3px 0 #b8950a}
.cs-k.done{opacity:.45}
.cs-big{position:relative;height:1.5em;border-radius:999px;overflow:hidden;background:rgba(47,134,224,.13);box-shadow:inset 0 1px 4px rgba(20,60,120,.18)}
.cs-big i{position:absolute;left:0;top:0;bottom:0;width:100%;border-radius:999px;transform-origin:0 50%;background:linear-gradient(90deg,#8fd0ff,#2f86e0);box-shadow:0 0 12px rgba(95,178,255,.6)}
.cs-big i::after{content:"";position:absolute;inset:0;border-radius:999px;background:repeating-linear-gradient(-45deg,rgba(255,255,255,.28) 0 8px,rgba(255,255,255,0) 8px 16px);background-size:22.6px 100%;animation:csfw .6s linear infinite}
.cs-big.back i{background:linear-gradient(90deg,#ffc58f,#f08a3a);box-shadow:0 0 12px rgba(240,138,58,.55)}
.cs-big.back i::after{animation-direction:reverse}
@keyframes csfw{from{background-position:0 0}to{background-position:22.6px 0}}
.cs-bp{display:flex;justify-content:space-between;font-size:.86em;color:#46638f;font-variant-numeric:tabular-nums}
.cs-bp b{font-family:var(--mono);font-size:1.1em;color:#1c2a44}
.cs-btns{display:flex;justify-content:center;gap:.9em}
.cs-run{position:relative;flex:1;min-height:6em;border-radius:14px;background:rgba(47,134,224,.05);box-shadow:inset 0 0 0 1.5px rgba(47,134,224,.18);touch-action:none}
.cs-slot{position:absolute;left:50%;top:50%;width:6.6em;height:2.45em;margin:-1.22em 0 0 -3.3em;border-radius:999px;border:1.5px dashed rgba(47,134,224,.45);background:rgba(191,230,255,.2)}
.cs-ok{position:absolute;left:0;top:0;width:6.6em;height:2.45em;margin:-1.22em 0 0 -3.3em;border-radius:999px;display:flex;align-items:center;justify-content:center;font-weight:700;letter-spacing:.08em;color:#fff;background:linear-gradient(#66b6ff,#2f86e0);box-shadow:0 0 14px rgba(95,178,255,.7),inset 0 1px 0 rgba(255,255,255,.55);will-change:transform;pointer-events:none}
.cs-ok.trap{animation:cstr .1s linear infinite alternate}
.cs-ok.hot{outline:3px solid #ffd21f;outline-offset:2px}
.cs-ok.tired{background:linear-gradient(#a8cdef,#74a3d3);box-shadow:0 0 6px rgba(95,178,255,.4)}
@keyframes cstr{from{rotate:-4deg}to{rotate:4deg}}
.cs-cur{position:absolute;left:0;top:0;width:28px;height:28px;margin:-14px 0 0 -14px;border-radius:50%;border:3px solid #ffd21f;box-shadow:0 0 0 2px rgba(20,29,58,.55),0 0 12px rgba(255,210,31,.6);will-change:transform;pointer-events:none}
.cs-cur::after{content:"";position:absolute;left:50%;top:50%;width:6px;height:6px;margin:-3px 0 0 -3px;border-radius:50%;background:#ffd21f}
.cs-hint{flex:none;min-height:2em;padding:.25em 1.3em .6em;font-size:.8em;color:#5a7299;text-align:center;line-height:1.3}
.cs-pops{position:absolute;inset:0;pointer-events:none}
.cs .cs-pop.jv{position:absolute;left:0;top:0;width:17em;transition:left .22s ease-out,top .22s ease-out;max-width:90%;font-size:.95em;pointer-events:auto;background:rgba(251,253,255,.98);box-shadow:0 0 0 1px rgba(191,230,255,.8),0 0 22px var(--ssglow),0 10px 26px rgba(18,40,90,.32)}
.cs .cs-pop .jv-bar{height:1.9em}
.cs .cs-pop .jv-body{padding:.2em 1.1em .5em}
.cs .cs-pop .jv-msg{font-size:1.02em;line-height:1.3}
.cs .cs-pop .jv-btns{padding:.1em 1em 1em}
.cs .cs-pop .jv-b{min-width:6em;font-size:.9em;padding:.4em 1.3em}
.cs .cs-pop .jv-b.foc{outline:3px solid #ffd21f;outline-offset:2px}
.cs-num{position:absolute;left:-.55em;top:-.55em;width:1.75em;height:1.75em;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:.85em;background:#c9d6e8;color:#46638f;box-shadow:0 2px 6px rgba(0,0,0,.22)}
.cs-pop.first .cs-num{background:#ffd21f;color:#141d3a}
.cs-done{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:.45em;border-radius:16px;text-align:center;background:radial-gradient(circle at 50% 42%,rgba(255,255,255,.98),rgba(220,238,252,.98));opacity:0;transition:opacity .35s;pointer-events:none}
.cs-done.on{opacity:1}
.cs-done i{width:3.6em;height:3.6em;border-radius:50%;background:radial-gradient(circle at 35% 35%,#fff 0 12%,#8ee0b0 45%,#3bb26f);box-shadow:0 0 22px rgba(59,178,111,.55);display:flex;align-items:center;justify-content:center;font:800 1.7em var(--sys);font-style:normal;color:#fff}
.cs-done.on i{animation:cstk .5s cubic-bezier(.3,1.6,.5,1)}
.cs-done b{font-size:1.5em;font-weight:300;letter-spacing:.06em;color:#14305e}
.cs-done>span{font-size:.95em;color:#46638f;font-variant-numeric:tabular-nums}
.cs-done span b{font:700 1.2em var(--mono);letter-spacing:.02em;color:#2f86e0}
.cs-done small{font-size:.8em;color:#8aa0c0}
.cs-tab{position:absolute;left:50%;top:14px;width:min(92vw,620px);padding:.6em 1.1em .7em;border-radius:16px;text-align:center;font-size:15px;color:#1c2a44;pointer-events:none;
 background:rgba(250,253,255,.9);box-shadow:0 0 0 1px rgba(255,255,255,.95),0 0 22px rgba(120,190,255,.55),0 10px 24px rgba(8,24,60,.35);transform:translate(-50%,-140%);opacity:0;transition:transform .45s cubic-bezier(.3,.9,.25,1),opacity .3s}
.cs-tab.on{transform:translate(-50%,0);opacity:1}
.cs-tab small{display:block;font-size:.72em;font-weight:700;letter-spacing:.16em;color:#2f86e0;text-transform:uppercase;margin-bottom:.15em}
.cs-tab b{display:block;font-size:1em;line-height:1.3}
.cs-tab span{display:block;margin-top:.25em;font-size:.86em;color:#46638f}
.cs-tab span.ok{color:#15803d;font-weight:700;letter-spacing:.06em}
.cs.nar .cs-lab{width:100%}
.cs.nar .cs-row{flex-wrap:wrap;row-gap:.3em;gap:.5em}
.cs.nar .cs-st span{display:none}
.cs.nar .cs-st.on span{display:inline}
.cs.nar .cs-st{padding-right:.3em}
.cs.nar .cs-st.on{padding-right:.8em}
.cs.nar .cs-tm small,.cs.nar .cs-clk{display:none}
.cs.nar .cs-pane{gap:.6em;padding:.7em .9em}
.cs.nar .cs-cust{display:none}
.cs.short .cs-steps{padding-bottom:.4em}
.cs.short .cs-hint{min-height:1.4em;padding-bottom:.4em}
.cs.short .cs-pane{gap:.45em;padding:.5em .9em}
.jv.ss.cs-th{width:auto;max-width:15em;padding:.45em 1.05em .55em;border-radius:22px;pointer-events:none!important;background:rgba(250,253,255,.9);animation:csth 3.2s ease-out forwards}
.jv.ss.cs-th .jv-bar,.jv.ss.cs-th .jv-btns,.jv.ss.cs-th .jv-note{display:none}
.jv.ss.cs-th .jv-body{padding:0}
.jv.ss.cs-th .jv-msg{font-size:15px;font-style:italic;font-weight:500;color:#22466e;white-space:nowrap}
.jv.ss.cs-th::before,.jv.ss.cs-th::after{content:"";position:absolute;border-radius:50%;background:rgba(250,253,255,.9);box-shadow:0 0 8px var(--ssglow)}
.jv.ss.cs-th::before{left:22%;bottom:-11px;width:12px;height:12px}
.jv.ss.cs-th::after{left:16%;bottom:-21px;width:7px;height:7px}
@keyframes csth{0%{opacity:0;transform:translateY(12px) scale(.85)}12%{opacity:1;transform:translateY(0) scale(1)}80%{opacity:1;transform:translateY(-18px)}100%{opacity:0;transform:translateY(-26px)}}`;

  // ---------------------------------------------------------- DOM, built once
  let F = null;
  const h = (tag, cls, parent, text) => {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    if (parent) parent.appendChild(e);
    return e;
  };
  const pill = (parent, text, cls) => { const b = h('button', 'cs-b' + (cls ? ' ' + cls : ''), parent, text); b.type = 'button'; b.tabIndex = -1; return b; };
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
    if (!document.getElementById('cs-css')) { const st = h('style', null, document.head, CSS); st.id = 'cs-css'; }
    const root = h('div', 'cs');
    root.addEventListener('mousedown', (e) => e.preventDefault());   // Enter/Space stay the engine's YES
    const term = h('div', 'cs-term', root); term.dataset.noyes = '';
    const bar = h('div', 'cs-bar', term);
    h('span', 'cs-logo', bar, 'SafeSense');
    h('span', 'cs-ttl', bar, 'Retail · Chip swap');
    const tm = h('span', 'cs-tm', bar); h('small', null, tm, 'This swap'); const tmB = h('b', null, tm, '00:00'); const avg = h('small', null, tm, '');
    const clk = h('span', 'cs-clk', bar, '12:20');
    const steps = h('div', 'cs-steps', term), st = [], ln = [];
    for (let i = 0; i < 4; i++) {
      if (i) ln.push(h('i', 'cs-ln', steps));
      const s = h('div', 'cs-st', steps); h('b', null, s, NUMS[i]); h('span', null, s, STEPS[i]); st.push(s);
    }
    const body = h('div', 'cs-body', term);
    const pane = [];
    // 1 Customer
    const p0 = h('div', 'cs-pane', body); pane.push(p0);
    const cust = h('div', 'cs-cust', p0); h('i', 'cs-av', cust);
    const cn = h('div', 'cs-cn', cust); const cnB = h('b', null, cn, 'WALK-IN'); const cnS = h('span', null, cn, 'Chip 7 · ');
    h('em', null, cnS, '3%'); cnS.appendChild(document.createTextNode(' · Wants a swap. Has a slab at one.'));
    const r0 = h('div', 'cs-row', p0);
    const l0 = h('div', 'cs-lab', r0, 'Customer name'); h('small', null, l0, 'He said JAYDEN');
    const name = h('div', 'cs-f', r0);
    const nameT = document.createTextNode(''); name.appendChild(nameT); const caret = h('u', 'off', name); const ghost = h('i', null, name);
    const tk0 = h('span', 'cs-tk', r0, '✓');
    const search = pill(r0, 'Search');
    const sr = h('div', 'cs-sr off', p0);
    const arL = h('button', 'cs-ar', sr, '◀'); arL.type = 'button'; arL.tabIndex = -1;
    const strip = h('div', 'cs-strip', sr); strip.dataset.noyes = '';
    const trk = h('div', 'cs-trk', strip), cells = [];
    for (let i = 0; i < 78; i++) { const c = h('i', null, trk, ABC[i % 26]); cells.push(c); }
    h('div', 'cs-lens', strip);
    const arR = h('button', 'cs-ar', sr, '▶'); arR.type = 'button'; arR.tabIndex = -1;
    const note0 = h('div', 'cs-note', p0);
    // 2 Verify
    const p1 = h('div', 'cs-pane off', body); pane.push(p1);
    const r1 = h('div', 'cs-row', p1);
    const l1 = h('div', 'cs-lab', r1, 'MFA code'); h('small', null, l1, 'Customer verification');
    const mfa = h('div', 'cs-f msg', r1, 'Not sent'); const tk1 = h('span', 'cs-tk', r1, '✓'); const send = pill(r1, 'Send code');
    const brain = h('div', 'cs-brain off', p1);
    const bat = h('div', 'cs-bat', brain), batI = h('i', null, bat);
    const bt = h('div', 'cs-bt', brain); const btB = h('b', null, bt, MFA_MSG); const btS = h('span', null, bt, CHARGES);
    h('i', 'cs-ring', brain);
    const r2 = h('div', 'cs-row', p1);
    const l2 = h('div', 'cs-lab', r2, 'Consent'); h('small', null, l2, CONSENT);
    const cons = h('div', 'cs-f msg', r2, 'Waiting for MFA'); const tk2 = h('span', 'cs-tk', r2, '✓'); const listen = pill(r2, 'Listen');
    const tut = h('div', 'cs-tut off', p1);
    h('b', null, tut, TUT);
    const keys = h('div', 'cs-keys', tut), k1 = h('span', 'cs-k', keys, 'Tab'); h('span', null, keys, 'then hold'); const k2 = h('span', 'cs-k', keys, 'Q');
    // 3 Swap
    const p2 = h('div', 'cs-pane off', body); pane.push(p2);
    const hh2 = h('div', 'cs-h', p2, 'Swapping chip…'); h('small', null, hh2, 'Do not remove the customer during the swap.');
    const big = h('div', 'cs-big', p2), bigI = h('i', null, big);
    const bp = h('div', 'cs-bp', p2); const bpL = h('span', null, bp, 'Old chip 3%  →  New chip 3%'); const bpB = h('b', null, bp, '0%');
    const note2 = h('div', 'cs-note', p2, 'Cancel swap?');
    const bb = h('div', 'cs-btns', p2); const bYes = pill(bb, 'YES'), bNo = pill(bb, 'NO', 'ghost');
    // 4 Opt in
    const p3 = h('div', 'cs-pane off', body); pane.push(p3);
    const hh3 = h('div', 'cs-h', p3, 'Opt in'); const hh3s = h('small', null, hh3, 'Customer opts in to his new chip.');
    const run_ = h('div', 'cs-run', p3); run_.dataset.noyes = '';
    const slot = h('div', 'cs-slot', run_), ok = h('div', 'cs-ok', run_, 'OK'), cur = h('div', 'cs-cur off', run_);
    const sure = h('div', 'cs-btns off', p3); const sureB = pill(sure, 'YES');
    const note3 = h('div', 'cs-note', p3);
    // pop-ups (inside the body, over the field you need) and the done card
    const pops = h('div', 'cs-pops', body), pool = [];
    for (let k = 0; k < 4; k++) {
      const el = h('div', 'jv ss cs-pop off', pops); el.dataset.noyes = '';
      const pb = h('div', 'jv-bar', el); h('span', 'jv-logo', pb, 'SafeSense'); h('span', 'jv-t', pb);
      const bd = h('div', 'jv-body', el), msg = h('div', 'jv-msg', bd);
      const bs = h('div', 'jv-btns', el), btn = h('button', 'jv-b', bs); btn.type = 'button'; btn.tabIndex = -1;
      const num = h('span', 'cs-num', el, '1');
      const p = { k, el, msg, btn, num, open: false, bx: 0, by: 0, w: 0, h: 0, slot: -1 };
      btn.addEventListener('click', () => { if (F.live && p.open) F.popClick = p; });
      pool.push(p);
    }
    const done = h('div', 'cs-done', body); h('i', null, done, '✓'); h('b', null, done, 'Chip swapped.');
    const doneS = h('span', null, done); h('span', null, doneS, 'This swap '); const doneT = h('b', null, doneS, '00:00');
    const doneA = h('small', null, done, '');
    const hint = h('div', 'cs-hint', term);
    // the Chip View banner (the terminal slides away while Chase (2040) looks at Jayden)
    const tab = h('div', 'cs-tab', root); h('small', null, tab, CONSENT); const tabB = h('b', null, tab, TUT); const tabS = h('span', null, tab, '');

    F = { root, term, tmB, avg, clk, st, ln, body, pane, cnB, name, nameT, caret, ghost, tk0, search, sr, arL, arR, strip, trk, cells, note0,
      mfa, tk1, send, brain, batI, btB, btS, cons, tk2, listen, tut, k1, k2, big, bigI, bpL, bpB, note2, bYes, bNo, hh3s, run: run_, slot, ok, cur,
      sure, sureB, note3, pool, done, doneT, doneA, hint, tab, tabB, tabS,
      moveTrk: mover(trk), moveOk: mover(ok), moveCur: mover(cur),
      live: false, act: '', popClick: null, tapX: -1, wheel: 0, dragId: -1, dragX0: 0, dragPos0: 0, dragMoved: false, dragPos: NaN, dragEnd: false };
    // buttons record what was pressed; update() acts on it (one place for every input path)
    search.addEventListener('click', () => { if (F.live) F.act = 'search'; });
    send.addEventListener('click', () => { if (F.live) F.act = 'send'; });
    listen.addEventListener('click', () => { if (F.live) F.act = 'listen'; });
    bYes.addEventListener('click', () => { if (F.live) F.act = 'cancel'; });
    bNo.addEventListener('click', () => { if (F.live) F.act = 'push'; });
    bYes.addEventListener('pointerenter', () => { if (F.live) F.act = F.act || 'focus0'; });
    bNo.addEventListener('pointerenter', () => { if (F.live) F.act = F.act || 'focus1'; });
    sureB.addEventListener('click', () => { if (F.live) F.act = 'sure'; });
    arL.addEventListener('click', () => { if (F.live) F.act = 'left'; });
    arR.addEventListener('click', () => { if (F.live) F.act = 'right'; });
    // the strip: tap a letter to pick it, drag to scroll, the wheel steps
    strip.addEventListener('pointerdown', (e) => {
      if (!F.live) return;
      F.dragId = e.pointerId; F.dragX0 = e.clientX; F.dragPos0 = posU; F.dragMoved = false;
      try { strip.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ }
    });
    strip.addEventListener('pointermove', (e) => {
      if (!F.live || e.pointerId !== F.dragId) return;
      const dx = e.clientX - F.dragX0;
      if (!F.dragMoved && Math.abs(dx) > 7) F.dragMoved = true;
      if (F.dragMoved) F.dragPos = F.dragPos0 - dx / cw;
    });
    const up = (e) => {
      if (!F.live || e.pointerId !== F.dragId) return;
      F.dragId = -1;
      if (F.dragMoved) F.dragEnd = true; else F.tapX = e.clientX;
    };
    strip.addEventListener('pointerup', up);
    strip.addEventListener('pointercancel', up);
    strip.addEventListener('wheel', (e) => { if (!F.live) return; e.preventDefault(); F.wheel += e.deltaY > 0 || e.deltaX > 0 ? 1 : -1; }, { passive: false });
  }

  // ---------------------------------------------------------- session state (the host has one slot: one sale at a time)
  let api = null, P = null, run = 0, phase = 'end', auto = false, fast = false, story = false;
  let step = 0, sub = '', subT = 0, t = 0, pt = 0, W = 0, H = 0, sch = '', nar = false, short = false;
  let who = 'chase', other = 'chase40', cust = 'jayden', act0 = 'chase', shotT = null, shotT2 = null, shotC = null, shotPort = false;
  let nOpen = 0, bodyW = 1, bodyH = 1, blocked = false, jade2 = false, popT = 0, popI = 0, slips = 0, pops = 0, noteT = 0, noteEl = null;
  const fifo = [];
  let seed = 7;
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  // strip
  let cw = 44, selU = 0, posU = 0, typed = 0, holdDir = 0, holdT = 0, stripL = 0, stripW = 1, drSel = -1, drPos = NaN, badT = 0, correctT = 0;
  // swap bar
  let prog = 0, foc = 0, drP = -1, drBack = false, back = false;
  // runaway
  let okHW = 50, okHH = 18, ox = 0, oy = 0, cx = 0, cy = 0, minX = 0, maxX = 0, minY = 0, maxY = 0, stL = 0, stT = 0, stW = 1, stH = 1;
  let dodges = 0, tired = false, cornered = false, mouse = false, lpx = -1, lpy = -1, curOn = false, runT = 0, runOn = false;
  let drOx = -1e5, drOy = -1e5, drCx = -1e5, drCy = -1e5, drCur = false, drTrap = false, drHot = false;
  // tutorial
  let tutStage = 0, tabOn = false, chipT = 0, heard = false, chipOn = false, promptOn = false, swapOn = false, chipable = false, linesBusy = false;
  // thoughts, the timer, the customer
  let thT = 0, thLast = '', thHandle = null, ate = false, eatT = 0, shownSec = -1, drBat = -1, measure = false;
  let doneDur = 2.4;
  const V = { v: null }, POS = [0, 0, 0];
  // autoplay
  let apT = 0;
  const AP = { yes: false, no: false, left: false, right: false, swap: false, chip: false };

  const sfx = (n, o) => { if (api && api.sfx) api.sfx(n, o); };
  const log = (m) => { if (typeof testLog === 'function') testLog('chip_sale ' + m); };
  const actor = (id) => (api && api.world && api.world.actor ? api.world.actor(id) : null);
  const sk = () => typeof flow !== 'undefined' && flow.skipping === true;

  // ---------------------------------------------------------- layout (on resize / scheme change)
  function layout() {
    const touch = sch === 'touch', port = H > W * 1.05;
    nar = port || W < 780;
    let x, y, w, hh;
    if (port) {
      x = 10; w = W - 20;
      const bot = touch ? 292 : 74;
      y = Math.round(Math.max(52, H * 0.3)); hh = H - y - bot;
      if (hh < 340) { y = Math.max(44, H - bot - 340); hh = H - y - bot; }
    } else if (touch) {
      x = Math.round(Math.min(192, W * 0.22)); const r = Math.round(Math.min(232, W * 0.27));
      w = W - x - r; y = 8; hh = H - 16;
    } else {
      w = Math.round(Math.min(W * 0.6, 860)); hh = Math.round(Math.min(H * 0.8, 600));
      x = Math.round(Math.max(16, W * 0.045)); y = Math.round(Math.max(8, H * 0.465 - hh / 2));
    }
    short = hh < 420;
    const fs = Math.max(nar && port ? 13 : 12, Math.min(17, Math.min(w / 44, hh / 31)));
    const s = F.term.style;
    s.left = x + 'px'; s.top = y + 'px'; s.width = w + 'px'; s.height = hh + 'px'; s.fontSize = fs.toFixed(1) + 'px';
    F.tab.style.fontSize = Math.max(13, Math.min(16, W / 52)).toFixed(1) + 'px';
    cw = Math.round(fs * (nar ? 2.4 : 2.7));
    F.root.style.setProperty('--cw', cw + 'px');
    F.root.classList.toggle('nar', nar); F.root.classList.toggle('short', short);
    termX = x; termY = y; termW = w; termH = hh;
    measure = true;
    setHint();
  }
  let termX = 0, termY = 0, termW = 0, termH = 0;
  function measureNow() {   // rects the pointer maths needs (the strip's centre, the OK's stage), read once per change
    measure = false;
    if (sub === 'strip') { const r = F.strip.getBoundingClientRect(); stripL = r.left; stripW = Math.max(1, r.width); drPos = NaN; }
    if (step === 3 && runOn) {
      const r = F.run.getBoundingClientRect();
      stL = r.left; stT = r.top; stW = Math.max(120, r.width); stH = Math.max(60, r.height);
      okHW = F.ok.offsetWidth / 2 || 50; okHH = F.ok.offsetHeight / 2 || 18;
      minX = okHW + 4; maxX = stW - okHW - 4; minY = okHH + 4; maxY = stH - okHH - 4;
      if (maxX < minX) maxX = minX; if (maxY < minY) maxY = minY;
      ox = ox < minX ? minX : ox > maxX ? maxX : ox; oy = oy < minY ? minY : oy > maxY ? maxY : oy;
      drOx = drOy = -1e5;
    }
  }
  function setHint() {
    if (!F) return;
    const s = api ? api.input.scheme : 'kb', kb = s === 'kb', pad = s === 'pad';
    let t = '';
    if (nOpen > 0) t = kb ? 'Notifications first, oldest first: YES (Enter) or click its button.' : pad ? 'Notifications first, oldest first: A.' : 'Notifications first, oldest first: tap its button (or YES).';
    else if (sub === 'search') t = kb ? 'YES (Enter) — Search' : pad ? 'A — Search' : 'Tap Search (or YES)';
    else if (sub === 'strip') t = kb ? '← → pick a letter · YES add it · NO delete · or click a letter' : pad ? 'Stick ← → pick a letter · A add it · B delete' : 'Drag the strip, tap a letter · NO deletes';
    else if (sub === 'mfa') t = kb ? 'YES (Enter) — Send code' : pad ? 'A — Send code' : 'Tap Send code (or YES)';
    else if (sub === 'brain') t = 'Customer charging…';
    else if (sub === 'consent') t = kb ? 'YES (Enter) — Listen' : pad ? 'A — Listen' : 'Tap Listen (or YES)';
    else if (sub === 'tut') t = kb ? 'Tab — SWAP · hold Q — CHIP' : pad ? 'Y — SWAP · hold LB — CHIP' : 'SWAP button · hold the CHIP button';
    else if (sub === 'bar') t = kb ? 'NO (Esc) pushes it forwards. Tap it or hold it.' : pad ? 'B pushes it forwards. Tap it or hold it.' : 'NO pushes it forwards. Tap it or hold it.';
    else if (sub === 'optin') t = kb ? 'Chase it into a corner with the mouse (or the arrows), then click it (or YES).' : pad ? 'Stick — chase it into a corner · A — press OK' : 'Chase it into a corner with your finger, then tap it.';
    else if (sub === 'sure') t = kb ? 'YES (Enter)' : pad ? 'A — YES' : 'YES';
    F.hint.textContent = t;
    // the tutorial's keys, by scheme
    F.k1.textContent = kb ? 'Tab' : pad ? 'Y' : 'SWAP';
    F.k2.textContent = kb ? 'Q' : pad ? 'LB' : 'CHIP';
  }
  // the prompt pill, by scheme (short on touch: it shares the bottom of a phone with the swap portraits)
  const chipPrompt = () => {
    const s = api.input.scheme, verb = options.holdToPress ? 'press' : 'hold';
    return s === 'touch' ? 'CHIP — ' + verb : 'CHIP — ' + verb + (s === 'pad' ? ' LB' : ' Q');
  };
  const swapPrompt = (back) => {
    const s = api.input.scheme;
    if (s === 'touch') return back ? 'SWAP — back to Chase' : 'SWAP — Chase (2040)';
    return 'SWAP — ' + (s === 'pad' ? 'Y' : 'Tab') + (back ? ' · back to Chase' : ' · Chase (2040)');
  };
  function prompt(text) {   // (a phone in portrait: the pill would sit on the swap portraits; the banner / card say it)
    if (!api || typeof ui === 'undefined' || !ui.prompt) return;
    if (text && sch === 'touch' && W < 560) text = null;
    ui.prompt(text); promptOn = !!text;
  }
  function note(el, text, warn, dur) {
    if (noteEl && noteEl !== el) { noteEl.textContent = ''; noteEl.classList.remove('warn'); }
    noteEl = el; el.textContent = text; el.classList.toggle('warn', !!warn); noteT = dur || 0;
  }

  // ---------------------------------------------------------- shots
  // a CAM step from `pos` that puts world point (hx, hy, hz) at screen fraction (fx, fy), with a slow push of `push`
  // metres over `dur` seconds. The engine keeps the 16:9 horizontal field on narrow screens (world.fitNarrow), so the
  // horizontal maths is 16:9's and the vertical uses the widened field of this aspect.
  function compose(pos, hx, hy, hz, fx, fy, fov, push, dur, aspect) {
    const vx = hx - pos[0], vy = hy - pos[1], vz = hz - pos[2], hd = Math.hypot(vx, vz) || 1;
    const ty = Math.tan(fov * Math.PI / 360), tx = ty * 16 / 9, tv = aspect < 16 / 9 ? Math.min(tx / aspect, 2.7) : ty;
    const yaw = Math.atan2(vx, vz) + Math.atan((2 * fx - 1) * tx), pitch = Math.atan2(vy, hd) - Math.atan((1 - 2 * fy) * tv);
    const cp = Math.cos(pitch), dx = Math.sin(yaw) * cp, dy = Math.sin(pitch), dz = Math.cos(yaw) * cp;
    const look = [pos[0] + dx * 3, pos[1] + dy * 3, pos[2] + dz * 3];
    const s = { shot: 'CAM', pos, look, fov };
    if (push) { s.to = { pos: [pos[0] + dx * push, pos[1] + dy * push, pos[2] + dz * push], look: [look[0] + dx * push, look[1] + dy * push, look[2] + dz * push], fov }; s.dur = dur; }
    return s;
  }
  function defaultShots() {
    const c = actor(who), j = actor(cust), o = actor(other), A = innerWidth / Math.max(1, innerHeight);
    shotPort = A < 1 / 1.05;
    shotT = P.shot || null; shotC = P.c40Shot || null;
    const jh = j ? j.pos.y + ((j.rig && j.rig.height) || 1.8) - 0.12 : 0;
    if (!shotT && c && j) {   // over Chase's right shoulder: the terminal (the window) on the left, Jayden on the right
      let dx = j.pos.x - c.pos.x, dz = j.pos.z - c.pos.z; const L = Math.hypot(dx, dz) || 1; dx /= L; dz /= L;
      const sx = -dz, sz = dx;   // Chase's right, looking at the customer
      const pos = [c.pos.x - dx * 0.9 + sx * 0.55, c.pos.y + 1.84, c.pos.z - dz * 0.9 + sz * 0.55];
      shotT = shotPort ? compose(pos, j.pos.x, jh, j.pos.z, 0.56, 0.15, 44, 0.2, 40, A)   // a phone: Jayden above the terminal
        : compose(pos, j.pos.x, jh, j.pos.z, 0.8, 0.34, 48, 0.22, 40, A);
    }
    if (shotT) {   // the same lens without the slow push (back from the Chip View)
      shotT2 = shotT.shot === 'CAM' && shotT.to ? { shot: 'CAM', pos: shotT.to.pos || shotT.pos, look: shotT.to.look || shotT.look, fov: shotT.to.fov ?? shotT.fov } : shotT;
    }
    if (!shotC && j && o) {   // over Chase (2040)'s left shoulder onto Jayden, room above him for the AR (a phone: his eyes)
      let dx = j.pos.x - o.pos.x, dz = j.pos.z - o.pos.z; const L = Math.hypot(dx, dz) || 1; dx /= L; dz /= L;
      const sx = -dz, sz = dx;
      if (shotPort) {
        const k = Math.min(1.1, L * 0.45), pos = [o.pos.x + dx * k, o.pos.y + 1.76, o.pos.z + dz * k];
        shotC = compose(pos, j.pos.x, jh, j.pos.z, 0.5, 0.44, 44, 0.2, 10, A);
      } else {
        const pos = [o.pos.x - dx * 1.15 - sx * 0.72, o.pos.y + 1.86, o.pos.z - dz * 1.15 - sz * 0.72];
        shotC = compose(pos, j.pos.x, jh, j.pos.z, 0.42, innerHeight < 520 ? 0.47 : 0.56, 44, 0.3, 10, A);   // (a short screen: above the dialogue box)
      }
    }
  }
  function shoot(s) { if (s && api.cam && api.cam.shot) api.cam.shot(s); }

  // ---------------------------------------------------------- steps
  function setStep(k) {
    step = k;
    for (let i = 0; i < 4; i++) {
      F.st[i].classList.toggle('on', i === k); F.st[i].classList.toggle('ok', i < k);
      F.st[i].firstChild.textContent = i < k ? '✓' : NUMS[i];
      F.pane[i].classList.toggle('off', i !== k);
      if (i < 3) F.ln[i].classList.toggle('ok', i < k);
    }
    if (STEPS[k]) log(STEPS[k]);
  }
  function enter(s) {
    sub = s; subT = 0;
    if (s === 'search') {
      F.nameT.data = ''; F.ghost.textContent = 'Customer name'; F.ghost.style.letterSpacing = '0'; F.name.className = 'cs-f';
      F.search.classList.add('foc'); F.search.classList.remove('dis');
      popT = story ? 4.5 : 3.2;
    } else if (s === 'typing') {
      F.search.classList.remove('foc'); F.search.classList.add('dis'); F.ghost.textContent = ''; F.ghost.style.letterSpacing = ''; F.name.className = 'cs-f live';
    } else if (s === 'strip') {
      F.sr.classList.remove('off'); typed = 0; showTyped(); F.name.className = 'cs-f live'; F.caret.classList.remove('off');
      selU = 26; posU = 26; holdDir = 0; drSel = -1; drPos = NaN; measure = true;
      note(F.note0, 'Autocorrected for your safety.', false, 0);
      popT = 0.5; popI = -1;   // the next pop-up is the autocorrect again, landing on the strip
    } else if (s === 'ok0') {
      F.sr.classList.add('off'); F.caret.classList.add('off'); F.name.className = 'cs-f good'; F.tk0.classList.add('on'); F.cnB.textContent = WORD;
      note(F.note0, '', false, 0); sfx('chip_chime', SO.soft); typing('nod');
    } else if (s === 'mfa') {
      setStep(1); F.send.classList.add('foc'); F.send.classList.remove('dis');
      F.listen.classList.add('dis'); F.listen.classList.remove('foc');
      popT = story ? 6 : 4.2; thT = Math.min(thT, 0.8); thNext = TH_HUNGRY;
    } else if (s === 'brain') {
      F.send.classList.remove('foc'); F.send.classList.add('dis');
      F.mfa.textContent = 'Code sent.'; F.brain.classList.remove('off', 'ok'); F.btB.textContent = MFA_MSG; F.btS.textContent = CHARGES;
      drBat = -1; eatT = fast ? 1.0 : 3.0;
      const j = actor(cust);
      if (j && !ate) { ate = true; j.play('eat', { dur: eatT + 0.4, loop: false }); }
      sfx('ss_chirp', SO.chirp);
    } else if (s === 'code') {
      F.brain.classList.add('ok'); F.btB.textContent = 'Code received. Customer verified.'; F.btS.textContent = "Customer's brain is on 4%.";
      F.mfa.textContent = '7 7 3 1 · verified'; F.mfa.classList.remove('msg'); F.mfa.style.fontSize = '1em';
      F.tk1.classList.add('on'); sfx('chip_chime', SO.soft);
    } else if (s === 'consent') {
      F.cons.textContent = 'Customer must say the ' + CONSENT + '.'; F.listen.classList.remove('dis'); F.listen.classList.add('foc');
      popT = Math.max(popT, story ? 5 : 3.5);
    } else if (s === 'tut') {
      F.listen.classList.remove('foc'); F.listen.classList.add('dis'); F.brain.classList.add('off');
      F.cons.textContent = 'Phrase shown in AR only.'; F.cons.className = 'cs-f msg bad';
      F.tut.classList.remove('off');
      tutStage = 0; heard = false; chipT = 0;
      if (!api.state.flags) api.state.flags = {};
      api.state.flags.s15_chipview = true;
      prompt(swapPrompt(false)); swapUI(true);
      sfx('ss_chirp', SO.chirp);
      log('tutorial');
    } else if (s === 'cok') {
      F.tut.classList.add('off'); F.cons.className = 'cs-f good'; F.cons.textContent = PHRASE; F.tk2.classList.add('on'); arClear();
      sfx('chip_chime', SO.soft);
    } else if (s === 'bar') {
      setStep(2); prog = 22; back = false; drP = -1; drBack = false; foc = 0; setFoc(0);
      note(F.note2, 'Cancel swap?', false, 0);
      popT = story ? 2.6 : 1.4;
    } else if (s === 'ok2') {
      F.bpL.textContent = 'Old chip 3%  →  New chip 3%  ✓'; note(F.note2, 'Swap complete. Nothing was lost. Probably.', false, 0);
      F.bYes.classList.add('dis'); F.bNo.classList.add('dis'); F.bYes.classList.remove('foc'); F.bNo.classList.remove('foc');
      sfx('chip_chime', SO.soft);
      const j = actor(cust); if (j && j.rig && typeof j.rig.chip === 'function') j.rig.chip('ping');
    } else if (s === 'optin') {
      setStep(3); F.hh3s.textContent = 'Customer opts in to his new chip.';
      F.run.classList.remove('off'); F.sure.classList.add('off'); F.ok.classList.remove('off', 'trap', 'tired', 'hot'); F.cur.classList.add('off');
      runOn = true; dodges = 0; tired = false; cornered = false; runT = 0; curOn = false; drCur = false; drTrap = drHot = false;
      ox = 0; oy = 0; measure = true; measureNow(); ox = stW / 2; oy = stH / 2; cx = stW / 2; cy = stH - 10; mouse = api.input.scheme === 'touch';
      lpx = api.input.pointer.x; lpy = api.input.pointer.y;
      note(F.note3, 'Select OK to continue.', false, 0);
      popT = story ? 9 : 6.5;
    } else if (s === 'sure') {
      runOn = false; F.run.classList.add('off'); F.sure.classList.remove('off'); F.sureB.classList.add('foc');
      F.hh3s.textContent = "Are you sure you're sure?"; note(F.note3, 'Thank you for your patience.', false, 0);
      sfx('ss_chirp', SO.chirp);
    } else if (s === 'ok3') {
      F.sureB.classList.remove('foc'); F.sureB.classList.add('dis');
    }
    setHint();
  }
  function showTyped() {
    F.nameT.data = PREF[typed]; F.ghost.textContent = REST[typed];
  }
  function typing(react) {   // Chase works the terminal; the customer reacts now and then
    const c = actor(who); if (c && c.anim !== 'type') c.play('type');
    if (react) { const j = actor(cust); if (j && j.anim === 'idle') j.play(react, { dur: 0.9, loop: false }); }
  }
  function setFoc(k) { foc = k; F.bYes.classList.toggle('foc', k === 0); F.bNo.classList.toggle('foc', k === 1); }
  function finishGame() {
    phase = 'done'; pt = 0; setStep(4);
    const sec = Math.min(3599, Math.floor(t));
    F.doneT.textContent = TIMES[sec];
    F.doneA.textContent = 'Store average ' + TIMES[Math.min(3599, P.avg || AVG)] + ' · Customer satisfaction: hungry';
    F.done.classList.add('on'); F.hint.textContent = '';
    for (let i = 0; i < 4; i++) { F.st[i].classList.add('ok'); F.st[i].classList.remove('on'); if (i < 3) F.ln[i].classList.add('ok'); }
    sfx('chime_ready'); sfx('chip_chime', SO.soft);
    thought(TH_GOOD, true);
    const f = api.state.flags || (api.state.flags = {});
    f.s15_sold = true;
    log('done ' + t.toFixed(1));
  }

  // ---------------------------------------------------------- SafeSense pop-ups: they land on the field you need; oldest first
  function target() {
    if (sub === 'search' || sub === 'typing') return F.search;
    if (sub === 'strip') return F.strip;
    if (sub === 'mfa') return F.send;
    if (sub === 'consent') return F.listen;
    if (sub === 'bar') return F.big;
    if (sub === 'optin') return F.run;
    return F.body;
  }
  const popsAllowed = () => phase === 'form' && (sub === 'search' || sub === 'strip' || sub === 'mfa' || sub === 'consent' || sub === 'bar' || sub === 'optin');
  function spawnPop(def) {
    if (nOpen >= 3) return false;
    let p = null;
    for (let i = 0; i < F.pool.length; i++) if (!F.pool[i].open) { p = F.pool[i]; break; }
    if (!p) return false;
    p.open = true; fifo.push(p); nOpen++;
    p.msg.textContent = def[0]; p.btn.textContent = def[1];
    p.el.classList.remove('off', 'shake');
    // it lands on the field you need (read once, here); older ones stay stacked below it with their buttons showing
    const tr = target().getBoundingClientRect(), br = F.body.getBoundingClientRect();
    bodyW = br.width; bodyH = br.height;
    p.w = p.el.offsetWidth; p.h = p.el.offsetHeight;
    p.bx = tr.left + tr.width / 2 - br.left - p.w / 2; p.by = tr.top + tr.height / 2 - br.top - p.h * 0.55;
    const i = fifo.length - 1;   // its own spot at once (no slide from wherever this pooled window was last)
    p.slot = i; p.el.style.transition = 'none';
    p.el.style.left = Math.round(Math.max(6, Math.min(bodyW - p.w - 6, p.bx + i * 20))) + 'px';
    p.el.style.top = Math.round(Math.max(6, Math.min(bodyH - p.h - 6, p.by - i * 58))) + 'px';
    void p.el.offsetWidth; p.el.style.transition = '';
    p.el.style.zIndex = String(10 + pops + nOpen);
    restack();
    renumber(); setHint(); F.term.classList.add('popping');
    sfx('ss_chirp', SO.chirp);
    return true;
  }
  function restack() {   // oldest at the bottom, each newer one 58 px higher and 20 px right (positions by left/top: the
    for (let i = 0; i < fifo.length; i++) {   // engine's pop and shake animations own `transform`)
      const p = fifo[i];
      if (p.slot === i) continue;
      p.slot = i;
      const x = Math.max(6, Math.min(bodyW - p.w - 6, p.bx + i * 20)), y = Math.max(6, Math.min(bodyH - p.h - 6, p.by - i * 58));
      p.el.style.left = Math.round(x) + 'px'; p.el.style.top = Math.round(y) + 'px';
    }
  }
  function renumber() {
    for (let i = 0; i < fifo.length; i++) {
      const p = fifo[i];
      p.num.textContent = NUMS[i]; p.el.classList.toggle('first', i === 0); p.btn.classList.toggle('foc', i === 0);
    }
  }
  function dismiss() {
    const p = fifo.shift(); if (!p) return;
    p.open = false; p.el.classList.add('off'); p.btn.classList.remove('foc'); nOpen--; pops++;
    restack(); renumber(); setHint();
    if (!nOpen) F.term.classList.remove('popping');
    sfx('pop', SO.soft); typing(null);
  }
  function slip(p) {
    slips++;
    p.el.classList.remove('shake'); void p.el.offsetWidth; p.el.classList.add('shake');
    sfx('sad_beep', SO.low);
    const n = step === 0 ? F.note0 : step === 2 ? F.note2 : step === 3 ? F.note3 : null;
    if (n) note(n, 'Please dismiss notifications in the order they arrived.', true, 2.4);
  }
  function clearPops() { while (fifo.length) { const p = fifo.shift(); p.open = false; p.el.classList.add('off'); } nOpen = 0; F.term.classList.remove('popping'); }
  function nextPopDef() {
    if (popI === -1) { popI = 0; return POP_JADE; }
    let i = Math.floor(rnd() * POPS.length);
    if (i === popI) i = (i + 1) % POPS.length;
    popI = i;
    return POPS[i];
  }

  // ---------------------------------------------------------- Jayden's THOUGHTs (the soft timer)
  let thNext = '';
  function thought(text, force) {
    if (!api.popup || sk()) return;
    if (!force && text === thLast) return;
    thLast = text;
    if (thHandle) { thHandle.close(); thHandle = null; }
    const j = actor(cust);
    let at = null;
    if (j && j.root && j.root.visible && api.cam && api.cam.project) {
      const v = V.v || (V.v = new THREE.Vector3());
      j.headPos(v); v.y += 0.5;
      const s = api.cam.project(v);
      const inTerm = s.x > termX - 30 && s.x < termX + termW + 30 && s.y > termY - 30 && s.y < termY + termH + 30;
      if (s.visible && !inTerm && !F.term.classList.contains('away')) { POS[0] = v.x; POS[1] = v.y; POS[2] = v.z; at = { pos: POS }; }
    }
    if (!at) {   // over the terminal or off screen: pin it in the clear space beside / above it
      const rx = termX + termW, free = W - rx;
      at = free > 200 && !nar ? [(rx + free / 2) / W, 0.2] : [0.5, Math.max(0.06, Math.min(0.2, (termY * 0.5) / H))];
    }
    thHandle = api.popup({ style: 'safesense', msg: text, buttons: [], dur: 3.2, ding: false, cls: 'cs-th', at });
  }
  function thoughtTick(dt) {
    if (phase !== 'form' || sub === 'tut' || sub === 'cok') return;
    if ((thT -= dt) > 0) return;
    thT = (story ? 15 : 12) + rnd() * 4;
    let s = thNext;
    thNext = '';
    if (!s) { const par = PAR[Math.min(3, step)] * (story ? 1.3 : 1); s = t <= par ? TH_GOOD : TH_LONG; }
    if (s === TH_HUNGRY && ate) s = t <= PAR[step] ? TH_GOOD : TH_LONG;
    thought(s, false);
  }

  // ---------------------------------------------------------- the Chip View tutorial: SWAP, CHIP, the phrase, SWAP back
  function swapUI(on) {
    if (typeof ui === 'undefined' || !ui.swapIndicator) return;
    swapOn = !!on;
    if (on) ui.swapIndicator(api.state.active, api.state.active === other ? who : other); else ui.swapIndicator(null);
  }
  function setChipable(on) {
    if (on === chipable) return;
    chipable = on; document.body.classList.toggle('chipable', on);
  }
  function chipView(on) {
    if (on === chipOn) return;
    chipOn = on;
    if (typeof chip !== 'undefined' && chip && chip.show) chip.show(on);
    else if (typeof ui !== 'undefined' && ui.chipView) ui.chipView(on);
    if (on) log('chip view');
  }
  function swapTo(id) {
    api.state.active = id;
    log('swap ' + id);
    if (typeof emit === 'function') emit('swap', id);
    swapUI(true);
    sfx('pop', SO.soft);
    if (id === other) {
      F.term.classList.add('away'); tab(true);
      if (!heard) { F.tabB.textContent = TUT; F.tabS.textContent = ''; F.tabS.className = ''; }
      F.k1.classList.remove('now'); F.k1.classList.add('done'); F.k2.classList.add('now');
      shoot(shotC);
      const o = actor(other); if (o) o.face(cust, 0.35);
      arLabels();
      setChipable(true);
      tutStage = heard ? 3 : 1; chipT = 0;
      prompt(heard ? swapPrompt(true) : chipPrompt());
    } else {
      F.term.classList.remove('away'); tab(false);
      chipView(false); setChipable(false);
      shoot(shotT2);
      const o = actor(other); if (o) o.face(cust, 0.4);
      if (heard) { tutStage = 4; prompt(null); swapUI(false); enter('cok'); }
      else { tutStage = 0; F.k1.classList.add('now'); F.k1.classList.remove('done'); F.k2.classList.remove('now'); prompt(swapPrompt(false)); }
    }
    measure = true;
  }
  function tab(on) { tabOn = on; F.tab.classList.toggle('on', on); }
  function arLabels() {
    if (typeof AR === 'undefined' || !AR.add) return;
    const j = actor(cust), o = actor(other);
    AR.add({ id: 'cs_phrase', kind: 'popup', title: CONSENT.toUpperCase(), text: PHRASE, on: cust, oy: 0.2 });
    if (j) {   // the thought bubble beside his head, on the side towards the lens's middle (Chase (2040)'s right)
      let sx = -1, sz = 0;
      if (o) { let dx = j.pos.x - o.pos.x, dz = j.pos.z - o.pos.z; const L = Math.hypot(dx, dz) || 1; dx /= L; dz /= L; sx = -dz; sz = dx; }
      const v = V.v || (V.v = new THREE.Vector3());
      j.headPos(v);
      AR.add({ id: 'cs_thought', kind: 'thought', text: TH_LONG, at: [v.x + sx * 0.6, v.y + 0.02, v.z + sz * 0.6] });
    }
  }
  function arClear() { if (typeof AR !== 'undefined' && AR.remove) { AR.remove('cs_phrase'); AR.remove('cs_thought'); } }
  function tutTick(dt, swp, chipH) {
    if (linesBusy) return;
    if (tutStage === 0) {
      if (swp) swapTo(other);
      return;
    }
    if (tutStage === 1 || tutStage === 2) {
      if (swp) { swapTo(who); return; }
      if (chipH) {
        if (tutStage === 1) { tutStage = 2; chipView(true); prompt(null); tab(false); }
        if ((chipT += dt) >= (fast ? 0.35 : 0.9) && !heard) startLines();
      } else if (tutStage === 2) { tutStage = 1; chipT = 0; chipView(false); prompt(chipPrompt()); tab(true); }
      return;
    }
    if (tutStage === 3) {
      if (!chipH && chipOn) chipView(false);
      if (!chipOn && !tabOn) tab(true);
      if (swp) swapTo(who);
    }
  }
  function startLines() {
    heard = true; linesBusy = true;
    const id = run;
    if (typeof AR !== 'undefined' && AR.set) AR.set('cs_phrase', { title: CONSENT.toUpperCase() + '  ✓' });
    const f = api.state.flags || (api.state.flags = {});
    f.s15_consent = true;
    Promise.resolve(api.play([
      { say: other, text: C40_LINE },
      { say: cust, text: J_LINE, act: 'nod' },
    ])).catch(() => {}).then(() => {
      if (id !== run || phase === 'end') return;
      linesBusy = false; tutStage = 3;
      F.tabB.textContent = PHRASE; F.tabS.textContent = 'Consent recorded  ✓'; F.tabS.className = 'ok';
      F.k2.classList.remove('now'); F.k2.classList.add('done');
      api.input.unlatch('chip');
      prompt(swapPrompt(true));
      sfx('chip_chime', SO.soft);
    });
  }

  // ---------------------------------------------------------- the per-tick game
  function update(dt) {
    if (phase === 'end') return;
    const I = api.input, s = I.scheme;
    if (W !== innerWidth || H !== innerHeight || s !== sch) {
      W = innerWidth; H = innerHeight; sch = s; layout();
      if (sub === 'tut') prompt(tutStage === 0 ? swapPrompt(false) : tutStage === 3 ? swapPrompt(true) : tutStage === 1 ? chipPrompt() : null);
      if ((W < H / 1.05) !== shotPort && !(P.shot && P.c40Shot)) { defaultShots(); shoot(api.state.active === other ? shotC : shotT2); }   // a phone turned round
    }
    if (measure) measureNow();
    if (noteT > 0 && (noteT -= dt) <= 0 && noteEl) { noteEl.textContent = ''; noteEl.classList.remove('warn'); }
    if (phase === 'intro') { if ((pt += dt) >= 0.35) { phase = 'form'; F.root.classList.add('on'); enter('search'); } return; }
    if (phase === 'done') { if ((pt += dt) >= doneDur) close(result()); return; }
    t += dt; subT += dt;
    thoughtTick(dt);

    // ---- input: keys / pad / touch buttons, the terminal's own buttons, or the autoplayer
    let yes = false, no = false, lf = false, rt = false, swp = false, chipH = false, act = F.act, pc = F.popClick;
    F.act = ''; F.popClick = null;
    if (auto) {
      autoTick(dt);
      yes = AP.yes; no = AP.no; lf = AP.left; rt = AP.right; swp = AP.swap; chipH = AP.chip; act = ''; pc = null;
    } else {
      yes = I.pressed('yes'); no = I.pressed('no'); lf = I.pressed('left'); rt = I.pressed('right');
      swp = I.pressed('swap'); chipH = I.holding('chip');
      if (yes) I.consume('yes');
      if (no) I.consume('no');
      if (swp) I.consume('swap');
    }
    if (sub === 'tut') { tutTick(dt, swp, chipH); return; }

    // ---- pop-ups first (the one-tick debounce keeps the YES that closed the last one off the form)
    if (popsAllowed() && (popT -= dt) <= 0) {
      popT = (story ? 10 : 6.2) + rnd() * (story ? 4 : 2.6);
      spawnPop(nextPopDef());
    }
    const n = nOpen, block = n > 0 || blocked;
    blocked = n > 0;
    if (n > 0) {
      if (pc) { if (pc === fifo[0]) dismiss(); else slip(pc); }
      else if (yes) dismiss();
      if (sub === 'bar') barTick(dt, false, false, 0);
      if (sub === 'optin') runTick(dt, false, true);
      F.tapX = -1; F.wheel = 0; F.dragEnd = false; F.dragPos = NaN;
      return;
    }
    if (block) { F.tapX = -1; F.wheel = 0; return; }

    // ---- the step
    switch (sub) {
      case 'search':
        if (yes || act === 'search') { enter('typing'); typing(null); sfx('key_beep', SO.key); }
        break;
      case 'typing': {
        const k = Math.min(WORD.length, Math.floor(subT / 0.085) + 1);
        if (F.nameT.data.length !== k) { F.nameT.data = PREF[k]; sfx('key_beep', SO.key); }
        if (subT >= WORD.length * 0.085 + 0.3) { enter('correct'); correctT = 0; }
        break;
      }
      case 'correct':
        if (subT >= 0.25 && F.nameT.data !== WRONG && subT < 0.9) { F.nameT.data = WRONG; F.name.className = 'cs-f bad'; sfx('ss_chirp', SO.chirp); typing('think'); F.cnB.textContent = WRONG; }
        if (subT >= (fast ? 0.5 : 1.15)) enter('strip');
        break;
      case 'strip': stripTick(dt, yes, no, lf, rt, act); break;
      case 'ok0': if (subT >= 0.8) enter('mfa'); break;
      case 'mfa':
        if (yes || act === 'send') { enter('brain'); typing(null); }
        break;
      case 'brain': {
        const k = Math.min(1, subT / eatT);
        const pc2 = Math.round(3 + k * 1.2) * 4;   // the battery creeps (3 % → 4 %), drawn generously
        if (pc2 !== drBat) { drBat = pc2; F.batI.style.transform = SCALE[Math.min(100, pc2)]; }
        if (Math.floor(subT * 2.4) !== Math.floor((subT - dt) * 2.4)) sfx('knock', SO.munch);   // muesli bar
        if (subT >= eatT) enter('code');
        break;
      }
      case 'code': if (subT >= (fast ? 0.4 : 0.9)) enter('consent'); break;
      case 'consent':
        if (yes || act === 'listen') { clearPops(); enter('tut'); typing(null); }
        break;
      case 'cok': if (subT >= (fast ? 0.3 : 0.8)) enter('bar'); break;
      case 'bar': barTick(dt, no || act === 'push' || (yes && foc === 1), (yes && foc === 0) || act === 'cancel', lf || rt ? 1 : act === 'focus0' ? 2 : act === 'focus1' ? 3 : 0); break;
      case 'ok2': if (subT >= (fast ? 0.4 : 0.9)) enter('optin'); break;
      case 'optin':
        if (subT >= 0.6 && subT - dt < 0.6) measure = true;   // the terminal has settled: re-read the OK's stage
        runTick(dt, yes, false);
        break;
      case 'sure': if (yes || act === 'sure') { enter('ok3'); sfx('pop'); typing('nod'); } break;
      case 'ok3': if (subT >= (fast ? 0.2 : 0.45)) finishGame(); break;
    }
  }

  // ---- 1: the strip
  function stripTick(dt, yes, no, lf, rt, act) {
    const I = api.input;
    let step_ = 0;
    if (act === 'left') step_ = -1; else if (act === 'right') step_ = 1;
    if (lf) { step_ = -1; holdDir = -1; holdT = 0.32; } else if (rt) { step_ = 1; holdDir = 1; holdT = 0.32; }
    if (holdDir && !auto) {
      const held = holdDir < 0 ? I.held('left') || I.move.x < -0.5 : I.held('right') || I.move.x > 0.5;
      if (!held) holdDir = 0;
      else if ((holdT -= dt) <= 0) { step_ = holdDir; holdT = 0.075; }
    }
    if (F.wheel) { step_ += F.wheel; F.wheel = 0; }
    if (step_) { selU += step_; sfx('tick', SO.tick); }
    if (F.dragPos === F.dragPos) { posU = F.dragPos; selU = Math.round(posU); F.dragPos = NaN; }
    if (F.dragEnd) { F.dragEnd = false; selU = Math.round(posU); }
    if (F.tapX >= 0) {
      const off = Math.round((F.tapX - (stripL + stripW / 2)) / cw);
      F.tapX = -1; selU += off; posU = selU; pick();
    } else if (yes) pick();
    if (no && typed > 0) { typed--; showTyped(); sfx('key_beep', SO.low); }
    if (F.dragId < 0) { const d = selU - posU; posU += Math.abs(d) < 0.01 ? d : d * Math.min(1, dt * 18); }
    if (badT > 0 && (badT -= dt) <= 0) { F.strip.classList.remove('no'); F.name.className = 'cs-f live'; }
    // keep the unwrapped index near the middle copy (the 3 copies make it seamless)
    if (selU > 60 || selU < 8) { const k = selU > 60 ? -26 : 26; selU += k; posU += k; F.dragPos0 += k; }
    if (typed >= WORD.length) enter('ok0');
  }
  function pick() {
    const L = ((selU % 26) + 26) % 26;
    if (ABC[L] === WORD[typed]) {
      typed++; showTyped(); sfx('key_beep', SO.key); typing(null);
      if (typed === 4 && !jade2) { jade2 = true; popI = -1; popT = Math.min(popT, 0.25); }   // JAYD… "Did you mean: JADE PLANT?"
    } else {
      F.strip.classList.remove('no'); void F.strip.offsetWidth; F.strip.classList.add('no'); F.name.className = 'cs-f bad'; badT = 0.35;
      sfx('sad_beep', SO.low);
    }
  }

  // ---- 3: the progress bar that goes backwards (NO pushes it forwards; YES "cancels")
  function barTick(dt, push, cancel, focK) {
    const I = api.input;
    if (focK === 1) setFoc(foc ? 0 : 1); else if (focK === 2) setFoc(0); else if (focK === 3) setFoc(1);
    if (subT < 0.7) prog += 14 * dt;                       // it starts well...
    else prog -= (story ? 4 : 7.5) * dt;                     // ...then goes backwards
    if (push) { prog += 9; sfx('tick', SO.tick); typing(null); }
    else if (!auto && I.holding('no') && nOpen === 0) prog += 15 * dt;
    if (cancel) { prog -= 10; note(F.note2, 'Cancelling is not safe.', true, 1.6); sfx('sad_beep', SO.low); }
    back = !push && !(!auto && I.holding('no')) && subT >= 0.7;
    if (prog <= 0) { prog = 14; note(F.note2, 'Swap restarted. For your safety.', true, 2); sfx('sad_beep', SO.low); }
    if (prog >= 100) { prog = 100; api.input.unlatch('no'); enter('ok2'); }
  }

  // ---- 4: the OK that runs away (herd it into a corner, then press it)
  function runTick(dt, yes, frozen) {
    if (!runOn) return;
    const I = api.input, Pt = I.pointer, sp = story ? 300 : 520, FLEE = Math.min(150, stW * 0.32);
    runT += dt;
    let tap = false;
    if (!auto) {
      if (Pt.x !== lpx || Pt.y !== lpy || Pt.pressed) { lpx = Pt.x; lpy = Pt.y; cx = Pt.x - stL; cy = Pt.y - stT; mouse = I.scheme !== 'pad'; }
      const m = I.move;
      if (m.x || m.y) { cx += m.x * 420 * dt; cy -= m.y * 420 * dt; mouse = false; }
      cx = cx < 0 ? 0 : cx > stW ? stW : cx; cy = cy < 0 ? 0 : cy > stH ? stH : cy;
      tap = Pt.pressed && Pt.x >= stL && Pt.x <= stL + stW && Pt.y >= stT && Pt.y <= stT + stH;
    }
    curOn = auto || !mouse;
    if (frozen) return;
    const hit = Math.abs(cx - ox) < okHW + 4 && Math.abs(cy - oy) < okHH + 4;
    if ((yes || tap) && hit) {
      if (cornered || tired) { F.ok.classList.add('off'); F.cur.classList.add('off'); sfx('pop'); enter('sure'); return; }
      let dx = ox - cx, dy = oy - cy; const d = Math.hypot(dx, dy) || 1; dx /= d; dy /= d;
      if (d < 2) { dx = ox < stW / 2 ? 1 : -1; dy = 0; }
      ox += dx * 90; oy += dy * 50; dodges++; sfx('whoosh', SO.low);
      if (dodges >= 10) tire();
    } else if (yes && !hit && !mouse) note(F.note3, 'Corner it first.', false, 1.2);
    if (!tired) {
      let dx = ox - cx, dy = oy - cy; const d = Math.hypot(dx, dy);
      if (d < FLEE) {
        if (d < 1) { dx = ox < stW / 2 ? -1 : 1; dy = oy < stH / 2 ? -1 : 1; } else { dx /= d; dy /= d; }
        const v = sp * (0.4 + 0.6 * (1 - d / FLEE));
        ox += dx * v * dt; oy += dy * v * dt;
      }
      if (runT > (story ? 22 : 32)) tire();
    }
    ox = ox < minX ? minX : ox > maxX ? maxX : ox; oy = oy < minY ? minY : oy > maxY ? maxY : oy;
    cornered = (ox <= minX + 1 || ox >= maxX - 1) && (oy <= minY + 1 || oy >= maxY - 1);
  }
  function tire() { if (tired) return; tired = true; F.ok.classList.add('tired'); note(F.note3, 'OK has stopped running. For its safety.', false, 0); }

  // ---------------------------------------------------------- autoplay: the same inputs a player gives, deterministically
  function autoTick(dt) {
    AP.yes = AP.no = AP.left = AP.right = AP.swap = false;
    const q = fast ? 0.06 : 0.14;
    if (sub === 'optin' && nOpen === 0) { autoRun(dt); return; }
    if (sub === 'tut') {
      if ((apT -= dt) > 0) return;
      apT = fast ? 0.2 : 0.7;
      if (tutStage === 0) AP.swap = true;
      else if (tutStage === 1) AP.chip = true;
      else if (tutStage === 3) { if (AP.chip) { AP.chip = false; apT = fast ? 0.15 : 0.5; } else AP.swap = true; }
      return;
    }
    if ((apT -= dt) > 0) return;
    apT = q;
    if (nOpen > 0) { AP.yes = true; apT = fast ? 0.12 : 0.45; return; }
    if (sub === 'search' || sub === 'mfa' || sub === 'consent' || sub === 'sure') { AP.yes = true; apT = fast ? 0.15 : 0.5; return; }
    if (sub === 'strip') {
      if (Math.abs(selU - posU) > 0.2) return;
      const L = ((selU % 26) + 26) % 26, want = ABC.indexOf(WORD[typed]);
      let d = want - L; if (d > 13) d -= 26; else if (d < -13) d += 26;
      if (d > 0) AP.right = true; else if (d < 0) AP.left = true; else { AP.yes = true; apT = fast ? 0.1 : 0.3; }
      return;
    }
    if (sub === 'bar') { AP.no = true; apT = fast ? 0.07 : 0.11; }
  }
  function autoRun(dt) {
    const cxn = ox < stW / 2 ? minX : maxX, cyn = oy < stH / 2 ? minY : maxY;
    let gx, gy;
    if (cornered || tired) { gx = ox; gy = oy; }
    else { let dx = ox - cxn, dy = oy - cyn; const d = Math.hypot(dx, dy) || 1; gx = ox + dx / d * 60; gy = oy + dy / d * 60; }
    const ddx = gx - cx, ddy = gy - cy, dd = Math.hypot(ddx, ddy), st = (fast ? 1400 : 800) * dt;
    if (dd > st) { cx += ddx / dd * st; cy += ddy / dd * st; } else { cx = gx; cy = gy; }
    if (runT > (fast ? 2.5 : 7)) tire();
    if ((cornered || tired) && Math.abs(cx - ox) < 6 && Math.abs(cy - oy) < 6 && (apT -= dt) <= 0) { AP.yes = true; apT = 0.3; }
  }

  // ---------------------------------------------------------- draw: DOM writes only when something changed
  function draw() {
    if (phase !== 'form' || !F) return;
    const sec = Math.min(3599, Math.floor(t));
    if (sec !== shownSec) { shownSec = sec; F.tmB.textContent = TIMES[sec]; }
    if (sub === 'strip') {
      const L = ((selU % 26) + 26) % 26;
      if (L !== drSel) {
        if (drSel >= 0) { F.cells[drSel].classList.remove('on'); F.cells[drSel + 26].classList.remove('on'); F.cells[drSel + 52].classList.remove('on'); }
        drSel = L; F.cells[L].classList.add('on'); F.cells[L + 26].classList.add('on'); F.cells[L + 52].classList.add('on');
      }
      const x = Math.round((stripW / 2 - (posU + 0.5) * cw) * 2) / 2;
      if (x !== drPos) { drPos = x; F.moveTrk(x, 0); }
    } else if (sub === 'bar') {
      const p = Math.max(0, Math.min(100, Math.round(prog)));
      if (p !== drP) { drP = p; F.bigI.style.transform = SCALE[p]; F.bpB.textContent = PCT[p]; }
      if (back !== drBack) { drBack = back; F.big.classList.toggle('back', back); }
    } else if (sub === 'optin' && runOn) {
      const qx = Math.round(ox * 2) / 2, qy = Math.round(oy * 2) / 2;
      if (qx !== drOx || qy !== drOy) { drOx = qx; drOy = qy; F.moveOk(qx, qy); }
      const trap = cornered && !tired && Math.abs(cx - ox) < 150 && Math.abs(cy - oy) < 110;
      if (trap !== drTrap) { drTrap = trap; F.ok.classList.toggle('trap', trap); }
      const hot = Math.abs(cx - ox) < okHW && Math.abs(cy - oy) < okHH && (cornered || tired);
      if (hot !== drHot) { drHot = hot; F.ok.classList.toggle('hot', hot); }
      if (curOn !== drCur) { drCur = curOn; F.cur.classList.toggle('off', !curOn); }
      if (curOn) { const a = Math.round(cx), b = Math.round(cy); if (a !== drCx || b !== drCy) { drCx = a; drCy = b; F.moveCur(a, b); } }
    }
  }

  // ---------------------------------------------------------- open / close
  function result() { return { ok: true, time: Math.round(t * 10) / 10, slips, pops, consent: heard }; }
  function restoreWorld() {
    chipView(false); setChipable(false); arClear();
    if (promptOn) prompt(null);
    if (swapOn) swapUI(false);
    if (api && api.state && api.state.active !== act0) { api.state.active = act0; if (typeof emit === 'function') emit('swap', act0); }
    if (thHandle) { thHandle.close(); thHandle = null; }
    const c = actor(who); if (c && c.anim === 'type') c.play('idle');
    const j = actor(cust); if (j && j.anim === 'eat') j.play('idle');
    if (api && api.input) { api.input.unlatch('no'); api.input.unlatch('chip'); }
  }
  function close(r) {
    if (phase === 'end') return;
    phase = 'end'; run++;
    if (F) F.live = false;
    restoreWorld();
    if (F) { F.root.remove(); F.root.classList.remove('on'); F.tab.classList.remove('on'); }
    if (r && api) api.finish(r);
  }

  const M = {
    start(params, a) {
      if (!F) build();
      api = a; P = params || {}; run++;
      who = P.player || 'chase'; other = P.other || 'chase40'; cust = P.customer || 'jayden';
      act0 = a.state.active || who;
      story = typeof options !== 'undefined' && options.storyMode === true;
      fast = !!(TEST && TEST.fast); auto = false; doneDur = fast ? 0.9 : 2.4;
      seed = 7; popI = 0; jade2 = false; slips = 0; pops = 0; nOpen = 0; fifo.length = 0; blocked = false;
      t = 0; pt = 0; subT = 0; step = 0; sub = ''; shownSec = -1; noteT = 0; noteEl = null;
      thT = 6.5; thLast = ''; thNext = ''; thHandle = null; ate = false; heard = false; linesBusy = false; tutStage = 0;
      chipOn = false; promptOn = false; swapOn = false; chipable = false; runOn = false; apT = 0.6; AP.chip = false;
      F.live = true; F.act = ''; F.popClick = null; F.tapX = -1; F.wheel = 0; F.dragId = -1; F.dragEnd = false; F.dragPos = NaN;
      for (let i = 0; i < F.pool.length; i++) { F.pool[i].open = false; F.pool[i].el.classList.add('off'); }
      // a fresh form
      F.clk.textContent = P.time || '12:20';
      F.avg.textContent = 'avg ' + TIMES[Math.min(3599, P.avg || AVG)];
      F.cnB.textContent = 'WALK-IN'; F.tk0.classList.remove('on'); F.tk1.classList.remove('on'); F.tk2.classList.remove('on');
      F.sr.classList.add('off'); F.caret.classList.add('off'); F.note0.textContent = ''; F.note2.textContent = ''; F.note3.textContent = '';
      F.mfa.className = 'cs-f msg'; F.mfa.textContent = 'Not sent'; F.mfa.style.fontSize = ''; F.brain.classList.add('off'); F.batI.style.transform = SCALE[12];
      F.cons.className = 'cs-f msg'; F.cons.textContent = 'Waiting for MFA'; F.tut.classList.add('off');
      F.k1.className = 'cs-k now'; F.k2.className = 'cs-k';
      F.send.className = 'cs-b dis'; F.listen.className = 'cs-b dis'; F.search.className = 'cs-b';
      F.bYes.className = 'cs-b'; F.bNo.className = 'cs-b ghost'; F.bpL.textContent = 'Old chip 3%  →  New chip 3%'; F.big.classList.remove('back');
      F.bigI.style.transform = SCALE[0]; F.bpB.textContent = '0%';
      F.run.classList.remove('off'); F.sure.classList.add('off'); F.sureB.className = 'cs-b'; F.ok.className = 'cs-ok'; F.cur.className = 'cs-cur off';
      F.done.classList.remove('on'); F.term.classList.remove('away', 'popping'); tab(false); F.root.classList.remove('on');
      F.tmB.textContent = TIMES[0];
      for (let i = 0; i < 78; i++) F.cells[i].classList.remove('on');
      setStep(0);
      W = H = 0; sch = '';
      a.ui.appendChild(F.root);
      phase = 'intro';
      defaultShots();
      shoot(shotT);
      const o = actor(other); if (o) o.face(cust, 0);   // he watches the sale over his younger self's shoulder
      const j = actor(cust); if (j) { j.face(who, 0); if (j.rig && typeof j.rig.chip === 'function') j.rig.chip('on'); }
      typing(null);
      log('start');
    },
    update(dt) { update(dt); },
    draw() { draw(); },
    end(r) { if (phase !== 'end') { phase = 'end'; run++; if (F) F.live = false; restoreWorld(); if (F) { F.root.remove(); F.root.classList.remove('on'); F.tab.classList.remove('on'); } } },
    skipResult() { const f = api && api.state && api.state.flags; if (f) { f.s15_sold = true; f.s15_chipview = true; } return { ok: true, time: Math.round(t * 10) / 10, slips, pops, consent: heard }; },
    autoplay(a) {
      if (phase === 'end' || api !== a) M.start(a.params || {}, a);
      auto = true;
    },
    // test hook (dev probes): where the sale is
    peek: () => ({ phase, step, sub, open: nOpen, typed, sel: ((selU % 26) + 26) % 26, prog, tut: tutStage, ox, oy, cornered, tired, t }),
  };
  MINIGAMES.chip_sale = M;
})();
