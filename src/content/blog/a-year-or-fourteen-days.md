---
title: 'A year, or fourteen days'
description: 'A workflow framework built for many languages, its first implementation published in Rust, and what fourteen days of working together with agents produced. Why I wanted it, why nobody builds it alone, and why this time it took two weeks.'
pubDate: 'Oct 15 2026 12:00'
series: 'itinera-built-together'
seriesPart: 1
tags: ['ai engineering', 'ai', 'software engineering', 'itinera']
draft: false
---

A workflow framework designed from the first day for many languages. Its first
implementation published in Rust, a language with a reputation for being hard.

- **A specification**: 35 accepted proposals and 8 chapters.
- **A conformance suite**: 317 shared scenarios.
- **A Rust implementation** on crates.io: 19,320 lines of library code.
- **73,832 lines of code whose only job is to check that library.**
- **A book** of 43 chapters and three appendices, every example in it compiled
  and run.
- **A website**, and about 300,000 words of prose.
- **203 pull requests and 157 issues.**

And fourteen days of work.

Welcome to Itinera.

## But what is this?

Fair question. Most of those words probably mean nothing yet, so let me take them
one at a time.

Itinera is a workflow library. It keeps the business rules of a system, whether a
payment is accepted or an order can ship, apart from the flow control around
them: try again, try something else, give up, tell somebody. The rules live in
small steps that know nothing about the flow. The flow lives in one place, a
workflow you can read top to bottom. Every run reports what happened and who
decided it.

The **specification** says what a workflow means, without any programming
language in it. Each of its features started as a **proposal**, discussed and
accepted before anybody wrote code for it. The **conformance suite** is a set of
cases, written as plain scenarios, that any implementation in any language must
pass before it can claim to be Itinera. The **Rust implementation** is the first
one to pass them. The **book** teaches it, and every example in it is compiled
and run whenever the library changes. The **pull requests and issues** are the
trail of how all of that was decided and built.

The fourteen days are not an estimate. The GitHub organisation and the first
repositories were created on the first of October 2026; the first beta went out
on crates.io on the fourteenth. Those are dates in git.

The full tour of the library comes next time. This one is about why it exists,
and why it took two weeks.

## Why I wanted it at all

I have believed for as long as I have written software that code is easier to
understand when you know what is going on.

On a Friday at the end of September I opened an empty folder, started a session
with an agent, and typed this. It is the first thing in the record of everything
that followed, so I will quote it as it went, typos and all:

> I have always been facinated by a single engineering problem when talking about
> software: separating business rules from flow control.
>
> This is important for you to understand: business rules can have if, else, or
> oothers, when decisions need to occur. But, still, there is flow control beyond
> that: do we retry a failed piece? Do we use a different strategy? Do we take a
> completely different path depending on conditions?
>
> …
>
> I am by no means the first to think about it, all we do, decoupling, ports and
> adapters, di, is trying to separate orchestration from busines logic units.
>
> These however usually fail because it is hard to think in appropriate terms of
> what s orchestration ffrom what are the isolated business units.

You have probably watched what happens when the two are mixed, because it is what
happens to most systems that live long enough. Every change lands where it was
easiest for whoever made it, so the flow ends up scattered through the rules, a
little more tangled each time. Then somebody wants an A/B test, two versions of
the same flow with a few steps swapped, and it is far harder than it should be,
because flow, state and business logic are all knotted together and you cannot
copy the workflow and replace two steps. Every change becomes a risk, because
nobody can see everything it touches. The system comes to depend on the few
people who remember how it really works, and that memory gives them power over
everybody else's work, whether they want it or not. And sooner or later the whole
thing takes the path every complex system takes when nobody can read it any more:
it becomes legacy.

Now add agents. I have been working with coding agents for a long time, and I
know exactly what happens when their attention drifts. An agent starts from
nothing every time. Unless it reasons deeply enough, it misses the context: the
retry in the other repository, the circuit breaker's rules, the switch hidden in
the injection setup. It changes the code faster than anyone can follow, in a
system where nothing is exactly wrong but nobody knows every rule. An `AGENTS.md`
file helps, when it helps at all. Restricting changes to the people who remember
everything is bypassed at best and a bottleneck at worst, and usually both. The
tangle that a team used to survive on memory and culture becomes, with agents, a
question of safety.

I did not want to write another warning about that. I wanted to offer an
alternative: a structure in which the flow is visible in one place, so a person
or an agent can see the rules instead of having to remember them. That is the
engineering pitch, and it is not new. Every pattern I named in that first message
was an attempt at it. What I wanted was one that held.

## Not a small library

A library that keeps rules apart from flow is a nice idea in one language. What I
wanted was bigger than that, and each extra piece was there for a reason:

- **Specified once, implemented in several languages.** If the meaning of a
  workflow lives in one implementation, it is that implementation's opinion. If it
  lives in a specification, with cases every implementation must pass, it is a
  standard.
- **Growing in tiers.** A single workflow first, then moving between workflows,
  then workflows inside workflows. Each one specified and proven on its own.
- **Run by different executors without changing a step.** In one process today, as
  separate tasks or across machines later. The executor decides *how* a workflow
  runs; it never gets to change *what* it means.

And all of it checked, which is where most of the code went.

## Most of the code is not the library

Go back to the numbers at the top. For every line of the library there are almost
four lines that exist only to tell us whether it is right.

<figure>
	<picture>
		<source media="(max-width: 720px)" srcset="/diagrams/itinera-code-and-checks-stacked.svg" width="360" height="426" />
		<img src="/diagrams/itinera-code-and-checks.svg" alt="" width="720" height="292" loading="lazy" />
	</picture>
	<figcaption>
		Lines of code in Itinera on the day of writing, blanks and comments left out.
		The library is one bar. Everything below it checks the library: 73,832 lines
		in all, about 3.8 for every line of the library, or about 2 if you leave the
		book's examples out.
	</figcaption>
