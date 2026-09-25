// Checks the page layout in a real browser, at several widths, on every built
// page, and exits non-zero on any failure. Run with `npm run layout` after a
// build.
//
// It exists because of a bug nobody could see from the code: the top bar was a
// flex row spreading three things apart, and the language switcher renders
// nothing on a page with no translation. On those pages the bar had two things
// to spread instead of three, so the menu jumped to the right edge — and the
// manifesto, being in the menu, was where readers kept landing on it. Every
// page was individually fine; the fault was only visible between pages.
//
// So the checks are mostly comparisons rather than coordinates:
//
// - The menu sits in the same place on every page of a language. Its labels are
//   the same on all of them, so any movement is the layout reacting to the page.
// - While the menu shares a row with the site title, it is centred on the bar.
// - Nothing in the bar overlaps anything else, whatever the width, and neither
//   the site title nor any menu label is squeezed onto a second line.
// - The main column is centred and nothing scrolls sideways.
//
// Pages are served over HTTP for the same reason as in a11y.mjs — from a file://
// URL the absolute paths in the markup do not resolve, and an unstyled page has
// no layout to test.

import { createServer } from 'node:http';
import { readFile, readdir } from 'node:fs/promises';
import { join, extname, relative } from 'node:path';
import { chromium } from 'playwright';

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
};

// Wide desktop, laptop, tablet, phone, chosen to land on both sides of every
// layout change rather than to be exhaustive. 1312 is the header's breakpoint
// (82em): the narrowest width at which the menu shares a row with the title,
// and so the one where it is likeliest to collide with it. Move the breakpoint
// and this number moves with it.
const WIDTHS = [1440, 1312, 1280, 1024, 900, 768, 390];

// Rounding in the layout engine moves boxes by fractions of a pixel between
// otherwise identical pages. Anything past this is a real movement.
const TOLERANCE = 1;

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

// 404.html is left out on purpose: it renders both languages' menus and picks
// one with JavaScript, so it has no single menu to compare against the others.
const pages = await findPages();
const browser = await chromium.launch();
const page = await browser.newPage();

// Everything is measured in one pass inside the page, so a check reads as a
// comparison of numbers rather than a sequence of round trips.
function measure() {
	const box = (element) => {
		if (!element) return null;
		const { left, right, top, bottom, width } = element.getBoundingClientRect();
		return { left, right, top, bottom, width };
	};
	// How many lines an element's text is set on. A squeezed grid column keeps
	// everything centred and nothing overlapping by wrapping the text inside
	// it, so a breakpoint set too low shows up here and nowhere else.
	//
	// Only text is measured — an element's own box has padding and would read
	// as a line of its own — and fragments that overlap vertically count as one
	// line, because the smaller language marker sits at a different height from
	// the label beside it.
	const lines = (element) => {
		if (!element) return 0;
		const rects = [];
		const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
		for (let node = walker.nextNode(); node; node = walker.nextNode()) {
			const range = document.createRange();
			range.selectNodeContents(node);
			rects.push(...[...range.getClientRects()].filter((r) => r.width > 0));
		}
		const rows = [];
		for (const r of rects) {
			const row = rows.find((row) => r.top < row.bottom && row.top < r.bottom);
			if (row) {
				row.top = Math.min(row.top, r.top);
				row.bottom = Math.max(row.bottom, r.bottom);
			} else {
				rows.push({ top: r.top, bottom: r.bottom });
			}
		}
		return rows.length;
	};
	const root = document.documentElement;
	return {
		titleLines: lines(document.querySelector('header .site-title')),
		wrappedLinks: [...document.querySelectorAll('header .internal-links .label')]
			.filter((label) => lines(label) > 1)
			.map((label) => label.textContent.trim().replace(/\s+/g, ' ')),
		lang: root.lang,
		viewport: root.clientWidth,
		scrollWidth: root.scrollWidth,
		header: box(document.querySelector('header')),
		title: box(document.querySelector('header .site-title')),
		links: box(document.querySelector('header .internal-links')),
		items: [...document.querySelectorAll('header .internal-links a')].map((a) => ({
			label: a.querySelector('.label').textContent.trim().replace(/\s+/g, ' '),
			left: a.getBoundingClientRect().left,
		})),
		switcher: box(document.querySelector('header .language-switcher')),
		main: box(document.querySelector('main')),
	};
}

