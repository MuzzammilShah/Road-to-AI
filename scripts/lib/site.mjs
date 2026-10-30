// Shared paths and URL helpers for the notebook converter and the checks.
import { existsSync, mkdirSync, readdirSync, rmSync, statSync } from 'node:fs';
import { dirname, join, posix } from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
/** Executed Jupyter notebooks (read-only), with the same relative paths as their pages. */
export const NOTEBOOKS_DIR = join(ROOT, 'notebooks');
/** Notebook path (relative to notebooks/) -> page title. */
export const NOTEBOOK_TITLES = join(NOTEBOOKS_DIR, 'titles.json');
/** TODO(cleanup): only check-parity still reads the old nav; removed in the next step. */
export const MKDOCS_YML = join(ROOT, 'mkdocs.yml');
export const CONTENT_DIR = join(ROOT, 'content', 'docs');
export const PUBLIC_DIR = join(ROOT, 'public');

/**
 * Directory URL of a source path (relative to notebooks/ or content/docs/):
 * `a/index.md` -> `/a/`, `a/b.md` -> `/a/b/`, `a/nb.ipynb` -> `/a/nb/`.
 */
export function sourceToUrl(rel) {
  const noExt = rel.replace(/\.(md|ipynb)$/, '');
  const path = noExt === 'index' ? '' : noExt.replace(/\/index$/, '');
  return path ? `/${path}/` : '/';
}

/** Path without extension, used for generated file names. */
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

/** Fail unless `public/<rel>` exists (rel like `assets/images/x.png`). */
export function assertAsset(rel) {
  if (!existsSync(join(PUBLIC_DIR, rel))) {
    throw new Error(`Referenced asset is missing: public/${rel}`);
  }
}

export function removeDir(dir) {
  rmSync(dir, { recursive: true, force: true });
}
