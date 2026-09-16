---
title: 'The loop ran in somebody’s head'
description: 'Every trade has a loop between “it is written” and “it is right”. Ours too. We drew it, built half of it, and a person quietly did the rest. What that cost, and how I know. Spoiler: I was the person.'
pubDate: 'Sep 16 2026'
series: 'is-our-loop-closed'
seriesPart: 1
tags: ['ai engineering', 'ai', 'software engineering']
draft: false
---

Twelve minutes ago I asked an agent for a change. Twelve. There is now a pull
request waiting for me, green check, lovely description, "all tests pass" at the
bottom. So what do I do? Merge it? Read all of it? Run for the hills? Or, and here
is the question I ask myself more than any other these days: is that code right?

New question, right? Arrived with the machines? Nope. It is the oldest question in
our trade. I would go further: it is the oldest question in any trade that makes
things other people rely on. And the best answer I know to it was worked out by
people who never saw a computer. Doubt that? Good. Let me show you.

One warning before we start. This is the first of three parts, and the agent
barely shows up in it. On purpose. Before I put an agent in the writer's chair, I
want us to take a long look at what was sitting in that chair before, and at what
was sitting around it, because that is where the answer to the question was
actually coming from. The agent comes next time. This time is about us.

## A newspaper

Think about how a story got into a newspaper, back when a newspaper was made of
paper. Yes, paper. Stay with me.

An editor decided something was worth a page and handed it to a writer. The
writer wrote. Done? Not even close. The copy desk went over it, hunting for
spelling, house style, all the boring things a checklist catches. Then a
fact-checker picked up the phone and asked the people quoted whether they had
really said that. Then the editor read it again, but this time against the
assignment: is this the story I asked for? Then print, which is the one step
nobody can undo. And the morning after, letters. Some of them said you got it
wrong. And where did those letters land? Back on the editor's desk.

Back on the editor's desk. Where the whole thing started.

Hmm. Looks like a loop, doesn't it? No. It doesn't *look* like a loop. It is one.
Assignment, writing, copy desk, facts, second read, print, letters, and around
again. Now notice two things about it, because I am going to need both of them
later and I would rather you saw them yourself.

First: every station exists because the one before it lets something through.
Did they build a fact-checking desk because writers are liars? Of course not. They
built it because writers are people, and people, even very good ones, get things
wrong. Nobody took it personally. That was just how you made a newspaper.

Second: the letters are the only station that comes from outside the building.
Every other desk checks the story against what the building believes. The letters
check it against the world. Which makes them the one station that never lies, and
a newspaper that stopped reading its letters would not stay a newspaper for very
long.

Only newspapers? Please. A kitchen has a chef at the pass tasting every plate
before it leaves. A pharmacy has a second pharmacist checking the first. A cockpit
has a checklist read by one pilot and confirmed by the other. Same shape, every
single time: somebody makes, something checks, somebody else reads, out it goes,
and the world writes back.

Hold that picture. Our industry has exactly the same loop. On paper, all of it.
In practice? Some of it. Which part depends on where you work, and we are getting
to that.

## The same loop, with our names on it

Here it is, station by station. See if you agree.

**The spec.** Somebody decides what the change has to do and, more important,
what has to be true when it is done. In a team, a product owner with a card.
Alone, you, with a paragraph, before anything gets typed.

**The code.** Somebody writes it. Not much to say. Yet.

**It builds.** The compiler, or the type checker, or, in some languages, a shrug.
This station is so fast and so familiar that nobody draws it on the diagram. Keep
an eye on it anyway. We come back for it in part three, and it is half the reason
this series exists.

**The linters.** Formatting, unused stuff, the patterns the team swore never to
write again. This is the copy desk. Mechanical? Boring? Yes and yes, and that is
the whole point: a reviewer who is not counting semicolons can spend their
attention on something that matters.

**The tests.** The fact-checker. They call the code and ask: did you really say
that? Each test asks about one thing, at one place. That is what makes them
powerful. Hold this one too, because it is also what makes them limited.

**The review.** A second person reads the change against the spec. Against the
code, you say? No. Against the *spec*. Is this what was asked for? Are the things
the description claims actually true?

**Merge and deploy.** Print. From here on, undoing costs real money.

**Monitoring.** The letters. Logs, alerts, a user saying "since yesterday the
export comes out empty". The only station that reports on the world instead of on
what we believe about the world.

Every methodology book has a version of this diagram. You have seen it. I have
seen it. Framed, probably. So we all ran it, right?

## What we actually did

Well... partly. And let me be honest here about my own industry, and about
myself, because it would be a bit rich to write about loops with holes in them and
pretend I was never one of the holes.

