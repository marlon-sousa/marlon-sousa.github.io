// Every string the site chrome says in its own voice, in each language.
//
// Prose that is long enough to be *writing* rather than a label does not belong
// here — articles are Markdown files and the About page is a component per
// language. What lives here is the furniture: navigation, headings, counts, and
// the sentences that introduce a listing.
//
// English is the source of truth. `pt` is typed against it, so adding an English
// key and forgetting the Portuguese one fails `astro check` rather than shipping
// a blank label or an English word on a Portuguese page.

import { defaultLocale, type Locale } from './config';

const en = {
	'nav.primary': 'Primary Navigation',
	'nav.home': 'Home',
	'nav.blog': 'Blog',
	'nav.projects': 'Projects',
	'nav.releases': 'Releases',
	'nav.search': 'Search',
	'nav.skip': 'Skip to content',

	'lang.label': 'Language',
	'lang.switchTo': 'Read this page in {language}',
	// Marks a link to an article that has not been translated yet. It goes inside
	// the link, so it is part of the accessible name and a reader moving link by
	// link hears it before choosing. `hreflang` alone would not: that attribute is
	// for search engines, and no screen reader announces it.
	'lang.fallback': '(in {language})',

	'notFound.title': 'Page not found',
	'notFound.heading': 'That page is not here',
	'notFound.body':
		'The address may be mistyped, or the page may have moved since the link to it was made. ' +
		'Either way it is not something you did.',
	'notFound.tryThese': 'Somewhere to go from here:',

	'site.description':
		'Marlon Brandão de Sousa — software engineer working in payments and financial systems, ' +
		'blind developer, and digital accessibility advocate. Blog, open-source projects, and NVDA add-ons.',
	'site.homeTitle': 'Marlon Brandão de Sousa — payments, banking, AI engineering',
	/** Every page but the home page and an article suffixes the site name. */
	'site.pageTitle': '{page} - {site}',
	'site.ogEyebrow': 'Software engineering, accessibility, and Rust',

	'footer.rights': '© {year} {author}. All rights reserved.',
	'footer.elsewhere': 'Elsewhere',
	'footer.email': 'Email',
	'footer.rss': 'RSS feed',

	'blog.title': 'Blog',
	'blog.description': 'Articles on accessibility, screen readers, and software development',
	'blog.intro': 'Everything published here, newest first. You can also {tagLink}.',
	'blog.browseByTag': 'browse by tag',
	'blog.empty': 'No posts have been published yet.',
	'blog.draft': '(draft)',
	'blog.seriesPart': 'part {part}',

	'post.draftNotice': 'Draft — this is unfinished and is not published on the live site.',
	'post.lastUpdated': '(last updated on {date})',
	'post.tagged': 'Tagged:',
	'post.comments': 'Comments',
	'post.pageTitle': '{series} — part {part}: {title}',

	'series.badge': 'Part {part} in {series}',
	'series.eyebrow': '{series} — part {part}',
	'series.title': 'Series',
	'series.description': 'Multi-part article series, each written to be read in order.',
	'series.intro':
		'Some subjects do not fit in one post. These are written to be read in order, though each part stands on its own.',
	'series.empty': 'No series has been published yet.',
	'series.published_one': '{count} part published',
	'series.published_other': '{count} parts published',
	'series.ofPlanned': 'of {total} planned',
	'series.lastUpdated': 'last updated',
	'series.progress': '{published} of {total} parts published.',
	'series.parts': 'Parts',
	'series.unpublished': 'Not published yet',

	'pager.heading': 'More in this series',
	'pager.label': '{series} series',
	'pager.previous': 'Previous',
	'pager.next': 'Next',
	'pager.entry': '{direction} — part {number}: {title}',
	'pager.unpublished': '{entry} — not published yet',
	'pager.all': 'All {total} parts of {series}',

	'tags.title': 'Tags',
	'tags.description': 'Every topic written about on this site, with the posts under each.',
	'tags.intro': 'Every topic written about here, in alphabetical order.',
	'tags.empty': 'Nothing has been tagged yet.',
	'tags.count_one': '{count} post',
	'tags.count_other': '{count} posts',
	'tag.heading': 'Tagged: {tag}',
	'tag.description': 'Posts tagged {tag}.',
	'tag.seeAll': 'See all tags',
	'tag.partOf': 'part {part} of {series}',

	'projects.title': 'Projects',
	'projects.description': 'NVDA add-ons and accessibility tools developed by Marlon Sousa',
	'projects.intro':
		'Open-source tools I have built: an accessible terminal, NVDA add-ons that sharpen everyday screen reader workflows, and infrastructure for testing accessible software automatically.',
	'projects.view': 'View {repo} on GitHub',

	'releases.title': 'Releases',
	'releases.heading': 'Latest Releases',
	'releases.description': 'Latest software and add-on releases by Marlon Sousa',
	'releases.intro':
		'The most recent published release of each project. This page is generated from GitHub when the site is built, so it never falls behind.',
	'releases.empty':
		'No releases are available right now. Please check the project repositories directly.',
	'releases.released': 'Released {date}',
	'releases.download': 'Download {name} {version}',

	'search.title': 'Search',
	'search.heading': 'Search Content',
	'search.description': 'Search all articles and pages on this site',
	'search.intro': 'Use the search box below to instantly search through all articles and pages.',
} as const;

