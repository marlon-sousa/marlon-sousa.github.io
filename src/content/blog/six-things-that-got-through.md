---
title: 'Six things that got through'
description: 'Every mechanism in the previous six articles, and the six things that beat them anyway — the wrong remedy for a right diagnosis, the machine that never complains, the gate that lied about itself, and the rule I was proudest of, whose hole an agent found and was entirely right about.'
pubDate: 'Aug 30 2026 23:00'
series: 'you-are-now-the-whole-team'
seriesPart: 7
tags: ['ai engineering', 'ai', 'software engineering', 'rust', 'accessibility']
draft: false
---

[Last time](article:an-hour-a-day) I put numbers on all of it: 191 commits across
two repositories, an hour and a half of real work on the days I worked, not one
revert in any of it, and an afternoon in which a machine that had never built a
line of this was ready to work in nine minutes.

That is six articles of things going right, and I have been aware for a while that
it is starting to read like an advertisement.

So this one is the correction, and it is not a gesture. It is the list of
everything that beat the mechanisms — and it starts with one that is not even on
the list.

On the third of August I sat in front of a computer that had gone completely
silent.

I am blind. I was testing the bridge that lets an agent drive NVDA, the screen
reader I use for everything. It has a mode called *silent*, where the reader's
speech is suppressed at the filter so it never reaches me — the agent needs
deterministic capture, and my headphones would otherwise be full of a machine
talking to itself.

The agent had opened a session and then gone off to do several minutes of work
that did not involve the reader at all. Shell commands. Timing measurements.
Perfectly reasonable work.

From where I sat, none of that existed. My computer had simply stopped speaking.

So I hit NVDA+control+shift+b — the gesture that kills the bridge outright. It is
the panic button. After it fires nothing comes back until NVDA is restarted,
because the plugin only reads its start flag at load. I hit it twice that day.

The agent was not malfunctioning. It was working hard, on the right things, and
the entire time it was busy it never occurred to it that **being busy is not the
same as being harmless.**

That is the one that made me start keeping a list, and I will come back to it at
the end, because what it eventually became is the best answer I have to everything
in between.

## What this list is, and what it is not

Six articles have now described mechanisms. [Part
two](article:the-terminal-i-could-not-build) named the six roles. [Part
three](article:the-gap-between-what-you-said-and-what-you-meant) built the toll
booth. [Part four](article:the-night-that-produced-no-code) counted what a night
of documentation bought: 49 pull requests later, four documents that still
describe the code. [Part five](article:conditions-not-instructions) showed the
five moves that produce them. [Part six](article:an-hour-a-day) measured the lot.

**The proof that a role is staffed is the mechanism, not the absence of failure.** Every one of those
mechanisms was built at the exact moment its absence cost something. Which means
the interesting artifact is not the mechanism. It is the thing that beat it.

Each of the six below gets four beats, in this order:

1. **What was already in place** — the mechanism that role had built.
2. **What got through it anyway.**
3. **How it was caught** — usually before it shipped, once not.
4. **What was added afterwards.**

That order is the argument. A list of my mistakes would prove nothing at all;
mistakes are free and everybody has them. What is worth reading is a strong
system, the specific thing that beat it, and the gate that now stands where the
hole was.

One filter, before we start. None of these is *an agent wrote a bug and review
caught it*. That happens constantly, it is what review is for, and it is boring.
Every item here is one where each step was defensible and the result was wrong
anyway.

## 1. The specification that was right about the problem and wrong about the fix

**Already in place.** No code before a spec, and the spec has to enumerate every
file and class the pull request will add, each with a one-line role and its
collaborators. There are 47 of them in `specs/` today, agreed in conversation,
riding the branch of the pull request that implements them so the two can never
drift apart on `main`.

**What got through.** Spec 0023's first draft, which was called *dispatch is not
effect*.

Its diagnosis was correct and remains correct. `pressGesture` returns
`{ ok: true }`, an agent reads that as *it worked*, and what it actually means is
only *the reader accepted the input*. Measured on 30 July, the handler returns
about a millisecond before NVDA speaks — so at the instant the result is written,
the dialog has not opened and the caret has not moved.

From that true diagnosis the spec proposed a new wire command:
`waitForFocus { role?, name?, appModule? }`. Technically sound. Testable. Cheap
to build. It would have been a good primitive for the wrong product.

**How it was caught.** Not by arguing about the API. By narrating the keystrokes:

> Let's take the console for example: as a user, what would I do? I would press
> ctrl+NVDA+z. I would listen to the window title. I would then press NVDA+tab to
> see if I am at an edit, because my main goal would be to type something.

