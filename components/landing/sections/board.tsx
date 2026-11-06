// Adapted from Fumadocs (https://github.com/fuma-nama/fumadocs, commit 55decd9),
// apps/docs/app/(landing)/sections/integrations/board.tsx. MIT License, Copyright (c) 2023 Fuma.
// See components/landing/LICENSE-fumadocs.txt.
//
// Road to AI: the board holds the site's sections (one card per root folder of the docs) as
// separate rounded cards, each one link, with the site's corner-glow hover instead of Fumadocs'
// colour inversion; no "install" window.
'use client';
import { ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import { type CSSProperties, type ReactNode, useId } from 'react';
import { cn } from '@/lib/cn';
import { mount, reduce } from '../lib/script';
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
 * pointed at or focused, else resting on its payoff.
 */
export function Board({ header, sections }: { header: ReactNode; sections: BoardSection[] }) {
  const id = useId();

  function enter(card: HTMLElement) {
    // its mechanism once more, unless it's still playing or yet to come in; a card queued for its
    // turn leaves the queue
    if (card.hasAttribute('data-play') || card.hasAttribute('data-waiting') || reduce()) return;
    delete card.dataset.queued;
    card.dataset.play = 'fast';
  }

  const cells = [];
  for (let i = 0; i < sections.length; i++) {
    const section = sections[i];
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
          if (event.pointerType === 'mouse') enter(event.currentTarget);
        }}
        onFocus={(event) => {
          if (!event.target.matches(':focus-visible')) return;
          enter(event.currentTarget);
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
      <div className="pb-10 md:pb-12">{header}</div>
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
