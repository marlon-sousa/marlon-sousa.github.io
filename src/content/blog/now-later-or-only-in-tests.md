---
title: 'Now, later, or only in tests'
description: 'Three ways to hand code around — a block that runs now, a closure that runs later, a function with a name — and how to choose. Tests that become a table. And conditional compilation: code decided before the program runs, and why that is safer than deciding it while it runs.'
pubDate: 'Sep 30 2026 12:00'
updatedDate: 'Oct 07 2026'
series: 'rust-beyond-systems'
seriesPart: 8
code: 'postres@part-08'
tags: ['rust', 'software engineering']
draft: false
---

[Last time](article:is-that-name-right) we asked whether postres's default output name
was right, and wrote down what "right" means as five tests. They failed four times out
of five against the first attempt, three times against a regular expression, twice
against a better one — and passed, all of them, once we used what the path already
knew, `with_extension`.

The name is right now. So this time is about the *code*, not the behaviour: three
things from last time that deserve a closer look. When to write a block, a closure or
a function. How to stop writing the same test five times. And how the tests can live
in the same file as the program without ever ending up inside it.

## Now, or later?

Look back at the road we took last time, and you will find three different ways of handing over
"here is how to work out the default":

- **An inline block**, in braces — the regex attempt. It runs on the spot, and its
  value is its last line.
- **A closure**, with bars — the recipe we gave `LazyLock`, and now the one we give
  `unwrap_or_else`. It runs later, only if somebody calls it.
- **A function**, with a name — `with_extension` itself is one, written by somebody
  else, and nothing stops us from writing our own.

Which one when? Let's start with a small change to last time's fix. Here is
`Config::new` now:

```rust include="postres@part-08:src/config.rs#new"
```

The default moved from `unwrap_or` to `unwrap_or_else(|| …)`, with a pair of bars. A
closure. Why?

`unwrap_or(default)` takes a *value*. To hand it a value, Rust has to compute that
value first — so the default is worked out every single time, even when the user gave
`-o` and it gets thrown away. `unwrap_or_else(|| default)` takes a *closure*, a recipe,
and runs it only when there is nothing inside. For `with_extension`, which is cheap,
that difference hardly matters. But the second one says exactly what we mean: work
out a default *only if you need one*. clippy has a lint for it, `or_fun_call`. It is
off by default, but switch it on, and here is what it says about the `unwrap_or`
version:

```text
warning: function call inside of `unwrap_or`
  --> src\config.rs:38:35
   |
38 |         let dest_file = dest_file.unwrap_or(source_file.with_extension("http"));
   |                                   ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ help: try: `unwrap_or_else(|| source_file.with_extension("http"))`
```

*"And the closure can just use `source_file`? It is not a parameter."*

It can. That is the other thing closures do: they *capture* the variables around
them, so you do not have to pass them in. How exactly they capture them is a story for
later; for now, it just works.

So, three tools. Here is how I think about choosing between them.

**An inline block** is the lightest. It reads top to bottom, right where it is used,
and it needs no name. Its temporary variables — `text` and `replaced`, in the regex
attempt — disappear the moment the block ends, so they cannot leak into the rest of
the function. But it runs immediately, whether you needed it or not. It can only be
used in that one place. It cannot be tested on its own. And a block that grows past a
handful of lines turns into a function that nobody bothered to name.

*"In JavaScript, I would write `(() => { … })()` for that."*

Exactly: an arrow function you call on the spot, just to get a block that gives back
a value. In Rust, a block does that by itself.

**A closure** is a block you can hand to someone else, to run later — or never. That
is its whole point: `unwrap_or_else` and `LazyLock` decide *when*, and the closure
only says *what*. It captures what it needs from around it, which keeps the call
short. The costs are the mirror of that: a long closure is hard to read in the middle
of a call, it has no name to tell you what it is for, and what it captures is not
written anywhere you can see.

