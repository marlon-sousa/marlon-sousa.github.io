// Query helpers for the blog collection.
//
// There are two kinds of writing on this site and one collection holding both:
//
//   - a standalone post — one Markdown file, no `series` in its frontmatter
//   - a series article  — `series` names an entry in src/data/series.ts and
//                         `seriesPart` fixes its place in the reading order
//
// Every page goes through the helpers here rather than calling getCollection
// directly, so that draft handling and series ordering are decided in one place.

import { getCollection, type CollectionEntry } from 'astro:content';
import { getSeries, series as allSeries, type Series } from '../data/series';

export type Post = CollectionEntry<'blog'>;

/** Drafts are visible while running `astro dev`, and never in a built site. */
const showDrafts = import.meta.env.DEV;

export function postUrl(post: Post): string {
	return `/blog/${post.id}/`;
}

/**
 * Newest first, with a deterministic tiebreak.
 *
 * Two articles published on the same day are common — a series part and an
 * unrelated post, or two parts released together — and date alone would order
 * them by whatever the filesystem happened to return, differently between
 * builds. So equal dates fall back to the series (keeping its parts adjacent
 * rather than interleaved with other writing), then to the later part first,
 * then to the id.
 */
function byNewest(a: Post, b: Post): number {
	const byDate = b.data.pubDate.valueOf() - a.data.pubDate.valueOf();
	if (byDate !== 0) return byDate;

	const bySeries = (a.data.series ?? '').localeCompare(b.data.series ?? '');
	if (bySeries !== 0) return bySeries;

	const byPart = (b.data.seriesPart ?? 0) - (a.data.seriesPart ?? 0);
	if (byPart !== 0) return byPart;

	return a.id.localeCompare(b.id);
}

/** Every post visible in this build, newest first. */
export async function getPosts(): Promise<Post[]> {
	const posts = await getCollection('blog', ({ data }) => showDrafts || !data.draft);
	return posts.sort(byNewest);
}

/**
 * The published parts of one series, in reading order.
 *
 * Two articles claiming the same part number would order themselves arbitrarily
 * and read as if one were missing, so it fails the build instead.
 */
export async function getSeriesParts(slug: string): Promise<Post[]> {
	const parts = (await getPosts())
		.filter((post) => post.data.series === slug)
		.sort((a, b) => (a.data.seriesPart ?? 0) - (b.data.seriesPart ?? 0));

	const claimed = new Map<number, string>();
	for (const part of parts) {
		const number = part.data.seriesPart as number;
		const clash = claimed.get(number);
		if (clash) {
			throw new Error(
				`Series "${slug}" has two articles numbered ${number}: "${clash}" and "${part.id}". ` +
					'Renumber one of them in its frontmatter.',
			);
		}
		claimed.set(number, part.id);
	}
	return parts;
}

export interface SeriesListing {
	series: Series;
	parts: Post[];
	/** Publication date of the most recent part. */
	updated: Date;
}

/**
 * Series with at least one published part, most recently updated first.
 *
 * A series that has been declared but not yet started appears nowhere on the
 * site: an empty landing page promises work rather than showing it.
 */
export async function getSeriesListings(): Promise<SeriesListing[]> {
	const listings: SeriesListing[] = [];
	for (const entry of allSeries) {
		const parts = await getSeriesParts(entry.slug);
		if (parts.length === 0) continue;
		const updated = parts.reduce(
			(latest, part) => (part.data.pubDate > latest ? part.data.pubDate : latest),
			parts[0].data.pubDate,
		);
		listings.push({ series: entry, parts, updated });
	}
	return listings.sort((a, b) => b.updated.valueOf() - a.updated.valueOf());
}

/**
 * The URL segment for a tag.
 *
 * Accents are folded rather than stripped, so "acessibilidade" and "português"
 * both survive the trip to a URL. Tags are matched on this value, which makes
 * "NVDA", "nvda" and "N.V.D.A" one tag rather than three.
 */
export function tagSlug(tag: string): string {
	const slug = tag
		.normalize('NFD')
		.replace(/\p{Diacritic}/gu, '')
		.toLowerCase()
		.trim()
		.replace(/\s+/g, '-')
		.replace(/[^a-z0-9-]/g, '')
		.replace(/-+/g, '-')
		.replace(/^-|-$/g, '');
	if (!slug) {
		throw new Error(`Tag "${tag}" contains no characters that can appear in a URL.`);
	}
	return slug;
}

