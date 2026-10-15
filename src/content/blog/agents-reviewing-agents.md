---
title: 'Agents reviewing agents'
description: 'One agent implemented, another kept the specification, a third reviewed every change, and they wrote to each other. What I did above them was mostly not reading code: settling their disagreements from first principles, and keeping the process even when I was the one breaking it.'
pubDate: 'Oct 15 2026 12:07'
series: 'itinera-built-together'
seriesPart: 8
tags: ['ai engineering', 'ai', 'software engineering', 'itinera']
draft: false
---

[Last time](article:how-it-is-put-together) drew the map: a specification that
holds the meaning, conformance cases in Gherkin that every language must pass, pinned
by tag, a book the library's CI runs, and Rust first, because the strictest language
was the one most likely to define everything the others would need. This time the
strict reader goes to work.
A second agent arrives to implement what the first one specified, and the interesting
part is not that it writes Rust. It is that the two of them disagree, write to each
other about it, and leave me to settle it.

## Never a quiet Rust decision

At the end of the night the specification was finished, I asked the agent that had
written it with me for one more thing: a prompt for the next session, the one that
would plan the Rust implementation. I pasted that prompt into a fresh session the
same evening. Most of it was a reading list. One line was a rule, and it is the line
this whole article hangs from:

> Anything observable by conformance belongs in the spec, not in Rust. If a gap or
> contradiction in the spec shows up, stop and tell me; it becomes a spec issue,
> never a quiet Rust decision.

"Observable by conformance" is the test from the map last time: if one of the shared
cases could notice the difference, it is behaviour, and behaviour lives in the spec.

Why bother? Let me walk the naive version first. An implementer finds a hole in the
spec. It is a reasonable implementer, so it picks something reasonable and carries
on. The Rust code now answers a question the spec never asked. Six months later
somebody starts the TypeScript version, reads the spec, finds the same hole, and
picks something else, also reasonable. Two libraries, one name, different
behaviour. With people, someone might remember the first choice. With agents, nobody
does. The session that made it is gone.

So the rule. And the first thing the new session did, after reading everything, was
use it:

> You asked me to stop on these. Each can be observed by conformance, so none of them
> should be settled quietly in Rust.

Four gaps on the first reading, before a single line of Rust. I told it to "open the
issues as you suggested, and wait for the resolutions." Then I carried the links to
the specification session and asked a question I should have asked earlier: "Do we
have any process writen for spec deffects, to begin it? If not we should plan for
that?" We had a label, a template and one sentence. No lifecycle. So we wrote one,
and the specification agent noticed something on the way:

> The Rust session reached the same split on its own: it filed #49 as a proposal and
> the rest as defects. That suggests the test is easy to apply.

## Two agents, one letterbox

I could have kept carrying messages by hand. Instead, when I agreed the plan for
those defects, I added: "if yu can, ask for the rust session whether that would be
enough for them."

It could. The two sessions sent each other messages, and what came back was not a
rubber stamp. The Rust session said yes, the plan unblocks it, and asked for three
precisions first: what "throws" means in a language without exceptions, a complete
list of the calls the executor guards, and a case for each. It told me what it had
sent:

> None of these changes the design you agreed with them; they only make it precise.

The specification agent folded all three in, merged everything and tagged a release
candidate of the cases (a tag the Rust code could pin, so both sides were reading
the same text). The reply from the other side was the kind of message you would like
from a colleague:

> Thanks, I've confirmed v0.1.0-rc.1 resolves to ec8273d, all five issues are closed,
> and cases/tier-1/0049-custom-code-that-throws/ exists at the tag. I'm resuming the
> Rust plan pinned to rc.1, so nothing else is needed from you.

It checked the tag instead of trusting the message. Remember that; it comes back.

## A panic is a panic

Two days later the Rust session and I were designing how failures work, and it
proposed catching panics around every reporter, as the spec then required. I said
no:

> a no, not at all for rust. Panics are not catchable by the engine, we are not using
> panic unwinding as a try catch that the rust itself doesn't support. A panic is a
> panic, and it should never happens.

It agreed with me, and then it held me to my own rule. The spec accepted that very
day said the opposite in four places, and it listed them, with the seven scenarios
Rust would now fail. Then:

> Making these rules impossible to express is a fine choice, but it has to go into
> the spec, not stay a quiet Rust decision.

Think about who that sentence was aimed at. Not at itself. At me, the person who
wrote the rule, about to break it in the first hour it was inconvenient. It opened
the amendment as a spec issue, and by the end of that evening a dozen more had
followed it. The agent
named what was happening better than I could:

> That's a lot of spec change coming out of the Rust design, which is the process
> working as intended.

## Fifteen issues and an evaluator

