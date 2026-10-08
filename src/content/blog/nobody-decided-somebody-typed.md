---
title: 'Nobody decided. Somebody typed.'
description: 'The code is written by agents now, so what is left for the architect and the engineer? Almost everything that ever decided whether the code was right — because those decisions were never made in a meeting. They were made at the keyboard, one at a time, by whoever was typing, and a loop that is never written down has nothing to close on.'
pubDate: 'Oct 08 2026'
series: 'is-our-loop-closed'
seriesPart: 6
tags: ['ai engineering', 'ai', 'software engineering']
draft: false
---

[Last time](article:a-lie-they-told-you-about-agents) we finished the product
owner's chair. Agents do not only write code; they read, and they reason about what
they read, and that puts feasibility, the rule nobody wrote down and a working
prototype within a product owner's own reach — once the organisation assembles
what that autonomy needs. And the exploring leaves a document behind it, a PRD,
which is where the spec station finally gets its input from.

So the idea survived. Somebody has to build it now. Which brings us to the chair
everybody thinks they already understand: the one where the code gets written.

## So what is left?

Let's get the obvious question out of the way, because every engineer reading this
has already asked it, and most of them at two in the morning.

The agent types now. It types faster than I do, it types in languages I do not
know, and it does not get bored on the fourth migration of the week. So what is
left for the architect and the engineer? Nothing? Do we go home? Run for the hills?

No. Almost everything is left. Everything that ever decided whether the code was
*right* is still there, untouched, waiting for somebody to pick it up. The trouble is
that almost none of it is visible, and it is worth taking a minute to see why,
because the reason is the whole article.

It is invisible because it was never done anywhere you could point at. Not in a
meeting. Not in a document. It was done at the keyboard, by whoever was typing, in
the gaps between keystrokes. And nobody noticed it was a separate job, because it
was always done by the same pair of hands.

## Two jobs in one pair of hands

I have said this before, and it went down well enough in a room that I will say it
the same way. We were always the engineer and the bricklayer at once. On a building
site the engineer decides where the walls go and why the building stands up, and
somebody else lays the bricks. In our trade, laying the bricks was itself an
ultra-qualified job, and there was never a cheaper pair of hands to give it to. So
one person did both.

That much is [an old argument of mine](article:at-long-last-only-an-engineer). Here
is the consequence I did not draw at the time, and it is the one this chair lives
on.

If one person does both jobs, *when* does the engineering happen? Think about it.
There was no separate moment for it. No handover from the engineer to the
bricklayer, no drawing passed across a table. So the engineering happened at the
only moment available: the moment of laying the brick. Every engineering decision
in the building was made by whoever was holding the trowel, while they were holding
it.

Does that sound abstract? Let me make it very concrete.

## What the keyboard decided

Take an ordinary afternoon. A ticket arrives — a good one, even, better than two
lines. An engineer opens the editor. Now watch, because in the next three hours a
great many things are going to be decided, and not one of them is going to feel
like a decision.

Where does this code go? In the module that already does something similar, or in a
new one? A new file, or on the end of the one that is already eight hundred lines
long? Decided. In about four seconds.

The call to the provider can fail. What happens then? Retry? How many times? Log it,
and at what level? Swallow it and return an empty list, because the screen looks
fine with an empty list? Decided. By feel.

What does the test prove? Does it hit the database or a fake? Is it one test for the
happy path, because the ticket is due tomorrow, or six? Decided.

That library would save an hour. Do we add a dependency for an hour? Decided.

The name of the thing. The shape of the function. Whether this rule belongs in the
code at all or in a table somebody can change without a deploy. How big the change
is allowed to get before anybody else sees it. Decided, decided, decided.

And one level up, the ones that were made once, at the very beginning, and then
lived for a decade. Is this project typed? Do we lint, and how strictly? What is the
test strategy? Those were made too. By whom? By whoever started the repository, on
whatever day they started it, because they liked it that way.

Now the question that matters. Was any of it written down?

