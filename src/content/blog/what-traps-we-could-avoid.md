---
title: 'What traps we could avoid'
description: 'The week of Gherkin Glass in one view: the agentic development cycle that made a usable tool in two days, every trap it still walked into, the rule each trap left behind in the repository, what it cost against what it bought, and the parts that stayed human.'
pubDate: 'Nov 19 2026 12:08'
series: 'gherkin-glass-built-in-use'
seriesPart: 9
tags: ['ai engineering', 'ai', 'software engineering', 'accessibility', 'gherkin-glass']
draft: false
---

[Last time](article:what-a-outline-is) I listened to the pages with a screen reader
and found what no automated check could: an outline nobody had explained, headings
that said "Example" over scenarios, and a button disabled only for assistive
technology. The second alpha went out on the Monday. This last part puts the whole
week in one view: the cycle, the traps, the rule each trap left behind, what it cost
and what it bought, and what stayed with me. If you read only one part after the
first, this is the one I would choose.

## Not a confession

I said in the first part that this series is not meant to say "look how clever I
am", nor "look how wrong I was". Let me say what it is meant to say.

At the end of the [Itinera series](article:thanks-for-this-great-work) I wrote that
after the first set of pull requests we had almost no issues with the code
respecting the architecture. Here, on the second morning, the code did not respect
an architecture I had never written down, and the agents designed for a day and a
half at an effort level nobody had chosen. Same person, same tools, a month later,
with a better process than the one I started Itinera with.

That is the lesson. A mature process does not mean one that never walks into a
trap. It means one that notices quickly, fixes the cause rather than the symptom, and
writes the fix down where the next session will find it. All but one of the traps
below left a written rule, most of them in the repository itself, and the one that
did not is marked. The next project starts from those rules, not from my memory.

## The cycle in one view

This is the cycle that ran all week, as it stood at the end of it, after every
correction:

1. **Agree before code.** An issue is settled with me one decision at a time, each
   question with a recommendation and its reason, and the decisions move into the
   issue's body, which binds the work.
2. **Behaviour before code.** What the tool promises goes into the behaviour
   document first, rule by rule, and every rule comes with a fixture and a test in
   the same pull request as the code that makes it pass.
3. **Pin what a person sees.** Every fixture and the example suite carry a committed
   copy of the site they must produce, compared byte for byte. A refactor that
   changes a page fails.
4. **Write the architecture down, and make it checkable.** The architecture document
   says what each module may do and what the library may export, and a reviewer item
   exists for every rule in it.
5. **Design at high effort, code at medium.** Designs are agreed with me, written
   into an issue or a design note, and reviewed. Coding threads build against them.
6. **Review independently, at high effort.** Before any pull request opens, a
   separate agent, given the change and never its author's reasoning, goes through the
   reviewer's checklist, twenty items by the end of the week, and looks at the pages in a browser when a change can alter
   them.
7. **One stack, many threads.** Work is split along the dependency graph, one thread
   per piece, run in parallel where nothing waits, assembled as one stack I merge from
   the bottom.
8. **Questions come to me one at a time**, through the coordinator, and a timer pokes
   any thread that has gone quiet.
9. **The human checks stay human.** Every pull request that changes what a page says
   carries screen reader checks as unticked checkboxes for me, and I merge and tag.
10. **Ship early.** An alpha as soon as there is something to try, and the feedback
    fed straight back into the stack.

## The traps, and the rule each one left

