---
title: 'Either you ignored some rule or some rule needs to be written'
description: 'With parallel threads writing code, I could not read everything, so I stopped trying. What supervising agents became instead: asking why each mistake happened, and turning the answer into a rule, a review item or a proof the compiler checks, so that nothing is caught twice.'
pubDate: 'Oct 15 2026 12:10'
series: 'itinera-built-together'
seriesPart: 11
tags: ['ai engineering', 'ai', 'software engineering', 'itinera']
draft: false
---

[Last time](article:what-could-make-your-life-easier) I asked the agents what slowed
them down, and they measured before they answered: one command for every check, a
cloud environment that starts ready, and a twenty-minute CI run cut to a fraction. The
machines got faster. What did not was me, and that was already the problem the
project had brought: several threads writing code means more code than one person
reads.

So this one is about supervising once you cannot read everything. The short version: I
stopped trying to catch every mistake, and started making sure none was caught twice.

It starts with a number that could not be zero.

## The attempt that started at zero

A journey in Itinera runs its steps, and a step that fails may be tried again. Each try
is an attempt, and the specification says, in so many words, "The first is attempt 1".
I was reading the first pull request of the events stage, and the attempt was a plain
`u32`. So I asked:

> **Me:** cam we have atempt 0? If not, perhaps a nonZero?

`NonZeroU32` is Rust's integer that cannot hold zero. Use it, and "attempt 0" is not a
bug you test for; it is a value that cannot be built. The agent checked the spec,
changed the type, pushed it, and the tests passed. Fixed in about a minute.

That is the naive version of supervising: read, spot, fix, move on. What is wrong with
it? The agent that fixed it does not remember fixing it. Tomorrow a new session writes
`u32` for the next number counted from 1, and I have to happen to be reading that file
that day. A correction made in a conversation lives exactly as long as the conversation.

So ten minutes later I asked something else:

> **Me:** why do you think you failed this requirement? As if you didn't know rust
> enough ... Can we do something?

> **Claude:** knowing Rust wasn't the problem. My process was. I turned each field the
> spec lists into the nearest plain type ("attempt number" became `u32`) and wrote the
> spec's rule into the doc comment ("from 1") rather than into the type. The doc
> comment was saying what the type should have enforced, and nothing made me stop and
> check.

That answer is worth more than the fix. It names the mechanism of the mistake, and a
mechanism can be closed. The agent wrote a rule into `AGENTS.md`, the manual every
session in that repository reads before touching code. Here it is today:

> Types hold every constraint of the specification and the plan that Rust can express:
> `NonZeroU32` for a number counted from 1, an enum for a closed set of values, a
> newtype for an identifier. A documentation comment stating a constraint that the type
> could enforce means the type is wrong.

Then it did something I had not asked for. It searched its own doc comments for words
like "from 1", "non-empty", "at least", "never" and "only", and found a second case of
the same mistake: event sequence numbers, also counted from 1, also a plain integer.
One question, two bugs, and a rule that would have caught both. (A type that refuses a
wrong value gets a whole article in the Rust series, [*Optional for the user, not for
us*](article:optional-for-the-user-not-for-us).)

## Ignored, or missing?

The next day I was reviewing again and found the journey ID living in the `event`
module. A journey ID names a journey. Events carry it, but so does the result, and so
will half the library.

I could have said "move it". Instead I wrote the sentence that ended up being the frame
for most of what came after:

> **Me:** Why is the journeyId, which will be used for events but also for
> JourneuyResult, in the event module?
>
> This means that either you ignored some rule or that some rule needs to be writen on
> modules.

Two failures, two fixes. A rule that was ignored needs enforcing. A rule that is missing
means the agent did something reasonable with what it had, and needs to be given more.

> **Claude:** No rule was ignored, but a rule is missing. [...] That puts a type where
> it's first used, not where its concept belongs.

A short back and forth later ("The conceptual part should win, of course"), `AGENTS.md`
said that each type lives in the module of its concept, "never where it happens to be
used first". From then on, finding the next misplaced type was not my job. The reviewer
agent reads every change against the manual, long after I have stopped thinking about
modules.

## The rule from the Rust articles

