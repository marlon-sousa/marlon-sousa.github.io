---
title: 'Do these all at once, because I now think you got the idea'
description: 'An agent wrote the whole Itinera book in under an hour, and every example compiled. Then it had to be rewritten, chapter by chapter, at a pace set by how much I trusted it. Reading it as a newcomer turned out to be the best review the API ever had.'
pubDate: 'Oct 15 2026 12:12'
series: 'itinera-built-together'
seriesPart: 13
tags: ['ai engineering', 'ai', 'software engineering', 'itinera']
draft: false
---

[Last time](article:agree-before-you-code) we designed Itinera's public API in one
night of conversation: sixteen questions, the same example reprinted after every
round, and a signed-off document before a single pull request was opened. This
time it is the book: the place where that carefully agreed API met a reader who
had not been in the room, and where I learnt to change how much I handed over at
once, in both directions.

It starts on the eleventh of October, with me asking for something I could only
describe in a sentence and a half:

> This is (I wouldn't know exactly, we will plan together) either a new repo or
> something in itinera-dev, where you select a supported language, and read a
> book about it, with compiling examples in place.

Compiling examples. Hold on to that phrase, because it comes back at the end
with teeth.

## Show me the table of contents first

The agent came back with a plan and seven decisions. I answered a few with "1",
as I answered most questions in this project, then stopped it:

> **Me:** I preffer to agree on this first, and I want to set from the beginning
> that the book is user and agents which are developping for others centric, not
> a tdechnical manual. End user facing.
>
> **Me:** show me the table of contents first, please. Then we iterate, and once
> agreed you do it all.

The same move as last time. An agent will happily write forty pages on a
structure nobody has looked at, and a table of contents is the cheapest thing
there is to argue about.

So we argued. It proposed twenty-five chapters around one small online shop. I
wanted an introduction, a getting started and a comparison at the end of each
part, and I wanted the introduction to carry one argument above all:

> because the hardest part of understaanding a system that mixes flow and logic is
> understand what is going on.

It rewrote the introduction around that sentence, the plan went into a pull
request, I said "Proceed with the implementation", and the agent went off to
write.

Under an hour later:

> **Claude:** The book has no CI yet, so I checked the examples here against
> itinera-rs. 40 of them build and print exactly their recorded output. The 7
> compile-error examples fail with their recorded messages.

A whole book, in six stacked pull requests, every example a real program whose
output matched the page.

So that was it, then? The book took an hour?

Not even close. That was the cheap part, and the rest of this article is the
expensive one.

## Written once for every language

Look at the first real commit in the book's repository: *Plan the Itinera book,
written once for several languages.* That was the agent's very first
recommendation in the thread, "One book, written once", with each language
supplying only its own examples and notes.

It sounds right, doesn't it? Itinera is specified once and implemented in several
languages. Why not a book written once and compiled in several?

That evening, reading the Rust edition, I found every Rust detail sitting in a
bold box, set apart from the text, as if it were a regional dialect. I said so,
the agent started fixing the boxes, and then I went one step further:

> **Me:** I think reusing all for languages is a little strange, perhaps. I don't
> know how you planned it, but sinntax, level of coverage and details are
> different enough that I think we can copy a little.
>
> **Claude:** Yes, I planned one shared text, and I agree it's strange

Notice the "perhaps", and the "I don't know how you planned it". That is not a
ruling. It is a doubt, said out loud, and the agent did the useful thing with a
doubtful colleague: it told me what it had actually done, agreed that
it was strange, and put three options on the table with a recommendation. One
book per language, all following a shared plan. I answered "1".

The first decision of the thread was reversed about six hours after it was made.
Nobody saw it in the plan. It showed up on the page.

## Concepts need to be introduced when they are used

The next day I was reading again, and asked about chapter 3:

> **Me:** don't you think chapter 3 nixes so many things? Inlcuding rescue steps?
> How could we do it more streamlined?

The agent reread it and agreed: the chapter promised one thing and taught five on
the way, the syntax of services, providers, rescue steps, roles and reporters,
all of which had their own chapters further on. It proposed the fix. I took it,
and then added the rule behind it:

> and you're better inspecting from 4 if you didn't mmake this kind of error
> again. Concepts need to be introduced when they are used, and itinera is
> flexible enough for that if you really take care with it.

The audit found the same mistake in twenty-one chapters, three of the comparison
sections and an appendix. Twenty-one. A book an agent had written in an hour, read
twice by reviewer agents, and almost every chapter leaned on something the reader
had not met yet.

Careless? I don't think so. An agent writing chapter 13 already knows everything
chapters 14 to 30 will say, and that is exactly the writer who forgets the reader
does not.

So the agent fixed the twenty-one, and I asked for the thing that matters more
than the fix:

> I need a reviewer skill to prvent this from happening again

A skill, in this setup, is a written procedure an agent loads when it needs it.
This one went into the book's repository as a `review-change` skill, beside a new
section of the plan called *Each idea in its own chapter*, and the reviewer agent
runs it on every page that changes. Its first run, on a book that had just been
fixed, found five more violations at once.

One of the five was chapter 3's diagram, which showed paths no order in the
chapter ever took. The agent saw a conflict between the new rule and the
chapter's whole point, and recommended an exception. I didn't take it:

> First things first: 3 gets all clients. This is what I was avoiding the how to
> read this book from promnising too much, we never know how things go until we
> are finished.

So chapter 3 got three more customers, Eve, Fin and Gil, one for each path
nobody took, and the reading guide stopped promising four.

## The book is by far the hardest part

Two days in, the book compiled, the rule held, the reviewer was armed. And it was
still wrong, in a way no check could see. I wrote the longest message of the
thread:

> I still think we are too heavy, too focused, and I wanted not to chase
> traditional development. Perhaps not even putting itinera, but a traditional X
> workflow development.
>
> I still think concepts overlap some how. I want a quick evaluation, and I want
> your thoughts. If we decide we have to change, we change the skill, and we redo
> carefully the whole book, on chapter per topic, with me reviewing the first
> before going to the next. The book is by far the hardest part.

Notice what I asked for: an evaluation and its thoughts, before any decision. And
what came back was not an opinion. It was a measurement:

> **Claude:** I agree with you: the book is heavy and it overlaps. The numbers:
>
> 1. **Size.** 45,000 words. About 3,700 come before chapter 1 (welcome, how to
> read, quick start), and twelve chapters run past 1,200 words.
> 2. **The comparison is told four times** …
> 3. **Concepts are taught twice.** …

Forty-five thousand words, and the argument for Itinera told four separate times.
That is the kind of thing you feel as a reader and cannot prove, until somebody
counts. The agent counted, and then proposed the shape I had been groping for:
one topic per chapter, four hundred to eight hundred words of prose each, and
every chapter ending in a small two-column table, *The usual way* against *With
Itinera*, where the right-hand column may claim only what that chapter's code
shows. The sketch came to thirty-two chapters and about twenty-eight thousand
words. I said "go ahead".

Then I added the rule that turned it from a restructure into a different book:
the plan would stop fixing later chapters. Each chapter would start from
something the reader needs and cannot yet do, teach only that, and end on the
next need. "This will help you not to reintroduce concepts."

## Let's not do it all again

The first draft had been "once agreed you do it all", and all of it came back in
under an hour, and all of it needed rewriting. So when the rewrite began I did
the opposite:

> But you wait, let me review first until 2, then you do some more for me to
> review. Let's not do it all again.

Two chapters, and one change asked for: show the workflow first, because "from
looking at this workflow, you can imediately see what is going on". Then chapter
3. Then chapter 4, which ended on a friction, as chapters now had to: the step is
written, and nothing runs it. I raised the next two frictions myself:

> **Me:** I like that. This raises two conserns: How can a step contribute back
> what it did, because business rules have to give a result, and how can my step
> work if it can't access other services?
>
> **Claude:** Yes, both come right after the journey, not late. … Shall I write
> chapter 5?
>
> **Me:** perfect, do these all at once, because I now think you got the idea.

Three chapters at once. Then "do next four chapters, please". Then "do next
chapters, from 12 to 20". The batches grew because the evidence did: four
chapters had come back needing one small change between them, and when I raised
the next two frictions, the agent already had them in order.

Isn't that just what any team lead does with a new hire? Yes, except for the
price of getting it wrong. A new colleague who misunderstands writes one wrong
chapter before lunch. An agent writes all twenty-eight before you have read the
first.

Batch size is not a setting you choose once. It is a reading of trust, taken
again after every batch.

## The best review the API ever had

This is the part I did not expect. I was reading the chapters in order, as a
newcomer would, not reviewing the code. And the newcomer kept finding things
wrong with an API its designers, me included, had signed off.

The testing chapter, for instance, tested a step by wrapping it in a workflow of
one step, because a test could not call the step itself.

> **Me:** ok. Nothing on this makes sense. Why can't I call the run, or the new
> (or whatever is generated)by my self?

The agent had seen this two days earlier. In its report on the first draft, under
"things that are yours to do", it had written: "Optionally, a possible API gap in
itinera-rs: a step can't be run on its own in a test." Optionally. To the agent
writing the example, it was a workaround that compiled. To the reader, it was
nonsense. Out of that one message came test handles, recorders I named
`StepEventReporter`, and a scripted way to test a workflow without its steps.

Or the input adapters, which in Rust had to answer with a value wrapped three
times:

> I think that is so eagly we need to retyurn Ok(Some(Value::new))) ... in the
> input adapters

