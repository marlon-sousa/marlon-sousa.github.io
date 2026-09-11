---
title: 'The month before the twelve hours'
description: "Cognition published a case study about EBANX and Devin, and I am most of the way through it. The number everyone will take away is twelve hours. This is about the month before them and the bet around them, which is the part a case study has no room for."
pubDate: 'Sep 11 2026 17:00'
tags: ['ai engineering', 'ai', 'software engineering', 'accessibility']
draft: false
---

[Cognition](https://cognition.com) published a case study about
[EBANX](https://www.ebanx.com) on 20 August, and I am most of the way through it.

Strange sentence? A bit. It wants a word of context if you arrived here cold, so
here it is.

For the last nine articles I have been writing a series called
[*You are now the whole team*](/series/you-are-now-the-whole-team/), about what
it actually takes to build professional software with an AI agent. Its argument
runs against the popular one. Does an agent make engineering easier? No. It
removes the one job that was never the hard job, putting the code into the file,
and leaves one person holding all six of the jobs that *were*, the ones a team
used to spread around: product owner, architect, project manager, platform
engineer, QA, reviewer. Every claim in it is measured against two small
repositories I built in the evenings, and every conversation with the agent is
quoted from both sides, because my prompts on their own would prove nothing.

**This article is not one of them.** It is the same argument turning up at a
scale I could never reach on my own: a payments platform, other people's money,
code that is not mine to publish, and a story told by somebody other than me.

My name is on seven quotes in that case study. Its headline number is that a
project scoped for six weeks was delivered in about twelve hours. You can read it
here: [EBANX on devin.ai](https://devin.ai/customers/ebanx).

Now. About that number. Most people will read it and reach a conclusion I do not
hold, so let me get in first.

## The reading that fails

Here is the obvious reading. Six weeks became twelve hours. So the tool is thirty
times faster than a person, and if your team is not thirty times faster you
bought the wrong tool or hired the wrong people.

Ooops. Calm down.

Where do six weeks of integration work actually go? Ask any engineer. Almost none
of it goes into typing. It goes into reading a payment provider's documentation,
written by somebody who already knew the answer. It goes into working out which
of your own interfaces this provider maps onto, and which it maps onto badly. It
goes into the three days where the sandbox turns out to behave differently from
the documentation, and the week where a decision made in the first sprint has to
be unmade.

Hand an agent that same fog and what do you get? Not twelve hours. A confident
pull request built on the wrong reading of the documentation, discovered in
production, which is the most expensive place there is to discover anything.
Hypothetical? No. That is the *normal* failure. I wrote a whole article about
[the gap between what you said and what you meant](article:the-gap-between-what-you-said-and-what-you-meant),
and the argument there is that an agent's willingness to extrapolate is at once
the reason you use it and the reason it hurts you. You do not get one without the
other. You only get to decide where the extrapolation may be wide and where it
must be narrow.

So the twelve hours are real. They are just not the thing that produced them.

## What was actually in the room

Three inputs went in: the provider's API documentation, the typed internal
interfaces every integration has to implement, and EBANX's own reference examples
of integrations that already worked.

Look at that list again. Two of the three are the accumulated shape of the place.
Interfaces somebody designed on purpose. Examples of the house style that exist
because people wrote them down. The agent supplied the third thing, which was the
labour of reading the documentation and mapping it onto the other two without
getting bored halfway through.

Same argument I have been making since
[the night that produced no code](article:the-night-that-produced-no-code),
except there it was a terminal emulator I was building alone in the evenings, and
here it is a payments platform. The conditions come first, and that is the whole
of [conditions, not instructions](article:conditions-not-instructions). The
typing comes last, and the typing is now cheap. What we compressed from six weeks
to twelve hours was the cheap part. But the cheap part had been eating everybody's
calendar, so compressing it changed what the calendar was *for*.

I have lived a smaller version of this, and it cost me twenty-six days:
[I stopped building the product to build the tool](article:i-stopped-building-the-product-to-build-the-tool).
Same shape. The unglamorous investment in what surrounds the work is what makes
the work fast later, and at the moment you make it, it looks exactly like not
shipping.

## The month nobody headlines

Before any of that, I spent a month reading logs.

Not running tasks and glancing at the diffs. Reading the full execution trace of
every session. How it reasoned about a piece of code. What it did when it hit an
error it had not expected. What it did when the instruction was ambiguous, which
is the interesting case, because that is where a tool either asks you or quietly
guesses.

I said this to Cognition and they printed it, and it is the truest sentence on
that page:

> I read these logs very carefully because I was really trying to understand how
> the system worked. By the end of that month, I was quite confident that a
> revolution was going to happen.

A month of reading is not a demo. It does not screenshot well. No case study
opens with it, and I do not blame anybody for that. "Engineer reads log files for
four weeks" is not a headline. But that month is the entire reason I was willing
to walk up to a senior developer and offer him a bet on his own project.

And here is the part that is easy to miss. I could do that month partly *because*
I am blind. Everything an agent like this produces, the plan, the reasoning, the
commands it ran, the test output, comes back as plain text. Plain text is not an
accommodation for me. It is my native format, the one a screen reader reads at
full speed with nothing lost. A sighted colleague opens a session trace and their
eye is pulled to the diff, because the diff is the coloured part. I have no
coloured part. I read the reasoning, because the reasoning is what is there.

I have spent twenty years describing that as a cost. For one month it was an
advantage, and I would like that on the record.

## Why that project, and not a smaller one

Here is a question the case study does not ask. The tool was not new at EBANX
when it landed on my desk. So why did it take a bet to make it count?

Because in a company that moves money, skepticism is the job. Every engineering
organisation has watched a tool arrive with big promises and settle into doing
the chores, and the safe assumption about the next one is that it will do the
same. As long as the question was a matter of opinion, the cautious opinion would
win. And it should. Would you want your money in a company where it did not? Me
neither.

So what moves an opinion? Not a better opinion. A number nobody can argue with.

I was not a manager. I had no mandate beyond one question and I would get one
shot at answering it. Miss, and the tool goes back to the chores for a year. So
the answer had to satisfy four conditions at once. It had to be a real project,
not a demo. It had to be scoped large enough that finishing it early meant
something. It had to be visible to the people who decide, so that nobody had to
take my word for it. And it had to come through without errors, because one error
is all a cautious opinion needs, and it is right to need it.

Twelve hours against six weeks is not an argument. It is something everyone has
to look at. That was the point of choosing it.

The offer I made the senior developer is on that page, and it is worth reading
as what it is: not a claim about a tool, but a way of making a bet whose downside
is small enough that a reasonable person can say yes. If it works, you deliver in
a fraction of the time and everyone asks how you did it. If it fails, you have
lost a little and you still have the rest of the estimate to deliver normally.
The case study says one day. It was a few days. The point survives.

We wrote the interface specifications, pointed the agent at the provider's
documentation and at our reference examples, and went for a coffee.

## After the twelve hours

The senior developer presented the result to the organisation himself. The case
study records that. What it does not record is that this was the part I cared
about most, and I made sure of it.

Why? Think about what an engineer sees in each version. A specialist announcing
that a six-week project took twelve hours is something to feel threatened by. A
colleague you know, showing you how he did it, is something to want to follow.
The pace had to arrive as good news, or it would not arrive at all. So the credit
was his, and it was earned: he was the one who had six weeks of responsibility on
the line, and a number reported by that person is evidence. The same number
reported by me would have been a claim.

Then I did something that will sound like nothing. I organised no training.

No workshops, no rollout plan, no slide deck. Knowledge spread on its own, on a
bet I was fairly sure of: whoever ran the tool well would be rewarded by their own
results, and people notice who is being rewarded. Did it work? It did. And while
it was working, the people who decide were watching, and getting the feeling that
this was real. That feeling is the thing you cannot manufacture with a
presentation. You can only set up the conditions for it and wait.

Meanwhile I kept pulling on the parts that were not solved. Writing the
specification before anything gets typed, and treating it as the thing the code
is checked against. Having one session review what another session had written,
long before the vendor shipped a reviewer of its own. And a frank, open line to
Cognition's own people about what was not working yet, which they took seriously
rather than deflecting. Every one of those is a station in the loop between "it
is written" and "it is right", and the twelve hours only ever touched the first
station. The rest is where the year went.

## Where the case study and the series disagree

They do disagree, a little, and I would rather say so than let somebody catch it.

That page is about capacity. A constraint on growth, an engineering organisation
that could not hire fast enough to enter markets fast enough, and a number, 92%
of merged pull requests in the core payments platform now created with Devin,
that says the constraint moved. All true, and the right story to tell from where
a company stands.

The series is about the cost, and the cost is paid somewhere else. I opened it by
telling you what I believe, and I have not moved:
[an agent does not make you less of a professional, it requires you to be a more complete one](article:at-long-last-only-an-engineer).
It removes the one job that was never the hard job and leaves a single person
holding all six of the ones that were. Doing all six badly is easy, and it is
invisible for a while.
[Six things got through](article:six-things-that-got-through) my own gates
anyway, and I published every one of them.

Can a vendor page print that second story? Structurally, no, and it would be
silly to be indignant about it. The two are not in contradiction. The 92% is what
this looks like from the org chart. The six roles are what it costs the person.
And somebody has to be doing them, or the 92% is a number about volume rather
than a number about software.

Both things are true at once. That is usually what an honest measurement looks
like, and I have [measured my own claims](article:an-hour-a-day) closely enough
to know that the honest version is always the more complicated one.

## The part I am simply happy about

I have been careful all the way through this article. Let me stop for a moment.

I am extremely happy about this. I was on holiday in Europe, without Slack, when
the invitation reached me through LinkedIn: Cognition was bringing twenty of its
top Devin users from around the world to its first Champions Summit in San
Francisco, and I was one of them. My holiday ended with a flight there. A few
days with people who had fought the same fights, on trust, on guardrails, on what
a senior engineer is for now. Was it the first time this felt like a field rather
than an experiment? It was. I am honoured to have been there, and I still find it
a little unreal.

I am happy to be someone Cognition knows by name, and to be in a working
relationship where I can tell them what is broken in their product on a Tuesday
and have it discussed seriously. That is rarer than it ought to be, and I do not
take it for granted for a second.

And I am happy to be standing here at all. This is the frontier. Nobody yet knows
what a software engineer is going to be in five years, and I get to be one of the
people finding out, in production, on systems where being wrong costs somebody
real money, at a company willing to let me find out. Twenty years ago a piece of
software gave me access to a computer for the first time. I have spent every year
since somewhere near the boundary between what technology lets people do and what
it does not, and this is the most interesting that boundary has ever been.

So I am not neutral about any of this. I am delighted. Are delight and
measurement in conflict? No. You measure the things you love most carefully of
all, precisely because those are the ones you most want to be true.

## So what is the transferable part

If you take one thing from that case study, do not take the twelve hours.

Take the month: somebody was given the room to understand a tool properly before
being asked to recommend it, and when he did recommend it, he could say exactly
why. Take the bet: real, large enough to matter, visible, and without errors,
with a downside small enough that a reasonable person could say yes to it. Take
the credit, handed to the person who carried the risk, so the pace arrived as
good news. And take the interfaces, which were already written down before the
agent ever saw them.

The tool was ready. That is Cognition's achievement, and I have said so plainly.
The month, the bet, the credit and the interfaces were ours.

The twelve hours needed all of them.

---

If any of this is interesting, the long version, the two repositories, the
conversations quoted from both sides, and the six things that got past my own
gates anyway, is in
[*You are now the whole team*](/series/you-are-now-the-whole-team/). It is nine
articles so far, and it starts
[here](article:at-long-last-only-an-engineer).
