// Resolves `article:` links in prose to the best version for the file's own
// language, and says so when the best available version is not that language.
//
// Prose links between articles are the one place the language layout of the site
// is written by hand. Everything else — the switcher, hreflang, the preference
// redirect — is derived from `translationOf` and therefore cannot point at a page
// that is not there. A link typed into a paragraph can, and it fails in the worst
// direction: a Portuguese reader following a Portuguese sentence into a 404.
//
// So an article is linked by *identity* rather than by URL:
//
//     [O terminal que eu não conseguia construir](article:the-terminal-i-could-not-build)
//
// The id is the English file name, without a directory or an extension — the same
// value `translationOf` takes, and the same identity `src/data/series.ts` uses for
// a series. This plugin turns it into:
//
//   - the translation's URL, when one exists in the file's language;
//   - the English URL otherwise, with the link marked as leading to English.
//
// Authoring by identity is what makes the fallback retroactive. Publishing a
// Portuguese translation of an article rewrites every link that already pointed at
// it, in every language, with nothing to remember and nothing to go back and edit.
//
// A plain `/blog/...` link is left completely alone. That is the point of the
// protocol: a link that should stay in English no matter what — an article quoted
// as a record, say — is written as an ordinary URL, and the two intentions are
// never confused for one another.

import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const CONTENT = join(process.cwd(), 'src', 'content', 'blog');
const PROTOCOL = 'article:';

/**
 * Drafts are visible under `astro dev` and never in a built site — the same rule
 * `showDrafts` applies in src/lib/posts.ts, restated because this runs before any
 * of that has been compiled.
 *
 * It has to be applied here too, or holding a translation back as a draft would
 * leave every `article:` link pointing at it resolving to a page the build never
 * emits. A draft translation is not a translation yet, so the link falls back to
 * English exactly as it would if the file did not exist.
 */
const showDrafts = process.env.NODE_ENV !== 'production';

// English is unprefixed, so an English id is already most of its URL. Kept in
// step with src/i18n/config.ts by hand: this file runs inside the Markdown
// pipeline, before anything in src/ has been compiled, and cannot import it.
const DEFAULT_LOCALE = 'en';

/**
 * How a link that had to fall back announces itself, in the language of the page
 * the reader is on.
 *
 * It goes *inside* the anchor, so it is part of the link's accessible name: a
 * reader moving through a page link by link hears it, which is not true of
 * `hreflang` — that attribute is for search engines, and no screen reader
 * announces it. The English title inside the link is left untagged rather than
 * wrapped in `lang="en"`, because a title quoted in Portuguese prose is in the
 * same position whether it is a link or not, and marking it up here and nowhere
 * else would be the odd case rather than the consistent one.
 */
const IN_ENGLISH = {
	pt: ' (em inglês)',
};

/**
 * English id → { locale: url }, for every language an article exists in.
 *
 * Read straight off the filesystem rather than from the content collection: this
 * runs while that collection is being built, so asking it would be circular. The
 * frontmatter needed is one field, and a regex over the top of the file is enough
 * to find it without pulling in a YAML parser.
 */
function readArticles() {
	const urls = new Map();

	/** True for a file that this build will not emit a page for. */
	const isHidden = (source) => !showDrafts && /^draft:\s*true\s*$/m.test(source);

	for (const entry of readdirSync(CONTENT, { withFileTypes: true })) {
		if (entry.isDirectory()) continue;
		const id = entry.name.replace(/\.mdx?$/, '');
		if (id === entry.name) continue;
		if (isHidden(readFileSync(join(CONTENT, entry.name), 'utf8'))) continue;
		urls.set(id, { [DEFAULT_LOCALE]: `/blog/${id}/` });
	}

	for (const dir of readdirSync(CONTENT, { withFileTypes: true })) {
		if (!dir.isDirectory()) continue;
		const locale = dir.name;
		for (const entry of readdirSync(join(CONTENT, locale), { withFileTypes: true })) {
			if (entry.isDirectory() || !/\.mdx?$/.test(entry.name)) continue;
			const slug = entry.name.replace(/\.mdx?$/, '');
			const source = readFileSync(join(CONTENT, locale, entry.name), 'utf8');
			if (isHidden(source)) continue;
			const original = /^translationOf:\s*['"]([^'"]+)['"]\s*$/m.exec(source)?.[1];
			// A translation with no `translationOf` is already a build error in
			// src/lib/posts.ts, which reports it far better than this could. Skip it
			// here and let that check do the talking.
			if (!original) continue;
			const known = urls.get(original);
			if (known) known[locale] = `/${locale}/blog/${slug}/`;
		}
	}

	return urls;
}

/**
 * The language a source file is written in, from the directory it sits in — the
 * same rule as `postLocale` in src/lib/posts.ts, for the same reason: where a
 * file is is harder to get wrong than a field that can disagree with it.
 */
function localeOf(path, locales) {
	const parts = path.split(/[\\/]/);
	const blog = parts.lastIndexOf('blog');
	const dir = blog === -1 ? undefined : parts[blog + 1];
	return locales.has(dir) ? dir : DEFAULT_LOCALE;
}

export default function remarkArticleLinks() {
	// One read per build rather than one per file. Nothing adds an article while a
	// build is running, and `astro dev` restarts on a change under src/content.
	let articles;

	return function transform(tree, file) {
		articles ??= readArticles();
		const locales = new Set(
			[...articles.values()].flatMap((byLocale) => Object.keys(byLocale)),
		);
		const locale = localeOf(file.path ?? '', locales);

		visitLinks(tree, (node) => {
			if (typeof node.url !== 'string' || !node.url.startsWith(PROTOCOL)) return;

			const id = node.url.slice(PROTOCOL.length).replace(/^\/+|\/+$/g, '');
			const found = articles.get(id);
			if (!found) {
				const known = [...articles.keys()].sort().join(', ');
				throw new Error(
					`${file.path ?? 'an article'} links to "${PROTOCOL}${id}", which is not a published ` +
						`English article. Use the English file name, without a directory or extension — ` +
						`and note that a draft is not published, so a published article cannot link to ` +
						`one. Known articles: ${known}.`,
				);
			}

			const translated = found[locale];
			if (translated) {
				node.url = translated;
				return;
			}

			// No version in this language. Send the reader to the English one and
			// tell them that is where they are going.
			node.url = found[DEFAULT_LOCALE];
			node.data = { ...node.data, hProperties: { ...node.data?.hProperties, hreflang: 'en' } };

			const marker = IN_ENGLISH[locale];
			if (marker) node.children.push({ type: 'text', value: marker });
		});
	};
}

/** Walks the tree without a dependency, since only one node type is of interest. */
function visitLinks(node, fn) {
	if (!node || typeof node !== 'object') return;
	if (node.type === 'link') fn(node);
	for (const child of node.children ?? []) visitLinks(child, fn);
}
