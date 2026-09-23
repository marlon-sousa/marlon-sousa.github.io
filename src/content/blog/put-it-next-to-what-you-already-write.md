---
title: 'Put it next to what you already write'
description: 'The things you actually like about TypeScript, Java, Python and Go — unions, Optional, streams, lambdas, promises, channels, one command that builds everything — and where every one of them lives in Rust. No complaints in this one. Just the shape of an ordinary working day.'
pubDate: 'Sep 23 2026 09:00'
series: 'rust-beyond-systems'
seriesPart: 2
tags: ['rust', 'software engineering']
draft: false
---

[Last time](article:write-like-typescript-deploy-like-go) I told you about a
corridor where Rust is hype, Rust is hard and Rust would need PhD-level
programmers, and about the bank I built in it having never written a line of the
language before. I finished by claiming that the code looked like ordinary
application code and shipped as a single file — and then showed you not one line
of anything. Cheeky.

So here is the plan for the next two articles, and then we start building
something.

**This one is the nice one.** I am going to take the things you actually like
about the language you already write — and I mean *like*, the features you would
miss on a Monday — and show you where each of them lives over here. Nothing else.
No complaints, no gotchas, no dunking.

**The next one is the bill.** That is where I show you the specific kinds of
failure that stop being possible, and what it costs a language to leave them
possible. That one has teeth, and it has earned them by then.

And then we open an empty directory and write a real program together, which is
what this series is actually for.

## First, so you know who is talking

I want to head something off, because an article like this usually comes from
somebody who thinks everything should be rewritten in Rust, and that is not me. I
can prove it with my own commits.

The MCP server I built this year is **Go**, and I ruled Rust out for it
deliberately. The job is a router — dial a pipe, pump JSON lines, fan out — which
is goroutine-and-channel shaped, and Rust's ownership work buys guarantees that
process simply does not need. The bridge sitting next to it is **Python**, because
it runs inside NVDA's own embedded interpreter and there was never a choice to be
made. I wrote all of that down at the time, including a reason for choosing Go
that I have never seen anybody else write down, in
[*The server is everywhere, a bridge is
somewhere*](article:the-server-is-everywhere-a-bridge-is-somewhere).

So: I like these languages. I choose them. I will choose them again next month.
This is not an argument that you should stop.

It is an argument about what "hard" means. Because when people say a language is
hard, I do not think they usually mean *difficult*. I think they mean
**unfamiliar**. And the lovely thing about unfamiliar is that it is checkable in
an afternoon, by anybody, without asking permission.

Let's check it.

## The things you already know how to do

Every block below is labelled with the language it is written in, so you can take
whichever ones you care about and skip the rest. TypeScript comes first, Python
joins in wherever it says the same thing in a way worth seeing, and Rust is always
last.

### Reaching for somebody else's code

You pull a name in from a path. That is the whole ceremony, in all of them:

```ts
import { readFile } from "node:fs/promises";
import { Request } from "./request";
```

```rust
use std::fs::File;
use crate::request::Request;
```

### Describing some data

An interface, a dataclass, a struct. I genuinely do not think there is much to say
about this one:

```ts
interface Request {
  method: string;
  url: string;
  headers: Record<string, string>;
}
```

```python
@dataclass
class Request:
    method: str
    url: str
    headers: dict[str, str]
```

```rust
struct Request {
    method: String,
    url: String,
    headers: HashMap<String, String>,
}
```

### A value that might not be there

You write `email?: string` and the compiler makes you check before you use it.
Rust spells the same idea `Option<String>`, and the check is a `match` instead of
an `if`:

```ts
function label(u: User): string {
  if (u.email === undefined) return u.name;
  return `${u.name} <${u.email}>`;
}
```

```rust
fn label(u: User) -> String {
    match u.email {
        None => u.name,
        Some(email) => format!("{} <{}>", u.name, email),
    }
}
```

### A thing that is one of several shapes

