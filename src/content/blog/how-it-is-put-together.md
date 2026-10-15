---
title: 'How it is put together'
description: 'Before the building starts, the map: seven repositories, what each one holds and how they pin each other, why the conformance cases are Gherkin, why Rust went first, and how the inside of the Rust library stays explained after the session that wrote it is gone.'
pubDate: 'Oct 15 2026 12:06'
series: 'itinera-built-together'
seriesPart: 7
tags: ['ai engineering', 'ai', 'software engineering', 'itinera']
draft: false
---

[Last time](article:i-am-lost) was about the tone of the work: me saying "I am lost"
out loud, and getting back the three kinds of document the project still runs on,
proposals, chapters and cases, plus the rule that a version is tagged only when an
implementation proves it; and the agent owning its slips before anybody found them.
This time is the map. From here on the story moves between repositories, sessions and
pinned versions, and I have been naming them as if you could see them. So, before
the building starts: what is where, why the cases are written the way they are, and
why Rust went first.

Seen from outside, the problem is this. You open the Itinera organisation on GitHub
and find seven repositories, one of them a Rust library. Where is what a retry means?
Not in the library. The tests that prove it? Not there either. The book's code? A
third place, and the library's CI runs it anyway. Over-engineering for a library with
one maintainer? Let me show you what each piece is for, and you decide.

## Seven repositories

In the order a change usually travels through them, as they are on `main` today:

- **`spec`** holds the decisions and the behaviour. The proposals in `proposals/`,
  thirty-five accepted so far, each recording one decision and the alternatives
  rejected, frozen once accepted. The chapters in `spec/`, eight of them now, which
  say how Itinera behaves *now*, with every amendment applied. And `PROCESS.md`, the
  rules for how all of that is argued, accepted and versioned, along with `VISION.md`
  and `ROADMAP.md`.
- **`conformance`** holds the proof. The cases are Gherkin feature files under
  `cases/tier-1/`, one folder per proposal: sixty-one files and 317 scenarios today.
  `STEPS.md` is the catalogue of every sentence a case may use. `FORMAT.md` says how
  cases are written, tagged, versioned and run. The repository is tagged with release
  candidates, `v0.1.0-rc.1` up to `v0.1.0-rc.15`, and never moves a tag.
- **`actions`** holds the shared GitHub Actions every other repository uses, written
  in Python with their own tests: the pull request checks, `run-conformance`,
  `release-gate`, `create-release` and `check-book`, among others.
- **`itinera-rs`** is the Rust implementation. Its crates are `itinera`, the one an
  application depends on; `itinera-core`, where the whole implementation lives;
  `itinera-macros`, the procedural macros; and `itinera-conformance`, which is never
  published and exists to run the cases. (There is also an `xtask` crate that runs
  every check locally.) At the root sits `conformance.json`, the manifest that says
  which cases this language answers to.
- **`book`** holds the book, written once per language, with its examples beside the
  chapters as real programs that compile and run.
- **`itinera-dev.github.io`** is the site at https://itinera-dev.org/, which also
  serves the book under `/book/`.
- And the organisation's **`.github`**, with the contributing guide every repository
  links to.

There is one language today. The point of the layout is that there will be more, and
that none of them gets to decide what Itinera means. That lives in `spec`, and is
proved in `conformance`.

## Who pins whom

Seven repositories that all track each other's latest version would be seven ways to
break each other overnight. So almost every arrow between them is a pin: a fixed
version, moved on purpose, in a pull request somebody reads.

- **The library pins the cases by tag.** `conformance.json` in `itinera-rs` says
  `"cases": "v0.1.0-rc.15"`. Moving to a newer candidate is a pull request that
  changes that line, and if the library does not pass the new cases yet, that pull
  request is where it shows.
- **The library pins the actions by version.** Its workflows use
  `itinera-dev/actions/run-conformance@v1` and the like.
- **The book pins the library.** The book's Rust examples depend on `itinera` at an
  exact version, `=0.1.0-beta.2` as I write.
- **The library pins the book, and runs it.** `book.json` in `itinera-rs` holds a
  book commit. On every pull request, a `book` job uses `check-book` to run the
  book's examples at that commit, built against the library's own code in the pull
  request rather than the published version. A change that breaks the book fails in
  its own pull request, not weeks later when somebody reads chapter twelve.
- **A release is gated.** The release workflow runs `release-gate` (the tag matches
  the package version, the commit is on the release branch, the changelog has the
  version, the manifest lists every proposal of the tiers it claims), then
  `run-conformance` again, then `create-release`, which attaches the conformance
  report to the GitHub release. The release carries its own proof.

