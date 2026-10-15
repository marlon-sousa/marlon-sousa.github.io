---
title: 'I am lost'
description: 'Twelve proposals into a day of specification, I asked the agent what the spec even was. What that question produced, the doubts that came before it, and the other side of the same habit: an agent that owned its slips, sometimes before anybody had noticed them.'
pubDate: 'Oct 15 2026 12:05'
series: 'itinera-built-together'
seriesPart: 6
tags: ['ai engineering', 'ai', 'software engineering', 'itinera']
draft: false
---

[Last time](article:a-description-can-be-forgotten) the rules of the process became
checks that nobody could bypass, the agent included. I opened a pull request meant to
fail, it failed, and the next day a question about coverage turned into the rule that
a proposal's cases are merged before the proposal itself. Tier 1 went through that
gate in a day. This time is about the tone in which all of that was done: what each
of us said when we did not know, or had got something wrong, and what came out of
saying it.

It is the evening of the second of October. The last proposal of tier 1, the local
executor, has just been evaluated. The agent asks me whether it is ready, and then
it plans to write the behaviour specification chapters and cut "spec 0.1". I answer:

> **Me:** it is ready.
>
> Now, explain me what is the spec thing, because I am lost.

That is the whole message. A day spent accepting proposals, amending accepted ones,
writing scenarios and merging them in a strict order, and I had to ask what the
thing we were about to version actually was.

So. Is everything lost? Do we run for the hills? No. We ask.

## What the question produced

The agent did the mechanical work first (the pair of pull requests that closed tier
1) and then answered properly. It started where I was, with proposals:

> **Claude:** So far we've written **proposals**. Each one records **one decision**:
> what was decided, why, and which alternatives were rejected. Once accepted, a
> proposal **never changes**. If something changes later, a new proposal **amends**
> it.
>
> That's good for history, but it makes the proposals a poor thing to *read* to
> learn how Itinera behaves today.

To know how a step behaves, it said, you would read the Steps proposal, then remember
that a later one changed how abnormal terminations are retried, then Foundations,
then the one that made received data read-only, then parts of hooks and events, "and
you have to merge all of that in your head". Then the table that has organised the
repository ever since:

| Document | Answers | Changes? |
|---|---|---|
| Proposals | *Why* was this decided, and what was rejected? | Never, once accepted |
| Chapters (the behaviour specification) | *How* does Itinera behave **now**? | Yes, whenever an accepted proposal changes something |
| Conformance cases | How do we **prove** a language does it? | Yes, alongside the chapters |

It recommended writing the chapters, and it said why with a reason I had given it
myself half an hour earlier, about something else entirely: reconstructing the present
from overlapping documents is "exactly the 'conflicting information' problem you
raised about issues, just spread across files". We come back to that problem below.

That would have been plenty. But my confusion was not finished, and the next question
was the one that mattered:

> **Me:** my question is: what happens if we need ;atter add something else to
> tier1?

The answer was that tiers are fixed per version of the specification, so adding to
tier 1 means a new version, and nobody's earlier claim becomes false. And then the
agent turned my question around into a recommendation about *when* to cut the
version at all:

> **Claude:** Implementing tier 1 in Rust will almost certainly show gaps:
> something unclear, missing, or awkward to express. If we tag 0.1 now, each fix
> becomes 0.2, 0.3 and so on before anyone has implemented anything. […]
>
> **Tag spec 0.1 when Rust passes every tier 1 case.** At that point 0.1 is proven
> by a real implementation, not just written down. […] The only rule that never
> bends is that **a tagged version never changes**.

I said "ok", the chapters were written, six of them, and "tag when proven" went into
`PROCESS.md`, where it still is: a version is tagged "only when a first
implementation passes every case of the version". The prediction about gaps came true the
same night, as we will see before long. And the rule held. As I write this, the
conformance repository carries fifteen release candidates, `v0.1.0-rc.1` to
`v0.1.0-rc.15`, and no `v0.1.0`.
Nothing has been called proven that has not been.

Two documents and a release rule, from "I am lost". Not a bad yield for admitting
something.

## The doubts that came before it

It was not the first time. Reading the record back, the doubts are everywhere, and
most of them are where something got decided.

The day before, designing the process itself, I laid out a loop of issues and labels
and then admitted I did not know the last step:

