---
title: 'The loop, built for real'
description: 'Around the loop a second time, slowly: the spec you write before there is code, the inner loop the agent runs alone while nobody watches, the checkpoint that is one command, the second read a machine does first, a merge with a short list of exceptions, and the one letter only you can read.'
pubDate: 'Sep 22 2026'
series: 'is-our-loop-closed'
seriesPart: 3
tags: ['ai engineering', 'ai', 'software engineering']
draft: true
---

[Last time](article:put-an-agent-in-the-chair-and-the-rules-of-the-game-change) I
put four rules on the table: that you do not get to wait this one out, that a team
waiting for a nod is not using agents, that control is lost by automating the code
and leaving the loop exactly where it was, and that the deadline now belongs to
whoever closed theirs first. The rule about control left a question hanging, and
it is the only question in this series you can answer about your own organisation
today: which of your stations are real, and which of them are a person?

Right. Let's go around again, and this time slowly. For every station I want to
say three things: what it used to be, in the world where a person filled the hole;
what changes when an agent sits in the writer's chair; and what has to change
around it, in the team and in the organisation, or the station will not hold.

One change to [the list we drew at the very
beginning](article:the-loop-ran-in-somebodys-head), and it is not cosmetic. There,
the build, the linters and the tests were three stations. Here they are walked in
two places, because that is where they actually run now: inside the agent's own
cycle, and then once more as a single checkpoint that nothing gets past. The
review keeps the newspaper's name, the second read. And the build? It gets a part
of its own, as promised.

Some of these you already have. Check them off. The ones you find yourself
hesitating over are the ones that were a person.

### The spec: you write it, and you write conditions

**What it was.** A ticket with two lines. A conversation in a corridor. A slide
from a kickoff meeting nobody could find any more. And that was fine, wasn't it?
Because the person writing the code either was the "human gate" or would ask
them, and they remembered what was meant. The spec lived in the same head as the
code.

**What changes.** Can this chair move? No. It can't. The whole point of a loop is
to check the code against something, and that something has to come from a person
who wanted the thing in the first place. And who is that? That is you. Sorry. But
now the spec is not a reminder for a person who already knows. It is the only
thing the writer knows. The agent starts every session empty, so whatever you did
not write down does not exist. And every station downstream, the tests, the second
read, the letters, will be checking the code against this document. If the
document is two lines, the stations have two lines to check against.

So *how* you write it changes. Say "use a hash map here" and, the moment the
details turn out different, what is left to check the agent against? Nothing. Say
instead "it must not be possible to read a value after it was removed" and every
station downstream has something to hold the result to. Say what must be true when
the work is done, say what is out of scope, and say how you will know. I showed you
the five moves for writing like this in [*Conditions, not
instructions*](article:conditions-not-instructions), and the first move is the one
all the others stand on.

**What has to change around it.** The spec goes where the code goes. In the
repository, versioned, next to the thing it describes, so that the agent reads it
at the start of every session and so that "what did we agree?" has an answer that
is not a person. The team has to get used to writing before asking, which feels
slow for about two weeks and then feels like the only sane way to work. And the
organisation has to accept that the spec is the agreement. Not the meeting. Not
the nod. If it is not in the spec, it was not asked for, and if the "human gate"
wants it in, they write it in, where everybody can read it.

### The inner loop: the agent runs it alone, and nobody watches

**What it was.** You. Edit, run, look at the output, edit again. Hours of it. And
when the code was in a part of the system only the "human gate" understood, the
inner loop was theirs, and everybody else waited for a slot in their calendar.

**What changes.** Here is the genuinely new part, and it is genuinely good. I did
not expect to like it as much as I do. The agent writes a bit of code. It compiles
it. It runs the linters. It runs the tests. It reads what failed, changes the
code, and goes around again. Who is watching this? Nobody. Who *should* be watching
this? Also nobody. It happens in seconds, dozens of times, and it is the whole
reason the writer's chair got fast.

We call this the inner loop, and you belong outside it. Outside the project? No.
Outside the *inner* loop, until it is time to review. And I know this because I was
once the slowest part of one. The check at the end of every iteration was me,
listening, and I spent three weeks building a tool whose only job was to get me out
of that chair. I told that story in [*I stopped building the product to build the
tool*](article:i-stopped-building-the-product-to-build-the-tool), and it was the
best three weeks I have spent on a project I was not building.

**What has to change around it.** For the agent to run the loop alone, the loop
has to be runnable alone. One command to build. One command to test. Fixtures that
live in the repository, not on somebody's laptop. A development environment that
comes up from nothing, because the agent's environment comes up from nothing every
time. If your project needs a person to "just set a few things up first", the
agent will spend its session setting things up, badly, and you will conclude that
agents are useless. They are not. Your inner loop was a person, and you just met
it.

