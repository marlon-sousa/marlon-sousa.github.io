---
title: 'I stopped building the product to build the tool'
description: 'Twenty-six days between one commit on the terminal and the next, because every pull request cost me an evening of listening. What I built instead, and the four questions that separate this from procrastination.'
pubDate: 'Aug 30 2026 23:00'
series: 'you-are-now-the-whole-team'
seriesPart: 7
tags: ['ai engineering', 'ai', 'software engineering', 'accessibility', 'nvda']
draft: false
---

[Last time](article:an-hour-a-day) I put numbers on all of it: 193 commits across
two repositories, a bit over an hour of my own attention on the days I worked, not
one revert, and an afternoon in which a machine that had never built a line of
this was ready to work in nine minutes.

I have been quietly leaning on that phrase — *two repositories* — for four
articles now, and I have never properly told you what the second one is or why it
exists. This is that article, and it is also the one where the project manager
makes the worst-feeling call available to a person working alone.

On the twentieth of July I stopped building the terminal. I did not touch it again
for twenty-six days.

## The last thing I did before I stopped

Pull request #7 merged at 15:52 UTC on 20 July 2026. It was called *A3: fake
session backend*, and at the bottom of it, as the process
[part four](article:the-night-that-produced-no-code) described requires, sat a
manual accessibility checklist. Thirteen items.

Here are four of them, unedited:

> - **Run `big`.** Expected: "40 lines arrived, too big to read" is spoken; the 40
>   output lines are **not** read aloud; a beep sounds when the command finishes.
> - **Run `slow`.** Expected: "phase one", "phase two", "phase three" are each
>   spoken as they arrive, in order, none lost or merged.
> - **Run `speech`.** Expected: the whole phrase is spoken to the end — you hear
>   "long announcement finished". If speech cuts off early, note the last numbered
>   word heard (that is exactly where clearing truncated it).
> - **Subjective:** the beep's volume and pitch are comfortable alongside NVDA
>   speech.

Read those again and notice what none of them can be done by. Not a unit test.
Not an integration test. Not a snapshot, an assertion, or a query against the
accessibility tree. Every single one is **press this, listen, and decide** — and
the deciding is the part that matters, because "phase one, phase two, phase three,
in order, none lost or merged" is a judgment about a stream of speech arriving in
time.

Thirteen of those, per pull request. Run by one person. Me.

## Why a machine could not do it, which is also why the product exists

The obvious question is why any of this is manual in 2026, and the answer is the
same sentence that justifies the entire product.

An automated accessibility check inspects the accessibility tree: the structured
description an application publishes for assistive technology. That tree is
genuinely useful and every serious project should be checking it. But it is not
what a user experiences, and the gap between the two is not a rounding error.
Here is how the tool's own README puts it, and I have never found a shorter way
to say it:

> That loop cannot be automated by inspecting the accessibility tree, because the
> tree is not what a user experiences. A control can be perfectly exposed to the
> platform API and still be announced as nothing at all.

A control with a correct role, a correct name and a correct state, sitting in a
correct hierarchy, which the screen reader reads out as silence. The tree says
pass. The user hears nothing. And a terminal is the worst case for this, because
almost everything interesting about it is *timing* — what gets spoken, in what
order, how fast, and what interrupts what — and none of that is in the tree at
all.

So the check has to be: press the key, and hear what is said.

## What that costs when you are the one listening

Now the part that is specific to me, and which I think generalises further than it
looks.

I am blind. I operate this computer through NVDA. So when I test a terminal
designed for screen reader users, the screen reader is simultaneously the thing
under test and my only interface to the machine. There is one channel, and both
jobs want it.

And speech is **serial**. That is the whole of it. A sighted developer glances at
a screen and takes in ten things at once — the output, the layout, a stray
warning, whether that spacing looks wrong — in about a second, without deciding
to. Speech gives you one thing at a time, in order, at the speed of talking, and
if you want the third thing again you go back and listen to it again. You cannot
skim it. There is no peripheral vision for audio.

A thirteen-item checklist where each item is *run this and listen carefully* is
therefore not a half hour. It is an evening. And it is an evening during which I
can do nothing else, because the ears are busy.

Which makes it the project's rate limiter, and I want to be precise about that
word. It was not the annoying part. It was the part that set the maximum speed of
everything else. An agent that can write a pull request in twenty minutes is
worth nothing at all if the pull request then waits four days for me to have a
free evening — and worse, it puts a quiet pressure on you to make the pull
requests bigger, so there are fewer checklists, which is exactly the wrong
direction and undoes the whole reason they were short.

