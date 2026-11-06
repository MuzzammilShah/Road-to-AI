import { getSidebarTabs } from 'fumadocs-ui/components/sidebar/tabs';
import { ChevronDown } from 'lucide-react';
import Image from 'next/image';
import { HeroGlobe } from '@/components/home/hero-globe';
import { LandingFooter } from '@/components/landing/footer/footer';
import { Board } from '@/components/landing/sections/board';
import { mechanismFor } from '@/components/landing/sections/mechanisms';
import { getSection } from '@/lib/sections';
import { appDescription } from '@/lib/shared';
import { source } from '@/lib/source';

/** The sections (root folders) as in the sidebar dropdown, in the order of content/docs/meta.json. */
function getLandingSections() {
  // Identity transform: keep the plain icon instead of the dropdown's wrapper.
  return getSidebarTabs(source.getPageTree(), { transform: (tab) => tab }).map((tab) => {
    const key = tab.url.split('/')[1];
    const settings = getSection(key);
    return {
      ...tab,
      key,
      name: typeof tab.title === 'string' ? tab.title : key,
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

      {/* Section board: one card per root folder of the docs, each with its own mechanism. */}
      <section
        id="intro"
        className="mx-auto w-full max-w-(--fd-layout-width) scroll-mt-14 px-4 py-20 md:py-24"
      >
        <Board
          header={
            <h2 className="text-2xl font-semibold tracking-tight text-balance md:text-3xl">
              Jump into any part of my journey
            </h2>
          }
          sections={sections.map((section) => ({
            key: section.key,
            title: section.title,
            name: section.name,
            url: section.url,
            description: section.description,
            accent: section.accent,
            icon: section.icon,
            mechanism: mechanismFor(section.key),
          }))}
        />
      </section>

      <LandingFooter sections={sections} />
    </>
  );
}
