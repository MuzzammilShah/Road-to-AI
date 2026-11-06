// Adapted from Fumadocs (https://github.com/fuma-nama/fumadocs, commit 55decd9),
// apps/docs/app/(landing)/sections/start/index.tsx. MIT License, Copyright (c) 2023 Fuma.
// See components/landing/LICENSE-fumadocs.txt.
//
// Road to AI: the call to action beside the CRT is this site's; the footer is its own component
// (../footer/footer.tsx).
import Link from 'next/link';
import { cn } from '@/lib/cn';
import { githubUrl } from '@/lib/shared';
import { GithubIcon } from '../ui/github-icon';
import { Stage } from './stage';

const button =
  'inline-flex h-11 items-center justify-center gap-2 rounded-lg px-4 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fd-ring [&_svg]:size-4';

interface Target {
  title: string;
  url: string;
}

/** the pre-footer scene: a CRT training a model, the camera pulling out to the call to action */
export function Start({ start, browse }: { start?: Target; browse?: Target }) {
  return (
    <section aria-label="Get started" className="relative border-t border-lp-line">
      <Stage>
        <h2 className="max-w-[30ch] text-[clamp(1.625rem,1rem+2vw,2.5rem)] leading-tight font-light tracking-tight text-balance">
          Feel free to explore my journey!
        </h2>
        {/* a row of equal buttons, the last on a row of its own when they don't fit */}
        <div className="flex flex-wrap gap-2 *:min-w-max *:flex-1">
          {start && (
            <Link
              href={start.url}
              className={cn(
                button,
                'bg-fd-primary text-fd-primary-foreground hover:bg-fd-primary/85',
              )}
            >
              Start with {start.title}
            </Link>
          )}
          {browse && (
            <Link
              href={browse.url}
              className={cn(button, 'border border-lp-line bg-lp-paper-2 hover:bg-fd-accent')}
            >
              Browse the {browse.title}
            </Link>
          )}
          <a
            href={githubUrl}
            className={cn(button, 'border border-lp-line bg-lp-paper-2 hover:bg-fd-accent')}
          >
            <GithubIcon />
            Star on GitHub
          </a>
        </div>
      </Stage>
    </section>
  );
}
