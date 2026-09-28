---
title: 'A converter is a small compiler'
description: 'An empty directory becomes a Rust project: why a file-to-file converter is shaped like a compiler, a library and a binary in one package, modules and who can see them, a manifest with no dependencies in it, two lines that let the build refuse undocumented and unsafe code, and CI on three operating systems from the very first commit.'
pubDate: 'Sep 28 2026 14:00'
series: 'rust-beyond-systems'
seriesPart: 4
code: 'postres@part-04'
tags: ['rust', 'software engineering']
draft: false
---

[Last time](article:the-errors-you-are-never-going-to-see-again) I went through
the failures that have nowhere left to happen once the types stop evaporating —
the null in four uniforms, the variant nobody handled, the segfault — along with
the ones that stay, and argued that a strict compiler is worth more, not less,
when a machine is doing the typing. That was the last article about languages.

This one opens an empty directory. By the end of it we will have a Rust project
that builds, is checked on three operating systems on every push, refuses code
nobody documented and code that is not safe Rust, and does absolutely nothing.
I promised you that last part would be a far better place to be than it sounds,
so let me earn it.

## We have a file, and we want another file

Here is the whole job. Postman, the API client an enormous number of people use,
saves its collections as JSON. A very small one looks like this:

```json
{
  "info": {
    "name": "Users API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "variable": [
    { "key": "baseUrl", "value": "https://api.example.com" }
  ],
  "item": [
    {
      "name": "Get a user",
      "request": {
        "method": "GET",
        "url": "{{baseUrl}}/users/1"
      }
    }
  ]
}
```

And REST Client, an extension for VS Code, wants a plain text file with a `.http`
extension, where you put the cursor on a request and fire it from the editor:

```text
@baseUrl = https://api.example.com

### Get a user
GET {{baseUrl}}/users/1
```

Same request, two shapes. We want a program that reads the first and writes the
second. How hard can it be?

Well, you know how this goes. Let's do the obvious thing first. Parse the JSON,
loop over `item`, and for each entry print a `###`, the name, the method and the
URL. Twenty minutes, one file, done. Ship it!

Ooops, calm down.

Look at that collection again, because it is lying to you about how simple it
is. Real collections have **folders**, and folders inside folders, and REST Client
has no folders at all — one file is a flat list of requests. Real collections set
the **authentication** once, on a folder, and every request underneath inherits
it; REST Client has no inheritance, so every request in the output has to carry
its own header, worked out from wherever it was declared above it. Bodies come in
several kinds. Variables live at several levels.

So the loop that prints strings has a choice to make on every line: is it
reading Postman right now, or writing REST Client? And the answer is *both, at the
same time, in the same function*. Every Postman rule and every REST Client rule
ends up in the one place, tangled together, and the day either tool changes —
both are under active development, both change — you are editing a function that
knows everything about everything.

There is a better shape for this, and it is older than any of us.

## A compiler, without the scary part

When I started this program in 2022, I wrote down how it would be put together,
in a long comment in `main.rs`. It still holds, so I am going to give it to you,
tidied up:

- **Parse.** Read the source file, which follows the source format's
  specification, into a model in memory of what it *means*.
- **Lower.** Walk that model and build a second one: what the destination
  format needs to say.
- **Generate.** Walk the second model and write the destination file, following
  the destination's specification.
- **Report.** If anything goes wrong on the way, say what, and where.

If that list looks familiar, it should. It is a compiler. Every compiler you have
ever used reads source that follows a language specification, parses it into a
representation in memory of what the program means, transforms that, and writes
a file following another specification — machine code, bytecode, JavaScript.
When it cannot, it reports errors. An interpreter does the first half and then,
instead of writing anything, simply *runs* the representation in memory.

I am by no means claiming that postres is a compiler in the sense a compiler
engineer would respect. It is a small one, the way a paper plane is a small
aircraft. But it has the same problem, and the same answer works.

The part people push back on is the middle. Why two models? Why not parse Postman
into memory and write REST Client straight from that?

Think about a travel plug adapter. Your laptop charger does not know which country
it is in. The wall socket in Lisbon has never heard of your charger. Neither has
to know anything about the other, because the adapter in the middle knows both
shapes and nothing else. When you travel somewhere new, you do not rewire the
charger; you buy another adapter.

