---
title: 'What Itinera is'
description: 'The library itself, before any of the story: steps that know nothing of the flow, a workflow that declares it in one place, every journey reporting what happened, and why that matters more when agents write the code.'
pubDate: 'Oct 15 2026 12:01'
series: 'itinera-built-together'
seriesPart: 2
tags: ['ai engineering', 'ai', 'software engineering', 'itinera']
draft: false
---

[Last time](article:a-year-or-fourteen-days) started with the numbers: a
specification, a conformance suite, a Rust implementation with almost four lines
of checks for every line of library, a book, and fourteen days of work. Then it
said why I wanted it: a belief that code is easier to understand when you can see
what is going on, and a design big enough to need at least a year of somebody's
paid time. I only sketched the library itself there. Before any of the story of
how it was built, this one shows it plainly, so that the rest of the series has
something solid to point at.

We start with one question.

## What happens to a payment when the bank times out?

Take a payment system that has lived a few years. It started clean: controllers,
services, repositories, each where it belonged. Then it grew, one reasonable
decision at a time.

Somebody wanted an A/B test of a second payment gateway, and the quickest place to
put it was the dependency injection setup, which now hands out controller A to some
customers and controller B to the others. The bank sometimes times out, so the
payments team built a proper retry system, metrics included, into the payment
service. A second team needed a slightly different retry, with back off, and they
owned the bank client, in another repository, so that is where it went. Then
somebody added a circuit breaker beside the HTTP client, with rules that reach
beyond this system entirely. And nobody decided to log any of it.

So, what happens to a payment when the bank times out?

Open the injection setup to find out which controller you get. Open the payment
service: it retries, but how many times is in its configuration. Open the bank
client, in the other repository: it retries again, with back off. Open the HTTP
client: the breaker may stop all of it, under rules kept somewhere else. Five
places, two teams, and no log to check your answer against.

Nothing in that system is exactly wrong. That is what makes it so ordinary. Every
system that has lived a few years looks like this, and it stays manageable because
somebody remembers.

