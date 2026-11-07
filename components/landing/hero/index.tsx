// Adapted from Fumadocs (https://github.com/fuma-nama/fumadocs, commit 55decd9),
// apps/docs/app/(landing)/sections/hero/index.tsx. MIT License, Copyright (c) 2023 Fuma.
// See components/landing/LICENSE-fumadocs.txt.
//
// Road to AI: the hero is one full-bleed pixel room. The heading, tagline and buttons overlay the
// dark upper-left wall of that room (kept dark in both themes, so light text always has contrast);
// on phones the room sits below the text and the text area blends into the room's wall colour, so
// the two read as one surface. The section links are not in the hero (the board below has them).
import { ChevronDown } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { appDescription, githubUrl } from '@/lib/shared';
import { GithubIcon } from '../ui/github-icon';
import { Room } from './room';
import type { Satellite } from './stage';

export interface HeroSection extends Satellite {
  title: ReactNode;
}

/** the term of the site's description set apart */
const KEY = 'Artificial Intelligence';
const [before, after] = appDescription.split(KEY);

const button =
  'inline-flex h-11 items-center justify-center gap-2 rounded-lg px-5 font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fd-ring max-sm:w-full [&_svg]:size-4';

/** the logo, tagline and buttons. The backdrop is always the dark room wall, so this always uses
 * the light-on-dark logo and light text, in both themes. */
function Intro({ first }: { first: string }) {
  return (
    <div className="max-w-md">
      <h1 className="sr-only">Road to AI</h1>
      <Image
        src="/assets/images/black-bg-logo.png"
        alt="Road to AI"
        width={999}
        height={250}
        priority
        className="mb-4 h-auto w-full"
      />
      <p className="text-xl text-pretty text-white/90 md:text-2xl">
        {before}
        {after !== undefined && (
          <>
            <span className="font-semibold text-white/55">{KEY}</span>
            {after}
          </>
        )}
      </p>
      <div className="mt-8 flex flex-wrap items-center gap-3">
        <Link href={first} className={`${button} bg-white text-[#121212] hover:bg-white/90`}>
          Start reading
        </Link>
        <a
          href={githubUrl}
          className={`${button} border border-white/25 bg-white/10 text-white hover:bg-white/20`}
        >
          <GithubIcon />
          GitHub
        </a>
      </div>
    </div>
  );
}

export function Hero({ sections }: { sections: HeroSection[] }) {
  const first = sections[0]?.url ?? '/';
  return (
    <section
      aria-label="Road to AI"
      className="relative flex min-h-[calc(100svh-var(--lp-menu-h))] flex-col bg-(--lp-room-wall)"
    >
      {/* Desktop: the room is pinned full-width to the bottom at its natural aspect; the wall colour
          fills the space above it (same colour, so no seam), and the intro sits in that upper-left
          wall. The room draws its own wall at the top, so the join is invisible. */}
      <div className="relative hidden flex-1 lg:block">
        <Room className="absolute inset-x-0 bottom-0 block w-full" />
        <div className="relative mx-auto flex h-full w-full max-w-(--fd-layout-width) items-start px-6 pt-[8vh]">
          <Intro first={first} />
        </div>
      </div>

      {/* Phones/tablets: the intro over the wall colour, then the room canvas, as one surface. */}
      <div className="flex flex-1 flex-col lg:hidden">
        <div className="px-4 pt-10 pb-8">
          <Intro first={first} />
        </div>
        <Room className="mt-auto block w-full" />
      </div>

      <a
        href="#intro"
        aria-label="Scroll to content"
        className="absolute bottom-2 left-1/2 z-10 flex size-10 -translate-x-1/2 items-center justify-center rounded-full border border-white/20 bg-black/40 text-white/80 backdrop-blur transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fd-ring"
      >
        {/* animate-bounce moves between -25% and 0; translate-y-1/8 centres that range in the circle. */}
        <ChevronDown className="size-5 motion-safe:translate-y-1/8 motion-safe:animate-bounce" />
      </a>
    </section>
  );
}
