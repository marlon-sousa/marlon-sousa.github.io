import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
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

				/** Free-form topic labels. Shown on the post; no archive pages yet. */
				tags: z.array(z.string()).default([]),
				/** Drafts are visible under `astro dev` and excluded from a built site. */
				draft: z.boolean().default(false),
			})
			// Half a series reference orders articles arbitrarily or strands one
			// outside the series it belongs to, so neither field is valid alone.
			.refine((data) => (data.series === undefined) === (data.seriesPart === undefined), {
				message: '`series` and `seriesPart` must be set together, or both left out',
				path: ['seriesPart'],
			}),
});

export const collections = { blog };
