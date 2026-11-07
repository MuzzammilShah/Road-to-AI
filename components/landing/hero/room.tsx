// Road to AI: an original pixel-art lofi bedroom that fills the whole hero as one scene. Iteration
// 2 — a detailed, shaded frame (every object has base / shadow / highlight tones, the lamp lights
// the surfaces it hits, objects cast shadows), toward the craft of the pixel-room references.
//
// Fully theme-reactive: the whole room turns from a cosy NIGHT room (dark mode) into a bright DAY
// room (light mode). The wall, floor, wood, metal and fabrics all flip via the `--lp-room-*` tokens
// (night values on `.landing-surface`, day values under `.light` in app/global.css); the view
// outside the window swaps night↔day too (moon/stars/lit city ↔ sun/clouds/daylit city), and the
// clock hands with it. The Macintosh screen stays on (dark with syntax-lit code) and the lamp keeps
// glowing in both themes.
//
// Drawn as pure SVG pixel art with `crispEdges`, reusing the stage helpers (`rect`/`art`/`dither`),
// so it needs no WebGL and is inherently reduced-motion safe.
import type { CSSProperties } from 'react';
import { art, dither, rect } from '../sections/stage';

// A wide grid so the room fills the hero edge-to-edge. Cells are square; the SVG is sliced to fill.
const W = 200;
const H = 90;
const FLOOR_Y = 72;

/* ----------------------------------------------------------------------------------------------- *
 * Layout. The upper-left quadrant (x 0..74, y 0..46) is deliberately empty wall — the heading
 * overlay lives there.
 * ----------------------------------------------------------------------------------------------- */

const wall = (): string => rect(0, 0, W, FLOOR_Y);
/** darker band along the wall/floor join and the left/right corners (ambient occlusion) */
function wallShade(): string {
  return (
    rect(0, FLOOR_Y - 3, W, 3) + // along the floor
    rect(0, 0, 3, FLOOR_Y) + // left corner
    rect(W - 3, 0, 3, FLOOR_Y) // right corner
  );
}
const floor = (): string => rect(0, FLOOR_Y, W, H - FLOOR_Y);

/* --- an area rug covering the central floor in front of the window --- */

// The rug reads as the floor in the middle of the room: it starts right at the furniture base and
// runs to the bottom of the frame, its top edge rounded (receding into the floor), with a border.
const RUG = { cx: 104, yTop: FLOOR_Y + 1, w: 96 } as const;
function rug(): { base: string; border: string } {
  const r = RUG;
  const x0 = r.cx - Math.floor(r.w / 2);
  const bottom = H; // down to the frame edge
  let base = '';
  // the near edge (top) is rounded: inset the first two rows
  base += rect(x0 + 4, r.yTop, r.w - 8, 1);
  base += rect(x0 + 1, r.yTop + 1, r.w - 2, 1);
  base += rect(x0, r.yTop + 2, r.w, bottom - (r.yTop + 2));
  // an inset border following the top edge + sides
  const border =
    rect(x0 + 6, r.yTop + 3, r.w - 12, 1) +
    rect(x0 + 3, r.yTop + 3, 1, bottom - (r.yTop + 3)) +
    rect(x0 + r.w - 4, r.yTop + 3, 1, bottom - (r.yTop + 3));
  return { base, border };
}

/* --- the window (centre-right), with a curtain down its right side --- */

const WIN = { x: 80, y: 16, w: 58, h: 46 } as const;
const GLASS = { x: WIN.x + 3, y: WIN.y + 3, w: WIN.w - 6, h: WIN.h - 6 } as const;
const HORIZON = GLASS.y + Math.floor(GLASS.h * 0.72);

/** the window frame: outer casing (two tones for depth) and the mullions */
function windowFrame(): { base: string; hi: string } {
  const o = WIN;
  let base = '';
  base += rect(o.x, o.y, o.w, 3);
  base += rect(o.x, o.y + o.h - 3, o.w, 3);
  base += rect(o.x, o.y, 3, o.h);
  base += rect(o.x + o.w - 3, o.y, 3, o.h);
  const midX = o.x + Math.floor(o.w / 2) - 1;
  const midY = o.y + Math.floor(o.h / 2) - 1;
  base += rect(midX, o.y, 2, o.h);
  base += rect(o.x, midY, o.w, 2);
  // a highlight along the top and left inner edges (light from outside)
  const hi = rect(o.x + 3, o.y + 2, o.w - 6, 1) + rect(o.x + 2, o.y + 3, 1, o.h - 6);
  return { base, hi };
}

