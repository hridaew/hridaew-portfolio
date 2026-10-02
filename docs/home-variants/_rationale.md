WHY THESE FIVE. Both judges put three of the same concepts in their top five: generative-1 Converge (31/35), play-2 Pay No Attention (32/31) and generative-3 Nap (32/29). I took those first. For the last two slots there was a near three-way tie: instrument-2 Phosphor (33/31), provocateur-2 Hit Board (33/31) and vernacular-1 Rating Plate (31/34). Each judge listed the other's pick as their own alternate: the hiring manager named Hit Board for slot 5, and the creative director benched Rating Plate as the 'hot, warm' alternate. So Hit Board and Rating Plate is the pair both judges can accept, and it gives the strongest spread.

DISTINCTNESS, axis by axis:
- World: (1) Converge is a photographer's 18%-grey studio cove. (2) Velvet Nap is a couture textile. (3) Pay No Attention is a 1980s LCD toy on a cutting mat. (4) Hit Board is a homemade cardboard arcade with a flip-dot machine. (5) Rating Plate is an industrial appliance rating plate with an AI scanner.
- Primary input: (1) orbit drag plus scrubbing the loss curve. (2) stroke and press-and-hold. (3) timed discrete lever presses, keyboard-native. (4) a ballistic throw (slingshot or flick). (5) the pointer as a light source, plus a drag-and-hold viewfinder and a pull-down REVIEW lever.
- Rendering: (1) WebGL2 instanced, order-independent gaussian accumulation fed by a CPU matching-pursuit fitter. (2) a WebGL ping-pong vector-field simulation plus a full-screen shell-fur shader. (3) DOM, inline SVG and CSS masks, with no canvas render loop. (4) Canvas2D sprite atlas with a dirty list. (5) a single-pass WebGL1 analytic anisotropic BRDF over a height map registered to the DOM text. Three pages use WebGL, but no two share a pipeline.
- Type, with no shared families: (1) Anybody + Fragment Mono. (2) Bodoni Moda + Azeret Mono + Caveat (Caveat only as a mask). (3) Doto + Archivo. (4) Jersey 10 + Big Shoulders Stencil Display + Permanent Marker + Courier Prime. (5) Michroma + Barlow Condensed + Martian Mono. All were verified as live on the Google Fonts css2 API.
- Colour temperature: (1) neutral achromatic grey. (2) cold saturated ultramarine. (3) temperate deep green. (4) warm earthy kraft. (5) hot red.
- Grounding: (1) Savor. (2) Memory Care. (3) the Wizard-of-Oz prototyping process, across all four projects. (4) Saving Baby J plus Virdio. (5) Domis.

FIXES TO REMOVE COLLISIONS:
- Rating Plate's enamel moves from harvest gold to range red. Harvest gold sat next to Hit Board's kraft, and both judges flagged 70s kitsch. The red is grounded in the real research shot, which is a household electric range label.
- Pay No Attention's levers move from signal red to rhodamine magenta. This avoids clashing with the red plate and keeps it clear of classic handheld trade dress.
- Converge becomes fully achromatic: the only colour on that page comes from the work. That leaves saffron as Nap's signature yellow.
- Yellow is dropped from Hit Board's caution sticker.
- DeviceOrientation tilt is removed from Rating Plate and kept out of Nap, because the contract bans motion APIs. Light now comes from the pointer, tap-to-place, scroll elevation and idle drift.
- 'Did you step out of frame?' is used only in Hit Board, where it is the miss line. Pay No Attention's tab-leave pause says 'WIZARD AWAY' instead.
- I dropped the 'CV says 5+' dissent, as the hiring manager asked, and replaced it with harmless dissents: the cat and the butter chicken.

GRAFTS:
- Converge: shipped optimizer seeds so frame 1 is crisp (the creative director's fix for the 'mushy loader' risk), real colour reference media in the panel (hiring manager), an idle tour (from AUTOPATCH), and Phosphor's HARDCOPY plus the OBSCURA souvenir, turned into a print strip.
- Nap: skin twitch, 'both hands', and a synced tremble (all from senses-1); breathing and petting-driven playbackRate with a play toggle (provocateur-3); and a permanent pressed shadow so the words are legible before any sheen catches.
- Pay No Attention: an always-right demo wizard in attract mode, so all four projects show with no input; matching manual entries switch to real colour stills on success; typed participant notes at game over; and a practice mode with no timer, for accessibility.
- Hit Board: play-1's 'go on, hit me' face target, a net that tears at the impact point, and a converging shadow; the real game's near-miss feedback and its playtest lesson about holding a beat before the outro; and a typed PLAYTEST LOG as the finale.
- Rating Plate: provocateur-1's consensus-by-overprint, as three process-ink search lanes that register to black where they agree; an attract mode where the viewfinder demonstrates itself; a draggable REVIEW lever, so it is not just a scan to watch; and an explicit 'staged demo' label for honesty.

REJECTED:
- instrument-2 Phosphor. Excellent, but it would be the third WebGL page and a second technical instrument with mono readouts beside Converge, its cool chassis collides with Nap, and recruiters find knob panels intimidating. Its best ideas live on in the round: consensus made visible (Rating Plate) and HARDCOPY (Converge's strip).
- generative-2 is a near-duplicate of instrument-2.
- vernacular-2 Contact Sheet. The hiring manager likes it, but the creative director calls it a photographer-portfolio staple, and its cool grey monochrome collides with Converge. OBSCURA is still well covered by Converge's kimono fit and density view and by Hit Board's dithered Wong frame.
- play-1 and senses-3 are weaker throw concepts that overlap Hit Board; play-1's best details were grafted in.
- senses-2 Step Into Frame stays on the bench as the swap-in if a WebGL page fails feasibility.
- vernacular-3 is a twin of senses-2.
- senses-1 and provocateur-3 are weaker fur concepts than Nap; their best behaviours were grafted in.
- instrument-1, instrument-3, play-3 and provocateur-1 scored lower and carry larger-scope or trope risk. provocateur-1's ink metaphor was grafted into Rating Plate.

FEASIBILITY NOTE: no variant needs a CDN library. Every pixel source that JS reads into a canvas is inlined as a data URI, so readback can never be tainted in the artifact sandbox.