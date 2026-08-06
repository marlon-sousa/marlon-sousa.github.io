---
title: 'The process came first'
description: 'Seven steps from a decision to a merged pull request, a definition of green that existed before there was anything to be green, and a test strategy designed on night one that decided which work a human would ever have to do.'
pubDate: 'Aug 06 2026'
series: 'engineering-with-ai'
seriesPart: 2
tags: ['ai', 'software engineering', 'testing', 'accessibility', 'rust']
draft: true
---

[Part 1](/blog/the-terminal-i-could-not-build/) ended on a claim: that all six
jobs a team normally spreads across six people were staffed in one conversation,
before `acter` had a line of product code. Product owner, project manager,
architect, platform engineer, QA, reviewer — all mine, all in play that night.

Naming a role is not holding one. This article is the machinery: what the process
actually was, when each gate arrived, and how a test strategy written before any
code decided which work a human would ever have to do.

Same rule as part 1 — every prompt is quoted exactly as I typed it.

## The process, stated plainly

The process was written down that first night and has barely changed. Stated as
a sequence, because that is what it is:

1. **Decide in conversation.** Design and architecture decisions are argued out,
   then written into `DESIGN.md`, `ARCHITECTURE.md` or `ROADMAP.md` and landed on
   `main`. They are not specs; they are the ground the specs stand on.
2. **Mark what is settled.** *"Items marked **Decided** in the docs are settled.
   Do not relitigate them silently; to change one, propose it explicitly and
   update the doc in the same PR that implements the change."* That rule is in
   `CLAUDE.md` from day one, and it is there because a helpful agent will
   otherwise reopen a closed question every session, politely, at your expense.
3. **Write the spec, one per roadmap entry, and agree it before any code.** The
   spec is the implementation contract: acceptance criteria, files touched,
   definition of done. Later, in `screen-readers-mcp`, it also has to enumerate
   every file and class the pull request will add, each with its role and its
   collaborators — so the *decomposition* is reviewed while it is still a
   paragraph.
4. **Then code, in a short pull request, with its tests.** One component, its
   traits, its unit tests. Nothing lands untested.
5. **Then the gate.** CI, on the rulebook: format, lints denied, the full test
   suite.
6. **Then the checks no machine can run** — a manual accessibility pass against
   the spec's checklist, recorded as checkboxes in the pull request body with
   findings written inline, NVDA version, expected against observed.
7. **Then merge**, blocked until every box is ticked.

Step 7 is not a habit. It is `.github/workflows/checklist.yml`, whose job is
named *no unchecked checkboxes*, and it fails the pull request while any box is
unticked. It shipped on 16 July, in PR #3 — the third pull request in the
project's life. And its origin is two prompts, one day apart:

> please, convert that document in to pr body checkboxes.

> document somewhere that checklists must go to rs, not on that document, which
> should probably be removed.

"rs" is "prs". That is what an artifact looks like at the moment it is born: an
irritated instruction to write the rule down where it will be enforced instead of
remembered.

**And the process amends itself in the open.** On day two I asked a
bookkeeping question:

> I am a little curius on the way we manage it: so the specs I approve before the
> pr, so they are inm the pr now, or they are uumcommited?

Which produced commit `947ccc2`, *"Process change: specs travel with their PR,
not landed on main first"* — so a spec and the code it describes can never drift
apart on `main`. Not a quiet drift away from a rule nobody liked. A commit, with
a reason, that you can go and read.

The same thing happened to the board. I wanted a session to be able to start
cold and know what to do:

> Can you document a road map of everything so I can ask next session what should
> we do now and it knows whether it sgould specify, code, or whatever, and we
> track after each pr what is done?

That is commit `26f9b9d`, *"Turn ROADMAP into a status board with a usage
algorithm for sessions"*. The board says, per entry, whether the next step is
writing a spec or implementing one, and the implementing pull request flips its
own entry to Done — so `main` is never wrong about what has landed. That is a
project manager building themselves an instrument, and it took one prompt because
the roadmap already existed to be upgraded.

