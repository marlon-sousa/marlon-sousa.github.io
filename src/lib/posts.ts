// Query helpers for the blog collection.
//
// There are two kinds of writing on this site and one collection holding both:
//
//   - a standalone post — one Markdown file, no `series` in its frontmatter
//   - a series article  — `series` names an entry in src/data/series.ts and
//                         `seriesPart` fixes its place in the reading order
//
// and two languages, held in the same collection again: an English original sits
// directly in src/content/blog, and its translations sit in a directory named
// after their locale. So `pt/o-terminal-que-eu-nao-conseguia-construir` is one
// post, in Portuguese, whose `translationOf` names the English file it renders
// alongside.
//
// Every page goes through the helpers here rather than calling getCollection
// directly, so that draft handling, language and series ordering are decided in
// one place. Almost every helper takes a locale and answers only for that
// language: a Portuguese blog index that quietly listed English articles would
// be worse than one that listed nothing.

import { getCollection, type CollectionEntry } from 'astro:content';
import {
	getSeries,
	resolveSeries,
	series as allSeries,
	type ResolvedSeries,
} from '../data/series';
import { pick } from '../i18n/localized';
import { defaultLocale, isLocale, localeUrl, locales, type Locale } from '../i18n/config';

export type Post = CollectionEntry<'blog'>;

/** Drafts are visible while running `astro dev`, and never in a built site. */
const showDrafts = import.meta.env.DEV;

/**
 * The language a post is written in, taken from the directory it sits in.
 *
 * `pt/whatever` is Portuguese; anything without a locale directory is English,
 * which is what leaves the English files exactly where they have always been.
 */
export function postLocale(post: Post): Locale {
	const first = post.id.split('/')[0];
	return isLocale(first) && first !== defaultLocale ? first : defaultLocale;
}

/** The post's URL segment: its file name, with any locale directory removed. */
export function postSlug(post: Post): string {
	const locale = postLocale(post);
	return locale === defaultLocale ? post.id : post.id.slice(locale.length + 1);
}

export function postUrl(post: Post): string {
	return localeUrl(`/blog/${postSlug(post)}/`, postLocale(post));
}

/**
 * Where this post's generated social card lives.
 *
 * `post.id` already carries the locale directory for a translation, so the card
 * for a Portuguese article lands under /og/pt/ without anything here having to
 * know about languages.
 */
