// Adapted from Fumadocs (https://github.com/fuma-nama/fumadocs, commit 55decd9),
// apps/docs/app/(landing)/sections/hero/engine.ts. MIT License, Copyright (c) 2023 Fuma.
// See components/landing/LICENSE-fumadocs.txt.
//
// Road to AI: the moon is a spinning, tilted Earth (./earth.ts, ./scene.ts) whose land mask loads
// after the page; its satellites are the site's sections, as many as there are, each prism in its
// section's accent and each label a link that stays shown while it has keyboard focus; the
// character on its crown is new (../character).
import { springValue } from 'motion/react';
import { type MateInk, mateAt, mateInk, paintMate } from '../character/paint';
import { LEGS, MATE_H, MATE_W } from '../character/sprite';
import {
  createMesh,
  housePalette,
  identity,
  MATERIAL,
  type Mat4,
  type PartSpec,
  transform,
  type Vec3,
} from '../lib/mesh';
import { clamp, easeOut, TICK } from '../lib/motion';
import { reduce } from '../lib/script';
import { report } from '../lib/status';
import { cssRgb } from '../lib/theme';
import { loadLand } from './earth';
import {
  CELL,
  CROWN,
  figureShader,
  GLOBE,
  HORIZON,
  MAX_SATELLITES,
  REACH,
  RING,
  SATELLITE,
  satellites,
  skyShader,
} from './scene';
import { createTalk } from './talk';

/** boot beats, in ticks from the start */
export const BEAT_AT = {
  ring: 2,
  satellites: 6,
  glitch: 9,
  mate: 10,
  ready: 13,
  /** his first bubble */
  talk: 15,
} as const;
/** a Pop: one inverted flash this long on its beat */
const POP_MS = 70;

let boot: number | null | undefined;

/**
 * Start of the hero's boot (`performance.now()` time), set by the first of its parts to ask: it
 * plays once per page load, with motion allowed; off screen, it is over by the time it shows.
 * `null`: the final state.
 */
export function bootStart(): number | null {
  if (boot === undefined) {
    boot = reduce() ? null : performance.now();
  }
  return boot;
}

/** ms until a beat, negative once it passed */
export function untilBeat(start: number, tick: number): number {
  return start + tick * TICK - performance.now();
}

/** the boot's mosaic, canvas px a cell, then the page's dots at rest */
const MOSAIC = [64, 32, 16, 8, 4, 2];
/** at boot the globe rises from this many radii under its place */
const RISE = 0.6;
const RISE_MS = 1100;
/** the light's rest: from the bottom-right, ~35° above the sheet (sun position in globe radii) */
const REST = { x: 0.86, y: 0.86 };
const SUN = { stiffness: 38, damping: 13 };
/** the globe turns once in `SPIN_S` seconds, west to east; it starts on 70°E (with reduced motion
 * it stays there) */
const SPIN_S = 120;
const SPIN_START = (70 * Math.PI) / 180;

/** the satellites' ring: semi-axes in globe radii, in-plane tilt in radians, seconds a turn */
const ORBIT = { a: 1.3, b: 0.27, tilt: (-18 * Math.PI) / 180, period: 42 };
/** his cells a globe radius: he is an eighth of its width */
const CELLS = 120;
/** the drawing's height over the horizon in globe radii: the globe, and him on its crown */
export const SKY = CROWN + (MATE_H - LEGS) / CELLS;
/** a shooting star: ticks between two, about, ticks one lasts, dither cells a tick */
const SHOOT = { every: 100, ticks: 6, speed: 14 };
/** the scene's bounds in globe radii, for the light */
const BOUNDS: [Vec3, Vec3] = [
  [-REACH, -1.5, -2],
  [REACH, 1.5, 2],
];

/** a satellite `clock` s into its turns: x right and y up from the globe's centre in globe radii,
 * and its depth toward the viewer */
