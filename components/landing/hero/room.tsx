// Road to AI: an original pixel-art lofi bedroom for the hero, in the dusk/night mood of the
// references (a studying figure, a Macintosh monitor, a window onto a city skyline with a crescent
// moon). STATIC MOCKUP: no motion yet. Composition follows the "Ocean Waves" study-room frame the
// owner likes: open space top-left (the heading/buttons live there, in the text column), the desk
// and figure on the right, the window in the middle, the bed lower-left.
//
// Drawn as pure SVG pixel art with `crispEdges`, reusing the stage helpers (`rect`/`art`/`dither`),
// so it needs no WebGL and is inherently reduced-motion safe. Tones are the landing's `--lp-*`
// tokens, so it follows the site's light/dark themes.
import type { CSSProperties } from 'react';
import { art, dither, rect } from '../sections/stage';

// The room is drawn on a 160x90 cell grid (16:9). Cells are square; the SVG scales to its box.
const W = 160;
const H = 90;

/* ----------------------------------------------------------------------------------------------- *
 * Tones. Each tone is one SVG <path> (one fill). Paths are concatenated path-data strings built by
 * `rect`/`art`/`dither`. Layered back-to-front: wall, window + sky, furniture, desk, figure, lamp.
 * ----------------------------------------------------------------------------------------------- */

/** the back wall: a flat fill with a faint dither near the floor for depth */
function wall(): string {
  return rect(0, 0, W, 72);
}

/** the floor: lower band, slightly darker */
function floor(): string {
  return rect(0, 72, W, H - 72);
}

/* --- the window (centre), its frame, the sky, the city, the moon and stars --- */

const WIN = { x: 44, y: 14, w: 60, h: 44 } as const; // outer frame
const GLASS = { x: WIN.x + 3, y: WIN.y + 3, w: WIN.w - 6, h: WIN.h - 6 } as const;

/** the window frame (mullions split it into four panes) */
function windowFrame(): string {
  const o = WIN;
  let d = '';
  // outer border, 3 cells thick
  d += rect(o.x, o.y, o.w, 3);
  d += rect(o.x, o.y + o.h - 3, o.w, 3);
  d += rect(o.x, o.y, 3, o.h);
  d += rect(o.x + o.w - 3, o.y, 3, o.h);
  // mullions
  const midX = o.x + Math.floor(o.w / 2) - 1;
  const midY = o.y + Math.floor(o.h / 2) - 1;
  d += rect(midX, o.y, 2, o.h);
  d += rect(o.x, midY, o.w, 2);
  return d;
}

/** the night sky gradient inside the glass, dithered from deep (top) to lighter near the horizon */
function sky(): string {
  const g = GLASS;
  const horizon = g.y + Math.floor(g.h * 0.62);
  let d = '';
  // upper sky: darkest (handled by the solid ocean-night fill under this; here we add a graded
  // lightening band toward the horizon using dither)
  for (let band = 0; band < 5; band++) {
    const yy = g.y + Math.floor((horizon - g.y) * (band / 5));
    const hh = Math.ceil((horizon - g.y) / 5);
    d += dither(g.x, yy, g.w, hh, 2 + band * 2);
  }
  return d;
}

/** the crescent moon: a disc with a bite taken out, upper-left of the glass */
function moon(): string {
  const cx = GLASS.x + 12;
  const cy = GLASS.y + 9;
  const r = 5;
  let d = '';
  for (let dy = -r; dy <= r; dy++) {
    for (let dx = -r; dx <= r; dx++) {
      if (dx * dx + dy * dy > r * r) continue;
      // carve the crescent: skip cells inside an offset disc
      const ox = dx - 3;
      const oy = dy - 1;
      if (ox * ox + oy * oy <= (r - 1) * (r - 1)) continue;
      d += rect(cx + dx, cy + dy, 1, 1);
    }
  }
  return d;
}

/** scattered stars in the upper sky */
function stars(): string {
  const pts: Array<[number, number]> = [
    [8, 4],
    [20, 7],
    [30, 3],
    [40, 9],
    [15, 14],
    [34, 16],
    [47, 5],
    [6, 20],
    [26, 22],
  ];
  let d = '';
  for (const [px, py] of pts) d += rect(GLASS.x + px, GLASS.y + py, 1, 1);
  return d;
}

