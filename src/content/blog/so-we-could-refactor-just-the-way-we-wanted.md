---
title: 'So we could refactor just the way we wanted'
description: 'How the heart of Gherkin Glass was rebuilt twice in a day while the tool stayed in use: every page pinned byte for byte, a fresh thread given only the written guidelines, my own bet on the design, an incremental rebuild I designed in a review, and eleven pull requests built in parallel and merged in one evening, without a single page changing.'
pubDate: 'Nov 19 2026 12:05'
series: 'gherkin-glass-built-in-use'
seriesPart: 6
tags: ['ai engineering', 'ai', 'software engineering', 'rust', 'testing', 'gherkin-glass']
draft: false
---

[Last time](article:what-is-your-thinking-level) was the second trap: a day of thin
designs, poor names and overbuilt answers, while every check passed, until I asked
the agent its effort level and heard "Medium". Code threads stayed at medium after
that; the reviewers went to high. This time is what the week was really for: taking
the heart of the tool apart and putting it back together, twice, while the tool was
already in use. It is the part about behaviour-driven development, because without
it none of this would have been safe.

## A net that was already there

On the afternoon of the second day I had written, in two comments on the
refactoring issue, what I wanted the core to become. A tool like this is a small
compiler: it reads sources, builds a tree, and writes the tree out, every node
rendering itself through one common trait. The code did not look like that. Every
page was assembled by its own policy, and the parts every page shares were a special
case. That evening the agent told me plainly that this needed a redesign, not more
tidying on top of what was there.

That is a rewrite of the core of a tool that, by then, was on main and building
sites. How do you do that without breaking anything?

Part of the answer had been there since the first night. Every fixture in the
repository, a small folder of feature files written to exercise one rule, came with
a committed copy of the exact site it must produce. A test built each fixture and
compared every file it wrote with that copy, byte for byte. The behaviour document
said what the tool promises; the fixtures proved it, to the byte.

What was missing was the place where everything meets. The example suite, the
feature files behind the project's public site, uses every construct together:
nested folders, a feature in Portuguese, tags, backgrounds, outlines with several
examples blocks, tables and doc strings. Nothing pinned its pages. The agent
suggested running it through the accessibility check. I had something else in mind:

> no, I was thinking on a different thing: the real tests would be to compare bit to bit the generated html files of the features suite, I think.

> so we could refactor just the way we wanted, and make sure the final result wouldn't change.

> Yes, that's what it's for: a safety net for the redesign. So I'll build this layer
> before the redesign starts. Then each redesign layer has a clear rule: every
> expected site stays byte for byte the same, the fixtures' and the example suite's,
> unless the layer says why a page changes. A refactor that changes any output fails
> `cargo test` straight away.

Half an hour later it was a pull request. It also put the example suite through the
browser check, which passed: 209 pages in 24 sites, in both colour schemes and with
the keyboard.

This is what I mean when I say the behaviour layer made the refactoring safe. Not
that I trusted the agents more. That I did not need to. A redesign could move every
file, rename every type, replace every policy, and if a single byte of a single page
changed, the build said so before any human looked.

It is the same belief that made me build Gherkin Glass in the first place: a
specification that is also the tests cannot drift from what the code does. The
tool's own behaviour document is not written in Gherkin, but it works the same
way. Every rule is a sentence a person can read, and every rule is held by a test.
That is what turned a risky rewrite into an ordinary week.

## Something is wrong

Then GitHub went quiet. The new pull request showed zero checks. I asked what was
going on, and the agent found 239 runs queued, most of them for branches already
merged, and proposed cancelling them. I said cancel. Twenty minutes later nothing
had moved, and I noticed a time in its last message:

> 17:37 is almost 40 minutes ago. Something is wrong

It looked again and agreed: no runner had picked up a job since 17:25, and GitHub
had refused all 228 cancel requests. "That points to a problem on GitHub's side." It
asked me to check GitHub's status page, which it could not reach. It was an
incident.

I mention it because of what I did next. With CI down and nothing to merge, I had
an hour I could waste waiting or spend on the next decision.

> spot on, incident. Let's wait then, and keep discussing the redesign. Do you think a thread withut context other than these guidelines would be better?

## A thread that knows only what is written

