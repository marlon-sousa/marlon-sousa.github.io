---
title: 'Put an agent in the chair, and the rules of the game change'
description: 'Four rules for the moment an agent takes the writer’s chair: why you do not get to wait this one out, why a team that waits for a nod is not using agents, the one sentence about control that this series hangs on, and what happens to every estimate you have ever given.'
pubDate: 'Sep 21 2026'
series: 'is-our-loop-closed'
seriesPart: 2
tags: ['ai engineering', 'ai', 'software engineering']
draft: false
---

[Last time](article:the-loop-ran-in-somebodys-head) we found the loop in a
newspaper, drew it again with our names on it, and I admitted what my industry
actually built: some of the stations for real, and a cheat for the rest. The cheat
is that the missing stations ran inside somebody's head, and the bill for it
arrives as queues, as ceremony, and as a veto nobody voted for. We called that
somebody a "human gate".

Whose head, though? When I told it, it was an engineer's, because that is the
version I have lived, from both sides of it. It does not have to be. It can be the
product owner who would rather decide than measure, or prototype. It can be the
platform engineer who never automated the pipeline, so that "is it green" means
"did somebody run it". It can be the manager whose nod is the only thing a release
is really waiting for. Any station that is a person instead of a mechanism is the
same cheat, and it fails in the same way.

So. The agent takes the writer's chair: the station where the code gets typed.
And that chair needs a word before we go on, because it was never like the others.
In every other trade, the person who makes the thing is not the expensive one. A
writer is not the most expensive person at a newspaper. A bricklayer is not the
most expensive person on a building site. In ours, the bricklayer *was* the
architect. Putting the walls up is itself an ultra-qualified job here, and there
was never a cheaper pair of hands to give it to, so the checking always came out
of the same budget as the building. And lost. Every time.

That is also why code ruled. When the scarcest thing in the building is somebody
who can write this, everything organises itself around protecting and scheduling
that person: the hiring, the interview, the ladder, the estimate, the org chart,
the status. The programmer was the bottleneck, so the programmer was king. And
notice what that says about the holes in our loop. The missing stations were not
skipped out of sloppiness. They were crowded out, every single time, by a job that
took all the hours and could not be handed to anybody cheaper.

Well. It can now. The one thing this trade was organised around has stopped being
scarce, and everything I just described was an arrangement built on its scarcity.
So before we touch a single station, four things change the moment that chair is
taken. I want to be precise about each one, because the third is the sentence this
whole series hangs on, and it is the one I most often hear said backwards.

Not in theory, by the way. This is happening in your organisation right now,
whether or not anybody signed a form for it.

## Rule one: you do not get to wait this one out

Are agents real? Yes. Not a demo, not a trend that will pass if you wait it out.
They write code that compiles and ships, today, in volumes that would have looked
absurd three years ago. And if you don't use them? Then someone else will, and
that someone might be your competitor, or the team down the hall, or the person
who will have your job, or perhaps your company, in two years.

## Rule two: a team that waits for a nod is not using agents

Here is the part I want you to sit with: the "human gate" is probably against
agents. And I would have questions about that. Why? Because they are genuinely
worried about code quality? Possible. Because they are losing power, and the power
was never officially theirs, so nobody can even name what is being lost? Also
possible. Or because an agent can now read tons of code in minutes and find the
hidden traps, the ones only they knew about, the ones that made them necessary? I
do not know. You do not know. We will probably never know, because the answer sits
inside a person, and the person is the last one who would tell us.

And let me be clear about who I am talking about, because I have been that person.
The trade is not "get rid of them". Their knowledge is still the most valuable
thing in the room, and next time is where it goes back to work. What goes is the
veto. Specifically, the part of the veto that never had to give a reason.

Because look at what the "human gate" is objecting to, whatever the reason. We are
trading certainty for experimentation. We are trading approvals for prototypes. We
are trading a committee that reads a document for a team that ships something
small and looks at it. And that trade only works if the team is allowed to move.
Do you give teams that independence? Then you are using agents. Do you keep the
committee, the form, the nod from the "human gate", and let the agent type faster
inside all of that? Then you are not using agents. You are paying for them and
throwing them away.

And the other half of that trade sits with the teams, because a mindset has to
change on their side too. For years the safe move, when you did not know how
something worked, was to wait. Ask the "human gate". Book the meeting. Do not
touch it until the person who remembers has looked, or is back from vacation,
perhaps in two weeks. That was rational when reading a strange corner of the
codebase took a week and one wrong guess took the site down. Is it rational now?
Think about what is sitting next to you. An agent can read that corner in minutes,
trace the callers, find the tests, tell you what the field means and where it came
from. The knowledge that used to live in one head only is, for the first time,
something a team can go and get. And if the team
still waits? Then the whole coding power of the agent is pointed at a wall,
because the work will be done in an afternoon and then sit in a queue for two
weeks, until a review or a committee stops it. Stops it for what? A bug?
Sometimes. More often for a preference, a "we don't do it that way here", which is
exactly the opinion mixed with safety we talked about, and nobody can tell which
it is.

