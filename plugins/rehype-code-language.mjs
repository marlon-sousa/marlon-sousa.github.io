// Labels every fenced code block with the language it is written in, and gives
// it a copy button.
//
// Shiki already tags its output with `data-language`, but nothing renders it, so
// a run of three blocks in a row — the same snippet in TypeScript, Python and
// Rust — arrives as three identical "code block" announcements with no way to
// tell which is which. The prose can say "TypeScript first, Rust underneath",
// and then the moment a third language joins one example and not another, that
// sentence is a lie the reader has to keep in their head.
//
// So the language is put in the document instead. Each `<pre>` is wrapped in a
// `<figure>` whose `<figcaption>` names the language: visible for a reader who
// can see it, part of the figure's accessible name for a reader who cannot, and
// true by construction because it comes from the fence.
//
// The `<pre>` also carries an `aria-label`. Astro makes it focusable so that a
// keyboard can scroll a wide block, and a focusable element that announces
// nothing is a dead stop in the tab order.
//
// The copy button is inert without JavaScript, so it is rendered `hidden` and
// the script in BlogPost.astro reveals it. A button that does nothing is worse
// than no button, and it would otherwise sit in the tab order promising
// something it cannot deliver.

import { visit } from 'unist-util-visit';

/**
 * Fence id to display name. An unknown id is shown as written rather than
 * dropped: a wrong-looking label is a bug report, a missing one is silence.
 */
const NAMES = {
	ts: 'TypeScript',
	typescript: 'TypeScript',
	tsx: 'TypeScript',
	js: 'JavaScript',
	javascript: 'JavaScript',
	jsx: 'JavaScript',
	rust: 'Rust',
	rs: 'Rust',
	python: 'Python',
	py: 'Python',
	java: 'Java',
	go: 'Go',
	c: 'C',
	cpp: 'C++',
	'c++': 'C++',
	csharp: 'C#',
	cs: 'C#',
	sh: 'Shell',
	bash: 'Shell',
	shell: 'Shell',
	console: 'Shell',
	json: 'JSON',
	yaml: 'YAML',
	yml: 'YAML',
	toml: 'TOML',
	html: 'HTML',
	css: 'CSS',
	sql: 'SQL',
	md: 'Markdown',
	markdown: 'Markdown',
	astro: 'Astro',
	diff: 'Diff',
	text: 'Plain text',
	plaintext: 'Plain text',
};

export default function rehypeCodeLanguage() {
	return (tree) => {
		visit(tree, 'element', (node, index, parent) => {
			if (node.tagName !== 'pre') return;
			if (!parent || index === undefined) return;
			// Already wrapped on a previous pass.
			if (parent.type === 'element' && parent.tagName === 'figure') return;

			const id = node.properties?.dataLanguage;
			if (typeof id !== 'string' || id === '') return;

			const name = NAMES[id.toLowerCase()] ?? id;

			node.properties = {
				...node.properties,
				'aria-label': `${name} code`,
			};

			parent.children[index] = {
				type: 'element',
				tagName: 'figure',
				properties: { className: ['code-figure'] },
				children: [
					{
						type: 'element',
						tagName: 'figcaption',
						properties: { className: ['code-figure__bar'] },
						children: [
							{
								type: 'element',
								tagName: 'span',
								properties: { className: ['code-figure__lang'] },
								children: [{ type: 'text', value: name }],
							},
							{
								type: 'element',
								tagName: 'button',
								properties: {
									type: 'button',
									className: ['code-figure__copy'],
									'data-code-copy': '',
									'aria-label': `Copy the ${name} code`,
									hidden: true,
								},
								children: [{ type: 'text', value: 'Copy' }],
							},
							{
								type: 'element',
								tagName: 'span',
								properties: { className: ['sr-only'], role: 'status', 'data-copy-status': '' },
								children: [],
							},
						],
					},
					node,
				],
			};

			// Do not descend into the node we just moved.
			return index + 1;
		});
	};
}