Why would it be? The person holding the opinion was the person applying it. You do
not write a note to yourself about where the pans go in your own kitchen. There was
sometimes a style guide, a wiki page from years ago, and everybody knew the real
rules were whatever the senior reviewer would let through. Which was, if you think
about it, the same arrangement one level up: the rules lived in a head, and the head
had a veto.

## Opinions, not decisions

I want to be careful with a word here, because it sounds like an insult and it is
not one.

Most of those were **opinions**, not decisions. And the difference is not about
quality. Some of the best engineering I have ever seen was opinion. The difference is
about *where it lives*.

A decision is made once, in the open, by somebody who owns it. It is written down,
so it can be read by somebody who was not there, and it can be revisited, because you
can find it. An opinion is made again every single time, inside a head, and it can
be as good as you like — it still exists only for as long as that head is in the
room, and it can only be applied at the speed that head can type.

So a codebase built by a good team was not a codebase without decisions. It was a
codebase whose decisions were distributed across the heads of the people who wrote
it. You could see it, too. You have opened a file and known who wrote it before you
reached the third function. That was not a style. That was somebody's opinions,
fossilised.

### Written for whoever would review it

And we knew it, all of us. Somewhere early on, every engineer learns that the rules that
matter are not the ones on the wiki. They are whoever is going to review this. So we wrote
for them. Before the pull request was even open you knew who was likely to pick it up, and
you shaped the code to that person: the names they liked, the pattern they would not argue
with, the test they always asked for. Cynical? No. It was the rational move, the same way
the two-line ticket was. The rules lived in a head, so you wrote for the head.

And when you guessed wrong? Days. Round after round of comments about things no document
mentioned. And under all of it, a risk nobody could plan for: the "human gate", finding a
free hour, deciding to look at your change, and coming back with ten comments on something
two other people had already approved. Was the code better afterwards? Sometimes. More
often it was just different. It was theirs now.

Then the layers. Opinions change owners. A new lead arrived, and with them a new idea of
how errors should travel, what a test was for, what a service should look like. New code
followed it. Old code stayed exactly as it was, because nobody rewrites a working module
for taste. So the codebase grew strata, like rock. You could date a file by its style, and
tell who was leading when it was written. And underneath the strata, the oldest decisions
of all — typed or not, how strict, where the business rules live — were never revisited
by anybody, because nobody knew they were decisions. They were just how things were.

Two opposite failures, one cause. What changed, changed with a person. What stayed, stayed
because a person once chose it and nobody could find the choice to question it.

### So the loop never closed

Every chair in this series runs a loop of its own, and this one's is simple to
state: between *this is the right shape* and *it held*.

Now look for the return leg. When one of those afternoon opinions was wrong — the
error swallowed, the rule buried in the code, the file that grew past eight hundred
lines — when did anybody find out?

You never found out that an opinion was wrong. That is the whole problem. You found
out, years later, that something *hurt*. The module nobody would touch. The class of
incident that came back every quarter wearing a different ticket number. The
onboarding that took six months, and the new person who, in their second week, broke
something that "everybody knew" not to do. And did anybody trace that pain back to
the choice that caused it? How could they? Nobody knew a choice had been made. There
was no record of it being made. There was only the code, and the code does not say
*somebody decided this on a Tuesday because the ticket was due*.

It is a different failure from the product owner's, and the difference matters. The
product owner's loop had no return leg because finding out cost an engineer. This one
had nothing to return *to*. You cannot correct a decision that was never recorded as
a decision. The feedback arrives, eventually, as pain — and pain with no address gets
filed under *legacy* and lived with.

And there is a worse version, and we have met its owner before. When the opinion
belonged to the "human gate", it was never argued at all. It was not even an opinion
you could disagree with. It was just how things were done here. *We don't do it that
way.* Which way? Why not? The answer was the person.

## What we paid to make it work

And yet, it worked. We built banks this way. Airlines. Everything you use. So let's be
fair to it before we go any further. Why did it work?

First, because the cost of a wrong opinion was **bounded by typing**.

