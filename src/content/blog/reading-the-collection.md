---
title: 'Reading the collection'
description: 'postres reads a Postman collection at last. Seven fields of our own turn into the whole schema, which gets tedious fast, so we use a crate somebody already wrote — I knew it existed, and had sent it fixes. Data with several shapes as enums, two rungs of the ladder in one crate, and the price paid in error messages.'
pubDate: 'Oct 29 2026 12:00'
series: 'rust-beyond-systems'
seriesPart: 14
code: 'postres@part-14'
tags: ['rust', 'software engineering']
draft: false
---

[Last time](article:flattening-and-back) we read a Postman collection in a small example
next to postres, and found it is two things at once: JSON, which is a format, and the
Postman schema, which is what the JSON means. serde sits in the middle, `serde_json`
reads the format, and a derive writes, at compile time, the code that fills our own
types; seven fields were enough to find our way around the sample.

This time postres reads the collection itself. Seven fields will not do for that, so we
set out to write the rest — and find out how long it takes to get bored.

## Seven fields, and then the rest

Here is where we left the request:

```rust
#[derive(Debug, Deserialize)]
struct Request {
    method: Option<String>,
}
```

A converter that writes requests needs a bit more than the method. The URL, to begin
with. Easy:

```rust
url: Option<String>,
```

...Or not? Look at the sample: `"url": { "raw": "{{baseUrl}}/users?page=1" }`. That is
an object, not a string. And the schema says a URL may be *either*: a plain string, or
an object with its parts broken down. One field, two shapes.

Rust has a tool for "one of several shapes", and we met it
[with `Option`](article:optional-for-the-user-not-for-us): an enum, each variant
carrying its own data. So:

```rust
#[derive(Debug, Deserialize)]
#[serde(untagged)]
enum Url {
    Text(String),
    Parts(UrlParts),
}
```

*"`untagged`?"*

An enum in Rust always knows which variant it is. In JSON, nothing says so: there is no
field called `"kind": "text"` next to the URL. So the sticky note tells serde there is
no tag to look for, and to try each variant in turn: does it fit as a `String`? Then it
is `Text`. If not, does it fit as a `UrlParts`? Then it is `Parts`. The first one that
fits wins.

And `UrlParts`? Protocol, host, port, path, query, hash, variables... Let's start:

```rust
#[derive(Debug, Deserialize)]
struct UrlParts {
    raw: Option<String>,
    protocol: Option<String>,
    host: Option<Host>,
    port: Option<String>,
}
```

`Host`. Hmm. The host is... also a string or a list. Another enum. And the path? A
string, or a list of things that are each a string or an object. The query is a list of
parameters, each with a key, a value, a description that is a string or an object, and
a flag that says whether it is switched off. Then the headers. Then the body, in five
modes: raw, URL-encoded, form data, a file, GraphQL. Form data whose `src` may be one
file or a list of files. Then the authentication, in ten flavours...

And the request itself? I almost forgot: the schema says a whole request may be written
as just a URL, a plain string. One more enum.

Hmm. This is getting tedious. Somebody should have written all of this already.

Did they? Yes. And I have a confession: I cheated. I knew they had, before we wrote the
first of our seven fields. The crate is called `postman_collection`, and I know it
because I used it years ago, ran into a collection it could not read, and reported it.
Then I sent the fix — form data whose `src` is either one file or a list, the very case
in the list above — and it was merged. A later fix of mine, for GraphQL bodies, was
carried forward into the crate by its maintainer this year.

So why the seven fields? Because writing them is how you find out what a crate like this
saves you. Now we know.

## What a whole schema looks like

The crate writes down all hundred and fifty fields, with the same tools we used: structs,
`Option`, `Vec`, and serde's derive. Here is the top of a v2.1 collection, as the crate
has it, with the documentation comments trimmed:

```rust
#[derive(Clone, Debug, Deserialize, Serialize, PartialEq, Default)]
pub struct Spec {
    #[serde(rename = "auth")]
    pub auth: Option<Auth>,

    #[serde(rename = "event")]
    pub event: Option<Vec<Event>>,

    #[serde(rename = "info")]
    pub info: Information,

    #[serde(rename = "item")]
    pub item: Vec<Items>,

    #[serde(rename = "variable")]
    pub variable: Option<Vec<Variable>>,
}
```

Familiar? It is our `Collection`, with more in it. And look at what a collection's
`item` holds: `Items`, plural. That is where the crate did something better than we did:

```rust
#[derive(Clone, Debug, Deserialize, Serialize, PartialEq)]
#[serde(untagged)]
pub enum Items {
    Item(Item),

    ItemGroup(ItemGroup),
}
```

