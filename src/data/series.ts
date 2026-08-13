// The series registry: the single source of truth for multi-part writing.
//
// A series declares its full outline here, including parts that are not written
// yet. That is what lets a reader see where an article sits in the whole — "part
// 2 of 10" — and what is still to come, rather than only what happens to exist
// today.
//
// A blog post joins a series by naming the slug in its frontmatter and giving
// its `seriesPart` number. Nothing else about the post changes, so a standalone
// post can become part of a series later by adding two lines.
//
// Adding a series here does not publish anything: a series appears on the site
// only once at least one of its parts is published.

export interface SeriesPart {
	/** 1-based position in the reading order. Matches `seriesPart` in a post. */
	number: number;
	/** Planned title. A published post's own title takes precedence. */
	title: string;
	/** One line on what the part covers, shown while it is unpublished. */
	summary?: string;
}

export interface Series {
	/** URL segment: /series/<slug>. Also the value posts put in `series:`. */
	slug: string;
	/** Display title. */
	title: string;
	/** One sentence, used on listings and as the page description. */
	description: string;
	/** Optional longer introduction, shown on the series landing page. */
	intro?: string;
	/** The full outline, published or not. */
	parts: SeriesPart[];
	/**
	 * `planned` — declared, nothing published yet.
	 * `in-progress` — being published; the landing page says more is coming.
	 * `complete` — finished; no promise of more.
	 */
	status: 'planned' | 'in-progress' | 'complete';
}

export const series: Series[] = [
	{
		slug: 'you-are-now-the-whole-team',
		title: 'You are now the whole team',
		description:
			'What it actually takes to build professional software with an AI agent, drawn from the record of two projects built that way.',
		intro:
			'A common claim is that AI makes software engineering easier, and that anyone can now code. ' +
			'The first half is true: writing code was slow and expensive, and an agent genuinely removes ' +
			'that cost. The second half is true only for software nobody depends on. This series argues ' +
			'the opposite of the usual conclusion. We were always the engineer and the bricklayer at once, ' +
			'because in our trade putting the walls up is itself an ultra-qualified job and there was ' +
			'never a cheaper pair of hands to give it to — so the engineering always competed with the ' +
			'building, and lost. Now that something else can lay the bricks, one person is left holding ' +
			'every role a team used to spread around: product owner, project manager, architect, platform ' +
			'engineer, QA and reviewer. Every claim here is measured against two real repositories, and ' +
			'the conversations are quoted on both sides.',
		// Deliberately empty: the outline is built from what has actually been
		// published, so the series page counts real articles rather than promising
		// a shape that is still changing. Parts get declared here only when the
		// order they are written in stops being negotiable.
		parts: [],
		status: 'in-progress',
	},
	{
		slug: 'engineering-with-ai',
		title: 'Engineering with AI',
		description:
			'What it actually takes to build professional software with an AI agent, drawn from the record of two projects built that way.',
		intro:
			'A common claim is that AI makes software engineering easier, and that anyone can now code. ' +
			'The first half is true. The second half is true for software nobody depends on. ' +
			'This series is about the other case, and it argues the opposite of the usual conclusion: ' +
			'using an agent well demands more of a single professional, not less, because one person now ' +
			'has to be the product owner, the project manager, the architect, the platform engineer, ' +
			'QA, and the reviewer. Every claim here is measured against two real repositories.',
		status: 'planned',
		parts: [
			{
				number: 1,
				title: 'The terminal I could not build',
				summary:
					'Six jobs, all of them one person’s, all of them staffed in the forty-minute conversation that happened before the first line of code.',
			},
			{
				number: 2,
				title: 'The process came first',
				summary:
					'Seven steps from a decision to a merged pull request, and a definition of green that existed before there was anything to be green.',
			},
			{
				number: 3,
				title: 'You are now the whole team',
				summary:
					'Six roles, the mechanism each one built, and the six things that got through those mechanisms anyway.',
			},
			{
				number: 4,
				title: 'The repo is the prompt',
				summary:
					'Why an agent needs boundaries, and why a prompt is the wrong place to keep them.',
			},
			{
				number: 5,
				title: 'I stopped building the product to build the tool',
				summary:
					'Pausing the thing you care about for three weeks, and how to tell that from procrastination.',
			},
			{
				number: 6,
				title: 'Spec before code — and the spec has to name the classes',
				summary:
					'What a specification must contain before it can hold an agent to anything.',
			},
			{
				number: 7,
				title: 'Decided. Do not relitigate.',
				summary:
					'Settling a question so it stays settled, and the discipline of amending in the open.',
			},
			{
				number: 8,
				title: 'One definition of green',
				summary:
					'Reporting success on a subset is the most expensive mistake available, because the subset is chosen by the same reasoning that wrote the bug.',
			},
			{
				number: 9,
				title: 'The handoff prompt',
				summary: 'What has to survive when the context window does not.',
			},
			{
				number: 10,
				title: 'When the agent breaks its own instruments',
				summary:
					'Diagnosing a tool that reports success while measuring the wrong thing entirely.',
			},
			{
				number: 11,
				title: 'Testing with a human who cannot hear',
				summary:
					'The capstone: an agent driving a screen reader for someone who cannot check its work by listening.',
			},
		],
	},
	{
		slug: 'rust-beyond-systems',
		title: 'Rust Beyond Systems Programming',
		description:
			'The case that Rust is a good choice for ordinary applications — tools, services, desktop software — and not only for systems work.',
		status: 'planned',
		parts: [],
	},
];

/** Slugs accepted in post frontmatter. Consumed by the content schema. */
export const seriesSlugs = series.map((s) => s.slug) as [string, ...string[]];

export function getSeries(slug: string): Series {
	const found = series.find((s) => s.slug === slug);
	if (!found) {
		throw new Error(
			`Unknown series "${slug}". Add it to src/data/series.ts or fix the post frontmatter.`,
		);
	}
	return found;
}

export function seriesUrl(slug: string): string {
	return `/series/${slug}/`;
}
