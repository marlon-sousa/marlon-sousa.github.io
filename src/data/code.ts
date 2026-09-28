/**
 * Repositories an article's code can live in, and where to see them.
 *
 * An article in the Rust series ends at a git tag, and says so in its
 * frontmatter as `code: 'postres@part-04'`. This turns that into the link a reader
 * follows to check out exactly the code the article describes.
 *
 * Kept in step by hand with REPOS in plugins/remark-code-include.mjs, which reads
 * the snippets from the same tags and cannot import this file.
 */
const REPOS: Record<string, string> = {
	postres: 'https://github.com/marlon-sousa/postres',
};

/** `repo@ref`, as the `code` frontmatter field takes it. */
export const CODE_SPEC = /^([a-z0-9-]+)@([\w./-]+)$/;

export interface CodeRef {
	repo: string;
	ref: string;
	url: string;
}

/** Resolves `repo@ref`, or throws naming what is wrong, so a typo fails the build. */
export function codeRef(spec: string): CodeRef {
	const match = CODE_SPEC.exec(spec);
	const repo = match?.[1];
	const ref = match?.[2];
	const base = repo ? REPOS[repo] : undefined;
	if (!repo || !ref || !base) {
		throw new Error(
			`code: '${spec}' is not a known repository and ref. Expected "repo@ref" with one of: ${Object.keys(REPOS).join(', ')}.`,
		);
	}
	return { repo, ref, url: `${base}/tree/${ref}` };
}
