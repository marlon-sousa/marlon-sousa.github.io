---
title: 'Asking cost an engineer'
description: 'A product owner who wanted to know whether their idea was even possible had one way to find out: interrupt somebody who was building something already decided. What that did to their work, why the two-line ticket was never laziness, and what has to be assembled — training, access, an environment, a budget nobody has to justify — before it stops.'
pubDate: 'Sep 24 2026'
series: 'is-our-loop-closed'
seriesPart: 4
tags: ['ai engineering', 'ai', 'software engineering']
draft: true
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

Hold on to that. We come back for it.

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

## What it can become

Take that list again, item by item, and notice something about the whole of it.
Every one of those dependencies was a dependency on **reading and reasoning over
text that nobody had time to read**. Code. Documentation. Provider specifications.
Decisions taken years ago. That is the shape of the problem, and it happens to be
exactly the shape of the thing we now have sitting in the writer's chair.

**Is it possible?** Ask, against the actual codebase, and get an answer back with
the code cited. Not a nod. Not a no from somebody who was busy. A reasoned answer
you can follow to the file and check. And if the answer is *expensive*, you can see
*why* it is expensive, which is the distinction you could never make before and the
one every prioritisation decision actually needs.

**The rule nobody wrote down** turns out not to be undocumented at all. It is in the
code, which is the most precise document in the building. It was only ever
undocumented to *people*, because reading the code was a week's work and permission
you did not have. It stops being tribal knowledge and becomes a question with an
answer.

**What the product already does** becomes answerable for exactly the same reason.

**The field** — the provider docs, the limits, the regulation — gets read and
reasoned over, properly, in an afternoon.

**And the estimate stops being a guess about an imaginary thing.** Not because
anybody got better at estimating. Because the thing exists before the number is
asked for. A number given after a rough version has been built, against questions
that were actually examined rather than skipped, is a different object from a number
produced by a tired expert in a meeting. It can still be wrong. But it is wrong the
way a measurement is wrong, not the way a feeling is.

**And then the one that changes the shape of the job.** You can have the thing
built. Not described. Not drawn. Not mocked up in a tool that produces pictures of
software. Running. Deployed somewhere it can be clicked, put in front of two real
users, argued about, and changed while the argument is still going on.

That is the sentence I put in [my manifesto](article:manifesto) and have never
properly cashed: **a working prototype now costs about what a drawing did. The
prototype is the agreement.**

Remember what I said I did with my afternoon on `acter`? I changed my mind, twice.
That is the whole value, and it is worth being exact about why. The point of closing
this loop quickly is not that you reach the right answer sooner. It is that being
wrong stops being expensive — so you stop defending positions you only hold because
changing them would cost a month. The expensive mistake in this era is not a bug. It
is four thousand lines of correct code for the wrong thing, and the only thing that
has ever prevented it is finding out early enough that changing your mind is cheap.

And notice what that does to the fight. Every methodology we ever bought moved the
authority to decide under uncertainty from one side of the building to the other.
This moves the uncertainty itself. The thing engineering was being asked to absorb
gets settled before anybody commits to anything — not by an assumption at a keyboard,
but by a rough version somebody looked at. That is the first change in my career that
addresses the actual cause rather than renegotiating who has to carry it.

Which is also why *"we will prototype it"* is not a softer way of saying *"we will
build it"*. It is the opposite. It is how you get to throw it away.

### And it can be wrong

One honesty check, because the article would be worth nothing without it.

An agent reading your codebase can be confidently wrong about your codebase. It can
miss the rule as easily as a person can. It can tell you something is possible when
what it actually found was a similar-looking path that does not apply, or reason
beautifully from a file that has not been true since March. The answer is not
gospel. It is a *lead*, with citations, that you can go and check — which is
enormously more than a no with no reason attached, and considerably less than proof.

Knowing that difference is a skill.

### So you still want an engineer — but look at what you are asking them for

This is the part I would most like people to take away, because it is where the
whole thing either works or turns into another way of annoying the same people.

The move is not *replace the engineer*. The move is to use the agent to clear away
everything you were depending on them for — the feasibility question, the rule
nobody wrote down, what the product already does, what the provider actually
supports, and a rough version somebody can click — and then bring them what is left.

Compare the two interruptions, because they are not the same event at all.

Before, you arrived with a question, and it was an open one. *Can we do this?* To
answer it, the engineer had to stop, page a whole corner of the system back into
their head, reason about it in real time, and produce a judgement on the spot.
Hours, that, on a good day. Often enough it was days, and the good ones then spent
the rest of the week getting their own work back.

Now you arrive with the work already done. Here is what I asked. Here is what came
back, with the files it came from. Here is the rule I found, and here is the one I
could not resolve. Here is the thing running — try it. **Does anything else click?**

That is not the same request. It is a review of prepared material, and it takes the
thing an engineer has that nothing else does: the pattern that fires when they see
something that looks fine and is not. You are not asking them to do the finding. You
are asking them to catch what the finding missed — which is the highest-value thing
they could possibly be doing with that hour, and the only part of the old
interruption that was ever really about their expertise.

