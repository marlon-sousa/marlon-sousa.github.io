---
title: 'Asking cost an engineer'
description: 'A product owner who wanted to know whether their idea was even possible had one way to find out: interrupt somebody who was building something already decided. What that did to their work, why the two-line ticket was never laziness, and why the oldest fight in our industry was never about personalities.'
pubDate: 'Sep 28 2026'
series: 'is-our-loop-closed'
seriesPart: 4
tags: ['ai engineering', 'ai', 'software engineering']
draft: false
---

[Last time](article:the-loop-built-for-real) we went around the loop a second time
and built every station for real: the spec with its conditions written before the
code, the inner loop the agent runs alone while nobody watches, the checkpoint that
is one command, the machine read that happens before the human one, a merge with a
short list of exceptions, and the letters coming back. Then we put the six jobs one
engineer with an agent ends up doing onto the stations where each of them sits, and
I said that from here we would go round the chairs instead.

So the loop is built. Are we finished? No. Because the loop I drew starts in the
wrong place.

Look at where it opens. *Somebody decides what the change has to do, and what has
to be true when it is done.* Fine. And where did that come from? Who decided it was
worth deciding, and how did they find out they were not about to spend three months
on something the system cannot do? There was a loop before the loop. It is older,
it is more expensive to get wrong, and my industry did not build a single station
of it. Not one. We did not even draw it.

So here is the first of the chairs, and it is the one whose own loop never closed
at all.

## I was the person they had to ask

Let me put my own record on the table first, because I have been on both sides of
this one too.

For most of twenty years I was the engineer somebody came to. Someone would appear
at my desk, or in my messages, and the question was always a version of the same
question. *Can we even do this?* And I would swivel round, page in whatever corner
of the system they were asking about, and give them an answer. Sometimes a good
one. Sometimes a fast one, because I had a thing I was in the middle of and my head
was full of it. Occasionally, and I am not proud of this, a no with no reason
attached, because answering it properly would have cost me a day I did not have.

Did I think of myself as a bottleneck in somebody else's work? I did not. I thought
I was being helpful. I *was* being helpful. That is the thing about this cheat, and
it is the same thing [we found at the
beginning](article:the-loop-ran-in-somebodys-head): it never feels like a hole in a
process. It feels like a good colleague.

And then, building `acter`, I sat on the other side of it for the first time. I was
the product owner. I knew exactly what I wanted, and for the first time in my career
there was nobody to ask and nothing to wait for. When I wondered whether something
was possible, I could simply find out. That afternoon. And I want to be careful
about what the interesting part is, because it is not that it was faster. It is what
I did with the afternoon: I changed my mind. Twice. About things I would otherwise
have written into a document and then defended for a month.

Hold on to that. It is where this chair is going.

## What it was like

Here is what a product owner actually depended on, and I mean depended in the hard
sense — could not proceed without, and could not get anywhere else.

**Whether the thing was possible at all.** The first and the biggest. Every idea has
a version the system can support and a version it cannot, and the line between them
is invisible from outside the code. So you ask. The answer comes back from one
person, in one sentence, and you have no way to tell *impossible* from *expensive*
from *the person I asked was tired*. That is the veto from [the article about the
rules](article:put-an-agent-in-the-chair-and-the-rules-of-the-game-change) wearing
different clothes: the part of a no that never had to give a reason.

**The rules nobody wrote down.** Your system does things. Some of those things were
decided in a meeting in 2019 and encoded in a conditional nobody has looked at
since. A product owner cannot know that rule exists. They find out when their idea
hits it, usually after the work has started, and the correction gets recorded as
*the product owner did not think this through* — when what actually happened is that
the information lived in one person's memory and in a file nobody could name.

**What the product already does.** Bigger than it sounds. Product owners routinely
specify something that shipped two years ago, or contradict a decision nobody
remembers making, and the reason is not carelessness. Nobody can read a whole
product. There was no instrument for it.

**The field outside your walls.** Provider documentation, what an API will actually
return, the rate limits, the regulation that governs the thing, what the integration
partner supports this quarter. Real research, genuinely slow, and never finishable —
so it stopped when the calendar said stop, rather than when the question was
answered.

**And the instrument for all of it was a meeting.** Sit with that one for a second.
The product owner's actual research tool, the only one they could reach for without
anybody's permission, was *assembling the people who remembered things*. Expensive,
lossy, scheduled three days out, and what it produces at the end is not a result. It
is a shared recollection.

**And then the question every engineer reading this has already thought of.** How
much would it cost? Can somebody be freed up for it? That one deserves its own
paragraph, because of what an estimate actually is.

An estimate costs time to produce — real hours, from the same people you were
trying not to interrupt. And what comes out the other end? A number that answers
some of its own internal questions and not others. Some of them could not be
answered, because the thing itself was not defined yet and nobody could say what it
would have to do. Some were never asked at all, because in the hour available
nobody thought to formulate them, and you do not know what you failed to ask. And
the rest got answered from memory, and from feeling — *this smells like about three
weeks* — which is a guess made by a tired expert about work nobody has investigated.

Then the company plans a quarter around that number. Everybody knows it is soft.
Everybody uses it anyway, because it is the only number there is. And when it turns
out to be wrong, the conversation afterwards is about whether engineering estimates
badly — never about the fact that the estimate was a prediction about something that
had not been examined.

**Then, even when the answer was yes, there was a queue.** Say the idea is possible.
Say no hidden rule kills it. Say you would like to see it working before you commit
the company to it. What does that take? An engineer. Doing what? Building your
prototype instead of the thing that was already decided, already estimated, already
promised to somebody else.

But did you have an engineer? Of course you did not. Nobody has a spare one. So what
you actually had in front of you was a short menu of bad options.

