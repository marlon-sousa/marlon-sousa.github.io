---
title: 'The night that produced no code'
description: 'Five hundred and forty lines of documentation, six files, and not one line of code — then fourteen more commits before the first one. Six jobs got done that evening, and I did not notice I was switching between them.'
pubDate: 'Aug 30 2026'
series: 'you-are-now-the-whole-team'
seriesPart: 4
tags: ['ai engineering', 'ai', 'software engineering', 'rust', 'accessibility']
draft: false
---

[Last time](article:the-gap-between-what-you-said-and-what-you-meant) I argued
that an agent's whole value is extrapolation — filling the space between what you
said and what you meant — and that this is also its whole risk, because they are
the same mechanism. Which left us with a question rather than an answer: where
should that extrapolation be wide, and where must it be narrow? And with an
uncomfortable consequence: **you have to decide that before the code exists**,
because afterwards the decisions are already in the files.

So let me show you what that looks like when somebody actually does it.

It is Wednesday 15 July 2026. It is late — I know exactly how late, because git
knows. I have an empty repository, an agent that will start writing Rust the
moment I ask it to, and a terminal I have wanted for years sitting fully formed
in my head.

Here is what the repository looked like at 23:58 that night:

> `Add planning documentation and AI-first repo structure`
>
> 6 files changed, 540 insertions(+), 2 deletions(-)

Four documents, a README and a `.gitignore`. Not one line of code.

And then — this is the part I did not remember until I went back and counted —
**fourteen more commits**, all of them documentation, before the first line of
code landed at lunchtime the following day.

Let's talk about why.

## The obvious move, and why I did not make it

I want to start with what I *nearly* did, because it is a genuinely good idea and
I do not want to pretend otherwise.

The obvious move is to write a really good prompt. Not a lazy one — a serious
one. Three or four paragraphs: it is a terminal for screen reader users, Rust,
Tauri 2 so we get real HTML accessibility on Windows, each command becomes a
heading so the user can navigate their history, output gets read out
automatically when it is short enough, Windows first. Everything I knew, stated
properly.

That prompt would have worked. I want to be very clear about it, because the
usual version of this story has the agent producing garbage and the author
looking wise. It would not have produced garbage. By one in the morning I would
have had something that ran, and a fair amount of it would have been better than
what I would have typed myself at that hour.

So what is wrong with it?

Nothing you could see that night. That is precisely the problem.

Remember the number from last time — the twenty or thirty decisions that live in
the gap between a sentence and a file. That prompt asks for a *terminal
emulator*. Go and count what it does not say. It does not say whether the thing
that turns bytes into text is a real terminal grid or a regular expression that
strips escape codes out of the stream. It does not say what happens when somebody
types `nano`. It does not say whether the interface talks to a session directly
or through a seam you can put a fake behind. It does not say what "short enough"
means in numbers, or measured against what, or at which moment.

Every one of those gets answered anyway. Confidently, plausibly, in a way that
reads well. And then — this is the bit — **you build four weeks on top of the
answers before any of them announces itself as wrong.**

The regex one is my favourite, because it is exactly the decision a reasonable
person makes at midnight. Stripping escape sequences out of the output works
fine for `ls` and `git status`. It works right up until a program repaints a
line, or draws a progress bar, or clears the screen — and at that point you are
not looking at a bug you can fix, you are looking at the wrong foundation, and
the fix is "write the other thing, then move everything onto it".

Ooops. Calm down. Nobody has written anything yet. That is the entire reason to
be sitting here at this hour.

> The prompt was not too short. The prompt was fine. What was missing was
> anywhere for the answers to *go*.

## What the evening actually produced

Four files. Let me name them, because the shape of the set is the argument.

- **`docs/DESIGN.md`** — 209 lines. What the product *is*: modes, the keystroke
  map, profiles, what ships in phase one and what does not.