Remember our `Item`, with room for a request *and* a folder's items, each an `Option`,
and a promise that exactly one of them is filled? The crate does not need the promise. An
entry is a request, `Item`, or a folder, `ItemGroup`, and the type says which. A request
in an `ItemGroup`? There is no field to put it in.

And the request written as just a URL, the one we gave up on?

```rust
#[derive(Clone, Debug, Deserialize, Serialize, PartialEq)]
#[serde(untagged)]
pub enum RequestUnion {
    RequestClass(RequestClass),

    String(String),
}
```

There it is: the whole request, or a string.

## Which version?

There is one more thing the crate does that we never thought about. Postman has had
three versions of this format: 1.0, 2.0 and 2.1. Which one is a file in?

The answer is in the file — `info.schema`, a URL with the version in it. But to read it,
you have to read the file first, and to read the file into types, you have to know which
types. So the crate does both rungs of last time's ladder, one after the other. First it
reads the text into a `serde_json::Value`, the tree that knows only the format, and
looks up the schema URL in it. Then it reads that same tree into the types for that
version, and hands back one of three variants:

```rust
pub enum PostmanCollection {
    V1_0_0(v1_0_0::Spec),
    V2_0_0(v2_0_0::Spec),
    V2_1_0(v2_1_0::Spec),
}
```

An enum again: one collection, three possible shapes, and the type says which.

## postres reads

One line in the manifest, and this time under `[dependencies]`, because postres itself
uses it:

```toml include="postres@part-14:Cargo.toml#postman"
```

Before adding it I checked one more thing: the crate says it needs Rust 1.85 or newer,
which is exactly what postres promises in its own `rust-version`. A dependency that asked
for more would have broken that promise for everybody who builds postres.

Then the Postman side of postres, in `postman.rs`:

```rust include="postres@part-14:src/postman.rs#collection"
```

*"`pub use`? And `as`?"*

`use` brings a name into scope, as we have done since the start. `pub use` also hands it
on: anybody who uses the `postman` module can name it too, as if it were defined there.
And `as` gives it a new name on the way. The crate calls it `Spec`; inside postres,
`Collection` says what it is.

And the reading:

```rust include="postres@part-14:src/postman.rs#read"
```

`postman_collection::from_str` reads the text, and `expect` takes the collection out of
the `Result` or stops the program — `unwrap` with a message, so the person reading it
knows what went wrong.

`main` calls it with two lines:

```rust include="postres@part-14:src/main.rs#read"
```

`read_to_string` gives us a `String`, and `read_collection` asks for a `&str`, which
`main` hands it as `&text`. Two kinds of text, and a `&` between them. That is the story
of the next part.

Back inside `read_collection`, though, `from_str` did not give us a v2.1 collection. It
gave us a `PostmanCollection` — which is one of three. Which one? postres only
converts v2.1, so before anything else it has to ask, and take out the `Spec` that
version carries.

That calls for the tool I have been promising since [we first saw
it](article:optional-for-the-user-not-for-us), tucked inside `unwrap_or`: `match`.

## One of three

A `match` takes a value, and a list of *arms*. Each arm has a *pattern* on the left of
the `=>`, and on the right, what to do when the value fits it. Rust tries the arms from
the top, and the first one that fits wins.

*"So it is a `switch`."*

A cousin of one. Java's `switch` with arrows, `case GET -> …`, is the closest thing you
know. But look at the first arm:

```rust
PostmanCollection::V2_1_0(spec) => spec,
```

The pattern does not only ask *is it the 2.1 variant?* It opens the variant up, takes out
what it carries, and gives it a name, `spec`, that the right-hand side can use. A
`switch` tells you which case you are in. A `match` hands you what is inside it.

And why may we write `V2_1_0(spec)` there at all? Because the compiler knows what
`collection` is: a `PostmanCollection`, which is an enum. An enum is matched by its
variants, and each variant is written the way it is built — `PostmanCollection::V2_1_0`,
and then, in brackets, a place for what that variant carries. The pattern has the same
shape as the value it is matched against.

That is the general rule. Which patterns you may write depends on the type of the value
you are matching, and Rust has a kind of pattern for everything that can be matched:

- **numbers, letters, `true` and `false`**: the values themselves — `0`, `'y'`, `true` —
  and ranges of them, like `1..=3`, one to three with both ends included;
- **enums**: their variants, with a place for what each one carries — `V2_1_0(spec)`;
- **structs**: their fields, fixing some and naming others —
  `Info { version: 2, name }`;
