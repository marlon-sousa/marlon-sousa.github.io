---
title: 'Flattening, and back'
description: 'What serialization is, and why formats that every language can read won over formats only one can. Why a Postman collection is two things at once — JSON, the format, and the schema, what it means — read three ways, with a look at the code serde writes for us at compile time, and at how other languages do the same job while the program runs.'
pubDate: 'Oct 29 2026 12:00'
series: 'rust-beyond-systems'
seriesPart: 13
code: 'postres@part-13'
tags: ['rust', 'software engineering']
draft: false
---

[Last time](article:a-one-character-mistake) we looked at three small choices that make
postres's log polite — standard error, colours only on a terminal, silence unless asked
with `-v` — and at a mistake one character long: `let _` instead of `let _guard`, which
throws away every log line, which the compiler itself suggests, and which one line in
the manifest now refuses.

This time we read a file at last: a Postman collection. Not in postres yet, but in a
small program next to it, because first we need to understand what we are reading. That
takes a word that comes up whenever programs exchange data, serialization: what it is,
why reading JSON is only half the job, and why the job takes two crates rather than one.

## A file, at last

Twelve parts in, and we have never read a file. Shall we fix that?

The first step is the easy one. The standard library reads a whole file into a string:

```rust
let text = fs::read_to_string("samples/users.json");
```

Done! And now we have... a long string that starts with `{`. Here it is, the sample
collection that now lives in postres's repository, trimmed down to what we will talk
about — the real file has more of everything:

```json
{
  "info": {
    "_postman_id": "6c1f0a52-3b7e-4c1d-9a0e-2f5d8b7c4e11",
    "name": "Users API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Users",
      "item": [
        {
          "name": "List users",
          "request": {
            "method": "GET",
            "header": [{ "key": "Accept", "value": "application/json" }],
            "url": { "raw": "{{baseUrl}}/users?page=1" }
          }
        },
        {
          "name": "Create user",
          "event": [{ "listen": "test", "script": { "exec": ["pm.test(…)"] } }],
          "request": {
            "method": "POST",
            "url": { "raw": "{{baseUrl}}/users" }
          }
        }
      ]
    },
    {
      "name": "Health check",
      "request": {
        "method": "GET",
        "url": { "raw": "{{baseUrl}}/health" }
      }
    }
  ],
  "auth": { "type": "bearer" },
  "variable": [{ "key": "baseUrl", "value": "https://api.example.com" }]
}
```

A folder called `Users` with two requests in it, a request on its own, and around them
things like scripts, authentication and variables. We want the collection's name. So we
look for `"name"`, then skip the colon, then the spaces, then the quote, and then read
until the next quote... unless that quote has a backslash before it. Oh, and the first
`"name"` we find might not be the collection's: every request has a name too, and a
request can come first.

Hmm. That is not reading a file. That is guessing at one.

If this sounds familiar, it should. Back in [*Code that
writes code*](article:arguments-without-writing-a-parser) we lined up the ways of getting
JSON into a struct, each one a rung up from the last, like a ladder: walk the characters
yourself; load everything into nested maps; inspect the class while the program runs;
or have a macro write the code. And I promised serde for JSON soon. Soon is now, and
this time we climb that ladder for real, with a real file. What we just did, hunting
for `"name"` character by character, was the first rung — and we have already seen how
far it gets us.

Before we write a single line of it, let's step back and ask what this file actually
*is*, and why it looks the way it does.

## Flattening, and back

Every computer, at bottom, does two things: it keeps data, and it works on data. And it
keeps data in memory in whatever way suits it. How big is a number? How are the bytes of
that number ordered? Where do the letters of a name go, and how does the program find
them again? Different processors answer some of those questions differently. Different
programming languages answer the rest differently again: a Rust struct, a Java object
and a Python dictionary holding the very same request are three different arrangements
of bytes, and none of them means anything to the other two.

That is fine for as long as the data stays inside one program. But the moment two
programs need to exchange it — on two machines, or on the same machine written in two
languages, or the same program today and next year — copying the bytes from memory does
not work. The receiving side would have to arrange its memory exactly like the sending
side, and it almost never does.

So the two sides agree on something else: a *format*. A way of writing the data down, as
a flat row of bytes, that both sides understand. The sender takes what it has in memory,
however it is arranged, and writes it in the format. The receiver reads the format and
builds the same data back up, arranged however *it* likes, as long as the meaning
survives. Postman keeps a collection in memory its own way; we will keep it ours; the
file in between is what lets the two agree.