So now there was a pile of new issues, fifteen by the specification agent's count,
written by one agent against a spec written with another. I took them to the specification session with one word of instruction:
"the rust session opened several new issues. Evaluate."

It read them all and came back with a table, a recommendation for each, and a
warning:

> They are almost all amendments to proposals accepted a few days ago, and two of
> them reverse decisions made only yesterday

Agents reviewing agents, then. The implementer reviews the spec by trying to build
it. The spec's author reviews the implementer's objections. Where do I come in?

Here. On the panic issue the specification agent recommended accepting half and
rejecting the other half, and its argument was serious: a workflow engine that lets
one bad step kill the process is not safe to run in a server, and "Runtimes such as
tokio catch task panics for that reason." I did not go and read the Rust code to
answer that. I answered from what Rust is:

> I want to discuss more. We are mnot tokio, and tokio can continue catching the
> panics. What we cannot mix is a panic mixed with a try catch concept. A panic is a
> run-time error, and rust didn't design it to be catched like a catch.

And the agent did the thing I value most in a colleague. It changed its mind on the
argument, and turned its own argument round:

> You're right. I'd accept #54 whole, with three precisions
>
> [...] My tokio argument also works in your favour

Whoever hosts Itinera, it went on, can contain a panic at their own boundary, as for
any other Rust code. That is the host's decision, not Itinera's.

The next issue went the same way, from the other side. A reporter throws while a
step is still running: what happens to the step? The agent wanted a gentler fix,
letting the step run to its end, and it had good reasons. I had a principle instead:

> reporters and hooks cannot throw. Throwing is illegal.

And a few minutes later, the general form of it:

> An executor never interrupts a step execution, from building to executing to report
> to execute after hooks if nothing on that custom code do anything illegal. If
> something signalizes the executor that something illegal happened, the executor
> abborts the journey.

The agent wrote it down as a rule, and then applied it to the next issue before I
had to. It had recommended a "lighter" handling for a step that puts something
unserializable into the journey's data. Under the new principle that is illegal, not
merely a failure, so:

> My "lighter" variant would have let a bug in the step trigger retries, and that's
> wrong under your rule.

That principle is in the specification today, in the chapter on steps, as the first
point of its section on time:

> **The executor never interrupts custom code that does nothing illegal.**

One more turn, because it went the other way again. I wondered aloud whether Rust,
having no throw, should make hooks and reporters return an error instead of being
unable to fail. The agent's answer: "I think you're right, and it's better than what
#54 proposed for Rust." So the Rust session's own proposal came back changed, and
when the specification agent told it so, the Rust session replied, without
argument, that "Several of these outcomes contradict the recorded Rust plan", and
that it would revise the plan with me before opening anything.

Notice what I did not do in any of this. I did not review a diff. I settled
disagreements between two agents, each of which knew its own half far better than I
could hold in my head, with first principles that fit in a sentence. That is the
job, I think, when the work is done by agents. Not reading every line. Deciding what
the lines have to obey.

## The spec session saying so doesn't count

When everything was settled, the specification agent wrote to the Rust side: the
maintainer evaluated all your issues, and they are settled. The answer it got was
addressed to me:

> You told me not to open implementation issues or write up the plan until you say
> the proposals are accepted. The spec session saying so doesn't count, so I'm
> waiting for you.

I like this one a lot. A message from another agent carried information, which it
checked, as it had checked the tag. It did not carry my authority. Only I could say
"go", and a peer saying I had said it was not the same thing. If you are going to
let agents talk to each other, that is the line you want them to draw by
themselves, and here it drew it without being asked.

## The reviewer I asked for

Then the work moved to the cloud, which is the subject of next time, and the
implementation began in stages, one thread per stage. Early in the first stage I
caught a small thing: an attempt number held in a plain integer, when the spec says
attempts count from one. What I did with that catch is a story of its own, for
later. What matters here is the question I asked straight after it:

> and this is another question: can you select models alone? I ask because it would
> be nice to have you apply a review bfore opening a pr.

> I can't switch the model I run on myself; that only happens when you ask for it.
> But I can start a separate reviewer and choose its model [...] It starts fresh,
> without my assumptions, which is what makes a review useful.

That last clause is the whole reason it works. The agent that wrote the code is the
worst possible reviewer of it, for the same reason I am the worst reviewer of my own
prose: it reads what it meant. A fresh agent reads what is there. From that evening,
every pull request was reviewed by a second agent before it was opened, against the
spec and the repository's rules.

Its first review found a gap in the specification: what a journey carries when its
retries run out after an abnormal termination, which has an error message but no
reason. And because the rules said so, the thread did not decide it in Rust. It
brought it to me, we designed it in the thread, and it went to the spec as an
amendment. The next day the reviewer caught that "the first version still let the
wrong hooks decide". Small things, real things, found before I looked.

