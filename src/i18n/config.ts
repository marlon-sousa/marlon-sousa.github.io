// What a locale is on this site, and how a URL and a locale map onto each other.
//
// English is the default and is not prefixed, so every URL that existed before
// this file did still resolves to the same page. Portuguese lives under /pt/.
// That asymmetry is deliberate and it is the only place it is decided: nothing
// else in the codebase should test for 'en' to work out whether to add a prefix.

export const locales = ['en', 'pt'] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'en';

interface LocaleMeta {
	/** BCP 47 tag for <html lang>, and for hreflang. */
	tag: string;
	/** Open Graph wants language_TERRITORY, not a bare language. */
	ogLocale: string;
	/** Argument to Intl / toLocaleDateString. */
	dateLocale: string;
	/**
	 * The language's own name for itself, for the language switcher. A reader
	 * who cannot read the current page cannot read a name given in its language.
	 */
	endonym: string;
	/** Giscus interface language code. */
	giscus: string;
}

export const localeMeta: Record<Locale, LocaleMeta> = {
	en: {
		tag: 'en',
		ogLocale: 'en_US',
		dateLocale: 'en-US',
		endonym: 'English',
		giscus: 'en',
	},
	pt: {
		// Brazilian Portuguese specifically: this is written from Curitiba, and the
		// vocabulary and the date order are both pt-BR rather than pt-PT.
		tag: 'pt-BR',
		ogLocale: 'pt_BR',
		dateLocale: 'pt-BR',
		endonym: 'Português',
		giscus: 'pt',
	},
};

/**
 * The name of one language as the other language calls it — "Portuguese" on an
 * English page, "Inglês" on a Portuguese one.
 *
 * Used for the accessible name of a switcher link, which has to be in the
 * language of the page the reader is currently on: they are reading it before
 * they decide to leave. The visible label is the endonym instead, so the link
 * also says its own name to somebody who cannot read this page at all.
 */
export function languageName(target: Locale, inLocale: Locale): string {
	const names = new Intl.DisplayNames([localeMeta[inLocale].tag], { type: 'language' });
	return names.of(localeMeta[target].tag) ?? localeMeta[target].endonym;
}

export function isLocale(value: unknown): value is Locale {
	return typeof value === 'string' && (locales as readonly string[]).includes(value);
}

/**
 * The path segment a locale owns, with no trailing slash.
 *
 * Empty for the default locale, which is what keeps English unprefixed.
 */
export function localePrefix(locale: Locale): string {
	return locale === defaultLocale ? '' : `/${locale}`;
}

/**
 * The locale a URL belongs to, read from its first segment.
 *
 * Every component works this out for itself rather than being handed it, so a
 * component deep in a page never has to be passed a locale it could have read
 * from the page it is rendering on.
 */
export function getLocale(url: URL | string): Locale {
	const pathname = typeof url === 'string' ? url : url.pathname;
	const first = pathname.split('/').filter(Boolean)[0];
	return isLocale(first) && first !== defaultLocale ? first : defaultLocale;
}

/** A site-root-relative path with its locale segment removed. */
export function stripLocale(pathname: string): string {
	const locale = getLocale(pathname);
	if (locale === defaultLocale) return pathname;
	const stripped = pathname.slice(localePrefix(locale).length);
	return stripped || '/';
}

/**
 * Move a site-root-relative path into a locale.
 *
 * Takes the unprefixed form — `/blog/` — and returns `/blog/` or `/pt/blog/`.
 */
export function localeUrl(path: string, locale: Locale): string {
	const clean = path.startsWith('/') ? path : `/${path}`;
	return `${localePrefix(locale)}${clean}` || '/';
}

/**
 * The value a locale takes as the `locale` route parameter.
 *
 * `undefined` collapses the [...locale] segment away entirely, which is how the
 * default locale is served from the site root by the same page file.
 */
export function localeParam(locale: Locale): string | undefined {
	return locale === defaultLocale ? undefined : locale;
}

/**
 * The path this page takes in each locale, for pages that exist in all of them.
 *
 * Every page except an article is a straight translation of one route, so its
 * alternates can be derived. Articles pass their own map instead, since a
 * translation has a translated slug and may not exist at all.
 */
export function alternatesFor(pathname: string): Record<Locale, string> {
	const bare = stripLocale(pathname);
	return Object.fromEntries(locales.map((locale) => [locale, localeUrl(bare, locale)])) as Record<
		Locale,
		string
	>;
}
