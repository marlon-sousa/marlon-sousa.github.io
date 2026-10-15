---
title: 'Wait, we need to agree before you code'
description: 'The public API of the Rust macros was designed in one night of conversation: sixteen questions, the full example reprinted five times, the model reshaped from both sides, and a signed-off document before a line was written. Then seven pull requests.'
pubDate: 'Oct 15 2026 12:11'
series: 'itinera-built-together'
seriesPart: 12
tags: ['ai engineering', 'ai', 'software engineering', 'itinera']
draft: false
---

[Last time](article:some-rule-needs-to-be-written) every mistake that got caught was
turned into something that would catch it again without me: a rule in the agents'
manual, an item on the reviewer's checklist, a type, a compile-fail proof. That is how I
supervised parallel threads I could not read line by line. But all of it happens after
the code exists.

This one is about the opposite end. One night the catches came first: the public API of
the macros was designed in conversation, question by question, and nobody wrote a line
of it until we had both signed off a document.

## The part users actually write

A word on why this API, of all of them.

Libraries like Itinera, the ambitious kind with a real model underneath, fail more
often on ergonomics than on ideas. The model can be right and the library still dies,
because using it feels like filling in a tax form: twelve types to name before anything
runs, generics leaking into every signature, a builder chain longer than the business
rule it wraps. In Rust it can get worse than in most languages. The type system is
strong enough to encode almost anything, so a careful library ends up encoding
everything, and its API turns odd: lifetimes the user never asked about, traits they
have to implement by hand, error messages that point at the library instead of at
their mistake. People nod at the idea, try it for an afternoon, and go back to writing
the retry inside the service.

Itinera was not going to be one of those. Everything in it works through plain
builders, and that is what the specification and the conformance runner talk to. But
nobody wants to write a workflow as a long chain of builder calls, so the face of the
library, for the vast majority of the people who will ever use it, was always going to
be macros: attributes like `#[step]` and `#[workflow]` on their own structs, which the
compiler expands into those builder calls. A procedural macro is just that, a small
program the compiler runs while compiling your crate, taking your code in and handing
generated code back. If you want the longer, gentler version, I explain macros in the
Rust series, in [*Arguments, without writing a parser*](article:arguments-without-writing-a-parser),
where one of them writes a whole command-line parser from a struct, and they first show
up, quietly, in [*Put it next to what you already write*](article:put-it-next-to-what-you-already-write).

Later that same night I put it more bluntly than that:

> **Me:** by far, the main usage of itinera would be through macros.

So the macros were not sugar on top of the real API. For almost everyone, they would
be the real API, and if they were awkward, Itinera would be awkward. They were
stage 8 of the implementation plan, which meant a thread of their own.

## Questions while the other thread works

That night two threads were running. One was the file-size review from last time,
splitting thirty files into submodules. The other was about to start the macros, and I
did not want it coding on top of files that were about to move:

> **Me:** in the meantime, create next stage and advance it to the questions and plans,
> so I can answer that, though the coding part would need to wait on the modules thread.

Every stage thread worked the same way by then. It read the plan, then brought
numbered questions, one at a time, each with options and a recommendation. Should one
`#[step]` block hold both the constructor and `run`? What is an item's name by default?
Are mistakes in a declaration compile errors? Where do a step's retry budget and
policies go? Where do the examples go?

My answers, in order: "1". "1". "1". "1". "1, but wait iuntil the other thread
finishes." Five questions, settled in a few minutes, every recommendation taken.

That is the naive version. Answer the questions, let the agent code. The questions were
good, the recommendations were sound. What could go wrong?

What I did instead was ask for one more thing:

> **Me:** Meanwhile, past here a final workflow example based on these decisions

## The example asks questions the questions did not

The agent printed a complete workflow, about 170 lines: two steps, a step policy, a
workflow policy, a reporter, a role, an input adapter, an ID generator, and a `main` that
runs it. And reading code is not the same as answering about code. Two minutes later I
was asking about this line of it (the agent's draft in the thread, not code that exists
today):

```rust
#[input("discount", optional)] discount: Option<i64>,
```

> **Me:** this here #[input("discount", optional)] ... why ptional? You can inspect the
> type, and f the type is Option, it is clear we are requesting an optional datum.

