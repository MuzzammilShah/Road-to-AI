import { getSidebarTabs } from 'fumadocs-ui/components/sidebar/tabs';
import { LandingFooter } from '@/components/landing/footer/footer';
import { Hero } from '@/components/landing/hero';
import { Board } from '@/components/landing/sections/board';
import { mechanismFor } from '@/components/landing/sections/mechanisms';
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
