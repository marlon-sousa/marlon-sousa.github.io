---
title: 'Sharing the kitchen'
description: 'Threads that share: salt added twice because nobody agreed on anything, six cooks slower than one, two cooks waiting for each other forever — measured, and the one of them Rust will not let you compile.'
pubDate: 'Oct 07 2026 12:00'
series: 'rust-beyond-systems'
seriesPart: 10
code: 'postres@part-10'
tags: ['rust', 'software engineering']
draft: false
---

[Last time](article:threads-told-in-a-kitchen) we opened up the word everybody uses
and nobody explains. A computer is a kitchen, a thread is a cook, and a process is an
order with its own part of the workbench. The manager plays freeze tag with every cook,
all day long, and the cooks never notice. A bigger kitchen did nothing for one cook,
running a program twice did nothing for one order, and six cooks peeled Carol's
mountain of potatoes three and a half times faster than one — each cook with a sack of
their own, sharing nothing.

This time, they share. Threads everywhere, then? More cooks, more dishes, faster
dinner? We are about to find out why the people who keep warning us about threads are
not so boring after all.

## Salt, twice

Let's go, then. Back to Carol's wedding, where two cooks now share the same
workbench, and on it, next to the potatoes, a pot of soup.

The first cook tastes it. Needs salt. Reaches for the salt... and right there, between
tasting and salting, the manager plays their favourite game. Frozen!

While the first cook stands there, one hand in the air, the second cook comes to the
pot and tastes the soup. Needs salt. Adds a spoonful, and goes back to the potatoes.

Unfrozen. The first cook carries on exactly where they were, without noticing a thing.
And where were they? "Needs salt." So they add a spoonful.

And the soup? Ruined.

Now try to find out what happened. Carol tastes the soup at the reception: far too
salty. Carol asks the cooks. Each one salted it once, exactly as the recipe says, and each
one is telling the truth. Yesterday the same two cooks made the same soup, and it was
perfect. Tomorrow? It depends on where the manager's hand happens to land, and the
manager decides that by everything else going on in the kitchen: who is waiting for the
oven, who just got a delivery, how many other orders came in. Freeze a cook a moment
earlier, or a moment later, or freeze the other one instead, and the soup comes out
fine. Nobody can tell you which order things happened in, and nobody can make it happen
again on purpose to watch it.

Who made the mistake? Read each cook's recipe, and neither did. Each one tasted,
decided, and salted, exactly as written. The mistake is in what the recipe never said:
the two of them never agreed on anything. Tasting and salting are really one step — you
salt *the soup you tasted* — and while one cook is doing that step, nobody else should be
able to taste. If they had agreed on that — one cook at the pot at a time, the other
waiting until the salt is in — the freeze would not have mattered. The first cook
would have stood frozen at the pot, and the second would have waited, and then tasted
a soup that was already salted.

That agreement has a name. Threads that agree on who does what, and when, so that their
steps cannot get mixed up, are *synchronized*. The word is Greek: *syn*, together, and
*chronos*, time. Arranging, together, what happens when. Carol's cooks were not
synchronized, and the soup paid for it.

And the potatoes? Say the cooks did not bother with sacks this time. One pile, and a
whiteboard where each cook adds one to the count of peeled potatoes, so the kitchen
knows when there is enough. The first cook reads the board: 150. Frozen! The second
reads 150, peels, writes 151. Unfrozen: the first cook peels, and writes... 151. Two
potatoes peeled, one counted. Do that all afternoon, and the board says the fries are
ready long after they are.

Threads do exactly this, because they share the workbench: threads in the same program
share its memory. And adding one to a number, which looks like a single step, is three:
read the number, add one, write it back. The manager can freeze a thread between any two
of them. Two threads read 5; both write 6; one of the two additions is simply gone.

This has a name too: a *race*, because the result depends on who gets there first.

Does that really happen? Here are two threads in Java, each adding one to the same
counter a million times. No agreement, nothing special, the kind of code anybody writes
on a first try:

```java
public class LostUpdate {
    static int counter = 0;

    static void add() {
        for (int i = 0; i < 1_000_000; i++) {
            counter++;
        }
    }

    public static void main(String[] args) throws InterruptedException {
        Thread first = new Thread(LostUpdate::add);
        Thread second = new Thread(LostUpdate::add);
        first.start();
        second.start();
        first.join();
        second.join();
        System.out.println("expected 2000000, got " + counter);
    }
}
```

Two cooks, `first` and `second`, both following the recipe `add`, both writing to the
same `counter`. `start` sends each one off, and `join` waits for each to finish, just
like last time's potatoes. And `counter++`, one innocent-looking line, is the whiteboard:
read, add one, write. The answer should be two million. Three runs:

```text
expected 2000000, got 1122424
expected 2000000, got 1099395
expected 2000000, got 1652146
```

Three runs, three different wrong answers, and not a word from the compiler. In the
worst of them, 900,605 additions vanished: almost half. And since it all depends on
exactly when the manager freezes whom, the result changes from one run to the next,
which is why these bugs are famous: they show up once in a thousand runs, and never on
your machine.

*"Wait. I thought this was a series about Rust. Why is the soup being ruined in Java?"*

Because in Rust, I could not ruin it. Most of what goes wrong in this part, Rust will not
even let you write — so to show you the mistake, I had to cook it in somebody else's
kitchen first. Rust's turn comes when it is time to say no. And here it comes.

Let's write the same thing in Rust. Remember `LAST_JSON`, the [static we kept the
regular expression in](article:is-that-name-right) — a single value, reachable from
anywhere, so from every thread? A counter like that:

```rust
static COUNTER: u32 = 0;

fn add(times: u32) {
    for _ in 0..times {
        COUNTER += 1;
    }
}
```

`u32` is the smaller cousin of last time's `u64`: unsigned, 32 bits, which counts past
four billion, plenty here.

*"`for _ in 0..times`? What happened to the name?"*

The same loop as last time's potatoes, but here we do not need the number, only the
repeating, so `_` says "do not bother keeping it". Hold on to that underscore; it comes
back later, with a sting.

And `+= 1` adds one, as in Java. So, two threads calling `add`, and:

```text
error[E0594]: cannot assign to immutable static item `COUNTER`
 --> src\bin\immutable.rs:7:9
  |
3 | static COUNTER: u32 = 0;
  | ------------------- this `static` cannot be written to
...
7 |         COUNTER += 1;
  |         ^^^^^^^^^^^^ cannot assign
```

Fair enough: a static, like Java's `static final`, cannot be changed. But we know the
word that lets something change: `mut`. Let's make it `static mut`, then:

```text
error[E0133]: use of mutable static is unsafe and requires unsafe block
 --> src\bin\mutable.rs:7:9
  |
7 |         COUNTER += 1;
  |         ^^^^^^^ use of mutable static
  |
  = note: mutable statics can be mutated by multiple threads: aliasing violations or data races will cause undefined behavior
```

Read the note. The compiler is describing the salt. Something that anybody can change,
from anywhere, can be changed by two threads at once, with no agreement between them —
and Rust will not compile that unless we wrap it in `unsafe`, a block that means "stop
checking, compiler, I take responsibility". And postres? Its manifest says
`unsafe_code = "forbid"`, since the day the project was born. So in postres, the salted
soup cannot even be cooked.

Fine. Then how *do* we get two cooks to agree?

## One ladle

We write the agreement down, and make it something you can hold. Rule of the kitchen:
whoever wants to taste or salt holds the ladle, and there is only one ladle. If somebody
else has it, you wait.

Now watch what happens to freeze tag. The manager still freezes whoever they like,
whenever they like; nothing stops that. The first cook can still be frozen between
tasting and salting. But they are frozen *holding the ladle*. The second cook comes to the
pot, finds no ladle, and waits. Unfrozen, the first cook salts, puts the ladle back, and
only then can the second one taste — a soup that already has its salt. The freeze
happened. It just did no harm.