The agent explained the one corner case the flag existed for: a value can itself be an
`Option`, so a step that needs the key present while its value is `None` would read as
an optional request. It recommended dropping the flag anyway. I suggested the inverse:

> **Me:** I see. Can we give defaults semantic? e.e perhaps a required: true on a
> Optional data?

So the type decides by default, and a bare `required` overrides it. Neither of us had
that design ten minutes earlier. It came out of looking at one line.

Then I asked for the whole example again. And then the questions started arriving from
my side. Could the declaration go on the struct itself instead of on its `impl` block?
Could each step get its own line, a `#[with_step]` under the `#[workflow]`? Yes and yes.
Then:

> **Me:** I will throw some ideas, then you reply what you need or ask back.
>
> I think the return api on steps is poor. A macro could generate a impl of a trait to
> steps where one could do a return self::fail("reason"), or a self::contribute_data(key,
> val); for example.

It was poor. In that first example, a step that declined to charge returned this:

```rust
return Ok(Outcome::failure(Reason::new("nothing-to-charge")));
```

The agent agreed and proposed helpers, `Self::succeed()`, `Self::fail(...)` and friends,
available to every step with or without macros. It pushed back on the literal
`self.contribute(...)`: a macro on an `impl` block cannot add hidden fields to a struct,
and the specification says a step may use only what it declares. Its counter-proposal was
to declare the handles a step uses as parameters of `run`. I took it.

## When the agent said no

Not every idea of mine survived, and the ones that did not are the more interesting
part.

I wanted the macro to generate a builder on the workflow type, holding the journey's data
bag inside the struct. Then I saw the risk myself:

> **Me:** my only consern is that users can mix wht is in databag with what is a data
> the workflow instance will need for its operations.

> **Claude:** That concern is the strongest reason for option 1

The workflow's own fields are what its code needs to operate, clients and
configuration, and no step ever sees them. The data bag is the journey's business data,
which steps read and contribute to and events record. Two different things, and the
agent wanted each in its own type, so the boundary would show in the code. I still got
my builder on the workflow type, `Orders::builder()`, but it sets only the workflow's own
fields, and the journey's data goes in through a method of its own.

So I tried renaming it:

> **Me:** what if we call the databag buisiness_data, and require the caller to assembly
> this object on the builder or we supply an empty one?

> **Claude:** "Data bag" is the specification's own term (chapter 1). AGENTS.md says
> names use that vocabulary exactly, so a Rust-only `business_data` would break that
> rule.

It found a word the specification already had, "initial data", and the builder method
became `.initial_data(...)`. Then I wanted the result typed too, so that callers would
read a struct and never touch the bag at all. The agent took the first half, which
became `#[derive(Output)]`, and held back the second: the specification requires the
result to carry the data bag, and the conformance runner reads it to check every case.

> **Me:** 1 for now, we can back to it latter.

Notice what was doing the refusing there. Not the agent's taste. The specification's
vocabulary, a rule in the manual, and a test suite that would fail. I was arguing with
decisions we had written down days and weeks earlier, and they argued back through the
agent.

## Steps don't know their names

Then it was my turn. To let the macro write a step's constructor from annotated fields,
the agent put the step's name on the step's own attribute: `#[step(name = "charge")]`.

> **Me:** why a name is to be provided? Steps don't know their names

> **Claude:** You're right: the name belongs to the workflow

In the specification a step's name lives in its step descriptor, and the descriptor
belongs to the workflow. The agent moved `name` to `#[with_step]` and listed what that
bought: one step type can appear twice in a workflow under two names, and a duplicate
name becomes a compile error pointing at the second line. But it kept a default, the
type's own name, when `name` was left out. I did not want one:

> **Me:** named after its type where? The only way of declaring a step is a
> #[WithStep(name:)], and mame is required

Agreed in five seconds. And then, before the next question, I stopped:

> **Me:** wait, we need to agree on the final macros api before you code.
>
> Can't we have a #[Derive(Step)] for "auto steps", and a #[Step] for impls in needs of a
> custom new?

> **Claude:** No code exists yet. I'll write the full macro API into the plan for your
> sign-off before anything starts.

So the stop was not about undoing anything. What it produced was a document: every
decision since the five quick answers at the start, in one place, waiting for my sign-off
before any pull request was built on it. And the split I asked for in the same breath, a
derive when the macro writes the constructor and an attribute when you write your own,
went straight into it.

