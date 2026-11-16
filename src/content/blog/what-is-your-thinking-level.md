---
title: 'What is your thinking level?'
description: 'The second trap of the week. Designs came back thin, names said nothing, and answers missed the point, while every test and every review passed. In the middle of a review I guessed why, asked, and was right: every thread had been running at medium effort, a default nobody had chosen. How it showed, how I found it, and the rule that came out of it.'
pubDate: 'Nov 17 2026 12:04'
series: 'gherkin-glass-built-in-use'
seriesPart: 5
tags: ['ai engineering', 'ai', 'software engineering', 'gherkin-glass']
draft: true
---

[Last time](article:why-on-earth-are-we-leaking-adapters) the reviewers had done
their job perfectly and the code was still not built the way I build software,
because the rules they needed lived in my head and in two older projects rather
than in the repository. The fix was to write them down first. This time is the
second trap, and it is harder to see, because it does not show up in any rule. The
designs were simply thinner than they should have been, and it took me a day to
find out why.

## Signs, not failures

Nothing failed. That is what makes this trap worth a whole part.

The tests passed. The reviewers approved. The pages were right. But for a day and a
half, something about the agents' work had been bothering me, and when I look back
at my own messages the signs are all there.

On the second afternoon, after a day of finding things I did not like:

> So mamy things changed, sorry. The design was poorly planned yesterday. How ddo you see things now?

I apologised. To the agent. For a design it had made. I assumed the gaps were in
what I had asked for, and some of them were, as the last part showed. Not all.

The next morning I opened a thread to walk me through the first redesign stack,
six pull requests built overnight. The questions I asked in the first hour read
like a list of symptoms.

**The design was more complicated than the problem.** The serve command had grown a
channel, a callback, and a function handed from one service to another so that
nothing would call up a layer. I read the explanation and wrote:

> because for me this would be a simple rule: we ask the build to build. The build can return exactly the list of files built. Once we finish building, we start the server. We listen. If watch ode, we start the watcher, and loop on its channel. If not, we park. I can't understand why all tof this.

**The code did not say what it did.** Reading the controller's build method, which
was meant to be the heart of the pipeline:

> is this the build process? Where is the parse -> convert -> output call?

**The names said nothing.** The line that parsed the feature files read
`self.parser.read(...)`. I suggested `parse`. The agent agreed and renamed it. That
was not enough:

> self.gherkin_parser, please. You ahve been terrible when naming stuff lately

> a parser of what?

The agent apologised for "the poor names" and widened the rename: `gherkin_parser`,
`site_writer`, `GherkinParserApi`. I made it a rule for every thread afterwards:
names say what they are.

**The design missed the obvious structure.** I asked how the site tree linked a
child to its parent. It did not; a scenario that needed its background's steps got
a copy of them, made when the tree was built.

> lots of copying, then. Isn't this stupid?

The agent explained that only one of the three cases copied anything, and that
even that copy could be shared. Fair. But I was looking at a parser that did not
hold its result as a tree, and flags passed around where a tree would have answered
the question. I asked it to look at what crates exist for trees, and then I could
not hold it in any more:

> Even though you are medium effort (I bet you are, rigre)? try to make a decent analysis

## The question

A few minutes later, I asked it straight:

> What is your thinking level?

The answer was short and exact:

> Medium. I checked this session's settings: effort level "medium", on the model
> `claude-opus-5-5`. Your guess was right. If you want more care for the rest of
> this review, say which level, such as "high", and I'll switch this thread to it
> from my next step.

> switch to high.

On Itinera, every thread had run at high effort. I had never asked for it; it was
simply how they ran. Here, every thread had been running at medium from the first
day, and nobody had chosen that either. It was a default I did not notice.

I want to be careful about what this means, because it is easy to take the wrong
lesson. Medium effort did not write bad code. It wrote code that passed a long list
of checks, built a complete first version in an evening and kept every page exactly
right. What it did less of was the thinking that nobody asks for explicitly: asking
whether a simpler shape exists, naming a thing for what it is, noticing that a
parser should hold its result as a tree. Those are design qualities. No test checks
them, and a reviewer running at the same effort checks them about as well as the
author did.

## The difference, in one exchange

The same thread, one minute after switching, shows it better than I can describe
it. I asked a design question:

> And answer me a question, knowing you can program in rust: how would we work the single tye problems beyond enums usage?

The first thing it said at high effort was this:

> Switched to high. Checking one arena crate's source before I answer, so the
> answer names only what I've read.

