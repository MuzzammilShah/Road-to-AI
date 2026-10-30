'use client';
import dynamic from 'next/dynamic';

// three.js + Vanta touch `window`, so the globe is never rendered on the server.
export const HeroGlobe = dynamic(() => import('./globe'), {
  ssr: false,
  loading: () => <div aria-hidden className="absolute inset-0 bg-fd-background" />,
});
