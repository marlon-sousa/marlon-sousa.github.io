---
title: 'Arguments, without writing a parser'
description: 'postres learns to listen, and we write no parser to make it happen: the command line described as a struct, a macro that writes the parser from it — help screen and typo suggestions included — and what structs, attributes and macros are, and why they make Rust feel like a high-level language.'
pubDate: 'Sep 30 2026 12:00'
series: 'rust-beyond-systems'
seriesPart: 5
code: 'postres@part-05'
tags: ['rust', 'software engineering']
draft: false
---

[Last time](article:a-converter-is-a-small-compiler) an empty directory became a
Rust project: a library and a binary, four modules with nothing in them, a
manifest that refuses undocumented and `unsafe` code, and checks on three
operating systems on every push. It built, it ran, and it did absolutely nothing.

This time the program learns to listen: it reads the command line. One small
thing. An afternoon's work, right?

Well... it turned into a tour of one of the things Rust does best. And, I promise
you, one that has nothing to do with systems programming.

## What does it need to know?

Two things. Where the Postman collection is, and where to write the `.http` file.

Easy, right? The command line arrives as a list of strings — `std::env::args()`
hands it to you in one line. Take the first one as the collection, the second as
the output, done.

...Or not? What if they come in the other order? Then we would need to put a name
in front of each one, something like `input=`. And then we would need to recognise
the prefix, and make sure everything we need is in place, and strip the prefix off
before using the value. And what if the user leaves the output out, or types
`--help`, or misspells a name? Hmm. We should write a parser, that's it.

But wait... Last time we agreed that postres is a small compiler, so it is a
parser already. Are we really about to write a small parser just so that we are
allowed to start the big one? And a parser for something every command-line
program in the world has to read? That seems strange. It seems like a problem so
common that somebody else has surely solved it already.

Have they? Yes, in every language. Python has `argparse`, and `typer` if you like
type hints. Node has `commander` and `yargs`. Go has `flag` in the standard
library and `cobra` when that runs out. So it is time for reuse. Rust's is called
`clap`, and it is postres's first dependency, here precisely to save us from
typing code — which, whenever we can manage it, is what we should always prefer.
It works, it is tested by far more people than will ever run postres, and so we
just use it.

And how do we tell Rust that we need clap? Simple. Either we ask Cargo to do it:

```sh
cargo add clap --features derive
```

or we open `Cargo.toml` ourselves and write the line. Either way, this is what ends
up under `[dependencies]` — the section that was empty last time:

```toml include="postres@part-05:Cargo.toml#clap"
```

A name, a version, and... `features = ["derive"]`? Features are optional parts of a
crate, switched off unless you ask for them, so you only compile what you use.

Remember those discussions in the Node world? Somebody pulls in a whole library,
thousands of lines of it, to use a single function — and then everybody piles in
saying you would have been better off writing that one function yourself. In Rust?
Not much of a problem, as long as the crate splits its functionality into features,
which is quite common in Rust. You ask for the part you need, and the rest is never
even compiled.

Hold on to that `derive`, by the way. We are going to need it in a minute.

Except... now we have to learn a strange API, just to get our small problem solved.
Builders, options, settings, pages of documentation. Here we go:

```rust
use std::path::PathBuf;

use clap::builder::PathBufValueParser;
use clap::{Arg, Command};

fn main() {
    let matches = Command::new("postres")
        .version("0.1.0")
        .about("Convert Postman collections into .http files for the VS Code REST Client extension.")
        .arg(
            Arg::new("postman_file")
                .short('f')
                .long("postman-file")
                .value_name("POSTMAN_FILE")
                .help("The Postman collection to convert, exported as v2.1 JSON")
                .required(true)
                .value_parser(PathBufValueParser::new()),
        )
        .arg(
            Arg::new("output_file")
                .short('o')
                .long("output-file")
                .value_name("OUTPUT_FILE")
                .help("Where to write the .http file [default: the collection's path, ending in .http]")
                .value_parser(PathBufValueParser::new()),
        )
        .get_matches();

    let postman_file: PathBuf = matches
        .get_one::<PathBuf>("postman_file")
        .expect("clap has already checked that it is there")
        .clone();
    let output_file: Option<PathBuf> = matches.get_one::<PathBuf>("output_file").cloned();
}
```

Man, what a lot of code just to parse two arguments. And it does not even end
there: then we pull the fields out one by one, by name, typing each name again as a
string and hoping it matches the one above, and deal with what happens when a value
is not there... And now I start to get lazy again.

