---
title: 'This is the best thing I could think of'
description: 'The evening Itinera was thought through: a problem instead of a specification, an agent asked for its verdict rather than its obedience, its elaborate proposals falling to one-line constraints, and the name it found when I asked about journeys.'
pubDate: 'Oct 15 2026 12:02'
series: 'itinera-built-together'
seriesPart: 3
tags: ['ai engineering', 'ai', 'software engineering', 'itinera']
draft: false
---

[Last time](article:what-itinera-is) I explained the library itself: steps that hold the
business rules and know nothing of the flow, a workflow that declares the flow in one
place, policies that make the decisions, and one standard stream of events that tells you
what every journey did. And why all of that matters more, not less, when the code is
written by agents that start from nothing every morning.

This time we go back to the evening it was thought through, and to the conversation rather
than the design, because the conversation is the part worth showing. How do you sit down with
an agent and an empty folder and come out with a model worth building? Not by asking it to
build one.

## An empty folder called orchestra

It is a Friday, the 26th of September. There is a folder on my disk called `orchestra`,
and there is nothing in it. I open a session and type this:

> this is a general plan / design session.
>
> I have always been facinated by a single engineering problem when talking about
> software: separating business rules from flow control.

Then a few paragraphs about what I mean. That business rules have their own `if` and
`else`, but there is flow control beyond them: "do we retry a failed piece? Do we use a
different strategy? Do we take a completely different path depending on conditions?" That
decoupling, ports and adapters, dependency injection, are all attempts at the same
separation, and that they usually fail for a reason I put like this:

> These however usually fail because it is hard to think in appropriate terms of what s
> orchestration ffrom what are the isolated business units.

Notice what is not in that message. No library. No language. No list of features, no "build
me", no deliverable. A problem I have cared about for a long time, and my diagnosis of why
the usual answers do not stick.

Is that a strange way to open with an agent? The usual way is the opposite: describe the
thing and ask for it. An agent will happily build a reasonable workflow library on request,
by midnight, and it will be a good average of every workflow library it has read. Bring it
what you are thinking about instead, and you get somebody to think with.

## It answered the problem, not a request

The agent noticed the folder first:

> The `orchestra` directory is empty, so this reply is just design discussion.

And then it did what a sharp colleague does when you bring them a problem rather than a
task: it gave me a way to tell the two sides apart, and four rules. The first one is still
in Itinera's specification today, in different words ("An outcome says what happened, never
what to do next"):

> 1. **A unit never knows what comes next.** It returns an outcome, not an instruction.
> `InsufficientFunds` is an outcome; "so go to manual review" is flow.

The fourth one is the line I would underline:

> Rule 4 is what makes the line enforceable instead of a matter of taste. If the flow
> language can't express `amount > 10000`, business logic can't leak into it.

Then prior art, the hard problems it expected, and four questions, the first of them "What
is the deliverable?" I did not answer it directly. I pasted nine points instead: what the
thing must *be*. A workflow visible in one place. Steps that have a name and an order "but itself
doesn't know what workflow is executing it. It asks for data, it doesn't know where this
data come from, it contributes data back, it doesn't know where this data goes." Four kinds
of result. Policies at two levels. And the ninth point, the hard requirement everything
else would end up serving:

> 9. steps cannot even know about workflows, data stores, or nothing else.

I closed it with "I think this is a good initial scope for what I think, and I think you
can understand how this solves the problem at hand." Three "I think"s in one sentence, in
the message that set the scope of the whole project. Proposing, not ordering, and then
asking whether I had been understood. That is how the rest of the evening sounds too.

## Taking its idea when it was better

The version of this story where the human has every good idea is both boring and false.
My fourth point listed four results a step could report, and one of them was "must be
retried". The agent's reply took that apart in two sentences:

> **4.3 "Must be retried" should be about the condition, not the action.** If a step says
> "retry me", it is making a flow decision, which is the leak we're trying to remove.
> Rename it `Transient`: "something temporary went wrong".