## So I stopped

Here is what the repositories record, and it needs no interpretation.

The terminal's commits, by day, in July: the 15th, the 16th, the 17th, the 18th,
the 20th. Then nothing. Nothing on the 21st, nothing for the rest of July, nothing
for the first two weeks of August. **The next commit is on 15 August.**

And here is the other repository over the same stretch: the 21st, the 22nd —
fifteen commits on the 22nd alone — the 23rd, the 24th, the 25th, the 27th, the
29th, the 30th, the 31st, then into August.

The work did not stop. It moved.

I should be exact about one thing, because it makes the decision smaller and more
honest than the heroic version. **That repository already existed.** It started on
12 July, three days before the terminal, for a different reason: I maintain
several NVDA add-ons, and I wanted a way to test those the way their users meet
them. Its README still names that as the original motive. What happened on 20 July
was not a repository being created. It was a side project becoming the only
project.

## What the thing actually is

Since I am going to keep referring to it, let me introduce it properly.

**`screen-readers-mcp` gives an AI agent a real screen reader.** Not a simulated
one, not a model of one — the actual reader, running on my machine, in my session.
The agent presses keys, hears what the reader speaks, reads what it sends to the
braille display, and when it gets stuck it can ask the human sitting at the
machine.

It is three pieces, each talking only to the next:

- **The client** — Claude Code, or any MCP client.
- **The server** — `screenreader-mcp`, a static Go binary, speaking MCP over
  stdio to the client and JSON lines over a local pipe to the next link.
- **The bridge** — an NVDA add-on, in Python, running inside the screen reader
  itself, which is the only place from which you can hear what NVDA is about to
  say.

The server knows nothing whatsoever about NVDA. That was deliberate from the
first week, and it is the reason a VoiceOver bridge could be written for macOS in
August, in Swift, without the server changing. NVDA is one reader. It is not the
architecture.

Three things about how it is used are worth having now, because everything I write
about this project from here on assumes them.

**Silent capture.** The reader's speech is intercepted at the filter and never
reaches the speakers. The agent gets a clean, ordered, timestamped record of every
utterance; I get my headphones back. This is how an agent can drive NVDA while I
am doing something else with the same NVDA — and it is also, as I will show you
later in this series, the source of the worst thing that has happened to me in
this whole project.

**Personas.** An agent connects declaring who it is pretending to be. The default
is `user` — an ordinary screen reader user who navigates by focus, Tab, the arrows
and the reader's ordinary reading commands. There is a more powerful stance
available, and using it is a deliberate, stated act, because an agent that
introspects its way around a problem is answering a question no user ever asked.

**Live checklists.** The checklist stays exactly where it was — in the pull
request body, one item per check, findings written inline. Nothing about the
process changed. What changed is who may tick a box.

## And how do you know this is not procrastination?

This is the real question, and I want to take it seriously rather than wave at
it, because I have watched myself and other people do the other thing: stop
shipping, start building tooling, and feel productive for a month.

The two look identical from the inside on day one. Four things told them apart
here, and I would use the same four again.

**One: the thing you stop for has to be something you cannot buy.** I looked. There
is no product that presses NVDA's keys and hands you back what it said. If there
had been, the correct decision would have been to pay for it and lose an afternoon
rather than three weeks, and the fact that this is *interesting* to build would
have been precisely the wrong reason to build it.

**Two: it has to be blocking, not merely useful.** This is the test most tool
detours fail. A faster build is useful. A nicer log format is useful. Neither is
setting the maximum speed of the project. The checklist was: thirteen items, one
person, every user-facing pull request, and no way to go faster by being cleverer
about the code.

**Three: it has to be bounded, and written down before you start.** The tool got
the same treatment the product did — and this is the part I did not plan and would
now insist on. On 17 July, two days after the terminal's process was invented,
there is a commit in the other repository that says *"docs: adopt the acter process
— ROADMAP status board, spec-before-code, checklist merge gate"*. The detour
inherited the discipline of the thing it was interrupting. Which means at any
point during those twenty-six days, "am I still doing the thing I stopped for, or
have I wandered off?" was a question with a written answer.

**Four: you have to be able to say what *done* looks like, in a sentence, before
you begin.** Mine was: an agent can run a checklist item and record what it heard.
Not "the tool is finished" — that tool is still being built today. Done meant the
product could start moving again.

