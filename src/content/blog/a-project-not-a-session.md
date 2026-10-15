---
title: 'A project, not a session'
description: 'Moving the work from one agent session to a project: a coordinator that starts threads, threads that write to each other, and a digest every weekday. Where the speed came from, counted from the repositories, and the problem it brought instead, which was my attention.'
pubDate: 'Oct 15 2026 12:08'
series: 'itinera-built-together'
seriesPart: 9
tags: ['ai engineering', 'ai', 'software engineering', 'itinera']
draft: false
---

[Last time](article:agents-reviewing-agents) one agent implemented, another kept
the specification and a third reviewed every change, and they wrote to each other
while I settled their disagreements from first principles rather than by reading
diffs. This time is about where all of that ran. Not on my machine, in the end, and
not in one long session either, but in a project: a coordinator chat that starts
threads, and a lot of threads. It is also about the speed people ask me about,
counted from the repositories rather than remembered, and about the problem the
speed brought with it.

## Your local ~/.claude doesn't come along

The plan for the Rust implementation was merged, the specification had answered
everything the plan asked of it, and the agent told me nothing was waiting any more.
So I asked:

> ok. How can I launch a cloud session to start it?

The answer was practical, how to start one from the browser or the terminal, and
then it said the thing that mattered:

> **Your local `~/.claude` doesn't come along.** [...] The cloud session only sees
> what's committed in the repository.

Think about what that means. Everything the agents had learned about how I work,
one decision at a time with a recommendation, minimal comments, behaviour only from
the specification, lived in files on my computer. A session in the cloud would start
without any of it. So would the next one, and the one after.

The fix was boring, which is how you know it was right. The rules went into the
repository, in a manual for agents called `AGENTS.md`, and into the first prompt as
well. The rule from last time, the one about never deciding behaviour in Rust,
opened that first prompt: "If you find a gap or a contradiction in it, stop and tell
me; never decide it in Rust." The first cloud session wrote the Cargo workspace,
the CI and that manual, and its three pull requests were merged about an hour after
it started. That was the first Rust code Itinera had.

## I was offered to create a project

Near the end of that hour, the product offered me something, and I did what I always
do with something I do not understand. I asked:

> I was offered to create a project. What is this in terms of cloud sessions?

> A project is one long-running conversation in which Claude acts as a coordinator.
> You send it work there, and it starts a separate cloud session, called a thread,
> for each piece. Threads run in parallel and report back to that conversation.

It explained what threads would and would not know, what it would cost in usage, and
then it warned me about the one thing that would actually bite:

> with several threads at once, you'd get design decisions from several of them at
> the same time, against your rule of one decision at a time.

Hold on to that warning. It came true within the hour, though not quite the way it
predicted.

It sounded like Devin, which could coordinate sessions and switch models between
the coordinator and the worker sessions. Devin has been second nature to me for at
least a year and a half (I wrote about how that started in [*The month before the
twelve hours*](article:the-month-before-the-twelve-hours)), so I knew what that
could mean. It could change the game for productivity, because coordinating sessions
had until then been a manual task, and a good part of the time I spent operating
Claude went into exactly that.

Devin is much more than a Claude project. It offers a wide range of other things:
indexing a whole codebase, which helps fast and precise reasoning, especially across
a company's many repositories; automations; enterprise-grade management, and more.
It is a product truly facing companies. Between it and the local, single-session
experience we had, there was an enormous gap. Here it seemed to be getting narrower.
I could not wait to test it, and it paid me back many times over.

So: close in spirit, less corporate in shape. A chat I talk to, a thread per piece
of work, and a routine. The coordinator proposed the setup from the
session we had just had: three repositories, the cloud environment I had made for
Itinera, one standing instruction (keep the README for people using the library,
not for plan progress), and a routine that would post a digest of open pull requests
every weekday morning. About half an hour after I first asked what a project was,
I typed the first real request into one:

> start stage 1, please. Questions must be aligned before coding starts

## Nothing is waiting on you