Here is where I want to stop and pay TypeScript a compliment it does not get often
enough, because discriminated unions are *excellent*. Most languages still do not
have them. If you write them daily, you already think in the shape Rust calls an
enum:

```ts
type Body =
  | { kind: "raw"; text: string }
  | { kind: "form"; fields: Record<string, string> };

function describe(b: Body): string {
  switch (b.kind) {
    case "raw":  return `${b.text.length} characters`;
    case "form": return `${Object.keys(b.fields).length} fields`;
  }
}
```

```rust
enum Body {
    Raw { text: String },
    Form { fields: HashMap<String, String> },
}

fn describe(b: Body) -> String {
    match b {
        Body::Raw { text } => format!("{} characters", text.len()),
        Body::Form { fields } => format!("{} fields", fields.len()),
    }
}
```

Same idea, same instinct, and the one small gift: you do not have to invent a
`kind` field to tell the variants apart. The enum *is* the tag.

### A list, put through a sieve

Python gets to be smug here, and it has earned it. In the others, one extra word
at the end — and in Rust that word is what keeps the whole chain lazy until it
arrives:

```ts
const names = users.filter(u => u.active).map(u => u.name);
```

```python
names = [u.name for u in users if u.active]
```

```rust
let names: Vec<String> = users.into_iter().filter(|u| u.active).map(|u| u.name).collect();
```

### A pile of work, all at once

We ran plenty of this at the bank, and the thing I went looking for on about day
three was sitting right there waiting for me:

```ts
const outcomes = await Promise.allSettled(charges);
```

```python
outcomes = await asyncio.gather(*charges, return_exceptions=True)
```

```rust
let outcomes: Vec<Result<Receipt, ChargeError>> = join_all(charges).await;
```

Three languages, one idea, and look how closely even the *semantics* line up.
Nothing short-circuits, every task runs to the end, and what comes back is every
outcome including the bad ones — which is exactly what `return_exceptions=True` is
doing in the Python and what `Vec<Result<…>>` is saying in the Rust. Wanted the
fail-fast version instead, `Promise.all` or a bare `gather`? That is
`try_join_all`, one word away. (Both of the Rust ones live in the `futures` crate
rather than the standard library, which will mean more after the next article,
when we meet Cargo properly.)

None of that is systems programming. That is a Tuesday.

## Failure, written down where you can see it

Here is one I did not expect to care about as much as I do. First we say what can
go wrong, then we write the function:

```rust
#[derive(thiserror::Error, Debug)]
enum LoadError {
    #[error("could not read the file: {0}")]
    Unreadable(#[from] std::io::Error),
    #[error("that is not a collection: {0}")]
    NotACollection(#[from] serde_json::Error),
}

fn load(path: PathBuf) -> Result<Collection, LoadError> {
    let file = File::open(path)?;
    let collection = serde_json::from_reader(file)?;
    Ok(collection)
}
```

The signature says two things out loud: this can fail, and here is what it fails
*with*. Each `?` means *if that went wrong, stop and hand the problem upwards*.
Three lines of body, no plumbing, and a reader knows the whole story without
opening anything else.

Look closely at those two `?` though, because they are not doing the same thing.
Opening a file fails with one kind of error and parsing JSON fails with another —
the filesystem and the parser have never met and have no reason to agree. `?` is
not magic: what it actually does is convert whatever went wrong into *your* error
type on the way out. Which means you have to say how, and that is the entire job
of those two `#[from]` lines above.

I like this more than I expected to. The set of ways this function can fail is
written down, in one place, in a type — and if I later call something new that
fails in a way I have not accounted for, the program does not compile until I
have decided what that means.

And if you write Go, you have been nodding along for two paragraphs, because **Go
made this call first and made it harder than Rust does.** No exceptions at all,
anywhere. A function that can fail returns its failure as an ordinary value, in
the signature, and you deal with it. On the principle, Go and Rust agree
completely — what follows is a family argument, not a disagreement:

