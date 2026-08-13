---
title: 'At long last, only an engineer'
description: 'We were always the engineer and the bricklayer, because in software putting the walls up is itself an ultra-qualified job. Something else can lay the bricks now — which does not make you less of an engineer, it makes you only an engineer.'
pubDate: 'Aug 13 2026'
series: 'you-are-now-the-whole-team'
seriesPart: 1
tags: ['ai engineering', 'ai', 'software engineering']
draft: false
---

Hello, and welcome to
[*You are now the whole team*](/series/you-are-now-the-whole-team/).

Let me start by telling you what I believe, because everything else I write here
is an attempt to explain why.

> **I believe that building professional software with an AI agent requires you
> to be a *more* complete professional than building it by hand ever did.**

Not less. More.

Thinking that this is a strange thing to say in 2026? That everybody else is
saying the opposite — that the barrier came down, that anyone can code now, that
the hard part is over?

Well, get used to it, because I am going to spend a whole series on it.

And I am aware of how this sounds. It sounds like a senior engineer defending
his position, which is the least interesting thing a senior engineer can do, and
I have no interest in doing it.

So let me say where this is coming from, and then let me say what I am *not*
claiming.

This is not a first impression. I have spent about a year and a half on agentic
development, deliberately and fairly obsessively — and not as a hobby. It is part
of my actual job: research into how agents earn a place inside a production
engineering organisation, as opposed to inside a demo.

