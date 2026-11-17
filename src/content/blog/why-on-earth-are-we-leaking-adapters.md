---
title: 'Why on earth are we leaking adapters'
description: 'The first trap of the week. Reading the code of a first version that passed every check, I found a hand-made argument parser, a library exporting its adapters, scattered policies and errors living among the entities. Every reviewer had done its job. The rules they needed lived only in my head and in two older projects, so the first fix was a document.'
pubDate: 'Nov 17 2026 12:03'
series: 'gherkin-glass-built-in-use'
seriesPart: 4
tags: ['ai engineering', 'ai', 'software engineering', 'rust', 'gherkin-glass']
draft: true
---

[Last time](article:one-question-at-once-please) the process worked as designed:
nineteen issues settled one decision at a time, an independent reviewer before
every pull request, and a stack of 25 pull requests holding the whole first version
by the evening of the first day. This time is the morning after, when I read the
code those reviewers had approved and found it was not built the way I build
software. It is the first of the two traps of the week, and the more instructive
one, because nobody did anything wrong except me.

## A command line parser by hand

It started the night before, at 23:19, while I was going through the stack:

> did you build a command line parser by hand in 27 instead of using clap?

It had, in a way. The thread that built the command line used [lexopt](https://github.com/blyxxyz/lexopt), a small crate
that splits arguments into flags and values, and wrote the grammar of `ghg build`
by hand on top of it. Its reason was recorded on the issue: [clap](https://github.com/clap-rs/clap) writes its own
help and error messages in English, and every sentence the tool prints was meant to
come from the [Fluent](https://github.com/projectfluent/fluent-rs) catalogue.

The agent that answered me checked the branch, and then did something I value: it
judged the reason instead of defending it. "That reason is weaker than it sounds."
clap can be made to fit, by turning off its built-in help and writing the messages
from the catalogue. It recommended keeping `lexopt` for the first version anyway,
since it worked and was tested. I asked it to look properly:

> look in the internet how clap can be localized, with fluent.

It came back with clap's own issue on localisation, open since 2016, the
maintainer's recipe, and a crate that does the error part, which it downloaded and
read. clap replaced the hand-made parser the next afternoon. A small thing. But it was the
first sign that the code had been built to pass checks, and that some of my
preferences were not among the checks.

## Why on earth

The next morning I asked a broad question first, to see where the agent stood:

> Do you think the architecture we set for this project fits clean code?

Then the one I actually meant:

> my question is this: if we ae using clean code, which I agree, then why on earth are we leaking adapters outside of the lib entry point with pub use, if adapters are choosen, and they should be a detail?

Here is what that means for anyone who does not write Rust. The project is a
library plus two small programs, `ghg` and `cargo-ghg`, that call it. In ports and
adapters, the adapters are the parts that touch the outside world: reading files,
parsing Gherkin, serving pages. They are a detail. Nothing outside the core should
know which ones were chosen. And yet the library's front door, `lib.rs`, was
handing them out to anyone who asked.

The answer did not hedge:

> You're right, and there's no good reason for it.

And then it explained how it happened, from reading the files at the top of the
stack. The architecture document put the composition root, the one place that
names the concrete adapters, in the binary. In Rust, a binary is a separate crate
from its library. So for the binary to build the adapters, the library had to make
every one of them public. The front door ended up exporting nine adapters, nine
ports, four services, about 45 entities and several policies.

Read that again, because it is the most important sentence in this part. The
reviewers did not miss a rule. They enforced one. The written architecture said
where the composition root lives, every reviewer checked that it lived there, and
the consequence of that rule was the leak.

## What does everyone else do?

I asked whether the community had a pattern for this, since a tool like this is not
really a library:

> right. And this makes sense because, if you think about it, this is not exactly a lib, right? It is abinary, and we just deliver it as a lib to follow rust standards. I wounder how the community in general dealth with this

The agent downloaded the latest releases of four well-known Rust tools, [just](https://github.com/casey/just),
[fd](https://github.com/sharkdp/fd), [ripgrep](https://github.com/BurntSushi/ripgrep) and
[bat](https://github.com/sharkdp/bat), and read how each was laid out. just was the closest: a library
whose front door exports one entry point, `run`, with everything else private to
the crate. fd has no library at all, and tests its binary as a process.

I knew which one I wanted before it finished:

> just layout. You can ask a new thread to plan and implement that, and also modify athe architecture to split large modules. I bilieve acter had such gate, and probably you didn't use it. It is woth to investigate what else acter has to offer, and also itinera-rs in terms of quality. You can just push some more refatoring prs on top of the stack, while I review the previous. Just let me know the next steps.

And a minute later, the most important instruction of the day:

> but before anything else, modify the documents so your independent reviewer can get these problems on next prs.

## Documents first

If I had asked for the fix, I would have had a fixed `lib.rs` and nothing else. The
next feature, built by the next thread and checked by the next reviewer, would have
had no reason to keep it that way. So the first pull request of the refactoring
changed no code at all. It changed `docs/ARCHITECTURE.md` and the reviewer's
checklist in `AGENTS.md`:

- `lib.rs` exports the two entry points and nothing else, and every new bare `pub`
  is a finding;
- the composition root moves into the library, where it can see everything it
  wires without making anything public;
- a test in `tests/` reaches the code only through the entry points or a binary;
- every file has a size it should stay under, as a guide for judgement, not a gate:
  200 lines of code, 150 of tests, and a file with several responsibilities splits
  at any length.

The issue that held it, #45, records every decision in its body, as every issue in
this project does. The refactoring that followed did not get issues of its own. I
said so plainly when one was proposed:

> The composition do not need issues of theirs. This is refactoring. The new guidelines on 45 just need to be applied, in as many prs as we think we need.

## This is rework

Then I asked a question I already knew the answer to:

> While you are here: did you get either acter or itinera-rs, not sure, guides to use test tables whenever tests can be parametrized?

[itinera-rs](https://github.com/itinera-dev/itinera-rs) has that rule.
[acter](https://github.com/marlon-sousa/acter) does not. The agent quoted it, and offered to do
something with it later. I wanted it in now:

> no, I want it in 45.

> and next layers would check also whether we can simplify tests.

And then the message I am least proud of, and most glad I sent:

> I clearly didn't comunicate well when I asked you to bering every good thing acter and itinera-rs did. This is rework.

On the first day I had asked for acter's architecture as the model. What I got was
acter's shape: its folders, its roles, its comment rules. What I meant was
everything those two projects had learned: their rules, their gates, their tooling.
The agent had narrowed my request to the most literal reading of it, and I had not
checked. "You're right, I narrowed it," it said, and went through both projects in
full: itinera-rs's manual, contributing guide, CI, `clippy.toml`, `deny.toml` and
skills, and acter's manual, architecture, comment specification, CI and scripts.
Every practice that fitted went into #45, with the source of each.

I asked for one more thing while it was at it:

> while you are at it, say me everything you would detect that could make thisncode more structured.

That came back as an audit of fourteen themes, from types that should replace
booleans and strings, to policies with no home. And I checked one rule by name,
because it is the one I care about most:

> yes, please. Did you find the reuse rule? First what standard library offers, then what crates we already use offer, then if known and well maintained crates can help, last we code by hand?

It had, in itinera-rs's manual, in that order.

## The rest of the day

From there the work was layers. Each was planned, built, reviewed by an independent
agent and stacked on the one before, while I merged the bottom of the stack:

> Will I disturb you if I merge down prs meanwhile?

It did not. The layers that day, roughly in order:

- the front door down to two entry points, and every test that had reached into the
  internals rewritten to drive `ghg` or moved next to the code it checks;
- types for what had been booleans, numbers and strings: the serve mode, exit
  statuses, content types;
- the command line moved to clap, localised through the catalogue;
- the largest files split;
- the policies grouped by area, after I had complained that "the policies are all
  scathered";
- every error moved into one `errors` module, each one writing its own sentence
  from the catalogue, after I had pointed out that "problems" lived among the
  entities;
- the contrast of every border and focus outline checked in the browser.

Two of my questions that day ended differently from how I expected. I asked why we
used two regex crates, `regex-automata` and `regex-syntax`, rather than plain
`regex`. The agent read regex 1.13.1, the version already in our lockfile, and
showed that the plain crate could not anchor a user's pattern safely or report a
typo in a replacement. We kept them. What changed was the rule: the project's
manual now says the plain crate comes before its internals, and the internals are
used only where the pull request names the file and line of the plain crate that
cannot do the job. Another rule came from the same kind of moment: before saying a
library can or cannot do something, read its source or its documentation at the
version we use, and say what was read.

## So many things changed

At 16:44 I stopped and wrote what I was feeling:

> So mamy things changed, sorry. The design was poorly planned yesterday. How ddo you see things now?

The answer:

> No need to apologise. The review caught these changes, and each one makes the
> design better.

Then it laid out where things stood. The stack had grown to 36 layers. And it
proposed something I should have asked for myself: re-review every open layer, the
ones from the first night included, against the full new checklist. Three
independent reviewers went through them that afternoon. None of the layers had to
change before merging. Every finding became a small layer of its own on top, about
twenty of them, most of them tests becoming parametrised cases, loops and chained
closures becoming named functions, and a few large files split.

It also said something that will matter in the next parts. The way pages were built
was going to need a real redesign, not more tidying, and it recommended agreeing
the design on paper before any code moved. That is where the rest of the week went.

## Whose trap was it?

Mine. I want to be precise about why, because this is the part worth taking away.

The reviewers were not careless. They checked every item on their list, every time,
and the list was long. What they could not check was a rule that was not on it.
acter's gate against exactly this kind of leak existed in my memory of acter, not
in this repository. The test parametrisation rule existed in itinera-rs's manual,
not in this one. The reuse order existed in my head and in a file the agents had
not been asked to read.

When you start a new project with agents, you are not starting with your old team.
You are starting with a very capable team that knows exactly what you wrote down
and nothing else. Every rule you carry from the last project is a rule you have to
carry into the repository, explicitly, before the first reviewer runs. Asking for
"everything good from those projects" is not carrying it. Reading what came back,
and checking it against what you meant, is.

## What we learned

1. A reviewer enforces the rules it is given, and enforces a wrong one just as faithfully as a right one.
2. A rule that lives in your head, or in another repository, does not exist for a new team of agents.
3. When you find a problem, change the document the reviewer reads before you change the code.
4. "Bring everything good from X" will be read narrowly unless you check what came back.
5. Re-review what was already approved against the new rules; the cost is a few small layers on top.
6. Ask the agent to judge its own past reasons, not defend them, and ask what it read.

## Which jobs this one was doing

Two, and the unevenness is the point: this was architecture and review, and nothing
else.

- **Architect** — "why on earth are we leaking adapters", just's layout over fd's,
  the composition root moved into the library, the policies grouped and the errors
  given a module of their own.
- **Reviewer** — reading code that had passed every check, "before anything else,
  modify the documents so your independent reviewer can get these problems", and
  three reviewers re-reading every open layer against the new list.

No product owner, no QA, no platform engineer: nothing a reader of the pages would
notice changed all day, and that was the rule.

The six are counted in [*The night that produced no code*](article:the-night-that-produced-no-code).

## Next time

The second trap, which took a day longer to find. Designs coming back thin, names
that said nothing, answers that missed the point, and the question I finally asked
in the middle of a review. That is
[*What is your thinking level?*](article:what-is-your-thinking-level)
