// Structured data (JSON-LD) for search engines.
//
// A crawler reads the page the way a person cannot: it does not know that the
// "Marlon Brandão de Sousa" in a footer, the author of an article and the
// "Marlon Sousa" on itinera-dev.org are the same person. These records say so.
// There is exactly one Person, identified by PERSON_ID, and everything else
// points at it rather than describing him again, so the claims cannot drift
// apart.
//
// Nothing here is shown to a reader, and nothing here may say what the page
// does not: a record that disagrees with the visible content is a reason for a
// search engine to distrust the whole page.

import { SITE_AUTHOR, SITE_TITLE } from '../consts';

/** The one profile anyone could type into a search box instead of the full name. */
export const SHORT_NAME = 'Marlon Sousa';

/** Profiles that are him, and only him. A project's site is not one of them. */
const PROFILES = ['https://github.com/marlon-sousa', 'https://www.linkedin.com/in/marlonsousa/'];

const personId = (site: URL) => new URL('/#person', site).href;

/** The site and its author, for the home page in each language. */
export function homeRecords(site: URL, page: URL, description: string, language: string) {
	return [
		{
			'@context': 'https://schema.org',
			'@type': 'WebSite',
			'@id': new URL('/#website', site).href,
			url: new URL('/', site).href,
			name: SITE_TITLE,
			alternateName: SHORT_NAME,
			inLanguage: language,
			author: { '@id': personId(site) },
		},
		{
			'@context': 'https://schema.org',
			'@type': 'Person',
			'@id': personId(site),
			name: SITE_AUTHOR,
			alternateName: SHORT_NAME,
			url: new URL('/', site).href,
			description,
			sameAs: PROFILES,
			mainEntityOfPage: page.href,
		},
	];
}

export interface ArticleFacts {
	headline: string;
	description: string;
	published: Date;
	modified?: Date;
}

/** One article, credited to the Person the home page describes. */
export function articleRecord(
	site: URL,
	page: URL,
	image: URL,
	language: string,
	{ headline, description, published, modified }: ArticleFacts,
) {
	return {
		'@context': 'https://schema.org',
		'@type': 'BlogPosting',
		headline,
		description,
		image: image.href,
		inLanguage: language,
		datePublished: published.toISOString(),
		// Google asks for both; an article never changed was last modified when
		// it went out.
		dateModified: (modified ?? published).toISOString(),
		mainEntityOfPage: page.href,
		author: {
			'@type': 'Person',
			'@id': personId(site),
			name: SITE_AUTHOR,
			alternateName: SHORT_NAME,
			url: new URL('/', site).href,
		},
	};
}

/**
 * Serialise for a `<script type="application/ld+json">`. `<` is escaped so that
 * a title containing `</script>` cannot end the element early.
 */
export function toJsonLd(records: unknown): string {
	return JSON.stringify(records).replace(/</g, '\\u003c');
}
