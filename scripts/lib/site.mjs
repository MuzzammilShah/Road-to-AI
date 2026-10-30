// Shared paths and URL helpers for the conversion scripts.
import { copyFileSync, existsSync, mkdirSync, readdirSync, rmSync, statSync } from 'node:fs';
import { dirname, join, posix } from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
/** MkDocs source (read-only). */
export const DOCS_DIR = join(ROOT, 'docs');
export const MKDOCS_YML = join(ROOT, 'mkdocs.yml');
export const CONTENT_DIR = join(ROOT, 'content', 'docs');
export const PUBLIC_DIR = join(ROOT, 'public');

/** Images that are used by the app itself rather than by a page. */
export const APP_ASSETS = [
  'assets/images/docs-logo.png',
  'assets/images/white-bg-logo.png',
  'assets/images/black-bg-logo.png',
  'assets/images/icons/apple-touch-icon.png',
  'assets/images/icons/icon-192.png',
  'assets/images/icons/icon-512.png',
];

/**
 * MkDocs directory URL of a source file (relative to docs/):
 * `a/index.md` -> `/a/`, `a/b.md` -> `/a/b/`, `a/nb.ipynb` -> `/a/nb/`.
 */
export function sourceToUrl(rel) {
  const noExt = rel.replace(/\.(md|ipynb)$/, '');
  const path = noExt === 'index' ? '' : noExt.replace(/\/index$/, '');
  return path ? `/${path}/` : '/';
}

/** Path (relative to docs/) without extension, used for generated file names. */
export function sourceStem(rel) {
  return rel.replace(/\.(md|ipynb)$/, '');
}

/** Generated MDX file for a source file. */
export function sourceToContentFile(rel) {
  return join(CONTENT_DIR, `${sourceStem(rel)}.mdx`);
}

/** Recursively list files (relative, posix separators) under `dir`. */
export function listFiles(dir, filter = () => true, base = dir) {
  if (!existsSync(dir)) return [];
  const out = [];
  for (const name of readdirSync(dir).sort()) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) out.push(...listFiles(full, filter, base));
    else {
      const rel = posix.normalize(
        full
          .slice(base.length + 1)
          .split('\\')
          .join('/'),
      );
      if (filter(rel)) out.push(rel);
    }
  }
  return out;
}

export function ensureDir(file) {
  mkdirSync(dirname(file), { recursive: true });
}

/** Copy `docs/<rel>` to `public/<rel>` (rel like `assets/images/x.png`). */
export function copyAsset(rel) {
  const from = join(DOCS_DIR, rel);
  if (!existsSync(from)) throw new Error(`Referenced asset is missing: docs/${rel}`);
  const to = join(PUBLIC_DIR, rel);
  ensureDir(to);
  copyFileSync(from, to);
}

export function removeDir(dir) {
  rmSync(dir, { recursive: true, force: true });
}
