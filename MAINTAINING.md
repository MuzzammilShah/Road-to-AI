# Maintaining Road to AI

How to change the site: add pages, notebooks and sections, preview, publish and roll back.

Every recipe below was tested end to end (build + all checks) before it was written down.

- Agents: also read `CLAUDE.md`, which has the code map and the hard rules.
- History of the MkDocs → Fumadocs move: `archive/`.

## Contents

1. [Setup (once per machine)](#1-setup-once-per-machine)
2. [The everyday workflow](#2-the-everyday-workflow)
3. [Where things live](#3-where-things-live)
4. [Add a page](#4-add-a-page)
5. [Add a sub-folder (a group in the sidebar)](#5-add-a-sub-folder-a-group-in-the-sidebar)
6. [Add a notebook](#6-add-a-notebook)
7. [Add a section (a new category)](#7-add-a-section-a-new-category)
8. [Writing MDX: cheat sheet](#8-writing-mdx-cheat-sheet)
9. [Things not to do](#9-things-not-to-do)
10. [Deployment and rollback](#10-deployment-and-rollback)
11. [When a check fails](#11-when-a-check-fails)

## 1. Setup (once per machine)

```bash
cd Road-to-AI
node -v        # needs 22 or newer (.nvmrc says 24)
npm ci         # installs exactly what package-lock.json lists, into node_modules/ only
```

## 2. The everyday workflow

```bash
git switch main && git pull           # start from the live version
git switch -c notes/my-change         # a branch for the change

npm run dev                           # live preview at http://localhost:3000 while you edit
# ... edit files ...

npm run typecheck && npm run lint && npm run build && npm run check:links && npm run check:parity
npx serve out -l 4173                 # optional: browse the exact site that will be deployed

git add -A && git commit -m "Add chapter 7 notes"
git push -u origin notes/my-change
```

Then:
1. Open a pull request to `main` on GitHub.
2. The **"Deploy to GitHub Pages"** check runs the same build and checks (about 1 minute).
3. When it is green, merge.
4. The merge deploys the site automatically (about 1–2 minutes; watch it in the **Actions** tab).

> Pushing straight to `main` also works and deploys too. The checks still run first, so a broken build never goes live. A PR just lets you see the result before it is public.

## 3. Where things live

| What | Where |
|---|---|
| Pages (MDX) | `content/docs/<Section>/…/<name>.mdx` → URL `/<Section>/…/<name>/` |
| Sidebar order and labels | `meta.json` in each folder of `content/docs/` (section order: `content/docs/meta.json`) |
| Notebooks (source) | `notebooks/<Section>/…/<name>.ipynb` (+ title in `notebooks/titles.json`) |
| Images for pages | `public/assets/images/…` → referenced as `/assets/images/…` |
| Section icons and colours | `lib/sections.tsx` + `app/global.css` |
| Navbar links | `lib/layout.shared.tsx` |
| Landing page | `app/(home)/page.tsx` |
| Deploy workflow | `.github/workflows/deploy.yml` |

The four current sections, in dropdown order, are `ZeroToHero/` ("Neural Networks"), `Books/` ("Library"), `Academy/` ("Academy", course notes) and `Workshop/` ("Workshop", software engineering).

## 4. Add a page

Example: a new chapter in the AI Engineering book.

**1. Create `content/docs/Books/AI-Engineering/chapter-7.mdx`:**

```mdx
---
title: "Chapter 7: Finetuning"
description: "Optional one-line summary, shown under the title"
---

## When to finetune

Your notes…
```

The file name becomes the URL: `/Books/AI-Engineering/chapter-7/`. Use lowercase-with-dashes for new files. Case matters in URLs.

**2. Add the file name (without `.mdx`) to the folder's `meta.json`**, where it should appear in the sidebar:

```json
{
  "title": "AI Engineering",
  "pages": ["chapter-1", "chapter-5", "chapter-6-a", "chapter-6-b", "chapter-7"]
}
```

**3. Check it:** `npm run dev`, open the page, then run the checks. `check:parity` fails if a page exists but isn't listed in `meta.json`, or the other way round.

**Front matter options:**

| Field | Required | Effect |
|---|---|---|
| `title` | yes | sidebar label, page heading, browser tab |
| `description` | no | subtitle under the title, and the page's meta description |
| `hideToc: true` | no | hides the "On this page" table of contents |

## 5. Add a sub-folder (a group in the sidebar)

Example: a second book, `content/docs/Books/Designing-ML-Systems/`.

1. Create the folder with its pages, plus a `meta.json`:
   ```json
   { "title": "Designing ML Systems", "pages": ["chapter-1", "chapter-2"] }
   ```
2. List the folder name in the parent's `meta.json` (`content/docs/Books/meta.json`): `"pages": ["index", "AI-Engineering", "Designing-ML-Systems"]`.
3. To make the folder itself clickable, add an `index.mdx` in it and list `"index"` first in its `pages`. Without one, the folder is a collapsible group.
4. The Books overview (`content/docs/Books/index.mdx`) has a card per book. Add an `href` to the "Designing ML Systems" card once its notes exist.

**A new course in Academy** works the same way: a folder such as `content/docs/Academy/<Course>/` with `index`, `notes/` and `notebooks/` (see `Agentic-AI/`), listed in `content/docs/Academy/meta.json`. Then add a course card to `content/docs/Academy/index.mdx`:

```mdx
<CourseCards>
  <CourseCard
    href="/Academy/<Course>/"
    title="Course name"
    description="One line about the course."
    thumbnail="/assets/images/academy/<course>/thumbnail.jpg"
    duration="Oct 28 – Nov 5, 2025"
    provider="DeepLearning.AI"
    providerLogo="/assets/images/academy/providers/deeplearning-ai.png"
    providerLogoDark="…"   {/* optional, see below */}
  />
</CourseCards>
```

- **Thumbnail:** landscape 16:9 (e.g. 1280×720), saved as JPEG to keep it small. On macOS: `sips -s format jpeg -s formatOptions 80 in.png --out thumbnail.jpg`.
- **Provider logo:** in `public/assets/images/academy/providers/`, reused for every course from the same provider. Crop it to the logo itself (no empty margins) at about 96px tall, so they size consistently: up to 16px tall on mobile, and on desktop up to 20px tall and 128px wide (very wide logos stop at the width cap). If it has black text, also add a white-text `<name>-dark.png` and pass it as `providerLogoDark` (see Udemy).
- **No notes yet:** leave out `href` and the card is shown without a link.
- **Large slide screenshots:** shrink them before committing: `sips -Z 1920 *.png --out <folder>/`.

**More `meta.json` tricks:**
- **Separators:** add an entry like `"---Set 2: Transformers---"` to the `pages` array.
- **Order:** the order of `pages` is the sidebar order.
- **Label:** a folder's label is its `title`; a page's label is its front-matter `title`.

## 6. Add a notebook

Notebooks are never run by the site. It converts their **saved outputs**, so run and save the notebook in Jupyter first.

1. Save it as `notebooks/<Section>/<path>/<name>.ipynb`, for example `notebooks/ZeroToHero/GPT-2/section-3.ipynb`.
2. Add its sidebar title to `notebooks/titles.json`:
   ```json
   "ZeroToHero/GPT-2/section-3.ipynb": "Section 3"
   ```
3. Add `section-3` to `content/docs/ZeroToHero/GPT-2/meta.json`.
4. Run `npm run notebooks`. This creates:
   - `content/docs/…/section-3.mdx` (the page);
   - output images in `public/notebook-outputs/…`;
   - the download copy in `public/notebooks/…`.

   The two "indented code block" warnings about Micrograd 4_2 are expected.
5. Commit **all** the generated files too. The deploy doesn't run the converter, and `check:parity` fails if a notebook changed without re-converting.

**Changing a notebook later:** edit it in Jupyter (or edit only the markdown cell text in the `.ipynb`), then re-run `npm run notebooks`. **Never edit the generated `.mdx`.** It says "Generated from notebooks/…" at the top and would be overwritten.

**Images inside markdown cells** must already exist in `public/` (e.g. `/assets/images/...`), or the converter stops with an error. If an image isn't available (e.g. course material that wasn't downloaded), replace it in the markdown cell with a short italic note, as the Agentic AI notebooks do.

**Rich outputs:**
- `text/html` outputs (styled cards, tables, charts as `data:` images) are saved as standalone pages in `public/notebook-outputs/…/cell-<n>-<k>.html`. They are shown in a sandboxed iframe that sizes itself to the content (`NotebookHtmlOutput`), so their CSS can't affect the site and their scripts never run.
- `text/markdown` outputs are converted like markdown cells, inside a bordered box. Their headings become bold lines, so they don't fill the page's table of contents. Local images they reference were never saved with the notebook, so they become a note.
- Any other output type stops the converter with "unsupported output type".

## 7. Add a section (a new category)

Example: a "Papers" section next to Neural Networks and Library. It shows up in the sidebar's section dropdown with its own icon and accent colour.

**1. Content:** add the folder name to the root `content/docs/meta.json` at the position it should have in the dropdown (`"pages": ["ZeroToHero", "Books", "Academy", "Workshop", "Papers"]`). Then create `content/docs/Papers/meta.json`:

```json
{
  "title": "Papers",
  "description": "Notes on research papers",
  "icon": "ScrollText",
  "root": true,
  "pages": ["index", "---Transformers---", "attention"]
}
```

Then add `content/docs/Papers/index.mdx` (the overview page) and the pages listed, e.g. `attention.mdx`.

- `"root": true` makes it a section.
- `title` and `description` appear in the dropdown.
- `icon` is a [Lucide icon](https://lucide.dev/icons) name in PascalCase.

**2. Icon and accent colour** in `lib/sections.tsx`:

```tsx
import { Brain, LibraryBig, type LucideIcon, ScrollText } from 'lucide-react';

const sectionIcons: Record<string, LucideIcon> = { Brain, LibraryBig, ScrollText };

const sections: Record<string, { accent: string; landing?: string }> = {
  ZeroToHero: { accent: 'var(--section-neural-networks)', landing: 'Zero to Hero: …' },
  Books: { accent: 'var(--section-library)', landing: 'Notes from AI/ML books, …' },
  // key = folder name; `landing` is optional
  Papers: { accent: 'var(--section-papers)', landing: 'Notes on research papers, starting with …' },
};
```

- `accent` colours the docs pages of the section and the glow on its landing card.
- `landing` is the description on the landing card. Without it, the card uses the (shorter) `description` from meta.json.

The build fails with "Unknown icon" if the `meta.json` icon isn't registered here.

**3. Colours** in `app/global.css`, next to the existing `--section-*` lines:

```css
:root {
  /* … */
  --section-papers: oklch(0.55 0.14 25);   /* light mode */
}

.dark {
  /* … */
  --section-papers: oklch(0.78 0.12 25);   /* dark mode: lighter */
}

[data-section-icon="ScrollText"] {
  color: var(--section-papers);
}
```

In `oklch(lightness chroma hue)`, the last number is the hue: 268 is indigo (Neural Networks), 55–70 is amber (Library), 152 is green (Academy), 92–95 is yellow (Workshop), 25 is red. Keep chroma low (around 0.12–0.19) for a subtle accent.

**4. Optional:**
- **Navbar link:** add `{ text: 'Papers', url: '/Papers/', icon: <ScrollText />, active: 'nested-url' }` to `links` in `lib/layout.shared.tsx`.
- **Landing card:** nothing to do. The landing page builds one card per section from the sidebar data (title, icon, link), in dropdown order. Set `landing` in step 2 for a longer description.

## 8. Writing MDX: cheat sheet

MDX is Markdown plus components. Everything normal works: headings, lists, tables, code fences, links, images. (No LaTeX math plugin is set up.)

**Escape these in normal text:** `{` → `\{`, `}` → `\}`, `<` → `\<`. Inside code (backticks or fences) no escaping is needed.

**HTML must be JSX:**
- `className` instead of `class`;
- `style={{ width: '50%' }}` instead of `style="width:50%"`;
- self-close tags: `<img />`, `<br />`.

**Links and images:**
```mdx
[Chapter 1](/Books/AI-Engineering/chapter-1/)          ← absolute, with trailing slash
[a heading on this page](#when-to-finetune)
![Diagram](/assets/images/books-assets/diagram.png)
```

**Heading ids:**
- Headings get automatic ids (`## When to finetune` → `#when-to-finetune`).
- To pin an id so links never break if you reword the heading: `## When to finetune [#finetune]`.
- Existing pages use pinned ids (from the old site). Keep them.

**Components:**

```mdx
<Callout type="info" title="Note">Text</Callout>
{/* type: info | warn | warning | error | success | idea */}

<Accordions>
  <Accordion title="Click to expand">Hidden text</Accordion>
</Accordions>

<Cards>
  <Card title="AI Engineering" href="/Books/AI-Engineering/chapter-1/">Short description</Card>
</Cards>

<Icon name="Sparkle" />   {/* Sparkle, CircleCheckBig, CircleAlert, CornerDownRight, LibraryBig, Bird, Feather, FileText, Network */}

<Tweet url="https://twitter.com/<user>/status/<id>" />

<GithubRepo owner="MuzzammilShah" repo="Agentic-AI" description="Optional one line" />
{/* repo card; stars/forks are fetched at build time and left out if GitHub can't be reached */}

<CourseCards><CourseCard … /></CourseCards>   {/* course cards, see "A new course in Academy" */}
```

`<Icon>` only knows the icons listed above. To use another Lucide icon, import it and add it to the `icons` map in `components/mdx/icon.tsx`.

## 9. Things not to do

- **Don't rename or move published pages or folders.** The URL comes from the path, so old links (and Google) would get a 404. The site is a static export and has no redirects. If you must, ask an agent to add a redirect page for the old URL. `scripts/old-urls.txt` lists the URLs that must always work, and `check:parity` enforces them.
- **Don't edit generated notebook pages.** Edit the notebook and re-run `npm run notebooks`.
- **Don't delete or push to the `gh-pages` branch.** It holds the old MkDocs site and is the emergency rollback.
- **Don't install packages globally** (`npm i -g`, `sudo`, `brew`). Everything is local to the project. New npm packages are pinned to exact versions (`.npmrc` does this) and `package-lock.json` is committed.

## 10. Deployment and rollback

**How it works:**
- **Workflow:** `.github/workflows/deploy.yml` (GitHub Actions).
- **On every pull request to `main`:** install → typecheck → lint → build → check:links → check:parity. Nothing is published.
- **On every push/merge to `main`:** the same steps, then the `out/` folder is published to GitHub Pages.
  - Deploys run one at a time, and a running deploy is never cancelled.
  - Re-publish without a change: Actions → "Deploy to GitHub Pages" → **Run workflow** (branch `main`).
- **Domain:** `docs.muhammedshah.com`, set in Settings → Pages, with HTTPS enforced. `public/CNAME` mirrors it.
- **Allowed branches:** the `github-pages` environment (Settings → Environments) allows deploys from `main` and `gh-pages`.

**Undo a bad change:** revert its commit (on GitHub: the merged PR → **Revert** → merge the revert PR). The previous version deploys again in a couple of minutes.

**Emergency rollback to the old MkDocs site:**
1. Settings → Pages → Source: **Deploy from a branch**, `gh-pages` / `(root)` → Save. The old site is live again in about a minute.
2. Actions → "Deploy to GitHub Pages" → **⋯ → Disable workflow**, so the next push doesn't fail trying to deploy.
3. **To come back:** Source → **GitHub Actions**, enable the workflow, then **Run workflow** on `main`.

## 11. When a check fails

| Check | Typical cause | Fix |
|---|---|---|
| `typecheck` | a TypeScript error in `app/`, `components/` or `lib/` | read the file:line in the message |
| `typecheck` mentions `.next/dev/types` | stale route types after moving a route | `rm -rf .next` and re-run |
| `lint` | formatting or lint issues in code | `npm run format`, then re-run |
| `build` | MDX syntax: an unescaped `{` `}` `<`, HTML attributes not in JSX form, an unknown `<Icon name>` | the error names the file and line |
| `build` "Unknown icon" | a section `icon` not registered | add it to `lib/sections.tsx` (step 7.2) |
| `check:links` | a link to a page or `#anchor` that doesn't exist, or a missing image | fix the link, or add the file under `public/` |
| `check:parity` | a page not listed in `meta.json` (or listed but missing), a notebook without a title or not re-converted, or an old URL gone | add the `meta.json` entry / `titles.json` entry, run `npm run notebooks`, restore the old page |

On GitHub, open the failed check on the PR → the red step shows the same message as locally.