## Testing was designed, not discovered

The obvious reading of what comes next is that I built a terminal, discovered I
could not test it, and went off to build a tool. That is not what happened, and
the difference is most of the point.

**Most of the code was always going to be tested automatically, and the
architecture is why.** Constructor injection at a composition root. Every
collaborator behind a trait. Hand-written fakes as the default — a
`FakeTransport` replaying a scripted byte stream, because for a terminal the
interesting behaviour *is* the byte stream. That is not decoration. It is what
lets a state machine be tested without a shell, a router without a webview, and a
policy without a screen reader. When I insisted that a controller reach a service
only through a trait, the stated reason was *"so we can test all components in
detail"* — and that sentence is the reason the automated share is as large as it
is.

`ARCHITECTURE.md`'s test strategy is six tiers today, four on the first night,
cheapest first:

1. **Unit and property tests** on the pure core.
2. **Router integration tests** through Tauri's mock runtime, no webview.
3. **Golden transcript tests** — real shell sessions captured as byte fixtures
   and replayed. The document calls this one "the workhorse".
4. **Integration tests** against a real ConPTY, in their own CI job.
5. **End-to-end tests** over WebDriver against the built app, with axe-core
   injected into the running WebView2 so serious violations fail the build.
6. **Accessibility, manual.** And here is the sentence the whole rest of this
   series hangs off: *"automation cannot hear speech, and here the speech is the
   product."*

Five automated tiers, then one that cannot be. Tiers 2 and 5 were not
afterthoughts either — they were specified as their own track while PR #2 was
still open, off the back of a prompt that reads exactly like an engineer noticing
an opportunity:

> see, cinse we are here, we can make somehing else while with fable. I know that
> tauri jave a testable module, where it some how attaches a chrome port or
> whatever. I think we perhaps should explore this and write some integration
> tests, don't you?

They landed as pull requests #4 and #5. Of the first five pull requests in
`acter`, **two are pure test infrastructure** — built before the domain that
would need them.

**And the manual tier was planned as the bottleneck it is.** From the first
night's roadmap, under Principles:

> **UI-first via fake backend.** The frontend depends on the `SessionApi` driving
> port; the first implementation is a scripted fake. Manual NVDA testing — the
> slowest feedback loop in the project — starts immediately and runs
> continuously. Because fake and real service implement the same trait and
> protocol, manually validated UI behavior carries over unchanged at convergence.

That is a build order designed around a human bottleneck, on day one, by someone
who knew exactly where the pain would be. The prompt behind it:

> I am secially worried with the ui part, because getting the screen reader to act
> the right way is going to be hard. Can we perhaps concentrate in this first,
> because I would have to test manually and report back behavior? What do you
> suggest on pr splitting and what to be coed first?

So the two tracks: Track A, the accessibility harness, where the manual loop
lives and starts on PR A1 against a fake backend. Track B, the domain, labelled
in the roadmap *"automated tests only"*.

I could do that manual loop, and I did, and I was good at it. It was never
beyond me. It was also the only part of the system where the feedback loop ran at
human speed, and it sat directly between the agent and knowing whether its work
was right.

Which is the actual reason the second project exists — and it is not "I ran out
of evenings", though that was true too:

**I wanted to be out of the loop until review time.** Not out of the project. Out
of the *inner* loop. If the agent can press the key, hear what the reader says,
and check it against what the spec promised, then it can iterate on its own
mistakes at machine speed and bring me something finished. My evenings should be
spent reviewing and deciding, which are the parts that need me, not being the
instrument that closes somebody else's feedback loop.

That is the project manager and the platform engineer making the same call
together: the human is the slowest component in the pipeline, and the way to fix
a slow component is not to run it harder.

## Choosing which model does which job

One more decision that belongs to this pairing, and it is one I rarely see
written about as engineering rather than as taste.

