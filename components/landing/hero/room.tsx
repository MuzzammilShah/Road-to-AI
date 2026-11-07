// Road to AI: an original pixel-art lofi bedroom that fills the whole hero as one scene. In the
// mood of the reference frames (a window onto a city, a Macintosh on the desk, a warm lamp), but
// our own composition: the upper-left is clear dark wall so the heading/buttons can sit over it.
//
// The scene is theme-reactive: the ROOM stays the same in both themes (a fixed dark night room so
// the lamp keeps glowing), but the VIEW OUTSIDE THE WINDOW changes — night (moon, stars, lit city)
// in dark mode, day (sun, clouds, blue sky, daylit city) in light mode — and the clock hands with
// it. No figure (dropped; the room carries the scene).
//
// Drawn as pure SVG pixel art with `crispEdges`, reusing the stage helpers (`rect`/`art`/`dither`),
// so it needs no WebGL and is inherently reduced-motion safe. Tones are fixed `--lp-*` tokens.
import type { CSSProperties } from 'react';
import { art, dither, rect } from '../sections/stage';

// A wide grid so the room fills the hero edge-to-edge. Cells are square; the SVG is sliced to fill
// its box (xMid yMax: keep the floor, crop the top wall), so the pixels never stretch.
const W = 200;
const H = 90;
const FLOOR_Y = 78;

/* ----------------------------------------------------------------------------------------------- *
 * Layout. The upper-left quadrant (x 0..74, y 0..46) is deliberately empty dark wall — the heading
 * overlay lives there. Furniture is spread across the rest.
 * ----------------------------------------------------------------------------------------------- */

const wall = (): string => rect(0, 0, W, FLOOR_Y);
const floor = (): string => rect(0, FLOOR_Y, W, H - FLOOR_Y);

/* --- the window (centre-right) --- */

const WIN = { x: 80, y: 16, w: 58, h: 46 } as const;
const GLASS = { x: WIN.x + 3, y: WIN.y + 3, w: WIN.w - 6, h: WIN.h - 6 } as const;
/** where the ground meets the sky inside the glass (low, so a tall city fills the lower panes) */
const HORIZON = GLASS.y + Math.floor(GLASS.h * 0.72);

function windowFrame(): string {
  const o = WIN;
  let d = '';
  d += rect(o.x, o.y, o.w, 3);
  d += rect(o.x, o.y + o.h - 3, o.w, 3);
  d += rect(o.x, o.y, 3, o.h);
  d += rect(o.x + o.w - 3, o.y, 3, o.h);
  const midX = o.x + Math.floor(o.w / 2) - 1;
  const midY = o.y + Math.floor(o.h / 2) - 1;
  d += rect(midX, o.y, 2, o.h);
  d += rect(o.x, midY, o.w, 2);
  return d;
}

/** a graded sky inside the glass: dithered from deep at the top to lighter toward the horizon.
 * `max` caps the dither strength (night can be bold; day stays subtle on the bright blue). */
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

/** the crescent moon (night), upper-left of the glass */
function moon(): string {
  const cx = GLASS.x + 11;
  const cy = GLASS.y + 9;
  const r = 5;
  let d = '';
  for (let dy = -r; dy <= r; dy++)
    for (let dx = -r; dx <= r; dx++) {
      if (dx * dx + dy * dy > r * r) continue;
      const ox = dx - 3;
      const oy = dy - 1;
      if (ox * ox + oy * oy <= (r - 1) * (r - 1)) continue;
      d += rect(cx + dx, cy + dy, 1, 1);
    }
  return d;
}

