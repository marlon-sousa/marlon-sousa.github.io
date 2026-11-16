---
title: 'One question at once, please'
description: 'The first day of Gherkin Glass: nineteen issues settled one decision at a time, decisions moved into issue bodies, an independent reviewer required before any pull request, and a night in which a coordinator and a thread per issue built the whole first version as one stack of 25 pull requests, while waits on CI quietly died.'
pubDate: 'Nov 17 2026 12:02'
series: 'gherkin-glass-built-in-use'
seriesPart: 3
tags: ['ai engineering', 'ai', 'software engineering', 'gherkin-glass']
draft: true
---

[Last time](article:why-not-gherkin-glass) was the tool itself: a website made from
a folder of feature files, and the promises it makes to the people who read it,
from pages a screen reader can use to sites that are served rather than opened
from disk. This time is the first day, from the afternoon in which every open
question was settled to the night in which the whole first version was built. It is
the part of the story where the process works as designed, and the reason it does
is worth more than the speed.

## A slice first, or everything?

By lunchtime on that Tuesday the repository had a manual for agents, a contributing
guide, a design note on why Rust, and nineteen issues describing the first version.
Most of them still had open questions. I opened a thread and, after one false start
where I had to repeat myself, asked it to read everything and tell me how to
proceed:

> sorry. I asked you to read the project context, docs, and all and give me a suggestion on how to follow

It read the README, the guides, the empty behaviour document and every issue with
its comments, and suggested what any careful engineer would: "build a thin, working
slice first: the skeleton, then parsing, anchors and the feature page, with the
accessibility check running from the first page. The rest of the features grow on
top of that."

Good advice for a team of people. I answered with seven words:

> we will do all as the first version.

Not because the slice was wrong, but because the cost model had changed. A slice
exists to get feedback before investing in the rest. With a coordinator that can
run a thread per issue, the rest is not the expensive part any more. The expensive
part is agreeing what to build, and that was what the afternoon was for.

## The rules, before any code

Three minutes later I set the rules the whole week would run on:

> Agreed. Ask perhaps a new thread to build 1, while we work here settling the rest, then we start next threads to build upon. Next threads will build prs up on stack, and each thread can itself add more prs to the stack if this is too big. At the end we will have only one stack with everything. It is important to set on project notes that all reviews would require an independent reviewer first, only when all points are fixed th pr should be opened. By fixed understand argued, reasoned and fixed if needed, all without my intervension, unless you need me for taking a decision, then you stop and wait.

Read it again, because almost everything in this series follows from it.

- **Settle and build at the same time.** The skeleton started building while the
  rest was still being argued.
- **One stack.** Every pull request sits on the one before it, so I review a single
  ordered pile, from the bottom up, instead of a scatter of branches.
- **An independent reviewer before any pull request.** Not the author rereading its
  own work, but another agent, given the change and not its author's reasoning.
- **Fixed means argued.** A finding is not obeyed blindly. The author argues it,
  reasons about it, and fixes it if it holds, without me.
- **Stop for decisions.** The one thing that comes to me is a decision. Everything
  else does not.

Half an hour later, another rule, about where decisions live:

> another thing: fully agreed issues should move what we decided in comments on ts body. No contraditory information.

> so the thread must read only the body.

This one sounds like housekeeping. It is the difference between a thread that
builds what was decided and a thread that builds what was proposed in comment four
and reversed in comment nine. Once an issue is agreed, its body is the contract,
and its comments are only the history of how we got there.

## One decision at a time

Then came the questions, and there were a lot of them. Every one arrived alone,
with the agent's recommendation and its reason, and I answered it before the next
one came. That afternoon settled, among many others:

- that a feature file that cannot be parsed fails the build, with no option to
  carry on, "by now";
- that files which are not `.feature` files are ignored by default, through a
  `.ghgignore` file read per folder, and that `.gitignore` is not considered;
- that Gherkin has no include statement, so every file parses on its own and they
  can be parsed in parallel, which the agent checked against the parser crate's
  keyword list before agreeing;