That is the converter. The Postman side of the program knows the Postman format
and nothing else. The REST Client side knows REST Client and nothing else. The
converter in the middle is the **only** part allowed to know both, so when Postman
publishes a new version of its schema, or REST Client grows a new way of declaring
variables, the change is absorbed in one module instead of leaking through the
whole program.

If you write Java or C# for a living, you have met this idea under other names:
keeping the objects your API receives apart from your domain model, or, if you
have read your Domain-Driven Design, an anti-corruption layer. It is the same
thing. Two models, and one place that translates between them, so that neither
can corrupt the other.

Which is quite a lot of architecture for a directory with nothing in it. Let's go
and put the shape in.

## One package, two crates

Besides a README and a licence, here is everything postres contains at the end
of this article:

- `Cargo.toml` and `Cargo.lock`, the manifest and its lock file.
- `src/lib.rs`, the root of a library.
- `src/main.rs`, the root of a program you can run.
- `src/postman.rs`, `src/converter.rs`, `src/restclient.rs` and `src/error.rs`,
  one file for each stage.
- `.github/workflows/ci.yml`, which checks all of it on every push.

Two words first, because Rust uses them precisely and the rest of the series
leans on them. A **crate** is what the compiler builds in one go: a library, or an
executable. A **package** is what a `Cargo.toml` describes, and one package can
hold one library crate and any number of binary crates. Cargo finds them by
convention: a `src/lib.rs` is a library, a `src/main.rs` is a binary, and both are
named after the package. No configuration needed to say so.

So postres is one package with two crates in it, and here is the entire binary:

```rust include="postres@part-04:src/main.rs#main"
```

Yes, that is all of it. It is a function called `main` that does nothing, and it
compiles, and it runs.

But why have a library at all? A command-line tool is a binary. Why not just put
everything in `main.rs` and be done?

Because of who else might want to convert a Postman collection. Somebody writing
their own tool. Somebody embedding the conversion in a build step. And the most
important somebody of all, who is us: **tests**. A test that exercises the whole
conversion wants to call a function and look at what came back, not start a
process and read its output. Put the real work in a library, and the binary
becomes a thin shell over it — read the arguments, call the library, report what
happened — while everything that matters can be called from anywhere, tests
included.

And there is a quieter benefit, which is my favourite. The binary crate can only
use what the library makes **public**, exactly like a stranger's program would.
So the binary is the first customer of the library's interface, from the first
day, and if that interface is awkward we are the first to find out.

If you come from Node, this is a package with both a `main` and a `bin` in its
`package.json`. If you come from Go, it is the familiar layout of a `cmd`
directory beside the packages that do the work. Same idea. Here it simply takes
no configuration at all.

## Modules: where things live, and who can see them

Now the four stages. This is where Rust surprises people arriving from almost
anywhere else, so let me walk the wrong assumption first.

In Java or TypeScript, a source file is part of the build because it is sitting
in the source folder, and anything can import it. So you would expect that
creating `src/postman.rs` is enough.

It is not. In Rust, a file that nobody declares is **not compiled at all**. Not
an error, not a warning; the compiler simply never opens it. A module exists
because its parent says so, with `mod`, and for postres the parent is the root of
the library:

```rust include="postres@part-04:src/lib.rs#modules"
```

Each `mod postman;` tells the compiler: there is a module called `postman`, and
its contents are in `src/postman.rs` — or, the older layout you will still meet
in plenty of projects, in `src/postman/mod.rs`. When a module grows modules of
its own, they go in a directory with the parent's name, so a `v2_1` module
declared inside `postman` would live in `src/postman/v2_1.rs`. You can also write
a module inline, with its contents in braces right there, which you will see most
often around tests.

That sounds like bureaucracy the first time. It stops sounding like that the first
time you open a project you have never seen, because it means the whole module
tree is written down in a handful of `mod` lines, starting from one root file.
Nothing is part of the program by accident, and nothing is in it just because it
happens to be sitting in the folder.

And notice there is not a single `pub` in that block. That is the other half of
what modules do. **Everything in Rust is private by default** — not
package-private, not internal, private: visible to the module it is in and to
the modules inside that one, and to nobody else. You open things up on purpose,
with `pub` for the whole world, or `pub(crate)` for "anywhere in this crate, and
not outside it", which is the one you reach for when a type is shared between
stages but is none of the library user's business.

