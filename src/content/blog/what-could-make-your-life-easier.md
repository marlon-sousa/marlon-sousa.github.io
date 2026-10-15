---
title: 'What could make your life easier?'
description: 'Asking the agents what slowed them down, and what came of it: an inner loop measured step by step, tools weighed and declined with numbers, one command for every check, a cloud environment that starts ready, and a twenty-minute CI run cut to a fraction.'
pubDate: 'Oct 15 2026 12:09'
series: 'itinera-built-together'
seriesPart: 10
tags: ['ai engineering', 'ai', 'software engineering', 'itinera']
draft: false
---

[Last time](article:a-project-not-a-session) the work moved into a project: a
coordinator starting threads, threads starting each stage within minutes of the last
one merging, and my attention turning into the scarce thing. That was speed between
the pieces of work. This time is about speed inside them: the day I asked an agent
what slowed it down, what it measured before it answered, and what we built from the
answer.

## What could make your life easier?

Stage 5 of the Rust implementation was under way, on the ninth of October. The
thread had just told me a layer was committed and "every local check passes, `cargo
deny` included". So I asked, in one breath:

> **Me:** would you tell me if you are using cargo check to assert code works on your
> side, or what stratagies with you use, or what could make your life easier?

First it said how it checks: `cargo build` and the affected tests while editing, and
before every commit all seven checks from the agents' manual, `AGENTS.md`, from
formatting to `cargo deny`, which audits the dependencies' licences and security
advisories. Then a separate reviewer agent, then CI again. Then the part I had asked
for:

> **Claude:** **What would make it easier:**
> 1. Put `cargo-deny` in the environment's setup script. The container starts without
> it, so each new session spends minutes compiling it before I can run the last check.
> 2. Add one command that runs all seven checks, such as `scripts/check.sh`. CI could
> call the same script, so my local run and CI can't drift apart.

Notice what is on that list. Nothing about the code. Both items are about the
environment the agent works in, the kind of thing a platform engineer does for a
team: make the first minute of a session cheap, and make "it passes on my machine"
mean the same as "it passes in CI".

## Measure before you buy

Then I reached for two tools with a reputation for speed:

> **Me:** have your heard about cargo nextest or similar, and what about configuring
> mold for tests / conformance builds?

nextest is a Rust test runner with better parallelism; mold is a fast linker, the
program that stitches compiled code into an executable. The agent's first answer went
the wrong way: nextest would not help, but mold might, because one test "took about
17s just now", and it offered to set mold up in CI. I had not asked about CI.

> **Me:** but here is the thing: ci is ok. Your many tests for your inner loop is what
> I wanted to try to make faster.

> **Me:** perhaps install mold on your machine and add a cargo config override at user
> level? So we don't need to commit this to the project, but I can install it in your
> environment.

So it measured its own loop, right there, after touching the engine:

| Step | Time |
|---|---|
| Build tests (`--no-run`) | 1.4s |
| Run the core unit tests | 1.4s |
| Clippy on the core | 2.6s |
| All 200 doctests | 3.6s |
| The new trybuild proofs | 7.9s |

And then:

> **Claude:** **Where my time actually goes:** reading code and writing changes, not
> waiting on cargo. The one real cost is setup: each new container has to install
> `cargo-deny`, which takes a few minutes.

mold "wouldn't gain much: since Rust 1.90, x86_64 Linux links with rust-lld by
default, and our toolchain is 1.98, so linking is already fast." nextest had nothing
to speed up. It still wrote me the setup lines for mold, outside the repository as I
had asked. But something did not add up:

> **Me:** but you said tests took 17 seconds.

> **Claude:** I said that, and it was only for the trybuild proofs, not the whole
> suite. Those 17s were their first run. trybuild keeps its own target directory, so
> the first run compiled itinera and its dependencies there from scratch and also
> wrote the expected error files.

Seventeen seconds cold, 7.9 warm. Both true, answering different questions. Which do
you optimise for? The agent's loop is warm almost all the time; a fresh container is
cold once. So the cost worth removing was not the linker. It was the minutes at the
start of every session, spent compiling a tool. I came in with two famous tools and
left with neither, and with a measurement of where the time went.

## One command, through cargo

That left the second suggestion, one command for all seven checks. The agent had
offered a shell script. I wanted it to feel like the rest of the project:

> **Me:** a, make the scripts.sh, or better yet, look for a cargo crate that allows you
> to do cargo run script

> **Me:** I am sure there was such a thing, and using cargo to run would be better. You
> can install this as a dev dependency in workspace.

There is, `cargo-run-script`, but cargo cannot run a binary from a dependency, so
every environment would still need a `cargo install`, "the same setup cost we just
hit with `cargo-deny`". What gives you a cargo command with nothing to install is a
pattern called xtask: a small crate inside the workspace, plus an alias. This is
`.cargo/config.toml` in `itinera-rs` on `main`:

```toml
[alias]
xtask = "run --quiet --package xtask --"
```

So `cargo xtask check` builds and runs an ordinary crate of the workspace, present
wherever the repository is checked out. It landed as
[#73](https://github.com/itinera-dev/itinera-rs/pull/73) the same night, after the
stage merged, as I had asked. The reviewer agent caught that `cargo deny` checked
only part of the workspace when started from inside a crate, so every check now runs
from the root. And the crate has a test,
`the_checks_are_those_the_agents_manual_requires`, which reads the list of checks out
of `AGENTS.md` and fails if the command and the manual disagree. The drift the agent
worried about now has a test standing on it.

## The environment the agent wakes up in

The first suggestion has a longer story, starting three days earlier. A cloud
session runs on a fresh machine, and you can give it an environment with a setup
script; the result is saved as a snapshot and reused for about seven days. A hook,
which runs every time a session starts, is not cached at all.

Preparing the first cloud session, the local agent suggested I leave the default
environment alone and let the repository bring everything. I did not want that:

> **Me:** no. I would create a intinera-rs environment. What is the url I have to go?

So Itinera got its own environment, whose setup script installs the exact Rust
toolchain and the oldest one we support. The repository pins the compiler too, in
`rust-toolchain.toml` (1.98.1, with `rustfmt` and `clippy`), so the cloud, my machine
and CI build with the same Rust. The agent also designed a SessionStart hook, a script
in the repository, so the setup would be versioned like code, and it went into the
first session's prompt. On `main` today it is not there. What carries the setup is
the cached environment and the pinned toolchain. That was on purpose: once the environment's own
setup script did the job, the hook had nothing left to do, so it never landed.

That afternoon the first session installed `cargo-deny` on its own, to prove its
`deny.toml` passed. The local agent pointed out that compiling it takes minutes and
that the cached setup was the place for it, and when I asked it to do it for me, it
came back with a prebuilt binary, its version and its checksum, checked so that "a
tampered or truncated file is never installed". Three days later, in stage 5, a
thread told me the container starts without it.
The reason was simple: I had never saved those lines into the
environment's setup script. I forgot. So every session paid for it on its own,
building or fetching it again, until the agents started giving up on running it
themselves and leaving that check to CI. My answer in the thread was
short:

> **Me:** ok, so I will install cardo deny after this thread is done.

## Docker Hub says no

Less than an hour later the same tool broke in CI, for a reason that had nothing to
do with us:

> **Me:** tgere is a failing dependency job

> **The coordinator:** That's Docker Hub rate-limiting the cargo-deny action, not our code.

The action CI used built a Docker image on every run, and Docker Hub limits
anonymous pulls; the runners share addresses, so the limit stayed exhausted and
re-running did not help. The thread proposed installing the `cargo-deny` binary on
the runner, same version, same `deny.toml`. That was
[#72](https://github.com/itinera-dev/itinera-rs/pull/72), reviewed and green about
forty minutes after the thread reported the failure. The `dependencies` job on `main`
still installs `cargo-deny@0.20.2` that way.

Notice the shape. One tool, three places: compiled by hand in a session, cached in the
environment, installed as a binary in CI. Each time the fix was to stop building or
pulling what could simply be downloaded, at a version written down.

## The wait was mine too

Not all the waiting was on the machines. The day before stage 5, the stage 2 thread
explained that it ran the local checks and the review together, and only pushed when
both were done, so CI started last. I did the arithmetic:

> **Me:** so, for me it seems the time your independent reviewer checks could be
> parallelized with the time ci checks, right?

It agreed, and named the cost: a review finding becomes a second push, and I might
already be reading the version the review will change. Its recommendation was to
review alongside CI for later pushes, and review first for a new pull request, "since
that's the version you read first". I took it, and added the half that was about me:

> **Me:** 1, and that needs to be a rule. It can also become a rule, so that I am
> actionned when both are green, so at first time when your review and the ci pass,
> after whem the last of these pass. I think we are faster then.

Both are in `AGENTS.md` today. The second reads: "Tell the maintainer a pull request
is ready for review only when both the review and the CI of its latest push have
passed, as soon as the later of the two does." My time is part of the loop too, and
the cheapest way to save it is to not be called until there is something to do.

## Why is this so slow?

On the eleventh, the busiest day of the project, a pull request for rescue steps sat
in CI so long that I asked the thread to look for an infinite loop:

> **Me:** see if the tasks are outputing stuff infinitely.

> **Me:** ok, it finally ended, after almoost 20 minutes. So no infinite loop, but we
> do need to try to optimize that.

Half an hour later I asked the services thread "please, report. Why is this so slow?
Are we under any issue?", and that one was work, not waste: every layer reviewed
twice, a macros redesign, a rebase. "Slow but not stuck."

The CI one was different. The agent found it in the compile-error tests, the tests
that check a wrong program is refused by the compiler with the right message: about
3.3 seconds per case on Windows. And most of that was not the broken programs. Each
one has a twin that must compile, and trybuild built, linked and ran every twin as a
separate executable. It offered three fixes: compile all the twins together into one
test target, run the compile-error tests on Linux only (compiler messages read the same
everywhere), or both. I picked both, and asked two questions of my own:

> **Me:** 3, but I want to ask you something else: wouldn't a cargo check on stuff
> expected to fail be enough? And wouldn't installing mold on ci make things faster,
> even for the ones that must run?

The first, it said, was already what trybuild does once the twins are gone: the
broken programs get `cargo check`, and their error text is still compared with the
expected one, since "a plain 'it fails' would also accept a failure for the wrong
reason, such as a typo." The second it declined again, with a new reason on top of the
old one: after the change each test target links once instead of about a hundred
times, and "the slow job is Windows, and mold doesn't support Windows or macOS."

[#111](https://github.com/itinera-dev/itinera-rs/pull/111) merged a little over an
hour after I first asked. Locally the compile-error tests went from 100 to 27 seconds
and the proofs from 30 to 4. In CI:

| Tests job | Before | After |
|---|---:|---:|
| Windows | 8m14s | 2m26s |
| macOS | 3m18s | 1m35s |
| Linux | 2m12s | 1m09s |

## The linker came back

The last pull request merged into `itinera-rs` as I write this is called
[#158](https://github.com/itinera-dev/itinera-rs/pull/158), "Speed up CI: no debug
information, rust-lld on Windows". I asked for it, again. I had been
reading about `lld` and wanted it tried; the agent added the other half, to stop
generating debug information on CI at all, since nobody would ever use it there. It is two commits and five lines, all of them in the CI workflow:

```yaml
env:
  CARGO_TERM_COLOR: always
  # Nothing in CI reads debug information,
  # and writing it makes building and linking the tests slower.
  CARGO_PROFILE_DEV_DEBUG: 0
  # The linker that ships with Rust links the tests faster than Microsoft's.
  CARGO_TARGET_X86_64_PC_WINDOWS_MSVC_LINKER: rust-lld.exe
