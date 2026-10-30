// Reads the `nav:` tree from mkdocs.yml (no YAML dependency: the nav block is a simple
// indentation-based list of `- Label: path` and `- Label:` group entries).
import { readFileSync } from 'node:fs';

/**
 * @typedef {{ label: string, path?: string, children: NavNode[] }} NavNode
 */

/** @returns {NavNode[]} */
export function readNav(mkdocsYmlPath) {
  const lines = readFileSync(mkdocsYmlPath, 'utf8').split(/\r?\n/);
  const start = lines.findIndex((l) => /^nav:\s*$/.test(l));
  if (start === -1) throw new Error('mkdocs.yml has no nav block');

  /** @type {NavNode} */
  const root = { label: '', children: [] };
  /** @type {{ indent: number, node: NavNode }[]} */
  const stack = [{ indent: -1, node: root }];

  for (let i = start + 1; i < lines.length; i++) {
    const line = lines[i];
    if (/^\S/.test(line)) break; // next top-level key
    if (!line.trim() || line.trim().startsWith('#')) continue;

    const m = /^(\s*)- (.+?):\s*(\S.*)?$/.exec(line);
    if (!m) throw new Error(`Unrecognised nav line ${i + 1}: ${line}`);
    const indent = m[1].length;
    const label = m[2].trim();
    const path = m[3]?.trim();

    while (stack.at(-1).indent >= indent) stack.pop();
    /** @type {NavNode} */
    const node = path ? { label, path, children: [] } : { label, children: [] };
    stack.at(-1).node.children.push(node);
    if (!path) stack.push({ indent, node });
  }
  return root.children;
}

/** Map of source path (relative to docs/) -> nav label. */
export function navLabels(nav) {
  const labels = new Map();
  const walk = (nodes) => {
    for (const n of nodes) {
      if (n.path) labels.set(n.path, n.label);
      walk(n.children);
    }
  };
  walk(nav);
  return labels;
}
