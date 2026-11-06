// Adapted from Fumadocs (https://github.com/fuma-nama/fumadocs, commit 55decd9),
// apps/docs/app/(landing)/sections/hero/scene.ts. MIT License, Copyright (c) 2023 Fuma.
// See components/landing/LICENSE-fumadocs.txt.
//
// Road to AI: the moon (its baked relief, maria and craters) became a dithered Earth: an
// equirectangular land mask (./earth.ts) sampled on a spinning, tilted sphere. Its satellites are
// the site's sections, as many as there are, each prism tinted in its section's accent. The orbit
// ring and the star field are Fumadocs' own.
import { bayer8 } from '../lib/dither';
import { MATERIAL } from '../lib/mesh';

/**
 * The drawing's box, in globe radii: the ring and its prisms reach `REACH` either side of the
 * globe's centre, which sits `HORIZON` over the horizon, the box's bottom edge.
 */
export const REACH = 1.46;
export const HORIZON = 0.76;
/** the globe's crown over the horizon, his seat */
export const CROWN = HORIZON + 1;
/** the dither's cell at rest, CSS px: the globe's dots and the stars */
export const CELL = 3;
/** the most sections the shader tints, the moon included */
export const MAX_SATELLITES = 8;

/** one body round the globe: the first section's moon, then a satellite per section */
export interface Orbiter {
  kind: 'moon' | 'satellite';
  /** the moon's radius, or the satellite body's half size, globe radii: what its label sits over */
  reach: number;
  /** turns round the ring from its right end (0.25 its front) */
  phase: number;
  /** the unit axis a satellite turns round, and seconds a turn of it */
  axis: readonly [number, number, number];
  spin: number;
}

/** the moon's radius and a satellite's half sizes (body, then each solar panel), globe radii */
export const MOON_RADIUS = 0.12;
export const SAT_BODY = [0.04, 0.045, 0.04] as const;
export const SAT_PANEL = [0.085, 0.045, 0.005] as const;

/** a number in [0, 1) from `i` and `salt`, the same on every load */
function hash01(i: number, salt: number): number {
  let h = Math.imul(i + 1, 0x9e3779b1) ^ Math.imul(salt + 7, 0x85ebca6b);
  h = Math.imul(h ^ (h >>> 15), 0x2c1b3c6d);
  h ^= h >>> 13;
  return (h >>> 0) / 4294967296;
}

/**
 * What orbits the globe, one per section in the order they pop: the first section's moon, then a
 * satellite for each other section, evenly round the ring from 0.12 of a turn past its right end;
 * each satellite's turning axis and pace varied by its index, the same on every load. With reduced
 * motion (`still`) they never move, so they spread over the ring's front half instead, where none
 * is behind the globe and every label shows.
 */
export function orbiters(count: number, still = false): Orbiter[] {
  const out: Orbiter[] = [];
  for (let i = 0; i < count; i++) {
    const ax = [hash01(i, 4) - 0.5, hash01(i, 5) + 0.6, hash01(i, 6) - 0.5];
    const l = Math.hypot(ax[0], ax[1], ax[2]);
    out.push({
      kind: i === 0 ? 'moon' : 'satellite',
      reach: i === 0 ? MOON_RADIUS : SAT_PANEL[0] * 0.6,
      phase: still ? 0.02 + (0.46 * (i + 0.5)) / count : (0.12 + i / count) % 1,
      axis: [ax[0] / l, ax[1] / l, ax[2] / l],
      spin: 24 + 12 * hash01(i, 7),
    });
  }
  return out;
}

/** the globe's, the ring's and the moon's materials, then each section's satellite panels, the
 * figure's own (a satellite's body is the mesh's grey) */
export const GLOBE = MATERIAL.figure;
export const RING = MATERIAL.figure + 1;
export const MOON = MATERIAL.figure + 2;
export const SATELLITE = MATERIAL.figure + 3;

/** the Earth's axial tilt, radians: its north pole leans right, as on a desk globe */
export const TILT = (23.4 * Math.PI) / 180;

/**
 * The globe's, the ring's, the moon's and the satellites' materials, in the scene's globe radii
 * (x right, y up, z toward the viewer, the globe's centre at the origin). The globe: a true circle
 * with a pen a dot wide round it, shaded on cells counted from its middle so they rise with it: 2
 * dots at rest, `uCell` in the boot's mosaic. Its surface point turns to a longitude and latitude
 * through its tilt and `uSpin`: green land and blue ocean by day, their darker shades by night,
 * the terminator dithered between them, and faint graticule dots every 30° on the day side's ocean.
 * Lit by the pointer's sun. Before the land mask arrives (`uLandReady` 0) it is all ocean.
 */
