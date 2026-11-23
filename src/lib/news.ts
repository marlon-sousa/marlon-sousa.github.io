// Query helpers for the news collection.
//
// News is laid out like the blog — an English item directly in src/content/news,
// a translation in a directory named after its locale, paired by `translationOf`
// — and differs from it in one rule: every item exists in every language. The
// blog offers an untranslated article in English; news never has to, because an
// item is a few sentences and nothing is published until all of them are.
//
// Every item is shown on one page per language, /news/ and /pt/news/, each item
// under its own heading with an anchor of its own. That anchor is its address:
// a link to one item is the news page with the item's slug after the #.

import { getCollection, type CollectionEntry } from 'astro:content';
import { defaultLocale, isLocale, localeUrl, locales, type Locale } from '../i18n/config';

export type NewsItem = CollectionEntry<'news'>;

/** The language an item is written in, from the directory it sits in. */
export function newsLocale(item: NewsItem): Locale {
	const first = item.id.split('/')[0];
	return isLocale(first) && first !== defaultLocale ? first : defaultLocale;
}

/** The item's anchor on the news page: its file name, without a directory. */
export function newsSlug(item: NewsItem): string {
	const locale = newsLocale(item);
	return locale === defaultLocale ? item.id : item.id.slice(locale.length + 1);
}

/** The news page of one language. */
export function newsPageUrl(locale: Locale): string {
	return localeUrl('/news/', locale);
}

/** Where one item can be read: its heading on its language's news page. */
export function newsUrl(item: NewsItem): string {
	return `${newsPageUrl(newsLocale(item))}#${newsSlug(item)}`;
}

/**
 * The moment an item is ordered by, built in UTC from its day and its time.
 *
 * UTC because the time is only a tiebreak between items of one day, and the day
 * must stay the day that was written: read in any other zone, an item dated the
 * 18th could be ordered — and shown — as the 17th.
 */
export function newsMoment(item: NewsItem): number {
	const [hours = 0, minutes = 0] = (item.data.time ?? '00:00').split(':').map(Number);
	return item.data.date.valueOf() + (hours * 60 + minutes) * 60_000;
}

/** Newest first; equal moments fall back to the id, so every build agrees. */
function byNewest(a: NewsItem, b: NewsItem): number {
	return newsMoment(b) - newsMoment(a) || a.id.localeCompare(b.id);
}

/**
 * Every item, in every language, newest first — after checking that each item
 * exists in every language.
 *
 * A translation must name an English item, and every English item must have a
 * translation in every other language. The build fails on either, naming the
 * file, rather than publishing a Portuguese page that is quietly missing news.
 */
export async function getAllNews(): Promise<NewsItem[]> {
	const items = await getCollection('news');
	const english = new Map(
		items.filter((item) => newsLocale(item) === defaultLocale).map((item) => [item.id, item]),
	);
	const translated = new Map<string, Set<Locale>>();

	for (const item of items) {
		// The loader turns a file name into an id by slugging it, which drops dots:
		// `snapfit-0.1.0.md` becomes `snapfit-010`. The id is the item's anchor and
		// what `translationOf` names, so a file whose name changes on the way in
		// would be named one way and linked another. Only such names are refused.
		const fileName = item.filePath?.split(/[\\/]/).pop()?.replace(/\.mdx?$/, '');
		if (fileName !== undefined && fileName !== newsSlug(item)) {
			throw new Error(
				`News item file "${item.filePath}" becomes the id "${item.id}". Rename it to ` +
					`"${newsSlug(item)}" so its anchor and its name agree: write a version such as 0.1.0 as 0-1-0.`,
			);
		}

		const locale = newsLocale(item);
		const original = item.data.translationOf;

		if (locale === defaultLocale) {
			if (original !== undefined) {
				throw new Error(
					`News item "${item.id}" is in English but sets \`translationOf\`. Remove the field, ` +
						`or move the file into a locale directory such as src/content/news/pt/.`,
				);
			}
			continue;
		}

		if (original === undefined || !english.has(original)) {
			throw new Error(
				`News item "${item.id}" is a ${locale} translation, and \`translationOf\` must name the ` +
					`English item it translates, by its file name without a directory or extension. ` +
					`It names ${original === undefined ? 'nothing' : `"${original}"`}.`,
			);
		}
		const seen = translated.get(original) ?? new Set<Locale>();
		if (seen.has(locale)) {
			throw new Error(`News item "${original}" has two ${locale} translations; "${item.id}" is one.`);
		}
		seen.add(locale);
		translated.set(original, seen);
	}

	for (const id of english.keys()) {
		for (const locale of locales) {
			if (locale === defaultLocale || translated.get(id)?.has(locale)) continue;
			throw new Error(
				`News item "${id}" has no ${locale} translation. Every news item is published in every ` +
					`language: add one under src/content/news/${locale}/ with translationOf: '${id}'.`,
			);
		}
	}

	return items.sort(byNewest);
}

/** Every item in one language, newest first. */
export async function getNews(locale: Locale): Promise<NewsItem[]> {
	return (await getAllNews()).filter((item) => newsLocale(item) === locale);
}
