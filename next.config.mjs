import { createMDX } from 'fumadocs-mdx/next';
import { PHASE_DEVELOPMENT_SERVER } from 'next/constants.js';

const withMDX = createMDX();

/** @type {(phase: string) => import('next').NextConfig} */
const config = (phase) => ({
  // Fully static site (GitHub Pages): no server runtime, no API routes that need one.
  // Not applied in `next dev`: there, unknown URLs (e.g. /sw.js, Chrome's
  // /.well-known/appspecific/com.chrome.devtools.json) would throw "missing param in
  // generateStaticParams()" instead of returning 404. `npm run build` always exports.
  output: phase === PHASE_DEVELOPMENT_SERVER ? undefined : 'export',
  // `/a/b` is exported as `/a/b/index.html`, matching the old MkDocs directory URLs.
  trailingSlash: true,
  images: { unoptimized: true },
  reactStrictMode: true,
});

export default (phase) => withMDX(config(phase));
