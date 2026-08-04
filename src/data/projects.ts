// Single source of truth for the Projects and Releases pages.
//
// `fallbackVersion` is only used when the GitHub API is unreachable at build
// time (offline builds, rate limiting). Keeping it roughly current is nice but
// not required — a successful build fetches the real latest release.

export interface Project {
	/** Display name. */
	name: string;
	/** Repository name under github.com/marlon-sousa. */
	repo: string;
	/** What the project does, in one or two sentences. */
	description: string;
	/** Last known release tag, used if the GitHub API cannot be reached. */
	fallbackVersion?: string;
}

export const GITHUB_USER = 'marlon-sousa';

export const projects: Project[] = [
	{
		name: 'Acter',
		repo: 'acter',
		description:
			'An accessible terminal for screen reader users. Its default mode is conversational: you type a command in an edit field and the result lands in a reviewable buffer where each command is a heading, so you navigate your session history the way you navigate a web page. Short output is read automatically, longer output is announced, and a single keystroke switches to full terminal emulation for ncurses programs such as nano. Written in Rust with Tauri 2, Windows first. In active development.',
	},
	{
		name: 'EnhancedFindDialog for NVDA',
		repo: 'EnhancedFindDialog',
		description:
			'Implements search improvements for NVDA, including search history, regular expression search, search wrapping per profile, case sensitivity, and contextual search information.',
		fallbackVersion: '1.9.0',
	},
	{
		name: 'EnhancedDictionaries for NVDA',
		repo: 'EnhancedDictionaries',
		description:
			'Brings profile-specific speech dictionary capabilities to NVDA. Allows dictionary entries and regular expression substitutions to trigger conditionally based on the active application profile.',
		fallbackVersion: '1.7.1',
	},
	{
		name: 'Timer for NVDA',
		repo: 'TimerForNVDA',
		description:
			'Brings flexible timer and stopwatch functionalities directly into NVDA, complete with progress monitoring, custom audio alarms, and easy-to-use settings dialogs.',
		fallbackVersion: '1.7.0',
	},
	{
		name: 'CustomAppModulesMapper for NVDA',
		repo: 'CustomAppModulesMapper',
		description:
			'Allows users to dynamically associate applications with existing NVDA app modules (or detach them completely) without writing any Python code.',
		fallbackVersion: '1.0.0',
	},
	{
		name: 'screen-readers-mcp',
		repo: 'screen-readers-mcp',
		description:
			'A Model Context Protocol (MCP) server that lets AI agents drive screen readers like NVDA: sending keyboard gestures, reading spoken and brailled output back, and running automated functional tests of screen reader add-ons.',
	},
];

export function repoUrl(project: Project): string {
	return `https://github.com/${GITHUB_USER}/${project.repo}`;
}