/** a graded sky inside the glass. `max` caps the dither strength. */
function sky(max = 12): string {
  const g = GLASS;
  let d = '';
  for (let band = 0; band < 6; band++) {
    const yy = g.y + Math.floor((HORIZON - g.y) * (band / 6));
    const hh = Math.ceil((HORIZON - g.y) / 6) + 1;
    d += dither(g.x, yy, g.w, hh, Math.round((band / 5) * max));
  }
  return d;
}

/** the crescent moon (night) with a soft highlight, upper-left of the glass */
function moon(): { body: string; hi: string } {
  const cx = GLASS.x + 11;
  const cy = GLASS.y + 9;
  const r = 5;
  let body = '';
  for (let dy = -r; dy <= r; dy++)
    for (let dx = -r; dx <= r; dx++) {
      if (dx * dx + dy * dy > r * r) continue;
      const ox = dx - 3;
      const oy = dy - 1;
      if (ox * ox + oy * oy <= (r - 1) * (r - 1)) continue;
      body += rect(cx + dx, cy + dy, 1, 1);
    }
  const hi = rect(cx - 2, cy - 3, 2, 1) + rect(cx - 3, cy - 2, 1, 2);
  return { body, hi };
}

/** the sun (day): a disc, a lit core and short rays */
function sun(): { disc: string; core: string; rays: string } {
  const cx = GLASS.x + 11;
  const cy = GLASS.y + 9;
  const r = 5;
  let disc = '';
  let core = '';
  for (let dy = -r; dy <= r; dy++)
    for (let dx = -r; dx <= r; dx++) {
      const dist = dx * dx + dy * dy;
      if (dist <= r * r) disc += rect(cx + dx, cy + dy, 1, 1);
      if (dist <= (r - 2) * (r - 2)) core += rect(cx + dx, cy + dy, 1, 1);
    }
  const rays =
    rect(cx, cy - r - 3, 1, 2) +
    rect(cx, cy + r + 2, 1, 2) +
    rect(cx - r - 3, cy, 2, 1) +
    rect(cx + r + 2, cy, 2, 1) +
    rect(cx - r - 2, cy - r - 2, 2, 2) +
    rect(cx + r + 1, cy - r - 2, 2, 2) +
    rect(cx - r - 2, cy + r + 1, 2, 2) +
    rect(cx + r + 1, cy + r + 1, 2, 2);
  return { disc, core, rays };
}

/** scattered stars (night), in the upper sky, clear of the moon */
function stars(): string {
  const pts: Array<[number, number]> = [
    [24, 3],
    [34, 7],
    [44, 2],
    [50, 9],
    [30, 14],
    [42, 12],
    [52, 5],
    [22, 9],
    [38, 18],
    [48, 16],
    [27, 19],
  ];
  let d = '';
  for (const [px, py] of pts) d += rect(GLASS.x + px, GLASS.y + py, 1, 1);
  return d;
}

/** two clouds (day) */
function clouds(): string {
  const g = GLASS;
  return (
    art(['.####.', '########', '.######.'], g.x + 26, g.y + 6) +
    art(['.###.', '#######', '.#####.'], g.x + 42, g.y + 16)
  );
}

// the city skyline: [offsetX, width, heightAboveHorizon]
const BLD: ReadonlyArray<readonly [number, number, number]> = [
  [0, 6, 7],
  [6, 5, 12],
  [11, 7, 5],
  [18, 6, 15],
  [24, 8, 9],
  [32, 5, 13],
  [37, 7, 6],
  [44, 6, 11],
  [50, 4, 8],
];

function city(): string {
  const g = GLASS;
  let d = '';
  for (const [ox, w, h] of BLD) d += rect(g.x + ox, HORIZON - h, w, g.y + g.h - (HORIZON - h));
  return d;
}

/** a 1px lit edge on the left of each building (so the silhouette has form, not a flat mass) */
function cityEdge(): string {
  const g = GLASS;
  let d = '';
  for (const [ox, , h] of BLD) d += rect(g.x + ox, HORIZON - h, 1, h);
  return d;
}

