// Adapted from Fumadocs (https://github.com/fuma-nama/fumadocs, commit 55decd9),
// apps/docs/app/(landing)/ui/window.tsx. MIT License, Copyright (c) 2023 Fuma.
// See components/landing/LICENSE-fumadocs.txt.
//
// Road to AI: restyled in the site's rounded look (rounded-lg frame, three window dots) instead of
// Fumadocs' square hairline frame and striped title bar.
import type { ComponentProps, ReactNode } from 'react';
import { cn } from '@/lib/cn';

interface TitleBarProps {
  title?: ReactNode;
  /** extra content at the end of the title bar */
  actions?: ReactNode;
}

/**
 * A window's title bar: three dots, then the title. A window holds a file, a path or an address,
 * so the title is set as code.
 */
export function TitleBar({ title, actions }: TitleBarProps) {
  return (
    <div className="flex h-9 shrink-0 items-center gap-3 border-b border-lp-line px-3">
      <span aria-hidden className="flex gap-1.5">
        <span className="size-2.5 rounded-full bg-lp-line-strong/40" />
        <span className="size-2.5 rounded-full bg-lp-line-strong/40" />
        <span className="size-2.5 rounded-full bg-lp-line-strong/40" />
      </span>
      <span className="min-w-0 flex-1 truncate text-center font-mono text-xs leading-4 text-lp-ink-2">
        {title}
      </span>
      {actions ?? <span aria-hidden className="w-[46px]" />}
    </div>
  );
}

interface WindowProps extends Omit<ComponentProps<'div'>, 'title'>, TitleBarProps {}

/** a window of the landing: a rounded frame with a title bar */
export function Window({ title, actions, children, className, ...props }: WindowProps) {
  return (
    <div
      {...props}
      className={cn(
        'flex flex-col overflow-hidden rounded-lg border border-lp-line bg-lp-paper-2 shadow-sm',
        className,
      )}
    >
      <TitleBar title={title} actions={actions} />
      {children}
    </div>
  );
}