Do you want a number for this instead of an argument? Take any change that shipped
last month. Measure the hours somebody actually worked on it. Then measure how
long it sat, waiting for a person to be free. That second number was embarrassing
before agents arrived. Now the first one is collapsing and the second one has not
moved at all, and a ratio that used to be awkward is about to be the entire story
of your delivery. You do not need anybody's permission to take that measurement.
You can take it this week, on changes you have already shipped.

So the team has to learn to find out instead of waiting to be told, and the
organisation has to learn to stop a change for a reason it can write down. Not a
feeling. A failed station. If the build, the linters and the tests are green and a
fresh pair of eyes found nothing, "I would not have done it like that" is not
grounds to hold it, and a committee that holds it anyway is not managing risk. It
is protecting a taste.

And while that argument is being had, while the "human gate" causes interference
and the queue grows and the committee meets, what is happening somewhere else? A
competitor who built the loop is delivering. Monitoring. Refactoring under the
covers, in the places nobody looks. Not announcing any of it. By the time it is
visible, it is too late to notice, because the distance is measured in months of
compounding and you cannot buy those back with a form.

## Rule three: you lose control by automating the code, not by automating the writing

Control. It feels like we are losing it, and here I want to be precise, because
this is the sentence the whole series hangs on. Nobody loses control because the
machine writes the code. You would lose control if you automated the code and did
not automate the loop. And that is not a prophecy about your organisation. It is a
question about it: which of your stations are real, and which of them are a
person?

Do you want to know which is which, without anybody having to admit anything? Take
each station on the list from last time and ask it one question. If the person who
knows this system best were unreachable for three weeks, would this station still
stop a bad change? Not slow it down. Stop it. A build answers yes. A test suite
answers yes. A linter answers yes. "Code review" answers... well, it depends who
is free, doesn't it. Anything that answers "it depends who" is not a station. It
is a person standing on the spot where a station was drawn.

The real ones keep working. A build, a test suite, a linter that runs on every
push, these do not care who typed the code, and if you have them you are already
ahead. Now the other ones. Remember the cheat? Put an agent in the chair and what
does it remember about the code it wrote yesterday? Nothing. Every session starts empty. And how much code is it
writing? Massively more than before, more than any one head was ever asked to
hold. The cheat stops working. Both halves of it, at once. There is no longer a
person who remembers, and there is far too much to remember anyway. And the human
stations you did keep, the review above all, have a fixed number of hours in them.
Feed them ten times the code and they do not lag. They drown, and people who are
drowning skip, and skipping is exactly what got us here.

So the holes you have been living with, the ones the "human gate" was quietly
covering, are the ones that open. Not all of the loop. Just the part that was a
person.

## Rule four: the deadline belongs to whoever closed the loop

The deadlines are going to move, and not in the direction that feels comfortable.
Those who do this right, agent *and* loop, will deliver fast without adding risk,
and everybody's estimates will be measured against theirs. Those who leave the
holes where they are will be doing one of two things: delivering fast and badly,
because the loop is missing, or delivering slowly and safely, because the "human
gate" is still reading everything. Was either of those acceptable before? Barely.
Will either of them be acceptable now? No.

And notice who is setting the date in that world. Not you. Not your team, and not
the person who used to be asked how long it would take. Whoever closed their loop
first. A deadline stops being a promise you make and becomes a comparison somebody
else is already making, and the comparison does not care how good your reasons
are.

## Where all four of them land

Everybody is busy mastering the agent, the prompts, the tools, the tricks. Fine.
Do that. But the single most important
thing to master, right alongside it, is the loop. The stations you drew and never
built are not optional any more. They are the only thing standing between the pull
request and the three in the morning phone call. Every station has to exist for
real, and it has to be built so that it does not depend on anybody's memory, or on
anybody's nod. Some of yours already are. Which ones?

That is not a question anybody settles in a meeting. It is engineering. And I said
in my [manifesto](article:manifesto) that I will not refuse a tool to protect a
skill I am proud of, and that whether this technology should exist is not my job.
Applying engineering to it is. So let's go and apply some.

## Next time

We go around the loop again, slowly, one station at a time, and we build each one
for real: the spec you write before there is code, the inner loop the agent runs
alone while nobody watches, the checkpoint that is one command, the second read
that a machine does first, the merge that nobody attends a meeting for, and the
letters. For every station, three things: what it was when a person filled the
hole, what changes when the writer is an agent, and what has to change around it,
in the team and in the organisation, or the station will not hold.
