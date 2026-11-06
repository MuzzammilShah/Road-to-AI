// Adapted from Fumadocs (https://github.com/fuma-nama/fumadocs, commit 55decd9),
// apps/docs/app/(landing)/ui/chip.tsx. MIT License, Copyright (c) 2023 Fuma.
// See components/landing/LICENSE-fumadocs.txt.
//
// Road to AI: a rounded link to a section (its lucide icon and title, in its accent) instead of a
// square label with an 8x8 layer icon.
import Link from 'next/link';
import type { ComponentProps, CSSProperties, ReactNode } from 'react';
import { cn } from '@/lib/cn';

interface ChipProps extends Omit<ComponentProps<typeof Link>, 'children'> {
  icon?: ReactNode;
  /** CSS colour of its section; the hero's satellite reads it off `--sat-accent` too */
  accent: string;
  children: ReactNode;
}

/** a section's label on the hero's satellites: a link to it */
export function Chip({ icon, accent, children, className, style, ...props }: ChipProps) {
  return (
    <Link
      {...props}
      style={{ '--sat-accent': accent, ...style } as CSSProperties}
      className={cn(
        'inline-flex h-7 items-center gap-1.5 rounded-lg border border-[color-mix(in_srgb,var(--sat-accent)_45%,transparent)] bg-lp-paper/90 px-2 text-xs font-medium whitespace-nowrap text-(--sat-accent) shadow-sm backdrop-blur-sm transition-colors hover:bg-[color-mix(in_srgb,var(--sat-accent)_14%,var(--lp-paper))] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--sat-accent) [&_svg]:size-3.5 [&_svg]:shrink-0 [&_svg]:text-current',
        className,
      )}
    >
      {icon}
      {children}
    </Link>
  );
}
