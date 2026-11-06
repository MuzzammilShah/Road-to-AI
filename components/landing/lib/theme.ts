// Adapted from Fumadocs (https://github.com/fuma-nama/fumadocs, commit 55decd9),
// apps/docs/app/(landing)/lib/theme.ts. MIT License, Copyright (c) 2023 Fuma.
// See components/landing/LICENSE-fumadocs.txt.

/** the page shows its dark theme */
export function isDark(): boolean {
  return document.documentElement.classList.contains('dark');
}

const callbacks = new Set<() => void>();
let observer: MutationObserver | undefined;

/** calls `callback` when the page's theme may have changed (`<html>`'s class); returns its stop */
export function onTheme(callback: () => void): () => void {
  if (!observer) {
    observer = new MutationObserver(() => {
      for (const fn of callbacks) fn();
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
  }
  callbacks.add(callback);
  return () => {
    callbacks.delete(callback);
  };
}

/** colours the browser converted for us, by their CSS text (Road to AI addition) */
const converted = new Map<string, [number, number, number]>();
let probe: CanvasRenderingContext2D | null | undefined;

/**
 * Any other CSS colour (`oklch()`, `color-mix()`, named…): drawn on a 1×1 canvas and read back as
 * sRGB, once per value. The section accents are `oklch()`; this keeps the tokens the only source.
 */
function viaCanvas(text: string): [number, number, number] {
  const known = converted.get(text);
  if (known) return known;
  probe ??= document.createElement('canvas').getContext('2d', { willReadFrequently: true });
  if (!probe) return [0, 0, 0];
  probe.clearRect(0, 0, 1, 1);
  probe.fillStyle = '#000';
  probe.fillStyle = text;
  probe.fillRect(0, 0, 1, 1);
  const [r, g, b] = probe.getImageData(0, 0, 1, 1).data;
  const rgb: [number, number, number] = [r / 255, g / 255, b / 255];
  converted.set(text, rgb);
  return rgb;
}

/** a computed CSS colour as 0-1 channels: hex and `rgb()` parsed directly, anything else converted */
export function cssRgb(value: string): [r: number, g: number, b: number] {
  const text = value.trim();
  if (text.startsWith('#')) {
    const hex = text.length < 6 ? text.slice(1).replace(/./g, '$&$&') : text.slice(1);
    const n = (i: number) => Number.parseInt(hex.slice(i, i + 2), 16) / 255;
    return [n(0), n(2), n(4)];
  }
  // a token read while the page that defines it unmounts is empty
  if (text === '') return [0, 0, 0];
  if (!text.startsWith('rgb')) return viaCanvas(text);
  const [r = 0, g = 0, b = 0] = (text.match(/[\d.]+/g) ?? []).map(Number);
  return [r / 255, g / 255, b / 255];
}

/**
 * A computed CSS colour as a string Canvas2D's `fillStyle` takes as is: it already takes any CSS
 * colour, but a `var()` left unresolved in a token would not be (Road to AI addition)
 */
export function cssColor(value: string): string {
  const [r, g, b] = cssRgb(value);
  return `rgb(${Math.round(r * 255)} ${Math.round(g * 255)} ${Math.round(b * 255)})`;
}
