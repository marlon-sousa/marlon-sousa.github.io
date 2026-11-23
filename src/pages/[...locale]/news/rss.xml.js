import rss from '@astrojs/rss';
import { SITE_TITLE } from '../../../consts';
import { getNews, newsMoment, newsUrl } from '../../../lib/news';
import { localeRoutes } from '../../../lib/posts';
import { localeMeta } from '../../../i18n/config';
import { useTranslations } from '../../../i18n/ui';

// One news feed per language, /news/rss.xml and /pt/news/rss.xml, apart from the
// article feeds. Somebody who subscribed to read articles has not asked for a
// line about every patch release, and somebody following the projects has not
// asked for every article.
export const getStaticPaths = localeRoutes;

export async function GET(context) {
	const { locale } = context.props;
	const t = useTranslations(locale);
	const items = await getNews(locale);

	return rss({
		title: t('site.pageTitle', { page: t('news.title'), site: SITE_TITLE }),
		description: t('news.description'),
		site: context.site,
		customData: `<language>${localeMeta[locale].tag}</language>`,
		items: items.map((item) => ({
			title: item.data.title,
			pubDate: new Date(newsMoment(item)),
			link: newsUrl(item),
			// The whole item, since it is short: a reader gets the news in the
			// feed rather than a teaser for it. Links in it are made absolute,
			// because a feed reader does not know what a path is relative to.
			content: (item.rendered?.html ?? '').replace(
				/(href|src)="\//g,
				`$1="${new URL('/', context.site)}`,
			),
			categories: item.data.project ? [item.data.project] : [],
		})),
	});
}