That ladle is a *lock*: the simplest way of synchronizing threads. In Rust, the most
common one is called a `Mutex`, short for *mutual exclusion*: one at a time.

So let's be careful. Really careful. Put the whole kitchen behind the ladle: the pile of
potatoes, the count of primes, and the soup.

```rust include="postres@part-10:examples/kitchen.rs#kitchen"
```

`struct Kitchen` is a named bundle of data, like the ones we wrote when postres learned
to read its command line: `next_potato`, the potato at the top of the pile; `primes`, the
count so far; and `salt`, how many pinches the soup has had. And `KITCHEN` is the one and
only kitchen, a `static` like `LAST_JSON`, but this time inside a `Mutex`.

`Mutex<Kitchen>`: a generic, like `Option<T>` — a `Mutex` holding a `Kitchen`. And the
kitchen is *inside* the `Mutex`. That is the important part.

*"In Java I would just write `synchronized`."*

You would — and there is the word again: Java calls its lock `synchronized`, for exactly
this reason. But in Java, the data would sit next to it, in ordinary fields.
`synchronized` protects the code; the fields themselves are open to anybody who forgets
to use it. Here there is no kitchen outside the `Mutex`. The only way in is
`KITCHEN.lock()`, so there is no way to forget the ladle.

Now a cook:

```rust include="postres@part-10:examples/kitchen.rs#one_lock"
```

Each cook does their share of the potatoes — `POTATOES / COOKS`, two million — and for
each one, first of all, takes the ladle: `KITCHEN.lock()`. That waits until the ladle is
free, takes it, and gives back a *guard*: our hold on the ladle, and our way into the
kitchen. It comes wrapped in a `Result`, like `Regex::new` did, because a lock can fail
in one odd case — a thread that crashed while holding it — and we `unwrap`, because if
that happens here, the program is broken anyway.

`let mut kitchen`: `mut`, because we are going to change things through it. And through
the guard, the kitchen's fields are right there, with a dot: take the potato at the top
of the pile, move the pile along, peel it with the same `is_prime` as last time, and if
it is prime, add one to the count. And `potato % SALT_EVERY == 0` — `SALT_EVERY` is one
more constant, a hundred — is true once every hundred potatoes: time for a pinch of salt
in the soup.

*"And where do you unlock? In Java I would need `finally { lock.unlock(); }`."*

Nowhere. Look at the closing brace of the loop. `kitchen` was made inside the loop's
block, so at that brace it goes away — Rust calls it being *dropped* — and a guard being
dropped is what releases the lock. Every time round the loop: take the ladle, do the
work, closing brace, ladle back on the hook. Forget an `unlock()` in Java, and the lock
stays taken forever. Here there is nothing to forget: holding the guard *is* holding the
lock. Keep that idea, a value whose goodbye does a job; next time depends on it.

And the kitchen, with six cooks:

```rust include="postres@part-10:examples/kitchen.rs#with_one_lock"
```

The same hiring as last time's potatoes, with one difference: no `move`, and no closure
at all. The recipe needs nothing from the loop — everything it uses is in the kitchen —
so `thread::spawn(cook_with_one_lock)` hands over the function by its name. At the end,
one last `lock()` to read the totals.

Nothing shared without the ladle. Nothing can go wrong. Moment of truth, next to one
cook doing all of it alone:

```text
$ cargo run --release --example kitchen
one cook:             788060 primes, 120000 pinches of salt, in 5.4562633s
six cooks, one lock:  788060 primes, 120000 pinches of salt, in 7.5933841s
```

Right answer. Right amount of salt. Nothing went wrong... except that six cooks took
seven and a half seconds, and one cook took five and a half. We hired six cooks, and the
fries came out *later*.

