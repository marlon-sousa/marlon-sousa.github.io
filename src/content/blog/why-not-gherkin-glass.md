---
title: 'Why not gherkin glass?'
description: 'Why I needed Gherkin Glass: a suite of feature files I could navigate and read as a product owner, from one command, which no viewer I tried was made for. Then the first afternoon of decisions about what it would promise: addresses that never change, pages a screen reader can use, a voice that follows the feature file, sites that are served, and the evening an agent argued that the tool''s own name was the wrong title for its front page.'
pubDate: 'Nov 19 2026 12:01'
series: 'gherkin-glass-built-in-use'
seriesPart: 2
tags: ['ai engineering', 'ai', 'software engineering', 'accessibility', 'gherkin-glass']
draft: false
---

[Last time](article:available-in-two-days-to-be-used) I gave every headline of the
week: a complete first version on the first day, two redesigns while the tool was
in use, two traps a mature process still walked into, and the net that made the
rebuild safe. Before any of the process, though, you should know what was being
built and why I needed it. This part is the tool: why I believe in the format it
reads, what I could not do without it, and the first decisions about what it would
promise, because those promises are what every later part had to keep.

## Why Gherkin at all

I believe in Gherkin and in behaviour-driven development. A feature file says what
the software must do in sentences a product owner can read, and the same sentences
run as tests. That second half is what matters most to me: documentation that is
the tests cannot quietly drift away from what the code does, because the day it
does, a test fails.

With agents writing more and more of the code, I think that matters more each
year, not less. An agent can produce a lot of code in an evening. What tells you,
and the next agent, what that code is supposed to do has to be clear, has to be
read by people, and has to break when it stops being true. Gherkin is all three.

## Three hundred scenarios in an editor

