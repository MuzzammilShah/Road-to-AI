'use client';
import { useTheme } from 'next-themes';
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import GLOBE, { type VantaEffect } from 'vanta/dist/vanta.globe.min';

// Vanta.js globe from the old MkDocs home page. Loaded client-only (see hero-globe.tsx).
// Dark: white lines on #121212; light: #121212 lines on white.
function colors(dark: boolean) {
  const line = dark ? 0xffffff : 0x121212;
  return { color: line, color2: line, backgroundColor: dark ? 0x121212 : 0xffffff };
}

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState<boolean | null>(null);
  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(query.matches);
    const onChange = () => setReduced(query.matches);
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, []);
  return reduced;
}

export default function Globe() {
  const ref = useRef<HTMLDivElement>(null);
  const effect = useRef<VantaEffect | null>(null);
  const { resolvedTheme } = useTheme();
  const dark = resolvedTheme === 'dark';
  const darkRef = useRef(dark);
  darkRef.current = dark;
  const reduced = usePrefersReducedMotion();
  const themeReady = resolvedTheme !== undefined;

  // Create once (after the theme and motion preference are known), destroy on unmount.
  useEffect(() => {
    if (!ref.current || reduced !== false || !themeReady) return;
    effect.current = GLOBE({
      el: ref.current,
      THREE,
      mouseControls: true,
      touchControls: true,
      gyroControls: false,
      scale: 1.0,
      scaleMobile: 1.0,
      ...colors(darkRef.current),
    });
    return () => {
      effect.current?.destroy();
      effect.current = null;
    };
  }, [reduced, themeReady]);

  // Follow theme changes live.
  useEffect(() => {
    effect.current?.setOptions(colors(dark));
  }, [dark]);

  // With reduced motion there is no animation: the container keeps the plain theme background.
  return <div ref={ref} aria-hidden className="absolute inset-0 bg-fd-background" />;
}