It would be so much better if we just defined our struct, with the information we
need, and it simply worked...

Oh, wait! Rust has a magic code writer, one that often makes things simpler for
us. We call it **procedural macros**, and clap comes with one. If you have ever
used `typer` in Python, the result will feel familiar: **you describe the arguments
as a type, and the macro writes the rest.** Let's see how this goes.

## A struct, and some sticky notes

Here is the whole command line of postres:

```rust include="postres@part-05:src/main.rs#args"
```

*"Hold on. A struct? I write Java all day. What is a struct?"*

Fair question. A **struct** is a named bundle of fields: this thing called `Args` has
a `postman_file` and an `output_file`, each with a type. If you come from Java or C#,
think of a class that holds only fields — no methods inside it, and no inheritance.
From TypeScript, think of a `type` or an `interface` that describes the shape of an
object, except that here it is a real type that exists when the program runs. And
the functions that go with a struct? They live somewhere else, and we are going to
write our first ones very soon.

Now put this struct next to the builder code from a moment ago. Two fields, a few
notes on top, and that is the whole command line. Does that feel better to you? For
me, it surely does. Anything like systems programming? Not even close. This is
Rust. It is cool, and it works.

*"Fine. But these are not normal structs, right? I know enough programming to see
that something else is going on. What are all these `#[` … `]`?"*

Smart dude, you. You got me. Yes: they are **attributes**. Think of them as sticky
notes, attached to whatever comes right below them.

Some of them are just that: notes. They stay where they are, and the compiler
reads them later, while it checks the program. We will bump into one of those next
time, a note that says "complain if somebody throws this away".

But some notes are... let's say, more enthusiastic. They do not wait. Before the
compiler even starts, they grab the thing below them and do something with it.
`#[derive(Parser)]` is one of those. It takes our struct and hands it to clap's
procedural macro — our magic code writer, which is really a small program somebody
wrote. Remember `features = ["derive"]` in the manifest? That is what switched this
code writer on. And that program writes code. A lot of code. The code that walks the
arguments, fills in the fields, complains when something is missing, prints the
help screen. Remember wishing we could just define our struct and have it work?
There it is.

And the compiler? It compiles all of that as if we had typed it ourselves. It never
finds out we did not.

The `#[command(…)]` and `#[arg(…)]` lines? Instructions for the code writer. Which
flags, which short names, what goes into the help.

And `Debug`, next to `Parser` in the same `derive`? Another code writer, this one
from the standard library. It writes the code that prints a value for debugging,
field by field, so that `println!("{:?}", args)` works without us writing a
`toString`. You will see it on almost every struct in Rust.

And where does a code writer like that live? clap's lives in the clap crate:
somebody wrote it, and you can go and read it. Some live inside the compiler
itself. `#[test]`, which we will use as soon as postres gets its first tests, is declared in Rust's core
library as a macro whose entire body is one comment: `/* compiler built-in */`.
Funny, right?

So: code that generates code, before the code is compiled into code. Confused?
Good, that means you read it right. Just accept it for now; we will gather
them all up before the end of this article. And if you are curious about what this one wrote,
`cargo expand` will show you. It is a lot. You never have to read it.

Now look at the fields again, and read them as sentences.

`postman_file: PathBuf`. There *must* be a collection. Must? Who said must? The
type did. It is not an `Option`, so the macro makes it required, and nobody wrote
a single `if` to check it. `short = 'f'` gives us `-f`, and `long` gives us
`--postman-file`: named after the field, with the underscore turned into a hyphen,
because that is how long options are spelled on a command line.

`output_file: Option<PathBuf>`. There *may* be an output file.

*"`Option`? Like Java's `Optional`?"*

A close cousin, yes. It is Rust's answer to `null`: either `Some(value)`, or `None`.
The difference is that in Rust there is no `null` sneaking around it — if a value
can be missing, its type says so, and you cannot use it without checking. Here, no
flag means `None`, and a flag means `Some` with the path inside. What an `Option`
really is — and it is a lot more interesting than Java's `Optional` — is next time's
story. And its short option? `-o`. But we never wrote an `o`... A bare `short` takes the
first letter of the field's name, so `output_file` gets `-o` for free.
`postman_file` would have got `-p`, which is why it says `short = 'f'` instead. Keep
an eye on this one, by the way. It is going to bother us next time.

And the comments with three slashes? Last time we saw that `///` documents the
thing right below it. Here it works twice: clap picks up each field's
documentation and turns it into that option's line in the help. And `about`, in
`#[command(version, about)]`? It goes to `Cargo.toml` and takes the description we
wrote last time. `version` takes the version. Nothing is said twice.