export const figureShader = `
uniform sampler2D uLand;
uniform float uLandReady;
uniform float uRadius;
uniform float uCell;
uniform float uSpin;
uniform vec4 uOrbit;
uniform vec3 uInk, uPaper;
uniform vec3 uOcean, uOceanNight, uLandDay, uLandNight, uMoonLit, uMoonDark;
uniform vec3 uSat[${MAX_SATELLITES}];

const float TAU = 6.2831853;
const float PI = 3.1415927;
const float TILT = ${TILT.toFixed(6)};

/** the globe's face at disc point at, on its dots counted from its middle, so they ride its rise */
vec3 surface(vec2 at) {
  float size = (uCell < 2.5 ? 2.0 : uCell) * uDot;
  vec2 cell = floor(at * uRadius / size);
  vec2 pc = uCell < 2.5 ? at : (cell + 0.5) * size / uRadius;
  float threshold = bayer8(cell);
  vec2 p = pc / max(1.0, length(pc));
  vec3 n = vec3(p, sqrt(max(0.0, 1.0 - dot(p, p))));
  float sun = dot(n, uLight);

  // the point on the Earth: the tilt undone (round the view axis), then the spin round its axis
  float c = cos(TILT), s = sin(TILT);
  vec3 q = vec3(c * n.x - s * n.y, s * n.x + c * n.y, n.z);
  float lon = atan(q.x, q.z) + uSpin;
  float lat = asin(clamp(q.y, -1.0, 1.0));
  vec2 uv = vec2(fract(lon / TAU + 0.5), 0.5 - lat / PI);
  // a cell's worth of the map at the globe's middle (1024 texels round it): texels a cell, as a
  // mip level
  float lod = log2(max(1.0, ${(1024 / (2 * Math.PI)).toFixed(3)} * size / uRadius));
  float land = uLandReady > 0.5 ? textureLod(uLand, uv, lod).r : 0.0;

  // the graticule: a cell on a 30° line of latitude or longitude, every other cell
  float every = PI / 6.0;
  float reach = 0.6 * size / uRadius / max(n.z, 0.25);
  float dLat = abs(lat - every * floor(lat / every + 0.5));
  float dLon = abs(lon - every * floor(lon / every + 0.5)) * cos(lat);
  bool grid = min(dLat, dLon) < reach && mod(cell.x + cell.y, 2.0) < 0.5 && abs(lat) < 1.4;

  // day by its colours, night by their darker shades, the terminator dithered between them, and a
  // few dots of shade where the sun is low on the day side
  float day = smoothstep(-0.06, 0.14, sun);
  float low = 0.35 * (1.0 - clamp(sun / 0.6, 0.0, 1.0));
  bool lit = threshold < day && threshold >= low;
  bool ground = land > 0.5;
  if (!lit) return ground ? uLandNight : uOceanNight;
  if (grid && !ground) return uOceanNight;
  return ground ? uLandDay : uOcean;
}

vec4 globe(vec2 at) {
  // canvas px past its rim: its edge and the dot of pen inside it blended across the px
  float rim = (length(at) - 1.0) * uRadius;
  if (rim > 0.5) discard;
  float cover = clamp(0.5 - rim, 0.0, 1.0);
  vec3 c = mix(surface(at), uInk, clamp(rim + uDot + 0.5, 0.0, 1.0));
  return vec4(c * cover, cover);
}

vec4 ring(vec2 at) {
  float c = cos(uOrbit.z), s = sin(uOrbit.z);
  vec2 screen = vec2(at.x, -at.y);
  vec2 e = vec2(screen.x * c + screen.y * s, -screen.x * s + screen.y * c);
  vec2 u = e / uOrbit.xy;
  // dots off the ellipse
  vec2 g = 2.0 * e / (uOrbit.xy * uOrbit.xy);
  float gap = abs(dot(u, u) - 1.0) / length(g) * uRadius / uDot;
  // the pen a dot wide starts at the right end and runs the way the satellites go; a dot of paper
  // either side cuts the ring out of whatever it crosses
  if (gap >= 1.5 || mod(-atan(u.y, u.x), TAU) > uOrbit.w * TAU) discard;
  return vec4(mix(uPaper, uInk, clamp((0.5 - gap) * uDot + 0.5, 0.0, 1.0)), 1.0);
}

/** the moon: grey, lit in the dither, three craters on its near side */
vec4 moon(vec3 normal) {
  float lambert = dot(normal, uLight);
  float tone = floor(clamp((lambert + 0.1) / 0.6, 0.0, 1.0) * 4.0 + 0.5) / 4.0;
  float crater = max(
    max(step(0.97, dot(normal, normalize(vec3(0.45, 0.5, 0.74)))),
      step(0.985, dot(normal, normalize(vec3(-0.55, -0.15, 0.82))))),
    step(0.975, dot(normal, normalize(vec3(0.05, -0.62, 0.78)))));
  vec3 face = crater > 0.5 ? mix(uMoonLit, uMoonDark, 0.55) : uMoonLit;
  return vec4(threshold < tone ? face : uMoonDark, 1.0);
}

/** a satellite's solar panel in its section's accent, shaded in the dither as the parts are */
vec4 panel(int k, vec3 normal) {
  float lambert = dot(normal, uLight);
  float tone = floor(clamp((lambert - 0.12) / 0.3, 0.0, 1.0) * 4.0 + 0.5) / 4.0;
  tone = max(tone, 0.25);
  vec3 c = threshold < tone ? uSat[k] : uShade;
  return vec4(mix(c, uShade, line), 1.0);
}

bool figure(int material, vec3 world, vec3 normal, vec2 px, inout vec4 color) {
  if (material >= ${SATELLITE}) color = panel(material - ${SATELLITE}, normal);
  else if (material == ${MOON}) color = moon(normal);
  else color = material == ${GLOBE} ? globe(world.xy) : ring(world.xy);
  return true;
}
`;

