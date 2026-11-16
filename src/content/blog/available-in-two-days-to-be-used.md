---
title: 'Available in two days to be used'
description: 'Gherkin Glass went from an empty repository to a complete first version in one day, and was rebuilt over the next two while people were already using it. Every headline of that week: the cycle that made it possible, the two traps it walked into, what caught them, and the net that made the rebuild safe.'
pubDate: 'Nov 17 2026 12:00'
series: 'gherkin-glass-built-in-use'
seriesPart: 1
tags: ['ai engineering', 'ai', 'software engineering', 'accessibility', 'gherkin-glass']
draft: true
---

A Tuesday morning, an empty repository, and a tool I wanted to exist.

- **At 11:22** I made the first commit.
- **By 21:45 the same day**, a stack of 25 pull requests held every issue of the
  first version, each one reviewed by an agent that had not written it, and CI was
  green six minutes later.
- **By the next evening** all of it was on main and anyone could build it.
- **On Friday morning** the first alpha was released, with binaries for five
  platforms and a public site showing what the tool makes.
- **The Monday after**, the second alpha.

In between, most of the architecture was taken apart and put back together. Twice.
And the tool never stopped working while that happened.

All the times in this series are mine, in São Paulo.

That is not the interesting part, though. Fast is easy to claim and easy to fake.
The interesting part is what the week looked like from the inside: a process that
I would call mature, two traps it walked straight into anyway, the moment I noticed
each one, and the net that let me rebuild the thing without breaking it.

This first part gives you every headline. Each part after it tells one of them in
depth, so read on where something catches you, and skip what does not.

## What Gherkin Glass is

Gherkin is the plain-language format behaviour-driven development uses to describe
what software should do. A feature file names a feature and lists its scenarios,
each a short run of steps: `Given a book "Dune" on the shelf`, `When Ana borrows
it`, `Then the shelf is empty`. Tools run those steps as tests, but the files are
written to be read by people: product owners, testers, developers.

Reading them is harder than it should be. They sit in a repository, spread across
folders, opened one at a time in an editor. Itinera's conformance suite alone has
more than three hundred scenarios. Gherkin Glass turns a folder of feature files
into a static website: a page per feature and per folder, a heading and a stable
link for every rule and scenario, tags, search, and pages built from the first day
for a screen reader and a keyboard. It is one command, `ghg`, written in Rust.

I use a screen reader. That is not a detail of this story; it is the reason half of
the decisions in it went the way they did.

## Headline: usable on the second day

The first version was not a prototype. It was nineteen issues, agreed one by one
that afternoon: input reading with an ignore file, anchors that never change, a
page per feature, folder pages, a folder tree, tag pages, a page of step sentences,
search, themes, versioned output, outlines expanded into scenarios, `ghg serve`
with live reload, release binaries, a GitHub Action, a project site.

Here is what landed on main each day, counted from git:

| Day | Commits on main | What happened |
|---|---:|---|
| Tuesday 10 November | 124 | Planning, then the whole first version built in the evening |
| Wednesday 11 November | 104 | I read the code; new rules; the first refactoring |
| Thursday 12 November | 89 | Two redesigns, merged the same day |
| Friday 13 November | 61 | The first alpha |
| Saturday 14 November | 51 | Screen reader testing, new features planned |
| Sunday 15 November | 0 | Nothing |
| Monday 16 November | 32 | The second alpha |

Without agents, how long would this have taken me? I will give you my own estimate
before we are done, and it will be an estimate, not a measurement. The days above
are measurements.

The whole story of that first day, the planning and the night, is
[*One question at once, please*](article:one-question-at-once-please).

## Headline: a cycle, not a prompt

Nothing in that first day was "build me a tool". It was a cycle I had already
learned on [Itinera](article:a-year-or-fourteen-days), and it went like this.

1. **Agree before code.** Every issue was settled with me one decision at a time,
   each with the agent's recommendation and its reason.
2. **The issue body is the contract.** Once agreed, the decisions moved out of the
   comments into the body, so a thread building it reads only the body.
3. **Behaviour before code.** What the tool promises is written in a document,
   `docs/BEHAVIOUR.md`, rule by rule, and every rule comes with a fixture and a
   test. It holds 220 rules today.
4. **An independent reviewer before any pull request.** Not the author checking its
   own work, but another agent, given the change and not the reasoning behind it.
5. **One stack.** Every pull request sat on the one before it, small enough to read
   alone, merged from the bottom up.
6. **Threads in parallel.** A coordinator started one thread per issue and ran
   every one that did not wait on another.

That is what made the speed possible, and it is also why the traps below were
caught in hours rather than months.

## Headline: a rule in your head is not a rule

On the second morning I read the code and did not like what I saw. The command line
was parsed by hand instead of with clap. The library exported its adapters to the
world. The policies were scattered. There were two regex crates where one was
expected. Errors were called problems and lived among the entities.

None of those broke a test. All of them broke rules I hold. And none of those rules
was written anywhere a reviewer would read. I had brought them from two earlier
projects, acter and itinera-rs, in my head. I had even asked, on the first day, for
the agents to take acter's architecture as the model. They took its shape, but not
the check I believe acter has against exactly this.