export function tagUrl(tag: string): string {
	return `/tags/${tagSlug(tag)}/`;
}

export interface TagListing {
	/** The spelling used most often across posts; what the reader sees. */
	tag: string;
	slug: string;
	/** Posts carrying this tag, newest first. */
	posts: Post[];
}

/** Every tag in use, alphabetical. */
export async function getTagListings(): Promise<TagListing[]> {
	const groups = new Map<string, { spellings: Map<string, number>; posts: Post[] }>();

	for (const post of await getPosts()) {
		// A post tagged both "NVDA" and "nvda" must still be listed once.
		const seen = new Set<string>();
		for (const tag of post.data.tags) {
			const slug = tagSlug(tag);
			let group = groups.get(slug);
			if (!group) {
				group = { spellings: new Map(), posts: [] };
				groups.set(slug, group);
			}
			group.spellings.set(tag, (group.spellings.get(tag) ?? 0) + 1);
			if (!seen.has(slug)) {
				group.posts.push(post);
				seen.add(slug);
			}
		}
	}

	const listings = [...groups].map(([slug, { spellings, posts }]) => {
		// Most-used spelling wins, alphabetical order breaks a tie, so the label
		// does not change from build to build.
		const tag = [...spellings].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))[0][0];
		return { tag, slug, posts };
	});

	return listings.sort((a, b) => a.tag.localeCompare(b.tag));
}

/**
 * One position in a series outline — published or not.
 *
 * The outline comes from src/data/series.ts, so a reader can see the whole shape
 * of a series from any part of it, including the parts that do not exist yet.
 */
export interface SeriesEntry {
	number: number;
	title: string;
	summary?: string;
	/** Present only once the part is published. */
	post?: Post;
}

/**
 * Every part of a series in reading order, merging the declared outline with
 * whatever has actually been published.
 *
 * A published post wins on title, since the finished article may be named
 * differently from the plan. A published part with no entry in the outline is
 * still listed rather than hidden, so the site never silently drops an article.
 */
export async function getSeriesOutline(slug: string): Promise<SeriesEntry[]> {
	const published = await getSeriesParts(slug);
	const byNumber = new Map(published.map((post) => [post.data.seriesPart as number, post]));

	const entries: SeriesEntry[] = getSeries(slug).parts.map((part) => {
		const post = byNumber.get(part.number);
		byNumber.delete(part.number);
		return {
			number: part.number,
			title: post?.data.title ?? part.title,
			summary: part.summary,
			post,
		};
	});

	for (const [number, post] of byNumber) {
		entries.push({ number, title: post.data.title, post });
	}
	return entries.sort((a, b) => a.number - b.number);
}

export interface SeriesNav {
	series: Series;
	/** This article's part number. */
	part: number;
	/** How many parts the series plans in total. */
	total: number;
	/** The neighbouring parts, which may not be published yet. */
	previous?: SeriesEntry;
	next?: SeriesEntry;
}

/** Where a post sits in its series, or undefined for a standalone post. */
export async function getSeriesNav(post: Post): Promise<SeriesNav | undefined> {
	const slug = post.data.series;
	if (!slug) return undefined;

	const outline = await getSeriesOutline(slug);
	const index = outline.findIndex((entry) => entry.number === post.data.seriesPart);
	return {
		series: getSeries(slug),
		part: post.data.seriesPart as number,
		total: outline.length,
		previous: index > 0 ? outline[index - 1] : undefined,
		next: index >= 0 && index < outline.length - 1 ? outline[index + 1] : undefined,
	};
}

/**
 * The blog index: every article as its own entry, newest first.
 *
 * An earlier version collapsed a series into one entry so that ten parts could
 * not bury everything else on the page. That traded away more than it bought —
 * each part is a separate piece of writing with its own date and its own
 * subject, and folding them together hid nine of them behind a title.
 *
 * A series part is instead *labelled* as one. It carries its `nav`, so the entry
 * can say which series it belongs to and how many parts that series has, and a
 * reader arriving at part six still learns that parts one to five exist.
 */
export interface FeedEntry {
	post: Post;
	/** Present only for a series article; standalone posts carry no label. */
	nav?: SeriesNav;
}

export async function getBlogFeed(): Promise<FeedEntry[]> {
	const posts = await getPosts();
	return Promise.all(posts.map(async (post) => ({ post, nav: await getSeriesNav(post) })));
}