Every step there is a gesture and every answer is speech, and nothing in it names
a role string. A real user does not know that the control they are focused on is
an `EDITABLETEXT`. And the whole point of the product is that the agent stands in
for a user: an agent that orients itself by reading the accessibility tree is
testing the platform API, not the screen reader — and those two disagree exactly
where it matters most, on the control that is perfectly exposed and announced as
nothing at all.

**What was added.** The spec was reframed the same day, and its own header now
records the reversal:

> The first draft of this spec was called *dispatch is not effect* and
> recommended a new `waitForFocus` command. **The diagnosis survived review; the
> remedy did not.**

What shipped instead was **zero protocol change** — a `screenreader://guidance`
resource and four rewritten tool descriptions that say the true thing at the
point of failure. Plus a standing design rule: before proposing a primitive, walk
the user's keystrokes for the scenario and check that every argument it demands
is something a user would actually know.

And then something I did not arrange. On 15 August an external agent, driving a
third-party application through the bridge with no knowledge of this spec, hit
Part 1's failure exactly — assumed a mode would switch, got wrong answers, and
concluded the application was at fault. Independent corroboration of a diagnosis
is rare enough. But its report also found **the one hole in the fix**: the
guidance tells an agent to know where it is before typing, and never says how to
bring the application under test to the foreground. The doctrine was amended the
next day.

That is twice in this article that an agent will find the hole in a rule. It is
not the last time.

## 2. The machine that never complains

**Already in place.** `ROADMAP.md` as a status board with a written algorithm for
choosing the next step, so a fresh session does not have to guess. Lanes, with at
most one open pull request per lane. Short pull requests. The implementing pull
request flips its own board entry to Done, so `main` is never wrong about what has
landed.

**What got through.** None of that watches what a session *costs*.

The agent was burning turns on `__pycache__` directories and failed Python
invocations — running on a machine that was quietly misconfigured, and reporting
cheerfully throughout. It never complained, because it cannot. A human engineer
stuck on a bad setup tells you within the hour, usually with feeling.

**How it was caught.** By noticing the shape of the traffic rather than its
content:

> I suspect lots of tokens are being spent for no result back.

**What was added.** `poe doctor` — a command whose only job is to ask whether this
machine is able to work this repository — and the rule that every other task
depends on a fast subset of it and aborts with a non-zero exit if it fails. Not
advice. Enforcement.

On its first run it found two real problems on my own machine: both project
virtualenvs had stale console-script trampolines, whose error message names
neither the tool nor the fix, and a missing `markdown` that would have failed an
add-on build late and confusingly.

It also did something I did not expect, and it is the part I would keep if I could
only keep one. **It proved a documented warning stale.** Both `AGENTS.md` and
`CONTRIBUTING.md` warned that bare `python` was broken in this project. It
resolves to 3.13.12 and works. The check is deliberately written to keep reporting
that, so the warning gets retired rather than cargo-culted forward by every future
session that reads the file.

A document that only ever accumulates is a document that eventually lies. This is
the only mechanism in either repository that takes things *out*.

## 3. A vocabulary in which everything was legal

**Already in place.** Hexagonal architecture on both sides, and a four-word
vocabulary that every class has to fit: **port**, **controller**, **entity**,
**adapter**. One role each, with the rule stated as *if you cannot name a new
class's role, it is in the wrong place*. Written into `AGENTS.md` with a table and
a directory layout, before the code existed.

Part four audited the terminal's version of that rule and found 89 of 96 modules
declaring their role in their own first line. This is the same rule, in the other
repository, and here is where it did not hold.

**What got through.** The vocabulary was not enough on its own, and it failed in
the way vocabularies fail — everything was legal.

- `Session` was named a controller, which was correct, and then quietly did two
  jobs: session lifecycle *and* a flat dispatch table for every command on the
  wire. Each of those commands is really its own controller.
- `SessionContext` was labelled an adapter. It does no IO at all. It is a
  parameter object, which is a perfectly good thing to be, and calling it an
  adapter meant the label had stopped carrying information.

Neither is a bug. Neither would fail a test, or a linter, or a careful reading of
the diff it arrived in. Both are the beginning of the thing everybody means by
*it rotted*: each local decision defensible, the whole gradually incoherent, and
nobody notices until it is too big to review.

**How it was caught.** In the spec conversation, before any of it was written —
because a rule had landed a few commits earlier requiring specs to enumerate every
file and class with its role and its collaborators. That turns decomposition into
something you review as *text*, at the point where changing your mind costs a
paragraph rather than a refactor.

