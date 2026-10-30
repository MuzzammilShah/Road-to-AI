'use client';
import { SidebarCollapseTrigger, useSidebar } from 'fumadocs-ui/components/sidebar/base';
import { useSearchContext } from 'fumadocs-ui/contexts/search';
import { SearchIcon, SidebarIcon } from 'lucide-react';

const button =
  'inline-flex items-center justify-center rounded-lg p-1.5 text-fd-muted-foreground transition-colors hover:bg-fd-accent hover:text-fd-accent-foreground [&_svg]:size-4.5';

/**
 * The floating "open sidebar + search" pill of Fumadocs' classic docs layout, shown while the
 * spacious layout's sidebar is collapsed (desktop only; mobile uses the drawer). The spacious
 * layout's own expand button is hidden in app/global.css so there is only one.
 */
export function CollapsedSidebarControls() {
  const { collapsed } = useSidebar();
  const { enabled: searchEnabled, setOpenSearch } = useSearchContext();

  return (
    <div
      data-collapsed-sidebar-controls=""
      inert={!collapsed}
      className={[
        'fixed top-[18px] start-4 z-40 flex gap-0.5 rounded-xl border bg-fd-muted p-0.5 shadow-lg transition-opacity duration-200 max-md:hidden',
        collapsed ? 'opacity-100' : 'pointer-events-none opacity-0',
      ].join(' ')}
    >
      <SidebarCollapseTrigger className={button} aria-label="Open sidebar">
        <SidebarIcon />
      </SidebarCollapseTrigger>
      {searchEnabled && (
        <button
          type="button"
          className={button}
          aria-label="Open search"
          onClick={() => setOpenSearch(true)}
        >
          <SearchIcon />
        </button>
      )}
    </div>
  );
}