## A case in the suite

The reporters came next, and there the ideas went back and forth until neither side's
first answer was left standing.

A reporter listed on a workflow was built by an `init` function that received the
workflow, the journey ID and the initial data. I argued that a reporter needs nothing
from the workflow; anything it needs, like a logger, it can take when it is built, before
the journey starts. The agent agreed, and simplified. Then I went further:

> **Me:** By now, we kill the init I think, or were the events setup by the builder?

> **Claude:** The catch is the conformance case "A reporter is made with the journey
> ID" [...] Proposal 0061 is tier 1 and listed in our `conformance.json`, so without a way
> to give the ID at creation, that case fails and Rust can't claim the tier.

That is the conformance suite acting as a brake on design. What looked like a
simplification would have cost Rust the tier, and the agent found it by checking the
suite rather than trusting the conversation. So I took it:

> **Me:** perfect, not breaking it, then.

And then, a few messages later, I found a simpler way to keep the case passing:

> **Me:** or we do better: we change the init() to a set_journey_id, and we call this for
> the reporters we receive on reporters: [] aond for the others, which came to
> .reporter() alike.

> **Claude:** That's simpler, and I'd take it

One method on the `Reporter` trait, doing nothing by default, called once on every
reporter right after the ID is made. The `WorkflowReporter` trait and its `init` went,
and so did a derive and a builder method that had been planned only to carry an ID. In
the agent's words, "That's three things removed instead of generated."

Then:

> **Me:** So, again, the final example. We are interacting heavily but this will pay of
> very nicely

## Sixteen questions, five examples

By the end, the agent had asked sixteen numbered questions, and printed the complete
example five times, each one folding in everything settled since the last. I said "1" to
most of the questions. The design moved anyway, because the questions I asked back did
not have numbers.

Then the last topic of the night: how do you test macros? The agent proposed equivalence
tests, writing each workflow twice, once with the macros and once with the builder, and
comparing what they declare and every event they produce. I asked how the community
does it. It named the usual approaches, said honestly that it was answering from memory
and had not re-checked the repositories, and pointed at clap, whose derive is sugar over
its builder in the same way. That was when I said the line from the top: by far, the
main usage would be through macros. So I wanted behaviour tests, ready-made workflows
written with nothing but macros, and I noticed that their behaviour could be driven by
the data in the bag, so a handful of them could cover a lot. Then:

> **Me:** And now that I think about it, perhaps yes, we could reuse some of the
> confornance tests, that we can target to @macros also.

The agent checked how the conformance runner's sentences were built, found that its When
and Then sentences do not care how a workflow was declared, and proposed our own feature
files, tagged `@macros`, run by the same runner. They are still there. The manual
describes them, and this is the start of one, from `itinera-rs` on `main`:

```gherkin
@macros @capability-sync
Feature: The payment workflow, declared with the macros
```

The API document went up for sign-off. I gave it in the other thread, the one splitting
files, and the coordinator carried it across:

> **Me:** You have my explicit authorization to merge these two prs, in sequence, once
> everything is ready. Then, ask the tier 8 thread to move forward, as I agree with their
> api doc.

And one more instruction: the stage 8 pull requests were not to merge on their own. I
would review them.

## Seven pull requests

Coding started once the file split merged, on top of the new 200-line rule. A few hours
later there were seven pull requests, one per layer, each reviewed by the reviewer agent
before it opened: reporters getting `set_journey_id`; `#[step]` and
`#[derive(Step)]`; the policy macros; `derive(InitialData)` and `derive(Output)`;
`#[workflow]`, `#[with_step]` and `#[role]`; the `@macros` features; and the documentation
with three runnable examples.

Each pull request listed its departures from the agreed API. There were two decisions
left for me in the whole stack: whether generic steps should stay refused, and whether a
field attribute called `#[default]` should keep a name that clashes with Rust's own.
Keep, and, once I had asked the agent what `#[default]` does, keep.

I merged all but the last one myself, and while I did, I asked what the entry point of
the macro system is, what code runs when the compiler meets `#[step]`, and what that
`#[diagnostic]` attribute was for. Questions about understanding, not about any one line.
And one of those reads found a hand-written `FromStr` that a crate could derive, which
you already know about from last time.

## What it looks like today