[Itinera's conformance suite](https://github.com/itinera-dev/conformance) is
written in Gherkin. More than three hundred scenarios, spread over folders,
describing what every implementation of the library must do, in any language. It
is the most important document of that project, and it is hard to read as a whole.

Not because Gherkin is hard. A scenario is a few lines of plain language:

```gherkin
Scenario: A member borrows a book
  Given the book "Dune" is on the shelf
  When Ana borrows "Dune"
  Then the shelf no longer holds "Dune"
```

The difficulty is everything around it. The files sit in a repository, and you open
them one at a time in an editor. A table is a block of lines with `|` between the
cells. An outline is a template with placeholders in angle brackets, and the
scenarios it actually runs are something you assemble in your head from the tables
underneath. There is no overview of the suite, no list of what a tag covers, no way
to ask "where else is this step used?" A product owner who does not live in a
repository will rarely read them at all.

What I wanted was to read a suite the way a product owner would. Point a command at
a folder of feature files and get a website I can move through: a page per feature
and per folder, a heading for every rule and scenario, a link to every one of them
that keeps working, tables shown as tables, each outline shown with the runs it
produces, a page for every tag, a page of every step sentence with where it is
used, and search. And it had to be a command line tool, something I could run on my
own machine and in CI alike.

Before writing anything, we looked at what already existed, and tried
several viewers on a real suite of 66 features and 380 scenarios. Some are good
tools built around other needs: one is a single-page app, another is centred on
test results, others feed a larger documentation system or are no longer
maintained. None of them gave me that particular combination, a static site of
linkable pages built by one command, so we built our own. The project's
[first design note](https://github.com/marlon-sousa/gherkin-glass/blob/main/docs/design/0001-rust-and-the-gherkin-crate.md)
records what was tried and why.

Later, on the fifth day, I put one more reason into words:

> One of the main goals for gherkin glass is facilitate me to look for new proposals. Think on itinera-s conformance, on a new tier. I want to run a diff of a given pr and see only what changed. Not the diffs, but ratter the files. So I want to generate a site with only files changed.

That is the second alpha's `--only` flag: a site built from a list of changed
files, so the feature files a pull request touches can be read as pages rather than
as a diff. It comes much later. The first version had to make the whole suite
readable first.

## What a page promises

The first afternoon was spent on promises. Not features: promises, the things a
reader would come to rely on and that the code would never be allowed to break. A
handful of them shaped everything after. Accessibility is one of them, a pillar of
the project from the first page, though not the reason it exists.

### Accessibility is behaviour

The project's agent manual says it in one line, in the third of its rules:
"A page that fails the accessibility check is a failing test, never a warning to
skip." Every page is checked in a real browser with
[axe-core](https://github.com/dequelabs/axe-core), against WCAG 2.2 at
levels A and AA, in the light and the dark theme, and driven with the keyboard
alone. Colours in the pages reach a contrast of 7:1, well past what the standard
asks. Colour and highlighting never carry meaning on their own.

One check the agents could not run. When we listed what the browser check would
cover, I wrote:

> Agree. nvda is not included here, as you cannot use it on cloud. The rest you can.

[NVDA](https://github.com/nvaccess/nvda) is my screen reader. Listening to the pages stayed my job, and every pull
request that changed what a page says carries a manual checklist for it. You will
see in a later part how much that job found.

### The content is in the HTML

JavaScript is assumed and drives the interactive parts, but the content is always
in the page's HTML, never built by a script. Headings, anchors and links exist as
the page loads. A screen reader that arrives before the script runs still finds the
whole feature. The only exceptions, agreed in their issues, are the folder tree,
built from shared data because everything it links to is also reachable from the
folder pages, and what search finds.

### Addresses are promises

Every rule, scenario and background gets an anchor made from its name. Once a link
to a scenario is in a ticket or a chat, it has to keep working for as long as the
file and the name do. Changing how an anchor is made needs a major version, agreed
in an issue. The agent asked how to treat letters like ã and ç, and recommended
keeping them as they are rather than transliterating, because "transliteration has
to guess per language, and it has nothing sensible to do with scripts like Greek or
Japanese, which Gherkin also supports." I asked the obvious question:

> I wouldn't know. Why do you nthink everyone then codes addresses with urlencode?

It answered with the standard, and with a test: it had opened an anchor written
both ways in Chromium, and both reached the heading. That is the kind of answer I
want. Not "trust me", but what it checked and how.

### A voice that follows the file

Gherkin can be written in 77 languages. A `# language: pt` line turns `Feature:`
into `Funcionalidade:`. Our own words, "Collapse all", "From the background:",
stayed English through the alphas, ready to be translated later through
[Fluent](https://github.com/projectfluent/fluent-rs). So a
Portuguese feature's page has Portuguese content and a few English words of ours.

The agent proposed marking our English words with `lang="en"`, so a screen reader
would switch to an English voice for them. It sounds right. It is wrong, and only a
screen reader user would know why:

> no, because then the english voice would read portuguese. Better to follow the lang of the feature and let some few words of our vocabulary go through.

A voice switch on every button, in the middle of a page in another language, would
be worse than a few English words read with a Portuguese accent. That is a product
decision no checker would have made.

## Served, not opened from disk

The longest discussion of that afternoon was about how a site is opened. Search
needs an index. The folder tree needs data. Modern scripts are modules. All of that
works when a web server delivers the pages, and much of it breaks when someone
double-clicks `index.html` and the browser opens it from disk.

I asked whether we could not just ship a server inside the tool:

> Can't we just embed as a dev dependency a rust webserve and make a ... how is our cli going to be called? ... serve?

> ghg I would say, to m,atch .ghgignore. and if we embed a serve, we don't need all limitations of working from disk.

That is how the command got its name, three letters to match the ignore file the
tool already read. The agent agreed on the name, checked that no crate on crates.io
held it, and then argued against the rest. Its recommendation was to keep pages
working from disk anyway, and it spelled out the cost of dropping that:

> a site opened by double-clicking a file, such as a downloaded CI artifact or a zip
> from a colleague, would show its pages, but the tree, search and anything else
> loaded with `fetch` would not work until someone runs `ghg serve` or publishes it.

It asked me to choose. I chose:

> we will drop disk support, and we need to make it clear that generated pages are to be served. Not only by ghg, one can use their own server I suppose, for example I suppose using the deploier to deploy on an astro based webserver would do, but for previewing it autonomously ghg server

I still think that was right. Real sites are published, and `ghg serve` covers the
preview. But hold on to the agent's warning, word for word. Two days later a friend
of mine tried the tool exactly the way it described. The warning was in a design
note, and in one sentence in the middle of the README's first paragraph. Nothing on
the pages themselves said it. That story is
[*A friend tried to build the project*](article:a-friend-tried-to-build-the-project).

Then `ghg serve` grew. Later that afternoon I asked whether a `--watch` mode, which
rebuilds when a feature file changes, would be complex. The agent said it was not,
"if we keep it to rebuilding and leave live reload out". I said yes, with one
condition:

> 26, but I want reloading also, otherwise it doesn't make any sense for me. When --watch is chosen, insert the machinery to update the current page, I suppose others will be served from what is generated, right?

Rebuilding without reloading means saving a file, switching to the browser,
pressing reload, and finding my place again with a screen reader. Reloading the
page I am on is the feature. Without it, the rest is not worth having.

## Why not gherkin glass?

That evening, with the threads already building in parallel, the coordinator was
bringing me their questions one at a time. One of them came from the thread
building the front page. The page's main heading would be the site's title, and the
thread recommended a `title` key in the configuration with a default of "Feature
files". It had even thought about the alternative "Features" and rejected it,
because the page already had a "Features" heading below, and a screen reader would
hear the same heading twice.

I asked the obvious thing:

> Why not gherkin glass?

The answer came back in seconds, and it disagreed with me:

> The title names the site the reader is looking at, not the tool that built it. A
> reader browsing a team's features who hears "Gherkin Glass" as the main heading
> learns the tool's name but not what the pages hold, while "Feature files" says
> what they are. The tool's name could still appear in a small "Built with
> gherkin-glass" line in the footer. That's only my lean, though, and "Gherkin
> Glass" works fine too if you prefer it.

It is right. The first thing a screen reader announces on a page is its main
heading, and a reader who arrives at a team's specifications wants to hear what
they are, not who made the website. I asked what happens when nobody sets a title,
and the answer was "Feature files" with a hint printed during the build. I said
"That's fine", and the next question came.

I tell this one because it is small, and because it is the whole relationship in
miniature. I proposed something, the agent pushed back with a reason grounded in
how the pages are actually used, it said plainly that the call was mine, and I took
its idea. It happened dozens of times that week. A process where that cannot happen
is not a process with an agent in it; it is a process with a typist.

## What the first version held

By the evening, the promises had become nineteen agreed issues, plus one for the
architecture and one for `ghg serve`:

- reading the input, with a `.ghgignore` file and every non-feature file ignored by
  default;
- a page for every feature file, with a heading and an anchor for every block, and
  unnamed scenarios allowed behind a setting;
- a page for every folder, a folder tree beside every page, and a front page;
- a page for every tag, with optional links from tags to an issue tracker;
- a page of every step sentence and where it is used;
- search across features, rules and scenarios;
- a light and a dark theme, and reader options the browser remembers;
- scenario outlines whose examples can be shown as the scenarios they produce;
- versioned output, so a project can publish one site per release;
- `ghg serve`, with `--watch` and live reload;
- release binaries for five platforms, `cargo ghg`, a GitHub Action and a project
  site showing the tool's output.

Every one of them was built that night. How that happened is the next part.

## What we learned

1. Documentation that is also the tests cannot drift, and with agents writing the code, that matters more each year.
2. Know what you need before you build: here, a suite you can navigate and read as a product owner, from one command.
3. Look at what exists first, and say briefly and fairly why it does not fit your need.
4. Decide the promises before the features: what a reader will rely on is what the code is never allowed to break.
5. Accessibility written as behaviour, with a failing test, holds; accessibility written as intent drifts.
6. Some checks only a person can do, and a project should name them and keep them.
7. Ask an agent how it checked, not only what it thinks; the good answers name a source or a test.
8. When an agent tells you the cost of your decision, put the cost where your users will meet it, not only where your team will read it.
9. An agent that disagrees with a reason is worth more than one that agrees.

## Which jobs this one was doing

Two, and the absences are honest: nothing was built yet for a project manager, a
platform engineer or QA to work on, and no change existed to review.

- **Product owner** — a suite I could navigate as a product owner, from one command,
  and the promises: addresses that never change, accessibility as behaviour, a voice that follows the feature file, reload as the reason for `--watch`,
  and "Feature files" taken over the tool's own name.
- **Architect** — dropping disk support for served sites, over the agent's
  recommendation, and naming the command `ghg` to match the ignore file.

The six are counted in [*The night that produced no code*](article:the-night-that-produced-no-code).

## Next time

How nineteen issues were agreed in an afternoon, one decision at a time, and how a
coordinator and a dozen parallel threads built all of them before the night was
over, while waits on CI quietly died. That is
[*One question at once, please*](article:one-question-at-once-please).
