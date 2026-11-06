// Adapted from Fumadocs (https://github.com/fuma-nama/fumadocs, commit 55decd9),
// apps/docs/app/(landing)/ui/command.tsx. MIT License, Copyright (c) 2023 Fuma.
// See components/landing/LICENSE-fumadocs.txt.
//
// Road to AI: rounded, in the site's colours.
'use client';
import { useCopyButton } from 'fumadocs-ui/utils/use-copy-button';
import { Check, Clipboard } from 'lucide-react';
import type { ComponentProps, ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { setStatus } from '../lib/status';

interface CommandProps extends ComponentProps<'div'> {
  command: string;
}

/** a shell command with a copy button */
export function Command({ command, className, ...props }: CommandProps) {
  const [copied, onCopy] = useCopyButton(async () => {
    await navigator.clipboard.writeText(command);
    setStatus(`copied ${command}`);
  });

  // a box too narrow for the command wraps it between its words, or after a `/` of a URL, never
  // inside a word or a path segment, the lines hung after the prompt
  const words: ReactNode[] = [];
  const parts = command.split(' ');
  for (let i = 0; i < parts.length; i++) {
    if (i > 0) words.push(' ');
    const segments = parts[i].split(/(?<=\/)/);
    for (let k = 0; k < segments.length; k++) {
      if (k > 0) words.push(<wbr key={`${i}-${k}-wbr`} />);
      words.push(
        <span key={`${i}-${k}`} className="whitespace-nowrap">
          {segments[k]}
        </span>,
      );
    }
  }

  return (
    <div
      {...props}
      className={cn(
        'flex min-h-11 w-fit max-w-full items-stretch overflow-hidden rounded-lg border border-lp-line bg-lp-paper-2',
        className,
      )}
    >
      <code className="flex min-w-0 flex-1 items-baseline gap-2 self-center px-3 py-2.5 font-mono text-sm leading-5">
        <span aria-hidden className="text-lp-ink-2 select-none">
          $
        </span>
        <span className="min-w-0">{words}</span>
      </code>
      <button
        type="button"
        onClick={onCopy}
        aria-label={copied ? 'Copied' : `Copy "${command}"`}
        className="flex w-11 shrink-0 items-center justify-center border-s border-lp-line text-lp-ink-2 transition-colors hover:bg-fd-accent hover:text-fd-foreground focus-visible:bg-fd-accent focus-visible:text-fd-foreground focus-visible:outline-none"
      >
        {copied ? <Check className="size-4" /> : <Clipboard className="size-4" />}
      </button>
    </div>
  );
}