```go
func load(path string) (Collection, error) {
	f, err := os.Open(path)
	if err != nil {
		return Collection{}, fmt.Errorf("could not read the file: %w", err)
	}
	defer f.Close()

	var c Collection
	if err := json.NewDecoder(f).Decode(&c); err != nil {
		return Collection{}, fmt.Errorf("that is not a collection: %w", err)
	}
	return c, nil
}
```

Same program. Same philosophy. Two differences, and only two.

The first is that Go's `error` is an interface, so the signature tells you this
can fail but not *what with*. You find out by asking at run time — `errors.Is`,
`errors.As` — rather than by reading the type. The Rust version names the failures
in the signature, which is what lets a compiler notice, later, that I have stopped
handling one of them.

The second you can see without me pointing at it. `?` is doing the job of
`if err != nil { return …, err }`, one character instead of three lines, twice.

And now the honest part, because Go people have been having this argument for a
decade and they are not wrong. Those three-line blocks show you **every place the
function can leave.** `?` hides an early return inside something that looks like an
ordinary expression, and you have to know it is there. Go considered adding an
operator like `?` and turned it down on purpose: visible control flow was judged
worth the repetition. That is a real trade, argued by serious people, and it did
not go the way it went by accident.

I come down on the other side, and my reason is not about typing less. It is that
when the plumbing shrinks to one character, what is left on the screen is the
three things the function actually does — open, decode, return — and I can see the
shape of the work rather than the shape of the error handling. That is worth a
little hidden control flow to me. It may not be to you, and the good news is that
either way you are living in a language where failure is a value with a name,
which is the part that actually mattered.

If you write Java, incidentally, **you tried it first.** `throws IOException` in a
signature is exactly this instinct: failure is part of what a method promises, not
weather that happens to it. I think checked exceptions get a rougher ride than they
deserve. They were right about the most important thing, and the industry mostly
concluded otherwise.

## A signature that tells you whether your data survived

This one I did not know I wanted until I had it. Ask yourself, in the language you
use now: when you hand an object to a function, how do you find out whether it
came back changed?

You read the function. Then you read everything the function calls. There is no
other way, because nothing in the signature is obliged to tell you.

Here, the signature is the answer and there is no second place to look:

```rust
fn add_trace(r: Request) -> Request {
    r.headers.insert("X-Trace".into(), "abc".into());
    //       ^ cannot borrow `r.headers` as mutable,
    //         as `r` is not declared as mutable
    r
}
```

That does not compile. That comment is not my summary of the problem either — it
is what the compiler actually prints, and underneath it prints the fix, which is
one word in the signature, where everybody can see it:

```rust
fn add_trace(mut r: Request) -> Request {
    r.headers.insert("X-Trace".into(), "abc".into());
    r
}

let req = add_trace(req);
```

So a function that does not say `mut` is a *promise* that it did not touch what
you gave it. Not a convention. Not a review rule somebody has to remember at half
past six. A promise the compiler holds you to.

Notice what we did there, by the way: handed the data over, got it back. You are
wondering whether you really have to do that every time, and the answer is no,
there is a way to lend a value instead of giving it away. That way is the most
interesting idea in this language and it gets an article of its own rather than a
footnote here.

### The same rule, seen from the data

Now look at the same idea from the other end, because this is where it stopped
being a rule I obeyed and became one I liked.

```rust
pub struct Address {
    pub street: String,
}
```

That field is public. Anybody can read it. And there is no such thing as `pub
mut`, because **mutability is not a property of the field at all** — it belongs
to whoever is holding the value:

```rust
let mut a = Address { street: "Rua X".into() };
a.street = "Rua Y".into();      // fine, the owner asked for mut

fn holder(a: Address)  { a.street = "Rua Y".into(); }   // refused
fn borrower(a: &Address) { a.street = "Rua Y".into(); } // refused
```

Same struct. Same public field. Three different answers, depending on who has it
and how.

