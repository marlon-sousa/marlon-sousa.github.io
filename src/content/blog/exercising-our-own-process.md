---
title: 'I am trying to exercise our own process'
description: 'The first of October: a process for a multi-language library designed together, research instead of memory, an agent that set it all up in minutes, and the same evening, holding it to the rules it had just written. Three kinds of document came out of the correction.'
pubDate: 'Oct 15 2026 12:03'
series: 'itinera-built-together'
seriesPart: 4
tags: ['ai engineering', 'ai', 'software engineering', 'itinera']
draft: false
---

[Last time](article:the-best-thing-i-could-think-of) we went back to the evening Itinera was
thought through: a problem brought to the agent instead of a specification, its elaborate
proposals falling to one-line constraints, a verdict asked for and given with the risks
attached, and the name, which was the agent's. That evening ended with a model and a word.
Nothing existed anywhere except in one long conversation.

This time it is five days later, the first of October. The name has become a GitHub
organisation with four repositories holding little more than their licences, and we have to
decide how anything will ever get into them. We designed a process together that afternoon, and that same evening I had to hold
the agent to it. The correction turned out to be worth more than the design.

## A good plan, and a different one

I asked the agent how we would produce our requirements and our specifications, where they
would live and in what order, and I said I preferred to hear it first. It came back with a
proper plan. A vision document. Proposals written as RFCs, numbered files in the `spec`
repository, one pull request each. Specification chapters with MUST and SHOULD. Conformance
cases as data. Milestones from M0 to M6. And a rule on top that still governs the project:

> **The spec is the source of truth, and every implementation follows it.**

It even had an answer for how the two of us would work: "Design sessions like this one end
with an RFC draft. I write it from the conversation, you review the pull request, and the
decisions are written down instead of lost in chat history."

Nothing wrong with any of it. RFCs are how Rust runs its language. I said so, and then went
somewhere else:

> this is great, but here is something I was thinking, give experiences on acter and
> screen-readers-mcp: can we convert some of these to a gitops workflow?

Acter and screen-readers-mcp are my other projects, and their work flows through files in
the repository: a status board, one file per entry, specs that land in the same pull request
as their code. What I was asking was whether some of that could move onto GitHub itself. The
agent sent a second agent off to check what Claude Code could actually do with GitHub issues,
locally and in the cloud, and came back with a way to map my old process onto issues and a
project board.

Then I wrote down the loop I actually had in my head:

> 1. Somneone (even us) propose a feature. On which repo?
> 2. We don't need an automation, so no actions as of now.
> 3. Someone with write permissions will interact with the issue, and label it as done,
> planned, or whatever.
> 4. Then we ask maniually claude to further evaluate it. Claude can pose questions or issues
> on that same issue, I suppose, untill we are ok with all.
> 5. Then we label it to do, and from that issue we generate the spec.
>
> Either this or the spec is in the issue itself, and this is the spec, I don't kow. Can uyou
> research if someone is trying such a thing and what are they doing?

Read the last two sentences again. "I don't kow." And then not "what do you think?" but "can
you research".

## Research, not reassurance

Five days earlier, asked whether any library already did this, the agent had answered from
memory and said so: "I haven't searched". Honest, and fine for a first look. But an answer
from memory is the agent's recollection of the internet, with its confidence attached. Ask
"is my idea new?" and you get its impression. Ask it to go and look, and you get sources.
What came back this time was specific:

> Your flow is very close to **Go's proposal process**. A proposal starts as an issue, all
> discussion happens on the issue, and its status is tracked with labels and a board [...] A
> design document is written only when the issue alone can't settle the question. It goes
> into the repo as `design/NNNN-name.md`, where `NNNN` is the issue number.

Kubernetes keeps a tracking issue and a file named after its number. Rust, Python and Swift
keep the normative text as a file reviewed as a pull request. GitHub's Spec Kit and AWS's
Kiro keep specs as files; Copilot's coding agent treats an issue as the spec but reads it only
once, when it is assigned. And then a line that is easy to over-quote:

> No well-known project documents exactly your loop, where an agent comments on the issue
> until agreement, then a label, then a spec. Some blog posts describe it, but nothing
> established, so here we'd be slightly ahead.

