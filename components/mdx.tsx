import { Accordion, Accordions } from 'fumadocs-ui/components/accordion';
import defaultMdxComponents from 'fumadocs-ui/mdx';
import type { MDXComponents } from 'mdx/types';
import { headings } from '@/components/mdx/heading';
import { Icon } from '@/components/mdx/icon';
import { NotebookDownload } from '@/components/mdx/notebook-download';
import { Tweet } from '@/components/mdx/tweet';

export function getMDXComponents(components?: MDXComponents) {
  return {
    ...defaultMdxComponents,
    ...headings,
    Accordion,
    Accordions,
    Icon,
    NotebookDownload,
    Tweet,
    ...components,
  } satisfies MDXComponents;
}

export const useMDXComponents = getMDXComponents;

declare global {
  type MDXProvidedComponents = ReturnType<typeof getMDXComponents>;
}