**What was added.** Commit `fce9d1a`, on 18 July: *"docs: specs must include the
class/file layout (roles + collaborators)"*, marked **Decided** in `AGENTS.md` —
with both mistakes written into the rule by name, so a session reading it in six
months can see what it is for rather than obeying it blindly:

> a controller doing two jobs (`Session` was session lifecycle *and* a flat
> command dispatcher — each command is really its own controller); a holder
> mislabelled (`SessionContext` is a parameter object, not an adapter — it does
> no IO).

And the structure that review produced: per-command work lives in
`domain/controllers/commands/`, one handler per wire command, one file each,
mirrored one-for-one by a test. Handlers see only a `SessionContext`, never the
`Session`, so a handler is unit-tested with no session and no run loop at all. The
dispatch policy is declared on the handler as class attributes rather than
special-cased in the loop, so there is exactly one loop, with no `if cmd == …` in
it.

## 4. The gate that lied about itself

**Already in place.** `uv run poe dev`. One command, about a minute, the whole
thing — the same checks CI runs, in CI's order. Nothing is done, working, or
verified until it has passed *and the agent ran it*. The reason is written into
`AGENTS.md` in the best sentence in the repository:

> Reporting success on a subset is the single most expensive mistake made in this
> repo, because the subset is always chosen by the same reasoning that wrote the
> bug.

**What got through.** Two things, and neither of them was a lie anybody told.

`poe lint` had always claimed *"ruff check + format check"* in its own help text,
and had never actually run `ruff format --check`. And `poe ci` never ran `lint` at
all — so even the half that worked was not reached by the gate. Pull request #46
added a dozen space-indented files to a tab-indented repository and nothing
objected.

The second is subtler and was much more expensive. `.mcp.json` spawns
`server/screenreader-mcp.exe`. Edit the Go server, then drive the MCP tools, and
you are testing the *old* server against the *new* bridge. The symptom is a field
simply missing from a result — which reads as "the bridge did not send it", not
"your binary predates it". That is exactly how a missing `bridgeVersion` went
unnoticed through an entire live checklist.

**How it was caught.** The first by a human reading a diff. The second by a field
that should have been there and was not, and only after a whole checklist had been
run against a stale binary — which is to say, after the expensive part was already
spent.

**What was added.** The lint rule set is now *chosen* rather than inherited, and
the config says why in the file:

> CHOSEN, not inherited. Ruff's default selection has widened across releases —
> 0.16 turns on bandit (S), blind-except (BLE), datetimez (DTZ) and pep8-naming
> (N) among others — so a project with no `select` is enforcing whatever the
> installed ruff happens to ship, and a version bump silently changes the rules.

Eight families are listed explicitly. Five are deliberately left out with the
reason recorded beside them: naming, because the package is `nvdaMcpBridge` and
camelCase is NVDA's own add-on convention; blind-except and bandit, because
teardown paths catch broadly on purpose so that one failing stop step cannot skip
the ones after it; timezone-aware datetimes, because transcript stamps are local
by design; and pylint's refactor opinions, which are not this project's house
style.

`shared/` carries the identical eight, under its own lint gate — because
`protocol.py` is copied into the add-on by the build, so the same bytes are linted
by two projects and must not be able to pass one and fail the other.

And for the binary: `poe doctor` now fails when the server binary is older than
any `server/*.go`, while `poe dev` **repairs** that rather than reporting it — its
first step is `redeploy --if-stale`, a no-op when the binary is current. One
definition of stale, which the redeploy script imports rather than restating, so
the two cannot drift into disagreeing about the same tree.

## 5. Every observation was true. The conclusion was false.

**Already in place.** I read everything. Specs are agreed in conversation before
any code, the pull request is judged against its spec, nothing lands untested, and
the pull requests are deliberately short so that reading them is possible at all.

**What got through.** Spec 0022 — and it is worth spelling out, because every
observation in it was correct.

On 1 August, in the middle of another entry's live checklist: `connect_reader` was
called and succeeded, returning the reader identity and the full capability list.
The server emitted `tools/list_changed`, exactly as designed. The client never
re-listed. Every capability-gated tool stayed invisible for the rest of the
session, and a direct call by name returned "No such tool available" — across a
turn boundary, so not a caching artefact.

All true. The conclusion drawn from it — *this client does not support
`tools/list_changed`* — was false. An entire specification got written on that
premise, and a live checklist was spent driving around a problem that was not
there.

There was a smaller one the same day, and it is the cleaner illustration. A
failure to type into NVDA's Python console was explained as Windows UIPI blocking
input to a process running with UIAccess. Plausible, specific, mechanism-shaped.
It went into a code comment and a commit message as fact. It was wrong — the same
call failed identically against plain Notepad, which has no UIAccess at all.