Some rules I brought with me. Back on the evening of the attempt number, I asked whether a crate could
derive `Display` for the journey ID instead of us writing it by hand. The agent found
two candidates, and before it went any further I reminded it of an order I had already
written down in the Rust series, in [*Is that name right?*](article:is-that-name-right):

> **Me:** remember the rule from the rust articles: first, look at apis you do have at
> hand. If you haven't anything to help there, look for functionaloity in crates you
> already use. If still nothing there, look for known crates. If nothing, then you code
> it. Unless it is a crate for two lines, which isn't clearly what happens for these
> here.

Into `AGENTS.md` it went. And then the agent applied it more faithfully than I meant.
It discovered that `derive_more` would compile a second copy of a parsing library, and
saved only six lines on the one type that used it, so it dropped the crate, citing my
own exception: a crate for a couple of lines.

Was it wrong? By the letter of the rule, no. I put it back anyway, and said why:

> **Me:** put derive_more back, please. While it is true that it only replaces 6 lines
> now, it is clear (and this needs to be in the rule) that it will replace many more
> other six lines, because new types will be vastly used.

"And this needs to be in the rule." That is the habit. The rule now says to "Judge a
crate by what it will replace across the project, not only by its first use".

It did not end there, and that is the honest part. Two days later a hand-written `Debug`
turned up where `derive_more` could have derived it.

> **Me:** this is not the first time you skipped reuse.

A few days later, while merging the macros stage, I spotted a hand-written `FromStr` in
a diff. Same crate, same miss. Why did the rule not fire? The agent's diagnosis was that
"Reuse before writing" is stated in general terms, and nobody, writer or reviewer,
thinks of `Debug` when reading it. So the rule grew names: today it lists, trait by
trait, what to check for a derive before writing it by hand. And the reviewer must now,
for every hand-written impl, "write down the derive from `derive_more`, `thiserror` or
the standard library that could produce it", then ask for it or say why it cannot.

That `FromStr` got its own thread, which found nine hand-written pieces, 64 lines in
all. My note to it was one sentence:

> **Me:** Even though the number of lines is small, there is no reason not to reuse
> something that is already being in place.

## Can't we write a lint?

Reviewing the test runner, I asked for chains of iterator calls to read like sentences,
with any closure that needed a block turned into a named function. The agent said no
lint does that, and it would add the rule. I pushed:

> **Me:** Can't we write a lint?

It came back with options, and when I asked how anyone writes a Clippy lint without a
nightly compiler, said that strictly you cannot. A stable linting project, Marker, it
mentioned from memory; I asked it to check, and its last release was from December 2023.
So the real choice was a check written as a test, or a lint on a pinned nightly compiler
that someone keeps up to date.

I chose neither:

> **Me:** well, only a hard rule on agents.md. stream based code has to be read as
> normal .map(toNewFormat).filter(onlyOven).sort(byLesser) ... and if one wants to get
> the details they can just go to the functions.

Why the cheap one? The reviewer agent already reads every change against `AGENTS.md`, so
a rule plus a checklist line cost a paragraph, where a lint would have cost a toolchain.
Rules need enforcing; they do not all need the same enforcer.

## Every line does something

Some rules came out of a single line of code. Reading a documentation example, I found
a hidden line:

> **Me:** what does this do? /// # drop(alarm); ... te # I mean

It did nothing. The agent had added it to quiet a warning that rustdoc does not even
raise, and there were 27 of them. It offered to remove all 27. I wanted more than that:

> **Me:** npot remove the drops. Your reviewer should ask for not useful lines and
> remove them, this should be a ru.e

So `AGENTS.md` gained "Every line does something", and the reviewer's checklist gained
an item asking it to flag every line that changes nothing. Before that pull request was
ready again, the reviewer had found four more such lines under the new rule, lines
nobody had asked about.

That is the whole trade, in miniature. I spotted one line. The agent and its reviewer
found the other thirty.

## The fact you are asking

Not every catch came from a diff. Some came from an impression. One night I wrote that
some files looked too big to me, over 100 or 150 lines, and asked for a new thread to
investigate the whole repository and bring me findings before anything changed. I added
that in Rust the documentation counts as code too.