**A function** has a name, and a good name is documentation that cannot go out of
date. Its signature says exactly what goes in and what comes out, with nothing
captured behind your back. It can be reused, and it can have tests of its own. The
cost is a jump: to understand the call, you go and read something that lives
somewhere else, and you have to pass it everything it needs.

So, roughly: a few lines, used once, run now — a block. Run later, or only
sometimes — a closure. Worth a name, used twice, long enough to need its own tests —
a function. And when one of them starts to feel wrong, move it one step along. Our
default turned out to be a single call to a function somebody else wrote, handed over
in the smallest closure there is. That is about as light as it gets.

## A table of cases

Now look at our tests again. Five of them, and four of those say exactly the same
three things — build a `Config` from a path, ask for the destination, compare — with
only two strings changing. Hmm. Could that be a table? One row per case, and the body
written once?

Remember last time's rule. What do we already have? The standard library has no
table tests. We could write a single test that loops over an array of cases, but then
it is one test with one name, it stops at the first failure, and the output does not
say which row broke. A well-known crate, then. Of course there is one: `rstest`. And it
goes in a new section of the manifest:

```toml include="postres@part-08:Cargo.toml#dev-dependencies"
```

`[dev-dependencies]` are crates for tests, examples and benchmarks only. They are
never part of the program we ship, so postres's users will never download `rstest`.
And here is the table:

```rust include="postres@part-08:src/config.rs#table"
```

`#[rstest]` is — you guessed it — another code writer. Each `#[case::…]` line is a
row: a name for the case, then its values. And `#[case]` on a parameter says "fill me
from the row". rstest writes one real test per row, named after it. And the strings?
They become `PathBuf`s by themselves: a `PathBuf` knows how to be made from text, and
rstest takes advantage of it. `as_path()` hands over the expected path in the form the
comparison wants.

The explicit-destination test stays as it was, on its own: its shape is different,
and forcing it into the table would make the table harder to read. And here is the
run:

```text
running 6 tests
test config::tests::an_explicit_destination_wins ... ok
test config::tests::the_default_name::case_2_a_directory_name_is_left_alone ... ok
test config::tests::the_default_name::case_1_only_the_last_extension_is_replaced ... ok
test config::tests::the_default_name::case_3_an_uppercase_extension_is_replaced ... ok
test config::tests::the_default_name::case_4_any_extension_is_replaced ... ok
test config::tests::the_default_name::case_5_a_file_with_no_extension_gets_one ... ok

test result: ok. 6 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out
```

Six tests now, because `.JSON` and `.txt` got a row each instead of sharing one test.
Every row is still its own test, with its own name, and a broken row would say which
one it was. Adding a sixth case is one line.

## Only in tests

And now, that `#[cfg(test)]` above the test module, which I promised to come back to.

It is **conditional compilation**: code that is part of the program under some
conditions and simply absent under others. `cfg(test)` is one condition — "we are
building for `cargo test`" — and there are others, like which operating system you are
building for. When the condition is true, whatever sits under the `#[cfg]` is
compiled. When it is false, it is removed before compilation even starts, as if it had
never been in the file. And "whatever sits under it" is always a complete piece of
code: a single statement, a whole function, or — like here — a whole module. Our
tests, `rstest` and all, exist in a test build and vanish from the real one.

If you have written C, you know the older cousin: `#ifdef`. And the difference between
the two is worth a moment, because it is the difference between cutting text and
removing code.

`#ifdef` works on text, before the compiler ever sees it. It can switch *any* lines
on and off: half a function, one line in the middle of an `if`, a quarter of a struct.
And the lines it switches off are not even read. I tried it: a disabled block full of
words that are not C at all compiles without a murmur. Now look at this one:

```c
struct A {
    int a;
#ifdef WITH_B
    int b;
};
#endif

int main(void) { return 0; }
```