/** lit windows dotted on the buildings (night) */
function cityLights(): string {
  const g = GLASS;
  const pts: Array<[number, number]> = [
    [2, 3],
    [8, 6],
    [8, 9],
    [20, 5],
    [20, 11],
    [27, 4],
    [34, 8],
    [46, 5],
    [46, 8],
  ];
  let d = '';
  for (const [ox, up] of pts) d += rect(g.x + ox, HORIZON - up, 1, 1);
  return d;
}

/** a curtain gathered down the right side of the window */
function curtain(): { base: string; folds: string } {
  const o = WIN;
  const cx = o.x + o.w - 7;
  const base = rect(cx, o.y - 2, 9, o.h + 2);
  // vertical fold shadows
  const folds = rect(cx + 2, o.y - 2, 1, o.h + 2) + rect(cx + 5, o.y - 2, 1, o.h + 2);
  return { base, folds };
}

/* --- the bed (lower-left) --- */

const BED = { x: 0, y: 54, w: 44 } as const;

function bed(): {
  frame: string;
  frameHi: string;
  sheet: string;
  sheetHi: string;
  blanket: string;
  pillow: string;
  pillowSh: string;
} {
  const { x, y, w } = BED;
  return {
    frame: rect(x, y - 4, 4, 22) + rect(x, y + 10, w, 8),
    frameHi: rect(x, y - 4, 4, 1) + rect(x, y + 10, w, 1),
    sheet: rect(x, y + 4, w, 8),
    sheetHi: rect(x, y + 4, w, 1),
    blanket: rect(x + 16, y + 4, w - 16, 7),
    pillow: rect(x + 5, y + 2, 13, 6),
    pillowSh: rect(x + 5, y + 7, 13, 1),
  };
}

/* --- a potted plant between the bed and the window --- */

function plant(): { pot: string; potHi: string; leaves: string; leavesHi: string } {
  const px = 62;
  const py = FLOOR_Y - 12;
  const shape = [
    '...#....#...',
    '..##...##...',
    '.###..###.#.',
    '####.####.##',
    '.##########.',
    '..########..',
    '...######...',
    '....####....',
  ];
  const hiShape = ['...#....#...', '..#....#....', '.##...##....', '', '', '', '', ''];
  return {
    pot: rect(px + 2, py, 8, 12),
    potHi: rect(px + 2, py, 1, 12) + rect(px + 2, py, 8, 1),
    leaves: art(shape, px, py - 8),
    leavesHi: art(hiShape, px, py - 8),
  };
}

/* --- the right wall: bookshelf, desk, Macintosh, lamp, clock --- */

/** a bookshelf on the upper-right wall, with individually coloured spines */
function shelf(): { wood: string; woodHi: string; books: Array<[string, string]> } {
  const sx = 150;
  const sy = 8;
  const sw = 42;
  const wood = rect(sx, sy, sw, 2) + rect(sx, sy + 9, sw, 2);
  const woodHi = rect(sx, sy, sw, 1) + rect(sx, sy + 9, sw, 1);
  // each spine: [pathData, tokenClass]
  const spines = [3, 5, 2, 4, 6, 3, 5, 4, 2, 5, 3, 4];
  const palette = [
    '--lp-code-blue',
    '--lp-code-green',
    '--lp-code-yellow',
    '--lp-room-sheet-hi',
    '--lp-code-blue',
    '--lp-room-wood-hi',
    '--lp-code-green',
    '--lp-code-yellow',
    '--lp-room-sheet',
    '--lp-code-blue',
    '--lp-room-wood-hi',
    '--lp-code-green',
  ];
  const books: Array<[string, string]> = [];
  let cx = sx + 2;
  for (let i = 0; i < spines.length; i++) {
    const h = spines[i];
    if (cx > sx + sw - 4) break;
    books.push([rect(cx, sy + 9 - h, 2, h), palette[i % palette.length]]);
    cx += 3;
  }
  return { wood, woodHi, books };
}

const DESK = { x: 148, y: 58, w: 44, h: 4 } as const;

