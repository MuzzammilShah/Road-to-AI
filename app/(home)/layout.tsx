import { HomeLayout } from 'fumadocs-ui/layouts/home';
import { Geist_Pixel, JetBrains_Mono } from 'next/font/google';
import { baseOptions } from '@/lib/layout.shared';

// The landing's machine voice (speech bubble, mechanism readouts): the default square pixels only.
const pixel = Geist_Pixel({
  subsets: ['latin'],
  variable: '--font-geist-pixel',
  // no metrics exist to size a fallback for it
  adjustFontFallback: false,
});

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
