---
title: 'A log that does not block'
description: 'Why printing a line makes a program wait, what a non-blocking writer does about it, what that costs when you actually measure it — four lines in five, silently — and what happens to the lines still waiting when the program exits.'
pubDate: 'Oct 07 2026 12:00'
series: 'rust-beyond-systems'
seriesPart: 11
code: 'postres@part-11'
tags: ['rust', 'software engineering']
draft: false
---

[Last time](article:sharing-the-kitchen) the cooks shared the kitchen, and it went wrong
three ways. Salt went into the soup twice, because nobody agreed on who tastes and who
salts — and Rust refused to compile the unprotected counter that does the same to a
number. Six cooks with one lock on everything came out slower than one cook; the same six,
each with a sack and a lock on the soup alone, were three and a half times faster. Two
cooks held each other's tools and waited forever. And the way to share without waiting
was to stop sharing: shout "one more!" and let somebody else do the counting.

This time, back to postres, and to the `println!` that tells us what it is going to
do. It looks like the most innocent line in the program. Is it? We are going to
replace it with a proper log, and measure what the usual advice about logging leaves
out: what the queue saves, what it throws away, and what it loses when the program
ends.

## Printing is slow?

A `println!`. Easy. Printing is cool. It is the easiest way there is to debug and
to communicate.

But printing is also synchronous. What does that mean? Every time you call
`println!`, your thread stops, acquires a lock on standard output — which it can
only do when no other thread holds it — writes, and releases the lock. While
another thread holds the lock, yours waits, doing nothing. While yours holds it,
every other thread that wants to print waits, doing nothing.

If you think that could slow down a program with many threads that print, you are
right. Now remember that the way most software running in containers logs is...
printing to standard output. And that no software meant for production goes
without logs.

Right, we have a problem. And clearly the problem is the strange people who made
printing synchronous. Why a lock at all? Let's make printing lock-free!

Well. Without a lock, every thread writes its characters in whatever order it
happens to run. Remember the manager's favourite game, freeze tag? A thread printing `hello world` can be frozen
right after `hel`; the next thread to run prints `what a wonderful world`; then the
first one is unfrozen and, without noticing a thing, finishes with `lo world`. The poor human reading
the logs gets `helwhat a wonderful worldlo world`. Fun, but not effective.

So we need the lock. Now what? Are we going to waste all those processor cores
because we need logs? Unacceptable. Let's not log at all!

Ooops, calm down. We still need logs, and there is a way around it.

Remember the restaurant? The cooks do not walk out to the tables; they put the plates
on the pass and go back to cooking, and one waiter carries them out. What if the
threads doing the work did not print at all? They could put their messages in a
queue and carry on, and one thread — only that one — would take them out and print
them. That thread still waits for the lock, and still waits for the terminal, but
nobody is waiting for *it*.

Did somebody write that already? Of course they did. So, same move as with clap:
`cargo add`, or a few lines in the manifest. Our `[dependencies]` now look like this:

```toml include="postres@part-11:Cargo.toml#dependencies"
```

Wait, three crates, just to log? Hmm... one for each job, really. `tracing` is what
our code talks to: it is the logging library most of the Rust world has settled on,
and it is where `info!` comes from. `tracing-subscriber` decides what happens to
each message — here, turn it into a line of text. And `tracing-appender` is the one
with the queue and the thread.

And something happened while those three went in that nobody asked for. Somewhere
underneath them sits a crate called `time`, and its newest version is 0.3.55. Cargo
picked 0.3.45. Why the older one? Because 0.3.55 needs Rust 1.88, and postres
promises to build with 1.85 — the `rust-version` line we put in the manifest [when
the project was born](article:a-converter-is-a-small-compiler). Cargo read that
promise and kept it, all by itself.

Here is how postres puts the three crates together:

```rust include="postres@part-11:src/main.rs#logging"
```

Let's read it slowly.

`fn init_logging(verbose: u8) -> WorkerGuard`: a function that takes a small number
and gives back a `WorkerGuard`. Hold on to that guard; it gets a whole section of its
own.

*"`u8`? Not `int`?"*

Rust names its integers by sign and size. `u8` is unsigned, eight bits: zero to 255.
`i32` is Java's `int`, `i64` is its `long`, and there are others in between. Here we
only need to count how many times somebody typed `-v`, and nobody types it 256 times.

`NonBlockingBuilder::default()`? A builder, starting from its default settings.
`default` is a convention you will see everywhere in Rust: a type that has a
sensible starting value offers it under that name. Then each call changes one
setting and hands the builder back, so the calls chain, the way clap's did before we
let the derive write them: `.lossy(false)` — more on that one in a minute — and
`.finish(std::io::stderr())`, which says where the lines finally go, and builds the
thing. `std::io` is the standard library's input and output, and `stderr()` hands us
standard error.

