// Adapted from Fumadocs (https://github.com/fuma-nama/fumadocs, commit 55decd9),
// apps/docs/app/(landing)/sections/start/data.ts. MIT License, Copyright (c) 2023 Fuma.
// See components/landing/LICENSE-fumadocs.txt.
//
// Road to AI: the session is a training loop printing its loss, with real numbers: every value is
// a saved output of notebooks/NeuralNetworks/Makemore-part5/Main-notebook-part-5.ipynb (the
// WaveNet-style makemore model; notebooks are never executed). The command line itself is
// illustrative. The GPT-1 notebook has no step-by-step loss log, so it isn't used. It runs in a
// macOS Terminal window: its title bar is the screen's first row, then zsh.
import { TICK } from '../lib/motion';

/** the terminal: 80 columns by 24 rows */
export const COLS = 80;
export const ROWS = 24;

type Span = readonly [text: string, style: number];
type Line = readonly Span[];

// the shader's styles: default, dim, accent, inverse on the accent, inverse on the text (the caret)
const plain = (text: string): Span => [text, 0];
const dim = (text: string): Span => [text, 1];
const accent = (text: string): Span => [text, 2];
const inverse = (text: string): Span => [text, 3];
const caret = (text: string): Span => [text, 4];
// the title bar: its text, then its close, minimise and zoom buttons
const bar = (text: string): Span => [text, 5];

export interface Frame {
  at: number;
  lines: readonly Line[];
  /** first transcript line on screen, a terminal never scrolls back */
  top: number;
  status?: string;
}

const COMMAND = 'python train.py --model wavenet --data names.txt';
/** zsh's prompt on macOS: user@host, the folder, `%` */
const PROMPT = 'muzzammil@MacBook Road-to-AI % ';
const LOGIN = 'Last login: Thu Nov  6 09:41:12 on ttys000';

/** the Terminal window's title bar, the screen's first row: its three buttons, its title centred */
export const TITLE: Line = (() => {
  const title = 'muzzammil — python — 80×24';
  const left = Math.floor((COLS - title.length) / 2);
  return [
    bar(' '),
    ['●', 6],
    bar(' '),
    ['●', 7],
    bar(' '),
    ['●', 8],
    bar(' '.repeat(left - 6)),
    bar(title),
    bar(' '.repeat(COLS - left - title.length)),
  ];
})();
/** cell 5, 9: the dataset and the model */
const SETUP = 'vocab 27 · context 8 · 76579 params · 182625 examples';
const STEPS = 200000;
/** cell 10: the minibatch loss every 10000 steps, as printed */
const LOSSES = [
  3.3167, 2.0576, 2.0723, 2.5134, 2.1476, 1.7836, 2.2592, 1.9331, 1.6875, 2.0395, 1.7736, 1.957,
  1.7465, 1.8126, 1.7406, 1.7466, 1.8806, 1.6266, 1.6476, 1.8555,
];
/** cell 13: the loss over the whole splits once trained */
const SPLIT = { train: '1.7690', val: '1.9937' };
/** cell 15: twenty names sampled from the trained model */
const SAMPLES = [
  'arlij',
  'chetta',
  'heago',
  'rocklei',
  'hendrix',
  'jamylie',
  'broxin',
  'denish',
  'anslibt',
  'marianah',
  'astavia',
  'annayve',
  'aniah',
  'jayce',
  'nodiel',
  'remita',
  'niyelle',
  'jaylene',
  'aiyan',
  'aubreana',
];
/** the progress bar's cells, and the sparkline's eight heights */
const BAR = 10;
const SPARK = '▁▂▃▄▅▆▇█';

/** a step's line: its count, its loss, and the bar of the run so far */
function stepLine(k: number): Line {
  const step = k * 10000;
  const done = Math.round(((k + 1) / LOSSES.length) * BAR);
  return [
    plain(`step ${String(step).padStart(6)}/${STEPS} `),
    dim('│'),
    plain(' loss '),
    accent(LOSSES[k].toFixed(4)),
    plain(' '),
    dim('│'),
    plain(' ▕'),
    inverse(' '.repeat(done)),
    plain(' '.repeat(BAR - done)),
    plain('▏'),
  ];
}

/** the losses as a line of block heights, highest the first */
function sparkline(): string {
  const lo = Math.min(...LOSSES);
  const hi = Math.max(...LOSSES);
  return LOSSES.map((l) => SPARK[Math.round(((l - lo) / (hi - lo)) * (SPARK.length - 1))]).join('');
}

/** the samples, wrapped two spaces in at under 72 columns */
function samples(): Line[] {
  const lines: Line[] = [];
  let row = '';
  for (const name of SAMPLES) {
    const word = `${name}.`;
    if (row && row.length + 1 + word.length > 70) {
      lines.push([plain(`  ${row}`)]);
      row = word;
    } else row = row ? `${row} ${word}` : word;
  }
  if (row) lines.push([plain(`  ${row}`)]);
  return lines;
}

export function createSession() {
  const frames: Frame[] = [];
  const log: Line[] = [];
  let at = 0;
  let top = 0;

  function show(live: Line[], wait: number, status?: string) {
    const lines = log.concat(live);
    // the title bar takes the first row
    top = Math.max(top, lines.length - (ROWS - 1));
    frames.push({ at, lines, top, status });
    at += wait;
  }

  function shell(typed: string, cursor: boolean): Line[] {
    return [[plain(PROMPT), plain(typed), ...(cursor ? [caret(' ')] : [])]];
  }

  log.push([plain(LOGIN)]);
  show(shell('', true), 2 * TICK);
  for (let i = 1; i <= COMMAND.length; i++)
    show(shell(COMMAND.slice(0, i), true), 28, i === 1 ? `typing ${COMMAND}` : undefined);
  show(shell(COMMAND, true), 2 * TICK);
  log.push(shell(COMMAND, false)[0]);
  show([], 2 * TICK);

  log.push([dim(SETUP)]);
  show([], 3 * TICK, 'training');
  // a line every two ticks
  for (let k = 0; k < LOSSES.length; k++) {
    log.push(stepLine(k));
    show([], 2 * TICK);
  }
  log.push([plain('loss '), accent(sparkline())]);
  show([], 2 * TICK);
  log.push([
    plain('split loss: train '),
    accent(SPLIT.train),
    plain(' '),
    dim('│'),
    plain(' val '),
    accent(SPLIT.val),
  ]);
  show([], 3 * TICK, 'trained');
  log.push([plain(`sampling ${SAMPLES.length} names:`)]);
  show([], 2 * TICK, 'sampling');
  for (const line of samples()) {
    log.push(line);
    show([], TICK);
  }
  // the prompt again, its caret on (`rest`) and off (`restOff`): the engine blinks it once played
  const end = log.length;
  log.push(shell('', true)[0]);
  show([], TICK);
  const rest = frames[frames.length - 1];
  const restOff: Frame = { ...rest, lines: [...rest.lines.slice(0, end), shell('', false)[0]] };
  // the finished session at rest, its last output on screen: where it ends, and what reduced motion
  // shows
  return { frames, rest, restOff };
}
