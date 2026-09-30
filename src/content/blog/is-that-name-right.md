---
title: 'Is that name right?'
description: 'postres picks a default output name, and one run showed it can be wrong. Tests that say what right means, a regular expression that fails them twice, the fix that was in the standard library all along — and a rule that would have found it first.'
pubDate: 'Sep 30 2026 12:00'
series: 'rust-beyond-systems'
seriesPart: 7
code: 'postres@part-07'
tags: ['rust', 'software engineering']
draft: false
---

[Last time](article:optional-for-the-user-not-for-us) `Some` and `None` turned out to
be an enum, and `-o` got its answer: when the user gives no output, `unwrap_or` hands
us a default made from the collection's name, and a settled `Config` carries it for
the rest of the run. Then one last run went wrong. `exports.json/users.json` became
`exports.http/users.http`: the default renamed a *directory*.

This time we ask the question properly: is that name right? And before we touch the
code, we are going to do something we have not done yet in postres. We are going to
write down what "right" means.

## What does "right" mean?

Here is the line from last time, the default inside `unwrap_or`:

```rust
PathBuf::from(source_file.to_string_lossy().replace(".json", ".http"))
```

One run showed us one way it breaks. How many more are there? We could run postres
by hand with every name we can think of, and look at each answer, and do it all over
again every time the code changes. Ooops, calm down. That is what tests are for.

So, before fixing anything, let's say what a right default name is, case by case:

```rust include="postres@part-07:src/config.rs#tests"
```

The names read like sentences; try reading them out loud. Each one is a small
promise: an explicit `-o` wins; only the last extension is replaced; a directory
called `exports.json` keeps its name; `.JSON` or `.txt` become `.http` just like
`.json`; and a file with no extension gets one.

Now, what is all that?

`mod tests { … }` is a module, like the ones we declared in `lib.rs`, except that its
contents are written right here, in braces, instead of in a file of its own. Remember,
when we laid out the crate, I said you would see inline modules most often around
tests? Here they are.

`use super::*;` brings in everything from the module around it — `Config` and
friends.

*"`super`? Like Java's `super`?"*

Same word, different family. In Java, `super` is your parent *class*. In Rust, it is
your parent *module*: the one this module sits in, here `config`. And the `*` means
"all of it", private things included, because the tests module lives *inside* the
module it tests. And `use std::path::Path;` brings in `Path`, which only the tests
need.

`#[test]` is a sticky note, the kind that lives inside the compiler: it marks a
function as a test, for `cargo test` to find and run. And `#[cfg(test)]`, above the
module? It keeps the tests out of the real program: they exist when `cargo test`
builds, and nowhere else. How it does that, and why it matters more than it sounds,
is next time's story.

*"And `"users.json".into()`? That is a string. `Config::new` wants a `PathBuf`."*

That is what `into` is for. It asks Rust to turn a value into whatever type is needed
right there. And how does Rust know which type that is? It looks at `Config::new`: it
takes a `PathBuf`, so `into` makes a `PathBuf`. You name the destination once, in the
function, and Rust works out the rest.

`Some(…)` wraps a value in an `Option` — the way `-o` would have. `assert_eq!` checks
that two things are equal, and fails the test if they are not; the `!` says it is a
macro, the pattern-matching kind, like `println!`. And `Path::new("users.http")` makes
a path from text, so that we have something to compare with.

Now, the moment of truth. `cargo test`, against last time's code, trimmed to the
tests themselves:

```text
running 5 tests
test config::tests::an_explicit_destination_wins ... ok
test config::tests::any_extension_is_replaced_not_only_json ... FAILED
test config::tests::only_the_last_extension_is_replaced ... FAILED
test config::tests::a_file_with_no_extension_gets_one ... FAILED
test config::tests::a_directory_name_is_left_alone ... FAILED

failures:

---- config::tests::any_extension_is_replaced_not_only_json stdout ----
assertion `left == right` failed
  left: "users.JSON"
 right: "users.http"

---- config::tests::only_the_last_extension_is_replaced stdout ----
assertion `left == right` failed
  left: "users.http.http"
 right: "users.json.http"

---- config::tests::a_file_with_no_extension_gets_one stdout ----
assertion `left == right` failed
  left: "users"
 right: "users.http"

---- config::tests::a_directory_name_is_left_alone stdout ----
assertion `left == right` failed
  left: "exports.http/users.http"
 right: "exports.json/users.http"

test result: FAILED. 1 passed; 4 failed; 0 ignored; 0 measured; 0 filtered out
```

One out of five. Wow.

Each failure shows what we got, `left`, and what we promised, `right`. The directory
we already knew about. But look at `users.json.json`: it came out as
`users.http.http`. Of course — `replace` replaces *every* `.json` it finds. And
`users.JSON`, and plain `users`, came back exactly as they went in. The output name
is the input name! The day postres writes its file, it writes it right on top of the
collection it has just read. Funny? Not for whoever owned that collection.

