---
title: 'The terminal I could not build'
description: 'AI did not remove the roles around the code — it removed the other people who held them. The case this whole series rests on: a tool I wanted for years and could not afford to build, and the forty minutes of conversation that decided how it would be built.'
pubDate: 'Aug 06 2026 20:30'
series: 'engineering-with-ai'
seriesPart: 1
tags: ['ai', 'accessibility', 'nvda', 'rust', 'testing']
draft: false
---

With AI, anyone can code. That is true, and I have no interest in arguing with
it. If you are automating a spreadsheet, scripting something around the house or
building a thing for yourself, that is the whole story, it is a good story, and
almost none of what follows applies to you.

This series is about the other case: **software other people depend on, which has
to be maintained by somebody who was not there when it was written.**

## The claim

About that case, this series argues three things, and all three run against the
popular version:

1. **Code was never the bottleneck in professional software.** The roles around
   the code were — deciding what is worth building, in what order, in what shape,
   what "done" means, what counts as proof, and whether the claims being made
   about the work are actually true.
2. **AI did not remove those roles. It removed the other people who held them.**
   Sit down alone with an agent and every one of those jobs is still required,
   and all of them are yours. What the agent took over was the typing, which was
   the cheapest part of the whole arrangement.
3. **So the quality of agent-written software is set by the artifacts around the
   code, not by the prompts.** A prompt binds one session, and there is always
   another session. An artifact binds every session after it.

Which adds up to the unpopular part:

> Building professional software with an agent demands **more** maturity from a
> single engineer than classic development does, not less.

That is the argument. It is not a warning about AI, and it is not a defence of
anyone's job. It is a claim about where the work moved.

I would rather not make it in the abstract, so this article is the case that
everything else in the series refers back to: two repositories, why they exist,
and — the part that matters most — the process that was in place before either of
them had a line of code. Both are on GitHub with their full history intact. Every
claim in this series is anchored to something you can go and read for yourself: a
commit, a specification, a CI job, or a prompt I actually typed.

That last one needs a note. Everything I quote from my own side of these sessions
is quoted exactly as I typed it — typos, lowercase, missing letters and all. They
were written fast, at night, in the middle of doing something else. Cleaning them
up would misrepresent what this actually looks like.

## An itch I had for years

I use a terminal every day, and I have never been satisfied with how one behaves
under a screen reader.

A terminal is a scrolling wall of undifferentiated text. Your reader can tell you
what is on the line where the cursor happens to be. That is fine when you run one
command and read one answer. It stops being fine the moment you want the output
of the command you ran four commands ago, because there is no structure to
navigate — no headings, no landmarks, no boundaries between one command's output
and the next. There is just text, and you arrow through it.

I have wanted to fix that for years. I never did — not because I did not know
how, but because of what it actually costs. The thing I wanted is not a weekend
project: a terminal emulator, a genuinely accessible interface layered over it,
Windows integration, and — the part people forget — a way to *test* that any of
it works. I have a full-time job and a family. What I have to spend on this is
evenings, in slices, and the gap between that and what the thing required was too
wide to close. I was not going to ship half of it.

What changed is that the models got good enough. Not "can autocomplete a
function" good — good enough that one person working in evenings could credibly
take on a project that previously needed a team. That is why this exists in 2026
and not in 2019, and it is also why I have opinions about how to work with
agents. I did not adopt them because they were interesting. I adopted them
because they were the difference between building this and not building it.

## What I set out to make