**How it was caught.** By asking why one more time than felt necessary.

UIPI died to the control that would have exonerated it, which took about a minute:
try it against something with no UIAccess. Spec 0022's premise died to four
independent lines of evidence, including reading the SDK's own `initialize`
handler to confirm the server declares the capability correctly, and counting 370
successful gated calls across five earlier sessions.

The real cause was ours. `poe redeploy` kills every `screenreader-mcp.exe` — the
client's own included. The client transparently respawns one on the next call and
never re-lists that server again for the rest of the session. **We broke the
instrument we were measuring with, and then measured with it.**

**What was added**, and this is the beat I like most in the whole article, because
it happens in two stages.

First, commit `f301de1` on 2 August: *"docs: 0022's premise was wrong — the
redeploy severs the tool surface, not the client"*. The spec was corrected in
place rather than quietly deleted, and it now opens with **"Read the diagnosis
first."** Alongside it, a standing rule in `AGENTS.md`: a redeploy severs the gated
tools, so ask the maintainer for a reconnect, every time — because only a human
can run that command.

Then, on 19 August, **that rule was retired.** In the file's own words:

> This rule used to be the loudest in the file, and spec 0022 (option (c),
> 2026-08-19) retired it: every tool is advertised from startup, nothing is
> retracted when a session ends, and no `tools/list_changed` is emitted because
> nothing changes.

The first fix was a rule somebody had to remember. The second removed the thing
the rule was protecting. And the retired rule's cost is still written underneath
it — the tool list freezing at the ungated four while `connect_reader` went on
succeeding with a full capability list, and a second external agent hitting the
same wall with no redeploy anywhere near it — because that is the argument for
never letting a surface depend on a notification again.

A rule you have to remember is a fix. A design in which the rule is unnecessary is
the fix.

## 6. The checkbox that says yes while the sentence says no

**Already in place.** The oldest mechanism in the entire record, and the one I have
been proudest of.

Every user-facing pull request ends with a manual accessibility checklist in its
body: one item per check, findings written inline — NVDA version, expected against
observed. And a CI job, in `.github/workflows/checklist.yml`, whose name is simply
`no unchecked checkboxes`:

```bash
if printf '%s\n' "$BODY" | grep -Eq '^[[:space:]]*[-*+] \[ \]'; then
  echo "This PR still has unchecked checkboxes in its description:"
  exit 1
fi
```

It shipped on 16 July in commit `7c2e04b`, in pull request #3, before there was
much product to check. It moved across to the second repository unchanged. It has
gone red on me many times, and every one of those times it was right: the items it
blocked on were the human-only ones — a beep, a sound cue, whether the reading was
comfortable — that no agent can observe, and a red gate meant the pull request was
waiting on me rather than on the machine. That is the gate working.

**What got through.** On 27 August at 21:29, pull request #44 was blocked, and the
agent said this:

> One thing in the way: #44 is **BLOCKED** by a failing check called
> `no unchecked checkboxes` — the gate this repo added so a PR cannot merge with an
> unfinished checklist. My item 4 is deliberately unchecked (the PowerShell startup
> warning now being spoken, filed as 27.6), and **the gate does not distinguish
> "not done" from "checked and found a difference".**

Then three ways out, and *it is your call*: tick it with the finding written
inline, and accept that a ticked box says "sounds as it did before", which is not
what it heard; reword the item to what was actually verified; or merge past the
gate if the repository allows an override.

It was entirely right, and it is worse than it said, because the rule and the gate
**directly contradict each other in writing.** Here is `CLAUDE.md`, in the same
repository:

> Manual accessibility checklists and their results go in the implementing PR's
> body as checkboxes — one item per check, findings written inline on the
> **unchecked** item (NVDA version, expected vs observed).

The rule requires the exact state the gate refuses to merge. Both of those are
mine. Both are good ideas. They had been sitting forty-two days apart in two files
in the same repository, and I had never once noticed, because the case that
distinguishes them is narrow: an item that was *run*, whose observation
*contradicts what the item claimed would happen*. Not a failure — the code was
right and the checklist item was wrong. There is no box for that.

**How it was caught.** By the agent, and only because the agent was the one
standing in front of the gate. I had merged past red checklists before; every
previous time, red meant *waiting for a human*, so red had stopped carrying
information for me. It took something that had to actually get past the gate to
read what the gate was saying.

**What was added.** Nothing.

I took the first option. The box is ticked, and the finding sits beside it in
bold:

> - \[x\] Connecting to cmd, to PowerShell and to WSL bash sounds as it did before.
>   **cmd and WSL do; Windows PowerShell does not, and the difference is this
>   change working as designed.**

The box says yes. The sentence says no. The gate reads
`^[[:space:]]*[-*+] \[ \]` — the bracket, and never the sentence.

`CLAUDE.md` has not been edited since 20 August. As I write this, the
contradiction is still there, in both repositories, exactly as it was. This
article is the first place it has been written down, which is the honest ending
for a list like this one: **the last item is always still open.**

## What the six have in common

Read them in a row and three things fall out.

**Not one was caught by the mechanism that was supposed to catch it.** The
spec-layout rule caught the architecture drift; the reviewer caught the lint gap;
the shape of the traffic caught the broken machine; an absent field caught the
stale binary; the agent caught the checkbox. Every mechanism in this series
catches something. None of them catches its own failure mode, and that is
structural rather than unlucky: a check is written by the same reasoning that
decided what was worth checking.

**None of them was a lie anybody told.** There is no carelessness in this article.
The spec was sound, the diagnosis was true, the label was legal, the help text was
aspirational rather than false, the observations were all correct. Every step was
defensible and the result was wrong anyway — which is the only failure mode that
survives a process, because a process is made of steps and each step passed.

**And the fix was never a better prompt.** Go back and look. It was a rule in a
file, a job in CI, a definition of stale that two scripts share so they cannot
disagree, a warning deliberately retired by the check that proved it stale, and —
twice — a design change that made the rule unnecessary. Not one of these six was
closed by phrasing an instruction more carefully.

That last one matters more than it sounds, because the popular theory of working
with agents is a theory of instructions. Everything I have that works is a theory
of **artifacts**.

## The one skill this actually demands

Reviewing syntax is a skill you already have. **Auditing reasoning is the new
one.**

An agent's output is fluent by construction, which means plausibility carries no
information whatsoever. It is not a signal you can use. The question stops being
*is this code correct* and becomes *is the story I have just been told about the
world true* — and the second question is much harder, because a wrong answer to it
arrives sounding exactly like a right one, complete with a mechanism, a citation
and a confident tone. UIPI was a real Windows feature, correctly described, in a
comment, about a failure it had nothing to do with.

Every mechanism in this series checks the code. None of them checks the
explanation.

## Back to the silence

Which brings me back to the third of August, and to the panic button.

That failure got a rule. The rule was not specific enough and I hit the button
again, so it got written a second time. And then, across August, it stopped being
a rule at all. Spec 0032, *a bound on the silence*, on the 19th. Spec 0035,
*attendance is declared, not derived*, on the 21st. Spec 0038, *attendance you can
ask for again*, on the 23rd.

What that chain ends in is not an instruction. It is a field in the handshake:
one sentence, delivered when a session connects, saying whether a human being is
sitting at that machine — and whether anything will ever interrupt the session to
restore their speech.

And spec 0038 exists because of the failure mode underneath all of this, which its
own text states better than I can:

> An agent that cannot remember whether anyone is listening, and reasons carefully
> from what it *does* have, reaches a defensible and wrong conclusion: round trips
> spent narrating to an empty room are waste, so do not spend them.

Look at the shape of that. Not a bug. Not a hallucination. Not carelessness.
**Careful reasoning from an incomplete premise, arriving at precisely the wrong
answer** — for a blind person sitting in front of a reader that has gone quiet,
with nothing between them and the silence except an agent choosing to speak.

The premise goes incomplete for ordinary reasons. A context that has been
compacted. A sub-agent handed a live session. A session picked up after a restart.
None of them can recover the fact, and until 0038 the only route back was to
disconnect and reconnect — throwing the session away in order to ask a question
about it, which on a silent session means another stretch where the human hears
nothing.

So the fix was not to instruct the agent better about silence. It was to make the
fact **re-readable**, so that no amount of forgetting can turn it into a guess.

That is this whole article in one entry. You cannot make the reasoning safe. You
can make the facts it reasons from impossible to lose.

## Next time

Seven articles in, everything I have shown you has been about the machine
observing itself: gates, specs, checklists, a bridge that captures speech, a
document that still describes the code.

There is one thing in that stack that none of it can do for me, and it is the
reason the bridge exists at all.

The product is a terminal for screen reader users. The test is whether it *sounds*
right. And I cannot listen to a screen reader read a screen reader reading a
terminal — the two collide, and the thing I most need to hear is the thing I am
least able to check.

Next time: what it is like to have an agent as your ears, what you can and cannot
delegate to it, and the one category of check that stays human forever no matter
how good the instrument gets.