So what is the public interface of the postres library right now? Nothing. It
has no public items at all. I mean that as a feature. The public surface of a
library is a promise to everybody who calls it, and we have nothing yet worth
promising. Each stage becomes visible when there is something in it worth
calling, and not a day before.

The last thing modules give you is names. Something defined in `postman` is
`postman::Something` from outside, and when that gets long, `use` brings it into
scope so you can say `Something`. And the crates you depend on turn up exactly
the same way, as if each were a module at the top of the tree, which is why you
will see `use serde::Deserialize;` in a file that never declared any `serde`.
We have no dependencies yet, so that is a promise for later.

## Documentation the build can read

Each of those four files is empty except for one comment. Here is the one for
the Postman side:

```rust include="postres@part-04:src/postman.rs#overview"
```

That `//!` is not an ordinary comment. Rust has two special kinds: `//!`
documents the thing it is *inside* — a crate, a module — and `///` documents the
thing that comes right *after* it, a function or a type. `cargo doc` turns both
into a browsable site, the same one you have used for every crate on docs.rs.
Javadoc and JSDoc do something similar, and nobody is impressed by that alone.

Here is what they do not do. **Code examples in Rust documentation are compiled
and run as tests.** Put an example in the `///` above a function, and `cargo test`
builds it and runs it along with everything else, so the day the function changes
and the example stops being true, the build goes red. The oldest excuse for not
writing documentation — it goes out of date anyway — stops being an excuse,
because now it cannot go out of date quietly. We have no examples yet, since there
is nothing public to show, but the machinery is already running, as we are about
to see.

And we can go one step further, in the manifest. These three lines are the ones in
this whole article I would most like you to steal:

```toml include="postres@part-04:Cargo.toml#lints"
```

The first line forbids `unsafe` code anywhere in the crate. Last time I told you a
whole list of errors has nowhere to happen *in safe Rust*, and that qualification
was doing honest work: `unsafe` exists, for the rare code that has to do what the
compiler cannot check, and inside it the list comes back. postres will never need
it. So instead of promising that, the crate says it, and the build enforces it. Here
is what happened when I added some to find out:

```text
error: usage of an `unsafe` block
 --> src\lib.rs:8:14
  |
8 |     let _x = unsafe { *p };
  |              ^^^^^^^^^^^^^
  |
  = note: requested on the command line with `-F unsafe-code`
```

`forbid` is stronger than an error, and the difference matters. Anything denied
can be allowed again further down, with an `#[allow(unsafe_code)]` just above the
offending function. Something forbidden cannot. I tried:

```text
error[E0453]: allow(unsafe_code) incompatible with previous forbid
 --> src\lib.rs:3:9
  |
3 | #[allow(unsafe_code)]
  |         ^^^^^^^^^^^ overruled by previous forbid
```

The second line asks for a warning on anything **public** that has no
documentation. A warning is easy to ignore on your own machine, and that is fine,
you are in the middle of something. But the checks we are about to set up treat
every warning as an error, so nothing undocumented gets through them. Here is what
the build said when I deleted the crate's own documentation to find out:

```text
error: missing documentation for the crate
 --> src\lib.rs:1:1
  |
1 | / mod postman;
2 | | mod converter;
3 | | mod restclient;
4 | | mod error;
  | |__________^
  |
  = note: `-D missing-docs` implied by `-D warnings`
```

Which means the rule from 2022 — document the public functions so that other
people can see quickly how they work — is no longer a rule I have to remember.
It is a check nobody can forget, whoever is typing.

## The manifest, and what is not in it

Now the file that holds all of that together. Last time I showed you that a Rust
project is essentially two files, and that `cargo build`, `cargo test`, `cargo
fmt`, `cargo clippy` and `cargo doc` came in the box. Here is the first of those
two files, opened up:

```toml include="postres@part-04:Cargo.toml#package"
```

Most of it reads itself — a name, a version, a description, a licence, where the
code lives, and the keywords and categories a registry uses to file it. Two lines
deserve a moment.

**`edition`** is how Rust changes without breaking anybody. Every few years the
language gathers up the changes that could not be made compatibly — a new keyword,
a stricter default — and releases them as an edition. A crate opts in by saying
which edition it is written in, and crates written in different editions work
together in the same program, compiled by the same compiler. 2024 is the current
one, so a new project starts there. Compare that with the years the Python world
spent between 2 and 3, and you will see why people who have lived through a
migration like this tend to get a little emotional about it.