## Only the last one

Let's take them one at a time. `replace` swaps every `.json`, and we want only the
last one.

Only the last one... that smells like a regular expression. We need a *lookahead*:
match `.json`, but only if there is no other `.json` after it. Let's write it. Hmm,
the standard `regex` crate does not do lookahead. Why not? On purpose: it promises
to match in linear time, and lookahead would break that promise. Fine, there is a
crate that does, `fancy-regex`. Another dependency. And compiling a regular
expression is expensive, so we do not want to do it on every call. Compile it
once, the first time, and keep it. Put together:

```rust
use fancy_regex::Regex;
use std::sync::LazyLock;

static LAST_JSON: LazyLock<Regex> = LazyLock::new(|| Regex::new(r"\.json(?!\.json)").unwrap());
```

And in `Config::new`, the default becomes:

```rust
let dest_file = dest_file.unwrap_or({
    let text = source_file.to_string_lossy().to_string();
    let replaced = LAST_JSON.replace(text.as_str(), ".http").to_string();
    PathBuf::from(replaced)
});
```

Hmm. A lot of new things in a few lines. Let's take them one at a time.

*"`static`. That one I know from Java."*

Almost the same thing: a value that lives for the whole run of the program, one
single copy, reachable by name from anywhere in the module. Like a `static final`
field. But there is a catch: a static has to be ready before the program starts, and
compiling a regex is work that happens while it runs. So what we really want is a
static that starts out empty and fills itself the first time somebody looks at it.

That is `LazyLock`, from the standard library. And the `<Regex>` after it? A generic,
like last time's `Option<T>`: it says what the `LazyLock` will hold once it is
filled.

*"And what are those two bars, `||`?"*

That is a **closure**: a small function with no name, written right where it is
needed. The two bars hold its parameters — none, here — and after them comes its
body. If you know `() => …` in TypeScript, or a lambda in Java or
Python, you already know this. But why hand `LazyLock` a function, instead of just
the regex? Because we do not want the regex *now*. We hand over the recipe, and let
`LazyLock` decide when to cook. It runs the closure the first time somebody touches
`LAST_JSON` — safely, even if several threads get there at the same moment — and
hands everybody the stored regex after that. A singleton, and a well-behaved one: it
changes once, from nothing to compiled, and never again. In older code you will see
the `lazy_static` crate doing this job; since Rust 1.80, the standard library does it.

*"And `.unwrap()`? That sounds like something that could blow up."*

It is, a little. Remember `Result`, from last time — `Ok` or `Err`? `Regex::new` can
fail, because the pattern might be malformed, so it hands back a `Result`: either the
regex, or an error. `unwrap` says: give me what is inside `Ok`, and if it is an
`Err`, stop the whole program right here. Brutal? Here, it is fine. The pattern is
written in our own code; it is either always valid or always broken, and the first
test run would tell us which. For anything that comes from outside — a file, a user —
`unwrap` is the wrong answer, and we will do that properly when postres learns to say
what went wrong.

And now the default itself.

*"Wait. What? `unwrap_or` takes a value. I read that, and I see you passing it a...
what, a function? Or what?"*

Neither — a **block**. Everything between those braces. And in Rust, a block is not
just a place to put statements: it gives back a value, the value of its last line, as
long as that line has no semicolon at the end. So the block runs right there, on the
spot, does its work in three steps, and what `unwrap_or` receives is its answer: the
`PathBuf` on the last line. No `return` anywhere.

And notice the difference from the closure a few lines up. The closure had bars, and
it was a recipe: it runs *later*, when `LazyLock` decides. This block has no bars. It
runs *now*, once, and hands over the result.

*"Fine. But inside it... `to_string` twice, and an `as_str` in the middle? That looks
like going round in circles."*

It is, a little. Follow it: `to_string_lossy()` turns the path into text — lossy,
remember, anything that is not valid text gets patched over — and `to_string()`
makes it a `String` of our own. `as_str()` hands that text to the regex in the form
it asks for, `replace` swaps the match for `.http`, and `to_string()` gives us the
result as a `String` again. Last, `PathBuf::from` turns the text back into a path.
From path, to text, and back to path. Hmm. Hold that thought.

A crate, a static, a closure, a lookahead... all of that to change an extension. But
it reads well, it compiles, it looks right. Ship it?

Ooops, calm down. This time we do not have to guess. We have tests:

```text
running 5 tests
test config::tests::only_the_last_extension_is_replaced ... ok
test config::tests::an_explicit_destination_wins ... ok
test config::tests::a_file_with_no_extension_gets_one ... FAILED
test config::tests::any_extension_is_replaced_not_only_json ... FAILED
test config::tests::a_directory_name_is_left_alone ... FAILED

failures:

---- config::tests::a_file_with_no_extension_gets_one stdout ----
assertion `left == right` failed
  left: "users"
 right: "users.http"

---- config::tests::any_extension_is_replaced_not_only_json stdout ----
assertion `left == right` failed
  left: "users.JSON"
 right: "users.http"

---- config::tests::a_directory_name_is_left_alone stdout ----
assertion `left == right` failed
  left: "exports.http/users.json"
 right: "exports.json/users.http"

test result: FAILED. 2 passed; 3 failed; 0 ignored; 0 measured; 0 filtered out
```

Two out of five. `users.json.json` is fixed. But look at the directory one:
`exports.json/users.json` became `exports.http/users.json`. We fixed the last `.json`
and broke the directory the other way round!

Why? Our lookahead, `(?!\.json)`, does not look for `.json` anywhere to the right. It
looks at the next five characters, and only those. So the first `.json` followed by
anything else — here, a slash — matches, and `replace` replaces the first match it
finds. The sentence explaining the lookahead was right. The lookahead was not. And
reading it, you would never have known. The test knew.

Fine, a regex bug; we can fix a regex. "No `.json` anywhere after this" is
`(?!.*\.json)`, with a `.*` so that it looks all the way to the end. Run again:

```text
running 5 tests
test config::tests::an_explicit_destination_wins ... ok
test config::tests::any_extension_is_replaced_not_only_json ... FAILED
test config::tests::a_file_with_no_extension_gets_one ... FAILED
test config::tests::only_the_last_extension_is_replaced ... ok
test config::tests::a_directory_name_is_left_alone ... ok

failures:

---- config::tests::any_extension_is_replaced_not_only_json stdout ----
assertion `left == right` failed
  left: "users.JSON"
 right: "users.http"

---- config::tests::a_file_with_no_extension_gets_one stdout ----
assertion `left == right` failed
  left: "users"
 right: "users.http"

test result: FAILED. 3 passed; 2 failed; 0 ignored; 0 measured; 0 filtered out
```

The directory test passes. Three out of five green. (And now that it is right, notice
that `\.json$` — "`.json` at the very end" — says the same thing with no lookahead at
all. The plain `regex` crate could have done that.)

But two are still red, and they are the same two as at the very beginning.
`users.JSON` still comes back as `users.JSON`. Plain `users` still comes back as
`users`.

So, more regex? Make it case-insensitive, with `(?i)`. Then something for a different
extension — `.txt`, say. Then something else again for no extension at all, where
there is nothing to replace and we have to *add*...

Hmm. Wait. Every fix makes the regex bigger, and we are still failing. Maybe the regex
is not the problem. What are we really doing? Changing the extension of a file. Of a
*file*. Not of a string. And remember that thought we were holding — from path, to
text, and back to path? We took a path, turned it into text, and then tried to
rediscover, with a regular expression, what the path already knew: where the name
starts, where the extension starts, and whether there is one at all. We were solving
a path problem at the wrong level.

So before going any more complex, let's do what we should have done first: look at
what the type we are holding already offers. Does a path know what an extension is?

It does. Here is `Config::new`, with the regex gone:

```rust include="postres@part-07:src/config.rs#new"
```

Look at the first line of `new`: `source_file.with_extension("http")`.

*"That's it? One call?"*

One call. No crate, no static, no closure, no lookahead, and no trip from path to text
and back.

Remember the corridor, from the very first article of this series? *"Rust would need
PhD-level programmers."* Well. So far, the hardest thing we have needed to know is that
files have extensions.

And the tests?

```text
running 5 tests
test config::tests::a_directory_name_is_left_alone ... ok
test config::tests::an_explicit_destination_wins ... ok
test config::tests::only_the_last_extension_is_replaced ... ok
test config::tests::a_file_with_no_extension_gets_one ... ok
test config::tests::any_extension_is_replaced_not_only_json ... ok

test result: ok. 5 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out

running 0 tests

test result: ok. 0 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out

   Doc-tests postres

running 1 test
test src\config.rs - config::Config::new (line 30) ... ok

test result: ok. 1 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out
```

All green. And look at the bottom: `Doc-tests`, one test, `Config::new`.

*"Wait. The comment ran?"*

The example in it did. That is the doc comment above `new` — look for the `assert_eq!`
between the triple backticks. When we built the skeleton, I promised you that examples in documentation
are compiled and run as tests. Here is the first one, running. The day `Config::new`
stops doing what its documentation says, the build goes red.

And remember the three zeros from that same skeleton, one for the library, one for
the binary and one for the documentation? Two of them just became numbers. The binary
still has zero. What would we test there that clap does not test already?

And `LazyLock`? postres has nothing that needs one any more, and I am not going to keep
one around just to show off.

## Look before you write