Different models did different jobs, and which one was routed where was a
deliberate call. Reasoning, design and specification went to the strongest
reasoning models available; implementation against a settled spec went to a
cheaper, faster one; and the strong model was recalled when the implementer got
stuck. From the record, in order:

> pr 0 has been merged. We will implement next on still in this session, then we
> swap models and sessions for next prs.

> for implementation, given the level of what is writen, do you think sonet 5
> would do or better opus?

> opus is back. There is a question the sonnet was habving. Can you inspect and
> respond that?

> Did you augment the specification so sonnet can pick it up again?

Read those four together and the shape is a staffing decision, not a preference.
The second one even asks the agent to help make it — *given the level of what is
written*, is the spec now precise enough that a cheaper model can implement it
correctly? That is a project manager and an engineer deciding the same question
from two sides: what does this task actually require, and what is the cheapest
thing that meets the bar.

The fourth one is the one that makes it work at all. *Did you augment the
specification so sonnet can pick it up again?* Routing between models is only
possible if the artifact between them is good enough to carry the context — which
is the same reason a handoff between two humans needs a written ticket. Part 9,
*The handoff prompt*, is about the document that makes a session boundary cheap
enough to cross on purpose, and routing is what that document buys you.

It has a failure mode, and it produced one of the better gates in the second
project. A model reformatted a batch of files to a style the repository does not
use, which cost real review noise. The interesting part is not which model. It is
what I asked next:

> Is linter imcluded im poe? DeepSeek keeps geting it wrong in aspects like code
> formating.

> if deepseek ever tries to unformat new files, will this be caught?

That second question is the platform engineer's question, and it is the right one.
Not *how do I stop this model doing that*, but *is this class of failure caught by
something that runs every time*. The answer was no, and then it was yes — the gate
itself is part 8, *One definition of green*.

## Why any of this is necessary: extrapolation

All of the above is process, and process is only worth this much effort if
something specific goes wrong without it. Here is what does.

You use an agent for the gap between what you said and what you meant.

That gap is the entire product. If an agent could not extrapolate — if you had to
state every rule exhaustively, every branch, every convention, every error case —
you would not be using an agent. You would be programming. That is precisely what
programming *is*: closing that gap to zero, by hand, in a language a machine
cannot misread.

So extrapolation is the whole value. It is also the whole risk, for exactly the
same reason. An agent with no boundaries does not extrapolate a little. It
extrapolates the architecture, the layering, the naming, the error handling, what
a test is for, whether this belongs in a new file — confidently, because it is
trying to do what you asked and has nothing else to go on.

That is not a defect of the model. It is what a competent human programmer with no
context does. Drop a good engineer into an unfamiliar repository with a one-line
ticket and no conventions and you get the same result: twenty decisions you never
mentioned, each locally reasonable, several wrong for your codebase. We do not
call that a character flaw. We call it missing onboarding.

So the engineering question is never "how do I stop it extrapolating". It is:

> **Where should extrapolation be wide, and where must it be narrow?**

Wide is where you want it: solving the problem, picking the algorithm, finding the
edge case you had not thought of. Narrow is where being wrong is expensive and
hard to see: the architecture, the layering, what "done" means, what may not
change without a conversation.

And that is a decision taken in advance, because by the moment it matters the code
is already written. There is a second half, which took me longer to learn: even
where the boundary exists, the agent has to be able to *tell* whether it is inside
it. It cannot correct what it cannot check. If green is not one command it can
run, it will decide for itself what green means and then believe its own answer.

Which is why the process came first. Not diligence. Arithmetic.

You can say all of this in a prompt, and at the start I did. The trouble is that a
prompt binds one session, and there is always another session. **An artifact binds
every session after it.**

That sentence is the whole thesis of part 4, *The repo is the prompt*, so I will
leave it here as the reason the process exists and take it apart properly there.

## The tool