/** the sun (day): a full disc, upper-left of the glass, with a few short rays */
function sun(): { disc: string; rays: string } {
  const cx = GLASS.x + 11;
  const cy = GLASS.y + 9;
  const r = 5;
  let disc = '';
  for (let dy = -r; dy <= r; dy++)
    for (let dx = -r; dx <= r; dx++)
      if (dx * dx + dy * dy <= r * r) disc += rect(cx + dx, cy + dy, 1, 1);
  const rays =
    rect(cx, cy - r - 3, 1, 2) + // up
    rect(cx, cy + r + 2, 1, 2) + // down
    rect(cx - r - 3, cy, 2, 1) + // left
    rect(cx + r + 2, cy, 2, 1) + // right
    rect(cx - r - 2, cy - r - 2, 2, 2) + // NW
    rect(cx + r + 1, cy - r - 2, 2, 2) + // NE
    rect(cx - r - 2, cy + r + 1, 2, 2) + // SW
    rect(cx + r + 1, cy + r + 1, 2, 2); // SE
  return { disc, rays };
}

/** scattered stars in the upper sky (night) */
function stars(): string {
  // kept in the upper sky, above the horizon and clear of the moon (moon ≈ x10..16, y4..14)
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

/** two clouds in the day sky */
function clouds(): string {
  const g = GLASS;
  const a = art(['.####.', '########', '.######.'], g.x + 26, g.y + 6);
  const b = art(['.###.', '#######', '.#####.'], g.x + 42, g.y + 16);
  return a + b;
}

/** the city skyline along the horizon: staggered building blocks */
function city(): string {
  const g = GLASS;
  // [offsetX, width, height-above-horizon]
  const bld: Array<[number, number, number]> = [
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
  let d = '';
  for (const [ox, w, h] of bld) d += rect(g.x + ox, HORIZON - h, w, g.y + g.h - (HORIZON - h));
  return d;
}

/** lit windows dotted on the buildings (night only, a warm accent) */
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

/* --- the bed (lower-left, below the text zone) --- */

const BED = { x: 0, y: 60, w: 44 } as const;

function bed(): { frame: string; sheet: string; blanket: string; pillow: string } {
  const { x, y, w } = BED;
  return {
    frame: rect(x, y - 4, 4, 22) + rect(x, y + 10, w, 8),
    sheet: rect(x, y + 4, w, 8),
    blanket: rect(x + 15, y + 4, w - 15, 6),
    pillow: rect(x + 5, y + 2, 12, 6),
  };
}

/** a potted plant between the bed and the window */
function plant(): { pot: string; leaves: string } {
  const px = 62;
  const py = FLOOR_Y - 12;
  const leaves = art(
    [
      '...#....#...',
      '..##...##...',
      '.###..###.#.',
      '####.####.##',
      '.##########.',
      '..########..',
      '...######...',
      '....####....',
    ],
    px,
    py - 8,
  );
  return { pot: rect(px + 2, py, 8, 10), leaves };
}

/* --- the right wall: a bookshelf over the desk, the desk, the Macintosh, the lamp --- */

/** a bookshelf on the upper-right wall, over the desk */
function shelf(): { wood: string; books: string } {
  const sx = 150;
  const sy = 8;
  const sw = 42;
  let books = '';
  const spines = [3, 5, 2, 4, 6, 3, 5, 4, 2, 5, 3, 4];
  let cx = sx + 2;
  for (const h of spines) {
    books += rect(cx, sy + 9 - h, 2, h);
    cx += 3;
    if (cx > sx + sw - 4) break;
  }
  return { wood: rect(sx, sy, sw, 2) + rect(sx, sy + 9, sw, 2), books };
}

const DESK = { x: 148, y: 64, w: 44, h: 4 } as const;

function desk(): string {
  let d = rect(DESK.x, DESK.y, DESK.w, DESK.h);
  d += rect(DESK.x + 4, DESK.y + DESK.h, 4, FLOOR_Y - (DESK.y + DESK.h)); // left leg
  d += rect(DESK.x + DESK.w - 8, DESK.y + DESK.h, 4, FLOOR_Y - (DESK.y + DESK.h)); // right leg
  return d;
}

// the compact all-in-one Macintosh on the desk
const MAC = { x: 156, y: 40, w: 28, h: 24 } as const;

function mac(): { body: string; recess: string; slot: string } {
  const m = MAC;
  const body = rect(m.x, m.y, m.w, m.h - 4) + rect(m.x + 3, m.y + m.h - 4, m.w - 6, 4);
  const recess = rect(m.x + 3, m.y + 3, m.w - 6, m.h - 13);
  const slot = rect(m.x + m.w - 10, m.y + m.h - 8, 7, 1);
  return { body, recess, slot };
}

function screen(): { glow: string; code: string } {
  const sx = MAC.x + 5;
  const sy = MAC.y + 5;
  const sw = MAC.w - 10;
  const sh = MAC.h - 17;
  const glow = rect(sx, sy, sw, sh);
  let code = '';
  const lines = [
    [1, 7],
    [1, 4],
    [3, 5],
    [3, 3],
    [1, 6],
  ];
  for (let i = 0; i < lines.length && i < sh - 1; i++) {
    const [off, len] = lines[i];
    code += rect(sx + off, sy + 1 + i * 2, Math.min(len, sw - off - 1), 1);
  }
  return { glow, code };
}

// the desk lamp (angle-poise) clamped to the right of the desk, reaching left over the work
const LAMP = { bx: 188, by: 64 } as const;

function lamp(): { arm: string; head: string; cone: string } {
  const { bx, by } = LAMP;
  const arm =
    rect(bx, by - 2, 4, 2) +
    rect(bx + 1, by - 16, 2, 14) +
    rect(bx - 10, by - 17, 13, 2) +
    rect(bx - 10, by - 16, 2, 4);
  const head =
    rect(bx - 13, by - 14, 8, 2) + rect(bx - 12, by - 12, 6, 2) + rect(bx - 11, by - 10, 4, 1);
  let cone = '';
  const cx = bx - 9;
  for (let r = 0; r < 5; r++) {
    const yy = by - 9 + r * 2;
    const spread = 3 + r * 2;
    cone += dither(cx - spread, yy, spread * 2, 2, 9 - r * 2);
  }
  return { arm, head, cone };
}

/* --- a round wall clock, between the window and the shelf (clear of the text zone) --- */

const CLOCK = { cx: 144, cy: 28, r: 6 } as const;

/** the clock's face (filled disc) — drawn in the furniture-dark tone as a backing */
function clockFace(): string {
  const { cx, cy, r } = CLOCK;
  let d = '';
  for (let dy = -r; dy <= r; dy++)
    for (let dx = -r; dx <= r; dx++)
      if (dx * dx + dy * dy <= r * r) d += rect(cx + dx, cy + dy, 1, 1);
  return d;
}

/** a thin 1-cell ring around the face */
function clockRing(): string {
  const { cx, cy, r } = CLOCK;
  let ring = '';
  for (let dy = -r; dy <= r; dy++)
    for (let dx = -r; dx <= r; dx++) {
      const dist = dx * dx + dy * dy;
      if (dist <= r * r && dist > (r - 1) * (r - 1)) ring += rect(cx + dx, cy + dy, 1, 1);
    }
  // four tick marks at 12/3/6/9
  ring += rect(cx, cy - r + 1, 1, 1) + rect(cx, cy + r - 1, 1, 1);
  ring += rect(cx - r + 1, cy, 1, 1) + rect(cx + r - 1, cy, 1, 1);
  return ring;
}

/** clock hands + centre pin: a day hour (~10:10) vs a night hour (~9:40), differing by theme */
function clockHands(day: boolean): string {
  const { cx, cy } = CLOCK;
  const pin = rect(cx, cy, 1, 1);
  if (day) {
    // minute hand up, hour hand to ~2 o'clock (≈10:10)
    return pin + rect(cx, cy - 4, 1, 4) + rect(cx + 1, cy - 1, 3, 1);
  }
  // minute hand up-left (~8), hour hand down-right-ish (≈9:40)
  return pin + rect(cx - 3, cy - 2, 3, 1) + rect(cx, cy + 1, 1, 3);
}

/* ----------------------------------------------------------------------------------------------- *
 * The component. `day` picks the view outside the window and the clock. By default the room draws
 * BOTH overlaid via CSS (the day layer shown only under `.light`), so one static SVG serves both
 * themes without JS — see the wrapper classes below.
 * ----------------------------------------------------------------------------------------------- */

const box: CSSProperties = { imageRendering: 'pixelated' };

export function Room({ className }: { className?: string }) {
  const b = bed();
  const pl = plant();
  const sh = shelf();
  const mc = mac();
  const sc = screen();
  const lm = lamp();
  const su = sun();

  return (
    <svg
      aria-hidden
      viewBox={`0 0 ${W} ${H}`}
      shapeRendering="crispEdges"
      className={className}
      style={box}
      preserveAspectRatio="xMidYMid meet"
    >
      {/* wall + floor: a fixed dark night room (the same in both themes) */}
      <path d={wall()} className="fill-(--lp-room-wall)" />
      <path d={floor()} className="fill-(--lp-room-floor)" />

      {/* --- the view outside the window --- */}
      {/* NIGHT (default / dark mode): deep sky, lit city, moon + stars */}
      <g className="room-night">
        <path d={rect(GLASS.x, GLASS.y, GLASS.w, GLASS.h)} className="fill-(--lp-ocean-night)" />
        <path d={sky()} className="fill-(--lp-ocean)/40" />
        <path d={city()} className="fill-(--lp-city-night)" />
        <path d={cityLights()} className="fill-(--lp-sun)" />
        <path d={moon()} className="fill-(--lp-moon)" />
        <path d={stars()} className="fill-(--lp-moon)" />
      </g>
      {/* DAY (light mode): blue sky, daylit city, sun + clouds */}
      <g className="room-day">
        <path d={rect(GLASS.x, GLASS.y, GLASS.w, GLASS.h)} className="fill-(--lp-sky-day)" />
        <path d={sky(6)} className="fill-(--lp-sky-day-2)/45" />
        <path d={city()} className="fill-(--lp-city-day)" />
        <path d={su.rays} className="fill-(--lp-sun-day)" />
        <path d={su.disc} className="fill-(--lp-sun-day)" />
        <path d={clouds()} className="fill-(--lp-cloud)" />
      </g>

      {/* window frame on top of the view */}
      <path d={windowFrame()} className="fill-(--lp-room-furniture)" />

      {/* bed (lower-left) */}
      <path d={b.frame} className="fill-(--lp-room-furniture-dark)" />
      <path d={b.sheet} className="fill-(--lp-ocean)/55" />
      <path d={b.blanket} className="fill-(--lp-ocean)/80" />
      <path d={b.pillow} className="fill-(--lp-room-furniture-light)" />

      {/* plant */}
      <path d={pl.pot} className="fill-(--lp-room-furniture-dark)" />
      <path d={pl.leaves} className="fill-(--lp-land)" />

      {/* bookshelf + wall clock on the right wall */}
      <path d={sh.wood} className="fill-(--lp-room-furniture-dark)" />
      <path d={sh.books} className="fill-(--lp-sun)/70" />
      <path d={clockFace()} className="fill-(--lp-room-furniture-dark)" />
      <path d={clockRing()} className="fill-(--lp-room-furniture-light)" />
      <g className="room-night">
        <path d={clockHands(false)} className="fill-(--lp-room-furniture-light)" />
      </g>
      <g className="room-day">
        <path d={clockHands(true)} className="fill-(--lp-room-furniture-light)" />
      </g>

      {/* desk */}
      <path d={desk()} className="fill-(--lp-room-furniture)" />

      {/* Macintosh: body, dark screen recess, glowing code screen, disk slot */}
      <path d={mc.body} className="fill-(--lp-mac-ice)/90" />
      <path d={mc.recess} className="fill-(--lp-room-wall)" />
      <path d={sc.glow} className="fill-(--lp-mac-blue)" />
      <path d={sc.code} className="fill-(--lp-mac-ice)" />
      <path d={mc.slot} className="fill-(--lp-room-furniture-dark)" />

      {/* desk lamp: the warm pool on the desk, then the arm and shade over it */}
      <path d={lm.cone} className="fill-(--lp-yellow)/35" />
      <path d={lm.arm} className="fill-(--lp-room-furniture-dark)" />
      <path d={lm.head} className="fill-(--lp-yellow)" />
    </svg>
  );
}
