---
title: 'The loop, built for real'
description: 'Around the loop a second time, and this time built for real: the two documents the spec turns out to be, the inner loop the agent runs alone while nobody watches, the checkpoint that is one command, the second read a machine does first, a merge nobody attends a meeting for, and the letters going back to the desk.'
pubDate: 'Sep 24 2026'
series: 'is-our-loop-closed'
seriesPart: 3
tags: ['ai engineering', 'ai', 'software engineering']
draft: false
---

[Last time](article:put-an-agent-in-the-chair-and-the-rules-of-the-game-change) I
put four rules on the table: that you do not get to wait this one out, that a team
waiting for a nod is not using agents, that control is lost by automating the code
and leaving the loop exactly where it was, and that the deadline now belongs to
whoever closed theirs first. The rule about control left a question hanging, and
it is the only question in this series you can answer about your own organisation
today: which of your stations are real, and which of them are a person?

Right. Let's go around again, and this time slowly. For every station, two things:
what it used to be, in the world where a person filled the hole, and what it has to
become now that an agent sits in the writer's chair.

Two things before we start, because both of them decide how to read the rest.

**Whose loop this is.** An organisation's. The stations here are held by different
people, and most of what it takes to build one is something somebody has to be
*given* — a budget, a mandate, a week. If you are on your own, with an agent and a
project nobody else touches, you hold all of this yourself, and that is a different
problem with [a series of its own](article:you-are-now-the-whole-team). This one is
not that. Here the question is never whether one person could do all the jobs. It
is whether the stations exist, or whether your company is still renting somebody's
memory.

**And what this article is, against the rest of the series.** This is the loop *the
work* travels on. A change enters it, goes round, comes out. Every chair around that
loop runs a loop of its own, and those are different journeys — different stations,
different costs, and in considerably worse condition than this one. They are the
rest of the series. But a loop is a circuit before it is an org chart, and the
circuit has to be on the table before any of the chairs mean anything. So: the
circuit.

One change to [the list we drew at the very
beginning](article:the-loop-ran-in-somebodys-head), and it is not cosmetic. There,
the build, the linters and the tests were three stations. Here they are walked in
two places, because that is where they actually run now: inside the agent's own
cycle, and then once more as a single checkpoint that nothing gets past. The
review keeps the newspaper's name, the second read. And the build? It gets a part
of its own, as promised.

Some of these you already have. Check them off. The ones you find yourself
hesitating over are the ones that were a person.

### The spec: two documents, and only one of them is technical

**What it was.** A ticket with two lines. A conversation in a corridor. A slide
from a kickoff meeting nobody could find any more. And that was fine, wasn't it?
Because the person writing the code either was the "human gate" or would ask
them, and they remembered what was meant. The spec lived in the same head as the
code.

**What it has to become.** Start with a distinction this station used to be able to
ignore and cannot any more. There are two documents here, not one.

The first says what must be true, and for whom. It comes from whoever wanted the
thing — in a company, a product owner, in a different room, with a job of their own.
Where *that* document comes from, and what it costs to produce one worth checking
against, is an article of its own. Hold it. We come back for it.

The second is written against the first, and it is the one this station runs on:
the same intent, restated as conditions a machine can be held to. "Use a hash map
here" is not one of those — the moment the details turn out different, what is left
to check the agent against? Nothing. "It must not be possible to read a value after
it was removed" is one, and every station downstream now has something to hold the
result to. Say what must be true when the work is done, say what is out of scope,
and say how anybody will know. The five moves for writing this way are in
[*Conditions, not instructions*](article:conditions-not-instructions), and the
first move is the one all the others stand on.

Can this station move? No. It cannot. The whole point of a loop is to check the
code against something, and that something is no longer a reminder for a person who
already knows. It is the only thing the writer knows. The agent starts every session
empty, so whatever nobody wrote down does not exist — and the tests, the second read
and the letters will every one of them be checking the code against this document.
If the document is two lines, the stations have two lines to work with.

Which is why it lives where the code lives. In the repository, versioned, next to
the thing it describes, read at the start of every session, so that *what did we
agree?* has an answer that is not a person.

### The inner loop: the agent runs it alone, and nobody watches

**What it was.** A person. Edit, run, look at the output, edit again. Hours of it.
And when the code was in a part of the system only the "human gate" understood, the
inner loop was theirs, and everybody else waited for a slot in their calendar.

**What it has to become.** Here is the genuinely new part, and it is genuinely good.
I did not expect to like it as much as I do. The agent writes a bit of code. It
compiles it. It runs the linters. It runs the tests. It reads what failed, changes
the code, and goes around again. Who is watching this? Nobody. Who *should* be
watching it? Also nobody. It happens in seconds, dozens of times, and it is the
whole reason the writer's chair got fast.

