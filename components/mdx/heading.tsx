import { Heading } from 'fumadocs-ui/components/heading';
import { Children, type ComponentProps, isValidElement, type ReactNode } from 'react';

type HeadingTag = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';

function containsLink(node: ReactNode): boolean {
  return Children.toArray(node).some((child) => {
    if (!isValidElement<{ href?: string; children?: ReactNode }>(child)) return false;
    return child.props.href !== undefined || containsLink(child.props.children);
  });
}

/**
 * Fumadocs wraps heading text in `<a href="#id">`. Headings that contain their own link (the
 * "Timestamp: [00:12:59](youtube...)" headings) would nest `<a>` in `<a>`, so they keep their id
 * (TOC, anchors) but skip the self-link wrapper.
 */
export function MdxHeading({ as: Tag, ...props }: ComponentProps<HeadingTag> & { as: HeadingTag }) {
  if (!containsLink(props.children)) return <Heading as={Tag} {...props} />;
  return <Tag {...props} className={['scroll-m-28', props.className].filter(Boolean).join(' ')} />;
}

export const headings = {
  h1: (props: ComponentProps<'h1'>) => <MdxHeading as="h1" {...props} />,
  h2: (props: ComponentProps<'h2'>) => <MdxHeading as="h2" {...props} />,
  h3: (props: ComponentProps<'h3'>) => <MdxHeading as="h3" {...props} />,
  h4: (props: ComponentProps<'h4'>) => <MdxHeading as="h4" {...props} />,
  h5: (props: ComponentProps<'h5'>) => <MdxHeading as="h5" {...props} />,
  h6: (props: ComponentProps<'h6'>) => <MdxHeading as="h6" {...props} />,
};
