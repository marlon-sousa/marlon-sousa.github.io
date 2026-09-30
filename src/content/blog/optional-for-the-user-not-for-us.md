---
title: 'Optional for the user, not for us'
description: 'Some and None turn out to be an enum — and not the kind Java has. Tagged unions, an Option that cannot pass for the value it might hold, inputs kept apart from the domain, and a Config the rest of postres can trust: private, settled once built, and named even when the user does not name it.'
pubDate: 'Sep 30 2026 12:00'
series: 'rust-beyond-systems'
seriesPart: 6
code: 'postres@part-06'
tags: ['rust', 'software engineering']
draft: false
---

[Last time](article:arguments-without-writing-a-parser) postres learned to listen.
We described its command line as a struct, a macro wrote the parser for us, and the
program printed back what it understood — including two strange things, `None` and
`Some("out/requests.http")`.

This time we find out what those are: enums, and not the kind Java has. Then we use
them to answer the question `-o` leaves us with — what do we do when something is
optional for the user, and not optional for us? By the end, postres will know
exactly where its output should go. Or at least, it will think it does.

## Some, None, and what they are

Here is what postres printed last time, once without `-o` and once with it:

```text
Args { postman_file: "exports.json/users.json", output_file: None }
Args { postman_file: "users.json", output_file: Some("out/requests.http") }
```

Not `null`. Not an empty string. So what?

*"`Some` and `None`... are those keywords?"*

No. They are plain Rust, from the standard library, and you can go and read them.
Here is `Option`, exactly as the standard library defines it, with the compiler's
own attributes taken out:

```rust
pub enum Option<T> {
    None,
    Some(T),
}
```

That is all `Option` is. An `enum` with two variants.

An enum, a generic, and no `null` anywhere. Pointers? Registers? Not one. All this
way into a "systems language", and we have not touched the system yet.

*"An enum? In Java, an enum is a list of constants. `MONDAY`, `TUESDAY`..."*

Right, and this is exactly where Rust's enum is different. In Java, every constant
of an enum has the same shape, fixed when you write the program. A Rust enum says
something else: a value of this type is *one of* these variants, and each variant can
carry its own data — its own kind of data, filled in while the program runs. `None`
carries nothing. `Some` carries a value.

That is why they are called **tagged unions**. A *union*, because a value can be any
one of several shapes. *Tagged*, because it always knows which shape it is — and so
does the compiler.

If you write TypeScript, you have probably built these by hand: a union of object
types, each with a `kind` field to tell them apart. Modern Java gets close with a
`sealed` interface and a `record` for each case, and Kotlin with sealed classes. Rust
simply has them built in, and calls them enums.

*"And the `<T>`?"*

A placeholder for a type. `Option<PathBuf>` is an `Option` whose `Some` carries a
`PathBuf`; `Option<u8>` would carry a small number. It is a *generic*, the same idea
as `List<String>` in Java or `Array<string>` in TypeScript: one `Option`, written
once, that works for any type you name.

`Option` has a sibling you will meet everywhere in Rust:

```rust
pub enum Result<T, E> {
    Ok(T),
    Err(E),
}
```

`Ok` carries the value, `Err` carries the error. Same idea: one of two, each with its
own data. We will put it to work when postres learns to say what went wrong.

And `null`? There is none. In safe Rust, a `PathBuf` is always a path — there is no
way for it to be secretly empty. If a value might be missing, its type says so:
`Option<PathBuf>`. And you cannot reach the path inside without saying what happens
when there is none.

How do you do that? We are about to see. But first, the problem.

## Optional for the user, not for us

Last time I said `-o` was going to bother us. Here it is.

`-o` is optional. For the user, that is a kindness: one flag fewer to type. For us,
it is a problem, because a program cannot write its output to nowhere. And that is
the trouble with optional things: something that is optional for the user and *not*
optional for us has to come from somewhere. Now... what? Ask again? Refuse to run?
Write to a file called `output`? Panic, and blame the user?

clap has an answer ready, and it is tempting. Put `default_value = "output.http"` on
the field, and the `Option` disappears: the field is always a path, and nobody ever
has to handle `None`. Lovely.

