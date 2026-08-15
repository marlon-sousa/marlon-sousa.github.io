// Build-time Open Graph image generation.
//
// Every page gets a 1200x630 PNG carrying its own title, so a link shared on
// LinkedIn shows what it actually points at instead of a grey box. Satori lays
// the text out and converts it to vector paths using the bundled Atkinson font,
// which means the result does not depend on whatever fonts the build machine
// happens to have installed — the same input renders identically on Windows and
// on the CI runner.

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import satori from 'satori';
import sharp from 'sharp';
import { defaultLocale, type Locale } from '../i18n/config';

/**
 * Where the card for one slug lives.
 *
 * The slug space mirrors the content collection: a Portuguese card sits under
 * `pt/`, exactly as its article does. That is a directory inside /og/ rather
 * than a language prefix in front of it — these are images, not pages, and they
 * are not something a reader navigates to in a language.
 */
export function ogPath(slug: string, locale: Locale): string {
	const prefix = locale === defaultLocale ? '' : `${locale}/`;
	return `/og/${prefix}${slug}.png`;
}

// Resolved against the project root rather than import.meta.url: this module is
// bundled into dist/.prerender/chunks during a build, so a path relative to the
// source file no longer points anywhere near the fonts.
const font = (name: string) => readFileSync(join(process.cwd(), 'src/assets/fonts', name));

const regular = font('atkinson-regular.woff');
const bold = font('atkinson-bold.woff');

const INK = '#f6f7f9';
const BACKGROUND = '#0f1219';
const ACCENT = '#8f9dff';
const MUTED = 'rgba(246, 247, 249, 0.62)';

/** Braille "m" — dots 1, 3 and 4 raised — matching the site favicon. */
const BRAILLE_M = [true, false, true, true, false, false];

function brailleCell() {
	return {
		type: 'div',
		props: {
			style: { display: 'flex', gap: '10px' },
			children: [0, 1].map((column) => ({
				type: 'div',
				props: {
					style: { display: 'flex', flexDirection: 'column', gap: '10px' },
					children: [0, 1, 2].map((row) => ({
						type: 'div',
						props: {
							style: {
								width: '16px',
								height: '16px',
								borderRadius: '8px',
								backgroundColor: INK,
								opacity: BRAILLE_M[column * 3 + row] ? 1 : 0.22,
							},
						},
					})),
				},
			})),
		},
	};
}

export interface OgOptions {
	title: string;
	/** Small line above the title — the series name, or a section label. */
	eyebrow?: string;
}

export async function renderOgImage({ title, eyebrow }: OgOptions): Promise<Buffer> {
	// Satori has no line clamping, so an unbounded title would overflow the
	// canvas rather than wrap out of sight. Cut it before it can.
	const heading = title.length > 90 ? `${title.slice(0, 89).trimEnd()}…` : title;

	const svg = await satori(
		{
			type: 'div',
			props: {
				style: {
					width: '1200px',
					height: '630px',
					display: 'flex',
					flexDirection: 'column',
					justifyContent: 'space-between',
					padding: '72px 80px',
					backgroundColor: BACKGROUND,
					color: INK,
					fontFamily: 'Atkinson',
				},
				children: [
					{
						type: 'div',
						props: {
							style: {
								display: 'flex',
								fontSize: '30px',
								color: ACCENT,
								letterSpacing: '0.04em',
							},
							children: eyebrow ?? '',
						},
					},
					{
						type: 'div',
						props: {
							style: {
								display: 'flex',
								fontSize: heading.length > 55 ? '62px' : '76px',
								fontWeight: 700,
								lineHeight: 1.15,
							},
							children: heading,
						},
					},
					{
						type: 'div',
						props: {
							style: {
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'space-between',
								fontSize: '28px',
								color: MUTED,
							},
							children: [
								{
									type: 'div',
									props: {
										style: { display: 'flex', alignItems: 'center', gap: '24px' },
										children: [
											brailleCell(),
											{ type: 'div', props: { children: 'Marlon Brandão de Sousa' } },
										],
									},
								},
								{ type: 'div', props: { children: 'marlon-sousa.github.io' } },
							],
						},
					},
				],
			},
		},
		{
			width: 1200,
			height: 630,
			fonts: [
				{ name: 'Atkinson', data: regular, weight: 400, style: 'normal' },
				{ name: 'Atkinson', data: bold, weight: 700, style: 'normal' },
			],
		},
	);

	return sharp(Buffer.from(svg)).png().toBuffer();
}