function desk(): { top: string; topHi: string; legs: string; shadow: string } {
  const top = rect(DESK.x, DESK.y, DESK.w, DESK.h);
  const topHi = rect(DESK.x, DESK.y, DESK.w, 1);
  const legs =
    rect(DESK.x + 4, DESK.y + DESK.h, 4, FLOOR_Y - (DESK.y + DESK.h)) +
    rect(DESK.x + DESK.w - 8, DESK.y + DESK.h, 4, FLOOR_Y - (DESK.y + DESK.h));
  // a soft shadow the desk casts on the floor
  const shadow = dither(DESK.x + 2, FLOOR_Y, DESK.w, 2, 6);
  return { top, topHi, legs, shadow };
}

// the compact all-in-one Macintosh on the desk
const MAC = { x: 156, y: 34, w: 28, h: 24 } as const;

function mac(): { body: string; hi: string; sh: string; recess: string; slot: string } {
  const m = MAC;
  const body = rect(m.x, m.y, m.w, m.h - 4) + rect(m.x + 3, m.y + m.h - 4, m.w - 6, 4);
  // highlight on the top + left (lamp side), shadow on the right
  const hi = rect(m.x, m.y, m.w, 1) + rect(m.x, m.y, 1, m.h - 4);
  const sh = rect(m.x + m.w - 1, m.y, 1, m.h - 4) + rect(m.x + 3, m.y + m.h - 1, m.w - 6, 1);
  const recess = rect(m.x + 3, m.y + 3, m.w - 6, m.h - 13);
  const slot = rect(m.x + m.w - 10, m.y + m.h - 8, 7, 1);
  return { body, hi, sh, recess, slot };
}

/** the glowing code screen with syntax-coloured tokens */
function screen(): { glow: string; tokens: Array<[string, string]> } {
  const sx = MAC.x + 5;
  const sy = MAC.y + 5;
  const sw = MAC.w - 10;
  const sh = MAC.h - 17;
  const glow = rect(sx, sy, sw, sh);
  // [pathData, colourToken] — rows of little tokens like syntax-highlighted code
  const rows: Array<Array<[number, number, string]>> = [
    [
      [1, 2, '--lp-code-blue'],
      [4, 3, '--lp-code-yellow'],
    ],
    [
      [2, 4, '--lp-code-green'],
      [7, 1, '--lp-code-dim'],
    ],
    [
      [2, 2, '--lp-code-dim'],
      [5, 3, '--lp-code-blue'],
    ],
    [[1, 5, '--lp-code-yellow']],
    [
      [2, 2, '--lp-code-green'],
      [5, 2, '--lp-code-blue'],
    ],
  ];
  const tokens: Array<[string, string]> = [];
  for (let i = 0; i < rows.length && i < sh - 1; i++) {
    for (const [off, len, tok] of rows[i]) {
      if (off + len > sw - 1) continue;
      tokens.push([rect(sx + off, sy + 1 + i * 2, len, 1), tok]);
    }
  }
  return { glow, tokens };
}

/** a mug on the desk, left of the Mac */
function mug(): { body: string; hi: string; handle: string } {
  const mx = MAC.x - 8;
  const my = DESK.y - 5;
  return {
    body: rect(mx, my, 5, 5),
    hi: rect(mx, my, 1, 5),
    handle: rect(mx + 5, my + 1, 1, 3) + rect(mx + 4, my + 1, 1, 1) + rect(mx + 4, my + 3, 1, 1),
  };
}

// the desk lamp (angle-poise) clamped to the right of the desk, reaching left over the work
const LAMP = { bx: 188, by: 58 } as const;

function lamp(): { arm: string; head: string; cone: string } {
  const { bx, by } = LAMP;
  const arm =
    rect(bx, by - 2, 4, 2) +
    rect(bx + 1, by - 16, 2, 14) +
    rect(bx - 10, by - 17, 13, 2) +
    rect(bx - 10, by - 16, 2, 4);
  const head =
    rect(bx - 13, by - 14, 8, 2) + rect(bx - 12, by - 12, 6, 2) + rect(bx - 11, by - 10, 4, 1);
  // a cone of warm light fanning down onto the desk + Mac
  let cone = '';
  const cx = bx - 9;
  for (let r = 0; r < 6; r++) {
    const yy = by - 9 + r * 2;
    const spread = 3 + r * 2;
    cone += dither(cx - spread, yy, spread * 2, 2, 10 - r * 2);
  }
  return { arm, head, cone };
}

/* --- a round wall clock, moved further right (clear of the window) --- */

const CLOCK = { cx: 109, cy: 8, r: 6 } as const;

