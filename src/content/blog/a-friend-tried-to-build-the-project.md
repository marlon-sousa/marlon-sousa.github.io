---
title: 'A friend tried to build the project'
description: 'Feedback from real people while the rebuild was still going on. A friend got pages with no script and no style, the README taught nothing, the first alpha went out the next morning, and an agent playing product owner in a real browser found twelve things wrong with the interface, the same things an outside tester reported on their own.'
pubDate: 'Nov 17 2026 12:06'
series: 'gherkin-glass-built-in-use'
seriesPart: 7
tags: ['ai engineering', 'ai', 'software engineering', 'accessibility', 'gherkin-glass']
draft: true
---

[Last time](article:so-we-could-refactor-just-the-way-we-wanted) the core of the
tool was rebuilt twice in a day, under a net that compared every page byte for byte,
and not one expected page changed. I closed by saying what that net could not catch:
a page that is right by the specification and wrong for a person. This time is
about the people. A friend who tried the tool the obvious way, a README that taught
nothing, a first alpha, and the first outside eyes on the published site, all while
the architecture was still settling. It is the part that shows why being usable on
the second day matters more than being right on the second day.

## No script, no style

At 20:50 on the third day I wrote "all merged" under the eleventh pull request of
the redesign. Two minutes later:

> I want to discuss something else: a friend tried to build the project. They did cargo build, a susual, and they got no js or css inserted.

The agent asked the right first question, whether my friend had opened the pages
straight from disk or through `ghg serve`, and asked the coordinator for a thread to
reproduce it from a fresh clone. I had a guess of my own, and an opinion:

> not sure, but I think cargo build doesn't generate the typescript, and this is my guess. Anywaysm readme is ridiculous as of now, it teaches nothing

My guess was wrong, and the agent said so with the evidence. The compiled script and
stylesheet are committed to the repository, which it checked, so `cargo build` needs
no Node and has nothing to compile. The new thread found the most likely cause
within the hour. My friend had built a site and opened it by double-clicking a page.
Opened from a file address, the browser blocks the page's script, which is a module,
and the page comes up looking unstyled and doing nothing.

You have read this before. On the first afternoon, when I decided sites would be
served rather than opened from disk, the agent spelled out exactly this cost: a site
opened by double-clicking a file "would show its pages, but the tree, search and
anything else loaded with `fetch` would not work". The decision was right. The README
even said, in one sentence in the middle of its first paragraph, that opening pages
from disk was not supported. The same paragraph still called `ghg serve` "planned",
two days after it had shipped.

## A page that tells you

The fix was not to bring disk support back. It was to make the decision impossible
to miss, in the one place my friend was actually looking: the page.

Every page now carries a short script, inlined so it runs even from disk, that
checks how the page was opened. Opened from a file, the page shows a dialog titled
"Opened from disk", saying what does not work this way and how to serve the site.
Focus goes to the dialog, and it closes with a button or the Escape key. It became a
rule in the behaviour document, with a fixture and a test, like everything else.

And the README was rewritten from scratch, twice in less than a day. The first rewrite made
it teach: how to clone, build, serve the example suite, write a `ghg.toml` of your
own, and why sites must be served. The second, the next morning, turned it into a
document for people using the tool rather than people building it, and became the
front page of the project's site. From then on the reviewer's checklist has an item
for it: every command, flag or setting a change touches must be described as it is,
in the README's tables, for a person using `ghg`.

What I take from this is not about disk support. When an agent tells you the cost
of a decision, the cost goes into a design note, which your team reads. Your users
do not read design notes. Put the cost where they will meet it.

## The first alpha

The same evening I decided what the first release would be called and where it
would go. It would be a `0.1.0-alpha.1`, a preview to try and to complain about,
not a promise. And it would not go to crates.io. I had questioned that on the very
first night:

> if we are making a binary available, why should we publish the crate?

The answer we settled on: alphas and betas are pre-releases on GitHub only, with
binaries for every platform and their own folder on the project's site. Release
candidates and stable versions go to crates.io. Nobody who runs `cargo install`
should get an alpha by accident.