const overlaps = (a, b) =>
	a && b && a.left < b.right - TOLERANCE && b.left < a.right - TOLERANCE &&
	a.top < b.bottom - TOLERANCE && b.top < a.bottom - TOLERANCE;

const px = (n) => `${Math.round(n)}px`;

let failures = 0;

for (const width of WIDTHS) {
	await page.setViewportSize({ width, height: 900 });
	console.log(`\n${width}px`);

	/** The first page seen in each language, which every later one must match. */
	const reference = new Map();

	for (const path of pages) {
		await page.goto(origin + path, { waitUntil: 'load' });
		const m = await page.evaluate(measure);
		const problems = [];

		if (m.scrollWidth > m.viewport + TOLERANCE) {
			problems.push(`page scrolls sideways: ${px(m.scrollWidth)} wide in a ${px(m.viewport)} viewport`);
		}

		if (m.main) {
			const left = m.main.left;
			const right = m.viewport - m.main.right;
			if (Math.abs(left - right) > TOLERANCE) {
				problems.push(`main column is off centre: ${px(left)} on the left, ${px(right)} on the right`);
			}
		}

		if (m.titleLines > 1) problems.push(`site title wraps onto ${m.titleLines} lines`);
		for (const label of m.wrappedLinks) problems.push(`menu link "${label}" wraps onto more than one line`);

		const bar = [
			['site title', m.title],
			['menu', m.links],
			['language switcher', m.switcher],
		];
		for (let i = 0; i < bar.length; i++) {
			for (let j = i + 1; j < bar.length; j++) {
				if (overlaps(bar[i][1], bar[j][1])) problems.push(`${bar[i][0]} overlaps ${bar[j][0]}`);
			}
		}

		if (m.links && m.title && m.header) {
			const sharesRowWithTitle = m.links.top < m.title.bottom && m.title.top < m.links.bottom;
			if (sharesRowWithTitle) {
				const offset = (m.links.left + m.links.right) / 2 - (m.header.left + m.header.right) / 2;
				if (Math.abs(offset) > TOLERANCE) {
					problems.push(`menu is off centre by ${px(offset)} while it shares a row with the site title`);
				}
			}

			const first = reference.get(m.lang);
			if (!first) {
				reference.set(m.lang, { path, links: m.links, items: m.items });
			} else {
				// Every link, not just the menu as a whole: the current page's link
				// is bold, and before HeaderLink reserved the bold width the menu
				// kept its place while the links inside it shuffled by a few pixels.
				const moved = [
					['menu left', m.links.left, first.links.left],
					['menu top', m.links.top, first.links.top],
					['menu width', m.links.width, first.links.width],
					...m.items.map((item, i) => [`"${item.label}" left`, item.left, first.items[i]?.left ?? NaN]),
				].filter(([, here, there]) => !(Math.abs(here - there) <= TOLERANCE));
				if (moved.length > 0) {
					const detail = moved
						.map(([what, here, there]) => `${what} ${px(here)} here, ${px(there)} on ${first.path}`)
						.join('; ');
					problems.push(`menu moved: ${detail}`);
				}
			}
		}

		if (problems.length === 0) {
			console.log(`  PASS  ${path}`);
			continue;
		}
		failures += problems.length;
		console.log(`  FAIL  ${path}`);
		for (const problem of problems) console.log(`        ${problem}`);
	}
}

await browser.close();
server.close();

console.log(
	failures === 0
		? `\nLayout holds across ${pages.length} pages at ${WIDTHS.length} widths.`
		: `\n${failures} layout problem(s).`,
);
process.exit(failures === 0 ? 0 : 1);