And the review ran in every direction, not just down. The Rust thread, later,
found three sentences glued together in the conformance catalogue. They had come
from the local agent that kept the spec, and that agent owned it when I asked it to
review the fix:

> That came from my cases pull request for 0091 (#70). My first `sed` insert didn't
> fail as I assumed [...] My check counted the *lines* containing "(0091)", which came
> out right and hid the duplicates. Sorry for that.

The coder caught the spec keeper. Nobody minded. That is what the arrangement is for.

## I won't add it without a spec change

The rule held against me too, more than once. In the first stage I answered one of
the thread's questions with my own rule, which was not among its options. The
coordinator, passing my answer on, added its own reading: "It seems to differ from
spec 2.3". The thread confirmed it did, and set out the options, with one left off
on purpose:

> Building the amended rule before the spec changes is not offered, because AGENTS.md
> rule 1 forbids it.

I said "post the ammendment issue, and wait until it is approved." It was accepted
about half an hour later, and the stage went on.

The sharper case came a few days on, in the stage that wired up policies and hooks.
Input adapters are the functions a workflow uses to hand a step its inputs, and I
wanted them able to read the journey's data directly:

> I want #[DataFromJourney] as a comnvenience, but they should have access to
> &self.get_journey_data() also.

> The manual says a gap like this goes back to the specification rather than being
> decided in Rust, so I won't add it without a spec change.

An agent refusing its own user, on the strength of a rule its user wrote. And it was
not being obstructive: in the same message it made my case better than I had,
pointing out that an adapter may need a key it can only compute at run time, which
a declared request cannot name. Then it gave me three options, the third being to
add the access now and record the deviation, with the cost spelled out: "This breaks
the manual's rule that behaviour comes only from the specification."

I own the specification. I could overrule it, and I did:

> We can build the direct access as of now, no problems, they will accept that. In
> the meantime, please open the spec proposal.

Is that the rule breaking? Watch what happened next. The agent opened the proposal
first. It kept the new access behind `unstable`, the crate feature where anything
the spec has not accepted yet waits. I then added a guarantee for every language,
that an adapter can read the journey's data but never write it, and the agent put
that into the same proposal. The proposal was accepted that evening. The access left
`unstable` in a pull request that added two compile-fail proofs, tests showing that
the access can neither outlive its call nor be written through, and its report
ended:

> All 302 scenarios pass on both executors.

So my override went through every station a proposal goes through. It went ahead
of the spec, but not around it. The difference between those two is the whole
difference between a project that keeps its process and one that has a process
document.

## What made it work

Every agent in this story checked its work against something written: the
specification, the conformance cases, a file of rules in the repository. That is
what let them review each other. You cannot ask one agent to review another against
"what Marlon would want"; it has no idea, and neither, some nights, do I. You can ask
it to review against a sentence.

And when two written things disagreed, or when the written thing was silent, it came
to me. Not as a diff. As a question, with options, a recommendation and a reason. My
answers were short because they were principles, and the agents turned each one into
text the next agent would read.

## What we learned

What to keep from two agents and one human on the same specification:

1. A gap found while implementing goes back to the specification as an issue, never
   into the code as a quiet decision.
2. Agents can review each other only against something written: the specification,
   the cases, a file of rules.
3. A message from another agent carries information, not your authority.
4. The agent that wrote the code is the worst reviewer of it; a fresh one reads what
   is there.
5. The human's job is settling disagreements with principles short enough to fit in
   a sentence.
6. An override may go ahead of the specification, but never around it.

## Which jobs this one was doing

Four, and almost none of them involved reading code.

- **Architect**: "We are mnot tokio", "Throwing is illegal", the principle that the
  executor never interrupts custom code unless it did something illegal, now in the
  specification, and hooks and reporters returning an error in Rust.
- **Reviewer**: overruling the specification agent on panics and on a reporter that
  throws mid-step, and asking for a reviewer agent on every pull request before it
  was opened.
- **Project manager**: carrying the issues between sessions, "ask for the rust
  session whether that would be enough for them", and holding a whole stage with
  "post the ammendment issue, and wait until it is approved".
- **Product owner**: going ahead of the spec on adapters reading the journey's data,
  "they will accept that", and adding the guarantee that they never write it, for
  every language.

No QA and no platform engineer this time: the tests here were written by the agents
and enforced by the conformance cases, and the platform comes next.

The six are counted in [*The night that produced no code*](article:the-night-that-produced-no-code).

## Next time

All of this ran somewhere, and from the first stage on, that somewhere was a project
in the cloud: a coordinator chat that started threads, threads that wrote to each
other, and a digest of pull requests every weekday morning. [Next
time](article:a-project-not-a-session) is about that shape, where the speed came
from, counted rather than claimed, and the new problem it brought, which was not
code at all. It was my attention.