And `let (writer, guard) = …`?

*"That looks like Python."*

It does. `finish` gives back *two* things at once, in a *tuple*: a few values held
together, in order, with no names and no type of their own to declare. And the `let`
takes the tuple apart and names each piece, just like Python's `a, b = f()`. In Java
you would usually write a small record just to carry the two. `writer` is where
messages go: it only ever pushes onto the queue. `guard` we will come to.

Then `tracing_subscriber::fmt()`, another chain: format the messages as text, send
them to our `writer`, colour them or not, and let through only what the level allows —
the colours and the level are two of three small things we come back to next time. And `.init()` installs all of it for the whole program.

And at the bottom, `guard`, alone, with no semicolon: the last line of the function's
block, so it is what the function gives back. The same rule as the blocks we met
when we were looking for a default name.

So what happens now, when postres logs a line? Follow it. The thread doing the work
calls `info!`. The line is formatted, put on the queue — that is all `writer` ever does —
and `info!` returns, straight away. The thread carries on with its work; it never saw a
terminal, never waited for a lock. At the other end of the queue, one more thread, the
one `tracing-appender` started for us, does nothing but take lines off the queue, one at
a time, and write them to standard error, at whatever speed standard error allows. The
cooks shout "one more!", and somebody else does the writing.

The threads doing the work never touch the terminal again. Problem solved. Most
explanations stop right here.

But wait... a queue is a place, and places have a size. This one holds 128,000 lines.
As long as the writing thread keeps up, the queue stays nearly empty: a line goes in, a
line comes out. But what if the workers log faster than the writer can write? Then the
queue fills up, line by line, until there is no room for the next one. And then? The
whole point was that `info!` never waits. So what does it do when the queue is full? It
has to do *something*. What?

Let's find out, with a flood. Eight threads, each logging a hundred thousand lines as
fast as it can, to a file, three ways. This one lives in postres too, under `examples/`,
next to the kitchen:

```rust include="postres@part-11:examples/flood.rs#start_logging"
```

`start_logging` sets up the log in one of the three ways, depending on two yes-or-no
answers. The first way, `sync`, has no queue at all: `Mutex::new(file)` puts the file
behind a lock, and every thread that logs takes the lock and writes the line itself —
the old way, every cook at the ladle. The other two are the queue we just met, with
`.lossy(…)` set one way or the other; we will see in a moment what that means.

And it gives back an `Option<WorkerGuard>`: `None` for the first way, which has no
queue and so no guard, and `Some(guard)` for the other two. The whole `if` gives back
whichever value its branch ended with — we will look at that properly next time, when
we choose the log level.

What each thread does:

```rust include="postres@part-11:examples/flood.rs#write_lines"
```

A hundred thousand lines. `info!` is `tracing`'s `println!`, and it gets a proper
introduction a bit further down; for now, it logs "converting request" with the line's
number attached.

And the kitchen itself:

```rust include="postres@part-11:examples/flood.rs#main"
```

`std::env::args().nth(1)` is the first word typed after the program's name — `sync`,
`lossy` or `blocking` — and `unwrap_or_default()` gives an empty one if there is none.
`File::create` makes the file, and the rest is the hiring and waiting from the potatoes:
eight threads, each running `write_lines`, timed until all of them are done.

*"Why the extra pair of braces in the middle?"*

Hold that thought. It is what the guard section further down is all about; for now,
trust me that by the closing brace the queue has been emptied into the file. And
after it, `read_to_string` reads the whole file back, `lines()` splits it into lines and
`count()` counts them. How many of the 800,000 made it?

Run it three times, on the Windows machine I am writing this on:

```text
$ cargo run --release --example flood -- sync
sync: the threads were done in 8.4516858s
sync: 800000 of 800000 lines written
```

The old way, every thread taking the lock itself: eight and a half seconds, and every
line written. Slow, as expected.

```text
$ cargo run --release --example flood -- lossy
lossy: the threads were done in 204.8358ms
lossy: 154774 of 800000 lines written
```

Now the queue, straight out of the box: 0.2 seconds! Fantastic! And lines written...
154,774. Of 800,000. Four lines in five, gone. No error, no warning, nothing anywhere
saying so.

Hmm. So that is the something: when the queue is full, the line is simply thrown away,
and `info!` returns as if nothing happened. And the third way, the queue told to wait
when it is full?

```text
$ cargo run --release --example flood -- blocking
blocking: the threads were done in 5.8317322s
blocking: 800000 of 800000 lines written
```

Almost six seconds, and all 800,000 lines written.