- **`docs/ARCHITECTURE.md`** — 196 lines. How the code is organised: crates,
  which module may know about which, where the seams are, how it gets tested.
- **`docs/ROADMAP.md`** — 69 lines. What order it gets built in.
- **`CLAUDE.md`** — 32 lines. The rules an agent reads at the start of every
  session, before it has read anything else.

Reading that back weeks later, I noticed something that had not occurred to me
while I was doing it: those four documents are four different jobs. And they are
not four jobs *I* have. They are four jobs that in every company I have worked
for belonged to four different people, and I had done all of them between dinner
and midnight without once noticing that I had changed hats.

There turned out to be six. Let me take them one at a time.

## One: somebody has to decide what the thing is

`DESIGN.md` is the product owner's document, and it opens by admitting what it
does not know:

> Status: planning. Decisions are marked **Decided**; everything else is open.

Here is a decision out of it. It looks small. It is not.

> **Default: auto-read output up to 25 lines or 2,000 characters, whichever is
> exceeded first.** Dual limit because lines alone mislead (30 short lines of
> git status read fast; 10 lines of minified JSON do not).
>
> Bias is deliberately generous: an over-long auto-read is silenced with one
> keypress (screen reader speech interrupt), while a too-small threshold forces
> buffer navigation on every medium output.
>
> Measured on the extracted grid text (trailing whitespace trimmed), never raw
> PTY bytes — escape sequences and prompt redraws would inflate the count.

Now. If I had put "read the output automatically when it is short" into a prompt,
I would have got a number back. Probably a sensible one. And the number is the
least valuable thing in that quotation.

Look at what is actually written down there. *Why* there are two limits, and what
goes wrong with only one. Which direction to be wrong in, and why — because being
over-generous costs you one keypress, and being stingy costs you a navigation,
every time, forever. And what the count is taken over, which is a detail nobody
would think to ask about and which quietly decides whether the feature works at
all: count the raw bytes coming off the terminal and a screen full of colour
codes and prompt redraws looks enormous when the actual text is four words.

That is a product decision — it is about what this thing is like to *use* when
you cannot see it — and there is nobody in the building to take it but me. But
the reason it is written down at that length is not ceremony. It is that a
recorded *reason* generalises and a recorded *number* does not. Six weeks later
that policy has been rewritten, extended and argued over, and every one of those
conversations started from the reasoning rather than from the number.

The same thing happens in the keystroke map, where the rule is one sentence:

> **Acter global commands are Ctrl+Shift+letter.** Identical in every context;
> never passed to the app. Rule in one sentence: "Ctrl+Shift means you're talking
> to Acter."

And immediately underneath it, the fingerprint of an argument:

> **Ctrl+Shift+E** — toggle interactive / non-interactive mode. **Decided.**
> (Moved from plain Ctrl+E, which collided with readline/nano/emacs end-of-line;
> terminal apps cannot receive Ctrl+Shift combos, so the collision vanishes.)

Ctrl+E was the first answer. It is a perfectly good answer, right up until you
are inside `nano`, where Ctrl+E means "go to end of line" to `nano` and "change
modes" to me — and now the user has one key that does two different things
depending on something they cannot see.

That parenthesis is worth more than the binding it documents, because a year from
now somebody — possibly me, possibly an agent, in a session that remembers
nothing — will propose a nice free key that happens to be Ctrl+something. And the
answer is already in the file, with its reasoning attached to it.

> A decision without its reason is a rule. A decision with its reason is a rule
> that can answer questions nobody has asked yet.

## Two: somebody has to decide where code goes

`ARCHITECTURE.md` is the architect's document, and it does not open by asking
what to build. It opens by narrowing.

