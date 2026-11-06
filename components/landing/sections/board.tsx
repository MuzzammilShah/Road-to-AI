// Adapted from Fumadocs (https://github.com/fuma-nama/fumadocs, commit 55decd9),
// apps/docs/app/(landing)/sections/integrations/board.tsx. MIT License, Copyright (c) 2023 Fuma.
// See components/landing/LICENSE-fumadocs.txt.
//
// Road to AI: the board holds the site's sections (one card per root folder of the docs) as
// separate rounded cards, each one link, with the site's corner-glow hover instead of Fumadocs'
// colour inversion; the "install" window became an "open" window that rolls in `cd /<Section>/`.
'use client';
import { useCopyButton } from 'fumadocs-ui/utils/use-copy-button';
import { ArrowUpRight, Check, Clipboard } from 'lucide-react';
import Link from 'next/link';
import { type CSSProperties, type ReactNode, useId, useState } from 'react';
import { cn } from '@/lib/cn';
import { siteUrl } from '@/lib/shared';
import { mount, reduce } from '../lib/script';
import { Roller } from '../ui/text';
import { Window } from '../ui/window';
import { createEntrance } from './engine';

export interface BoardSection {
  /** the root folder's name, e.g. `NeuralNetworks`: picks the card's mechanism */
  key: string;
  title: ReactNode;
  /** plain title, for the window and labels */
  name: string;
  url: string;
  description: ReactNode;
  /** CSS colour (a `--section-*` variable) */
  accent: string;
  icon?: ReactNode;
  /** the card's `<Stage>` */
  mechanism: ReactNode;
}

/**
 * The board of sections, each card's mechanism played once as the card comes in and again as it's
 * pointed at or focused, else resting on its payoff. The open window shows the path of the card
 * last pointed at or focused.
 */
export function Board({ header, sections }: { header: ReactNode; sections: BoardSection[] }) {
  const [inspected, setInspected] = useState(0);
  const id = useId();

  function enter(card: HTMLElement, i: number) {
    setInspected(i);
    // its mechanism once more, unless it's still playing or yet to come in; a card queued for its
    // turn leaves the queue
    if (card.hasAttribute('data-play') || card.hasAttribute('data-waiting') || reduce()) return;
    delete card.dataset.queued;
    card.dataset.play = 'fast';
  }

  const paths: string[] = [];
  const cells = [];
  for (let i = 0; i < sections.length; i++) {
    const section = sections[i];
    paths.push(section.url);
    const title = `${id}-${i}-title`;
    const description = `${id}-${i}-description`;
    cells.push(
      <Link
        key={section.url}
        href={section.url}
        // the title names the link; the rest describes it
        aria-labelledby={title}
        aria-describedby={description}
        // a mouse points at a card; a tap opens it
        onPointerEnter={(event) => {
          if (event.pointerType === 'mouse') enter(event.currentTarget, i);
        }}
        onFocus={(event) => {
          if (!event.target.matches(':focus-visible')) return;
          enter(event.currentTarget, i);
        }}
        // played through: it rests on its payoff, its animations gone
        onAnimationEnd={(event) => {
          const card = event.currentTarget;
          for (const animation of card.getAnimations({ subtree: true }))
            if (
              animation instanceof CSSAnimation &&
              animation.animationName.startsWith('bt-') &&
              animation.playState !== 'finished'
            )
              return;
          delete card.dataset.play;
        }}
        data-card=""
        style={{ '--card-accent': section.accent } as CSSProperties}
        // the mechanism draws in the card's ink, in its accent while the card is pointed at or
        // focused; played again as it's inspected, at twice the pace; a card narrower than its
        // mechanism and padding scales the mechanism down whole
        className="landing-section-card group @container relative flex flex-col rounded-2xl border bg-lp-paper-2 p-4 text-fd-card-foreground shadow-sm [--bt-ink:var(--lp-ink)] [--bt-orange:var(--card-accent)] [--bt-paper:var(--lp-paper-2)] [--bt-speed:1] data-waiting:pointer-events-none data-waiting:opacity-0 hover:[--bt-ink:var(--card-accent)] focus-visible:[--bt-ink:var(--card-accent)] data-[play=fast]:[--bt-speed:2] md:p-6"
      >
        <ArrowUpRight
          aria-hidden
          className="landing-section-card-arrow absolute top-5 right-5 size-5"
        />
        <span className="flex items-center gap-3">
          <span className="landing-section-card-icon flex size-10 shrink-0 items-center justify-center rounded-lg border [&_svg]:size-5">
            {section.icon}
          </span>
          <h3 id={title} className="text-xl font-medium tracking-tight lg:text-2xl">
            {section.title}
          </h3>
        </span>
        <span id={description} className="mt-3 block text-sm text-pretty text-fd-muted-foreground">
          {section.description}
        </span>
        <span className="mt-auto block pt-6">{section.mechanism}</span>
      </Link>,
    );
  }

  // a cable from each card to the next: each its own svg round it, drawn once and wiped in by its
  // clip, so its growth repaints nothing
  const wires = [];
  for (let i = 1; i < sections.length; i++)
    wires.push(<span key={i} data-wire className="absolute" />);

  // 1 column on phones, 2 from md; 3 from xl only when 2 would leave a card alone on its row
  const odd = sections.length % 2 === 1;
  return (
    <div ref={playOnScreen} className="flex flex-col">
      <div className="flex flex-col gap-8 pb-10 md:pb-12 lg:flex-row lg:items-end lg:justify-between">
        {header}
        <Open paths={paths} path={sections[inspected]?.url ?? '/'} />
      </div>
      <div
        ref={entrance}
        className={cn(
          'landing-cards group/board relative grid gap-4 data-[state]:pointer-events-none md:grid-cols-2',
          odd && sections.length > 1 && 'xl:grid-cols-3',
        )}
      >
        {/* the cables the cards pop along as the board comes in, under them, in a softer ink */}
        <div
          aria-hidden
          className="pointer-events-none invisible absolute inset-0 [--lp-ink:color-mix(in_srgb,var(--color-fd-foreground)_55%,var(--lp-paper))] group-data-[state=playing]/board:visible"
        >
          {wires}
        </div>
        {cells}
      </div>
    </div>
  );
}

