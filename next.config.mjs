import { createMDX } from 'fumadocs-mdx/next';

const withMDX = createMDX();

/** @type {import('next').NextConfig} */
const config = {
  // Fully static site (GitHub Pages): no server runtime, no API routes that need one.
  output: 'export',
  // `/a/b` is exported as `/a/b/index.html`, matching the old MkDocs directory URLs.
  trailingSlash: true,
  images: { unoptimized: true },
  reactStrictMode: true,
};

export default withMDX(config);
