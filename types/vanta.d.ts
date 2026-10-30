// vanta and three@0.134.0 ship without TypeScript types; only what the landing globe uses.

declare module 'vanta/dist/vanta.globe.min' {
  export interface VantaEffect {
    setOptions(options: Record<string, unknown>): void;
    resize(): void;
    destroy(): void;
  }
  const GLOBE: (options: Record<string, unknown>) => VantaEffect;
  export default GLOBE;
}

declare module 'three';