export type UIKey = keyof typeof en;

const pt: Record<UIKey, string> = {
	'nav.primary': 'Navegação principal',
	'nav.home': 'Início',
	'nav.blog': 'Blog',
	'nav.projects': 'Projetos',
	'nav.releases': 'Versões',
	'nav.search': 'Busca',
	'nav.skip': 'Pular para o conteúdo',

	'lang.label': 'Idioma',
	'lang.switchTo': 'Ler esta página em {language}',
	'lang.fallback': '(em {language})',

	'notFound.title': 'Página não encontrada',
	'notFound.heading': 'Essa página não está aqui',
	'notFound.body':
		'O endereço pode estar digitado errado, ou a página pode ter mudado de lugar depois que o ' +
		'link para ela foi criado. De qualquer forma, não foi nada que você fez.',
	'notFound.tryThese': 'Para onde ir a partir daqui:',

	'site.description':
		'Marlon Brandão de Sousa — engenheiro de software que trabalha com pagamentos e sistemas ' +
		'financeiros, desenvolvedor cego e defensor da acessibilidade digital. Blog, projetos de ' +
		'código aberto e complementos para o NVDA.',
	'site.homeTitle': 'Marlon Brandão de Sousa — pagamentos, bancos, engenharia com IA',
	'site.pageTitle': '{page} - {site}',
	'site.ogEyebrow': 'Engenharia de software, acessibilidade e Rust',

	'footer.rights': '© {year} {author}. Todos os direitos reservados.',
	'footer.elsewhere': 'Em outros lugares',
	'footer.email': 'E-mail',
	'footer.rss': 'Feed RSS',

	'blog.title': 'Blog',
	'blog.description': 'Artigos sobre acessibilidade, leitores de tela e desenvolvimento de software',
	'blog.intro': 'Tudo que foi publicado aqui, do mais recente para o mais antigo. Você também pode {tagLink}.',
	'blog.browseByTag': 'navegar por tema',
	'blog.empty': 'Nenhum artigo foi publicado ainda.',
	'blog.draft': '(rascunho)',
	'blog.seriesPart': 'parte {part}',

	'post.draftNotice': 'Rascunho — isto está inacabado e não é publicado no site.',
	'post.lastUpdated': '(atualizado pela última vez em {date})',
	'post.tagged': 'Temas:',
	'post.comments': 'Comentários',
	'post.pageTitle': '{series} — parte {part}: {title}',

	'series.badge': 'Parte {part} de {series}',
	'series.eyebrow': '{series} — parte {part}',
	'series.title': 'Séries',
	'series.description': 'Séries de artigos em várias partes, escritas para serem lidas em ordem.',
	'series.intro':
		'Alguns assuntos não cabem em um artigo só. Estes são escritos para serem lidos em ordem, embora cada parte se sustente sozinha.',
	'series.empty': 'Nenhuma série foi publicada ainda.',
	'series.published_one': '{count} parte publicada',
	'series.published_other': '{count} partes publicadas',
	'series.ofPlanned': 'de {total} planejadas',
	'series.lastUpdated': 'atualizada pela última vez em',
	'series.progress': '{published} de {total} partes publicadas.',
	'series.parts': 'Partes',
	'series.unpublished': 'Ainda não publicada',

	'pager.heading': 'Mais desta série',
	'pager.label': 'série {series}',
	'pager.previous': 'Anterior',
	'pager.next': 'Próxima',
	'pager.entry': '{direction} — parte {number}: {title}',
	'pager.unpublished': '{entry} — ainda não publicada',
	'pager.all': 'Todas as {total} partes de {series}',

	'tags.title': 'Temas',
	'tags.description': 'Todos os temas sobre os quais escrevo neste site, com os artigos de cada um.',
	'tags.intro': 'Todos os temas sobre os quais escrevo aqui, em ordem alfabética.',
	'tags.empty': 'Nada foi marcado com um tema ainda.',
	'tags.count_one': '{count} artigo',
	'tags.count_other': '{count} artigos',
	'tag.heading': 'Tema: {tag}',
	'tag.description': 'Artigos sobre {tag}.',
	'tag.seeAll': 'Ver todos os temas',
	'tag.partOf': 'parte {part} de {series}',

	'projects.title': 'Projetos',
	'projects.description':
		'Complementos para o NVDA e ferramentas de acessibilidade desenvolvidos por Marlon Sousa',
	'projects.intro':
		'Ferramentas de código aberto que construí: um terminal acessível, complementos que afiam o trabalho diário com leitores de tela, e infraestrutura para testar software acessível automaticamente.',
	'projects.view': 'Ver {repo} no GitHub',

	'releases.title': 'Versões',
	'releases.heading': 'Últimas versões',
	'releases.description': 'Últimas versões de software e complementos publicadas por Marlon Sousa',
	'releases.intro':
		'A versão publicada mais recente de cada projeto. Esta página é gerada a partir do GitHub quando o site é construído, então ela nunca fica desatualizada.',
	'releases.empty':
		'Nenhuma versão está disponível no momento. Consulte os repositórios dos projetos diretamente.',
	'releases.released': 'Publicada em {date}',
	'releases.download': 'Baixar {name} {version}',

	'search.title': 'Busca',
	'search.heading': 'Buscar no conteúdo',
	'search.description': 'Busque em todos os artigos e páginas deste site',
	'search.intro': 'Use o campo abaixo para buscar instantaneamente em todos os artigos e páginas.',
};