- **tuples**, the unnamed pairs and triples, by position — `(0, _)` — the same way
  `let (writer, guard)` [took one apart](article:a-log-that-does-not-block) in our
  logging setup.

And a pattern that does not fit the type is refused. Ask a number whether it is `Some`:

```text
error[E0308]: mismatched types
 --> wrongpat.rs:1:47
  |
1 | fn level(verbose: u8) -> u8 { match verbose { Some(n) => n, _ => 0 } }
  |                                     -------   ^^^^^^^ expected `u8`, found `Option<_>`
  |                                     |
  |                                     this expression has type `u8`
```

A `u8` is never `Some` or `None`, so the compiler does not let you ask. Structs and
tuples we will put to work later; today we need two kinds of pattern: variants, and
plain values.

The second arm:

```rust
other => panic!(…),
```

A pattern that is just a name fits anything at all, and keeps it under that name. It is
the same idea as `_`, which also fits anything, except that `_` throws what it caught
away, and we want to keep it, to say which version it was. `panic!` stops the program
with a message, the way `expect` does. (Stopping the program is not how a finished tool
should fail, and the documentation says so: *saying so properly is still to come*. For
today, it says loudly what was wrong.)

And where does the `spec` go? Remember that in Rust [`if` gives back a
value](article:a-one-character-mistake)? So does `match`: whatever the arm that ran gives
back. The whole `match` is the last line of `read_collection`, so its value is the
function's result. Every arm has to give back the same type, a `Collection`... and
`panic!`? It never gives anything back at all, because the program stops, so the
compiler accepts it in an arm that should give back a `Collection`.

Now the part a `switch` does not do. What if I forget a version? Take away the `other`
arm, and ask the compiler:

```text
error[E0004]: non-exhaustive patterns: `PostmanCollection::V1_0_0(_)` and `PostmanCollection::V2_0_0(_)` not covered
  --> src\postman.rs:25:11
   |
25 |     match collection {
   |           ^^^^^^^^^^ patterns `PostmanCollection::V1_0_0(_)` and `PostmanCollection::V2_0_0(_)` not covered
   |
note: `PostmanCollection` defined here
  --> C:\Users\marlo\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\postman_collection-0.3.1\src\lib.rs:78:1
   |
78 | pub enum PostmanCollection {
   | ^^^^^^^^^^^^^^^^^^^^^^^^^^
...
85 |     V1_0_0(v1_0_0::Spec),
   |     ------ not covered
...
92 |     V2_0_0(v2_0_0::Spec),
   |     ------ not covered
```

It names both versions we left out, and it went into somebody else's crate to show us
where they are defined. A `match` has to cover every possible value, or the program does
not build. The word for it is *exhaustive*.

Which says something about our `other`, too. It covers everything that is not 2.1,
including any version the crate might add one day. That is what we want here: anything
that is not 2.1 is refused. But it is a choice. Without the catch-all, a new version
would be a compile error pointing at this exact line; with it, the new version quietly
joins the refused ones. Catch-alls are convenient, and they are also where a compiler
stops being able to warn you.

### The log level, as a match

[Last time but one](article:a-one-character-mistake), the log level came out of an `if`
with four branches, and I said there was a tool made for exactly that kind of choice.
Here it is, and postres now uses it:

```rust include="postres@part-14:src/main.rs#level"
```

The patterns are plain values: `0`, `1`, `2`. And `_` for everything else. Do we need the
`_`? A `u8` holds zero to 255, and the compiler knows it. Take it away:

```text
error[E0004]: non-exhaustive patterns: `3_u8..=u8::MAX` not covered
  --> src\main.rs:84:11
   |
84 |     match verbose {
   |           ^^^^^^^ pattern `3_u8..=u8::MAX` not covered
```

*"Three up to the maximum, not covered."* It worked out which numbers were left and wrote
them down as a range. Somebody typing `-vvvvv` lands in the `_` arm, and the compiler
made sure there was one.

That is enough `match` to read everything postres does with it for now. Patterns can do a
lot more — open up structs, look inside nested values, add conditions to an arm — and
that gets its own part, when a request body turns out to be one thing with several
shapes.

## What it cost

A crate that knows the whole schema reads collections ours could not. Did we give
anything up? I put the same broken collections through it.

A file cut in the middle:

```text
not a Postman collection: Json(Error("EOF while parsing a list", line: 1, column: 119))
```

As before: the JSON itself is broken, and it says where. A collection name that is a
number:

```text
not a Postman collection: Json(Error("invalid type: integer `42`, expected a string", line: 0, column: 0))
```

