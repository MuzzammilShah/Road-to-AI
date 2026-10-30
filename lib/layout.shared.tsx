import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';
import { BookOpen, Brain } from 'lucide-react';
import Image from 'next/image';
import { appName, githubUrl } from './shared';

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      // JSX supported
      title: (
        <>
          <Image
            src="/assets/images/docs-logo.png"
            alt=""
            width={24}
            height={24}
            className="size-6"
          />
          <span className="font-semibold">{appName}</span>
        </>
      ),
      url: '/',
    },
    githubUrl,
    // Add more navbar links here.
    links: [
      { text: 'Neural Networks', url: '/ZeroToHero/', icon: <Brain />, active: 'nested-url' },
      { text: 'Library', url: '/Books/', icon: <BookOpen />, active: 'nested-url' },
    ],
  };
}