function clockFace(): string {
  const { cx, cy, r } = CLOCK;
  let d = '';
  for (let dy = -r; dy <= r; dy++)
    for (let dx = -r; dx <= r; dx++)
      if (dx * dx + dy * dy <= r * r) d += rect(cx + dx, cy + dy, 1, 1);
  return d;
}

function clockRing(): string {
  const { cx, cy, r } = CLOCK;
  let ring = '';
  for (let dy = -r; dy <= r; dy++)
    for (let dx = -r; dx <= r; dx++) {
      const dist = dx * dx + dy * dy;
      if (dist <= r * r && dist > (r - 1) * (r - 1)) ring += rect(cx + dx, cy + dy, 1, 1);
    }
  ring += rect(cx, cy - r + 1, 1, 1) + rect(cx, cy + r - 1, 1, 1);
  ring += rect(cx - r + 1, cy, 1, 1) + rect(cx + r - 1, cy, 1, 1);
  return ring;
}

function clockHands(day: boolean): string {
  const { cx, cy } = CLOCK;
  const pin = rect(cx, cy, 1, 1);
  if (day) return pin + rect(cx, cy - 4, 1, 4) + rect(cx + 1, cy - 1, 3, 1); // ≈10:10
  return pin + rect(cx - 3, cy - 2, 3, 1) + rect(cx, cy + 1, 1, 3); // ≈8:40
}

/* --- a small framed picture on the wall, between the window and the bed, to fill the gap --- */

function picture(): { frame: string; mat: string; art: string } {
  const px = 58;
  const py = 22;
  const w = 10;
  const h = 12;
  const frame = rect(px, py, w, h);
  const mat = rect(px + 1, py + 1, w - 2, h - 2);
  // a tiny mountains-and-sun motif inside
  const a =
    rect(px + 2, py + 3, 1, 1) + // sun
    art(['..##..', '.####.', '######'], px + 1, py + 6);
  return { frame, mat, art: a };
}

/* ----------------------------------------------------------------------------------------------- *
 * The component.
 * ----------------------------------------------------------------------------------------------- */

const box: CSSProperties = { imageRendering: 'pixelated' };