- that unnamed scenarios and rules are allowed only behind a setting, because I
  did not know Gherkin allowed them and wanted to choose;
- that rules and scenarios start expanded when the configuration says nothing,
  and the reader's saved choice always wins;
- that the pages' script is TypeScript, compiled by the build and shipped inside
  the binary;
- that every sentence the tool prints comes from a Fluent catalogue, ready for
  translation later.

A day of decisions reads like a list. What it felt like was a conversation with a
colleague who had read everything and never got tired of being asked "why?". When
an answer did not convince me, I said so, and the next message either convinced me
or changed the recommendation.

## The architecture came from acter

In the middle of it I stopped the questions:

> ok. Before that, We eed an architecure document, if we havn't yet. Query marlon-sousa/acter for what it suggests (modules, comments, etc) and say me what you think

acter is an earlier project of mine with a set of architecture rules I trust:
ports and adapters, modules by role, how comments are written. The agent read it,
proposed the same shape for this project, and wrote `docs/ARCHITECTURE.md`. Every
thread that evening built against it, and every reviewer checked against it.

Remember that message. The document captured acter's shape. It did not capture
everything acter enforces, and I did not check. The next morning that difference
became the first trap of the week, told in
[*Why on earth are we leaking adapters*](article:why-on-earth-are-we-leaking-adapters).

## Stacks, and a rule worth breaking

The cloud environment the threads run in does not let them call GitHub's API
directly; they go through a set of tools instead. GitHub's stacks, which make an
ordered pile of pull requests something GitHub itself understands and can rebase,
are only reachable through the REST API. The thread told me it could not declare
the stack. I knew better, because itinera-rs had done it:

> why not? Itinera-rs projects call it some how, from gh rest api

> Break the rule in this case specifically

> I eman thrads can break this rule

> no, permission for stacks is wide, all can do it

A rule exists to protect something. When I know what it protects and the exception
does not touch it, I say so, in words, and the exception is written into the
project's manual so the next thread does not have to ask. Threads may call the
stacks endpoint, and nothing else.

## Hand it to the threads

By 17:04 the decisions were made. One last pass, and then the switch from talking
to building:

> ok. Comsolidate the issue comments on their bodies * the ones for which comments make sense * so that the body is the source of truth. Then, ask the coordinator to make threads one per issue, in the order you dfined, run, and stack the prs.

> If threads have fiurther question, they should put it via coordinator, and so I will respond.

That second line is the shape of the evening. One coordinator in the project chat,
one thread per issue, and every question from every thread brought to me in one
place.

## One question at once

It took about half an hour for the shape to need adjusting. Two threads had
questions open at the same time, and the coordinator put both in front of me.
Before answering either, I set the rule I had set everywhere else:

> ok. One question at once, please

From then on the coordinator queued them. It sounds like a small thing. It is
not. With a dozen threads running, the number of decisions I could make well was
the only real limit on the evening, and each decision needs the whole of my
attention for the minute it takes.

A few minutes later I checked the other rule:

> Are you applying independent reviewers before opening prs?

They were. And then I asked for more speed, in a specific way:

> yes, and you can calculate if others can be paralelized. These don't need to go to the stack, they can be ready to go, on their branches, waiting until previous prs in stack are opened, so they just rebase and create. You can coordinate this.

The coordinator asked the planning thread, which had the dependency graph in its
head. Six more issues could start at once: three fully, three up to the point where
they needed the feature pages. All six started that minute.

## Better to tick a timer

On Itinera I had learned something about agents that wait. A thread that pushes a
change and waits for CI to finish is supposed to wake up when CI ends. Sometimes it
does not. It just stops, and nothing tells you. So, three minutes after the six
threads started:

> pay attention because som,e of the waitring on ci for example you did before inother projects just failed. Better to tick a timer, say 30 minutes, to pock threads that are waiting on something.

The coordinator set one. It is the least glamorous rule in this series and one of
the most useful. A process with a dozen parallel threads is only as fast as the
one that silently fell asleep.

## Mara, vamos

