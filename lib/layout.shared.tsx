import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';
import { BookOpen, Brain, GraduationCap, Hammer } from 'lucide-react';
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
      { text: 'Neural Networks', url: '/NeuralNetworks/', icon: <Brain />, active: 'nested-url' },
      { text: 'Library', url: '/Library/', icon: <BookOpen />, active: 'nested-url' },
      {
        text: 'Academy',
        url: '/Academy/',
        icon: <GraduationCap />,
        active: 'nested-url',
      },
      { text: 'Workshop', url: '/Workshop/', icon: <Hammer />, active: 'nested-url' },
    ],
  };
}