const dictionaries: Record<Locale, Record<UIKey, string>> = { en, pt };

type Vars = Record<string, string | number>;

function interpolate(template: string, vars?: Vars): string {
	if (!vars) return template;
	return template.replace(/\{(\w+)\}/g, (whole, name: string) =>
		name in vars ? String(vars[name]) : whole,
	);
}

export interface Translator {
	/** One string, with `{placeholders}` filled in from `vars`. */
	(key: UIKey, vars?: Vars): string;
	/**
	 * A counted string, picking `<key>_one` or `<key>_other` by the locale's own
	 * plural rules rather than by `count === 1`. `{count}` is filled in for free.
	 */
	n(key: string, count: number, vars?: Vars): string;
	/** The locale this translator speaks, for callers that need to pass it on. */
	locale: Locale;
}

export function useTranslations(locale: Locale): Translator {
	const dictionary = dictionaries[locale] ?? dictionaries[defaultLocale];
	const plurals = new Intl.PluralRules(locale === 'pt' ? 'pt-BR' : 'en-US');

	const t = ((key: UIKey, vars?: Vars) => interpolate(dictionary[key], vars)) as Translator;

	t.n = (key: string, count: number, vars?: Vars) => {
		const category = plurals.select(count);
		// Only `one` and `other` are ever written out; any other category a locale
		// might select falls back to `other`, which is the form that reads
		// correctly for every count except one.
		const exact = `${key}_${category}` as UIKey;
		const chosen = exact in dictionary ? exact : (`${key}_other` as UIKey);
		return interpolate(dictionary[chosen], { count, ...vars });
	};

	t.locale = locale;
	return t;
}
