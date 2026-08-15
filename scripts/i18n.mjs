// Checks the two halves of multi-language support that a build cannot check
// itself, and exits non-zero on either. Run with `npm run i18n` after a build.
//
// The first half is static and is really a link check: every hreflang a page
// advertises has to point at a page that was actually built, and the page it
// points at has to point back. A one-way or dangling alternate is invisible on
// the site and only shows up as a search engine quietly indexing the wrong
// version, which is the sort of thing nobody notices for months.
//
// The second half is the redirect in LanguagePreference.astro, which is the only
// behaviour on this site that depends on JavaScript at all. It is worth a real
// browser: the failure it guards against is sending a reader to a language they
// did not ask for, or worse, to a page that is not there.
//
// Pages are served over HTTP for the same reason as in a11y.mjs — from a file://
// URL the absolute paths in the markup do not resolve.

import { createServer } from 'node:http';
import { readFile, readdir } from 'node:fs/promises';
import { join, extname, relative } from 'node:path';
import { chromium } from 'playwright';

const DIST = join(process.cwd(), 'dist');
const STORAGE_KEY = 'preferred-language';
const TYPES = {
	'.html': 'text/html; charset=utf-8',
	'.css': 'text/css; charset=utf-8',
	'.js': 'text/javascript; charset=utf-8',
	'.json': 'application/json',
	'.svg': 'image/svg+xml',
	'.png': 'image/png',
	'.jpg': 'image/jpeg',
	'.woff': 'font/woff',
	'.woff2': 'font/woff2',
	'.xml': 'application/xml',
	'.wasm': 'application/wasm',
};

async function findPages(dir = DIST) {
	const pages = [];
	for (const entry of await readdir(dir, { withFileTypes: true })) {
		const full = join(dir, entry.name);
		if (entry.isDirectory()) {
			if (entry.name === 'pagefind' || entry.name === '_astro') continue;
			pages.push(...(await findPages(full)));
		} else if (entry.name === 'index.html') {
			const url = `/${relative(DIST, dir).split('\\').join('/')}`.replace(/\/$/, '');
			pages.push(url === '' ? '/' : `${url}/`);
		}
	}
	return pages.sort();
}

const server = createServer(async (req, res) => {
	try {
		const path = decodeURIComponent(req.url.split('?')[0]);
		const file = path.endsWith('/') ? join(DIST, path, 'index.html') : join(DIST, path);
		const body = await readFile(file);
		res.writeHead(200, { 'Content-Type': TYPES[extname(file)] ?? 'application/octet-stream' });
		res.end(body);
	} catch {
		res.writeHead(404).end('not found');
	}
});

await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
const origin = `http://127.0.0.1:${server.address().port}`;

const pages = await findPages();
const built = new Set(pages);
let failures = 0;

function fail(message) {
	failures += 1;
	console.log(`  FAIL  ${message}`);
}

// --- hreflang alternates -----------------------------------------------------

console.log('hreflang alternates');

const alternatesOf = new Map();

for (const path of pages) {
	const html = await readFile(join(DIST, path, 'index.html'), 'utf8');
	const found = [...html.matchAll(/<link rel="alternate" hreflang="([^"]+)" href="([^"]+)"/g)]
		.filter(([, tag]) => tag !== 'x-default')
		.map(([, tag, href]) => [tag, new URL(href).pathname]);
	alternatesOf.set(path, found);
}

for (const [path, alternates] of alternatesOf) {
	for (const [tag, target] of alternates) {
		if (!built.has(target)) {
			fail(`${path} advertises ${tag} -> ${target}, which was not built`);
			continue;
		}
		// Reciprocity: Google discards a whole hreflang cluster whose members do
		// not all name each other, so a one-way alternate is not a half-working
		// feature, it is a broken one.
		const back = alternatesOf.get(target) ?? [];
		if (!back.some(([, href]) => href === path)) {
			fail(`${path} points at ${target}, but ${target} does not point back`);
		}
	}
}

if (failures === 0) console.log(`  PASS  ${pages.length} pages, all alternates two-way`);