/**
 * The star field over the sky's `CELL` px cells, counted from its top left, where nothing else is
 * drawn: bright stars rest as lit pluses and every few seconds sparkle up to a star, some to a
 * burst, and back; faint ink dots thin out toward the horizon and glint for a tick now and then;
 * every so often a shooting star crosses the upper sky, its trail dithering away behind it.
 * Stepped on `uTwinkle`, ticks; none while the boot's mosaic is coarser than its cells.
 */
export const skyShader = `
${bayer8}
uniform float uTwinkle;
// a shooting star: its head on the sky's cells, its side (0: none) and slope
uniform vec4 uShoot;
uniform float uCell;
uniform vec3 uInk, uSun;

const uint BLOCK = 26u;
// a shooting star's trail, cells, and its solid start
const float SHOOT_TRAIL = 30.0;
const float SHOOT_SOLID = 5.0;

uint hash(uvec2 p) {
  uint h = p.x * 0x9e3779b9u ^ p.y * 0x85ebca6bu;
  h = (h ^ (h >> 16)) * 0x7feb352du;
  h = (h ^ (h >> 15)) * 0x846ca68bu;
  return h ^ (h >> 16);
}

// a sparkle's cell \`d\` from its centre at \`level\`: 0 a dot, 1 a plus, 2 a long cross, 3 a burst,
// its arms longer still with ink tips and four ink glints apart at its corners; 1 lit, 2 ink, 0 none
int sparkle(vec2 d, int level) {
  vec2 a = abs(d);
  float far = a.x + a.y;
  if (min(a.x, a.y) == 0.0 && far <= float(level)) return far < 3.0 ? 1 : 2;
  return level == 3 && a.x == 2.0 && a.y == 2.0 ? 2 : 0;
}

vec4 backdrop(vec2 px) {
  if (uCell > ${CELL.toFixed(1)}) return vec4(0.0);
  vec2 cell = floor(px / (${CELL.toFixed(1)} * uDot));
  vec2 grid = floor(uBuf / (${CELL.toFixed(1)} * uDot));
  // a shooting star, its head a lit plus, its trail a staircase one cell thick
  if (uShoot.z != 0.0) {
    if (sparkle(cell - uShoot.xy, 1) != 0) return vec4(uSun, 1.0);
    float behind = (uShoot.x - cell.x) * uShoot.z;
    if (behind > 0.0 && behind < SHOOT_TRAIL && cell.y == floor(uShoot.y - behind * uShoot.w + 0.5)) {
      float fade = (behind - SHOOT_SOLID) / (SHOOT_TRAIL - SHOOT_SOLID);
      return bayer8(cell) > fade ? vec4(uInk, 1.0) : vec4(0.0);
    }
  }
  // fewer toward the horizon, one in 7 bright; a burst's reach clear of the block's edges
  uvec2 block = uvec2(cell) / BLOCK;
  uint h = hash(block);
  float row = (float(block.y) + 0.5) * float(BLOCK) / grid.y;
  if (float(h % 100u) >= mix(70.0, 15.0, row)) return vec4(0.0);
  vec2 d = cell - vec2(block * BLOCK + 4u + uvec2(h >> 8, h >> 16) % (BLOCK - 8u));
  if (max(abs(d.x), abs(d.y)) > 3.0) return vec4(0.0);
  // its twinkle: every 3 to 9 seconds, a bright star sparkles up and back, some to a burst; a
  // faint one glints a plus
  uint g = hash(uvec2(h, 7u));
  uint at = (uint(uTwinkle) + (g >> 8)) % (24u + (g >> 20) % 48u);
  bool bright = g % 7u == 0u;
  bool burst = (g & 16u) == 0u;
  int level = !bright ? (at == 0u ? 1 : 0)
    : at == 1u && burst ? 3 : at == 0u || (at == 2u && burst) ? 2 : 1;
  int s = sparkle(d, level);
  return s == 0 ? vec4(0.0) : vec4(s == 1 && bright ? uSun : uInk, 1.0);
}
`;