/** the city skyline along the horizon inside the glass: staggered building blocks */
function city(): string {
  const g = GLASS;
  const base = g.y + Math.floor(g.h * 0.62);
  // [offsetX, width, height] of each building, left to right
  const bld: Array<[number, number, number]> = [
    [1, 7, 10],
    [8, 5, 16],
    [13, 8, 7],
    [22, 6, 20],
    [28, 9, 12],
    [38, 5, 17],
    [43, 7, 9],
  ];
  let d = '';
  for (const [ox, w, h] of bld) d += rect(g.x + ox, base - h, w, g.y + g.h - (base - h));
  return d;
}

/** lit windows dotted on the buildings (a warm accent) */
function cityLights(): string {
  const g = GLASS;
  const base = g.y + Math.floor(g.h * 0.62);
  const pts: Array<[number, number]> = [
    [3, 4],
    [10, 8],
    [10, 12],
    [24, 6],
    [24, 12],
    [30, 5],
    [40, 8],
    [45, 5],
  ];
  let d = '';
  for (const [ox, up] of pts) d += rect(g.x + ox, base - up, 1, 1);
  return d;
}

/* --- the bed (lower-left), the bookshelf (right wall), plant, wall clock --- */

/** the bed, lower-left: a headboard, mattress, a folded-down blanket and a pillow */
function bed(): { frame: string; sheet: string; blanket: string; pillow: string } {
  const bx = 0;
  const by = 54;
  const bw = 38;
  return {
    // headboard (left) + the base/frame under the mattress
    frame: rect(bx, by - 4, 4, 20) + rect(bx, by + 10, bw, 8),
    // the sheet / mattress top
    sheet: rect(bx, by + 4, bw, 8),
    // the blanket folded over the foot (right two-thirds), a darker band
    blanket: rect(bx + 14, by + 4, bw - 14, 6),
    // the pillow at the head (left), propped against the headboard
    pillow: rect(bx + 5, by + 2, 11, 6),
  };
}

/** a bookshelf on the right wall above the desk */
function shelf(): { wood: string; books: string } {
  const sx = 120;
  const sy = 6;
  let books = '';
  // two rows of book spines of varied height
  const spines = [3, 5, 2, 4, 6, 3, 5, 4, 2, 5];
  let cx = sx + 2;
  for (const h of spines) {
    books += rect(cx, sy + 9 - h, 2, h);
    cx += 3;
    if (cx > sx + 34) break;
  }
  return {
    wood: rect(sx, sy, 38, 2) + rect(sx, sy + 9, 38, 2),
    books,
  };
}

/** a potted plant in the near-left corner */
function plant(): { pot: string; leaves: string } {
  const px = 40;
  const py = 60;
  const leaves =
    art(
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
    ) ?? '';
  return {
    pot: rect(px + 2, py, 8, 8),
    leaves,
  };
}

/** a round wall clock */
function clock(): { ring: string; hands: string } {
  const cx = 18;
  const cy = 14;
  const r = 5;
  let ring = '';
  for (let dy = -r; dy <= r; dy++)
    for (let dx = -r; dx <= r; dx++) {
      const dist = dx * dx + dy * dy;
      if (dist <= r * r && dist >= (r - 1) * (r - 1)) ring += rect(cx + dx, cy + dy, 1, 1);
    }
  const hands = rect(cx, cy - 3, 1, 3) + rect(cx, cy, 3, 1);
  return { ring, hands };
}

/* --- the desk, the Macintosh monitor, the lamp (right) --- */

const DESK = { x: 96, y: 60, w: 62, h: 4 } as const;

/** the desk top + two legs (kept clear of the figure, so only an outer pair of legs) */
function desk(): string {
  let d = rect(DESK.x, DESK.y, DESK.w, DESK.h);
  d += rect(DESK.x + DESK.w - 6, DESK.y + DESK.h, 4, 72 - (DESK.y + DESK.h)); // right leg
  d += rect(DESK.x + 22, DESK.y + DESK.h, 4, 72 - (DESK.y + DESK.h)); // left leg, clear of him
  return d;
}

