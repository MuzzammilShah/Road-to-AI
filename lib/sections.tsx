import { Brain, LibraryBig, type LucideIcon } from 'lucide-react';

/**
 * Icons for the sidebar section dropdown, by the `icon` name in each root meta.json.
 * Each icon gets its section's accent colour via `[data-section-icon]` in app/global.css, where the
 * per-section accent (`--color-fd-primary`) is also set.
 */
const sectionIcons: Record<string, LucideIcon> = { Brain, LibraryBig };

export function resolveIcon(name: string | undefined) {
  if (!name) return;
  const Icon = sectionIcons[name];
  if (!Icon) throw new Error(`Unknown icon "${name}": add it to lib/sections.tsx`);
  return <Icon data-section-icon={name} />;
}