It came back with three ways to keep each kind of node typed in one tree, with
their costs, citing the design of rowan, the tree behind rust-analyzer, by file and
line. A good answer. It still missed the one I had in mind:

> bad response. What about trait objects, with a getType() resolving to a known enum?

> You're right, I dismissed one type per tree too fast. Your design answers my main
> objection.

High effort is not a guarantee of being right. It is a guarantee of doing the work
of finding out, and of saying what was read. Whether the conclusion is right is
still a conversation, and a good one went on for the next hour: I designed how an
incremental rebuild should work, step by step, and it became the next redesign.
That story belongs to [the next part](article:so-we-could-refactor-just-the-way-we-wanted).

## What about the reviewers?

Later that morning, while answering the questions of the design thread, I realised
the trap had a second floor:

> A question: you are high level, as the other thread is. when you start the independend reviewer, do you use a feature of yours or it reviews i the same thread with the same effort level?

The answer: the reviewer is a separate agent, started fresh from a skill in the
repository, given the diff, the issue, the manual and the documents, and never the
author's reasoning. That separation is what makes it independent. The skill asked
for "the most capable model available". It said nothing about effort. Nothing
raised it, so as far as I can tell every reviewer that week thought at the same
depth as the thread that started it, which was medium.

The independent reviewer was the one part of the process I trusted to see what the
author could not. It had been thinking at exactly the same depth as the author.

## The rule

The decision took one line:

> Agree. Coordinator should start prs to code at medium levels, reviewer at high. Anything else I ca do atm? A, and all on a stack

It went into the review skill within minutes, in its own pull request, so that every
future reviewer starts at high effort whatever thread starts it, and into the
project's memory, so that every coordinator starts code threads at medium.

Why not everything at high? Because the design is not done by the threads that
write the code any more. After that day, every design was agreed with me first,
written into an issue body or a design note, and reviewed, before a coding thread
started. Writing code against a written, agreed design is the part medium effort
does well, and much faster. The reviewer is different. Its job is to see what
nobody wrote down, and that is exactly the thinking medium effort does less of.

That is how I read it, at least. It is a choice, made on purpose and written down,
which is the whole point. The trap was not medium effort. The trap was an effort
level nobody had chosen.

## Why it took a day

Looking back, I think three things hid it.

**Everything that is measured was fine.** Tests, reviews, CI, accessibility checks.
A process that reports green on every gauge trains you to look for problems
elsewhere, and I did: in my own instructions, in missing rules, in the documents.
Those were real problems too, which made the search feel finished.

**I had a working assumption from the last project.** On Itinera, every thread ran
at high effort, and I never had to think about it. I carried that assumption into
a new project without checking it, exactly as I had carried acter's rules in my
head. It is the same trap as the last part, one floor down: not a rule, but a
setting.

**The symptoms looked like my fault.** Poor names, overbuilt designs, and answers
that missed the point are what you get from a vague request too. My first instinct
was to apologise and explain better. Sometimes that is right. Here it was not.

## What I check now

Before a project starts, I check the settings of the team the way I would read a
new colleague's brief. Which model each kind of thread runs, at what effort, who
starts the reviewer and with what. And I write it down in the repository, next to
the rules, because a setting that is not written down is a setting the next session
will not know about.

## What we learned

1. A setting can shape design as much as a prompt does, and it never shows up in a test.
2. A default nobody chose is still a choice; find it and make it on purpose.
3. Thin designs, poor names and overbuilt solutions are symptoms worth investigating, not only signs of a vague request.
4. An independent reviewer is only as independent as its effort; give it more thinking than the author, not the same.
5. Code against a written, agreed design needs less effort than design does; spend the effort where nothing is written down.
6. Assumptions carried from the last project are traps in the new one, whether they are rules or settings.

## Which jobs this one was doing

Two, and both are the kind that has nothing to do with typing code.

- **Project manager** — noticing a day of thin work, guessing why, asking "What is
  your thinking level?", and the rule that followed: code threads at medium,
  reviewers at high, written into the review skill.
- **Architect** — "Where is the parse -> convert -> output call?", "a parser of
  what?", and the trait objects that the agent had dismissed too fast.

No product owner, no platform engineer, no QA. The reviewer appears only as the
thing being fixed.

The six are counted in [*The night that produced no code*](article:the-night-that-produced-no-code).

## Next time

How the architecture was rebuilt while the tool stayed in use: every page pinned
byte for byte, a fresh thread given only the written guidelines, my own bet on the
design, and two redesigns, the second of them merged in a single evening. That is
[*So we could refactor just the way we wanted*](article:so-we-could-refactor-just-the-way-we-wanted).
