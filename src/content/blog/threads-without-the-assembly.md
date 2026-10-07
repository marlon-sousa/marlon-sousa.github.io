---
title: 'Threads, without the assembly'
description: 'What a thread is, told in a kitchen that cooks for weddings. Why a bigger kitchen alone is no faster, why running a program twice does not help one order, and a mountain of potatoes peeled three and a half times sooner — measured.'
pubDate: 'Oct 07 2026 12:00'
series: 'rust-beyond-systems'
seriesPart: 9
code: 'postres@part-09'
tags: ['rust', 'software engineering']
draft: false
---

[Last time](article:now-later-or-only-in-tests) we went back over postres's working
code and made it say what it means: a default worked out only when it is needed, five
tests turned into a table, and test code that is not switched off in the program but
simply absent from it. Nothing the user sees changed.

postres still tells us what it is going to do with a `println!`, and that line looks
like the most innocent one in the program. Is it? Before we can even ask, we need the
word that comes up every time anybody talks about it: threads. So this time is all
about them — what they are, and why anybody wants more than one — without a single line
of assembly. postres itself does not change; the code for this one lives next to it,
in a folder called `examples/`.

## Threads, threads...

*"Threads, threads... They are cool, they are dangerous. New languages have been made
to avoid them; new languages have been made to deal with them. They are fast, they are
slow, they are cool, they have to be avoided... I am feeling threatened, because nobody
explains to me what all this is about. And no, I do not have time to read a 270-page
book full of assembly code; this whole thing promised to be a non-systems series..."*

I see, I see. I am still frustrated with all of this too, and while threads are a kind
of low-level concept, explaining them does not have to be.

So let's start from the very beginning. Before threads: what is a computer, anyway?

## A kitchen

Think of it as a restaurant kitchen.

A kitchen has stoves, and the stoves are where the cooking actually happens. In a
computer, those are the processor's *cores*. The laptop I am writing this on has six:
six stoves.

A kitchen has workbenches, where the ingredients and the half-finished dishes sit
while the cooks work on them. That is the computer's *memory*.

And every kitchen has a manager, who decides who gets which stove, and which part of
the workbench. That is the *operating system*.

So who cooks? The programs you run. Each one is an *order* the kitchen is working on,
and every order gets its own part of the workbench and one cook. The cook reads the
recipe and follows it, one step after the other, from beginning to end.

That cook is a thread. That is all a thread is: one worker following a list of
instructions, step by step.

And since every order comes with a cook, every program has at least one thread. So,
congratulations: you have been using threads all along, even though you did not know
it! postres is an order like any other. You run it, and that places it: *one `.http`
burger, please, made with Postman pieces.* One cook takes it — the one that starts in
`main` — reads the collection, picks out the requests, writes the file, and the burger
comes out. You ask, you wait, you get it.

*"I use threads in Java every day, and I could not have told you that."*

Most of us could not. We use them; nobody stops to say what they are.

## The manager's favourite game

Now, postres is not the only order in this kitchen. Right now, your computer is
running a browser, an editor, something playing music, and plenty of things you never
asked for, each with its own cooks, all sharing the same stoves.

*"Wait. So my computer is playing music, with an editor open, a browser, a chat... I
can count maybe ten things. And I have ten processors?"*

Ah, here is something nobody told you. Ten? I counted on this laptop while writing
this paragraph: 437 processes, and between them, 6,171 threads. Six stoves. And the
processor was 84 percent idle.

How? Because the manager is much smarter than "one cook per stove". Look at what those
cooks are actually doing, and you find that almost none of them are cooking. They are
*waiting*. The editor's cook waits for you to press a key. The browser's waits for an
answer from the network. The music player's needs a stove for a tiny moment, to prepare
the next fraction of a second of sound, and then has nothing to do until the one after.
And a cook who is waiting does not need a stove at all. So the manager sends them
aside, hands the stove to somebody who has something to cook, and when the thing they
were waiting for arrives — the key is pressed, the answer comes back — puts them back
in line.