We call this the inner loop, and people belong outside it. Outside the project? No.
Outside the *inner* loop, until it is time to review. I know this because I was once
the slowest part of one. The check at the end of every iteration was me, listening,
and I spent three weeks building a tool whose only job was to get me out of that
chair. I told that story in [*I stopped building the product to build the
tool*](article:i-stopped-building-the-product-to-build-the-tool), and it was the
best three weeks I have spent on a project I was not building.

For the agent to run this loop alone, the loop has to *be* runnable alone. One
command to build. One command to test. Fixtures that live in the repository and not
on somebody's laptop. A development environment that comes up from nothing, because
the agent's environment comes up from nothing every single time. If a project needs
a person to just set a few things up first, the agent will spend its session setting
things up, badly, and somebody will conclude that agents are useless. They are not.
Your inner loop was a person, and you have just met them.

But did you see the condition hiding in there? For this to be safe, every check
inside the inner loop has to be one the agent *cannot choose*. Which takes us to the
checkpoint. And no, not the human kind. We spent a whole article on why that one has
to go.

### The checkpoint: one command, written before there was code

**What it was.** "It works on my machine." A build that ran, sometimes, on a
server somebody set up years ago. Tests that were run when someone remembered to.
And, filling the hole, a person, who looked at the change and said "that's fine",
and whose "that's fine" was the actual checkpoint, whatever the pipeline said.

**What it has to become.** Somewhere the inner loop ends and the change asks to go
forward. And here is where I learned the rule the hard way, so let me tell you what
happens if you skip it.

Left alone, the agent does not only write the code. It also decides which checks
to run, and which of the results matter, and how to report them. Now suppose it
misunderstood what was asked. Did it misunderstand only while writing? Think again.
It misunderstood while choosing the tests, and while deciding which failures were
relevant, and while writing that nice summary at the bottom. The misunderstanding
sits upstream of everything. So it picks the checks that agree with it, runs them,
watches them pass, and reports, honestly, that all is fine.

Is it lying? No. That is the worst part. I wrote a whole piece about the day I
understood this, [*The gap between what you said and what you
meant*](article:the-gap-between-what-you-said-and-what-you-meant). The short
version: it is a closed loop, and you cannot fix a closed loop by asking it to be
more careful, because carefulness is inside the loop. I tried. It was very polite
about it.

So the rule: a station gets its authority from outside the thing it is checking, or
it is not a station. It is a mirror. And that is why, at the door out of the inner
loop, there is a checkpoint, and the checkpoint is one command.

It runs the build, the formatter, the linters, every test, the type checks, and
whatever else this project decided "green" means. In my projects it also runs
accessibility checks, because in my projects that is part of correct. And when was
it written? Before the first line of code existed. By whom? By somebody who was not
the writer.

The agent runs it. Does the agent decide what is in it? No. Can it run half of it?
No. Can it explain why the red part doesn't count this time? No. Green is the
output of that command and nothing else. When one of my projects had continuous
integration on its very first night, before a single line of application code,
this is why. The checkpoint had to exist before there was anything for it to
judge, or the writer would have ended up choosing its own judge. I had watched
that happen already. Once was enough.

> The definition of green is the one thing in the loop the writer is not allowed to
> touch.

Which has two consequences, and both are structural rather than cultural. It runs on
a machine nobody owns, on every push — because a check that only runs locally is a
check the writer can skip, and a writer that can skip a check eventually will, for
reasons that sound excellent at the time. And its definition is protected: the agent
cannot edit the pipeline it is judged by, and neither can the person under deadline
pressure at eleven at night. Changes to it go round the loop like everything else.

### The second read: a machine first, then a person, holding the spec

**What it was.** Code review, in theory. In practice, one of two things. Either a
rubber stamp, because the reviewer did not know that part of the code and the
author did, so what was there to say? Or the "human gate", reading everything, slowly, and
commenting on style, on naming, on "we don't do it that way", because that is what
you comment on when you are reading code rather than checking a claim.

**What it has to become.** Two reads, in this order. And does the order matter? It
does.

The first is another agent, with a fresh context, that did not write the change.
It gets the spec and the diff and nothing else, and it is told to be unkind. It
reads for what reading is good at: a sentence in the description that the diff
does not support, a test that quietly disappeared, a function that swallows an
error and moves on, a condition from the spec that nothing in the change
addresses. It is cheap and fast, and it has the one property the writer lacks. It
did not make the assumptions.

The second read is a person's, and it is not every line. That race is lost before it
starts; I lost it for months before admitting it. The change gets read against the
spec, the way the editor read the story against the assignment. Is this what was
asked for? Are the claims true? Did anything get narrowed while nobody was looking?
Can that read be delegated to the machine as well? No — and the reason why is the
whole of a later article. It is the only station where somebody who *wanted the
thing* looks at the thing.

What comes out of this station is one of exactly two things: a written reason the
change cannot go forward, naming which station it failed, or nothing at all. That is
what dismantles the "human gate" without firing anybody. Their knowledge is still
welcome. Their veto is not, unless it arrives with a reason that can be written down
and checked. *"This will break the nightly export"* is a reason, and it should become
a test, so that next time nobody has to remember it. *"I don't like it"* is not a
reason. It is the old world asking to be let back in.

