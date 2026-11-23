import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { CODE_SPEC } from './data/code';
import { projects } from './data/projects';
import { seriesSlugs } from './data/series';

const blog = defineCollection({
	// Load Markdown and MDX files in the `src/content/blog/` directory.
	//
	// A file directly in that directory is English. A file in a subdirectory named
	// after a locale — `pt/` — is written in that language. Nothing in a post's
	// frontmatter says which language it is in, because the one place a file can
	// be is harder to get wrong than a field that can disagree with it.
	loader: glob({ base: './src/content/blog', pattern: '**/*.{md,mdx}' }),
	// Type-check frontmatter using a schema
	schema: ({ image }) =>
		z
			.object({
				title: z.string(),
				description: z.string(),
				// Transform string to Date object
				pubDate: z.coerce.date(),
				updatedDate: z.coerce.date().optional(),
				heroImage: z.optional(image()),

				/**
				 * The id of the article this one translates — the English original's
				 * file name, without a directory or an extension.
				 *
				 * Set on a translation, left out on an original. It is what pairs the
				 * two together for `hreflang`, for the language switcher, and for
				 * knowing that a Portuguese reader who lands on an English article has
				 * somewhere better to be. The file name itself is free to be the
				 * translated slug, which is what a Portuguese URL should say.
				 */
				translationOf: z.string().optional(),

				// --- Series. Omit both fields for a standalone post. ---
				/** Slug of an entry in src/data/series.ts. */
				series: z.enum(seriesSlugs).optional(),
				/** 1-based position in the reading order. */
				seriesPart: z.number().int().positive().optional(),

				/**
				 * The code an article describes, as `repo@ref` — for the Rust series,
				 * `postres@part-04`, the tag the part ends at. Rendered under the title
				 * as a link to that tree. See src/data/code.ts.
				 */
				code: z.string().regex(CODE_SPEC).optional(),

				/** Free-form topic labels. Shown on the post; no archive pages yet. */
				tags: z.array(z.string()).default([]),
				/** Drafts are visible under `astro dev` and excluded from a built site. */
				draft: z.boolean().default(false),
				/**
				 * Listed above everything else on the blog index, whatever its date,
				 * and marked as pinned inside its link. For writing that is meant to
				 * stand — a manifesto — rather than to be read once and scroll away.
				 * Set it on the English original; a translation inherits it.
				 */
				pinned: z.boolean().default(false),
			})
			// Half a series reference orders articles arbitrarily or strands one
			// outside the series it belongs to, so neither field is valid alone.
			.refine((data) => (data.series === undefined) === (data.seriesPart === undefined), {
				message: '`series` and `seriesPart` must be set together, or both left out',
				path: ['seriesPart'],
			}),
});

const projectNames = projects.map((project) => project.name) as [string, ...string[]];

const news = defineCollection({
	// Short, dated notes on what happened: a release of one of the projects, a
	// talk, a new series. Laid out like the blog — an English item directly in
	// `src/content/news/`, its translation in `pt/` with `translationOf` naming
	// it — with one rule the blog does not have: every item exists in every
	// language. An item is a few sentences, so translating it costs minutes, and
	// it is what keeps the Portuguese side of the site current. src/lib/news.ts
	// fails the build on an item left untranslated.
	loader: glob({ base: './src/content/news', pattern: '**/*.{md,mdx}' }),
	schema: z.object({
		/** The item's heading: what happened, in one line. */
		title: z.string(),
		/**
		 * The day it happened. A calendar date, not an instant: it is shown as
		 * the day it was in Brazil, whatever time zone the site is built in.
		 */
		date: z.coerce.date(),
		/**
		 * The time of day, as `HH:MM`, for ordering items from the same day.
		 * Never shown. Several releases often go out on one day, and without it
		 * their order would be whatever the file system returned.
		 */
		time: z
			.string()
			.regex(/^([01]\d|2[0-3]):[0-5]\d$/)
			.optional(),
		/** The project the item is about, by its name in src/data/projects.ts. */
		project: z.enum(projectNames).optional(),
		/** The English item this one translates. Set on a translation only. */
		translationOf: z.string().optional(),
	}),
});

export const collections = { blog, news };
