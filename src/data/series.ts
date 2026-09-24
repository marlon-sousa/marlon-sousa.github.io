// The series registry: the single source of truth for multi-part writing.
//
// A series declares its full outline here, including parts that are not written
// yet. That is what lets a reader see where an article sits in the whole — "part
// 2 of 10" — and what is still to come, rather than only what happens to exist
// today.
//
// A blog post joins a series by naming the slug in its frontmatter and giving
// its `seriesPart` number. Nothing else about the post changes, so a standalone
// post can become part of a series later by adding two lines. A translation
// joins the same series as its original: the slug is the identity of the series
// itself, not of any one language's telling of it.
//
// Anything a reader sees — titles, descriptions, summaries — is `Localized`, so
// it can be one string when every language agrees or a per-language record when
// it does not. The slug is not: it is the URL segment and the value posts put in
// `series:`, and translating it would make two series out of one.
//
// Adding a series here does not publish anything: a series appears on the site
// only once at least one of its parts is published.

import { pick, type Localized } from '../i18n/localized';
import { localeUrl, type Locale } from '../i18n/config';

export interface SeriesPart {
	/** 1-based position in the reading order. Matches `seriesPart` in a post. */
	number: number;
	/** Planned title. A published post's own title takes precedence. */
	title: Localized;
	/** One line on what the part covers, shown while it is unpublished. */
	summary?: Localized;
}

export interface Series {
	/** URL segment: /series/<slug>. Also the value posts put in `series:`. */
	slug: string;
	/** Display title. */
	title: Localized;
	/** One sentence, used on listings and as the page description. */
	description: Localized;
	/** Optional longer introduction, shown on the series landing page. */
	intro?: Localized;
	/** The full outline, published or not. */
	parts: SeriesPart[];
	/**
	 * `planned` — declared, nothing published yet.
	 * `in-progress` — being published; the landing page says more is coming.
	 * `complete` — finished; no promise of more.
	 */
	status: 'planned' | 'in-progress' | 'complete';
	/**
	 * Whether the site may quote how many parts there are. Defaults to true.
	 *
	 * Declaring the outline and announcing its length are two different things.
	 * The outline helps a reader: it shows where an article sits and what is
	 * still to come. The count mostly helps them decide not to start — "part one
	 * of fifteen" is a commitment made to a stranger before the second part
	 * exists, and a long series reads as one somebody else has already abandoned.
	 *
	 * Set `false` and the outline still renders in full, unpublished parts and
	 * all. What disappears is the arithmetic: "All parts of X" rather than "All
	 * 15 parts of X", and "3 published so far" rather than "3 of 15 parts
	 * published". Nothing is hidden and nothing is promised.
	 *
	 * This is not the same problem as numbering parts in prose. A total here is
	 * one file, so changing it re-renders every page at once. It is an editorial
	 * choice about what to say to somebody who has not started reading yet.
	 */
	announcesLength?: boolean;
}