One person, in one year, types some tens of thousands of lines. That was the ceiling.
A bad habit about error handling, held by one engineer, could only ever be as big as
the code that engineer wrote. Review caught some of it. The engineer's own memory
caught more, because the person who made the mistake was the person who got woken up
by it, and they remembered, and they did it differently next time. Nobody wrote the
lesson down. They did not need to. It lived in the same head as the mistake.

Second, because there was **time**. Nobody counts this one, and it is the one that
paid for everything else. A new engineer had months to absorb the opinions of the
place, one review at a time, until they were writing for the right head without
thinking about it. And those days of comments, when a change landed with the wrong
reviewer? Expensive. But affordable, because the code arrived at the speed of typing,
and the conversation about it could keep up.

So it worked. Now look at what it bought.

Give it a few years and every legacy system looked like every other one: a beast
nobody fully understood. Except, perhaps, the "human gate". And what did the "human
gate" spend their days on? On the thing that would set the company apart from its
competitors? No. On defending what was already there. On being the one person who
knew why the module nobody touched must not be touched — the most expensive engineer
in the building, working as its memory.

Was anybody surprised? Not really. Deciding on purpose how code gets written — in
writing, with an owner, revisited when it hurts — was always *desirable*. Every
architect I have known would have said yes to it. And it was almost always skipped,
because the deal let us skip it. The price was paid in time and in legacy, slowly, and
slowly is a price organisations are very good at not seeing.

That was the deal, and nobody signed it, and it held for my whole career.

## Now split the body

The agent types now. So look at what happens to that deal.

The agent holds no opinions between sessions. Every session starts empty. So do the
decisions stop being made? That would be nice. No. Every one of those afternoon
decisions is still made — where the code goes, what happens when the call fails, what
the test proves — because the code cannot be written without making them. They are
made by the agent. It extrapolates. That is [the whole reason we use
it](article:the-gap-between-what-you-said-and-what-you-meant), and it is also the
whole risk: give it a ticket and no boundaries, and it will make twenty decisions you
never mentioned, each of them locally reasonable, and it will make them confidently,
because it has nothing else to go on.

And next Tuesday, in a session that remembers nothing about this one? It will make
them again. Differently. Just as reasonably. Is it being careless? No. A good engineer
dropped into an unfamiliar repository with no conventions would do exactly the same
thing, and we would not call it a character flaw. We would call it missing
onboarding. The difference is that the good engineer gets onboarded once, and the
agent gets dropped into the repository fresh every single morning.

Now take away the time, because that is the other thing the agent takes. In one week
an agent can produce more code than a team used to write in six months. The months of
onboarding? There are none; every morning is the first day. The days of comments?
Nobody can have days of comments at that speed. Both of the things that paid for the
old deal are gone at once.

So where do the engineer's opinions go? To review. After the code is written. Which is
the most expensive moment available to have an opinion, and the one where it sounds
most like taste. And from there it goes one of two ways.

One way, the engineer argues. *This is rubbish. It doesn't look like anything I would
write.* Comment after comment. And the agent... adapts. Of course it does, it is very
good at that. Then somebody else opens the next change and complains about exactly the
things the first engineer asked for. Round and round, with no end, because every round
is an opinion nobody wrote down, enforced on a writer that will have forgotten it by
tomorrow. And the verdict in the corridor? *Agents don't work.*

The other way, the engineer lets it go. Who has the time to read all of that? Nobody.
So it merges. And a few months later there are five parsers in the codebase doing the
same thing, each partially implemented, each written by a perfectly sensible session
that never knew the other four existed. That is not a hypothetical. It is exactly what
I [wrote a rule against on the very first
night](article:the-night-that-produced-no-code) of one of my own projects, because I
could already see it coming.

So here is the line this whole chair is built on:

> The cost of a wrong code opinion used to be bounded by how much code one person
> could type. It is not bounded any more.

And its mirror, which is the one I think most organisations have not noticed yet: a
decision nobody made is also a decision. It is the agent's, remade every session, and
applied at the speed of the fastest writer in the building.

Put the two together and look at the beast again. It used to take years to grow, and
there was at least one person who understood it. Now it grows in months, and the
person who understood it is not there, because nobody was ever typing long enough to
become them. And the agents? They read the codebase fresh every morning. Five parsers,
three ways of handling an error, a rule in four places. Which one is right? They cannot
tell either. They pick one, at random, and add a sixth.