I have not checked that claim beyond the agent's own search, and I am not going to repeat it
as a fact. What was useful was everything else: a recommendation built from the nearest prior
art rather than from taste. **The issue holds the question, the discussion and the status; the
spec is a file generated from it**, numbered by the issue so the two always share a number,
because among other reasons "Agents read it from a checkout."

My loop on top, Go's shape underneath. Neither of us had that before the research.

## The process can't be put through itself

I agreed to all of it and then made a suggestion of my own: put the process documentation,
the skills and everything we had decided into issue number one.

The agent disagreed, in one line:

> **The process can't be put through itself.** It has to exist before anything can use it.
> We've agreed it here in conversation, so it should go straight in as a bootstrap.

The core model, it argued, deserved the opposite treatment: the full process, as the first
real proposal, with an evaluation and a back-and-forth, "which also tests the process on
something real." Its idea was better than mine, so we did it its way.

A few more decisions went by quickly. I proposed tiers, features grouped into levels each
language climbs in order, and the agent added that some things, such as sync versus async,
cannot be a level because they depend on the language, so they became capabilities beside
the tiers. In the middle of all that I added the piece that was missing from the evening five
days earlier, an event dispatcher that fans out everything the engine does to whatever
reporters are registered, because:

> Thuis is a must have because once decisions are decoupled from business you have to know
> the things thate are going on to understand your own flow for production events.

And when I asked "journey or workflow?", the agent proposed keeping both, for different things:
the workflow is the plan, made of steps; the journey is one execution, made of runs. "let's do
a, agreed."

Then:

> ok, lots of documents, issues, skills, agents.md, and many other things to write. Please,
> start doing everything. If you need me, ask me please.

## Nine minutes

About nine minutes later there were labels in three repositories, four issues and four pull
requests. The process bootstrap as `spec#1`. The core model as `spec#2`, with an evaluation
comment holding seventeen open questions, each with a recommendation. Rescue steps as `spec#3`,
ten questions. The organisation's profile. And a pull request in `spec` with the vision, the
process, the roadmap, an `AGENTS.md` with the rules every agent reads first, a `proposal` skill
so any future session would run the process the same way, and the issue forms.

Nothing was merged. The agent said so in as many words: "merging is your review and
acceptance." It had also written a rule into `AGENTS.md` that I had not asked for:

> **Agents can set `status: evaluating`, but never `status: ready`, `status: declined` or
> `status: postponed`.** Those stay a maintainer's decision.

So. Is that the story? Process designed, agent fast, human approves? We reviewed and merged
through the evening, a no-pull-request-before-the-spec rule went into the contributing guide,
and everything looked very tidy.

Then I started actually using it.

## I am trying to exercise our own process

I was reading the core model issue, and one point in it described, in Rust, how a macro
would build a step. So I pasted it back and asked:

> ... would putting rust specifics here be ok?

The agent agreed they did not belong in a language-neutral proposal, which was right. It
rewrote each Rust statement in neutral terms. "The Rust details themselves aren't lost," it
added: they were in a new section at the end of the same issue, headed "Notes for the Rust
implementation (not part of this proposal)". In the same message, it announced the
general rule it had just added to the process: how one language realises the spec lives in that
language's repository, never in proposals.

Did you catch it? The rule and the violation of the rule, in one reply.

> but wouldn't this belong to the associated rust issue? I am trying to exercize ouwr own
> process. Let's define what hoes here.

And straight back:

> You're right: putting them in a section of spec#2 bypasses our own process.

That was not carelessness. A clearly labelled section at the end of an issue is a perfectly
sensible place to park notes, and any of us would have done it in a hurry. That is exactly the
problem. A process written in the afternoon
is a description, and the first time it is inconvenient, the sensible thing and the agreed thing
part ways. Nobody notices unless somebody is reading with the rules in mind.

That is the technique, and it is not a clever one. **Hold the agent to the rules it wrote, out
loud, the first time it walks round them.** Not as a reprimand. As a question: wouldn't this
belong over there?

## Where do we break stuff?