[screen-readers-mcp](https://github.com/marlon-sousa/screen-readers-mcp) is what
came out of wanting to leave the inner loop. It is an MCP server that gives an AI
agent a real screen reader: the agent presses keys, hears what the reader speaks,
reads what goes to the braille display, and when it gets stuck, asks the human
sitting at the machine.

Three links, each talking only to the next. Your MCP client launches the server
and calls its tools. The server is a single Windows executable that translates
those calls for one connected reader — and never connects on its own initiative;
the agent has to ask. At the far end, an NVDA add-on does the work inside NVDA:
captures speech and braille, presses gestures, answers questions about focus.

Two architect's decisions there, both early and both deliberate. **The halves are
separate programs**, because restarting NVDA is itself something a test may want
to do, and if they were one process the most interesting test you can write would
be the one you cannot. And **nothing leaves the machine**: the bridge listens on a
Windows named pipe or loopback TCP, never a routable address. This is software
that types into your session and reads your screen, so the blast radius is set at
the transport rather than by policy.

And there was a second thought that mattered more than the first. If I was going
to build this at all, it should not be `acter`'s private test rig. Nothing like it
existed. Every NVDA add-on author was running the same manual loop I was, and so
was every developer trying to find out whether their application is usable. The
same tool that unblocks my terminal unblocks all of them.

That changes the arithmetic completely. Weeks spent on a private harness are
overhead charged to one project. The same weeks spent on a general tool are
something a community keeps, and something my own four add-ons can use too.
Part 5, *I stopped building the product to build the tool*, is that decision in
full — what it costs to pause the thing you care about, and how to tell that from
procrastination.

The process came with it, explicitly. There is a commit in `screen-readers-mcp`
that reads *"docs: adopt the acter process — ROADMAP status board,
spec-before-code, checklist merge gate"*. The method was portable, and it was
carried across on purpose rather than reinvented.

## One thing that runs through all six: you do the explaining now

A developer who picks up a card is translating an intent somebody else has
already articulated. That is a real skill, but it is downstream of the
communication. The product owner did the explaining; the card is the artifact of
it.

Work with an agent and there is no card. You do the explaining, in writing,
precisely, to something with no shared history, no memory of the last argument,
and no colleague at the next desk to ask. Vagueness does not get pushed back on —
it gets *implemented*.

It is not a seventh role. It is the medium the other six now travel through, and
it turns out to be load-bearing in a way that reading a card and writing code
never required. Every quote in this article is that: ordinary professional
communication, typed badly, at night.

**But prompts are not the secret**, and I want to be unambiguous, because it is
the most common misunderstanding about this work. Every prompt quoted here was
*followed by an artifact*. The checkbox complaint became a CI job. The bookkeeping
question became a process commit. The worry about manual testing became a build
order and then an entire second repository. A prompt bounds one session. An
artifact bounds every session after it. The effort in both these repositories went
into `CLAUDE.md`, `AGENTS.md`, the specs and the gates — not into prompt craft.
The prompts are how the artifacts got discovered.

## The process was day one. The artifacts kept sharpening.

I want to be careful not to make this sound cleaner than it was.

All six roles were in play from that first conversation, and the process has been
recognisably the same one ever since. What changed is how good the instruments
got. `screen-readers-mcp` has twenty-three numbered specifications now; it had
one. `AGENTS.md` grew from a page into the development manual of the project. The
definition of green existed as CI on day one — and much later became a single
command the agent itself can run, because green that only CI can reach is green
the agent has to guess at. That last move is part 8, *One definition of green*.

That is what a working process looks like: version-controlled, argued with, and
changed on evidence rather than quietly abandoned.

## And it still was not enough

Everything above is real, most of it was decided before any code existed, and on
the third of August I still sat in front of a computer that had gone completely
silent — with no way to tell a working run from a hung one, because I am blind and
both of them sound like nothing.

That is where part 3, *You are now the whole team*, starts. It goes through the
six roles again, and for each one: the mechanism that already existed, what got
through it anyway, how it was caught, and what got added afterwards. The failures
are not the argument. The mechanisms are. The failures are what got through them,
and what each one cost before the gap closed.
