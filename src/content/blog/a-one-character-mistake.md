---
title: 'A one-character mistake'
description: 'Three small things in a logging setup — standard error, colours only on a terminal, and a level picked by counting -v — and then one character that throws away every log line, which the compiler itself recommends, and the lint that refuses it.'
pubDate: 'Oct 07 2026 12:00'
series: 'rust-beyond-systems'
seriesPart: 12
code: 'postres@part-12'
tags: ['rust', 'software engineering']
draft: false
---

[Last time](article:a-log-that-does-not-block) postres traded its `println!` for a real log
that never makes the work wait. We measured why that matters — threads standing in line
for the file lost a quarter to a third of their time — and what it costs: a queue that
throws lines away when it is full unless told to wait, and that loses whatever it cannot
write in the one second it gets when the program ends. And we met the guard, the value
that keeps the writing going for as long as `main` holds it.

This time, three small things in that setup we walked straight past, and then the
mistake I promised: one character long, it throws away every log line, and the compiler
itself recommends it.

## Three small things

Here is the logging setup again, as we left it:

```rust include="postres@part-12:src/main.rs#logging"
```

Three small things in it that we walked straight past.

Why standard error? Isn't standard output where programs print? Plenty of programs
do log there. But standard output is for what the program *produces*:
`postres … > something` should capture the result and nothing else. Diagnostics go
to standard error; that is what it is for.

And what is `is_terminal()` doing? Asking whether standard error is a real
terminal. Colours in a terminal, great. Colours redirected into a file? A file full
of escape codes. So, colours only on a terminal.

And if you look at the top of `main.rs`, you will find this:

```rust
use std::io::IsTerminal;
```

Why import something we never name? Because `is_terminal` comes from a *trait*. For
now, think of a trait as a set of methods a type can promise to have — something
close to a Java interface. The catch is that a trait's methods only show up where the
trait itself is in scope, so without that `use` line, `is_terminal()` simply does not
exist. The compiler says so, and offers the lines that would fix it — three of them,
in fact, two from crates our dependencies brought along; the one we want is the
standard library's, `std::io::IsTerminal`. Traits get a part of
their own later on; for now, that is why the line is there.

And the level? That needs a new argument. Back to our `Args`, which grows a third
field:

```rust include="postres@part-12:src/main.rs#args"
```

`verbose: u8`, with `action = clap::ArgAction::Count`. `ArgAction` is an enum from
clap, and `Count` is one of its variants: instead of reading a value after the flag,
count how many times the flag was typed. None is zero, `-v` is one, `-vv` is two. And
the level comes from that count:

```rust include="postres@part-12:src/main.rs#level"
```

`LevelFilter::WARN` and its neighbours are constants that `tracing` keeps on the
`LevelFilter` type, one per level, reached with the same `::` as everything else that
belongs to a type.

Last time's flood had an `if` like this too, in `start_logging`, and I promised we would
look at it properly. Here it is.

*"Wait. The whole function is an `if`. Where is the `return`?"*

There is none, and there does not need to be. In Rust, `if` is not only a statement:
it gives back a value, the value of whichever branch ran — the same idea as a block
giving back its last line. So the whole `if`, with all its branches, is the function's
last line, and its value is the function's result.

*"So it is a ternary. `verbose == 0 ? WARN : …`"*

Exactly what it is, and that is why Rust has no `?:` at all: `if` already does that
job, and it stays readable with four branches instead of turning into a nest of
question marks. The compiler holds it to two rules a ternary also has. Every branch
must give back the same type — a `LevelFilter`, here, in all four. And there must be
an `else`, because a value cannot come from a branch that might not run.

(There is a tool made for exactly this kind of choice, and it gets its own part later.
For four plain cases, an `if` reads just fine.)

No `-v`, then, and only warnings and errors get through, so a run that goes well
prints nothing at all. Which is what a good command-line tool does, right?

## The guard, and a one-character mistake

Here is `main` again, holding on to its guard:

```rust include="postres@part-12:src/main.rs#main"
```

`let _guard`: a name with an underscore in front, so the compiler does not complain
that we never use it, and still a name, so the guard lives until the closing brace of
`main` and writes out the queue there.

Now take away five characters. Not `_guard`. Just `_`.

What changes? Everything. Remember the underscore in `for _ in 0..times`, "do not
bother keeping it"? Here is its sting. `_` is not a name. It means "do not keep this
at all". So the guard is dropped right there, on the same line, and the waiter goes
home before the first plate is ready.

I tried it, in a small program that logs two lines. With `_guard`: two lines. With `_`
and the writer straight out of the box: nothing. No error. No warning. No log. With
`_` and our writer, the one that waits instead of dropping, the program at least
complains, once for every line it lost:

```text
[tracing-subscriber] Unable to write an event to the Writer for this Subscriber! Error: other error
```

Better than nothing? A little. It does not say which line was lost, or why, and
nothing in it mentions a guard. And postres itself, run with `-v`, prints exactly that
complaint instead of its one line, then exits with status zero: success, as far as any
script calling it can tell.

Surely the compiler notices? Well... sort of. `WorkerGuard` is marked
`#[must_use]` — remember the [sticky notes](article:arguments-without-writing-a-parser),
the attributes that sit on a piece of code and get read later? This is one of them.
Call `init_logging` and throw the result away without a `let`, and the compiler warns
you. Here is the warning, from postres:

```text
warning: unused `WorkerGuard` that must be used
  --> src\main.rs:35:5
   |
35 |     init_logging(args.verbose);
   |     ^^^^^^^^^^^^^^^^^^^^^^^^^^
   |
   = note: `#[warn(unused_must_use)]` (part of `#[warn(unused)]`) on by default
