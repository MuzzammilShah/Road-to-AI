'use client';
import { useTheme } from 'next-themes';
import { useEffect, useRef } from 'react';

// Replaces the mkdocs_macros_utils X/Twitter embed (x-twitter-widget.js): renders the tweet with
// X's widgets.js and re-renders it when the site theme changes. Styles: `.x-twitter-embed` in
// app/global.css (ported from x-twitter-link-card.css).

type Twttr = { widgets: { load: (el?: HTMLElement) => Promise<unknown> } };

let widgets: Promise<Twttr> | undefined;

function loadWidgets(): Promise<Twttr> {
  widgets ??= new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://platform.twitter.com/widgets.js';
    script.async = true;
    script.onload = () => resolve((window as unknown as { twttr: Twttr }).twttr);
    script.onerror = () => {
      widgets = undefined;
      reject(new Error('Failed to load platform.twitter.com/widgets.js'));
    };
    document.head.append(script);
  });
  return widgets;
}

export function Tweet({ url }: { url: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    const el = ref.current;
    if (!el || !resolvedTheme) return;

    // Plain link as fallback until (or if) the widget loads.
    const quote = document.createElement('blockquote');
    quote.className = 'twitter-tweet';
    quote.dataset.theme = resolvedTheme === 'dark' ? 'dark' : 'light';
    quote.dataset.dnt = 'true';
    const link = document.createElement('a');
    link.href = url;
    link.textContent = url;
    quote.append(link);
    el.replaceChildren(quote);

    let cancelled = false;
    loadWidgets()
      .then((twttr) => {
        if (!cancelled) return twttr.widgets.load(el);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [url, resolvedTheme]);

  return <div ref={ref} className="x-twitter-embed not-prose" />;
}
