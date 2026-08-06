# marlon-sousa.github.io

Personal website and blog of Marlon Brandão de Sousa — accessibility engineering, NVDA add-ons, and writing about software development.

Built with [Astro](https://astro.build), deployed to GitHub Pages.

## Commands

| Command           | Action                                       |
| :---------------- | :------------------------------------------- |
| `npm install`     | Install dependencies                          |
| `npm run dev`     | Start the dev server at `localhost:4321`      |
| `npm run build`   | Build the production site to `./dist/`        |
| `npm run preview` | Preview the production build locally          |

Requires Node 22.12 or newer.

## Structure

```text
src/
├── components/   BaseHead, Header, Footer, Giscus, FormattedDate
├── content/blog/ Blog posts (Markdown / MDX)
├── data/         Project list and build-time GitHub release fetching
├── layouts/      BaseLayout (all pages) and BlogPost
├── pages/        Routes
└── styles/       global.css
```

## Adding a blog post

Create a Markdown or MDX file in `src/content/blog/`:

```markdown
---
title: 'Post title'
description: 'One-sentence summary, used for the listing page and RSS.'
pubDate: 'Aug 04 2026'
# heroImage: '../../assets/your-image.jpg'   optional
# updatedDate: 'Sep 01 2026'                 optional
---

Post body.
```

The filename becomes the URL. The schema in `src/content.config.ts` validates the
frontmatter at build time, so a typo fails the build rather than the page.

## Adding or updating a project

Edit `src/data/projects.ts`. Both the Projects page and the Releases page read
from that one list.

The Releases page fetches each project's latest release from the GitHub API at
build time, so version numbers and release notes never need to be edited by
hand. If the API is unreachable, it falls back to `fallbackVersion` from the
same file. Set `GITHUB_TOKEN` in the environment to raise the API rate limit —
GitHub Actions supplies one automatically.

## Accessibility

The site is intentionally plain and is expected to stay that way:

- Semantic landmarks (`header`, `nav`, `main`, `footer`) on every page
- A skip-to-content link as the first focusable element
- Visible focus indicators; focus outlines are never removed
- One `h1` per page and a correct heading hierarchy
- Nothing on the site requires JavaScript to read

## Comments

Comments use [Giscus](https://giscus.app) (GitHub Discussions). They are
currently **disabled**: `src/components/Giscus.astro` renders nothing until
`repoId` and `categoryId` are filled in. To enable, turn on Discussions for this
repository, create a "Comments" category, generate the IDs at giscus.app, and
paste them into that component.

## Deployment

`.github/workflows/deploy.yml` builds and deploys to GitHub Pages on every push
to `main`. GitHub Pages must be set to the "GitHub Actions" source in the
repository settings. The workflow also accepts a manual run that takes the site
offline or restores it; the file itself documents how.

## Credit

Started from the Astro blog starter, whose theme is based on
[Bear Blog](https://github.com/HermanMartinus/bearblog/).