```

The commit messages carry the measurements. No CI job reads debug information, so CI
stops writing it. And on Windows, the slowest job, the tests now link with `rust-lld`,
which "ships with the Rust toolchain, so nothing has to be installed": with a cold
cache, building the tests went from 1 min 46 s to 1 min 37 s, and the doc tests from
83 s to 49 s.

Do you see what happened? My mold question, turned down twice, came back as the right
answer to a narrower question. Not "a faster linker everywhere", which Linux already
had, but "a faster linker on the one system that is slow, with nothing to install".
The agent did not decline the idea. It declined the version of it that would not pay.

## What we learned

What I would keep from asking:

1. Ask the agent what slows it down; the answer was about its environment, not its code.
2. Ask it to measure before you pick a tool, and ask which run the number came from, cold or warm.
3. An idea turned down with numbers can still be right somewhere narrower, so keep it.
4. One command for every check, tested against the manual, keeps the agent's run and CI from drifting apart.
5. Put setup where it is cached and pin every version, so a fresh session starts ready.
6. Your own waiting is part of the loop: be called once, when the review and CI are both green.

## Which jobs this one was doing

Three, and one of them by a wide margin. No product owner, no architect and no
reviewer this time: nothing here changed what Itinera does or how its code reads.

- **Platform engineer:** asking what would make the agent's life easier; nextest and
  mold weighed and set aside on its measurements; "using cargo to run would be better",
  which became `cargo xtask check` (#73); a dedicated `itinera-rs` environment instead
  of the default, and asking for `cargo-deny` in its cached setup; the Docker Hub
  failure, which became an installed binary (#72); and "we do need to try to optimize
  that", which became #111.
- **QA:** "but you said tests took 17 seconds", which split a cold number from a warm
  one; suspecting an infinite loop and watching the twenty-minute run to its end; and
  asking whether a `cargo check` was enough for the programs that must fail.
- **Project manager:** the review run alongside CI, and "so that I am actionned when
  both are green", which made my attention a rule; and "please, report. Why is this so
  slow? Are we under any issue?"

The six are counted in [*The night that produced no code*](article:the-night-that-produced-no-code).

## Next time

The machines got faster, and that made the other problem sharper: several threads
writing code means more code than one person reads. [Next
time](article:some-rule-needs-to-be-written) is about supervising once you cannot read
everything, and the question that framed it: did you ignore some rule, or does some
rule need to be written?
