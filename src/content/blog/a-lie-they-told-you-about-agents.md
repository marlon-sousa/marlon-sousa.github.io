---
title: 'A lie they told you about agents'
description: 'Everybody was told agents only write code. They also read, and reason about what they read, and for a product owner that changes the job: feasibility with the code cited, a prototype that costs what a drawing did, and what an organisation has to assemble — training, access, an environment, a budget nobody has to justify — before the loop before the loop can close.'
pubDate: 'Sep 28 2026'
series: 'is-our-loop-closed'
seriesPart: 5
tags: ['ai engineering', 'ai', 'software engineering']
draft: false
---

[Last time](article:asking-cost-an-engineer) we sat in the product owner's chair and
found a loop with no return leg at all. Whether an idea was even possible, the rule
nobody wrote down, what the product already did, what the provider actually
supported: every one of those answers lived in somebody's head or in text nobody had
time to read, and the only instrument for getting at them was a meeting. Seeing the
thing working cost more than that. It cost an engineer, taken off something already
promised to somebody else. So the two-line ticket was the rational move, and the
oldest fight in our industry was that loop failing in public, while every
methodology we tried moved the authority to decide and left the uncertainty exactly
where it was.

I also told you that on `acter`, where I held that chair myself and could simply find
out, I changed my mind twice in one afternoon. This time, the other half: what the
chair can become. And it starts with a lie.

## What it can become

Take that list again, item by item, and notice something about the whole of it.
Every one of those dependencies was a dependency on **reading and reasoning over
text that nobody had time to read**. Code. Documentation. Provider specifications.
Decisions taken years ago. That is the shape of the problem, and it happens to be
exactly the shape of the thing we now have sitting in the writer's chair.

And here is a lie they told you about that thing: *agents only code.* They do code,
and by now that is the least surprising thing about them. What almost nobody says out
loud is that they read, and that they reason about what they read.
That is the capability this chair needs, and it is the one hardly anybody is buying
them for.