Every language has a way to freeze a field, and the good ones are genuinely good:
Java's `public final`, or a `record`, which gives you the whole thing — read-only
components, a constructor, equality, printing — with no boilerplate and no Lombok
since Java 16. Python has `@dataclass(frozen=True)`, which raises if you try. Both
work, and I would use both happily.

But notice what they freeze. They freeze **the data**, once, at the point of
declaration: nobody may ever change this, including its owner, for as long as the
program runs. You have to decide that before you know who will need what.

Rust freezes **the holder** instead, and it decides per holder, at every hand-off.
Which means you rarely need the two-type dance — a mutable `Builder` over here, an
immutable `Product` over there — because it is one type, and the permission travels
with the binding rather than with the declaration.

### So where did all the getters go?

Which raises a question, if you come from a language where a class is fields plus a
wall of accessors.

Why do those accessors exist? Honestly, most of the time, for one reason: a public
field can be *written* by anyone, so you make it private and hand out a reader. The
getter's real job is read-only access.

Over here that job is already done by the language, which is why you will open real
Rust crates and find plain `pub` fields everywhere and think somebody forgot to
encapsulate something. They did not.

Getters still earn their place — when you want to keep the representation private
so you can change it later, when a setter has an invariant to defend, when the
value is computed rather than stored. And when you do want them, you do not type
them:

```rust
use getset::{Getters, Setters};

#[derive(Getters, Setters, Default)]
pub struct Account {
    #[getset(get = "pub", set = "pub")]
    holder: String,
    #[getset(get = "pub")]
    balance_cents: i64,
}
```

`holder()`, `set_holder()` and `balance_cents()` now exist, and notice that the
balance has a reader and no writer, which took one word.

### Oh — and you have been using macros for ten minutes

Here is the nice part, and the reason I saved this for the end.

That `#[derive(...)]` is the third one you have seen in this article. There was
`#[derive(Deserialize)]`, which made JSON parse itself into a struct. There was
`#[derive(thiserror::Error)]`, which built an error type with its messages. Now
`#[derive(Getters, Setters)]`, which writes accessors.

They are all the same feature: **a program that reads your struct at compile time
and writes the code you would otherwise have typed.** Not reflection — nothing is
looked up while your program runs. The generated code is compiled into the binary
exactly as if you had written it by hand, and if you are curious you can ask to
see it.

If you write Java, you have met this idea, and you met it as Lombok. The mapping is
almost one to one — `@Getter` and `@Setter` are `getset`, `@Builder` is a crate
called `derive_builder` which we will use for real later on, `@ToString` is
`#[derive(Debug)]`, `@EqualsAndHashCode` is `#[derive(PartialEq, Eq, Hash)]`, and
`@AllArgsConstructor` has no equivalent because there was never a constructor to
write.

The difference is status rather than capability. Lombok is a clever third party
reaching into a compiler that did not plan for it, with all the version anxiety
that implies. Here it is the language, documented, stable, and the same mechanism
the standard library uses on itself. Same good idea, invited in through the front
door.

## Java, which has been walking this way for years

If you write Java, I suspect you have been reading all of the above with a
slightly raised eyebrow, thinking *we have most of this*. You do. And I want to
say so properly, because Java gets written off by people who last looked at it in
2011.

`Optional<T>` is `Option<T>`. Streams are iterators — `filter`, `map`, `collect`,
lazy until a terminal operation, the same design by the same reasoning. Lambdas
are closures. `record` is a struct that also knows how to compare and print
itself. And if you are on a recent JDK, a sealed interface with pattern matching
in `switch` is a tagged union that the compiler can check for completeness, which
is an enum by another name.

Java has been growing in this direction for a decade, deliberately and well.

So what is actually different? One thing, and it is the whole thing: **over here
you do not get to opt out.**

