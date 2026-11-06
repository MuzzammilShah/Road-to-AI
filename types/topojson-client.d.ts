// topojson-client@3.1.0 ships without TypeScript types; only what the landing globe uses
// (components/landing/hero/earth.ts).

declare module 'topojson-client' {
  export interface Topology {
    type: 'Topology';
    objects: Record<string, unknown>;
    arcs: number[][][];
    transform?: { scale: [number, number]; translate: [number, number] };
    bbox?: number[];
  }

  /** the GeoJSON Feature or FeatureCollection of a TopoJSON object */
  export function feature(topology: Topology, object: unknown): unknown;
}