A great deal of that has been with [Devin](https://devin.ai), built by
[Cognition](https://cognition.ai). If you have not come across it, Devin is an
autonomous software engineer: you give it a task, and it goes away and works on it
on its own — plans, writes, runs, opens the pull request — rather than sitting in
your editor completing your lines. That difference matters for everything I am
about to argue, because an agent that works while you are not looking is an agent
whose judgement you had better have thought about in advance.

Along the way I have lost most of my hair trying to communicate properly with
these little friends of ours, the agents, and a good number of evenings finding
out that what I thought I had said was not remotely what I had said.

In June 2026, Cognition ran its first
[Champions Summit](https://www.linkedin.com/posts/cognition-ai-labs_we-recently-hosted-the-first-cognition-champions-activity-7471215029489471488-0hKr/):
they brought together twenty of their heaviest Devin users from around the world —
teams already running it in production on migrations, internal tooling and
automation — and put us in a room at their San Francisco offices for a day of
workshops. I was one of the twenty, and I
[speak in the video](https://www.youtube.com/watch?v=CHHtsJGivE4&t=109s) they made
of it.

I mention that not to wave a badge around, but because it is the honest answer to
"why should I read *this* one". I have been at this a while, and I have spent a
day arguing about it with nineteen other people who have also been at it a while,
which is a rarer thing than it sounds.

That does not make me right. It makes me somebody who has already made a lot of
the mistakes. So what follows is what a year and a half of that has shown me,
and what I am still trying to work out.

Now, what I am not claiming.

I am not claiming that AI does not work. It works. It works so well that I
finally built something I had wanted for years and could never afford to build.
I am not claiming it makes you lazy, or that using help is cheating — I will come
back to it properly later on, and my answer is the opposite of what you
might expect.

And I am certainly not claiming that **coding was the cheap part.**

You hear that a lot: that the agent only took over the typing, which was never
the expensive bit anyway. That is nonsense, and anybody who has lost a week to
one bug knows it is nonsense. Writing code is slow and it is expensive. That is
*exactly* why an agent is such an enormous thing, and exactly why I can build
today what I could not build for years. I am not going to pretend to be
unimpressed in order to sound wise.

So here is the shape of it, and I want to put it more carefully than I usually
hear it put.

It is not that you could not design your system. Of course you could. Most of us
knew perfectly well what a decent architecture looked like, what the test strategy
should have been, and what order things ought to be built in.

It is that **the building competed with the engineering**, and the building always
won, because it had a deadline attached to it.

Let me put it in bricks, because that is where it finally made sense to me.

Go and look at a building site. There is an engineer, and there are people putting
the walls up, and those are not the same people. Not because the engineer is too
grand to lay a brick, but because it is a different job. The engineer decides
where the walls go and why the building stands up. The bricklayers put the walls
up. Each of them is highly skilled at their own work, and neither is doing the
other's.

Now look at our trade. **We had no bricklayers.**

And I want to be precise about why, because it is not that we were too proud to
hire them. It is that **in software, putting the walls up is itself an
ultra-qualified job.** You cannot hand "just implement this module" to somebody
unskilled and go back to thinking. Writing the actual code requires very nearly
everything that designing the thing required — the same understanding, the same
care, the same person. There was never a cheaper pair of hands to give it to,
because a cheaper pair of hands could not do it.

So we were the engineers, and we were also the ones on the scaffolding, all day,
every day. And laying bricks takes time. It takes *most* of the time.

Which meant the engineering got whatever was left over. Usually that was a burst
at the very beginning — the moment when you know least about the problem you are
solving — and after that you were up on the wall with your hands full of mortar,
and going back to redraw the plan meant taking down something you had already
built.

Look at what that produced. Everybody reading this recognises the list:

- **Technical debt**, which is mostly just decisions nobody had time to take
  properly, quietly compounding.
- **Projects abandoned halfway**, because the real shape of the thing only became
  visible after most of the money had been spent.
- **Scope that changed suddenly and late**, because nobody could afford to find
  out early what was actually wanted.

None of that is a story about incompetent people. I have worked with excellent
engineers who shipped all three of those, and so have you. It is a story about
where the hours went.

And now, for the first time, there is something that can lay the bricks.

Not perfectly. Not unsupervised. But genuinely, and fast, and well enough that
the wall stands. That is the whole event. That is what actually happened to our
industry, and it is a much bigger deal than "AI can write code".

And to be fair, it is no longer only bricks. Agents have started helping with the
drawing as well. They argue with you, they spot the case you had not considered,
and later on I am going to show you a night where one of them took a rule I was
proud of, found the hole in it, and was entirely right. That is real, and I am not
going to pretend it away in order to keep my dignity.

But helping to reason is not the same thing as being responsible for the
reasoning. Somebody still has to decide what is being built, draw the line the
agent works inside, and then check whether the confident explanation that just
arrived is actually true. That somebody is you, and it is most of what I am going
to be talking about.

Because here is what it does to you. It does not make you less of an engineer.

**It makes you, at long last, only an engineer.**

And that is a much harder job than the one you have been doing, for the simple
reason that you have never had time to do it properly, and you have never had to
find out whether you could.

The hours come back. And with them come all the jobs you always knew you should be
doing and never had room for — deciding what is worth building, in what order,
inside what boundaries, with what counting as proof. Those are not new jobs. They
were always yours. What is new is that **you no longer have the one excuse that
used to cover every one of them.**

## Wait — but I vibe code all the time and it is great

Yes. And it is great. Let me draw a line here, carefully, because I do not want
anybody reading this as a complaint about how other people work.

*Vibe coding* has a real and useful meaning, and the definition is precise: **you
do not read the output.** You describe what you want, you accept the diffs, you
do not look, you let it ride. If it does the thing, it did the thing.

There is nothing wrong with that. I want to say it plainly, because the
conversation around this topic has become weirdly moralistic and I have no
interest in joining in. Vibe coding is genuinely wonderful. If you are automating
a spreadsheet, writing a script to rename four hundred photos, building a little
tool that only you will ever run, or making something for the house — that is a
complete and happy story, and it is a story that was simply not available to most
people two years ago. Go and enjoy it. I do it too, and I do not feel bad about
it, and neither should you.

But it is not what this series is about, and the difference is not a matter of
degree.

> Vibe coding is defined by what you do not look at. What I am describing is
> defined by what you refuse to leave unspecified.

Those are opposite disciplines. So let me explain the difference the way it
finally made sense to me, which is by getting out of software entirely.

## The small plane and the airliner

Think about learning to fly.

To go up alone in a small aeroplane — a little single-engine thing, good weather,
one passenger seat you are not using — you need real training, but a
comprehensible amount of it. Some tens of hours with an instructor, a written
exam, a check ride. Thousands of ordinary people do this. It is not easy, but it
is achievable by anyone willing to put in the evenings, and nobody thinks that is
scandalous.

Now think about what it takes to sit in the left seat of a commercial airliner.

Well over a thousand hours before you may even apply. A type rating for the
specific aircraft. Recurrent simulator checks, forever, where they fail things on
you on purpose. Medical certification. A whole second person beside you whose job
includes disagreeing with you.

And here is the part I find genuinely instructive:

> **The airliner has vastly more automation than the small plane. And it demands
> vastly more training, not less.**

Sit with that, because our industry keeps assuming the opposite relationship.

That aeroplane can hold a heading, hold an altitude, fly a route, manage its own
engines, and in some conditions land itself. On paper, an enormous amount of the
*flying* has been taken away from the pilot. And yet the requirements to command
one went up, and up, and up.

Why? Because the automation was never installed so that a less qualified person
could fly. It was installed so that a highly qualified person could run a far
more demanding operation — heavier, faster, further, in worse weather, with three
hundred people in the back — without being consumed by the manual labour of
holding the wings level.

The automation did not replace the pilot's expertise. **It moved the pilot's
expertise from the controls to the system.** The job stopped being "manipulate
the yoke correctly" and became "know at all times what this machine is doing,
notice the moment it is doing something that is not what you intended, understand
why, and be ready to take it back."

And that second job is harder than the first one. It is harder because it is
quieter. Nothing shakes. Nothing feels wrong. The automation does not announce
that it has understood you incorrectly — it proceeds, smoothly and confidently,
executing exactly what it thinks you asked for. The failures of automated systems
are not usually loud; they are usually *plausible*.

I think you can see where I am going.

Vibe coding is the small plane. Good weather, nobody else on board, and if it all
goes wrong you have lost an afternoon. Honestly, go flying.

Professional software — software other people depend on, which somebody who was
not there when it was written will have to maintain — is the airliner. And the
agent is the automation: real, powerful, the reason the operation is possible at
all, and absolutely not a substitute for knowing what it is doing.

Don't believe me? Fair enough. I wouldn't either, from a paragraph.

## Next time

So let me stop asserting things and start showing you some.

Next I want to tell you about a piece of software I wanted for years and could not
afford to build — what it is, what it sounds like, why it was out of reach for
somebody with a full-time job and a family, and what finally changed.

And then I want to tell you about the evening I finally had the means. I sat down
in front of an agent that would cheerfully have started writing that terminal
within the next thirty seconds, if I had told it to.

I did not tell it to.
