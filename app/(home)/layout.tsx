import { HomeLayout } from 'fumadocs-ui/layouts/home';
import { GeistPixelSquare } from 'geist/font/pixel/square';
import { JetBrains_Mono } from 'next/font/google';
import { baseOptions } from '@/lib/layout.shared';

// The landing's machine voice (speech bubble, mechanism readouts): Geist Pixel's square pixels, from
// Vercel's `geist` package (OFL) as a local font. Loaded from Google Fonts instead, Turbopack warns
// that it has no fallback metrics for it on every build.
const pixel = GeistPixelSquare;

// Code on the landing (commands, the CRT terminal's glyph atlas).
const mono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
});

export default function Layout({ children }: LayoutProps<'/'>) {
  const options = baseOptions();
  return (
    // The landing tokens (`--lp-*`, app/global.css) and its fonts live on `.landing-surface`, so
    // they only apply here. Transparent navbar while it sits on top of the hero.
    <HomeLayout
      {...options}
      nav={{ ...options.nav, transparentMode: 'top' }}
      className={`landing-surface overflow-x-clip selection:bg-lp-yellow selection:text-lp-on-yellow ${pixel.variable} ${mono.variable}`}
    >
      {children}
    </HomeLayout>
  );
}
