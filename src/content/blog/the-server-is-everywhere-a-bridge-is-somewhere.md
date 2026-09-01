---
title: 'The server is everywhere, a bridge is somewhere'
description: 'The architecture conversation that filled the twenty-six days: one reader-agnostic server, one bridge per screen reader in whatever language that reader dictates, and a decision to reject Rust for a reason I have never seen written down.'
pubDate: 'Aug 31 2026 21:00'
series: 'you-are-now-the-whole-team'
seriesPart: 8
tags: ['ai engineering', 'ai', 'software engineering', 'accessibility', 'nvda']
draft: false
---

[Last time](article:i-stopped-building-the-product-to-build-the-tool) I stopped
building the terminal for twenty-six days, because every pull request was costing
me an evening of listening and there was no way to make that cheaper by writing
better code. I told you what I built instead and roughly what it is.

I did not tell you how it got its shape, and that is the more useful half —
because the tool is a harder design problem than the product, and it is the
second time I ran the method from
[part five](article:conditions-not-instructions) end to end. The repository was
older — it had been sitting there since 12 July — but its architecture
conversation was not: that happened three days after the terminal's planning
night. The first time produced a terminal. This time it produced something that has since grown a third
language and a second operating system without the design moving.

So this is the architecture conversation. Not the method again — you have that —
but what it actually produces when the problem is genuinely hard, and what the
documents look like afterwards.

## The conditions, which are not an architecture

Same opening move as the terminal: say what has to be true, refuse to say how.

- An agent must drive a **real** screen reader. Not a model of one, not the
  accessibility tree — the reader itself, on this machine, in this session.
- NVDA is the first reader. It must not be the last, and I am not going to pay
  for that promise twice.
- It has to be installable by somebody who is not a developer, because the
  people who most need this are not developers.

None of that names a language, a process boundary, or a protocol. That is the
whole point, and it is where the design conversation starts rather than ends.

What came out of it is four decisions, and they are still the four decisions. I am
going to quote them from the record rather than reconstruct them, because the
reasoning is the part worth reading and it was written down while it was fresh.

## One: the server is a chassis that knows nothing about screen readers

The first split is between what every reader has in common and what belongs to
one reader. On 18 July, six days into that repository's life and two days before
the terminal went quiet, that became a direction document — spec 0005, *one server, many screen readers* — and it is explicitly
not an implementation contract:

> Unlike specs 0002–0004 this is not an implementation contract for one PR: it
> records architecture and distribution decisions that future entries are judged
> against.

The decision itself is one sentence with teeth:

> **No reader conditionals in server code.** The server's domain and MCP tool
> surface speak generic vocabulary: speech since an index, braille, press
> gesture, state, config. There is no `if reader == "nvda"` anywhere.

Which sounds like ordinary good taste until you ask what happens to everything
NVDA-specific — the gesture names, the configuration key paths, the state values.
They ride through as opaque data. The agent composes them, the bridge interprets
them, and the server routes and buffers without understanding a byte of it.

The document names its own precedent, which is the part I would have missed:

> (Precedent: LSP/DAP — the editor ships no language semantics, yet you debug
> Python in it.)

That is the shape. Your editor knows nothing about Python. It knows about a
protocol, and something on the other end knows about Python. The screen reader is
the language server here, and once you see it that way the rest of the design
stops being a matter of opinion.

## Two: a bridge is whatever implements the contract for one reader — and its language is not your choice

Here is the decision I like most, because it takes a question people argue about
for weeks and dissolves it.

**What language is this project written in?** It does not have one. It cannot
have one, and pretending otherwise would be the bug.

An NVDA add-on runs inside NVDA's own embedded Python interpreter. There is no
choice to make: the bridge is Python or it does not exist. The document says so
flatly — *"The NVDA bridge stays Python forever regardless — it runs inside
NVDA."*

And in July, before any second reader existed, the same document worked out what
the others would have to be:

| Reader | Capture | Transport |
|---|---|---|
| NVDA | in-process spy synth / speech hooks | add-on owns the loopback socket |
| JAWS (future) | a custom SAPI 5 voice, a COM DLL, selected inside JAWS | an ordinary external process owns the socket |
| TalkBack (future) | a custom Android `TextToSpeechService` selected as the system TTS | a companion app over `adb forward` or Wi-Fi |