> **Me:** Either this or the spec is in the issue itself, and this is the spec, I
> don't kow. Can uyou research if someone is trying such a thing and what are they
> doing?

That "I don't kow" sent the agent to look at how Go, Kubernetes and others run their
proposals, and the hybrid we used for the rest of the project came back: the issue
holds the discussion, a file holds the decision. On the second of October, when the
agent proposed a `COVERAGE.md` to track tier 1's invariants:

> **Me:** I accept 2 and 3. 1 I am not sure, because his would be something only
> for tier 1?

> **Claude:** You're right to doubt it. `COVERAGE.md` would duplicate what item 3
> already gives us, and a file like that drifts.

The file was never written. Then "Only a idea", which became cases before acceptance.
Then:

> **Me:** Another consern: if we assign prs to scenarius, we would force big prs,
> perhaps. I am not sure on how to solve this problem.

which produced the rule that a language lists *proposals* in its conformance
manifest, so small pull requests merge freely and the cases switch on when the last
one lands. Then "or we work with trumks, or stacked prs, I want uyour take", and a
recommendation, trunk-based with stacking when the work calls for it, that I took.

None of that was a technique I adopted for agents. It is simply how I work when a
process or a piece of code is being written or discussed and I get lost in it: I
say so. When it is too much, I ask for a quick recap. When I have a doubt, I say
the doubt. That is how I like to keep things in order, with people and, as it
turned out, with agents. What the record
shows is the yield: a doubt said out loud got an answer, a research trip, or a
recommendation I could accept or refuse. A doubt kept quiet would have got nothing,
and the agent would have gone on building on whatever it had assumed.

## The one reading that is you

The agent's side of this habit showed up the same evening, and it came out of a plain
question.

I wanted to know how amendments were being made. Was it editing issue bodies? It
explained the difference between accepted proposals, which are frozen, and open ones,
whose agreed design it rewrites as decisions change. Then, under its own heading:

