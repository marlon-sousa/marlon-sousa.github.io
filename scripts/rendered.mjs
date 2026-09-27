// Checks that no built page has an empty body, and exits non-zero if one does.
// Run with `npm run rendered` after a build.
//
// The companion to build-strict.mjs, and deliberately a different kind of check.
// That one reads the build's own complaints; this one reads what the build
// actually wrote, so it catches an empty page whatever the reason — a render
// error that Astro swallowed silently, a layout change that stopped passing its
// slot through, a content entry that went missing.
//
// The signature is exact: the prose container opening and closing with nothing
// between it. That is what Astro emits when rendering a page's markdown threw.
// The check is deliberately narrow rather than a word count, because the
// interesting failure is total, and a threshold would eventually fail a short
// page that is short on purpose.

import { readdir, readFile } from 'node:fs/promises';
import { join, relative } from 'node:path';

const DIST = join(process.cwd(), 'dist');

// `<div class="prose" …></div>` — opened and closed with nothing inside.
const EMPTY_PROSE = /<div class="prose"[^>]*><\/div>/;

async function pages(dir) {
	const found = [];
	for (const entry of await readdir(dir, { withFileTypes: true })) {
		const path = join(dir, entry.name);
		if (entry.isDirectory()) found.push(...(await pages(path)));
		else if (entry.name.endsWith('.html')) found.push(path);
	}
	return found;
}

const all = await pages(DIST);
const empty = [];
let withProse = 0;

for (const path of all) {
	const html = await readFile(path, 'utf8');
	if (!html.includes('class="prose"')) continue;
	withProse += 1;
	if (EMPTY_PROSE.test(html)) empty.push(relative(DIST, path));
}

if (empty.length > 0) {
	console.error(`\n${empty.length} page(s) built with an empty body:\n`);
	for (const path of empty) console.error(`  ${path}`);
	console.error(
		'\nThe page exists, answers 200 and passes every other check, and there is\n' +
			'nothing on it. Look for a rendering error in the build output.',
	);
	process.exit(1);
}

console.log(`\nAll ${withProse} pages with a body have one. ${all.length} pages checked.`);
