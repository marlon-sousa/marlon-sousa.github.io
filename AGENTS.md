## Development

When starting the dev server, use background mode:

```
astro dev --background
```

Manage the background server with `astro dev stop`, `astro dev status`, and `astro dev logs`.

## Languages

The site is published in English and Brazilian Portuguese. English is the default
and is **not** prefixed — `/blog/` — so every URL that predates translation still
resolves. Portuguese lives under `/pt/`.

- **Locales** are declared once, in `src/i18n/config.ts`. Nothing else should test
  for `'en'` to decide whether to add a prefix; use `localeUrl`, `getLocale` and
  `stripLocale`.
- **Interface strings** go in `src/i18n/ui.ts`. English is the source of truth and
  Portuguese is typed against it, so a missing translation fails `astro check`.
  Prose long enough to be *writing* does not belong there — see the About page,
  which is a component per language under `src/components/home/`.
- **Data files** (`src/data/*.ts`) use `Localized` from `src/i18n/localized.ts`:
  a plain string when every language says the same thing, a per-language record
  when they do not. Read it back with `pick(value, locale)`.
- **Components read their own locale** from `Astro.url` rather than taking it as
  a prop. Only per-article alternates are passed down, because those cannot be
  derived from the path.

### Adding a translation of an article

Put it in `src/content/blog/pt/` under a **translated file name** — that name is
the URL — and add `translationOf` to the frontmatter naming the English file
(no directory, no extension):

```yaml
translationOf: 'the-terminal-i-could-not-build'
```

That one field is what pairs the two for `hreflang`, for the language switcher
and for the preference redirect. `src/lib/posts.ts` fails the build if it names
an article that does not exist, so a broken pairing cannot ship.

Conversations with agents quoted inside an article stay in **English**, in both
versions: they are a record, and the articles promise they are reproduced exactly.
Translate the prose around them.

### Untranslated content is offered, not hidden

There is one rule for choosing which version of an article to link to, and it is
`selectVersion` in `src/lib/posts.ts`: **the reader's own language where it
exists, English otherwise, and never nothing.** A reader browsing in Portuguese
can always reach part four; they are simply told it is in English before they
follow it.

Everything that lists articles goes through `getReadablePosts(locale)` and renders
the link with `src/components/ArticleLink.astro`, which is the single place that
marking is done — the blog index, the series index, the series outline and the
pager all obey it because none of them decides for itself.

The marker goes **inside** the anchor, so it is part of the link's accessible
name. `hreflang` is set as well, but it is for search engines: no screen reader
announces it, so it is not on its own a way of telling anybody anything.

Two distinctions the code keeps, and that new code must not collapse:

- *Not translated* is a link, marked. *Not written at all* — a part declared in
  `src/data/series.ts` that nobody has published — is **not a link**, because a
  dead link still lands in a screen reader's link list and in the tab order.
- A series page is therefore built in **every** language as soon as any part of
  it is published, since a Portuguese listing has to link somewhere that exists.

Tags and RSS deliberately do **not** follow this rule. Tag vocabularies are
per-language and there is no identity pairing `acessibilidade` with
`accessibility`, so there is no "same thing" to look for. A feed is a
subscription rather than a page to browse, and cannot be skimmed past.

### Linking to another article from prose

Write the link by **identity**, not by URL, using the `article:` protocol and the
English file name — the same value `translationOf` takes:

```markdown
[O terminal que eu não conseguia construir](article:the-terminal-i-could-not-build)
```

`plugins/remark-article-links.mjs` resolves it to the translation in the file's
own language, or to English with the marker when there is none. That is what
makes the fallback retroactive: publishing a translation rewrites every link
already pointing at it, with nothing to go back and edit.

A plain `/blog/...` link is left alone. That is the point of the protocol — a
link that must stay English regardless is an ordinary URL, and the two intentions
are never confused. An unknown id fails the build, and so does linking to a
`draft`, which is not published and therefore has no page.

### The 404 page

`src/pages/404.astro` is the only page that cannot be built per language. GitHub
Pages answers every unmatched path with the one file at the root, so
`/pt/blog/nao-existe/` is served by it too and nothing on the server knows the
reader asked in Portuguese. It therefore renders **both** languages and chooses
between them client-side, preferring the requested path over any stored
preference, and rewrites its internal links to `/pt/` when it does. With
JavaScript off both messages show, which for a 404 is a fine failure mode.

### Checking it

`npm run i18n` (part of `npm run verify`) proves that every `hreflang` points at a
page that was built and that the two point back at each other, walks **every
internal link** in the built site and fails on any that was not built, and drives
a real browser through the language-preference redirect.

Prose links are the only ones written by hand, so they are the only ones that can
dangle — `article:` links are safe by construction, and that sweep is what catches
the rest. `404.html` is included in it, and in the accessibility sweep, even
though it is not an `index.html` and page discovery does not otherwise see it.

## Writing a series

**Every part after the first opens with a recap of the one before it.** Not a
heading, not a section further down the page — the first paragraph, before any
scene, anecdote or hook. It states what the previous part argued or measured, in
one or two sentences, and links to it by `article:` identity:

```markdown
[Last time](article:an-hour-a-day) I put numbers on all of it: 191 commits across
two repositories, an hour and a half of real work on the days I worked…
```

Then a sentence or two saying what *this* one does, so a reader who arrived from a
search result knows within four lines where they are and what they are missing.

The reason is that articles are read out of order and in isolation. A part that
opens on a scene is a part that assumes the reader has just finished the previous
one, which is the one thing that is almost never true. A recap costs a paragraph;
its absence costs the reader the argument.

A part may still *begin its story* with a scene — put the recap above it and let
the recap's last line hand over to it.

Series articles also close with a **Next time** naming what the following part
covers. Once that part is published, go back and turn the promise into an
`article:` link.

## Documentation

Full documentation: https://docs.astro.build

Consult these guides before working on related tasks:

- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Using React, Vue, Svelte, or other framework components](https://docs.astro.build/en/guides/framework-components/)
- [Adding or managing content](https://docs.astro.build/en/guides/content-collections/)
- [Adding styles or using Tailwind](https://docs.astro.build/en/guides/styling/)
- [Supporting multiple languages](https://docs.astro.build/en/guides/internationalization/)