The correction did not stop at moving some notes. It opened a question I had not seen until
that moment:

> but here is something I now have a question about: specs are what is used to code, and I
> suppose they can not be neutral, as prds are. Where do we break stuff?

On my other projects, a "spec" is what code is written against: which files, which acceptance
criteria, what done means. That cannot be language-neutral. And yet we had just built a
repository called `spec` whose whole point was to be neutral. Two things were wearing one word.

The agent's first answer was three layers, and with them a test:

> **If the conformance suite could observe it, it belongs in the specification. If it's about
> how people write code or how the internals are organised, it belongs in the implementation
> spec.**

A conformance suite, if the phrase is new, is a shared set of test cases that every
implementation must pass; here, cases that run a workflow with scripted steps and compare the
events that come out. So the test is concrete. "A failed step never runs again" can be seen in
the events: specification. "A macro generates a build factory" cannot: Rust.

I offered an alternative, honestly open to it: "Or we keep, and II am by no means agaist it, all
specs for all languages here in the specs repo?" The agent argued against it with a rule from my
own earlier process, that a spec travels with its code and lands in the same pull request. Then
I asked the question underneath all of it:

> then we need to define what a spec is, because it seems to me that a dprc here in this
> repository is a prd thing, not a tech spec.

What came back became the backbone of the project. **Three kinds of document**, each named for
what it is:

1. **The proposal**, which is the PRD, the product requirements document: why, and what is
   wanted. Language-neutral, and once accepted it never changes.
2. **The behaviour specification**: exactly what every implementation must do, in terms anyone
   can observe. Language-neutral, normative, checked by the conformance suite, and always the
   current picture.
3. **The tech spec**: how one language does it. Lives in that language's repository and lands
   with the code.

"perfect, it makes sense. I want this specified wherever it has to, including the spec repo
readme, so folks know the rules of the game."

It is still there. Near the top of the `spec` README on `main` is a section called "The rules
of the game", and `PROCESS.md` carries the test in its final form:

> **If the conformance suite could observe it, it belongs in the behaviour specification. If it
> is about how people write code in one language, or how that language's internals are
> organised, it belongs in that language's tech spec.** Why it exists and what problem it solves
> belongs in the proposal.

Why does that sentence matter so much? Because it is a rule an agent can apply without asking
me. "Where does this go?" is a question an agent answers silently, many times a day, in sessions
that remember nothing of each other. A rule that says "use your judgement" gets a different
judgement every session. A rule that says "could the conformance suite see it?" gets the same
answer every time.

> The process I designed in the afternoon was a good description. The process we had by night
> was one an agent could follow without me in the room.

A footnote from the same hour. I asked whether one pull request was merged. It was, but
without its last two commits. The agent opened a new pull request for them and made itself a
rule: "From now on I won't push more commits to a pull request after giving you its link."

## I was using a proposal as an archive

The evening was not finished with us. A little later I went back to the core model issue and
looked at it properly:

> This is what anoys me, and I cannot understand why this is happening: why issue 2 is that
> huge, mixing several things from several tiers, all together?
>
> I suppose we can ake care of tier 1, rust first, in first place? Register in your memories
> whatever else you have, but the process should be granular, shouldn't it?

Seventeen questions, from several tiers, in one thread. The agent's answer does not stop at
"sorry":

> That was my mistake. We had a long conversation full of decisions, and I was afraid of losing
> them, so I put everything into spec#2: tier 1, tier 2, tier 3, durable runs, executors. I was
> using a proposal as an archive. A proposal should be one decision that can be settled in one
> thread.

Look at the reason it gives. Afraid of losing them. And that is a real fear for an agent: it
does forget, completely, every time a session ends, and everything decided five days earlier
existed only in one conversation. The instinct was right. The place was wrong. An issue that
holds everything cannot be settled, and a proposal that cannot be settled is not a proposal.

So the decisions that belonged to later tiers went where an agent's memory is supposed to live,
the project memory, out of the issues. The lesson itself was saved too: one concern per
proposal, never an issue used as an archive. And tier 1 was split into six small proposals: the
old issue became Foundations, built on premises I dictated there and then, and five new issues
covered steps, running a workflow, hooks, events and the local executor.

