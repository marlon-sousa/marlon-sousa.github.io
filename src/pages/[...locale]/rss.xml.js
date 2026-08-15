import rss from '@astrojs/rss';
import { SITE_TITLE } from '../../consts';
import { getResolvedSeries } from '../../data/series';
import { getPosts, localeRoutes, postUrl } from '../../lib/posts';
import { localeMeta } from '../../i18n/config';
import { useTranslations } from '../../i18n/ui';

// One feed per language: /rss.xml and /pt/rss.xml. A reader who subscribed from
// a Portuguese page gets Portuguese articles, and only those — a single mixed
// feed would deliver every article twice to somebody who can read both, and
// half an unreadable feed to everybody else.
export const getStaticPaths = localeRoutes;

export async function GET(context) {
	const { locale } = context.props;
	const t = useTranslations(locale);

	// getPosts drops drafts in a production build, so nothing unfinished can
	// reach a subscriber's reader — where it could not be unpublished.
	const posts = await getPosts(locale);

	return rss({
		title: SITE_TITLE,
		description: t('site.description'),
		site: context.site,
		// Tells a reader what it is about to be given, and lets an aggregator
		// group or filter by language.
		customData: `<language>${localeMeta[locale].tag}</language>`,
		items: posts.map((post) => ({
			title: post.data.title,
			description: post.data.description,
			pubDate: post.data.pubDate,
			link: postUrl(post),
			categories: [
				...post.data.tags,
				...(post.data.series ? [getResolvedSeries(post.data.series, locale).title] : []),
			],
		})),
	});
}
