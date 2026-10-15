---
title: 'A description can be forgotten'
description: 'In one evening the rules of the Itinera process stopped being paragraphs and became checks that nobody could bypass, the agent included. Then I opened a pull request meant to fail, and the next day a question about coverage turned into the rule that cases come before acceptance.'
pubDate: 'Oct 15 2026 12:04'
series: 'itinera-built-together'
seriesPart: 5
tags: ['ai engineering', 'ai', 'software engineering', 'itinera']
draft: false
---

[Last time](article:exercising-our-own-process) the process was designed together:
my loop of issues and labels over the agent's plan for numbered RFCs, a bootstrap in
minutes, and then a long evening of holding the agent to the rules it had only just
written, which is where the process got its real shape. This time those rules stop
being paragraphs. By the end of the next day they are checks that refuse a merge,
and nobody can switch them off from inside a pull request. Not me, and not the agent.

It is still the evening of the first of October. The agent has just written down how an
accepted proposal gets frozen. The pull request that adds a proposal says
"Closes #2", GitHub closes issue 2 when it merges, and then somebody locks the issue
so the decision cannot be argued again in its comments. Somebody. The agent offers
two ways to be that somebody:

> 1. **A small GitHub Actions workflow:** when a `proposal` issue is closed, lock it
>    with the reason "resolved". It's about ten lines, involves no AI, and costs a
>    few seconds of Actions time.
> 2. **Manually:** a step in the `proposal` skill, so that when you tell me a
>    proposal pull request is merged, I lock its issue with `gh issue lock`.

The pull request it had just opened described the second one. And this is what I
typed back:

> **Me:** Can we avoid that one repo closes issues on the other? And I would make
> this all automated, because a description can be forgoten.

## The rule that lived in a paragraph

Let's take the naive version seriously first, because it is the one most of us run.

You write the rule down. `PROCESS.md` says the issue is locked after the merge. The
skill the agent loads when it works on proposals says the same. Everybody who reads
the documents knows the rule. Done?

Who reads the documents? A contributor reads them once, if we are lucky. I read them
when I wrote them. And the agent reads them at the start of every session, from
nothing, because that is what an agent is: a colleague who is very good and forgets
everything overnight. A rule that only exists as a sentence holds exactly as long as
the reader of the day loads that sentence and acts on it at the right moment.

So, is a description worthless? No. It explains *why*. It just cannot be the thing
that *makes it happen*.

There was a small irony in my line, too. That same afternoon, designing the process,
I had written "We don't need an automation, so no actions as of now." The agent
noticed and drew the line for me:

> **Claude:** You said earlier "no automation for now", but that was about Claude
> acting on its own. Option 1 is a plain GitHub rule, so I'd suggest it.

Which is the right distinction. Nobody was proposing an agent that wakes up and does
things in the repositories by itself. What I wanted was smaller and duller: a
machine that says no.

## The first cut, and the catch

The agent's first cut came back quickly. Three checks, in all four repositories:

- **Pull request has an issue.** Every pull request must be linked to an open issue
  in its own repository. In `spec`, a pull request that adds a proposal file must
  close that proposal's issue, and the issue must be labelled `status: ready`, which
  only a maintainer sets. In the language repositories, an implementation issue must
  no longer be `waiting for spec`, so no Rust code can be merged before its proposal
  is accepted.
- **No cross-repository closing.** A "Closes" that points at another repository's
  issue fails.
- **Proposal accepted.** When a proposal file is merged, its issue is closed and
  locked.

That one came from a worry about coupling, not from an incident. A pull request in
a language's repository closing an issue in the specification would tie the two
together: Rust's work deciding when a question about every language is settled. I
did not want implementations and the specification's issues joined that way. And
partly I asked because I wanted to know, just in case, whether it was even possible
to prevent. It was.

A check, if you have not set one up, is a job that GitHub runs on every pull request
and that reports pass or fail. On its own it only reports. The agent said so before I
could assume otherwise:

> **Claude:** **A failing check only reports; it doesn't block merging.** To make it
> binding, the checks have to be required by a **ruleset** on `main`.

A ruleset is the repository setting that turns a report into a refusal: no pushing
straight to `main`, no deleting or force-pushing it, every change through a pull
request, and the named checks must pass before the merge button works. It asked
before touching any of that, since it is a settings change. I said yes, and asked
for branches to be deleted after merge while it was there. The answer:

> **Claude:** Nobody can bypass it, me included.

Good. Then I opened one of the pull requests to review it, and found the scripts
written *inside* the workflow YAML. Code in a YAML string, in four copies, one per
repository, with no tests:

> **Me:** Can we standardize scripts on one language, perhaps python., and separate
> the files, so we don't embed tthis inside the workflow yaml, and make this a rule
> somewhere so you don't do this again?

Look at the end of that sentence, because it is the habit this whole part is about.
Fixing the four pull requests was the small half. The other half was making sure the
same mistake does not come back next week, from an agent that will not remember this
evening. The agent's reply stopped me merging anything ("Please hold off on merging
#14 and the other three"), and proposed three places for the rule: a section in
`CONTRIBUTING.md`, a hard rule in `AGENTS.md`, and a note in its own memory.

Its plan put the shared scripts into the organisation's `.github` repository. I had
a better idea, or half of one:

> **Me:** and also perhaps they can (if this is repeated along them), perhaps we can
> share a new repo with an exported action?

> **Claude:** I'd go with your idea. My plan put shared code into `.github`, which
> really exists for community files and the org profile. A separate repo is cleaner,
> and it fixes two problems with reusable workflows.

The two problems were real: check names stay stable, so
the rulesets do not need rewriting, and the actions are versioned, so a broken change
does not break every repository at once. I said "go". A few minutes later
`itinera-dev/actions` existed, with the three actions in standard-library Python and
25 unit tests, as the commit still shows. The four pull requests with code in
YAML were closed without being merged. What each repository keeps now is only this,
from `spec`'s `.github/workflows/pull-request-checks.yml` as it stands today:

```yaml
jobs:
  has-issue:
    name: linked to an open issue with the required labels
    runs-on: ubuntu-latest
    steps:
      - uses: itinera-dev/actions/pr-has-issue@v1
        with:
          profile: spec

  no-cross-repo-closing:
    name: no cross-repository closing keywords
    runs-on: ubuntu-latest
    steps:
      - uses: itinera-dev/actions/no-cross-repo-closing@v1
```

No logic. Everything that can be wrong lives in one place, with tests.

## A gate that applies to whoever built it

Then I tried to skip the gate.

> **Me:** no prs, just commit and merge it. You can tag.

> **Claude:** I'll merge and tag. One constraint: the "Protect main" ruleset we just
> activated in `itinera-rs`, `conformance` and `.github` **forbids pushing directly
> to `main`**, me included. So for the replacements I'll open the pull requests **and
> merge them myself straight away**, once their checks pass.

So. The rule we had put in place a quarter of an hour earlier refused the person who
asked for it, and the agent did not look for a way round. It did the honest version
of what I asked: no review from me, but every change still through a pull request,
every check still run. Those four replacement pull requests were the first real use
of `@v1` from outside the actions repository, so my shortcut turned into the test.

By the end of the evening all five repositories had the same "Protect main" ruleset.
Read today through the GitHub API, the one on `spec` forbids deletion and force
pushes, requires a pull request, requires both checks by name, and its list of
bypass actors is empty.

## A pull request opened to fail

There was one action nobody had seen run: `proposal-accepted` only fires when a
proposal file is merged, and no proposal had been accepted yet. The first candidate
was Foundations, issue 2. I asked whether we could write it up, and the agent
reminded me of the rule:

> **Claude:** #2 is still `status: evaluating`. Under our rules, **only a maintainer
> moves a proposal to `status: ready`**: agents never do. The `pr-has-issue` check
> would also refuse the proposal pull request without that label.