A JAWS bridge would be C# and COM. A TalkBack bridge would be Kotlin. Neither can
import a line of the Python. And that is not a problem to be solved — it is the
reason the split exists.

The consequence the document draws is the load-bearing one:

> The 7a domain ports (SpeechSource, GestureSender, SynthSwapper, …) are the
> durable seams: every reader's bridge decomposes into the same roles with
> different adapters. A future bridge design conversation starts from the port
> list.

So the thing that is portable across readers is not code. It is a **list of
roles**. Hexagonal architecture is usually sold as testability — swap the real
adapter for a fake one. That is true and it is the least interesting thing it
does. Here the ports are a design vocabulary that survives a change of language,
platform and vendor, and I did not fully believe that until it was tested.

## Three: capabilities are announced, not discovered

Readers are not equally open. JAWS probably cannot expose braille — the driver
SDK is not public. TalkBack has no configuration surface worth the name. NVDA,
being free software, gives you everything.

The naive design lets the server find out by trying: call the braille tool, get
an error, conclude there is no braille. The decision refuses that:

> Capabilities are uneven per reader (JAWS-no-braille, TalkBack-no-config), so
> `hello` announces a capability set instead of the server discovering gaps via
> errors.

And then the rule that makes it real, from the server's own spec: **the advertised
tool set is a function of the announced capabilities, and the gate is keyed on
capability strings, never on reader names.** A reader without braille never shows
a braille tool. Not a tool that fails politely — no tool.

The difference matters because of who is on the other end. An agent that meets an
error has to *interpret* it, and interpretation is exactly where a fluent machine
invents a plausible story. An agent that never sees the tool has nothing to
misread.

## Four: what is shared is the contract, not the code

The two halves have to agree about a wire protocol. There is an obvious way to
guarantee that — share a library — and the project did it for exactly as long as
both halves were Python: `protocol.py`, copied byte-for-byte into the add-on by
the build, so identical bytes were a free drift guarantee.

The moment a second language was real, that stopped being available, and the
replacement is stated as a principle:

> **What is shared is the contract, not the code:** `specs/wire/v1/` — schema
> plus prose — is the artifact both sides implement, and each implementation
> binds it in its own language, on its own schedule, as its own business. This is
> the LSP model: nobody ships a shared library, everyone implements the published
> spec, and interop is proven by conformance rather than guaranteed by linking.

A JSON Schema generated from the dataclasses, plus a hand-written prose document
for everything a schema cannot say — handshake ordering, half-open index ranges,
the error model, heartbeat rules, what each capability means. The document is
careful to insist the prose is *"the schema's equal partner, not an
afterthought"*, which is correct and is the part everyone skips.

And because a contract with no enforcement is a wish, there are gates: one job
proves the committed schema still matches the Python dataclasses, another proves
the committed Go binding still matches the schema, and a conformance tier runs
the real Go binary against the real Python bridge. Regenerate, diff, fail on
mismatch.

## And then one of them was reversed, in the open

Spec 0005 decided the server would be Python for v1.

Four days later, on 22 July, spec 0013 opened with this:

> ### The server is written in Go
>
> Reversing 0005's "the v1 server is Python", which parked a Go port for session
> F. The reasons the earlier decision gave have expired or flipped.

This is the *Decided* discipline from
[part three](article:the-gap-between-what-you-said-and-what-you-meant) doing the
thing it exists for. Not "we changed our minds", but: here is what the previous
decision was, here is each reason it gave, and here is what happened to that
reason. The same-bytes drift guarantee — replaced by the schema and its gate. The
published contract 0005 required before any language switch — shipped. The
distribution problem 0005 deferred — now the deciding factor, because a
statically linked binary removes the PyInstaller warts that same document had
listed: artifact size, startup time, antivirus false positives.

Then a fourth reason, about fit: this server is a router — dial a pipe, pump JSON
lines, fan out to MCP — which is goroutine-and-channel shaped. Rust's `rmcp` was
considered and rejected because *"Rust's ownership work buys guarantees this
process does not need."*

And then a fifth, which is the reason I have never seen written down anywhere by
anybody:

> **Toolchain accessibility.** `rustc` diagnostics are multi-line ASCII art
> (carets, underlines, gutters), which is hostile under a screen reader.
> `go build` emits one line per error. Compiler output is read thousands of times
> over a project's life; this is a real cost, not a preference.

