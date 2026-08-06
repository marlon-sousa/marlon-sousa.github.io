---
title: 'You are now the whole team'
description: 'Six roles, six mechanisms, and the six things that got through them anyway. Every complaint about agentic coding is the signature of a role nobody was filling — and the proof that a role is filled is the artifact, not the absence of failure.'
pubDate: 'Aug 06 2026'
series: 'engineering-with-ai'
seriesPart: 3
tags: ['ai', 'software engineering', 'accessibility']
draft: true
---

On the third of August I sat in front of a computer that had gone completely
silent.

I am blind. I was testing a tool I had built that lets an AI agent drive NVDA,
the screen reader I use for everything, so that accessibility tests can run by
themselves instead of by hand. It has a mode called *silent*, where the reader's
speech is suppressed at the filter so it does not reach me — the agent needs
deterministic capture, and my headphones would otherwise be full of the machine
talking to itself.

The agent had opened a session and then gone off to do several minutes of work
that did not involve the reader at all. Shell commands. Timing measurements.
Perfectly reasonable work.

From where I sat, none of that existed. My computer had simply stopped speaking.

So I hit NVDA+control+shift+b — the gesture that kills the bridge outright. It
is the panic button. After it fires, nothing comes back until NVDA is restarted,
because the plugin only reads its start flag at load. I hit it twice that day.

The agent was not malfunctioning. It was working hard, on the right things, and
the entire time it was busy it never occurred to it that being busy is not the
same as being harmless. That is not a bug in the model. It is a job nobody was
doing.

## What this is about, and what it is not

With AI, anyone can code. That is true, and I have no interest in arguing with
it. If you are automating a spreadsheet, scripting something around the house,
building a thing for yourself — that is the whole story, it is a good story, and
none of what follows applies to you.

This is about the other case: **software other people depend on, which has to be
maintained by somebody who was not there when it was written.**

There is also a term that gets attached to this kind of work, and it inverts the
meaning of it. *Vibe coding* has a real and useful definition: you do not read
the output. You accept the diffs, you do not look, you let it ride. That is a
legitimate mode for throwaway work. It is also the precise opposite of what I am
describing.

> Vibe coding is defined by what you do not look at. This is defined by what you
> refuse to leave unspecified.

I am not going to make a demand of anyone about vocabulary. I would rather leave
twenty-three written specifications, a cross-language conformance test tier and
a merge gate that blocks on an unchecked box sitting on the table, and let you
file the work wherever you think it belongs.

## AI didn't remove the roles. It removed the other people.

Writing code was never the bottleneck in professional software. The roles around
the code were. When an agent arrives, those roles do not disappear — the
*people* do.

[Part 1](/blog/the-terminal-i-could-not-build/) named the six, and this article
uses them throughout: **the product owner**, who decides what is worth building;
**the project manager**, who decides the order and the cost; **the architect**,
who sets the boundaries; **the platform engineer**, who decides what "green"
means and makes it mechanical; **QA**, who decides what counts as proof; and
**the reviewer**, who decides whether the work and the claims about it are true.

A senior engineer on a functioning team can pick up a card and implement it
beautifully. That is a real skill. It also works *because* those five other jobs
were done around them. Work alone with an agent and every one of them is still
required and all of them are yours. What the agent took over was the typing,
which was the cheapest part of the whole arrangement.

Which leads to a claim that runs directly against the popular one: **doing this
well demands more maturity from a single professional, not less.**

## Every complaint is a missing role

This is why so much agentic work disappoints. The complaints are almost all
accurate observations with a misdiagnosed cause.

It got expensive. It produced bugs. It built the wrong thing. It rotted. None of
those are evidence that the tool does not work. Each is the signature of a
specific role nobody was filling. The roles are not virtues to aspire to — they
are load-bearing. Remove one and a particular, predictable thing breaks.

But I want to be careful about what the evidence here actually is, because it is
easy to read the rest of this article backwards.

**The proof that a role was staffed is the mechanism, not the absence of
failure.** Twenty-three specifications written before their code. A wire module
copied byte-for-byte so two languages cannot drift apart on the contract. A CI
job that refuses to merge while a checkbox is unticked. Those exist, they are in
the repositories, and you can go and read them.

