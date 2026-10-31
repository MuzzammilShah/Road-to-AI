#!/usr/bin/env node
// Writes redirect pages for renamed URLs into the static export. Runs after `next build` (see the
// `build` script in package.json); GitHub Pages has no server-side redirects.
//
// For every rename below, each exported page under the new prefix gets a small page at the same
// path under the old prefix that forwards to it (query string and #anchor included). `exact` maps
// single old URLs to a different page.
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { listFiles, ROOT } from './lib/site.mjs';

const OUT = join(ROOT, 'out');
const SITE = 'https://docs.muhammedshah.com';

const RENAMES = [
  { from: '/ZeroToHero/', to: '/NeuralNetworks/' },
  { from: '/Books/', to: '/Library/' },
];
const EXACT = {
  // The old section index was the Zero to Hero series overview (its #anchors live there now).
  '/ZeroToHero/': '/NeuralNetworks/Zero-To-Hero-Series/',
};

const redirects = new Map(Object.entries(EXACT));
for (const { from, to } of RENAMES) {
  // Without the slashes: listFiles makes paths relative to exactly this directory string.
  const pages = listFiles(join(OUT, to.slice(1, -1)), (f) => f.endsWith('index.html'));
  for (const page of pages) {
    const rest = page.replace(/index\.html$/, '');
    if (!redirects.has(from + rest)) redirects.set(from + rest, to + rest);
  }
}

for (const [from, to] of redirects) {
  const file = join(OUT, from.slice(1), 'index.html');
  if (existsSync(file)) throw new Error(`write-redirects: ${from} is a real page, not redirecting`);
  if (!existsSync(join(OUT, to.slice(1), 'index.html'))) {
    throw new Error(`write-redirects: ${from} -> ${to}, which does not exist`);
  }
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, page(to));
}
console.log(`Wrote ${redirects.size} redirect pages.`);

function page(to) {
  const target = JSON.stringify(to);
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>Redirecting…</title>
<meta name="robots" content="noindex" />
<link rel="canonical" href="${SITE}${to}" />
<script>location.replace(${target} + location.search + location.hash);</script>
<meta http-equiv="refresh" content="0; url=${to}" />
</head>
<body>
<p>This page has moved to <a href="${to}">${to}</a>.</p>
</body>
</html>
`;
}
