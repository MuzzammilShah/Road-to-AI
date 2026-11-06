// Adapted from Fumadocs (https://github.com/fuma-nama/fumadocs, commit 55decd9),
// apps/docs/app/(landing)/sections/hero/index.tsx. MIT License, Copyright (c) 2023 Fuma.
// See components/landing/LICENSE-fumadocs.txt.
//
// Road to AI: this site's logo, description and sections; rounded buttons.
import { ChevronDown } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import type { CSSProperties, ReactNode } from 'react';
import { appDescription, githubUrl } from '@/lib/shared';
import { GithubIcon } from '../ui/github-icon';
import { Glitch } from './glitch';
import { type Satellite, Stage } from './stage';

export interface HeroSection extends Satellite {
  title: ReactNode;
}

/** the term of the site's description set in the accent, glitching once on load */
const KEY = 'Artificial Intelligence';
const [before, after] = appDescription.split(KEY);

const button =
  'inline-flex h-11 items-center justify-center gap-2 rounded-lg px-5 font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fd-ring max-sm:w-full [&_svg]:size-4';

/** a screen below the menu: the text and the sky over the horizon, the sky beside the text on
 * desktop and under it on phones */
export function Hero({ sections }: { sections: HeroSection[] }) {
  const first = sections[0]?.url ?? '/';
  return (
    <section
      aria-label="Road to AI"
      className="relative flex min-h-[calc(100svh-var(--lp-menu-h))] flex-col"
    >
      <div className="@container mx-auto grid w-full max-w-(--fd-layout-width) flex-1 grid-rows-[auto_1fr] gap-x-12 px-4 lg:grid-cols-2 lg:grid-rows-1">
        <div className="py-8 lg:self-center">
          <h1 className="sr-only">Road to AI</h1>
          <Image
            src="/assets/images/white-bg-logo.png"
            alt="Road to AI"
            width={999}
            height={250}
            priority
            className="mb-4 h-auto w-full max-w-md dark:hidden"
          />
          <Image
            src="/assets/images/black-bg-logo.png"
            alt="Road to AI"
            width={999}
            height={250}
            priority
            className="mb-4 hidden h-auto w-full max-w-md dark:block"
          />
          <p className="text-xl text-pretty text-fd-foreground md:text-2xl">
            {before}
            {after !== undefined && (
              <>
                <span className="font-semibold text-lp-orange">
                  <Glitch>{KEY}</Glitch>
                </span>
                {after}
              </>
            )}
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href={first}
              className={`${button} bg-fd-primary text-fd-primary-foreground hover:bg-fd-primary/85`}
            >
              Start reading
            </Link>
            <a
              href={githubUrl}
              className={`${button} border border-lp-line bg-lp-paper-2 text-fd-foreground hover:bg-fd-accent`}
            >
              <GithubIcon />
              GitHub
            </a>
          </div>
          <p className="mt-5 text-sm text-lp-ink-2">
            Sections:{' '}
            {sections.map((section, i) => (
              <span key={section.url}>
                {i > 0 && <> ·&nbsp;</>}
                <Link
                  href={section.url}
                  className="rounded-sm whitespace-nowrap text-lp-ink underline decoration-lp-line underline-offset-4 transition-colors hover:text-(--accent) hover:decoration-(--accent) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fd-ring"
                  style={{ '--accent': section.accent } as CSSProperties}
                >
                  {section.title}
                </Link>
              </span>
            ))}
          </p>
        </div>
        <Stage satellites={sections} />
      </div>
      {/* the horizon: a ruler's ticks, every 24px and every 240px */}
      <div aria-hidden className="relative h-16 border-t border-lp-line-strong">
        <div className="h-1.5 bg-[repeating-linear-gradient(to_right,var(--lp-line-strong)_0_1px,transparent_1px_24px)] bg-position-[1rem]" />
        <div className="absolute inset-x-0 top-0 h-2.5 bg-[repeating-linear-gradient(to_right,var(--lp-line-strong)_0_1px,transparent_1px_240px)] bg-position-[1rem]" />
      </div>
      <a
        href="#intro"
        aria-label="Scroll to content"
        className="absolute bottom-2 left-1/2 z-10 flex size-10 -translate-x-1/2 items-center justify-center rounded-full border bg-fd-background/70 text-fd-muted-foreground backdrop-blur transition-colors hover:text-fd-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fd-ring"
      >
        {/* animate-bounce moves between -25% and 0; translate-y-1/8 centres that range in the circle. */}
        <ChevronDown className="size-5 motion-safe:translate-y-1/8 motion-safe:animate-bounce" />
      </a>
    </section>
  );
}
