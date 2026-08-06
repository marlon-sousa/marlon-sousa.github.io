import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { seriesSlugs } from './data/series';

const blog = defineCollection({
	// Load Markdown and MDX files in the `src/content/blog/` directory.
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
