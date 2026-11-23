// Single source of truth for the Projects page, and for the latest release each
// project card shows.
//
// `fallbackVersion` is only used when the GitHub API is unreachable at build
// time (offline builds, rate limiting). Keeping it roughly current is nice but
// not required — a successful build fetches the real latest release.
//
// Names and repositories are not translated: they are what the thing is called,
// in every language. Descriptions are.

import type { Localized } from '../i18n/localized';

export interface Project {
	/** Display name. */
	name: string;
	/** Repository name, under github.com/marlon-sousa unless `owner` says otherwise. */
	repo: string;
	/** GitHub user or organization the repository belongs to. Defaults to GITHUB_USER. */
	owner?: string;
	/** The project's own website, when it has one. */
	site?: string;
	/** Slug of a series in src/data/series.ts that tells the story of the project. */
	series?: string;
	/** What the project does, in one or two sentences. */
	description: Localized;
	/** Last known release tag, used if the GitHub API cannot be reached. */
	fallbackVersion?: string;
}

export const GITHUB_USER = 'marlon-sousa';

export const projects: Project[] = [
	{
		name: 'Acter',
		repo: 'acter',
		description: {
			en: 'An accessible terminal for screen reader users. Its default mode is conversational: you type a command in an edit field and the result lands in a reviewable buffer where each command is a heading, so you navigate your session history the way you navigate a web page. Short output is read automatically, longer output is announced, and a single keystroke switches to full terminal emulation for ncurses programs such as nano. Written in Rust with Tauri 2, Windows first. In active development.',
			pt: 'Um terminal acessível para quem usa leitor de tela. Seu modo padrão é conversacional: você digita um comando em um campo de edição e o resultado cai em um buffer revisável onde cada comando é um cabeçalho, de modo que você navega o histórico da sessão do jeito que navega uma página web. Saída curta é lida automaticamente, saída longa é anunciada, e uma única tecla alterna para emulação completa de terminal para programas ncurses como o nano. Escrito em Rust com Tauri 2, Windows primeiro. Em desenvolvimento ativo.',
		},
	},
	{
		name: 'Itinera',
		owner: 'itinera-dev',
		repo: 'itinera-rs',
		site: 'https://itinera-dev.org/',
		series: 'itinera-built-together',
		description: {
			en: 'A workflow framework that keeps business rules separate from flow control. Steps are business units that never know which workflow runs them; a workflow declares, in one place, the order of its steps and the policies that decide what happens after each outcome; and every executor reports a standard stream of events. It is defined by a language-neutral specification and a conformance suite every implementation must pass, with the Rust implementation in beta and TypeScript under way. Itinera lives in its own GitHub organization, and I am its main contributor.',
			pt: 'Um framework de workflows que mantém as regras de negócio separadas do controle de fluxo. Passos são unidades de negócio que nunca sabem qual workflow os executa; um workflow declara, em um só lugar, a ordem dos seus passos e as políticas que decidem o que acontece depois de cada resultado; e todo executor reporta um fluxo padronizado de eventos. É definido por uma especificação neutra em relação a linguagens e por uma suíte de conformidade que toda implementação precisa passar, com a implementação em Rust em beta e a de TypeScript a caminho. O Itinera vive em uma organização própria no GitHub, e eu sou o seu principal contribuidor.',
		},
	},
	{
		name: 'Gherkin Glass',
		repo: 'gherkin-glass',
		site: 'https://marlon-sousa.com/gherkin-glass/',
		series: 'gherkin-glass-built-in-use',
		description: {
			en: 'Turns a folder of Gherkin feature files into a static website that a product owner can navigate and read: a page for every feature, folder and tag, a folder tree, search across features, rules, scenarios, backgrounds and examples, and the steps written in plain language, with no testing framework to install. Built for screen readers first, every page passes an accessibility check in both colour schemes and fits a phone. Written in Rust, installed with cargo or as a binary for five platforms, at 1.0.0.',
			pt: 'Transforma uma pasta de arquivos de funcionalidades em Gherkin em um site estático que um product owner consegue navegar e ler: uma página para cada funcionalidade, pasta e tag, uma árvore de pastas, busca em funcionalidades, regras, cenários, contextos e exemplos, e os passos escritos em linguagem simples, sem nenhum framework de testes para instalar. Feito primeiro para leitores de tela, toda página passa por uma verificação de acessibilidade nos dois esquemas de cores e cabe em um celular. Escrito em Rust, instalado pelo cargo ou como binário para cinco plataformas, na versão 1.0.0.',
		},
	},
	{
		name: 'snapfit',
		repo: 'snapfit-rs',
		site: 'https://marlon-sousa.com/snapfit-rs/',
		description: {
			en: 'Compile-time verified dependency injection for Rust. The wiring is declared once, in a container struct, and the domain stays plain Rust, with no macros or framework traits on its types. A missing dependency or a cycle is a compile error that points at the field causing it, two instances of one type are simply two named fields, and every component is reached through a direct getter, with no lookup at run time. Gherkin Glass is wired with it. On crates.io, with a book of compiled examples.',
			pt: 'Injeção de dependências verificada em tempo de compilação para Rust. A ligação entre os componentes é declarada uma vez, em uma struct de contêiner, e o domínio continua sendo Rust puro, sem macros nem traits do framework nos seus tipos. Uma dependência faltando ou um ciclo é um erro de compilação que aponta para o campo que o causa, duas instâncias do mesmo tipo são simplesmente dois campos com nome, e cada componente é obtido por um getter direto, sem nenhuma busca em tempo de execução. O Gherkin Glass é montado com ele. No crates.io, com um livro de exemplos compilados.',
		},
		fallbackVersion: '0.2.0',
	},
	{
		name: 'compile-outcomes',
		repo: 'compile-outcomes-rs',
		description: {
			en: 'Compiles Rust snippets and hands your tests what the compiler said about each one, as data: whether it compiled, and every error and warning with its message, code and location. It judges nothing, so a plain #[test], a Gherkin scenario or any other framework decides what is right. Made for libraries that must test what they tell people who misuse them, such as the errors of a procedural macro. On crates.io.',
			pt: 'Compila trechos de Rust e entrega aos seus testes o que o compilador disse sobre cada um, como dados: se compilou, e cada erro e aviso com sua mensagem, código e localização. Não julga nada, então um #[test] simples, um cenário em Gherkin ou qualquer outro framework decide o que está certo. Feito para bibliotecas que precisam testar o que dizem a quem as usa errado, como os erros de uma macro procedural. No crates.io.',
		},
		fallbackVersion: '0.1.3',
	},
	{
		name: 'EnhancedFindDialog for NVDA',
		repo: 'EnhancedFindDialog',
		description: {
			en: 'Implements search improvements for NVDA, including search history, regular expression search, search wrapping per profile, case sensitivity, and contextual search information.',
			pt: 'Implementa melhorias de busca para o NVDA, incluindo histórico de busca, busca por expressões regulares, retorno ao início por perfil, diferenciação de maiúsculas e minúsculas, e informações contextuais sobre a busca.',
		},
		fallbackVersion: '1.9.0',
	},
	{
		name: 'EnhancedDictionaries for NVDA',
		repo: 'EnhancedDictionaries',
		description: {
			en: 'Brings profile-specific speech dictionary capabilities to NVDA. Allows dictionary entries and regular expression substitutions to trigger conditionally based on the active application profile.',
			pt: 'Traz dicionários de fala específicos por perfil para o NVDA. Permite que entradas de dicionário e substituições por expressões regulares sejam acionadas condicionalmente conforme o perfil de aplicativo ativo.',
		},
		fallbackVersion: '1.7.1',
	},
	{
		name: 'Timer for NVDA',
		repo: 'TimerForNVDA',
		description: {
			en: 'Brings flexible timer and stopwatch functionalities directly into NVDA, complete with progress monitoring, custom audio alarms, and easy-to-use settings dialogs.',
			pt: 'Traz temporizador e cronômetro flexíveis diretamente para dentro do NVDA, com acompanhamento de progresso, alarmes sonoros personalizados e diálogos de configuração fáceis de usar.',
		},
		fallbackVersion: '1.7.0',
	},
	{
		name: 'CustomAppModulesMapper for NVDA',
		repo: 'CustomAppModulesMapper',
		description: {
			en: 'Allows users to dynamically associate applications with existing NVDA app modules (or detach them completely) without writing any Python code.',
			pt: 'Permite associar aplicativos dinamicamente a app modules já existentes do NVDA (ou desvinculá-los completamente) sem escrever nenhuma linha de Python.',
		},
		fallbackVersion: '1.0.0',
	},
	{
		name: 'screen-readers-mcp',
		repo: 'screen-readers-mcp',
		description: {
			en: 'A Model Context Protocol (MCP) server that lets AI agents drive screen readers like NVDA: sending keyboard gestures, reading spoken and brailled output back, and running automated functional tests of screen reader add-ons.',
			pt: 'Um servidor Model Context Protocol (MCP) que permite a agentes de IA dirigir leitores de tela como o NVDA: enviar gestos de teclado, ler de volta a saída falada e em braille, e rodar testes funcionais automatizados de complementos de leitor de tela.',
		},
	},
];

export function repoUrl(project: Project): string {
	return `https://github.com/${project.owner ?? GITHUB_USER}/${project.repo}`;
}