export function Room({ className }: { className?: string }) {
  const rg = rug();
  const wf = windowFrame();
  const mn = moon();
  const su = sun();
  const cu = curtain();
  const b = bed();
  const pl = plant();
  const pic = picture();
  const sh = shelf();
  const dk = desk();
  const mc = mac();
  const sc = screen();
  const mg = mug();
  const lm = lamp();

  return (
    <svg
      aria-hidden
      viewBox={`0 0 ${W} ${H}`}
      shapeRendering="crispEdges"
      className={className}
      style={box}
      preserveAspectRatio="xMidYMid meet"
    >
      {/* wall + floor, with corner/floor shading */}
      <path d={wall()} className="fill-(--lp-room-wall)" />
      <path d={wallShade()} className="fill-(--lp-room-wall-sh)" />
      <path d={floor()} className="fill-(--lp-room-floor)" />

      {/* rug, centred on the floor */}
      <path d={rg.base} className="fill-(--lp-room-rug)" />
      <path d={rg.border} className="fill-(--lp-room-rug-2)" />

      {/* --- the view outside the window --- */}
      <g className="room-night">
        <path d={rect(GLASS.x, GLASS.y, GLASS.w, GLASS.h)} className="fill-(--lp-ocean-night)" />
        <path d={sky()} className="fill-(--lp-ocean)/40" />
        <path d={city()} className="fill-(--lp-city-night)" />
        <path d={cityEdge()} className="fill-(--lp-city-night-hi)" />
        <path d={cityLights()} className="fill-(--lp-sun)" />
        <path d={mn.body} className="fill-(--lp-moon)" />
        <path d={mn.hi} className="fill-white/70" />
        <path d={stars()} className="fill-(--lp-moon)" />
      </g>
      <g className="room-day">
        <path d={rect(GLASS.x, GLASS.y, GLASS.w, GLASS.h)} className="fill-(--lp-sky-day)" />
        <path d={sky(6)} className="fill-(--lp-sky-day-2)/45" />
        <path d={city()} className="fill-(--lp-city-day)" />
        <path d={cityEdge()} className="fill-(--lp-city-day-hi)" />
        <path d={su.disc} className="fill-(--lp-sun-day)" />
        <path d={su.core} className="fill-white/70" />
        <path d={su.rays} className="fill-(--lp-sun-day)" />
        <path d={clouds()} className="fill-(--lp-cloud)" />
      </g>

      {/* window frame + curtain on top of the view */}
      <path d={wf.base} className="fill-(--lp-room-metal)" />
      <path d={wf.hi} className="fill-(--lp-room-metal-hi)" />
      <path d={cu.base} className="fill-(--lp-room-curtain)" />
      <path d={cu.folds} className="fill-(--lp-room-curtain-hi)" />

      {/* framed picture on the wall */}
      <path d={pic.frame} className="fill-(--lp-room-wood)" />
      <path d={pic.mat} className="fill-(--lp-room-wall-sh)" />
      <path d={pic.art} className="fill-(--lp-code-blue)" />

      {/* bed (lower-left) */}
      <path d={b.frame} className="fill-(--lp-room-wood)" />
      <path d={b.frameHi} className="fill-(--lp-room-wood-hi)" />
      <path d={b.sheet} className="fill-(--lp-room-sheet)" />
      <path d={b.sheetHi} className="fill-(--lp-room-sheet-hi)" />
      <path d={b.blanket} className="fill-(--lp-room-sheet-hi)" />
      <path d={b.pillow} className="fill-(--lp-room-pillow)" />
      <path d={b.pillowSh} className="fill-(--lp-room-metal)" />

      {/* plant */}
      <path d={pl.pot} className="fill-(--lp-room-wood)" />
      <path d={pl.potHi} className="fill-(--lp-room-wood-hi)" />
      <path d={pl.leaves} className="fill-(--lp-land)" />
      <path d={pl.leavesHi} className="fill-(--lp-code-green)" />

      {/* bookshelf (coloured spines) */}
      <path d={sh.wood} className="fill-(--lp-room-wood)" />
      <path d={sh.woodHi} className="fill-(--lp-room-wood-hi)" />
      {sh.books.map(([d, tok]) => (
        <path
          key={d}
          d={d}
          className="fill-(--color)"
          style={{ '--color': `var(${tok})` } as CSSProperties}
        />
      ))}

      {/* wall clock */}
      <path d={clockFace()} className="fill-(--lp-room-metal-sh)" />
      <path d={clockRing()} className="fill-(--lp-room-metal-hi)" />
      <g className="room-night">
        <path d={clockHands(false)} className="fill-(--lp-room-metal-hi)" />
      </g>
      <g className="room-day">
        <path d={clockHands(true)} className="fill-(--lp-room-metal-hi)" />
      </g>

      {/* desk (with cast shadow, highlight and legs) */}
      <path d={dk.shadow} className="fill-(--lp-room-floor)" />
      <path d={dk.legs} className="fill-(--lp-room-wood-sh)" />
      <path d={dk.top} className="fill-(--lp-room-wood)" />
      <path d={dk.topHi} className="fill-(--lp-room-wood-hi)" />

      {/* mug */}
      <path d={mg.body} className="fill-(--lp-room-sheet)" />
      <path d={mg.hi} className="fill-(--lp-room-sheet-hi)" />
      <path d={mg.handle} className="fill-(--lp-room-sheet)" />

      {/* Macintosh: body with shading, dark screen recess, syntax-lit code, disk slot */}
      <path d={mc.body} className="fill-(--lp-room-mac)" />
      <path d={mc.hi} className="fill-(--lp-room-mac-hi)" />
      <path d={mc.sh} className="fill-(--lp-room-mac-sh)" />
      <path d={mc.recess} className="fill-(--lp-room-screen)" />
      <path d={sc.glow} className="fill-(--lp-room-screen)" />
      {sc.tokens.map(([d, tok]) => (
        <path
          key={d}
          d={d}
          className="fill-(--color)"
          style={{ '--color': `var(${tok})` } as CSSProperties}
        />
      ))}
      <path d={mc.slot} className="fill-(--lp-room-mac-sh)" />

      {/* desk lamp: the warm pool on the desk/Mac, then the arm and shade */}
      <path d={lm.cone} className="fill-(--lp-room-glow)/35" />
      <path d={lm.arm} className="fill-(--lp-room-metal-sh)" />
      <path d={lm.head} className="fill-(--lp-room-glow)" />
    </svg>
  );
}