Except... whose default? Convert two collections in the same folder, and the second
quietly overwrites the first. And a file called `output.http` tells nobody what is
inside it. The sensible default is the collection's own name, ending in `.http`
instead of `.json`, right next to it: `users.json` becomes `users.http`.

Can clap do that? Hmm. That default depends on *another argument*, and a field's
default is fixed; it cannot look at `--postman-file`. There is `default_value_if`,
but that only chooses between fixed values, depending on whether another argument
is present or equals something. Compute a value from it? No.

So the field stays an `Option`, which is simply the truth about the command line:
the user may not have told us. We work the default out ourselves, after parsing.
And since clap cannot know what that default will be, the help line says it by hand
— that is the `[default: …]` in the field's doc comment.

## A home for it

We work it out ourselves. Fine. But where does that code go?

The first place that comes to mind is `main.rs`, right next to `Args`. That is where
the arguments are, after all. But remember the skeleton we built when postres was an empty directory:
the binary is a thin shell, and everything worth testing goes in the library, where
a test can simply call a function instead of starting a program. And is working out
a file name worth testing? Oh, we are going to find out how much.

Library, then. Which module? We have four, one per stage: `postman`, `converter`,
`restclient` and `error`. Is the output name part of reading a Postman collection?
No. Of lowering it? No. Of writing REST Client? Hmm... closer. But no: it is not
about what goes *in* the file, it is about *which* file. And it is certainly not an
error. It is about the run itself — what this one execution of postres has been
asked to do. None of the four stages owns that. So it gets a module of its own,
`config`, and one more line at the root of the library:

```rust include="postres@part-06:src/lib.rs#modules"
```

A fifth `mod`, and a file `src/config.rs` next to the other four. Still no `pub` on
any of them. But hold on: `main` has to use whatever is in there, and the binary is
a stranger to the library, allowed to touch only what is public. So something has
to be public. The type, yes. The module? It does not have to be. One line at the
root does it:

```rust include="postres@part-06:src/lib.rs#reexport"
```

`pub use` is a re-export. It grabs `Config` from inside the private `config` module
and puts it on display at the top of the library. Callers write `postres::Config`
and never `postres::config::Config`. And if we rearrange the inside tomorrow, nobody
outside notices, because nobody outside ever saw it.

And what is a `Config`? Two paths. But before we write it, a question: once a
`Config` has been built, should anything be able to change it?

Think about it. The run starts, and the config says "write to `users.http`". Halfway
through, some code changes it to `other.http`. Now the same run has two answers to
the question "where does the output go?", and which one you get depends on *when*
you ask. That is a bug waiting for an afternoon to happen in. A config is settled
the moment it is made: nothing in it should ever change, and nothing should be able
to change it.

*"Easy. In Java I would make the fields `private final` and write getters. Or use a
`record`."*

Exactly. And in Rust, the first half comes for free: a field is private unless it
says `pub`, so we simply do not say it. And now nobody outside the module can change
the fields... or read them. Hmm. `main` needs to read them. So we need readers:
getters.

Write them by hand? Two fields, two tiny functions. Easy. But remember last time:
before writing something ourselves, we looked for somebody who had already written
it. Is there a crate for getters? Of course there is: `getset`. And guess how it
works. Another code writer:

```toml include="postres@part-06:Cargo.toml#getset"
```

```rust include="postres@part-06:src/config.rs#config"
```

`#[derive(Getters)]` is one of last time's enthusiastic sticky notes: it hands the
struct to getset's code writer, and `#[getset(get = "pub")]` tells it what to write,
a public getter for every field. So `Config` now has a `source_file()` and a
`dest_file()`, each handing back its path for you to read, and neither of them
written by us. getset even copies each field's doc comment onto its getter, so the
`missing_docs` lint we switched on at the very beginning is happy without us repeating a word.

Getters are functions that are called *on* a value — `config.dest_file()` — and
that kind of function deserves its own moment later. For now, what matters is what
they are not: setters. There are none. So what happens if some code tries to change
a field anyway?

```text
error[E0616]: field `dest_file` of struct `Config` is private
  --> src\main.rs:28:12
   |
28 |     config.dest_file = PathBuf::from("somewhere-else.http");
   |            ^^^^^^^^^ private field
```

Refused. And that was with `let mut config`: even a mutable binding cannot reach a
field it is not allowed to see. Once built, a `Config` can be read, and that is all.