*"Wait. `PathBuf`? A path is just a string, isn't it?"*

...Not really. On Linux, a file name is a bunch of bytes, and nobody promised they
are valid UTF-8. On Windows, it is a bunch of 16-bit units, and nobody promised
they are valid UTF-16 either. A Rust `String` is always valid UTF-8, so there are
paths the operating system can hand you that a `String` simply cannot hold. A
`PathBuf` holds them all. Why Rust has more than one kind of text in the first
place, and where a `String` actually lives, comes later. For now, keep this: a path
is its own thing, so it gets its own type. And that is going to save us very soon.

## Does it work?

Right. Enough reading. Does it work? Here is `postres --help`, exactly as it came
out:

```text
Convert Postman collections into .http files for the VS Code REST Client extension.

Usage: postres.exe [OPTIONS] --postman-file <POSTMAN_FILE>

Options:
  -f, --postman-file <POSTMAN_FILE>  The Postman collection to convert, exported as v2.1 JSON
  -o, --output-file <OUTPUT_FILE>    Where to write the .http file [default: the collection's path, ending in .http]
  -h, --help                         Print help
  -V, --version                      Print version
```

Nice. And if we forget the collection?

```text
error: the following required arguments were not provided:
  --postman-file <POSTMAN_FILE>

Usage: postres.exe --postman-file <POSTMAN_FILE>

For more information, try '--help'.
```

And now a typo. I did not ask for this one, and it made me smile:

```text
error: unexpected argument '--postman-fil' found

  tip: a similar argument exists: '--postman-file'

Usage: postres.exe --postman-file <POSTMAN_FILE>

For more information, try '--help'.
```

Oh, and both of those exit with status 2, the conventional "you used me wrong", so
a script calling postres can tell a usage mistake from a failed conversion.

Two fields. Not one line of parsing written by hand. And that builder version, a
few minutes ago, with all its options and settings? It prints exactly this help
screen, character for character. Same parser, a fraction of the typing, and no API
to learn. It paid off. Lazy wins.

And there is one more thing the builder version costs, which you would only find out
the hard way. Look at it again: every argument is named twice, as a string — once
where it is declared, `Arg::new("postman_file")`, and once where it is read,
`get_one("postman_file")`. What if the two do not match? I misspelled the second one
on purpose. It compiled without a murmur. And then, the moment it ran:

```text
thread 'main' panicked at src\main.rs:34:10:
Mismatch between definition and access of `postman-file`. Unknown argument or group id.  Make sure you are using the argument id and not the short or long flags
```

With the derive, there is no second string to get wrong. The field *is* the name, and
a field that does not exist does not compile.

And yes, this is cool. Look at what just happened. First, somebody gave us a
library, so we did not have to write a parser. Then the very same people gave us
something else: a code writer that uses their own API on our behalf, so we did not
even have to learn it. Welcome to what Rust can do.

Remember the question from a few minutes ago, whether any of this felt like systems
programming? Now you have seen it run. That is what *beyond* systems programming
means.

## Code that writes code

We have met a lot of those magic code writers by now. Time to gather them up,
because, honestly, they are a big part of why Rust feels the way it does when you
are *not* writing systems code.

Start with a problem. You have a JSON file, and a struct that describes the same
information, and you want the one inside the other. How?

You could walk the characters yourself, key by key, reporting errors as you go.
Slow, tedious, and easy to get wrong. You could load everything into nested maps
and ask for each value at runtime, checking every single time whether it was
there. Slow again, and tedious to write and to read. Or you could do what Java does
with Jackson: at runtime, inspect the class — its fields, their names, their types —
and fill it in. Lovely to use! But that inspection costs time on every run, and the
program has to carry a description of its own types around, just so that it can
look at itself.

Hmm. The only other way would be to write, by hand, for every struct, the exact
code that fills it in. Nobody is going to do that. Too boring, too many structs,
and every one of them a new chance to get it wrong. Right?

Unless... somebody else writes it. Think of it as hiring your teenage cousin to
write all that boring code for you, for every struct, exactly the way it should be.
Except that this cousin never gets it wrong, and never complains. Too much to ask?

Well, that is a procedural macro. A small program, written by somebody, that the
compiler runs while it compiles *your* program. It receives a piece of your code — a
struct, say — already parsed, and hands back more code, which the compiler then
compiles as if you had typed it. And all of that happens once, when you build. At
runtime there is nothing left to inspect: just ordinary code, as fast as if you had
written it yourself, and checked by the compiler like everything else you wrote.

