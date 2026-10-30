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

// Docs are served from the site root (`/ZeroToHero/...`, `/Books/...`) to keep the old MkDocs URLs.
// See https://fumadocs.dev/docs/headless/source-api for more info
export const source = loader({
  baseUrl: docsRoute,
  source: docs.toFumadocsSource(),
  icon: resolveIcon,
  plugins: [],
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