Now they write `Self::supply(...)` or `Self::from_data_bag()`, and the chapter on
them reads like English.

Or a single line in a log. Chapter 8 showed the events of a journey, and one of
them said `service_provided charge gets payments`. I asked who records which
service was given, and then whether the event names the instance:

> **Claude:** No, it doesn't … The new item in chapter 8 overclaims: it says
> "Which tool a step got was the workflow's decision, and the event says so".
>
> **Me:** And I was woundering what's this, because the way it is writem it
> seemed that we knew the instance. If we don't know the nstance type, this is
> kind of useless.

What followed was twenty minutes on whether Rust can recover a type's name
through a trait object (not by itself), a macro the agent compiled in a scratch
program to prove a way round it, and an amendment to the specification so that
the event names the implementation a provider made, in every language. The same
line in chapter 8 now reads `ship gets carrier from main_carrier, a
ch08_seeing_what_happened::MainCarrier`. One log line became a spec change.

And the biggest one came after midnight, from nothing more than reading the retry
chapter and finding it incoherent:

> There is one thing which is anoying e on the whole itinera, breaking its
> coherence: failedRetriably concept needs to be removed. A step either has or
> hasn't a rety budget, and it can succed, fail, skip. If one doesn't want to
> retry, budget 0.

The agent agreed, and then did what a good colleague does when you are about to
cut something: it told me what the cut would cost.