help: use `let _ = ...` to ignore the resulting value
   |
35 |     let _ = init_logging(args.verbose);
   |     +++++++
```

Now read the `help` line. What does the compiler suggest? `let _ = …`. Exactly the
version that loses every log line!

Is the compiler wrong? In general, no: `let _ =` is the standard way of saying "I am
throwing this away on purpose". Here, yes, because here the value has a job to do
just by existing.

And who follows compiler suggestions most faithfully? Us? We skim. An agent does,
working down a list of warnings, doing exactly what each one says until the build
turns green. That is the one fix I would expect an agent to apply without
blinking. And it is the one that kills logging for good.

So what do we do? Tell the agent to be careful? That would bind one session. Let's
turn the lesson into a line in the manifest instead, which binds every session
after it:

```toml include="postres@part-12:Cargo.toml#lints"
```

`let_underscore_must_use` is a clippy lint, off by default, because most of the
time `let _ =` is exactly what you mean. In postres it is on, and CI treats warnings
as errors. So here is what anybody — or anything — gets now for following the
compiler's advice:

```text
error: non-binding `let` on an expression with `#[must_use]` type
  --> src\main.rs:35:5
   |
35 |     let _ = init_logging(args.verbose);
   |     ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
   |
   = help: consider explicitly using expression value
   = note: `-D clippy::let-underscore-must-use` implied by `-D warnings`
```

Let me be plain, because this series makes big claims for the compiler and you
deserve to see where they stop. The compiler did not catch this one. It nearly
caused it. What caught it was running the thing, and what keeps it caught is a lint
somebody had to know to switch on. That part of the job stays with us. And once we
find something like it, the best we can do is turn it into a check, so it stays
found.

## Another singleton, and we did not write this one either

Remember `LAST_JSON`, the [well-behaved singleton](article:is-that-name-right) that
filled itself the first time somebody looked at it? Here is another one. The `.init()`
at the end of the logging setup installs our setup as the global default for the whole
program: every `info!`, anywhere, goes through it. How many times can you do that?
Once. Call it again and the program stops on the spot, the way `unwrap` stops it,
with *"Unable to install global subscriber"*.

Is it a dangerous one? Look at where it is set: at the very top of `main`, before
anything else runs, and never touched again. One moment when it can change, at a
place you can point to. That is the kind that does not come back to bite you.

## Run it

So, the moment of truth. A run that goes well:

```sh
postres -f exports.json/users.json
```

Silence. Just as asked: no `-v`, so only warnings and errors would get through, and
there are none. Now let it talk:

```text
$ postres -f exports.json/users.json -v
2026-10-06T16:53:26.200654Z  INFO postres: converting source=exports.json/users.json dest=exports.json/users.http
```

On standard error, in colour on a terminal, and plain text in a file. And to see the
lint at work, change `let _guard` to `let _` in `main.rs` and ask clippy:

```sh
git clone https://github.com/marlon-sousa/postres.git
cd postres
git checkout part-12
cargo run -- -f users.json -v
cargo clippy -- -D warnings
```

## Wrapping it up

We have just looked at three small choices that make a log polite — standard error,
colours only where they help, silence unless asked — and at a mistake one character
long, which the compiler nearly caused and a single line in the manifest now refuses.
On the way, these are the Rust ideas we met:

1. **Integers are named by sign and size**: `u8` is unsigned and eight bits, zero to
   255; `i32` is Java's `int`.
2. **A trait's methods only exist where the trait is in scope**: `is_terminal()` needs
   `use std::io::IsTerminal`.
3. **`if` gives back a value**, so Rust needs no ternary operator; every branch must
   give back the same type, and there must be an `else`.
4. **`_guard` keeps the value to the end of the block; `_` does not keep it at all**,
   and it is dropped on the same line.
5. **`#[must_use]`** makes the compiler warn when a value is thrown away, and clippy's
   `let_underscore_must_use` catches the `let _ =` that the warning itself suggests.
6. **`.init()` installs a global default once**, at a place you can point to; a second
   call stops the program.

### The jobs

Building software alone with an agent means doing six jobs that used to belong to six
people. How many did this one do? Four:

- **Product owner** — one flag, `-v`, and the decision that a run that goes well says
  nothing at all.
- **Architect** — logs on standard error, so that standard output stays free for what
  the program produces; colours only on a terminal.
- **QA** — the guard, tried with `_` instead of trusted: a lost log, a complaint that
  names nothing, and a program that still reports success.
- **Reviewer** — one review comment that nobody will ever need to write again. *Keep the
  guard alive* is a lint now, and it fails the build.

Nothing for the project manager or the platform engineer: CI already treats warnings as
errors, so the new lint needed nothing more than its one line.

The six jobs are counted in [*The night that produced no
code*](article:the-night-that-produced-no-code), in the series *You are now the whole
team*.

### What the language did

It drew a line between a name and no name. `_guard` and `_` look almost the same, and
mean opposite things: the first keeps the value to the end of the block, the second
does not keep it at all. And it let a crate attach a rule to its own type: `#[must_use]`
on `WorkerGuard`, written in somebody else's crate, turned into a warning in ours,
without either of us writing anything more than that one line.

## Next time

postres opens a file for the first time. The collection is JSON that follows a
published schema with hundreds of optional fields, and we turn it into Rust types
without writing a parser, with a crate that reads a struct the way clap did. And
because we will be holding text read from a file, we finally answer the question these
articles kept stepping around: why Rust has more than one kind of string, where a
`String` lives, and where a `&str` points.
