import rss from '@astrojs/rss';
import { SITE_DESCRIPTION, SITE_TITLE } from '../consts';
import { getSeries } from '../data/series';
import { getPosts, postUrl } from '../lib/posts';

export async function GET(context) {
	// getPosts drops drafts in a production build, so nothing unfinished can
	// reach a subscriber's reader — where it could not be unpublished.
	const posts = await getPosts();
	return rss({
		title: SITE_TITLE,
		description: SITE_DESCRIPTION,
		site: context.site,
		items: posts.map((post) => ({
			title: post.data.title,
			description: post.data.description,
			pubDate: post.data.pubDate,
			link: postUrl(post),
			categories: [
				...post.data.tags,
				...(post.data.series ? [getSeries(post.data.series).title] : []),
			],
		})),
	});
}