The project's site needed a front page, and we agreed it would be the README itself,
processed by the site's build, with marks for the parts that belong only on GitHub
or only on the site. The release pull request was generated the way [itinera-rs](https://github.com/itinera-dev/itinera-rs) does
it, with the changelog written by [git-cliff](https://github.com/orhun/git-cliff) from the commit messages.

The agents prepared everything up to the tag. The tag itself is mine. A cloud session
cannot push one, and I would not want it to: a tag is the one act in this whole cycle
that publishes something to people outside the project. I tagged it on Friday at
09:35. The release built six assets, created the site's branch, and the site went up
at marlon-sousa.com/gherkin-glass/, with the example suite as the first thing a
visitor sees.

Less than three days after the first commit.

## An agent playing product owner

The alpha's first outside review was not done by a person. That afternoon I brought
in an independent agent, given a browser it could drive, to review the published
example site as a product owner would. It worked in Chromium
through [Playwright](https://github.com/microsoft/playwright), at a laptop's width and a phone's, in the light and the dark
theme, and wrote a report I pasted into the project:

> Reviewed: https://marlon-sousa.com/gherkin-glass/v0.1.0-alpha.1/ (release
> 0.1.0-alpha.1), in Chromium through Playwright, at 1366×850 and 390×844, in light
> and dark themes. This list covers fixes to the current interface only.

Twelve fixes. The first, marked high, reads like this:

> Seen at 1366px: the tree's divider is at x=288. The search label starts at x=288,
> with no gap. The breadcrumb and the page heading start at x=340. At 390px the search
> starts at x=0, touching the screen edge, while the other content has a 16px margin.
> An outside tester reported this independently.

That last sentence is the one I want you to notice. An outside tester, a person, had
reported the same thing in their own words. The two reviews agreed.

I cannot see a layout. I hear a page in order, headings and lists and links, and a
search box that touches the folder tree's divider sounds exactly like one with a
comfortable margin. For half of what this tool is, the visual half, my own review is
blind. An agent with a browser and a measuring tape is not a replacement for a sighted
person who uses the site. But it found the same problems one did, it found them in an
afternoon, and it gave me coordinates instead of impressions.

## Evaluate first

I did not hand the report to a thread to fix. I asked the agent to judge it first:

> Evaluate first with your opinion

It went through them one by one. It found the review sound, disagreed with one item,
and found another already covered. I added two things of my own while we went
through it. The first was an icon, which did not
exist:

> I agree. A gherkin glass, literally, you can compose. I also miss a footer, pointing as a ink the repo, and the version used to generate the pages. Including in the fromt page

A glass with a gherkin in it, drawn as a small vector image, and a footer on every page
naming the version of `ghg` that built it, with a link to the repository. The next
morning, when it was shown to me, I asked the only question about it a person who
cannot see an icon would ask:

> is the glass opened or closed?

The second thing came from the item the agent disagreed with, about resizing. The
report said the layout did not follow a window being narrowed. I wanted it checked
the way the reviewer had checked it, because if that was true, the stylesheet did not
react to size at all, and that was the bigger problem:

> Agree with the footer. And as for 6, it is worth doing the same thing the other reviewer did. Because if this is true, it means that our css does not react to resizing, which is something you should fix. Report the result.

And on a narrow screen, the folder tree could not simply be hidden:

> No. In small screens it has to have a button to expand or do whatever, you know better than me what that would be for other apps. It is normal for us to deal with different behavior deppending on screen size.

## Every reviewer looks now

Then the rule that made sure this kind of report would never again come only from
outside:

> The revieww rules should also gt a visual session, if it is not yet available.

Every independent reviewer, from that day, judges whether a change can alter how a
page looks. If it can, it builds the fixtures' sites and the example suite, serves
them, and looks at the pages the change touches, plus a feature page, a folder page
and the front page, in Chromium, at the same two widths, in both themes, with
screenshots, and once more after narrowing the window without a reload. It reports
anything out of line, overlapping, cut off, crowded or touching an edge.

Not for every change, though:

> yes, but only if it finds is relevant. For example, a var renaming on a policy wouldn't trigger behavior, and these are expensive tests. The reviewer must judge

A check that runs on everything is a check people learn to wait out. A check the
reviewer decides to run, and has to say why it did or did not, is one that stays
meaningful.

The fixes, the icon, the footer and the folder tree's button on narrow screens were
built that evening, as a stack of their own, and became part of the second alpha.

## Why this is the point

Count the days. The friend's report came on the third evening, while the redesign
had been merged for two minutes. The first alpha went out the next morning. The
product owner review, the outside tester and the visual rule came that afternoon.
None of it waited for the architecture to be finished, because the tool had been
usable since the second day, and every rebuild underneath kept every page exactly as
it was.

Had I waited for the design to be right before letting anyone use it, the design
would have been right about the wrong things. The README would still teach nothing,
the dialog for pages opened from disk would not exist, and the search box would still
touch the divider. Being early is how you find out what "right" means.

## What we learned

1. A decision's cost belongs where users meet it, not only in a design note.
2. When you have a guess about a bug, say it, and let the evidence overrule you.
3. A tag that publishes to the world stays with a person; everything up to it can be delegated.
4. An agent with a browser and a measuring tape finds what you cannot see, and gives coordinates instead of impressions.
5. Ask an agent to evaluate a report before anyone fixes it.
6. A visual check that the reviewer decides to run stays meaningful; one that runs on everything gets waited out.
7. Being usable early is how you learn what being right means.

## Which jobs this one was doing

Four of them, and for the first time in this series the product owner leads.

- **Product owner** — "readme is ridiculous as of now, it teaches nothing", an icon
  you can compose, a footer with the version, a folder tree that must stay reachable
  on a phone, and an independent agent sent to review the site as a product owner
  would.
- **QA** — twelve layout fixes with coordinates, and an outside tester who agreed;
  "our css does not react to resizing".
- **Platform engineer** — alphas kept off crates.io, the README as the site's front
  page, and the tag I pushed myself.
- **Reviewer** — a visual session added to every reviewer's checklist, run only when
  the reviewer judges a change can alter a page.

No architect this time: nothing in this part needed the code to be shaped
differently, only to say and show more.

The six are counted in [*The night that produced no code*](article:the-night-that-produced-no-code).

## Next time

What I found when I sat down with my screen reader and the example suite, and asked
questions nobody had asked: what an outline is, which examples belong to what, and how
a product owner would make sense of any of it. That is
[*What a outline is?*](article:what-a-outline-is)
