// Adapted from Fumadocs (https://github.com/fuma-nama/fumadocs, commit 55decd9),
// apps/docs/app/(landing)/sections/integrations/mechanisms.tsx. MIT License, Copyright (c) 2023 Fuma.
// See components/landing/LICENSE-fumadocs.txt.
//
// Road to AI: new mechanisms, one per section, drawn with the original stage helpers. Each is a
// 96x40-cell pixel stage posed by CSS keyframes on the 125 ms tick grid (`choreograph`), its lamp
// lit while it works, a readout rolling through its states and a spec label; it rests on its payoff.
//
// To add one for a new section: write a `choreograph(...)` + component below and add it to
// `mechanisms` under the section's folder name. A section without one gets `FallbackMechanism`.
import { Fragment, type ReactNode } from 'react';
import {
  art,
  Clip,
  choreograph,
  dashes,
  Frames,
  frame,
  glide,
  Layer,
  Px,
  rect,
  roll,
  Stage,
  show,
  Text,
} from './stage';

/** a label in code, a character two cells: 0.6em */
const CODE = 'font-mono text-[10px]/none';

/** cells on the straight line from `x0, y0` to `x1, y1`, every `every`th one (Bresenham) */
function line(x0: number, y0: number, x1: number, y1: number, every = 1): string {
  let d = '';
  const dx = Math.abs(x1 - x0);
  const dy = -Math.abs(y1 - y0);
  const sx = x0 < x1 ? 1 : -1;
  const sy = y0 < y1 ? 1 : -1;
  let err = dx + dy;
  let x = x0;
  let y = y0;
  for (let k = 0; ; k++) {
    if (k % every === 0) d += rect(x, y, 1, 1);
    if (x === x1 && y === y1) break;
    const e2 = 2 * err;
    if (e2 >= dy) {
      err += dy;
      x += sx;
    }
    if (e2 <= dx) {
      err += dx;
      y += sy;
    }
  }
  return d;
}

// Neural Networks: a 3-4-2 net. Activations pulse forward layer by layer, then a gradient pulse
// flows back while the loss gauge drops.

const NEURON = ['.###.', '#...#', '#...#', '#...#', '.###.'];
/** each layer's x, and the top cell of each of its neurons */
const LAYERS: readonly [number, readonly number[]][] = [
  [2, [7, 17, 27]],
  [27, [1, 11, 21, 31]],
  [52, [10, 24]],
];

/** the edges from layer `l` to the next, from the right of each neuron to the left of the next */
function edges(l: number, every: number): string {
  const [x0, from] = LAYERS[l];
  const [x1, to] = LAYERS[l + 1];
  let d = '';
  for (const a of from) for (const b of to) d += line(x0 + 5, a + 2, x1 - 1, b + 2, every);
  return d;
}

/** the 3x3 middles of layer `l`'s neurons */
function cores(l: number): string {
  const [x, ys] = LAYERS[l];
  let d = '';
  for (const y of ys) d += rect(x + 1, y + 1, 3, 3);
  return d;
}

const NN_STATES = ['forward', 'backward', 'loss 0.02'];

const nn = choreograph('nn', 18, 17, {
  status: roll(5, { 0: 0, 8: 1, 15: 2 }, 2),
  lamp: { base: 'visibility:hidden', poses: show(1, 15) },
  // forward: each layer lights, then the edges after it carry the pulse
  in: { poses: show(1, 3) },
  e1: { poses: show(2, 3) },
  hidden: { poses: show(3, 5) },
  e2: { poses: show(4, 5) },
  out: { poses: show(5) },
  // backward: the gradient, solid ink, from the outputs back to the inputs
  g2: { poses: show(9, 10) },
  gh: { poses: show(10, 11) },
  g1: { poses: show(11, 12) },
  gi: { poses: show(12, 13) },
  // the loss drops a step as each layer's gradient lands
  loss: {
    base: 'transform-origin:50% 100%',
    poses: {
      0: 'transform:scaleY(1)',
      10: 'transform:scaleY(0.62)',
      12: 'transform:scaleY(0.34)',
      14: 'transform:scaleY(0.12)',
    },
  },
});

