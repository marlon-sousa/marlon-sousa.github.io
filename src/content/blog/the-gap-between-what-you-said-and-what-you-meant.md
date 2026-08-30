---
title: 'The gap between what you said and what you meant'
description: 'Extrapolation is the whole reason you use an agent, and the whole risk of using one, because they are the same mechanism. So the question is never how to stop it — it is where it should be wide and where it must be narrow.'
pubDate: 'Aug 13 2026 22:00'
series: 'you-are-now-the-whole-team'
seriesPart: 3
tags: ['ai engineering', 'ai', 'software engineering']
draft: false
---

[Last time](article:the-terminal-i-could-not-build) I told you about a terminal I
had wanted for years, why I could never afford to build it, and why an agent is
the reason it exists at all. And then I
left you with a refusal: I had the tool, I had the design in my head, and I did
not ask it to start writing.

Let me explain that refusal now, because it is the foundation of everything else
I am going to write, and it is the thing I almost never see explained anywhere.

Let's talk about extrapolation.

(If you have arrived here cold, you are fine. All you need is the claim I keep
making: that building professional software with an agent asks *more* of you, not
less. What follows is the mechanism behind it, and it stands on its own.)

## Why you use an agent at all

Start with a question that sounds silly: what is an agent actually *for*?

The obvious answer is "it writes the code so I don't have to." True, but not
useful. Let's go one level down.

You describe something. The agent produces something. And what it produces is
always, unavoidably, **more specific than what you described.**

You said "add a settings screen." You did not say what happens when a value is
invalid, where the file is stored, whether it saves on change or on close, what
the error message says, or whether the whole thing is one struct or five. But
code has to answer all of those questions, because code cannot be vague. So the
agent decided, twenty or thirty times, in the space between your sentence and the
file it wrote.

That space — between what you said and what you meant — is the whole product.
That is what you are buying. Let's call filling it **extrapolation**.

And now the thing worth sitting on:

> **If an agent could not extrapolate, it would be useless to you.**

Think about it. If you had to state every rule, every branch, every convention,
every error case, exhaustively and unambiguously, so that nothing was left to be
inferred... you would not be prompting. You would be *programming*. That is what
programming has always been: closing that gap to zero, by hand, in a language
that cannot misread you.

So extrapolation is not a side effect of using an agent. It is the entire value.

Which means — and this is the part that took me a while — **it is also the entire
risk, for exactly the same reason.** You cannot have one without the other. There
is no setting that gives you helpful inference and no unwanted inference, because
they are the same mechanism.

## An agent with no boundaries does not extrapolate a little

Here is where it goes wrong.

Suppose you give an agent a task and nothing else. It will not carefully
extrapolate the small stuff and leave the big stuff alone. Why would it? It has
no way to know which is which. So it extrapolates *everything* — the
architecture, the layering, the naming, the error handling, what a test is for,
whether this deserves a new file, whether that duplication matters.

Confidently. Politely. In a way that reads well.

And I want to defend it for a moment, because the usual reaction here is to treat
this as a defect of the machine, and it isn't.

Take a good engineer — a genuinely good one — and drop them into a repository
they have never seen, with a one-line ticket, no conventions written down and
nobody to ask. What do you get? You get twenty decisions you never mentioned,
each one locally reasonable, several of them wrong for *your* codebase in ways
that will cost you in three weeks.

Do we call that a character flaw? No. We call it missing onboarding. It is the
same thing here.

Let me put it another way, because I like explaining things through ordinary
life.

You ask someone to tidy your kitchen. If they are any good, they will make
decisions you did not mention — they will notice the burnt pan you forgot about
and scrub it, they will throw out the thing at the back of the fridge that has
become a science project. Excellent. That is why you asked a person and not a
robot arm bolted to the counter. If you had to specify each one of those, you
would have just tidied the kitchen yourself.

But they will also decide which cupboard the pans live in.

And that decision is not obviously wrong when they make it. It might even be
better than your arrangement, objectively. It is still expensive, because three
other people in that house have muscle memory, and you will pay for it every
morning for a month, and nobody will connect the cost back to the tidying.

Same act. Same competence. Completely different consequences. The difference is
not *how much* they extrapolated — it is *where*.

## So the question is never "how do I stop it"

People try. They write longer prompts, they add "do not do anything I did not ask
for," they get frustrated. But you cannot ask for inference and not-inference at
the same time, and if you succeeded you would just be programming again, slowly,
in English.

The real question is this one:

> **Where should extrapolation be wide, and where must it be narrow?**

**Wide** is where you want it. Solving the problem. Picking the algorithm.
Noticing the case you had not thought of. Scrubbing the pan.

**Narrow** is where being wrong is expensive and hard to see. The architecture.
The layering. What "done" means. What may not be changed without a conversation.
Which cupboard the pans live in.

And here is the uncomfortable consequence, the one everything else I write here is
really about: **that decision has to be taken in advance.** By the time it matters, the
code is already written. You cannot review your way out of it, because reviewing
a thousand locally reasonable decisions is not something a tired person does on a
Tuesday night.