And the cooks who do have work? They take turns. The manager gives one a stove for a
few thousandths of a second, sends them aside, lets the next one in, brings the first
one back, over and over, fast enough that everybody seems to be cooking at once. A cook
is sent aside wherever they happen to be in the recipe, halfway through chopping an
onion, and never gets to choose when. The manager notes exactly where they were —
which step of the recipe, what was in their hands — puts the half-chopped onion away in
its place on the workbench, and when the cook's turn comes round again, hands it all
back exactly as it was.

And here is the fun part: the cook never notices. Remember freeze tag, as a kid?
Somebody touches you — frozen! — and you stop right where you are, one foot in the
air. Then somebody touches you again, and off you run, as if nothing had happened.
Well, our manager loves that game, and plays it with every cook in the kitchen, all
day long: frozen, mid-onion; unfrozen, carry on chopping. Only, the manager is so good
at it that the cooks never even feel the touch. As far as they are concerned, they
chopped that onion in one go. Keep that one in mind.

## Saturday: three weddings

Let's say our kitchen cooks for weddings. This Saturday there are three of them:
Alice's, Bruna's and Carol's, two hundred guests each, and every guest wants fries.
Three orders, three cooks, each at their own part of the workbench, each with their
own mountain of potatoes. Six stoves, three cooks: room to spare. Everybody peels: one
potato, then the next, then the next.

Friday evening, the phone rings. It is Carol: a hundred more guests are coming. You
know how it is; popular people always do that. Three hundred plates now, and still one
cook on that order.

What happens? Alice and Bruna get their fries on time. And poor Carol? A hundred guests
sitting there, hungry, watching the other two weddings eat... unless we put somebody
else on that order to help! And look at the kitchen while it happens: three stoves
free, and nobody at them, because each order has exactly one cook.

What would you do?

Buy a bigger kitchen! Twelve stoves. And...? Nothing. Carol's cook still has two hands
and one peeler, and peels one potato at a time, and the extra stoves stay cold. That is
the part nobody tells you when you buy a faster computer: more cores, and a program
with one cook takes exactly as long as before.

Then more cooks. Easy: place the order twice! Run it twice!

Hmm. A second order for Carol's wedding brings a second cook, all right — at a part of
the workbench of their own, with a mountain of their own. They would peel another three
hundred plates of potatoes, and never touch the pile Carol's guests are waiting for.
Two orders share nothing. That is exactly what you want for two weddings, and it is
exactly what you get when you run a program twice: two *processes*, each running copy
with its own memory and its own cooks. Two collections to convert? Run postres twice;
that is the right answer. But it does nothing for Carol.

What Carol needs is a second cook *on the same order*: same part of the workbench, same
pile of potatoes. Split the pile in two, a sack each, and the guests eat on time. And
that is what a second thread is. Not another copy of the program: another cook *inside*
the same program, working on the same order, with their hands on the same workbench —
the same memory.

## Not every order splits

Will that always work? No. Say Bruna orders a wedding cake. Mix the batter, bake it, ice
it. The icing needs the cake, and the cake needs the batter. Put six cooks on it, and
five of them stand around watching the oven. Project managers have their own version of
this one: nine women cannot make a baby in one month.

More cooks only help when the work splits into pieces that do not wait for each other.
Potatoes do. A cake does not.

## Let's peel

Enough talk. Let's peel.

Our potatoes are numbers, and peeling one means checking whether it is prime: a small
job, repeated millions of times, and no potato depends on any other — just like the
real ones.

What will we need? Let's write the list before the code, the way a cook reads the
recipe before turning the stove on. A *function*, so that a cook can be told "peel this
stretch of potatoes". A *variable* to keep count of the primes, and one that changes as
we go, which in Rust needs a word of its own. A *loop*, to go through the potatoes one
by one. And then, for the six cooks, a way to send each one off with their own share.
We will take them one at a time.

First, the size of the job. At the very top of the file, before anything else, two
numbers that the whole kitchen needs to know:

```rust include="postres@part-09:examples/potatoes.rs#consts"
```

These are *constants*: fixed values with a name. `POTATOES` is how many potatoes there
are to peel, twelve million, and `COOKS` is how many cooks we will hire, six. `const`
says it is a constant, then comes the name, then a colon and its type — `u64`, a whole
number, which we will look at properly in a moment — and then its value. The
underscores in `12_000_000` are only there for our eyes; Rust ignores them.

*"Why the capital letters?"*

Because that is how Rust writes constants, so that you can tell one from a variable
the moment you see it, anywhere in the file. Java does the same with its
`static final` fields: `MAX_VALUE`, not `maxValue`. In Rust it is more than a habit,
though. Write `const cooks` in lower case, and the compiler warns you that a constant
*"should have an upper case name"*. And a constant never changes, ever, so whenever you
read `POTATOES` or `COOKS` further down, it means twelve million and six.

Now, the cook's recipe:

```rust include="postres@part-09:examples/potatoes.rs#peel"
```

Let's read it slowly, from the top.

`fn peel(first: u64, last: u64) -> u64` is the function. `fn` says a function starts
here, and `peel` is its name. Between the brackets, what it needs to be given: two
numbers, `first` and `last`, where the stretch of potatoes starts and stops. And after
the arrow, `->`, what it gives back: one more number, the count.

