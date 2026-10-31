import Link from 'fumadocs-core/link';
import { CalendarDays } from 'lucide-react';
import Image from 'next/image';
import type { ReactNode } from 'react';

/** Grid for `CourseCard`s on a section's overview page (Academy). */
export function CourseCards({ children }: { children: ReactNode }) {
  return <div className="not-prose grid gap-4 sm:grid-cols-2">{children}</div>;
}

type CourseCardProps = {
  /** Course page; leave out while the course has no notes yet (the card is then not a link). */
  href?: string;
  title: string;
  /** One line under the title. */
  description: string;
  /** Landscape (16:9) image under public/, e.g. /assets/images/academy/<course>/thumbnail.jpg. */
  thumbnail: string;
  /** When the course was taken, e.g. "Oct 28 – Nov 5, 2025". */
  duration: string;
  /** Course provider; used as the logo's alt text. */
  provider: string;
  /**
   * Provider logo under public/assets/images/academy/providers/, trimmed to its content (no empty
   * margins) so every logo shows at the same height.
   */
  providerLogo: string;
  /** Variant for dark mode, for logos that disappear on a dark background (e.g. black text). */
  providerLogoDark?: string;
};

// Logos keep their aspect ratio within a height cap and, on desktop, a width cap: compact logos
// (Udemy) reach the full height, very wide ones (DeepLearning.AI) stop at the width cap so they
// don't look heavier. `!` beats the global `.prose img` rule, which applies inside not-prose too.
const logoClass = 'h-auto! w-auto! max-h-4 max-w-full! sm:max-h-5 sm:max-w-32!';

/** Course card: thumbnail, title, one-liner, then the dates and the provider's logo. */
export function CourseCard({
  href,
  title,
  description,
  thumbnail,
  duration,
  provider,
  providerLogo,
  providerLogoDark,
}: CourseCardProps) {
  const content = (
    <>
      <div className="relative aspect-video overflow-hidden border-b bg-fd-muted">
        <Image
          src={thumbnail}
          alt=""
          fill
          sizes="(min-width: 640px) 50vw, 100vw"
          className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
        />
      </div>
      <div className="flex flex-1 flex-col gap-1 p-4">
        <h3 className="font-semibold">{title}</h3>
        <p className="text-sm text-fd-muted-foreground">{description}</p>
        <div className="mt-auto flex flex-col items-start gap-3 pt-4">
          <span className="inline-flex items-center gap-1.5 text-xs text-fd-muted-foreground">
            <CalendarDays className="size-3.5 shrink-0" aria-hidden />
            {duration}
          </span>
          {/* width/height only reserve space; the logo keeps its own aspect ratio. */}
          <Image
            src={providerLogo}
            alt={provider}
            width={80}
            height={20}
            className={providerLogoDark ? `${logoClass} dark:hidden` : logoClass}
          />
          {providerLogoDark && (
            <Image
              src={providerLogoDark}
              alt={provider}
              width={80}
              height={20}
              className={`${logoClass} hidden dark:block`}
            />
          )}
        </div>
      </div>
    </>
  );

  const className =
    'group flex flex-col overflow-hidden rounded-xl border bg-fd-card text-fd-card-foreground';
  if (!href) return <div className={className}>{content}</div>;
  return (
    <Link
      href={href}
      className={`${className} transition-colors hover:bg-fd-accent/80 focus-visible:outline-2 focus-visible:outline-fd-primary`}
    >
      {content}
    </Link>
  );
}
