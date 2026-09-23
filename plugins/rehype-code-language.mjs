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

/**
 * Token colours the highlighter emits that do not meet 4.5:1 on its own
 * background, mapped to ones that do.
 *
 * `npm run contrast` cannot catch these: it checks this site's palette, and a
 * theme paints with its own. The axe sweep does catch them, and found exactly
 * one — github-dark writes comments in #6a737d, which is 3.05:1 where 4.5:1 is
 * the floor. Every other token in the theme is 5.5:1 or better.
 *
 * A comment is not decoration here. It is frequently the line carrying the
 * point: the compiler error being quoted, the note saying which line does not
 * compile. It cannot be the one nobody can read. #9198a1 is 5.04:1 and stays
 * visibly quieter than the 11.5:1 of ordinary code, which is the whole job the
 * dim colour was doing.
 *
 * This lives here rather than in `shikiConfig` because the site sets a custom
 * markdown `processor`, and that bypasses `shikiConfig` entirely — the setting
 * is accepted and silently does nothing. Verified by trying it.
 */
const COLOR_FIXES = new Map([['#6a737d', '#9198a1']]);

/**
 * Rewrites unreadable token colours in whatever the highlighter left behind.
 *
 * It has to cope with two shapes. Sometimes highlighted code arrives as real
 * elements carrying a `style` property; sometimes the whole block arrives as a
 * single `raw` node holding HTML as a string, in which case there are no child
 * elements to walk and a tree traversal silently finds nothing at all. The
 * second shape is the one this site actually produces, which took a build and a
 * search through `dist/` to discover — so both are handled and neither is
 * assumed.
 */
function replaceIn(value) {
	let fixed = value;
	for (const [from, to] of COLOR_FIXES) {
		fixed = fixed.replace(new RegExp(from, 'gi'), to);
	}
	return fixed;
}

function fixColors(node) {
	const style = node.properties?.style;
	if (typeof style === 'string') {
		const fixed = replaceIn(style);
		if (fixed !== style) node.properties.style = fixed;
	}
	for (const child of node.children ?? []) {
		if (child.type === 'element') fixColors(child);
		else if ((child.type === 'raw' || child.type === 'text') && typeof child.value === 'string') {
			const fixed = replaceIn(child.value);
			if (fixed !== child.value) child.value = fixed;
		}
	}
}

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

			fixColors(node);

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
