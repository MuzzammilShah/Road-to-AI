import {
  Bird,
  CircleAlert,
  CircleCheckBig,
  CornerDownRight,
  Feather,
  FileText,
  LibraryBig,
  type LucideIcon,
  Network,
  Sparkle,
} from 'lucide-react';

// Replacements for the Material for MkDocs icon shortcodes used in the notes
// (mapping lives in scripts/lib/mdx.mjs).
const icons = {
  Bird,
  CircleAlert,
  CircleCheckBig,
  CornerDownRight,
  Feather,
  FileText,
  LibraryBig,
  Network,
  Sparkle,
} satisfies Record<string, LucideIcon>;

export function Icon({ name }: { name: keyof typeof icons }) {
  const Component = icons[name];
  return <Component aria-hidden className="inline-block size-[1.1em] align-[-0.15em]" />;
}