</figure>

| What it is | Lines of code |
|---|---:|
| The library itself | 19,320 |
| Book examples, compiled and run against every change | 34,223 |
| The conformance runner, the crate that drives the shared cases | 12,697 |
| Compile-fail tests and proofs | 12,522 |
| Conformance cases, shared by every language | 5,335 |
| Unit tests | 4,289 |
| Integration and property tests | 4,246 |
| The library's own examples | 520 |

That is the part I keep coming back to when people ask what agents actually
changed. Anyone can believe an agent types a library quickly. What nobody does
for a new product, because nobody has the time, is build *that* around it: a
suite of cases another language could pass, a runner to execute them, tests
proving that certain mistakes cannot even be written, and a book that breaks the
build if an example stops working. Those are the gates. They are most of the
work, and they are why I trust the library.

## How long should that take?

There are published ways to estimate it, and none of them is kind.

The most used effort model, [COCOMO II](https://arxiv.org/pdf/1912.04189), works
from size. Feed it even the smallest honest figure here, around 40,000 lines, and
it answers with well over a dozen person-years. It is calibrated on teams inside
companies, meetings and all, so take it as a ceiling nobody would reach working
alone. [Published figures](https://successfulsoftware.net/2017/02/10/how-much-code-can-a-coder-code/)
for what a developer actually delivers on a small project run from about 20 to
125 lines a day. At the generous end, the code alone is more than two years. And
documentation is [usually estimated](https://www.techscribe.co.uk/techw/documentation-project-metrics.htm)
at three to five hours per finished page; 300,000 words is somewhere between 600
and 1,000 pages, which is one to almost three years of writing on its own.

Lines are a poor measure of effort, and the models describe teams, not one person
who knows exactly what he wants. Discount all of it heavily. It still does not
come in under a year.

So when I say this would have needed at least a year of paid, full-time work,
that is my own guess, and the conservative one.

## Why it never existed

Because one person cannot hold all of that in their spare time.

And who gets a year of paid work for an idea? Not for a product, not for a
contract, for an idea about how code should be shaped. So the idea stayed an idea.
It is a very comfortable place for an idea to live. It never has to be wrong.

## What changed

Agents.

But not agents on their own, and this is the part the rest of the series is about.
Agents with somebody who knows how to work together with them. When you do, a
year can become fourteen days.

To be exact about the count: the thinking started a few days before the first of
October, on that Friday in September, in a conversation and nothing else. That
conversation has its own place in this series. The fourteen days start when the
first repository did.

So, at least a year against fourteen days. One number is my conservative guess
and the other is git. Keep that in mind when you weigh the claim, because I will
not pretend they are the same kind of number.

## The choice I made on purpose

There was an easier way to show what agents can do, and I did not want it.

I did not want to build yet another pretty app whose real purpose is to
demonstrate how cool agents are. There are plenty of those, and they prove one
thing: that an agent can type a lot of code quickly. We knew that already.

I wanted to build an empowering library, something people could use whether or
not they ever cared how it was made, on a properly established process. And then
use agents to build it.

That order matters. A library with a specification and a conformance suite has a
bar the work has to clear, and the bar does not care who typed the code. A
proposal for every feature. Cases written before the code. A release that carries
the proof of what it claims. If agents were going to build this, they were going
to build it under those rules, with nothing quietly decided along the way. The
chart above is what those rules look like once they are code.

## What this series is about

Not about agents typing code. That turned out to be the cheap part.

It is about the way the work was done together. Thinking out loud with an agent
and asking what it thought. Taking its idea when it was better, and that happened
more often than I expected: the name of the library was the agent's, not mine.
Pushing back when it was wrong, and being pushed back on. Admitting when I was
lost. Writing down everything it would otherwise forget, because working with an
agent well looks a lot less like giving orders and a lot more like working with a
sharp colleague who forgets everything overnight.

And, later on, a process in which agents reviewed what other agents proposed while
one person decided what they were allowed to decide.

The conversations are quoted on both sides, as they happened, typos included. You
will see me be wrong in them. You will see the agent be wrong in them too.

It is also not vibe coding, and before we are done I will say why.

## What we learned

If you keep only a few things from this one, keep these.

1. Keeping business rules apart from flow control is an old idea; the hard part has always been making it hold.
2. With agents, a tangle a team used to survive on memory becomes a question of safety, because an agent starts from nothing every time.
3. Most of Itinera's code is not the library but the checks around it, and those checks are why I trust it.
4. Fast typing was never the news; the news is that the gates nobody has time to build for a new product got built.
5. Agents did not do this on their own: it took somebody working together with them, under rules the work had to clear.
6. The fourteen days come from git and the year is my own conservative guess, so weigh them as different kinds of number.

## Which jobs this one was doing

This one is mostly about deciding what to build, so the list is short, and it
should be.

- **Product owner.** Choosing a library over a demonstration app, and setting its
  scope before anything was built: one specification, several languages, tiers,
  executors that change how a workflow runs but never what it means.
- **Architect.** The first message of the record: drawing the line between business
  rules and flow control as the thing the whole design would have to hold.

No project manager, no platform engineer, no QA and no reviewer. Nothing had been
built yet for them to work on.

The six are counted in [*The night that produced no code*](article:the-night-that-produced-no-code).

## Next time

The library itself, told plainly: steps that know nothing of the flow, a workflow
that declares it in one place, what a journey reports, and why that matters more
when agents write the code. That is [*What Itinera is*](article:what-itinera-is).