The analysis was good. In the core crate, 39% of the lines were doc comments, 27% inline
tests and only 34% code, and a flat 150-line limit would have failed 45 of the 109
files. The agent recommended a limit of about 300 lines. I set 200:

> **Me:** right. Above 200 lines, if there are two things, related or not, they are
> split. Only exception is when all these lines to to say a single type. We have been
> failing in modularization.

Two pull requests followed: the rule, and thirty files split into private submodules.
Then the thread asked me whether large test modules should move into files of their
own. And that question told me something:

> **Me:** 1, yes. And I hope you brought the sub modules tests with them, because this
> would be the correct thing. The fact you are asking this signalizes you didn't.

> **Claude:** You're right. The split only moved tests that call nothing but the moved
> items. [...] So `engine.rs` still has 39 tests, but only 1 of them checks its own
> code.

Thirty-eight of thirty-nine, and about seventy tests in the wrong module overall. I did
not find that by reading seventy tests. I found it by reading the question, and asking
what would have to be true for it to make sense. Today the manual says a file past 200
lines holds one thing, and that unit tests live with the code they check.

## Rules, not skills

Back when the reuse misses were piling up, I wondered out loud whether `AGENTS.md` had
grown too big, and whether some of it should move into skills, the instruction files an
agent loads only when a task matches their description. I asked the agent to evaluate.
It disagreed with me:

> **Claude:** Moving rules into skills would make that worse. A skill loads only when
> its description matches the task, and a coding rule has to be present while code is
> written.

Size, it said, was not why rules were missed; vague wording was. So rules stay in
`AGENTS.md`, always loaded, and a skill holds a *procedure*: how to run a review, how to
manage a stack of pull requests. I took it.

The review skill starts a separate reviewer agent and hands it a checklist that "states
no rule of its own: every item below points at the AGENTS.md bullet that is its
criterion". One rule, one check; today, 23 items. When the Rust repository was
bootstrapped, its manual had 7 rules about code. On `main` today it has 25, and 33
commits have touched the file.

## Make it impossible to write

The strongest kind of rule is one the compiler refuses to break, and the best example
came before any Rust was written, while we planned the implementation.

Itinera has a conformance suite: a shared set of test scenarios, written in plain
sentences, that every implementation in every language must pass. One says that a hook
returning a decision it may not return aborts the journey. But the agent was
recommending a typed builder for Rust, where that mistake does not compile. So how do
you pass a test for something your language makes impossible? You cannot run it, and if
you skip it, the hole looks exactly like a real gap.

> **Me:** I agree. We can just perhaps try to compile and fail the conpilation, so we
> prove that it is impossible, and fail if we forget a constraint?

> **Claude:** Yes, and that's stronger than plain exclusion.

Each excluded scenario gets a small program that does the forbidden thing, and a test
that expects the compiler to reject it with one particular error. A typo does not count.
A program that suddenly compiles, because somebody loosened a type, fails the run: that
is "fail if we forget a constraint". Later each proof also got a twin that does the
allowed thing and must compile.

This is one of those proofs, from `itinera-rs` on `main`: a failure hook trying to
finish the workflow, which only a success hook may do.

```rust
impl OnStepFailure<Orders> for Settle {
    fn on_step_failure(
        &self,
        _got: Requested<'_, Orders, StepFailure>,
    ) -> Result<Option<FailWorkflow>, Error> {
        Ok(Some(OnSuccess::FinishWorkflow))
    }
}
```

And the error the test stores and expects, word for word:

```text
error[E0308]: mismatched types
  --> tests/proofs/invalid-lifecycle/finish_workflow_on_step_failure.rs:18:17
   |
18 |         Ok(Some(OnSuccess::FinishWorkflow))
   |            ---- ^^^^^^^^^^^^^^^^^^^^^^^^^ expected `FailWorkflow`, found `OnSuccess`
```

Then it stopped being a Rust idea. It went into the specification as proposal 0054, for
every language: a language may make a rule impossible to express, and may exclude that
rule's scenarios *only* with a test in its own suite proving it. The shared action that
runs the suite refuses to start if an excluded scenario has no proof listed. Rust lists
19 today, under nine rules. It is the idea behind [*The errors you are never going to
see again*](article:the-errors-you-are-never-going-to-see-again), turned into evidence a
test suite can read.