That is why the governance that was always desirable is now a must. Not because
somebody likes process. Because without it, not even the agents will survive the code.

## Whose opinion, then?

And there is a harder part, and I would rather say it straight. When the decisions get
written down, some opinions do not get a new address. They get dropped.

Remember who we used to write for? Whoever was going to review it. The reader decided
the shape of the code. That has not changed. The reader has. The one reading this code
most, and writing most of it, is not the engineer any more. It is the agent.

So the question for each of those decisions is no longer *what do I like?* It is *what
does the writer we actually have need in order to get it right?*

Take the oldest decisions of all, the ones at the bottom of the strata. An engineer may
genuinely prefer untyped code with no documentation, and may have written good software
that way for twenty years. Fine. But the agent cannot walk over to that engineer's desk
and ask what a function expects, and it does not remember what it read yesterday. A type
checker tells it, every single run, whether it got the shape right. A documented module
tells it what the code is for. Take both away and it guesses — and it guesses far more
often than it would the other way round. So the decision follows the writer, not the
taste.

Is that a defeat for the engineer? I do not think so. Writing for whoever reads your code
was always the job. We just had a reader who could ask.

## What "strategic" means here

People hear that code decisions have become *strategic* and picture something grand. A
committee. A board. A slide with the word *governance* on it. Nothing like that.

Strategic, here, means three plain things. Made **in advance**, before the code exists,
because by the time it matters the code is already written. Made **by somebody**, who
owns it and can be asked. Made **in writing**, somewhere the agent reads at the start of
every session, and a person can read on their first day.

That is it. That is the whole change. The decisions that used to live in the hands now
have to live in the repository, and the people who used to make them one keystroke at a
time — the architect and the engineer — now make them once, out loud, for every session
that follows.

Which means the answer to *what is left for the architect and the engineer?* is not
*less*. It is the engineering. All of it. The part the typing always crowded out.

And notice what that implies about the hours. The typing took most of an engineer's
week, and it is going. Time like that does not stay empty. If nobody decides what fills
it, it gets filled with whatever is at hand — more tickets, more meetings, a second
review of something the machine already checked — and the decisions above go on being
made by nobody. Filling it on purpose is a chair decision too, and it gets an article of
its own.

And if you are the engineer reading this, let me say one thing plainly, from somebody
who spent most of a career making exactly these calls at exactly that keyboard. Your
opinions were never the problem. Many of them were right. The problem was that your head
was the only place they could live, and now there is a writer in the building that
cannot read your head. So the good ones need a new address, and the ones that only ever
suited you need letting go. Telling one from the other is not paperwork. It is the job.

## What it costs you to skip this

One question to end on, with the same shape as [the one about
control](article:put-an-agent-in-the-chair-and-the-rules-of-the-game-change), because
you can answer it about your own organisation today without booking anything.

Pick three engineering decisions in your main codebase. How an error from a provider is
handled. Where a business rule is allowed to live. What a test has to prove before a
change can merge. For each one, ask three things. Where is it written? Who decided it?
And when did anybody last check it against what actually happened?

If the answers are *nowhere*, *whoever started the repository* and *never*, then your
agents are applying somebody's opinion from years ago — or none at all, a different one
every session — at a speed nobody has ever applied an opinion before.

You will see it before you understand it. It looks like *agents don't work on our
codebase*. It looks like review queues that never drain, because every review turns into
an argument about how the code should have been written. It looks like the same incident
three times, each fixed properly, each fixed somewhere different. None of those is an
agent problem. Each of them is a decision that was never made, being made for you.

## Next time

What this chair can become. Not a list of rules — a set of decisions made before the
first line exists, each with somebody who owns it: where code is allowed to go, which
language and how strict, what green means and which gates nobody argues with, how big a
change may get before a person has to read it, and the technical spec that turns the
product owner's document into something a machine can be held to. And where all of that
has to live, so that a writer that remembers nothing reads it every single morning.