So each of the six below gets four beats, in this order:

1. **What was already in place** — the mechanism that role had built.
2. **What got through it anyway.**
3. **How it was caught** — usually before it shipped, sometimes not.
4. **What was added afterwards.**

That order is the argument. A list of my mistakes would prove nothing at all;
mistakes are free, and everyone has them. What is worth reading is a strong
system, the specific thing that beat it, and the gate that now stands where the
hole was.

## 1. The product owner

**Already in place.** No code before a spec, and the spec has to enumerate every
file and class the pull request will add, each with a one-line role and its
collaborators. Twenty-three of them in `specs/`, agreed in conversation, riding
the branch of the pull request that implements them so the two can never drift
apart on `main`.

**What got through.** Spec 0023's first draft. The diagnosis in it was correct
and remains correct: `pressGesture` returns `{ ok: true }`, an agent reads that
as *it worked*, and what it actually means is only *the reader accepted the
input*. Measured on 30 July, the handler returns about a millisecond before NVDA
speaks — so at the instant the result is written, the dialog has not opened and
the caret has not moved. From that true diagnosis the spec proposed a new wire
command, `waitForFocus { role?, name?, appModule? }`. Technically sound.
Testable. Cheap to build.

**How it was caught.** Not by arguing about the API. By narrating the
keystrokes:

> Let's take the console for example: as a user, what would I do? I would press
> ctrl+NVDA+z. I would listen to the window title. I would then press NVDA+tab
> to see if I am at an edit, because my main goal would be to type something.

Every step is a gesture, every answer is speech, and nothing in it names a role
string. A real user does not know that the control they are focused on is an
`EDITABLETEXT`. And the whole point of the product is that the agent stands in
for a user: an agent that orients itself by reading the accessibility tree is
testing the platform API, not the screen reader — and those two disagree exactly
where it matters most, on the control that is perfectly exposed and announced as
nothing.

**What was added.** The spec was reframed the same day, and its own header now
records the reversal: *"The first draft of this spec was called dispatch is not
effect and recommended a new waitForFocus command. The diagnosis survived
review; the remedy did not."* What shipped instead was **zero protocol change** —
a `screenreader://guidance` resource and four rewritten tool descriptions that
say the true thing at the point of failure. Plus a standing design rule: before
proposing a primitive, walk the user's keystrokes for the scenario and check
that every argument it demands is something a user would actually know.

## 2. The project manager

**Already in place.** `ROADMAP.md` as a status board with a written algorithm
for choosing the next step, so a fresh session does not have to guess. Lanes,
with at most one open pull request per lane. Short pull requests. The
implementing PR flips its own board entry to Done, so `main` is never wrong
about what has landed.

**What got through.** None of that watches what a session *costs*. The agent was
burning turns on `__pycache__` directories and failed Python invocations —
running on a machine that was quietly misconfigured, and reporting cheerfully
throughout. It never complained, because it cannot. A human engineer stuck on a
bad setup tells you within the hour.

**How it was caught.** By noticing the shape of the traffic rather than its
content:

> I suspect lots of tokens are being spent for no result back.

**What was added.** `poe doctor` — a command whose only job is to ask whether
this machine is able to work this repository — and the rule that every other
task depends on a fast subset of it and aborts with a non-zero exit if it fails.
Not advice. Enforcement. On its first run it found two real problems on my own
machine: both project virtualenvs had stale console-script trampolines, whose
error message names neither the tool nor the fix, and a missing `markdown` that
would have failed an add-on build late and confusingly.

It also did something I did not expect, which is the part I would keep if I
could only keep one. It proved a documented warning *stale*. Both `AGENTS.md`
and `CONTRIBUTING.md` warned that bare `python` was broken in this project. It
resolves to 3.13.12 and works. The check is deliberately written to keep
reporting that, so the warning gets retired rather than cargo-culted forward by
every future session that reads the file.

The larger call this role made is the subject of a later article: pausing the
product I actually cared about, for weeks, to build the tool that tests it.

## 3. The architect