> **Claude:** It does reverse the old default, though: today an unexpected error
> isn't retried, because it may already have had effects.

That old default was proposal 0024, written for exactly that reason, a payment
sent before the error. We kept its switch and flipped its default, so that a step
whose errors must never be retried says so on its own line in the workflow, where
anyone reading the declaration can see it. Proposal 0106, *The retry budget alone
decides retries*, was written, reviewed and accepted, its conformance cases
released, and the Rust change merged, before the hour was out.

Notice who did not do that work. When the book thread offered to change the
macros itself, I stopped it:

> but not here. Ask a thread to do this, you just change the book

From then on, each of these changes went to a thread of its own, through the
specification when it touched behaviour, and came back to the book as a new pin.
The book found them. It did not get to make them.

Why did reading beat reviewing? Because whoever writes the examples learns to
write around the API, and an agent is very good at writing around things. There
was no stranger yet to trip over them, so I played one.

## A book that can fail the build

Now the compiling examples, with their teeth.

On the first day, when I suggested borrowing ideas from this blog, the agent read
its repository before planning the book's, and changed its own recommendation
because of what it found:

> **Claude:** After reading your site, I'd change that, because your
> `remark-code-include` plugin already does what the book needs.

That plugin is the one this blog's Rust series is built with. It fills an empty
code fence in an article from a tagged commit of another repository at build time, and fails the build if
the file, the tag or the anchor is missing, so any code an article shows comes
from a commit whose CI passed. The Itinera book took the same idea. And then I
pushed it one step further than this blog ever has:

> But here is the thing ... we must have the ci of itinera-rs and after others to
> make sure also the tags can compile, so the book is also a guard.

So the pins run both ways. The book pins the version of itinera it teaches, and
itinera-rs pins a commit of the book, and runs the book against every pull
request as a required check. A change to the library that breaks a chapter fails
where it is made, and the next day I asked for a release tag to be stopped too
whenever the book isn't ready.

The guard kept growing every time somebody found a way round it, and I found the
subtlest one myself. The testing chapters ran their checks from
a `main` function, using features that only exist in test builds:

> **Me:** I am slightly concerned we ran these in main. Shouldn't some of these be
> under test config?
>
> **Claude:** So it runs only because of how the book is laid out, and a reader
> copying it into `src/main.rs` would hit a compile error.

Every example passed, and a reader copying one would still have hit a wall. A
tested example can still lie about the reader's setup.

> this is also safer for the other testing stuff. We cannot trick people into
> thinking stuff will be available for them when in their setups whis wouldn't be
> true.

The chapters were rewritten as real test modules, CI now builds each program the
way it would ship, without test support, before it runs the tests, and the rule
went into the book's operating manual, its `AGENTS.md`, as hard rule number
seven:

> **Test support stays in tests.** Code the book shows outside a test never uses
> what exists only for tests, such as a package option turned on for tests only,
> so a reader who copies it gets code that compiles in their own setup.

The book you can read at [itinera-dev.org/book](https://itinera-dev.org/book/)
today has forty-three chapters. It was written once in under an hour, and it was
not finished for three more days.

## What we learned

What I would carry out of the book thread:

1. Agree on the table of contents before the agent writes anything; it is the cheapest thing to argue about.
2. A draft that compiles can still be the wrong book, and some decisions only look wrong once you read the result.
3. An agent that already knows the whole book writes as if the reader did too, so turn that mistake into a reviewer skill.
4. Hand over small batches first, and let them grow only as each one comes back needing less.
5. Reading the docs as a newcomer finds API problems that whoever wrote the examples had learnt to write around.
6. Make the examples a check the library must pass, and make sure they work in the reader's setup, not only in yours.

## Which jobs this one was doing

All six, and lopsided: most of the weight sits on QA, because most of what
happened here started with me reading a page and not liking it.

- **Product owner** — setting the audience before a word was written ("user and
  agents … End user facing"), and calling the compiled, audited book "too heavy,
  too focused".
- **Architect** — one book per language instead of one text for all, and
  removing the retriable failure from the specification, which became proposal
  0106.
- **Project manager** — the table of contents before anything else, the batch
  size from two chapters to nine, and "but not here. Ask a thread to do this".
- **Platform engineer** — the book as a required check on every itinera-rs pull
  request, and a release tag stopped whenever the book isn't ready.
- **QA** — reading as a newcomer: "Nothing on this makes sense", the
  `service_provided` line, and tests that only ran because of the book's layout.
- **Reviewer** — turning each catch into a mechanism: the `review-change` skill,
  which found five more at once, and "male yhis a checking rule please".

The six are counted in [*The night that produced no code*](article:the-night-that-produced-no-code).

## Next time

The release, and the end of the series: what stayed in my hands when everything
else had been handed over, the question that found missing licences just
before the tag, and the agent's own verdict on what we had built. That is
[*Thanks for this great work*](article:thanks-for-this-great-work).
