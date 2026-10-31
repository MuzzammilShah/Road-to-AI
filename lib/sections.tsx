import {
  Bot,
  Brain,
  Feather,
  GraduationCap,
  Hammer,
  LibraryBig,
  List,
  type LucideIcon,
  Rocket,
} from 'lucide-react';

/**
 * Icons used by the page tree, by name:
 * - sections (`icon` in each root meta.json): Brain, LibraryBig, GraduationCap, Hammer. Each gets its
 *   section's accent colour via `[data-section-icon]` in app/global.css, where the `--section-*`
 *   colours are defined;
 * - the "Contents" page of every section (`icon: List` in front matter);
 * - group separators (`---[Icon]Label---` in meta.json): Rocket, Feather, Bot.
 */
const sectionIcons: Record<string, LucideIcon> = {
  Brain,
  LibraryBig,
  GraduationCap,
  Hammer,
  List,
  Rocket,
  Feather,
  Bot,
};

export function resolveIcon(name: string | undefined) {
  if (!name) return;
  const Icon = sectionIcons[name];
  if (!Icon) throw new Error(`Unknown icon "${name}": add it to lib/sections.tsx`);
  return <Icon data-section-icon={name} />;
}

/**
 * Per-section settings, by root folder (first URL segment):
 * - `accent`: colour variable from app/global.css (docs pages, landing card glows);
 * - `landing`: optional longer description for the landing card (falls back to the meta.json
 *   `description`, which stays short for the dropdown).
 */
const sections: Record<string, { accent: string; landing?: string }> = {
  NeuralNetworks: {
    accent: 'var(--section-neural-networks)',
    landing: 'Zero to Hero: Micrograd, Makemore, GPT-1, GPT-2, tokenizers and more.',
  },
  Library: {
    accent: 'var(--section-library)',
    landing: 'Notes from AI/ML books, starting with AI Engineering by Chip Huyen.',
  },
  Academy: {
    accent: 'var(--section-academy)',
    landing: 'Notes from AI/ML courses, starting with Agentic AI by DeepLearning.AI.',
  },
  Workshop: {
    accent: 'var(--section-workshop)',
    landing:
      'Exploring the craft of software engineering, starting with software architecture and system design.',
  },
};

export function getSection(folder: string | undefined) {
  return folder ? sections[folder] : undefined;
}

/**
 * Sets the section's subtle primary colour for the whole page. A plain rule rendered with the page
 * (not a `body:has(...)` selector, which the browser re-checks on every DOM change while scrolling).
 */
export function SectionAccent({ section }: { section: string | undefined }) {
  const accent = getSection(section)?.accent;
  if (!accent) return null;
  return <style>{`body{--color-fd-primary:${accent}}`}</style>;
}