The reviewers had done their job perfectly. They checked every rule they were
given. The trap was mine: I assumed a rule I had never written down would be
enforced. The way out was to write the rules down first, before fixing a single
line, so the next reviewer would catch the same thing on its own. That is
[*Why on earth are we leaking adapters*](article:why-on-earth-are-we-leaking-adapters).

## Headline: a default nobody chose

The second trap took me a day longer to see. The designs were coming back thin.
Names were poor. Answers missed the point of the question. On the third day, in the
middle of a review, I wrote:

> Even though you are medium effort (I bet you are, rigre)? try to make a decent analysis

Then I asked outright:

> What is your thinking level?

> Medium. I checked this session's settings: effort level "medium", on the model
> `claude-opus-5-5`. Your guess was right.

Every thread on Itinera had run at high effort. Here they had been running at
medium all along, and nobody had chosen that. It was a default I did not notice.
Nothing on the surface showed it: the tests passed, the reviews passed, and the
code was simply less thought through than it should have been. The fix was a
decision, written into the repository the same day: threads that write code run at
medium, the independent reviewers at high. That is
[*What is your thinking level?*](article:what-is-your-thinking-level)

## Headline: what caught them

Not a tool. Not a test. Reading the code, and asking a question at the right
moment.

I want to be careful here, because this series is not meant to say "look how
clever I am", and it is not meant to say "look how wrong I was" either. Both traps
are the kind any experienced engineer walks into with a new team: you assume the
team knows what you know, and that the team works the way your last team did. What
matters is how fast you notice, and what you do in the hour after.

## Headline: a net under the rebuild

By the end of the second day it was clear the architecture needed more than
tidying. The way pages were built had to change. So did the way a rebuild under
`ghg serve --watch` worked. That is a rewrite of the heart of the tool, and the
tool was already in use.

What made it safe was the behaviour layer. Every fixture had, from the first night,
a committed copy of the site it must produce, compared byte for byte by a test. On
the second evening I asked for the same for the example suite, the one place where
every construct appears together:

> no, I was thinking on a different thing: the real tests would be to compare bit to bit the generated html files of the features suite, I think.

> so we could refactor just the way we wanted, and make sure the final result wouldn't change.

From then on, a refactor that changed a single byte of any page failed `cargo
test`. Two redesigns went through under that net: a six-layer stack overnight, and
an eleven-layer stack the next day, built by parallel threads and merged in one
evening. A fresh thread, given only the written guidelines and none of the old
conversation, designed the first one with me. The story is
[*So we could refactor just the way we wanted*](article:so-we-could-refactor-just-the-way-we-wanted).

A net only catches what it is stretched under, though. It guarded everything the
behaviour document promised. It could not guard what nobody had promised yet, and
the next two headlines are about exactly that.

## Headline: people used it while it changed

On the third evening a friend tried to build the project and got pages with no
script and no style. On the fourth morning the first alpha went out, and an agent
playing product owner, driving a real browser over the published site, found twelve
things wrong with the interface. An outside tester reported the same problems on
their own. That is [*A friend tried to build the project*](article:a-friend-tried-to-build-the-project).

Then I sat down with my screen reader and the example suite, and asked questions
nobody had asked:

> ok. Soon after, at the same heading level, I see a outline. What a outline is?

The answers changed how the pages present outlines and examples, how disabled
controls look, and what every future reviewer has to check with its own eyes. That
is [*What a outline is?*](article:what-a-outline-is)

None of this feedback waited for the rebuild to finish. That is the point of being
usable on day two.

## Headline: what a mature cycle looks like

At the end I will put the whole cycle in one view, with every trap it met and the
rule each one left behind in the repository, so the next project starts where this
one ended. That is [*What traps we could avoid*](article:what-traps-we-could-avoid).

## What we learned

1. A complete first version in a day is possible, but only on top of a cycle: agree, specify, review independently, stack, run in parallel.
2. A rule you never wrote down will not be enforced, however good your reviewers are.
3. Settings shape design as much as prompts do, and a default nobody chose is still a choice.
4. The traps were caught by reading the code and asking, which no process replaces.
5. Pinning behaviour byte for byte is what made a rewrite of a tool in use safe.
6. Being usable early is worth more than being right early, because people tell you what you missed.

## Which jobs this one was doing

Every one of the six appears in this week, and the parts that follow show each in
depth. This one only draws the map, so the list is about where to look:

- **Product owner** — the nineteen issues of the first version, and the screen
  reader session that redesigned outlines.
- **Architect** — the leaking adapters, and the two redesigns.
- **Project manager** — the stack of 25 built by parallel threads, and the effort
  split between coders and reviewers.
- **Platform engineer** — two alphas released in four days.
- **QA** — every page pinned byte for byte.
- **Reviewer** — an independent agent before every pull request, and the rules it
  was missing.

The six are counted in [*The night that produced no code*](article:the-night-that-produced-no-code).

## Next time

The tool itself, before any of the process: what problem it solves, who it is for,
and the first decisions about what it would promise, including the evening an agent
told me that the tool's own name was the wrong title for its front page. That is
[*Why not gherkin glass?*](article:why-not-gherkin-glass)