Writing it down is called *serialization*: putting a value from memory into a series of
bytes. Reading it back and rebuilding the value is *deserialization*. postres only ever
does the second.

### A format for one, or a format for everybody

Which format, then? A language can make one up just for itself. Java did: mark a class
`Serializable`, and Java writes its objects in a format of its own. Here is a request
with three short pieces of text, written that way:

```text
142 bytes
ac ed 00 05 73 72 00 0e 4e 61 74 69 76 65 24 52
....sr..Native$Request...........L..methodt..Ljava/lang/String;L..nameq.~..L..urlq.~..xpt..GETt..Health checkt..https://api.example.com/health
```

The first line of bytes is the start of the file, the second is the whole of it with
anything unprintable shown as a dot. Look at what is in there: the name of the Java class,
`Native$Request`, and Java's own spelling for its string type, `Ljava/lang/String;`. To
read this back, you need to be Java, and to have that same class at hand. A Python
program, a Go service, a browser — none of them can do anything with it.

For a program talking to itself, that may be enough. For anything else, it is the wrong
choice, and the word for what it lacks is *interoperability*: data that any program can
read, whatever it was written in.

That is what the common formats are for. Here is the same request in three of them.
JSON, born in JavaScript and now read everywhere:

```json
{
  "name": "Health check",
  "method": "GET",
  "url": "https://api.example.com/health"
}
```

XML, older, wordier, and still everywhere in enterprise systems:

```xml
<request>
  <name>Health check</name>
  <method>GET</method>
  <url>https://api.example.com/health</url>
</request>
```

And TOML, the format of our own `Cargo.toml`, made for files people write by hand:

```toml
name = "Health check"
method = "GET"
url = "https://api.example.com/health"
```

Three spellings of the same three facts, and none of them says a word about Rust, Java
or any other language. Any program, in any language, can read any of the three.

Postman chose JSON. So a collection, exported, is a JSON file.

### The format, and what it means

Now, here is the part that matters for us. Does "this file is JSON" tell us what is in
it? Not really. JSON says: here is an object, it has a key called `"info"`, and its
value is another object. It says nothing about what `info` *means*. That a collection
has a name. That an item is either a folder or a request. That a folder holds more
items. All of that is the *Postman v2.1 schema*, a document Postman publishes, written
on top of JSON.

Think of a letter. The alphabet and the grammar are the format: anybody who reads
English can read every word. What the letter actually says is something else, and
reading the words is not the same as understanding it.

So reading a collection is two jobs. Read the JSON. Then understand what the JSON says.

## The format, without the meaning

Let's do the first job alone and see how far it gets us. It is the second rung on the
ladder: nested maps.

`serde_json` is the crate everybody uses for JSON in Rust, and it can read any JSON at
all into a general-purpose tree, a `serde_json::Value`: objects, lists, strings and
numbers, exactly as they came, with no idea what any of them mean.

The code for this part is an example next to postres,
`examples/serialization.rs`. It starts by reading the sample with `read_to_string`, as
above, and then:

```rust include="postres@part-13:examples/serialization.rs#value"
```

```text
"Users API"
null
"POST"
```

The first line walks into `info` and takes its `name`. The third walks into the first
entry of the top `item` list, the `Users` folder, then into the second entry of *its*
`item` list, `Create user`, and takes the method of its request: `POST`. Both right.

And the second line is worse than it looks. I typed `nmae` instead of `name`, and what
did I get? An error? No: `null`. A program asking for a field that does not exist gets
an answer that looks just like a field that happens to be empty. And that
`["item"][0]["item"][1]` — which is a folder, and which is a request? The code does not
say. Every place in the program that touches the collection would have to remember the
schema by itself, and get it right, every time.

(The `&` in `from_str(&text)` lets `from_str` look at the text without taking it away
from us. What that really means is a story of its own, and it is coming up shortly.)

The format gave us a memory representation. Of JSON. What we wanted was a memory
representation of a *collection*. So the meaning is still on us, and we have to work out
its specifics ourselves.

## The meaning, as types

Where does meaning go, in Rust? In types. So let's write the schema down as types — or
the part of it we need.

How much is there? I counted: the v2.1 schema has twenty-three definitions and a hundred
and fifty fields, nineteen of them required. Authentication in ten flavours, plus one
for none at all, scripts, proxies, certificates, saved responses, cookies...

How many do we need to find our way around the sample? Seven:

```rust include="postres@part-13:examples/serialization.rs#model"
```

A collection has an `info`, and a list of items. `Vec<Item>` is Rust's growable list,
Java's `ArrayList<Item>`: one type, `Vec`, with the type of what it holds between the
angle brackets, the same as `Option<PathBuf>`.

*"And the `#[serde(rename = "item")]`?"*

Another [sticky note](article:arguments-without-writing-a-parser). Look at the JSON
again: the list of entries is called `item`, in the singular, at the top of the
collection and inside every folder. A field called `item` holding many items would read
strangely in our code, so we call it `items`, and the note tells serde that in the file
it is spelled `item`.

How does Postman tell a folder from a request? Look at the JSON once more: `Users` has
an `item` list and no `request`; `Health check` has a `request` and no `item`. So our
`Item` has room for both, each an `Option`, and in a real collection exactly one of them
is filled. `items` gets the same sticky note as before, for the same reason.

And the name? The schema does not require an item to have one, so our type does not
pretend it does: `Option<String>`, `Some` if the name is in the file and `None` if it is
not. The question of what to do with a nameless item is now written in the type, waiting
for whoever reads it, exactly as [`-o` was](article:optional-for-the-user-not-for-us).
Mistype `nmae` now and you get no `null`: the code does not compile.

So we have the meaning, as types. And we have JSON, as text. Who connects the two?

## serde and serde_json

That is the trick: two crates, each doing one of the two jobs, and neither knowing the
other exists.

```toml include="postres@part-13:Cargo.toml#serde"
```

They go under `[dev-dependencies]`, next to rstest, because only the example uses them:
postres itself does not read a collection yet, and a dependency it does not use has no
business in it.

`serde_json` knows JSON, and nothing else. It reads the text and reports what it finds,
piece by piece: *an object begins; a key, `"info"`; an object begins; a key, `"name"`; a
string, `"Users API"`...*

`serde` knows no format at all. What it has is a small vocabulary that sits in the
middle — maps, lists, strings, numbers, nothing, and a few more, twenty-nine kinds of
thing in all. A format crate like `serde_json` describes what it reads in those words.
A type that implements serde's `Deserialize` trait describes what it needs in those same
words: *I am a map; I need a key called `info`, and its value must be an `Info`; a key
called `item`, and its value must be a list of `Item`s.* serde puts the two
descriptions together, and either the value gets built or one side says what did not
fit.

And who writes `Deserialize` for our structs? Not us. That is the `Deserialize` in
`#[derive(Debug, Deserialize)]`: the teenage cousin from *Code that writes code*, the
macro that reads the struct while the program is being compiled and writes the boring
part for us.

Here is the reading itself:

```rust include="postres@part-13:examples/serialization.rs#types"
```

*"Wait. How does `from_str` know it is supposed to build a `Collection`? We never told
it."*

We did, just not where you were looking: in the type of `collection`. `from_str` can
build anything that implements `Deserialize`, and the compiler works out which one from
what we do with the result. We said the result is a `Collection`, so a `Collection` is
what it builds. Java does the same thing more timidly, when
`List<String> names = Collections.emptyList();` works out the `String` from the left
side.

## What the derive wrote

I said a macro writes that code, and you took my word for it, back in *Code that writes
code*. Shall we look at the homework?

The Rust compiler can show a program with every macro already expanded — written out
as the code the compiler really compiles. I did that for `Info`, the smallest of our
structs: one field, `name`. What did the derive write for it? About a hundred and thirty
lines. You do not want all of them, and neither do I, but eight of them explain most of
this article. Here they are, tidied a little; serde writes every name out in full, and
starts its own with two underscores so they can never clash with ours:

```rust
match __value {
    "name" => Ok(__Field::__field0),
    _ => Ok(__Field::__ignore),
}
```

This is the code that runs for every key the JSON format hands over. It is a `match`,
the same construct we glimpsed inside `unwrap_or`, and it gets a proper introduction
next time; for now, read it as a list of cases. Is the key `"name"`? Then it is our first
field. Anything else? `_`, the same "whatever it is" as ever, and the answer is
`__ignore`.

So that is what happens to `_postman_id`, to the scripts, to the bearer token and to
everything else in the file we did not ask for: read past, and left behind. Not by a
policy looked up somewhere when the program runs, but by one arm of a `match`, written
for this struct, before the program ever ran. The field name is there as plain text,
compiled into the program like any other string, so there is nothing to look up and
nothing to inspect. (If you ever want unknown fields refused instead, that is one more
sticky note on the struct, `#[serde(deny_unknown_fields)]`.)