export function postOgPath(post: Post): string {
	return `/og/${post.id}.png`;
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

/**
 * Every post visible in this build, in every language, newest first.
 *
 * Also the one place the language layout of the collection is checked. A
 * translation that names an original which does not exist, or an English file
 * claiming to translate something, would otherwise produce a language switcher
 * pointing at a 404 — a link that is only broken for the readers who most need
 * it to work.
 */
export async function getAllPosts(): Promise<Post[]> {
	const posts = await getCollection('blog', ({ data }) => showDrafts || !data.draft);
	const byId = new Map(posts.map((post) => [post.id, post]));

	for (const post of posts) {
		const locale = postLocale(post);
		const original = post.data.translationOf;

		if (locale === defaultLocale) {
			if (original !== undefined) {
				throw new Error(
					`"${post.id}" is an English original but sets \`translationOf\`. Remove the field, ` +
						`or move the file into a locale directory such as src/content/blog/pt/.`,
				);
			}
			continue;
		}

		if (original === undefined) {
			throw new Error(
				`"${post.id}" is a ${locale} translation but does not say what it translates. ` +
					`Add \`translationOf\` naming the English file, without a directory or extension.`,
			);
		}
		if (!byId.has(original)) {
			const known = [...byId.keys()].filter((id) => !id.includes('/')).join(', ');
			throw new Error(
				`"${post.id}" says it translates "${original}", which is not a published English post. ` +
					`Known English posts: ${known}.`,
			);
		}
	}

	return posts.sort(byNewest);
}

/** Every post in one language, newest first. */
export async function getPosts(locale: Locale): Promise<Post[]> {
	return (await getAllPosts()).filter((post) => postLocale(post) === locale);
}

/**
 * One article, in the best language available to a given reader.
 *
 * `fallback` is the whole point: it is true when this is not the language that
 * was asked for, and everything that renders a link to an article is expected to
 * say so. A reader is never quietly handed another language.
 */
export interface Readable {
	post: Post;
	/** The language `post` is actually written in. */
	locale: Locale;
	/** True when that is not the language the reader asked for. */
	fallback: boolean;
}

/**
 * Every article, grouped by the identity it keeps across languages.
 *
 * The key is `translationKey`, so an English original and its translations
 * collapse into one entry with one member per language.
 */
async function getVersions(): Promise<Map<string, Partial<Record<Locale, Post>>>> {
	const versions = new Map<string, Partial<Record<Locale, Post>>>();
	for (const post of await getAllPosts()) {
		const key = translationKey(post);
		const found = versions.get(key) ?? {};
		found[postLocale(post)] = post;
		versions.set(key, found);
	}
	return versions;
}

/**
 * The site's one rule for choosing which version of an article to link to:
 * the reader's own language if it exists, English otherwise, and never nothing.
 *
 * Hiding an untranslated article used to be the rule here, on the reasoning that
 * a listing should not mix languages. That protected the listing at the reader's
 * expense — somebody reading in Portuguese could not find out that part four
 * existed at all. Offering it, clearly labelled, leaves the choice with them.
 *
 * English is the fallback rather than "any other language" because every
 * translation declares an English original, so English is the one version
 * guaranteed to exist. `getAllPosts` fails the build if that is ever untrue.
 */
export function selectVersion(
	versions: Partial<Record<Locale, Post>>,
	locale: Locale,
): Readable | undefined {
	const own = versions[locale];
	if (own) return { post: own, locale, fallback: false };

	const original = versions[defaultLocale];
	if (!original) return undefined;
	return { post: original, locale: defaultLocale, fallback: true };
}

/**
 * Every article a reader of this language can reach, one entry per article,
 * newest first.
 *
 * Exactly one version of each article appears, so an article translated into
 * Portuguese is not also listed in English beside itself.
 */
export async function getReadablePosts(locale: Locale): Promise<Readable[]> {
	return [...(await getVersions()).values()]
		.map((versions) => selectVersion(versions, locale))
		.filter((found): found is Readable => found !== undefined)
		.sort((a, b) => byNewest(a.post, b.post));
}

/**
 * The id that identifies a piece of writing across languages.
 *
 * An original is identified by its own id; a translation by the id of what it
 * translates. So both halves of a pair answer with the same string, which is all
 * `getTranslations` needs to find one from the other.
 */
function translationKey(post: Post): string {
	return post.data.translationOf ?? post.id;
}

/**
 * Every language this article can be read in, as locale → URL.
 *
 * Always contains the article's own locale. A language missing from the map has
 * no translation, and the switcher offers no link rather than a link to a page
 * that will not be there — being sent to a 404 is worse than being told the
 * translation does not exist.
 */
export async function getTranslations(post: Post): Promise<Partial<Record<Locale, string>>> {
	const key = translationKey(post);
	const found: Partial<Record<Locale, string>> = {};
	for (const candidate of await getAllPosts()) {
		if (translationKey(candidate) === key) {
			found[postLocale(candidate)] = postUrl(candidate);
		}
	}
	return found;
}

/**
 * The published parts of one series, in one language, in reading order.
 *
 * Two articles claiming the same part number would order themselves arbitrarily
 * and read as if one were missing, so it fails the build instead.
 *
 * A series is the same length in every language, because an untranslated part is
 * offered in English rather than skipped. What changes between languages is how
 * many of the parts are in the reader's own.
 */
export async function getSeriesParts(slug: string, locale: Locale): Promise<Readable[]> {
	const parts = (await getReadablePosts(locale))
		.filter(({ post }) => post.data.series === slug)
		.sort((a, b) => (a.post.data.seriesPart ?? 0) - (b.post.data.seriesPart ?? 0));

	const claimed = new Map<number, string>();
	for (const { post } of parts) {
		const number = post.data.seriesPart as number;
		const clash = claimed.get(number);
		if (clash) {
			throw new Error(
				`Series "${slug}" has two articles numbered ${number}: "${clash}" and "${post.id}". ` +
					'Renumber one of them in its frontmatter.',
			);
		}
		claimed.set(number, post.id);
	}
	return parts;
}

export interface SeriesListing {
	series: ResolvedSeries;
	parts: Readable[];
	/** Publication date of the most recent part. */
	updated: Date;
}

/**
 * Series with at least one part published anywhere, most recently updated first.
 *
 * A series that has been declared but not yet started appears nowhere on the
 * site: an empty landing page promises work rather than showing it.
 *
 * A series whose translation has not started, though, now appears in every
 * language, because its parts can be offered in English. That is what makes the
 * series page exist in both languages — and it has to, or the Portuguese entry
 * here would be a link to a page that was never built.
 */
export async function getSeriesListings(locale: Locale): Promise<SeriesListing[]> {
	const listings: SeriesListing[] = [];
	for (const entry of allSeries) {
		const parts = await getSeriesParts(entry.slug, locale);
		if (parts.length === 0) continue;
		const updated = parts.reduce(
			(latest, { post }) => (post.data.pubDate > latest ? post.data.pubDate : latest),
			parts[0].post.data.pubDate,
		);
		listings.push({ series: resolveSeries(entry, locale), parts, updated });
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

export function tagUrl(tag: string, locale: Locale): string {
	return localeUrl(`/tags/${tagSlug(tag)}/`, locale);
}

export interface TagListing {
	/** The spelling used most often across posts; what the reader sees. */
	tag: string;
	slug: string;
	/** Posts carrying this tag, newest first. */
	posts: Post[];
}

/**
 * Every tag in use in one language, alphabetical.
 *
 * Tags are not translated through a table: a Portuguese article is tagged in
 * Portuguese, in its own frontmatter, and the two languages therefore have two
 * separate sets of tag pages. That is the honest arrangement — "acessibilidade"
 * and "accessibility" collect different articles, and a shared tag page would
 * have to pick one language to show them in.
 */
export async function getTagListings(locale: Locale): Promise<TagListing[]> {
	const groups = new Map<string, { spellings: Map<string, number>; posts: Post[] }>();

	for (const post of await getPosts(locale)) {
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

	return listings.sort((a, b) => a.tag.localeCompare(b.tag, locale));
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
	/**
	 * Present once the part is published in any language — in the reader's own
	 * where it exists, in English otherwise. Absent only for a part of the
	 * outline that has not been written at all, which is still named but is
	 * deliberately not a link.
	 */
	article?: Readable;
}

/**
 * Every part of a series in reading order, merging the declared outline with
 * whatever has actually been published in this language.
 *
 * A published post wins on title, since the finished article may be named
 * differently from the plan. A published part with no entry in the outline is
 * still listed rather than hidden, so the site never silently drops an article.
 */
export async function getSeriesOutline(slug: string, locale: Locale): Promise<SeriesEntry[]> {
	const published = await getSeriesParts(slug, locale);
	const byNumber = new Map(published.map((found) => [found.post.data.seriesPart as number, found]));

	const entries: SeriesEntry[] = getSeries(slug).parts.map((part) => {
		const article = byNumber.get(part.number);
		byNumber.delete(part.number);
		return {
			number: part.number,
			title: article?.post.data.title ?? pick(part.title, locale),
			summary: pick(part.summary, locale),
			article,
		};
	});

	for (const [number, article] of byNumber) {
		entries.push({ number, title: article.post.data.title, article });
	}
	return entries.sort((a, b) => a.number - b.number);
}

export interface SeriesNav {
	series: ResolvedSeries;
	/** This article's part number. */
	part: number;
	/** How many parts the series plans in total. */
	total: number;
	/** The neighbouring parts, which may not be published yet. */
	previous?: SeriesEntry;
	next?: SeriesEntry;
}

/**
 * Where a post sits in its series, or undefined for a standalone post.
 *
 * `locale` is the language of the page the nav is being rendered on, which is
 * the article's own language when reading the article, but the reader's language
 * when the nav is a label in a listing. They differ exactly when an untranslated
 * article is being offered in a Portuguese list: the label around it — the series
 * name, the word "part" — belongs to the page, not to the article.
 */
export async function getSeriesNav(
	post: Post,
	locale: Locale = postLocale(post),
): Promise<SeriesNav | undefined> {
	const slug = post.data.series;
	if (!slug) return undefined;

	const outline = await getSeriesOutline(slug, locale);
	const index = outline.findIndex((entry) => entry.number === post.data.seriesPart);
	return {
		series: resolveSeries(getSeries(slug), locale),
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
	article: Readable;
	/** Present only for a series article; standalone posts carry no label. */
	nav?: SeriesNav;
}

export async function getBlogFeed(locale: Locale): Promise<FeedEntry[]> {
	const readable = await getReadablePosts(locale);
	return Promise.all(
		readable.map(async (article) => ({
			article,
			// The reader's locale, not the article's: an English article listed on
			// the Portuguese index is still labelled "parte 4" of a series named in
			// Portuguese. Only the article itself is in the other language.
			nav: await getSeriesNav(article.post, locale),
		})),
	);
}

/**
 * The `locale` route parameter for every language, for pages that exist in all
 * of them.
 *
 * `undefined` for English collapses the [...locale] segment away, so one page
 * file serves both `/blog/` and `/pt/blog/`.
 */
export function localeRoutes(): { params: { locale: string | undefined }; props: { locale: Locale } }[] {
	return locales.map((locale) => ({
		params: { locale: locale === defaultLocale ? undefined : locale },
		props: { locale },
	}));
}
