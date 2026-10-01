# TWO — Build Prompt

Oct 1, 2026 · @Luka

A PS1-style, fixed-camera comedy adventure for the Optus Games site, and the sequel to Rue. Build it as one self-contained HTML file that runs in a browser. Story comes first: every line of dialogue here is final and word for word. `^` inside a line means a short beat (about 0.8 s). Shot tags are in square brackets.

## 0. The pitch

It's Christmas week in Redcliffe, 2026. Luka has spent two hours polishing the store's brand-new display until it's spotless. At 11:58 the phone rings: a reverse-charge call from 2040. Luka says “just say yes, it's probably Margaret.” Chase says yes. The display explodes, Luka goes over the counter, and out of the smoke walks a man in a trench coat: **Chase, fourteen years older.**

In 2040 someone called **the Manager** has taken over Optus. At 11:58 on Christmas Eve he will push one last update to every Neural Chip in the country and *opt everyone out*: no calls, no messages, nobody reaching anybody. He calls it a gift. He calls it **Quiet**. Future Chase needs help to stop him, and he's come to the only two days of his life he can't remember.

Luka and Chase cross a Brisbane that has barely changed in fourteen years (the cars hover about a foot off the ground, the bulbs are all LED, Optus sells Neural Chips instead of phones) to reach Optus HQ in Fortitude Valley. Along the way Chase meets the man he'll become if he never finishes anything. Luka finds out that in 2040 he's dead, and that his death broke his best friend.

At the top of Optus Tower they find out who the Manager is. **It's Luka.**

The game is about two fears, and about the people we turn into when fear makes our choices for us. It ends with a choice the player has to make, and neither answer is the right one.

## 1. Non-negotiables

1. **One HTML file.** Everything inline: code, styles, generated textures, synthesised audio. The only external fetch allowed is Three.js through an import map from a CDN (Rue used `https://cdn.jsdelivr.net/npm/three@0.186.1/build/three.module.js` and `three/addons/` from the same path). No image, model, font or audio files.
2. **Story first.** The script in section 8 is the game. Systems exist to deliver it. Never cut a line to save time; cut a mechanic instead.
3. **Look: low-poly PS1, but clean.** Chunky shapes, low-res painted canvas textures, nearest-neighbour filtering, flat/vertex-coloured lighting, fog. **No vertex wobble, no affine texture warping, no jitter.** It should look like a well-made PS1 game remembered fondly, not an emulator glitch. (This was a correction on Rue. Carry it over.)
4. **Cameras.**
   - *Gameplay:* locked-off fixed cameras per zone, in the style of Silent Hill and Resident Evil. Cameras cut as the player crosses zone triggers. Controls default to camera-relative “modern”; tank controls are an option.
   - *Cutscenes:* the camera is free. Treat every cutscene like a little film: composed shots, moves with intent (push-ins, cranes, orbits, tracks, top-downs), 2.35:1 letterbox bars sliding in. Never a stationary CCTV angle in a cutscene unless the script asks for “locked”. (Also a Rue correction.)
5. **Pauses.** Long silent stares are allowed only where the script marks them, and never longer than **3–4 seconds**. There is **no on-screen STARE counter** or any UI for pauses. (Rue correction.)
6. **Performance.** It must run fast with no large stutters on a mid-range laptop and a recent phone. Build each set once, merge static geometry, instance repeats, pool characters and props, bake audio loops ahead of time, pre-build the next set during cutscenes or fades, and adapt pixel ratio when frame time climbs. Include an F2 performance overlay.
7. **Saves never break the game.** Every `localStorage` read and write sits in `try/catch`. If storage is unavailable, the game still runs; it just can't continue later.
8. **Desktop, gamepad and touch** all work, as in Rue.

## 2. How Two follows on from Rue

Two is its own story. A player who never played Rue should be able to follow it. A player who did should find a game full of echoes. Rue (the man) appears **once**, in scene 2.4. Nowhere else: not on a TV, not as a voice on a phone, not in a flashback. His things can appear. He cannot.

### What happened in Rue (canon the writing relies on)

