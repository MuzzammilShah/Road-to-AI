'use client';
import { useEffect, useRef, useState } from 'react';

/**
 * A notebook cell's HTML output (written to public/notebook-outputs/ by convert-notebooks.mjs).
 * Rendered in a sandboxed iframe: its scripts never run and its own CSS cannot leak into the site.
 * `allow-same-origin` lets this component read the content height to size the frame.
 */
export function NotebookHtmlOutput({ src }: { src: string }) {
  const ref = useRef<HTMLIFrameElement>(null);
  const [height, setHeight] = useState<number>();

  useEffect(() => {
    const frame = ref.current;
    if (!frame) return;
    let observer: ResizeObserver | undefined;
    // The body is `display: flow-root` (see the converter), so its height includes the margins of
    // its children; the root element would never report less than the frame's current height.
    const measure = () => {
      const body = frame.contentDocument?.body;
      if (body) setHeight(Math.ceil(body.getBoundingClientRect().height));
    };
    const attach = () => {
      const doc = frame.contentDocument;
      // A lazy frame holds an empty about:blank document until it starts loading.
      const body = doc?.URL === 'about:blank' ? undefined : doc?.body;
      if (!body) return;
      measure();
      observer?.disconnect();
      observer = new ResizeObserver(measure);
      observer.observe(body);
    };
    // The frame may already have loaded before hydration.
    if (frame.contentDocument?.readyState === 'complete') attach();
    frame.addEventListener('load', attach);
    return () => {
      frame.removeEventListener('load', attach);
      observer?.disconnect();
    };
  }, []);

  return (
    <iframe
      ref={ref}
      src={src}
      title="Notebook output"
      sandbox="allow-same-origin"
      loading="lazy"
      className="my-4 block w-full rounded-xl border bg-white"
      style={{ height: height ?? 160 }}
    />
  );
}