Assume it would work, and find out later, when it is expensive. Or spend somebody
else's fury: get real work paused — not a prototype, a *product*, with its own owner
and its own promise to somebody — so that your uncertain thing could be tried. Or
take it out of an engineer's evening, and then their week, because that is where "we
squeezed it in" actually comes from, and the hours come off somebody's family before
they come off anything else.

So what did you do? Depending on who you were, you made a bad choice. That was the
entire menu. The skill was not choosing well, because there was no well. It was
picking which kind of damage you could live with, and how often you could afford to
cause it.

Hold on to that menu. There is a fourth item on it, and we come to it shortly.

And there it is. **Asking cost an engineer.** Not as a figure of speech. The unit of
currency for a product owner's curiosity was another professional's committed week,
and everybody in the building knew it — which meant the real budget for exploring an
idea was set not by what the answer was worth, but by how much interrupting you
could get away with.

### So the loop never closed

Every station on this series' loop has something coming back. The tests come back.
The letters come back. Even a bad review comes back eventually, as a bug.

This one had nothing. Between *I think we should build this* and *this was worth
building* there was no return path that ran faster than building the whole thing.
You found out whether you had been right from production, months later, with the
money already spent — and by then so many decisions were tangled together that
nobody could say which one had been the wrong one.

That is not a loop that closes late. That is a loop with no return leg at all.

## The two-line ticket was never laziness

Now I want to take something back, because this series has said it twice.

I have complained about the ticket with two lines. [The first of
these](article:the-loop-ran-in-somebodys-head) put it on the list of things my
industry never built: *there was rarely a spec to read against; there was a ticket
with two lines and a conversation somebody half remembered.* Fair enough. But look
at that ticket again, knowing what we have just laid out.

What do you write, when you could not find out whether your idea was possible, could
not discover the rule that might kill it, could not see it working, and could not
get a day of anybody's attention that did not come out of the roadmap? You write
something vague. On purpose. Because vague is not wrong, and because vague quietly
routes the decision downstream to the only person in the building who has the
information anyway.

There is the fourth item on the menu. Not assume, not pause somebody's product, not
spend an engineer's evening — write it vaguely and let the building sort it out.

The two-line ticket was not a product owner being lazy. It was a product owner
routing around a loop that would not close. It was the rational move. Honestly, of
the four, it was frequently the kindest one available.

I think we owe them that much before we go anywhere near telling them to work
differently.

## And the fight was never about personalities

While we are handing things back, here is a bigger one. The oldest argument in our
industry — product pushing, engineering resisting — was not a culture problem. It
was this loop, not closing, in public.

Watch how it actually went. Product asks for something. Some of it is decided, some
of it is not, and the parts that are not have to be settled by somebody. Who? The
engineer, at the keyboard, at the moment of writing, because that is where the
uncertainty finally runs out of places to hide. And here is the part that gets
missed: **when you write the code, you take responsibility for it.** Not
metaphorically. You will be the one the alert wakes. You will be the one who has to
go back in and change it, in a system that is now shaped around the assumption you
were forced to make. So the engineer, being asked to absorb one more uncertain
thing on top of the three they are already carrying, pushes back hard — and looks
obstructive. And product, who genuinely cannot find out any other way, pushes
harder — and looks reckless.

Was either of them wrong? No. Both were behaving correctly. The uncertainty had to
be absorbed by *somebody*, and there was no mechanism for settling it, so it got
settled by an assumption, in code, by the person least equipped to make a product
call, at the most expensive moment available. Many of those assumptions are
precisely the ones a prototype would have answered in an afternoon.

It reached the project manager too, in a form nobody envies. What do we stop, and
for how long, to make room for a thing that is not defined, that may change once it
meets a real user, and whose worth everybody will only genuinely know at delivery?
That is not a planning problem. It is a bet placed with somebody else's quarter.

And look at what we did about it. We tried a great many methodologies, and what did
almost all of them do? Moved autonomy. Gave the decision to product, or took it
back and gave it to engineering, or split it, or put a ceremony around it. Every one
of them redistributed the *authority to decide under uncertainty*. Not one of them
reduced the uncertainty. So the conflict never went away. It changed address, took
on a new vocabulary, and carried on.

And the worst version of all of it needs saying plainly: the "human gate" could kill
an idea that had **never been tried.** Not *we tried it and it did not work*. Never
attempted. One person, one sentence, in a corridor, about a thing nobody had built
even the smallest version of. How many of those have you got? You cannot know. That
is the point. Nothing was written down, because nothing happened.

## What it costs you to skip this

One question to end on, and it has the same shape as [the one about
control](article:put-an-agent-in-the-chair-and-the-rules-of-the-game-change),
because you can answer it about your own organisation today without booking
anything.

Your product owners are deciding things right now. Ask how each of those decisions
got made. Did somebody find out, did somebody ask a person, or did somebody assume?
You will not enjoy the ratio. Then ask the follow-up, which is the one that costs
real money: when one of those decisions turns out to be wrong, when does anybody
find out, and what has been built by then?

If the answer is *we find out from production*, then you have agents writing code at
a speed you are pleased with, feeding a loop upstream of them that has no return path
at all. That is not a productivity problem. You have made the wrong thing cheaper to
build, and you are about to build a great deal more of it.


## Next time

The other half of this chair: [what it can
become](article:a-lie-they-told-you-about-agents). It starts with a lie almost
everybody has been told about agents, that all they do is write code, and with one
session in which two product owners, an engineer and I did in two and a half hours
what used to take days of meetings. Then what an organisation has to put in place
before a product owner can work that way, because that kind of autonomy is not
something anybody can simply grant.
