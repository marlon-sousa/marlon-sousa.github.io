// @ts-check

import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import pagefind from 'astro-pagefind';
import { unified } from '@astrojs/markdown-remark';
import { defineConfig, fontProviders } from 'astro/config';

import remarkArticleLinks from './plugins/remark-article-links.mjs';

// https://astro.build/config
export default defineConfig({
	markdown: {
		// Resolves `article:` links in prose to the reader's own language, falling
		// back to English when a translation does not exist yet. See the plugin.
		processor: unified({ remarkPlugins: [remarkArticleLinks] }),
	},
	// The canonical home. marlon-sousa.github.io still answers, and GitHub
	// redirects it here, so links shared before the move keep working.
	site: 'https://marlon-sousa.com',
	integrations: [mdx(), sitemap(), pagefind()],
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