I should say where my own confidence comes from, because it is not neutral. Most of
my hours with an agent have been with [Devin](https://devin.ai), enough that
Cognition invited me to [their Champions Summit](/#cognition-champions-summit) this
year, so discount me accordingly. Other agents can do
this too. Devin is simply the one I have used enough to vouch for. It indexes the
repositories it is given, it correlates them — the service that makes a call with
the one that answers it, the contract with both of its sides — and when you ask it
about your system, it answers about the system, not about whichever file it happened
to open first.

Now let me be precise about why that matters, because the usual story gets it
backwards. The reason to use it is not that it occasionally catches something an
engineer would have missed. It does, sometimes, and those are the stories that get
told. The reason is the ordinary case: it very often comes back with everything the
question needed. Whether it is possible, the rule in the way, where in the code, why
it is expensive. Complete enough to decide on. And every so often it goes further
than the question, to the thing you would have needed to ask next, had you known to
ask it.

The first is what closes the loop. The second is a bonus. Do not buy it for the
bonus.

But none of it arrives by itself. You have to know how to ask, and it makes more
difference than people expect. A closed question gets you a yes or a no, and a yes or
a no is exactly what you already had from the tired engineer in the corridor. *Can we
add this to checkout?* gets you an answer. *What would have to change for this, what
does it touch, what would break, and what did we decide about it before?* gets you
reasoning. And a question with its answer already inside it gets you your own answer
back: ask *this is simple, right?* and the agent will very often find a way to agree
with you. The question steers. Ask it badly and you have not consulted anything; you
have been agreed with at length.

Asking well is a skill, and the people who already have it are your engineers. They
have spent their whole careers asking systems questions and distrusting the first
answer. Which is why the engineers should be the ones training the product owners, and
I will show you one session of what that looks like before we are done.

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

And if you are the engineer reading this, here is your half of it, from somebody who
spent twenty years on your side of the desk. The typing is going. Agents do that now,
well enough that holding on to it means holding on to the least valuable hour of your
day. What is left is the part that was always the job: sitting with a product owner
and reasoning about a demand before anybody commits to it, knowing which of the
agent's answers not to believe, putting up the environment a prototype runs in. That
is not a consolation prize. It is the work the typing used to crowd out.

## Two and a half hours

I promised you one session. Here it is, with the parts that are not mine to share
left out, and I want you to look first at who was in the room, because that is the
half of the story that usually gets lost.

Two product owners. An engineer who knew that part of the system. Me, in two seats
at once: the AI specialist and the architect. And Devin. A multidisciplinary team,
and every seat in it was doing something the others could not. The product owners
knew the questions: what the thing had to do, for whom, and what worried them about
it. The engineer knew how to ask where a possible implementation should go. As the AI
specialist, I showed each of them how to put their questions to Devin so they came
back answered the first time. And Devin knew how to go looking for the possibilities
in the code: what already existed, what could be bent, what would break. While it was
suggesting strategies, it even went through incidents it had on record and weighed
its suggestions against them.

What came out at the end was a PRD, with diagrams, risks and all the rest of it, and
underneath it a technical spec for a minimal first implementation. Planned and
designed with a precision I would not have expected from a room, in two and a half
hours.

Now put the other version next to it, because I have sat through it more times than
I can count. Several days of meetings, if everybody's calendar even allowed them.
People half there, half answering messages. Hours that often produced nothing, and
that stopped when the calendar said stop rather than when the question was answered.
And at the end of it, something that would then wait in a prioritisation queue before
anybody wrote a line of it, and that, if it was ever built, might not even have paid
off. In a classic working group, two and a half hours would not have been enough to
get everybody to the kickoff.

Ours went the other way. The design was done in two and a half hours. Coding the
minimal version and deploying it is a matter of hours more, given an ephemeral
environment to deploy it into. Then the tests. Then putting it in front of people and
going round again. Call it a day or two from the end of that session to something
real being tried. The old version ended with a document and a place in a queue. This
one ends with something that can be tried and found wrong while being wrong is still
cheap.

And it was the ordinary case, with a little of the bonus on top: everything the
questions needed, and the incidents nobody had thought to ask about. Nobody in that
room was there to be informed, and nobody was asked a question they could only
answer with a week. That is what a multidisciplinary team looks like once the reading
is no longer the bottleneck.

Notice the *if*, though. Given an environment to deploy into. That *if*, and the
others like it, are what the rest of this is about.

## Autonomy is assembled, not granted

Here is the part for whoever runs this. You cannot decide that product owners are
autonomous now. Autonomy is not a permission you grant; it is a set of things that
have to exist, and nearly all of them are owed by somebody else's chair. Miss one
and the whole arrangement quietly reverts to the meeting.

- **Training, owed by the engineering team.** Not prompt tricks. The skills worth
  teaching are asking a question that gets reasoning back rather than agreement, and
  knowing when an agent's answer about your own codebase is unreliable, and what to
  ask next. Your engineers already have that skill, and the fastest way to move it
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
hard, is the two of them in the same session with the agent — the two and a half
hours were that shape, with more seats at the table — pulling on the idea together — one knowing what it has to do and for whom, the other knowing where this
system bites and which part of what the agent just said should not be believed. An
hour of that is worth a month of tickets. It is also, and I say this as the person
who used to get interrupted, a far better use of an engineer than being a search
engine with feelings.


## What to start doing

Before the next chair, let me put all of this where it can be acted on. Not for the
organisation this time — that list is above — but for the people in the room.

**If you are a product owner:**

- Find out before you write. Put the question to the agent, against the real code,
  before it becomes a ticket, and write the ticket once you know whether it is
  possible, what rule stands in the way and what already exists.
- Ask open questions. *How would this work, what would it touch, what have we decided
  about this before?* Never *this is easy, right?*
- Follow the citations. An answer you have not checked against the file it came from
  is a feeling with better grammar.
- Write the PRD as you go, including what you tried and threw away.
- Bring an engineer prepared material and one question: does anything else click?
- Change your mind while it is cheap. That is what all of this is for.
- And fight for your autonomy. Nobody is going to hand it to you, and the list above
  that makes it possible will not assemble itself. If you are not getting good
  answers out of the agents, ask engineering for help; that is what they are there
  for, and it is on their list below. Ask for your right to explore, to experiment, to
  try things and throw them away. You are the product owner. Finding out is your job,
  and you are entitled to the means of doing it.

**If you are a project manager:**

- Own the discovery queue: what gets explored, in what order, how much at a time, and
  when an exploration has to end in a decision.
- Plan against validated PRDs, not against numbers produced for things nobody had
  examined.
- Stop pausing products to make room for prototypes. Book the session instead —
  product owners, an engineer, the agent, hours rather than days — and protect it the
  way you protect a release.
- Keep asking the question from [last time](article:asking-cost-an-engineer) about
  every decision that matters: did somebody find out, ask a person, or assume?
- Budget exploration as expected spend, not as an exception somebody has to explain.

**If you are an engineer**, and this list is the longest, because the other two lean
on it:

- Learn how the agents work. What they index, what they can see and what they cannot,
  why one of them will answer confidently from a file that stopped being true in
  March. You cannot judge a reasoning tool you treat as magic.
- Evaluate them for reasoning, not only for code. Put them questions about your own
  system whose answers you already know, and look at what comes back and how it got
  there.
- Learn to ask. Open questions, the context the agent cannot guess, the constraint you
  would have mentioned to a colleague without thinking.
- Learn to ask the second question. When an answer comes back, push on it: what did
  you not check, what would break, what is the other way to do this, where did that
  come from? Reasoning is a conversation, and the first answer is where it starts.
- Train your product owners. Not a course. Sit next to them, the way I did in those
  two and a half hours, until they ask well without you.
- Take the seat in the session, and bring the one thing nothing else in the room has:
  the pattern that fires when something looks fine and is not.

The organisation's list waits on somebody's budget. None of these do. They start with
whoever is reading.

## Next time

The chair everybody thinks they already understand: the one where the code gets
written. If the agent types it now, what is left for the architect and the engineer?
Almost everything that ever decided whether the code was right, as it turns out. What
*green* means on this project. What the spec has to say before anybody starts. Which
gates a change has to pass, and which of them nobody gets to argue with. All of that
used to be settled at the keyboard, one decision at a time, by whoever was writing,
and it was rarely written down, because the person writing was the person who would
remember it. The one writing now remembers nothing.
