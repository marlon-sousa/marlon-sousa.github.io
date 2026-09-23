---
title: 'Write like TypeScript, deploy like Go'
description: 'I learned Rust by building a bank in it, having never written a line of it before, while the corridor explained that Rust needs PhD-level programmers. What actually changed was not safety. It was relief: I stopped spending my day avoiding mistakes and got to spend it solving the problem.'
pubDate: 'Sep 23 2026 09:00'
series: 'rust-beyond-systems'
seriesPart: 1
tags: ['rust', 'software engineering', 'ai']
draft: false
---

Let's start in a corridor, because that is where this actually happens.

Nobody writes it down. There is no meeting, no decision record, no document
anywhere that says Rust is not for people like you. What there is, is a corridor,
and in the corridor there are sentences:

"Rust is hype."

"Rust is hard."

"Rust would need PhD-level programmers. We could just use JavaScript."

Good engineers say these things. In good faith, most of the time. And — this is
the part worth noticing — usually without ever having sat down and read a page of
well-written, properly abstracted Rust in their lives. Not one page.

Do you want to know what I was doing while those sentences were going round? I
was building a bank in it.

And I had never written a line of Rust before.

## Right, so why Rust, then?

No mysticism here, it was an ordinary engineering argument between me and my
product manager, and it went like this.

Card authorisation has to be fast. That is not an aesthetic preference, it *is*
the product: somebody is standing at a till with a card in their hand, and a
number of milliseconds later either the payment happens or it does not, and they
find out in public. So the authoriser is genuinely a performance problem.

But a bank is not an authoriser. A bank is accounts, statements, card management,
back office, customer service, file processing — all the ordinary, unglamorous
software that any of us write on any Tuesday. That part is not a performance
problem at all. That part is a *people* problem: can somebody else read this code
and change it without being afraid?

So: two languages? One fast one at the bottom, one comfortable one on top?

We could not afford it. Two toolchains, two sets of habits, two hiring stories,
two of everything, for a team our size. Forget it.

Which turns the whole thing into one question, and it is a much better question
than "is Rust hard":

**Is there one language that is fast where it has to be, and ordinary where it is
allowed to be?**

We thought there was exactly one candidate. And we thought that if we took the
genuinely hard parts and abstracted them properly — wrote them once, well, behind
a door with a sensible handle on it — then everything above that door would look
like the ordinary application code it actually was, and any competent programmer
could work in it.

That was the bet. I will come back to it, because it is the argument of this whole
series.

Of what happened next I can tell you almost nothing, and I am sorry about that. It
was a licensed bank in the Turks and Caicos Islands; most of it is not mine to
publish. I can tell you one thing, because it is a fact rather than a detail: in
all the time it ran, serving close to ten thousand people, many of whom no
established commercial bank would give a card to at all — we did not have one
single incident.

Not one.

## "Ah, but you were already a Rust expert"

I really was not. Compass was my first serious Rust, in any sense of the word
serious. We had worked out that it had to be Rust, so I had to learn Rust, so I
learned it.

Take a moment with that, because it is the entire answer to the corridor. If this
language genuinely required a PhD, then a man who had never written a line of it
should not have been able to pick it up and build a core banking system with it
that then ran without incident. Either the corridor is wrong, or I am a great
deal cleverer than I know myself to be, and I can assure you which of those two
is the case.

## What I came from, and the byte that ruined my week

I spent years in C++, on the framework behind a large bank's internet banking —
the layer other people's code sits on, which is where I have always liked to be.
I know C too. I am not visiting from a scripting language and complaining that
the machine is cold.

So let me tell you about a bug I wrote. Not where, not when, not for whom.

There was a string. In C and C++, a string is some characters in memory followed
by a zero byte, and that zero byte is the only thing in the entire universe that
says *stop reading here*. I copied a string. I did not write the zero.

