import { Card, Cards } from 'fumadocs-ui/components/card';
import { Brain, ChevronDown, GraduationCap, LibraryBig } from 'lucide-react';
import Image from 'next/image';
import { HeroGlobe } from '@/components/home/hero-globe';
import { Copyright } from '@/components/site-footer';
import { appDescription, websiteUrl } from '@/lib/shared';

export default function HomePage() {
  return (
    <>
      {/* Hero: full viewport, the globe also sits behind the transparent navbar (h-14).
          Mobile: the text sits at the bottom left, below the globe; desktop: vertically centred. */}
      <section className="relative isolate -mt-14 flex h-svh min-h-[480px] shrink-0 items-end overflow-hidden md:items-center">
        <HeroGlobe />
        <div className="relative z-10 mb-24 ml-[5%] w-[90%] p-2.5 md:mb-0 md:ml-[10%] md:w-[min(40%,480px)] md:p-5">
          <h1 className="sr-only">Road to AI</h1>
          <Image
            src="/assets/images/white-bg-logo.png"
            alt="Road to AI"
            width={999}
            height={250}
            priority
            className="mb-2.5 h-auto w-full md:w-4/5 dark:hidden"
          />
          <Image
            src="/assets/images/black-bg-logo.png"
            alt="Road to AI"
            width={999}
            height={250}
            priority
            className="mb-2.5 hidden h-auto w-full md:w-4/5 dark:block"
          />
          <p className="text-lg text-fd-foreground md:text-xl">{appDescription}</p>
        </div>
        <a
          href="#intro"
          aria-label="Scroll to content"
          className="absolute bottom-6 left-1/2 z-10 flex size-10 -translate-x-1/2 items-center justify-center rounded-full border bg-fd-background/70 text-fd-muted-foreground backdrop-blur transition-colors hover:text-fd-foreground"
        >
          {/* animate-bounce moves between -25% and 0; translate-y-1/8 centres that range in the circle. */}
          <ChevronDown className="size-5 motion-safe:translate-y-1/8 motion-safe:animate-bounce" />
        </a>
      </section>

      {/* TODO(landing): placeholder content below the hero; replace with the final landing copy. */}
      {/* Fills the screen below the sticky navbar on desktop; content height on mobile. */}
      <section
        id="intro"
        className="mx-auto flex w-full max-w-(--fd-layout-width) scroll-mt-14 flex-col justify-center px-4 py-20 md:min-h-[calc(100svh-3.5rem)]"
      >
        <div className="mx-auto w-full max-w-3xl">
          {/* TODO(landing): intro text */}
          <h2 className="mb-3 text-2xl font-semibold md:text-3xl">What is this?</h2>
          <p className="mb-10 text-fd-muted-foreground">
            My notes, Jupyter notebooks and book notes on AI: from building an autograd engine to
            reproducing GPT-2, plus notes from the books I read and the courses I take.
          </p>

          {/* TODO(landing): section cards */}
          <Cards className="landing-cards">
            <Card
              icon={<Brain data-section-icon="Brain" />}
              title="Neural Networks"
              description="Zero to Hero: Micrograd, Makemore, GPT-1, GPT-2, tokenizers and more."
              href="/ZeroToHero/"
            />
            <Card
              icon={<LibraryBig data-section-icon="LibraryBig" />}
              title="Library"
              description="Notes from AI/ML books, starting with AI Engineering by Chip Huyen."
              href="/Books/"
            />
            <Card
              icon={<GraduationCap data-section-icon="GraduationCap" />}
              title="Academy"
              description="Notes from AI/ML courses, starting with Agentic AI by DeepLearning.AI."
              href="/Academy/"
            />
          </Cards>
        </div>
      </section>

      {/* TODO(landing): footer content */}
      <footer className="mt-auto border-t">
        <div className="mx-auto flex w-full max-w-(--fd-layout-width) flex-col items-center justify-between gap-2 px-4 py-6 sm:flex-row">
          <Copyright />
          <a
            href={websiteUrl}
            className="text-xs text-fd-muted-foreground transition-colors hover:text-fd-foreground"
          >
            Website
          </a>
        </div>
      </footer>
    </>
  );
}