function NeuralNetworksMechanism() {
  const c = nn.cls;
  let neurons = '';
  for (const [x, ys] of LAYERS) for (const y of ys) neurons += art(NEURON, x, y);
  return (
    <Stage c={nn} states={NN_STATES} status={c.status} lamp={c.lamp} spec="micrograd">
      <Px w={96} h={40} ink={neurons} />
      <Px w={96} h={40} ink={edges(0, 3) + edges(1, 3)} className="opacity-45" />
      <Px orange={cores(0)} className={c.in} />
      <Px orange={edges(0, 2)} className={c.e1} />
      <Px orange={cores(1)} className={c.hidden} />
      <Px orange={edges(1, 2)} className={c.e2} />
      <Px orange={cores(2)} className={c.out} />
      <Px ink={edges(1, 1)} className={c.g2} />
      <Px ink={cores(1)} className={c.gh} />
      <Px ink={edges(0, 1)} className={c.g1} />
      <Px ink={cores(0)} className={c.gi} />
      {/* the loss gauge */}
      <Text x={74} y={0} w={20} h={4} className={`${CODE} justify-center`}>
        loss
      </Text>
      <Px x={76} y={5} w={16} h={34} ink={frame(0, 0, 16, 34)} />
      <Px x={78} y={7} w={12} h={30} orange={rect(0, 0, 12, 30)} className={c.loss} />
    </Stage>
  );
}

// Library: an open book. Its pages flip twice (a strip of frames), then a highlighter sweeps a line.

/** the lines of text on each page set: [x offset, width] per row, three sets */
const PAGE_SETS: readonly (readonly number[])[] = [
  [30, 26, 30, 18, 28, 30, 22],
  [24, 30, 30, 28, 12, 30, 26],
  [30, 28, 30, 30, 20, 30, 16],
];
/** the line the highlighter marks: on the right page, the third row of the last set */
const MARKED = 2;

function page(x: number, set: readonly number[]): string {
  let d = '';
  for (let r = 0; r < set.length; r++) d += rect(x + 3, 9 + r * 4, set[r] - 2, 1);
  return d;
}

/** the book with page set `s` open, and the sheet turning at `turn` (0 none, 1-3 rising to falling) */
function book(s: number, turn: number, next: number): ReactNode {
  const left = page(12, PAGE_SETS[(s + 2) % 3]);
  const right = page(50, PAGE_SETS[s]);
  // the covers and spine, then the pages
  const covers =
    frame(10, 4, 39, 34) + frame(47, 4, 39, 34) + rect(47, 4, 2, 34) + rect(10, 37, 76, 1);
  let sheet = '';
  let sheetPaper = '';
  let sheetLines = '';
  if (turn === 1) {
    // lifting off the right page: narrower, its top raised
    sheetPaper = rect(49, 2, 26, 35);
    sheet = frame(49, 2, 26, 35);
  } else if (turn === 2) {
    // upright over the spine
    sheetPaper = rect(46, 0, 5, 37);
    sheet = frame(46, 0, 5, 37);
  } else if (turn === 3) {
    // falling onto the left page, the next set's back showing
    sheetPaper = rect(22, 2, 26, 35);
    sheet = frame(22, 2, 26, 35);
    sheetLines = page(
      22,
      PAGE_SETS[(next + 2) % 3].map((w) => Math.min(w, 22)),
    );
  }
  return (
    <Fragment key={`${s}-${turn}`}>
      <Px w={96} h={40} ink={covers + left + right} />
      {turn > 0 && <Px w={96} h={40} paper={sheetPaper} ink={sheet + sheetLines} />}
    </Fragment>
  );
}

const LIBRARY_STATES = ['reading', 'highlighting', 'noted'];

const library = choreograph('library', 19, 18, {
  status: roll(5, { 0: 0, 11: 1, 16: 2 }, 2),
  lamp: { base: 'visibility:hidden', poses: show(1, 16) },
  // frames: 0 set A; 1-3 turning; 4 set B; 5-7 turning; 8 set C
  pages: roll(40, { 0: 0, 2: 1, 3: 2, 4: 3, 5: 4, 7: 5, 8: 6, 9: 7, 10: 8 }, 8),
  // the highlight grows under the line as the pen passes, 11-15
  mark: {
    base: 'transform-origin:0 50%',
    poses: {
      0: 'transform:scaleX(0)',
      11: glide('transform:scaleX(0)'),
      15: 'transform:scaleX(1)',
    },
  },
  pen: {
    base: 'opacity:0',
    poses: {
      0: 'opacity:0',
      10: 'opacity:1;transform:translateX(0)',
      11: glide('opacity:1;transform:translateX(0)'),
      15: 'opacity:1;transform:translateX(78px)',
      16: 'opacity:0',
    },
  },
});

const PEN = ['..##', '.##.', '##..', '#...'];