And how is it used? This is the whole of `main` now:

```rust include="postres@part-06:src/main.rs#main"
```

Three steps. `Args::parse()` reads the command line, as last time. Then
`Config::new` turns what the user typed into what the run needs. And the third step
is whatever we do with it; today, we just print it, reading the paths through the
getters.

Look at the handover in the middle: `Args` on one side, `Config` on the other.

## Inputs are not the domain

*"Why two types for the same two paths? `Args` already has them."*

Because they are two different things that happen to hold similar data today.

`Args` is the **input**: the shape of a command line. Flags, short names, help text,
and an output that may or may not be there. It belongs to clap and to `main`.

`Config` is the **domain**: what postres actually works with. Two paths, both
present, settled for the whole run. It belongs to postres.

Remember the travel plug adapter, from when we laid out the crate? Postman on one side, REST Client
on the other, and one converter in the middle, the only part allowed to know both.
This is the same idea, at the front door. The command line is one input format.
`Config::new` is the adapter. And nothing past it knows that a command line exists.

Why bother, for two paths? Suppose that, one day, postres also reads its settings
from a file — a `postres.toml` next to the collection, say — when there is one.
Where do the paths come from then? From the file. Or from the command line. Or from
both: the file for the usual values, and a flag on top when you want something
different this time. Each of those is a new input, with a shape of its own: a new
struct, a new parser, perhaps a new crate. And every one of them ends up building the
same `Config`. The conversion never changes, because it never knew where its paths
came from.

Tests get the same gift. The day postres converts something, a test will build a
`Config` from two paths and call the conversion, with no command line and no file
in sight.

If you come from Java, you have met this under other names: the objects a request
arrives in, kept apart from the domain model, or the ports and adapters of a
hexagonal architecture. Different names, same rule: the outside world's shape stops
at the door.

It is a small thing, with two paths. It will matter more every time postres learns to
read something new.

## Building a Config

So how does `Config::new` turn two paths, one of them maybe missing, into a
`Config`? Here it is:

```rust include="postres@part-06:src/config.rs#new"
```

*"Hold on. Where are the methods? In Java they would be inside the class."*

Right, and that is the first surprise: `impl Config { … }`. This is our first
**`impl` block**, and it is where the functions of a struct live. Remember that a
struct is only data? Here is the other half. In Java or C#, the fields and the
methods are written together, inside one `class`. In Rust they are written apart: the
`struct` says what a `Config` *is*, and an `impl Config` block, beside it, says what
you can *do* with one. You can even have more than one `impl` block for the same
struct. In fact we already do: getset's code writer wrote one for the getters. We
just never saw it.

`pub fn new(…) -> Self`? A public function, taking two parameters and returning
`Self`, which is simply the type we are implementing: `Config`. And notice what it
does *not* take: no `self` — no `this`. So it belongs to the type, not to any one
`Config`; in Java, this is a `static` method. That is why `main` calls it as
`Config::new(…)`, with two colons, the way Java would say `Config.create(…)` on a
static. The functions that *do* take `self` — like those getters, called with a dot
on one particular `Config` — are the instance methods, and they get their turn
later.

*"So `new` is the constructor."*

Not quite. It is not a keyword, and Rust has no constructors at all. `new` is a
naming habit, nothing more: a static function that builds a value. But it does
something important here. The fields are private, so no code outside this module can
write `Config { … }` and fill them in itself. The only door into a `Config` is
`Config::new` — which means the only way to get one is the way that works out the
default. Nobody can build a `Config` with no destination.

And now, our `Option`. `dest_file` arrives as an `Option<PathBuf>`, and a `Config`
needs a `PathBuf`. Can we just put one where the other goes? Let's try it, and hand
the `Option` straight to the `Config`:

```text
error[E0308]: mismatched types
  --> src\config.rs:32:13
   |
32 |             dest_file,
   |             ^^^^^^^^^ expected `PathBuf`, found `Option<PathBuf>`
   |
   = note: expected struct `PathBuf`
                found enum `Option<PathBuf>`
help: consider using `Option::expect` to unwrap the `Option<PathBuf>` value, panicking if the value is an `Option::None`
```