It offered two ways forward: set the label myself, or tell it to. I took a third.

> **Me:** let's try to open the pr and we see it failing.

A check you have only ever seen pass is a check you are taking on trust. It might
be right. It might also be passing because it checks nothing. The cheapest way to
find out is to hand it the exact thing it exists to refuse, and watch.

> **Claude:** It failed as intended […]
>
> > Issue #2 must be labelled "proposal" and "status: ready" before its proposal file
> > is merged.
>
> GitHub reports the pull request as **BLOCKED**: the ruleset doesn't allow merging
> while a required check fails.

That message is still in the actions repository, word for word, in `lib/linking.py`.
Then: "so mark the iissue, re run the check, and let me review the prd. url,
please." The label went on, the check went green, and I reviewed.

The review changed the design, as reviews should: optional data on both sides, a
step or a hook asking for a value it can live without. Then the placeholder date in
the file, still `YYYY-MM-DD`:

> **Me:** about the dates ... what do you suggest?

> **Claude:** **My suggestion: remove the "Accepted:" line from proposal files**,
> and let the date come from the place where it's automatically true: the merge.
> […] **A date filled in by hand drifts.** […] Any manual step can also be
> forgotten, which is the problem you raised about "Closes".

My own argument, handed back within the hour and applied to a line in a file. I
agreed. The date line went, and `proposal-accepted` learned to write "Accepted
on DATE in #N" in its closing comment.

## The first real run

> **Me:** 18 merged.

And the automation did most of its job. Issue 2 was closed and locked. The dated
comment was missing, because "Closes #2" had closed the issue a moment before the
action ran, and the action only commented when it closed the issue itself. The agent
added the comment by hand, fixed the action with three new tests, and released
`v1.0.2`. Then, without being asked:

> **Claude:** A mistake during the release, already corrected. The first merge of the fix was refused, correctly, because its checks hadn't
> finished: I'd waited on the wrong pull request number. My command didn't stop
> there and tagged `v1.0.2` and `v1` on `main` without the fix. […] I've also saved
> the lesson: tag only after confirming the merge, in a separate step.

The tags are right in the repository today: `v1.0.2` points at the merge that carries
the fix. We come back to that admission [next time](article:i-am-lost), because what
the agent did with it the following afternoon matters more than the mistake.

That was the first evening. The rules existed as text at the start of it, and as
refusals at the end.

## Only adapters?

The next day I asked a question about something that looked finished.

The agent had opened the conformance repository's first pull request. A conformance
suite, if the term is new, is a set of cases written once, in a neutral language,
that every implementation of the specification must pass: it is how a Rust Itinera
and, one day, a Java one can be held to the same behaviour. The pull request had
seven scenarios, all about one section of Foundations: data from the workflow, read
through adapters.

> **Me:** is this all you couldd derive for this tier 1? Only adapters? What about
> the invariantes? step abort aborts journey, all steps successful reports success
> with databags, the contributions ending up in the result data bag, and so many
> others? Is this planned for latter or you just got adapters?

> **Claude:** Not planned beyond adapters yet, and that's a gap […] Two things explain the gap, and neither excuses it:

Then it did what I would want from anybody: it did not argue, it produced the list.
Fifty-three invariants for the whole of tier 1, grouped by proposal, with the ones I
had named marked as mine. It suggested a `COVERAGE.md` to track them. I doubted that
file and it dropped it, which belongs to the next part; the checklists went into one
conformance issue per proposal instead.

Then, a couple of messages later:

> **Me:** ok, which takes me to another udea: can we derive scenarius from the
> issues? If so we can open / update the conformance pr, and refuse closing the issue
> until the conformance pr is merged? Only a idea.

## Cases before acceptance

Until then the order was: accept a proposal, then write its cases. That sounds
sensible. It means the proposal is judged precise by people reading prose, and only
afterwards does anybody find out whether a test can actually be written from it.

The agent took the idea and found the circularity in it, which was the useful part:

> **Claude:** The real gain: **writing the cases tests the proposal's precision
> before it's accepted.** If a scenario can't be written because the text doesn't say
> what happens, the proposal has a gap, and it's found while it can still be fixed.
>
> […] There's a circularity. Today, cases may only be merged *after* a proposal is
> accepted (`waiting for spec`), and you want acceptance to wait for the cases. One
> of the two has to go first.

Its answer: once a proposal is `status: ready`, two pull requests open together, the
proposal in `spec` and its cases in `conformance`. The cases merge first. The
proposal's pull request is refused until the conformance issue "Cases for spec#N" is
closed. Both checks only read public repositories, so no token was needed.

Notice what kind of thing that is. It is the same move as the evening before. A good
habit, "make sure the proposal is testable", turned into an order of merges that a
machine enforces. It went into `pr-has-issue` as `v1.1.0`, 42 tests, together with the
new sections of `PROCESS.md`, written and merged in about eight minutes once I said
to go ahead. And the tag went on after the merge was confirmed, "as a separate step this
time".

The first proposal through it was Steps. The cases pull request passed. The proposal
pull request did not:

> **Claude:** ❌ **blocked, as intended**: *"The conformance cases for proposal 0008
> are not merged yet ('Cases for spec#8' is open)."*
>
> That's the first real use of "cases before acceptance", and the check enforces the
> order.

I said "merge these two. I am ok", the cases went in, the check was re-run, the
proposal merged, and the action closed issue 8 with "Accepted on 2026-10-02 in #23."

What followed was the fastest stretch of specification in the project. By the end of
that day every proposal of tier 1 was accepted, several of them amended by later
proposals before the evening was out, and the behaviour specification was written as
six chapters. Eleven proposals went through the gate that day, each with its cases
first; with Foundations, twelve were accepted. The
merge log of `spec` has it, one pull request after another, all on the second of
October.

Was that speed in spite of the gate? Look at what each of those merges asked of me.
It was a decision I could make in a minute, because the checks had already asked the
questions I would otherwise have had to ask by reading: is the issue ready, are the
cases in, does this close something it should not. The gate did not slow the work
down. It made each "yes" cheap.

A description can be forgotten. A check cannot, and it does not care who is asking.

## What we learned

What I would take from this one into any project:

1. A written rule explains why, but it only holds while somebody remembers to act on it, and an agent remembers nothing between sessions.
2. A check on its own only reports; a ruleset is what makes it refuse a merge, for everybody, the agent and me included.
3. When you fix a mistake, also write the rule that keeps it from coming back from an agent that will not remember the fix.
4. Before trusting a check, open a pull request it ought to block, and see that it does.
5. Writing the conformance cases before a proposal is accepted shows whether the proposal is precise enough to test.
6. The gates did not slow the work down; they asked the questions first, so each decision left to me was quick.

## Which jobs this one was doing

Four, and two of them carried most of it. No product owner and no project manager
this time.

- **Platform engineer**: the request to automate "because a description can be
  forgoten", no closing across repositories, rulesets with branches deleted after
  merge, and the standard: Python, no code in YAML, a shared and versioned actions
  repository, written down as a rule.
- **QA**: the pull request opened in order to watch it fail; "Only adapters? What
  about the invariantes?", which produced the fifty-three; and the idea that cases
  come before acceptance, so a proposal is tested by the act of writing its tests.
- **Reviewer**: stopping the four pull requests with scripts inside YAML before they
  merged, and asking what to do about a placeholder date that would otherwise have
  been frozen wrong forever.
- **Architect**: optional data on both sides, added while reviewing the very pull
  request that had been opened to fail.

The six are counted in [*The night that produced no code*](article:the-night-that-produced-no-code).

## Next time

A part about tone. What we said to each other when we did not know: my "Now, explain
me what is the spec thing, because I am lost", and what it produced, and the agent's
side of the same habit, owning a slip it could have kept quiet, and reversing a
mechanism it had shipped within the hour because I reminded it who reads the
documents. That is [*I am lost*](article:i-am-lost).
