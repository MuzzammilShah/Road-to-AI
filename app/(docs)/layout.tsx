import { DocsLayout } from 'fumadocs-ui/layouts/spacious';
import { CollapsedSidebarControls } from '@/components/collapsed-sidebar-controls';
import { baseOptions } from '@/lib/layout.shared';
import { source } from '@/lib/source';

// "Spacious" layout (as on fumadocs.dev): sidebar flush left with the section dropdown, the page in
// a rounded panel. For section tabs in a top navbar instead, switch both imports (here and in
// [...slug]/page.tsx) back to `fumadocs-ui/layouts/docs` and pass `tabMode="top"`.
export default function Layout({ children }: LayoutProps<'/'>) {
  return (
    <DocsLayout
      tree={source.getPageTree()}
      {...baseOptions()}
      // The section dropdown (root folders) replaces the navbar section links here.
      links={[]}
    >
      {children}
      {/* Classic-layout pill (open sidebar + search) while the sidebar is collapsed. */}
      <CollapsedSidebarControls />
    </DocsLayout>
  );
}
