// Adapted from Fumadocs (https://github.com/fuma-nama/fumadocs, commit 55decd9),
// apps/docs/components/mascot/paint.ts. MIT License, Copyright (c) 2023 Fuma.
// See components/landing/LICENSE-fumadocs.txt.
//
// Road to AI: paints the new character (./sprite.ts). The halo ring and the orbiting mini-moon are
// gone; the glint on his shades, the laptop's flicker, his cap and his hoodie are new.
import { BAYER4 } from '../lib/dither';
import { cssRgb, isDark } from '../lib/theme';
import { cellOf, MATE_H, MATE_PAD, MATE_W } from './sprite';

/** ticks: he blinks for one every BLINK (behind his shades), they glint for two every GLINT, his laptop's
 * screen flickers off for one each beat of FLICKER ticks */
const BLINK = 33;
const GLINT = 47;
const FLICKER = 4;
/** px off his head past which his eyes follow what he watches */
const GLANCE = 60;

type Rgb = readonly [number, number, number];

/** what he is painted in: his dark clothes, his outline (the ink of either theme), his skin and
 * the light parts, the accent, the page (a cell round him), his cap and hoodie and their shades */
export interface MateInk {
  line: Rgb;
  pen: Rgb;
  lit: Rgb;
  accent: Rgb;
  paper: Rgb;
  cap: Rgb;
  capShade: Rgb;
  hoodie: Rgb;
  hoodieShade: Rgb;
}

/** his colours from the page's tokens: a light shirt, dark clothes, ink lines in either theme */
export function mateInk(style: CSSStyleDeclaration): MateInk {
  const night = isDark();
  const paper = bytes(cssRgb(style.getPropertyValue('--lp-paper')));
  const ink = bytes(cssRgb(style.getPropertyValue('--lp-ink')));
  return {
    line: night ? paper : ink,
    pen: ink,
    lit: night ? ink : paper,
    accent: bytes(cssRgb(style.getPropertyValue('--lp-sun'))),
    paper,
    cap: bytes(cssRgb(style.getPropertyValue('--lp-cap'))),
    capShade: bytes(cssRgb(style.getPropertyValue('--lp-cap-dark'))),
    hoodie: bytes(cssRgb(style.getPropertyValue('--lp-hoodie'))),
    hoodieShade: bytes(cssRgb(style.getPropertyValue('--lp-hoodie-dark'))),
  };
}

function bytes([r, g, b]: Rgb): Rgb {
  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

/** how he looks `ticks` into his clock (`null` with reduced motion: still, eyes open, screen on):
 * he blinks (1), or looks ahead (0), left (2) or right (3) at what lies `look` px across from his
 * head (behind his shades, so unseen); his shades glint; his screen flickers on the beat */
export function mateAt(ticks: number | null, look: number) {
  const blink = ticks !== null && ticks % BLINK === 0;
  const eyes = blink ? 1 : look < -GLANCE ? 2 : look > GLANCE ? 3 : 0;
  const glint = ticks !== null && ticks % GLINT < 2;
  const screen = ticks === null || ticks % FLICKER !== 0;
  return { eyes, glint, screen };
}

/** how many of a cell's 4 neighbours are his */
function neighbours(frame: number, glint: boolean, x: number, y: number): number {
  let n = 0;
  if (cellOf(frame, glint, x - 1, y) !== '.') n++;
  if (cellOf(frame, glint, x + 1, y) !== '.') n++;
  if (cellOf(frame, glint, x, y - 1) !== '.') n++;
  if (cellOf(frame, glint, x, y + 1) !== '.') n++;
  return n;
}

/**
 * Paints him into `image`, a pixel a cell: his eyes' `frame`, the glint on his shades, his
 * laptop's screen on or off, and a cell of paper round him
 */
export function paintMate(
  image: ImageData,
  frame: number,
  glint: boolean,
  screen: boolean,
  ink: MateInk,
) {
  const data = image.data;
  for (let y = 0; y < MATE_H; y++) {
    for (let x = 0; x < MATE_W; x++) {
      const sx = x - MATE_PAD[0];
      const sy = y - MATE_PAD[1];
      const ch = cellOf(frame, glint, sx, sy);
      let out: Rgb | null = null;
      if (ch === 'o') out = screen ? ink.accent : ink.lit;
      else if (ch === '#') out = neighbours(frame, glint, sx, sy) === 4 ? ink.line : ink.pen;
      else if (ch === 'w') out = ink.lit;
      else if (ch === ':') out = BAYER4[(sy % 4) * 4 + (sx % 4)] < 8 ? ink.line : ink.lit;
      else if (ch === 'y') out = ink.accent;
      else if (ch === 'h') out = ink.hoodie;
      else if (ch === 'H') out = ink.hoodieShade;
      else if (ch === 'r') out = ink.cap;
      else if (ch === 'R') out = ink.capShade;
      else if (neighbours(frame, glint, sx, sy) > 0) out = ink.paper;
      const i = (y * MATE_W + x) * 4;
      if (!out) {
        data[i + 3] = 0;
        continue;
      }
      data[i] = out[0];
      data[i + 1] = out[1];
      data[i + 2] = out[2];
      data[i + 3] = 255;
    }
  }
}