The overall shape is what people call hexagonal architecture, or ports and
adapters, and if that phrase means nothing to you the idea is much simpler than
the name. The domain — the part that knows what a terminal session *is* — is not
allowed to talk to the outside world directly. It declares what it needs from the
world as traits: something that can carry bytes to a shell, something that can
say what time it is, something that can make a sound. Those declarations are the
ports. The things that actually do it — the Windows console API, the system clock
— are adapters, and they plug in at the edges. Dependency arrows only ever point
inward.

That buys exactly one thing, and it is the thing this project lives on: you can
unplug the world and put a fake in its place. A session that talks to a scripted
byte stream instead of a real shell is a session you can test on a machine with
no shell, in a millisecond, deterministically, and — this matters later — before
the real shell exists.

Fine. Standard, even. But here is the rule I actually care about, and it is the
one that was written for the agent rather than for me:

> Every module plays exactly one of six roles, declared on the first line of its
> `//!` doc comment: entity/value, policy, port, adapter, service, controller.

Six roles, and every file has to say which one it is, in its own first line.

Why bother? Because "where should this code go?" is the single most frequent
extrapolation an agent performs, it performs it *silently*, dozens of times a
week, and every answer is locally reasonable. Ask it to add a feature and it will
put the new logic somewhere sensible. Ask again next week, in a session that
remembers nothing about the first one, and it will put a similar thing somewhere
else, equally sensible. Nobody is lying and nobody is careless, and in three
months you have a codebase where the same kind of thing lives in four different
kinds of place.

The rule closes that, and it closes it in a way that does not need me in the
room. It even ships with the question to ask:

> Classifying question: **does the module do anything nondeterministic — I/O,
> time, randomness, environment?** Yes → adapter, and it deserves a port. No →
> one of the other five. Still doesn't fit → the module is misfactored; split it
> until each piece fits. ("Doesn't fit" is a smell to refactor away, not a
> bucket.)

Read that last parenthesis again, because it is the part that survives contact
with a tired human at 11pm. Every convention I have watched die, died by
acquiring a `utils.rs` — the place where things go when they do not go anywhere.
This one names that exit and blocks it in advance.

And notice who it is written for. Not "the agent must ask me". It is: here is how
*you* work out the answer, and here is what it means when you cannot.

That is what a narrow boundary looks like when it is done properly. Not a
prohibition — a decision procedure you can hand to somebody who was not there.

## Three: somebody has to decide what gets built first

`ROADMAP.md` was 69 lines that night, and it is the project manager's document.
It contains the most consequential decision of the evening, and that decision is
not technical at all. It is a scheduling one:

> **UI-first via fake backend.** The frontend depends on the `SessionApi` driving
> port; the first implementation is a scripted fake. Manual NVDA testing — the
> slowest feedback loop in the project — starts immediately and runs
> continuously. Because fake and real service implement the same trait and
> protocol, manually validated UI behavior carries over unchanged at convergence.

Let me unpack the reasoning, because it is the kind of thing that only comes from
somebody who knows what this particular project's pain is going to be.

Every project has one feedback loop that is slower than all the others, and your
build order should be organised around it whether or not it is the interesting
part. Here, that loop is a human being with a screen reader, listening. It cannot
be automated — I will come back to that in a minute — it costs real minutes every
single time, and it is the only thing that can tell you whether the product is
any good, because in this product what it sounds like *is* the product.

Build the terminal engine first and that loop stays shut for weeks. Build the
interface first, against a fake that pretends to be a shell, and it opens on day
one and never closes again.

And then, a few lines further down, the bit I am fondest of in the whole
document:

> **Convergence.** Composition root swaps fake `SessionApi` for the real
> `SessionService`. If both tracks were honest, this PR is boring — that is the
> success criterion.

A success criterion of *boring*. Written down before either track existed.

That is a project manager stating in advance what evidence would show the plan
was sound, which is a completely different act from hoping that it is. It is also
a trap I set for myself on purpose: if that pull request turned out to be
exciting, I would not get to explain the excitement away, because I had already
agreed what it would mean.

> Deciding what to build first is not a technical decision. It is a decision
> about which of your questions you want answered soonest.