Look at where the ladle is taken: before the potato is peeled, and given back after. So
every potato in the kitchen is peeled by somebody holding the one ladle. Six cooks, and at
any moment exactly one of them working, while the other five stand in line. We protected
everything, and in doing so we turned six threads into one — plus the cost of passing
the ladle from hand to hand two million times each, which is why it came out slower than
one cook on their own.

## Lock only the soup

So who said peeling needs the ladle? Nobody else ever touches the potato a cook is
holding. The only thing in that kitchen that really is shared is the soup. So let's do
what we did last time: split the pile into sacks before anybody starts, and take the
ladle only for the salt.

```rust include="postres@part-10:examples/kitchen.rs#own_sack"
```

`SOUP` is a `Mutex` holding just a number, the pinches of salt. The cook peels their own
sack, counting their own primes, with no lock at all. Once every hundred potatoes, they
take the ladle: `SOUP.lock()`. This time the guard holds a plain number rather than a
kitchen, so there are no fields to reach with a dot; `*salt += 1` uses the `*` to reach
through the guard to the number inside, and adds one. And the closing brace right after
puts the ladle back. Held for one pinch of salt, then gone.

The hiring is last time's, word for word, with this recipe instead:

```rust include="postres@part-10:examples/kitchen.rs#with_own_sacks"
```

All three, side by side:

```text
$ cargo run --release --example kitchen
one cook:             788060 primes, 120000 pinches of salt, in 5.4562633s
six cooks, one lock:  788060 primes, 120000 pinches of salt, in 7.5933841s
six cooks, own sacks: 788060 primes, 120000 pinches of salt, in 1.5068157s
```

Same primes. Same salt. Same six cooks, same six stoves, even the same kind of lock. Seven
and a half seconds became one and a half.

What changed is not *what* the cooks do. It is *when* each of them holds the ladle, and
for how long. And that is the real lesson about threads. With one thread, you think about
what the program has to do. With several, you have to think about who does what, and
when, and what the others might be doing at that very moment — in more combinations than
anybody can count. Get it right, and six cooks are three and a half times faster than
one. Get it wrong, and six cooks are slower than one, or salt the soup twice.

*"Isn't there something faster than a lock, for a number like that?"*

There is. Processors have instructions that read a number, add one and write it back as
a single step, one the manager cannot freeze halfway through, because there is no
halfway. They are called *atomic*, from the Greek for "cannot be cut", and they beat a
lock easily. But it is still one number that every cook has to touch, so there is still
a queue, only a shorter one — and using them well is a subject of its own, which postres
will never need. The lesson does not change: the fastest kitchen is the one where the
cooks share as little as they can.

## Waiting, and somebody to count

Notice how much of this part was cooks waiting: for the ladle, in line, doing nothing.
That is what synchronizing costs: agreeing on an order means that somebody waits their turn.

And waiting has its own word, from the same Greek root. A call that does not come back
until its work is done is *synchronous*: you and the work, at the same time, together,
until it is finished. While a thread is stuck in one, it is *blocked*. `lock()` is
synchronous: it blocks until the ladle is free. `join()` blocks until the cook is done.
Synchronized threads are always, somewhere, making synchronous calls — that is where the
waiting happens.

So, is there a way to share without anybody waiting? Think about the whiteboard again,
the count of peeled potatoes. What if nobody wrote on it at all? Instead, every time a
cook peels a potato, they just shout "one more!" and carry on peeling. One more person
in the kitchen does nothing but listen and count: every shout, one more on the tally.
The cooks never touch the board, never wait for a ladle, never wait for each other. Only
the counter waits, for the next shout.

Restaurants do this with plates, too. The cooks do not walk out to the tables; they put
each plate on the pass, the counter between the kitchen and the dining room, and go
straight back to cooking. A waiter carries the plates out.

Programs call the shout, or the pass, a *channel*, or a *queue*: threads put messages in
one end and carry on; another thread takes them out of the other end and deals with
them. The Rust standard library has one, and Go built its whole style around them, with
a slogan: *"Do not communicate by sharing memory; instead, share memory by
communicating."*