*"The types come after the names. In Java it would be `long peel(long first, long
last)`."*

Same information, other order: the name first, then a colon, then the type. And `u64`
is the type: a whole number, unsigned — never negative — and 64 bits wide. The `u8` and
`u32` you will meet elsewhere are its smaller cousins. Sixty-four bits is more than
enough to count twelve million potatoes.

Next line: `let mut primes = 0;`. `let` makes a variable, here called `primes`, starting
at zero. And `mut`?

*"Why does it need a word? A variable is a variable."*

Not in Rust. In Rust, a variable cannot change once it has a value, unless you say so.
It is as if every variable in Java were `final` by default, and you had to ask for the
other kind. That is what `mut`, short for *mutable*, does: it asks. Why make you ask?
Because when you read a function, every `let` without `mut` is a value you never have to
keep an eye on again. Only the `mut` ones can move. Here, `primes` has to change — it
counts up — so it gets the word.

And its type? We never wrote one. The compiler worked it out: `primes` is what the
function gives back, and the function gives back a `u64`, so `primes` is a `u64`.

Then the loop: `for potato in first..last`.

*"And `first..last`?"*

A *range*: every number from `first` up to, but not including, `last`. And `for` walks
through it, once for each number, calling the current one `potato`. So if a cook is
given `0` and `2_000_000`, `potato` is 0, then 1, then 2, and so on up to 1,999,999.

Inside the loop, `if is_prime(potato)`: the peeler, another function in the same file,
which we will open in a minute. It answers yes or no: is this potato prime? No
brackets around the condition, by the way; Rust does not need them. And if the potato
turns out to be prime, `primes += 1` adds one to the count, as in Java. That line is the
reason `primes` needed its `mut`: without it, the compiler would refuse to change it.

And at the very end, `primes`, alone, with no semicolon: the last line of the function
is what it gives back, the same rule as the blocks we met when we were looking for a
default name.

And the peeler itself:

```rust include="postres@part-09:examples/potatoes.rs#is_prime"
```

`fn is_prime(n: u64) -> bool`: it takes one number, `n`, and gives back a `bool`, which
is `true` or `false`, exactly like Java's `boolean`.

First, `if n < 2 { return false; }`. Zero and one are not prime, by definition, so for
those we answer straight away. `return` leaves the function on the spot with that
answer, as in Java. We do not need it at the very end — the last line does that — but
it is how you leave early.

Then the real work. A number is prime when nothing divides it except one and itself. So
we try to divide it: by 2, by 3, by 4, and so on. `let mut divisor = 2` is the number we
are trying, and it needs its `mut`, because it goes up as we try.

`while divisor * divisor <= n` is the other kind of loop. `for` walks through a range
it knows in advance; `while` keeps going for as long as its condition holds, and checks
it again before every turn. And why `divisor * divisor`? Because if `n` can be divided
at all, one of the two pieces is at most its square root. Is 91 prime? 91 is 7 times 13;
we find the 7 long before we would ever need the 13. So once `divisor` squared is past
`n`, there is nothing left to find, and we can stop.

Inside, `n % divisor` is the remainder of the division, as in Java. If it is zero,
`divisor` divides `n` exactly, so `n` is not prime: `return false`, and we are done.
Otherwise, `divisor += 1`, and the loop goes round to try the next one.

And if the loop runs out without finding anything, we reach the last line: `true`.
Nothing divided it. Prime.

It is slow, on purpose. There are much cleverer ways to find primes. But we are not
here to find primes; we are here to give a cook a lot of honest work, and this is a
lot of honest work.

That is one cook. Now, Carol's kitchen as it was before the phone rang: one cook with
the whole mountain.

```rust include="postres@part-09:examples/potatoes.rs#alone"
```

`let start = Instant::now();` notes the time on the kitchen clock. Then the cook peels
everything, from `0` to `POTATOES` — all twelve million — and `let primes` keeps what came back. And the
`println!` prints the count and `start.elapsed()`, how long it has been since we looked
at the clock. The `{:?}` is a slot like `{}`, but it prints the value the way the type
prints itself for programmers — for a duration, something like `5.4s`.

So, a function, a few variables, two kinds of loop, an `if`, a constant, a clock. Look
back over all of it. Anything here that you would not have written, more or less the
same way, in Python or TypeScript? Except for that `mut`... I don't think so. So much for
the PhD.

And that `mut`, little as it looks, deserves a promise. We will see later on that it
is one of the most important words in the language: because Rust knows exactly what can
change and what cannot, the compiler can make optimisations it would never dare make
otherwise, and you can skip reading great stretches of code, knowing for certain they
did not touch your value.

And now Carol gets help. Why stop at one more? The kitchen has six stoves, so six cooks:

```rust include="postres@part-09:examples/potatoes.rs#together"
```

It looks longer, but there are only three things going on: hire the cooks, wait for
them, add up.

First, `let start = Instant::now();` again.

*"Wait, `start` already exists. You are declaring it twice?"*

We are, and Rust allows it. A second `let` with the same name makes a brand-new
variable, which simply hides the old one from that line on. It is called *shadowing*,
and it is handy exactly here: a new measurement, so a new `start`, without having to
invent `start2`. The same thing happens to `primes` a few lines down.

`let mut cooks = Vec::new();` is an empty list — `Vec` is Rust's `ArrayList` — that will
hold the six cooks. `mut` again, because we are about to add to it. And
`let sack = POTATOES / COOKS;` is each cook's share: twelve million divided by six, two
million potatoes per sack.

Then the hiring: `for cook in 0..COOKS`, a loop that runs six times, with `cook` going
from 0 to 5. Each time round, `first` is where that cook's sack starts: cook 0 starts at
0, cook 1 at two million, and so on. No `mut` on `first`, by the way: each time round
the loop, it is a new `first`, and none of them ever changes.

And `thread::spawn(…)` is the hiring itself. It starts a new thread — a new cook — and
hands them a recipe to follow. The recipe is a *closure*, the two bars `||` followed by
what to do: `peel(first, first + sack)`, peel your sack. Last time we said a closure is
a block you can hand to someone else, to run later. Here, that someone is a brand-new
thread.

*"Hold on. That line calls `peel`. Doesn't the loop sit there until the sack is done?"*

It would, if `peel` were called there. But it is not: it is behind the two bars, inside
the closure, so it is a recipe handed over, not a call made. `spawn` gives the recipe to
the new cook and comes straight back, without waiting for a single potato. The cook
starts peeling on their own, at their own stove, while the loop has already moved on
to hire the next one. Six times round, a few millionths of a second, and six cooks are
peeling at once. Nobody waits for anybody yet.

What `spawn` gives back is not the count — that does not exist yet — but a *handle* to
the cook, a way to find them again later. That is `hired`, and `push` puts it in the
list.

Now, `move`. Why is it there?

Think about what is happening. The loop is about to go round again, and make a new
`first` for the next cook. But the cook we just hired is walking away with a recipe
that says `first` and `sack`. Which `first`? The one from *their* turn of the loop, and
that one is about to be gone. So without `move`, Rust refuses to compile it. The error
says it in so many words: *"closure may outlive the current function"* — the cook could
still be peeling long after the code that hired them has moved on. And the compiler
suggests the fix: `move`.

`move` says: take your own copy of everything you use, and take it with you. Each cook
leaves with their own `first` and their own `sack`, in their own pocket, and the loop is
free to carry on.

*"In Java I never had to say anything like that."*

Because Java always does it. A Java lambda that uses a local variable gets a copy of
it, every time — which is why Java insists that the variable never changes, so that the
copy and the original cannot disagree. Rust's closures, by default, use a variable where
it is, and copy it only when you ask. `move` is the asking.

Second step, waiting. *Now* somebody waits: `for cook in cooks` goes through the list of
handles, and `join` waits for that cook to finish. While the first cook is still
peeling, the other five are peeling too, so by the time we have waited for the first,
the rest are nearly done. When they do, it hands back what their recipe gave back:
their count of primes. It comes wrapped in a `Result`, which we `unwrap`, because a cook
could, in principle, have crashed.

Third step, adding up: `primes += …`, into a `primes` that starts at zero and has its
`mut`, because it grows by six counts. And the same `println!` as before.

Notice what is *not* there: nothing shared. Each cook has their own sack and their own
count, and only at the very end, once everybody is done, do we add up the results.

The moment of truth:

```text
$ cargo run --release --example potatoes
one cook:  788060 primes in 5.4087917s
six cooks: 788060 primes in 1.5316801s
```

Same answer. And five and a half seconds became one and a half! Not six times faster,
though: three and a half. Why? Because the sacks are not equal. The last one holds the
biggest numbers, and big numbers are harder to peel. The order is ready when the slowest
cook finishes, never before.

And the bigger kitchen? I can test that too, because Windows lets you tell a program
which stoves it may use. Here is the same program, allowed only one stove, next to the
run above, which had the whole kitchen:

| Cooks | One stove | The whole kitchen |
| --- | --- | --- |
| One cook | 5.9 seconds | 5.4 seconds |
| Six cooks | 5.9 seconds | 1.5 seconds |

Read it across, then down. One cook gains nothing from a bigger kitchen: the extra
stoves stay cold. Six cooks gain nothing from one stove: the manager plays freeze tag
with all six at that one stove, and the potatoes come out exactly as fast as with one
cook. More stoves alone, nothing. More cooks alone, nothing. Both together, and the
fries come out three and a half times sooner.

## So that is the cool part

There it is. Threads are *cool* because a program with several of them can do several
things at once, on as many stoves as the machine has. And because a cook waiting for
something slow — the oven, or for a program a file or an answer from the network — does
not stop the others from cooking.

But look again at how easy we made it for ourselves. We split the mountain into sacks
before anybody started, and nobody touched anybody else's potatoes until the very end.
Real kitchens are rarely that tidy. Carol's cooks share a workbench, and sooner or later
two of them reach for the same thing.

## Run it

```sh
git clone https://github.com/marlon-sousa/postres.git
cd postres
git checkout part-09
cargo run --release --example potatoes
```

`--release` builds with the optimisations switched on, which is what you want before
timing anything. Cargo builds anything in the `examples/` folder as a small program of
its own, run with `cargo run --example` and its name, and never puts it in postres
itself. And CI already checks it on every change, without one line added to it.

## Wrapping it up

We have just opened up the word everybody uses and nobody explains: what a thread is,
what the operating system does with thousands of them, and when more of them actually
make a program faster. On the way, these are the ideas we met:

1. **A computer is a kitchen**: the cores are the stoves, the memory is the workbench,
   and the operating system is the manager.
2. **A thread is one worker following instructions, step by step.** Every program
   starts with one.
3. **A process is a running copy of a program**, with its own memory. Running a program
   twice makes two processes, which share nothing.
4. **The operating system shares the cores** among thousands of threads: those that
   wait get none, and the rest take turns, frozen and unfrozen anywhere without
   noticing.
5. **More cores do nothing for a program with one thread, and more threads do nothing
   without cores to run them.** It takes both.
6. **More threads only help when the work splits** into pieces that do not wait for each
   other: potatoes, not a cake.
7. **A function is written `fn name(param: Type) -> Type`**: the name before the type,
   and its last line, without a semicolon, is what it gives back.
8. **A variable cannot change unless it is `let mut`**, as if everything were `final`
   by default; the compiler works out its type when it can.
9. **A second `let` with the same name shadows the first**: a new variable, hiding the
   old one from there on.
10. **`u64`** is an unsigned whole number of 64 bits; **`const`** gives a fixed value a
    name, like a `static final`, written in capitals so it can never pass for a
    variable.
11. **`for x in a..b`** walks through a range, every number from `a` up to but not
    including `b`; **`while`** goes round for as long as its condition holds; and
    **`return`** leaves a function early.
12. **`thread::spawn`** runs a closure on a new thread, and **`join`** waits for it and
    hands back what it gave back.
13. **`move`** makes a closure take its own copy of what it uses, so a thread can leave
    with it. Java's lambdas always copy; Rust's copy when you ask.

### The jobs

Building software alone with an agent means doing six jobs that used to belong to six
people. How many did this one do? Three:

- **Architect** — two kinds of "more": another process for another collection, and more
  threads for one big order; and sacks split up front, so that the cooks share nothing.
- **QA** — "a faster machine is faster" and "more threads are faster", both measured
  instead of believed: one stove or the whole kitchen, one cook or six, and only both
  together paid.
- **Platform engineer** — nothing to do, which is the point: the CI set up when the
  project was born builds and lints the new example on three operating systems, because
  it was told to check every target.

No product owner: nothing the user sees changed. And nothing for the project manager or
the reviewer.

The six jobs are counted in [*The night that produced no
code*](article:the-night-that-produced-no-code), in the series *You are now the whole
team*.

### What Rust solved that would have been a problem elsewhere

- **More cooks really cook at once.** I ran the same potatoes in Python, one thread and
  then six: 6.3 seconds, then 5.7. Python, in its usual build, lets only one thread run
  Python code at a time, so six cooks take turns at a single stove. JavaScript runs your
  code on one thread unless you set up separate workers. Rust threads, like Java's or
  Go's, run on as many cores as there are.
- **A thread hands back its result.** Java's `Thread.join()` gives back nothing, and so
  does Python's; to get a value out, you reach for a `Future` and an executor. Here,
  `join` gives back exactly what the closure returned, a `u64`, and the compiler knows
  it.

### What the language did

It let a closure decide what it takes with it. `move` is a word in the language, not a
library: it tells the compiler to hand the closure its own copies, so a cook can leave
the loop with their numbers and nobody else can change them afterwards. And the type of
what the closure gives back travels, unwritten, through `spawn` and `join` and into our
total — the compiler worked it out, and would refuse to add a count to anything that is
not one.

## Next time

Ok, I got it. Threads everywhere, then! More cooks, more dishes, faster dinner. These
language people who keep warning about them are all so boring. Let's go!

Next time, we do. Carol's cooks share one pile of potatoes, one pot of soup and one
whiteboard, and the kitchen finds three different ways to go wrong: the salt that goes
in twice, the ladle everybody queues for, and two cooks waiting for each other forever.
And one of the three, Rust will not even let you compile.
