// One Open Graph image per post, plus a site-wide default at /og/site.png.
//
// These are generated during `astro build` and shipped as static PNGs, so
// nothing is rendered at request time.

import type { APIRoute } from 'astro';
import { getSeries } from '../../data/series';
import { getPosts } from '../../lib/posts';
import { renderOgImage, type OgOptions } from '../../lib/og';
import { SITE_TITLE } from '../../consts';

export async function getStaticPaths() {
	const posts = await getPosts();

	const postRoutes = posts.map((post) => ({
		params: { slug: post.id },
		props: {
			title: post.data.title,
			eyebrow: post.data.series
				? `${getSeries(post.data.series).title} — part ${post.data.seriesPart}`
				: 'Blog',
		} satisfies OgOptions,
	}));

	return [
		...postRoutes,
		{
			params: { slug: 'site' },
			props: {
				title: SITE_TITLE,
				eyebrow: 'Software engineering, accessibility, and Rust',
			} satisfies OgOptions,
		},
	];
}

export const GET: APIRoute<OgOptions> = async ({ props }) => {
	const png = await renderOgImage(props);
	return new Response(new Uint8Array(png), {
		headers: { 'Content-Type': 'image/png' },
	});
};