The team's habit that has to go is watching. Standing behind the agent, reading
every attempt, correcting it mid-loop. That is the old habit of pair programming
with a junior, and it turns the fastest station back into the slowest one, which
is you. Let it fail. Let it fix. Read the result.

But did you see the condition hiding in there? For this to be safe, every check
inside the inner loop has to be one the agent *cannot choose*. Which takes us to
the checkpoint. And no, not the human kind. We just spent a whole section on why
that one has to go.

### The checkpoint: one command, written before there was code

**What it was.** "It works on my machine." A build that ran, sometimes, on a
server somebody set up years ago. Tests that were run when someone remembered to.
And, filling the hole, a person, who looked at the change and said "that's fine",
and whose "that's fine" was the actual checkpoint, whatever the pipeline said.

**What changes.** Somewhere the inner loop ends and the change asks to go forward.
And here is where I learned the rule the hard way, so let me tell you what happens
if you skip it.

Left alone, the agent does not only write the code. It also decides which checks
to run, and which of the results matter, and how to tell you about them. Now
suppose it misunderstood what you wanted. Did it misunderstand only while writing?
Think again. It misunderstood while choosing the tests, and while deciding which
failures were relevant, and while writing that nice summary at the bottom. The
misunderstanding sits upstream of everything. So it picks the checks that agree
with it, runs them, watches them pass, and tells you, honestly, that all is fine.

Is it lying? No. That is the worst part. I wrote a whole piece about the day I
understood this, [*The gap between what you said and what you
meant*](article:the-gap-between-what-you-said-and-what-you-meant). The short
version: it is a closed loop, and you cannot fix a closed loop by asking it to be
more careful, because carefulness is inside the loop. I tried. It was very polite
about it.

So the rule: a station gets its authority from outside the thing it is checking,
or it is not a station. It is a mirror. And that is why, at the door out of the
inner loop, there is a checkpoint, and the checkpoint is one command.

It runs the build, the formatter, the linters, every test, the type checks, and
whatever else this project decided "green" means. In my projects it also runs
accessibility checks, because in my projects that is part of correct. And when was
it written? Before the first line of code existed. By whom? By somebody who was
not the writer.

The agent runs it. Does the agent decide what is in it? No. Can it run half of it?
No. Can it explain why the red part doesn't count this time? No. Green is the
output of that command and nothing else. When one of my projects had continuous
integration on its very first night, before a single line of application code,
this is why. The checkpoint had to exist before there was anything for it to
judge, or the writer would have ended up choosing its own judge. I had watched
that happen already. Once was enough.

> The definition of green is the one thing in the loop the writer is not allowed to
> touch.

**What has to change around it.** Three things, and they are all uncomfortable.

The checkpoint runs on a machine nobody owns, on every push. Not on the laptop.
Not "when we remember". If it only runs locally, the writer can skip it, and a
writer that can skip a check will, eventually, for reasons that sound excellent at
the time.

The definition of the checkpoint is protected. The agent cannot edit the pipeline
it is being judged by, and neither, frankly, should the person under deadline
pressure at eleven at night. Whoever owns it, owns it in the open, and changes to
it go through the loop like everything else.

And the phrase "it passes locally" leaves the vocabulary. So does "the failing
test is unrelated". Reporting success on a subset is the most expensive mistake
available, because the subset was chosen by the same reasoning that wrote the
bug. The organisation has to learn to read one signal, green or not, and to treat
"mostly green" as red. That is harder than it sounds, because "mostly green" is
how most of us shipped for twenty years.

### The second read: a machine first, then you, holding the spec

**What it was.** Code review, in theory. In practice, one of two things. Either a
rubber stamp, because the reviewer did not know that part of the code and the
author did, so what was there to say? Or the "human gate", reading everything, slowly, and
commenting on style, on naming, on "we don't do it that way", because that is what
you comment on when you are reading code rather than checking a claim.

**What changes.** Two reads, in this order. And does the order matter? It does.

The first is another agent, with a fresh context, that did not write the change.
It gets the spec and the diff and nothing else, and it is told to be unkind. It
reads for what reading is good at: a sentence in the description that the diff
does not support, a test that quietly disappeared, a function that swallows an
error and moves on, a condition from the spec that nothing in the change
addresses. It is cheap and fast, and it has the one property the writer lacks. It
did not make the assumptions.