function onRing(phase: number, clock: number): Vec3 {
  const angle = phase * Math.PI * 2 - (clock / ORBIT.period) * Math.PI * 2;
  const ex = ORBIT.a * Math.cos(angle);
  const ey = ORBIT.b * Math.sin(angle);
  return [
    ex * Math.cos(ORBIT.tilt) - ey * Math.sin(ORBIT.tilt),
    -ex * Math.sin(ORBIT.tilt) - ey * Math.cos(ORBIT.tilt),
    Math.sqrt(ORBIT.a * ORBIT.a - ORBIT.b * ORBIT.b) * Math.sin(angle),
  ];
}

/** the ring's plane, a thin box over the orbit's circle with room for its halo: its axes the
 * circle's two radii, from the ring's right end and its front, and its thickness, right-handed so its
 * faces turn out */
function ringPlane(): Mat4 {
  const { a, b, tilt } = ORBIT;
  const c = Math.sqrt(a * a - b * b);
  const room = 2 * 1.15;
  const m = identity();
  m.set([a * Math.cos(tilt) * room, -a * Math.sin(tilt) * room, 0], 0);
  m.set([-b * Math.sin(tilt) * room, -b * Math.cos(tilt) * room, c * room], 4);
  m.set([(-c * Math.sin(tilt) * 1e-3) / a, (-c * Math.cos(tilt) * 1e-3) / a, (-b * 1e-3) / a], 8);
  return m;
}

/** `m` set to a box at `at`, of half sizes `half`, turned `turn` radians round unit `axis` */
function boxAt(m: Mat4, at: Vec3, half: readonly number[], axis: readonly number[], turn: number) {
  const sin = Math.sin(turn / 2);
  const x = axis[0] * sin;
  const y = axis[1] * sin;
  const z = axis[2] * sin;
  const w = Math.cos(turn / 2);
  m.set([
    (1 - 2 * (y * y + z * z)) * 2 * half[0],
    2 * (x * y + z * w) * 2 * half[0],
    2 * (x * z - y * w) * 2 * half[0],
    0,
    2 * (x * y - z * w) * 2 * half[1],
    (1 - 2 * (x * x + z * z)) * 2 * half[1],
    2 * (y * z + x * w) * 2 * half[1],
    0,
    2 * (x * z + y * w) * 2 * half[2],
    2 * (y * z - x * w) * 2 * half[2],
    (1 - 2 * (x * x + y * y)) * 2 * half[2],
    0,
    ...at,
    1,
  ]);
}

/** a 32-bit integer's bits mixed (lowbias32) */
function mix32(n: number): number {
  const h = Math.imul(n ^ (n >>> 16), 0x7feb352d);
  const k = Math.imul(h ^ (h >>> 15), 0x846ca68b);
  return (k ^ (k >>> 16)) >>> 0;
}

/** an empty land mask, till the real one is in */
let blank: HTMLCanvasElement | undefined;

/** the globe: it rises at boot, lit from the pointer, its satellites in orbit and him on its crown;
 * it sets as its sky leaves */