That thread had a day of history behind it: every refactoring layer, every
argument, every correction, and the earlier designs it had made at medium effort.
History helps, until it anchors. A design discussed for a day tends to stay close to
the design that was there in the morning.

So the thread wrote a brief for a new one. Not a summary of the conversation, but
pointers: the decisions recorded in the issue body, the two comments where I had set
out the redesign, the agreed order of work, and the questions still open. Everything
else, the new thread would read from the repository. If the repository did not say
it, the new thread would not know it, and that was the point. A fresh reader is the
best test of whether your documents are enough.

## My bet

The new thread opened at 18:12, read the brief, and asked its first question. I
answered a few, and then, half an hour in, I stopped answering questions and gave it
the whole shape at once:

> I would give you instead my bet.

What followed was the pipeline as I saw it, in plain words. Both binaries call one
entry point. The entry point calls one controller. The controller reads the
configuration, has the settings service merge it with the command line, asks the
gherkin parser service to parse every feature file, asks a converter to build the
tree, and asks a writer to write it. "See: these are three services, orchestrated by
the controller: parse gherkin, bbuild the ttree, write the tree."

Then I extended it to serving. The entry points are handlers; a handler calls the
controller; the controller has two methods, build and serve. Serve calls build, then
starts the server and waits. And when the tool serves, it builds into memory:

> And it would specify something else, that our input model should handle: dest = memory.

The agent took it, checked it against the rules, and found where it needed
refining. I took some of its refinements and gave it one of mine:

> I agree. But the names are terrible: One service is the gherkin-parser, another is the converter, another one is the site-writer.

A few hours later, reading a draft where an adapter called back into a policy of the
domain to decide something:

> ewhy would an adapter call back a policy inn the domain? This is a smell.

It was. Adapters translate; they do not decide. That went into the architecture
document as a rule, with a reviewer item to check it.

## Away from the computer

The design went into a pull request that changed only documents: the architecture,
a design note, the reviewer's checklist. An independent reviewer approved it, and so
did I. Then the question of how to build it. My first instinct was one big pull
request, because a redesign split into layers breaks the integration tests in the
middle. The thread proposed six layers instead, and I agreed, with one allowance and
one instruction:

> Agreed. I will be away from the computer, so ask the coordinator to sack them all. If one needs to disable the tests for its ci to run, no problems. The last one must have it enabled.

> Don't forget to complement whatever you need to in agents.md, architecture, pr checklist, and all, so next sessions can continue even without this project memory.

That second message is the one I would underline. A thread that ends takes its
context with it. Whatever it learned that is not in the repository is lost to the
next one. So before it handed over, it went through what was only in its memory or
in issue bodies, and put it into the documents.

I merged the design at a quarter past midnight, and went to bed. Six layers were
built overnight, each reviewed by an independent agent before it opened.

## Reviewing a redesign at breakfast

The next morning I reviewed them, one at a time, with a thread guiding me. That is
the review where the effort question came up, and most of what I found was told in
the last part: names, overbuilt serving, copying where a tree would answer. The
stack was merged by 11:08, and not one expected page had changed.

Then I asked how the tree would help a rebuild, and the conversation turned into a
design session.

## The thing isn't complex

`ghg serve --watch` rebuilds when a file changes. At that point it rebuilt by
walking the input again and deciding what to do from flags passed around. I asked
whether keeping the tree in memory would let a rebuild check the tree instead of
walking. The answer was not convincing, and I lost patience in the most productive
way I know:

> Ok. We need to rule this ot. The thing isn't complex, but it seems to be for you:

And I wrote the algorithm, in numbered steps. Twenty minutes later, after some back
and forth, it had settled into this:

> 1. On first build, we make the tree of files to parse with the invalid state, so to speak.
> 2. 2. On a rebuild with ghgignore, we go through the file system and compare everything against the new permission lists. We remove all nodes to be removed, we create new nodes that are now allowed, with invalid state.
> 3. We then prcess the other files on the event, removing nodes, creating nodes (invalidated state) or updating nodes that had their files changed also as invalidated.
> 4. Then, we ask the gh parser to update (reparse) all invaidated

A tree of input files, each node valid or invalidated. An ignore file that changes
removes or adds nodes. A file that changes invalidates its node. The parser reparses
only what is invalidated. Nothing more than what any incremental compiler does.