## Four: somebody has to build the ground it stands on

The platform engineer's job is the one nobody thanks you for, and that night it
produced two things.

The first is the tooling floor, at the bottom of `ARCHITECTURE.md`:

> - `clippy` with warnings denied, `rustfmt` enforced.
> - CI on a Windows runner from day one.

"From day one" was not a figure of speech. `PR 0` in the roadmap reads, in full:
workspace, five crates with facade files, the lint configuration, CI on a Windows
runner — and then two words. **"No logic."**

The first thing built was the thing that checks the things, and it was built
before there was anything for it to check.

That is last article's argument turned into a task. A boundary the agent cannot
check is a wish; the check has to come from outside the reasoning being checked;
therefore the gate is the first pull request, not something you add later once the
code has become frightening enough to need it.

The second is `CLAUDE.md` itself — 32 lines, and it is the onboarding document
for a colleague who will arrive with no memory of yesterday, every day, forever.
It carries the rule I quoted last time about `Decided` items and the toll booth.
It also carries this, which I put in for reasons that are entirely my own:

> All documentation and communication must be screen-reader friendly: no
> ASCII-art diagrams, no box-drawing trees. Prose, lists, and headings only.

A little box-drawn directory tree is the default way an agent shows you a
structure. It is charming, and it is completely unreadable to me — it arrives as
a stream of punctuation names. So it is banned in the repository that belongs to
me. I mention it because it is a small, unglamorous, extremely practical example
of what a project's own rules are actually for: my documents have to be readable
by their author, and if I do not write that down on night one, I will be asking
for it in every session for a year.

## Five: somebody has to decide what counts as proof

QA turned up that night as well, and it did not turn up as a promise to test
things. It turned up as four tiers, cheapest first: pure unit tests over byte
sequences; golden transcripts — real captured sessions from PowerShell and cmd,
committed as fixtures and replayed — described as "the workhorse"; integration
tests that spawn a real console; and then the fourth one.

> **Accessibility:** automated axe-core checks on the built DOM in CI (missing
> roles, detached live regions); manual NVDA pass against a written checklist per
> release — **automation cannot hear speech, and here the speech is the product.**

I wrote that sentence as a limitation. A statement of what a machine cannot do
for you: the tooling can prove the markup is right, it cannot prove the
experience is right, so a human has to sit down and listen.

Hold on to it. It is the hinge of everything that comes later in this series, and
about three weeks after I wrote it, it stopped being true — not because I was
wrong about what automation could do then, but because I stopped accepting the
sentence and went off to build something. That is a later article, and I am not
going to spoil it here.

## Six: somebody has to read it back

The sixth job is the reviewer, and it is the hardest one to see in a diff,
because most of its output is things that are *not* there.

`DESIGN.md` ends with a section called "Open questions", and it has four entries
in it. Whether entering a full-screen program should announce itself or switch
modes automatically. How a screen reader should read a live grid while a
full-screen app is running. How you navigate tabs when you cannot see them. How
SSH authentication prompts stay accessible.

Every one of those could have been settled that night. I had opinions about all
four. The agent would have helped me settle them, cheerfully and well, and we
would have produced four more paragraphs marked **Decided**, and the document
would have looked considerably more finished.

They are open because deciding them would have been fake. I did not know enough.
Nobody in that conversation knew enough — not the machine, and not me — because
the answers depend on what the thing sounds like when it exists, and it did not
exist.

That is the reviewer's real job on a night like this. Not checking the work for
mistakes: drawing the line between what is genuinely settled and what has merely
been stated confidently. Last time I described the `Decided` marker as a toll
booth. A toll booth is worthless if you stamp it on everything, because then it
means nothing and people learn to drive straight through it. Its value comes
entirely from the things you refused to stamp.

> The document is honest about four things it does not know. That is what makes
> the rest of it worth obeying.

