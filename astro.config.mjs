// @ts-check

import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import pagefind from 'astro-pagefind';
import { unified } from '@astrojs/markdown-remark';
import { defineConfig, fontProviders } from 'astro/config';

import remarkArticleLinks from './plugins/remark-article-links.mjs';
import rehypeNoFootnoteBackrefs from './plugins/rehype-no-footnote-backrefs.mjs';

const BLOG = 'src/content/blog';

/**
 * `lastmod` for every article, keyed by the path it is served from.
 *
 * `@astrojs/sitemap` emits no `lastmod` of its own, so a crawler has no way of
 * knowing that a page it indexed in August says something different now. The
 * dates come from the articles themselves: `updatedDate` when one has been
 * changed since it went out, `pubDate` otherwise.
 *
 * Read with a small parser rather than through `astro:content`, which a config
 * file cannot import. The layout of the collection is the same one the loader
 * relies on — a file at the root is English, a file in a directory named after a
 * locale is in that language — so the served path is the file name, prefixed for
 * every language but the default.
 */
function articleDates() {
	/**
	 * @param {string} head The frontmatter block, without its fences.
	 * @param {string} name The field to read.
	 */
	const field = (head, name) =>
		head.match(new RegExp(`^${name}:\\s*['"]?([^'"\\n]+?)['"]?\\s*$`, 'm'))?.[1];

	/** @param {string} file */
	const dateOf = (file) => {
		const text = readFileSync(file, 'utf8');
		const end = text.indexOf('\n---', 4);
		const head = end === -1 ? '' : text.slice(4, end);
		const value = field(head, 'updatedDate') ?? field(head, 'pubDate');
		const date = value ? new Date(value) : undefined;
		// A date the parser could not make sense of is left out rather than
		// guessed at: no `lastmod` is a missing hint, a wrong one is a lie.
		return date && !Number.isNaN(date.valueOf()) ? date.toISOString() : undefined;
	};

	/** @type {Map<string, string>} */
	const dates = new Map();

	/**
	 * @param {string} prefix The locale's path prefix, empty for the default one.
	 * @param {string} dir
	 */
	const add = (prefix, dir) => {
		for (const entry of readdirSync(dir, { withFileTypes: true })) {
			if (entry.isDirectory()) {
				add(`/${entry.name}`, join(dir, entry.name));
			} else if (/\.mdx?$/.test(entry.name)) {
				const date = dateOf(join(dir, entry.name));
				if (date) dates.set(`${prefix}/blog/${entry.name.replace(/\.mdx?$/, '')}/`, date);
			}
		}
	};

	add('', BLOG);
	return dates;
}

const lastmod = articleDates();

// https://astro.build/config
export default defineConfig({
	markdown: {
		// Resolves `article:` links in prose to the reader's own language, falling
		// back to English when a translation does not exist yet. See the plugin.
		// Drops the "back to reference" links footnotes would otherwise end with;
		// see that plugin for why.
		processor: unified({
			remarkPlugins: [remarkArticleLinks],
			rehypePlugins: [rehypeNoFootnoteBackrefs],
		}),
	},
	// The canonical home. marlon-sousa.github.io still answers, and GitHub
	// redirects it here, so links shared before the move keep working.
	site: 'https://marlon-sousa.com',
	integrations: [
		mdx(),
		sitemap({
			serialize(item) {
				const date = lastmod.get(new URL(item.url).pathname);
				return date ? { ...item, lastmod: date } : item;
			},
		}),
		pagefind(),
	],
	fonts: [
		{
			provider: fontProviders.local(),
			name: 'Atkinson',
			cssVariable: '--font-atkinson',
			fallbacks: ['sans-serif'],
			options: {
				variants: [
					{
						src: ['./src/assets/fonts/atkinson-regular.woff'],
						weight: 400,
						style: 'normal',
						display: 'swap',
					},
					{
						src: ['./src/assets/fonts/atkinson-bold.woff'],
						weight: 700,
						style: 'normal',
						display: 'swap',
					},
				],
			},
		},
	],
});
