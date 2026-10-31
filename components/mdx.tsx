import { Accordion, Accordions } from 'fumadocs-ui/components/accordion';
import defaultMdxComponents from 'fumadocs-ui/mdx';
import type { MDXComponents } from 'mdx/types';
import { CourseCard, CourseCards } from '@/components/mdx/course-card';
import { GithubRepo } from '@/components/mdx/github-repo';
import { headings } from '@/components/mdx/heading';
import { Icon } from '@/components/mdx/icon';
import { NotebookDownload } from '@/components/mdx/notebook-download';
import { NotebookHtmlOutput } from '@/components/mdx/notebook-html-output';
import { Tweet } from '@/components/mdx/tweet';

export function getMDXComponents(components?: MDXComponents) {
  return {
    ...defaultMdxComponents,
    ...headings,
    Accordion,
    Accordions,
    CourseCard,
    CourseCards,
    GithubRepo,
    Icon,
    NotebookDownload,
    NotebookHtmlOutput,
    Tweet,
    ...components,
  } satisfies MDXComponents;
}

export const useMDXComponents = getMDXComponents;

declare global {
  type MDXProvidedComponents = ReturnType<typeof getMDXComponents>;
}