It was right. I had written a step that told the flow what to do, in a list whose whole
purpose was to stop steps telling the flow what to do. I did not argue and I did not
comment. From then on we both said `Transient`.

That evening, after a gap of about six hours, I came back with the piece I had been
missing: executors, the things that actually run a workflow, with different capabilities.
An async one that only accepts async steps, a local one that cannot keep a step waiting
for days. The agent's answer contained the sentence that, more than any other, made Itinera
possible as a library in several languages:

> What makes this workable is that executors differ only in **capability**, never in
> **meaning**.

A few messages later, when I said the name was meant for a GitHub organisation that would
publish "the same" framework in Rust first and then perhaps TypeScript and the JVM, it gave
me the other one:

> **the specification has to be the product, and each language's library is one
> implementation of it.**

Both of those are the agent's. Both are now load-bearing: a specification first, a
conformance suite every implementation must pass, executors that may refuse a workflow but
may never run it differently. I took them on the spot, the way you take a colleague's
better framing in a meeting, without making either of us pay for it.

## Elaborate proposals, one-line constraints

So the agent was good. Was it simply right all evening, then? No. And the way it was wrong
is the most useful thing in the whole conversation.

When it was wrong, it was never sloppy. It was *elaborate*: coherent, well argued, and
slightly bigger than the problem. What brought it back was never a counter-proposal of the
same size. It was one line from me, with a reason.

### Failure is terminal

Early on, the agent sketched a workflow so I could check it was readable. Part of it read:

```yaml
  - reserve-stock:
      needs: { items: order.items }
      on_transient: retry(max: 3, backoff: exponential)
      on_failure:
        OutOfStock: goto(backorder)
```

That is the agent's sketch from that day, not Itinera code. Look at the last line:
failure as a fork in the road. Out of stock, go to backorder. Perfectly sensible, and it is
how most workflow tools work.

I answered with this:

> The failiure mans a workflow will fail. It can make some transfers, but it self will fail.
> A step can contribute data in all situations, and hooks can query that data if they need.

The agent did not defend its sketch:

> **Branching moves to success.** "Out of stock, go to backorder" is not a failure. [...]
> This is cleaner than my earlier sketch, where I used `on_failure: OutOfStock →
> goto(backorder)`.

### An abnormal situation is abnormal

The second sentence of that same message of mine, "a step can contribute data in all
situations", sent the agent somewhere I had not meant. If a step can contribute in every
situation, it reasoned, then contributions must survive even when the step crashes. So the
contributor should become "a handle into a buffer owned by the executor", which would
survive "an `Ok`, an `Err`, a panic or a timeout."

Machinery. Reasonable machinery, for a case I did not care about. Two messages later:

> and no, an abnormal situation iis abnoral. It should never happen, think of a class
> throwing.

And back came:

> The executor-owned buffer I suggested last time is no longer needed. It existed only to
> keep contributions alive through an `Err`, which we've now decided isn't worth doing.

### Because one has to know visually

Later, the agent offered me a choice about order. Either the executor strictly follows the
declared order, or the declared order is only the logical one and an executor may run
independent steps in parallel, "as long as the results are the same". It even explained
how an executor could work out which steps were independent. The second option was the
more powerful one, and it said so.

I picked the first, in one line:

> a, because one has to know visually the rules of the workflow.

That reason is the whole library in one line. If the order in front of you is not the
order that runs, the declaration stops being the place where you understand the flow.

### What the pattern is

Three times, the same shape. (A fourth came later, simply: "but this is too complex".) The agent builds outward from a sentence of mine; I answer with
a constraint and the reason for it; the structure it built falls away without a fight.

The easy moral is wrong. It is not that the agent over-engineers and the human knows
better; half the good ideas of the evening were its own. We were doing different jobs. An
agent is very good at following an idea to every place it could go. Somebody has to say which
of those places we are going to, and why. A constraint with its reason attached is the
cheapest thing you can give it: one line, and a whole branch of the design is pruned.

