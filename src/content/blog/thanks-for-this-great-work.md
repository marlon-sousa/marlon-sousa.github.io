---
title: 'Thanks for this great work'
description: 'The release of Itinera 0.1.0-beta.1, and what stayed in human hands when nearly everything else had been handed over: scope, naming, a question about packaging, the tags and the publish. Then the agent’s own verdict, and the close of the series.'
pubDate: 'Oct 15 2026 12:13'
series: 'itinera-built-together'
seriesPart: 14
tags: ['ai engineering', 'ai', 'software engineering', 'itinera']
draft: false
---

[Last time](article:do-these-all-at-once) was the book: a whole first draft in
under an hour, every example compiling, and then three days of rewriting at a
pace set by how much I trusted the agent, while reading it as a newcomer changed
the API more than any review had. This time it is the release, and the end of the
series. What did I keep for myself when nearly everything else had been handed
over? And what does it all add up to?

It is the fourteenth of October. The release stack is reviewed,
CI is green, and the agent has just listed the steps left, marking which are
mine. I say the word:

> **Me:** The book is fixing stuff on their side, nothing to do with api usage. If
> we don't need to wait, go.

Less than a minute later I want to change the addresses the crates will link
to:

> **Me:** a, wait wait.

Too late, of course. Did you think an agent waits for you to finish a thought?