export function createHero(stage: HTMLElement, reduced: boolean): (() => void) | undefined {
  const scene = stage.firstElementChild;
  const canvas = scene?.firstElementChild;
  const drawing = canvas?.nextElementSibling;
  const mate = drawing?.firstElementChild;
  const labels = scene?.querySelectorAll<HTMLElement>(':scope > [data-satellite]');
  // a Fast Refresh can pair this engine with other markup for a moment: no sky until they match
  if (
    !(scene instanceof HTMLElement) ||
    !(canvas instanceof HTMLCanvasElement) ||
    !(drawing instanceof HTMLElement) ||
    !(mate instanceof HTMLCanvasElement) ||
    !labels ||
    labels.length === 0
  )
    return;
  // a page out of canvas memory gets no contexts: the hero is its text then
  const pen = mate.getContext('2d');
  if (!pen) return;
  const SATELLITES = satellites(Math.min(labels.length, MAX_SATELLITES), reduced);
  /** the globe, the satellites' prisms, then the ring's plane; the globe and the ring are never
   * outlined (id 0) */
  const parts: PartSpec[] = [
    { shape: 'sphere', id: 0, material: GLOBE, shadow: false },
    ...SATELLITES.map((_, i) => ({
      shape: 'box' as const,
      id: i + 1,
      material: SATELLITE + i,
      shadow: false,
    })),
    { shape: 'box', id: 0, material: RING, shadow: false },
  ];
  const ringPart = SATELLITES.length + 1;
  if (!blank) {
    blank = document.createElement('canvas');
    blank.width = blank.height = 1;
  }
  const mesh = createMesh(canvas, {
    parts,
    shader: {
      scene: figureShader,
      backdrop: skyShader,
      textures: { uLand: blank },
      coverage: ['uLand'],
    },
    onFrame: () => frame(),
    onResize: (width, height) => measure(width, height),
    theme(page) {
      mesh!.uniform('uInk', page.ink);
      mesh!.uniform('uPaper', page.paper);
      // the land, in the landing's accent
      mesh!.uniform('uLandInk', page.sun);
      // the stars' sparkles: a yellow one would vanish on light paper
      mesh!.uniform('uSun', page.night ? page.yellow : page.sun);
      mesh!.uniform('uDark', page.night ? 1 : 0);
      // each satellite in its section's accent, read off its label
      for (let i = 0; i < SATELLITES.length; i++) {
        const accent = getComputedStyle(labels[i]).getPropertyValue('--sat-accent');
        mesh!.uniform(`uSat[${i}]`, cssRgb(accent));
      }
      ink = mateInk(getComputedStyle(stage));
      popInk = { ...ink, line: ink.lit, pen: ink.paper, lit: ink.line, paper: ink.pen };
      mateShown = -1;
      return { ...housePalette(page), line: page.ink, accent: page.yellow };
    },
  });
  if (!mesh) return;
  let alive = true;
  void loadLand().then((land) => {
    if (!alive || !land) return;
    mesh.texture('uLand', land);
    mesh.uniform('uLandReady', 1);
    mesh.invalidate();
  });
  const zero = performance.now();
  const hero = stage.parentElement!;
  const mateImage = new ImageData(MATE_W, MATE_H);
  const touch = !reduced && !matchMedia('(hover: hover) and (pointer: fine)').matches;
  const sunX = springValue(REST.x, SUN);
  const sunY = springValue(REST.y, SUN);
  const start = bootStart();
  /** CSS px a globe radius, CSS px a canvas px, the canvas's CSS px size */
  let radius = 1;
  let pitch = 1;
  let width = 1;
  let height = 1;
  /** px from the globe's centre to the pointer */
  let pointerX = Number.NaN;
  const light: Vec3 = [0, 0, 1];
  const shoot: [number, number, number, number] = [0, 0, 0, 0];
  const orbit: [number, number, number, number] = [ORBIT.a, ORBIT.b, ORBIT.tilt, 0];
  const prisms = SATELLITES.map(() => identity());
  /** each label's place, the satellite's centre, and its size */
  const places = SATELLITES.map(() => identity());
  const sizes = SATELLITES.map(() => ({ w: 0, h: 0 }));
  const pins = SATELLITES.map((s, i) =>
    mesh.anchor(labels[i], places[i], [0, Math.hypot(...s.size), 0]),
  );
  /** the label with keyboard focus: shown wherever its satellite is */
  let focused = -1;
  let ink: MateInk | undefined;
  let popInk: MateInk | undefined;
  let mateShown = -1;

  // the globe's sphere a little larger than the disc its material draws, so its facets clear it
  mesh.place(0, transform(identity(), [0, 0, 0], [0, 0, 0], [2.1, 2.1, 2.1]));
  mesh.place(ringPart, ringPlane());

  const sized = new ResizeObserver((entries) => {
    for (const entry of entries) {
      const [box] = entry.borderBoxSize;
      sizes[Array.prototype.indexOf.call(labels, entry.target)] = {
        w: box.inlineSize,
        h: box.blockSize,
      };
    }
    mesh.invalidate();
  });
  for (let i = 0; i < SATELLITES.length; i++) sized.observe(labels[i]);

  const onFocusIn = (event: FocusEvent) => {
    focused = Array.prototype.indexOf.call(labels, event.target);
    mesh.invalidate();
  };
  const onFocusOut = () => {
    focused = -1;
    mesh.invalidate();
  };
  scene.addEventListener('focusin', onFocusIn);
  scene.addEventListener('focusout', onFocusOut);

  /** the camera on the globe, `rise` radii under its place */
  const look = (rise: number) => {
    mesh.camera({
      width,
      height,
      scale: radius,
      origin: [width / 2, height - (HORIZON - rise) * radius],
      depth: [0, 0],
      z: [3, -3],
    });
  };

  const measure = (w: number, h: number) => {
    width = w;
    height = h;
    pitch = w / canvas.width;
    // the globe as large as it fits the sky's box, and him over the crown at a px a cell, the least
    // he is drawn at
    radius = Math.min(w / (2 * REACH), h / SKY, (h - (MATE_H - LEGS)) / CROWN);
    scene.style.setProperty('--r', `${radius}px`);
    mesh.uniform('uRadius', radius / pitch);
    // his cell: an eighth of the globe's width over his 30, in whole device px, a CSS px at least,
    // and his canvas no taller than the sky over the globe's crown
    const room = h - CROWN * radius;
    const cell = Math.min(
      Math.round((radius * devicePixelRatio) / CELLS),
      Math.floor((room * devicePixelRatio) / (MATE_H - LEGS)),
    );
    scene.style.setProperty('--cell', `${Math.max(1, cell / devicePixelRatio)}px`);
    look(0);
  };

  const onPointerMove = (e: PointerEvent) => {
    if (e.pointerType !== 'mouse') return;
    const rect = drawing.getBoundingClientRect();
    pointerX = e.clientX - rect.left - rect.width / 2;
    sunX.set(pointerX / radius);
    sunY.set((e.clientY - rect.bottom) / radius + HORIZON);
    mesh.invalidate();
  };
  const onPointerLeave = (e: PointerEvent) => {
    if (e.pointerType !== 'mouse') return;
    sunX.set(REST.x);
    sunY.set(REST.y);
    pointerX = Number.NaN;
    mesh.invalidate();
  };
  if (!reduced) {
    hero.addEventListener('pointermove', onPointerMove, { passive: true });
    hero.addEventListener('pointerleave', onPointerLeave);
  }

  // the globe sets as its sky leaves under the menu, from the sky's top at the menu's edge to the
  // horizon there, by when it has sunk the height of his feet: he never sinks behind the horizon
  const globeset =
    reduced || !('ViewTimeline' in window)
      ? undefined
      : scene.animate(
          { translate: ['0 0', '0 var(--feet)'] },
          {
            timeline: new ViewTimeline({
              subject: stage,
              inset: `${getComputedStyle(stage).getPropertyValue('--lp-menu-h').trim() || '0px'} 0px`,
            }),
            rangeStart: 'exit-crossing 0%',
            rangeEnd: 'exit-crossing 100%',
            fill: 'both',
          },
        );

  let readyTimer = 0;
  if (start !== null) {
    report(stage, 'booting');
    readyTimer = window.setTimeout(() => report(stage, 'ready'), untilBeat(start, BEAT_AT.ready));
  }
  const stopTalk = createTalk(
    drawing,
    mate,
    reduced || start === null ? null : untilBeat(start, BEAT_AT.talk),
  );

  const frame = () => {
    const now = performance.now();
    const time = (now - zero) / 1000;
    const t = start === null ? Infinity : now - start;
    // drawn every frame while anything moves: the satellites and the globe do, save with reduced
    // motion
    if (!reduced || t < BEAT_AT.ready * TICK || sunX.isAnimating() || sunY.isAnimating())
      mesh.invalidate();

    mesh.uniform('uCell', MOSAIC[clamp(Math.floor(t / TICK), 0, MOSAIC.length - 1)]);
    if (t < RISE_MS) look((1 - easeOut(t / RISE_MS)) * RISE);
    mesh.uniform('uSpin', SPIN_START - (reduced ? 0 : (time / SPIN_S) * Math.PI * 2));

    const turn = Math.PI / 4 + time * 0.2;
    const sx = touch ? Math.cos(turn) * 1.22 : sunX.get();
    const sy = touch ? Math.sin(turn) * 1.22 : sunY.get();
    const el = (clamp(90 - 45 * Math.hypot(sx, sy), -50, 90) * Math.PI) / 180;
    const azimuth = Math.atan2(-sy, sx);
    light[0] = Math.cos(el) * Math.cos(azimuth);
    light[1] = Math.cos(el) * Math.sin(azimuth);
    light[2] = Math.sin(el);
    mesh.light(light, BOUNDS[0], BOUNDS[1]);

    const beat = reduced ? 0 : (time * 1000) / TICK;
    mesh.uniform('uTwinkle', Math.floor(beat));
    const event = Math.floor(beat / SHOOT.every);
    const seed = mix32(event);
    const run = beat - event * SHOOT.every - 1 - (seed % (SHOOT.every - SHOOT.ticks - 2));
    shoot[2] = run >= 0 && run < SHOOT.ticks ? (seed & 1 ? 1 : -1) : 0;
    shoot[3] = 0.35 + (0.25 * ((seed >>> 8) & 255)) / 255;
    const from = (shoot[2] < 0 ? 0.5 : 0) + (0.5 * ((seed >>> 16) & 255)) / 255;
    shoot[0] = Math.floor(
      from * Math.floor(canvas.width / (CELL * mesh.dot)) + shoot[2] * SHOOT.speed * run,
    );
    shoot[1] = Math.floor(
      (0.05 + (0.3 * (seed >>> 24)) / 255) * Math.floor(canvas.height / (CELL * mesh.dot)) +
        shoot[3] * SHOOT.speed * run,
    );
    mesh.uniform('uShoot', shoot);

    // the ring strokes on as one pen line, the back half, then the front half
    orbit[3] = easeOut(clamp((t - BEAT_AT.ring * TICK) / (6 * TICK)));
    mesh.uniform('uOrbit', orbit);

    const reach = REACH * radius;
    for (let i = 0; i < SATELLITES.length; i++) {
      const s = SATELLITES[i];
      const at = onRing(s.phase, reduced ? 0 : time);
      const due = (BEAT_AT.satellites + i) * TICK;
      boxAt(prisms[i], at, s.size, s.axis, 2 * ((reduced ? 1 : time / s.spin) * Math.PI + i * 1.3));
      mesh.place(i + 1, prisms[i]);
      mesh.show(i + 1, t >= due);
      mesh.material(i + 1, t < due + POP_MS ? MATERIAL.ink : SATELLITE + i);

      const pin = pins[i];
      const { w, h } = sizes[i];
      places[i][12] = at[0];
      places[i][13] = at[1];
      places[i][14] = at[2];
      const x = at[0] * radius;
      pin.offset[0] = clamp(x - w / 2, -reach, reach - w) - x;
      pin.offset[1] = -h;
      // hidden while its satellite is behind the globe, unless it holds the keyboard's focus
      pin.shown = focused === i || !(at[2] < 0 && at[0] * at[0] + at[1] * at[1] < 1);
      const state = t < due ? 'off' : t < due + POP_MS ? 'pop' : 'on';
      if (labels[i].dataset.state !== state) labels[i].dataset.state = state;
    }

    const meet = BEAT_AT.mate * TICK;
    if (!ink || !popInk || t < meet) return;
    const { eyes, glint, screen } = mateAt(
      reduced ? null : Math.floor((time * 1000) / TICK),
      pointerX,
    );
    const pop = t < meet + POP_MS;
    const shown = (pop ? 1 : 0) | (eyes << 1) | (glint ? 8 : 0) | (screen ? 16 : 0);
    if (shown === mateShown) return;
    mateShown = shown;
    paintMate(mateImage, eyes, glint, screen, pop ? popInk : ink);
    pen.putImageData(mateImage, 0, 0);
    mate.style.visibility = 'visible';
  };

  return () => {
    alive = false;
    mesh.destroy();
    globeset?.cancel();
    sized.disconnect();
    clearTimeout(readyTimer);
    stopTalk();
    scene.removeEventListener('focusin', onFocusIn);
    scene.removeEventListener('focusout', onFocusOut);
    hero.removeEventListener('pointermove', onPointerMove);
    hero.removeEventListener('pointerleave', onPointerLeave);
    sunX.destroy();
    sunY.destroy();
  };
}