## Twelve hours later, I broke my own rule. On purpose.

Now the part that pleases me most, and I did not plan it.

At 11:40 the following morning — twelve hours after that commit, and still before
any application code existed at all — this landed:

> `Replace end-only auto-read with quiescence-based output pacing`
>
> docs/DESIGN.md | 48 +++++++++++++++++-------------

The auto-read design from the night before had an assumption buried inside it
that I had not noticed while writing it: that output arrives, the command ends,
and *then* you decide whether to read it out. That is true for `ls`. It is not
true for anything that stops halfway through and asks you a question — and a
terminal that sits silent while a program waits on a prompt you never heard is
not a slightly worse terminal, it is a broken one.

So the decision changed. Twelve hours old, marked **Decided**, and changed: paced
on pauses in the output rather than on the end of the command, with a patience
window for things that stream continuously.

Look at what that commit is, though. It is one file, and the file is the
document. There was no code to change yet, and the change happened *in the open*,
in a commit whose message says what moved and why — which is exactly what the
rule from last time demands: propose it explicitly, and update the document in
the same breath as the implementation.

Twelve hours in, I got to find out whether I had written a rule or a decoration.

And notice which direction it went. The rule is not there to stop things
changing; a good deal of what was decided that night has been amended since. It
is there so that changing them costs a commit somebody can read, instead of
costing nothing and being noticed by nobody.

## What five hundred lines were worth

That is the sort of claim that is easy to make on the night and hard to check, so
let me check it. Today is the 30th of August. Six weeks and one day later.

### The documents are still the documents

- 49 merged pull requests.
- 47 specification documents, one per unit of work, each one agreed before its
  code was written.
- Those four files, still exactly four files, now 5,043 lines between them:
  `DESIGN.md` at 834, `ARCHITECTURE.md` at 601, `CLAUDE.md` at 69, and
  `ROADMAP.md` at 3,539 — it stopped being a plan and became a status board,
  which is a story for another day.
- The module role rule is still there, at line 120, still marked **Decided**,
  still one word at the top of every module in the workspace.
- The two-track plan ran the way it was drawn. Convergence happened. It was
  boring.

### The size of the thing

And the terminal exists. It is not finished. It works.

Let me put some size on that, because "it works" is cheap to say.

- About **40,000 lines**: 34,396 of Rust across 103 files in five crates — tests
  included, because in Rust they live in the file they test — plus 5,578 lines of
  TypeScript, HTML and CSS in the frontend, whose tests live in twenty files of
  their own.
- **978 automated checks**: 676 test functions on the Rust side, 302 cases on the
  frontend.
- **Four shells**, each with its own way of being weird: cmd, PowerShell, bash
  under WSL, and the plain `sh` you land in at the far end of an SSH connection.
  And PowerShell is not even one thing — Windows PowerShell and PowerShell 7 are
  variants of one adapter, discovered at runtime, because which one you have
  changes what the far end will accept.
- **Three places a shell can live**: this machine, a Linux distribution inside
  WSL, and a machine somewhere else on the network. Two transports underneath
  them — the Windows console API, and an SSH client we own rather than shell out
  to, with the whole authentication flow rebuilt so a screen reader can hear it.

### Did any of it drift?

Then there is the question I did not expect to be able to answer with numbers at
all: did any of it *drift*?

Because that is the complaint you hear about agentic development more than any
other. Not "the code is wrong" — "the code is *everywhere*". Similar things in
dissimilar places, four ways of doing one thing, a structure nobody could
describe on a whiteboard because nobody designed it, they just kept accepting
diffs.

So I went and audited the workspace against the rule written that night. Six
roles, declared on the first line of every module.

**96 modules. 89 of them open with one of the six role words, verbatim.** The
other seven are not violations: two are crate facades, which the rule exempts by
definition; one is a build script; two are folder facades that open with the word
"Facade"; and two are routers that open with `//! Router:` — the delivery
vocabulary that was added, in the open, on the second day. There is not a single
module in that workspace that does not say what it is.