/** the board's entrance, made a screen before the reader reaches it */
const entrance = mount(createEntrance);

/** a card plays its mechanism only while it is on screen */
function playOnScreen(board: HTMLDivElement) {
  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) entry.target.toggleAttribute('data-paused', !entry.isIntersecting);
  });
  for (const el of board.querySelectorAll('[data-card]')) observer.observe(el);
  return () => observer.disconnect();
}

/** the "open" window: `cd` into the section last pointed at or focused, its URL copyable */
function Open({ paths, path }: { paths: string[]; path: string }) {
  const [copied, onCopy] = useCopyButton(() => navigator.clipboard.writeText(`${siteUrl}${path}`));
  // as wide as the longest command, so the window keeps its size as the command changes
  const sizers = [];
  for (const item of paths) {
    sizers.push(
      <span key={item} aria-hidden className="invisible col-start-1 row-start-1">
        cd {item}
      </span>,
    );
  }

  return (
    // below 1024 the window would sit screens above most cards
    <Window
      title={<span className="font-pixel text-pixel antialiased">open</span>}
      className="shrink-0 max-lg:hidden"
    >
      <div className="flex items-center gap-3 px-3 py-2.5 font-mono text-sm">
        <span aria-hidden className="text-lp-ink-2">
          $
        </span>
        <span className="grid min-w-0 flex-1 whitespace-pre">
          {sizers}
          <Roller value={`cd ${path}`} step={24} stagger={6} className="col-start-1 row-start-1" />
        </span>
        <button
          type="button"
          onClick={onCopy}
          aria-label={copied ? 'Copied' : `Copy the link to ${path}`}
          className="flex size-7 shrink-0 items-center justify-center rounded-md border border-lp-line text-lp-ink-2 transition-colors hover:bg-fd-accent hover:text-fd-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fd-ring"
        >
          {copied ? <Check className="size-3.5" /> : <Clipboard className="size-3.5" />}
        </button>
      </div>
    </Window>
  );
}