- On Tue 29 Sep 2026, JARVIS (the store's sales system) went down at 8:52 and never really came back. Chase built a time machine out of four display phones ripped off the wall (“Those are DISPLAYS. They're TETHERED. They're tethered for a REASON.”). Luka “supervised”.
- They made a reverse-charge call to Trinity College Dublin, 1987, to warn Rue (the CEO, then 19) about JARVIS. Des, the porter, answered: “…Ah, go on. Yes.” Rue hadn't made JARVIS. They got stuck for three weeks.
- They changed Rue. He learned names. He stopped being alone. Chase finished his first ever song as **Pudding** (it has a kettle in it). On the way home they said “Opt us in”, and Rue named the company.
- **Storage Full.** The trip's memories wouldn't fit down the line. They pressed YES and came home with **no memory of 1987**. They woke on the backroom floor at 11:58 on 20 Oct 2026, three weeks later. Luke: “Where have you two BEEN?” Luka: “…Lunch?” Luke: “For THREE WEEKS?”
- Rue, now 58, visited the store. He gave Luka back his faded lanyard (biro on the back of the badge: **1158**, Luka's alarm code) and gave them a box: a Polaroid, the **PUDDING** cassette, and a microcassette. On the tape their 1987 selves told them what had happened. “I don't remember any of it.” “Me neither. ^ Feels true, though.”
- Chase's lanyard finally arrived by courier with a note: “Sorry for the wait. — R.” Rue said the brick phone had rung twice in thirty-nine years and he'd like it to ring a bit more. Luka said “Opt us in.”
- Rue, at the end: “Nobody can fix JARVIS.” Post-credits: Declan Jarvis built every bug on the boys' list *on purpose*.

### What 2026 Luka and Chase know at the start of Two

They don't *remember* 1987. They know it happened because of the tape, the box and Rue. They talk about it the way you'd talk about a story told at a family dinner. They're friends with the CEO now and they still can't believe it. They remember everything from **before** the trip (JARVIS, the bug list, Error 4044, Margaret, Dazza) and everything **after** they woke up.

### Rue's running gags and lines that come back (use them, never explain them)

- “Should we call the manager?” / “We finally called the manager. And the manager hung up.”
- “We'll be back before lunch.”
- “Tea?” / “…Yes, please.” / the kettle as the save point (“Put the kettle on? \[YES\] \[NO\]”).
- “Long story.” (Why Pudding? Nobody ever finds out.)
- “EIGHT MONTHS.” (Chase's lanyard.)
- “I'll chase it up. ^ Chase it up.” / “Don't.”
- Chase's idea engine: “Okay okay okay, hear me out.” The camera **orbits** him, speeding up.
- Luka's tell: he **twists his lanyard** when he's anxious. Luka's habit: he **glances at Chase before he speaks**.
- Chase's tell: the **top-down** shot, his hands rising to his head.
- 3% batteries. “Now serving: 000.” The plastic plant that is still dying. “LANYARD REQUESTS: please allow 6–8 weeks.”
- “Error 4044. That's the one where it forgets who you are, then forgets who it is.”
- “Sends MFA codes to dead phones.” (From the bug list.)
- “Nobody can fix JARVIS.”
- “Hey, mate.” (Luka's first words on the tape.)
- “Sorry for the wait.”
- “Dunno. Felt right.” / “Feels true, though.” (Traces of things forgotten.)
- 11:58.

## 3. Tone and writing rules

- **Comedy first, honesty always.** It's silly, self-aware and quick. Then, a few times per act, it stops being silly and two people tell each other the truth. The honest moment itself is played straight: no gag lands on top of it, and no music sting tells the player what to feel. A small release can come once the moment has landed (Rue did this: “Would yous two shut up.”). Three places get no release at all: 1.8 (the order of service), 3.5 (the strike) and the Choice.
- **These are real people.** Luka and Chase are real coworkers at Optus Redcliffe. Write them with affection. Jokes come from their habits, their situation and each other, never from their bodies or appearance. When they're vulnerable it should feel like something a real person would actually say at 1 am, not a speech.
- **Australian voice.** “Mate”, “reckon”, “heaps”, “arvo”, “snag”, “servo”, “it's cooked”, “yeah nah”. Not overdone.
- **Running gags stop at three or four.** The last use should twist it.
- **Required jokes, used exactly as specified:**
  - *Bon Jovi is better than Kanye West.* **Once.** A quick throwaway in scene 1.1. Never again.
  - *Shortening a word, then explaining it.* **Three times only:** Chase in 1.1 (“calc”), Future Chase in 1.5 (“cred”), Rue in 2.4 (“bics”). Each one gets a different reaction.
- **No real song lyrics anywhere.** Store radio, carols, hold music and the choir are instrumental or hummed. The Bon Jovi line is the only reference to a real musician besides the Bee Gees statues in 2.2, and nothing they wrote is quoted or played.
- **Stares:** only where the script says “Stare”, 2–4 s, no counter.
- **Hints about the Manager are rare and silent.** See the hint ledger (section 7). Characters never comment on a hint in a way that points at Luka.

## 4. Characters

Voice blips work as in Rue: each speaker has a short synthesised blip per character as text types out (oscillator type, base pitch, blip length). Dialogue boxes show the speaker's name and a portrait baked at boot from the character's 3D bust.

### LUKA (2026) — dialogue name `LUKA`

- **Look:** 1.78 m, solid build. Black Yes polo, black trousers, black sneakers with white soles. Brown hair in a ponytail, full dark beard. A **faded blue lanyard** (it spent thirty-nine years in Rue's box) with a badge reading LUKA; biro on the back: **1158**. From 2.1 onward, a cheap Santa hat and fake white Santa beard worn *over his real beard* as a disguise.
- **Who he is now:** the 2IC. Rue told him being “the one who could” is the only thing he hires for, and Luka took it as a job description: if he's the one who can, then everything is on him. He does everything himself: “I'll do it.”
- **New fear:** hurting the people he cares about.
- **Tells:** twists his lanyard; glances at Chase before he speaks; straightens things by a millimetre; polishes when he's upset.
- **Arc:** He learns he's dead in 2040 and that his death broke Chase. His fear says *leave before you hurt anyone*, and in 2.9 he nearly does exactly what his future self did. Chase stops him: “You don't get to decide that for me.” At HQ he becomes the one who can for real (he's the only one who can hack the system, because the passwords are his), takes a blow meant to stop him, and gets back up to tell his future self the truth: “You're the one who's ruled by fear.” He learns that loving someone isn't keeping them from getting hurt. “It's staying when it does.”
- **Voice blip:** square, 110 Hz, 0.045 s (same as Rue).

### CHASE (2026) — dialogue name `CHASE`

- **Look:** 1.80 m, slim. Blue Yes polo, jeans, white sneakers, messy brown hair, stubble. One earbud in. **His lanyard, finally: CHASE**, bright and new. He touches it constantly. He also pockets a broken display security tether in 1.2 for no reason (“Felt right.”). It pays off in the boss fight.
- **Who he is now:** the ideas guy who built a time machine and finished exactly one song, which he doesn't remember writing. Since November, his song is the Optus **hold music** (Rue asked; Chase said yes). A label emailed asking “what else have you got?” He has 213 unfinished songs and hasn't replied.
- **New fear:** wasting his potential. Now that there's proof he could be something, being nothing feels worse.
- **Tells:** “Okay okay okay, hear me out” (with the orbit shot); the top-down with his hands rising to his head; hums unfinished melodies.
- **Arc:** He meets the man he becomes if he keeps waiting for a song to be perfect. Future Chase asks him not to do what he did. In 2.10 he finishes “two” by stopping. At the climax his song is the thing that reaches Future Luka. He learns that done is the only way anything gets to mean something.
- **Voice blip:** triangle, 260 Hz, 0.035 s, tumbling (same as Rue).

### CHASE (2040) — dialogue name `CHASE (2040)`

- **Look:** fourteen years older. Long, battered tan **trench coat** with deep pockets full of sticky notes, cables and a music slate. Stubble going grey, longer hair, tired eyes. Over-ear headphones round his neck (never on his ears). A soft blue Neural Chip light behind his right ear. Burn scars across the back of his **right hand**. An old CHASE lanyard with a scorch mark on the strap; the badge now says **CHASE · SENIOR CASUAL**.
- **Who he is:** still a casual at Optus Redcliffe (“Senior casual. ^ They made it up for me.”). Jordan is his boss. He has been working on Pudding's second song, **“two”**, for fourteen years: 2,847 versions, never finished. He pulled out of his only gig because “the bridge wasn't right.” When Luka died, the song had to be good enough *for him*, and nothing is good enough for a dead person. He stopped playing. He stopped ringing Rue. He kept paying $35 a month for Luka's phone number so he could hear the voicemail.
- **Why he came back:** in the original timeline he lost two days at Christmas 2026 and woke on the backroom floor with Luke screaming at him. “Fourteen years, it's the only bit of my life I can't account for. So whatever went wrong, it starts here.” He came to the gap. He also came for Luka, who was still alive in 2026.
- **Tells:** swats at pop-ups nobody else can see (JARVIS in his eyes); says “nephew” about Past Chase; doesn't do “Okay okay okay” any more, until 3.3.
- **Arc:** From paralysis and grief to finishing things. He pushes his younger self, sees his own pattern from the outside, faces Rue, faces a living Luka, and forgives him. “Sorry for the wait.” / “…Tea?” / “Yes, please.”
- **Voice blip:** triangle, 200 Hz, 0.055 s, softer attack, slight low-pass. Recognisably Chase, slower.

### THE MANAGER → LUKA (2040) — dialogue name `THE MANAGER`, switching to `LUKA (2040)` at the reveal

- **Look (masked):** long dark coat with a high collar and hood, black gloves. Always seen from behind or in silhouette against glass, with drones idling around him like fireflies. His voice runs through a drone filter (pitched down, slightly ring-modulated) so it can't be placed.
- **Look (revealed):** grey-streaked ponytail, beard cut close and greying, a burn scar running from the jaw down the neck, very still, very tired. Under the coat: the same faded blue lanyard, fourteen years more faded. Badge flipped: **1158**.
- **What happened to him:** promoted by Rue to Head of Network Safety in 2031, and brilliant at it. He never let anyone carry anything. On **Sunday 24 December 2034** he rang Chase at 6 am: “Can you come in? Need to get the servers out before the storm. I'll do it, I just need another pair of hands.” Lightning hit the Murarrie data centre. He dragged Chase out by the lanyard (Chase's hand was burned), went back in for four others, got them all out, and the roof came down. He walked out of the back and nobody saw. He let everyone believe he was dead: *I asked him to come in. I did that. He's safer without me.* He went to his own funeral and stood at the back. From the shadows he built SafeSense and the Courtesy Drones, took control of JARVIS, and in 2037 took over Optus. He has spent six years watching people hurt each other down every line he's responsible for, and he's decided to make it stop.
- **The burden of preemptive protection:** he became the thing he feared. By leaving to protect Chase, he hurt Chase more than anything else could have. By protecting everyone, he's about to take everything from them.
- **Tells (used sparingly as hints):** glances to his left before he speaks, at an empty chair where Chase used to sit; everything around him is spotless; he still uses his old passwords.
- **Arc:** At the climax, fear wins one last time: he hurts his past self. Then he hears his own young laugh inside Chase's song and breaks. He chooses **NO**.
- **Voice blip:** masked: sawtooth, 95 Hz, 0.06 s, low-pass 900 Hz. Unmasked: square, 100 Hz, 0.055 s, soft. Recognisably Luka, lower.

### Supporting cast

| Character | Dialogue name | Who | Look | Voice blip |
| --- | --- | --- | --- | --- |
| **Jordan (2026)** | JORDAN | Casual at Redcliffe (the new casual who waved in Rue). Sensible. | Blue polo, khaki trousers, curly black hair. | triangle 230 Hz |
| **Jordan (2040)** | JORDAN | Store manager, Redcliffe. Future Chase's boss. Kind and worried about him. | Same, older, a MANAGER lanyard, a chip light. | sine 225 Hz, soft |
| **Luke (2026)** | LUKE | Store manager. Tired. Carries a mug everywhere. | Black polo, LUKE lanyard. | square 160 Hz |
| **Luke (2040)** | LUKE | Retired 2037. Runs a charity sausage sizzle outside Sandgate station on Sundays. Happy. Hasn't been on the network since he retired. | Sunburnt, apron that reads KISS THE COOK (SAFELY), tongs. | square 150 Hz |
| **Rue (2040, 72)** | RUE | Retired CEO, forced out by the Manager in 2037. Lives in an old Queenslander at Scarborough. **One appearance (2.4).** | White hair, cardigan in the heat, reading glasses, the brick phone in his cardigan pocket, the Walkman on the side table. | sine 130 Hz, 0.07 s, soft |
| **Des (the kettle)** | DES | Smart kettle in the 2040 backroom. On a phone plan. Accepts reverse-charge calls. Says “Tea?” Future Chase named it Des. “Dunno. Felt right.” | A chrome kettle with a little glowing screen that reads DES. | sine 300 Hz, 0.03 s, pure, polite |
| **Teddy** | TEDDY | 84. The last human checkpoint operator on the Ted Smout Bridge. Nobody has asked his name in three years. | Cardigan, cap, a desk fan, a transistor radio. | sine 120 Hz, slow |
| **Mia** | MIA | 16. Busks in Brunswick Street Mall at whisper volume. Learned the Optus hold music as her first song. | Beanie, oversized flannel, ukulele with stickers. | triangle 270 Hz |
| **Nadia** | NADIA | Network Safety engineer at HQ. Worked for Luka 2031–34. | Corporate lanyard, cardigan, tired eyes, a reindeer-antler headband (mandatory fun). | triangle 225 Hz |
| **Jayden** | JAYDEN | Tradie in hi-vis. Dazza's son. Needs a chip swap before he pours a slab. | Hi-vis, cap, boots. | square 125 Hz, low-pass |
| **Courtesy Drone** | DRONE | The Manager's drones. Unfailingly polite. | Small white hovering pod, soft blue light; amber when suspicious; red when escorting. | square 420 Hz, mono, filtered |
| **SafeSense** | SAFESENSE | The chip assistant behind every pop-up. | Pop-ups only. | triangle 350 Hz, chirpy |
| **Operator** | OPERATOR | The reverse-charge operator from Rue. | Voice only. | square 330 Hz, mono, filtered (same as Rue) |
| **Margaret** | MARGARET | Voice only, post-credits. | — | sine 220 Hz, soft (same as Rue) |

Minor speakers (HR, DESK, PASSENGER, LIFEGUARD DRONE, HOVER-CAR, DOOR DRONE, TRAIN ANNOUNCEMENT, FIGURE, VOICE 1, VOICE 2) use simple generic blips. **FIGURE** and **VOICE** in 1.2 use Chase (2040)'s blip (and a silhouette portrait until he's revealed). **LUKA'S VOICEMAIL** uses Luka's blip through a phone-band filter.

Crowd extras: 2026 Redcliffe customers in shorts and thongs; 2040 Redcliffe locals with chip lights; train passengers; Optus HQ staff in antler headbands and safety goggles; Valley whisperers.

## 5. The world

### 2026: Optus Redcliffe at Christmas

Same store as Rue: car park, sliding glass doors, the big Yes wall graphic, display wall, counter with the JARVIS monitor, accessories wall, SIM rack, queue machine (Now serving: 000), plastic pot plant, targets board, noticeboard, Luke's office (door: LUKE — MANAGER / KNOCK / PLEASE, and now a fourth line in biro: ESPECIALLY YOU TWO), the corridor to the backroom (door takes nine seconds), the backroom (kettle, TV, repair bench, lost property, two scorch marks on the ceiling from the Rue trip, with a laminated sign: DO NOT PAINT — L.).

Christmas dressing: tinsel on everything, a Santa hat on the Y of the Yes sign, fake-snow spray on windows in 34 °C heat, a sad plastic Christmas tree next to the plastic plant, a store radio playing an instrumental 80s-rock Christmas pastiche.

**New:** the **Hero Table**, a freestanding glass display with four new phones in tethered cradles, the first display the store has been allowed since four went missing in Rue. Luke has told Luka that if anything happens to it, it comes out of his pay.

**The Wall** (staff area, by the backroom door) holds the memorabilia: the 1987 Polaroid in a frame (two blurry figures in polos and young Rue; the image never quite resolves), the PUDDING cassette in a box frame, the “Sorry for the wait. — R.” note, the MISSING poster of the boys from October (framed as a joke), and a flyer: HOLD MUSIC NOW FEATURING PUDDING — R. A Rue mug (“I'm on mugs”) sits by the kettle.

### 2040: Brisbane, fourteen years later

The joke is how little has changed. The menace is what has.

**Hasn't changed:** the Redcliffe store's layout, down to the queue machine (still 000), the yellowed LANYARD REQUESTS flyer on the same pin, and the same plastic plant, still dying. JARVIS is still everywhere. Batteries still sit at 3%. Kettles. Fish and chips on Redcliffe Parade. Pelicans. 34 degrees and a storm every afternoon at four. LED bulbs. (“All the bulbs are LED now.” “Everything was already LED.”)

**Has changed:**

- **Hover cars** float about a foot off the road. They used to do three; the Manager made it one, for safety. They chirp “Turning left. Are you sure?” at every corner.
- **Neural Chips** instead of phones. A chip sits behind the ear and shows a little blue light. The store sells them on tiny velvet pillows in tethered cradles. They're on 3%.
- **AR everywhere.** Signs, price tags, street names and ads exist only in chip-vision. To someone without a chip (the 2026 boys), 2040 is full of blank signs. To Future Chase it's full of ads, including one for **Optus Cloud+: “Never forget anything again! $14.99/month.”** (This ad is planted all game. It matters at the end.)
- **SafeSense** asks “Are you sure?” before everything and “Are you sure you're sure?” before anything that matters.
- **Courtesy Drones** patrol everywhere: white, polite, never violent. They don't arrest you. They escort you to a **Safe Room** and keep you there, for your safety.
- **Quiet.** Padded bollards. 40 dB limiters on public pianos and buskers. Do Not Disturb on by default. Messages are screened: “This message may upset the recipient. Send anyway? \[NO\]”. In Fortitude Valley it's **Quiet Hours 24/7**: neon dimmed to “safe brightness”, nightclubs turned into nap clubs, people whispering.
- **Pudding's 1987 song** has been the national Optus hold music since November 2026. Everyone in Australia has heard it, always while waiting.
- Brisbane hosted the Olympics in 2032. (“Did we win?” “We hosted.”)
- Optus's slogan is still “Yes.” The Manager added “(Are you sure?)”.

### The Manager's plan: the Opt-Out

At **11:58 on Monday 24 December 2040** every Neural Chip in the country receives one final update. Everyone is opted out: of calls, of messages, of the network, of each other. Everything runs on the chips now (cars, lights, hospitals, fridges), so “Quiet” doesn't mean peace. It means off. The Manager has built safe fallbacks for essential services, because he's thorough, but the effect is the same: everyone safe, and everyone alone. His prompt on the glass reads **OPT OUT ALL USERS? \[YES\]**. There is no NO button.

Monday is also the sixth anniversary of the fire.

### Time travel rules (from Rue, restated)

1. **It's a phone call.** The machine dials a number in another time. Someone at the other end has to accept the reverse charges (“Yes”). Then the callers arrive in a white flash at the phone that said yes, or, if there are display devices near that phone, *inside the displays* (rule 3). The arrival is violent (“BAM”). That's why Future Chase comes out of the Hero Table.
2. **A minute here is a minute there.** Once linked, both times run in parallel.
3. **Display devices make it work.** Rue's machine used four display phones; Future Chase's uses four display Neural Chips. (“Some things don't change.”)
4. **Going home, you land where you left.**
5. **Storage Full.** A trip's memories don't fit down the line home. They're cleared, along with the trip's data on any devices (Chase's phone recordings included). Objects travel fine (lanyards, tapes, photos).
6. **New in 2040: Optus Cloud+.** For the first time you can keep the memories. Doing so changes who you'll become, so the future selves who exist now are **overwritten**.
7. **The gap.** In the original timeline the boys went home with no memory of 22–24 Dec 2026 and never found out where they went. That gap is this game.

### Dates and times

| When | What |
| --- | --- |
| Tue 22 Dec 2026, 11:31 | Act One opens. Luka polishing. |
| Tue 22 Dec 2026, 11:58 | The call. BAM. |
| Sat 22 Dec 2040, 12:04 | Arrival in the 2040 backroom. |
| Sat 22 Dec 2040, 13:00 | The Manager's Christmas address. |
| Sun 23 Dec 2040 | Redcliffe, the bridge, Sandgate, the train, the Valley. |
| Mon 24 Dec 2040, 01:10–03:00 | The Starlight. Lights Out. The song. |
| Mon 24 Dec 2040, 10:00 | Optus HQ Christmas morning tea. |
| Mon 24 Dec 2040, 11:41–11:58 | The Manager. The boss. NO. |
| Mon 24 Dec 2040, 18:40 | The roof. The choice. |
| Thu 24 Dec 2026, 18:58 | Home: two days, seven hours later. |
| Sun 24 Dec 2034 | (Backstory) The Murarrie fire. |

## 6. Motifs

Each motif should appear at least three times, change meaning by the end, and never be pointed at by a character. Primary motifs are bold.

| Motif | Where it shows up | What it becomes |
| --- | --- | --- |
| **Two** | Two Lukas, two Chases. Pudding's second song is called “two”. The 2IC is second in charge. Two days missing. Two buttons. Frames composed as mirrors (the two Chases at a piano in the same posture; the two Lukas at opposite ends of the office). | The final choice between two endings. |
| **YES / NO** | Rue's game was about saying yes. Two is about having a NO. “Just say yes.” The Manager's pop-up has no NO. Teddy has to say NO to everyone. In 3.6 Past Luka gives Future Luka his NO back. | The final pop-up: **both buttons live**, nothing greyed out, and neither one wrong. |
| **Quiet vs. music** | The Manager's “gift of Quiet”. Quiet Hours. Future Chase's silent flat. Four minutes of silence at a funeral. 40 dB limiters. “A song nobody hears isn't perfect. It's just quiet.” (2.10) | A song breaks the Quiet. |
| **“I'll do it.” vs. “I will.”** | Luka's catchphrase (“I'll do it”) is a burden: he takes things off people. Rue passes on Des's lesson: in Irish there's no word for yes, you answer with what you'll do, and “I will” is a promise. | Luka stops saying “I'll do it”. Characters answer each other with “I will.” |
| **Spotless** | The Hero Table polished to 100% and destroyed. Luka's memorial bench polished every Sunday. Optus HQ, every surface mirror-bright. Future Chase's 2,847 versions. Perfection as control (Luka) and as paralysis (Chase). | Ending A: Luka leaves a smudge on the new display, on purpose. |
| **Lanyards and 1158** | Chase's lanyard finally arrived. Luka's faded one, with 1158 on the back. Future Chase's scorched one. Future Luka's even more faded one. The lanyard desk at HQ: “please allow 6–8 weeks”. | The reveal is a lanyard before it's a face. |
| **The kettle and tea** | Des the kettle accepts the call. Kettles are save points. “Tea?” “…Yes, please.” | Forgiveness: “…Tea?” “Yes, please.” |
| **The Manager** | “Should we call the manager?” Chase is sure it's Luke. Luke / Luka: one letter apart. | — |
| **The glance** | Luka glances at Chase before he speaks. The Manager glances left at an empty chair. | At the reveal Future Luka glances at Chase, and the empty chair makes sense. |
| **Hands to head** | The top-down shot. Past Chase, Future Chase. | During the song, Future Chase's hands start to rise and come back down. In Ending A, Chase stops them halfway and laughs. |
| **“Hey, mate.”** | Luka's first words on the tape. Future Chase's first words. | Future Luka's first unmasked words. |
| **“Long story.”** | Why Pudding? Nobody ever finds out. | Ending A: “We haven't got time, have we.” Ending B: “I've got time.” “…Yeah. You have.” |
| **11:58** | The call. The Opt-Out. Luka's alarm code. “Before lunch.” | — |
| **Hold music / “Sorry for the wait”** | Pudding's 1987 song is the national hold music. Mia learned it as her first song. Margaret waits. | Future Luka: “Sorry for the wait.” / Ending B: Future Chase answers a fourteen-year-old email with “Sorry for the wait.” |
| **The voicemail** | “Hey, it's Luka. I'm probably at work. Leave a message. Chase, if it's you, I'm not doing your shift.” Future Chase kept paying for the number. Someone else kept it alive. | — |
| **Face-down photo** | The prologue: a gloved hand rests on a face-down frame (Rue's prologue had a face-down Polaroid). | Revealed in 3.5: Luka and Chase in 2033, laughing so hard they're blurred. |
| **Error 4044** | “Forgets who you are, then forgets who it is.” A drone can't tell Past Luka from the Manager. | Ending B: the machine's last pop-up as their memories clear. |
| **Cloud+ ads** | “Never forget anything again!” floating in Future Chase's vision all game. | The way to keep their memories, and the price. |
| **Traces** | Future Chase named his kettle Des: “Dunno. Felt right.” Luka in Rue stepped in front of Chase without knowing why. | Ending B: Chase hums a bridge he doesn't remember writing. |
| **The nephew gag** | 2026: “That's Chase's uncle.” 2040: “My nephew.” “He looks exactly like you.” “Genes.” The train: “Nephew.” “Brother.” “Nephew.” | The fourth and last use, twisted: Nadia asks Santa Luka if he's Luka. “…His nephew.” |
| **A beard over a beard** | Luka's Santa disguise. | Rue: “That's a terrible beard.” |

## 7. Structure

Three acts, a prologue, two endings, credits and a post-credits scene. Each scene opens with a small title card (time and place) unless the script says otherwise. Act cards: **ACT ONE — Will You Accept the Charges?** · **ACT TWO — Are You Sure You're Sure?** · **ACT THREE — Two**.

| ID | Title | Set | When | Playable | Mini-game / puzzle |
| --- | --- | --- | --- | --- | --- |
| P | Do Not Disturb | hq\_top | Sat 22 Dec 2040, 11:52 | — | — |
| 1.1 | Spotless | reddy26 | Tue 22 Dec 2026, 11:31 | Luka | **Polish**; tinsel; get Chase off hold |
| 1.2 | Accept the Charges | reddy26 | 11:58 | — | — |
| 1.3 | Before Lunch | reddy26 | 12:01 | Luka ⇄ Chase | **Stall Luke** + **Wiring** (swap tutorial) |
| 1.4 | All the Bulbs Are LED Now | reddy40 | Sat 22 Dec 2040, 12:04 | Chase | Explore 2040 |
| 1.5 | Cred | reddy40 | 12:20 | Chase ⇄ Chase (2040) | **Neural Chip Sale** (+ Chip View intro) |
| 1.6 | Safety Address | reddy40 | 13:00 | Luka ⇄ Chase ⇄ Chase (2040) | **Drone stealth** tutorial; Safe Room |
| 1.7 | One Foot Off the Ground | parade | 13:40 → dusk | Luka ⇄ Chase | Roam Redcliffe; samples |
| 1.8 | Order of Service | flat | 19:40 | Luka ⇄ Chase | — |
| 2.1 | Senior Casual | flat | Sun 23 Dec 2040, 4:52 am | Chase, then Luka | Disguise |
| 2.2 | Bee Gees Way | parade | 07:30 | all three | **Public Piano** (split-view + strength + play) |
| 2.3 | The Bench | parade | 08:40 | Luka | Sit |
| 2.4 | Every Sunday | rue\_house | 10:30 | Chase | Talk |
| 2.5 | Are You Sure You're Sure? | bridge | 13:00 | all three | **Checkpoint** + **Hover-scooter chase** |
| 2.6 | Snag | sandgate | 15:00 | Chase ⇄ Luka | **Sausage Sizzle** |
| 2.7 | Shorncliffe Line | train | 16:30 | Chase | Short stealth |
| 2.8 | Quiet Hours | valley | 19:30 | all three | **The Ukulele** (lure + AR + climb) |
| 2.9 | Lights Out | valley (Starlight) | Mon 24 Dec 2040, 01:10 | Luka | Sneak out |
| 2.10 | 3:00 am | valley (Starlight) | 03:00 | Chase | **Sequencer: “two”** |
| 3.1 | Mandatory Fun | hq\_atrium | 10:00 | all three | **Blend In** + **Secret Santa** |
| 3.2 | Spotless | hq\_floors | 10:40 | all three | Confiscated floor; **Hack** intro; drone hangar |
| 3.3 | The Manager | hq\_top | 11:41 | — | — |
| 3.4 | 85% | hq\_top | 11:43 | Chase ⇄ Chase (2040), Luka prompts | **Boss** |
| 3.5 | 99% | hq\_top | 11:54 | — | — |
| 3.6 | two | hq\_top | 11:57 | Luka (2040), one action | **Hold NO** |
| 3.7 | Storage Full | hq\_roof | 18:40 | — | **The Choice** |
| A1 / A2 | Keep / Christmas Morning | hq\_roof → reddy26 → foreshore26 | — | — | Ending A |
| B1 / B2 | Again / Christmas Morning | hq\_roof → reddy26 → montage → parade | — | — | Ending B |
| C | Credits | — | — | — | Song “two” |
| PC | Hold | reddy26 | Tue 22 Dec 2026, 12:10 | — | — |

### The hint ledger (the only clues that the Manager is Luka)

Use these five and **no others**. No music stings. No character connects them before 3.3. Each appears only where listed.

1. **P and 1.6 — the glance.** Before speaking, the Manager turns his head a few degrees to his left, toward an empty chair. (In Rue, Luka glances at Chase before he speaks.) Twice before the reveal and never anywhere else; paid off in 3.3.
2. **2.3 — the bench.** Luka's memorial bench is polished to a mirror shine. Luka runs a finger along it and finds no dust. “Someone's done a good job.”
3. **2.3 — the code (buried).** Future Chase found out about the Opt-Out because JARVIS sent a login code for an account called QUIET to Luka's old number, which Chase still pays for. “Sends MFA codes to dead phones.” (The Manager's recovery number is his own old number.)
4. **2.5 — Error 4044.** A drone scans Past Luka, throws **ERROR 4044 — IDENTITY CONFLICT**, and drifts off. Luka quotes his own line about Error 4044. Future Chase: “They never do that.” Chase: “Nobody can fix JARVIS.”
5. **3.2 — spotless.** Every floor of HQ is polished to a mirror shine by cleaning drones, like the Hero Table. Luka: “…Someone's got standards.”

**Misdirection:** Chase is certain it's Luke (1.2, 1.6), loudly, until 2.6 proves it isn't. In 3.3 he slips back into it out of habit.

All five hints are paid off in 3.3.

## 8. The script, scene by scene

**Format.** Each scene lists its set, time card, who's playable, music and HUD, then plays moment by moment. `[SHOT · direction]` tags are camera instructions. **NAME:** “Line.” is dialogue, final and word for word. `^` is a beat. *(Italics)* are stage directions. **▶ PLAY** blocks are gameplay. “Examine” lines are what the active character says when the player inspects something; if a line belongs to a specific character it's marked.

### PROLOGUE — “Do Not Disturb”

**Set:** hq\_top (the Manager's office, top floor of Optus Tower, Fortitude Valley) · **Time card:** none · **Playable:** — · **Music:** none; ambience of a storm far off and drones humming · **HUD:** none

*The office: long, dark, spotless. One wall is floor-to-ceiling glass over Fortitude Valley at midday under a bruise-coloured storm sky; the neon is dimmed, the Story Bridge is in the distance. One desk with nothing on it except a single framed photo lying face down. Beside the desk on the left, an empty office chair. Small white drones idle outside the glass like fireflies.*

1. **\[BLACK\]** Thunder, very far away. A drone hum fades up.
2. **\[ECU · locked\]** A pop-up glowing on the glass wall, SafeSense-style (rounded, translucent white): **OPT OUT ALL USERS?** One button: **\[YES\]**. Where a NO button should be there's an empty space the shape of a button. Small text beneath: *Scheduled: Monday 24 December 2040 · 11:58.* A cursor drifts toward YES and stops just short. Hold 3 s.
3. **\[INSERT · slow track along the desk\]** The surface is so clean it reflects the storm. The track ends on the face-down frame. A gloved hand enters and rests on it for a moment. The hand leaves.
4. **\[WIDE · high, from the far corner\]** A figure in a long dark coat stands at the glass, back to camera, small against the city. The empty chair sits to his left. A drone glides in through the dark and stops at his shoulder.
5. **DRONE:** “Sir. Unscheduled outbound call. Redcliffe store. ^ Destination: Tuesday, twenty-second of December, 2026.”
6. **\[CLOSE · the back of his head, the hood up\]** He doesn't move.
7. **THE MANAGER:** “…Who's calling?”
8. **DRONE:** “Chase.”
9. **\[MID · from behind, his shoulder and the empty chair in frame\]** *(Hint 1.)* He turns his head a few degrees to the left, toward the empty chair, as if checking with someone. Then back to the glass. No music marks it.
10. **DRONE:** “Shall I end the call?”
11. *A pause, 2 s.*
12. **THE MANAGER:** “No. ^ He never finishes anything.”
13. **\[ECU\]** The pop-up on the glass. In its corner a small moon icon switches on: **Do Not Disturb**.
14. **\[BLACK\]** Title: **TWO**. *(The title card should be simple: white, lowercase-friendly type, a hairline yellow underline in Yes yellow.)*

## ACT ONE — Will You Accept the Charges?

*Act card over black, 3 s.*

### 1.1 — “Spotless”

**Set:** reddy26 · **Time card:** Tuesday 22 December 2026, 11:31 · **Playable:** Luka (Chase at the counter; Jordan on a ladder) · **Music:** the store radio, an instrumental 80s-rock Christmas pastiche, diegetic · **HUD:** none · **Save:** backroom kettle

**Cutscene — “1.1\_open”**

1. **\[CRANE · down out of a blazing blue sky\]** Past the Yes sign. A Santa hat has been jammed over the top of the Y. Tinsel hangs off the sign, limp in the heat. Down to the car park shimmering at 34 degrees, past fake-snow spray on the windows, through the glass doors.
2. **\[MID · through the glass\]** Inside, LUKA crouches at the Hero Table polishing the glass with a microfibre cloth, tongue between his teeth, completely absorbed. Behind him, CHASE leans on the counter with the store phone to his ear, eyes closed, suffering. JORDAN stands at the top of a stepladder by the Yes wall holding a fistful of tinsel.
3. **\[CLOSE · the glass\]** A smudge. Luka breathes on it. Polishes. Gone. He moves on. Behind him, Chase's finger lands on the glass as he leans over to watch. A new smudge.
4. **LUKA:** *(not looking up)* “Chase.”
5. **CHASE:** “Sorry.”
6. **\[TWO-SHOT · the counter\]** Faintly from Chase's phone comes a tinny chiptune melody: the 1987 Pudding song as hold music.
7. **CHASE:** “It's my song.”
8. **LUKA:** “I know.”
9. **CHASE:** “I've been on hold with head office for forty minutes. ^ With my own song.”
10. **LUKA:** “How's that feel?”
11. **CHASE:** “Proud. ^ And then trapped.”
12. **\[WIDE\]** The radio swings into a big chugging guitar chorus (instrumental).
13. **CHASE:** “Can we change the playlist?”
14. **LUKA:** “It's Christmas.”
15. **CHASE:** “It's been Bon Jovi since November.”
16. **LUKA:** “Bon Jovi's better than Kanye West.”
17. **CHASE:** “…Nobody said Kanye.”
18. **LUKA:** “Just getting ahead of it.”
19. **\[LOW · Jordan up the ladder, reaching\]** The ladder wobbles slightly.
20. **\[CLOSE · Luka\]** His head snaps up. He's on his feet.
21. **LUKA:** “Jordan. Down. ^ I'll do it.”
22. **JORDAN:** “I'm fine—”
23. **LUKA:** “I'll do it.”
24. *Control passes to Luka.*

**▶ PLAY — “Get the store ready for Christmas.”** Objective checklist (top left, Rue style, ticks with a yellow strike):

- ☐ Polish the Hero Table
- ☐ Hang the tinsel
- ☐ Get Chase off hold

*Hang the tinsel.* Talk to Jordan. He climbs down. Luka climbs the ladder (a short climb animation; Luka is careful, both hands). **\[OTS · from below\]** the ladder wobbles once. Luka holds very still. Hangs the tinsel. Climbs down. Tick. Jordan: “You could've let me do that.” Luka: “Yeah.” *(He wouldn't.)*

*Get Chase off hold.* Talk to Chase. He holds up a finger: still on hold. Dialogue:

- **LUKA:** “Still?”
- **CHASE:** “Forty-three minutes. It's looped eleven times. I've started hearing things I'd change.”
- **LUKA:** “Like what?”
- **CHASE:** “Everything.”
- *(Then, at the register, Chase works out a Christmas bundle price for Jordan on paper.)*
- **CHASE:** “Jordan, check the calc. ^ Calc is short for calculator.”
- **JORDAN:** “I know what calc's short for.”
- **LUKA:** “Everyone knows what calc's short for.”

On the second talk, Chase hangs up (head office never answered) and the real conversation happens. Play it as a two-shot across the counter, Luka glancing at Chase before he speaks:

- **CHASE:** “Someone from a label emailed.”
- **LUKA:** “What?”
- **CHASE:** “Moreton Bay Records. They heard the hold music. They want to hear 'what else I've got'.”
- **LUKA:** “Mate. That's huge.”
- **CHASE:** “Yeah.”
- **LUKA:** “What else have you got?”
- **CHASE:** “Two hundred and thirteen unfinished songs.”
- **LUKA:** “Send them one.”
- **CHASE:** “None of them are finished.”
- **LUKA:** “Send them the least unfinished one.”
- **CHASE:** “That's track two. It's not ready.”
- **LUKA:** “When's it going to be ready?”
- **CHASE:** “When it's good.”
- *(A beat. Chase fiddles with his new lanyard.)*
- **CHASE:** “You said I changed a person. On the tape. So now there's, like, proof. That I could be something.” ^ “And I'm doing screen protectors.”
- **LUKA:** “You're good at screen protectors.”
- **CHASE:** “That's what scares me.”

Tick.

*Polish the Hero Table* (mini-game **Polish**, see 9.1). Top-down over the glass. Smudges, fingerprints and a ghostly forehead print. The SHINE meter climbs to 100%. At 99%, if Chase is in the scene, he wanders over and leans on it; a new handprint appears. **LUKA:** “CHASE.” **CHASE:** “Sorry.” Final smudge. **100% — SPOTLESS** with a small bright chime and a sparkle glint across the glass. Tick.

**Examine lines** (Luka unless marked):

- *Hero Table (before polishing):* “Four new phones. First display Luke's let us have since October. ^ If anything happens to it, it comes out of my pay.”
- *Phones on the Hero Table:* “3%. They come out of the box tired.”
- *Plastic Christmas tree:* “It's plastic. It's dying. It caught it off the plant.”
- *Plastic plant:* “Still dying. Bit festive about it.”
- *Queue machine:* “Now serving: 000.”
- *Noticeboard:* “LANYARD REQUESTS: please allow 6–8 weeks. ^ Chase's took eight months. He tells customers.”
- *Hold music flyer:* “HOLD MUSIC: NOW FEATURING PUDDING. — R. ^ Rue asked if he could use it. Chase said yes before he finished the question.”
- *Luke's office door:* “LUKE — MANAGER. Under it: KNOCK. Under that: PLEASE. ^ Under that, new: ESPECIALLY YOU TWO.”
- *The Wall — Polaroid:* “Us and Rue. 1987. ^ Don't remember it. It's still my favourite photo.”
- *The Wall — PUDDING cassette:* “The first song Chase ever finished. It's got a kettle in it. He doesn't remember writing it.”
- *The Wall — note:* “'Sorry for the wait. — R.' Came with his lanyard.”
- *The Wall — MISSING poster:* “Luke printed these when we disappeared. Now he can't take them down without admitting it happened.”
- *Rue mug:* “He's on mugs.”
- *Backroom ceiling:* “Two scorch marks. One for leaving, one for coming back. DO NOT PAINT. ^ I wrote that.”
- *Backroom TV:* the TV shows a Christmas card graphic and the JARVIS pop-up **Rue's Christmas Message — Video could not be played.** Luka: “Every year.”
- *Counter monitor:* JARVIS pop-up: **JARVIS wishes you a Merry Christmas! Are you sure? \[YES\] \[YES\]**
- *Chase's laptop (backroom bench):* a folder: **UNFINISHED — 213 items.** The newest: **track two (dont open).** Luka: “He'll finish it.”
- *Kettle (save):* “Put the kettle on? \[YES\] \[NO\]”
- *Chase (talk, after the main conversation):* “Has my lanyard— ^ It came. I keep forgetting it came.”
- *Jordan (talk):* “Luke says if the display gets so much as a fingerprint, you're doing Boxing Day.”

When all three are ticked, the wall clock reads **11:58**. Cut to 1.2.

### 1.2 — “Accept the Charges”

**Set:** reddy26 · **Time card:** none (continuous) · **Playable:** — · **Music:** store radio, then nothing · **HUD:** none

1. **\[LOW · heroic, up past the glittering edge of the Hero Table\]** Luka steps back and looks at it. The glass catches the light. He's so proud.
2. **LUKA:** “Spotless.”
3. **\[INSERT\]** The wall clock: 11:58.
4. The store phone on the counter rings. Chase answers.
5. **CHASE:** “Optus Redcliffe, Chase speaking.”
6. **OPERATOR:** “You have a reverse-charge call from—”
7. **VOICE:** *(older, gravelly, tired; dialogue name VOICE)* “Chase. Optus Redcliffe.”
8. **OPERATOR:** “—2040. Will you accept the charges?”
9. **\[CLOSE · Chase\]** He frowns at the receiver.
10. **CHASE:** “…Sorry, from who?”
11. **\[TWO-SHOT · Luka in the foreground, admiring the table, back to Chase\]**
12. **LUKA:** “Just say yes. It's probably Margaret.”
13. **CHASE:** “…Yes?”
14. **\[CLOSE · Luka\]** He's looking down at his own reflection in the spotless glass, utterly content.
15. *(Half a second of perfect pride.)*
16. **\[WIDE · locked, the whole floor\]** *BAM.* A white flash erupts from inside the Hero Table. *(Reduce Flashing: a slow grey bloom instead.)* The glass, the phones and the cradles blow apart. Luka is launched backwards over the counter.
17. **\[SLOW MOTION · CLOSE · Luka mid-air, 1.5 s\]** His face as the display he polished for two hours disintegrates in the background.
18. **\[WIDE\]** Real time. He lands behind the counter with a crash. Four security alarms scream (Rue's alarm sound). The Christmas tree falls over. Smoke fills the floor. Four empty tethers swing from what's left of the table. The radio keeps playing.
19. **\[LOW · from behind the counter, Luka's view, upside down\]** Through the smoke a figure stands where the table was: a long tan trench coat, smoking slightly at the hem. He coughs.
20. *Stare, 3 s. Luka upside down. Chase frozen with the receiver. The figure.*
21. **FIGURE:** *(dialogue name FIGURE with a silhouette portrait until step 23; then CHASE (2040))* “…Sorry.” *(He looks down at the wreck.)* “^ Was that new?”
22. **LUKA:** *(from the floor)* “It was SPOTLESS.”
23. **\[CLOSE · the figure\]** He turns his collar down. Grey stubble, tired eyes, over-ear headphones round his neck, a soft blue light behind his ear, a scorched lanyard: CHASE · SENIOR CASUAL. Chase's face, fourteen years on.
24. **\[CLOSE · Chase\]**
25. **CHASE:** “…Oh no.”
26. **CHASE (2040):** “Hey, mate.”
27. **CHASE:** “You're me.”
28. **CHASE (2040):** “I'm you.”
29. **CHASE:** “You're OLD.”
30. **CHASE (2040):** “I'm fourteen years older. That's not old. That's— ^ It's a bit old.”
31. **\[MID\]** Luka climbs up over the counter, covered in glass dust. Chase (2040) turns and sees him, and stops. *Hold 2 s on his face: he's looking at someone he hasn't seen in six years. The player doesn't know that yet. Play it as a strange, too-long look.*
32. He walks over and carefully brushes the dust off Luka's shoulder, as if checking that he's solid.
33. **LUKA:** “…What?”
34. **CHASE (2040):** “Nothing. ^ You've got display on you.”
35. **\[WIDE\]** The alarms whoop. Chase (2040) is all business.
36. **CHASE (2040):** “We haven't got long. In two days, someone's going to switch off the world. I need your help.”
37. **LUKA:** “We're on till five.”
38. **CHASE:** “We're on till five.”
39. **CHASE (2040):** “You won't be on till five.”
40. **CHASE:** “Who's switching off the world?”
41. **CHASE (2040):** “Nobody knows his name. Took over Optus three years ago. Everyone just calls him the Manager.”
42. **\[TWO-SHOT · Luka and Chase\]** They look at each other.
43. **LUKA:** “…Should we call the manager?”
44. **CHASE (2040):** “No. He IS the— no.”
45. **CHASE:** “It's Luke.”
46. **CHASE (2040):** “Nobody knows who—”
47. **CHASE:** “It's obviously Luke.”
48. **LUKA:** “It's not Luke.”
49. **CHASE:** “He hung up on us. In 1987.”
50. **LUKA:** “We don't remember that.”
51. **CHASE:** “He TOLD us.”
52. **LUKA:** *(to Chase (2040))* “Why us?”
53. **CHASE (2040):** “Because I've got a gap. Two days. Christmas 2026. I woke up on that backroom floor on Christmas Eve with Luke screaming at me, and I never found out where we went.” ^ “Fourteen years, it's the only bit of my life I can't account for. So whatever went wrong, it starts here.”
54. **CHASE:** “So you came to the gap.”
55. **CHASE (2040):** “I came to the gap.”
56. **LUKA:** “And what's in the gap?”
57. **CHASE (2040):** *(looks at the two of them)* “…Apparently, me.”
58. **LUKA:** “Why not bring your Luka?”
59. **\[CLOSE · Chase (2040)\]** A flicker.
60. **CHASE (2040):** “He's not around.”
61. **LUKA:** “Not around where?”
62. **CHASE (2040):** “Can we do this later?”
63. **LUKE:** *(off, from the office)* “WHAT WAS THAT?”
64. **CHASE (2040):** “Backroom. ^ Now.”
65. *As they move, Chase scoops one of the broken security tethers off the floor and shoves it in his back pocket. Nobody comments. (Chekhov's tether, used in 3.4.) If the player later examines it in the inventory: “A display tether. Not sure why I took it. ^ Felt right.”*

### 1.3 — “Before Lunch”

**Set:** reddy26 · **Time card:** 12:01 · **Playable:** Luka ⇄ Chase (SWAP tutorial) · **Music:** a tense, bouncy synth loop under the alarms · **HUD:** none

**Cutscene — setup (short).** In the backroom, Chase (2040) pulls the **Remote** from his coat: a cream phone receiver gaffer-taped to a display Neural Chip, a coil of 2040 cable, and a jack that fits nothing in 2026.

- **CHASE (2040):** “The machine's in the backroom. ^ In 2040. This is the other end. It needs a landline and someone with steady hands.”
- **CHASE:** “You've got hands.”
- **CHASE (2040):** *(holding up his scarred right hand)* “I've got hand.”
- **CHASE:** “…What happened?”
- **CHASE (2040):** “Later.”
- *(Through the backroom door window, Luke has come out of his office and is staring at the wreck. He turns toward the corridor.)*
- **CHASE (2040):** “Someone has to keep him out of here.”
- *(Luka and Chase look at each other.)*
- **LUKA:** “…I'll do it.”

**▶ PLAY — “Call 2040.”** The scene alternates between two characters and teaches SWAP (Tab / Y / SWAP button). The objective panel shows both:

- ☐ *Luka:* Stall Luke
- ☐ *Chase:* Wire the Remote into the backroom phone

The first time the player needs to swap, show a small prompt: “SWAP — Tab”. From then on they swap freely. If they leave one side idle too long, that side's state drifts (Luke's suspicion rises on its own; the wiring doesn't), which nudges them to alternate.

*Stall Luke* (mini-game **Stall**, see 9.2). In the corridor. Luke has a SUSPICION meter. Each round he asks something; Luka picks one of three answers. All of them are bad; some are worse. Three rounds, then Luke's distracted by the alarms. Swap to Chase. Then two more rounds. If SUSPICION fills, Luke gets to the backroom door, opens it, sees the trench coat, says “…Who's that?”, Luka says “Chase's uncle,” and the round restarts with the meter at half. You can't fail permanently.

Script for the rounds (each line is final; the bold option is the “best” one and lowers suspicion; the others raise it with their own replies):

- **Round 1. LUKE:** “What was that bang?”
  - “Christmas.” → **LUKE:** “Christmas doesn't bang.” (+)
  - **“The display.”** → **LUKE:** “The DISPLAY banged?” **LUKA:** “Bit.” (−)
  - “What bang?” → **LUKE:** “The one that blew the doors open.” **LUKA:** “…Christmas.” (++)
- **Round 2. LUKE:** “Why is there smoke?”
  - **“New displays smoke. When they're new.”** → **LUKE:** “…Do they?” **LUKA:** “Brand new.” (−)
  - “What smoke?” → **LUKE:** “THAT smoke.” (++)
  - “Jordan did it.” → **JORDAN:** *(off)* “I was up a LADDER.” (+)
- **Round 3. LUKE:** “Where's Chase?”
  - **“Toilet.”** → **LUKE:** “During an explosion?” **LUKA:** “Especially during an explosion.” (−)
  - “Lunch.” → **LUKE:** “It's twelve.” **LUKA:** “Early lunch.” (+)
  - “What Chase?” → **LUKE:** “Luka.” (++)
- **Round 4. LUKE:** “Is there a man in a trench coat in the backroom?”
  - **“That's Chase's uncle.”** → **CHASE (2040):** *(off)* “Hi.” **LUKE:** “He looks exactly like Chase.” **LUKA:** “Genes.” (−)
  - “No.” → *(The trench coat walks past the door window.)* (++)
  - “Which man?” → (+)
- **Round 5. LUKE:** *(rubbing his eyes)* “If I open that door, am I going to have to fill out a form?”
  - **“Yes.”** → **LUKE:** “…I'll open it after lunch.” (−− and the round ends)
  - “No.” → **LUKE:** “You're lying.” (+)
  - “Several.” → **LUKE:** “…I'll open it after lunch.” (also ends)

*Sample (optional, Chase).* The display alarms are still screaming on the floor. At the backroom door's little window, a prompt: **Record? (hold YES)**. Holding for 1 s saves **Display alarm** to Chase's phone. This is the first sample and teaches recording; the HUD counter appears later, in 1.7.

*Wire the Remote* (mini-game **Wiring**, see 9.3, Rue's wiring reskinned). Top-down on the backroom wall phone's open junction box: Chase matches four coloured wires from the 2026 socket to the Remote's adapter. The 2040 cable has colours that don't exist in 2026, so Chase (2040) reads them out loud as hints (“Teal's sort of blue now. Don't ask.”). Two halves: first two wires, swap, last two wires. Done → tick.

**Cutscene — “1.3\_call.”**

1. **\[MID · the backroom\]** The three of them crowd round the wall phone. Chase (2040) dials the store's own number.
   - **CHASE (2040):** “Same number. Always has been. ^ It rings the kettle now.”
2. **\[SPLIT SCREEN\]** Left: 2026, the three of them in the backroom with the alarms muffled. Right: 2040, the same backroom, darker; four scorch marks on the ceiling; a big machine made of four display Neural Chips in cradles, a hover-scooter battery and a nest of cables; and plugged into it, a chrome **kettle** with a little screen.
3. **OPERATOR:** “You have a reverse-charge call from Chase, Optus Redcliffe, 2026. Will you accept the charges?”
4. **\[RIGHT HALF · ECU · the kettle's screen\]** The screen reads **DES**, then: **Would you like to boil? \[YES\]**. It ticks YES itself.
5. **DES:** “Tea?”
6. **\[LEFT HALF\]**
7. **CHASE:** “Why is your kettle answering the phone?”
8. **CHASE (2040):** “It's on a plan. Everything's on a plan.”
9. **LUKA:** *(glances toward the floor, where Jordan is)* “Jordan's on his own out there.”
10. **CHASE (2040):** “He'll be fine.”
11. **LUKA:** “You don't know that.”
12. **CHASE (2040):** “I do, actually. He runs the place in 2040.”
13. **LUKA:** “…Jordan?”
14. **CHASE (2040):** “He's my boss.”
15. **CHASE:** “You're still CASUAL?”
16. **CHASE (2040):** “Senior casual. ^ They made it up for me.”
17. **DES:** *(down the line)* “Tea?”
18. **LUKA:** *(twisting his lanyard)* “…We'll be back before lunch.”
19. **CHASE:** “You said that last time.”
20. **LUKA:** “I don't remember last time.”
21. **CHASE:** “Neither do I. I listened to the tape.”
22. **\[WIDE\]** White fills the frame.
23. **\[WIDE · locked, the store floor\]** Smoke over the wreck of the Hero Table, tinsel on the floor, four tethers swinging slower and slower. Luke steps out of the corridor. Jordan stands holding the ladder.
24. **LUKE:** “…Where'd they go?”
25. **JORDAN:** “…Lunch?”
26. **\[INSERT\]** The wall clock: 12:04.

### 1.4 — “All the Bulbs Are LED Now”

**Set:** reddy40 · **Time card:** Saturday 22 December 2040, 12:04 · **Playable:** Chase (Luka follows; Chase (2040) leads) · **Music:** after the arrival, a slower, dreamier variation of the store theme with a soft glassy chime layer (“2040”) · **HUD:** none

**Cutscene — “1.4\_arrival.”**

1. **\[ECU\]** The kettle's screen: **DES · Boiling…**
2. **\[WIDE · locked\]** The 2040 backroom, cramped. A white flash, smoke. Three men lie tangled on the floor in a heap of coat and polo.
3. *Stare, 2 s. The kettle clicks off.*
4. **DES:** “Tea?”
5. **CHASE:** *(from the bottom of the pile)* “…Yes, please.”
6. **\[MID\]** They untangle. Luka and Chase look round. It's the same backroom: same bench, same lost property, same corridor door. **\[TILT UP\]** The ceiling: four scorch marks now.
7. **CHASE (2040):** *(pointing at each)* “Yours. ^ Also yours. ^ That one's from Christmas. ^ Mine.”
8. **\[CLOSE · the plastic plant\]** It's in the backroom now, in a corner. Still dying.
9. **CHASE:** “Is that the same plant?”
10. **CHASE (2040):** “Nobody's brave enough to throw it out.”
11. **\[MID · the machine\]** Four display Neural Chips in tethered cradles, a hover-scooter battery, a nest of cables, the kettle wired into the middle of it.
12. **CHASE:** “You built it out of displays.”
13. **CHASE (2040):** “Some things don't change.”
14. **\[WIDE\]** Chase (2040) flicks the light switch. Nothing visibly changes.
15. **CHASE (2040):** “Not much has changed. ^ All the bulbs are LED now.”
16. **LUKA:** “Everything was already LED.”
17. **CHASE (2040):** “…Yeah. ^ It's been a slow fourteen years.”
18. **\[CLOSE · the kettle\]** **DES** glows.
19. **LUKA:** “Why's your kettle called Des?”
20. **CHASE (2040):** *(shrugs)* “Dunno. ^ Felt right.”
21. *(No one reacts. Rue players will.)*
22. *(After the cutscene, Des is a hotspot in the backroom. With Chase active: **Record? (hold YES)** saves **Kettle (“Tea?”)**. Des obligingly boils again.)*

**▶ PLAY — “Find out what's changed.”** Explore the 2040 store as Chase. Chase (2040) walks ahead and waits by the counter. Luka follows close behind Chase.

The 2040 store is the 2026 store, beat for beat, with small differences. Neural Chips sit on tiny velvet pillows in tethered cradles on the display wall (3%, 3%, 3%, 3%). AR price tags are blank to Chase. A big screen reads THE YES OF YOU — NEURAL CHIP 9. A hover-trolley floats a foot off the ground with a sign reading CAUTION: TROLLEY. SafeSense posters say ARE YOU SURE YOU'RE SURE? STAY SAFE THIS CHRISTMAS. A few customers stand still with blue lights behind their ears, staring at nothing.

**Examine lines** (Chase unless marked):

- *Neural Chip display:* “They're chips. On little pillows. ^ On 3%. How is a chip on 3%?” **CHASE (2040):** “Nobody knows.”
- *Queue machine:* “Now serving: 000. ^ Fourteen years.”
- *Noticeboard:* the yellowed flyer, same pin. “LANYARD REQUESTS: please allow 6–8 weeks.” **CHASE:** “It's the same piece of paper.”
- *Plastic Christmas tree (on the floor):* “Same tree.” **LUKA:** “Same tree.”
- *Price tags:* “They're blank.” **CHASE (2040):** “They're in the chip. Nobody prints anything anymore.”
- *A waiting chair with a brass plaque:* **MARGARET'S CHAIR · Reserved since it was a video shop.** **CHASE:** “…She still comes in?” **CHASE (2040):** “Every Tuesday. ^ She waits.”
- *The Wall (2040):* the 1987 Polaroid, the PUDDING cassette, a Christmas wreath hung over something rectangular. “Someone's hung that very carefully.” *(If the player tries to lift it:)* **CHASE (2040):** “Leave it, mate.”
- *Hover-trolley:* “It's a trolley. It hovers. ^ About a foot.”
- *Customer staring at nothing:* “Hello?” *(No answer. She's somewhere else entirely.)*
- *Luke's old office door:* **JORDAN — MANAGER.** Under it, in biro: **KNOCK. PLEASE.** Under that: **ESPECIALLY CHASE.**

**Meeting Jordan (2040).** When Chase reaches the counter:

- **JORDAN:** “Chase! You're forty minutes late— ^ who's this?”
- **CHASE (2040):** “…My nephew.”
- **JORDAN:** “He looks exactly like you.”
- **CHASE (2040):** “Genes.”
- *(Jordan looks past them at Luka, and goes pale.)*
- **JORDAN:** “And that's—”
- **CHASE (2040):** *(stepping between them)* “His mate.”
- **JORDAN:** “He looks like—”
- **CHASE (2040):** “Lots of people do.”
- *(Jordan takes Chase (2040) aside. Quietly, while Luka and Chase pretend to look at chips:)*
- **JORDAN:** “Are you all right? It's nearly the—”
- **CHASE (2040):** “I know.”
- **JORDAN:** “You can take Monday.”
- **CHASE (2040):** “I'm fine.”
- **CHASE:** *(to Luka, low)* “Where's his Luka?”
- **LUKA:** “He said not around.”
- **CHASE:** “Not around WHERE?”

### 1.5 — “Cred”

**Set:** reddy40 · **Time card:** 12:20 · **Playable:** Chase ⇄ Chase (2040) (Chip View introduced) · **Music:** the 2040 store theme · **HUD:** none

**Cutscene — setup.**

- **CHASE (2040):** “We need to get to the Valley by Monday. There's a lockdown on the bridge, so we need disguises, train fare, food. ^ We need cred. ^ Cred is short for credit.”
- *(Luka looks from one Chase to the other.)*
- **LUKA:** “There's two of them now.”
- **JORDAN:** *(passing)* “Chase, you're on the floor till one. ^ Customer.”

A tradie in hi-vis stomps in: JAYDEN.

- **JAYDEN:** “Need a chip swap. Got a slab to pour at one.”
- **LUKA:** *(to Chase, very quietly)* “…It's Dazza.”
- **CHASE:** “It's not Dazza.”
- **JAYDEN:** “Dad says yous can never do a swap without him ending up at the servo.”
- **CHASE:** “…It's Dazza's son.”

Chase (2040) steps up to the terminal. **\[POV · Chase (2040)'s chip view\]** The screen fills with JARVIS-style pop-ups in his eyes: **Are you sure? · Upgrade to Cloud+? · Never forget anything again! · Verify identity of customer's brain · Are you sure you're sure?** He swats at them. He freezes. **\[TOP-DOWN · Chase (2040)\]** His hands start to rise toward his head.

- **CHASE:** “…Move.”
- **CHASE (2040):** “It has to be— ^ the form has to be right first time, or—”
- **CHASE:** “Mate. Move.”

**▶ PLAY — Neural Chip Sale** (mini-game, see 9.4; Rue's JARVIS Sale reskinned for 2040). Chase runs a chip swap on a terminal that hates him: pop-ups that need dismissing in the right order, an MFA code sent to the customer's brain (which is on 3%), a progress bar that goes backwards, the name field autocorrecting JAYDEN to JADE PLANT. Jayden's thoughts leak as pop-ups (THOUGHT: is this taking long; THOUGHT: I'm hungry; THOUGHT: he's good). It's hard, but Chase is good at this, and the mini-game should make the player feel that.

**Chip View tutorial (mid-game).** Halfway through, the terminal asks for a “verbal consent phrase” shown only in AR, and Chase can't see it. The game prompts: **“SWAP to Chase (2040), then hold CHIP (Q / LB / the CHIP button).”** The screen tints slightly blue and AR appears: the phrase floating over Jayden's head reads I SAY YES TO MY CHIP, beside a thought bubble (THOUGHT: is this taking long). **CHASE (2040):** “'I say yes to my chip.'” Jayden repeats it. SWAP back to Chase to finish the sale. *(Chip View rules are in 13.5.)*

**Cutscene — after the sale.**

- **JAYDEN:** “Done? ^ Already?” ^ “Dad's going to be filthy.” *(He leaves happy.)*
- **JORDAN:** *(who's been watching from the office door)* “He's good.”
- **CHASE (2040):** *(quietly)* “…He's very good.”
- **JORDAN:** *(handing Chase (2040) a little glowing card)* “Christmas bonus. Early. Don't spend it on cables.”
- *(Chase (2040) looks at the card, then at his younger self. For a second he looks like someone who's found an old photo of himself.)*
- **LUKA:** *(gently, to Chase (2040))* “You all right?”
- **CHASE (2040):** “Yeah. ^ I used to be quick.”

### 1.6 — “Safety Address”

**Set:** reddy40 · **Time card:** 13:00 · **Playable:** Luka ⇄ Chase ⇄ Chase (2040) in the escape · **Music:** silence for the address; then a tense stealth loop · **HUD:** appears: top-right, **NO SERVICE** (the boys' 2026 phones) and a countdown **QUIET IN 46:58:00**

**Cutscene — the address.**

1. **\[WIDE · the store floor\]** Every screen in the store blinks to the same image. Every customer's chip light pulses. They stop and look up at nothing. Jordan stops. Even the hover-trolley settles.
2. **\[MID · the big screen\]** A silhouette at a desk in front of a glass wall; the Valley's dimmed neon behind; drones like fireflies; a storm in the sky. *(Hint 1, second time:)* Before speaking, the silhouette glances to his left. Then forward.
3. **THE MANAGER:** “Good afternoon, Australia. ^ I know it's been a hard year. It's always a hard year.” ^ “Every day, I watch you hurt each other. Down every line. In every message. In every call you wait for that never comes.” ^ “So this Christmas, I'm giving you something you haven't had in a very long time.” ^ “Quiet.” ^ “On Monday at 11:58, every Neural Chip in the country will receive one final update. No more calls. No more messages. No more waiting.” ^ “Nobody will be able to hurt you again.” ^ “You don't need to do anything. It's already done.” ^ “Merry Christmas. Stay safe.”
4. **\[PAN · across the store\]** Customers applaud politely and blankly. One old man near Margaret's chair cries quietly with a smile on his face. Jordan doesn't clap.
5. **\[TWO-SHOT · Luka and Chase, the only faces without chip lights\]**
6. **CHASE:** “That's Luke.”
7. **LUKA:** “That's not Luke.”
8. **CHASE:** “'Stay safe.' That's EXACTLY what Luke says.”
9. **LUKA:** “Luke says 'don't be late'.”
10. **CHASE:** “Because being late is UNSAFE.”
11. **CHASE (2040):** “It's not Luke.”
12. **CHASE:** “How do you know?”
13. **CHASE (2040):** “Because Luke would've said 'don't be late'.”
14. **LUKA:** “What happens on Monday? Actually.”
15. **CHASE (2040):** “Everything runs on the chips now. Cars. Lights. Hospitals. Your fridge. ^ 'Quiet' means off. Everyone opted out. Of everything. ^ Of each other.”
16. **LUKA:** “So we stop him.”
17. **CHASE (2040):** “That's why you're here.”
18. **\[WIDE\]** The front doors lock with a soft clunk. A gentle chime. Three white **Courtesy Drones** float in through the entrance, blue lights scanning.
19. **DRONE:** “Hello! A temporal anomaly was detected in this store fifty-six minutes ago. ^ We came as soon as it was safe. ^ For your safety, please remain where you are.”
20. **CHASE (2040):** “That's us.”
21. **JORDAN:** *(stepping close to Chase (2040), not looking at him, very quietly)* “Back door. ^ Go. ^ I didn't see you.”

**▶ PLAY — “Get out the back.”** The drone stealth tutorial (system in 9.5).

- *Rules shown once, small and diegetic:* drones show a scan cone on the floor (soft blue). If you stand in it, it turns amber and the drone turns toward you; stay in it and it turns red, and you're “escorted”.
- *Fail state:* the **Safe Room** (see 13.7). Retry puts you back at the last zone camera with drones reset.
- *Route:* shop floor → staff corridor → backroom → back car park through the roller door.
- *Puzzle (needs both):*
  - **The lure.** A drone parks in the corridor, facing the backroom. **Chase** can play a sample from his phone through the store's old counter speaker (interact with the speaker: choose a sample; he has whatever he's recorded so far: DISPLAY ALARM from 1.3 and KETTLE from 1.4, with STORE RADIO as a fallback if he has neither). The drone floats to the sound.
  - **The zap.** In the staff corridor two drones cross paths. Luka, watching their cones, whispers to Chase: “Go left—” Chase goes left, straight into the edge of a drone's courtesy field. *ZAP* (a harmless static discharge). **DRONE:** “Static discharge! ^ For your safety!” Chase's hair stands on end and one fingertip smokes a little. **CHASE:** “I'm fine.” **LUKA:** “You're smoking.” **CHASE:** “It's a little bit of smoke.” *(Luka's face. He said go left. This is scripted, plays once, and is not a fail.)*
  - **The roller door.** The back **roller door** is jammed half-shut. Only **Luka** can lift it (hold YES; a strain meter). It only stays up while he holds it, so Chase and Chase (2040) go under first, and then Luka has to let go and roll under before it slams. *(Small timing beat. The first time Luka strains at the door:)* **CHASE (2040):** “Let me—” **LUKA:** “I've got it.”
  - **The chip.** In the car park a drone tower pings for chip signals. A prompt over Chase (2040): **Switch chip off? \[YES\] \[NO\].** NO → **SAFESENSE:** “Signal detected. Hello, Chase!” and the drones turn (soft fail). YES → his light goes dark. **CHASE (2040):** “Aeroplane mode. ^ For the brain.” *(He immediately walks into a pole.)* **CHASE (2040):** “…I can't see anything. Everything's in the chip. ^ I don't know where the car park ENDS.”
- **Exit:** the car park gate onto Redcliffe Parade.

### 1.7 — “One Foot Off the Ground”

**Set:** parade (Redcliffe Parade, the jetty, Suttons Beach foreshore) · **Time card:** 13:40 · **Playable:** Luka ⇄ Chase (Chase (2040) follows, chip off) · **Music:** a sunny, slightly off-kilter seaside theme with the glassy 2040 layer; cicadas · **HUD:** NO SERVICE · QUIET IN 46:18:00 · Samples (count)

**Cutscene — “1.7\_crane.”**

1. **\[CRANE · down out of a blazing sky\]** Redcliffe, 2040. The jetty stretches into a flat blue bay. Christmas lights wrapped round the palm trunks. Hover-cars glide along the Parade about a foot off the bitumen. People with blue lights behind their ears. A lifeguard drone hovers over Suttons Beach. Pelicans, unchanged.
2. **LIFEGUARD DRONE:** *(over a speaker, to a family in the shallows)* “Swimming is a risk. Are you sure? ^ Please exit the ocean.”
3. **\[TRACK · alongside the three of them\]** A hover-car glides past at walking pace.
4. **CHASE:** “They hover.”
5. **CHASE (2040):** “About a foot.”
6. **CHASE:** “Only a FOOT?”
7. **CHASE (2040):** “They used to do three. The Manager made it one. ^ For safety.”
8. **HOVER-CAR:** *(chirping, turning)* “Turning left. Are you sure?”
9. **\[MID · a bronze plaque on the foreshore: BRISBANE 2032\]**
10. **CHASE:** “Did we win?”
11. **CHASE (2040):** “We hosted.”
12. **\[POV · Chase (2040)'s chip view, one second\]** He switches his chip on to check the time. The Parade explodes with AR: signs, prices, and over everything a billboard the size of a building: **OPTUS CLOUD+ · NEVER FORGET ANYTHING AGAIN · $14.99/month.** A pop-up: *Signal detected.* He switches it off. The Parade is plain again.
13. **CHASE (2040):** “Twenty to two.”

**▶ PLAY — “Get to Chase's flat before dark.”** A free roam along the Parade with gentle drone patrols. Chase (2040)'s flat is at the far end, above the fish-and-chip shop. Zones have fixed cameras: the Parade footpath, the jetty entrance, the foreshore park, the laneway behind the shops.

*Samples (optional; see 13.6).* With Chase active, interact with a sound source and hold YES for 1 s to record:

- **Hover hum** — a parked hover-car idling.
- **Bay** — waves under the jetty, with a pelican's bill-clack.
- **Chip chime** — a SafeSense pop-up chime from a public kiosk.

*Small human moments (optional, one line each, world-building the Quiet).* Each is a person with one exchange:

- *A man alone at the end of the jetty:* “Haven't had a call in four years. ^ Do Not Disturb. For safety. ^ I forget why.”
- *A kid at the skate bowl with no skateboard:* “Confiscated. ^ I'm practising standing on it.”
- *A woman at the fish-and-chip window:* “I tried to message my sister. It said it might upset her. ^ It was 'Merry Christmas'.”
- *A SafeSense kiosk:* “Feeling lonely? Have you tried being safe?”

*Examine lines:* blank AR signs everywhere (“That sign's blank.” **CHASE (2040):** “It says 'Welcome to Redcliffe'. And an ad for teeth.”); the Christmas tree in the park wrapped in bubble wrap (“They've bubble-wrapped Christmas.”); a padded bollard (“It's soft. The bollard's soft.”).

*Cloud+ ad plant:* the billboard in the crane cutscene (step 12) is required viewing. It matters at the end. More Cloud+ ads appear whenever the player uses Chip View for the rest of the game.

*Exit:* the door beside the fish-and-chip shop. Dusk. Cut.

### 1.8 — “Order of Service”

**Set:** flat (Chase (2040)'s flat) · **Time card:** 19:40 · **Playable:** Luka ⇄ Chase · **Music:** none; a fridge hum, the Parade outside, Christmas lights blinking on the balcony · **HUD:** QUIET IN 40:18:00

**Cutscene — arrival (short).** A tiny one-bedroom above a fish-and-chip shop. Sticky notes everywhere. A keyboard under a sheet. A dying plant (a different one). A kettle that does not talk. A couch. A balcony with blinking Christmas lights.

- **CHASE (2040):** “I'll get chips. ^ Don't touch anything.”
- *(He goes downstairs.)*
- **CHASE:** “We're going to touch everything.”
- **LUKA:** “Obviously.”

**▶ PLAY — “Look around.”** A small free roam.

- *Sticky note wall (Chase):* hundreds of notes, all about one song. **two — bridge?? · two — 2nd verse too long · two — make it better · two — NOT YET · two — for L.** **CHASE:** “…It's all one song.”
- *Keyboard under the sheet:* dusty. “Hasn't been played in years.” *(If Chase lifts the sheet, the keys have a thin grey line where a hand used to rest.)*
- *Bookshelf:* a row of identical notebooks labelled two 1, two 2 … two 31.
- *Balcony:* the bay at dusk, the Ted Smout Bridge lit far off to the right, drone lights blinking along it. “That's the bridge.”
- *The fridge (Luka):* magnets, a takeaway menu, and a folded piece of card under a pelican magnet. → Triggers the cutscene.

**Cutscene — “1.8\_order.”**

1. **\[INSERT · Luka's hands\]** He slides the card out from under the magnet and opens it. An order of service: *Celebrating the life of* **LUKA** · *“I'll do it.”* · *Redcliffe · January 2035.* A photo of an older Luka laughing at something off-frame.
2. **\[CLOSE · Luka, locked\]** No music. The fridge hums. He doesn't move.
3. **\[WIDE\]** Chase looks up from the sticky notes. Sees Luka's stillness.
4. **CHASE:** “What's that?”
5. *(Luka doesn't answer. Chase comes over. Reads it over Luka's shoulder.)*
6. **\[CLOSE · Chase\]** His face.
7. **\[WIDE · the doorway\]** Chase (2040) comes in with a paper parcel of fish and chips and sees them. He stops.
8. *Stare, 3 s.*
9. **CHASE (2040):** “…I was going to tell you.”
10. **LUKA:** “When?”
11. **CHASE (2040):** “After.”
12. **CHASE:** “After WHAT?”
13. **CHASE (2040):** “After you'd helped. ^ I didn't think you'd come if you knew.”
14. **LUKA:** *(quiet)* “How?”
15. **CHASE (2040):** “Fire. Data centre at Murarrie. Six years ago Monday.” ^ “You went back in.”
16. **LUKA:** “…For who?”
17. **CHASE (2040):** “Everyone else.”
18. **LUKA:** “Did I get them out?”
19. **CHASE (2040):** “Everyone.” ^ “Everyone but you.”
20. **\[WIDE · locked\]** The three of them in the tiny kitchen. The parcel of chips going cold on the bench. The Christmas lights blink on the balcony.
21. **CHASE:** “That's what 'not around' means.”
22. **CHASE (2040):** “Yeah.”
23. **LUKA:** *(reading the card again)* “…'I'll do it.'”
24. **CHASE (2040):** “You said it all the time. Drove everyone mad.”
25. **\[INSERT\]** Luka folds the card carefully, slides it back under the pelican magnet, and straightens it by one millimetre.
26. **LUKA:** “…Chips are getting cold.”
27. **\[WIDE · exterior, from the Parade, looking up at the window\]** Three figures at a small table, eating in silence. A hover-car glides past a foot off the road. Its indicator chirps: “Are you sure?”
28. Title: **END OF ACT ONE.**

## ACT TWO — Are You Sure You're Sure?

*Act card over black, 3 s.*

### 2.1 — “Senior Casual”

**Set:** flat · **Time card:** Sunday 23 December 2040, 4:52 am · **Playable:** Chase, then Luka · **Music:** none at first; birds, the bay; later a soft piano-less version of the “two” motif (pads only) · **HUD:** QUIET IN 31:06:00

**Cutscene — dawn.**

1. **\[WIDE · from inside, through the balcony door\]** Pink-grey dawn over the bay. Storm clouds sit far out on the horizon. On the balcony, Luka is polishing the railing with a tea towel. Slowly. Thoroughly. He hasn't slept.
2. **\[CLOSE · Chase on the couch\]** He wakes, sees Luka through the glass, and watches him for a while.
3. *Control to Chase.*

**▶ PLAY — “Look around (quietly).”** Chase (2040) is asleep in the bedroom, door ajar, snoring softly.

- *The music slate on the desk (Chase):* a thin glass tablet. One folder: **two**. Inside: **2,847 items.** The insert scrolls: two\_v1.wav, two\_v2\_FINAL.wav, two\_v2\_FINAL\_real.wav, two\_v3\_bridge\_idea.wav … two\_v1204\_dont.wav … two\_v2847.wav. **CHASE:** “Two thousand eight hundred and forty-seven.” ^ “He's still on the bridge.”
- *A framed photo on the shelf:* Chase (2040) and Luka (older), 2031, behind a festival barrier the afternoon before the gig, Luka wearing Chase's ARTIST lanyard as a joke. **CHASE:** “Redcliffe Festival. 2031.”
- *Kettle (save):* “Put the kettle on? \[YES\] \[NO\]” — this kettle doesn't talk. **CHASE:** “Normal kettle. ^ Weird.”
- When Chase reaches for the slate's play button → cutscene.

**Cutscene — “2.1\_dont.”**

1. **\[MID · the bedroom doorway\]** Chase (2040), awake, in a T-shirt, hair everywhere.
2. **CHASE (2040):** “Don't.”
3. **CHASE:** “It's my song.”
4. **CHASE (2040):** “It's MY song.”
5. **CHASE:** “It's literally the same song.”
6. **CHASE (2040):** “It's not ready.”
7. **CHASE:** “It's been fourteen years.”
8. **CHASE (2040):** “It had to be good.”
9. **CHASE:** “Good enough for WHAT?”
10. **\[CLOSE · Chase (2040)\]** He looks past Chase, through the glass, at Luka on the balcony polishing the rail.
11. **CHASE (2040):** “…For him.”
12. *(Chase follows his look. He understands. He puts the slate down.)*
13. **\[INSERT\]** Chase (2040)'s right hand on the doorframe: the burn scars.
14. **CHASE:** “What happened to your hand?”
15. **CHASE (2040):** “Pulled a server out of a fire.” ^ “It's why I stopped playing.”
16. **CHASE:** “Is it?”
17. **CHASE (2040):** *(a long beat)* “…No.”

**Cutscene — “2.1\_balcony.”** Chase goes out with two teas. One locked two-shot, side-on, the bay behind them, the railing between them and the drop. Luka keeps polishing for the first few lines.

- **CHASE:** “Did you sleep?”
- **LUKA:** “Bit. You?”
- **CHASE:** “Bit.” *(Neither of them did.)*
- **LUKA:** “I keep doing the maths.”
- **CHASE:** “What maths?”
- **LUKA:** “Yesterday I said 'just say yes', and a man exploded out of a display I'd polished for two hours.”
- **CHASE:** “That's on him.”
- **LUKA:** “I said 'go left', and you got zapped.”
- **CHASE:** “It was a little bit of smoke.”
- **LUKA:** “And then he told me I go back into a fire, and you end up with that hand.”
- **CHASE:** “That's not—”
- **LUKA:** “Every version where I'm the one making the call, someone I care about gets hurt.”
- **CHASE:** “Mate. ^ That's just what being the one who makes the call is.”
- **LUKA:** “Then maybe I shouldn't be the one.”
- *(He stops polishing. Looks at the tea towel in his hand like he's only just noticed it.)*
- **CHASE:** “You're polishing a balcony.”
- **LUKA:** “It was dirty.”
- **CHASE:** “It's a balcony.”

**Cutscene — “2.1\_plan.”** Toast at the small table, in Rue's tradition. Chase (2040) lays it out with sticky notes on the table, one per step.

- **CHASE (2040):** “Three things. ^ One: get off the peninsula. There's a lockdown on the bridge since yesterday, because of us. ^ Two: get to the Valley by tomorrow morning. ^ Three: get into HQ without him seeing.”
- **LUKA:** “Is there a way?”
- **CHASE (2040):** “There's a phone. The oldest working line in the country. It's from 1987. JARVIS can't touch it. He can't touch it.”
- **CHASE:** “…Rue's phone.”
- **CHASE (2040):** “Rue's phone.”
- **CHASE:** “So we ask Rue.”
- **CHASE (2040):** “…You ask Rue.”
- **CHASE:** “Why us?”
- **CHASE (2040):** “Because I haven't rung him in six years.”
- **LUKA:** “And me? People here knew me.”
- **CHASE (2040):** “You need a disguise.”

**▶ PLAY — “Find Luka a disguise.”** *(Control to Luka.)* A box of Christmas decorations under the bed. Inside: tinsel, a broken angel, sunglasses, a Santa hat with a fake white beard on elastic. Luka puts on the hat and the beard, **over his real beard**.

- **\[MID · Luka turns round\]**
- **CHASE:** “You've got a beard over your beard.”
- **LUKA:** “It's a disguise.”
- **CHASE (2040):** “It's Christmas. ^ Nobody looks at Santa.”
- *(Luka in the Santa beard is his model for the rest of Act Two and into 3.1. It slips when he talks too fast, and he pushes it back up. Use this sparingly as a visual gag.)*

### 2.2 — “Bee Gees Way”

**Set:** parade (the laneway) · **Time card:** 07:30 · **Playable:** all three (SWAP cycles Luka → Chase → Chase (2040)) · **Music:** cicadas, distant hover traffic; then the piano · **HUD:** QUIET IN 28:28:00 · Samples

*Bee Gees Way: a narrow laneway off Redcliffe Parade, its walls covered in a mural and photographs, with life-size bronze statues of three brothers at the end. (Use the place; don't reproduce any of their songs, lyrics or likenesses in detail. The statues are generic bronze figures of three young men with guitars.) In 2040 a public piano stands in the middle of the lane, fitted with a SafeSense box on its side: MAX 40 dB. A Courtesy Drone hovers at the far end of the lane by the exit, facing in.*

**Cutscene — “2.2\_lane.”**

- **\[TRACK · behind the three of them entering the lane\]** The statues at the end.
- **CHASE:** “Who are they?”
- **CHASE (2040):** “Three brothers. Started here. Sang at the speedway for coins.”
- **CHASE:** “And then?”
- **CHASE (2040):** “And then they finished songs. ^ Hundreds of them.”
- **DRONE:** *(at the end of the lane)* “Good morning! This lane is closed for your safety.”

**▶ PLAY — “Get past the drone.” (Public Piano puzzle, needs all three.)**

1. **The limiter.** The piano's 40 dB box is locked. **Chase (2040)** with his chip briefly on (Chip View; see 13.5 for the Signal meter) can read the AR maintenance tag floating above the box: **SERVICE CODE 2032** (“Olympics. Everything's 2032.”). The physical keypad is under a heavy brass plate bolted on with a hinge. Only **Luka** can lift it (strength). Then whoever's active types 2032. The limiter light goes from red to green.
2. **The melody.** **Chase** sits at the piano (mini-game **Public Piano**, 9.6): a simple 4-bar call-and-response. Chase plays the first phrase of “two” (shown as falling notes; the player hits them in time). The sound is loud now; the drone turns and floats toward the piano: “Excuse me! That's quite loud!”
3. **The sneak.** While the drone hovers over the piano, **Luka** and **Chase (2040)** slip past to the exit (swap to each and walk them through; the drone's cone is pointed at the piano). Then Chase stops playing and walks out behind them. If he stops too early, the drone turns back.

**Cutscene — “2.2\_piano”** (triggers when Chase first finishes the phrase, before the sneak; the drone is still drifting toward the piano):

1. Chase keeps playing past the phrase into the rest of “two” as far as he's written it: verse, chorus, second verse. Then it **stops dead** where the bridge should be.
2. **\[CLOSE · Chase (2040), at the edge of the lane\]** He's gone very still.
3. **CHASE (2040):** “Where'd you get that?”
4. **CHASE:** “It's track two. I've been working on it since October.”
5. **CHASE (2040):** “I know.” ^ “I'm still working on it.”
6. **\[TWO-SHOT · the two Chases\]** Chase (2040) sits down on the other end of the piano bench. Mirror composition: the same posture, the same slumped shoulders, fourteen years apart.
7. **CHASE:** “It's the bridge. The second verse goes into the bridge and it's—”
8. **CHASE and CHASE (2040):** *(together)* “—not right.”
9. *(Beat.)*
10. **CHASE:** “Why don't you just finish it?”
11. **CHASE (2040):** “Why don't YOU?”
12. *(Chase looks at the keys. A long pause, 3 s.)*
13. **CHASE:** “…Because if I finish it and it's bad, that's it. That's what I am. ^ As long as it's not finished, it could still be good.”
14. **CHASE (2040):** “Yeah.” ^ “I've been 'could still be good' for fourteen years.” ^ “It's not good. It's just not finished.”
15. **CHASE:** “Did you ever play it? Anywhere?”
16. **CHASE (2040):** “2031. Redcliffe Festival. Pudding was on the bill. Ten past four, the little stage by the jetty.” ^ “I pulled out the night before.”
17. **CHASE:** “Why?”
18. **CHASE (2040):** “The bridge wasn't right.”
19. **CHASE:** “You cancelled a GIG because of a BRIDGE?”
20. **CHASE (2040):** *(looking down the lane toward the bay, where the Ted Smout Bridge is visible on the horizon)* “…I cancel everything because of a bridge.”
21. **LUKA:** *(hissing from behind the piano, through the Santa beard)* “Can the bridge talk happen on the other side of the drone?”
22. *Back to play for the sneak.*

**Samples here:** **Piano** (Chase records a chord from the public piano after the limiter is off) and **Cicadas** (the laneway's palm tree).

### 2.3 — “The Bench”

**Set:** parade (Woody Point foreshore: a grassy headland, a path, a bench facing the bay and the Ted Smout Bridge in the distance) · **Time card:** 08:40 · **Playable:** Luka · **Music:** none; wind, water, a single distant bell buoy · **HUD:** QUIET IN 27:18:00

**Cutscene — “2.3\_path.”**

1. **\[WIDE · locked, long lens\]** The three of them walking along the foreshore path. Chase (2040) slows, then stops where the path meets the grass.
2. **CHASE (2040):** “…I don't come here.”
3. **CHASE:** “Where is here?”
4. *(Chase (2040) nods at the bench. Doesn't move.)*
5. *Control to Luka.*

**▶ PLAY — “Go and look.”** Luka (in the Santa hat and beard) walks to the bench. The camera is a single fixed wide from behind the bench, looking out over the bay. The bench is old timber with a brass plaque. As Luka gets closer the camera cuts to a closer angle.

- *Examine the plaque:* **\[INSERT\]** **IN MEMORY OF LUKA · 2IC · “I'll do it.” · He was the one who could.**
- *Examine the bench (Hint 2):* **\[INSERT · Luka's finger running along the top rail\]** It's polished to a mirror shine. Not a grain of salt or dust. Fresh frangipani lying on the seat. **LUKA:** “Someone's done a good job.”
- *Prompt:* **Sit down? \[YES\] \[NO\].** NO → **LUKA:** “…Yeah. In a sec.” (The prompt comes back. The only way on is to sit.)

**Cutscene — “2.3\_bench.”**

1. **\[MID · from the front\]** Luka sits on his own memorial bench. He pulls the Santa beard down under his chin.
2. **LUKA:** “Bit weird. ^ Sitting on yourself.”
3. **\[WIDE\]** Chase comes and sits next to him.
4. **CHASE:** “Good bench, though.”
5. **LUKA:** *(after a moment)* “…Yeah. ^ It is.”
6. **\[WIDE · locked, from behind the bench, the bay and the bridge ahead\]** The two of them. Behind, on the path, Chase (2040) stands holding his own elbow.
7. *Hold 3 s.*
8. Chase (2040) walks over, slowly, and sits on Luka's other side. **Three on the bench.** (Rue's three-shot, now in daylight.)
9. **CHASE (2040):** “Six years tomorrow.”
10. **LUKA:** “Tell me.”
11. **CHASE (2040):** “It was a Sunday. Christmas Eve. Storm coming in off the bay.” ^ “You rang me at six in the morning. 'Can you come in? Need to get the servers out before it hits. I'll do it, I just need another pair of hands.'”
12. **LUKA:** “…I rang you.”
13. **CHASE (2040):** “Lightning hit the substation at twenty to eleven. The whole place went up.” ^ “You got me out first. Dragged me out by the lanyard.” *(He touches the scorch mark on his lanyard strap.)* “Then you looked back at the door. Four people still in there. And you said—”
14. **LUKA:** *(quietly)* “'I'll do it.'”
15. **CHASE (2040):** “'I'll do it.'” ^ “You got all four out. ^ Then the roof came down.”
16. *(Silence. Water. The bell buoy.)*
17. **LUKA:** “I rang you.”
18. **CHASE:** “Luka—”
19. **LUKA:** “I rang you and asked you to come in, and you got hurt.”
20. **CHASE (2040):** “I got a hand. ^ You got a bench.”
21. **CHASE:** “What was the funeral like?”
22. **CHASE (2040):** “Half of Redcliffe. Margaret came in a wheelchair.” ^ “I wrote your eulogy forty-one times. Never got it right. On the day, I stood up there for four minutes and didn't say anything. ^ Then I sat down.”
23. **CHASE:** “…What would you have said?”
24. **CHASE (2040):** *(a long beat, 3 s)* “…Doesn't matter now.”
25. **\[CLOSE · Chase (2040)\]** He takes out his music slate, taps it, and holds it up between them. A voicemail greeting plays, and it's **Past Luka's actual voice**, tinny:
26. **LUKA'S VOICEMAIL:** “Hey, it's Luka. I'm probably at work. Leave a message. ^ Chase, if it's you, I'm not doing your shift.”
27. **LUKA:** “…I recorded that last week.”
28. **CHASE (2040):** “I've listened to it about four thousand times.”
29. *(Chase laughs. Chase (2040) laughs. Luka doesn't.)*
30. **CHASE (2040):** “Kept paying for your number. Thirty-five dollars a month. ^ JARVIS still sends codes to it. Bug off the old list.”
31. **LUKA:** “'Sends MFA codes to dead phones.'”
32. **CHASE (2040):** “That's how I found out about Monday. A login code came through for an account I didn't have. Called QUIET. ^ So I logged in.” *(Hint 3. Nobody reacts to it.)*
33. **LUKA:** *(after a while)* “What was I like? ^ After I got promoted. Before.”
34. **CHASE (2040):** “Careful.” ^ “You got so careful.”
35. **\[WIDE · locked, behind the bench\]** The three of them looking at the bay, the bridge on the horizon, storm clouds building behind it. *Hold 3 s.*
36. **LUKA:** *(pulling the Santa beard back up)* “Right. ^ Rue.”

### 2.4 — “Every Sunday”

**Set:** rue\_house (an old Queenslander on stilts at Scarborough: wide verandah, frangipani, louvres, a view of Moreton Bay; a small brass bell hangs by the front door) · **Time card:** 10:30 · **Playable:** Chase (Luka follows; Chase (2040) waits at the front gate) · **Music:** inside, Rue's Walkman plays the 1987 Pudding song very quietly through its little speaker, then stops · **HUD:** QUIET IN 25:28:00

**This is Rue's only appearance in the game.**

**▶ PLAY — “Knock.”** Chase walks up the front stairs (Luka behind him). Chase (2040) stops at the gate and won't come in: **CHASE (2040):** “I'll wait here.” Interacting with him again: “I'll wait here.” Ring the little brass bell by the door → cutscene.

**Cutscene — “2.4\_door.”**

1. **\[MID · the door opens\]** RUE, 72, in a cardigan in the heat, reading glasses on his head, the brick phone in his cardigan pocket. He looks at Chase. At Luka. For a long time. *(3 s.)*
2. **RUE:** “…Lads.”
3. **\[CLOSE · Rue\]** His eyes go to Luka's Santa beard.
4. **RUE:** “That's a terrible beard.”
5. **LUKA:** “It's a disguise.”
6. **RUE:** “It's over your beard.”
7. **LUKA:** “That's the disguise.”
8. **RUE:** “Tea?”
9. **CHASE:** “…Yes, please.”

**▶ PLAY — Rue's front room.** A short explore while Rue makes tea (he's slow now; let him be). Rue's lines play when the player examines things near him.

- *The 1987 Polaroid on the mantel (a copy):* **RUE:** “I had a copy made before I gave yous the real one. ^ Des took it.”
- *A wall calendar, actually a corkboard of eight years of calendar pages:* every Sunday from late 2026 to December 2034 has a tick and the word **LADS**. After December 2034, blank. **CHASE:** “…Every Sunday.”
- *The Walkman:* a cassette inside labelled **PUDDING (COPY 4)**. **RUE:** “Fourth copy. I wore the others out. ^ Still the only song I listen to. It's got a kettle in it.”
- *A framed Optus Christmas card, 2036, signed by “The Board”:* **RUE:** “Year before they let me go. ^ 'Let me go.' Lovely way to put it.”
- *A biscuit tin (Arnott's-style, generic):* see below.
- *Kettle (save):* **RUE:** “Put the kettle on? ^ I've just put it on. You can put it on again.”

**Cutscene — “2.4\_tea.”** Front room, three in armchairs (Chase (2040) still out at the gate, visible through the louvres).

1. **RUE:** “You're from before.” ^ “How long before?”
2. **CHASE:** “Christmas '26.”
3. **RUE:** “…The two days.” ^ “You went missing at Christmas. Luke rang me in a state. I told him not to worry. ^ I'd had practice.”
4. **LUKA:** “Did you know? ^ Where we went?”
5. **RUE:** “No. Thirty-nine years I knew everything that was coming for you two. Then October 2026 came, and after that I knew nothing at all.” ^ “It's been lovely.”
6. **RUE:** *(reaching for the tin)* “Pass the bics. ^ Biscuits.”
7. **\[TWO-SHOT · Luka and Chase\]** They look at each other.
8. **RUE:** “I got it from yous.”
9. **LUKA:** “Was it hard? Knowing? All that time?”
10. **RUE:** “Knowing is the heaviest thing I ever carried.” ^ “I wouldn't have put it down for anything.”
11. *(Rue looks through the louvres at the man standing at his gate.)*
12. **RUE:** “Is he coming in?”
13. **CHASE:** “He's not ready.”
14. **RUE:** “Nobody ever is.”
15. **CHASE:** “We need your phone.”
16. **RUE:** *(nodding at the brick phone on the side table)* “This line's from 1987. It's older than everything he owns. He can't see it. He can't hear it.” ^ “Yous used to ring me on it. Every Sunday. Eight years.” ^ “Then it stopped.”
17. **\[CLOSE · Rue, to Luka\]**
18. **RUE:** “I promoted you, you know. 2031. Head of Network Safety. You made every part of this company safer than it had ever been.” ^ “You never once let anyone help you carry anything. I should have seen it.” ^ “That's the trouble with people who can, Luka. They think they have to.”
19. **LUKA:** *(twisting his lanyard)* “…Yeah.”

**Cutscene — “2.4\_gate.”**

1. **\[WIDE · the front yard\]** Rue comes down the stairs, slowly, one hand on the rail. Chase (2040) stands at the gate. He can't look at him.
2. **RUE:** “Chase.”
3. **CHASE (2040):** “…Rue.”
4. **RUE:** “It rang every Sunday for eight years. Then it didn't.”
5. **CHASE (2040):** “I'm sorry.”
6. **RUE:** “I know.” ^ “I was the same, once. I'd leave before anyone could leave me. ^ Yous taught me to stay.” ^ “I'm not cross, son. I'm just old, and I missed you.”
7. **\[CLOSE · Chase (2040)\]** He breaks a little. Not much. Enough.
8. Rue holds out the brick phone (he brought it down from the side table) and puts it in Chase (2040)'s scarred hand. Closes the fingers over it.
9. **RUE:** “Bring it back.”
10. **CHASE (2040):** “I'll bring it back.”
11. **RUE:** “…Yous will.”
12. **RUE:** “There's no word for yes in Irish. Did you know that? A porter told me once. You answer with what you'll do.” ^ “Will you ring me on Sunday?”
13. **CHASE (2040):** *(a long beat)* “…I will.”
14. **\[WIDE · from the verandah\]** The three of them walk off down the street toward the water, the storm building over the bay. Rue watches them go with one hand on the rail.
15. **RUE:** *(to himself)* “Go on. ^ Yes.”

**Sample here:** **Brick phone trill.** While Rue makes the tea, he sets the brick phone down on the side table. Examine it: **RUE:** “Go on. Ring it. ^ Still works.” Chase presses its test button; the old trill; **Record? (hold YES)**. (This happens in the front-room roam, before 2.4\_tea.)

### 2.5 — “Are You Sure You're Sure?”

**Set:** bridge (Clontarf end of the Ted Smout Memorial Bridge: a checkpoint with boom gates, drone towers and a tiny booth; then the 2.7 km bridge deck over Bramble Bay to Brighton; mangroves on the far shore) · **Time card:** 13:00 · **Playable:** all three · **Music:** a twangy, tense loop for the checkpoint; for the chase, a fast chiptune version of the “two” chorus · **HUD:** QUIET IN 22:58:00 · Samples

**Cutscene — “2.5\_checkpoint.”**

1. **\[WIDE · low, the checkpoint\]** PENINSULA LOCKDOWN in red AR (Chip View only; to the boys the signs are blank). Three boom gates. Two drone towers. Courtesy Drones hover over a queue of stopped hover-cars. In a tiny booth with a desk fan and a transistor radio sits TEDDY, 84, pressing a big physical button marked **NO** every few seconds with a weary thumb.
2. **SAFESENSE:** *(from the booth speaker, to each car)* “Crossing requires human confirmation. Are you sure? ^ Are you sure you're sure?”
3. **TEDDY:** *(pressing NO)* “No. ^ Sorry.”
4. **CHASE (2040):** “There's a bug. The system needs a human to say yes before anyone crosses. So they kept one human.” ^ “That's Teddy. ^ In a lockdown, Teddy has to say no to everyone.”

**▶ PLAY — “Cross the bridge.” (Checkpoint puzzle, needs all three.)**

1. **Chip off.** On approach, Chase (2040) must switch his chip off (prompt; NO = immediate soft-fail escort). He's blind to AR for the rest of the scene.
2. **Talk to Teddy (Luka).** Luka, as Santa, at the booth window. Rue-style “Role Play” dialogue (9.7). Teddy's lonely; nobody's spoken to him in three years. Luka asks his name. Learns he needs “a reason the computer likes”. Lines:
   - **TEDDY:** “Afternoon, Santa.”
   - **LUKA:** “Afternoon. ^ What's your name?”
   - **TEDDY:** *(surprised)* “…Teddy.”
   - **LUKA:** “Luka. ^ Santa. Santa Luka.”
   - **TEDDY:** “Three years in this box and nobody's asked me my name. ^ They just look at the gate.”
   - **LUKA:** “Can you let us through?”
   - **TEDDY:** “Computer needs a reason it likes. I've tried them all. It doesn't like any of them.”
3. **Find a reason (Chase).** On the booth's side is a panel with physical reason cards in slots (a JARVIS-era backup): WORK · FAMILY · MEDICAL · LEISURE · OTHER. Chase can try each (mini card puzzle). SafeSense rejects them: “Family is a risk factor.” “Work is a risk factor.” “Leisure is a risk factor.” “Other is a risk factor.” Chase finds a blank card and a marker on Teddy's desk and writes **CHRISTMAS**. SafeSense: “…Christmas is a protected holiday. ^ Reason accepted.”
4. **The scan (Hint 4).** As the gate system starts, a drone glides down and scans each of them in turn: blue cone over Chase (CLEARED: VISITOR), over Chase (2040) (CHIP OFF — CLEARED: SAD), over Luka—
   - **\[CLOSE · the drone, its light flickering blue to white\]** A small pop-up floats over it: **ERROR 4044 — IDENTITY CONFLICT.**
   - **LUKA:** “Error 4044.” ^ “That's the one where it forgets who you are, then forgets who it is.”
   - *(The drone wobbles, turns in a slow circle and floats off, confused.)*
   - **CHASE (2040):** “…They never do that.”
   - **CHASE:** “Nobody can fix JARVIS.”
5. **Teddy says yes.** Teddy's thumb hovers.
   - **SAFESENSE:** “Are you sure?”
   - **TEDDY:** “Yes.”
   - **SAFESENSE:** “Are you sure you're sure?”
   - **TEDDY:** *(to Luka)* “…Am I?”
   - **LUKA:** “Yeah.”
   - **TEDDY:** “Yes.”
   - *(The boom gate lifts.)*
   - **TEDDY:** “Merry Christmas, lads.”
   - **CHASE:** “Merry Christmas, Teddy.”
   - **TEDDY:** *(very quietly, to himself)* “…Teddy.”
   - **TEDDY:** “Take the scooters. Behind the booth. ^ They're slow. Everything's slow.”

**Sample here:** **Boom gate** (the clunk-and-whine as it lifts).

**Cutscene — “2.5\_alarm.”** As they reach two little hire hover-scooters behind the booth, every drone tower turns red. **DRONE:** “Unauthorised crossing! ^ For your safety, please stop!” Six drones peel off the towers.

- **CHASE (2040):** “Go.”

**▶ PLAY — “The slowest chase in history.” (Hover-scooter chase, 9.8.)** Luka drives scooter 1 with Chase on the back; Chase (2040) rides scooter 2 alongside (AI). The camera tracks low behind them, then cuts to fixed bridge-side angles at intervals (a nod to the fixed-camera style). Scooters are limited to 25 km/h. The drones are limited to 25 km/h. Nobody can catch anybody.

- Steer between lanes; dodge drones that drop in front to “hug” you; pass hover-cars politely yielding a foot off the road.
- SafeSense pop-ups appear on the scooter's dash: **“Are you sure?”** Press YES (or the scooter slows). Every fourth one is **“Are you sure you're sure?”** and needs YES twice.
- As Chase (riding pillion), the player can switch to recording mode: hold to record the **Drone whir** sample as a drone passes close.

**Cutscene — “2.5\_laugh”** (scripted, halfway across; can't be missed).

1. **\[TRACK · side-on, the two scooters and six drones in a neat line behind them, everyone at exactly 25 km/h\]**
2. **DRONE:** “Please stop!”
3. **LUKA:** “We're going TWENTY-FIVE.”
4. **DRONE:** “So are we!”
5. **\[CLOSE · Luka, driving\]** It hits him: the absurdity, the two days, the bench, all of it. He starts to laugh, and it's a proper helpless laugh. The Santa beard flaps off one ear. He can't stop.
6. **\[CLOSE · Chase (2040) on the other scooter\]** He hears it. His face. He hasn't heard that laugh in six years.
7. **CHASE (2040):** “CHASE.” ^ “GET THAT.”
8. **\[CLOSE · Chase on the back\]** He fumbles his phone up and records, laughing too.
9. **\[WIDE\]** Chase (2040) is laughing and crying at the same time and doesn't care which.
10. *The sample* **Luka (laughing)** *is added. It cannot be missed. In 2.10 it becomes the bridge.*

**End of chase.** At the Brighton end they swerve off the road onto a boardwalk into the mangroves. The drones stop at the edge.

- **DRONE:** “Uneven terrain detected. ^ For your safety, pursuit has ended. ^ Have a lovely day!”

**Cutscene — “2.5\_manager”** (a cutaway).

1. **\[WIDE · from behind the figure\]** The Manager's office. On the glass wall, small and low-res, drone footage: two hover-scooters disappearing into the mangroves.
2. The figure doesn't move.
3. **THE MANAGER:** “…Bring them in.” ^ “Gently.”
4. **DRONE:** “Yes, sir.”

### 2.6 — “Snag”

**Set:** sandgate (Sandgate station forecourt: a gazebo, a charity sausage sizzle, a hand-painted sign reading DOLPHINS JUNIORS SIZZLE — SUNDAYS, the station entrance) · **Time card:** 15:00 · **Playable:** Chase ⇄ Luka · **Music:** a sunny loop with a ukulele bass; the sizzle · **HUD:** QUIET IN 20:58:00 · Samples

**Cutscene — “2.6\_luke.”**

1. **\[WIDE\]** Under the gazebo, LUKE (2040): retired, sunburnt, in an apron that says KISS THE COOK (SAFELY), turning sausages with real happiness. A small queue.
2. **CHASE:** *(marching up)* “We know it's you.”
3. **LUKE:** “…Know what's me?”
4. **CHASE:** “The MANAGER.”
5. **LUKE:** “I WAS a manager. I hated it. Retired in '37.” ^ “I do sausages now. ^ Sausages don't hang up on you.”
6. **CHASE:** “You hung up on US.”
7. **LUKE:** “When?”
8. **CHASE:** “1987.”
9. **LUKE:** “…I've never been to 1987.”
10. **CHASE:** “We rang you FROM 1987.”
11. *(Luke looks past him at Chase (2040).)*
12. **LUKE:** “Chase? ^ Is this your—”
13. **CHASE (2040):** “Don't.”
14. **LUKE:** “…Right.”
15. *(Luke decides he doesn't want to know.)*
16. **LUKE:** *(at Luka in the Santa hat and beard)* “And who's Santa?”
17. **LUKA:** *(gruff)* “…Ho ho.”
18. **CHASE (2040):** *(quietly, to Chase)* “He's not even on the network. Hasn't been since he retired. ^ The Manager IS the network. ^ It's not Luke.”
19. **CHASE:** *(deflating)* “…It's not Luke.”

**▶ PLAY — Sausage Sizzle (mini-game, 9.9, needs both).** Luke's volunteer hasn't turned up and the queue's growing. “Nobody gets a favour from me on an empty stomach. Grab some tongs.” Swap between stations:

- **Luka** on the hotplate: turn the snags before they burn (a row of sausages with colour states; timing). Onions go on, too.
- **Chase** on the front: take orders (bread, snag, onions, sauce: tomato or BBQ or “none, for safety”), assemble, hand over. Customers have small 2040 quirks (“Can I get it with no risk?”).
- Chase (2040) “counts the change” (there is no change; everyone pays by chip; he stands at the cash tin looking lost).
- Ten customers served → success. If the hotplate burns three snags, Luke takes over the tongs for a bit with “Easy, Santa,” and the round continues; no fail state.

**Banter during the sizzle (plays automatically at set customers):**

- **CHASE:** “Why's it called a snag?”
- **LUKE:** “Nobody knows.”
- **LUKE:** *(to Santa Luka, flipping beside him)* “Had a 2IC once. Luka.”
- **LUKA:** “…Yeah?”
- **LUKE:** “Best 2IC I ever had.”
- **LUKA:** “Really?”
- **LUKE:** “No. Nightmare. Did everything himself. Wouldn't let anyone else carry a box. Cleaned the displays till you could see your soul in them.” ^ “Miss him every day.”
- *(Luka turns a sausage that doesn't need turning.)*

**Sample here:** **Sizzle** (a hotplate of onions; Chase holds his phone over it).

**Cutscene — “2.6\_invite.”**

1. **LUKE:** *(wiping his hands, pulling a card from his apron pocket)* “Here. ^ Got one every year since I retired. Optus Christmas morning tea at HQ. Mandatory fun. I never go.”
2. **\[INSERT\]** A glossy card: **MANDATORY FUN · Christmas Eve Morning Tea · Optus Tower, Ann Street, Fortitude Valley · 10:00 · Countdown to Quiet at 11:58! · Safety goggles provided · Admits: LUKE + 2**
3. **LUKE:** “Plus two. Take it.” ^ “Don't tell anyone I helped. I'm retired.”
4. **LUKE:** *(to Chase (2040), as they go)* “You look after yourself, Chase. ^ You never did, after Luka.”
5. **\[WIDE\]** They head for the station entrance. Behind them Luke turns a sausage, looks at Santa's back for a second too long, then shakes his head and goes back to the hotplate.

### 2.7 — “Shorncliffe Line”

**Set:** train (a 2040 suburban carriage: clean, quiet, soft blue lighting, passengers with chip lights; the windows show the northern suburbs going by under a green-grey storm sky) · **Time card:** 16:30 · **Playable:** Chase (short stealth) · **Music:** the rhythmic clack of the rails; thunder somewhere · **HUD:** QUIET IN 19:28:00 · Samples

**Cutscene — “2.7\_board.”**

- **\[INSERT · the station gate\]** Chase (2040) taps Jordan's Christmas bonus card. Three fares. **Balance: $4.**
- **TRAIN ANNOUNCEMENT:** “This train is running three minutes late, for your safety.”
- **CHASE:** “Is Cross River Rail finished?”
- **CHASE (2040):** “Don't.”
- *(A passenger opposite leans in to Chase (2040), looking at Chase.)*
- **PASSENGER:** “Is that your son?”
- **CHASE (2040):** “Nephew.”
- **CHASE:** “Brother.”
- **CHASE (2040):** “Nephew.”

**▶ PLAY — “Ticket inspection.”** Two stations in, a Courtesy Drone boards at the far end and starts scanning passengers row by row. Chase must get all three of them out of its path. He moves through the carriage (fixed angles down the aisle) and can:

- swap seats with passengers (each asks something small; “Only if you're sure”);
- borrow a giant inflatable Christmas reindeer from a man taking it to his grandkids and prop it in the aisle (the drone politely waits for it to “pass”);
- get Luka, who's dozed off with his Santa beard over his eyes, to move by talking to him.

The drone passes; it leaves at the next station. Short; no fail state beyond restarting the carriage.

**Sample here:** **Train chime** (the three-note door chime).

**Cutscene — “2.7\_talk.”** After the drone leaves. Chase has fallen asleep against the window with his earbud in. Luka and Chase (2040) sit facing each other. One locked two-shot, side-on, the storm moving across the windows behind them.

1. **CHASE (2040):** “Can I ask you something?”
2. **LUKA:** “Yeah.”
3. **CHASE (2040):** “Why'd you go back in?”
4. **LUKA:** “I haven't yet.”
5. **CHASE (2040):** “You will. ^ Why?”
6. **LUKA:** *(thinking about it honestly)* “…Because someone was in there.”
7. **CHASE (2040):** “There's always someone in there.”
8. **LUKA:** “Then I'll always go back in.”
9. **CHASE (2040):** “Yeah.” ^ “That's the problem.”
10. *(Thunder. The carriage lights flicker.)*
11. **CHASE (2040):** “You left me. ^ You know that? You don't get to be a hero AND leave.”
12. **LUKA:** “I didn't leave. I died.”
13. **CHASE (2040):** “Same thing, from where I was standing.”
14. *(Long beat, 3 s.)*
15. **LUKA:** “Then tell me how not to.”
16. **CHASE (2040):** *(looking out of the window)* “…Let someone else carry a box.”
17. **TRAIN ANNOUNCEMENT:** “Next station: Fortitude Valley. ^ Quiet Hours are in effect. ^ Please whisper.”

### 2.8 — “Quiet Hours”

**Set:** valley (Brunswick Street Mall → Chinatown Mall → Ann Street; then the Starlight, a dead live-music venue) · **Time card:** 19:30 · **Playable:** all three · **Music:** almost none; a whispering crowd, muffled thunder; one ukulele · **HUD:** QUIET IN 16:28:00 · Samples

**Cutscene — “2.8\_crane.”**

1. **\[CRANE · down\]** Fortitude Valley at night in Quiet Hours. The neon is dimmed to a soft “safe brightness”. Foam pads on every bollard, pole and corner. AR signs read QUIET HOURS 24/7 (Chip View). A nightclub's sign has been changed to **NAP CLUB**. Chinatown's red lanterns glow but don't sway; the wind has been asked not to. People talk in whispers. Drones drift overhead with little shushing lights. The storm grumbles over the city. Thunder is the only loud thing left.
2. **\[TRACK · the three of them walking the mall\]**
3. **CHASE:** *(whispering)* “This used to be the loudest place in Brisbane.”
4. **CHASE (2040):** *(whispering)* “That's why it went first.”

**Cutscene — “2.8\_mia.”**

1. **\[MID\]** On a bench in the mall, MIA (16, beanie, flannel, a sticker-covered ukulele) plays at whisper volume. A QR tip sign; nobody tips. She's playing the **1987 Pudding song**, the hold music, softly and quite well.
2. **\[CLOSE · Chase (2040)\]** He stops dead.
3. **CHASE (2040):** “…What's that?”
4. **MIA:** “The Optus hold music. First song I ever learned.” ^ “My nan used to put me on hold so I'd go to sleep.”
5. **CHASE:** *(pointing at Chase (2040))* “That's his song.”
6. **MIA:** “Sure it is, grandpa.”
7. **CHASE (2040):** “It is, actually.”
8. **MIA:** “Then why'd you only make one?”
9. *(Chase (2040) has no answer.)*
10. **CHASE:** “He's working on a second one.”
11. **MIA:** “Since when?”
12. **CHASE (2040):** “…2026.”
13. **MIA:** “Wow.”
14. **\[WIDE\]** A noise drone swoops down: “Instrument exceeds 40 dB! ^ Confiscated for your safety!” A claw takes the ukulele and the drone docks it in a padded **Safe Box** on top of a lamp pole, three metres up.
15. **MIA:** “That's the third one this month.”

**Cutscene — “2.8\_plan.”**

1. **\[MID · Chase, looking from the drone to the pole to the café tables\]**
2. **CHASE:** “Okay. ^ Okay okay okay. ^ Hear me out.”
3. **\[ORBIT · around Chase, speeding up\]** Rue's idea-engine shot.
4. **\[CLOSE · Chase (2040), watching his younger self do it\]**
5. **CHASE (2040):** *(quietly)* “…I used to do that.”

**▶ PLAY — “Get the ukulele back.” (needs all three.)**

1. **The code (Chase (2040)).** The Safe Box opens with a code shown only in AR on its side. Chase (2040) switches his chip on (the Signal meter starts filling; at full, drones converge: soft fail back to the start of the puzzle). Read the code (it changes each attempt; 4 digits) and pass it on.
2. **The lure (Chase).** The noise drone hovers by the pole. Chase picks a sample from his phone and drops his phone on a café table across the mall at full volume. Any sample works, but each has a different lure strength (louder = longer). A drone chasing the **Luka (laughing)** sample gets a unique line: “Excuse me! Someone is having too much fun!”
3. **The climb (Luka).** Only Luka can reach the box: he boosts himself up a foam-padded bollard and the pole's maintenance rungs (hold to climb; a wobble if he's slow).
   - **CHASE:** “You're the 2IC.”
   - **LUKA:** “That's not what 2IC means.”
   - **CHASE:** “Second-in-Climbing.”
   - *(Rue's “Second-in-Cycling”, twisted. Use it here only.)*
4. Luka types the code that Chase (2040) gives him. The box opens. Down with the ukulele. Get the phone back before the drone finishes “investigating” it.

**Cutscene — “2.8\_starlight.”**

1. **MIA:** *(taking the ukulele)* “…Thanks.” ^ “You need somewhere to sleep? You look like you need somewhere to sleep.” ^ “The Starlight. Ann Street. Shut when Quiet Hours came in. Back door doesn't lock. Nobody goes there.”
2. *(As they leave, Mia calls after Chase (2040), at whisper volume:)*
3. **MIA:** “Hey. Grandpa.” ^ “Finish it, yeah?”
4. **CHASE (2040):** “…Yeah.”

**Sample here:** **Ukulele** (Mia lets Chase record a strum: “Make it sound good.”).

**▶ PLAY — The Starlight (short).** A dusty dead venue: a small stage, a dead mixing desk, a wall of gig posters from the early 2030s (none of them Pudding), a green room with a sagging couch. Examine lines:

- *Gig posters:* “Every band that played here before the Quiet.” **CHASE (2040):** “I saw half of these.”
- *The mixing desk:* **CHASE:** “Does it work?” **CHASE (2040):** “Everything works if you shout at it.”
- *The stage:* **CHASE:** “Ever played here?” **CHASE (2040):** “…Nearly.”
- *Kettle (green room, save):* “Put the kettle on? \[YES\] \[NO\]”

### 2.9 — “Lights Out”

**Set:** valley (the Starlight's floor; then the stage door onto Ann Street) · **Time card:** Monday 24 December 2040, 01:10 · **Playable:** Luka · **Music:** none; rain on the roof, thunder · **HUD:** QUIET IN 10:48:00

**Cutscene — “2.9\_floor.”** One locked setup, low on the floor, as in Rue's Lights Out: three bodies under coats on the venue floor between the stage and the bar, heads toward camera. The storm has finally arrived: rain on the roof, neon through a high window turning the rain-shadows pink and teal. Chase (2040) snores softly.

*Then:* Luka sits up, carefully. He looks at Chase. He reaches over and takes the brick phone out of Chase (2040)'s coat pocket.

**▶ PLAY — “Leave.”** *(The player is made complicit in Luka's flaw on purpose.)* A slow sneak to the stage door: fixed low angles, creaky floorboards marked by a faint sheen, move too fast and someone stirs (a soft fail sends Luka back to his spot; no game over). On the way, at the bar, a prompt: **Write a note? \[YES\].** (The only option.) **\[INSERT\]** On a beer coaster, in biro: **I'll do it. — L.** He leaves it on Chase's chest. Reaching the stage door → cutscene.

**Cutscene — “2.9\_door.”**

1. **\[MID · the stage door, from outside on Ann Street, rain falling between camera and Luka\]** He pushes the bar on the door. It opens onto the wet street.
2. **CHASE:** *(off, behind him)* “Where are you going?”
3. **\[REVERSE · Chase in the dark of the venue, the coaster in his hand\]** He's been awake the whole time.
4. **LUKA:** “HQ.”
5. **CHASE:** “On your own.”
6. **LUKA:** “If it's just me, it's just me that gets hurt.”
7. **CHASE:** “That's not how it works.”
8. **LUKA:** “Every version where I'm near you, something happens to you. ^ I said 'go left', and you got zapped. I ring you on a Sunday, and—” *(he points back into the dark, where Chase (2040) is asleep)* “—his HAND, Chase.”
9. **CHASE:** “So you're going to go and do it on your own and not tell anyone.”
10. **LUKA:** “I'm going to keep you safe.”
11. **CHASE:** “That's what you DID.” ^ “You went back in on your own, and he got fourteen years of not finishing anything.”
12. **LUKA:** “That's not fair.”
13. **CHASE:** “No. ^ It's not.”
14. *(Rain. A long beat, 3 s.)*
15. **CHASE:** “You don't get to decide that for me.” ^ “If I get hurt, I get hurt. That's mine. You don't get to take it off me.”
16. **\[CLOSE · Luka\]** His hand goes to his lanyard. Twists it. Stops.
17. **LUKA:** “…I don't know how to not.”
18. **CHASE:** “Then don't know how. ^ Just stay.”
19. **\[INSERT\]** Luka puts the brick phone in Chase's hand.

**Cutscene — “2.9\_lights\_out.”** The same locked floor setup as the opening, the two of them back under their coats. Rain. Neon. *(Rue's 2.9, in reverse.)*

1. **LUKA:** “Chase? ^ You awake?”
2. **CHASE:** “No.”
3. **LUKA:** “…Thanks.”
4. **CHASE:** “For what?”
5. **LUKA:** “Being awake.”
6. *(Beat.)*
7. **CHASE:** “Night, Luka.”
8. **LUKA:** “Night, mate.”
9. *(Two seconds of dark and rain.)*
10. **\[CLOSE · Chase (2040), in the dark\]** The only cut. His eyes are open. They have been the whole time.
11. **CHASE (2040):** “Would yous two shut up. Some of us have a—” *(He stops.)* ^ “…Some of us have a song to finish.”
12. *(He gets up.)*

### 2.10 — “3:00 am”

**Set:** valley (the Starlight's stage and mixing desk, lit by emergency lights and the slate's glow) · **Time card:** 3:00 am · **Playable:** Chase · **Music:** the song itself, being built · **HUD:** QUIET IN 08:58:00

**Cutscene — “2.10\_promise.”**

1. **\[WIDE · the stage\]** Chase (2040) has the dead mixing desk half-alive, cables everywhere, the slate plugged in, a pair of headphones. Chase sits beside him on an amp. Rain on the roof.
2. **CHASE (2040):** “Can I ask you something?”
3. **CHASE:** “You're me. You can just remember.”
4. **CHASE (2040):** “I don't remember this.”
5. **CHASE:** “…Right.”
6. **CHASE (2040):** “Promise me something.”
7. **CHASE:** “What?”
8. **CHASE (2040):** “Keep making music. ^ Bad music. Finish it. Put it out. Let people hear the bad bits. Let them hear the bridge that isn't right.” ^ “A song nobody hears isn't perfect. ^ It's just quiet.” ^ “Don't do what I did.”
9. **\[CLOSE · Chase\]**
10. **CHASE:** “…I will.”
11. **CHASE (2040):** *(sliding the slate across the desk to him)* “Then finish it.”

**▶ PLAY — Sequencer: “two” (mini-game, 9.10).** A grid like Rue's sequencer, rebuilt for two people. Four sample lanes filled from the samples the player collected (missing samples become synth bleeps, as in Rue), plus a lead lane and a section strip: **INTRO · VERSE · CHORUS · VERSE 2 · BRIDGE · CHORUS · OUTRO.** Most sections are pre-arranged (Chase has been writing this since October). The player's job:

1. Pick the four lane samples (any order).
2. Toggle steps for a groove (a default pattern is pre-filled; any pattern is valid).
3. **The bridge.** The bridge lane is empty. The player can audition any sample in the bridge. Each one sounds *fine* and Chase (2040) says so (“Fine.” “Yeah, fine.” “That's fine.”). **Luka (laughing)** sounds *right*. When the player auditions it:
   - **\[CLOSE · Chase (2040)\]** He hears Luka's laugh inside the bridge of the song he couldn't finish for fourteen years.
   - **CHASE (2040):** *(barely)* “…That's the bridge.” ^ “That's what was missing.”
   - *(He has to put the headphones down for a second.)*
   - The laugh locks into the bridge. (If the player never auditions it, after 60 s Chase (2040) reaches over and drags it in himself.)
4. **Play it back** (the song plays in the room, mixed down and quiet; **the player hears only the first verse and chorus**, muffled through the desk's tiny monitor; the bridge and last chorus are saved for 3.6).
5. Then two buttons appear: **\[ONE MORE PASS\]** **\[IT'S DONE\]**.
   - **ONE MORE PASS:** the clock jumps (3:14 … 3:31 … 3:52). Chase fiddles. Nothing audible changes. Chase (2040) watches himself do exactly what he did for fourteen years. After the second “one more pass”:
     - **CHASE (2040):** *(his hand flat on the desk)* “Stop.”
     - **CHASE:** “It's not—”
     - **CHASE (2040):** “It's done.”
     - **CHASE:** “The bridge isn't—”
     - **CHASE (2040):** “It's done when you stop. ^ That's all done is.”
     - *(ONE MORE PASS greys out. Only IT'S DONE remains.)*
   - **IT'S DONE** (chosen at any point): if chosen the first time, Chase (2040) looks at him in surprise: **CHASE (2040):** “…That was quick.” **CHASE:** “It's done when you stop.” **CHASE (2040):** “…Who told you that?” **CHASE:** “You did. ^ In about four minutes, probably.” *(Then the scene continues as below.)*

**Cutscene — “2.10\_bounce.”**

1. **\[INSERT · the slate\]** EXPORT. A file name field. Chase types: **two**. A progress bar fills, and it doesn't go backwards. **two.wav · saved.** He copies it to his phone too. **CHASE:** “Backup.”
2. **\[CLOSE · Chase, lit by the slate\]** He puts the headphones on and presses play. We hear only the faint bleed from the headphones. His face. *(Rue 3.3: “He takes the headphones off and just sits there.”)* He takes them off and just sits there.
3. **CHASE (2040):** “Is it done?”
4. **CHASE:** “It's done.”
5. **CHASE (2040):** “…Can I hear it?”
6. **CHASE:** “Not yet.”
7. **CHASE (2040):** *(a small smile, a long beat)* “…Okay.”
8. **\[WIDE · locked, the whole venue\]** The stage, the two of them on the amp and the desk, Luka asleep on the floor under his coat with the Santa beard over his eyes. Through the high window the rain thins and a grey-blue dawn starts. Hold 3 s.
9. Title: **END OF ACT TWO.**

## ACT THREE — Two

*Act card over black, 3 s.*

### 3.1 — “Mandatory Fun”

**Set:** hq\_atrium (the ground-floor atrium of Optus Tower, Ann Street) · **Time card:** Monday 24 December 2040, 10:00 · **Playable:** all three · **Music:** a staff choir humming a carol-ish tune at exactly 40 dB (no words); polite clinking · **HUD:** QUIET IN 01:58:00

**Cutscene — “3.1\_tower.”**

1. **\[CRANE · up the outside of Optus Tower\]** A glass tower on Ann Street. The Yes sign at the top. Drones circling it like gulls. The storm sits on the city: dark and heavy, but the rain has paused. On the facade, a huge countdown: **QUIET IN 01:58:00**.
2. **\[WIDE · the atrium\]** Corporate Christmas, the Manager's way. A three-storey Christmas tree wrapped entirely in bubble wrap. Foam on every corner. A banner: **MANDATORY FUN**. A table of Christmas crackers, each with a pair of safety goggles. A Secret Santa table where every gift is a pre-screened pair of socks. A staff choir humming at 40 dB under a SafeSense meter. Staff in reindeer-antler headbands with chip lights, smiling politely. A giant countdown clock on the far wall.
3. **\[TRACK · the three of them at the entrance\]** Chase (2040) holds Luke's invitation.
4. **DOOR DRONE:** “Welcome! Please present your invitation.”
5. *(Chase (2040) holds it up. His chip is off.)*
6. **DOOR DRONE:** “Guest: LUKE, plus two. ^ Welcome, Luke!”
7. **CHASE (2040):** “…Thanks.”
8. **CHASE:** *(whispering)* “You're Luke now.”
9. **CHASE (2040):** “Don't.”

**▶ PLAY — “Get to the service lift.”** Objective panel:

- ☐ Get an HQ lanyard
- ☐ Find the service lift

*The lanyard desk.* A desk by the lifts: **LANYARD REQUESTS · please allow 6–8 weeks.**

- **CHASE:** *(to the woman at the desk)* “How long's the wait for a lanyard?”
- **DESK:** “Six to eight weeks.”
- **CHASE:** “IT'S BEEN FOURTEEN YEARS.”
- **DESK:** “Still processing.”

*Blend In (mini-game, 9.11, Rue's reskinned).* A **Fun Monitor** drone patrols the atrium with a beam. When it looks at you, you have to be doing something festive: pull a cracker (with goggles on), hum along with the choir (hold a note at the right volume, not over 40 dB), eat a pre-screened mince pie, or say “Merry Christmas” to a colleague. Do nothing in its beam for too long and it asks “Are you having fun?” Two “no”s and you're escorted to the Safe Room, which in this scene is the “Quiet Corner” with a beanbag. Swap between all three to keep each of them looking festive as the drone passes.

*Secret Santa (needs all three).* HR has a problem: the official Santa hasn't turned up. They see Luka in his Santa hat and beard.

- **HR:** “Oh thank god. ^ You're late. Gifts are on the table. Names are on the tags.”
- **LUKA:** “…Ho ho.”

The tags are AR. Luka can't read them. **Chase (2040)** turns his chip on (Signal meter) and reads names off the gift tags; **Chase** finds the right staff member in the crowd (AR name badges again; Chase (2040) calls them out: “Antlers, by the tree, that's Priya”); **Luka** hands over the gift. Five correct deliveries. Each recipient says one line (“Socks. ^ Thank you, Santa.” / “More socks.” / “These are the same socks as last year.” / “Santa, are you sure you're allowed to touch me?” / NADIA, see below).

**Cutscene — “3.1\_nadia”** (the fifth gift).

1. **\[MID\]** Luka hands a small parcel to NADIA (40s, antlers, tired eyes, Network Safety lanyard). She takes it. She looks up at him over the beard.
2. **\[CLOSE · Nadia\]** Her face changes.
3. **NADIA:** “…Luka?”
4. **\[CLOSE · Luka\]** Frozen.
5. **LUKA:** “…His nephew.”
6. **NADIA:** *(after a beat, quiet)* “You've got his eyes.” ^ “He was the best boss I ever had. He never let us do anything dangerous.” ^ “He never let us do anything.”
7. *(She looks at Chase (2040), recognises him, and understands they're up to something. She decides.)*
8. **NADIA:** *(very quietly)* “Service lift's behind the tree. It goes to thirty. After thirty it's his.”
9. *(She unclips her own HQ lanyard and loops it over Santa's head, as if it's a gift.)*
10. **NADIA:** “Merry Christmas, Santa.”
11. Ticks: ☑ Get an HQ lanyard · ☑ Find the service lift.

**Cutscene — “3.1\_lift.”** Behind the bubble-wrapped tree, a plain steel door. Nadia's lanyard against the reader. The doors open. The three of them squeeze in. The doors close on the humming choir. Inside, lift music: a soft muzak version of the Optus hold music, Pudding's 1987 song. Chase (2040) stares at the speaker in the ceiling. Nobody says anything.

### 3.2 — “Spotless”

**Set:** hq\_floors (three service floors reached by the service lift: L12, L21, L30) · **Time card:** 10:40 · **Playable:** all three · **Music:** sterile, cold synth; a hum; the slow swish of cleaning drones · **HUD:** QUIET IN 01:18:00

*Every floor is being cleaned by small disc-shaped cleaning drones, polishing every surface to a mirror shine. Floors reflect like water. (Hint 5.)*

**On arrival at L12, as the lift doors open on a floor so clean it reflects them:**

- **LUKA:** “…Someone's got standards.”

**The Manager on the PA.** From here on he talks to them through the building's speakers, voice filtered. One line per floor, on arrival:

- L12: **THE MANAGER:** “You shouldn't be here.”
- L21: **THE MANAGER:** “Go home. ^ You're not safe here.”
- L30: **THE MANAGER:** “Chase. ^ Go home. ^ Please.”

#### L12 — “Confiscated for Your Safety”

A vast archive floor of automated shelving: everything the Manager has taken off people over the years, in labelled bins. Skateboards. Fireworks. Kitchen knives. Scissors. Ladders. Trampolines. Guitars. A whole wall of **headphones** under a sign reading HEARING PROTECTION INITIATIVE 2038.

**▶ PLAY.** The robotic shelves move on rails. Reach the stairwell to L21 (the lift won't stop between 12 and 21).

- *Two-person shelf puzzle:* two shelf controls at opposite ends of an aisle must be held at the same time to open a gap (one player-controlled character holds one; the AI holds the other once told “Hold this”; the swap lets the player do either side).
- *Luka* pushes a heavy rolling bin of trampolines out of a doorway.
- *Examine lines:* the skateboards (“That kid's board is in here somewhere.”); the guitars (**CHASE (2040):** “That's mine.” *(a battered acoustic in a bin labelled REDCLIFFE 2038 · NOISE)* **CHASE:** “They took your guitar?” **CHASE (2040):** “Noise complaint.” **CHASE:** “You didn't fight it?” **CHASE (2040):** “I wasn't using it.”); the knives (“Every knife in Brisbane.”); the ladders (**LUKA:** “…He took the ladders.”).
- **The headphones.** Chase takes a pair of big over-ear headphones off the wall. **CHASE:** “For later.” He hangs them round his neck, the way Chase (2040) wears his. (Prompt: “Take them? \[YES\]”. Required.)

#### L21 — “The Oldest Line”

A server floor, cold blue, row after row of humming racks, cleaning drones polishing the glass. The stairwell up is sealed. The only way on is a maintenance hatch the system controls.

**▶ PLAY.**

1. **Find the oldest port.** Somewhere in the server rows is a beige 1987 wall jack on an old copper line with a hand-written label: **JARVIS — 1987 — DO NOT UNPLUG.** Chase (2040) with his chip on can see a faint AR trail (“There's a cable on the map that's just labelled 'old'”). Follow it (Signal meter risk).
2. **Make it fit (Chase).** The brick phone's 1987 plug doesn't fit the port's adapter. Wiring mini-game: Chase improvises an adapter from a kettle cord from the floor's tea point. **CHASE:** “Kettle cord. ^ It's always the kettle cord.”
3. **Hack the hatch (Luka).** Plug in the brick phone. A green 1987 terminal opens on the phone's little screen, then the 2040 system floods it with SafeSense pop-ups. **Hack** mini-game introduction (9.12): Luka navigates pop-ups by exploiting the old bug list. **LUKA:** “Nobody can fix JARVIS.” ^ “But I know how it breaks.”
   - *Are you sure? / Are you sure you're sure?* → answer YES, YES (the third ask accepts anything).
   - *Buttons that run away* → chase the OK button round the screen.
   - *Progress bar goes backwards* → press NO, and it goes forwards.
4. **The cooling interlock (two-person).** The hatch only opens while two cooling valves at opposite ends of the floor are turned at the same time. Luka on one, Chase on the other (AI holds when told). Fog rolls out of the vents.
5. Up the hatch ladder to L30.

#### L30 — “The Hangar”

A huge open floor: hundreds of Courtesy Drones docked in charging racks, rows of blue lights, a few awake and patrolling. At the far end, a private lift: **MANAGER ONLY**.

**▶ PLAY — drone stealth, the hard version.**

- *Lures (Chase):* play samples through dropped phones or a speaker; each sample has its own lure radius and duration.
- *Cover (Luka):* push a charging rack along a rail to block a patrol's line of sight.
- *Patrol paths (Chase (2040)):* with his chip on he can see the drones' AR patrol routes drawn on the floor. The Signal meter rises while it's on.
- **The private lift won't open for Nadia's lanyard:** MANAGER ONLY. A side panel: **ROOF ACCESS — SANTA PHOTO 11:30 — AUTHORISED: SANTA.** HR booked Santa for the roof.
  - **CHASE:** “…Santa's got roof access.”
  - **LUKA:** “Santa's got roof access.”
  - The lift takes Santa (and his “elves”) to the roof. From the roof, a maintenance hatch leads down into the top floor.

**Cutscene — “3.2\_roof.”**

1. **\[WIDE · the roof\]** Wind. The storm right overhead, black and green. The whole of Brisbane spread out: the river, the Story Bridge, the Valley's dimmed neon below. A Santa sleigh photo set: a cardboard sleigh, a ring light, nobody there. The countdown on the facade glows under their feet: **QUIET IN 00:17:00.**
2. **\[CLOSE · the maintenance hatch\]** Luka hauls it open. Below: dark.
3. **LUKA:** *(pulling off the Santa beard and the hat, and dropping them on the cardboard sleigh)* “Right.”

### 3.3 — “The Manager”

**Set:** hq\_top (the prologue's office) · **Time card:** 11:41 · **Playable:** — · **Music:** none until the orbit · **HUD:** QUIET IN 00:17:00

1. **\[WIDE · high, the prologue's angle, the far corner\]** The long dark office. Rain begins against the glass wall. The Valley below. The pop-up on the glass: **OPT OUT ALL USERS? \[YES\]**, with the empty space where NO should be. The desk with the face-down photo. The empty chair to its left. Drones hang in the air around the room like a slow galaxy.
2. **\[MID · the hatch ladder\]** Luka, Chase and Chase (2040) climb down and drop onto the spotless floor.
3. **\[WIDE · from behind them\]** At the far end, the figure in the long coat stands at the glass, back to them. The drones turn their lights toward the three intruders, but don't move.
4. **CHASE (2040):** “It's over. ^ Turn it off.”
5. **THE MANAGER:** *(filtered, not turning)* “…Chase.”
6. **CHASE:** “Take the hood off, Luke—”
7. **LUKA:** “It's not Luke.”
8. **CHASE:** “I KNOW. ^ It's a habit.”
9. **THE MANAGER:** *(a beat)* “…Luke?”
10. *(Through the filter: a small, tired breath that might be a laugh.)*
11. **\[MID · the figure\]** He turns round. Slowly.
12. **\[INSERT · slow\]** His chest. Under the open coat: a faded blue lanyard, paler than Luka's. As he turns, the badge swings and flips over. Biro on the back: **1158.**
13. **\[CLOSE · Chase\]** He sees it first. His face.
14. **\[CLOSE · Luka\]** His hand goes to his own badge. He turns it over. **1158.**
15. *A click. The filter drops away.* **\[CLOSE · the figure as the hood comes down\]** Grey-streaked ponytail. A beard cut close and going grey. A burn scar from the jaw down the neck. Tired eyes. Luka, fourteen years on. *(The dialogue name label switches from THE MANAGER to LUKA (2040) here, on screen, with a small glitch.)*
16. *(Hint 1, paid off:)* Before he speaks he glances to his left, at Chase (2040). The empty chair beside the desk sits in the edge of the frame.
17. **LUKA (2040):** “Hey, mate.”
18. **\[CLOSE · Chase (2040)\]** He can barely make the words.
19. **CHASE (2040):** “You're dead.”
20. **LUKA (2040):** “I know.”
21. **\[TOP-DOWN · Chase (2040)\]** His hands rise to his head. This time they don't stop.
22. *No music. Rain on the glass.*
23. **\[TWO-SHOT · Luka and Luka (2040), the length of the office between them\]** Future Luka looks at his past self for a long time. *(3 s.)*
24. **LUKA (2040):** “So this is where we went.”
25. **CHASE (2040):** “I buried you.”
26. **LUKA (2040):** “You buried a box.”
27. **CHASE (2040):** “I wrote your eulogy forty-one times.”
28. **LUKA (2040):** “I know.”
29. **CHASE (2040):** “How do you—”
30. **LUKA (2040):** “I was at the back.” ^ “You stood up there for four minutes and didn't say anything.” ^ “It was the best thing anyone's ever said about me.”
31. *(Chase (2040) can't speak.)*
32. **CHASE:** *(quiet)* “…The bench. ^ Someone polishes it.”
33. **LUKA (2040):** “Every Sunday.”
34. **CHASE (2040):** “The codes. ^ They were coming to your number.”
35. **LUKA (2040):** “You kept paying for it.”
36. **CHASE (2040):** “Thirty-five dollars a month.”
37. **LUKA (2040):** “I know.” ^ “I could've cut it off.” ^ “I couldn't.”
38. **LUKA:** *(the first thing he's said)* “The drone on the bridge. Error 4044.”
39. **LUKA (2040):** “It thought you were me.” ^ “You are me.”
40. **LUKA:** “Why?”
41. *(Future Luka walks to the glass. He talks calmly and reasonably, which makes it worse.)*
42. **LUKA (2040):** “I rang him. That Sunday. Six in the morning. 'I'll do it, I just need another pair of hands.'” ^ “And I watched his hand—” *(beat)* “^ I did that. Me. Being the one who could.”
43. **LUKA (2040):** “When the roof came down, I walked out the back. Nobody saw. And I thought: good. ^ Let him think I'm gone. He's safer. Everyone's safer.”
44. **LUKA (2040):** “And then I couldn't stop seeing it. Every line we sell is a way for someone to get hurt. Every call. Every message. Every 'I'll be there' that isn't. ^ Six years of watching people hurt each other down cables I'm responsible for.”
45. **LUKA (2040):** “In seventeen minutes it stops. ^ Nobody reaches anybody. ^ Nobody gets hurt.”
46. **LUKA:** “Nobody gets anything.”
47. **LUKA (2040):** “Exactly.”
48. **LUKA:** “I nearly did it. Last night. ^ I nearly left him to keep him safe.”
49. **LUKA (2040):** “Then you know I'm right.”
50. **LUKA:** “I know you're scared.”
51. **LUKA (2040):** *(turning back to them, and the drones turn with him)* “Go home. All of you. ^ Please.” ^ “I don't want to hurt you.”
52. **\[INSERT · the console in the centre of the room\]** A sleek black desk-console, entirely wireless, nothing plugged into it. Except on its side, absurdly, one small port. **USB-C.**
53. **\[CLOSE · Luka\]** He's seen it.
54. **LUKA:** *(under his breath)* “…He's got a USB-C port.”
55. **CHASE:** *(under his breath)* “In 2040?”
56. **LUKA:** “JARVIS.”
57. **CHASE:** “JARVIS.”
58. **LUKA:** “If I plug in, I can get into the system. It'll take time.”
59. **CHASE (2040):** *(still breathing hard)* “How do you know you can get in?”
60. **LUKA:** “Because they're my passwords.”
61. **\[CLOSE · Chase (2040)\]** He takes his hands off his head. He straightens up. Something comes back into his face that hasn't been there all game.
62. **CHASE (2040):** “Okay.” ^ “Okay okay okay.” ^ “Hear me out.”
63. **\[ORBIT · around Chase (2040), speeding up, the move from Rue\]** The first time in fourteen years. The music kicks in under it: the “two” groove, driving.
64. **CHASE:** *(a whisper, amazed)* “…He does the thing.”
65. **CHASE (2040):** “You plug in. We keep them off you. Me and— ^ me. Swap when one of us gets tired. Don't stop for anything.”
66. **CHASE:** “That's the whole plan?”
67. **CHASE (2040):** “It's a first draft.”
68. **CHASE:** “Is it finished?”
69. **CHASE (2040):** “It's DONE.”
70. **\[MID · Luka at the console\]** He pulls his 2026 phone and a USB-C cable from his pocket. Plugs in. A password field appears on the console glass.
71. **\[INSERT · Luka's thumbs\]** He types: **beforelunch**
72. **\[INSERT\]** ACCESS GRANTED. **HACK 0%.**
73. **LUKA (2040):** *(quietly, stung)* “…Don't.”
74. **\[WIDE\]** Every drone in the room lights up red at once.

### 3.4 — “85%”

**Set:** hq\_top · **Time card:** none · **Playable:** Chase ⇄ Chase (2040) (SWAP), with Luka prompts · **Music:** the “two” groove as boss music: the verse and chorus only, never the bridge (the bridge is saved for 3.6) · **HUD:** a large **HACK %** bar centre-top; QUIET IN 00:15:00 counting down in real time at a compressed rate (see 10)

**▶ PLAY — Boss: defend Luka.** Full spec in section 10. In short:

- Luka stands at the console. The hack climbs on its own. It **stalls** whenever a drone reaches him (and slowly drifts backwards while one is on him) and at three scripted **bug stalls**, where the player must swap to Luka for a short Hack prompt.
- The player controls one Chase; the other is AI. SWAP switches between them.
- **Chase:** the **Tether**, the display security cable he pocketed in 1.2. Lasso and yank a drone out of the air. Also **Lure:** throw a sample.
- **Chase (2040):** **Chip Ping**, which overloads every drone in a radius. Every time he uses it the screen floods with pop-ups for 2 s (when he's the one being controlled). Also **Coat:** throw the trench coat over a drone to blind it.
- **Drone types:** Courtesy (slow huggers), Guardian (shielded: tether to strip the shield, ping to drop), Pop-up (project pop-ups on whoever they're aimed at), Cleaning (polish the floor so it's slippery).
- **Future Luka doesn't fight.** He stands at the glass and talks.

**Lines by hack percentage** (play over gameplay without pausing; the speaker's portrait appears in a corner box):

- **10%** — **LUKA (2040):** “You're going to get hurt.” **CHASE:** “That's mine.”
- **25%** — **LUKA (2040):** “Chase. ^ You don't have to do this.” **CHASE (2040):** “Yeah, I do. ^ You taught me that. 'I'll do it.'”
- **31% · bug stall:** *Progress bar goes backwards.* **LUKA:** “Bar's going backwards!” **CHASE:** “Press NO!” *(Swap to Luka. Press NO. It goes forwards.)*
- **40%** — **LUKA (2040):** *(to Luka)* “Is this what you want? To be the reason they get hurt?” **LUKA:** *(typing)* “They chose it.”
- **50%** — *(Lightning. The lights flicker.)* **LUKA (2040):** “You don't know what it's like. Being the one who could.” **LUKA:** “Yeah, I do. ^ I'm the one who could. ^ I'm doing it right now.”
- **52% · bug stall:** *Buttons that run away.* Swap to Luka; chase the button.
- **65%** — **CHASE (2040):** *(mid-fight, furious)* “Why didn't you TELL me?” **LUKA (2040):** “Because you'd have stayed.” **CHASE (2040):** “Of course I'd have stayed!” **LUKA (2040):** “THAT'S WHY.”
- **67% · bug stall:** *Are you sure you're sure?* Swap to Luka; YES, YES.
- **75%** — **LUKA (2040):** “Stop. Please. ^ Stop.” *(He's shaking.)*
- **80%** — **CHASE:** *(tethering a Guardian)* “Nearly there!” **CHASE (2040):** “Don't say nearly. Never say nearly.”
- **85%** → cutscene.

### 3.5 — “99%”

**Set:** hq\_top · **Playable:** — · **Music:** none; rain and the drones · **HUD:** HACK % (climbing slowly by itself through the scene) · QUIET IN 00:04:00

**Cutscene — “3.5\_foam.”**

1. **\[CLOSE · Luka (2040)\]** Eyes closed.
2. **LUKA (2040):** “…Enough.”
3. **LUKA (2040):** “Safe Mode.”
4. **\[WIDE\]** Vents in the floor open. **Safety foam** blooms up around all three of them: around Luka at the console, around Chase mid-swing, around Chase (2040) mid-ping. It's soft, white, quilted, and completely immovable, holding them to the floor up to the chest. The Tether drops. The drones stop and hang in the air.
5. **SAFESENSE:** *(chirpy)* “You are safe now.”
6. **\[INSERT · Luka's phone, still plugged into the console, the cable taut\]** **HACK 85% … 86%.** Still going. Slowly.
7. **\[WIDE · locked, low\]** Future Luka walks among them in his long coat. Rain hammers the glass. He stops by each of them in turn.

**The pleas.** *(Each one is played as a slow push-in on the speaker, with the reverse on Future Luka standing over them. No music.)*

8. **\[Future Luka by Chase\]**
9. **CHASE:** “Look at him.” *(He means Chase (2040).)* ^ “Six years. He stopped. Everything. He stopped playing. He stopped ringing Rue. He stopped—” ^ “You did that. ^ Not the fire. You.”
10. **\[Future Luka by Chase (2040)\]**
11. **CHASE (2040):** “You were at the back.” ^ “You were at the back, and you watched me not be able to say it.” ^ “You could've walked up. One step. ^ I'd have been so angry.” *(His voice goes.)* ^ “And then I'd have been so happy.”
12. **\[Future Luka by Luka\]** The two Lukas, face to face, one standing, one held in foam.
13. **LUKA:** “I know why you did it. I nearly did it. Last night. I had the phone in my hand and a note that said 'I'll do it.'” ^ “He was awake. He said I don't get to decide that for him.” ^ “You don't get to decide it for everyone.”
14. **\[INSERT · the hack\]** **HACK 94%.**

**Cutscene — “3.5\_almost.”**

15. **\[MID · Future Luka\]** He walks to his desk. Stops. He picks up the face-down frame and turns it over.
16. **\[INSERT · the photo\]** Luka and Chase, 2033, on the Woody Point jetty at sunset, laughing so hard they're both blurred.
17. **\[CLOSE · Future Luka's hand\]** It's trembling.
18. **\[ECU · the pop-up on the glass\]** **OPT OUT ALL USERS? \[YES\]** — and for a single frame, in the empty space, a **\[NO\]** button flickers into existence. Then it's gone.
19. **\[WIDE\]** The foam around the three of them softens, just slightly. Chase can move his arm.
20. **CHASE (2040):** *(softly)* “Luka.”
21. **\[CLOSE · Future Luka, eyes closed\]** *Hold 3 s.* We believe he's going to stop.
22. **\[INSERT · the countdown on the glass\]** **11:57.** Thunder.
23. **\[CLOSE · Future Luka\]** His eyes open, and something in them closes.
24. **LUKA (2040):** “No.” ^ “If I stop now, it was for nothing. ^ The bench. The six years. ^ All of it. For nothing.”
25. He puts the photo back. **Face down.**
26. The foam hardens again.
27. **\[INSERT · the console\]** **HACK 98%.**
28. **\[CLOSE · Future Luka looking at his past self\]**
29. **LUKA (2040):** *(barely)* “I'm sorry.”
30. He flicks two fingers.

**Cutscene — “3.5\_strike.” No humour anywhere in this sequence. Treat it as a death.**

31. **\[WIDE\]** A Guardian drone drops from the ceiling like a stone, straight at Luka.
32. *It hits. It detonates.* A flash *(Reduce Flashing: a dull orange bloom)*. The foam bursts. Luka is torn out of it and thrown across the room, violently, into the wall. A hard, ugly sound.
33. **\[WIDE · locked, low, across the floor\]** Luka slides down the wall and lies still against it. His lanyard has snapped. The badge lies face down beside his open hand. His 2026 phone dangles from the console on its cable, the screen cracked, still lit.
34. *The sound drops out to a high ringing. The rain is muffled, as if heard through water.*
35. **\[CLOSE · Chase\]** Frozen. His mouth opens and nothing comes out.
36. **\[CLOSE · Chase (2040)\]** Frozen.
37. The foam around both Chases sags and dissolves (the control system stutters) but they don't move. They can't.
38. **\[INSERT · the cracked phone\]** **HACK 99%.**
39. **\[WIDE · locked\]** Both Chases staring across the floor at Luka's body. He doesn't move. *Hold 4 s.* Nothing else happens.
40. **CHASE:** *(a whisper)* “…Luka?”
41. *(Nothing.)*
42. **\[CLOSE · Future Luka's gloved hand at his side\]** For a moment it goes **translucent**, flickering, as if he's being erased. He looks down at it. He isn't moved.
43. **\[CLOSE · Future Luka\]**
44. **LUKA (2040):** “He's an inferior version of myself; he lets himself be ruled by fear.”
45. **\[INSERT · the cracked phone\]** **HACK 100%.**
46. *Silence. 2 s.*
47. **\[ECU · Luka's eye\]** It opens.
48. **LUKA:** *(barely audible)* “No…”
49. **\[WIDE · locked, low\]** Luka gets up. Slowly. It takes a long time. One hand on the wall, then a knee, then up. His polo is torn. There's blood at his hairline. He holds his ribs and can't straighten all the way. He picks up the snapped lanyard and closes his fist round it.
50. **\[CLOSE · Future Luka's hand\]** It solidifies.
51. **\[TWO-SHOT · the two Lukas, the room between them\]** Past Luka, wrecked and upright. Future Luka, untouched.
52. **LUKA:** “You're the one who's ruled by fear.”
53. **\[LOW · Luka, the sincere low angle from Rue's Torchlight\]** He raises his arm and waves it, once.
54. **\[WIDE\]** Every drone in the room turns, as one, away from the Chases. Over the nearest, a small pop-up flickers: **IDENTITY CONFIRMED: MANAGER.** *(Error 4044, paid off: the system can't tell the two Lukas apart, and now it obeys the one who's standing up.)* They drift across the office and form a ring around Future Luka, facing him. Their lights change from red to blue to a warm **Yes yellow**.
55. *(The countdown on the glass stops at* **11:57:30**. *A small word under it:* **PAUSED.***)*

### 3.6 — “two”

**Set:** hq\_top · **Playable:** Luka (2040), for one action · **Music:** **“two”**, in full, for the first time · **HUD:** none (fade it out)

1. **\[MID\]** Chase gets up out of the dissolved foam. He walks across the office toward Future Luka. The ring of yellow drones parts for him.
2. **\[CLOSE · Chase's hands\]** He lifts the big over-ear headphones from round his neck (he's worn them since L12) and plugs them into his phone.
3. **\[TWO-SHOT · Chase and Future Luka\]** Future Luka looks at him and doesn't stop him.
4. **CHASE:** *(to Chase (2040), without looking round)* “I said not yet.”
5. *(He lifts the headphones over Future Luka's head and settles them over his ears, the way Luka once put a lanyard over Rue's head.)*
6. **CHASE:** “It's yet.”
7. **\[INSERT · Chase's thumb\]** Play. The file: **two.**
8. **The song plays.** The score *becomes* the song: “two”, built from the samples the player collected. From here to the end of the scene it's continuous.
9. **\[CLOSE · Future Luka, one unbroken slow push-in through the whole first verse\]** Nothing. He stands absolutely still and listens: to the sounds of the last two days, whichever samples the player chose. A kettle in the hi-hats. A boom gate on the snare. Mia's ukulele.
10. **\[CLOSE · Chase (2040)\]** He realises what's coming. He closes his eyes.
11. **The bridge.** The song drops to almost nothing, and in the space, **Luka's laugh** from the bridge, young and helpless on a hover-scooter at twenty-five kilometres an hour.
12. **\[CLOSE · Future Luka\]** His face breaks. He tears up and can't stop it. He brings a gloved hand to his mouth.
13. **\[TOP-DOWN · Chase (2040)\]** His hands start to rise toward his head, the old reflex, and stop halfway, and come down. *(The top-down motif, healed.)*
14. **\[MID · Luka\]** Holding his ribs against the wall, watching his future self cry.
15. **The last chorus** lifts from B minor into **D major** and quotes the 1987 Pudding melody, the hold music, inside the new song. *(See 15.3.)*
16. **\[WIDE · the ring of yellow drones, Future Luka crying in the middle, Chase beside him, the city through the glass behind\]**
17. **\[INSERT · the glass\]** **OPT OUT ALL USERS? \[YES\]**
18. **\[CLOSE · Luka\]** He limps to the console, pulls his cracked phone free of its cable, and taps it once.
19. **\[INSERT · the glass\]** A second button appears in the empty space: **OPT OUT ALL USERS? \[YES\] \[NO\]**
20. **LUKA:** “Your call.”
21. *(He gives the choice back. The opposite of deciding for people.)*

**▶ PLAY — “Your call.”** *Control passes to Future Luka. The only time the player controls him.* He stands in front of the glass, headphones still on, the song still playing. A cursor on the glass. **Both buttons are live.**

- If the player moves toward **YES**: Future Luka's hand shakes. The cursor drifts back toward NO by itself. On a second attempt, **LUKA (2040):** “…No.” and YES greys out.
- **NO:** hold to confirm (3 s, a filling ring, as with Rue's final YES).

22. **\[INSERT\]** NO.
23. **SAFESENSE:** “Opt-Out cancelled.”
24. The clock on the glass: **11:57:30 … 11:57:59 … 11:58.**
25. **\[WIDE · the Valley from the office, through the rain\]** At 11:58 the countdown on the tower facade reaches zero, and instead of going dark the Valley lights up. Neon to full brightness. Music bursts out of every bar along Brunswick Street. Chinatown's lanterns swing in the wind. People in the street stop and look up. Chip lights flicker.
26. **\[INSERT · a passer-by's chip view\]** **Opt out? NO. ^ Thank you for staying.**
27. **\[WIDE · the mall from above\]** Somewhere a phone rings, and someone answers. The storm breaks properly: rain pours down, and people in the street don't run. They laugh.
28. **\[INSERT · the console\]** The song's last chord resolves into the JARVIS restart chime, three notes rising. *(The Manager's falling three notes, turned the right way up.)*
29. **\[CLOSE · Future Luka\]** He takes the headphones off. The song finishes. *(The last chord rings; the 1987 melody's final D.)*
30. **LUKA (2040):** “…That was the bridge.”
31. **CHASE (2040):** “Yeah.”
32. **LUKA (2040):** “You finished it.”
33. **CHASE (2040):** *(nodding at his younger self)* “He did.”
34. **CHASE:** “We did.”
35. **\[WIDE\]** The yellow drones settle, one by one, onto the floor around them like birds landing.

### 3.7 — “Storage Full”

**Set:** hq\_roof · **Time card:** 18:40 · **Playable:** — then the Choice · **Music:** quiet; the Valley's music drifts up from far below; a sustained pad under the choice · **HUD:** none

**Cutscene — “3.7\_roof.”**

1. **\[WIDE · the roof at golden hour\]** The storm has gone. Everything is washed and steaming. The river shines. The Story Bridge. The Valley loud and alive below. The cardboard Santa sleigh has collapsed in the rain; the Santa beard lies in a puddle.
2. **\[MID\]** A ring of four hundred yellow drones sits on the roof like candles: a power bank. In the middle, Chase (2040)'s **Remote** (the receiver taped to a display chip) is wired by Chase into Rue's **brick phone**.
3. **\[CLOSE\]** Luka sits against the parapet with his torn polo pulled up and his ribs being bandaged. **Future Luka** kneels beside him, wrapping the bandage, careful and quiet.
4. **LUKA (2040):** “Hold still.”
5. **LUKA:** “You hold still.”
6. *(Future Luka nearly smiles.)*

**Cutscene — “3.7\_sorry.”** Future Luka finishes, stands, and goes over to Chase (2040) at the edge of the roof. One locked two-shot, side by side at the parapet, the city below.

7. **CHASE (2040):** “Six years.”
8. **LUKA (2040):** “I know.”
9. **CHASE (2040):** “You don't get to decide that for me.”
10. **LUKA (2040):** “I know.” ^ “I decided it for everyone.”
11. **CHASE (2040):** “I'm still angry.”
12. **LUKA (2040):** “Good.”
13. **CHASE (2040):** “I'm going to be angry for a while.”
14. **LUKA (2040):** “I'll wait.” ^ *(beat)* “…Sorry for the wait.”
15. **\[CLOSE · Chase (2040)\]** He laughs, and it turns into something else halfway through.
16. *(Future Luka puts a hand on his shoulder and leaves it there.)*
17. **CHASE (2040):** *(wiping his face)* “…Tea?”
18. **LUKA (2040):** “Yes, please.”

**Cutscene — “3.7\_staying.”** Future Luka sits down next to his past self against the parapet.

19. **LUKA (2040):** “I thought loving someone meant making sure nothing could ever hurt them.”
20. **LUKA:** “It's staying when it does.”
21. **LUKA (2040):** *(a long look)* “When'd you get so smart?”
22. **LUKA:** “Last night.” *(nodding at Chase)* “He told me.”

**Cutscene — “3.7\_storage.”**

23. **\[MID · Chase at the Remote, running the pre-call check\]**
24. **CHASE:** “Brick phone's live. Line's open. Drones are at… ^ 3%.” ^ “Four hundred drones at 3% is enough.”
25. **\[JARVIS-CAM · from behind the Remote's little screen, the framing from Rue's Storage Full\]** A pop-up lands over their faces, 2040-styled:
    - **STORAGE FULL**
    - To complete this call, the following will be cleared:
    - **2 days, 6 hours, 54 minutes.**
    - *Never forget anything again!*
    - **Upgrade to Optus Cloud+ and keep them instead?**
    - **\[YES\] \[NO\]**
    - *(YES keeps the memories. NO clears them. Make the question that plain on screen.)*
26. **CHASE:** “…Cloud+.” ^ “We can keep it.”
27. **LUKA (2040):** *(leaning in, reading the small print, because of course he does)* “If you keep it, you go home knowing. All of it. You won't do what we did.” ^ “You won't become us.”
28. **CHASE (2040):** “That's good.”
29. **LUKA (2040):** “It means we stop.”
30. **CHASE (2040):** “…Stop?”
31. **LUKA (2040):** “There's no us at the end of it. We get overwritten. ^ Like a save file.”
32. **CHASE:** “That's dark.”
33. **LUKA (2040):** “It's JARVIS.”
34. **CHASE (2040):** “And if they clear it?”
35. **LUKA (2040):** “They go home, and they live it. All of it. ^ The fire. The six years. The bench. Every bit.” ^ “And one day it's the twenty-second of December, and you build a machine out of display chips, and you go to the gap.”
36. **\[CLOSE · Chase (2040)\]** It lands.
37. **CHASE (2040):** “…That's why I didn't remember.” ^ “I've stood here. ^ Last time. And I said clear.” *(beat)* “This was never the bit that went wrong.” ^ “This was the bit that fixed it.”

**Cutscene — “3.7\_fears.”** The four of them on the roof. The two past selves face each other across the Remote. Each one's fear is choosing for him, and they both hear it.

38. **CHASE:** “If we keep it, I don't lose fourteen years. I don't become—” *(he glances at Chase (2040))* “^ sorry.”
39. **CHASE (2040):** “No. Say it.”
40. **CHASE:** “I don't become you.”
41. **LUKA:** “If we keep it, they stop.”
42. **CHASE:** “They don't DIE, they just—”
43. **LUKA:** “They stop. ^ Because of us.” ^ “I'm not doing that to them.”
44. **CHASE:** “So we go home and you walk into a fire, and he loses six years?”
45. **LUKA:** “…And then they get this.” *(He nods at the two older men, side by side at the parapet.)*
46. *(They look at each other. They both hear it.)*
47. **CHASE:** “That's your fear talking.”
48. **LUKA:** “And that's yours.”
49. **CHASE (2040):** “Don't pick for us.”
50. **LUKA (2040):** “I've done enough picking for people.”
51. **CHASE (2040):** “It's your call. ^ It was always your call.”
52. **LUKA (2040):** “There's no version where nobody gets hurt.” ^ “I looked. ^ For six years, I looked.”
53. **\[TWO-SHOT · tight, their hands side by side on the Remote, the framing from Rue's 3.4\]** Luka's grazed hand and Chase's hand.

**▶ THE CHOICE.** The pop-up sits over the frame. **Both buttons are live.** Nothing is greyed out. No timer. No hint. The music is a single sustained chord. The characters say nothing more.

- **YES** (keep the memories) → **Ending A — “Keep.”**
- **NO** (clear them) → **Ending B — “Again.”**
- Hold to confirm, 3 s. Releasing before the ring fills cancels without penalty.
- Save the choice to the profile so the menu can show which endings have been seen (Extras → Endings).

## 8 (continued) — The endings

Both endings are complete, equal in length and care, and neither is framed as the good or the bad one. Each gets its own title card, its own final image and its own last line. Both end on **TWO**.

The two endings mirror each other on purpose:

|  | Ending A — “Keep” | Ending B — “Again” |
| --- | --- | --- |
| Pop-up | YES | NO |
| Who pays | The 2040 selves, who stop existing | The 2026 selves, who live the fourteen years |
| What survives | The memories; the song goes home | The 2040 selves; the song stays in 2040 |
| The “Long story” line | “We haven't got time, have we.” | “I've got time.” “…Yeah. You have.” |
| The email | Chase replies in 2026 | Chase (2040) replies in 2040, fourteen years late |
| The smudge / trace | Luka leaves a smudge on purpose | Luka leaves a smudge and doesn't know why |
| Last image | Two hands reaching for a ringing phone | The opening, starting again |

### ENDING A — “Keep”

#### A1 — “Keep”

**Set:** hq\_roof → reddy26 · **Music:** the “two” bridge, slowed, as a lullaby

1. **\[INSERT\]** YES.
2. **\[JARVIS-CAM\]** The pop-up changes: **Cloud+ activated. ^ Your memories are safe. ^ Your 2040 selves will be overwritten. ^ Thank you for saying yes.**
3. **\[WIDE · the roof\]** Nobody says anything for a moment. Then Future Luka nods, once. Chase (2040) breathes out.

**The goodbyes** *(each a short two-shot)*:

4. Future Luka unclips his faded lanyard, the 1158 badge, and puts it in Luka's hand, closing his fingers round it.
5. **LUKA (2040):** “Don't twist it.”
6. **LUKA:** “I won't.”
7. **LUKA (2040):** “You will.” ^ “Just not as much.”
8. **CHASE (2040):** *(to Chase)* “Finish things.”
9. **CHASE:** “I will.”
10. **CHASE (2040):** “Bad ones.”
11. **CHASE:** “Mostly bad ones.”
12. **CHASE (2040):** “And ring Rue.”
13. **CHASE:** “Every Sunday.”
14. **LUKA (2040):** *(to Chase)* “Look after him.”
15. **CHASE:** “He looks after me.”
16. **LUKA (2040):** “Let him. ^ A bit.”
17. **CHASE (2040):** *(to Luka)* “Let someone else carry a box.”
18. **LUKA:** “…I'll try.” *(He hears himself. He doesn't say “I'll do it”.)*

**The call.**

19. **\[MID\]** Chase dials on the brick phone. The double trill. **\[SPLIT SCREEN\]** Left: the 2040 roof at golden hour, four men and a ring of yellow drones. Right: **Optus Redcliffe, Thursday 24 December 2026, 18:58.** The store is closed. Christmas lights are on. A new Hero Table stands where the old one was, still in its plastic. Luke, alone, in a Santa hat, is doing the end-of-day count. The counter phone rings.
20. **LUKE:** “Optus Redcliffe. ^ We're closed.”
21. **OPERATOR:** “You have a reverse-charge call from Chase and Luka, Optus Redcliffe. ^ 2040. ^ Will you accept the charges?”
22. **\[RIGHT HALF · CLOSE · Luke\]** A very long sigh.
23. **LUKE:** “…Is it them?”
24. **OPERATOR:** “Please answer yes or no.”
25. **LUKE:** “Yes.” ^ “Obviously yes.”
26. **\[LEFT HALF\]** White pours across the roof from the Remote. Luka and Chase fade into it. **The split closes; the left half fills the frame.**

**After.** *(Still 2040. This is the 2040 selves' ending, and it should take its time.)*

27. **\[WIDE · the roof\]** Two men sit on the parapet, shoulder to shoulder, the ring of drones glowing around them. The Valley's music drifts up.
28. **LUKA (2040):** “Can I ask you something I never asked?”
29. **CHASE (2040):** “Go on.”
30. **LUKA (2040):** “Why Pudding?”
31. **CHASE (2040):** *(smiling)* “…It's a long story.”
32. **LUKA (2040):** “We've got—” *(He looks at his hand. The edges of it are starting to fade, like a photo left in the sun.)* ^ “…We haven't got time, have we.”
33. **CHASE (2040):** *(laughing softly)* “No.”
34. **\[CLOSE · Chase (2040)'s hands\]** He takes out his music slate, untangles a pair of earbuds, and gives one to Luka (2040). One each. Plays **two**.
35. **\[WIDE · locked, from behind them, the city ahead\]** The two of them listening, shoulder to shoulder. Over the length of the song's last chorus they fade, very gently, until the parapet is empty. A pair of earbuds lies on the wet concrete, still playing, tinny. The ring of yellow drones. The city. *Hold 4 s.*
36. Fade to white.

**Home.**

37. **\[WIDE · locked, the backroom, Thursday 24 December 2026, 18:58\]** The exact frame that ended Rue's Act One: the empty backroom, smoke curling up to the flickering tube. It clears. Two men on the floor.
38. **\[TOP-DOWN\]** Luka and Chase, side by side on their backs. Luka holds two lanyards: his own, snapped, and one fourteen years more faded.
39. **LUKA:** “…Chase?”
40. **CHASE:** “I remember.”
41. **LUKA:** “I remember.”
42. *(They both laugh. It's half crying. Neither of them minds.)*
43. **\[WIDE · the corridor door bangs open\]** Luke, in his Santa hat.
44. **LUKE:** “Where have you two BEEN?”
45. **LUKA:** “…Lunch?”
46. **LUKE:** “For TWO DAYS?”
47. **CHASE:** *(to Luka)* “Two days.”
48. **LUKA:** “It was me—” *(He stops. Looks at Chase.)* ^ “…It was us.”
49. **LUKE:** “What?”
50. **CHASE:** “It was us. Both of us.”
51. **\[CLOSE · Luke\]** He looks at the two of them on the floor for a long time.
52. **LUKE:** “…Merry Christmas.” ^ “Get out of my store.”

#### A2 — “Christmas Morning”

**Set:** foreshore26 (Woody Point foreshore, 2026: the same headland, the same view of the bay and the bridge, **no bench**, only grass) · **Time card:** Friday 25 December 2026, 7:10 am · **Music:** birds; then **two**, from a phone speaker

1. **\[WIDE · locked, the angle from 2.3\]** The headland. Where the bench will never be, Luka and Chase sit on the grass with takeaway coffees. Christmas morning, cool for once.
2. **\[INSERT · Chase's phone\]** A music upload page: **Pudding — two.** He hovers over **POST.**
3. **\[TOP-DOWN · Chase\]** His hands start to rise toward his head. They stop halfway. He laughs instead, and presses POST.
4. **\[INSERT\]** **Posted.** **Plays: 0.** **1.** *(Luka's phone pings in his pocket.)* **2.**
5. **LUKA:** “That's me.”
6. **CHASE:** “That's you.”
7. **\[INSERT\]** Chase opens the email from Moreton Bay Records (“Re: what else have you got?”), attaches **two.wav**, and types: **Sorry for the wait.** Sent.
8. *(Quiet. The bay.)*
9. **LUKA:** *(turning the faded 2040 lanyard over in his hands)* “Do you think about them?”
10. **CHASE:** “It's been a day.”
11. **LUKA:** “…Yeah.”
12. **CHASE:** “Every day, probably.”
13. **LUKA:** “What if I still— ^ what if we still turn into—”
14. **CHASE:** “Then I'll be awake.”
15. *(Luka looks at him. Nods.)*
16. **LUKA:** *(taking out his phone)* “It's not Sunday.”
17. **CHASE:** “Ring him anyway.”
18. **\[INSERT · Luka's phone\]** Calling: **RUE (BRICK).** The old double trill begins. *(Cut before anyone answers. Rue is never seen or heard again.)*
19. **\[MONTAGE · three quiet held frames, the song playing; only the first has any dialogue\]**
    - The 2026 store a few days later. Luka at the new Hero Table, polishing. He gets to 98%, looks at a smudge, and leaves it. Chase: “You missed a bit.” Luka: “I know.”
    - Jordan up the ladder taking the tinsel down. Luka at the bottom, holding the ladder, letting him.
    - **The Wall.** The 1987 Polaroid. The PUDDING cassette. And a new print: four men on a rooftop at golden hour inside a ring of yellow lights. A drone took it. The two older men are faint in it, like a double exposure, but they're there.
20. **\[WIDE · Woody Point\]** The grass where the bench would have been. Wind.
21. Title: **TWO.**
22. *Credits roll (see C).*
23. **After the credits, an A-only coda — “One possible 2040”:**
    - **\[CLOSE · locked\]** A store counter we don't quite recognise. A phone rings. Two older hands reach for it at the same time: one with a faded blue lanyard looped round the wrist, one with no scars on it at all.
    - **VOICE 1:** “I'll get it—”
    - **VOICE 2:** “—I've got it.”
    - *(Both laugh. We never see their faces.)*
    - Black.

### ENDING B — “Again”

#### B1 — “Again”

**Set:** hq\_roof → reddy26 → montage · **Music:** a stripped-down, lo-fi “two”

1. **\[INSERT\]** NO.
2. **\[JARVIS-CAM\]** The pop-up: **Clearing 2 days, 6 hours, 54 minutes…** A progress bar. Then: **JARVIS has encountered Error 4044.**
3. **LUKA:** *(a small laugh)* “Error 4044.”
4. **CHASE:** “Forgets who you are.”
5. **LUKA:** “Then forgets who it is.”
6. **CHASE:** “Should we leave ourselves something? ^ Like last time? A tape?”
7. **CHASE (2040):** “No.”
8. **CHASE:** “Why not?”
9. **CHASE (2040):** “Because if you leave a tape, you'll know. ^ And if you know, you won't get here.”
10. **LUKA (2040):** “Let them wonder.”
11. **\[INSERT · Chase (2040)'s slate\]** The folder **two**: 2,847 files, and at the bottom one more, **two.wav**, the only one that's finished. (Everything on Chase's 2026 phone is about to be cleared. This copy stays in 2040.)
12. **CHASE:** “Look after it.”
13. **CHASE (2040):** “I will.”
14. **CHASE:** “Put it out.”
15. **CHASE (2040):** “I will.”
16. **CHASE:** “And finish the next one.”
17. **CHASE (2040):** “…Don't push it.”

**The goodbyes:**

18. **LUKA (2040):** *(to Luka)* “It's a long way.”
19. **LUKA:** “It's a phone call.” ^ “A minute at a time.”
20. **LUKA (2040):** “You're going to go back in. Into the fire.”
21. **LUKA:** “I know.”
22. **LUKA (2040):** “And then you're going to walk out the back.”
23. **LUKA:** “I know.” ^ “And then I'm going to come up here, and he's going to bring me a song.”
24. **CHASE (2040):** *(to Chase)* “You're going to be me for a while. ^ I'm sorry.”
25. **CHASE:** “Don't be.” ^ “You turned out all right.” ^ “Eventually.”
26. **LUKA (2040):** *(to Luka, as Luka reaches for his snapped lanyard)* “Keep your lanyard.”

**The call.** *(Exactly as A1 steps 19–25: the split screen, Luke in his Santa hat, “…Is it them?”, “Please answer yes or no.”, “Yes. ^ Obviously yes.”)* White.

**Home, without memories.**

27. **\[WIDE · locked, the backroom, Thursday 24 December 2026, 18:58\]** The same frame as A1 step 37. Smoke clears. Two men on the floor.
28. **\[TOP-DOWN\]**
29. **CHASE:** “…Why are we on the floor?”
30. **LUKA:** “Why do you smell like a—” ^ “…like a storm?”
31. **\[CLOSE · Luka's hand\]** It goes to his chest. His lanyard is there, snapped and knotted back together. He doesn't know why.
32. **\[WIDE\]** The door bangs open. Luke, in a Santa hat.
33. **LUKE:** “Where have you two BEEN?”
34. **LUKA:** “…Lunch?”
35. **LUKE:** “For TWO DAYS?”
36. **LUKA:** “It was me.”
37. **LUKE:** “What was?”
38. **LUKA:** “Whatever it was. It was my call.”
39. *(Chase looks at Luka. A beat.)*
40. **CHASE:** “…It was both of us.”
41. *(Luke and Luka both look at Chase.)*
42. **CHASE:** “Dunno. ^ Felt right.”
43. **\[WIDE · later, the dark shop floor\]** Luke has gone. Luka stands at the new Hero Table with a cloth. Chase sits on the counter, humming a melody, the bridge of “two”, without noticing.
44. **LUKA:** “What's that?”
45. **CHASE:** “…Dunno.” ^ “Something I'm working on.”
46. *(Luka polishes. At 98% he stops at a smudge, looks at it for a while, and leaves it. He doesn't know why.)*

**“Again” — the montage.** Held frames, each with a small date card and at most one line, over the lo-fi “two”. About 2.5 s each. This is the loop: fourteen years happening again, and everything in it necessary.

47. **2027** — The Redcliffe store at Christmas. Luka up a ladder hanging tinsel himself. Jordan at the bottom: “I could've—” Luka: “I'll do it.”
48. **2029** — Chase's laptop: **UNFINISHED — 640 items.** Top of the list: **two (not yet).**
49. **2031** — A festival poster, Redcliffe jetty stage, 4:10 pm: **PUDDING.** A sticker slapped across it: **CANCELLED.**
50. **2031** — Rue's corkboard: Sundays ticked, one after another. LADS. LADS. LADS.
51. **2033** — Woody Point jetty, sunset. Luka and Chase laughing so hard they blur. *(This is the moment the face-down photo was taken.)*
52. **2034, Sunday 24 December, 6:00 am** — Luka on the phone in grey storm light: “Can you come in? I'll do it, I just need another pair of hands.”
53. **2034** — Smoke. A hand. A lanyard.
54. **2035** — A funeral. Chase at a lectern, silent. At the very back, a figure in a long coat.
55. **2037** — Every screen in the country: a silhouette at a desk. **THE MANAGER.**
56. **2040, Saturday 22 December** — Chase, older, in the Redcliffe backroom, wiring four display chips into a machine. The kettle's screen asks him to name it. He thinks. Types **DES.** “Dunno. ^ Felt right.”
57. **\[MATCH CUT · the exact frame of 1.2, step 1\]** **Tuesday 22 December 2026, 11:58.** Luka steps back from a spotless Hero Table. “Spotless.” The phone rings. “Optus Redcliffe, Chase speaking.” *“…2040. Will you accept the charges?”* “Just say yes. It's probably Margaret.” “…Yes?”
58. **White** — cut *before* the explosion.

#### B2 — “Christmas Morning”

**Set:** parade (Woody Point foreshore, 2040, **the bench**) · **Time card:** Tuesday 25 December 2040, 7:10 am · **Music:** birds; then **two** out loud

1. **\[WIDE · locked, the angle from 2.3\]** The headland after the storm, everything green and washed. On the memorial bench, Luka (2040) sits on his own plaque. Chase (2040) sits beside him. Two takeaway coffees.
2. **CHASE (2040):** “Council's going to have to change the plaque.”
3. **LUKA (2040):** “Leave it.”
4. **\[INSERT · the slate\]** Drafts. One draft fourteen years old: **Re: what else have you got?** to Moreton Bay Records, dated December 2026, empty. Chase (2040) attaches **two.wav** and types: **Sorry for the wait.** Sent.
5. **LUKA (2040):** “Who's that to?”
6. **CHASE (2040):** “A label. From 2026.”
7. **LUKA (2040):** “They'll be retired.”
8. **CHASE (2040):** “Then they'll have time to listen.”
9. **\[MID\]** He props the slate on the bench arm and plays **two** out loud, on a little speaker, in public. The first time Pudding has played anything for anyone in fourteen years.
10. **\[WIDE\]** People on the foreshore path slow down. A kid on a skateboard (un-confiscated) stops. A pelican lands on the railing. Somebody's chip light blinks and they take it off their ear to listen properly.
11. **LUKA (2040):** “Why Pudding?”
12. **CHASE (2040):** “Long story.”
13. **LUKA (2040):** “I've got time.”
14. **\[CLOSE · Chase (2040)\]** He looks at him.
15. **CHASE (2040):** “…Yeah.” ^ “You have.”
16. **\[INSERT\]** Chase (2040) takes the brick phone out of his coat pocket and turns it over in his scarred hand.
17. **CHASE (2040):** “We should take this back.”
18. **LUKA (2040):** “Both of us.”
19. **CHASE (2040):** “Both of us.”
20. *(They don't get up yet. The song plays on.)*
21. **\[CRANE · slowly up and away\]** Two men on a bench, a small crowd, a pelican, the bay, the bridge.
22. Title: **TWO.**
23. *Credits roll (see C).*

### C — Credits

**Music:** **two**, full length, using the player's collected samples (missing ones become bleeps, as in Rue), then the 1987 Pudding song as a short coda.

A slow scroll over simple low-poly vignettes (the bench, the bridge, the Valley in neon, the Starlight stage, the roof's ring of yellow drones). Credit cards:

1. **TWO**
2. **Starring** Luka · Chase · Luka (2040) · Chase (2040)
3. **With** Jordan · Luke · Teddy · Mia · Nadia · Jayden · Des (a kettle) · and Rue
4. **Samples collected** — the list of the player's samples with where each came from, ending with **Luka (laughing) — Ted Smout Bridge, 25 km/h**.
5. **People you met** — a Polaroid-style card for each named character except Rue (he gets no card; his brick phone appears on the final card of this sequence instead, with no caption), one line each:
   - *Teddy has said yes to everyone since Monday.*
   - *Mia played a gig at the Starlight. Forty people came. It was loud.*
   - *Nadia let her team do something dangerous. It went fine.*
   - *Jayden poured his slab on time. His dad is still filthy.*
   - *Luke still does sausages. Sausages still don't hang up on him.*
   - *Jordan ran the store for two days on his own at Christmas, and nobody thanked him. Thank you, Jordan.*
   - *Des (a kettle) asks everyone if they'd like tea. Everyone says yes.*
6. **Parody cards** (one each, white on black):
   - *No drones were harmed in the making of this game. Several were tethered.*
   - *Optus Cloud+ is not a real product. Please remember things yourself.*
   - *Nobody can fix JARVIS.*
7. **The last card**, different per ending:
   - *Ending A:* **Pudding — two** · Plays: *(a counter that ticks up slowly while the card is on screen)*
   - *Ending B:* **Pudding — two** · Sent 25 December 2040 · *“Sorry for the wait.”*

### PC — Post-credits: “Hold”

**Set:** reddy26 · **Time card:** Tuesday 22 December 2026, 12:10 · *(Plays after either ending.)*

1. **\[WIDE · locked\]** The 2026 shop floor, six minutes after the boys vanished. Smoke still hangs over the wreck of the Hero Table. Tinsel on the floor. Through the office door, Luke shouting into a phone (“—the WHOLE table—”). Jordan stands alone in the middle of it all.
2. The counter phone rings. Jordan looks at it the way you'd look at a snake.
3. **JORDAN:** *(answering)* “…Optus Redcliffe, Jordan speaking.”
4. **MARGARET:** *(voice only, down the line)* “Hello, love, it's Margaret. ^ Is Chase there? It's about my grandson's plan.”
5. **\[CLOSE · Jordan\]** He looks at the smoking crater where the display used to be.
6. **JORDAN:** “…He's in 2040.”
7. **MARGARET:** “Oh.” ^ “I'll wait.”
8. **JORDAN:** “It might be a while.”
9. **MARGARET:** “I've been coming here since it was a video shop, love.” ^ “I can wait.”
10. **JORDAN:** “…I'll put you on hold.”
11. **\[INSERT\]** He presses HOLD. Faint and tinny down the line, the hold music starts: the 1987 Pudding song.
12. **\[WIDE · locked\]** Jordan, alone, smoke, tinsel. He sets the receiver down, picks up the stepladder, carries it to the Yes wall, climbs it, and starts hanging the tinsel himself.
13. Black. Return to the title screen. **Chapter Select** and **Extras** unlock.

## 9. Puzzles and mini-games

**Design rule: it takes two.** Almost every puzzle needs at least two of the three characters, each doing the thing only they can. The player swaps (SWAP: Tab / Y / SWAP button) and the others follow as AI or hold a position when told (“Hold this” is a context action on any two-person switch).

|  | Luka | Chase | Chase (2040) |
| --- | --- | --- | --- |
| Body | Strong: lifts roller doors, brass plates, bins, charging racks; climbs | Quick: fits through gaps, rides pillion | A burned right hand: no fine work |
| Skill | People (talks to managers, Teddy, Nadia); keys and codes; **Hack** (from 3.2) | Electronics (**Wiring**); music (**Piano**, **Sequencer**); selling; **Samples** (records and plays them as lures) | **Chip View** (reads AR signs, codes, tags, patrol paths) at the cost of the **Signal** meter |
| Combat (3.4 only) | — (he's hacking) | **Tether** lasso; **Lure** | **Chip Ping**; **Coat** throw |

All mini-games can be skipped from the pause menu after two failures (a “Skip this?” offer, Rue-style), except the Choice.

### 9.1 Polish (1.1)

A top-down painted card of the Hero Table glass (a canvas INSERT, like Rue's CARDS), with smudges, fingerprints and one ghostly forehead print drawn as soft alpha blobs. A cloth cursor (mouse drag / touch drag / stick + hold YES) rubs away whatever it passes over. SHINE % = 1 − remaining smudge mass. At 99% the script makes Chase lean on it, which adds a fresh handprint. At 100%: a sparkle sweeps the glass, a bright chime, **SPOTLESS**. About 60–90 s. No fail. Accessibility: holding YES without moving polishes slowly on its own.

### 9.2 Stall (1.3)

A dialogue-choice duel in the corridor. Luke's SUSPICION meter (0–100) is drawn as Luke's left eyebrow, which rises as it fills, with a small bar under his portrait. Five rounds (script in 1.3). Each answer adds or subtracts suspicion. At 100 Luke opens the backroom door, sees the trench coat, Luka says “Chase's uncle”, and the meter resets to 50. Between rounds 3 and 4 the game forces a swap to Chase for the second half of the Wiring.

### 9.3 Wiring (1.3, L21)

Rue's Wiring, reskinned. Top-down on an open junction box. Four terminals on the left (2026 colours), four on the right (2040 colours: “teal-ish”, “warm grey”, “Yes yellow”, “the other blue”). Drag to connect. Wrong pairs spark harmlessly and Chase (2040) reads out a hint. In 1.3 it's split into two halves around a swap. At L21 it's the kettle-cord adapter: three wires plus one that “doesn't go anywhere” (it goes to the kettle).

### 9.4 Neural Chip Sale (1.5)

Rue's JARVIS Sale for 2040. A terminal over Chase's shoulder: a four-step chip-swap form (Customer · Verify · Swap · Opt in). Interference:

- SafeSense pop-ups land on top of the field you need; dismiss them in the order they arrived.
- **Buttons that run away:** OK slides away from the cursor; corner it.
- **Progress bar goes backwards:** press NO to make it go forwards.
- Name autocorrect: JAYDEN → JADE PLANT. Fix it by retyping (pick letters from a strip).
- MFA: “Code sent to customer's brain. Customer's brain is on 3%.” Wait three seconds while Jayden “charges” (he eats a muesli bar).
- The Chip View tutorial: the “verbal consent phrase” floats over Jayden's head and is only visible in Chip View.
- Jayden's THOUGHT pop-ups float up as flavour (THOUGHT: is this taking long · THOUGHT: I'm hungry · THOUGHT: he's good).

About 2 min. No fail; a soft timer only changes Jayden's thoughts.

### 9.5 Drone stealth (1.6, 1.7, 2.2, 2.5, 2.7, 2.8, 3.2)

- **Courtesy Drone states:** *Patrol* (soft blue scan cone on the floor, following a path) → *Curious* (amber; it turns to face whoever's in the cone; a “?” chirp) → *Escort* (red; it glides to the player and “hugs” them in a soft blue field) → **Safe Room** (13.7).
- Leave the cone while it's amber and it returns to Patrol after 2 s.
- **Lures:** Chase plays a sample through a dropped phone, a speaker, a piano or anything that makes noise. Drones within the sample's radius go to investigate for its duration, then return. Each sample has a lure strength (e.g. Kettle short and close; Boom gate long and far; Luka (laughing) longest of all, with its own drone line).
- **Cover:** Luka pushes or lifts heavy objects to block sightlines or hold doors.
- **Signal:** when Chase (2040)'s chip is on, a Signal meter fills; full means every drone in the zone turns to him (soft fail back to the zone start). Chip off empties it.
- Every zone has a fixed camera angle chosen so the cones are readable from it.

### 9.6 Public Piano (2.2)

A short rhythm game on the laneway piano. Five lanes (keys); notes fall in time with a 92 bpm click; four bars of the “two” verse phrase. Generous timing windows. Misses don't fail: the piano just plays quieter, so the drone takes longer to come and investigate. The limiter must be off first (Luka's brass plate plus Chase (2040)'s AR code).

### 9.7 Role Play (2.5, Teddy)

Rue's Role Play, simplified. Luka picks topics from a small list (“The gate” · “The computer” · “Your name” · “How long have you been here?”). Teddy only opens up after “Your name”. The reason-card puzzle that follows belongs to Chase: five physical cards plus the blank one he writes CHRISTMAS on.

### 9.8 Hover-scooter chase (2.5)

A three-lane straight-line chase along the bridge deck, about 90 s. Everyone's limited to 25 km/h, so nobody can catch anybody; the tension is comic.

- **Drones drop in** (a shadow telegraphs where): change lanes or get “hugged”, which costs 2 s and a line (“Gotcha! ^ For your safety!”).
- **Hover-cars** in the left lane politely yield (“After you!”).
- **Dash prompts:** “Are you sure?” press YES within 1.5 s or the scooter slows. Every fourth: “Are you sure you're sure?” needs YES twice.
- **Recording** (Chase on the pillion; a SWAP): hold to record **Drone whir** as one passes close.
- The scripted **laugh** cutscene fires at the halfway marker (2.5) and the sample is always granted.
- No fail. At the end, swerve onto the mangrove boardwalk.

### 9.9 Sausage Sizzle (2.6)

Two stations, SWAP between them.

- **Hotplate (Luka):** six sausages in a row, each cycling raw → browning → **ready** → burning. Turn them at “ready”. Onions need a stir every few seconds.
- **Front (Chase):** a queue of 2040 customers with orders in speech bubbles (bread + snag + onions? + sauce: tomato / BBQ / “none, for safety”). Assemble and hand over.
- Ten customers served → done. Three burnt snags → Luke takes the tongs for a few seconds: “Easy, Santa.” No fail.

### 9.10 Sequencer: “two” (2.10)

Rue's Sequencer, rebuilt.

- **Four sample lanes × 16 steps**, filled from the samples the player collected (picked from a list; any order). Missing samples become synth bleeps, as in Rue.
- **A lead lane** pre-written with the “two” melody (15.3), editable by toggling steps on or off.
- **A section strip:** INTRO · VERSE · CHORUS · VERSE 2 · **BRIDGE** · CHORUS · OUTRO. Everything but the bridge is pre-arranged.
- **The bridge** has an empty “feature” slot. The player auditions samples in it. Every one gets “Fine.” from Chase (2040) except **Luka (laughing)**, which triggers his line (“…That's the bridge.”) and locks in. Auto-place after 60 s if never tried.
- **Playback** in the scene is muffled and stops after the first chorus. The full song is first heard in 3.6.
- **\[ONE MORE PASS\] / \[IT'S DONE\]** loop as scripted in 2.10.
- Store `state.pattern` (lanes, steps, sample choices) for 3.6, the credits and Extras.

### 9.11 Blend In (3.1)

The Fun Monitor drone's beam sweeps the atrium. Inside it, the active character must be doing a festive action. Each is a context prompt next to a prop: **Pull cracker** (both pullers put goggles on first), **Hum** (hold YES to hold a note; a volume needle must stay under 40 dB), **Mince pie**, **“Merry Christmas!”** to a nearby staffer. Idle in the beam for 3 s → “Are you having fun?” → answer YES (it leaves) or NO (strike). Two strikes → the Quiet Corner (Safe Room variant). Swap to keep all three covered as it passes.

### 9.12 Hack (L21; boss stalls in 3.4)

Luka's phone screen as a full-screen card: a SafeSense “desktop” that keeps throwing pop-ups at him. Each pop-up is beaten by a known JARVIS bug:

- **Are you sure? → Are you sure you're sure?** YES, YES. (The third ask accepts anything.)
- **Buttons that run away.** The OK button flees the cursor; corner it.
- **Progress bar goes backwards.** Press NO; it goes forwards.
- **Password rules change while you type.** The rule line updates mid-entry; finish typing before it changes again (three short words).
- **Error 4044.** Press YES twice; it forgets what it was asking.

At L21: three pop-ups in a row, then ACCESS. In 3.4 each bug stall is a single pop-up.

## 10. The boss fight (3.4–3.5)

**Arena.** The top-floor office: about 24 m × 12 m. The glass wall on the long south side looks over the Valley in the storm. The console sits in the centre with Luka at it, facing the glass. The desk and the empty chair are at the west end. Four ceiling hatches and two window “drone ports” are the spawn points. Low furniture (a sofa, a planter of dead plants, two filing cabinets) gives the Chases something to move around.

**Camera.** Not fixed for the fight: a high, slow, three-quarter tracking camera that keeps Luka at the console and the active Chase in frame, easing toward whichever side the drones are coming from. (Every other gameplay scene uses fixed cameras.)

**The hack.** Climbs at about 0.3% per second when nothing is touching Luka (0 → 85% in under 5 minutes of clean play, about 6 with stalls and pressure). Any drone touching Luka stops it, and it drifts back at 0.5%/s while one stays on him. There are three scripted bug stalls (31%, 52%, 67%): the bar freezes, a pop-up sits over it, and a prompt says “SWAP — Luka”. The player swaps to Luka and clears a single Hack pop-up (9.12). The countdown on the glass is cosmetic: QUIET IN 15:00 ticking down at a compressed rate to 04:00 by 85%.

**The Chases.** No health bars. A “hug” from a Courtesy Drone wraps that Chase in a soft blue field for 3 s (can't act). If both Chases are wrapped at once, drones reach Luka. The AI Chase always goes for the drone nearest to Luka.

- **Chase — Tether:** aim (stick or mouse), YES to throw, hold to yank. Lassos one drone and yanks it to the floor (Courtesy: out; Guardian: strips the shield). 1.2 s cooldown.
- **Chase — Lure:** throw a sample (pick from a small wheel of collected samples). Drones in its radius divert for its duration. One out at a time.
- **Chase (2040) — Chip Ping:** a radial overload. Drops every unshielded drone within 4 m. While he's the active character, using it floods the screen with pop-ups for 2 s (purely visual; it's his chip). 8 s cooldown.
- **Chase (2040) — Coat:** hold YES to throw the trench coat over a drone; it flies blind into a wall. 15 s cooldown (he has to go and get it back).

**Drones.**

| Type | Behaviour | Answer |
| --- | --- | --- |
| Courtesy | Slow. Goes for the nearest person to hug. | Tether, Ping, Coat |
| Guardian | Bigger, shielded, heads for Luka. | Tether strips the shield → Ping or a second Tether |
| Pop-up | Hangs back and projects pop-ups onto the active Chase's view (they must be dismissed: NO). | Tether it down |
| Cleaning | Polishes a streak of floor so it's slippery for 6 s. | Avoid, or Lure |

**Waves** (by hack %): 0–25 Courtesy only · 25–50 add Cleaning · 50–75 add Pop-up and one Guardian at a time · 75–85 two Guardians, more of everything. The lines in 3.4 fire on schedule over the gameplay without pausing it.

**Assist.** If the hack has dropped by more than 10% in the last 60 s, spawn rates fall by a third until it recovers. **Story Mode** (an option) halves spawns and doubles the hack rate.

**At 85%** the fight ends and the 3.5 cutscenes run. The rest of the boss is cinematic. The player only acts again in 3.6 (Hold NO) and 3.7 (the Choice).

## 11. Controls and cameras

**Input** (as Rue, plus CHIP):

| Action | Keyboard / mouse | Gamepad | Touch |
| --- | --- | --- | --- |
| Move | WASD / arrows | Left stick | Left virtual stick |
| YES (confirm, examine, advance) | Enter, Space, left click | A | YES button |
| NO (cancel, fast-forward) | Esc, Backspace, right click | B | NO button |
| Run | Shift | RB | Push the stick further |
| SWAP | Tab | Y | SWAP button |
| CHIP (Chip View, Chase (2040) only) | Q | LB | CHIP button |
| Inventory | I | X | BAG button |
| Pause | P | Start | Pause icon |

**Movement.** Default “modern”: camera-relative, but **the input direction stays locked across a camera cut until the stick or keys are released**, so cuts never flip the player round (Rue's technique). “Tank” controls are an option. Walk 1.7 m/s, run 3.4 m/s.

**Gameplay cameras.** Each set defines zones (boxes on the floor); each zone has one fixed camera (position, look-at, FOV). Crossing into a zone cuts to its camera. Cameras are placed for composition first and readability second, as in Silent Hill and Resident Evil: high corners, low angles down corridors, long lenses across squares. A short ease (0.25 s) is allowed only on chained cameras in long corridors.

**Cutscene shots.** The vocabulary used in the script: ECU, CLOSE, MID, WIDE, INSERT (a painted readable card or a close prop shot), TWO-SHOT, THREE-SHOT, OTS, POV, LOW, TOP-DOWN, CRANE, ORBIT (speeding up, Chase's idea engine), PUSH (slow push-in), PULL OUT, TRACK, WHIP, CRASH ZOOM, SPLIT SCREEN, MATCH CUT, JARVIS-CAM (from behind a screen, faces lit by it, a pop-up landing over them), LOCKED (no movement). Cutscenes run in 2.35:1 letterbox (bars slide in over 0.4 s). Provide a framing helper (frame a set of actors at a shot size from a side) that never puts the lens inside a wall, and widen the FOV on narrow screens so compositions survive phones.

## 12. Dialogue, pop-ups and cards

**Dialogue box.** Bottom of the screen. Portrait on the left (baked at boot from each character's 3D bust under the fixed light rig; a silhouette for THE MANAGER until the reveal), name label, text typing at the text-speed option (slow 24 / normal 48 / fast 110 chars/s). `^` inserts a 0.8 s beat. Small italic tags after the name: *off*, *whisper*, *muffled*, *quietly*, *down the line*, *on the PA*, *filtered*. YES completes the line, then advances; NO fast-forwards. Music ducks 40% under dialogue. Voice blips per character (section 4). The name label switches from THE MANAGER to LUKA (2040) with a one-frame glitch at the reveal.

**Choices.** A vertical list in the dialogue box. Yes/no asks (“Put the kettle on? \[YES\] \[NO\]”) use the same two buttons every time. Disabled options are greyed and **clunk** when pressed (Rue's sound).

**Pop-ups.** Two pooled DOM styles:

- **JARVIS (2026):** grey window, blue title bar, an icon, square buttons, a ding. Exactly Rue's look.
- **SafeSense (2040):** rounded translucent white glass, a soft blue glow, pill buttons, a two-note chirp. These appear on screens, on the glass wall, on scooter dashes, and in **Chip View** floating in the world.
- The Manager's prompt **OPT OUT ALL USERS? \[YES\]** is a SafeSense pop-up with a visible empty slot where NO should be.

**Cards (INSERTs).** Readable painted-canvas close-ups, as in Rue: the Hero Table glass, Post-its, flyers, the hold-music flyer, the order of service, the memorial plaque, the sticky note wall, the slate file list (two\_v1 … two\_v2847), Luke's invitation, the reason cards, the Safe Box code, the lift panel, the beforelunch password field, the face-down photo, the Remote's STORAGE FULL pop-up, the email draft, the four-men print. Paint at 2× for crisp text; fit to the screen.

## 13. Systems

### 13.1 Saving: the kettle

Every set has a kettle (or a tea urn, or Des). Interact: **“Put the kettle on? \[YES\] \[NO\]”**. YES saves the current scene and state to `localStorage` (in try/catch) with a kettle-click and a little steam puff. Continue resumes at the start of the saved scene with the saved flags, inventory and samples. Des speaks his line first (“Tea?”).

### 13.2 Inventory

Rue's BAG panel (modal while open). Items have a name, a one-line description and an Examine (a card). Items: the Remote; Luke's invitation; the brick phone; Nadia's lanyard; the Tether (“Felt right.”); the headphones (“For later.”); the Santa hat and beard; the coaster note; the faded 2040 lanyard (Ending A only).

### 13.3 Objectives

Top left, as in Rue: a yellow bar, the objective line, sub-items with checkboxes that strike through in yellow. Toggle in options.

### 13.4 HUD

Top right, in a dark rounded pill, Rue-style:

- **NO SERVICE** with an empty signal icon (the boys' 2026 phones in 2040). Shown from 1.6.
- **QUIET IN hh:mm:ss**, story time (it jumps between scenes; it is not a real-time timer except during the boss's compressed countdown). Shown from 1.6.
- **Samples: n**. Shown from 1.7.
- **HACK %**, a large centre-top bar, in 3.2 (L21) and 3.4–3.5 only.
- In the endings the signal icon fills to four bars as they land home (Rue's tape moment, echoed).

### 13.5 Chip View and Signal

Only while **Chase (2040)** is the active character and his chip is on. Hold CHIP: the screen tints faintly blue, scanlines appear, and AR becomes visible in the world: signs, prices, names, codes, patrol paths, ads (lots of ads: Cloud+, teeth, hover insurance, “Have you tried being safe?”). While it's on, the **Signal** meter fills (about 6 s from empty to full in most places; faster at checkpoints). Full means every drone in the zone turns to him. Releasing CHIP drains it. Some scenes require the chip off (prompted). Pop-up hazards (JARVIS in his eyes) appear only in Chip View or when he's active in the boss.

### 13.6 Samples

Chase records with his 2026 phone. Interact with a marked sound source and **hold YES for 1 s** to record; a little waveform card shows the take. Collected samples feed the 2.10 Sequencer, the lures, the boss's Lure wheel and the credits mix. In Ending B the phone is cleared, but the song survives in 2040.

| Sample | Where | Notes |
| --- | --- | --- |
| Display alarm | 1.3 (2026 store) | Fallback: Store radio |
| Kettle (“Tea?”) | 1.4 (Des) | Always offered |
| Chip chime | 1.4–1.7 | Neural Chip kiosk |
| Hover hum | 1.7 | A parked hover-car |
| Bay | 1.7 | Waves under the jetty with a pelican clack |
| Piano | 2.2 | After the limiter is off |
| Cicadas | 2.2 | The laneway palm |
| Brick phone trill | 2.4 | Rue's front room, before the tea |
| Boom gate | 2.5 | Teddy's gate lifting |
| Drone whir | 2.5 | During the chase |
| **Luka (laughing)** | **2.5** | **Scripted; always granted** |
| Sizzle | 2.6 | Onions on the hotplate |
| Train chime | 2.7 | The door chime |
| Ukulele | 2.8 | Mia's strum |

### 13.7 The Safe Room (fail state)

A padded white room with rounded corners, a beanbag, a kettle, a framed poster reading **YOU ARE SAFE NOW**, and one drone in the corner. **DRONE:** “You are not in trouble. ^ You are in danger.” then **“Would you like to try again? \[YES\]”** (the only button). Retry puts the player back at the last zone checkpoint with drones reset. In 3.1 it's the “Quiet Corner” (a beanbag behind a partition). Make it funny and quick: under 6 s from capture to retry.

### 13.8 Menus

As Rue: a title screen that slowly orbits a set (here: the 2040 Redcliffe store at dusk with a ring of drones outside), **Continue / New Game / Options**, then after first completion **Chapter Select** and **Extras**.

- **Options:** controls (modern / tank), text speed, text size, music, SFX, voice volumes, Reduce Flashing, objective on/off, **Story Mode**.
- **Chapter Select:** every scene, each granting the flags, items and samples a player would have by then.
- **Extras:** **Endings** (which have been seen; replay either); **Jukebox** (every sample; the 1987 Pudding song; “two” with the player's pattern); **The Bug List, 2040 Edition** (a card); **People** (character cards for everyone except Rue, who is represented only by a card of his brick phone); **Pudding Discography** (Ending A: “two (2026)”; Ending B: “two (2026–2040)”).
- **Pause:** Resume, Options, Controls, Skip this mini-game (when offered), Quit to title.

### 13.9 Accessibility

Subtitles are always on (the game has no spoken voice). Text speed and size. Reduce Flashing replaces every white flash and explosion with a slow dim bloom. Story Mode. Every hold-to-confirm can be set to press instead. Mini-game skip after two failures. Full gamepad and touch support.

## 14. Art direction

**Overall.** Low-poly, PS1-era proportions, flat or vertex-coloured shading, painted canvas textures at 128–256 px with nearest-neighbour filtering, exponential fog, blob shadows. Clean and stable: **no vertex snapping, no wobble, no affine warping.** One hemisphere light, one directional light and one movable spot (for lamps, screens and torches) per set, as in Rue.

**Palettes.**

- *2026 Redcliffe:* hot white sun, Yes yellow (#ffd21f), navy (#141d3a), store blue (#1f6fe0), tinsel silver and red, sky #8fd0ff.
- *2040 day:* the same palette slightly cooler, with a glassy blue-white accent (#bfe6ff) on chips, drones and SafeSense; padded surfaces in soft cream.
- *Storm (Sunday afternoon → Monday morning):* green-grey sky, wet reflective streets, lightning flashes (gentle under Reduce Flashing).
- *The Valley, Quiet Hours:* dimmed magenta and teal neon, red Chinatown lanterns, black wet bitumen, foam everywhere.
- *Optus HQ:* sterile white and mirror-floor reflections; the top floor dark with storm light; the roof gold after the rain.
- *Yes yellow* is reserved for meaning: the Yes sign, the drones after Luka takes them, the final glow.

**Characters.** Build them as in Rue (a parameterised low-poly rig from a LOOKS description: height, build, hair style, beard, clothes, colours, attachments; faces painted on canvas with swappable eyes, brows and mouths for expressions). Required attachments: lanyards with readable badges, Luka's Santa hat and beard (a separate mesh over his beard), Chase's earbud and headphones, Chase (2040)'s trench coat (a long skirted mesh with some sway), the chip light (a tiny emissive dot behind the ear), Future Luka's hood and coat (hood up or down), the brick phone, the Remote, the Tether (a coiled cable that can extend), gloves, bandages (3.7).

**Animations needed** (beyond Rue's set): polish (two-handed rub), lift-strain (roller door, brass plate), climb (ladder, pole rungs), lanyard twist, glance, head-in-hands (top-down), hands-rise-and-stop, scooter ride (driver and pillion), tether throw and yank, chip ping (a hand to the temple), coat throw, type on phone, hold headphones up, put headphones on someone, cry, laugh (big, helpless), bandage, sit on bench, sit on floor against wall, get up hurt, wave arm (drones), sizzle-flip, hum, pull cracker.

**Sets** (each built once and cached; dispose sets more than two scenes behind):

1. **reddy26** — Optus Redcliffe 2026 at Christmas: car park, floor, Hero Table, counter, the Wall, Luke's office, corridor, backroom.
2. **reddy40** — the same layout in 2040: chip displays, hover-trolley, SafeSense posters, Margaret's chair, the wreath on the Wall, Jordan's office, the backroom machine and Des.
3. **parade** — Redcliffe Parade (shops, the fish-and-chip shop, hover-cars), the jetty, Suttons Beach, Bee Gees Way laneway (mural, three bronze figures, public piano), the Woody Point foreshore and the bench.
4. **flat** — Chase (2040)'s flat: kitchen, sticky note wall, desk, bedroom door, balcony with Christmas lights.
5. **rue\_house** — Rue's Queenslander: front steps, verandah, front room, gate.
6. **bridge** — the checkpoint (booths, gates, towers, queued hover-cars) and a long bridge deck over the bay (instanced railings and lamps), mangrove boardwalk.
7. **sandgate** — station forecourt, gazebo and sizzle, station entrance.
8. **train** — one carriage interior with moving scenery outside (scrolling low-poly suburbs under a storm sky).
9. **valley** — Brunswick St Mall, Chinatown gate and lanterns, Ann Street, the Starlight (stage, desk, green room, stage door).
10. **hq\_atrium** — atrium, bubble-wrapped tree, choir, cracker and Secret Santa tables, lanyard desk, service lift.
11. **hq\_floors** — L12 archive (moving shelves), L21 server rows, L30 hangar (hundreds of docked drones, instanced).
12. **hq\_top** — the Manager's office (prologue and boss).
13. **hq\_roof** — the roof, the Santa sleigh set, the ring of 400 yellow drones (instanced), the city panorama (a painted backdrop plus low-poly skyline and the Story Bridge).
14. **foreshore26** — the Woody Point headland in 2026 (no bench) for Ending A.

## 15. Audio

All synthesised with WebAudio, as in Rue. Bake loops and stems at boot in an OfflineAudioContext behind the loading bar (**“JARVIS is loading your game.”**, a progress bar that sometimes goes backwards). Nothing is streamed or decoded from files.

### 15.1 Music cues

| Cue | Use |
| --- | --- |
| Store radio | 1.1: an instrumental 80s-rock Christmas pastiche (chugging square-wave guitar, sleigh bells). Not any real song. |
| 2040 store | 1.4–1.6: the store theme, slower, with a glassy chime layer |
| Seaside | 1.7, 2.2: sunny and slightly off-kilter, cicadas |
| Stealth | drone scenes: low pulse, filtered |
| Checkpoint | 2.5: twangy, tense |
| Chase | 2.5 scooter chase: fast chiptune “two” chorus |
| Sizzle | 2.6: sunny, ukulele bass |
| Quiet | 2.8–2.9: almost nothing; whispered crowd, muffled thunder |
| Boss | 3.4: the “two” verse and chorus as driving boss music, never the bridge |
| **two** | 3.6 and the credits: the full song |
| The Manager's motif | the prologue, the address, the PA, the reveal |

### 15.2 Leitmotifs

- **The 1987 Pudding song** (from Rue): D major, 92 bpm, chords D – G – Bm – A, melody D5 F#5 A5 F#5 E5 G5 B5 A5 | F#5 A5 D6 B5 A5 F#5 E5 D5. Used as the national hold music (a thin chiptune version), Mia's ukulele, Rue's Walkman, the end of “two”, and the post-credits.
- **The JARVIS restart chime** (from Rue, keep it identical): three rising notes, **C5 – E5 – G5** (MIDI 72, 76, 79), 0.2 s apart. In Two it's heard in only two places: when Future Luka presses NO, and at the very end of “two”.
- **The Manager's motif:** the restart chime upside down. **G5 – E5 – C5**, slow, falling, on a soft sine with a long tail. Used under the prologue, the Christmas address, the PA lines and the reveal. Never point out that it's the chime reversed.

### 15.3 The song “two”

- **92 bpm** (the same heartbeat as the 1987 song), 16th-note steps.
- **B minor**, the relative minor of the 1987 song's D major: the same notes, a different feeling.
- **Structure:** Intro (2 bars) · Verse (8) · Chorus (8) · Verse 2 (8) · **Bridge (8)** · Final chorus (8, **in D major**) · Outro (2): 44 bars, about 1 min 55 s.
- **Chords:** Verse Bm – G – D – A · Chorus G – D – A – Bm · Bridge Em – G – A – A · Final chorus **D – G – Bm – A** (the 1987 progression).
- **Lead (verse, eighth notes, one bar per line):**
  - Bm: F#5 D5 F#5 D5 E5 F#5 A5 F#5
  - G: G5 F#5 E5 D5 B4 D5 E5 –
  - D: F#5 D5 F#5 D5 A5 B5 A5 F#5
  - A: E5 C#5 E5 F#5 E5 – – –
- **Lead (chorus):**
  - G: B5 – A5 G5 F#5 – D5 –
  - D: A5 – F#5 – D5 E5 F#5 –
  - A: E5 – C#5 – E5 F#5 A5 –
  - Bm: F#5 – D5 – – – – –
- **Bridge:** drums drop out. A held pad. The lead plays D5 → F#5 (the motif turned upward) once every two bars. **Luka (laughing)** hits on beat 1 of bars 1 and 5. The Drone whir sample (if collected) swells under it as a pad.
- **Final chorus:** modulates to D major and the lead plays **the 1987 Pudding melody**, one note per two steps over two bars, twice, while the four sample lanes play at full.
- **Outro:** the last D rings; then the restart chime (C5 – E5 – G5).
- **Sample lanes:** the four the player chose in 2.10 (Kettle click on the hats, Boom gate or Train chime on the snare, Hover hum or Bay as a texture, Ukulele or Piano doubling the chords; any assignment works). Missing samples fall back to synth bleeps.

### 15.4 The laugh and the voicemail

There's no recorded speech in the game; voices are blips. Two moments need more:

- **Luka (laughing):** synthesise a recognisable, warm, helpless laugh: a sequence of short voiced “ha” bursts (filtered noise plus a pulse at Luka's blip pitch, with an “ah” formant pair around 700 Hz and 1200 Hz), each falling slightly in pitch, with breaths between and an irregular rhythm. Two to three seconds long.
- **The voicemail** (2.3): Luka's blip voice through a phone-band filter (300–3400 Hz) with tape hiss.
- **Optional, for the real thing:** keep one clearly named constant for each (`LAUGH_CLIP`, `VOICEMAIL_CLIP`) that accepts a base64 data URI. If filled, the game decodes and uses the real recording instead of the synth version. It still ships as one file. (Luka and Chase could record their own.)

### 15.5 Voice blips and SFX

Voice blips: section 4. SFX to synthesise (reuse Rue's recipes where they exist): reverse-charge double trill; operator; the arrival BAM (white noise burst plus a falling sub and glass tinkles); display alarms; kettle boil and click; Des's chirp; hover hum; chip chime; SafeSense chirp; JARVIS ding; drone hum, scan, “?” chirp, hug field, docking clunk; safety-foam bloom; tether whip and yank; chip ping zap; coat whoosh; boom gate; scooter whine; sizzle; train door chime; ukulele strum; brick phone trill; thunder and rain (on glass, on a roof, on a street); cicadas; waves and pelican clack; whispering crowd; 40 dB choir hum; cracker snap; lift ding; server hum; the restart chime; tape hiss; heartbeat-free ringing for 3.5.

## 16. Technical architecture and performance

**Structure** (mirroring Rue's engine, so the two games feel like siblings). If Rue's source is available, reuse its patterns directly. Otherwise:

- Registries: `CONFIG`, `CHARACTERS`, `LOOKS`, `ANIMS`, `SETS`, `ITEMS`, `SCENES`, `CUTSCENES`, `MINIGAMES`, `CARDS`, `STRINGS`, `SAMPLES`, plus `SCENE_ORDER` and `ACTS`.
- **A scene** is data: `{ title, set, env, time, playable, swap, hud, music, spawn, hotspots, steps, grants }`. `steps` is a list of `['cutscene', id]`, `['control', who]`, `['follow', who]`, `['objective', text]`, `['roam', { until, hint, auto }]`, `['minigame', id, params]`, `['do', fn]`.
- **A cutscene** is a list of step objects run by one async runner: `say`, `choose`, `ask`, `shot`, `move`, `face`, `place`, `act`, `expr`, `prop`, `spawn`/`despawn`, `wait`, `par` (parallel), `do`, `sfx`, `music`, `fade`, `flash`, `title`, `popup`, `card`, `hud`, `flag`, `item`, `objective`, `letterbox`, `split`, `timelapse`, `stare` (capped at 4 s). Every step must finish instantly when the cutscene is skipped (NO held).
- **Hotspots:** `{ id, at, r, verb, by, when, text | steps | ask | door | kettle | sample }`.
- **State:** `{ scene, flags, inventory, active, samples, names, pattern, hack, choice, endingsSeen }`. Options and profile (completion, endings seen) live outside the save.
- **Test hooks:** `?autoplay=1` auto-advances everything and plays every mini-game with an autoplayer; `&scene=2.3` starts there; `&stop=2.5` ends after it; `&speed=8`; `&fast=1` runs every cutscene as if skipped; `&ending=A|B` picks the choice under autoplay. Expose `window.TWO_TEST = { ready, done, scene, step, log }`.

**Performance rules.**

- Fixed 60 Hz update with interpolated rendering; clamp long frames.
- **No allocation in per-frame code.** Preallocate vectors, pools and particle buffers.
- Merge each set's static geometry into a few meshes by material; use **InstancedMesh** for repeats: drones (the hangar's hundreds and the roof's ring of 400), bollards, railings, lamps, crowds, lanterns, cobbles.
- Lambert or Basic materials with vertex colours; small canvas textures; one texture atlas per set where practical.
- Blob shadows only (no shadow maps).
- Pool character rigs across scenes; never build a rig mid-cutscene.
- Build the next scene's set during the current scene's last shot or a fade, so loads hide behind black. Keep at most three sets alive.
- Adaptive pixel ratio: drop it if frame time stays above 20 ms for a second; raise it again when there's headroom. Start lower on touch devices.
- Bake all music loops and long SFX at boot; play buffers at runtime.
- **F2** shows an overlay with frame time, draw calls, triangles, textures and the current pixel ratio.
- Target: under 300 draw calls per frame on any set and steady 60 fps on a mid-range laptop; acceptable 30+ on a recent phone with no hitch longer than 50 ms during play.

**Recommended build order.** (1) Engine core, input, renderer, dialogue, cutscene runner, cards, pop-ups, saves. (2) A vertical slice: reddy26 with 1.1–1.3, the Polish, Stall and Wiring mini-games, and the SWAP tutorial. (3) reddy40 and 1.4–1.6, with Chip View and drone stealth. (4) The remaining sets in story order. (5) The boss. (6) The endings, credits and post-credits. (7) The menus, Extras and polish. Run `?autoplay=1` through the whole game after each step.

## 17. Acceptance checklist

**Story and script**

- [ ] Every scene from P to PC exists in order, and every line in section 8 appears word for word.
- [ ] The must-have opening: Luka polishes the display to 100% SPOTLESS → the call → “Just say yes. It's probably Margaret.” → BAM, the display destroyed, Luka blown over the counter → a trench-coated figure out of the smoke → Future Chase.
- [ ] Future Chase doesn't remember this block of time, says so in 1.2, and it's resolved in 3.7 (“This was the bit that fixed it.”).
- [ ] Luka's death is brought up repeatedly before the reveal: 1.2, 1.4, 1.8, 2.3, 2.4, 2.6, 2.7, 2.9.
- [ ] Future/Past Chase scenes: 1.2, 1.5, 2.1, 2.2, 2.10, 3.3, 3.7, endings. Future Chase asks him to keep making music and not do what he did (2.10).
- [ ] The reveal at HQ is Future Luka. Only the five ledger hints exist, and all are paid off in 3.3.
- [ ] The boss: pinned at 85%; pleading; a near change of heart; the drone; Past Luka thrown into the wall; played as a death with no humour; 99%; “He's an inferior version of myself; he lets himself be ruled by fear.”; 100%; “No…”; he gets up; “You're the one who's ruled by fear.”; the drones surround Future Luka; Chase plays “two” on headphones; Future Luka cries and realises.
- [ ] The Choice: both buttons live, no hint, both endings complete and reachable, and neither framed as correct.
- [ ] Rue appears exactly once (2.4). Nowhere else, not even by voice.
- [ ] Bon Jovi > Kanye appears exactly once (1.1). Shortened-word jokes appear exactly three times (calc, cred, bics).
- [ ] No real song lyrics anywhere. No real songs played.

**Feel**

- [ ] Clean PS1 look: no wobble, no warping, no jitter.
- [ ] Fixed gameplay cameras; cinematic, moving cutscene cameras; letterbox in cutscenes.
- [ ] No pause over 4 s; no stare counter.
- [ ] Jokes land fast. The honest moments (1.8, 2.1 balcony, 2.2 piano, 2.3, 2.4 gate, 2.7, 2.9, 2.10, 3.3, 3.5, 3.7, both endings) play straight; a small release may follow once a moment has landed, except in 1.8, 3.5 and the Choice, which get none.

**Systems**

- [ ] Every puzzle marked “needs both/all three” actually requires swapping.
- [ ] Kettle saves work and survive a reload; the game still runs with storage blocked.
- [ ] The Luka (laughing) sample is always granted and is the bridge of “two” in 3.6.
- [ ] Desktop, gamepad and touch all complete the game.
- [ ] Reduce Flashing covers every flash and explosion.
- [ ] `?autoplay=1&ending=A` and `&ending=B` both run to the post-credits without errors.

**Performance**

- [ ] No hitch over 50 ms during play on a mid-range laptop; F2 overlay present; draw calls under 300.