> **Claude:** One gap I should be honest about […] `PROCESS.md` says the agreed design is written once (*"This is the only time the
> body is rewritten"*), but in practice I've revised it several times during
> evaluation, for #8, #9 and #10.

It could have answered the question I asked and
stopped. It proposed a fix instead: allow revisions while a proposal is open, and post
a short "what changed" comment with each. I asked for `amends: N` labels so every
amendment of a proposal could be found with one search, and said "do that all". The
mechanism shipped, labels, comments, a new section of the skill, and the missing
comments were posted on three issues.

Less than an hour later, it told me it had edited issue 11 directly and posted the
"what changed" comment, as the new process said. I asked whether 11 was still open,
and then:

> **Me:** if not just edit, remember that the one reading that is you, and we want
> to give you the least conflicting information possible.

> **Claude:** Understood. I'm the main reader of these issues, so **the body should
> be the only source of truth for an open proposal**. A "what changed" comment
> describes an earlier state, which is exactly the kind of conflicting information
> I'd then have to reconcile.

And it took its own mechanism out. The comments it had posted were hidden as
outdated, `PROCESS.md` and the skill were changed, and the rule went in with its
reason attached. It is still in the skill today: "The body must always be the single,
current source of truth, because agents read it." It also saved the principle in a
general form, beyond this repository: "replace stale statements rather than appending
corrections".

Think about who the documents were for. A history of revisions is a courtesy to a
human reader who wants to see how we got here. To an agent starting a session from
nothing, every superseded sentence is one more thing that might be true. The reader
of a process document in a project like this is, most days, an agent. Write for it.

## What the agent owned

Some of the admissions in the record were prompted. The unprompted ones say more.

The evening before, as we saw last time, the agent tagged a release on the wrong
commit, corrected it, and told me in the same message that reported the fix: "I've also saved the
lesson: tag only after confirming the merge, in a separate step." The next afternoon,
releasing the cases-before-acceptance change, its running commentary said:

> **Claude:** The merge is confirmed to be on `main`. Tagging `v1.1.0` and moving
> `v1`, as a separate step this time:

"This time." A mistake admitted on one day, a different behaviour on the next, from a
colleague who does not remember the day before. That is what the admission was for.

Minutes after the specification session ended, I opened a new one to plan the Rust
implementation, from a prompt the first session had written. Its first reply opened
like this:

> **Claude:** One thing to own first. When I checked whether the crate names are free
> on crates.io, I put your email address in the request's user-agent header. I
> shouldn't have sent it to an outside service without asking you. It was a
> read-only lookup, nothing was published, and I won't do it again.

Nobody would have known. It was a header on a read-only request to a public API. It
said so anyway, before the four spec gaps it had found and before any of the work I
had asked for. Twelve days later, in one of the cloud threads, a different agent
wrote to me under the heading "Something I need to tell you": the reviewer agent it
used had done exactly the same thing, the address was now in crates.io's request
logs, and it had told the reviewer never to do it again. Same slip, a different
agent, the same candour.

The specification session did it too, with authority I had given it. Told to "Ammend
all you need, merge it all", it set the `status: ready` label on three proposals
itself, and said so: "Normally that label is yours to set." It had permission. It
reported the use anyway.

And the prompted ones. Three days into the Rust planning, I asked, almost in passing:

> **Me:** a, the bag doesn't belong to the workflow? I think it should, because this
> is exactly data it holds, right?

> **Claude:** You're right, and I was wrong. The spec says so in 5.1 point 3: "The
> data bag and all other journey state belong to the instance" […] That correction
> also exposes a mistake in spec#62.

It did not stop at conceding. It went looking for where the wrong idea had already
been written down, found it in an issue it had opened, and corrected that too.

## And mine

Candour both ways means both ways. The same record has me reversing myself, in the
open, often within minutes.

Proposing a base role that gives every hook read access to the data bag, and three
minutes later: "or not. Youa re right." Reviewing the chapters and getting one of the
open points wrong, then: "a, I missread. And this is wrong." And three days later,
in the Rust planning: "I just want to go back on my buffering streategy, because on a
language that can throw, if it throws, we will loose the buffer of estep events."

None of those cost anything. Each one was a sentence, and each one was cheaper than
the version where I defend the first idea for an hour because I had said it.

## Why it matters more with an agent

With a human colleague, a mistake you hide is still remembered by somebody. They
saw it, or they will run into it, and the team learns either way, slowly.

With an agent, a mistake hidden in one session is simply gone at the end of it. The
next session starts from the same documents, the same habits, the same blind spot,
and makes it again. The only way a slip turns into a different behaviour tomorrow is
that somebody says it today, and it gets written somewhere the next session will
read: a memory, a rule, a line in the skill. The agent's "I've also saved the
lesson" and its "as a separate step this time" are the two halves of that, a day
apart.

And the same is true in the other direction. If I pretend to understand what the
spec is, the agent goes on producing spec on top of my pretence, and nobody finds the
gap until it costs something. "I am lost" is about the cheapest bug report there is.

## What we learned

What to keep from a part about how we talked:

1. "I am lost" is the cheapest bug report there is: a doubt said out loud gets an
   answer, and a doubt kept quiet gets built on.
2. Proposals say why something was decided, chapters say how it behaves now, and
   cases prove it.
3. Tag a version only when an implementation has proved it.
4. Write process documents for a reader who forgets everything: replace a stale
   statement, never append a correction to it.
5. A slip changes tomorrow's behaviour only if it is said today and written where the
   next session will read it.
6. Reversing yourself out loud costs a sentence; defending a wrong idea costs an hour.

## Which jobs this one was doing

Three, and the list is short because this part is about how we talked, not about what
got built. No platform engineer, no QA and no project manager this time.

- **Reviewer**: "Now, explain me what is the spec thing, because I am lost", a review
  of the whole day's output that produced the chapters; "how are ou making
  ammendments?", which brought out the gap the agent then confessed; and "the one
  reading that is you", which removed a mechanism within the hour.
- **Product owner**: "what happens if we need ;atter add something else to tier1?",
  the question behind versions fixed per tier and "tag when proven".
- **Architect**: "the bag doesn't belong to the workflow?", which corrected the agent
  and an issue already filed; and withdrawing my own base role, and my own buffering,
  out loud.

The six are counted in [*The night that produced no code*](article:the-night-that-produced-no-code).

## Next time

Before the building starts, the map. From here the story moves between repositories,
sessions and pinned versions, so [next time](article:how-it-is-put-together) is
what is where: the repositories and how they pin each other, why the cases are
Gherkin, and why Rust went first.