I want to sit on that one.

The terminal is written in Rust. I chose it, I would choose it again, and
[part two](article:the-terminal-i-could-not-build) says why. So this is not a
person who dislikes Rust finding a justification. It is the same person, a week
later, ruling it out for a different component — because a compiler's error
format is part of that compiler's cost, and the size of that cost depends on who
is reading it.

A sighted developer glances at a `rustc` error and the carets and gutters *help*:
they point at the exact column. Read the same output through speech and the
diagram becomes a stream of punctuation between you and the sentence you needed.
Multiply by every compile of a multi-year project.

That is not an accessibility complaint. It is a maintenance cost, correctly
attributed, and it belongs in a technical decision document exactly where it
landed. I suspect there are a great many decisions like this that never get
written down because the person making them assumes it is a personal quirk rather
than a property of the tool.

## What the shape predicted, and what actually turned up

Spec 0005's table named two future readers: JAWS and TalkBack. Windows and
Android.

The reader that actually arrived, six weeks later, was **VoiceOver on macOS**,
written in Swift, and it was not on the table at all. Its capture mechanism is a
speech synthesis provider extension that macOS hands every utterance to as SSML.
Nobody predicted that in July.

Here is how its own direction document opens:

> This is the VoiceOver analogue of [spec 0005]: it settles *shape and language*,
> not classes.

Same document, same job, a reader nobody had listed, on a platform nobody had
planned for. The server did not change. It connects to the Swift bridge exactly
as it connects to the Python one — JSON lines over a local endpoint, `hello`
comparing protocol versions — and the core stayed reader-agnostic because there
was never anywhere for reader knowledge to hide.

That is what a design conversation is for, and it is worth being precise about
why it worked. **The predictions were wrong.** JAWS did not come next. Nothing in
July anticipated an `AVSpeechSynthesisProviderAudioUnit`. What survived was not
the forecast but the *shape*: a server that knows nothing, a bridge per reader in
whatever language that reader forces on you, capabilities announced rather than
discovered, and a contract in the middle that both sides implement separately.

Being right about the specifics is luck. Being wrong about the specifics and
having it not matter is architecture.

## But a document is not a codebase

Everything above is a claim about documents, and this series is supposed to refuse
those. A vocabulary agreed in July is worth nothing if the files six weeks later
do not use it, and *"the architecture held"* is exactly the sentence somebody says
when they have not looked.

So I looked. The rule is that every module says what it is, in its own header, on
its first line. [Part four](article:the-night-that-produced-no-code) ran that
audit on the terminal and found 89 of 96 modules declaring one of the six roles.
Here it has to hold in three languages that share nothing but a protocol — and it
arrives trimmed.

The vocabulary on this side is four words, not six: **port**, **controller**,
**entity**, **adapter**. Policy and service did not make the trip, because there
is no domain policy here worth the name and nothing that earns the word service:
the server routes, the bridge translates, and everything interesting happens at a
boundary. I would rather report it that way than claim the six travelled intact.
A vocabulary that gets shortened on the way into a different problem is better
evidence than one that arrives whole — a rule nobody ever trims is a rule nobody
is really applying.

Counting source modules — no tests, no fakes, no development scripts:

- **Go: 93 of 93.** Every module in the server declares its role.
- **Swift: 21 of 22.** The exception is `Package.swift`, a build manifest.
- **Python: 118 of 140.**

That last one looks like the crack, so here is every one of the twenty-two,
because a number with its exceptions hidden is a boast. Eight are package
`__init__.py` files, which carry a package-level comment instead. Seven are
`site_scons/site_tools/` — **NVDA's own build tooling, vendored into the add-on**,
not code anybody here wrote. One is `buildVars.py`, NVDA's add-on manifest in
Python form. Five are development scripts. And one is `protocol.py`, the wire
contract itself, which is a contract rather than a role.

Of the project's own domain code, in all three languages, the rule holds
everywhere.

And the check I most wanted to fail, because it is where tired reasoning goes to
hide: **is there a junk drawer?** There is exactly one `utils.py` in the tree. It
is `bridges/nvda/site_scons/site_tools/NVDATool/utils.py` — twenty-eight lines of
NVDA's own build tool, vendored. None of the project's own code has one, in any of
the three languages.