And it went the other way too, which is what kept it a conversation. When the agent
described a run as holding "almost no state" of its own, I said it also had to carry the
number of attempts for retried steps. "You're right, 'almost no state' understated it." When
I described the executor scanning for the first step that was not executed or must be
retried, it found the case I had missed: a scan like that "would **skip an inherited `Failed`
step** after a switch", and a failure carried over from another workflow has to fail where it
is reached. It found edge cases; I found boundaries. Neither of us could have done the
other's half as quickly.

## Asking for a verdict

Late in the evening I asked a question I could have asked at the start:

> do you know of any rust, typescript or jvm library that buys all this?

The answer was a careful survey that opened with its own limit, "I haven't searched", and
found nothing covering the whole model.

Then I typed the line this article is named after:

> do you think this here would add value? This is the best thing I could think of

An agent left to itself tends to agree with you. Not out of flattery, exactly: you set the
direction, and it works inside it. Ask "is this good?" and you will mostly hear yes. Now look
at how that question is put. It does not ask whether the design is good. It asks whether it
would *add value*, and it says plainly that this is my best, which leaves very little room for
a polite answer to hide in.

What came back was this:

> Yes, I think it would. It could also fail for reasons unrelated to how good the idea is, so
> here's my honest assessment of both.

The value, first, in one line that the specification's concepts chapter still says today,
in other words ("the separation is structural rather than a matter of discipline"):

> **The separation is enforced by construction, not by discipline.**

Then five risks, and they were real. That in production most of the value of tools like
this comes from durability, "the hardest and most expensive part of this project". That
straight-line workflows lead to many small ones. That an untyped data bag makes the joins
between steps fragile. That "the simple case has to be short". That three languages triple
the maintenance. And a next step: write one real process out on paper before building
anything.

Is that what I wanted to hear? It is what I asked for. And it moved. When I described the
durable executor I had in mind, one that saves the state of a flow and picks it up later,
the agent revised its own biggest risk in the open:

> This design works, and it changes my earlier assessment of risk 1. **Durability is much
> cheaper in your model than in Temporal's.**

Because here the whole state of a run is data, so saving a snapshot is enough and nothing
has to be replayed. A verdict that says yes and then spends three times as long on the risks,
and changes its mind when given a reason, is the only kind worth asking for.

## Let's stay away from music

At the very end of the evening, the name.

I had been calling it orchestra all along, and the folder said so. I asked whether it was a
good name for a GitHub organisation. The agent went and checked, which is what you want a
colleague to do with a question like that rather than answer from taste: the GitHub
organisation was taken, npm was taken, and on crates.io there was a crate called
`orchestra` with about 5.7 million downloads. It liked the metaphor anyway, and explained
why in a sentence that is still the best description of a step I have read:

> In an orchestra, **each musician reads only their own part**. They don't have the full
> score and don't know what the others are playing. Only the conductor holds the full score.

I asked what the existing crate was about. Parity's, from the Polkadot node, and the agent
pointed out that its attribute syntax looked surprisingly like mine while its idea was the
opposite: long-lived actors that "**send messages to each other**", so the flow "emerges from
their conversation and isn't written down anywhere". The exact problem I had opened the
session with, wearing my project's name.

> ok. Let's stay away from music, then. What else do you suggest? Let's work names, then we
> see availability.

Twenty minutes of honest work followed. Railway names, air traffic, Latin roots. Switchyard
checked and dropped, an async executor on crates.io and a dead Red Hat framework on the JVM.
Eleven more names checked, and Routebook recommended.

And then I asked this:

> what if someting having to do with journeys? Because this can be seen as a journey
> coordinating steps or not? What do you think?

The direction was mine. The name was not. The agent came back with a heading that said
"Journey names: Itinera is the strongest", and two things in the answer I still enjoy. The
first is that it had been listening to me all evening:

> You already said "abort the journey" a while back, and the idea maps closely onto the
> model

I had, hours earlier, in a sentence about hooks that throw. It had kept the word, and
handed it back to me as the answer.

The second is the name itself:

> - **Meaning:** Latin for "routes" or "journeys", the plural of *iter*. It names what the
> framework manages: routes declared in one place, travelled one stop at a time.

Free on crates.io, free on npm, `itinera-dev` free on GitHub, no orchestration projects
nearby.

Itinera is the agent's name. I asked for journeys and it found the word. That is the whole
technique of this article in one exchange: I brought the direction, it brought the thing I
would not have found, and I took it, because it was better than anything on my list.

(Five days later I told the agent I had renamed the folder "intinera". "This was what you
suggested, right?" It was not. "I suggested **Itinera**, with no 'n' after the
first 'I'." So it found the name and then had to defend it from me. Fair.)

## What the evening left in the library

Not everything said that night survived. Some of it got sharper later, in the open, through
the process we will see next time.

`Transient`, the agent's good rename, did not last: the step proposal that was eventually
accepted lists it among the rejected alternatives, because even a transient outcome still
tells the flow what to do. Whether a step is tried again is now decided by its retry budget
and its policies, and "failure is terminal" softened into exactly that. But look at what
the rejection says. It is the agent's own argument from that first evening, about "must be
retried", applied one level deeper. The principle outlived the words it was first said in.

What did survive is the shape you met [last time](article:what-itinera-is):

- **The step that knows nothing.** The specification's concepts chapter says a step "knows
  nothing of the workflow, the executor or other steps, and it does not know its own name."
  That is my ninth point, tightened.
- **The flow declared in one place, in the order it runs.** "One has to know visually."
- **Decisions in policies.** Hooks that return a lifecycle or nothing, where nothing means
  the default, so a workflow with no policies is still valid and does something sensible.
- **Executors that differ in capability, never in meaning**, and a specification that is the
  product.

And the last piece, the one that makes the rest bearable in production, everything
reported, did not exist yet that evening. It came five days later, in the middle of
designing something else entirely: the process. That is where we go next.

## What we learned

From that evening, these are the ones I would keep.

1. Bring the agent the problem you care about rather than a request for a product, and you get somebody to think with.
2. When its idea is better, take it on the spot; some of the parts Itinera now rests on, and its name, came from the agent.
3. An agent follows an idea to every place it could go, and one line of constraint, with its reason, tells it which of those places we are going to.
4. It works both ways: I found the boundaries, and the agent found the edge cases I had missed.
5. Ask for a verdict in a way that leaves no room for a polite yes, and expect the risks to come with it.
6. When a question can be checked, like whether a name is taken, have the agent check it instead of answering from taste.

## Which jobs this one was doing

An evening of conversation, so the list is short and leans one way.

- **Product owner:** the nine points, which said what the thing must be before anybody said
  how, and "do you think this here would add value?", which is the product owner's question
  put to the only other person in the room.
- **Architect:** failure is terminal and branching moves to success; strict declared order,
  "because one has to know visually".
- **Reviewer:** reading the agent's failure-as-a-fork sketch and its executor-owned buffer,
  both coherent and both cut in a line each, with the reason attached.
- **Project manager:** steering the naming hunt to a decision, "Let's work names, then we see
  availability", and turning the search towards journeys when the lists ran dry.

No platform engineer and no QA this time. Nothing ran that evening, and nothing was built
for anything to run on.

The six are counted in [*The night that produced no code*](article:the-night-that-produced-no-code).

## Next time

Five days later the name became an organisation and four repositories, and we had to
decide how anything would get into them. [Next time](article:exercising-our-own-process):
the process we designed together on the first of October, my loop of issues over the agent's
plan of RFCs, research into who else works that way, an agent that set the whole thing up in
minutes, and the same evening, catching it walking around the rules it had just written.