function LibraryMechanism() {
  const c = library.cls;
  const frames = [
    book(0, 0, 1),
    book(0, 1, 1),
    book(0, 2, 1),
    book(0, 3, 1),
    book(1, 0, 2),
    book(1, 1, 2),
    book(1, 2, 2),
    book(1, 3, 2),
    book(2, 0, 0),
  ];
  const y = 9 + MARKED * 4;
  return (
    <Stage c={library} states={LIBRARY_STATES} status={c.status} lamp={c.lamp} spec="ch. 1-10">
      {/* under the book's lines, so they show through it */}
      <Px
        x={52}
        y={y - 1}
        w={PAGE_SETS[2][MARKED]}
        h={3}
        hi={rect(0, 0, 30, 3)}
        className={c.mark}
      />
      <Clip x={0} y={0} w={96} h={40}>
        <Frames h={40} className={c.pages}>
          {frames}
        </Frames>
      </Clip>
      <Px x={52} y={y - 4} w={4} h={4} orange={art(PEN)} className={c.pen} />
    </Stage>
  );
}

// Academy: a course card. Its module ticks fill one by one, then a certificate stamp lands.

const ACADEMY_STATES = ['module 1', 'module 2', 'module 3', 'module 4', 'completed'];
const MODULE_TICKS = [2, 4, 6, 8];

const academy = choreograph('academy', 16, 15, {
  status: roll(5, { 0: 0, 4: 1, 6: 2, 8: 3, 12: 4 }, 4),
  lamp: { base: 'visibility:hidden', poses: show(1, 12) },
  m0: { poses: show(MODULE_TICKS[0]) },
  m1: { poses: show(MODULE_TICKS[1]) },
  m2: { poses: show(MODULE_TICKS[2]) },
  m3: { poses: show(MODULE_TICKS[3]) },
  progress: {
    base: 'transform-origin:0 50%',
    poses: {
      0: 'transform:scaleX(0)',
      2: 'transform:scaleX(0.25)',
      4: 'transform:scaleX(0.5)',
      6: 'transform:scaleX(0.75)',
      8: 'transform:scaleX(1)',
    },
  },
  // the stamp falls from above, large and faint, and lands at an angle
  stamp: {
    base: 'transform:rotate(-12deg)',
    poses: {
      0: 'opacity:0;transform:scale(1.8) rotate(-12deg)',
      10: glide('opacity:0;transform:scale(1.8) rotate(-12deg)'),
      11: 'opacity:1;transform:scale(1) rotate(-12deg)',
      12: 'opacity:1;transform:scale(1.06) rotate(-12deg)',
      13: 'opacity:1;transform:rotate(-12deg)',
    },
  },
});

const CHECK = ['....#', '...#.', '#.#..', '.#...'];

function AcademyMechanism() {
  const c = academy.cls;
  const classes = [c.m0, c.m1, c.m2, c.m3];
  const rows = [];
  let boxes = '';
  for (let m = 0; m < 4; m++) {
    const y = 12 + m * 7;
    boxes += frame(4, y, 6, 6) + rect(13, y + 2, 20 + ((m * 7) % 13), 1);
    rows.push(
      <Px key={m} x={5} y={y + 1} w={5} h={4} orange={art(CHECK)} className={classes[m]} />,
    );
  }
  return (
    <Stage c={academy} states={ACADEMY_STATES} status={c.status} lamp={c.lamp} spec="agentic ai">
      <Px ink={frame(0, 0, 60, 40) + rect(0, 9, 60, 1) + frame(36, 3, 21, 4) + boxes} />
      <Text x={3} y={0} h={9} className={CODE}>
        course
      </Text>
      <Px x={37} y={4} w={19} h={2} orange={rect(0, 0, 19, 2)} className={c.progress} />
      {rows}
      <Layer x={64} y={8} w={30} h={22} className={c.stamp}>
        <Px w={30} h={22} orange={frame(0, 0, 30, 22) + frame(2, 2, 26, 18)} />
        <Text
          x={0}
          y={4}
          w={30}
          h={8}
          className="justify-center font-pixel font-normal text-(--bt-orange)"
        >
          DONE
        </Text>
        <Text x={0} y={12} w={30} h={5} className={`${CODE} justify-center text-(--bt-orange)`}>
          certified
        </Text>
      </Layer>
    </Stage>
  );
}

// Workshop: the boxes of an architecture diagram slide in, lines connect them, the deploy lamp lights.

/** x, y, width and label of each box, in the order they come in */
const BOXES: readonly [number, number, number, string][] = [
  [0, 12, 18, 'client'],
  [34, 12, 18, 'api'],
  [72, 2, 22, 'db'],
  [72, 22, 22, 'cache'],
];
const BOX_H = 10;