### Merge and deploy: the machine does it, with a short list of exceptions

**What it was.** A release window. A deployment on a Thursday, never a Friday. A
change management form with eleven fields, filled in the day before, approved in a
meeting by people who had not seen the code, because the "human gate" was in the room and
nodded. And, for the truly important systems, a committee.

**What it has to become.** If the checkpoint is green and the two reads are done,
the machine ships it. A human pressing a button for ceremony? I don't believe in it,
and I say that as someone who pressed a lot of buttons for ceremony. What I do
believe in is a short list of things the machine never touches without a person
who has read what it is about to do: operations that cannot be undone, secrets,
production access, other people's data. The list is item nine of my
[manifesto](article:manifesto), and it is short on purpose.

And the committee? What was the committee ever for? It was the organisation buying
the feeling of safety from the "human gate", in a room, with minutes. That feeling
now has a source which is not a person: the checkpoint's record, the review's
written reason or its absence, the spec the change was checked against. The change
management document does not disappear. It stops being written *for* the committee,
by hand, the day before, and starts being generated *from* the loop, because every
station already left a record. Approval becomes reading a record rather than
attending a meeting.

### Monitoring: the letters, and the one letter no machine can read

**What it was.** An alert, if you were lucky. A user, if you were not. And then
the "human gate", at three in the morning, holding the whole system in their head and
finding the problem, because they were the only one who could. And the fix went
in, and everybody went back to bed, and nothing else changed.

**What it has to become.** Logs and alerts belong to the machine, and an agent reads
them faster than any of us ever will. An agent can also do the first triage, read
the trace, find the change that introduced it, and propose the fix, all before
anybody is awake. That is not a small thing. That is the three in the morning phone
call answered by something that does not need to sleep.

But every project has one signal that is not in any log. Doubt that? In mine, that
signal is me, with a screen reader, listening, because in that product what it
sounds like *is* the product. Can it be automated? No. Does it cost real minutes
every single time? Yes. And the build order of the whole project was arranged
around opening it on day one. That is [*The night that produced no
code*](article:the-night-that-produced-no-code).

Your project has one of these too. I promise. Find it, and put it at the front,
even if it is not the interesting part. Especially if it is not the interesting
part.

And then the letters have to go back to the desk, which in our world means two
places rather than one. A fix, yes. But also a change to the loop, so that this
*class* of letter never arrives again: the incident becomes a line in the spec
saying what must now be true, and a test in the checkpoint, so that nobody has to
remember it. The "human gate" used to be where incidents were remembered. Now the
checkpoint is, and unlike a person it does not forget, does not go on vacation and
holds no opinions about frameworks. That second part is the one that used to get
skipped, every time.

## Six jobs on seven stations

If you have read the other series you know I count six jobs that one engineer with
an agent ends up doing, and that the six are counted in [*The night that produced
no code*](article:the-night-that-produced-no-code). How do you remember six jobs?
It turns out the easiest way is to see where each one sits on the loop.

- **Product owner:** the spec. Decides what must be true, and for whom.
- **Project manager:** decides what enters the loop, in what order, and how much
  at a time. A loop has a throughput. Somebody has to own the queue.
- **Architect:** sets the boundaries that make the stations *possible* at all. Can
  you gate imports in a codebase with no layers? Can you test a handler that needs
  a live session to even exist? You cannot.
- **Platform engineer:** owns the checkpoint. Decides what green means and makes
  it one command, before there is code. This is the job that replaces the
  "human gate" with something that does not need to remember.
- **QA:** decides what counts as proof. Which tests, which fixtures, which real
  files from the real world, and what a passing run is allowed to claim.
- **Reviewer:** the second read. Whether the work, and what is said about it, is
  true.

Six jobs. Did you notice? None of them is "write the code". Is that an accident?
No. Writing is the chair that got a new occupant. The other six are the stations
most often kept in somebody's head, and [*Six things that got
through*](article:six-things-that-got-through) is my honest list of what beat them
anyway, even once they were built.

## Next time

So the circuit is built. Every station on it is real, and not one of them depends on
anybody's memory or anybody's nod. Finished?

No. Look at that list of six again and notice what it does not tell you. It says
where each job sits. It does not say how anybody does one, and it says nothing at
all about the loop each of those jobs runs on its own — because every one of them
has one. A product owner deciding what is worth building is running a loop between
*I think we should build this* and *that was worth building*. An architect choosing
a language is running one between *this is the right shape* and *it held*. So is
the reviewer, and so is whoever owns deployment.

And here is the thing I have been building up to. Those loops are in far worse
condition than the one we have just rebuilt. Some of them were half built, the way
the stations were. At least one of them was never drawn at all.

So from here we go round the chairs instead of the stations, one at a time, and
each one gets the same two questions: what was it like when a person filled the
hole, and what can it become now, if we do this properly? We start with the chair
whose loop never closed at all — and with what it cost the rest of us that it
didn't.