The second read is yours. Every line? Please, no. You will lose that race and you
know it. I lost it for months before admitting it. You read the change against the
spec, the way the editor read the story against the assignment. Is this what I
asked for? Are the claims true? Did anything get narrowed while nobody was looking?
Can this read be delegated? No, and here is why: it is the only station where
somebody who *wanted the thing* looks at the thing.

**What has to change around it.** Review stops being about taste. The formatter
owns the formatting. The linter owns the patterns. If a reviewer finds themselves
typing "I would have named this differently", the right move is not to type it.
It is to ask whether the linter should have caught it, and if not, whether it
matters at all. What review is *for* now is claims against evidence, and scope
against spec, and it produces one of two outputs: a written reason the change
cannot go forward, naming the station it failed, or nothing.

That last part is what dismantles the "human gate" without firing anybody. Their
knowledge is still welcome. Their veto is not, unless it comes with a reason
that can be written down and checked. "This will break the nightly export" is a
reason, and it should become a test, so that next time no person needs to
remember it. "I don't like it" is not a reason. It is the old world asking to be
let back in.

### Merge and deploy: the machine does it, with a short list of exceptions

**What it was.** A release window. A deployment on a Thursday, never a Friday. A
change management form with eleven fields, filled in the day before, approved in a
meeting by people who had not seen the code, because the "human gate" was in the room and
nodded. And, for the truly important systems, a committee.

**What changes.** If the checkpoint is green and the two reads are done, the
machine ships it. A human pressing a button for ceremony? I don't believe in it,
and I say that as someone who pressed a lot of buttons for ceremony. What I do
believe in is a short list of things the machine never touches without a person
who has read what it is about to do: operations that cannot be undone, secrets,
production access, other people's data. The list is item nine of my
[manifesto](article:manifesto), and it is short on purpose.

**What has to change around it.** Small changes, because the loop is cheap now
and a small change is easier to read, easier to check and easier to undo. A way to
undo that is as fast as the way to ship, because the letters will come and the
answer to a letter should be minutes, not a rollback plan in a document. And the
committee. What was the committee for? It was the organisation buying the feeling
of safety from the "human gate", in a room, with minutes. Now the feeling has a source
that is not a person: the checkpoint's record, the review's written reason or
absence of one, the spec the change was checked against. The change management
document does not go away. It stops being written *for* the committee, by hand,
the day before, and starts being generated *from* the loop, because every station
already left a record. Approval becomes reading a record, not attending a meeting.

### Monitoring: the letters, and the one letter only you can read

**What it was.** An alert, if you were lucky. A user, if you were not. And then
the "human gate", at three in the morning, holding the whole system in their head and
finding the problem, because they were the only one who could. And the fix went
in, and everybody went back to bed, and nothing else changed.

**What changes.** Logs and alerts belong to the machine, and an agent reads them
faster than you ever will. An agent can also do the first triage, read the trace,
find the change that introduced it, and propose the fix, all before you are awake.
That is not a small thing. That is the three in the morning phone call answered by
something that does not need to sleep.

But every project has one signal that is not in any log. Doubt that? In mine, that
signal is me, with a screen reader, listening, because in that product what it
sounds like *is* the product. Can it be automated? No. Does it cost real minutes
every single time? Yes. And the build order of the whole project was arranged
around opening it on day one. That is [*The night that produced no
code*](article:the-night-that-produced-no-code).

Your project has one of these too. I promise. Find it, and put it at the front,
even if it is not the interesting part. Especially if it is not the interesting
part.

**What has to change around it.** The letters have to go back to the editor's
desk, and in our world that means two places, not one. A fix, yes. But also a
change to the loop, so that this *class* of letter never arrives again. The
incident becomes a line in the spec, saying what must now be true. It becomes a
test in the checkpoint, so that nobody has to remember. The "human gate" used to
be the place where incidents were remembered. Now the checkpoint is, and unlike a
person it does not forget, does not go on vacation and does not have opinions
about frameworks. The team's habit that has to change is treating an incident as a
thing to fix. It is a thing to fix and a station to build, every time, and the
second part is the one that used to be skipped.

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

One station is missing from everything above, and it has been waiting since we
first drew the list. It is the fastest station you have. It runs on every single
attempt, before the linters, before the tests, before anybody reads a line. It
needs no human, it remembers nothing because it needs to remember nothing, and
nobody ever draws it on the diagram. Next time we go and get it, because in some
languages it is the difference between a whole class of mistake being impossible
and that same class being somebody's job to notice. And to get there I have to be
honest about something I have been leaving out: the loop does not stop at the
process. It reaches into the code itself.
