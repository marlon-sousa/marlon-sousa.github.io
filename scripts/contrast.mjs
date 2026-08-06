// Checks every foreground/background pair the site actually uses against the
// WCAG 2.1 AA thresholds, in both light and dark mode. Run with `npm run
// contrast`. Exits non-zero on a failure so it can gate a build.
//
// This exists because the author cannot check colour by eye, and neither can a
// screenshot: contrast is arithmetic, so it should be asserted, not admired.

const AA_NORMAL = 4.5;
const AA_LARGE = 3; // >= 24px, or >= 18.66px bold
const AA_NON_TEXT = 3; // focus rings, borders, meaningful graphics

function channel(value) {
	const c = value / 255;
	return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

function luminance([r, g, b]) {
	return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

function ratio(fg, bg) {
	const a = luminance(fg);
	const b = luminance(bg);
	const [light, dark] = a > b ? [a, b] : [b, a];
	return (light + 0.05) / (dark + 0.05);
}

const hex = (value) => [1, 3, 5].map((i) => parseInt(value.slice(i, i + 2), 16));

/** Flattens a translucent overlay onto a solid backdrop. */
const over = (top, alpha, bottom) => top.map((c, i) => Math.round(c * alpha + bottom[i] * (1 - alpha)));

const themes = {
	light: {
		ink: [15, 18, 25],
		inkBody: [34, 41, 57],
		inkMuted: [88, 105, 148],
		rule: [229, 233, 240],
		surface: [255, 255, 255],
		accent: hex('#2337ff'),
		accentDark: hex('#000d8a'),
	},
	dark: {
		ink: [246, 247, 249],
		inkBody: [226, 231, 240],
		inkMuted: [156, 169, 199],
		rule: [44, 51, 68],
		surface: [15, 18, 25],
		accent: hex('#97a4ff'),
		accentDark: hex('#c3cbff'),
	},
};

let failures = 0;

for (const [name, t] of Object.entries(themes)) {
	// The top 600px of every page sits under a 50% tint of --rule.
	const tinted = over(t.rule, 0.5, t.surface);

	const checks = [
		['body text on surface', t.inkBody, t.surface, AA_NORMAL],
		['body text on tinted band', t.inkBody, tinted, AA_NORMAL],
		['headings on tinted band', t.ink, tinted, AA_LARGE],
		['muted text (dates, counts) on surface', t.inkMuted, t.surface, AA_NORMAL],
		['muted text on tinted band', t.inkMuted, tinted, AA_NORMAL],
		['links on surface', t.accent, t.surface, AA_NORMAL],
		['links on tinted band', t.accent, tinted, AA_NORMAL],
		['skip link text on surface', t.accentDark, t.surface, AA_NORMAL],
		['focus ring against surface', t.accentDark, t.surface, AA_NON_TEXT],
		['focus ring against tinted band', t.accentDark, tinted, AA_NON_TEXT],
		['inline code text on code background', t.inkBody, t.rule, AA_NORMAL],
	];

	console.log(`\n${name} mode`);
	for (const [label, fg, bg, threshold] of checks) {
		const value = ratio(fg, bg);
		const ok = value >= threshold;
		if (!ok) failures++;
		console.log(
			`  ${ok ? 'PASS' : 'FAIL'}  ${value.toFixed(2)}:1  (needs ${threshold}:1)  ${label}`,
		);
	}
}

console.log(
	failures === 0
		? '\nAll contrast checks passed.'
		: `\n${failures} contrast check(s) failed.`,
);
process.exit(failures === 0 ? 0 : 1);