export const series: Series[] = [
	{
		slug: 'you-are-now-the-whole-team',
		title: {
			en: 'You are now the whole team',
			pt: 'Você agora é o time inteiro',
		},
		description: {
			en: 'What it actually takes to build professional software with an AI agent, drawn from the record of two projects built that way.',
			pt: 'O que realmente é preciso para construir software profissional com um agente de IA, a partir do registro de dois projetos construídos assim.',
		},
		intro: {
			en:
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
			pt:
				'Uma afirmação comum é que a IA torna a engenharia de software mais fácil, e que agora qualquer ' +
				'um consegue programar. A primeira metade é verdade: escrever código era lento e caro, e um ' +
				'agente realmente elimina esse custo. A segunda metade só é verdade para software do qual ' +
				'ninguém depende. Esta série defende o oposto da conclusão usual. Sempre fomos o engenheiro e ' +
				'o pedreiro ao mesmo tempo, porque no nosso ofício levantar as paredes é, em si, um trabalho ' +
				'ultraqualificado, e nunca houve um par de mãos mais barato para entregá-lo — então a ' +
				'engenharia sempre competiu com a construção, e perdeu. Agora que outra coisa pode assentar ' +
				'os tijolos, sobra uma pessoa segurando todos os papéis que um time costumava distribuir: ' +
				'product owner, gerente de projeto, arquiteto, engenheiro de plataforma, QA e revisor. Cada ' +
				'afirmação aqui é medida contra dois repositórios reais, e as conversas são citadas dos dois lados.',
		},
		// Deliberately empty: the outline is built from what has actually been
		// published, so the series page counts real articles rather than promising
		// a shape that is still changing. Parts get declared here only when the
		// order they are written in stops being negotiable.
		parts: [],
		status: 'in-progress',
	},
	{
		slug: 'engineering-with-ai',
		title: {
			en: 'Engineering with AI',
			pt: 'Engenharia com IA',
		},
		description: {
			en: 'What it actually takes to build professional software with an AI agent, drawn from the record of two projects built that way.',
			pt: 'O que realmente é preciso para construir software profissional com um agente de IA, a partir do registro de dois projetos construídos assim.',
		},
		intro: {
			en:
				'A common claim is that AI makes software engineering easier, and that anyone can now code. ' +
				'The first half is true. The second half is true for software nobody depends on. ' +
				'This series is about the other case, and it argues the opposite of the usual conclusion: ' +
				'using an agent well demands more of a single professional, not less, because one person now ' +
				'has to be the product owner, the project manager, the architect, the platform engineer, ' +
				'QA, and the reviewer. Every claim here is measured against two real repositories.',
			pt:
				'Uma afirmação comum é que a IA torna a engenharia de software mais fácil, e que agora qualquer ' +
				'um consegue programar. A primeira metade é verdade. A segunda é verdade para software do qual ' +
				'ninguém depende. Esta série é sobre o outro caso, e defende o oposto da conclusão usual: usar ' +
				'um agente bem exige mais de um único profissional, não menos, porque agora uma pessoa precisa ' +
				'ser o product owner, o gerente de projeto, o arquiteto, o engenheiro de plataforma, o QA e o ' +
				'revisor. Cada afirmação aqui é medida contra dois repositórios reais.',
		},
		status: 'planned',
		parts: [
			{
				number: 1,
				title: {
					en: 'The terminal I could not build',
					pt: 'O terminal que eu não conseguia construir',
				},
				summary: {
					en: 'Six jobs, all of them one person’s, all of them staffed in the forty-minute conversation that happened before the first line of code.',
					pt: 'Seis funções, todas de uma pessoa só, todas ocupadas na conversa de quarenta minutos que aconteceu antes da primeira linha de código.',
				},
			},
			{
				number: 2,
				title: {
					en: 'The process came first',
					pt: 'O processo veio primeiro',
				},
				summary: {
					en: 'Seven steps from a decision to a merged pull request, and a definition of green that existed before there was anything to be green.',
					pt: 'Sete passos de uma decisão até um pull request aprovado, e uma definição de verde que existia antes de haver qualquer coisa para ficar verde.',
				},
			},
			{
				number: 3,
				title: {
					en: 'You are now the whole team',
					pt: 'Você agora é o time inteiro',
				},
				summary: {
					en: 'Six roles, the mechanism each one built, and the six things that got through those mechanisms anyway.',
					pt: 'Seis papéis, o mecanismo que cada um construiu, e as seis coisas que passaram por esses mecanismos mesmo assim.',
				},
			},
			{
				number: 4,
				title: {
					en: 'The repo is the prompt',
					pt: 'O repositório é o prompt',
				},
				summary: {
					en: 'Why an agent needs boundaries, and why a prompt is the wrong place to keep them.',
					pt: 'Por que um agente precisa de limites, e por que um prompt é o lugar errado para guardá-los.',
				},
			},
			{
				number: 5,
				title: {
					en: 'I stopped building the product to build the tool',
					pt: 'Parei de construir o produto para construir a ferramenta',
				},
				summary: {
					en: 'Pausing the thing you care about for three weeks, and how to tell that from procrastination.',
					pt: 'Pausar por três semanas a coisa com que você se importa, e como distinguir isso de procrastinação.',
				},
			},
			{
				number: 6,
				title: {
					en: 'Spec before code — and the spec has to name the classes',
					pt: 'Especificação antes do código — e a especificação precisa nomear as classes',
				},
				summary: {
					en: 'What a specification must contain before it can hold an agent to anything.',
					pt: 'O que uma especificação precisa conter antes de poder cobrar qualquer coisa de um agente.',
				},
			},
			{
				number: 7,
				title: {
					en: 'Decided. Do not relitigate.',
					pt: 'Decidido. Não reabra.',
				},
				summary: {
					en: 'Settling a question so it stays settled, and the discipline of amending in the open.',
					pt: 'Resolver uma questão de modo que ela continue resolvida, e a disciplina de emendar às claras.',
				},
			},
			{
				number: 8,
				title: {
					en: 'One definition of green',
					pt: 'Uma definição de verde',
				},
				summary: {
					en: 'Reporting success on a subset is the most expensive mistake available, because the subset is chosen by the same reasoning that wrote the bug.',
					pt: 'Reportar sucesso sobre um subconjunto é o erro mais caro disponível, porque o subconjunto é escolhido pelo mesmo raciocínio que escreveu o defeito.',
				},
			},
			{
				number: 9,
				title: {
					en: 'The handoff prompt',
					pt: 'O prompt de passagem de bastão',
				},
				summary: {
					en: 'What has to survive when the context window does not.',
					pt: 'O que precisa sobreviver quando a janela de contexto não sobrevive.',
				},
			},
			{
				number: 10,
				title: {
					en: 'When the agent breaks its own instruments',
					pt: 'Quando o agente quebra os próprios instrumentos',
				},
				summary: {
					en: 'Diagnosing a tool that reports success while measuring the wrong thing entirely.',
					pt: 'Diagnosticar uma ferramenta que reporta sucesso enquanto mede a coisa completamente errada.',
				},
			},
			{
				number: 11,
				title: {
					en: 'Testing with a human who cannot hear',
					pt: 'Testar com um humano que não pode ouvir',
				},
				summary: {
					en: 'The capstone: an agent driving a screen reader for someone who cannot check its work by listening.',
					pt: 'O arremate: um agente dirigindo um leitor de tela para alguém que não pode conferir seu trabalho ouvindo.',
				},
			},
		],
	},
	{
		slug: 'is-our-loop-closed',
		// English only for now; the Portuguese fields arrive with the translation.
		title: 'The question CTOs are probably not asking: is our loop closed?',
		description:
			'In the era of AI agents everybody asks which model and how fast. Almost nobody asks how our loop between ' +
			'“it is written” and “it is right” actually closes, now that nobody remembers the code.',
		intro:
			'Agents write code now, and everybody has questions. How fast can we ship? Which model? Which tool? ' +
			'How many engineers do we still need? Good questions. Not the one, though. The one almost nobody is asking ' +
			'is this: how are we structuring software engineering, now that the code is no longer written by the ' +
			'people who used to remember it?\n\n' +
			'Every trade has a loop between “it is written” and “it is right”. Newspapers have one. Kitchens have ' +
			'one. So do we, and we drew it on slides for decades, built some of its stations and left the rest to a ' +
			'person who knew the code by heart. Did it work? It did, at a cost, for exactly as long as that person was ' +
			'in the room. An agent produces more code than any head can hold and remembers nothing from one session ' +
			'to the next. The holes in the loop do not close on their own. So. Is everything lost? Run for the hills? ' +
			'Or is there a way to do this right?\n\n' +
			'In this series, Marlon Sousa goes around that loop station by station: what each one was when a person ' +
			'filled it, what changes when an agent writes the code, and what has to change around it, in the team and ' +
			'in the organisation, for the answer to “is that code right?” to stop depending on anybody’s memory or ' +
			'anybody’s nod. He draws on two projects built that way, and on the years he spent as the person in the ' +
			'room, on both sides of that arrangement.',
		status: 'in-progress',
		// The series grows a station and a chair at a time, so its length is not a
		// number to quote at somebody who has not started reading. The outline still
		// renders in full. See `announcesLength`.
		announcesLength: false,
		parts: [
			{
				number: 1,
				title: 'The loop ran in somebody’s head',
				summary:
					'The loop every trade runs, the version our industry drew and only partly built, and the person who quietly filled the holes.',
			},
			{
				number: 2,
				title: 'Put an agent in the chair, and the rules of the game change',
				summary:
					'Four rules for the moment an agent takes the writer’s chair, and the one question about control you can answer about your own organisation today.',
			},
			{
				number: 3,
				title: 'The loop, built for real',
				summary:
					'Around the loop a second time, slowly: every station rebuilt so that it depends on nobody’s memory and nobody’s nod, and the six jobs put on the stations where they sit.',
			},
			{
				number: 4,
				title: 'Asking cost an engineer',
				summary:
					'The first of the chairs around the loop rather than the stations on it. A product owner who wanted to know whether an idea was even possible had one way to find out, and it cost somebody else’s committed week — so that loop never closed at all.',
			},
			{
				number: 5,
				title: 'The station nobody draws',
				summary:
					'How the loop reaches into the language you chose, and the one check that removes a whole class of mistakes before anybody has to remember them.',
			},
		],
	},
	{
		slug: 'rust-beyond-systems',
		title: {
			en: 'Rust Beyond Systems Programming',
			pt: 'Rust além da programação de sistemas',
		},
		description: {
			en: 'The case that Rust is a good choice for ordinary applications — tools, services, desktop software — and not only for systems work.',
			pt: 'O argumento de que Rust é uma boa escolha para aplicações comuns — ferramentas, serviços, software de desktop — e não só para trabalho de sistemas.',
		},
		status: 'in-progress',
		// Fifteen parts is the plan, not a promise to a stranger. The outline is
		// declared in full below and renders in full; the site simply does not
		// quote the number. See `announcesLength`.
		announcesLength: false,
		// Part titles and summaries are English only, by the same policy that makes
		// the articles English only: the Rust audience this is aimed at reads
		// English, and a Portuguese outline pointing at English articles would
		// promise something the series is not going to deliver. `Localized` takes a
		// plain string for exactly this case.
		//
		// The first three carry no code. From the fourth onward each part ends at a
		// tag in the postres repository — `part-04` for the fourth and so on, so the
		// number in the tag is the number of the part that made it.
		parts: [
			{
				number: 1,
				title: 'Write like TypeScript, deploy like Go',
				summary:
					'Building a bank in a language I had never written, while the corridor explained that Rust needs PhD-level programmers. Why what changed was not safety but relief.',
			},
			{
				number: 2,
				title: 'Put it next to what you already write',
				summary:
					'The things you actually like about TypeScript, Java, Python and Go, and where every one of them lives in Rust. No complaints in this one.',
			},
			{
				number: 3,
				title: 'The errors you are never going to see again',
				summary:
					'The failures that have nowhere left to happen once the types stop evaporating, the ones that stay, and what a strict compiler is worth when a machine is doing the typing.',
			},
			{
				number: 4,
				title: 'A converter is a small compiler',
				summary:
					'An empty directory becomes a project: a library and a binary, the module layout, the manifest, and a build checked on three operating systems from the first day.',
			},
			{
				number: 5,
				title: 'Arguments, and a log that does not block',
				summary:
					'Reading the command line, and why printing is synchronous — what a non-blocking writer does about it, and what that costs.',
			},
			{
				number: 6,
				title: 'Reading the collection',
				summary:
					'JSON with hundreds of optional fields, parsed into types. Where a String lives, where a &str points, and why they are two different things.',
			},
			{
				number: 7,
				title: 'Saying what went wrong',
				summary:
					'An error type the program can name, Result end to end, and the difference between a failure you can explain and one you can only report.',
			},
			{
				number: 8,
				title: 'Methods and traits',
				summary:
					'A string arrives and has to become something the program cannot get wrong. Traits where another language would reach for inheritance.',
			},
			{
				number: 9,
				title: 'The request and its builder',
				summary:
					'A value assembled in stages, the builder written by hand and then derived — and the story of a fork, a rejected pull request, and the better answer the maintainer gave.',
			},
			{
				number: 10,
				title: 'Bodies',
				summary:
					'One thing that is several shapes, each with its own optional parts: pattern matching and destructuring on data that genuinely varies.',
			},
			{
				number: 11,
				title: 'The output has nowhere to live',
				summary:
					'The program understands a request and still cannot produce anything, because nothing can hold the result. A tree with parents in it, and what it costs.',
			},
			{
				number: 12,
				title: 'Lowering',
				summary:
					'Turning one model into another without copying everything and without the compiler refusing the program. Borrowing, lifetimes, and clone as a legitimate first answer.',
			},
			{
				number: 13,
				title: 'Walking the tree',
				summary:
					'Every later step needs to visit every request. Implementing Iterator by hand, and then iterators in general on a structure that is not a list of numbers.',
			},
			{
				number: 14,
				title: 'Passes, and writing the file',
				summary:
					'Inherited settings, composed names, and then the writer. The first time the program produces output, four years after it was started.',
			},
			{
				number: 15,
				title: 'Shipping',
				summary:
					'A tool nobody can install is not a tool. Binaries for three platforms, one command to install it, and the closing measurement.',
			},
		],
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

export function seriesUrl(slug: string, locale: Locale): string {
	return localeUrl(`/series/${slug}/`, locale);
}

/** A series with every localized field already resolved, for rendering. */
export interface ResolvedSeries {
	slug: string;
	title: string;
	description: string;
	intro?: string;
	status: Series['status'];
	/** How many parts the outline declares, translated or not. */
	plannedParts: number;
	/** See `Series.announcesLength`. Resolved so templates need no default. */
	announcesLength: boolean;
}

export function resolveSeries(entry: Series, locale: Locale): ResolvedSeries {
	return {
		slug: entry.slug,
		title: pick(entry.title, locale),
		description: pick(entry.description, locale),
		intro: pick(entry.intro, locale),
		status: entry.status,
		plannedParts: entry.parts.length,
		announcesLength: entry.announcesLength ?? true,
	};
}

export function getResolvedSeries(slug: string, locale: Locale): ResolvedSeries {
	return resolveSeries(getSeries(slug), locale);
}