The coordinator started a thread for the stage. The thread read the plan and the
spec, wrote six questions, posted the first one, and waited. Exactly as I had asked.

A few minutes later I looked at the project and saw nothing moving:

> for example, now I see threads idle, no thread working. Why?

> why didn't I see that question in this conversation?

> Threads post their questions inside the thread, and I stayed quiet here. I should
> have flagged it.

And the project's own front page, when I read it, said:

> I read: Welcome, Marlon.
> Nothing is waiting on you.

The coordinator was honest about that too: "That banner is misleading." The thread
had marked itself as ready for review rather than waiting, so the banner skipped it.
So there we were. A thread waiting on me, a coordinator that had not mentioned it,
and a page telling me all was well. Was the whole thing broken? No. It was doing
precisely what each part was built to do, and nobody's job was to tell me.

What do you do? I gave somebody the job:

> I need you to mbring the questions here, whenever they pop

From then on the coordinator relayed. It brought each question into the project
chat, I answered, and it passed the answer back to the thread, as a message between
agents. The first of those messages, from the coordinator to the thread, set the
terms:

> Marlon answered decision 1 in the project chat: "In event", as recommended. Please
> post decision 2 now. Marlon answers in the project chat and I relay, so keep each
> question self-contained with options and a recommendation.

It did more than carry. When I answered one question with a rule of my own, it
checked the rule against the specification on the way through and told the thread
what it saw: "It seems to differ from spec 2.3". You met the rest of that story last
time.

## The coordinator, reshaped three times

The relay was the right shape for about two days. Then it was not, because I had
learned something:

> for you, you don't need to brimg the questions here anymore. I ;earned how to
> interact with the thread.

So the coordinator went quiet again, on purpose this time. It started threads,
answered questions about the state of things, and kept the shared memory consistent
behind the scenes. One message it sent a thread, unprompted, after I reversed a
decision about a dependency:

> FYI: the team memory file reuse-before-writing.md still says derive_more was
> rejected. Please update it to match Marlon's new decision when you update the
> AGENTS.md rule. I've updated MEMORY.md already.

Then the project grew. By the second weekend there were threads for the release,
for a review of file sizes, for the book, for two new features, all open at once,
and keeping track of them from the chat had become a job in itself. So the third
shape:

> So, after your messages here, you will always put buttons to all opened threads.

From that message on, every reply from the coordinator ended with a list of open
threads. Less a manager than an index.

It was not infallible in any shape. Asked how the plan stood, it first said it could
not name the remaining stages "without checking that issue", then read the plan and
named them. Asked whether anything was waiting on me, it said "Nothing is waiting on
you right now", and two minutes later:

> Correction: two things now wait on you.

I do not count those against it. It corrected itself without being asked, which is
the habit I had been asking every agent for since the first night. But notice the
pattern. Three shapes in five days, and each one was me finding out what I needed
from it. Nobody hands you that.

## Where the speed came from

People ask how a library, its specification, its tests, a site and a book happened
in fourteen days, and the honest answer is that I had a story about it before I had
counted. So I counted.

The specification and the plan come first, and they have no Rust in them at all.
From the first of October to the afternoon of the sixth, the Rust repository held
licences, a README, a note on how its tech specs work, the pull request checks and
the plan. The pull requests of those days were proposals, cases, shared actions,
process and plan, and none of them was Rust: 19 opened on the first of October, 28
on the second, 6 on the fifth. The first Rust
code arrived on the sixth, with the workspace.

Then the implementation stages. The plan had numbered them from 0 to 9, the last one
being the release. Stages 0 to 8 came out of forty-one pull requests from the
sessions and threads that ran them, and they were merged between the sixth of October and the eleventh: five
days. The first beta was tagged, and published to crates.io, on the fourteenth.
Eight days from the first line of Rust.

