#!/usr/bin/env node
// Crawls the static export (out/) and verifies that every internal href/src resolves to a file
// and every #anchor exists on its target page. Run after `npm run build`.
//
//   npm run check:links
import { existsSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { listFiles, ROOT } from './lib/site.mjs';

const OUT = join(ROOT, 'out');
if (!existsSync(OUT)) {
  console.error('out/ not found: run `npm run build` first.');
  process.exit(1);
}

const pages = listFiles(OUT, (f) => f.endsWith('.html'));
const idCache = new Map();
const broken = [];
let checked = 0;

const decode = (s) =>
  s
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;|&#39;/g, "'");

/** Map a URL path to the exported file, or null. */
function resolveFile(pathname) {
  const p = decodeURIComponent(pathname);
  const candidates = p.endsWith('/') ? [`${p}index.html`] : [p, `${p}/index.html`, `${p}.html`];
  for (const c of candidates) {
    const full = join(OUT, c);
    if (existsSync(full) && statSync(full).isFile()) return full;
  }
  return null;
}

function idsOf(file) {
  if (!idCache.has(file)) {
    const html = readFileSync(file, 'utf8');
    idCache.set(file, new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((m) => decode(m[1]))));
  }
  return idCache.get(file);
}

for (const page of pages) {
  const html = readFileSync(join(OUT, page), 'utf8');
  const pageUrl = `/${page.replace(/index\.html$/, '')}`;
  for (const m of html.matchAll(/\s(href|src)="([^"]*)"/g)) {
    const raw = decode(m[2]);
    if (!raw || /^(https?:|mailto:|data:|javascript:|tel:)/.test(raw) || raw.startsWith('//'))
      continue;
    checked++;
    const url = new URL(raw, `https://site.local${pageUrl}`);
    const target =
      url.pathname === pageUrl && raw.startsWith('#') ? join(OUT, page) : resolveFile(url.pathname);
    if (!target) {
      broken.push(`${pageUrl} -> ${raw} (missing)`);
      continue;
    }
    const anchor = url.hash.slice(1);
    if (anchor && target.endsWith('.html') && !idsOf(target).has(decodeURIComponent(anchor))) {
      broken.push(`${pageUrl} -> ${raw} (missing #${anchor})`);
    }
  }
}

const unique = [...new Set(broken)];
console.log(
  `Checked ${checked} internal links/sources on ${pages.length} pages: ${unique.length} broken.`,
);
for (const b of unique) console.log(`  ${b}`);
process.exit(unique.length ? 1 : 0);
