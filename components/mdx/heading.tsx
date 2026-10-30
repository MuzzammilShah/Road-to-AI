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
function createHeading(as: HeadingTag) {
  return function MdxHeading(props: ComponentProps<HeadingTag>) {
    if (!containsLink(props.children)) return <Heading as={as} {...props} />;
    const Tag = as;
    return (
      <Tag {...props} className={['scroll-m-28', props.className].filter(Boolean).join(' ')} />
    );
  };
}

export const headings = {
  h1: createHeading('h1'),
  h2: createHeading('h2'),
  h3: createHeading('h3'),
  h4: createHeading('h4'),
  h5: createHeading('h5'),
  h6: createHeading('h6'),
};