| Trap | How it showed | The rule it left | Where it lives |
|---|---|---|---|
| Rules that lived only in my head | The library exported its adapters; errors lived among the entities; the policies were scattered | `lib.rs` exports two entry points; errors in one module; folders by role and area | The architecture document and reviewer items 3, 13 and 14 |
| A request read narrowly | "Every good thing acter and itinera-rs did" came back as acter's folders | The reuse order, parametrised tests, file size guides, all with their sources | The agents' manual and the issue that collected them |
| A default nobody chose | Thin designs, poor names, a reviewer as shallow as the author | Code threads at medium, independent reviewers at high | The review skill and the project's memory |
| Waits that fail silently | Threads that stopped while waiting on CI | A timer that pokes waiting threads | The project's memory |
| Approving before the rules existed | 25 pull requests reviewed against a shorter list | Re-review every open layer when the list grows | Nowhere yet: a practice, not a written rule |
| Claims about libraries from memory | A parser written by hand to avoid clap; two regex crates without a reason | Read the source at the version used before ruling a library in or out; the plain crate before its internals | The agents' manual, rules 8 and 9 |
| Names that say nothing | `self.parser.read(...)` | Names say what they are: `self.gherkin_parser.parse(...)` | The project's memory |
| A cost the users never saw | Pages opened from disk came up bare | The page itself says it was opened from disk; the README describes every command as it is | The behaviour document and reviewer item 20 |
| What a check cannot see | Search touching the folder tree; examples that could mean two things | A visual session when the reviewer judges it relevant; screen reader checks on every page change | Reviewer item 19 and the pull request checklist |

Read the table from top to bottom and a pattern shows. Almost every trap is the same
trap at a different depth: something I knew or assumed, that the team of agents had
no way to know because it was not written down. A rule. A setting. A cost. A way of
reading a page. The fix was always the same too: write it where the next agent will
read it, and give a reviewer an item to check it.

## What stayed human

Plenty, and none of it was typing.

**The decisions.** Every one of them, one at a time. "We will do all as the first
version." Strictly empty output folders. Dropping disk support against the agent's
advice. "Feature files" over the tool's own name, on the agent's advice. List items,
not headings.

**Reading the code.** No check found the leaking adapters, the hand-made parser, the
scattered policies or the copying. Reading did, and asking "why?".

**The smell.** "why would an adapter call back a policy inn the domain? This is a
smell." The agent had written that code. I was the one who smelled it.

**The guess.** "I bet you are" medium effort. Noticing that a day of thin work had a
cause other than my own instructions.

**The ear.** "What a outline is?" Nothing else in the project could have asked it.

**The merges and the tags.** Every stack merged by me, from the bottom, and every
release tagged by me. The one act that publishes to the world stays with a person.

And the agents did far more than type. They pushed back with reasons: keep disk
support, "Feature files" rather than "Gherkin Glass", keep the outline's order. They
judged their own past reasons instead of defending them, as with the hand-made
parser. They read the source of every library before ruling on it, and said which
file and which line. They designed most of the system, and accepted my bets when
mine were better. They reviewed each other, and wrote down what they learned so the
next thread would know it.

## What it cost, and what it bought

The traps were not free. The first one cost about twenty small fix layers and a day
of refactoring that would not have been needed had the rules been written on the
first morning. The second cost a day and a half of designs I later had to correct,
and part of the first redesign. Put together, perhaps two days of the week went to
work a better start would have avoided.

What they bought, or rather what the speed bought despite them:

- a complete first version on the evening of the first day, on main the next
  afternoon;
- real feedback from the third day: a friend, an outside tester, my own screen
  reader;
- two redesigns of the core with not one expected page changed;
- two alphas in seven days, with binaries for five platforms and a public site;
- in those seven days, 461 commits, about 26,600 lines of Rust and 220 rules of
  behaviour, each with its fixture and its test.

There are published ways to estimate the same work without agents, and, as with
[Itinera](article:a-year-or-fourteen-days), none of them is kind.