We are not going to write one yet. Next time, we will find one already written, inside
a crate, doing exactly this job.

## The pan and the knife

So far, every way the kitchen went wrong had a fix. The salt: a ladle. The queue at the
ladle: hold it only for the salt. The waiting: shout, and let somebody else count. Now
the one that does not have a fix the compiler can give you, because this time the
agreement itself is the problem.

Some dishes need two tools, so the kitchen has a lock on each: whoever uses the pan holds
it, whoever uses the knife holds it. Cook one picks up the pan and reaches for the knife.
Cook two picked up the knife a moment ago and is reaching for the pan. Each holds what the
other needs, and each, perfectly synchronized, waits for the other to let go. Forever.
Nobody crashed, nothing is burning, and dinner never comes out. That one has a name too:
a *deadlock*.

Back to Java, which will happily compile this one too:

```java
public class Deadlock {
    static final Object pan = new Object();
    static final Object knife = new Object();

    static void firstCook() {
        synchronized (pan) {
            System.out.println("first cook: got the pan, reaching for the knife");
            pause();
            synchronized (knife) {
                System.out.println("first cook: cooking!");
            }
        }
    }

    static void secondCook() {
        synchronized (knife) {
            System.out.println("second cook: got the knife, reaching for the pan");
            pause();
            synchronized (pan) {
                System.out.println("second cook: cooking!");
            }
        }
    }

    static void pause() {
        try {
            Thread.sleep(100);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }

    public static void main(String[] args) throws InterruptedException {
        Thread first = new Thread(Deadlock::firstCook);
        Thread second = new Thread(Deadlock::secondCook);
        first.start();
        second.start();
        first.join();
        second.join();
        System.out.println("dinner is served");
    }
}
```

`synchronized (pan) { … }` takes the lock on the pan for as long as the block lasts. The
first cook takes the pan, then the knife; the second takes the knife, then the pan. And
`pause()`, a tenth of a second between the two, is our own freeze, at the worst possible
moment, every time instead of once in a thousand. Run it:

```text
$ java Deadlock.java
first cook: got the pan, reaching for the knife
second cook: got the knife, reaching for the pan
```

And then? Nothing. No error. It just sits there, until you press Ctrl+C. "dinner is
served" never comes.

And Rust? Here, for once, I have nothing to show you, because Rust does not stop it. I
wrote the same two cooks in Rust, with two `Mutex`es, and it compiled without a word and
hung exactly like the Java one. Let me be plain, because this series makes big claims for
the compiler: it stopped the salt, and it does not stop the pan and the knife.

The cure is one more agreement, made by people rather than checked by a compiler:
everybody takes the tools in the same order. Always the pan first, then the knife, and
nobody can ever be holding the knife while waiting for the pan.

## Which side each language took

So the noise starts to make sense. Cool, because work happens at once. Dangerous,
because shared things change under your feet unless the threads agree, and even then
they can freeze in each other's hands. Slow, because agreeing means waiting — and agree
on too much, and you are back to one cook. Maybe those language people were not so
boring after all.

And each language picked a side. JavaScript runs your code on a single thread and lets
the waiting happen somewhere else, so there is nothing to share. Python, in its usual
build, lets only one thread run Python code at a time, as last time's potatoes showed. Go
was built around very light threads that it encourages to pass messages rather than share
memory. Java lets you share anything, and leaves the ladle to you.

And Rust lets you share too, but you have just seen it refuse to compile a counter that
anybody could change with no agreement in place. Sharing comes with the ladle attached,
or not at all.

## Run it

The kitchen lives in postres, under `examples/`, next to last time's potatoes.

```sh
git clone https://github.com/marlon-sousa/postres.git
cd postres
git checkout part-10
cargo run --release --example kitchen
```

The two Java programs are short enough to copy from this page, and run with
`java LostUpdate.java` and `java Deadlock.java`.

## Wrapping it up