A little further down, the same code keeps track of what it has seen. If the map ends
and there was no `name`, it reports `missing_field("name")`. And if `name` turns up a
second time, it reports `duplicate_field("name")`:

```text
Err(Error("duplicate field `name`", line: 1, column: 29))
```

I would not have thought of that one. Somebody did, once, and now every struct that
derives `Deserialize` gets it.

And what if a struct does not derive `Deserialize` at all? Then it cannot be read, and
the program does not compile:

```text
error[E0277]: the trait bound `Info: serde::Deserialize<'de>` is not satisfied
    --> src\bin\noderive.rs:4:22
     |
   4 |     let info: Info = serde_json::from_str(r#"{ "name": "Users API" }"#).unwrap();
     |                      ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ unsatisfied trait bound
     |
help: the trait `serde_core::de::Deserialize<'_>` is not implemented for `Info`
    --> src\bin\noderive.rs:2:1
     |
   2 | pub struct Info { name: String }
     | ^^^^^^^^^^^^^^^
     = note: for local types consider adding `#[derive(serde::Deserialize)]` to your `Info` type
```

(The `r#"…"#` is a *raw* string: text taken exactly as written, inner quotes included,
so JSON can sit in a program without a backslash before every `"`.)

A trait is a set of methods a type promises to have, the way we met it
[with `is_terminal`](article:a-one-character-mistake). `from_str` only accepts types
that implement `Deserialize`, and `Info` no longer does — and the compiler names the
fix. Whether a type can be read is settled while you build, for every type, whether or
not that line ever runs.

## Same struct, another format

*"Why bother with two crates, though? One crate that reads JSON into structs would
do."*

For this example, yes. But remember the three formats from the beginning? Our structs
know nothing about JSON. They only know how to describe themselves in serde's
vocabulary. So any format that speaks that vocabulary can fill them. Here is the same
collection, cut down to the health check, written in TOML:

```rust include="postres@part-13:examples/serialization.rs#toml"
```

And the same `Collection`, not one line changed, read from it with the `toml` crate:

```rust include="postres@part-13:examples/serialization.rs#formats"
```

```text
Collection { info: Info { name: "Users API" }, items: [Item { name: Some("Health check"), items: None, request: Some(Request { method: Some("GET") }) }] }
```

The same value we would get from the JSON. And it works the other way round too:
derive serde's `Serialize` as well, and the same struct flattens itself into either
format.

Any format with a serde crate gets this: YAML, MessagePack, CBOR, and plenty more. Write
the meaning once, and the format becomes a choice made somewhere else. That is the whole
Rust ecosystem's habit: a crate that defines a data type derives `Serialize` and
`Deserialize`, and every format crate, written or still to be written, can read and
write it.

## And everybody else?

Every language that talks to the outside world has to do this job, and they have taken
quite different roads. A quick tour, because it shows what is unusual about Rust's.

**Java**, with Jackson, the library most Java programs use for JSON, reads into classes
by *reflection*: while the program is running, it opens the class, finds its fields,
their names and their types, and fills them in. To be inspected at all, every class has
to carry a description of itself in memory for as long as the program runs, and reading
that description is the slow way round in Java. So Jackson does it once per class, the
first time it meets one, builds a reader from what it found, and keeps that reader too.
Fast after that, yes — on top of a slow mechanism and a warm-up, with the description
and the reader both held in memory.

And because it all happens while the program runs, so do the surprises. I gave Jackson
the two problems serde caught above. The doubled `name`? Out of the box, no complaint at
all; it keeps the second one:

```text
duplicate: Other
```

A class it does not know how to build — no empty constructor, nothing telling it which
other one to call? It compiles without a word, and fails when that line runs:

```text
MismatchedInputException: Cannot construct instance of `Runtime$Sealed` (although at least one Creator exists): cannot deserialize from Object value (no delegate- or property-based Creator)
```

In a test, if you are lucky. In production, if you are not.

**C#** and **Go** went more or less the same road. Go's `encoding/json` reads a struct's
fields, and the tags that rename them, through its `reflect` package while the program
runs. C#'s `System.Text.Json` uses reflection by default, too, although newer versions
can generate the code at compile time instead, if you ask for it.

