// A value in the data files that may differ by language.
//
// Written as a plain string when every language says the same thing — a project
// name, a repository — and as a per-language record when it does not. That keeps
// src/data/*.ts readable: only the fields that actually needed translating look
// translated.
//
// A missing translation falls back to English rather than failing the build. The
// alternative is a Portuguese page that will not render because one summary of
// one unwritten part of one series has not been translated yet, and an English
// sentence in the middle of a Portuguese page is the smaller problem — it is
// also visible, which is how it gets noticed and fixed.

import { defaultLocale, type Locale } from './config';

export type Localized = string | Partial<Record<Locale, string>>;

export function pick(value: Localized, locale: Locale): string;
export function pick(value: Localized | undefined, locale: Locale): string | undefined;
export function pick(value: Localized | undefined, locale: Locale): string | undefined {
	if (value === undefined) return undefined;
	if (typeof value === 'string') return value;
	return value[locale] ?? value[defaultLocale];
}
