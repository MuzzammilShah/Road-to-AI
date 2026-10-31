import { fetchRepositoryInfo, type RepositoryInfo } from 'fumadocs-ui/components/github-info';
import { GitFork, Star } from 'lucide-react';

/**
 * Card linking to a GitHub repository, with stars and forks fetched at build time. Unlike Fumadocs'
 * `GithubInfo`, a failed or rate-limited GitHub API call never fails the build: the card is then
 * rendered without the counts. Uses `GITHUB_TOKEN` when it is set.
 */
export async function GithubRepo({
  owner,
  repo,
  description,
}: {
  owner: string;
  repo: string;
  description?: string;
}) {
  let info: RepositoryInfo | undefined;
  try {
    info = await fetchRepositoryInfo({
      owner,
      repo,
      token: process.env.GITHUB_TOKEN,
      fetchOptions: { cache: 'force-cache' },
    });
  } catch (error) {
    console.warn(`GithubRepo: no stars/forks for ${owner}/${repo}: ${error}`);
  }

  return (
    <a
      href={`https://github.com/${owner}/${repo}`}
      rel="noreferrer noopener"
      target="_blank"
      className="not-prose my-6 flex items-center gap-4 rounded-xl border bg-fd-card p-4 text-fd-card-foreground transition-colors hover:bg-fd-accent/80"
    >
      <svg fill="currentColor" viewBox="0 0 24 24" className="size-8 shrink-0" aria-hidden>
        <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
      </svg>
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium">
          {owner}/{repo}
        </p>
        {description && <p className="text-sm text-fd-muted-foreground">{description}</p>}
      </div>
      {info && (
        <div className="flex shrink-0 items-center gap-1 text-xs text-fd-muted-foreground">
          <Star className="size-3.5" aria-label="Stars" />
          <span>{info.stars}</span>
          <GitFork className="ms-2 size-3.5" aria-label="Forks" />
          <span>{info.forks}</span>
        </div>
      )}
    </a>
  );
}