No free lunch, then. When the queue is full, something has to give, and you get to
choose what. Either the line is thrown away, and the work never waits: that is the
default, called *lossy*, and it is documented. For a busy service it is a reasonable
choice: better to lose a burst of debug lines than to slow down the requests. It is also
the kind of thing you discover on the one day you need exactly the line that was
dropped. Or the thread waits for room, and no line is ever thrown away: `.lossy(false)`.

And waiting does not mean we are back where we started. Put the third run next to the
first. Every single line kept, in both — and yet with the queue, the threads were done
with their work in 5.8 of the 8.5 seconds the old way took. That is 31 percent of the
old way spent doing nothing but standing in line for the file. (It moves around a
little from run to run; in three more runs of each, the queue saved between a quarter
and a third, never less.) There it is, measured: logging really can make a program
slow, and now we know why putting a queue between the work and the writing helps.

So why not a bigger queue, and wait even less? The builder lets you choose its size,
with `.buffered_lines_limit(…)`. Not a huge one; just a bit more room. I tried it, each
size right next to a run with the default, because my machine was busier this time and
only side-by-side numbers mean anything:

| Queue | Threads done in | Lines written |
| --- | --- | --- |
| 128,000, the default | 9.0 seconds | 800,000 |
| 200,000 | 8.0 seconds | 769,255 |
| 300,000 | 6.6 seconds | 660,203 |

Faster, yes. And lines written... 769,255? With `.lossy(false)`! The bigger the queue,
the faster the threads, and the more lines go missing. Room for a million lines, more
than the whole flood, and the threads were done in 0.27 seconds — with 122,717 lines in
the file.

What happened? Think about the end of the program. The workers are done, but the
helper thread, the one doing the writing, may still have a queue full of lines in front
of it. Somebody has to wait for it to finish before the program closes, or those lines
are gone. And that wait has a limit: the crate's own source gives the helper one second,
and not a moment more. There is even a note right there in the code saying that one
second ought to be configurable some day. Whatever is still in the queue after that
second is lost when the program exits. (Who does the waiting is the last section of this
part; how it can go wrong in a far sillier way, next time.)

And now the numbers make sense. When the threads finish early, it is *because* their
lines are still sitting in the queue, waiting to be written. The helper on this machine
manages a little over a hundred thousand lines a second, so a queue holding more than
that cannot be emptied in the one second it gets. The time the threads saved is made of
exactly the lines that get thrown away. There is no size that is both faster and safe.

And the default, then? Is 128,000 safe? Only because this disk is fast. I wrote the same
flood to a destination that takes about fifty millionths of a second per line, roughly
the pace of a slow terminal, with the default queue and `.lossy(false)`: 288,611 of
400,000 lines written. So, a quick but important note: even set not to drop anything,
this queue can still lose lines when the program exits, if more is waiting than the
helper can write in a second.

Let's put all of that in plain words, because it is a lot. Printing makes threads stand
in line for the screen or the file, and that really does slow a program down. A queue
fixes it: the threads drop their lines in and carry on, and one helper does all the
writing. But a queue has a size, so when it fills up, either lines are thrown away or
threads wait for room — your choice. And when the program ends, the helper gets one
second to finish, and whatever it cannot write in that second is lost, whichever choice
you made. A service that runs for days never feels that last part: the helper always
catches up. A short program that logs a burst and exits straight away can lose its last
lines.

And postres? `.lossy(false)`, the line you saw above. A converter that logs "converting
this request" and then silently does not write it has put a lie in the record. Does
waiting cost us anything? Only when the queue is full, and it holds 128,000 lines. Is a
program converting one collection going to fill that? Never. And for the same reason,
the one-second limit at exit will never bite it: there is never more than a handful of
lines left to write.

And, honestly: postres runs on one thread. Will it ever feel that lock? No. The queue
still does it a favour — the work never waits for a slow terminal, or for a pipe
somebody drains slowly — but the real reason to set it up properly is that this is
exactly how you would set it up in a service, and that is where most of you will use
it.

## The guard

One last piece, and it is the one that makes the queue safe to use.

`init_logging` returns something called a `WorkerGuard`. What does `main` do with
it?

```rust include="postres@part-11:src/main.rs#main"
```

First, see what happened to our `println!`. It is now `info!` — a macro, like
`println!`, this time from `tracing`: a message at the info level, with the two paths
attached as named fields, `source` and `dest`. And the `%` in front of each? It tells
`tracing` to record the value as text, the way `{}` would print it.

Now, `let _guard = …`. Never used again. An underscore in front of a name, in Rust,
says "I know I never use this, do not warn me". But it is still a name, so the value
lives on until the closing brace. And a guard, like the ladle's, does its job when it
is *dropped*. This one keeps the waiter at work: when
it is dropped, it writes out whatever is still on the pass and sends the waiter home.
When is it dropped? At the end of the block it lives in, here the end of `main`.