I would rather report it that way than claim a clean sweep. The clean sweep would
have been a lie by omission, and the vendored file is genuinely not mine to be
proud or ashamed of.

## What the harder problem forced

The terminal never had to publish a contract between two languages and prove both
sides still honour it. It has Rust and TypeScript, but nothing generated crosses
between them and there is no schema that could drift. So it never grew the
machinery this did. Four things exist here with no counterpart over
there, and all four come straight out of decision four.

**Thirty-three tasks, one question each.** `poe doctor`, `poe check`, `poe lint`,
`poe types`, `poe gates`, `poe conformance`, `poe dev`, `poe ci` — one command per
question you might have, with `poe dev` running the lot in CI's own order.

**Two drift gates whose only job is to stop a contract from lying.** One proves
the committed `schema.json` still matches the Python dataclasses it was generated
from. The other proves the committed Go binding still matches that schema.
Regenerate, diff, fail on mismatch. Neither tests behaviour; both test whether two
documents still agree.

**A conformance tier**, whose help text is the entire argument for it: *the real
Go binary against the real Python bridge.* Not a mock of the wire, not a fake on
either side. Two processes, two languages, proving they still understand each
other.

**And test tiers each bridge declares for itself** — which of `headless`,
`package` and `live` it can run on this host, and what the commands are. So the
task that runs bridge tests is a dispatcher rather than a hard-coded path, and the
doctor prints `SKIP` with *the bridge's own reason* for a tier that cannot run
here.

That last one sounds like housekeeping. It is the reason a Mac could work this
repository at all without pretending it had NVDA on it.

## Two days, in a language the rule was never written for

[Part six](article:an-hour-a-day) already told you the Swift bridge exists, and
noticed the role vocabulary showing up in its directory listing. This is the part
that tests the architecture rather than the tooling, and it is worth the dates.

On **28 August at 16:09** I ran `git clone` on a Mac that had never seen this
project. Different operating system, no NVDA, no Windows, none of the tooling.
That evening, a pull request merged.

The next day lane 3 opened with a spec conversation — *no code until the spec is
agreed*, in a repository the session had met the day before — and by the end of
29 August there was a working VoiceOver bridge in Swift, a language this project
had never used, on a platform it had never run on. Seven specifications, 0041
through 0047. The board is still moving through them.

And **twenty-one of its twenty-two modules declare their role** — written in a
different month, on a different operating system, by sessions that had never read
the July document the convention comes from.

They did not need to read it. The rule was not in anybody's memory; it was in the
files they were working next to, and in a specification that named the classes
before they existed.

That is the difference between a convention and a habit. A habit lives in the
person doing the work and dies when the person changes. A convention written into
the artifacts survives a change of language, of platform, and of session.

## What this does not prove

Two limits, stated plainly, because a measurement with its caveats removed is just
advertising.

**It is one person and two projects**, designed by the same taste. Somebody else's
conventions might not survive the same trip and I have no evidence either way.

**And the Swift bridge is three days old.** Twenty-one of twenty-two is a
snapshot, not a track record. Ask me in October.

## Which jobs this one was doing

- **Product owner** — three conditions and not one word of architecture: a real
  reader, NVDA first but not last, installable by somebody who is not a developer.
- **Architect** — the four decisions, and one of them reversed four days later in
  the open, with each of the old reasons answered rather than dropped.
- **Platform engineer** — thirty-three tasks, two drift gates whose only job is to
  stop a contract from lying, and a conformance tier that runs one real binary
  against another.

The six are counted in [*The night that produced no
code*](article:the-night-that-produced-no-code).

## Next time

Eight articles. Six roles, five moves, a toll booth, a spec-first process, a
status board, a merge gate, a definition of green, four documents that still
describe the code, and a vocabulary that has now crossed five languages without
anybody carrying it.

I have now spent an entire series describing mechanisms that worked.

Six things got through them anyway — past the gates, into the repository,
nobody's fault, every step defensible.

Next time, in [*Six things that got
through*](article:six-things-that-got-through): the wrong remedy for a right
diagnosis, the machine that never complains, the gate that lied about itself, and
the one where an agent took the rule I was proudest of, found the hole in it, and
was entirely right.