The rest of the audit came out the same way. **Zero** `utils.rs`, `helpers.rs`,
`common.rs` or `misc.rs`, across 103 Rust files and a frontend — the junk drawer
never appeared, which is the one I genuinely expected to find a crack in, because
"utils" is where tired reasoning goes to hide. Sixteen ports against three
services, so the sprawl guard is visibly biting. The concrete `SessionService`
type appears in code exactly *once* outside its own module and the composition
root, and that once is the re-export in the crate's facade, which is the rule
itself. And the frontend — a different language, written in different sessions —
speaks the same vocabulary: adapters, ports, controllers, routers, views.

I found one deviation, and it is my favourite thing in this entire audit.

The layout drawn that night was organised by *concept*: a `session.rs` with a
`session/` folder beside it, a `boundary.rs`, an `autoread.rs`. The layout on
disk today is organised by *role*: `entities/`, `policies/`, `ports/`,
`services/`, `controllers/`.

So it changed. On the 16th of July — the following day, before there was much
code to move — in a commit that says so in its title. And `ARCHITECTURE.md`
today still describes what is actually on disk, file by file, down to noting
which pull request each port arrived in.

That is worth more to me than a rule nobody broke, and here is why. Anybody can
write a document that is obeyed for a fortnight. **A document that still
describes the code after 49 pull requests is a document that moved every time the
code did** — which is exactly what the toll booth was for, and it is the only
mechanism I know of that stops documentation quietly becoming fiction.

And it answers the complaint. The agent always knew where to put things, in
sessions that shared no memory with each other, because the question had been
answered before it was ever asked — not with a map of the project, which goes
stale, but with a procedure for classifying a module, which does not.

### What broke

Now the number I actually went looking for, because it is the one that would
embarrass me if it were bad.

**Nothing has been taken back out.** Zero reverts in 77 commits. And the
continuous integration record on `main` is 62 runs: 54 green, one cancelled,
seven red. Of those seven, five were in the expensive tiers — the job that spawns
real shells and the one that drives a real browser. **Twice** in six weeks did
the cheap gate, the one that compiles and lints and runs the unit tests, go red
on `main`.

Twice, across 49 merged pull requests and 40,000 lines, on a codebase where
almost every line was written by a machine.

I do not want to oversell that, so here is the one that got away, in the
project's own words. A test that spawns a shell *inside* a shell — `sh` inside a
container — was found failing on clean `main` in August. It was not broken by the
pull request that found it; that was checked, against an earlier commit. It needs
Docker, so it only ran on machines that had Docker, and the board says exactly
what that means:

> it needs Docker, so it only runs where Docker is installed, which is exactly
> how a test rots unnoticed

That entry was filed with three possible outcomes written down — the matcher is
losing an echo, or the container never sent one, or the test is asserting
structure the design never promised — and a note that a permanently red check
trains everybody to ignore the suite that catches what unit tests cannot. Which is
the same discipline as the toll booth, pointed at myself: the failure got a name,
a date and a decision to make, rather than a shrug.

### "Six weeks" is doing a lot of work in that sentence

And now the honesty about "six weeks", because that phrase is doing a great deal
of work and most of it is wrong.

Forty-six days elapsed. **Twenty of them have commits on them.** The rest are days
this project did not happen, because there is a full-time job and a family in
front of it — the same reason it did not get built for years, which I wrote about
in [*The terminal I could not build*](article:the-terminal-i-could-not-build).

And even the twenty were not days. They were evenings and pieces of weekends, and
inside them the work kept stopping on its own: the usage window that is nominally
five hours would be spent in about an hour and a half of real work, and then there
was nothing to do but wait for it to reopen. So the honest picture is not a
machine running flat out for a month and a half. It is a few dozen sessions, in
slices, with hard stops in the middle of them.