Now the part I did not expect. I had assumed the speed came from running things in
parallel. For the stages, the repositories say otherwise. They ran one after
another, because each needed the one before; the agent had told me so the day the
project began ("stages 1 to 3 depend on each other, so parallel threads would give
little there"). What the history does show is this. From the second stage on, every
stage started within five minutes of the merge that finished the stage before it. No
gap. No "I'll pick it up tomorrow". A thread that already knew the plan, the rules
and the spec, asking its questions before anyone had finished reading the last pull
request.

So where did the time inside a stage go? Into questions, into amendments to the
spec, and into waiting for me. The weekday digest put it plainly on its first
morning:

> Nothing needs you except reviews. Two pull requests are open in itinera-rs, both
> from the stage 1 stack, and neither has a review yet.

A stack, by the way, is a set of pull requests built one on top of another, each
small enough to read on its own, merged from the bottom up. Every stage arrived as
one, and then, as a rule, it sat there green until I had read it.

The parallelism came later, when the core was done. The eleventh of October was the
busiest day of the whole project: 34 pull requests opened across the repositories,
and eight threads started, for the macros, the release, a review of file sizes, the
book, services and rescue steps among them. That is the shape of it, as far as the
numbers go: no idle time between stages, and parallel threads once there was
something that could run in parallel. I would not claim more than that.

Here is what landed in the repositories each day, before and after the work moved
to the project:

<figure>
	<picture>
		<source media="(max-width: 720px)" srcset="/diagrams/itinera-lines-per-day-stacked.svg" width="360" height="250" />
		<img src="/diagrams/itinera-lines-per-day.svg" alt="" width="720" height="260" loading="lazy" />
	</picture>
	<figcaption>
		Lines added each day across all seven repositories, on main, with merge
		commits, lockfiles and images left out. Before the project, between 1,370 and
		3,690 lines on the days anything happened. After it, between 3,636 and 57,088.
	</figcaption>
</figure>

| Day | Lines added | Pull requests opened |
|---|---:|---:|
| 1 October | 3,165 | 19 |
| 2 October | 3,690 | 28 |
| 3 and 4 October | 0 | 0 |
| 5 October | 1,370 | 6 |
| 6 October, the project starts | 3,636 | 31 |
| 7 October | 8,001 | 11 |
| 8 October | 4,412 | 5 |
| 9 October | 9,941 | 11 |
| 10 October | 31,232 | 17 |
| 11 October | 57,088 | 34 |
| 12 October | 14,377 | 16 |
| 13 October | 19,469 | 9 |
| 14 October | 41,945 | 16 |

Read it with two cautions. The days before the project were specification work,
proposals and cases, which is denser per line than code; and the later days include
the book, which was written once and then rewritten. So the chart is not a clean
experiment. But the jump is not subtle either: from the project on, the work never
had to wait for me to carry it from one session to the next.

## The only memory that spans every thread

Here is the catch with threads that start fresh. Each one knows what the repository
and the project instructions tell it. None of them knows what another thread found
out yesterday, unless somebody wrote it down. Very often the somebody was me.

The first cloud session had made a real stack of pull requests, after I asked it why
it said it could not. A day later the next thread told me plainly that this was not
possible in a cloud session. I remembered otherwise:

> but the previous session did manage to use gh stack. Research, because a memory
> can be around, and if is true, that is less work for you

> your parent session used it.

The coordinator, which knew where to find the other session, sent the thread a
pointer:

> Pointer for the gh stack search. Marlon's "parent session" is most likely the
> project's origin session, session_01EwYVZT4HmgvZSL2wtLYtEw, which ran stage 0
> (PRs 35-37).

And the thread came back: "You're right that it made a real stack." It saved the
method to the project's memory, so the next thread would not need me for it. That is
the good ending. It needed me to start it.

Same thing, smaller, when I suspected two threads were about to claim the same stage
number:

> take care: I think stage 11 is taken by services, as well as its cases

## Drift between local and cloud

The threads were not the only agents. The specification was still kept by a session
on my own machine, which also reviewed the Rust pull requests. And a session on my
machine sees my copy of the repositories, not GitHub's.

It reviewed a pull request carefully, posted the review, and asked me to decide
several points. I read the question and something was off:

> but stage 1 is merged already, 44 s merged, right?

> My mistake: I hadn't rechecked after posting the review.

The coder had outrun the reviewer. A few days later, giving the same local session
some work in the Rust repository, I warned it in advance:

> Remember that the itinera-rs origin can be and probabluy s ahead of yours.

It was. Sixty-six commits ahead. And the agent then did the sensible thing: the
cloud thread was editing the same file at that moment, so instead of opening a
competing pull request it left a note on the thread's own, asking it to make the
change when convenient.

Even two local sessions could drift. Earlier, two of them shared the same planning
memory, and one asked me for a go-ahead I had already given the other. It caught
itself:

> My last question was out of date. Another session has already revised the Rust
> tier 1 plan file

## The meter

One more thing a project makes visible, because it spends faster. The agent had
said so at the very start: every thread ran on Opus at high effort by default, so a
project "uses up your plan limits faster than one session". On the second weekend
a thread reported this:

> The account's usage limit then paused this session for about two hours. It also
> stopped the reviewer that was doing the final pass on the macros layer, and I can't
> restart it without your word.

Note the last clause. The reviewer, the one agent whose whole job was checking the
others, was not going to be restarted without me. The thread offered to open the
pull request and run the last review alongside CI instead, and I said "1". Near the end of the fourteen
days I found a line on the project page saying I was "On pace to hit your weekly
limit early", and the coordinator offered to pause threads to stretch what was left.

## The button I kept

With all that delegated, one thing never was by default. On the day of the first
stack, the agent suggested a line for the project's instructions: "you merge; a
thread doesn't, unless you say so." I merged, stack by stack, bottom up. Once, I even merged ahead of
a thread that was still pushing a change:

> I merged the pr, sorry. If there is something wrong, open a new with the fix

Did I review every line of those forty-one pull requests? No, and the last article
was about why that was not the job. But the merge was mine, and the threads knew it
was mine, and that made everything above it something I was delegating rather than
something I had lost hold of.

So the new problem was not code. The agents wrote it, reviewed it and fixed it,
faster than I could read about it. The new problem was attention: which of the open
threads needs me, which agent is looking at an old copy, which question is sitting
behind a banner that says all is well. The project did not solve that for me. I had
to keep reshaping it until it did.

## What we learned

What I would take from moving the work into a project:

1. Rules that live on your own machine do not reach a cloud session, so commit them to the repository.
2. A thread waiting on you is nobody's job to report until you make it somebody's.
3. Reshape the coordinator as you learn what you need from it; that is part of the work, not a failure of the tool.
4. Counted, the speed came from no idle time between stages, and from parallel threads only once there was work that could run in parallel.
5. Fresh threads know only what was written down, so what one learns reaches the next only through the repository or the shared memory.
6. When the agents write and review faster than you can read, the bottleneck is your attention, and the merge is the part worth keeping.

## Which jobs this one was doing

Three, and the absences are the point: no architect, no product owner and no QA this
time. Nothing in this one was a decision about what Itinera does.

- **Project manager**: the coordinator reshaped three times, relay, then quiet, then
  an index of open threads; starting every stage the minute the last one merged; the
  stage-number clash; watching the usage limit.
- **Platform engineer**: moving the work to the cloud, putting my rules into
  `AGENTS.md` because "your local `~/.claude` doesn't come along", and sending a
  thread back to research a stack method another session had already found.
- **Reviewer**: keeping the merge button, catching the local reviewer reviewing a
  pull request that had already merged, and warning it that origin was ahead of its
  copy.

The six are counted in [*The night that produced no code*](article:the-night-that-produced-no-code).

## Next time

This one was about speed between the pieces of work. [Next
time](article:what-could-make-your-life-easier) is about speed inside them: the day I
asked an agent what would make its life easier, and it measured its own loop before
answering. One command for every check, an environment that starts ready, and a
twenty-minute CI run cut to a fraction, with two of my own ideas turned down on the
numbers along the way.
