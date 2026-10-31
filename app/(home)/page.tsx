import { getSidebarTabs } from 'fumadocs-ui/components/sidebar/tabs';
import { ArrowUpRight, ChevronDown } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import type { CSSProperties } from 'react';
import { HeroGlobe } from '@/components/home/hero-globe';
import { Copyright } from '@/components/site-footer';
import { cn } from '@/lib/cn';
import { getSection } from '@/lib/sections';
import { appDescription, websiteUrl } from '@/lib/shared';
import { source } from '@/lib/source';

/** The sections (root folders) as in the sidebar dropdown, in the order of content/docs/meta.json. */
function getLandingSections() {
  // Identity transform: keep the plain icon instead of the dropdown's wrapper.
  return getSidebarTabs(source.getPageTree(), { transform: (tab) => tab }).map((tab) => {
    const settings = getSection(tab.url.split('/')[1]);
    return {
      ...tab,
      description: settings?.landing ?? tab.description,
      accent: settings?.accent ?? 'var(--color-fd-primary)',
    };
  });
}

export default function HomePage() {
  const sections = getLandingSections();
  return (
    <>
      {/* Hero: full viewport, the globe also sits behind the transparent navbar (h-14).
          Mobile: the text sits at the bottom left, below the globe; desktop: vertically centred. */}
      <section className="relative isolate -mt-14 flex h-svh min-h-[480px] shrink-0 items-end overflow-hidden md:items-center">
        <HeroGlobe />
        <div className="relative z-10 mb-24 ml-[5%] w-[90%] p-2.5 md:mb-0 md:ml-[10%] md:w-[min(40%,480px)] md:p-5">
          <h1 className="sr-only">Road to AI</h1>
          <Image
            src="/assets/images/white-bg-logo.png"
            alt="Road to AI"
            width={999}
            height={250}
            priority
            className="mb-2.5 h-auto w-full md:w-4/5 dark:hidden"
          />
          <Image
            src="/assets/images/black-bg-logo.png"
            alt="Road to AI"
            width={999}
            height={250}
            priority
            className="mb-2.5 hidden h-auto w-full md:w-4/5 dark:block"
          />
          <p className="text-lg text-fd-foreground md:text-xl">{appDescription}</p>
        </div>
        <a
          href="#intro"
          aria-label="Scroll to content"
          className="absolute bottom-6 left-1/2 z-10 flex size-10 -translate-x-1/2 items-center justify-center rounded-full border bg-fd-background/70 text-fd-muted-foreground backdrop-blur transition-colors hover:text-fd-foreground"
        >
          {/* animate-bounce moves between -25% and 0; translate-y-1/8 centres that range in the circle. */}
          <ChevronDown className="size-5 motion-safe:translate-y-1/8 motion-safe:animate-bounce" />
        </a>
      </section>

      {/* Section cards, one per root folder of the docs. Fills the screen below the sticky navbar on
          desktop; content height on mobile. */}
      <section
        id="intro"
        className="mx-auto flex w-full max-w-(--fd-layout-width) scroll-mt-14 flex-col justify-center px-4 py-20 md:min-h-[calc(100svh-3.5rem)]"
      >
        <div className="mx-auto w-full max-w-5xl">
          <h2 className="mb-10 text-center text-2xl font-semibold tracking-tight md:text-3xl">
            Jump into any part of my journey
          </h2>

          {/* Up to 3 per row (4 cards: 2×2); an incomplete last row is centred. */}
          <ul className="landing-cards flex flex-wrap justify-center gap-4">
            {sections.map((section) => (
              <li
                key={section.url}
                className={cn(
                  'flex w-full sm:w-[calc((100%-1rem)/2)]',
                  sections.length !== 4 && 'lg:w-[calc((100%-2rem)/3)]',
                )}
              >
                <Link
                  href={section.url}
                  className="landing-section-card flex w-full flex-col rounded-2xl border bg-fd-card p-6 text-fd-card-foreground shadow-sm"
                  style={{ '--card-accent': section.accent } as CSSProperties}
                >
                  <ArrowUpRight
                    aria-hidden
                    className="landing-section-card-arrow absolute top-5 right-5 size-5"
                  />
                  <span className="landing-section-card-icon mb-5 flex size-11 items-center justify-center rounded-lg border [&_svg]:size-5.5">
                    {section.icon}
                  </span>
                  <h3 className="mb-2 text-xl font-medium tracking-tight lg:text-2xl">
                    {section.title}
                  </h3>
                  <p className="text-sm text-fd-muted-foreground">{section.description}</p>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* TODO(landing): footer content */}
      <footer className="mt-auto border-t">
        <div className="mx-auto flex w-full max-w-(--fd-layout-width) flex-col items-center justify-between gap-2 px-4 py-6 sm:flex-row">
          <Copyright />
          <a
            href={websiteUrl}
            className="text-xs text-fd-muted-foreground transition-colors hover:text-fd-foreground"
          >
            Website
          </a>
        </div>
      </footer>
    </>
  );
}