`Optional` exists in Java, and a reference is still a reference. Every parameter
of every method you write is secretly `T | null`, and nobody makes you check, and
by convention you are told not to use `Optional` for parameters anyway. So the
language gives you a beautiful way to say "this might be absent" and then leaves
the most common place you would want to say it uncovered. Streams are optional.
Sealed interfaces are optional. Using them well is a matter of team discipline,
code review, and whether the person who wrote this class in 2016 had read the same
blog posts as you.

In Rust the good version is the only version. `Option<T>` is not a wrapper you may
choose to apply: there is no other way to express a value that might be missing,
so everyone expresses it that way, so every reader can rely on it. There is no
"legacy corner of the codebase written before we agreed on this".

That is not Rust being clever. It is Rust being early — it got to bake in ideas
that Java has had to retrofit onto thirty years of existing code, without breaking
a single line of it. Which, frankly, is the harder engineering problem of the two.

## One command, and it came in the box

Last one, and it is the one that surprises people most.

```text
Cargo.toml
Cargo.lock
```

That is the project. `cargo build` builds it. `cargo test` runs the tests, which
live in the same file as the code they test. `cargo fmt` formats, and you did not
choose a formatter. `cargo clippy` lints, and you did not choose a linter. `cargo
doc` builds documentation from your comments. The compiler version the project
needs is a line in that same file, so a colleague cloning it on a Tuesday gets
your toolchain rather than an argument.

You will still make real decisions — which async runtime, which of three good
crates should own your error type — and those arguments are worth having. They are
just about *your program*. Not one of them is about how to turn the text you wrote
into something that runs.

## The one genuinely new idea

I am not going to pretend the whole language is a translation of things you know.
It is not.

**Ownership** — the rules about who holds a value and for how long — has no
equivalent anywhere in your current life, and lifetimes are its paperwork. It is
real, it is what people bounce off, and this series is going to take its time over
it rather than waving at it now and pretending it is obvious.

Which means I should be straight with you about something, because this is exactly
where these articles could sound like they are selling you something. **I am not
promising that you will never have to think about memory.** You will, and sooner
than you would like.

But be fair to the comparison: *every* language makes you learn how it handles
memory. In JavaScript or TypeScript you learn which things get copied and which
get shared, usually by guessing wrong once. In Java you learn what a reference
really is, and what the heap is, and what a pause costs you at the worst possible
moment. In Python you learn about mutable default arguments, and about `a = b`
not meaning what you assumed. Nobody calls any of that systems programming. It is
just the rent.

Here is the honest difference, and it cuts both ways. In those languages **you can
ship without knowing.** For years. Which sounds wonderful, and is, right up until
the afternoon it is not — because the knowledge still arrives, it just arrives as
an incident, and you collect it one scar at a time as a folklore of gotchas rather
than as a model of anything.

In Rust you cannot ship without knowing. The compiler will not let you. On the
first day that feels like an insult, and it is genuinely the kindest thing about
the language: the same knowledge you were going to acquire anyway, handed to you
in one piece, up front, by a compiler instead of by an outage.

And it is a much smaller set of ideas than it looks from outside. That is what the
rest of this series is for — not a chapter on memory, but a program that keeps
needing a bit more of it, until one day you notice you have the whole model and
nobody sat you down.

What I *am* promising is what stays off the road entirely: you will not write an
allocator, you will not write `unsafe`, and you will not go anywhere near
hardware. Not in this series and, unless you choose to, not in your career.

One last warning so you are not ambushed on the first afternoon: `String` and
`&str` are two different types, and you will meet them immediately. Clone your way
past it and keep moving. We come back and do it properly later, once the reason
they are two types is something you can *feel* rather than something I asserted.

## Next time

That was everything Rust *has* that you would have missed. [*The errors you are
never going to see again*](article:the-errors-you-are-never-going-to-see-again)
goes the other direction: the specific failures that stop being possible,
starting with the most
expensive line in TypeScript, which is also the most expensive line in Python and
in Java wearing different clothes. You have met all of them. Usually at three in
the morning, usually in code that was reviewed and approved by people who knew
exactly what they were doing.