That story is not mine; it is the one [Itinera's site](https://itinera-dev.org/)
opens with, and it came from a message I wrote while we were planning that site,
which we will get to.

## The same question, with Itinera

Here is the same payment, declared as an Itinera workflow, as the site's home page
shows it. Four lines:

```rust
#[workflow(name = "payment", policies = [NotifyCustomer])]
#[with_step(Authorise, name = "authorise", retry_budget = 2, policies = [CircuitBreaker])]
#[with_step(Charge, name = "charge", rescue = RefreshCard)]
#[with_step(SendReceipt, name = "send_receipt")]
```

Read the answer off it. Authorise may be retried twice. Before each retry, the
circuit breaker policy decides whether it is still worth trying. If charging fails,
a rescue step refreshes the card and charge runs once more. When the journey ends,
the customer is told. That is the whole answer, and you did not open a single
function to get it.

A few words, since they will keep coming back. A **step** is a business rule: one
piece of work, like charging a card. A **workflow** is an ordered list of steps,
with everything about the flow attached to it. A **journey** is one run of a
workflow: one payment, one order. A **retry budget** is how many times a step may
be tried again. A **rescue step** is a step that runs when another one fails, to
fix the cause, after which the failed step gets one more go. A **policy** is a
small piece of code the workflow attaches to a step, or to the whole workflow, that
is asked what should happen next at defined moments.

That is real code: it compiles against the released crate. The book tells the same
story with a shop rather than a payment. This is the declaration from its [*The big
picture*](https://itinera-dev.org/book/rust/02-the-big-picture/) chapter, exactly as
it compiles:

```rust
/// The shop's workflow: reserve, charge and ship, auditing the charge, rescuing it when the
/// card has expired, and telling the customer how the order went.
#[workflow(name = "orders", policies = [Notify], reporters = [Log])]
// The steps run in this order, and nothing reorders them.
#[with_step(Reserve, name = "reserve")]
// The charge runs at most twice: once, and once more after its rescue step succeeds.
// Every successful charge is audited.
#[with_step(Charge, name = "charge", rescue = RenewCard, policies = [Audit])]
// Shipping may be tried once more, after a failure worth trying again.
#[with_step(Ship, name = "ship", retry_budget = 1)]
struct Orders;
```

Same shape. The flow, in one place, in the order it runs.

## Steps that know nothing

So where did the business rules go? Into the steps, and only the business rules.

Here is the charge step from that same chapter of the book:

```rust
/// Charges the card the price, less any discount. It only says how it went: what happens after
/// a declined card is not its business.
#[derive(Step)]
struct Charge {
    #[input]
    card: String,
    #[input]
    price: i64,
    #[input]
    discount: Option<i64>,
}

#[step]
impl Charge {
    fn run(
        self,
        #[service] payments: &dyn Payments,
        #[contributor] mut contributor: Contributor<'_>,
    ) -> Result<Outcome, Error> {
        let amount = self.price - self.discount.unwrap_or(0);
        match payments.charge(&self.card, amount) {
            Ok(receipt) => {
                contributor.contribute("charged", amount);
                contributor.contribute("receipt", receipt);
                Self::succeed()
            }
            Err(Declined::ExpiredCard) => Self::fail("expired-card"),
            Err(Declined::Refused) => Self::fail("declined"),
        }
    }
}
```

Look at what is not in it. No retry. No loop. No "if the card has expired, go and
renew it". No idea which workflow it is in, which step comes next, or whether this
is the first attempt or the second. It asks for its inputs by name, is handed the
payment service it needs, puts what it produced somewhere, and says how it went.
That is all a step can do, because there is nothing else for it to call.

That last point is the one I care most about. A step that knows nothing of the
flow can be written, tested and changed on its own, and it can be plugged into any
workflow that needs it, unchanged. A national and an international payment can
share their charge step and still have different retry budgets, because the budget
belongs to the workflow, not to the step.

## Want to change something? Copy the workflow

This is where keeping the two apart stops being tidy and starts being useful.

Say you want to try a different version of one step. With Itinera you copy the
workflow, swap that one step, and give the copy a different name. The rest of the
steps? Completely unchanged: the copy lists them exactly as the original does.
Your entry point decides which workflow a request runs, so you send some of your
users to the new one and the rest carry on as before.

The same goes for a service. In the book, a shop takes orders for delivery, and
later wants customers to pay at a counter instead, with the counter's card
terminal rather than the bank. Here is the original, and the counter's workflow
beside it, both exactly as they compile in the book's [*Using a step in another
workflow*](https://itinera-dev.org/book/rust/42-using-a-step-in-another-workflow/)
chapter:

```rust
#[workflow(name = "orders", reporters = [Log, Desk], policies = [Notify])]
#[with_step(Lookup, name = "lookup", policies = [AlreadyCompleted])]
#[with_step(Price, name = "price")]
#[with_step(Charge, name = "charge", rescue = RenewCard, policies = [Audit, Outage])]
#[with_step(Ship, name = "ship", retry_budget = 1, policies = [FailedShipping])]
struct Orders {
    channel: &'static str,
}
```

```rust
#[workflow(name = "counter", reporters = [Log])]
#[with_step(Lookup, name = "lookup", policies = [AlreadyCompleted])]
#[with_step(Price, name = "price")]
#[with_step(Charge, name = "charge", policies = [Audit])]
struct Counter;
```

`Lookup`, `Price` and `Charge` are the same steps, not copies of their code. What
differs is declared and nowhere else: the counter has no shipping, no rescue step
for an expired card (the customer is standing there and can hand over another
one), and it provides a different payment client. The charge step asks for
something called `payments` and never learns which one it got:

```rust
/// The counter's terminal, as the payment client of the journey.
#[provider(key = "payments")]
fn terminal(&self) -> Result<Provided<dyn Payments>, Error> {
    Ok(provide!(Terminal { this_year: 2026 }))
}
```

And the logs tell you which way every request went, because each line carries the
workflow's name. These are lines from the book's own run of that chapter:

```text
log counter A-17 for Nia #10 attempt_started charge, attempt 1
log counter A-17 for Nia #11 service_provided charge gets payments from terminal, a ch42_using_a_step_in_another_workflow::Terminal
```

`counter`, the order, the charge, and which payment client served it, by name.
Nobody wrote that log line.

Now try the same change in a classic code base. One payment provider, with
slightly different rules. Find every place the old one is injected. Rewrite the
code around each of them. Hope you did not forget anything: the response that was
never exactly right with the current provider and got normalised somewhere, the
retry that only made sense for the old one, the special case three files away.
Then test it all again, because you cannot be sure what else you touched.

You know where that ends. Fear of the change. Slowness, because every change is
that expensive. And, sooner or later, someone who remembers how it all really
works stopping you from doing it at all.

## Policies decide, executors carry out

Somebody still has to decide what happens after a step fails. In Itinera, that
somebody is never the step.

After each outcome, whatever runs the journey calls the hooks of the policies
attached there. A hook either returns nothing, which lets the default stand, or
picks from a short, fixed list of what may happen next: carry on, fail the
workflow, and a few others. It cannot reorder the steps. A circuit breaker, for example, becomes a policy
whose hook, before each retry, asks the breaker whether it is open and either ends
the journey as failed or lets the retry go ahead.

The thing that runs a journey is the **executor**. Policies decide; the executor
carries out. The workflow does not know which executor will run it, and that is on
purpose, as we will see in a moment.

## Every journey reports the same events

Here is the part I would have given a lot for in that payment system. Four of the
events of one journey, from the site, in which the bank timed out once:

| Event | Step and attempt | What it says | Decided by |
|---|---|---|---|
| `step_failed` | `authorise`, 1 | the bank timed out; it may be retried | |
| `hook_called` | `authorise`, 1 | circuit breaker, on step retry: no lifecycle, the default stands | |
| `step_retrying` | `authorise`, 1 | try again after a retriable failure | default |
| `step_succeeded` | `authorise`, 2 | | |

Nobody wrote a log line. Every Itinera journey reports this stream: when it
started, every attempt, every hook that was asked and what it said, every retry
and rescue, how it ended, and who decided each turn. The specification has a
catalogue of these kinds of event, and every executor must produce them the same
way. A reporter chooses where they go. An operator reads them; a dashboard counts
retries from them; an agent reads them too.

The story the payment system hid across five places is there, in order.

## One meaning, many languages

Now the part that made this a year of work rather than a weekend.

Itinera is not, first of all, a Rust crate. It is a **specification**: a set of
chapters that say what a workflow means, in terms anyone can observe from outside.
What order steps run in, what a retry budget of one allows, what events a journey
must report and in what order.

Next to it sits a **conformance suite**. If you have not met one: it is a shared
set of test cases, written once, that every implementation must pass, whatever its
language. Itinera's are written as plain-language scenarios (in Gherkin, the
*given, when, then* format) and each implementation brings a small runner that
plays them against its own code. A release carries the report that proves which
cases it passes. That is how "Rust and TypeScript mean the same thing" stops being
a promise and becomes something you can check.

The work is cut into **tiers**. Tier 1 is a single workflow: steps, retries, rescue
steps, policies, services, the event stream and a local executor. Tier 2, moving a
journey to another workflow, and tier 3, workflows inside workflows, are planned.

And the **executors** differ in what they can do, never in what a workflow means.
Today the specification defines the local executor, which runs a journey in one
process, synchronously or asynchronously. An executor that runs each step as its
own task, one that runs steps as jobs across machines, and a durable one that
resumes a journey after a crash are planned. The same workflow, with the same
steps and policies, should be handed to any of them without changing a line. That
is a claim about the future, and I am marking it as one.

Rust came first. `0.1.0-beta.1` went to crates.io on the fourteenth of October,
and a second beta followed within hours. TypeScript and the JVM are named in the
vision as the languages that follow; they are not there yet.

## Why this matters more when agents write the code

Keeping the process apart from the business logic was always good engineering.
Teams got by without it, because somebody remembered how a request really went.

Agents do not remember. Every session starts from nothing. An agent changing that
payment system can only respect the rules it can see, and the retry in the other
repository is not one of them unless it goes looking, and reasons deeply enough to
know it should. An `AGENTS.md` file helps, when it helps at all. Restricting who
may merge helps until it becomes a bottleneck, and then it gets bypassed.

Itinera changes what the agent is handed. The workflow is the context, given to it
directly instead of left for it to rebuild: which steps run, in what order, with
which policies. A step it is asked to change is a business rule and nothing else.
And the isolated way is the short way: in Rust, asking for an input or a service is
one attribute on a field or a parameter, while going to fetch the same thing
yourself is more code, and stands out in review. People take the shortest path.
Agents do too.

Two more things fall out of that. A workflow put together wrongly is refused before
any journey runs, with every violation listed, and in Rust several of those
mistakes are compile errors. And nobody, person or agent, has to remember to log.

When we were planning the site, I wrote the pitch to the agent working on it, and
asked whether it made sense:

> This is not about retries, this is about understanding how a process behaves up
> front.

> Itinera makes flows easily understandable. Thuis made things easier on the before
> agents era, now it makes code safer, because with itinera all one has to worry is
> with business rules, which can be developped independently, and people looking at
> the process can assembly the steps in a way that makes sense for what we want to
> achieve.

The agent agreed, and said it was the stronger pitch. Then, without being asked
for limits, it gave me four, "so the site never claims more than Itinera does":

> 1. "Every decision at a glance" really means every decision is in one place.
>    Reading a policy is still reading.
> 2. Itinera cannot stop someone hiding a retry inside a step. It turns the problem
>    into one rule anyone can check: a step decides nothing about the flow.
> 3. Your A/B case at the level of whole flows needs tier 2, back off is planned,
>    and running across services comes later. The plan marks each of these as
>    planned.
> 4. The claim about agents is argued, not measured. I suggest a later page that
>    shows it with the same change made both ways.

The first three are on the site today, in its own words. The fourth I am keeping
here: everything in this section is an argument. It is one I believe, and it is the reason I built the thing, but nobody
has yet made the same change to the same system both ways and counted what broke.
Until somebody does, argued is the honest word.

Is a step that decides nothing about the flow something no one can break? No. Is
it a rule a person, an agent or a reviewer can check in one read? Yes. One rule
that is easy to check, and made the easy path, beats many rules that somebody has
to remember.

## Where to go from here

If you want the library rather than the story:

- The site, [itinera-dev.org](https://itinera-dev.org/), with the payment case in
  full and the whole event stream of one journey.
- The book, [itinera-dev.org/book](https://itinera-dev.org/book/), and its *Get
  started* chapter, [*The big picture*](https://itinera-dev.org/book/rust/02-the-big-picture/),
  where the shop above runs seven orders and you can see each one end.
- The code, the specification and the conformance suite, all under
  [github.com/itinera-dev](https://github.com/itinera-dev).

If you want the story, it starts with a conversation.

## What we learned

What I would want you to carry out of this one:

1. A step holds one business rule and knows nothing about the flow around it, so it can be reused unchanged.
2. The workflow declares the flow in one place, in the order it runs, so you read the answer instead of hunting for it.
3. Trying a different version means copying the workflow and swapping a step, not rewriting code everywhere the old one was used.
4. Policies decide what happens next, the executor carries it out, and every journey reports the same events without anybody writing a log line.
5. A specification with a conformance suite is what lets several languages mean the same thing, in a way you can check.
6. The workflow hands an agent the context it would otherwise have to rebuild, but that this makes agents safer is still an argument nobody has measured.

## Which jobs this one was doing

An article that explains a library is mostly not a story about jobs, so this is a
short list.

- **Product owner.** The pitch: "not about retries", but about understanding how a
  process behaves up front, written as the payment system that grew, which became
  the story the site opens with.
- **Architect.** Two pieces of the shape described here were mine: executors with
  different capabilities, which I added to the model in that first conversation,
  and the tiers the work is cut into, which I proposed on the day the repositories
  were created.

No project manager, no platform engineer, no QA. And no reviewer either, for once:
in the one exchange quoted here, the reviewing went the other way, and it was the
agent that put the limits on my claim.

The six are counted in [*The night that produced no code*](article:the-night-that-produced-no-code).

## Next time

How it came to exist, starting with the conversation where it was thought through:
a problem I had always cared about, an agent offering a test and four rules, my
constraints in single lines, and me asking, at the end, whether any of it was
worth anything. That is [*This is the best thing I could think of*](article:the-best-thing-i-could-think-of).
