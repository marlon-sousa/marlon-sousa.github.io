// Generates the stand-in site shown while MAINTENANCE.md exists in the repo root.
//
// Deliberately dependency-free and independent of Astro: the most likely reason
// to take the site down is that something in the site itself is broken, so this
// must not need `npm install`, a working build, or anything else that could fail
// at the moment it is needed most.
//
// The message shown is the text of MAINTENANCE.md. An empty file is fine — the
// default text below is used — because creating an empty file on a phone is the
// fastest way to take the site down.

import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const DEFAULT_MESSAGE =
	'This site is temporarily offline while I fix something. It will be back shortly.';

function escapeHtml(value) {
	return value
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;');
}

const raw = existsSync('MAINTENANCE.md') ? readFileSync('MAINTENANCE.md', 'utf8') : '';

// Strip leading Markdown heading marks so a file written as "# Back Monday"
// does not render a literal hash. Everything else is shown as written.
const paragraphs = raw
	.split(/\n{2,}/)
	.map((block) => block.trim().replace(/^#+\s*/, ''))
	.filter(Boolean)
	.map((block) => `<p>${escapeHtml(block).replace(/\n/g, '<br />')}</p>`)
	.join('\n\t\t');

const body = paragraphs || `<p>${escapeHtml(DEFAULT_MESSAGE)}</p>`;

const html = `<!doctype html>
<html lang="en">
	<head>
		<meta charset="utf-8" />
		<meta name="viewport" content="width=device-width,initial-scale=1" />
		<meta name="robots" content="noindex" />
		<meta name="color-scheme" content="light dark" />
		<title>Marlon Sousa — temporarily offline</title>
		<style>
			:root { color-scheme: light dark; --ink: #222939; --surface: #fff; }
			@media (prefers-color-scheme: dark) {
				:root { --ink: #e2e7f0; --surface: #0f1219; }
			}
			body {
				margin: 0;
				padding: 3rem 1.25rem;
				background: var(--surface);
				color: var(--ink);
				font: 20px/1.7 system-ui, -apple-system, "Segoe UI", sans-serif;
			}
			main { max-width: 34rem; margin: 0 auto; }
			h1 { font-size: 2rem; line-height: 1.2; margin: 0 0 1rem; }
		</style>
	</head>
	<body>
		<main>
			<h1>Temporarily offline</h1>
			${body}
		</main>
	</body>
</html>
`;

mkdirSync('dist', { recursive: true });
for (const file of ['index.html', '404.html']) {
	writeFileSync(join('dist', file), html);
}
console.log('Maintenance page written to dist/index.html and dist/404.html');