Now — does that blow up immediately? Of course not. That would be useful. It does
nothing at all, and it does nothing for a beautiful reason: in a debug build the
runtime hands you memory that has already been wiped to zeros. So the zero I
forgot to write was *already sitting there*, put there for free by somebody else.
It works. Every test passes. And what, exactly, would a reviewer have seen? The
absence of a byte that nobody typed?

Then you build for release. The wipe is gone, because wiping memory costs time and
a release build does not pay for things you did not ask for. And now my string has
no end. It runs off into whatever happened to be lying next to it and takes that
along for the ride.

It was not a security incident. I am grateful for that roughly once a month, still.
What it was instead: the text that came out the other end was malformed by the time
it reached a browser, one instruction was mangled, a redirect did not happen, and a
whole segment of the system went dark. Real people, trying to do a perfectly
ordinary thing with their own money, and nothing happening.

One byte. A byte that was present in every single environment where anybody was
looking for it, and absent in the only one that counted.

## So be more careful, then

Right. That is the lesson. I should be more careful.

Ooops, calm down.

I *was* careful. That is the part I need you to hear, because if the moral of this
story is "Marlon should concentrate harder" then it is a useless story. I was not
junior, I was not rushing, I was working on a codebase I knew extremely well. The
program was simply bigger than my head, and every program worth being paid for is
bigger than somebody's head.

More tests, then? A test can tell you that *this* place behaves. It cannot tell
you that a kind of mistake is absent from the program. To claim that, you would
need a test per place where the mistake could occur — go on, count them — and at
the end of it you would have proved only that the places you thought of are fine.

More review? Review reads what is on the screen. My bug was not on the screen. My
bug was a byte that was not there.

So here is the duller, more useful lesson I actually took, and it took me years to
put into words: **in C and C++, I spent my day not making mistakes.** The
conventions, the rituals, the defensive copies, the checklists, the reviews
looking for classes of error that the language permitted and I had to forbid by
hand. All of that is work. It is real, skilled, exhausting work. And the problem I
was actually being paid to solve got whatever attention was left over at the end.

That is what changed. Not safety — *relief*. In Rust I get to spend the day on the
problem. The string that has no end is not a bug I must be vigilant about, it is
not a thing a checklist saves me from: it is simply not expressible. A string
knows how long it is. Nothing lets me walk off the end of it. The compiler is not
being strict with me, it is doing the job I used to do with my forehead.

I did not expect to find that emotional. It turned out to be the most emotional
thing about the language.

## Write like TypeScript, deploy like Go

So what did it actually look like, day to day, this bank written largely by people
who had not been Rust programmers the year before?

It looked like application code. Structs describing the data. Functions taking it
and handing it back. Enums for the handful of shapes a thing was allowed to be.
Iterators over collections. Async tasks for the concurrent work, channels between
them, graceful shutdown that genuinely shut down — which matters rather a lot in a
system that is halfway through moving somebody's money when the node gets drained.
Show me a page of it with the filename hidden and I am not sure you would guess the
language. I am fairly sure you would not guess "systems programming".

And when it was finished: you compile, you get a file, you copy the file to the
machine, you run the file.

No runtime on the target. No interpreter version to match. No virtual environment,
no `node_modules` weighing more than the application, no container whose entire
purpose in life is to carry an interpreter to the place where the program has to
run. Ours went onto Kubernetes, and what went into the image was a binary.

I have spent large parts of my career on the other side of that sentence. I am not
over it.

That is the title of this article, and you will have noticed that I have just
asserted the whole thing without showing you a single line of either language.
Noted. We will fix that next time.

## The hard parts are real. Put them behind a door

I am not going to stand here and tell you there is nothing difficult in Rust.
There is. Lifetimes are difficult when you first meet them and mildly annoying
forever after. Some data structures are genuinely fiddly.

But here is the thing the corridor never gets to, because it never opens the file:
**those parts are small, and you write them once.** That was our whole bet at the
bank, and the bet came off. The awkward, clever, low-level bits live behind an
abstraction with a decent name on it, written carefully, once. Everything above it
is application code that reads like application code, and a programmer joining the
team works in *that*, the same way you work with a database driver without having
read its source.