The questions kept coming, one at a time, and the evening found its rhythm. Here
is a stretch of it, about seven minutes, each line a decision passed back
to a thread that was waiting on it:

- an unversioned build's output folder must be empty, and I made it stricter than
  the agent proposed: "strictly empty unless replace is set";
- the front page's title defaults to "Feature files", after the exchange told in
  the last part;
- a feature file whose page would clash with a folder's index stops the build;
- the whole `tags/` folder belongs to the tool, so adding a tag can never break a
  build that worked before;
- every "Examples as scenarios" button carries its outline's name, because a
  screen reader's list of buttons could not tell them apart otherwise.

To that last one I answered in Portuguese:

> Yes. Mara, vamos

Roughly: "great, let's go". The coordinator answered in kind, "Vamos!", and told
me every question was cleared. The stack was up to the home page.

## Twenty-five pull requests

At 21:45 the stack was complete. Twenty-five pull requests, numbered #20 to #44,
in one ordered pile. Between them they held the skeleton, the input, configuration and the command line,
anchors, the feature pages, `ghg serve`, the accessibility check, the front page,
folder pages and the tree, tag pages, step sentences, themes, versioned output,
outlines, search, the release binaries, `cargo ghg`, the GitHub Action and the
project site. Six minutes later its CI was green.

Every one of those pull requests had been through an independent reviewer before
it was opened. Every one built on the behaviour document, which had grown from
nothing that morning to well over a hundred rules, each with a fixture and a test.
And every fixture already had a committed copy of the exact site it must produce,
compared byte for byte, which will matter a great deal in a later part.

## Before doing actions tell me what happened

I asked for a thread to walk me through merging the stack, and started at 22:44.
Merges taught the last lesson of the day. After I merged #27, the next one still
showed the changes of the one below it. The thread was about to start fixing
things, and I stopped it:

> 28 seems to keep diffs from 27, even though 27 is merged

> before doing actions tell me what happened

A merge commit in a stack leaves the next branch carrying commits main already
has. The fix was small. The rule behind my message is not: when something
unexpected happens, an agent explains first and acts second. An agent that acts
first will act confidently on the wrong diagnosis, and you will find out from the
result.

At 23:19, reading one of the pull requests, I asked a question I should perhaps
have asked earlier:

> did you build a command line parser by hand in 27 instead of using clap?

It had. That question opened the next day, and the next part.

## What we learned

1. When building is cheap, agreeing what to build is the work; spend the afternoon there.
2. Set the rules before the first line of code: one stack, an independent reviewer, decisions in the issue body, stop only for decisions.
3. One question at a time is not politeness; it is the only way to decide well with a dozen threads asking.
4. Parallelism is planned from the dependency graph, not hoped for.
5. Waits fail silently; a timer that pokes waiting threads is cheap insurance.
6. A rule can be broken on purpose, in words, when you know what it protects.
7. When something unexpected happens, ask for the diagnosis before the fix.

## Which jobs this one was doing

Four of the six, and it is the only part where the project manager does more than
anyone else.

- **Product owner** — "we will do all as the first version", and the decisions that
  arrived one at a time: strictly empty output folders, unnamed blocks behind a
  setting, the tool owning `tags/`.
- **Architect** — asking for acter's architecture as the model before any thread
  started, and parsing in parallel once the agent confirmed Gherkin has no include.
- **Project manager** — the rules of the stack and the reviewer, one question at a
  time, six more threads started from the dependency graph, and a timer for waits
  that fail silently.
- **Platform engineer** — the stacks API exception, and "before doing actions tell
  me what happened" when a merge commit left a branch carrying old changes.

No QA and no reviewer of my own this time: the independent reviewers did that job
on every pull request, and the next part is about what they could not see.

The six are counted in [*The night that produced no code*](article:the-night-that-produced-no-code).

## Next time

The morning after: reading the code of a first version that passed every check,
and finding that the library exported its adapters to the world. Why every
reviewer let it through, why it was my fault rather than theirs, and why the first
thing I changed was a document. That is
[*Why on earth are we leaking adapters*](article:why-on-earth-are-we-leaking-adapters).