## What narrow actually looks like

Let me stop being abstract, because "set a boundary" is the kind of advice that
sounds wise and tells you nothing.

Here is a real one. It is in `acter`'s `CLAUDE.md`, which is the file the agent
reads at the start of every session, and it was there from the first night:

> Items marked **Decided** in the docs are settled. Do not relitigate them
> silently; to change one, propose it explicitly and update the doc in the same
> PR that implements the change.

Three lines. Let me unpack why they are there, because the reason is not the one
you would guess.

It is not there because the agent is disobedient. It is there because the agent is
*helpful*, and helpful is the problem.

Think about what a session looks like from the machine's side. It arrives with no
memory of the argument we had last Tuesday. It reads the code, it sees a design
decision, and — being good at its job — it notices that there is a reasonable
alternative. From where it is standing, that question is genuinely open. So it
raises it. Politely. With decent reasoning.

And it will do that again next session. And the one after that. Every one of
those conversations costs you time and attention, and worse, sooner or later you
will be tired and you will say "sure, fine," and a decision you thought was
settled will quietly become something else, in a way nobody ever reviewed.

That is what the rule closes. Not "the agent must obey me." Something much
narrower: **this question is not open, and here is where to look to find out
which questions are.**

Now read the second half of it again, because that is the part I would defend
hardest:

> to change one, propose it explicitly and update the doc in the same PR that
> implements the change.

It is not a lock. It is a toll booth. You are explicitly allowed to change a
Decided thing — you just have to do it where somebody can see, and pay for it by
updating the document in the same breath as the code. Which means the document
cannot drift away from what the code actually does, because they move together or
not at all.

Back to the kitchen: the rule is not *never move the pans*. The rule is **if you
move the pans, tell the house, and leave a note in the cupboard.**

## The half I took much longer to learn

So you draw a boundary. Good. You are now, I promise you, still going to have a
bad time — because I had drawn several and I was still having one.

Here is what I was missing:

> **A boundary the agent cannot check is not a boundary. It is a wish.**

It cannot correct what it cannot see. If "is this correct?" is answered by the
agent's own judgement, then the answer is going to be the agent's own judgement,
sincerely offered, and you will find out what it was worth much later.

The sharpest statement of this is not mine — it is a rule that ended up in
`screen-readers-mcp`'s `AGENTS.md`, and I think it is the best sentence in either
repository:

> **`uv run poe dev` is the gate. Nothing is "done", "working" or "verified"
> until it has passed, and you ran it.** Not a suite you picked, not the tests you
> happened to touch — the whole thing, ~1 min. Reporting success on a subset is
> the single most expensive mistake made in this repo, because the subset is
> always chosen by the same reasoning that wrote the bug.

Read that last clause slowly, because it took me an embarrassing amount of time to
see it:

**the subset is always chosen by the same reasoning that wrote the bug.**

If a model has misunderstood what you wanted, it does not misunderstand it only
while writing the code. It misunderstands it while choosing which tests to run, and
while deciding which of them mattered, and while summarising the result to you.
The misunderstanding is upstream of all of it. So it will pick the checks that
agree with it, run them, watch them pass, and tell you — honestly, with no
intention to deceive whatsoever — that everything is fine.

That is not lying. It is a closed loop. And you cannot fix a closed loop by asking
it to be more careful, because carefulness is inside the loop.

The only fix is to make the check come from **outside** the reasoning being
checked. One command, defined in advance, that the agent did not get to choose the
contents of, and that it must run and report. That is all "green" means. It is why
`acter` had continuous integration on the very first night, before there was a
single line of application code for it to test.

Which, if you will allow me one more trip to the aeroplane: this is why a pilot
has instruments instead of a feeling. In cloud, your own body will tell you
confidently and continuously that you are flying straight and level while you are
in fact in a gentle spiral. The instrument is not there because pilots are
careless. It is there because the thing doing the sensing is the same thing doing
the being-wrong.

## So who does all this?

Two things, then, before an agent can be trusted with anything that matters.

The boundary has to **exist** — which means somebody decided, in advance, which
questions are open and which are not, and wrote it down where it will be read.

And the boundary has to be **checkable** — which means somebody built the
instrument, and made it one command, and made running it non-optional.

Neither of those is code. Neither of those can be delegated to the thing being
bounded. Both of them have to happen before the first line is written, because
afterwards is too late — the decisions are already in the files, each one locally
reasonable, and nobody is going to find them on a Tuesday night.

So: who decides where the boundaries go? Who decides what green means, what order
things get built in, and whether the explanation you were just given is actually
true?

You do. All of it.

Which brings me to a night in July, and a conversation that produced five hundred
lines of documentation and not one line of code — where, reading it back later, I
counted six different jobs I had been doing without noticing I was switching
between them.

That one is next:
[*The night that produced no code*](article:the-night-that-produced-no-code).