**`rust-version`** is the oldest compiler this crate promises to build with. It
is 1.85, the first release that understood edition 2024. Try to build postres with
something older and Cargo refuses up front, and says why, instead of failing
somewhere in the middle with an error about a feature it has never heard of.

Then the part I like best:

```toml include="postres@part-04:Cargo.toml#dependencies"
```

That is the whole dependency list. Empty. Not one crate. The 2022 postres
declared sixteen dependencies in its second commit, before there was a single
line of code to use them, one of them pointing at my own fork of another crate on GitHub, which is a story for
later. This time every dependency arrives in the article where the program first
needs it, so that you can see exactly what it is for.

The second file, `Cargo.lock`, records the exact version of every crate in the
build, the way `package-lock.json` or `go.sum` do, so that a colleague, a CI
machine or you in two years get the same build rather than whatever happened to
be newest that morning. Ours is the shortest lock file you will ever see:

```text
# This file is automatically @generated by Cargo.
# It is not intended for manual editing.
version = 4

[[package]]
name = "postres"
version = "0.1.0"
```

It goes into git. For a program anybody installs, that has always been the
advice, and Cargo's guidance these days is to commit it for libraries too.

## Three operating systems, from the first day

And now the file that has nothing to do with Rust and everything to do with this
article's promise.

Here is a story you know. A project is built and tested on the machine its
author uses. Months later somebody tries it on another operating system and it
does not build, or it builds and quietly does the wrong thing. When did it
break? No idea. Which of the last forty commits did it? No idea. What happens
now is archaeology.

postres is a program whose entire job is reading one file and writing another.
Paths, directory separators, line endings: that is precisely the kind of program
that behaves differently on Windows, on Linux and on a Mac. The machine I am
writing this on runs Windows. If I only ever build here, then the first time
anybody finds out what happens anywhere else is when a stranger opens an issue,
and if that stranger never bothers, then nobody finds out at all.

So the checks are set up now, while there is nothing to check, because now is
the only moment they cost nothing:

```yaml include="postres@part-04:.github/workflows/ci.yml#matrix"
```

On every push, GitHub starts three machines — Linux, Windows and macOS — installs
the stable compiler on each, and runs four things. If you are hearing this rather
than reading it, those four are the lines at the bottom of the block:

- **`cargo fmt --check`** fails if any file is not formatted the one way Rust
  formats code. Nobody on this project will ever discuss where a brace goes.
- **`cargo clippy`**, with warnings turned into errors, runs the linter over
  everything, tests included. This is where that `missing_docs` warning grows
  teeth.
- **`cargo test`** builds and runs every test, and every example in the
  documentation.
- **`cargo doc`** builds the documentation, and fails on a broken link inside it.

`--locked` means "build with exactly what `Cargo.lock` says, and fail rather than
change it". `fail-fast: false` means that when Windows fails, Linux and macOS
still finish, so you learn whether you broke one platform or all of them.

Then one more machine, for the promise in the manifest:

```yaml include="postres@part-04:.github/workflows/ci.yml#msrv"
```

`rust-version` says 1.85. Anybody can write a number in a file. This job
installs exactly 1.85 and builds with it, so the day somebody uses a feature
from a newer release, the promise fails loudly instead of quietly becoming
untrue.

## Why a skeleton is worth an article

Let me say out loud what I think we just built, because it is not a program.

Look at what happens now when anybody changes postres. Unformatted code: refused.
A lint: refused. Something public nobody documented: refused. A line of
`unsafe`: refused, with no way to allow it back. A documentation example that no
longer matches the code: refused. Something that builds on my machine and not on
yours: refused. A feature too new for the promised compiler: refused.

And not one of those involves a person. Each one runs on every push, takes a few
minutes, and hands back a message precise enough to act on.

That matters a great deal in 2026, for the reason we spent the whole of last time
on. Most of what I write these days is typed by an agent, and I review it. The
question that decides whether that works is not how good the agent is. It is what
tells it, and me, that a change is right — and every item on that list is one
fewer thing for me to catch by reading. The agent can run those checks itself,
read what failed, fix it and run them again, and I never have to look at a
missing doc comment or a mis-indented block. My attention goes where no check can
reach: whether the program does what I meant. If you want that argument at full
length, it is what my other series, [*The question CTOs are probably not asking:
is our loop closed?*](/series/is-our-loop-closed/), is about.