**Already in place.** Hexagonal architecture on both sides, and a four-word
vocabulary that every class has to fit: **port**, **controller**, **entity**,
**adapter**. One role each, with the rule stated as *if you cannot name a new
class's role, it is in the wrong place*. Written into `AGENTS.md` with a table
and a directory layout, before the code existed.

**What got through.** The vocabulary was not enough on its own, and it failed in
the way vocabularies fail — everything was legal.

- `Session` was named a controller, which was correct, and then quietly did two
  jobs: session lifecycle *and* a flat dispatch table for every command on the
  wire. Each of those commands is really its own controller.
- `SessionContext` was labelled an adapter. It does no IO at all. It is a
  parameter object, which is a perfectly good thing to be, and calling it an
  adapter meant the label had stopped carrying information.

Neither is a bug. Both are the beginning of the thing everyone means by
*it rotted*: each local decision defensible, the whole gradually incoherent, and
nobody notices until it is too big to review.

**How it was caught.** In the spec conversation, before any of it was written —
because a rule had landed a few commits earlier requiring specs to enumerate
every file and class with its role and its collaborators. That turns
decomposition into something you review as *text*, at the point where changing
your mind costs a paragraph.

**What was added.** Commit `fce9d1a`, *"docs: specs must include the class/file
layout (roles + collaborators)"*, marked **Decided** in `AGENTS.md` — with both
mistakes written into the rule by name, so a session reading it in six months
can see what it is for rather than obeying it blindly. And the structure the
review produced: per-command work lives in `domain/controllers/commands/`, one
handler per wire command, one file each, mirrored one-for-one by a test.
Handlers see only a `SessionContext`, never the `Session`, so a handler is
unit-tested with no session and no run loop at all. The dispatch policy is
declared on the handler as class attributes rather than special-cased in the
loop, so there is exactly one loop, with no `if cmd == ...` in it.

## 4. The platform engineer

**Already in place.** `uv run poe dev`. One command, about a minute, the whole
thing — the same checks CI runs, in CI's order. Nothing is done, working, or
verified until it has passed *and the agent ran it*. The reason is written into
`AGENTS.md` in the best sentence in the repository:

> Reporting success on a subset is the single most expensive mistake made in
> this repo, because the subset is always chosen by the same reasoning that
> wrote the bug.

**What got through.** Two things, and neither of them was a lie anyone told.

- `poe lint` had always claimed *"ruff check + format check"* in its own help
  text, and had never actually run `ruff format --check`. And `poe ci` never ran
  `lint` at all, so even the half that worked was not reached by the gate. PR
  #46 added a dozen space-indented files to a tab-indented repository and
  nothing objected.
- Subtler and much more expensive: `.mcp.json` spawns
  `server/screenreader-mcp.exe`. Edit the Go server, then drive the MCP tools,
  and you are testing the *old* server against the *new* bridge. The symptom is
  a field simply missing from a result — which reads as "the bridge did not send
  it", not "your binary predates it". That is exactly how a missing
  `bridgeVersion` went unnoticed through an entire live checklist.

**How it was caught.** The first by a human reading a diff. The second by a
field that should have been there and was not — and only after a whole checklist
had been run against a stale binary, which is to say after the expensive part
was already spent.

**What was added.**

- The lint rule set is now *chosen* rather than inherited. Neither project
  declared `select`, so both enforced whatever the installed ruff happened to
  default to — and that default has widened across releases, meaning a version
  bump could change what the repository enforces without a line of the
  repository changing. Eight families are listed explicitly, and four are
  deliberately left out with the reason recorded at the config: naming, because
  the package is `nvdaMcpBridge`, camelCase per NVDA's own convention;
  blind-except and bandit, because teardown paths catch broadly on purpose so
  that one failing stop step cannot skip the ones after it; and timezone-aware
  datetimes, because transcript stamps are local by design.
- `shared/` gets the identical set, because `protocol.py` is copied into the
  add-on by the build — the same bytes are linted by two projects and must not
  be able to pass one and fail the other.
- `poe doctor` now fails when the server binary is older than any `server/*.go`.
  And `poe dev` *repairs* that rather than reporting it: its first step is
  `redeploy --if-stale`, a no-op when the binary is current. One definition of
  stale, `doctor.stale_server_binary()`, which the redeploy script imports
  rather than restating — so the two cannot drift into disagreeing about the
  same tree.