So what happened there? A default written too quickly, tests that caught it, a regex
written wrong, and the tests caught that too. Good. But fixing it showed a bigger
problem, at a different level: we were writing code for something the standard
library had already written, tested and documented. The bugs were in the replace and
in the regex. The mistake was reaching for either of them at all.

And that is a mistake anybody can make: me, you, and certainly an agent, which will
happily write forty lines of clever string handling if nobody tells it to look first.

So here is a rule that I think is worth keeping when you write Rust, and even more
when an agent is writing it with you. Before writing code, look for code that already
exists, in this order:

1. **What you already have.** The standard library, the dependencies you are already
   using, and the methods the value you are holding already has. A path is a `Path`,
   not a string.
2. **A well-known crate.** Widely used, widely tested — the way clap was, when postres
   learned to read its command line.
3. **Your own code**, last, and only for what neither of the above does.

And when you catch yourself, or your agent, reaching for string manipulation, a regular
expression or yet another dependency? Stop, and look at the first step again. The
answer is usually there.

That is exactly the road this article took, only backwards. With the rule in hand, you
get to skip it.

And one case I have deliberately not tested: a collection whose name already ends in
`.http`. Its default output is... itself. Today that hurts nobody, because postres
writes nothing. The day it writes, it must refuse, and say why. Can it say that
something went wrong? Not yet. So that case waits for the article that teaches it to.

## Run it

The run that went wrong last time:

```text
$ postres -f exports.json/users.json
converting exports.json/users.json into exports.json/users.http
```

The directory kept its name. And the other two that the replace got wrong:

```text
$ postres -f users.JSON
converting users.JSON into users.http
$ postres -f users
converting users into users.http
```

Neither one would overwrite its collection any more. Want to try it yourself?

```sh
git clone https://github.com/marlon-sousa/postres.git
cd postres
git checkout part-07
cargo test
cargo run -- -f exports.json/users.json
```

## Wrapping it up

We have just made sure the default name is right, and proved it — twice wrong, then
right, with the tests saying so each time. On the way, these are the Rust ideas we met:

1. **`#[test]`** marks a function as a test, and **`cargo test`** finds and runs them
   all. No framework to install: it is built in.
2. **`assert_eq!`** checks that two values are equal, and a failure shows both,
   `left` and `right`.
3. **`mod tests { … }`** is an inline module, and **`use super::*;`** brings in
   everything from the module around it, private items included.
4. **Examples in documentation are tests.** The one above `Config::new` runs with every
   `cargo test`.
5. **`into()`** converts a value into whatever type is expected where it is used, and
   Rust works out which one.
6. **A closure**, `|| …`, is a function with no name, written where it is needed.
7. **`static`** is one value for the whole program, and **`LazyLock`** fills it the
   first time it is used.
8. **`unwrap()`** takes the value out of a `Result` or an `Option`, and stops the
   program if there is none. Fine for what can never fail; wrong for anything from
   outside.
9. **A block gives back the value of its last line**, when that line has no semicolon.
10. **Look before you write**: what you already have, then a well-known crate, then
    your own code.

### The jobs

Building software alone with an agent means doing six jobs that used to belong to six
people. How many did this one do? Three:

- **QA** — the biggest one by far. Five promises written down before touching the
  code, and run four times: one out of five, two, three, then five. Every wrong turn
  was caught by a test, not by a user.
- **Architect** — seeing that the regex was the wrong level: a path problem solved with
  string tools, fixed by the path itself. And the rule that came out of it.
- **Reviewer** — an example in the documentation that can never go stale, because it
  runs.

No product owner and no project manager this time, and nothing for the platform
engineer: the checks we set up at the very beginning now run `cargo test` on three
operating systems, and they did not need touching to do it.

The six jobs are counted in [*The night that produced no
code*](article:the-night-that-produced-no-code), in the series *You are now the whole
team*.

### What Rust solved that would have been a problem elsewhere

- **A regular expression that can fail says so.** In Java, `Pattern.compile` throws
  an unchecked exception on a bad pattern; in Python, `re.compile` raises; in
  JavaScript, `new RegExp` throws. None of them says so in its signature, so nothing
  reminds you. In Rust, `Regex::new` returns a `Result`, and ignoring the failure means
  writing `unwrap` — right there in the code, where a reviewer, or you in six months,
  can see the decision that was made.

### What the language did

It gave us tests without a framework. `#[test]` is part of the language, not a library
we had to choose and configure. And because a module sees everything in the module
around it, private items included, the tests can sit in the same file as the code they
test and reach whatever they need.

## Next time

The name is right, and the tests prove it. But three things in this article deserve a
closer look. We handed code around three different ways — a block, a closure, a
function — and chose between them by instinct. Our five tests say the same thing five
times. And the tests live in the same file as the program, yet never end up in it.
Next time: when to use which, how to turn tests into a table, and why deciding things
*before* the program runs is safer than it sounds.
