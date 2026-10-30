# Road to AI: docs site

Personal documentation site (notes, Jupyter notebooks, book notes on AI), served at docs.muhammedshah.com.

## Stack

- **Framework:** Next.js 16 (App Router, Turbopack) + Fumadocs (`fumadocs-core`, `fumadocs-ui` as the Base UI build, `fumadocs-mdx` with the macro API in `lib/source.ts`).
- **Styling:** Tailwind CSS 4, the Fumadocs `neutral` preset, the Inter font.
- **Search:** Orama static search. The index is exported to `/api/search.json`.
- **Landing page:** Vanta.js globe on `three@0.134.0`.
- **Tooling:** TypeScript (strict) and Biome (lint + format). npm only.

## Commands

```bash
npm ci                 # install exactly what package-lock.json says
npm run dev            # http://localhost:3000
npm run build          # static export into out/
npx serve out          # preview the export (serve is a local devDependency)
npm run typecheck      # next typegen && tsc --noEmit
npm run lint           # biome check (npm run format to fix formatting)
npm run notebooks      # re-convert docs/**/*.ipynb -> content/docs/**/*.mdx
npm run convert:pages  # re-convert docs/**/*.md -> content/docs/**/*.mdx + meta.json (until cutover)
npm run convert        # both converters
npm run check:links    # after build: every internal href/src/#anchor in out/ must resolve
```

## Hard constraints

- **Local installs only.** No global npm packages, no `sudo`, no `brew`, no edits to shell profiles or `~/.npmrc`.
- **Pin exact versions.** `.npmrc` has `save-exact=true`, so always commit `package-lock.json`. Node version is in `.nvmrc` (24); `engines` is `>=22`.
- **Static export only.** `output: 'export'` (applied to builds only, so `next dev` answers unknown URLs with 404 instead of throwing), `trailingSlash: true`, `images.unoptimized`. That means:
  - no server runtime;
  - no route handlers that need a request;
  - every dynamic route has `generateStaticParams` (+ `dynamicParams = false`);
  - route handlers set `dynamic = 'force-static'`.
- **URL parity with the old MkDocs site.** Docs are served at the site root (`baseUrl: '/'`), and folder and file names, including their case, are the URLs. Never rename content files or folders without adding redirects. `scripts/old-urls.txt` lists the URLs that must keep working.
- **Notebooks are never executed.** The converter only reads the saved outputs.
- **Biome is limited by an allow-list** in `biome.json`. It also formats YAML and Markdown, so keep `docs/`, `mkdocs.yml` and `.github/` out of its scope.
- **Read the versioned docs before using framework APIs:**
  - Next.js docs ship in `node_modules/next/dist/docs/` (see `AGENTS.md`).
  - Fumadocs: https://www.fumadocs.dev/docs, checked against the installed package types.

## Content structure

- **`content/docs/`** holds the docs content, with one root folder per sidebar section. Root folders show up in the section dropdown at the top of the sidebar.
  - `ZeroToHero/` is "Neural Networks". It contains `Micrograd/`, `Makemore-part1..5/`, `GPT-1/`, `GPT-2/`, `GPT-Tokenizer/` and `General-MISC/`.
  - `Books/` is "Library". It contains `AI-Engineering/`.
- **`meta.json`** in each folder controls the sidebar:
  - `title` and `pages` set order and labels;
  - `"---Label---"` adds a separator;
  - listing `"index"` makes the folder's index a child item;
  - `"root": true` marks a section.
- **Page front matter:** `title`, optional `description`, and `hideToc: true` to hide the table of contents.
- **`public/assets/images/`** holds images referenced by pages. `public/notebook-outputs/` holds generated notebook output images. `public/notebooks/` holds the `.ipynb` download copies.
- **App code:**
  - `app/(home)/` is the landing page and `app/(docs)/[...slug]/` the docs pages.
  - `app/api/search.json/` is the search index.
  - `lib/layout.shared.tsx` holds the navbar title and links, which is where to add links.
  - The docs use the Fumadocs **spacious** layout: the sidebar is flush left with the section dropdown, and the page sits in a rounded panel. For navbar tabs instead, switch `fumadocs-ui/layouts/spacious` (+ `/page`) back to `fumadocs-ui/layouts/docs` and pass `tabMode="top"`. Fumadocs' `preset.css` doesn't include the spacious layout's classes, so `app/global.css` imports `fumadocs-ui/css/generated/spacious.css`. Any other layout from `fumadocs-ui/css/generated/` that preset.css doesn't list needs the same import, otherwise its pages render unstyled.
  - Section dropdown entries: `icon` and `description` come from the root `meta.json`, which `convert-pages.mjs` (`ROOT_SECTIONS`) generates until cutover. Icon names resolve in `lib/sections.tsx`. The per-section accent colours (`--section-*`, `body:has([data-section])`) are in `app/global.css`.
- **MDX components** (`components/mdx.tsx`):
  - from Fumadocs: `Callout`, `Cards`/`Card`, `Accordions`/`Accordion`;
  - site-specific: `Icon` (Lucide), `Tweet` (X/Twitter embed), `NotebookDownload`.
- **Escaping in MDX:** `{`, `}` and `<` in prose must be escaped (`\{`, `\}`, `\<`). HTML must be JSX (`className`, `style={{...}}`, self-closing `<img />`).

## How to add a page

1. Create `content/docs/<Section>/<path>/<name>.mdx` with front matter `title:`. The URL becomes `/<Section>/<path>/<name>/`.
2. Add `<name>` to the `pages` array of the folder's `meta.json`, at the position it should appear in the sidebar.
3. Put images in `public/assets/images/...` and reference them as `/assets/images/...`.
4. Run `npm run build && npm run check:links`.

> Until the MkDocs cleanup, pages generated from `docs/*.md` carry a "Generated from docs/…" banner. For those, edit `docs/` and run `npm run convert:pages` instead.

## How to add a notebook

1. Save the executed notebook (outputs included) next to the other notebooks of that topic (currently under `docs/`).
2. Add it to the nav in `mkdocs.yml` until cutover, which is where its sidebar title comes from. After cutover, add it to the folder's `meta.json`.
3. Run `npm run notebooks`. This writes `content/docs/<path>.mdx`, output images to `public/notebook-outputs/<path>/` and a download copy to `public/notebooks/`.
4. Commit the generated files too. The build does not run the converter.

## Verification before calling something done

```bash
npm run typecheck && npm run lint && npm run build && npm run check:links
```

Then `npx serve out` and look at the changed pages in light and dark mode. If `tsc` complains about missing modules under `.next/dev/types` after a route rename, run `rm -rf .next`.
