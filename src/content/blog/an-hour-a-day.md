---
title: 'An hour a day'
description: 'What the method from last time actually produced, measured rather than asserted: where the hours went, how much had to be done twice, and the afternoon a machine that had never built any of this was ready in nine minutes.'
pubDate: 'Aug 30 2026 22:00'
series: 'you-are-now-the-whole-team'
seriesPart: 6
tags: ['ai engineering', 'ai', 'software engineering', 'rust', 'accessibility']
draft: false
---

[Last time](article:conditions-not-instructions) I showed you five moves — state
conditions rather than architecture, ask for objections, refuse to let the work
start until you have heard the plan, argue when you do not understand, and read
the specification back in your own words — and I claimed they add up to treating
the agent as another person on the team rather than as a tool.

Which is all very well as an argument. The obvious objection is that it sounds
like a great deal of process for one person working evenings, and that somebody
who simply asked for the code would have been finished by now.

So this one is numbers. Where the hours actually went, how much of the work had
to be done twice, and one afternoon that I think settles the question on its own.

## Where the hours went

I measured both repositories again today, for this article.

[Part four](article:the-night-that-produced-no-code) counted one of them, six
weeks after its planning night: 49 merged pull requests, 47 specifications, and
four documents that still described the code. Here the scope widens to the pair,
because the method is not a thing that happened to the terminal — the screen
reader bridge was built the same way, and started three days earlier.

So: across the terminal and the bridge, what the repositories themselves record,
which needs no interpretation at all.

- **131 merged pull requests**, in 193 commits.
- **173,485 tracked lines.** Of those, 105,281 are code — Rust, TypeScript,
  Python, Go — and **42,786 are Markdown.**
- Which is **one line of specification for every two and a half lines of code.**
  A quarter of both repositories, by volume, is writing.

Now the time, and here the method matters enough that I am going to state it
rather than hand you a number. "Active engagement" is the sum of the gaps between
consecutive events in the transcripts, counting only gaps of ten minutes or less
— a crude way of asking how much of the elapsed time somebody was actually at the
keyboard. Session length is useless for this: one session spans fifty-six hours,
because I slept in the middle of it. I also **union** the intervals across
sessions instead of adding them, because I often have two agents working at once
and adding would invent hours that never existed. That correction alone removed
17.6 hours.

Part four made the elapsed-time point crudely — that of the forty-six days since
the terminal's planning night, only twenty had commits on them. This is the
version with the hours in it, and it is the one I would defend:

- **84.2 hours**, over 22 days with any activity on them — about **3.8 hours on a
  day I worked at all.** Evenings and weekends, alongside a full-time job.
- **837 messages typed by me**, against **15,956 tool calls** by the agents.
  Roughly **nineteen actions on its side for every message on mine.** That ratio
  is the leverage, stated without reference to a single line of code.

And then the question I actually wanted answered, because "3.8 hours a day" still
sounds like somebody typing furiously in the dark, and that is not what those
evenings were like at all. So I split the clock in two. Every stretch of waiting
that ends with a message from me was the machine waiting on a human; everything
else inside an active stretch was the machine working — writing, compiling,
running the suite, opening the pull request.

- **59.2 hours, 70 per cent of it, was the machine working.**
- **25.0 hours, 30 per cent, was me** — reading what it had written, thinking, and
  typing.

So of those 3.8 hours on an active day, **a bit over one hour was mine.** And the
rhythm inside it is visible too: the median wait before one of my messages is
**132 seconds.** A quarter of them come back inside a minute; nine in ten inside
six.

Two minutes, over and over. That is what this looks like from the outside — not a
person composing elaborate instructions, but a person reading a paragraph,
thinking about it, and saying *no, why?*

The typing itself is smaller still. Of my 837 messages, 807 were things I actually
typed, and together they come to 97,983 characters — call it **eight hours of
typing spread across a month**. The other 30 messages carry 374,581 characters,
because they are pasted: handoff prompts, logs, error output. Four fifths of what
I "sent" was never typed at all.

> The leverage is not that I type faster than I used to. It is that a third of
> the clock is mine and the rest belongs to something that does not get tired.

One caveat, and it is not a small one: those 84 hours are **not the whole
project.** They are only the part the retention sweep has not eaten — everything
before 30 July is gone, the planning night included. The real figure is larger,
and I can no longer compute it. Which is its own small argument for backing these
things up, and I have now done so.

But the ratio is the answer to "all this process is overhead". Those 42,786 lines
of Markdown are not on top of the 84 hours. They are *inside* them. A quarter of
everything produced is the specifications, the roadmaps and the agent contracts —
and it is the quarter that makes the other three quarters reviewable, handoverable,
and comprehensible three weeks later to a colleague with no memory. Including,
frequently, me.

## And how much of it had to be done twice?

That is the question I would ask next, and it is the right one, because volume is
cheap. A hundred thousand lines that had to be written two and a half times is
not an achievement, it is a warning. So I went and counted the rework, which
turns out to be one of the few things a git history will tell you honestly.

