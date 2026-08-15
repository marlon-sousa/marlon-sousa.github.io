// One Open Graph image per post, plus a site-wide default per language.
//
// These are generated during `astro build` and shipped as static PNGs, so
// nothing is rendered at request time.
//
// The route lives outside [...locale] because the language is already inside the
// slug — a card for a Portuguese article is /og/pt/<slug>.png, mirroring where
// its Markdown file sits. A card is an image referenced by a meta tag, not a
// page anybody browses to, so it does not need a locale segment of its own.

import type { APIRoute } from 'astro';
import { getResolvedSeries } from '../../data/series';
import { getAllPosts, postLocale } from '../../lib/posts';
import { renderOgImage, type OgOptions } from '../../lib/og';
import { SITE_TITLE } from '../../consts';
import { defaultLocale, locales } from '../../i18n/config';
import { useTranslations } from '../../i18n/ui';

export async function getStaticPaths() {
	const posts = await getAllPosts();

	const postRoutes = posts.map((post) => {
		const locale = postLocale(post);
		const t = useTranslations(locale);
		return {
			// post.id already carries the locale directory for a translation, which
			// is exactly the path this card should take.
			params: { slug: post.id },
			props: {
				title: post.data.title,
				eyebrow: post.data.series
					? t('series.eyebrow', {
							series: getResolvedSeries(post.data.series, locale).title,
							part: post.data.seriesPart as number,
						})
					: t('blog.title'),
			} satisfies OgOptions,
		};
	});

	const siteRoutes = locales.map((locale) => {
		const t = useTranslations(locale);
		return {
			params: { slug: locale === defaultLocale ? 'site' : `${locale}/site` },
			props: {
				title: SITE_TITLE,
				eyebrow: t('site.ogEyebrow'),
			} satisfies OgOptions,
		};
	});

	return [...postRoutes, ...siteRoutes];
}

export const GET: APIRoute<OgOptions> = async ({ props }) => {
	const png = await renderOgImage(props);
	return new Response(new Uint8Array(png), {
		headers: { 'Content-Type': 'image/png' },
	});
};
