// Fills a code block from a tagged commit in another repository, instead of from
// whatever was pasted into the article.
//
// The Rust series builds a real program one part at a time, and every part ends
// at a git tag. A snippet copied into the prose by hand is a snippet that can
// drift from the code it claims to show, and nothing would ever say so. So a
// fence names where its code lives, and is left empty:
//
//     ```rust include="postres@part-04:src/lib.rs#modules"
//     ```
//
// and this plugin fills it at build time with the region of `src/lib.rs`, at tag
// `part-04`, that sits between two anchor comments:
//
//     // ANCHOR: modules
//     ...
//     // ANCHOR_END: modules
//
// That is mdBook's convention, which Rust readers already know, and it works in
// any comment syntax because only the words are looked for. The anchor lines
// themselves are dropped, and so is any other anchor line nested in the region.
//
// A region of a tagged commit whose CI passed is a snippet that compiles by
// construction — which is the reason for all of this. Everything that could make
// the snippet a guess fails the build instead: a repository that is not on disk,
// a ref that does not exist, a file or an anchor that is not there.
//
// Under the block goes one line naming the file, the ref and the lines, linked to
// exactly those lines on GitHub. The article is still meant to be complete
// without it; the link is for running, not for understanding.
//
// While an article is a draft it may point at a working branch, because the code
// is written first and the tag is only created when the article is published. A
// published article may only point at a `part-NN` tag: a branch moves, and a
// snippet that moves after publication is exactly what this plugin exists to
// prevent.

import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

/**
 * Repositories an article may include from. The directory defaults to a sibling
 * of this one, which is where they are cloned for local work; the deploy workflow
 * checks them out elsewhere and says so through the environment variable.
 *
 * Kept in step by hand with src/data/code.ts, which renders the "code at the end
 * of this part" link: this file runs inside the Markdown pipeline, before
 * anything in src/ has been compiled, and cannot import it.
 */
const REPOS = {
	postres: {
		env: 'CODE_REPO_POSTRES',
		url: 'https://github.com/marlon-sousa/postres',
	},
};

/** The only kind of ref a published article may quote from. */
const PUBLISHED_REF = /^part-\d{2}$/;

