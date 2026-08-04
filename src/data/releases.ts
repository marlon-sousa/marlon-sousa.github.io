// Fetches the latest GitHub release for each project at build time, so the
// Releases page stays current without being edited by hand.
//
// Every failure mode degrades instead of breaking the build:
//   - network down / rate limited -> falls back to `fallbackVersion` from projects.ts
//   - repo has no releases yet     -> the project is omitted from the page
//
// Set GITHUB_TOKEN in the environment to raise the API rate limit. GitHub
// Actions provides one automatically; locally it is optional.

import { projects, repoUrl, type Project } from './projects';

export interface Release {
	project: Project;
	/** Tag name, e.g. "1.9.0". */
	version: string;
	/** Release notes body, when GitHub provided one. */
	notes?: string;
	publishedAt?: Date;
	/** Link to the release page, or the repo if we only have a fallback version. */
	url: string;
	/** True when the data came from projects.ts rather than the GitHub API. */
	isFallback: boolean;
}

const API_TIMEOUT_MS = 10_000;

async function fetchLatestRelease(project: Project): Promise<Release | null> {
	const headers: Record<string, string> = {
		Accept: 'application/vnd.github+json',
		'User-Agent': 'marlon-sousa.github.io-build',
	};
	if (process.env.GITHUB_TOKEN) {
		headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
	}

	try {
		const response = await fetch(
			`https://api.github.com/repos/marlon-sousa/${project.repo}/releases/latest`,
			{ headers, signal: AbortSignal.timeout(API_TIMEOUT_MS) },
		);

		// 404 means the repo genuinely has no published release yet.
		if (response.status === 404) return null;
		if (!response.ok) throw new Error(`GitHub API returned ${response.status}`);

		const data = await response.json();
		return {
			project,
			version: data.tag_name,
			notes: data.body?.trim() || undefined,
			publishedAt: data.published_at ? new Date(data.published_at) : undefined,
			url: data.html_url,
			isFallback: false,
		};
	} catch (error) {
		console.warn(
			`[releases] Could not fetch latest release for ${project.repo}: ${
				error instanceof Error ? error.message : error
			}`,
		);
		if (!project.fallbackVersion) return null;
		return {
			project,
			version: project.fallbackVersion,
			url: `${repoUrl(project)}/releases/tag/${project.fallbackVersion}`,
			isFallback: true,
		};
	}
}

export async function getLatestReleases(): Promise<Release[]> {
	const results = await Promise.all(projects.map(fetchLatestRelease));
	return results.filter((release): release is Release => release !== null);
}