If you cannot answer those four, I think you are procrastinating, and I say that
as somebody who would have enjoyed building this tool regardless of whether it was
justified.

## Coming back

On 15 August at 23:08 I opened the terminal's repository for the first time in
twenty-six days and typed four words:

> where are we at the moment?

I want to show you the reply, because everything the previous six articles argued
about writing things down is either true here or it is not:

> **On main, clean tree, nothing open.** A3 merged as PR #7 (`012fb91`), no open
> PRs, no uncommitted work.
>
> **Lane 1 (UI + testing infra):** entries 1–7 are Done […] The A3 NVDA checklist
> passed with no new findings, so A5.2 is still free.
>
> Next in lane 1 is **A4, completion path** — [ROADMAP.md:89]. Spec: none yet, so
> the next step is a spec conversation, not code.
>
> **Lane 2 (domain):** never started. […]
>
> My recommendation is **B1**: lane 2 has never moved, convergence is gated on A3
> *and* B6, and the A3 NVDA pass produced concrete pacing evidence […] that's
> freshest right now.

One turn. Twenty-six days of absence, a fresh session with no memory of any of it,
and the answer is not just *where we are* but *what should happen next and why* —
including a recommendation argued from evidence produced before the pause began.

That did not come from the model. It came from a status board with a written
algorithm for choosing the next step, which existed because somebody had decided
on a July evening that the project manager's job was a real job.

And a bookkeeping nit, at the end of that same reply: entry 7 recorded A3 as Done
without the *"Merged as PR #7"* phrasing every other entry carries. Twenty-six days
later, the first thing it found was a document drifting by one line.

## What the twenty-six days bought

The same day I came back — 15 August — a commit landed in the terminal called
*"Process: an agent may run the checklist items it can actually observe"*. The
rule it wrote down is careful, and the care is the point:

An agent may run and record any item it can genuinely observe, driving a real
screen reader and recording what was spoken, naming the reader version and the
capture mode. Items it **cannot** observe stay mine. The pull request body must
say plainly which is which, because **a checked box must never imply a sense
nobody used.**

Six days after that, on 21 August, the terminal merged its first pull request
whose accessibility checklist had been driven by an agent.

And here is the state of it now. From the terminal's roadmap, an entry from this
week:

> The accessibility checklist was driven under NVDA 2026.1.1 through the
> screen-readers bridge as the `user` persona, silent capture: six items
> agent-observed and passing, the seventh (no beep on a stopped command)
> human-only, because the bridge captures speech and braille rather than audio.

**Six of seven.** The evening became a review.

## The seventh item

Go back to that checklist from 20 July — the last one I ran entirely by hand — and
look at the thirteenth item:

> **Subjective:** the beep's volume and pitch are comfortable alongside NVDA
> speech.

Then look at the seventh item in the pull request from last week: *no beep on a
stopped command, human-only, because the bridge captures speech and braille rather
than audio.*

It is the same item. Six weeks, a Go server, an NVDA add-on, a Swift bundle for
macOS, forty-six specifications — and the beep is still mine. It is going to
stay mine, and not because the tool is unfinished. Some checks are a judgment made
by a person about how something feels, and the moment you let a machine tick that
box you have replaced the answer with a plausible sentence about the answer.

Knowing exactly which items those are, and refusing to let them be ticked by
anything else, turns out to be a substantial part of this job.

## Which jobs this one was doing

- **Project manager** — the worst-feeling call available to somebody working
  alone: stopping the product for twenty-six days, and the four tests that
  separate that from procrastination.
- **QA** — why an automated check cannot stand in for somebody listening, and
  knowing exactly which item on the checklist stays human forever.

The six are counted in [*The night that produced no
code*](article:the-night-that-produced-no-code).

## Next time

That is why I stopped, and roughly what I stopped to build. What I have not told
you is how the thing got its shape — and that is the more useful half, because the
tool is a harder design problem than the product.

One server that must know nothing about screen readers. One bridge per reader,
each in whatever language that reader forces on you, because an NVDA add-on runs
inside NVDA's own Python and a macOS speech provider has to be a Swift bundle. A
contract in the middle that both sides implement separately.

Next time, in [*The server is everywhere, a bridge is
somewhere*](article:the-server-is-everywhere-a-bridge-is-somewhere): the
architecture conversation that filled those twenty-six days, the decision that got
reversed four days later in the open, and the reason I ruled out Rust for this one
— which I have never seen written down anywhere by anybody.
