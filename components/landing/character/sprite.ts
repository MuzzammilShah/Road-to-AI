// Adapted from Fumadocs (https://github.com/fuma-nama/fumadocs, commit 55decd9),
// apps/docs/components/mascot/sprite.ts. MIT License, Copyright (c) 2023 Fuma.
// See components/landing/LICENSE-fumadocs.txt.
//
// Road to AI: the format and the helpers are Fumadocs'; the character is new and original: a cool
// developer in a red baseball cap, a few curls at his temples, headphones, dark shades and a small
// smile, a hoodie with its drawstrings, a laptop on his lap, dark trousers and sneakers with light
// soles. Only his sitting pose
// exists (the hero's), so the remote-control arm poses and the mini-moon's ring are gone.

/**
 * His sprite, hand-drawn on a 30x57 grid, sitting on the globe's crown with his legs down its face:
 * `.` clear, `#` line, `w` lit, `:` half tone, `y` accent (the headphones), `r` cap, `R` its shade
 * (the brim), `h` hoodie, `H` its shade, `o` the laptop's logo (the accent while the screen is on,
 * lit while it flickers off). Row 40 is his seat.
 */
const SPRITE = [
  '..........##########..........', // 0
  '........##rrrrrrrrRR##........',
  '.......#rrrrrr#rrrrrRR#.......',
  '.......#rrrrrr#rrrrrRR#.......',
  '.......#rrrrrr#rrrrrRR#.......',
  '.......#rrrrrrrrrrrrRR#.......', // 5
  '.....#RRRRRRRRRRRRRRRRRR#.....',
  '....#y###w#wwwwwwww#w###y#....',
  '....#y##wwwwwwwwwwwwww##y#....',
  '...#####wwwwwwwwwwwwww#####...',
  '...#yy##wwwwwwwwwwwwww##yy#...', // 10
  '...#yy###w#######w######yy#...',
  '...#yy####w###ww##w#####yy#...',
  '...#yy##w####wwww####w##yy#...',
  '...#####wwwwwwwwwwwwww#####...',
  '.......#wwwwwwwwwwwwww#.......', // 15
  '.......#wwwww#ww#wwwww#.......',
  '........#wwwww##wwwww#........',
  '.........##wwwwwwww##.........',
  '...........##wwww##...........',
  '.............####.............', // 20
  '.........HHHH#ww#HHHH.........',
  '.....#HHHHHHHHHHHHHHHHHH#.....',
  '....#hhhhhhhwhhhhwhhhhhhh#....',
  '....#hhhhhhhwhhhhwhhhhhhh#....',
  '....#hhhhhhhwhhhhwhhhhhhh#....', // 25
  '....#Hhhhhhh#hhhh#hhhhhhH#....',
  '....#HhhhhhhhhhhhhhhhhhhH#....',
  '....#Hhh##############hhH#....',
  '....#Hhh#wwwwwwwwwwww#hhH#....',
  '....#Hhh#wwwwwwwwwwww#hhH#....', // 30
  '....#Hhh#wwwwwoowwwww#hhH#....',
  '....#Hhh#wwwwwoowwwww#hhH#....',
  '....#Hhh#wwwwwwwwwwww#hhH#....',
  '....#Hhh#wwwwwwwwwwww#hhH#....',
  '....#Hhh##############hhH#....', // 35
  '...#www################www#...',
  '...########################...',
  '....######################....',
  '....######################....',
  '.....########....########.....', // 40
  '.......######....######.......',
  '........####......####........',
  '........####......####........',
  '........####......####........',
  '........####......####........', // 45
  '........####......####........',
  '........####......####........',
  '........####......####........',
  '........####......####........',
  '........####......####........', // 50
  '........#ww#......#ww#........',
  '.......#wwww#....#wwww#.......',
  '.......#w##w#....#w##w#.......',
  '......#::::::#..#::::::#......',
  '......#wwwwww#..#wwwwww#......', // 55
  '......########..########......',
];

export const SPRITE_W = 30;
export const SPRITE_H = 57;
/** sprite cells: the one over his seat on the globe's rim, and the middle of his crown (the top of
 * his cap), which his speech bubble points at */
export const SEAT_CELL = [14.5, 40] as const;
export const CROWN_CELL = [14.5, 0] as const;
/** canvas cells round the sprite: a cell of paper outlines him */
export const MATE_PAD = [1, 1] as const;
export const MATE_W = SPRITE_W + 2 * MATE_PAD[0];
export const MATE_H = SPRITE_H + MATE_PAD[1] + 1;
/** his canvas's rows below his seat, which hang under the edge he sits on */
export const LEGS = MATE_H - MATE_PAD[1] - SEAT_CELL[1] - 1;

/** the glint on his shades, a cell at the top corner of his left lens (your right) */
const GLINT = [20, 11] as const;

/**
 * His cell at sprite `x, y`, the glint on his shades when `glint`. His eyes are behind the shades:
 * `frame` (0 open, 1 shut, 2 looking left, 3 looking right, from `mateAt`) changes nothing you see,
 * and is kept so the clock and the painter work as they did when his eyes showed.
 */
export function cellOf(_frame: number, glint: boolean, x: number, y: number): string {
  if (glint && x === GLINT[0] && y === GLINT[1]) return 'y';
  if (x < 0 || y < 0 || x >= SPRITE_W || y >= SPRITE_H) return '.';
  return SPRITE[y][x];
}