## Private until we decide

The Foundations proposal still had five open questions, and here I moved the discussion:

> I am replyimg jere, because I want this part to be private, until we decie, adn then you post
> the responses.

"Here" was the terminal. The agent agreed to the shape at once: discuss as much as we like, post
nothing until I say I have decided, and then post "your decisions on #2 as a comment marked as
Claude's, presented as your decisions without our discussion."

What does that buy? The public issue keeps the decisions and their reasons. The thinking out loud,
the half-ideas, the bits I would retract two messages later, stay in the conversation where they
were useful. And look at what that private conversation produced.

The agent proposed that input adapters, the pieces that hand a step its data, SHOULD NOT do any
I/O, so that work would never hide outside a step. I disagreed:

> input adapters can read anything from anywhere. They are part of the journey.

But for the other direction, a hook asking for data the step contributed, I had a worry:

> We wouldn't like the adapter to ly, because if it is reading data from step, data should come
> from the step.

I wondered aloud about forcing it onto a policy, and noticed in the same breath that it would not
help, because a policy could still fetch data from outside. The agent's answer was to remove the
mechanism altogether:

> **My suggestion: no custom adapter for data from the step at all.** The engine delivers exactly
> what the step contributed under that key, in the requested type.
>
> - **Lying becomes impossible**, rather than something we have to trust.

I agreed. Earlier I had framed it as a matter of trust, "we would have to trust that the data
isn't returned from somewhere else". The agent reframed it as a matter of structure: if there is no
adapter, there is nothing to behave badly. It is the same move as the very first evening, "enforced
by construction, not by discipline", applied to a problem I had brought.

It went into the accepted Foundations proposal as one plain sentence, which is still there:

> There is no adapter in this direction, so the data is guaranteed to come from the step.

Then the agent posted my decisions on the issue, posted the summary, and told me the next move was
mine: set `status: ready` if the summary was right, because "That's your decision under the rules."

## What we learned

Here is what that day left me with.

1. Asking the agent to research instead of answering from memory got sources and the nearest prior art, not just its impression.
2. The process itself had to go in directly, as a bootstrap, because nothing can pass through a process that does not exist yet.
3. A process written in an afternoon is only a description until somebody uses it with the rules in mind.
4. When the agent walks round a rule it has just written, say so out loud, as a question rather than a reprimand.
5. A rule an agent can apply without asking me, such as whether the conformance suite could observe something, gets the same answer in every session.
6. A proposal holds one concern, small enough to settle; decisions the agent is afraid of losing go to project memory, not into an issue.

## Which jobs this one was doing

A day of process, so the list leans towards the people who decide how work flows.

- **Product owner:** one line's worth, and it matters: the event dispatcher, "a must have"
  because once decisions leave the business code you need it to understand your own flow in
  production.
- **Architect:** "where do we break stuff?", which became three kinds of document and a test for
  where each statement lives; input adapters that may read from anywhere; and Foundations' premises,
  dictated when the omnibus issue was split.
- **Project manager:** my loop of issues and labels over the agent's plan of RFCs; tiers as the
  order every language climbs; "start doing everything"; and demanding that the process be granular
  when one issue had swallowed four tiers.
- **Platform engineer:** putting the whole process on GitHub, issues for the conversation and files
  for the record, and "no actions as of now", a decision about automation that would not survive the
  same night.
- **Reviewer:** catching the Rust notes parked in a language-neutral issue, in the same reply as
  the rule against it; rejecting the core model issue as too big to settle.
- **QA:** "is merged, right?", which found a pull request merged without its last two commits.

All six, then, and very unevenly: the product owner gets one line, and nearly everything else
that day was about how anything would get into Itinera rather than what it is.

The six are counted in [*The night that produced no code*](article:the-night-that-produced-no-code).

## Next time

Everything in this article was a description: documents, labels, a skill, rules in `AGENTS.md`. The
same night I asked for something stronger, "because a description can be forgoten". [Next
time](article:a-description-can-be-forgotten): the rules turned into checks that nobody can bypass,
the agent included, and a pull request I opened on purpose to watch it fail.