And you have met every kind of them already, in this one article:

- **Derive macros**, `#[derive(…)]`: `Parser` from clap, and `Debug`, which is built
  into the compiler. Each one takes a struct and writes code next to it.
- **Their helper attributes**: `#[command(…)]` and `#[arg(…)]` do nothing by
  themselves. They are instructions for the derive above them.
- **Attribute macros**: `#[test]`, which takes the function below it and hands it to
  the test runner. We have not used it yet, but we saw where it lives: inside the
  compiler.
- **Function-like macros**, the ones with a `!`, like the `println!` you are about
  to see in `main`. These are a simpler kind, called *declarative*: instead of a program, a set of patterns —
  "when you see this shape, write that code" — expanded at compile time just the
  same.

*"But how does the compiler know which program to run?"*

The crate tells it. clap's code writer lives in a crate of its own, `clap_derive`,
which says, in its manifest, that it is a `proc-macro` crate. Cargo builds it first,
as a tool, and the compiler runs it while it builds postres. You never see any of
that. You just write `#[derive(Parser)]`.

*"In Java, we have Lombok."*

You do, and it is the closest thing you know: Lombok, and the annotation processors
behind MapStruct or Dagger, also write code at compile time. The difference is that
in Rust this is not a plug-in bolted onto the build. It is part of the language, and
any crate can ship one. That is why so much of the Rust world looks like what you
saw today: describe the shape, and let a macro write the rest.

And that is why I wanted them here, this early. More than any other feature, this
is what lets you write Rust like a high-level language: you say *what* you want,
and the boring, error-prone *how* is written for you, at compile time, and checked.
There is one more reason, the one this series keeps coming back to. Code that a
macro writes is code that nobody types — not you, and not an agent. Nobody can
mistype a field name in it, and nobody can forget a case.

## Run it

So, the moment of truth:

```text
$ postres -f exports.json/users.json
Args { postman_file: "exports.json/users.json", output_file: None }
```

And with `-o`:

```text
$ postres -f users.json -o out/requests.http
Args { postman_file: "users.json", output_file: Some("out/requests.http") }
```

That is the whole of `main`, printing back what it understood:

```rust include="postres@part-05:src/main.rs#main"
```

`Args::parse()` reads the command line. Wait — `parse`? We never wrote any function
called `parse`. The derive did, remember? And then `println!` prints a line. The
`{…}` in it is a placeholder, and we can put the name of a variable right inside it:
`{args}`. And the `:?` after the name? It asks for the *debug* version of the value,
field by field — exactly the code that `#[derive(Debug)]` wrote for us.

*"And if I leave `Debug` out?"*

Try it. Take `Debug` out of the derive, and the compiler says:

```text
error[E0277]: `Args` doesn't implement `Debug`
  --> src\main.rs:26:15
   |
26 |     println!("{args:?}");
   |               ^^^^^^^^ `Args` cannot be formatted using `{:?}` because it doesn't implement `Debug`
   |
   = help: the trait `Debug` is not implemented for `Args`
help: consider annotating `Args` with `#[derive(Debug)]`
```

Refused, and it even tells you which code writer to call.

Now look at `output_file` in those two runs again. `None`. And `Some("out/requests.http")`.
Not `null`. Not an empty string. Something else. Hmm... what exactly are those? Hold
that thought. It is the whole of next time.

Want to try it yourself?

```sh
git clone https://github.com/marlon-sousa/postres.git
cd postres
git checkout part-05
cargo run -- -f users.json
```

The `--` separates cargo's arguments from postres's.

## Wrapping it up

We have just taught postres to listen, and we did not write a parser to do it. On
the way, these are the Rust ideas we met:

1. **A dependency is one line** under `[dependencies]` in `Cargo.toml`, or one
   `cargo add`. **Features** switch on the optional parts of a crate, and only those
   get compiled.
2. **A struct is a named bundle of data**: each field is written `name: Type`. Only
   data — the functions that go with a struct live somewhere else.
3. **Attributes**, `#[…]`, are notes attached to whatever comes right below them.
   Some are only read by the compiler; others act on the code before it is compiled.
4. **Procedural macros** are small programs that write code for us, at compile time.
   `#[derive(Parser)]` and `#[derive(Debug)]` are procedural macros, and attributes
   like `#[arg(…)]` are instructions for them.
5. **Declarative macros**, the ones with a `!` like `println!`, match patterns and
   replace them with code, also at compile time.
