// Adapted from Fumadocs (https://github.com/fuma-nama/fumadocs, commit 55decd9),
// apps/docs/app/(landing)/lib/status.ts. MIT License, Copyright (c) 2023 Fuma.
// See components/landing/LICENSE-fumadocs.txt.
//
// Road to AI has no status bar, so the status machinery is a no-op stub: the ported engines keep
// their `report()` / `setStatus()` calls (they mark the story beats), and nothing listens.

/** a figure's own status line: nowhere to show it on this site */
export function report(_from: Element, _text: string): void {}

/** a passing status line: nowhere to show it on this site */
export function setStatus(_next: string): void {}