The closing `};` of the struct lives inside the `#ifdef`. Compile it with `WITH_B`
defined, and it is fine. Compile it without, and the struct never closes:

```text
half_struct.c(10): error C2032: 'main': function cannot be member of struct 'A'
half_struct.c(10): error C2143: syntax error: missing ';' before '{'
```

A syntax error that only exists in one of the configurations — and it is reported on
`main`, far away from the line that caused it. Now imagine a few of those, nested, and
a build matrix where nobody compiles every combination.

Funny, isn't it? The only time C has shown up since postres started listening to its
command line — in a series about a so-called systems language — it showed up as the
problem Rust fixed.

`#[cfg]` cannot do that, by design. It only ever takes or leaves a *whole* piece of
code, so there is no half a function to forget to close. And the code it removes must
still be valid Rust: it is read before it is removed. A syntax error under a `#[cfg]`
that is switched off still fails the build:

```rust
#[cfg(any())]
fn never_compiled() {
    let x = ;
}
```

```text
error: expected expression, found `;`
 --> a.rs:3:13
  |
3 |     let x = ;
  |             ^ expected expression
```

(`cfg(any())` is a condition that is never true, handy for exactly this kind of
test.) What it does not do is *type-check* the code it removes — that would be
impossible, since the removed code may refer to things that only exist under its own
condition. But every configuration is at least real, readable Rust.

And when two configurations really do need different code? Then you write two whole
functions, each under its own `#[cfg]`, one after the other, and you can read them side
by side. If they share some lines, those go into a common function that both call.
More functions, perhaps — but far easier to read than a single function sliced up by
nested `#ifdef`s.

*"Fine, but my Java project does not ship its tests either."*

It does not, and that is worth being precise about. The files under `src/test` stay out
of your jar because the build tool keeps them out, by convention. But look at what does
end up in the jar. A method made public only so that a test can call it — the kind
people mark `@VisibleForTesting` — ships with everything else. And code that should
differ from one environment to another has no way to be left out at all, because Java
has no conditional compilation. So it is decided *while the program runs*: Spring, for
instance, lets you mark a component with `@Profile`, and that component is simply not
registered unless its profile is active when the application starts. Every alternative
is inside the jar; the choice is made at startup.

JavaScript and TypeScript usually do the same, with a check like
`if (process.env.NODE_ENV === "test")` in the middle of the code. Both branches are in
the file. A bundler — webpack, esbuild — can replace that check with a constant and drop
the branch that can never run, but only if it has been set up to; esbuild, for one,
only does it when minification is switched on. And when a package is published to npm
without a `files` list, the documentation is plain about the default: it "will include
all files" — tests, fixtures and all — unless an `.npmignore` or `.gitignore` says
otherwise.

Python has no build step for most programs at all: whatever is inside the package is
what you ship, and a tests folder sitting inside it goes along for the ride, unless the
packaging is told to leave it out.

None of that is a disaster, and people deal with it every day. But in every one of
those cases, keeping test code out of what you ship is something *somebody has to
remember*: a convention, a bundler setting, an ignore file, a startup flag. Forget it,
and the program grows bigger, and may carry details nobody meant to publish.

In Rust, the decision is made by the compiler, before the program exists. Code under
`#[cfg(test)]` is not in the compiled program — not disabled, not skipped at startup,
not waiting for a bundler to notice it: absent. There is nothing to strip, and no
setting to forget. (One honest footnote: a crate published to crates.io ships its
*source*, tests included, because it is a source package. What never ships is test code
inside the program somebody actually runs.)

## Run it

Nothing postres does has changed this time, so the run that matters is the test run:

```text
running 6 tests
test config::tests::an_explicit_destination_wins ... ok
test config::tests::the_default_name::case_2_a_directory_name_is_left_alone ... ok
test config::tests::the_default_name::case_1_only_the_last_extension_is_replaced ... ok
test config::tests::the_default_name::case_3_an_uppercase_extension_is_replaced ... ok
test config::tests::the_default_name::case_4_any_extension_is_replaced ... ok
test config::tests::the_default_name::case_5_a_file_with_no_extension_gets_one ... ok

test result: ok. 6 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out
```