Here is the API as it stands on `main` today, in the repository's own example,
`crates/itinera/examples/orders.rs`. First a step, built from its field, with its handles
on `run` and the outcome helpers:

```rust
#[derive(Step)]
struct Charge {
    #[input]
    amount: i64,
}

#[step]
impl Charge {
    fn run(
        self,
        #[service] payments: &dyn PaymentGateway,
        #[contributor] mut contributor: Contributor<'_>,
    ) -> Result<Outcome, Error> {
        if self.amount <= 0 {
            return Self::fail("declined");
        }
        contributor.contribute("payment", payments.take(self.amount));
        contributor.contribute("charged", self.amount);
        Self::succeed()
    }
}
```

Then the workflow, one line per step, each step named by the workflow and not by itself:

```rust
#[workflow(name = "orders", policies = [Notify], reporters = [Printer])]
#[with_step(Charge, name = "charge", retry_budget = 1, policies = [Audit])]
#[with_step(Ship, name = "ship")]
struct Orders {
    shop: &'static str,
}
```

And from `main`, the builder on the workflow type, with the workflow's own field and the
journey's initial data kept apart:

```rust
let instance = Orders::builder()
    .shop("corner")
    .initial_data(order)
    .create()?;
let result = executor.run(instance)?;
```

It is not exactly what we signed off that night, and I would rather say so than pretend.
The `#[service]` parameter came with services, a later stage. `set_journey_id` itself
lasted only days: a later proposal, 0102, gave reporters global metadata, and Rust's tech
spec for it says the new method "replaces `set_journey_id`". The executor
in that example comes from a macro added later still. Each of those changes arrived
through its own proposal or its own thread. Agreeing before coding did not freeze the
API. It meant that every change to it was a decision somebody made, rather than
something that drifted in.

## Why it paid

Was it worth two hours of questions at night, for an API the agent would happily have
started typing after the fifth answer? That night I said it would pay off very nicely,
and the arithmetic is not complicated. Every reshape, the names, the handles, the data
kept apart, the reporters, cost a message and a reprinted example. The same reshape
after seven reviewed pull requests would have meant rewriting most of them, and
reviewing everything again.

The agent's catches mattered as much as mine. The data bag's name, the bag in the
result, the reporter case in conformance: each time, what pushed back was something
already written down, the specification, the manual, the suite. A conversation like this
works when both sides can point at something outside the conversation.

> Agreeing first is not slower. It is paying for the design while it is still made of
> sentences.

## What we learned

A few things I would keep from that night:

1. Answering an agent's questions is not the same as agreeing on a design, so ask it to show you the result.
2. A complete example, reprinted after every round, raises questions the numbered ones never asked.
3. Ask your own questions back, because that is where the design actually moved.
4. When the agent refuses an idea, look at what it points to: here it was the specification, the manual and the conformance suite, not its taste.
5. Write the API down and sign it off before any code exists, while a change still costs a message instead of a rewrite.
6. Agreeing first does not freeze the API; it makes every later change a decision somebody made.

## Which jobs this one was doing

- **Product owner:** "the return api on steps is poor", which became `Self::fail` and
  `Self::succeed`; the builder on the workflow type; typed output read back as a struct.
- **Architect:** "Steps don't know their names", moving names to the workflow and making
  them required; the workflow's own fields kept apart from the data bag; `init` replaced
  by `set_journey_id`; `derive(Step)` for generated constructors and `#[step]` for
  written ones.
- **Project manager:** questions and plan now, coding gated on the other thread; "wait,
  we need to agree on the final macros api before you code", and a document signed off
  before any code; no automatic merges for the stack.
- **QA:** "by far, the main usage of itinera would be through macros", which turned
  equivalence tests into behaviour fixtures driven by their data, and reusing the
  conformance runner for `@macros` features.
- **Reviewer:** merging the seven pull requests myself, and asking what runs when the
  compiler meets `#[step]` before I trusted it.

No platform engineer this time. The machinery was already in place; this one was spent
on what users will type.

The six are counted in [*The night that produced no code*](article:the-night-that-produced-no-code).

## Next time

An API is only as good as the first person who tries to learn it. Next time, the book:
written in an hour, judged too heavy, measured, and rewritten chapter by chapter, first
one at a time and then, once trust had grown, with a different instruction: [*do these
all at once, because I now think you got the idea*](article:do-these-all-at-once).