I have never worked anywhere that ran none of the loop, and I have never worked
anywhere that ran all of it. What I have seen, everywhere, is a mix. Some stations
were real: a build, some tests, a review of sorts. Others were drawings on a
slide. Tests written before the code? Relatively recent idea, adopted unevenly,
and in most places I worked the first thing dropped when the deadline showed up.
Linters? Newer still, and filed under "nice to have", something we would turn on
when things calmed down. Did things calm down? What do you think. A second read
against the spec? There was rarely a spec to read against. There was a ticket
with two lines and a conversation somebody half remembered. Which stations were
real and which were drawings changed from team to team, and I bet you can list
yours right now, without looking.

So how did anything work, with holes in the loop? Because we cheated. And the
cheat was a good one. The missing stations ran inside people's heads.

Think about it. The programmer who wrote the code *remembered* the code. It was
in there, because they had typed it, argued about it, fixed it at midnight. When
something broke in production, the letters arrived, and the person who could
answer them was right there, holding the whole thing in their head, and they
found the problem. Cheap? No. It cost hours, sometimes whole nights, and a
handful of people who could not go on vacation. But it worked. Incidents were
overcome, at the expense of a great many working hours, by good programmers who
knew the code by hand.

That is the real reason our industry got away with holes in the loop for decades.
Not because the loop was wrong. Because human memory was filling in for whichever
stations a given team had never built. Different holes, same filler.

### What it cost, beyond the hours

Was the price only the nights? I wish. The hours were the visible part. The rest
of the bill took me years to read, and you have probably paid it too without ever
seeing the invoice.

Think about what happens when part of the loop lives in one person's head. That
person becomes that part of the loop. The most experienced engineer on the team,
the one who knows the code because they wrote most of it, turns into a station.
A "human gate". The staff engineer, the principal, the specialist, the one whose
name comes up in every thread, whatever your organisation happens to call it:
you know exactly what this is about. Not by choice, and not by title. Simply
because nobody else feels safe touching anything without their informal nod. Did
anyone decide this? No. It just happens, the way water finds the lowest point.

And once a person is a "human gate", everything organises itself around them.
Deploys wait for them to be in the office. Vacations get negotiated around
releases. New people take a year to be trusted, because trust means "has been
near the gate long enough". And when the company grows and the "human gate"
cannot possibly read everything any more, what do we do? Build the missing
stations? Rarely. We build ceremony around them. A delivery committee. A change
management form with eleven fields. A weekly meeting where a change is presented
to people who have never seen the code and will approve it because the "human
gate" is in the room and nodded.

And it gets worse, because a "human gate" is not only a bottleneck. A "human
gate" has power.

Think about what the organisation has actually done. It has made one engineer,
or a small group of them, the only people who can say whether a change is safe.
Fine. But safe is not the only thing an engineer has opinions about. They also
have opinions about which framework is right, which product idea is silly, which
team should own what, whether the new market is worth entering. And now, when
the "human gate" says "I would not do that", what is the organisation hearing?
An opinion? Or a risk assessment? It cannot tell any more. Opinion and safety
have been mixed into one voice, and nobody dares to separate them, because the
same voice is the one that knows where the bodies are buried in the codebase.

So what happens? Queues, first. Everything that needs the "human gate" waits for
them, and they have a finite number of hours and a growing number of opinions.
Then something quieter. Innovation stops at the edge of one person's comfort
zone. Not because anyone forbids it. Because a proposal the "human gate" is not
comfortable with reads, to everybody else, as a proposal that is unsafe, and
unsafe proposals do not get funded. The organisation ends up with the technical
taste of one person, frozen at the moment that person stopped learning.

And then the last step, which I have watched happen and which nobody plans: the
"human gate" starts steering strategy. Not because they are the right person to
decide where the company goes. Because without them the operational risk of
going anywhere is too high to be considered. An engineer ends up with a veto
over decisions that were never theirs to make, and everyone in the room knows
it, and everyone in the room lets it happen, because the alternative is a
release nobody can sign off on.

Call that what it is: paranoia about delivery, institutionalised. Every one of
those rituals is the organisation admitting that it does not know whether the
code is right, and trying to buy the feeling of safety from the only person who
might. And is the feeling justified? Sometimes. The "human gate" is usually
good. But a "human gate" is also a person, and people, even very good ones, get
things wrong. We built a fact-checking desk for the newspaper for exactly that
reason. In software we built a form.

I have been the "human gate", many times. I have been a staff engineer, and I
have been a specialist: two organisational roles, the same thing. Many other
times I was not the one, and had to throw away solutions I knew were right
because the "human gate" was not comfortable with them. Neither side of that was
pleasant. And here is the part that still bothers me: I can only hope I never
made an organisation stop doing something it should have done. There is no way
to know. I was aware of the problem while I was in the chair, and awareness does
not help, because nobody would have told me anyway. That is what a "human gate"
does. It makes the people around it stop saying things.

## Next time

Next time, the agent sits down in the writer's chair. And then what? Panic? Run
for the hills after all? Let's not. Let's watch what happens to each station
instead. Some of them do not care who typed the code and keep working. Others,
the ones that were a person, open. Then we go around the loop once more, slowly,
and build every station for real, so that nothing on it depends on anybody's
memory or anybody's nod.
