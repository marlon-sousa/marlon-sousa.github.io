// Runs the forced production build and fails on a render error that Astro
// reports but does not itself treat as fatal. Run instead of `astro build
// --force` wherever the build has to be trustworthy.
//
// It exists because of the way part three of a series went out. The article
// linked to a draft with the `article:` protocol, `plugins/remark-article-links`
// refused it exactly as designed, and Astro's glob loader caught the exception,
// logged `[ERROR] [glob-loader] Error rendering …`, and carried on. The build
// exited zero. The page was emitted with an empty body, went through the whole
// gate green — an empty page is perfectly accessible, and its links all resolve
// because it has none — and sat published and blank for two days.
//
// So the rule is: a build that printed a rendering error did not succeed,
// whatever its exit code says. Anything matching a pattern below fails the run
// and is repeated at the end, because in a long build log the one line that
// mattered scrolls past between two hundred lines of green.

import { spawn } from 'node:child_process';

// Substrings that mean a page did not render, even on a zero exit.
const FATAL = [
	'Error rendering',
	'Failed to parse Markdown file',
	'[glob-loader]',
];

const offences = [];
let output = '';

function watch(chunk) {
	const text = chunk.toString();
	output += text;
	process.stdout.write(text);
}

const child = spawn('npx', ['astro', 'build', '--force'], {
	shell: true,
	stdio: ['inherit', 'pipe', 'pipe'],
});

child.stdout.on('data', watch);
child.stderr.on('data', watch);

child.on('close', (code) => {
	for (const line of output.split(/\r?\n/)) {
		if (FATAL.some((needle) => line.includes(needle))) offences.push(line.trim());
	}

	if (offences.length > 0) {
		console.error('\nThe build printed errors while rendering. It did not succeed.\n');
		for (const line of offences) console.error(`  ${line}`);
		console.error(
			'\nA page that fails to render is still emitted, with an empty body, and the\n' +
				'rest of the gate cannot see that. Fix the cause and build again.',
		);
		process.exit(1);
	}

	process.exit(code ?? 0);
});