Which is, when you think about it, not a Rust argument at all. It is just
engineering, and you already do it everywhere else — you have simply never had to
look at the door.

Think about what you ran yesterday. Did you touch numbers in Python? That work
happened in C and Fortran. Did you parse, compress or hash anything in Node? A
native module did it. Python itself is a C program. You have been standing on
compiled code every working day of your entire career, you have never read a line
of it, and nobody has ever once suggested that this makes you less of a
programmer.

So the difference is not that Rust has a hard layer and your language does not.
The difference is that in your language that door is *locked*. You cannot open it,
and on the day what is behind it turns out to be missing or wrong, your options
are to write a C extension or to go and be sad. Here the door opens, and what is
behind it is written in the same language you were already writing.

And the part the corridor never gets to at all: most of the time you do not write
the hard bit, because somebody already wrote it and it is a crate. Parsing, async
runtimes, HTTP, dates, regular expressions, serialisation — the fiddly, clever,
allocation-counting code is largely somebody else's, exactly as it is in your
language today, and you get at it by adding a line to a file. The hard parts are
real. They are mostly not yours.

The same mercy applies to your first draft. Clone everything. Every string, every
structure, every time the borrow checker gives you a look: `.clone()`. Your code
will be covered in them like a house with tape over every window, and it will still
be fast — often faster, and much more predictably fast, than the thing you tuned
carefully in another language last year. You do not have to be good at Rust to
profit from Rust. The optimisation is there for the day you need it. It is not the
entry fee.

"But a real Rust programmer would never write it like—"

Ooops, calm down. A real Rust programmer is somebody who writes Rust. That is the
entire test. I write mine with tape over the windows and I ship it to production.

## So what is this series?

In 2022 I wrote a Rust tutorial. I hid it inside a working program as thirty-seven
numbered blocks of comments, because I thought that was a lovely idea. It *was* a
lovely idea. Four years later that repository had no stars, no forks, not one
issue, and — my favourite detail, the one that still makes me laugh — the program
it taught from had never actually managed to write a file. Four years of a tutorial
nobody read, about a converter that converted nothing.

The writing was fine. The container was ridiculous. Nobody clones a repository to
read a tutorial.

So we are going to do it again, properly and in the open. Empty repository, and we
build the thing together: a converter that takes a Postman collection and writes
`.http` files you can fire from your editor. Small, honest, finishable. Every
article ends at a git tag, so you can check out exactly the code it describes and
run it yourself. Concepts arrive when the program needs them and not before, which
is the opposite of how a language reference works and, I think, the way people
actually learn.

Who is it for? Somebody who writes software, in any language, and has heard the
corridor. Who is it not for? Somebody who has never programmed — I am not going to
explain what an `if` is. And if you are an experienced Rustacean who wandered in:
you are very welcome, and I will say now what I said in 2022, which is that your
qualified advice is worth a great deal more to all of us than your qualified
criticism.

I am not writing the Book. The Book is excellent, and it teaches the language.
This teaches a program.

And one thing you should know before we start, because you are going to see it in
the code: most of what I write these days, I do not type. An agent types it and I
review it. I am not mentioning that as a curiosity about tooling — it turns out to
change this argument rather than decorate it, and by a lot. But it needs the rest
of the argument standing up first, so I am going to leave it alone until I can do
it properly.

Two short articles first, because I have just asked you to take a great deal on
trust. One puts this language next to the one you already write, feature by
feature, so you can see the shape of an ordinary working day in it. The other
shows you which specific things stop going wrong, and what leaving them possible
has been costing you. Then we open the directory and start.

## Next time

Enough assertion. In [*Put it next to what you already
write*](article:put-it-next-to-what-you-already-write) I put the two languages
side by side and let you judge for yourself: the same handful of things you do
every single working day, written first in TypeScript and then in Rust, with
nothing hidden — and nothing to complain about either. Just the shape of a
Tuesday, twice.