// The compact all-in-one Macintosh, sitting on the right of the desk. A beige-ish box with a
// recessed dark screen that glows with code, a disk slot, and a slightly narrower base.
const MAC = { x: 120, y: 34, w: 30, h: 26 } as const;

/** the Macintosh body: the box, the stepped-in base, the dark screen recess and a disk slot */
function mac(): { body: string; recess: string; slot: string } {
  const m = MAC;
  const body =
    rect(m.x, m.y, m.w, m.h - 4) + // main box
    rect(m.x + 3, m.y + m.h - 4, m.w - 6, 4); // slightly narrower base
  // the sunken screen area (upper two-thirds), inset from the body edges
  const recess = rect(m.x + 3, m.y + 3, m.w - 6, m.h - 13);
  // the floppy-disk slot, lower-right of the face
  const slot = rect(m.x + m.w - 10, m.y + m.h - 8, 7, 1);
  return { body, recess, slot };
}

/** the glowing code screen (an accent fill) + fake code lines, inset inside the recess */
function screen(): { glow: string; code: string } {
  const sx = MAC.x + 5;
  const sy = MAC.y + 5;
  const sw = MAC.w - 10;
  const sh = MAC.h - 17;
  const glow = rect(sx, sy, sw, sh);
  // short dashes standing in for lines of code, indented like real source
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

// The desk lamp: an angle-poise clamped to the right edge of the desk, arm reaching left over the
// work, shade tilted down. A tight warm pool of light falls on the desk under it.
const LAMP = { bx: 152, by: 60 } as const;

function lamp(): { arm: string; head: string; cone: string } {
  const { bx, by } = LAMP;
  // clamp/base on the desk, a vertical post, an arm angling up-left, down to the shade
  const arm =
    rect(bx, by - 2, 4, 2) + // base clamp
    rect(bx + 1, by - 16, 2, 14) + // post
    rect(bx - 10, by - 17, 13, 2) + // arm reaching left
    rect(bx - 10, by - 16, 2, 4); // short drop to the shade
  // the shade, a small trapezoid opening downward over the desk
  const head =
    rect(bx - 13, by - 14, 8, 2) + rect(bx - 12, by - 12, 6, 2) + rect(bx - 11, by - 10, 4, 1);
  // a compact warm pool of light on the desk directly under the shade
  let cone = '';
  const cx = bx - 9;
  for (let r = 0; r < 5; r++) {
    const yy = by - 9 + r * 2;
    const spread = 3 + r * 2;
    cone += dither(cx - spread, yy, spread * 2, 2, 9 - r * 2);
  }
  return { arm, head, cone };
}

/* --- the seated figure at the desk, right beside the Mac --- */

// Side profile facing RIGHT toward the Mac, hunched over the desk (as in the reference frame).
// Drawn larger so it reads as a person; the DESK is painted over its lower rows, so he sits behind
// the desk edge with only his upper body and the arm on the desktop showing. Top to bottom:
// hair, face, neck, the shoulders and hunched back, the arm along the desktop to the hand, then the
// torso that the desk crosses in front of. `:` hair, `s` face, `w` lit shirt, `d` the shaded side
// of the shirt, `#` outline, `h` hand.
const FIGURE = [
  '...::::::....', // 0 hair
  '..::::::::...', // 1
  '..::sssss#...', // 2 face, brow
  '..::sssss#...', // 3 face
  '..::sssss#...', // 4 face, jaw
  '...dsss#.....', // 5 neck
  '..#dwwww#....', // 6 collar / shoulders
  '.#dwwwwww#...', // 7 hunched upper back
  '#ddwwwwwww#..', // 8 back + shoulder of the near arm
  '#ddwwwwwwwwwh', // 9 the near arm reaching along the desktop -> hand
  '#ddwwwwwww#..', // 10 lower back
  '#ddwwwwwww#..', // 11 waist (desk crosses here and below)
  '#ddwwwwwww#..', // 12
];

// x snug against the Mac (x=120); row 9 (the arm/hand) lands on the desk top at y=60
const FIG = { x: 108, y: 51 } as const;

function figure(): { body: string; shade: string; hair: string; face: string; hand: string } {
  return {
    body: art(FIGURE, FIG.x, FIG.y, 'w') + art(FIGURE, FIG.x, FIG.y, '#'),
    shade: art(FIGURE, FIG.x, FIG.y, 'd'),
    hair: art(FIGURE, FIG.x, FIG.y, ':'),
    face: art(FIGURE, FIG.x, FIG.y, 's'),
    hand: art(FIGURE, FIG.x, FIG.y, 'h'),
  };
}

/** the office chair back rising behind the figure (to his left) */
function chair(): string {
  return (
    rect(FIG.x - 3, FIG.y + 4, 3, 12) + // headrest/back
    rect(FIG.x - 2, FIG.y + 16, 2, 72 - (FIG.y + 16)) // post down toward the floor
  );
}

/* ----------------------------------------------------------------------------------------------- *
 * The component.
 * ----------------------------------------------------------------------------------------------- */

const box: CSSProperties = { imageRendering: 'pixelated' };

export function Room({ className }: { className?: string }) {
  const b = bed();
  const sh = shelf();
  const pl = plant();
  const cl = clock();
  const mc = mac();
  const sc = screen();
  const lm = lamp();
  const fg = figure();
  const ch = chair();

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

      {/* window: sky base, graded sky, city, lights, moon, stars, then frame on top */}
      <path d={rect(GLASS.x, GLASS.y, GLASS.w, GLASS.h)} className="fill-(--lp-ocean-night)" />
      <path d={sky()} className="fill-(--lp-ocean)/40" />
      <path d={city()} className="fill-(--lp-ocean-night)" />
      <path d={cityLights()} className="fill-(--lp-sun)" />
      <path d={moon()} className="fill-(--lp-moon)" />
      <path d={stars()} className="fill-(--lp-moon)" />
      <path d={windowFrame()} className="fill-(--lp-room-furniture)" />

      {/* bed (lower-left) */}
      <path d={b.frame} className="fill-(--lp-room-furniture-dark)" />
      <path d={b.sheet} className="fill-(--lp-ocean)/55" />
      <path d={b.blanket} className="fill-(--lp-ocean)/80" />
      <path d={b.pillow} className="fill-(--lp-room-furniture-light)" />

      {/* bookshelf + clock + plant on the walls */}
      <path d={sh.wood} className="fill-(--lp-room-furniture-dark)" />
      <path d={sh.books} className="fill-(--lp-sun)/70" />
      <path d={cl.ring} className="fill-(--lp-room-furniture)" />
      <path d={cl.hands} className="fill-(--lp-room-furniture-light)" />
      <path d={pl.pot} className="fill-(--lp-room-furniture-dark)" />
      <path d={pl.leaves} className="fill-(--lp-land)" />

      {/* chair + the seated figure in profile; the desk is painted over his lower torso next, so he
          sits behind the desk edge with only his upper body showing. His back catches the monitor
          light (a cool tint), the far side of him is in shadow, his face and hand are lit skin. */}
      <path d={ch} className="fill-(--lp-room-furniture-dark)" />
      <path d={fg.body} className="fill-(--lp-mac-blue)/50" />
      <path d={fg.shade} className="fill-(--lp-room-wall)" />
      <path d={fg.face} className="fill-(--lp-moon)" />
      <path d={fg.hair} className="fill-(--lp-room-furniture-dark)" />
      <path d={fg.hand} className="fill-(--lp-moon)/90" />

      {/* desk, over the figure's lower torso */}
      <path d={desk()} className="fill-(--lp-room-furniture)" />

      {/* Macintosh: body, dark screen recess, glowing code screen, disk slot */}
      <path d={mc.body} className="fill-(--lp-mac-ice)/90" />
      <path d={mc.recess} className="fill-(--lp-room-wall)" />
      <path d={sc.glow} className="fill-(--lp-mac-blue)" />
      <path d={sc.code} className="fill-(--lp-mac-ice)" />
      <path d={mc.slot} className="fill-(--lp-room-furniture-dark)" />

      {/* desk lamp: the warm pool on the desk, then the arm and shade over it */}
      <path d={lm.cone} className="fill-(--lp-yellow)/35" />
      <path d={lm.arm} className="fill-lp-ink/75" />
      <path d={lm.head} className="fill-(--lp-yellow)" />
    </svg>
  );
}