Part four asked a narrower version of this — what went *red* — and answered it
with the terminal's continuous integration record: 62 runs on its main branch, and
the cheap gate going red exactly twice. This is the other half of the question.
Not what broke, but what had to be written again.

Across the entire history of both repositories:

- **117,153 lines of code were ever written. 11,904 of them have since been
  deleted.** Ninety per cent of every line ever committed is still there — the
  whole history cost **1.11 lines written per line surviving.**
- Documentation is the same story: 46,547 lines of Markdown written, 3,760 since
  removed.
- **Zero reverts.** Part four counted the terminal's — none in 77 commits. Across
  both repositories, 191 commits, it is still none.
- **Eight commits** — four per cent — carry a fix in their subject line. Of 131
  merged pull requests, four are titled as fixes.

Two things that number is not, and I want to be exact, because a statistic with
its caveats removed is just a boast.

**It does not include what happened inside a branch.** Both repositories squash
their merges, so a pull request arrives as one commit and everything that happened
while it was being built — the agent writing a thing, reading its own test
failure, and rewriting it — is invisible here. That churn is real and it is not
counted. What *is* counted is the thing my question was actually about: work that
was merged, that everybody agreed was done, and that later had to be undone.

**And not every deletion is an error.** The layout of the terminal's domain crate
moved from concept-first to role-first on the second day, which shows up in these
figures as deletions and was entirely deliberate. So ten per cent is a *ceiling*
on rework, not a measurement of it. The true figure is lower and I cannot separate
them.

Even as a ceiling, though, it says something I did not expect to be able to say:
in seven weeks, one person in the evenings, at about an hour and a bit a day of
his own attention, produced a hundred thousand lines of code and forty thousand
of documentation, and **essentially none of it had to be taken back out.**

But do not read that as "the agent got it right the first time", because that is
not what happened at all, and the honest version is better.

Go back to the PowerShell conversation. **Three plans were proposed and two of
them died** — the version resource was wrong because a measurement said so, and
then both of ours were wrong because the prior art said so. That is rework. It is
rework of the ordinary, unavoidable kind that every real engineering problem
produces.

It just did not happen in code. It happened in prose, at two minutes a round,
before a single file existed.

> The rework is not missing. It was moved to where it is cheap.

## And I never set up an environment

Here is a cost that does not appear in any of those figures, because it did not
happen: **I have not spent an hour setting up a development environment.** Not on
this machine, not on the other one. No afternoon lost to a toolchain, no
half-day of "it works on the other computer", none of the small archaeology that
normally eats the first day of anything.

And that is not luck, it is a thing that was built. In the screen reader bridge
it has a name: `poe doctor`.

> `uv run poe doctor` ← run this FIRST, before anything else
>
> `uv run poe dev` ← the doctor, then everything CI runs. The one to run before
> saying something works.

The doctor is a program that examines the machine and says what is wrong with it
— which tools are missing, which are below their minimum version, which generated
file has drifted from its source, which binary is older than the code it was
built from. `poe fix` repairs what can be repaired. A fast subset of it runs as a
gate in front of every other task, in about a second. And the reasoning is
written down where the tasks live:

> A red doctor makes green tests and red tests equally uninformative.

Which is [the gate from part three](article:the-gap-between-what-you-said-and-what-you-meant)
pointed at the machine rather than at the code, and it exists for the same reason:
a check whose result you have learned to explain away is not a check.

Now the demonstration, and it happened this week.

On the evening of 27 August I opened a session with this:

> **Me:**
> We need to start researching voiceover support on mac OS.
>
> I have a mac, and we can code and use the bridge from there, but we have too
> much to cover in terms of architecture, and I think this is doable on Windows
> still.

VoiceOver is the screen reader built into macOS. I had never written a line of
software on that machine. Not one. It sat there being a Mac.

The next afternoon I sat down in front of it, installed the agent, and typed a
`git clone`. Then this — and it is one message, so read it as one message:

> **Me, 28 August:**
> install everything, ssh was dropped. Poe will have to be aware on what os it
> lives and disable things selectively.
>
> Another thing: bridge should be probably in go, not python. Distributing a
> bridge for nvda is ok, because we have a .nvda-addon. A bridge is not part of
> voiceover, it is basically a drivr, and distributing a bunch iof python fies
> make no sense.
>
> We have two options:
>
> 1. If we do it in go, we can use the go protocol bind.
> 2. If we make it in swift, we can have a single component, perhaps, acting as
>    the speech provider and the bridge.
>
> **When it is time, I will let you make the choice.**

Two words for the whole environment — "install everything" — with a condition
attached to it, that the task runner must learn which operating system it is
standing on and switch things off deliberately rather than fail. And then a
design constraint stated as a *reason* ("a bridge is a driver"), two options, and
the decision explicitly handed over.

Nine minutes later:

> **The agent:**
> ## Environment installed — gate green except two Windows-only test modules
>
> Everything is in. Headings from here on, as asked.

Then a table of everything it had put on the machine, with a reason attached to
each line. Two of those reasons are the entire point of this section, so here they
are:

> `uv` 0.12.7 — **Not** Homebrew: the `uv` formula has no bottle for macOS 15
> x86_64 and wanted to build llvm@22 + rust from source. Used astral's standalone
> installer.

> Go **1.25.14**, pinned ahead of the linked `go` 1.27. I deliberately did not
> leave you on Go 1.27. CI pins 1.25, and the `staticcheck@2025.1.1` pin cannot
> read Go 1.27's export data — `poe go-staticcheck` died with *"export data
> version 4 is greater than maximum supported version 2"*. Under 1.25 it passes.
> The alternative was bumping the staticcheck pin, but that's pin drift away from
> CI, so I matched CI instead.

Neither of those is installation. **Both of them are diagnosis** — and they are
exactly the two shapes that eat an afternoon. The first is the one where a package
manager quietly decides to compile a compiler and you go and make dinner. The
second is the one where a tool fails with a message about export data versions,
and three hours later you have learned more about Go's internals than you wanted
and you still have to decide whether to change the pin or the toolchain. It made
that call the right way, for the stated reason: match CI, do not drift from it.

There was a third line in that table I enjoyed more than I should have:

> ripgrep 15.2.0 — real binary; your previous `rg` was a Claude Code shell
> *function*, invisible to the doctor's `shutil.which`.

Which is where my line from the Windows side comes from — *"so rg isn't a claude
feature, it is something that must be installed"*. The doctor found something
about my own setup that I had been wrong about for weeks.

And notice what the first pull request on that machine was:

> **Me:**
> draft the spec and code this here. **Consider this first pr as a mac os setup,
> so both systems can run the project.**

Before the platform got a feature, the platform got a doctor — specced, reviewed
and merged like anything else. I did not think about that, by the way. By then it
was simply what you do.

My share of that afternoon, end to end: a `git clone` I pasted, the message above,
"ok, agree", and about twenty minutes of fighting my own SSH agent — which the
agent then talked me through. **The machine was ready and I had not read a single
installation page.**

And the whole macOS record, measured the same way as everything else: three days,
**15.4 hours of active engagement, of which 4.7 were mine**, 131 messages, and a
median wait before each of them of 133 seconds. On Windows that median is 132.
Same rhythm, different continent of the operating system world.

There is one more thing in that Swift, and I want to end this section on it,
because it is the quietest evidence in the entire series. Here is the layout of
the new bridge:

- `Sources/CaptureVoice/Domain/Entities/`
- `Sources/CaptureVoice/Domain/Ports/`
- `Sources/CaptureVoice/Domain/Controllers/`
- `Sources/CaptureVoice/Adapters/`
- `Tests/CaptureVoiceTests/Fakes/`

Entities. Ports. Controllers. Adapters. Fakes.

That is the module role rule from [the night that produced no
code](article:the-night-that-produced-no-code) — written for a Rust codebase, on
a Wednesday in July, for a different product — showing up unprompted in **Swift**,
which is the fifth language it now lives in. Rust, TypeScript, Python, Go, Swift.

Part four audited that rule where it was written and found it holding: 89 of 96
modules in the terminal declare one of the six roles in their own first line, and
the remaining seven are facades that the rule exempts. That is a rule surviving
inside the codebase it was made for, which is impressive enough.

This is the same rule surviving somewhere it was never aimed — a different
product, a different platform, a different language, in a session that had never
read the document it comes from.

A decision written down clearly enough does not just outlive the conversation it
was made in. It outlives the *language* it was made for.

## And this is why it is not vibe coding

Back to where [the first article](article:at-long-last-only-an-engineer) drew the
line, because now it can be drawn precisely.

Vibe coding is defined by what you **do not look at**. You describe, you accept,
you do not read the diff. And for a script that renames four hundred photos, that
is a completely rational way to spend your afternoon.

What I have just shown you is defined by what you **will not let be produced**
until the conditions are stated, the objections are heard, the plan is on the
table, and you can say the thing back in your own words.

Those are not two points on one scale. They are opposite disciplines, and they
are opposite in a way that has nothing to do with how hard you are working.
Everything in this article happens in **minutes**, before there is any code — one
sentence withholding permission, one question asking for objections, one numbered
list read back. That is the cheapest part of the whole enterprise.

The expensive thing is not doing it. That is the part that costs you a week, in
three weeks' time, when nobody can remember why.

## Next time

Six roles, five moves, a gate, a spec-first process, documents that still describe
the code after 49 pull requests, and a hundred thousand lines of which almost
nothing had to be taken back out.

And six things got through all of it anyway.

Next time, those six — past the mechanisms, into the repository, nobody's fault —
including the one where an agent took a rule I was proud of, found the hole in it,
and was entirely right.