## The default that slipped through

So, with all of that in place, did everything get caught? Of course not. Here is one
that was not.

The services stage needed to say which service providers serve a rescue step, the step
that runs to repair a failed one. The agent had a recommendation, and it wrote it into
the proposal and both pull requests:

> **Claude:** **One decision.** Rescue steps landed in the meantime, so 0095 now has to
> say which providers serve a rescue step. In both PRs and in the issue I picked option
> 1: [...] Reply with a number.

I never replied with a number. The cases were merged, then the proposal, and merging the
proposal is how a proposal gets accepted. The agent's default became the specification,
and I had never chosen it.

About four hours later, still in that thread, I asked:

> **Me:** I would like to discuss why couldn't we have a rescue step reaching
> #[Service] by its name, if we have it with a name.

The answer was honest:

> **Claude:** Rust could do it easily. [...] What stops it is a rule in the accepted
> spec, which I proposed as a default

> **Me:** right. I screw it up, probabluy: how under the san a rescue step would survive
> without getting input data, for example?

> **Claude:** Your instinct is right about one gap, though, and it's the same shape as
> the providers.

The gap was bigger than the one I asked about. A value an input adapter hands to a step
never enters the journey's shared data, so that step's rescue step could never see it,
and the already accepted rescue proposal had the same hole. One amendment, 0098, closed
both the next morning.

What would have caught this? No line in `AGENTS.md`, which governs Rust code, not
specification decisions. No reviewer either: a reviewer checks the code against the
proposal, and here the proposal was the thing in question. The default was reasonable.
It was just unread. What found it was a question, asked as "why" rather than "change
it". That is the limit of everything above: rules catch what someone has already
understood. The first time, it is still a person asking why.

## What supervising turned into

So what did supervising look like, by the end? Not reading every line; I could not. Read
some of it carefully, notice what looks wrong, and ask why it happened before asking for
a fix. Then turn the answer into whatever will catch it next time without me: a rule, a
checklist item, a type, a proof.

> The goal was never to catch every mistake. It was to never catch the same one twice.

## What we learned

What I would keep from supervising this way:

1. A correction made in a conversation lasts as long as the conversation; ask why the mistake happened, and the answer can become a rule.
2. Ask whether a rule was ignored or is missing, because the two need different fixes.
3. A rule that names its cases, trait by trait, gets followed where a general one is skipped.
4. Not every rule needs the same enforcer: a reviewer reading the manual can cost a paragraph where a lint costs a toolchain.
5. The strongest rule is one the compiler refuses to break, with a test that proves it does.
6. Rules only catch what someone already understood; the first time, it is still a person asking why.

## Which jobs this one was doing

- **Reviewer:** the journey ID in the wrong module, the hidden `drop` lines, the
  hand-written `Debug` and then the `FromStr` in a diff, and the rescue-step default,
  questioned four hours after it had been merged.
- **QA:** "fail if we forget a constraint", the clause that turned compile-fail tests
  from exclusions into proofs; and "the fact you are asking this", which found 38 of 39
  tests in the wrong module.
- **Architect:** concept modules over first use; 200 lines and one thing per file
  against the agent's 300; "put derive_more back", judging a crate by what it will
  replace across the project.
- **Platform engineer:** "Can't we write a lint?", answered with a rule plus a reviewer
  item instead of a pinned nightly; and rules in `AGENTS.md`, procedures in skills, after
  the agent talked me out of moving the rules.
- **Project manager:** the file-size question sent to a thread of its own, analysis
  first and changes after.

No product owner this time. Nothing in this one changed what Itinera is for; all of it
changed how it gets built.

The six are counted in [*The night that produced no code*](article:the-night-that-produced-no-code).

## Next time

Everything here happened after code was written. Next time, a night when the catches
came first: the public API of the macros, designed in about two hours of conversation, sixteen
questions and five complete examples, with me stopping it halfway to say [*wait, we need
to agree before you code*](article:agree-before-you-code).