Refused. And look at the note: *found enum `Option<PathBuf>`*. The type says
"maybe", and the compiler will not pretend it says "yes". It even offers a fix,
`expect`, which takes the value out and crashes the program when there is none. But
leaving out `-o` is perfectly allowed — so that fix would crash on exactly the case we
care about. A suggestion, not an answer.

So we ask the `Option` properly, and it has exactly the method for it:
`unwrap_or(default)` — the value inside, or this default if there is none. That is the
first line of `new`, and it reads like the sentence we would say out loud: the
destination the user gave, or else one made from the collection's name.

Notice what is *not* there: no `if`, no `else`, no branch of any kind, and no new
block to keep in your head while reading. `Option` comes with a whole family of
methods like this one, in what is often called a functional style: instead of
opening the value up and deciding what to do in each case, you say what you want in
one call, and the method takes care of both cases for you. You will see a lot of it in
Rust, and it is one of the reasons Rust code can be so short to read. The absence is
dealt with in the one place it can be, and nothing past it ever sees an `Option`
again.

*"Wait. `unwrap_or` is a method on an enum? Enums have methods?"*

They do. Everything we just said about `impl` blocks for structs works for enums too:
an enum can have an `impl` block, with functions in it. And here is the interesting
part: a method is written once, for the whole enum, and works whichever variant you
happen to be holding. Here is `unwrap_or` as the standard library writes it, stripped
of a few markings that only matter to the compiler:

```rust
impl<T> Option<T> {
    pub fn unwrap_or(self, default: T) -> T {
        match self {
            Some(x) => x,
            None => default,
        }
    }
}
```

A few new things in there, and one of them we are going to leave for later.

`impl<T> Option<T>` is the `impl` block for `Option` — for an `Option` of any type
`T`, written once.

`self` is new. Remember the functions that are called *on* a value, with a dot, which
I promised we would meet later? Here is one. `unwrap_or` takes `self`, so it is called
on one particular `Option` — `dest_file.unwrap_or(…)` — and inside it, `self` *is*
that `Option`, whichever variant it happens to be.

And `match self { … }` is where the case-by-case work happens: if it is `Some`, give
back the value inside; if it is `None`, give back the default. That construct,
`match`, deserves its own moment, and it will get one. For now, just notice *where*
it lives: inside the method, written once, in the standard library. We call
`unwrap_or`, and we never see a branch.

That is the trick behind the functional style. The branching is done once, inside the
enum's own methods, so the code that uses the enum does not have to do it again.
`unwrap_or` and dozens of others each work on any `Option`, `Some` or `None`, and
each one says in its name what it does. (Java enums can have methods too, by the way.
The difference, once again, is what the variants can carry.)

And the default itself:

```rust
PathBuf::from(source_file.to_string_lossy().replace(".json", ".http"))
```

Read it from the inside out. `to_string_lossy()` turns the path into text, because
we want to do text things to it. Lossy, says the name — a path is not always valid
text, remember, and anything that is not gets patched over. Hmm. Hold that thought.
Then `.replace(".json", ".http")` swaps `.json` for `.http`. And `PathBuf::from`
turns the text back into a path.

The last line of `new`, `Self { source_file, dest_file }`, builds the `Config`.
Shouldn't it be `source_file: source_file`? It could be. When a variable has the same
name as the field, Rust lets you write it once. And the doc comment above `new`? It is
there because it had to be: `Config` is public, and the `missing_docs` lint refused to
let it be public without saying what it is. Did I remember to document it? No. The
build remembered for me.

One line. It reads well. Is it good enough? Let's run it.

## Run it

```text
$ postres -f users.json
converting users.json into users.http
```

Lovely. And with `-o`:

```text
$ postres -f users.json -o out/requests.http
converting users.json into out/requests.http
```

That line comes from the `println!` at the end of `main`: each `{}` is a
placeholder, filled in order by the values after the text.

*"And why `.display()`? Why not just print the path?"*

Because a path is not text, remember? `display` gives back something printable,
and quietly patches over anything that is not valid text along the way.

All good, then. Let me just try one more, a collection sitting in a folder of
exports:

```text
$ postres -f exports.json/users.json
converting exports.json/users.json into exports.http/users.http
```

