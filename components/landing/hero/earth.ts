/**
 * The Earth globe's land mask (Road to AI; not from Fumadocs): Natural Earth's 1:110m land
 * (public domain), from `world-atlas` (ISC), turned into GeoJSON by `topojson-client` (ISC). Both
 * are imported dynamically, so they load only with the hero's engine, after the page. The land is
 * filled once per page into an equirectangular canvas, white on black, that the hero's figure
 * shader samples as a `coverage` texture: x the longitude from -180° at its left edge, y the
 * latitude from 90° at its top.
 */

export const LAND_W = 1024;
export const LAND_H = 512;

type Position = number[];
type Ring = Position[];
interface Geometry {
  type: string;
  coordinates: unknown;
}

let land: Promise<HTMLCanvasElement | null> | undefined;

/** the land mask, made once per page; `null` when it can't be (no 2D context, failed import) */
export function loadLand(): Promise<HTMLCanvasElement | null> {
  land ??= make().catch((error: unknown) => {
    console.error('Road to AI: the globe has no land', error);
    return null;
  });
  return land;
}

async function make(): Promise<HTMLCanvasElement | null> {
  const [{ feature }, atlas] = await Promise.all([
    import('topojson-client'),
    import('world-atlas/land-110m.json'),
  ]);
  const topology = (atlas.default ?? atlas) as unknown as Parameters<typeof feature>[0];
  const collection = feature(topology, topology.objects.land) as {
    features?: { geometry: Geometry }[];
    geometry?: Geometry;
  };
  const geometries = collection.features?.map((f) => f.geometry) ?? [collection.geometry];

  const canvas = document.createElement('canvas');
  canvas.width = LAND_W;
  canvas.height = LAND_H;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, LAND_W, LAND_H);
  ctx.fillStyle = '#fff';
  for (const geometry of geometries) {
    if (!geometry) continue;
    const polygons =
      geometry.type === 'Polygon'
        ? [geometry.coordinates as Ring[]]
        : geometry.type === 'MultiPolygon'
          ? (geometry.coordinates as Ring[][])
          : [];
    for (const polygon of polygons) fillPolygon(ctx, polygon);
  }
  return canvas;
}

const x = (lon: number) => ((lon + 180) / 360) * LAND_W;
const y = (lat: number) => ((90 - lat) / 180) * LAND_H;

/**
 * One polygon, its outer ring and holes as one even-odd path. A ring that crosses the antimeridian
 * is unwrapped into one continuous run of longitudes, past ±180° if it must, and the path is filled
 * three times, a world's width apart, so each piece lands on its side of the map. A ring that goes
 * all the way round (Antarctica) is closed along the pole it circles.
 */
function fillPolygon(ctx: CanvasRenderingContext2D, rings: Ring[]) {
  const path = new Path2D();
  for (const ring of rings) {
    if (ring.length < 3) continue;
    let shift = 0;
    let last = ring[0][0];
    let latSum = 0;
    const points: [number, number][] = [];
    for (const [lon, lat] of ring) {
      if (lon - last > 180) shift -= 360;
      else if (last - lon > 180) shift += 360;
      last = lon;
      points.push([lon + shift, lat]);
      latSum += lat;
    }
    const span = points[points.length - 1][0] - points[0][0];
    if (Math.abs(span) > 180) {
      // round the pole the ring circles: down (or up) to it, across, and back
      const pole = latSum / points.length < 0 ? -90 : 90;
      points.push([points[points.length - 1][0], pole], [points[0][0], pole]);
    }
    path.moveTo(x(points[0][0]), y(points[0][1]));
    for (let i = 1; i < points.length; i++) path.lineTo(x(points[i][0]), y(points[i][1]));
    path.closePath();
  }
  for (const offset of [-LAND_W, 0, LAND_W]) {
    ctx.setTransform(1, 0, 0, 1, offset, 0);
    ctx.fill(path, 'evenodd');
  }
  ctx.setTransform(1, 0, 0, 1, 0, 0);
}
