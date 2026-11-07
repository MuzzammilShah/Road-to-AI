// Road to AI: pauses the room's CSS animations while the hero is scrolled off screen, by toggling
// `data-room-paused` on this wrapper (the room's keyframes are gated on that attribute in
// app/global.css). Mirrors the board's `playOnScreen` pattern. Idle off screen = no animation work.
'use client';
import { type ReactNode, useCallback } from 'react';

export function PauseOffscreen({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  const ref = useCallback((el: HTMLDivElement | null) => {
    if (!el) return;
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) el.toggleAttribute('data-room-paused', !entry.isIntersecting);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