And it fixes the thing that made the old arrangement corrosive. The engineer is no
longer paying for your curiosity out of their evening. They are spending an hour
on a decision that is already three quarters made, and their contribution
is judgement rather than retrieval. Nobody resents being asked for judgement.

## Autonomy is assembled, not granted

Here is the part for whoever runs this. You cannot decide that product owners are
autonomous now. Autonomy is not a permission you grant; it is a set of things that
have to exist, and nearly all of them are owed by somebody else's chair. Miss one
and the whole arrangement quietly reverts to the meeting.

- **Training, owed by the engineering team.** Not prompting. The skill worth teaching
  is knowing when an agent's answer about your own codebase is unreliable, and what
  to ask next. Your engineers already have that skill, and the fastest way to move it
  is not a course. It is sitting next to somebody.
- **Access, owed by the organisation.** To the repository. To the documents. To an
  agent that can read both. A product owner who has to ask an engineer to run the
  query has gained no autonomy at all. They have gained a new reason to interrupt.
- **A budget they feel safe spending, owed by whoever holds it.** The cheapest item
  on this list and the one most likely to be got wrong. A product owner who has to
  justify each query will not explore. They will go back to assuming, and you will
  have bought the old loop at a higher price. Exploring has to be something they are
  *expected* to spend on, not something they apologise for afterwards.
- **An environment to deploy into, owed by the platform engineer.** Ephemeral, cheap,
  disposable, and — this is the part that decides whether any of the rest works —
  reachable without anybody's nod. A prototype that needs an approval in order to
  exist is not a prototype. It is a small project.
- **A prototype mode, also platform.** Not the full checkpoint. A lighter gate, the
  basic checks, and an honest label on the result so that nobody mistakes it for
  something that shipped. Exploring must not cost what shipping costs, or it will not
  happen a second time.
- **A queue, owed by project management.** The discovery loop has a throughput just
  as surely as the delivery one does. Somebody owns what gets explored, in what
  order, and how much at a time — or every idea gets a prototype and none of them
  gets a decision.
- **And a shape for the work itself**, which is the one I care most about, and the
  one that ties this article back into everything before it.

### The document falls out of the work

If a product owner goes off and explores and comes back with a feeling, then we have
built a remarkably expensive machine for producing feelings.

What should come back is a document. What this is, who it is for, what has to be
true, what we deliberately decided against, what we tried and threw away, and what
the prototype actually showed. A PRD. And written *along the way*, while the
exploring happens, rather than composed afterwards out of memory — because memory is
the precise thing this whole series is trying to get out of the critical path.

Then look at what that document is. If the idea survives validation, it is the input
to [the spec station we built](article:the-loop-built-for-real): the thing the
technical specification gets written against, with its conditions and its statement
of what must be true when the work is done. And if the idea does not survive, you
throw it away and **nothing downstream was ever spent.** No estimate. No
architecture. No sprint. No four thousand lines.

That is the join. Until now, this series' loop began with a spec that arrived from
nowhere. It does not arrive from nowhere. Done properly, it arrives from a loop that
has already thrown away three worse versions of itself.

## No, this does not mean the engineer does it

I have to meet one objection head on, because I argue elsewhere that one engineer
with an agent ends up holding all six jobs, and somebody is about to conclude that
the product owner is next in line to be absorbed.

No. That conclusion is backwards, and it is worth seeing why.

When I hold the product owner's chair on my own projects, it is not because the
chair stopped being necessary. It is because there was nobody else in the room. A
solo project is a special case, and the honest description of it is *I am doing six
jobs, several of them worse than a specialist would.* Generalising from that to *so
we need fewer product owners* is the same move as concluding from a one-person
restaurant that kitchens do not need chefs.

What actually happened is narrower, and better. The product owner's job always had
two halves: deciding what is worth building, and finding out enough to decide. The
second half was rationed, because it ran on other people's time. It is not rationed
any more. That does not shrink the chair. It is the first time the chair has been
fully occupiable.

There are two shapes for this, and both are better than what we had. One is the
product owner exploring alone and bringing an engineer the finished lead for a
short read, which we just walked through. The other, for anything genuinely
hard, is the two of them in the same session with the agent, pulling on the idea
together — one knowing what it has to do and for whom, the other knowing where this
system bites and which part of what the agent just said should not be believed. An
hour of that is worth a month of tickets. It is also, and I say this as the person
who used to get interrupted, a far better use of an engineer than being a search
engine with feelings.

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

Another chair, and another loop that did not close — except this one fails in the
opposite way, which I find the more disturbing of the two. The product owner's loop
was expensive to close. The next one is cheap to close, and almost nobody does,
because nothing ever comes back. Approve a change that was wrong and you will very
likely never learn that it was wrong. It gets found months later, by somebody else,
and it is essentially never traced back to the person who read it and said yes.
