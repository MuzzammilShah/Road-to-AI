import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import { baseOptions } from '@/lib/layout.shared';
import { source } from '@/lib/source';

export default function Layout({ children }: LayoutProps<'/'>) {
  return (
    <DocsLayout
      tree={source.getPageTree()}
      {...baseOptions()}
      // The section dropdown (root folders) replaces the navbar section links here.
      links={[]}
      // Section switcher: 'auto' = dropdown at the top of the sidebar, 'top' = tabs in the navbar.
      tabMode="auto"
    >
      {children}
    </DocsLayout>
  );
}
