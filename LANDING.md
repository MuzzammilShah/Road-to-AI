# The landing page

This is how the home page (`/`) of docs.muhammedshah.com is built: what you see on it, where each part lives, how it works and how to change it, plus the decisions made along the way.

It was rebuilt in November 2026 (PR #42), replacing a Vanta.js globe and a grid of plain cards. The step-by-step recipes for everyday edits are in [MAINTAINING.md](MAINTAINING.md), section 12, and the rules for agents are in [CLAUDE.md](CLAUDE.md) under "Landing page".

## Contents

1. [At a glance](#1-at-a-glance)
2. [Where it came from](#2-where-it-came-from)
3. [Files](#3-files)
4. [How it works](#4-how-it-works)
5. [The hero](#5-the-hero)
6. [The section board](#6-the-section-board)
7. [The computer](#7-the-computer)
8. [The footer](#8-the-footer)
9. [Colours, fonts and dependencies](#9-colours-fonts-and-dependencies)
10. [Accessibility and fallbacks](#10-accessibility-and-fallbacks)
11. [Performance](#11-performance)
12. [Changing it](#12-changing-it)
13. [History and decisions](#13-history-and-decisions)
14. [Known limits and ideas](#14-known-limits-and-ideas)

## 1. At a glance

From top to bottom:

| Part | What you see | What makes it move |
|---|---|---|
| **Hero** | One full-bleed pixel-art lofi bedroom: a window onto a city (with a moon + stars at night, a sun + clouds by day), a Macintosh running code on the desk under a glowing lamp, a bed, bookshelf, clock, plant, framed picture, mug and a rug. The logo, the site's description, "Start reading" and "GitHub" overlay its upper-left wall. The whole room turns from a night room (dark mode) into a day room (light mode). | Pure SVG pixel art (no WebGL); ambient CSS keyframes (code typing, lamp glow, drifting clouds / twinkling stars, swaying plant, mug steam), paused off screen and off under reduced motion. |
| **Section board** | "Jump into any part of my journey": one rounded card per section. Each card has a small pixel animation (a neural net training, a book being read, a course being completed, a system being designed). | CSS keyframes, with SVG cables for the entrance. |
| **The computer** | A Bondi-blue, arched, translucent all-in-one computer in a dithered landscape. Its screen is a macOS Terminal window replaying a real training run from the notebooks. Scrolling pulls the camera out of the screen and round to "Feel free to explore my journey!" and three buttons. | WebGL2: the whole scene is one fragment shader. |
| **Footer** | "Road to AI" written in falling characters that settle into the letters and scatter from the mouse; then GitHub, Website, Blog and the copyright. | Canvas2D, a falling-sand simulation. |

Everything is client-side and static-export friendly. Nothing needs a server.

## 2. Where it came from

The interactions are ported from the landing page of [fumadocs.dev](https://fumadocs.dev), the framework this site runs on. It is MIT-licensed source code, taken at commit `55decd9b26284642a77454ca7888f522f44deb5b` of [fuma-nama/fumadocs](https://github.com/fuma-nama/fumadocs), from `apps/docs/app/(landing)/` and `apps/docs/components/mascot/`.

- **Licence:** every ported file starts with a header naming its original path. The full MIT text is in `components/landing/LICENSE-fumadocs.txt`. Keep both if you move or split files.
- **Ported:** the WebGL2 renderer, the dithering, the timing and scripting helpers, the cables, the hero's engine (boot sequence, pointer light, orbit, star field, speech bubbles), the Integrations board and its mechanism helpers, the pinned 3D scene with its camera and terminal-on-glass, and the footer's falling-sand wordmark.
- **Not copied:** the Fumadocs mascot, its wordmark, its copy, its testimonials and its assets.
- **This site's own:** the Earth, moon, satellites and pin; the character; the four section mechanisms; the computer's shape and its macOS Terminal; the training session; the rounded visual style; the left-column star field.
- **Left out on purpose:** Fumadocs' status bar, square ink-on-paper styling, registration marks, dithered theme switch, Markdown export routes, and the robot arm that places blocks (see section 14).

## 3. Files

```
app/(home)/layout.tsx            HomeLayout + the landing fonts as CSS variables on .landing-surface
app/(home)/page.tsx              gathers the sections (server) and renders the four parts
app/global.css                   --lp-* tokens, lp-* Tailwind colours, card glows, crossfade, twinkle
lib/shared.ts                    site name, description, GitHub/website/blog URLs

components/landing/
  LICENSE-fumadocs.txt           MIT licence of the ported code
  lib/
    mesh.ts                      WebGL2 renderer (parts, shadows, outline pass, dither, anchors)
    dither.ts                    Bayer matrices, dither masks, GLSL bayer8()
    motion.ts                    the tick grid (TICK = 125 ms), easings, helpers
    theme.ts                     onTheme(), isDark(), cssRgb() (any CSS colour -> RGB)
    script.ts                    mount()/nearby(), clocks, pops, whenShareSeen()
    cable.ts                     the board's cables and their wipe animation
    status.ts                    no-op stub (Fumadocs had a status bar)
  ui/
    chip.tsx                     the hero's section labels (rounded links)
    github-icon.tsx              GitHub mark (lucide 1.x has no brand icons)
  hero/
    index.tsx                    hero layout: text column, buttons, horizon, scroll button
    starfield.tsx                static stars over the text column
    stage.tsx                    canvases, speech bubble, Bangalore pin, labels (client)
    engine.ts                    boot, light, Earth spin, moon/satellites, pin, character, scroll-set
    scene.ts                     GLSL: Earth, orbit ring, moon, solar panels, star field; orbiters()
    earth.ts                     the land mask: world-atlas -> canvas texture
    talk.ts                      speech bubbles and their LINES
  character/
    sprite.ts                    the character as an ASCII grid; eyes, glint
    paint.ts                     paints the grid into pixels in the page's colours
  sections/
    board.tsx                    the board and its cards (client)
    engine.ts                    the entrance: pops, cables, the two-at-a-time queue
    stage.tsx                    mechanism helpers: Stage, Px, art(), choreograph()...
    mechanisms.tsx               one mechanism per section + the fallback
  start/
    index.tsx                    the closing section: line + buttons
    stage.tsx                    the 230svh pin and sticky stage (client)
    engine.ts                    camera on scroll, CRT power-on, session playback
    scene.ts                     GLSL: the computer, hills, ground, moon; the glyph atlas
    data.ts                      the Terminal session: title bar, prompt, the training log
  footer/
    footer.tsx                   wordmark + links + copyright
    wordmark.tsx                 the falling-glyph "Road to AI"

types/topojson-client.d.ts       minimal types for topojson-client
```

`'use client'` is only on the parts that run scripts (`hero/stage.tsx`, `sections/board.tsx`, `start/stage.tsx`, `footer/wordmark.tsx`). The section data is read on the server in `page.tsx` and passed down as props.

## 4. How it works

### Rendering

- **`lib/mesh.ts`** is a hand-written WebGL2 renderer (about 1,500 lines, no three.js). A figure gives it:
  - **parts:** instanced boxes, cylinders, prisms and spheres, each with a material;
  - **`scene` GLSL:** a `figure()` function that colours its own materials;
  - **`backdrop` GLSL:** colours everything no part covers.
- **Passes:** the renderer draws into several targets (colour, depth/id/edge data, rims), then runs an outline pass that inks the silhouettes.
- **Dither:** shading is quantised and dithered on an 8×8 Bayer matrix, which gives the pixel-print look.
- **Anchors:** HTML elements can be pinned to 3D points (`mesh.anchor()`). That's how the satellite labels and the Bangalore pin follow the scene.
- **Resolution:** a "dot" of the dither is at most 2 device pixels; the canvas is upscaled with `image-rendering: pixelated`. A GPU fence watches frame times: when frames come back late it drops to 1 device pixel per dot, then tries finer again after a doubling wait.
- **Context:** it asks for a `low-power` context without antialiasing, and uses `KHR_parallel_shader_compile` when available so compiling never blocks the page.

### When things run

- **Only on change:** a figure draws only after something changed (`invalidate()`); nothing redraws a still picture.
- **Only on screen:** each canvas pauses when off screen (`IntersectionObserver`).
- **Only when near:** each part's script is created about one screen before you reach it (`mount`/`nearby` in `lib/script.ts`) and torn down on unmount. React StrictMode mounts twice in development; the engines survive that, and the WebGL context is reused.
- **One clock:** all timing sits on a 120 bpm grid. A beat is 500 ms and a tick (a sixteenth) is 125 ms.

### Theme

- **Tokens:** all colours come from CSS custom properties (`--lp-*`) defined on `.landing-surface`, the class `app/(home)/layout.tsx` gives the home layout. The engines read them with `getComputedStyle` on their own canvas.
- **Colour parsing:** `cssRgb()` turns any CSS colour (hex, `rgb()`, `hsl()`, `oklch()`, `color-mix()`) into RGB, through a cached 1×1 canvas when needed. The section accents are `oklch()`.
- **Switching:** `onTheme()` watches `<html>`'s class (set by `next-themes`). On a switch, every canvas redraws synchronously, inside the theme switch's view transition, so the 350 ms crossfade (`::view-transition-*` in `app/global.css`) never shows old colours.
- **No `:has()` scoping:** Fumadocs scoped its tokens with `:root:has(> body > .landing)`; this site never does. Layout-wide `:has()` selectors are re-checked on every DOM change, so they're forbidden here (see CLAUDE.md, performance notes).

## 5. The hero

The hero is **one full-bleed pixel-art lofi bedroom**, drawn as pure SVG pixel art (no WebGL). It is the room where the AI journey happens: a window onto a city, a Macintosh running code on the desk under a glowing lamp, a bed, a bookshelf, a wall clock, a plant, a framed picture, a mug and a rug. It transforms completely between themes — a cosy night room in dark mode, a bright day room in light mode — and has a layer of subtle, always-on ambient motion.

**Files:** `hero/index.tsx` (layout + the text overlay), `hero/room.tsx` (the whole scene), `hero/pause-offscreen.tsx` (the off-screen pause). The old globe/character/satellite files (`scene.ts`, `earth.ts`, `engine.ts`, `stage.tsx`, `talk.ts`, `starfield.tsx`, `character/`, `ui/chip.tsx`) are no longer used by the hero.

**Layout** (`hero/index.tsx`)

- The scene is one picture that fills the hero. On desktop the room is pinned full-width to the bottom at its natural aspect, and the wall colour fills the space above it (the same colour, so the join is invisible); the logo, description, "Start reading" and "GitHub" overlay that upper-left wall.
- On phones the intro sits over the wall colour with the room strip below it, reading as one continuous surface.
- The logo, text and buttons are **theme-reactive** to match the wall: light-on-dark on the night wall, dark-on-light on the day wall (the light/dark logo swap, `fd-foreground` text, `fd-primary` button).
- The section is at least one screen tall minus the navbar, with the scroll-down button at the bottom.
- "Artificial Intelligence" in the description is split out of `appDescription` (`lib/shared.ts`) and set apart. There are **no section links in the hero** — the section board below carries them.

**The drawing** (`hero/room.tsx`)

- A **200×90 cell grid** (square cells), drawn as SVG `<path>`s with `shapeRendering="crispEdges"` and `image-rendering: pixelated`, reusing the stage helpers (`rect`/`art`/`dither` from `sections/stage.tsx`). `preserveAspectRatio="xMidYMid meet"`.
- Each object is built from a **base tone plus shadow and highlight tones**, lit from the window and the desk lamp, with ambient-occlusion shading where the wall meets the floor and in the corners, and cast shadows (under the desk).
- **The upper-left quadrant is kept clear dark/light wall** for the text overlay.
- **What's in the room:** the window (centre), a curtain down its right side, a city skyline; the desk (right) with the Macintosh, a mug and the angle-poise lamp; a bookshelf of colour-coded spines and a wall clock above/over the window; a bed (lower-left); a plant; a framed picture (left of the window); and an area rug on the floor.

**Day ↔ night** (tokens in `app/global.css`, layers in `room.tsx`)

- Every surface reads a **semantic `--lp-room-*` token** (wall, floor, wood, metal, fabrics, the Mac body, the code colours, the rug…). The night values live on `.landing-surface`; `.light .landing-surface` overrides them with day values. So toggling the theme repaints the whole room — dark walls and wood by night, cream walls and light wood by day — in one place, with no JS.
- **The view outside the window** has two layers in the SVG, `.room-night` and `.room-day`; CSS shows one per theme (`.room-day` is hidden by default and under `.light` the night layer is hidden). Night: a deep sky, a lit city silhouette, a crescent moon and stars. Day: a blue sky, a daylit skyline, a sun and clouds.
- **The clock hands** also swap by theme (a night hour vs a day hour), via the same `.room-night` / `.room-day` layers.
- The **Macintosh screen** stays on in both themes (a dark editor with syntax-coloured code) and the **lamp keeps glowing**, so the desk is always the warm focal point.

**Ambient animation** (keyframes in `app/global.css`, classes in `room.tsx`)

All of it is CSS keyframes on `transform`/`opacity` only (so the compositor plays them), gated behind `prefers-reduced-motion: no-preference`, and always-on while the hero is visible:

| Class | Motion |
|---|---|
| `.room-code-row` | the code "types" — each row fades in on its own delay and the block loops (a red power LED sits steady on the bezel) |
| `.room-glow` | the lamp's warm cone breathes in opacity |
| `.room-cloud` | the day clouds drift slowly right |
| `.room-star` | the night stars twinkle, each on its own delay |
| `.room-leaves` | the plant's leaves sway |
| `.room-steam` | two wisps of steam rise from the mug and fade |

- **Paused off screen:** `PauseOffscreen` (`hero/pause-offscreen.tsx`) is a small client wrapper that toggles `[data-room-paused]` on itself with an `IntersectionObserver` (mirroring the board's `playOnScreen`); the keyframes set `animation-play-state: paused` under it. Idle off screen = no animation work.
- **Reduced motion:** the whole animation block is inside `@media (prefers-reduced-motion: no-preference)`, so the static frame stands in.

## 6. The section board

**Layout** (`sections/board.tsx`)

- Width: 1024 px at most, or 1152 px when an odd number of sections needs three columns.
- Columns: one on phones, two from `md`, three from `xl` when the count is odd.
- Cards: each is a single rounded link named by its title. Hover and keyboard focus show the corner glows in the section's accent (`.landing-section-card` in `app/global.css`).

**Entrance** (`sections/engine.ts`): it plays once, when half the board is on screen.

- **Order:** cards pop in reading order on the tick grid. Each pop grows from a dot through a few scales, like an old desktop opening a window.
- **Cables:** each card lands on the end of a cable grown from the previous card. Cables start under a card, run through the gaps, and are covered by the next card as it pops.
- **Two at a time:** each card's mechanism starts as it pops. At most two play at once; the others wait their turn.
- **Keyboard:** focusing anything inside the board finishes the entrance at once.
- **Already passed or reduced motion:** the board is simply there, every mechanism resting on its final frame.

**Mechanisms** (`sections/mechanisms.tsx`, helpers in `sections/stage.tsx`)

- **The stage:** each is a 96×40-cell pixel stage (3px cells), with a lamp, a readout that rolls through its states, and a spec label underneath.
- **Drawing:** parts are SVG paths drawn with `rect`, `frame`, `art` (ASCII to cells) and `dither`.
- **Timing:** `choreograph()` turns a timeline of poses into CSS keyframes on the tick grid, so the compositor plays them with no JavaScript per frame.
- **Replay:** hovering or focusing a card replays its mechanism at double speed, in the section's colour.
- **Off screen:** mechanisms pause (`data-paused`).

| Section | Mechanism | Readout | Spec |
|---|---|---|---|
| Neural Networks | a 3-4-2 network: activations pulse forward, a gradient flows back, the loss gauge drops | forward → backward → loss 0.02 | micrograd |
| Library | an open book: two page flips, then a highlighter sweeps a line | reading → highlighting → noted | ch. 1-10 |
| Academy | a course card: four module ticks fill, a "DONE certified" stamp lands | module 1 … module 4 → completed | agentic ai |
| Workshop | client, api, db and cache boxes slide in, wires connect them, the deploy lamp lights | designing → building → shipped | system design |
| any other | a page whose lines type in | writing → published | notes |

## 7. The computer

**The scene** (`start/scene.ts`): the whole picture is one fragment shader that sphere-traces signed-distance shapes per pixel.

- **The computer:**
  - a rounded front block, the white frame round a 4:3 bulging screen;
  - merged into an arched back: in profile a quarter ellipse from the top of the front down to the rear of its base, swept across its width and rounded at the sides;
  - frosted white below a seam line, translucent Bondi blue above, with a vent grille on the side;
  - round blue speaker grilles, a disc slot and a low foot on the front.
  - There is no Apple logo: the design is recognisable, the trademark is left out.
- **Around it:** three dithered ridge lines, the ground and the computer's shadow, and a moon rising behind the hills.
- **Shading:** the dither is laid as seen from the final camera position, so patterns ride the camera move.
- **Light:** it comes from the front left, so the side the camera swings round to is lit.

**The camera on scroll** (`start/engine.ts`, `start/stage.tsx`)

- **The pin:** on desktop, the section is 230svh tall with a sticky stage, and scroll progress through it drives the camera.
- **Smoothing:** the progress is smoothed exponentially (about 70 ms).
- **The move:** the camera first dollies straight out of the glass (log distance), then swings round (yaw −0.85 rad) to the final composition, with the computer on the left.
- **The closing line:** the moon rises, and "Feel free to explore my journey!" and its buttons appear once the swing is mostly done, as the hills open into a valley under them. The buttons never hide while one has keyboard focus.
- **Phones and reduced motion:** the stage isn't pinned and simply shows the final composition.

**The screen**

- **The window:** a macOS Terminal window, 80×24.
- **Title bar:** row 0 shows the red, yellow and green buttons and `muzzammil — python — 80×24`.
- **Session:** below it, a `Last login` line, the zsh prompt (`muzzammil@MacBook Road-to-AI %`), the typed command, then the training log.
- **Glyphs:** characters come from an atlas texture built at runtime from JetBrains Mono. Its Google Fonts build has no box-drawing or block characters, so those (`│ █ ▁…▇ ▏ ▕ · ● — ×`) are hand-drawn paths in `SHAPES`. Any other non-ASCII character shows as a space.
- **Power-on:** the screen powers on like a CRT raster once half the stage is on screen. The session plays once, then the caret blinks while the stage is in view.
- **Legibility:** if a column of text would be under 7.2 CSS px wide (small screens), it shows the finished session instead of playing it.

**The data** (`start/data.ts`)

- **Source:** every number is copied from the saved outputs of `notebooks/NeuralNetworks/Makemore-part5/Main-notebook-part-5.ipynb`, Karpathy's WaveNet-style makemore model. Notebooks are never executed.
- **The setup line:** vocab 27, context 8, 76,579 parameters, 182,625 training examples.
- **The log:**
  - the 20 logged minibatch losses, every 10,000 of 200,000 steps (3.3167 → 1.8555), each with a progress bar;
  - a sparkline of those losses;
  - the split loss: train 1.7690, val 1.9937;
  - the 20 sampled names (arlij, chetta, heago, …).
- **Illustrative only:** the command line `python train.py --model wavenet --data names.txt` and the login time.
- **Why not GPT-1:** the GPT-1 notebook has no step-by-step loss log, so it isn't used. The makemore log has no per-step validation loss, so none is shown per step.

## 8. The footer

**The wordmark** (`footer/wordmark.tsx`)

- **The simulation:** a Canvas2D falling-sand simulation on a character grid (9×12 px cells, 5×6 on narrow screens) at 40 steps a second.
- **The letters:** "Road to AI" is rendered once into an offscreen mask in Inter. Grains fall from above and settle only inside the letters.
- **The cycle:** a full word holds for 4 beats, drains and fills again.
- **Mouse:** the mouse pushes grains away, and pushed grains show on the yellow highlight.
- **Efficiency:** only changed cells are redrawn, and it pauses off screen.
- **Reduced motion:** a still, filled word.
- **For screen readers:** it is `role="img"` with the label "Road to AI".
- **The grains:** `GLYPHS` = `01Σλ{}[]<>/=+*#roadtoai`, only characters in the Inter subsets next/font loads (Latin and Greek).

**Links** (`footer/footer.tsx`): GitHub, Website and Blog (URLs in `lib/shared.ts`), and the copyright with a year that updates in the browser.

## 9. Colours, fonts and dependencies

**Tokens** (on `.landing-surface` in `app/global.css`; Tailwind colours `lp-*` map to them):

| Token | Use | Light / dark |
|---|---|---|
| `--lp-paper`, `--lp-paper-2` | page and card backgrounds | `#ffffff`, `hsl(0 0% 98.5%)` / `#121212`, `#191919` |
| `--lp-ink`, `--lp-ink-2`, `--lp-line`, `--lp-line-strong` | text, outlines and lines | the neutral foreground and mixes of it |
| `--lp-sun`, `--lp-orange` | the accent: CRT numbers, the moon behind the hills, star sparkles | `--section-library` (amber) |
| `--lp-yellow`, `--lp-on-yellow` | highlights (pushed grains, text selection) | `--section-workshop` |
| `--lp-ocean`, `--lp-ocean-night`, `--lp-land`, `--lp-land-night` | the Earth | same in both themes |
| `--lp-moon`, `--lp-moon-dark`, `--lp-pin` | the moon, the Bangalore pin | same in both themes |
| `--lp-mac-*` | the computer and its Terminal window | same in both themes |

The section colours (`--section-*`) tint the cards, the satellites' panels and the labels.

**Fonts:**

| Font | Used for | Loaded |
|---|---|---|
| Inter | headings and body text (site-wide) | `next/font/google`, in `app/layout.tsx` |
| Geist Pixel (square) | the speech bubbles and mechanism readouts | `geist/font/pixel/square`, a local font. Loaded from Google Fonts instead, Turbopack warns on every build that it has no fallback metrics for it. |
| JetBrains Mono | the Terminal's glyph atlas | `next/font/google`, as a variable on the landing only |

**Dependencies added for the landing** (exact versions, as every dependency here):

| Package | Version | Why |
|---|---|---|
| `motion` | 14.6.0 | springs (the pointer light), cubic-bezier easing, `useReducedMotion` |
| `world-atlas` | 2.0.2 | Natural Earth land (ISC; the data is public domain) |
| `topojson-client` | 3.1.0 | TopoJSON → GeoJSON (ISC); types in `types/topojson-client.d.ts` |
| `geist` | 1.9.0 | Geist Pixel (OFL) |

Removed: `vanta` 0.5.24 and `three` 0.134.0, the old globe.

## 10. Accessibility and fallbacks

- **Real DOM:** all canvases are `aria-hidden`. Every piece of text, link and button is real DOM: the headings, the section labels round the globe, the cards, the buttons and the footer.
- **Focus:** every link and button has a visible focus ring.
  - A focused satellite label stays visible even when its satellite is behind the globe.
  - Keyboard focus inside the board finishes its entrance at once.
- **Reduced motion** (`prefers-reduced-motion: reduce`): every figure shows a still, finished picture.
  - The Earth doesn't spin, and the orbiters rest on the front of the ring.
  - The character is still with his first bubble shown.
  - The cards rest on their final frames.
  - The computer section isn't pinned.
  - The wordmark is filled.
  - The theme switch doesn't crossfade.
- **Without WebGL:** the figures are simply absent and the page stays complete and readable.
- **Touch:** the hero's light circles by itself, and the wordmark only reacts to a mouse.

## 11. Performance

**Design:**

- figures draw only when something changed;
- canvases pause off screen;
- scripts start a screen before they're needed;
- the board's animations are compositor-only CSS;
- the land data is loaded lazily;
- the WebGL contexts are low-power and drop resolution while the GPU lags.

Scrolled to the middle of the board and left idle, the page runs **no** `requestAnimationFrame` at all. While visible, the hero draws every frame, because its moon and satellites move.

**Measured** on the static export, against `main` before the rebuild:

| | Before (Vanta globe) | After |
|---|---|---|
| JavaScript loaded up front (gzip) | 303,642 B | 346,783 B |
| JavaScript loaded later (gzip) | 155,069 B (three + Vanta) | 23,416 B (land data + topojson) |
| **Total JavaScript (gzip)** | **458,711 B** | **370,199 B (−19%)** |
| Lighthouse, mobile | 69 · LCP 5.5 s · TBT 420 ms · CLS 0 | **85 · LCP 4.4 s · TBT 0 ms · CLS 0** |
| Lighthouse, desktop | 99 · LCP 0.9 s · TBT 0 ms · CLS 0 | 99 · LCP 0.9 s · TBT 0 ms · CLS 0 |

The up-front JavaScript grew because the engines now load with the page (the old globe was lazy), but total weight and main-thread blocking both went down.

## 12. Changing it

Common edits, with full instructions in [MAINTAINING.md](MAINTAINING.md), section 12:

| To change | Edit |
|---|---|
| What the character says | `LINES` in `components/landing/hero/talk.ts` |
| The character | `SPRITE` in `components/landing/character/sprite.ts` |
| Where the pin points | `HOME` in `components/landing/hero/engine.ts`, label in `hero/stage.tsx` |
| A section's card animation | `mechanisms` in `components/landing/sections/mechanisms.tsx` |
| The Terminal session | `components/landing/start/data.ts` (+ `SHAPES` in `start/scene.ts` for new symbols) |
| The closing line and buttons | `components/landing/start/index.tsx` |
| The wordmark's characters | `GLYPHS` in `components/landing/footer/wordmark.tsx` |
| Footer links | `components/landing/footer/footer.tsx` and `lib/shared.ts` |
| Any colour | the `--lp-*` tokens in `app/global.css` |

**A new section** needs nothing on the landing. It gets a card (with the fallback animation until it has its own), a satellite with panels in its colour, and a label link. This was tested with a temporary fifth section.

**After any change**, run the checks and look at the page:

```bash
npm run typecheck && npm run lint && npm run build && npm run check:links && npm run check:parity
npx serve out -l 4173
```

Then check it:
- in light and dark mode, at about 375, 768, 1280 and 1440 px wide;
- with reduced motion (Chrome DevTools → Rendering → "prefers-reduced-motion: reduce");
- with the console open (a shader that fails to compile logs its error there).

Judge speed on the export, not on `npm run dev`.

**Gotchas:**
- The WebGL shaders live in template strings: a backtick inside a GLSL comment ends the string and breaks the build.
- An absolutely positioned `<svg>` takes its height from its aspect ratio, not from `top`/`bottom`, so give it an explicit height.
- `components/landing/` has a scoped Biome override (`biome.jsonc`) for the ported code's style; don't widen it to the rest of the repo.

## 13. History and decisions

**Rebuild (PR #42), in phases:**

1. Foundation: the shared libraries, tokens, fonts and `motion`.
2. The falling-glyph wordmark and footer.
3. The section board and its four mechanisms.
4. The hero, with the Earth replacing the moon, the sections as satellites, and an original character.
5. The pinned 3D terminal scene.
6. The smooth theme crossfade.
7. Docs and verification.

**Decisions made then:**

- **Biome config:** `biome.json` became `biome.jsonc`, so the override for the ported code can carry its explanatory comment.
- **Wordmark glyphs:** `∑ ∂ →` were dropped from the wordmark because Inter's loaded subsets don't have them; Greek `Σ` stands in for `∑`.
- **Training data:** the Terminal's numbers come from Makemore part 5, because GPT-1 has no loss log.

**First review:**

- the Earth in real colours, with the Bangalore pin;
- a moon plus satellites instead of boxes;
- the computer redrawn as the Bondi-blue all-in-one, with a macOS Terminal on its screen;
- plain divider lines;
- fewer links in the hero and footer, and a Blog link added;
- no glitch on "Artificial Intelligence";
- a narrower board without rulers or screws round the mechanisms;
- no "open path" window, and no command box in the closing section;
- the closing line changed;
- Geist Pixel moved to the `geist` package, to end a build warning.

**Second review:**

- the arched back of the computer, after a photo of the original, with the camera swung further round and the light moved to show it;
- the character tried with curly hair, headphones, a cuter face and a hoodie;
- stars carried over the hero's text column.

**Third review:**

- the character tried as a cool developer (a red cap and shades), then returned to his original look, glasses and blazer, because his eyes following the mouse were a nice detail.

## 14. Known limits and ideas

- **Hidden satellites:** with four evenly spaced orbiters, one is usually behind the globe at any moment (its label hides until it comes round). This is inherent to one shared ring.
- **Up-front JavaScript:** the engines could be loaded with dynamic `import()` after the page, to cut about 40 KB of gzip from the initial load.
- **Robot arm:** the Fumadocs "machine that places blocks" (a robot arm stacking one module per section) was considered and set aside, as too much for now. Porting it would add about 2,350 lines and 15–25 KB gzip.
- **Browser support:**
  - the globe setting on scroll needs `ViewTimeline`; without it, the globe simply stays;
  - the theme crossfade needs view transitions; without them, the switch is instant.
