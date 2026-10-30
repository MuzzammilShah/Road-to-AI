import { createFromSource } from 'fumadocs-core/search/server';
import { source } from '@/lib/source';

// Prerendered to `out/api/search.json` (static export requires force-static route handlers).
// The .json extension lets static hosts serve it as compressible application/json.
export const dynamic = 'force-static';
export const revalidate = false;

export const { staticGET: GET } = createFromSource(source, {
  // https://docs.orama.com/docs/orama-js/supported-languages
  language: 'english',
});