Line zero, column zero? There is no line zero. Remember the two rungs: by the time the
crate reads the tree into types, the text is gone. The tree knows what is in it, but not
where it was in the file, so the position is lost. Our seven fields, read straight from
the text, said `line: 1, column: 22`.

A request whose method is a number:

```text
not a Postman collection: Json(Error("data did not match any variant of untagged enum Items", line: 0, column: 0))
```

That one is the price of `untagged`. serde tried the entry as a request, and it did not
fit; as a folder, and it did not fit either. Which of the two failures should it report?
It cannot know which one you meant, so it reports neither. I tried our own `Url` enum,
read straight from text, with a number for a URL: it kept its position, and said exactly
the same thing, *"data did not match any variant of untagged enum Url"*.

So that is the deal. A complete model, and requests written as a bare URL, in exchange
for error messages that sometimes cannot say where, or what. For a converter whose input
is a file Postman exported, I take that deal. When the error says nothing useful, a
person can still open the file. When the converter refuses a valid collection, nobody
can do anything.

## Run it

```text
$ postres -f samples/users.json -v
2026-10-28T21:25:23.555771Z  INFO postres: converting source=samples/users.json dest=samples/users.http
2026-10-28T21:25:23.557202Z  INFO postres: read name=Users API items=3
```

Three items at the top: the two folders and the health check. A collection written by
hand, with a request that is just a URL, reads without a word. And a collection in the
older 2.0 format:

```text
thread 'main' (11896) panicked at src\postman.rs:27:18:
postres converts v2.1 collections, and this one is V2_0_0
```

Honest. Ugly, but honest.

```sh
git clone https://github.com/marlon-sousa/postres.git
cd postres
git checkout part-14
cargo run -- -f samples/users.json -v
cargo test
```

## Wrapping it up

postres reads a collection, with a crate that knows the whole schema, after we found out
by hand why we wanted one. These are the Rust ideas we met:

1. **`#[serde(untagged)]` reads data with several shapes into an enum**: no tag in the
   data, so serde tries each variant in order, and the first that fits wins.
2. **An enum can replace a promise**: an entry that is a request *or* a folder is two
   variants, not two `Option`s of which exactly one is filled.
3. **`pub use` re-exports a name**, and **`as` renames it** on the way in.
4. **`match` picks the first arm whose pattern fits**, and gives back that arm's value,
   so a whole `match` can be a function's result.
5. **A pattern can open a variant up**: `V2_1_0(spec)` takes out what the variant carries
   and names it.
6. **A name as a pattern catches whatever is left, and keeps it**; `_` catches it and
   throws it away.
7. **A `match` must be exhaustive**: leave a variant out, or a range of numbers, and the
   compiler names what is missing. A catch-all is a choice to stop that check.
8. **`panic!`** stops the program with a message, as `unwrap` and `expect` do; it never
   gives anything back, so it fits in any arm.
9. **A dependency's `rust-version`** has to fit inside your own, or your promise breaks.

### The jobs

Building software alone with an agent means doing six jobs that used to belong to six
people. How many did this one do? Five:

- **Product owner** — postres converts v2.1 collections, says so when it is handed
  another version, and accepts requests written as a bare URL.
- **Architect** — a maintained crate over a hundred and fifty fields of our own, with the
  price stated: errors that sometimes lose their position or their reason.
- **Platform engineer** — the crate's `rust-version` checked against postres's before it
  went into the manifest.
- **QA** — the same broken collections put through the new reader, which is how the
  `line: 0, column: 0` turned up before any user saw it.

- **Reviewer** — the four-branch `if` that chose the log level, rewritten as four arms
  of a `match`: the same behaviour, read at a glance, and checked for every count of `-v`.

No project manager this time.

The six jobs are counted in [*The night that produced no
code*](article:the-night-that-produced-no-code), in the series *You are now the whole
team*.

### What the language did

It gave data with several shapes a type of its own. A URL that is text or parts, an entry
that is a request or a folder, a collection in one of three versions: each is an enum,
and the program cannot use one without saying which shape it got — a `match` that
forgets a version does not compile, and the compiler went into somebody else's crate to
name the ones we left out. And with the same
derive we used last time, somebody else's hundred and fifty fields became types we read
with one function call.

## Next time

That `&` in `read_collection(&text)`, and the two kinds of text it sits between. I
promised [right at the start](article:put-it-next-to-what-you-already-write) that
`String` and `&str` would come back once the reason was something you could feel. postres
now holds text read from a file, so it is time: where a `String` lives, where a `&str`
points, and why a folder that holds a list of entries is fine while one that holds a
single entry directly is not.