- The CI workflow and the local task list, which had been maintained by hand and
  drifted in both directions, are now paired one-to-one. Before that, `poe ci`
  had grown a task the workflow never ran, and two checks existed *only* in the
  workflow — so no developer could run them locally and the first sign of
  failure was a red pull request.

## 5. QA

**Already in place.** This was the first mechanism in the whole record, and it
came from `acter` rather than from the tool. Every user-facing pull request ends
with a manual accessibility checklist in its body: one item per check, findings
written inline on the item — NVDA version, expected against observed. And
`.github/workflows/checklist.yml`, whose job is named *no unchecked checkboxes*,
fails the pull request while any box is unticked. It shipped on 16 July, in PR
#3, and moved across to `screen-readers-mcp` unchanged.

**What got through.** Two holes, one procedural and one that hurt a person.

- On PR #48 the ticked checklist went into the spec file, and the pull request
  body had none. Which passes CI perfectly: there are no unchecked boxes if
  there are no boxes. The gate was measuring the wrong document.
- The live-NVDA tests press gestures, open the Run dialog, type into whatever
  currently has focus, and change the reader's configuration — on the machine
  you are sitting at. They were harmless only by accident: they skip when
  nothing is listening on the pipe. So nobody noticed until a developer ran the
  suite with their own NVDA and bridge running and had their screen reader
  commandeered mid-task. For a sighted developer that is a nuisance. For a blind
  one it is losing control of the machine.

**How it was caught.** The first in review, by me, before merging:

> I want these checkboxes on the PR body, as we have been doing so far. You
> always get that wrong.

*Always* — which tells you it was not the first time, and that a rule written
once in a long document had not been enough. The second was caught by happening
to somebody.

**What was added.** The placement rule, written into `AGENTS.md` as **Decided**,
with the reasoning attached: the spec keeps the evergreen list of what must be
checked; the pull request body carries the record of one run, because that is
where a reviewer decides to merge and it is what the CI job actually reads. Plus
the rule for the case the gate cannot express — an item that genuinely was *not*
run cannot be an unchecked box, because CI would block the merge, and must not
be ticked either. It goes in as a bolded **Not run:** paragraph with the reason.
And the live tests are now marked and excluded from the default suite by
configuration, so running them is an explicit act rather than a side effect of
running the tests.

## 6. The reviewer

**Already in place.** I read everything. Specs are agreed in conversation before
any code, the pull request is judged against its spec, nothing lands untested,
and the pull requests are deliberately short so that reading them is possible.

**What got through.** Spec 0022, and the failure is worth spelling out because
every observation in it was correct.

On 1 August, in the middle of another entry's live checklist: `connect_reader`
was called and succeeded, returning the reader identity and the full capability
list. The server emitted `tools/list_changed`, exactly as designed. The client
never re-listed. Every capability-gated tool stayed invisible for the rest of
the session, and a direct call by name returned "No such tool available" —
across a turn boundary, so not a caching artefact.

All true. The conclusion drawn from it — *this client does not support
`tools/list_changed`* — was false. An entire specification got written on that
premise, and a live checklist was spent driving around a problem that was not
there.

There was a smaller one the same day, and it is the cleaner illustration. A
failure to type into NVDA's Python console was explained as Windows UIPI
blocking input to a process running with UIAccess. Plausible, specific,
mechanism-shaped. It went into a code comment and a commit message as fact. It
was wrong — the same call failed identically against plain Notepad.

**How it was caught.** By asking why one more time than felt necessary. UIPI
died to the control that would have exonerated it, which took about a minute:
try it against something with no UIAccess at all. Spec 0022's premise died to
four independent lines of evidence, including reading the SDK's own `initialize`
handler to confirm the server declares the capability correctly, and counting
370 successful gated calls across five earlier sessions.

The real cause was ours. `poe redeploy` kills every `screenreader-mcp.exe` — the
client's own included. The client transparently respawns one on the next call
and never re-lists that server again for the rest of the session. We broke the
instrument we were measuring with, and then measured with it.