And now the extra braces in the flood make sense. The guard there lives inside them, so
at their closing brace it is dropped, the last lines in the queue are written out, and
only then does the program open the file to count. Without the braces, it would count
while the queue was still being emptied, and get a number that was simply not finished
yet.

*"So it is a finalizer."*

The opposite of one, really. Java's finalizers run whenever the garbage collector
gets round to the object — if it ever does — and that unpredictability is why they are
deprecated. Here, you can point at the brace where it happens. And the things Java
does have for this, try-with-resources, C#'s `using`, Python's `with`, Go's `defer`,
are all things you have to *write*, every time. Here? Holding the value is the whole
protocol. The guard lives until the end of `main`, so the queue is written out before
the program exits. And remember the one second the helper gets at the end of the flood?
This is who gives it: dropping the guard is the waiting, and the one second is how long
the guard is willing to wait. For postres, with one line to write, it is plenty.

## Run it

So, the moment of truth. A run that goes well:

```sh
postres -f exports.json/users.json
```

Silence. Just as asked. Now let it talk:

```text
$ postres -f exports.json/users.json -v
2026-10-06T16:53:26.200654Z  INFO postres: converting source=exports.json/users.json dest=exports.json/users.http
```

And with `-o`:

```text
$ postres -f users.json -o out/requests.http -v
2026-10-06T16:53:26.416476Z  INFO postres: converting source=users.json dest=out/requests.http
```

Does it read the collection? No. Write anything? No. But it knows what it was asked
to do, it says so when asked, on the right stream, without ever making the work
wait, and without ever dropping a line.

Want to try it yourself?

```sh
git clone https://github.com/marlon-sousa/postres.git
cd postres
git checkout part-11
cargo run -- -f users.json -v
cargo run --release --example flood -- lossy
```

## Wrapping it up

We have just replaced one `println!` with a log that never makes the work wait, and
measured what that usually costs: threads that stand in line for the file, a queue that
saves a quarter to a third of the time, lines thrown away when it is full, and lines
lost at exit whatever you choose, if more is waiting than the helper can write in a
second. On the way, these are the Rust ideas we met:

1. **`Type::default()`** is the conventional name for a type's sensible starting
   value.
2. **A builder chain**: each call changes one setting and hands the builder back, and
   a last call builds the thing.
3. **A tuple** holds a few values together, in order, with no names; `let (a, b) = …`
   takes it apart.
4. **A function gives back its last line** when that line has no semicolon — the same
   rule as a block.
5. **`Option`** can say "maybe none": the flood's `start_logging` gives back `None`
   when there is no queue, and `Some(guard)` when there is.
6. **Dropping a value can finish a job**: dropping the `WorkerGuard`, at the end of
   its block, writes out the queue and stops its thread, with no `finally` and no
   `defer` — within the one second it is willing to wait.

### The jobs

Building software alone with an agent means doing six jobs that used to belong to six
people. How many did this one do? Two:

- **QA** — the usual story about non-blocking logging, measured instead of repeated: it
  drops four lines in five by default. Waiting instead of dropping, measured too: still
  a quarter to a third faster than no queue. A bigger queue, tried instead of assumed:
  faster, and lines lost at exit anyway, because the guard waits one second and no more
  — and even the default lost lines on a slow destination.
- **Architect** — `.lossy(false)`, because a converter's log must not lie; and the
  reason the one-second limit will never bite postres, written down rather than hoped.

No product owner, no reviewer, no project manager. And nothing for the platform
engineer, which is worth saying out loud: the promise to build with Rust 1.85 reached
into dependency resolution and picked an older `time` without anybody lifting a finger.

The six jobs are counted in [*The night that produced no
code*](article:the-night-that-produced-no-code), in the series *You are now the whole
team*.

### What Rust solved that would have been a problem elsewhere

- **Flushing the log at exit is a closing brace, not a statement.** Java needs a
  try-with-resources, C# a `using`, Python a `with`, Go a `defer` — each one something
  you write, and can forget. In Rust, the guard is dropped at the end of `main`, and
  the queue is written out there.

### What the language did

It made cleanup part of the value. A type says what happens when it goes away, and the
language runs it at a moment you can point to — the end of the block — so holding a
value is enough to keep a promise.

## Next time

Three small things we skipped in that logging setup — why standard error, why colours
only on a terminal, and how `-v` picks the level — and then the underscore's sting.
That same closing brace that makes the guard so easy to use makes one mistake very easy
to make: one character long, it throws away every log line, and the compiler itself
recommends it.