/** a box sliding down into place on tick `t` */
function slide(t: number) {
  return {
    poses: {
      0: 'opacity:0;transform:translateY(-12px)',
      [t]: glide('opacity:0;transform:translateY(-12px)'),
      [t + 1]: 'opacity:1;transform:translateY(0)',
    },
  };
}

const WORKSHOP_STATES = ['designing', 'building', 'shipped'];

const workshop = choreograph('workshop', 15, 14, {
  status: roll(5, { 0: 0, 8: 1, 12: 2 }, 2),
  lamp: { base: 'visibility:hidden', poses: show(1, 12) },
  b0: slide(1),
  b1: slide(3),
  b2: slide(5),
  b3: slide(6),
  w0: { poses: show(8) },
  w1: { poses: show(9) },
  w2: { poses: show(10) },
  deploy: { poses: show(12) },
});

function WorkshopMechanism() {
  const c = workshop.cls;
  const slides = [c.b0, c.b1, c.b2, c.b3];
  const boxes = BOXES.map(([x, y, w, label], k) => (
    <Layer key={label} className={slides[k]}>
      <Px ink={frame(x, y, w, BOX_H)} paper={rect(x + 1, y + 1, w - 2, BOX_H - 2)} />
      <Text x={x} y={y} w={w} h={BOX_H} className={`${CODE} justify-center`}>
        {label}
      </Text>
    </Layer>
  ));
  return (
    <Stage
      c={workshop}
      states={WORKSHOP_STATES}
      status={c.status}
      lamp={c.lamp}
      spec="system design"
    >
      {/* the wires, under the boxes */}
      <Px ink={dashes(18, 17, 16, 2, 1)} className={c.w0} />
      <Px
        ink={dashes(52, 15, 10, 2, 1) + rect(62, 7, 1, 9) + dashes(62, 7, 10, 2, 1)}
        className={c.w1}
      />
      <Px
        ink={dashes(52, 19, 10, 2, 1) + rect(62, 19, 1, 9) + dashes(62, 27, 10, 2, 1)}
        className={c.w2}
      />
      {boxes}
      {/* the deploy lamp under the api */}
      <Px x={34} y={30} w={5} h={5} ink={frame(0, 0, 5, 5)} />
      <Px x={35} y={31} w={3} h={3} orange={rect(0, 0, 3, 3)} className={c.deploy} />
      <Text x={41} y={30} h={5} className={CODE}>
        deploy
      </Text>
    </Stage>
  );
}

// Any section without its own: a page whose text lines type in, then it's published.

const LINES = [44, 52, 38, 52, 30, 48, 52, 24];

const FALLBACK_STATES = ['writing', 'published'];

const typed: Record<number, number> = {};
for (let k = 0; k <= LINES.length; k++) typed[k] = k;

const fallback = choreograph('fallback', 12, 11, {
  status: roll(5, { 0: 0, 10: 1 }, 1),
  lamp: { base: 'visibility:hidden', poses: show(1, 10) },
  lines: roll(40, typed, LINES.length),
});

function FallbackMechanism() {
  const c = fallback.cls;
  const frames = [];
  for (let f = 0; f <= LINES.length; f++) {
    let d = '';
    for (let r = 0; r < f; r++) d += rect(24, 6 + r * 4, LINES[r], 1);
    // the caret at the start of the next line
    const caret = f < LINES.length ? rect(24, 5 + f * 4, 2, 3) : '';
    frames.push(<Px key={f} w={96} h={40} ink={d} orange={caret} />);
  }
  return (
    <Stage c={fallback} states={FALLBACK_STATES} status={c.status} lamp={c.lamp} spec="notes">
      <Px ink={frame(20, 0, 60, 40) + rect(70, 1, 1, 9) + rect(71, 9, 9, 1)} />
      <Clip x={0} y={0} w={96} h={40}>
        <Frames h={40} className={c.lines}>
          {frames}
        </Frames>
      </Clip>
    </Stage>
  );
}

/** the mechanism of each section, by its root folder's name */
const mechanisms: Record<string, () => ReactNode> = {
  NeuralNetworks: () => <NeuralNetworksMechanism />,
  Library: () => <LibraryMechanism />,
  Academy: () => <AcademyMechanism />,
  Workshop: () => <WorkshopMechanism />,
};

/** the section's mechanism, or the fallback for a section without its own */
export function mechanismFor(key: string): ReactNode {
  return (mechanisms[key] ?? (() => <FallbackMechanism />))();
}