**JavaScript** does not convert at all. `JSON.parse` hands back plain objects and arrays,
exactly the tree we got from `serde_json::Value`, and whatever shape arrived is the shape
you have. TypeScript can *say* the result is a `Request`, but its types are gone by the
time the program runs, so nothing checks that it is.

**Python**'s `json` module does the same: dictionaries and lists. Libraries such as
pydantic fill real classes and check them, by reading the class's type hints while the
program runs.

And Rust? The reader for each struct is written at compile time, by the derive, as
ordinary code. Nothing about the struct is described or inspected while the program
runs, nothing warms up, and a type that cannot be read does not build.

## Run it

```sh
git clone https://github.com/marlon-sousa/postres.git
cd postres
git checkout part-13
cargo run --example serialization
```

First the three lines from the JSON tree, with the `null` in the middle. Then the whole
collection as our types, the way `Debug` prints it. Here is the beginning:

```text
Collection {
    info: Info {
        name: "Users API",
    },
    items: [
        Item {
            name: Some(
                "Users",
            ),
            items: Some(
                [
                    Item {
                        name: Some(
                            "List users",
                        ),
                        items: None,
                        request: Some(
                            Request {
                                method: Some(
                                    "GET",
                                ),
                            },
                        ),
                    },
```

The folder, with `Some` items and `None` request. The request inside it, the other way
around. Not a JSON tree any more: a collection. And last, the health check, read from
TOML.

## Wrapping it up

We read a file for the first time, and the file turned out to be two things at once:
JSON, which is a format, and a collection, which is what the JSON means. These are the
Rust ideas we met:

1. **Serialization** writes a value from memory in an agreed format, so that another
   program, arranged however it likes, can **deserialize** it back.
2. **Common formats** — JSON, XML, TOML — are what make data interoperable; a format
   only one language reads is not.
3. **`serde_json::Value`** reads any JSON without understanding it; a missing field is
   a `null`, not an error.
4. **The meaning goes in types**: the part of the schema we need, written as structs,
   with `Option` where the schema says a field may be missing.
5. **`Vec<T>` is the growable list**, Java's `ArrayList<T>`.
6. **serde is the vocabulary in the middle; `serde_json` is one format.**
   `#[derive(Deserialize)]` writes, at compile time, the code that describes a struct in
   that vocabulary, so any format crate can fill it, and `#[derive(Serialize)]` does the
   same in the other direction.
7. **What a derive writes is ordinary code**: for `Deserialize`, a `match` on each key,
   with `_ => __ignore` for the fields nobody asked for, and errors for a field that is
   missing, doubled or the wrong shape.
8. **A trait bound is checked when you build**: `from_str` only takes types that
   implement `Deserialize`, so a type that cannot be read does not compile.
9. **The type you ask for chooses what a generic function builds**: `from_str` builds a
   `Collection` because that is what `collection` is declared to be.
10. **`[dev-dependencies]`** are for tests and examples only, and never reach the
    program itself.

### The jobs

Building software alone with an agent means doing six jobs that used to belong to six
people. How many did this one do? Two:

- **Architect** — the meaning written down as types, instead of read out of a JSON tree
  wherever it is needed; and the new crates kept to `[dev-dependencies]`, so that postres
  carries nothing it does not use yet.
- **QA** — the same two problems, a doubled key and a type that cannot be built, put to
  serde and to Jackson, rather than taking either one's reputation on trust.

No product owner, no project manager, no platform engineer, no reviewer: postres itself
did not change. This one was about understanding the thing before building it in.

The six jobs are counted in [*The night that produced no
code*](article:the-night-that-produced-no-code), in the series *You are now the whole
team*.

### What Rust solved that would have been a problem elsewhere

A typo in a field name. Read through a tree of plain objects — JavaScript's
`JSON.parse`, Python's `json`, or any language's equivalent — `nmae` comes back as
nothing at all, and the program carries on. Read into types, it is a compile error,
because the field the code asks for has to exist.

### What the language did

It let a crate write code for our types at compile time, and let us read what it wrote.
The `derive` on our structs is the whole connection between the collection and every
format serde knows: a `match` per struct, with the field names compiled in, so the
program never inspects itself while it runs. And a trait bound on `from_str` turned
"can this type be read?" from a question answered when the program runs into one
answered by the build.

## Next time

postres reads the collection itself. Seven fields found their way around a sample; a
real collection needs the rest of the hundred and fifty — URLs that are sometimes text
and sometimes objects, requests that are sometimes just a URL, bodies in five different
modes. We start writing them down, and find out how long it takes to get bored.
