/**
 * The night sky carried over the hero's text column (Road to AI; not from Fumadocs). The globe's
 * canvas draws its stars only in the sky column, so this spreads the same kind of stars, 3px dots
 * and accent pluses, over the left half, fewer toward the horizon as the sky's are. One per 78px
 * block at most, placed by a hash, so the page renders the same stars every time; a few pluses
 * twinkle on the 120 bpm grid (not with reduced motion). Static SVG, rendered on the server.
 */

const WIDTH = 720;
const HEIGHT = 900;
/** the sky shader's block: 26 cells of 3px */
const BLOCK = 78;
const DOT = 3;

/** a number in [0, 1) from a block and a salt, the same on every render */
function hash(x: number, y: number, salt: number): number {
  let h = Math.imul(x + 1, 0x9e3779b1) ^ Math.imul(y + 7, 0x85ebca6b) ^ Math.imul(salt, 0xc2b2ae35);
  h = Math.imul(h ^ (h >>> 15), 0x2c1b3c6d);
  h ^= h >>> 13;
  return (h >>> 0) / 4294967296;
}

interface Star {
  x: number;
  y: number;
  bright: boolean;
  twinkle: boolean;
  delay: number;
}

function stars(): Star[] {
  const out: Star[] = [];
  for (let by = 0; by < HEIGHT / BLOCK; by++) {
    // the sky shader's density: 70% of blocks near the top, 15% at the horizon
    const chance = 0.7 - (0.55 * (by + 0.5)) / (HEIGHT / BLOCK);
    for (let bx = 0; bx < WIDTH / BLOCK; bx++) {
      if (hash(bx, by, 1) >= chance) continue;
      const x = bx * BLOCK + DOT * (4 + Math.floor(hash(bx, by, 2) * 18));
      const y = by * BLOCK + DOT * (4 + Math.floor(hash(bx, by, 3) * 18));
      const bright = hash(bx, by, 4) < 1 / 7;
      out.push({
        x,
        y,
        bright,
        twinkle: bright && hash(bx, by, 5) < 0.6,
        delay: Math.floor(hash(bx, by, 6) * 24) * 125,
      });
    }
  }
  return out;
}

const FIELD = stars();

/** a plus three dots across, centred on its dot */
function plus(x: number, y: number) {
  return `M${x - DOT} ${y}h${3 * DOT}v${DOT}h${-3 * DOT}zM${x} ${y - DOT}h${DOT}v${3 * DOT}h${-DOT}z`;
}

export function Starfield({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      preserveAspectRatio="xMaxYMax slice"
      shapeRendering="crispEdges"
      className={className}
    >
      <g className="fill-lp-ink">
        {FIELD.filter((s) => !s.bright).map((s) => (
          <rect key={`${s.x}-${s.y}`} x={s.x} y={s.y} width={DOT} height={DOT} />
        ))}
      </g>
      <g className="fill-lp-sun dark:fill-lp-yellow">
        {FIELD.filter((s) => s.bright).map((s) => (
          <path
            key={`${s.x}-${s.y}`}
            d={plus(s.x, s.y)}
            className={s.twinkle ? 'motion-safe:animate-lp-twinkle' : undefined}
            style={s.twinkle ? { animationDelay: `${s.delay}ms` } : undefined}
          />
        ))}
      </g>
    </svg>
  );
}