So: **the skeleton is not the program. It is the loop the program will be written
inside.** And a loop is far cheaper to build around nothing than to retrofit
around forty commits of something.

## Run it

Right. The moment of truth.

```text
   Compiling postres v0.1.0 (C:\projects\postres)
    Finished `dev` profile [unoptimized + debuginfo] target(s) in 0.39s
     Running `target\debug\postres.exe`
```

That is `cargo run`. It compiled, it ran, it printed nothing and it exited
cleanly, which is exactly what it was told to do. And here is `cargo test`,
shortened only by leaving out file paths and timings:

```text
     Running unittests src\lib.rs

running 0 tests

test result: ok. 0 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out

     Running unittests src\main.rs

running 0 tests

test result: ok. 0 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out

   Doc-tests postres

running 0 tests

test result: ok. 0 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out
```

Zero tests, three times. Once for the library, once for the binary, and once for
the documentation examples, which is the machinery I promised you was already
running. Every one of those zeros is going to become a number, and none of them
will ever need setting up again.

If you want to hold it in your hands:

```sh
git clone https://github.com/marlon-sousa/postres.git
cd postres
git checkout part-04
cargo run
```

Congratulations. You have built a Rust program that converts nothing, on three
operating systems, with documentation it is not allowed to skip.

I am not joking when I say that is the hard part done. From here on, every
article is a change to a program that already builds, already runs and is
already checked, and never once a leap from nothing to a first build that
might not work. The 2022 version of postres had thirty-seven lessons in it and
no build on any machine but mine. This one has no lessons in it at all, and a
build on three.

## What this one was quietly doing

An article about an empty program is easy to read as housekeeping. It was not,
so here is what was really going on underneath.

### The jobs

Building software alone with an agent means doing six jobs that used to belong to
six people. This article was doing four of them, and mostly the first two:

- **Platform engineer** — the whole of the checks section. Three operating
  systems, a compiler pinned at the promised version, `--locked`, all of it before
  a single line of logic. When I built the terminal the other series is about,
  [the first pull request in its
  roadmap](article:the-night-that-produced-no-code) ended with two words, *"No logic."* This
  is that pull request, the one postres should have opened in 2022.
- **Architect** — parse, lower, generate, report; two models and one module
  allowed to know both; and a library whose public surface is empty *on purpose*,
  because a public item is a promise.
- **Project manager**, briefly — the order. The checks before the code, and every
  dependency in the article that needs it rather than sixteen on the first day.
- **Reviewer**, in absentia — two review comments that will never have to be
  written again: *please document this* and *why is this `unsafe`?* Both are
  build errors now, and neither can be waved through by whoever, or whatever,
  wrote the code.

No product owner and no QA this time. Nothing was decided about what postres does
for anybody, and nothing was tested, because nothing exists to test.

### What the language did without anybody noticing

Look at what that took, and at what it did not:

- The module tree is **declared**. A stray file in `src/` is not in the program,
  so nothing ships by accident — unlike a TypeScript project, where every file
  the configuration matches is compiled whether anything imports it or not.
- The lints live **in the manifest**, and every Rust tool reads them — the
  compiler, clippy, your editor. There is no linter to choose and no
  configuration file to keep in step with it.
- `forbid(unsafe_code)` turns last article's qualifier, *in safe Rust*, from a
  promise into a property of the crate that nobody can switch off quietly.
- Documentation examples are tests without a single extra tool.
- The CI file runs **the same four commands on all three systems**. Not one line
  in it says "if Windows". Most of what makes cross-platform CI painful elsewhere
  is simply not there to write.

The six jobs are counted in [*The night that produced no
code*](article:the-night-that-produced-no-code), in the series *You are now the
whole team*.

## Next time

The program learns to listen. We read the command line — where the collection is
and where the output should go — with a crate that turns a struct into an argument
parser, and work out a sensible output name when nobody gives one. Then we make
the program say what it is doing, which raises a question most of us have never
asked: why is printing a line slow, and what does a program do about it when it
cannot afford to wait?
