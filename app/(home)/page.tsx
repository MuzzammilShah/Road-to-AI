import { getSidebarTabs } from 'fumadocs-ui/components/sidebar/tabs';
import { LandingFooter } from '@/components/landing/footer/footer';
import { Hero } from '@/components/landing/hero';
import { Board } from '@/components/landing/sections/board';
import { mechanismFor } from '@/components/landing/sections/mechanisms';
import { Start } from '@/components/landing/start';
import { cn } from '@/lib/cn';
import { getSection } from '@/lib/sections';
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
  /** a section by folder for the closing call to action, the first without one */
  const pick = (key?: string) => {
    const section = key ? sections.find((s) => s.key === key) : sections[0];
    return section && { title: section.name, url: section.url };
  };
  return (
    <>
      <Hero
        sections={sections.map((section) => ({
          title: section.title,
          url: section.url,
          icon: section.icon,
          accent: section.accent,
        }))}
      />

      {/* Section board: one card per root folder of the docs, each with its own mechanism. */}
      <section
        id="intro"
        className={cn(
          'mx-auto w-full scroll-mt-14 px-4 py-20 md:py-24',
          // two columns of cards; three (when the count is odd) need a little more room
          sections.length % 2 === 1 ? 'max-w-6xl' : 'max-w-5xl',
        )}
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

      <Start start={pick('NeuralNetworks') ?? pick()} browse={pick('Library')} />

      <LandingFooter />
    </>
  );
}