Why pins and not "always latest"? Walk the naive version. Someone adds one case to
`conformance` on a Tuesday. Every pull request in every language goes red, including
the ones that have nothing to do with that case, until somebody implements it. The
agent said it in exactly those terms when it recommended pinning: "adding one case to
`conformance` could block every pull request in every language until someone
implements it, even unrelated ones." I did not argue. The next message from it said
so, which I liked: "You didn't object to pinning the cases version, so I'm using it.
Tell me if you'd rather not."

## Why Gherkin

All of that hangs from one choice: the cases are written in Gherkin and run by
Cucumber. That choice was mine, sort of. Late on the first of October, with the
process for proposals in place, I typed:

> **Me:** I want to go to the comfornance. I was thinking, and gercyn would work
> nicely for what we want, right?

If you have not met it: Gherkin is the *Given, When, Then* format for writing tests as
plain sentences, and Cucumber is the family of tools that runs them, matching each
sentence to a small piece of code in your language.

The agent decoded "gercyn" without comment and said yes, with reasons:

> **Claude:** **It's data, not code, and language-neutral.** The cases are plain-text
> `.feature` files, which is what `PROCESS.md` asks for.
>
> **Every target language has a mature runner:** cucumber-rs for Rust, cucumber-js
> for TypeScript, and Cucumber-JVM for Kotlin and Java. Each language writes only the
> **step definitions** that connect the sentences to its own implementation.

And then, which is the part worth keeping, it said what would make it fail. "Yes, with
three conditions":

> **Claude:** **A closed catalogue of step phrases.** The danger with Gherkin is that
> each language interprets a sentence slightly differently, and then "passing" means
> different things.

The other two: cases use scripted test steps, fake steps whose behaviour the scenario
dictates ("on attempt 1 it returns transient, on attempt 2 success"), never real
business steps; and the expected result is a table of events, compared against the
stream of events the engine actually emitted.

The first condition is the one people skip. "Step charge succeeds" means one thing to
whoever wrote it and something slightly different to whoever implements it in another
language six months later. Both pass, and "conforms" quietly means two things. The
catalogue closes that door: `FORMAT.md` says today that a sentence outside it "is an
error, not an extension", and `STEPS.md` gives every sentence its exact meaning and
the proposal that introduced it.

Then the agent proposed how the cases would run, and I did not like it:

> **Me:** not sure if I agree.
>
> I would think the following:
>
> 1. Conformance repo holds the cases.
> 2. all prs should go through integration tests.
> 3. I ntegration tests, I would call them conformance tests, should download the
>    cases and run.
>
> The release process is another thing: When a new framework version is to be
> added, it should run as part of the process what is defined.

The agent's answer started with "That's simpler than my two-sided proposal", and
built the design on mine. That is where the pins above come from: cases on every pull
request as a required check, run again at release as a gate, the report attached.

## The runner is the first client

The next afternoon I was looking at the cases being written and something bothered
me. Every scenario builds its workflow from a table: "a workflow orders with the steps
charge, ship". But Itinera's whole pitch in Rust is declarative, attributes on
structs. How does a test build a workflow from a table, at run time?

> **Me:** We will need to add steps dinamically to workflows to accumplish this spec,
> or not? The declarative way of doing things is ... declarativ, and I suppose we
> will ahve to code a builder or something like that to support cocumber cases, if I
> am not loosing something.
>
> If so, the macros (in rust) will just import a otherwise available api, not generate
> the code, and macros would just use these constructs behind the cenes.

> **Claude:** Your question: yes, your instinct is right
>
> […] Rust macros run at **compile time**, so the cucumber-rs runner can't use them
> to build the workflow a scenario describes.

It laid out the layers: the core runs only one thing, a workflow definition; the
builder that makes one is the public API; the macros are syntax only, expanding into
builder calls plus whatever compile-time checks Rust allows; and the executor never
knows which of the two made the definition. And it said why that was right anyway,
cucumber or not: "there's one runtime path to test, not two."

I agreed, and added the thing I actually cared about:

> **Me:** Interestingly, having cocumber around will force us to design a better api.

> **Claude:** Agreed. The conformance runner will be the **first real user of the
> Rust API**, before any business code exists. Anything awkward to express in step
> definitions will show up immediately, which is the best pressure an API can get.

It went into the Rust plan as a rule: if something is awkward to express in the
runner, the fix belongs in the API, not in a workaround in the runner.

That is the shape `itinera-rs` still has. Its architecture document says it in one
sentence about the macros: all of what they generate "goes through the builder to a
`WorkflowDescriptor`, exactly as code written by hand does". The test harness was the
API's first customer, and a demanding one, before there was a single real workflow.

## Why Rust first

The vision names TypeScript and the JVM after Rust. So why start with the one most
people would call the hardest? My answer, looking back:

> because it was by far the more strict language and the most powerful, so if we did
> it in rust, chances are that all possible things other languages would need would
> be already defined. The other way around would risk doing things that rust wouldn't
> allow, which could trip the specs.

