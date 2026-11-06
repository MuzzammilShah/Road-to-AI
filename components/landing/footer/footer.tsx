import { ArrowUpRight } from 'lucide-react';
import { Copyright } from '@/components/site-footer';
import { blogUrl, githubUrl, websiteUrl } from '@/lib/shared';
import { GithubIcon } from '../ui/github-icon';
import { Wordmark } from './wordmark';

const link =
  'inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm text-fd-muted-foreground transition-colors hover:bg-fd-accent hover:text-fd-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fd-ring [&_svg]:size-4';

/** The landing's footer: the falling-glyph wordmark, then the GitHub, website and blog links and
 * the copyright. */
export function LandingFooter() {
  return (
    <footer className="mt-auto border-t border-lp-line">
      <div className="mx-auto w-full max-w-(--fd-layout-width) px-4 pt-10 pb-6">
        <Wordmark />
        <div className="mt-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <nav aria-label="Footer">
            <ul className="-mx-2.5 flex flex-wrap gap-x-1 gap-y-1">
              <li>
                <a href={githubUrl} className={link}>
                  <GithubIcon />
                  GitHub
                </a>
              </li>
              <li>
                <a href={websiteUrl} className={link}>
                  Website
                  <ArrowUpRight aria-hidden />
                </a>
              </li>
              <li>
                <a href={blogUrl} className={link}>
                  Blog
                  <ArrowUpRight aria-hidden />
                </a>
              </li>
            </ul>
          </nav>
          <Copyright />
        </div>
      </div>
    </footer>
  );
}
