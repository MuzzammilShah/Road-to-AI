import { Brain, LibraryBig, type LucideIcon } from 'lucide-react';

/**
 * Icons for the sidebar section dropdown, by the `icon` name in each root meta.json.
 * Each icon gets its section's accent colour via `[data-section-icon]` in app/global.css, where the
 * `--section-*` colours are defined.
 */
const sectionIcons: Record<string, LucideIcon> = { Brain, LibraryBig };

export function resolveIcon(name: string | undefined) {
  if (!name) return;
  const Icon = sectionIcons[name];
  if (!Icon) throw new Error(`Unknown icon "${name}": add it to lib/sections.tsx`);
  return <Icon data-section-icon={name} />;
}

/** Root folder (first URL segment) -> accent colour variable from app/global.css. */
const sectionAccents: Record<string, string> = {
  ZeroToHero: 'var(--section-neural-networks)',
  Books: 'var(--section-library)',
};

/**
 * Sets the section's subtle primary colour for the whole page. A plain rule rendered with the page
 * (not a `body:has(...)` selector, which the browser re-checks on every DOM change while scrolling).
 */
export function SectionAccent({ section }: { section: string | undefined }) {
  const accent = section && sectionAccents[section];
  if (!accent) return null;
  return <style>{`body{--color-fd-primary:${accent}}`}</style>;
}
