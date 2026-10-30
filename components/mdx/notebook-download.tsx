import { Download } from 'lucide-react';

/** "Download notebook" link shown at the top of every converted Jupyter notebook page. */
export function NotebookDownload({ href }: { href: string }) {
  const name = href.split('/').pop();
  return (
    <a
      href={href}
      download={name}
      className="not-prose inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-sm text-fd-muted-foreground transition-colors hover:bg-fd-accent hover:text-fd-accent-foreground"
    >
      <Download className="size-3.5" aria-hidden />
      Download notebook (.ipynb)
    </a>
  );
}