[acter](https://github.com/marlon-sousa/acter) is an accessible terminal whose
default mode is conversational. You type a command into an edit field, and the
result lands in a reviewable buffer where **each command is a heading**. So you
navigate your session history the way you navigate a web page — jump by heading
to the command you want, read its output, move on. Output short enough to listen
to is spoken automatically; anything larger is announced and signalled with a
beep, so you are *told* there is a wall of text rather than having it read at
you. One keystroke drops into full terminal emulation when you need `nano` or
anything else built on curses.

Rust, with Tauri 2 — an HTML frontend over WebView2 — Windows first.

So: time to ask the AI to start coding!

Well — no. Not if anyone is going to depend on the result.

## Six jobs, and normally six people

Think about who is actually involved in shipping software other people depend
on. Not the org chart of any particular company — the jobs, whoever holds them:

- **The product owner** decides what is worth building, and what *right* means
  for it.
- **The project manager** decides what order things happen in, what they cost,
  and what gets paused so something else can happen.
- **The architect** sets the boundaries the code has to live inside: the
  layering, the dependencies, where a given thing is allowed to exist at all.
- **The platform engineer** decides what "green" means and makes it mechanical,
  so that nobody has to remember it.
- **QA** decides what counts as proof that it works — including the checks no
  machine can run.
- **The reviewer** decides whether the work, and the claims made about the work,
  are true.

Six jobs. On a team you hold one of them and the other five happen around you,
often so quietly that you stop noticing they are jobs at all. That is the second
claim above, made concrete: an agent does none of these six, so the software will
be exactly as good as the worst-staffed of them.

Those are the names I will use for the rest of this series. And the thing I want
to show in this article is that all six were in the room *before* the first line
of code, in one conversation, on one night.

## The night of 15 July

`acter` starts with a conversation, not a repository. Here is how I opened it:

> This is a planing section of acter project. First, I will say what it is going
> to be, then we will decide together and document several aspects of it, about
> funcitonality and architecture.

Then a description of the product — the edit field, tab completion that the
reader speaks, the results buffer with each command as a heading level 2,
automatic reading below a size threshold and a beep above it, the interactive
mode behind a keystroke for `nano` and anything built on curses. That is the
product owner's paragraph, and it existed before anything else did.

And then the last line of that first message:

> Tell me if you understood, and what you would use as gui framework to begin
> wth.

I want to sit on that for a moment, because it is the part people get wrong
about this kind of work.

**Rust was my decision. Tauri was a question.** I had reasons for Rust and I did
not put them up for debate. I did not have a settled view on the GUI framework,
so I asked — and then argued with the answer, and only then decided. That is not
me outsourcing an architectural decision. It is the same thing I would do with a
colleague who had looked at more of the landscape than I had recently.

Using an agent to *reason* is not a lesser form of engineering. It is the same
instinct that makes a mature engineer ask the room before ruling, and it is the
opposite of what the "AI makes you lazy" argument imagines. The failure mode is
not asking. The failure mode is not being able to tell a good answer from a
confident one — which is a different problem, and it is the subject of the next
article.

The pattern repeats through the whole conversation:

> this is good. Do you consider safe we code first non interactive and then come
> back to interactive as a second phase or we would risk using a non supporting
> architecture?

> we have to make the technical design decisions: crates, test strategy, coding
> paradigm, dependency injection and others. How would you organize code in this
> case?

> what do yu think of stating the following rule? Every module should be either
> an entity, a port por a controller (orchestrator). If nit doesn't fit, then it
> is an adapter and deserves a port?

Notice the shape. I bring a rule and ask what is wrong with it. I bring a worry
about phasing and ask for the risk. And when I disagree, I say so with the
reason:

> I am nt convinsed. First the commands: we register the controllers directly in
> the commands table, but then we are couplin domain with taury, because
> controllers have to obbey the format tauri expects, and tests are coupled. I
> would think we should inject our controllers using traits in another layer I am
> calling routers, which can couple to the tauri specs, they would be a kind of
> adapter. Say if you agree.

That is the routers layer in `acter` today. It exists because a proposal was
reviewed and rejected with a reason, in conversation, before it cost a line of
code. And look at *why* I rejected it: **"tests are coupled."** Not elegance.
Testability.

The design conversation ran about forty minutes, from 23:17 to just before
midnight. What it produced, committed that night as the repository's second
commit — *"Add planning documentation and AI-first repo structure"* — was just
over five hundred lines of `DESIGN.md`, `ARCHITECTURE.md`, `ROADMAP.md` and
`CLAUDE.md`, the contract the agent works under. No product code. The first pull
request containing an application is number 2.

## All six roles, in that one conversation

All six are visible in that one session, and they stayed in play together
afterwards. What changed over the following weeks was not which roles existed —
it was how sharp their artifacts got. So it is worth going through them one at a
time, with what each produced that night.

**The product owner** is the opening message: the size threshold, the beep, the
headings, the two modes. Then, immediately, the decisions a product owner is
actually for — where things are configurable and where they are not:

> size would be configured per session (configuration screen), and we might add a
> default profile that all sessions will inherite unless they override. Suggest a
> default value.

**The architect** is turns seven through twenty. Five crates. The module role
rule — every module is exactly one of entity, value, policy, port, adapter,
service or controller, **declared on the first line of its doc comment**. The
visibility ladder. `module.rs` plus `module/`, never `mod.rs`. No junk-drawer
modules. And dependency injection by constructor at a composition root, with no
framework, argued out rather than assumed:

> agree om tje decision, but disagree on the iromic ome: a di framework uses a
> containter.rs or comtainer.ts where injectable interfaces are bound to concret
> implementations, these layers never touch, while f we wire everything we would
> be doing bindings whenever an object needs to construct.

**QA** is in that same stretch, and it is the role most people assume comes
later. Look again at the prompt that opens the technical section: *"crates,
**test strategy**, coding paradigm, dependency injection"*. Test strategy is
named in the same breath as the crate layout, as a thing to be *designed*. And
the architecture rule I insisted on has testability as its whole justification:

> only thing: if a controller ever needs a service, this should come through a
> trait, so in this case it must be backed by a port, so we can test all
> components in detail.

`ARCHITECTURE.md` came out of that night with a test strategy of four tiers,
cheapest first, and `CLAUDE.md` came out of it with the rule **"Nothing lands
untested."** That is QA, staffed, before a crate existed.

**The project manager** is the next prompt, and it is the one that shaped the
build:

> not yet, we need to define something else, which would be the construction
> order. prs must be relatively short, and we will set a plan where we would have
> component plus trait plus unit tests untill we can wire everything together.

Short pull requests. A written build order. Component plus trait plus tests as
the unit of delivery. Two parallel tracks, strict order within a track, free
interleaving across them. And a convergence criterion I still like:

> Composition root swaps fake `SessionApi` for the real `SessionService`. If both
> tracks were honest, this PR is boring — that is the success criterion.

**The platform engineer** shows up as PR 0, which is worth reading because of
what it refuses to contain. Its spec opens: *"No logic lands here; the
deliverable is a repository in which every later PR has an obvious home and CI
that enforces the rulebook."* What it delivers is the workspace, five crates
whose `lib.rs` files contain nothing but a one-sentence role comment and
`#![warn(unreachable_pub)]`, a shared lints table with clippy warnings denied,
`rustfmt` config, and a GitHub Actions workflow on a Windows runner running
`cargo fmt --check`, `cargo clippy --workspace --all-targets -- -D warnings` and
`cargo test --workspace`.

So the honest answer to *when did "green" get defined* is: **before there was
anything to be green.** `ARCHITECTURE.md`'s tooling floor says it in one line —
*"CI on a Windows runner from day one."* The same is true in the second project:
`screen-readers-mcp`'s foundation commit ships the CI workflow and 254 lines of
protocol tests alongside the protocol itself, in one commit, before any server
exists.

**The reviewer** is there too, from that first day — which is early, given there
was barely any code yet to review:

> ok. We still have something to work in this session, and I think our way of
> work is really good because we are catching things earlier in development flow.
>
> I was reviewing your work and got confused on the folder structure we are
> using. For me, it was clear that I wanted domain / (services | port |
> controllers | routers), containner, adapters/<structure>, and files organized
> as one file per adapter / port / controller and things like that, so looking at
> the project we know what is happening and what is going on.

*I was reviewing your work and got confused.* That is the job. The folder layout
was corrected, in the same session, before the code that would have made it
expensive.

## What that night did not settle

Six roles, one person, one conversation, and about five hundred lines of
documentation before a single line of product code. That is the claim this
article set out to make, and the repository is there if you want to check it.

But naming a role is not the same as holding one. A decision argued out in a
conversation binds that conversation and nothing else — and there was always
going to be another session, on another night, probably with a different model
behind it. Everything above is the moment the six roles were *staffed*. None of it
yet says how they were **held**, night after night, by one tired person who was
not going to remember any of it.

That is the next article. It goes through the machinery: the seven steps from a
decision to a merged pull request, why the definition of green existed before
there was anything to be green, how a test strategy designed on night one decided
which work a human would ever have to do — and why that last question is the
reason a second repository exists at all.