Could I have written 40,000 lines and a thousand tests by hand in twenty evenings?
Obviously not. Could I have done it in two hundred? I do not think so either, and
I have evidence rather than an opinion, because the previous attempt at this
project ran for *years* and produced nothing — not through laziness, but because
the arithmetic never worked.

That is the claim of this whole series in one measurement. The agent did not make
the job easier. It made a job possible that was not possible, and the price of
admission was one evening spent writing down what the thing was, before anybody
was allowed to type.

### The part I could not quote you

One more thing, and it is the one I find genuinely striking.

I went looking for the conversation from that night — the actual back-and-forth,
which I wanted to quote to you here, both sides, the way I have promised to do
throughout this series. It is gone. Session transcripts age out of the local
cache, and the 15th of July is well past the horizon; the oldest one I still have
is from the middle of August.

So the conversation that built all of this has evaporated, and what I have
instead is 540 lines that six weeks of work were poured through, and that every
session since has read before doing anything else.

I could not have designed a better demonstration of the point. **The conversation
is not the artifact.** It felt like the artifact — it was where the thinking
happened, it was the part that was hard, it is the part I remember. But a
conversation is something that happened to *you*, and it leaves when you do. The
document is the part that is still working while you are asleep, in a session you
will never see, for a colleague who turns up every morning having forgotten
everything.

If that night had produced code and no documents, I would still have the code.
What I would not have is a single one of the reasons.

## Six jobs, and the thing that gives them away

Counted up, then:

1. **Product owner** — what the thing is, what "read it automatically" means in
   numbers, and which direction you are allowed to be wrong in.
2. **Architect** — where code goes, which way dependencies point, and how a
   module gets classified by somebody who was not in the room.
3. **Project manager** — what order it gets built in, organised around the
   slowest feedback loop, with "boring" written down in advance as the proof.
4. **Platform engineer** — the gate, on a Windows runner, in the first pull
   request, before there was anything to gate.
5. **QA** — four tiers, and an honest statement of the one thing the tiers could
   not reach.
6. **Reviewer** — four questions left open on purpose, and the discipline of not
   stamping **Decided** on things I merely had opinions about.

Six people's worth of decisions. One evening. One person.

And I want to be careful about the moral, because there is a triumphalist version
of this article and it is not the one I am writing.

I did not do those six jobs *well* that night. I did them fast, and several of
them turned out to be wrong — the auto-read policy was wrong by lunchtime. The
claim is smaller than that, and I think more useful: **every one of the six got
done, and each one left a file behind.** That is the tell. Not that I felt like a
product owner for twenty minutes, but that there is a document with product
decisions in it, with their reasons, which an agent reads and obeys and which I
can be held to.

Which gives you a test for your own projects, and it is not a comfortable one.
Not "am I doing the architecture?" — everybody says yes to that one. But: *where
is it written, what does it forbid, and what happened the last time somebody
crossed it?*

If the answer is that it lives in your head, then the role is not filled. It is
merely occupied.

## Next time

There is a question I have been dodging for this entire article, and if you have
been reading carefully it has probably been bothering you for a while.

Fine. Five hundred and forty lines of documentation in one evening, with an agent
that would much rather have been writing Rust. **What did I actually type?**

Because "I decided the architecture and wrote it down" is the sort of sentence
that describes nothing. Somebody had to hold a machine to a conversation it was
not naturally inclined to have, for three hours, and none of that is in the four
documents — the documents are what came *out*.

So next time we need to talk about prompts. Not prompt tricks, and not a list of
phrases that work: the handful of moves that get an agent arguing about a design
instead of implementing one, and how you tell a real objection from a polite
agreement.

And after that, the one I keep promising: six things that got through all these
mechanisms anyway — past the gate, into the repository, nobody's fault — including
the one where an agent took a rule I was proud of, found the hole in it, and was
entirely right.
