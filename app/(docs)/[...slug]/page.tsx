import { DocsBody, DocsDescription, DocsPage, DocsTitle } from 'fumadocs-ui/layouts/spacious/page';
import { createRelativeLink } from 'fumadocs-ui/mdx';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getMDXComponents } from '@/components/mdx';
import { tocWithoutLinks } from '@/components/mdx/heading';
import { Copyright } from '@/components/site-footer';
import { SectionAccent } from '@/lib/sections';
import { getDocumentTitle, source } from '@/lib/source';

// Required catch-all at the site root: it never matches `/`, which is the landing page.
export const dynamicParams = false;

export default async function Page(props: PageProps<'/[...slug]'>) {
  const params = await props.params;
  const page = source.getPage(params.slug);
  if (!page) notFound();

  const MDX = page.data.body;

  return (
    <DocsPage
      toc={tocWithoutLinks(page.data.toc)}
      full={page.data.full}
      // 'normal' = the classic layout's TOC (thin line with a sliding indicator); spacious defaults
      // to 'block'.
      tableOfContent={{ enabled: !page.data.hideToc, style: 'normal' }}
      tableOfContentPopover={{ enabled: !page.data.hideToc, style: 'normal' }}
    >
      <DocsTitle>{page.data.title}</DocsTitle>
      <DocsDescription>{page.data.description}</DocsDescription>
      <DocsBody>
        <MDX
          components={getMDXComponents({
            // this allows you to link to other pages with relative file paths
            a: createRelativeLink(source, page),
          })}
        />
      </DocsBody>
      <Copyright className="mt-8" />
      <SectionAccent section={page.slugs[0]} />
    </DocsPage>
  );
}

export async function generateStaticParams() {
  // The root folder has no index page, so every page has at least one slug.
  return source.generateParams().filter((params) => params.slug.length > 0);
}

export async function generateMetadata(props: PageProps<'/[...slug]'>): Promise<Metadata> {
  const params = await props.params;
  const page = source.getPage(params.slug);
  if (!page) notFound();

  return {
    title: getDocumentTitle(page),
    description: page.data.description,
  };
}