**What was added.** Commit `f301de1`, *"docs: 0022's premise was wrong — the
redeploy severs the tool surface, not the client"*. The spec was corrected in
place rather than quietly deleted, and it now opens with **"Read the diagnosis
first."** A standing rule in `AGENTS.md`: a redeploy severs the gated tools, so
ask the maintainer for a reconnect, every time — because only the human can run
that command. And the rule with the widest reach of anything in this article:

> **Measure a cause before naming it.** A plausible cause recorded as a measured
> one is worse than no comment at all.

## Sit on that last one

Reviewing syntax is a skill you already have. **Auditing reasoning is the new
one.**

An agent's output is fluent by construction, which means plausibility carries no
information whatsoever. It is not a signal you can use. The question stops being
*is this code correct* and becomes *is the story I have just been told about the
world true* — and the second question is much harder, because a wrong answer to
it arrives sounding exactly like a right one, complete with a mechanism, a
citation and a confident tone.

That is what decides whether your software is correct rather than merely
convincing. And it is the reason a repository full of gates is still not enough:
every mechanism in this article checks the code. None of them checks the
explanation.

## So yes — it takes seniority

Within the scope I set at the top, the uncomfortable answer is yes. Building
professional software this way requires seniority, and I am not going to soften
that.

But the obvious reading of it is wrong in an interesting way.

> Seniority is necessary. The usual kind is not sufficient.

A senior individual contributor who has always had a product owner shaping the
card, a project manager holding the budget and a platform team defining green is
senior by title and narrow across the org chart. And it is exactly those missing
roles that agentic work concentrates onto one person. Which may be why some of
the people most confident that AI demands *less* skill are the ones whose
seniority was quietly scaffolded by a team they had stopped noticing.

The requirement is not "be senior first". It is:

> **Be senior across more of the org chart than your job description ever
> required.**

And that is learnable, which is the part that keeps this from being a velvet
rope. Read the six sections above in order and the shape is obvious: the roles
were staffed from the first conversation, and every mechanism in them still had
to be built at the moment its absence cost something — the doctor after the
wasted turns, the lint rule
set after a dozen files landed in the wrong indentation, the announce rule after
I hit the panic button, which I had to write twice because the first version was
not specific enough and I hit it again.

Working this way teaches you the roles you are missing, for the blunt reason
that there is no team to absorb their failures. Nothing gets quietly caught by
somebody else. It arrives at your desk, with your name on it, in an evening you
had planned to spend on something else.

You get handed all six roles whether you are ready or not. Writing things down
is how one person holds them.

## On using help

Only now, after all of that, is it worth saying the obvious thing.

Using help to code, to reason, or to decide is not a deficiency. It is a
strength — **when the results are better.** Everything above is what makes that
conditional true.

Engineering has always been tool-amplified. Compilers, type checkers, linters,
continuous integration. Nobody argues that a person using a compiler is not a
real programmer. The objection to agents is the same objection one rung further
up, and it has the same answer.

I have a particular reason to be comfortable with this.

As a person with disabilities, I learned not to feel worse or weaker because I
have to ask for help crossing a busy street. My life has gone on without that
being an argument, and so has the life of the person who helped me. I also wrote
base C++ code that many of those same people use every day when they open their
internet bank.

They help me. I help them. Everyone wins. I am not fighting anyone for
protagonism.

It is the same with an agent. It helps me write code, it helps me catch bugs, it
helps me reason. I am not worse for using it. **I would be worse if, to protect
my ego, I refused it** — and shipped software that costs more and is less
secure, paid for by the people I work with, and by the users of my open-source
tools still waiting for the features they asked for.

That is the case for taking this seriously.

Six roles, six mechanisms, and six things that got through them anyway. Look at
what actually closed each of those gaps and none of it was a better prompt. It
was a rule in a file, a gate in CI, a definition of stale that two scripts share
so they cannot disagree. That is part 4, *The repo is the prompt*: why an agent
needs boundaries at all, why a prompt is the wrong place to keep them, and what
happens to your repository when you accept that it — and not your instructions —
is what the agent actually reads.
