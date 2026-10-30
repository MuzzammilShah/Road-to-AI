import { HomeLayout } from 'fumadocs-ui/layouts/home';
import { baseOptions } from '@/lib/layout.shared';

export default function Layout({ children }: LayoutProps<'/'>) {
  const options = baseOptions();
  return (
    // Transparent navbar while it sits on top of the globe hero; the whole page uses the globe's
    // background (`.landing-surface`) so the hero and the sections below read as one surface.
    <HomeLayout
      {...options}
      nav={{ ...options.nav, transparentMode: 'top' }}
      className="landing-surface"
    >
      {children}
    </HomeLayout>
  );
}
