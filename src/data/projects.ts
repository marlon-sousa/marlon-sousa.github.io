// Single source of truth for the Projects and Releases pages.
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
	/** Repository name under github.com/marlon-sousa. */
	repo: string;
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
	return `https://github.com/${GITHUB_USER}/${project.repo}`;
}