Wait. What happened to the *directory*? `exports.json` became `exports.http`. Of
course: `replace` replaces every `.json` it finds, and it found two. And now that
I am looking... what does it do with `users.JSON`? Or with a file that has no
extension at all?

Hmm. How many cases like that are hiding in one line? And how would we even know?

Want to see it for yourself?

```sh
git clone https://github.com/marlon-sousa/postres.git
cd postres
git checkout part-06
cargo run -- -f exports.json/users.json
```

## Wrapping it up

We have just taught postres what to do when the user does not tell it where to write
— and, as it turns out, taught it to do it slightly wrong. On the way, these are the
Rust ideas we met:

1. **An enum is a type whose value is one of several variants**, and each variant can
   carry its own data. A tagged union — nothing like Java's list of constants.
2. **`Option<T>` is `Some(T)` or `None`**: Rust's answer to `null`, and just a plain
   enum from the standard library. Its sibling, **`Result<T, E>`**, is `Ok(T)` or
   `Err(E)`.
3. **Generics**: the `<T>` is a placeholder for a type, filled in when you use it, as
   in `Option<PathBuf>`.
4. **An `Option` is not the value it might hold.** Use one where the value is
   expected and the compiler refuses. Ask it instead: `unwrap_or(default)` gives you
   the value, or the default when there is none — in one call, with no branches, in
   the functional style much of Rust's standard library is written in.
5. **The compiler's suggestions are suggestions.** Its fix for that error, `expect`,
   would have crashed on exactly the case we wanted to handle.
6. **`mod config;`** declares a module living in `config.rs`, and **`pub use`**
   re-exports a type so it can be public while its module stays private.
7. **Fields are private by default.** `pub` opens them; leaving it out makes a value
   read-only to everybody outside its module.
8. **An `impl` block** holds a struct's functions. A function with no `self`, like
   `new`, belongs to the type and is called as `Config::new(…)`. Rust has no
   constructors; `new` is only a convention. **`Self`** means the type being
   implemented.
9. **Enums have methods**, in `impl` blocks, just like structs. A method is written
   once for the whole enum and works whichever variant you hold. A method that takes
   **`self`** is called on one particular value, with a dot.
10. **Field init shorthand**: `Self { source_file, dest_file }` when the variables are
   named like the fields.
11. **`#[derive(Getters)]`**, from getset, is another code writer: getters for private
    fields, with nothing written by hand.

### The jobs

Building software alone with an agent means doing six jobs that used to belong to six
people. How many did this one do? Three — and one that it did not do, which shows:

- **Architect** — inputs kept apart from the domain: `Args` is the shape of a
  command line, `Config` is what postres works with, and `Config::new` is the only
  adapter between them, so a config file one day would be a new input, not a new
  `Config`. And a home for it: a module of its own, public through one `pub use`,
  settled once built, private fields, getters and no setters.
- **Product owner** — a default name worth having: not `output.http`, which two
  conversions in one folder would fight over, but the collection's own name.
- **Reviewer** — *document this public type* was a build error already, so `Config`
  arrived documented.

And **QA**? Nobody wrote down what "right" means for that default name before we ran
it. Look at the last run again: the directory got renamed. That is what a missing QA
looks like, and it is where we start next time.

The six jobs are counted in [*The night that produced no
code*](article:the-night-that-produced-no-code), in the series *You are now the whole
team*.

### What Rust solved that would have been a problem elsewhere

- **An absent value cannot be forgotten.** In Java, a missing value is `null`, and
  nothing stops you from calling a method on it until a `NullPointerException` does,
  at run time. In TypeScript it is `undefined`, and it travels quietly until something
  tries to use it. Here, the absence is part of the type: an `Option<PathBuf>` cannot
  pass for a `PathBuf`, and the compiler says so before the program ever runs.

### What the language did

Two things, and both of them are the language, not a library. It gave us enums that
carry data, so "maybe a path" is a type and not a convention. And its type checker
refused to let a "maybe" stand in for a "yes". Put together, they turned the most
common bug in the languages most of us came from — using something that is not
there — into a line that does not compile.

## Next time

postres now picks a name for its output, and one run was enough to show that the name
can be wrong. Next time we ask the question properly: is that name right? We write
down what right means, as tests, watch them fail — more than once — and find out
that the fix was sitting in the standard library all along.
