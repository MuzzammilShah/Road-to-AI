// Adapted from Fumadocs (https://github.com/fuma-nama/fumadocs, commit 55decd9),
// apps/docs/app/(landing)/sections/hero/stage.tsx. MIT License, Copyright (c) 2023 Fuma.
// See components/landing/LICENSE-fumadocs.txt.
//
// Road to AI: the satellites' labels are links to the site's sections, and the bubble is rounded.
'use client';
import { useReducedMotion } from 'motion/react';
import { type CSSProperties, type ReactNode, useCallback } from 'react';
import { LEGS, MATE_H, MATE_W } from '../character/sprite';
import { Chip } from '../ui/chip';
import { createHero, SKY } from './engine';
import { CROWN, REACH } from './scene';

export interface Satellite {
  title: ReactNode;
  url: string;
  icon?: ReactNode;
  accent: string;
}

/** on phones the sky is as tall as the drawing at its width, with room over him for his bubble
 * (`--room`, as much taller at 3x as its lines are); beside the text it takes the row */
const sky = { '--fit': `calc(100cqw * ${SKY / (2 * REACH)} + var(--room))` } as CSSProperties;

/** `--feet` px from the horizon up to his feet, from `--r` px a globe radius and `--cell` px a cell
 * of his, both measured by the engine */
const scene = { '--feet': `calc(var(--r) * ${CROWN} - ${LEGS} * var(--cell))` } as CSSProperties;

/** the drawing's box, `REACH` either side of the globe's centre and `SKY` high */
const drawing: CSSProperties = {
  width: `calc(var(--r) * ${2 * REACH})`,
  height: `calc(var(--r) * ${SKY})`,
};

/** his canvas: his seat on the globe's crown, his legs down its face */
const mate: CSSProperties = {
  width: `calc(${MATE_W} * var(--cell))`,
  left: `calc(50% - ${MATE_W / 2} * var(--cell))`,
};

/** what he says, laid over his head by `createTalk`: a rounded bubble in the page's ink, its two
 * lines sized in full as they type in, its tail down to the dot. The pixel type is on its grid, a
 * unit (0.038em) a device px at 2x and two at 3x, in sizes Chromium keeps: it cuts them to
 * hundredths */
function Bubble() {
  return (
    <div
      data-bubble
      data-state="off"
      className="pointer-events-auto absolute top-0 left-0 isolate w-max pb-2.25 font-pixel text-pixel font-normal antialiased select-text data-[state=off]:invisible [@media(min-resolution:3dppx)]:text-[17.54px] [@media(min-resolution:3dppx)]:leading-5.5"
    >
      <span className="relative grid justify-items-start rounded-lg bg-lp-ink px-2.5 py-2 whitespace-pre text-lp-paper shadow-md contain-layout contain-paint *:col-start-1 *:row-start-1">
        <span data-sizer className="invisible" />
        <span data-said />
      </span>
      {/* his bubble's tail, from its root on the bubble's foot to the dot, from a pixel into the box
          so the two fills meet without a seam */}
      <span className="absolute inset-x-0 bottom-0 h-2.5 bg-lp-ink [clip-path:polygon(var(--tail-a)_0,var(--tail-b)_0,var(--tail-tip)_100%)]" />
    </div>
  );
}

/** the sky over the horizon, its canvas the stars and the globe with its ring and prisms; the
 * drawing's box holds him on the globe's crown, his bubble over him and the labels on the globe's
 * centre. The scene sets as one behind the horizon, the sky's bottom edge. The pointer passes
 * through the sky to the hero, all but its text and links */
export function Stage({ satellites }: { satellites: Satellite[] }) {
  const reduced = useReducedMotion() === true;
  const ref = useCallback(
    (stage: HTMLDivElement | null) => (stage ? createHero(stage, reduced) : undefined),
    [reduced],
  );

  return (
    <div
      ref={ref}
      style={sky}
      className="pointer-events-none relative overflow-clip [--room:5rem] max-lg:min-h-(--fit) [@media(min-resolution:3dppx)]:[--room:5.75rem]"
    >
      <div style={scene} className="absolute inset-0 flex items-end justify-center">
        <canvas aria-hidden className="absolute inset-0 size-full" />
        <div style={drawing} className="relative">
          <canvas
            aria-hidden
            width={MATE_W}
            height={MATE_H}
            style={mate}
            className="invisible absolute bottom-(--feet) [image-rendering:pixelated]"
          />
          <Bubble />
        </div>
        {satellites.map((s) => (
          <Chip
            key={s.url}
            href={s.url}
            icon={s.icon}
            accent={s.accent}
            data-satellite
            data-state="off"
            className="pointer-events-auto absolute top-0 left-0 data-[state=off]:invisible data-[state=pop]:bg-lp-ink data-[state=pop]:text-lp-paper"
          >
            {s.title}
          </Chip>
        ))}
      </div>
    </div>
  );
}