6. **`///` comments document** the item below them — and clap turned ours into the
   help screen.
7. **A path is a `PathBuf`**, not a `String`, because a path is not always valid text.
8. **`Option` means "maybe"**: `Some(value)` when there is one, `None` when there is
   not. What it really is comes next time.
9. **A function starts with `fn`**, then its name, and its parameters in parentheses.
   `main` takes none, and it is where the program starts. `let` gives a name to a
   value, and `Args::parse()` calls a function that belongs to the type `Args` —
   written, in this case, by the derive.
10. **`println!("{args:?}")`** prints a line: `{…}` is a placeholder, a variable's
    name can go right inside it, and `:?` asks for the debug version of the value.

### The jobs

Building software alone with an agent means doing six jobs that used to belong to six
people. How many did this one do? Three:

- **Architect** — reuse before writing: postres's first dependency, chosen instead
  of a parser of our own. Then the derive instead of the builder, so that the command
  line is described in exactly one place, the struct. And only the part of clap we
  use gets compiled, thanks to one feature.
- **Product owner** — what does a user actually see? `-f`, `-o`, a help screen
  written from the doc comments, a suggestion when a flag is misspelled, and exit
  code 2 for "you used me wrong". A whole user interface, decided in one struct.
- **QA** — the builder version, checked against the derive instead of assumed
  equivalent: the same help screen, byte for byte. And a mismatched name, tried in the
  builder version on purpose: it compiled, and crashed when it ran.

And the project manager, the platform engineer and the reviewer? Nothing for them this
time. The checks from last time ran on every change without anybody touching them —
which is exactly what they were built for.

The six jobs are counted in [*The night that produced no
code*](article:the-night-that-produced-no-code), in the series *You are now the whole
team*.

### What the language did

Everything clever in this article was clap's: the help screen, the typo suggestion,
the names of the options. The language did one thing, and it is the thing that made
all of the rest possible.

It let the people who made a library also ship a program that uses their own API on
our behalf — declared with one line, run once, at compile time, leaving nothing
behind at runtime but ordinary code the compiler has already checked.

That is less common than it sounds:

- **Python** does this kind of thing *while the program runs*. Decorators,
  `dataclasses`, and `typer` reading a function's signature to build a command line
  all happen at run time, every time.
- **JavaScript** decorators run at run time too. Doing it at build time means
  bringing in a separate tool, like Babel or a TypeScript transformer.
- **Java** can generate *new* files at compile time, through its annotation
  processing API. What it cannot do is add methods to a class you already wrote,
  because a class's methods have to live inside the class. Lombok does it anyway by
  reaching into the compiler's internal, unsupported APIs — in effect, a patch to
  `javac`.
- **C#** is the honest exception: its source generators are an official way to do
  something similar at compile time.
- And in plenty of other languages, there is simply no way to do it at all.

In Rust it is part of the language, and a derive only ever *adds* code next to your
struct — which works precisely because, in Rust, a struct's functions do not have to
live inside it.

And look at what the others have in common. They find out about your types *while
the program runs*. Python's `typer` and `pydantic` read your type hints at run time.
TypeScript's types do not exist at run time at all — they are erased when the code is
compiled to JavaScript — so libraries there lean on decorators that record the
information they need as the program starts. Java's Jackson inspects your classes by
reflection. Rust has no run-time reflection to speak of, and it does not need any: a
macro sees your struct while the program is being compiled, and writes the code for
exactly that struct. Every case it will ever have to handle is known, and compiled,
before the program runs.

That is a pattern you will see across the whole Rust world, and it is worth holding on
to, because it is one of the most important ideas in this whole series. Where other
languages look things up, check things, or clean things up *while the program runs*,
Rust works out everything it can *before* the program runs. Macros are one example:
clap for the command line today, serde for JSON soon. Conditional compilation is
another, coming up shortly: code that is only for tests, or only for one operating
system, is decided when you build, not when you run. And the biggest one of all is
memory: where Java, Python or JavaScript send a garbage collector around at run time to
find what can be freed, Rust works out, while compiling, exactly when each value stops
being needed. We will get there. For now, keep the principle: if it can be known ahead
of time, Rust compiles it ahead of time.

## Next time

postres printed `None` and `Some("out/requests.http")`. Next time we find out what
those really are: enums — and not the kind Java has. A type that says "one of
these, and each one can carry its own data", a `match` that will not let you forget
a case, and the answer to the question that `-o` leaves us with: what do we do when
something is optional for the user, and not optional for us?
