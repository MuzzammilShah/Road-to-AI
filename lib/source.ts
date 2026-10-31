import { loader } from 'fumadocs-core/source';
import { metaSchema, pageSchema } from 'fumadocs-core/source/schema';
import { applyMdxPreset } from 'fumadocs-mdx/config';
import { defineDocs } from 'fumadocs-mdx/macro';
import { z } from 'zod';
import { resolveIcon } from './sections';
import { docsRoute } from './shared';

const docs = defineDocs({
  dir: 'content/docs',
  docs: {
    schema: pageSchema.extend({
      // `hideToc: true` hides the table of contents (MkDocs `hide: [toc]`).
      hideToc: z.boolean().default(false),
      // Shorter label for the sidebar (and breadcrumbs) when the page title is longer, e.g. the
      // group overviews: title "AI Engineering – Overview", sidebar "Overview".
      sidebarTitle: z.string().optional(),
    }),
    mdxOptions: applyMdxPreset({
      remarkImageOptions: {
        // Keep images at their public URLs (/assets/images/..., /notebook-outputs/...) instead of
        // bundling them; sizes are still read from the files in public/.
        useImport: false,
        // Never fetch remote images at build time (builds stay offline and deterministic).
        external: false,
      },
    }),
  },
  meta: {
    schema: metaSchema,
  },
});

// Docs are served from the site root (`/NeuralNetworks/...`, `/Books/...`), as on the old MkDocs site.
// See https://fumadocs.dev/docs/headless/source-api for more info
export const source = loader({
  baseUrl: docsRoute,
  source: docs.toFumadocsSource(),
  icon: resolveIcon,
  plugins: [
    {
      name: 'sidebar-title',
      transformPageTree: {
        file(node, filePath) {
          const file = filePath ? this.storage.read(filePath) : undefined;
          const sidebarTitle =
            file?.format === 'page'
              ? (file.data as { sidebarTitle?: string }).sidebarTitle
              : undefined;
          return sidebarTitle ? { ...node, name: sidebarTitle } : node;
        },
      },
    },
  ],
});

type Page = ReturnType<typeof source.getPages>[number];
type Node = ReturnType<typeof source.getPageTree>['children'][number];

/**
 * Title for <title>: several pages share a nav label ("Lecture Notes", "Jupyter Notebook"), so those
 * get their sidebar context, e.g. "Lecture Notes (Set A) · Language Model-1".
 */
export function getDocumentTitle(page: Page): string {
  const title = page.data.title;
  const shared = source.getPages().filter((p) => p.data.title === title).length > 1;
  if (!shared) return title;

  const find = (nodes: Node[], folder?: string): string | undefined => {
    let separator: string | undefined;
    for (const node of nodes) {
      if (node.type === 'separator')
        separator = typeof node.name === 'string' ? node.name : undefined;
      else if (node.type === 'page' && node.url === page.url) {
        return [title, separator && `(${separator})`, folder && `· ${folder}`]
          .filter(Boolean)
          .join(' ');
      } else if (node.type === 'folder') {
        const name = typeof node.name === 'string' ? node.name : undefined;
        const found = find(node.index ? [node.index, ...node.children] : node.children, name);
        if (found) return found;
      }
    }
  };
  return find(source.getPageTree().children) ?? title;
}