Walk the other order. Write a looser language first, and the specification grows to
fit what it allows. Then Rust arrives, some of those rules cannot be written in it at
all, and the specification has to bend after a language has already shipped against
it.

Starting with Rust put the strict reader first. And the record shows the strict reader
doing exactly that job. The Rust planning session was told, in the prompt the
specification session wrote for it, that a gap in the specification is "never a quiet
Rust decision". It found four gaps on its first reading, before a line of Rust, and
fifteen more issues two days later, most of them amendments to proposals accepted that
same week. That story is next time.

The clearest trace of it is in the specification itself. Proposal 0054, which came out
of that Rust work, lets a language make some rules *impossible to express* through its
types, and says what that costs: "for every scenario it excludes, a test shows that
the forbidden code is rejected". In `itinera-rs` that is the `impossible` map in
`conformance.json`: nine tags today, nineteen scenarios, each naming the test that
proves it, all in `crates/itinera/tests/proofs.rs`. Each proof is a program that
breaks the rule and fails to compile, next to a twin that keeps the rule and
compiles. A rescue step that skips, a policy attached to a workflow that does not
provide its role, a step that contributes something that is not a value: a
language without those types checks them at run time, as the cases describe. Rust refuses to build
them, and has to prove it.

What Rust is like to write every day is another series, starting with [*Write like
TypeScript, deploy like Go*](article:write-like-typescript-deploy-like-go) and [*The
errors you are never going to see again*](article:the-errors-you-are-never-going-to-see-again).
Here the reason is narrower: the first language shapes the specification.

## Keeping the inside explained

So far, the map between repositories. What about the map inside one?

`itinera-rs` was written over many sessions by agents that each forgot everything at
the end. Somebody, human or agent, arriving cold has to learn how a journey actually
runs: what an attempt does, in what order, where a retry is decided. On the twelfth of
October, with tier 1 complete, a thread proposed ten diagrams for that. I asked
whether the community had tools that read code and draw diagrams. They exist, it said,
but they draw structure, and "None of them can show the executor loop, the retry and
rescue decisions or the order of injection". Fine. Then:

> **Me:** ok, write. As I understand, the tier 1 is complete, we are going to rc,
> then I don't think we have to change. But I need a agents.md rule and a review
> skill to verify whether we would need to change the diagrams.
>
> I also want a crate diagram and description, and something showing how macros go
> into the mix.

The result is `docs/architecture.md`: fourteen Mermaid diagrams, from the crates down
to how a journey ends, each followed by a numbered list that says everything the
diagram shows and a "Where it lives" line naming the files. A diagram is only useful
until the code moves under it, which is why the second half of my message mattered
more than the first. The rule went into `AGENTS.md`:

> A change that makes any of its diagrams, lists, tables or "Where it lives" lines
> untrue updates it in the same pull request […] Where the document and the code
> disagree, the document is corrected.

And an `architecture` skill maps every section of the document to the code it
describes, and the review checklist every pull request goes through applies it. A
document an agent wrote, kept true by a rule agents follow, checked by a review agents
run. It is the pins between repositories again, one level down: nobody has to
remember.

## What we learned

The few things to keep from the map:

1. Put the meaning in one place, the specification, and make every implementation
   prove it against the same cases.
2. Pin everything that moves, and move a pin only in a pull request that shows what
   the move costs.
3. A shared test format is only shared if its sentences are a closed catalogue, each
   with one exact meaning.
4. A test runner that must build things at run time is the first client of your API,
   and a good one.
5. Start with the strictest implementation, so the specification is shaped by what is
   hardest to allow.
6. An architecture document survives agents only with a rule to update it and a review
   that checks it.

## Which jobs this one was doing

Four of them, and most of this part is architecture, so that list is the long one.

- **Architect**: "gercyn would work nicely for what we want, right?", which chose the
  case format; the builder instinct, that the macros "would just use these constructs
  behind the cenes"; Rust first, because it was the strictest; and asking for a crate
  diagram and one showing "how macros go into the mix".
- **QA**: "not sure if I agree", which turned the agent's two-sided plan into
  conformance on every pull request and again at release; and "having cocumber around
  will force us to design a better api", which made the test runner the API's first
  client.
- **Platform engineer**: the release as a gate that runs the cases again, and the
  `AGENTS.md` rule and review skill that keep the architecture document true.
- **Reviewer**: asking whether community tools could draw the diagrams before
  accepting ten hand-written ones.

No product owner and no project manager this time: nothing here was about what to
build next, or in what order. It was about where things go.

The six are counted in [*The night that produced no code*](article:the-night-that-produced-no-code).

## Next time

The strict reader goes to work. A second agent, planning the Rust implementation,
takes "never a quiet Rust decision" literally, files its gaps as spec issues, and the
two agents start disagreeing with each other, in writing, while I settle it. That is
[*Agents reviewing agents*](article:agents-reviewing-agents).
