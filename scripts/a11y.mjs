// Runs axe-core against every built page, in both light and dark mode, and
// exits non-zero on any violation. Run with `npm run a11y` after a build.
//
// The pages are served over HTTP rather than opened from disk because the site
// links its CSS and fonts by absolute path: from a file:// URL none of it loads,
// and an unstyled page passes colour checks it would fail in a browser.

import { createServer } from 'node:http';
import { readFile, readdir } from 'node:fs/promises';
import { join, extname, relative } from 'node:path';
import { chromium } from 'playwright';
import AxeBuilderImport from '@axe-core/playwright';

const AxeBuilder = AxeBuilderImport.default ?? AxeBuilderImport;

const DIST = join(process.cwd(), 'dist');
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
	'.pagefind': 'application/octet-stream',
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

// 404.html is not an index.html and so is invisible to findPages, but it is a
// real page a real reader lands on — and the one most likely to be reached by
// somebody already having a bad time. It gets tested like everything else.
const pages = [...(await findPages()), '/404.html'];
const browser = await chromium.launch();
let violations = 0;

for (const scheme of ['light', 'dark']) {
	const context = await browser.newContext({ colorScheme: scheme });
	const page = await context.newPage();

	console.log(`\n${scheme} mode`);
	for (const path of pages) {
		await page.goto(origin + path, { waitUntil: 'load' });
		const { violations: found } = await new AxeBuilder({ page })
			.withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice'])
			// The comment widget is a cross-origin iframe served by giscus.app, and
			// axe descends into frames by default. Its DOM is not ours: we cannot
			// fix its heading order or its contrast, and gating our deploy on a
			// third party's markup means an upstream regression stops us shipping.
			// Excluded here so the gate keeps testing what this repository controls
			// — which still includes the wrapper around it, since only the frame
			// itself is out of scope.
			.exclude('.giscus')
			.analyze();

		if (found.length === 0) {
			console.log(`  PASS  ${path}`);
			continue;
		}
		violations += found.length;
		console.log(`  FAIL  ${path}`);
		for (const issue of found) {
			console.log(`        [${issue.impact}] ${issue.id}: ${issue.help}`);
			for (const node of issue.nodes.slice(0, 3)) {
				console.log(`          ${node.target.join(' ')}`);
			}
		}
	}
	await context.close();
}

await browser.close();
server.close();

console.log(
	violations === 0
		? `\nNo accessibility violations across ${pages.length} pages in both colour schemes.`
		: `\n${violations} accessibility violation(s).`,
);
process.exit(violations === 0 ? 0 : 1);