> **Claude:** Your "wait" arrived just after I started merging the release stack
> (#99, #100, #101), and that merge can't be cancelled once it starts. … Nothing
> public or irreversible has happened. Nothing is published or tagged.

So. Is everything lost? Run for the hills? No, and the reason is the whole of
this article. The merge it could not stop was a merge into a branch, which can
be undone with another pull request. The things that could not be undone, the
tag that starts a release and the publish that puts a version on crates.io
forever, were not the agent's to do. It knew which side of that line it was on,
and so did I. The addresses were switched in one small pull request, to
itinera-dev.org, before anything went out.

## The beta kept growing

The release was planned on the eleventh, as 0.1.0-rc.1. The agent built the
whole machinery that afternoon: a release gate that refuses a tag whose version,
changelog or conformance list is wrong, a release workflow, property tests. And
the first thing I said about it was no:

> **Me:** ok. I want all on repo without publishing yet. Do all you can, but we
> are not yet ready to release.

Then the scope moved under it. Services and rescue steps became tier 1 stages
that same afternoon, and I told the release thread to wait for both. The next
evening, a thread investigating data that every event of a journey should carry
told me it was not worth holding the beta for:

> **Claude:** **Beta.1:** I would not hold it. In Rust this change only adds
> things, because `Event` is non-exhaustive. … It can ship in beta.2.

A good argument. Adding a variant to a type marked `non_exhaustive` breaks no one,
so it could have come later. I overrode it anyway:

> **Me:** Also, this needs to be tier 1, so it goes on beta. Code it.

Notice what the override cost. It went through a proposal, its conformance cases,
a new release candidate of the cases, and the Rust change, like any other. The
release planned for the eleventh went out on the fourteenth, carrying all of
it.

Scope is the one thing an agent will never close for you. It will tell you,
honestly, that something can wait. Whether it waits is still yours.

## Does -rc signal it is far from production?

The version was 0.1.0-rc.1 because the specification and the cases were release
candidates too, and the agent had matched them. I was asking about something
else, how to claim the crate names, when the question came out sideways:

> **Me:** does -rc or anything signalizes it is far from production?
>
> **Claude:** So `-rc` tells people "nearly production", the opposite of what you
> want to say. We chose rc to match specification 0.1.0 and the cases, which are
> rc too.

It recommended alpha. I said "beta, I would say. Do it." A two-letter suffix,
and it was the wrong message for a library nobody outside the project had ever
used. The agent's choice was consistent with everything around it. It was not
consistent with what a stranger reading crates.io would understand, and only a
person asking what a stranger would understand caught it.

## The question that found missing licences

Half an hour before the tag, with everything green and the commands ready, I
asked one more question:

> **Me:** what is packaged in cargo publish dry run? Are we packaging specs, and
> other things that should not go?

The specifications were not in it. Two other things were:

> **Claude:** **One real gap:** none of the three crates includes `LICENSE-MIT` or
> `LICENSE-APACHE`. They live at the workspace root, and Cargo doesn't copy them
> into the packages. MIT requires the licence text to travel with the code, and a
> published version can't be changed afterwards, so this must be fixed before you
> tag.

And all of `tests/` was going out inside the main crate, about 330 files of
compiler proofs and conformance fixtures that no user would ever run. One pull
request later the package went from about 380 files to 12, licences included.

Every check had passed. The dry run had passed. Nothing in the pipeline looks at
what is inside the box, because nobody had told it to. A question did, and the
answer was the last thing fixed before a version that can never be replaced.

## What only I could do

Some of what stayed with me stayed because I wanted it to. Some stayed because
the environment would not let it go anywhere else, and I want to be honest about
which was which.

The cloud sessions could not push tags. When the agent tried, the proxy in front
of it said no:

> **Claude:** The proxy refused the tag push for both `git push` and the REST API
> (HTTP 403, write access not permitted). Your authorization can't get past it
> from here.

So every release candidate of the conformance cases from rc.9 to rc.15 was
tagged by me, from commands the agent wrote out, and so was the release of the
shared actions and the release tag of the library itself. One of them waited
for me because I was away from a computer. That was not a principle. It was a
limit, and it happened to put me exactly where the rule at the end of this
section says I should be.

The publish was a choice. I had said how the first one would go before we
planned anything:

> **Me:** so many things have changed. The book, the code, the specs. Take a look
> to see whether you need something, then if not we plan slowly the publication
> process. First version I will do by cargo login on my environment

The agent offered three ways to fit that into the workflow, and recommended one
that kept the publish inside it, behind my approval. I picked the one with no
publish job at all.

There was a technical reason too. Trusted publishing, where a registry is told to
accept releases from one specific CI workflow so that no token is stored
anywhere, can only be set up on crates.io for a crate that already exists. The
contributing guide said as much at the time. So the first version of each crate
had to go up some other way, and I chose the way where my hands were on it. On
the evening of the fourteenth I ran `cargo publish --workspace` on my own
machine, and the agent checked the three crates from a fresh project, the oldest
supported Rust included. Trusted publishing was set up straight after, so the
next release goes out without me typing a token.

The same line ran all the way back to the second of October, before any Rust
existed. The agent had recommended a GitHub App for the organisation's
automation and was filling in its form, when I stopped:

> **Me:** I think this would be over. Why can't I just use a pat?
>
> **Claude:** You can use a fine-grained token. Honestly, right now we need neither
>
> **Me:** we will create the app when and if it is needed.

It was never created. The token we did make needed an organisation setting
changed, and the agent, with my approval in the chat, tried to change it. A
safety check guarding its actions refused. It did not look for another route:

> **Claude:** I won't try this change another way: that would be going around the
> check. It's your call.

I changed the setting myself. Then, for the secret:

> **Me:** so create a secret repo by repo, and I past the token.

The agent opened the form and never read the token. I pasted it.

Look at the pattern. I authorised repositories, merges, issues, whole threads of
work. What I kept was small and specific: tags, the publish, secrets, a setting
that guards the organisation. The rule I would draw from it is not "keep the
important things". Everything here was important. It is **keep the irreversible
things**, and delegate the rest where you can see it.

## Mature enough for a beta

On release day, before the "go", I asked for a straight answer:

> **Me:** Overall do you think this is mature enough in terms of api surface,
> documentation, and process to be used?

The answer was headed *Mature enough for a beta, not yet for 0.1.0*. It listed
what was solid: every tier 1 conformance case passing, property tests over
generated workflows, every public item documented with an example that runs, a
book that compiles and tests everything it shows. Then what said beta:

> **Claude:** **The API is still moving.** About 30 PRs have merged since 11
> October, and several changed what users write …
>
> **No outside user yet.** The book is the only real consumer, and the same team
> wrote both. You haven't reviewed chapters 17 and 22 to 42 yet, and they are the
> best proxy for a newcomer.

The same team wrote both. That is the sentence I would put on the box. Everything
in this series, the specification, the cases, the reviewers, the book, checked
the work against itself. None of it is a stranger using the library for
something we did not imagine. The agent said it unprompted, and by its own count
it named the part of the review I had not done.

It closed with a suggestion: publish the beta, then get one or two real
workflows written by someone outside the project, and treat what hurts as the
list for 0.1.0. That is still the open item, and it is the one I would most like
your help with.

## This is not vibe coding

None of this would have been possible if I had not been doing this for a long time,
and if I had not studied agentic development seriously. Not the architecture, not the
process, not the choice of language or frameworks.

And the way of working together that this series describes would not have been
possible with the classic engineer's view of agents either. That view comes in two
flavours. In one, agents produce crap that we then have to put up with. In the
other, agents are so useless that we have to work out the solution ourselves, write
it down in structured English, and have them translate it into code. Either way, the
engineer stays the only one thinking, and the agent is at best a typist. Add to that
the need to prove that I was better than the agents, and nothing in this series
would have happened.

Itinera shows the very opposite. The agent proposed the name, the principle that
outcomes state facts, the test that decides what belongs in the specification, and
designs I took on the spot. It argued back, refused to build ahead of the spec, and
caught mistakes I had made. I settled what we argued about, set the rules, and kept
what could not be undone. Neither of us was a typist.

This is far from vibe coding, and it has to be said plainly. It is not perfect. But
it is trustworthy, and everything built on it from here will be faster and safer
because of the base underneath. The code is modular, split into small pieces,
documented and not over-commented. And after the first set of pull requests, we had
almost no issues with the code respecting the architecture.

I am not saying this to tell you how good I am, although I suppose it does not hurt.
I am saying it because the difference between vibe coding and this is not the tool.
It is experienced, open-minded, well-trained engineers with the right way of
thinking, who are willing to solve problems rather than just write code.

## Thanks for this great work

The title of this article is older than the release. I typed it on the second of
October, when the specification was finished and not one line of Rust existed.
The agent had just handed over a prompt for the session that would plan the
implementation, and among its instructions was this:

> If a gap or contradiction in the spec shows up, stop and tell me; it becomes a
> spec issue, never a quiet Rust decision.

> **Me:** Thanks for this great work
>
> **Claude:** Thank you, it was a pleasure

Never a quiet decision. Read that again next to what Itinera asks of code. A step
holds a business rule and knows nothing of the flow. The flow is declared in one
place, where you can read it. Every decision about it lives in a policy you can
see from the workflow, and every journey reports, in the same events, who decided
what and when. The point of the library is that nothing is decided quietly.

Now look at how it was built. Behaviour was decided in proposals, never in an
implementation. Every catch became a rule in a file an agent reads, or a check
nobody can bypass. Reviewer agents read every change against those files, and
agents reported to each other through a coordinator, in writing, where I could
read it. When an agent wanted to settle something on its own, the spec stopped
it, and when I wanted to, the process made me write a proposal like anyone else.
The project was run the way Itinera asks code to be written: the process
visible, the decisions in one place, nothing decided quietly.

And it answers a question this blog has been asking in another series. In [*The
loop ran in somebody's head*](article:the-loop-ran-in-somebodys-head) I argued
that every trade has a loop between "it is written" and "it is right", that ours
built half of it, and that a person quietly ran the rest in their head. Here, for
two weeks, much more of that loop was built: in specifications, cases, gates,
rules and reviewers, all of it written down. What was left in a head was mine,
and it was smaller and sharper. Scope. Naming. A question nobody had a reason to
ask. A tag, and a publish.

That is the sense of the whole series, and I can say it plainly now. Working with
an agent well looks less like giving orders and more like working with a sharp
colleague who forgets everything overnight. You think out loud with it, ask what
it thinks, take its idea when it is better, push back when it is wrong, admit
when you are lost, and write down everything it would otherwise forget. Itinera
is what that produced. It is also the same idea, turned into a library.

## What we learned

The release, and the series, in a handful of lines:

1. Hand over what can be undone, and keep for yourself what cannot: tags, the publish, secrets.
2. An agent will tell you honestly that something can wait, but deciding the scope is still yours.
3. Ask what a stranger would see; the version suffix and the contents of the package were both caught by a question no check was asking.
4. A project that checks its work only against itself has not yet met a user, and that is what a beta is for.
5. Much of the work could be handed over because the decisions were written down, in proposals, cases, rules and reviewers.
6. An agent works best as a colleague you argue with rather than a tool you give orders to, and whatever it must remember has to live in a file.

## Which jobs this one was doing

All six, for the only time in the series, because a release is where every one of
them has to sign something:

- **Product owner** — the scope ("this needs to be tier 1, so it goes on beta",
  over the agent's advice), and beta instead of rc, after asking what the suffix
  says to a stranger.
- **Architect** — "we will create the app when and if it is needed": a
  fine-grained token instead of an organisation app the project did not yet
  need.
- **Project manager** — "I want all on repo without publishing yet", holding the
  release for two more stages, and the "wait wait" that came a moment too late.
- **Platform engineer** — every conformance tag from rc.9 to rc.15, the actions
  release, `book` added to the required checks, the token pasted by hand, and
  `cargo publish` from my own machine.
- **QA** — "what is packaged in cargo publish dry run?", which found the missing
  licences and took the package from about 380 files to 12.
- **Reviewer** — the job the agent caught me short on: by its count, chapters 17
  and 22 to 42 of the book were still unreviewed when it gave its verdict.

The six are counted in [*The night that produced no code*](article:the-night-that-produced-no-code).

## What it enables

There is no next part. There is something better: every repository is public.
The [specification](https://github.com/itinera-dev/spec), with its `PROCESS.md`
and every proposal and the issue that argued it; the [conformance
cases](https://github.com/itinera-dev/conformance); the [Rust
implementation](https://github.com/itinera-dev/itinera-rs), with its `AGENTS.md`
and the review skill its reviewer agents run; the shared
[actions](https://github.com/itinera-dev/actions); and the
[book](https://github.com/itinera-dev/book), with the rules that keep it honest.

So the process can be copied, not just admired. Take the files, change the
nouns, and see which of the rules your own project would have written after its
first week. And if you want the library rather than the process, start at
[itinera-dev.org](https://itinera-dev.org/), or go straight to the book's [big
picture](https://itinera-dev.org/book/rust/02-the-big-picture/).