The most used effort model, [COCOMO II](https://arxiv.org/pdf/1912.04189), works
from size. Feed it only the Rust above and it answers with about nine person-years.
It is calibrated on teams inside companies, meetings and all, so take it as a
ceiling nobody would reach working alone.
[Published figures](https://successfulsoftware.net/2017/02/10/how-much-code-can-a-coder-code/)
for what a developer delivers on a small project run from about 20 to 125 lines a
day. Count everything the agents wrote, about 34,000 lines with the pages' script,
the stylesheet and the templates, and even the generous end is more than a year of
working days. The prose, about 55,000 words of behaviour, architecture, README and
guides, is [usually estimated](https://www.techscribe.co.uk/techw/documentation-project-metrics.htm)
at three to five hours per finished page: two to six months of writing on its own.

Lines are a poor measure of effort, and the models describe teams, not one person
who knows exactly what he wants. Discount all of it heavily. It still does not come
in under six months.

So when I say this would have needed at least six months of paid, full-time work,
that is my own guess, and the conservative one. The week above is measured from git.
Weigh the two as different kinds of number.

## This is what mature looks like

None of this would have been possible without years of doing this the old way, and
without having studied agentic development seriously. Not because the agents needed
a typist. Because they needed somebody who knew what to agree before code, what to
pin before a rewrite, what a reviewer should be asked, and when a thin design means
the instructions were vague and when it means something else.

And none of it would have been safe without behaviour-driven development, which I
believed in before this week and believe in more after it. Gherkin Glass exists to
make feature files readable, because a specification that is also the tests cannot
drift, and the same idea, applied to the tool itself, is what let me rebuild its
core twice without a single page changing. The more of the code agents write, the
more that kind of documentation is worth.

The traps are the evidence, not the exception. They are the ones any experienced
engineer walks into with a new team: you assume the team knows what you know, and
works the way your last team did. What a mature cycle adds is speed in noticing, a
habit of fixing the cause, and a repository that remembers. That last one is the
whole difference. A team of agents forgets everything when a thread ends. A
repository does not.

## What we learned

1. A mature cycle is not one without traps; it is one that notices them fast and writes the fix down.
2. Almost every trap is something you knew and never wrote where an agent would read it.
3. Pin what people see before you rebuild what they cannot.
4. Give the reviewer more thinking than the author, and an item for every rule you care about.
5. Ship as soon as there is something to try; the feedback is worth more than the polish.
6. Decisions, reading the code, the merge, the tag and the human senses stay with a person, and the cycle should be built around them.

## Which jobs this one was doing

All six, for the only time in this series after the first, because a retrospective
is where each of them has to account for the week:

- **Product owner** — "we will do all as the first version", the promises of the
  first afternoon, and the screen reader session that redesigned outlines.
- **Architect** — the leaking adapters, my bet on the pipeline, the incremental
  rebuild in four steps, and "This is a smell".
- **Project manager** — one question at a time, threads planned from the dependency
  graph, the timer, and the effort split between coders and reviewers.
- **Platform engineer** — stacks through the REST API, alphas kept off crates.io, and
  two releases tagged by hand.
- **QA** — every page pinned byte for byte, and an agent with a browser measuring the
  layout.
- **Reviewer** — reading what had passed every check, re-reviewing what was already
  approved, and a checklist that grew to twenty items from the traps in the table
  above.

The six are counted in [*The night that produced no code*](article:the-night-that-produced-no-code).

## What it enables

There is no next part. Gherkin Glass is at 1.0.0, released with this series, and
its repository is public: its
[agents' manual](https://github.com/marlon-sousa/gherkin-glass/blob/main/AGENTS.md)
with the reviewer's checklist, its
[contributing guide](https://github.com/marlon-sousa/gherkin-glass/blob/main/CONTRIBUTING.md),
its [architecture](https://github.com/marlon-sousa/gherkin-glass/blob/main/docs/ARCHITECTURE.md)
and [behaviour](https://github.com/marlon-sousa/gherkin-glass/blob/main/docs/BEHAVIOUR.md)
documents, the skills its reviewer agents run, and every issue with the decisions in
its body.

So the cycle can be copied, traps included. Take the files, change the nouns, and
look at the table above before your first morning rather than after it. And if you
want the tool rather than the process, the
[project's site](https://marlon-sousa.com/gherkin-glass/) shows what it makes of a
real suite of feature files. Point it at your own, browse them as a product owner
would, and if you use a screen reader, listen to them too.