// --- internal links ----------------------------------------------------------
//
// Every other link on this site is generated from `translationOf` and cannot
// dangle. The links inside an article's prose are typed by hand, and they fail in
// the worst direction: a Portuguese sentence promising the next part, leading to a
// 404, in the language whose reader has the fewest other ways to find it.
//
// `article:` links are resolved at build time by plugins/remark-article-links.mjs
// and are safe by construction. This is what catches the ones written as plain
// URLs — including the ones written before that plugin existed.

console.log('\ninternal links');

const before = failures;
let checked = 0;

// 404.html is not an index.html, so findPages does not see it — but it is the
// one page whose links are followed by somebody who is already lost, and it
// carries a way back to every language. Scanned here with the rest.
const documents = [...pages.map((path) => [path, join(DIST, path, 'index.html')]), ['/404.html', join(DIST, '404.html')]];

for (const [path, file] of documents) {
	const html = await readFile(file, 'utf8');
	const hrefs = [...html.matchAll(/<a\b[^>]*\shref="([^"]+)"/g)].map(([, href]) => href);

	for (const href of new Set(hrefs)) {
		// Off-site, on-page, and non-http schemes are somebody else's problem.
		if (!href.startsWith('/') || href.startsWith('//')) continue;

		const target = href.split('#')[0].split('?')[0];
		if (target === '') continue;
		checked += 1;

		// A directory URL is a built page; anything with an extension is a file
		// that was emitted next to one, such as /rss.xml or a generated card.
		const exists = target.endsWith('/')
			? built.has(target)
			: await readFile(join(DIST, target)).then(
					() => true,
					() => false,
				);

		if (!exists) fail(`${path} links to ${target}, which was not built`);
	}
}

if (failures === before)
	console.log(`  PASS  ${checked} internal links across ${documents.length} pages`);

// --- the language-preference redirect ---------------------------------------

console.log('\nlanguage preference');

const cases = [
	{ name: 'Portuguese browser gets Portuguese', locale: 'pt-BR', from: '/', to: '/pt/' },
	{ name: 'English browser stays in English', locale: 'en-US', from: '/', to: '/' },
	{
		name: 'Portuguese browser follows an English article to its translation',
		locale: 'pt-BR',
		from: '/blog/the-terminal-i-could-not-build/',
		to: '/pt/blog/o-terminal-que-eu-nao-conseguia-construir/',
	},
	{
		// A /pt/ address is a deliberate request — usually a shared link — and an
		// operating system setting does not get to overrule it.
		name: 'a shared Portuguese link survives an English browser',
		locale: 'en-US',
		from: '/pt/',
		to: '/pt/',
	},
	{
		name: 'an explicit choice of English beats a Portuguese browser',
		locale: 'pt-BR',
		from: '/',
		choice: 'en',
		to: '/',
	},
	{
		name: 'an explicit choice of Portuguese beats an English browser',
		locale: 'en-US',
		from: '/',
		choice: 'pt',
		to: '/pt/',
	},
	{
		name: 'an explicit choice still applies to a shared link',
		locale: 'en-US',
		from: '/pt/',
		choice: 'en',
		to: '/',
	},
	{
		// Nothing to switch to, so the reader must be left where they are rather
		// than sent somewhere that does not exist.
		name: 'an untranslated page does not redirect',
		locale: 'pt-BR',
		from: '/tags/accessibility/',
		to: '/tags/accessibility/',
	},
];

const browser = await chromium.launch();

for (const { name, locale, from, to, choice } of cases) {
	const context = await browser.newContext({ locale });
	const page = await context.newPage();

	if (choice) {
		await page.goto(`${origin}/`);
		await page.evaluate(
			([key, value]) => localStorage.setItem(key, value),
			[STORAGE_KEY, choice],
		);
	}

	await page.goto(origin + from);
	await page.waitForLoadState('networkidle');
	const landed = new URL(page.url()).pathname;
	await context.close();

	if (landed === to) console.log(`  PASS  ${name}`);
	else fail(`${name}: ${from} landed on ${landed}, expected ${to}`);
}

await browser.close();
server.close();

if (failures > 0) {
	console.error(`\n${failures} language failure(s).`);
	process.exit(1);
}
console.log('\nLanguage routing, alternates and preference handling all correct.');