That became two issues: a build that starts from its trees, and the incremental
rebuild. A design thread wrote the note, and nine questions came out of it. I
answered them in about forty-five minutes, one at a time. Two answers changed the shape.
The first moved a responsibility:

> so to parse or mot to parse is a domain decision. Once a set of file chamges arrive, the list has to be computed by someone else which hasn't the parsing responsibility.

That became a new service, the input collector, which decides what to parse; the
gherkin parser only parses what it is given. The second set a limit:

> a, but here is the thing: any change in the config file should start a full rebuilt.

> otherwise we are going to build a full OS in some minuts gigle

Incremental where it pays, a full rebuild where the cleverness would cost more than
it saves.

## Eleven pull requests in an evening

The note was merged at 12:16. Then I set how the build would run:

> 1 thread per stage, not for multiple stages. The oordinator must coordinate: what can be paralel is given the sequences, what has to wait waits, then once everyone is ready the prs start to get assembled. So work goes through the independent reviewer and stops.

> I won't be reviewing, and I would like thje stack ready in some hours. So the "reviewed" means the independent reviewer.

That second line deserves a word. I did not review the layers as they were built.
The independent reviewers did, at high effort now, against the full checklist, and
the byte-for-byte net checked every page. My review would come at the end, as a
whole stack.

In the meantime, one thread I had asked for that morning came back with something
useful. The browser check, which serves every fixture's site and the example suite
and drives them with [axe-core](https://github.com/dequelabs/axe-core) and the keyboard, had taken six and a half minutes. It
now took about a minute and three quarters.

At 17:29 the stack was open: nine layers, one of them split in three, eleven pull
requests in all, #79 to #89. At 20:18 I started reviewing, guided one pull request
at a time. Most of my messages that evening were a single word:

> next

I asked a few real questions in between. What rayon was now used for. How a watch
is cancelled; the answer named the line of the watcher crate where dropping it stops
the watch. At 20:50 I wrote "all merged." Both issues closed.

Two days earlier the tool's pages were assembled by scattered policies. Now a build
read its sources into an input tree, converted it into a site tree, and wrote that
tree out through one rendering trait, each kind of node rendering itself beside its
template. A rebuild under `--watch` reparsed only what had changed. And through every
one of those layers, the expected sites of every fixture and of the example suite
did not change by a single byte.

## What the net could not catch

I promised in the first part to be honest about this, so here it is. The net caught
every change to every page anyone had specified. It could not catch a page that was
right by the specification and wrong for a person. The same evening, two minutes
after the last merge, I learned about one of those from a friend. The next part is
about what real people found while all of this was happening.

## What we learned

1. Pin behaviour byte for byte before a rewrite, and the rewrite can be as bold as it needs to be.
2. A behaviour document with a fixture per rule is not paperwork; it is what lets you change everything else.
3. A fresh thread that knows only the repository is the best test of whether your documents are enough.
4. Give a design as a whole shape when you have one, and let the agent refine it, rather than answering its questions one by one.
5. Before a thread ends, make it write down what only it knows.
6. When an explanation goes in circles, write the algorithm yourself; it is often shorter than the argument.
7. Delegating review to independent reviewers works once they run at the right effort and a byte-for-byte net stands behind them.

## Which jobs this one was doing

Four, and QA is the reason the other three could move as fast as they did.

- **QA** — "compare bit to bit the generated html files", every page of the example
  suite pinned beside every fixture, and not one expected page changed across
  seventeen pull requests.
- **Architect** — "I would give you instead my bet", the handler and the controller,
  dest = memory, "This is a smell", and the incremental rebuild written as four
  steps.
- **Project manager** — a fresh thread with only the guidelines, "Don't forget to
  complement", one thread per stage in parallel, and a stack ready in hours with
  independent review standing in for mine.
- **Platform engineer** — reading an Actions incident from a timestamp, and a browser
  check cut from six and a half minutes to under two.

No product owner and no reviewer of mine: nothing a reader sees changed, and that
was the promise.

The six are counted in [*The night that produced no code*](article:the-night-that-produced-no-code).

## Next time

What real people found while the rebuild was going on: a friend's pages with no
script and no style, a README that taught nothing, the first alpha, and an agent
playing product owner in a real browser. That is
[*A friend tried to build the project*](article:a-friend-tried-to-build-the-project).