We have just let several threads into the same kitchen, and watched it go wrong in three
ways: the salt that goes in twice, the six cooks who end up slower than one, and the two
who wait for each other forever. And under all three, one lesson. With threads, it is not
enough to think about *what* the program does. You have to think about who does what,
and *when*, in more combinations than anybody can count — and threads thrown at work that
was not prepared for them make a program slower, not faster. On the way, these are the
ideas we met:

1. **Threads share memory**, and the operating system can freeze one between any two
   steps, so two of them changing the same thing can lose updates: a *race*.
2. **Synchronizing** is threads agreeing on who does what, and when, so their steps
   cannot get mixed up.
3. **A `static` cannot be changed, and a `static mut` needs `unsafe`**, because the
   compiler cannot rule out the race. postres forbids `unsafe` altogether.
4. **`_` in place of a name** says "do not keep this": `for _ in 0..n` repeats
   something without naming the number.
5. **A `Mutex<T>` keeps the value inside the lock**: the only way in is `lock()`, which
   gives back a guard. Through the guard, a struct's fields are reached with a dot, and a
   plain value with `*`.
6. **A value is dropped at the end of the block it lives in**, and dropping a guard
   releases the lock. There is no `unlock`.
7. **Everything behind one lock is one thread at a time**: six cooks sharing one ladle
   for all the work were slower than one cook alone.
8. **Lock only what is really shared, for as short as you can**, and split everything
   else before anybody starts: the same six cooks became three and a half times faster.
9. **A synchronous call blocks its thread** until its work is done; a channel lets
   threads pass work along instead of sharing it.
10. **Deadlocks compile**, in Rust as in Java. The cure is another agreement, like always
    taking locks in the same order.

### The jobs

Building software alone with an agent means doing six jobs that used to belong to six
people. How many did this one do? Three:

- **Architect** — one lock on everything against a sack each and a lock on the soup
  alone: the same cooks and the same kind of lock, five times apart, decided by what is shared
  and when.
- **QA** — "protect everything and it is safe" measured instead of believed: safe, and
  slower than one cook. The race shown losing 900,605 additions out of two million; a
  deadlock made to happen every time, instead of once in a thousand.
- **Reviewer** — the review comment nobody has to write: the unprotected counter never
  got as far as a pull request, because the compiler refused it twice.

No product owner: nothing the user sees changed. Nothing for the project manager, and
nothing for the platform engineer either: CI picked up the new example by itself.

The six jobs are counted in [*The night that produced no
code*](article:the-night-that-produced-no-code), in the series *You are now the whole
team*.

### What Rust solved that would have been a problem elsewhere

- **The race does not compile.** Java compiled the shared counter without a murmur and
  lost almost half of two million additions in one run. Rust refused the same code twice,
  and named the race in its error.
- **The lock and the data are one thing.** In Java, `synchronized` protects code, and the
  fields next to it stay open to whoever forgets. A `Mutex` holds the whole kitchen
  inside, and `lock()` is the only door.
- **Unlocking is a closing brace.** Java needs `finally { lock.unlock(); }`, and a
  forgotten one locks forever. A guard releases its lock when it is dropped.

### What the language did

It made "shared and changeable" a question the compiler asks before the program exists.
A static is unchangeable unless you say otherwise; saying otherwise needs `unsafe`; and
the language ends every value's life at a closing brace you can point to, which is what
lets a lock release itself. One more case of the principle from the macros: if it can be
decided before the program runs, Rust decides it before the program runs. What it cannot
decide — the pan and the knife, or how long you hold the ladle — it leaves to us, and
says so.

## Next time

Back to postres, and to its `println!`. Printing turns out to be one of those shared
things: every thread in a program writes to the same standard output, and there is only
one ladle. Next time, why printing a line makes a program wait, a crate with somebody in
it whose only job is to listen for shouts, what it costs when you actually measure it —
four lines in five — and what happens to the lines still waiting when the program ends.