Want to try it yourself?

```sh
git clone https://github.com/marlon-sousa/postres.git
cd postres
git checkout part-08
cargo test
```

## Wrapping it up

We have just gone back over working code and made it say what it means: a default
worked out only when needed, tests written as a table, and a clear picture of what ends
up in the program and what never does. On the way, these are the Rust ideas we met:

1. **`unwrap_or(value)` always computes its value; `unwrap_or_else(|| …)` runs its
   closure only when there is nothing inside.**
2. **Closures capture** the variables around them, so they can use them without being
   handed them as parameters.
3. **A block, a closure or a function**: run now and used once, run later or only
   sometimes, or worth a name, reuse and tests of its own. Move one step along when a
   choice starts to feel wrong.
4. **`[dev-dependencies]`** are crates for tests, examples and benchmarks only; they are
   never part of the program you ship.
5. **`rstest`** turns a table of cases into one real, named test per row.
6. **Conditional compilation**: `#[cfg(…)]` keeps or removes the complete piece of code
   below it — a statement, a function, a whole module — depending on a condition, like
   `test`.
7. **Unlike C's `#ifdef`**, `#[cfg]` never cuts code in half, and what it removes must
   still be valid Rust — though, since it is removed, it is not type-checked.

### The jobs

Building software alone with an agent means doing six jobs that used to belong to six
people. How many did this one do? Three:

- **Architect** — a way of choosing between a block, a closure and a function, instead
  of reaching for whichever comes first; and the default, moved to where it is only
  computed when needed.
- **QA** — five tests turned into a table, so that the next case costs one line, and
  every case still fails on its own, with its own name.
- **Reviewer** — `unwrap_or` turned into `unwrap_or_else`: the kind of comment clippy
  can make for you, if you ask it to.

No product owner — nothing the user sees changed — and nothing for the project manager
or the platform engineer.

The six jobs are counted in [*The night that produced no
code*](article:the-night-that-produced-no-code), in the series *You are now the whole
team*.

### What Rust solved that would have been a problem elsewhere

- **Keeping test code out of the program is not something anybody has to remember.**
  In Java, test-only hooks ship in the jar, and environment-specific code is chosen at
  startup. In JavaScript, a bundler has to be configured to strip test branches, and an
  npm package without a `files` list publishes everything. In Rust, code under
  `#[cfg(test)]` is simply not compiled into the program.

### What the language did

It made conditional compilation part of the language, and made it safe to use.
`#[cfg]` only ever keeps or removes a whole piece of code, and insists that even the
pieces it removes are valid Rust. A configuration nobody builds can still hide a type
error, so it is worth building them all — but it can never hide half a function or a
missing brace. And it is one more case of the principle we met with macros: if it can
be decided before the program runs, Rust decides it before the program runs.

## Next time

But first, a tally of everything we have used since postres started listening to its
command line. An argument parser. An optional type. Functional
methods instead of branches. A test framework, and tables of test cases. Lambdas.
Build-time switches. Every one of them exists in the languages you already use. Rust
did not invent any of them. It does them earlier, and stricter, and it will not let you
skip them. That is not systems programming. That is high-level programming, taken
seriously.

postres knows exactly where its output goes, and says so with a `println!`. Easy, and
it works. Printing is cool... or is it? To answer that, we first need the word that
comes up every time anybody talks about it. So next time we finally meet
[threads](article:threads-told-in-a-kitchen), the closest this series has come to
systems programming so far — told in a kitchen. Then the
locks that keep them from ruining the soup. And after that, we use all of it to print a
line of log: why printing makes a program wait, what that costs when nobody measures,
and a one-character mistake that the compiler itself recommends.