const INCLUDE = /(?:^|\s)include="([^"]+)"/;
const SPEC = /^([a-z0-9-]+)@([^:]+):([^#]+)#(.+)$/;

/** Parses `repo@ref:path#anchor`, or explains what it expected. */
function parseSpec(spec, where) {
	const match = SPEC.exec(spec);
	if (!match) {
		throw new Error(
			`${where}: include="${spec}" is not of the form "repo@ref:path#anchor", ` +
				`for example include="postres@part-04:src/lib.rs#modules".`,
		);
	}
	const [, repo, ref, path, anchor] = match;
	return { repo, ref, path, anchor };
}

function repoDir(name, where) {
	const repo = REPOS[name];
	if (!repo) {
		throw new Error(
			`${where}: no repository called "${name}" is known. Known: ${Object.keys(REPOS).join(', ')}.`,
		);
	}
	const dir = process.env[repo.env] || resolve(process.cwd(), '..', name);
	if (!existsSync(dir)) {
		throw new Error(
			`${where}: the ${name} repository is not at ${dir}. Clone it there, or point ${repo.env} at it.`,
		);
	}
	return dir;
}

function show(dir, ref, path, where) {
	try {
		return execFileSync('git', ['-C', dir, 'show', `${ref}:${path}`], {
			encoding: 'utf8',
			stdio: ['ignore', 'pipe', 'pipe'],
		});
	} catch (error) {
		const detail = String(error.stderr ?? error.message).trim();
		throw new Error(`${where}: cannot read ${path} at ${ref} in ${dir}. git says: ${detail}`);
	}
}

const ANCHOR_LINE = /\bANCHOR(?:_END)?:\s*[\w-]+/;

/**
 * The lines between `ANCHOR: name` and `ANCHOR_END: name`, with their 1-based
 * line numbers in the file, other anchor lines removed and the common indent
 * taken off.
 */
function region(source, anchor, where) {
	const lines = source.replace(/\r\n/g, '\n').split('\n');
	// A comment syntax that has to be closed — `<!-- … -->` in Markdown, `/* … */`
	// in CSS — leaves its closer after the name, so that is allowed too.
	const closer = String.raw`\s*(?:-->|\*/)?\s*$`;
	const opens = new RegExp(`\\bANCHOR:\\s*${anchor}${closer}`);
	const closes = new RegExp(`\\bANCHOR_END:\\s*${anchor}${closer}`);

	const start = lines.findIndex((line) => opens.test(line));
	if (start === -1) throw new Error(`${where}: there is no "ANCHOR: ${anchor}".`);
	const end = lines.findIndex((line, index) => index > start && closes.test(line));
	if (end === -1) throw new Error(`${where}: "ANCHOR: ${anchor}" is never closed.`);

	const kept = [];
	for (let index = start + 1; index < end; index++) {
		if (!ANCHOR_LINE.test(lines[index])) kept.push({ number: index + 1, text: lines[index] });
	}
	if (kept.every((line) => line.text.trim() === '')) {
		throw new Error(`${where}: the region "${anchor}" is empty.`);
	}

	const indent = Math.min(
		...kept.filter((line) => line.text.trim() !== '').map((line) => /^\s*/.exec(line.text)[0].length),
	);
	return {
		code: kept.map((line) => line.text.slice(indent)).join('\n'),
		first: kept[0].number,
		last: kept[kept.length - 1].number,
	};
}

/**
 * Whether the article is a draft. Read from the frontmatter Astro hands to the
 * pipeline when it is there, and from the file itself when it is not, so that the
 * rule about published refs cannot be skipped by a change in how that is passed.
 */
function isDraft(file) {
	const frontmatter = file.data?.astro?.frontmatter;
	if (frontmatter && 'draft' in frontmatter) return frontmatter.draft === true;
	const text = String(file.value ?? '');
	return /^draft:\s*true\s*$/m.test(text);
}

export default function remarkCodeInclude() {
	return function transform(tree, file) {
		const article = file.path ?? 'an article';
		const draft = isDraft(file);

		const walk = (node) => {
			const children = node.children;
			if (!Array.isArray(children)) return;
			for (let index = 0; index < children.length; index++) {
				const child = children[index];
				const spec = child.type === 'code' ? INCLUDE.exec(child.meta ?? '')?.[1] : undefined;
				if (!spec) {
					walk(child);
					continue;
				}

				const where = `${article}, include="${spec}"`;
				if (child.value.trim() !== '') {
					throw new Error(`${where}: a block that includes its code must be left empty.`);
				}

				const { repo, ref, path, anchor } = parseSpec(spec, where);
				if (!draft && !PUBLISHED_REF.test(ref)) {
					throw new Error(
						`${where}: a published article may only quote a part-NN tag, and "${ref}" is not ` +
							`one. Create the tag and point the include at it before setting draft: false.`,
					);
				}

				const { code, first, last } = region(show(repoDir(repo, where), ref, path, where), anchor, where);
				child.value = code;
				child.meta = (child.meta ?? '').replace(INCLUDE, '').trim() || null;

				const lineAnchor = first === last ? `L${first}` : `L${first}-L${last}`;
				const url = `${REPOS[repo].url}/blob/${ref}/${path}#${lineAnchor}`;
				const lines = first === last ? `line ${first}` : `lines ${first} to ${last}`;
				children.splice(index + 1, 0, {
					type: 'paragraph',
					data: { hProperties: { className: ['code-source'] } },
					children: [
						{
							type: 'link',
							url,
							children: [{ type: 'text', value: `${path} at ${ref}, ${lines}` }],
						},
					],
				});
				index++;
			}
		};

		walk(tree);
	};
}
