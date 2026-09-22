---
title: 'The errors you are never going to see again'
description: 'NullPointerException. Cannot read properties of undefined. ConcurrentModificationException. Segmentation fault. A tour of the failures that have nowhere left to happen once the types stop evaporating — and an honest account of the ones that stay.'
pubDate: 'Sep 23 2026 09:00'
series: 'rust-beyond-systems'
seriesPart: 3
tags: ['rust', 'software engineering']
draft: true
---

[Last time](article:put-it-next-to-what-you-already-write) I went through the
things you already like about the language you write — unions, `Optional`,
streams, lambdas, promises, iterator chains, one command that builds everything —
and showed you where each of them lives in Rust. That article had no complaints in
it on purpose.

This one is the other half of the deal. Now we look at what goes *away*, and why
it was there in the first place.

I want to be careful about the tone, because there is a version of this article
that is just a man being rude about other people's languages, and it would be
worthless. Everything below is a consequence of one design decision that every
mainstream language made for perfectly good reasons: **the types are checked
before the program runs, and then they stop existing.** That decision bought
enormous things. It also has a bill, and most of us have been quietly paying it
for our entire careers without itemising it.

Let's itemise it.

## The most expensive line in TypeScript

Here it is. A request arrives, and we take its body:

```ts
interface Address {
  street: string;
  number: number;
  complement: string;
}

const address = JSON.parse(request.body) as Address;
```

Now. What did the compiler check there?

Nothing. It checked nothing at all. `JSON.parse` hands back `any`, and `as
Address` is not a conversion, it is an *assertion* — it is you telling the
compiler to stop asking questions. The program compiles. The editor autocompletes
`address.street` for you, cheerfully, in a nice colour. Review waves it through,
because it looks exactly like typed code. It *is* typed code, in the only sense
the language can offer: the type is a promise you made about a value nobody
looked at.

Then the body turns up with no `number` field. Or with `"number": "42"`, a string,
because the sender is a system written by somebody with the same confidence you
had. Or it is `{"error":"not found"}`, because upstream had a bad afternoon.

What happens? Not a crash. That is the cruel part. Nothing happens, for a while.
`address` is an object of the wrong shape wearing the name `Address`, and it
*travels*. It gets passed to a function that takes an `Address`, which passes it to
another, and the whole chain type-checks perfectly because everybody agreed to
believe the label. The error surfaces somewhere else entirely — a `Cannot read
properties of undefined` four files away, or, much worse, no error at all, a
malformed address written to the database, and a fortnight later a customer who
did not get their card.

And I will say the uncomfortable part out loud: I would bet a good dinner that
most people who write that line believe the shape was validated. It was not. Many
of them have never heard of zod, and why would they? Nothing in the language, the
editor or the linter ever suggested they needed anything else. The code looked
checked.

## The same bug, in three accents

Before anybody enjoys this at TypeScript's expense: it is not a TypeScript
problem. It is what happens in *every* language where the types are gone by the
time the data arrives.

Python, where the hints are famously hints:

```python
@dataclass
class Address:
    street: str
    number: int
    complement: str

address = Address(**json.loads(body))
```

A missing key will at least shout, because the keyword arguments will not match.
But `"number": "42"`? Sails straight through. You are now holding an `Address`
whose `number` is the string `"42"`, with an annotation directly above it saying
`int`, and nothing anywhere will raise the subject until you try to do arithmetic
with it, in another module, on another day.

Java, where you do not even need a cast to get into trouble:

```java
record Address(String street, int number, String complement) {}

Address address = mapper.readValue(body, Address.class);
```

No assertion, no cast, a real class with real types. I ran this one rather than
trusting my memory, against Jackson's current release, and with a body carrying
only a street it printed:

```text
street=Rua X   number=0   complement=null
```

Nothing thrown. Nothing logged. You hold a valid object of the correct class and
it is simply not true, and that `null` now sets off across your program looking
for somewhere to become a `NullPointerException`, which it will find, later, in a
stack trace pointing firmly at the innocent party.

Now — if you write Java for a living, you have been shouting at this page for a
paragraph, because you are fairly sure you have *seen* Jackson refuse a body like
that. You have. I checked that too, and you are right:

```text
FAIL_ON_MISSING_CREATOR_PROPERTIES  -> Missing creator property 'number'
@JsonProperty(required = true)      -> Missing required creator property 'number'
```

It throws beautifully. It names the field. So the language and the library are
not the problem here at all — **the check exists, it works, and it is off unless
somebody turned it on.** And the somebody has to have known to look, on a Tuesday,
before the bug rather than after it.

Which is the whole argument of this section in one example, so let me be precise
about where the line falls. A bare `ObjectMapper` *does* refuse a body containing
a field it does not recognise — genuinely stricter than the TypeScript version,
credit where it is due. But Spring Boot's auto-configured mapper switches that
check off, so in the setup an enormous number of Java services actually run, it
is not there either. Two doors, both closable, both open by default, and the
person who has to close them is you, in a configuration file, against a failure
you have not had yet.

Here is the same thing once more:

```rust
#[derive(Deserialize)]
struct Address {
    street: String,
    number: u32,
    complement: String,
}

fn address_from(body: &str) -> Result<Address, serde_json::Error> {
    let address: Address = serde_json::from_str(body)?;
    Ok(address)
}
```

There is no `as`. There is nowhere to put one. `from_str` either builds an
`Address` or hands back an error naming the field it choked on. No `number`?
Error, at the door. A string where a number was declared? Error, at the door. A
body that is actually an error message from upstream? Error, at the door, before
one line of your logic has run.

And look at the third field, because this is the part I find genuinely beautiful.
If `complement` really is optional — and in an address it usually is — you cannot
shrug. You write `Option<String>`, and from that moment *everybody downstream has
to say what they do when it is missing*. The type stops describing the shape you
were hoping for and starts describing the shape you actually got, and it keeps
describing it, all the way through the program.

In fairness, and this matters: every one of these languages has an answer if you
go looking. zod and io-ts for TypeScript. Pydantic for Python, which is genuinely
lovely. Bean Validation for Java, and a Jackson you can configure to refuse what
it was not given. If you already use one, you already have most of this, and you
should feel good about it.

But look at what you had to do to get there. Know the hole existed. Choose a
library. Install it. Write the shape down a *second* time. Then keep those two
descriptions in step with each other, by hand, forever, with nothing in the world
checking that you did. Over here it is one line on the struct you already wrote,
everybody does it because it is what the ecosystem assumes, and there is no other
road to be on.

That is the difference, and I think it is worth more than every performance
benchmark anybody will ever show you: in one of these languages a type is a
comment that autocompletes. In the other it is a gate.

## Two smaller ones, while we are here

Not every hole is a headline. Two that cost me real afternoons, both children of
the same parent — types that are checked and then discarded.

**The promise that does not survive compilation.** TypeScript lets you mark a field
`readonly`, and it is enforced:

```ts
class Address {
  constructor(public readonly street: string) {}
}

const a = new Address("Rua X");
a.street = "Rua Y";   // error TS2540: Cannot assign to 'street'
                      // because it is a read-only property.
```

Good. Now compile it and run the result:

```text
after compilation, readonly is gone: Rua Y
```

The guarantee was real at your desk and absent in production, which is the
shortest description of the whole problem I can give you. Anything that reaches
your object without passing the type-checker — a library, a cast, an `any`, some
JSON — can write to a field you were promised nobody could write to.

**The variant nobody handled.** Remember the `Body` union from last time? Add a
third shape to it and see who tells you.

TypeScript does, *here*, and deserves the credit: because every branch of that
switch returned a value, the function stops returning a `string` on every path and
you get `TS2366, Function lacks ending return statement`. I ran it to be sure.

Then make the switch *do* something rather than produce something — log it, save
it, dispatch it, which is most switches ever written — and run it again. Silence.
The new shape falls through and nothing says a word. That is what
`default: assertNever(b)` is for, and it works exactly as often as people remember
to write it.

Rust does not care what your `match` is for. A variant you did not handle is a
compile error, in every place, every time, and adding a variant to an enum is
therefore a guided tour of every decision that variant just changed.

## Seven you will recognise without reading them properly

So. Out loud, and I would bet you can finish most of them from the first three
words. The language each one comes from is on the left, because half of the fun
of this list is that everybody thinks their own is the only one on it:

- **Java** — `NullPointerException: Cannot invoke "Address.street()" because "address" is null`
- **C#** — `NullReferenceException: Object reference not set to an instance of an object`
- **JavaScript** — `TypeError: Cannot read properties of undefined (reading 'street')`
- **Python** — `AttributeError: 'NoneType' object has no attribute 'street'`
- **Java again** — `ConcurrentModificationException`
- **Almost anywhere** — `Unhandled exception`, and the process is gone
- **C and C++** — `Segmentation fault`, and you do not even get a sentence

**Not one of those has anywhere to happen in safe Rust.** Not "happens less". Has
nowhere to happen.

And before we go through them: **this is not the list.** It is six that came to
mind, chosen because you have met all six. It is not a catalogue and I am not
going to pretend it is one. We have not gone anywhere near threads, which is a
larger and stranger story than this one and deserves its own article rather than
a bullet. Nothing here about a value used after you gave it away, about a resource
nobody remembered to release, about an integer quietly wrapping round, about two
names for the same data disagreeing on who may write to it. Those are all real,
they are all handled, and they are all somewhere else.

Seven is what fits. Take the list as a sample of a much longer one.

Now notice something about the first four. They are not four bugs. They are **one
bug wearing four uniforms**: something was allowed to be absent, and nobody was
told. Java says it one way, C# another, JavaScript a third, Python a fourth, and
if you have worked in more than one of them you have had the same afternoon in
each and probably never noticed it was the same afternoon. Over here a value that
might be missing is `Option<T>`, and you cannot reach inside it until you have
said, in writing, what happens when there is nothing there.

`ConcurrentModificationException` is modifying a collection while something else
is walking it. The compiler will not let two things hold a collection at once when
one of them can change it. Not a runtime check that throws — a refusal to build.

The unhandled exception is the one that ate my afternoons for years: a failure
with no declared path out of the function, travelling upwards through code that
never mentioned it. Errors here are values in the signature, and `?` is the path,
written down.

And the segfault is my zero byte from the first article, with its whole family —
the use after free, the double free, the pointer to something that is not there
any more. A string knows how long it is. Nothing lets you walk off the end of it.

## The honest part

A list like that invites a fair objection, so let me make it myself.

**Rust can still stop dead.** Index a vector past its end, call `unwrap()` on a
`None`, divide by zero — you get a panic, and your process ends. Anybody who tells
you otherwise is selling something.

The difference is what kind of event that is. A panic is loud, immediate and
*located*: it happens where the mistake is, with a line number, and it does not
hand a quietly corrupted value to code three screens away that will fail much
later for reasons nobody can reconstruct at three in the morning. One of those is
a bug you fix before lunch. The other is the one you remember years afterwards.

**And every logic bug stays.** All of them. Tell the program to charge the wrong
account and it will charge the wrong account, at extremely impressive speed, with
full type safety and no warnings whatsoever. The gap between what you meant and
what you said is not a thing any compiler will ever close.

What has gone is a specific list of ways to be wrong. And the genuinely useful
thing about that list is that it is a *list* — finite, nameable, and now somebody
else's problem.

## And the hours, while we are counting

One more cost, not an error this time. We are starting a project. Shall we?

Bundler first. Vite? webpack? Rollup? esbuild? Parcel? Turbopack? Fine — Vite,
because that is what people use this year. Are we emitting source maps, so that
somebody staring at a stack trace at two in the morning can tell what is going on?
Or are we not shipping a `.js.map` to production, because that is its own argument
with its own strong opinions? Transpiling with `tsc`, Babel or SWC? Tests: Jest?
Vitest? Mocha with Chai bolted to one side and Sinon to the other? The runner that
now ships inside Node itself? Linting, ESLint obviously. Formatting, Prettier
obviously. Unless we use Biome and do both. Package manager: npm, yarn, pnpm, bun?

Prefer Python? Wonderful, let's do it all again. Types: mypy or pyright?
Dependencies: `requirements.txt`, Poetry, Pipenv, PDM, uv, conda? Environments:
venv, virtualenv, pyenv? Linting: pylint, flake8, ruff — and if ruff, does that
replace black, and do we still need isort, or did ruff eat that too? Tests: pytest
or unittest? Task running: make, tox, nox, or a folder of shell scripts nobody
admits to?

Java, then? Maven or Gradle — and if Gradle, the Groovy DSL or the Kotlin one?
Checkstyle, SpotBugs, PMD, or, in the finest tradition, all three with overlapping
rules? JUnit 4 or 5? Lombok, yes or absolutely not, a question that has ended
friendships. And which JDK, from which vendor — Temurin, Corretto, Zulu, Liberica
— installed by sdkman, or jenv, or whatever your Dockerfile happens to say this
week?

Now count how many of those decisions were about the thing you were trying to
build.

Ooops, calm down. None of those tools are bad. Most are excellent, and every one
of them exists because somebody hit a real problem and solved it. But look at what
your first hour went on. Then look forward eighteen months, to the hour you will
spend again when half of those answers have quietly changed underneath you.

You already saw the alternative last time. It was two files.

## So where does that leave us

Before the summary, something I want to say properly rather than in a footnote,
because I have just spent an entire article listing ways that other people's
languages can hurt them, and I know exactly how that reads.

**I write these languages. By choice. This year.**

The MCP server I built is **Go**, and I ruled Rust out for it on purpose — it is a
router, dial a pipe, pump JSON lines, fan out, which is goroutine-and-channel
shaped, and Rust's ownership work buys guarantees that process does not need. I
wrote down every reason at the time, in
[*The server is everywhere, a bridge is
somewhere*](article:the-server-is-everywhere-a-bridge-is-somewhere), including one
about compiler output that I have never seen anybody else write down. The add-ons
I publish for the NVDA screen reader are **Python**, and so is the bridge next to
that server, because it lives inside NVDA's own interpreter — and Python is a
genuine pleasure to write, which is why that comprehension got to be smug at
Rust's expense last time. The frontend of the terminal I am building is
**TypeScript**, and I chose that too, over three native options, for reasons that
had nothing to do with fashion. And I spent years in **C++** on the framework
behind a large bank's internet banking, which is the language that taught me
everything in this article, mostly the hard way.

I have written **Java** as well, and closer to that C++ work than it sounds: the
framework had a bridge in it, and on the other side of the bridge was Java. So I
was not visiting the language, I was living on both banks of the same river.
Nothing like the C++ years in volume, but enough to have opinions — and, as it
turns out, enough to misremember one. Writing the section
above I was certain Jackson refused a body with fields missing, because I have
watched it do exactly that. It does. I had to go and run it to discover that
nobody asks it to by default, which is a small and perfect example of the thing
this whole article is about: I was not wrong about what the tool can do, I was
wrong about what it does when nobody has decided.

None of that is a disclaimer. It is the point. Everything above is a bill I have
personally paid, in languages I picked on purpose and would pick again, and I am
not sneering at anybody's tools from outside. I am telling you what mine cost me.

Right. The summary, and then we are done talking.

Everything you like about the language you write is here. Most of the ways it can
hurt you are not. And the price is one genuinely new idea, which you will spend
about a fortnight being annoyed by and then stop noticing.

That is the entire pitch. I am not going to make it again.

Except for one part, which I have been saving, because it is the reason I am
writing this in 2026 and would not have bothered in 2022.

## Now put an agent in the chair

In the first article I told you that most of what I write these days I do not
type — an agent types it and I review it — and then I promised to come back and do
that properly rather than dropping it and running. Here we are. Because the moment
you put a machine in the writer's chair, everything above stops being a matter of
taste and starts being arithmetic.

Here is what actually changed. **Writing code got cheap. Being sure it is right
did not.** That is the whole of it. The expensive half of our job was never the
typing, and now that the typing costs almost nothing, the other half is not
*relatively* more expensive — it is the entire job.

So ask the only question that matters: after the agent writes something, what
tells it whether the thing is any good?

Count the stations honestly. Syntax — instant, free, everywhere. Types, where your
language has them and where they are still around by the time the data shows up.
Linters — a pile of rules that somebody, at some point, had to choose, install and
configure. Tests — exactly the ones you thought to write, asserting exactly the
places you thought of. Review — a human being, slow, expensive, reading with less
context than the code needs, and now reading far more code than any human was
ever asked to read before.

Now sort those by: runs on every single attempt, in seconds, needs no human, and
hands back something precise enough to act on.

The list gets short very fast.

And this is where the argument lands, because in the language we have been talking
about, **one command answers for a whole category of things that elsewhere are
spread across a linter you configured, a test suite you wrote, and a colleague you
interrupted.** Null. Use after free. Data races. The enum variant nobody handled.
The error nobody dealt with. Not a rule somebody enabled. Not a test somebody
remembered. The build, refusing.

Then the part I find genuinely remarkable to watch: **the agent can close that
loop by itself.** A compiler error is located, precise and mechanical — this line,
this value, this is what is wrong with it. The agent reads it, fixes it, builds
again, and nobody was woken up. Compare that with `Cannot read properties of
undefined (reading 'name')`, which arrives at runtime, in an environment, on a
Thursday, with a stack trace pointing at the innocent party. There is no loop to
close around that. There is only a person, later, doing archaeology.

Which makes the common intuition exactly backwards. You hear it constantly now:
*the model writes the code, so the language matters less than it used to.* No. The
stricter the compiler, the larger the fraction of the machine's work that is
checked before a human ever looks at it — and the more of your attention is freed
for the part no compiler will ever do.

Notice, too, which tests quietly stop being worth writing: the ones that existed
to assert that a class of accident is absent. The null check test. The "what if
this is undefined" test. Those were never about your product. They were
compensating for the language, and you can let them go and keep the ones that are
about behaviour, which are the only ones that were ever interesting.

And here is the scope of the claim, stated precisely, because this is exactly
where people overclaim and get laughed at: for the classes the compiler checks,
the human and the machine both leave the loop, completely. For everything else
they are exactly where they were. Logic bugs stay. Charging the wrong account
stays. The gap between what you meant and what you said stays — and that gap is
the subject of a whole other series of mine, [*The question CTOs are probably not
asking: is our loop closed?*](/series/is-our-loop-closed/), if you want it in
full.

What I am claiming is narrower and, I think, more useful: there is a slice of
"is this code right?" that used to belong to reviewers, to QA and to me at three
in the morning, and it can now belong to a program that runs in seconds, argues
with nobody, and has no opinion about whether it was a human or a model that made
the mistake.

I spent years being the fallback for that slice. My head was the last line of
defence, and one afternoon my head forgot a zero byte and a segment of a bank went
dark.

I am delighted to hand the job over. To either of them.

## Next time

We stop talking about languages and open an empty directory. Why a converter is a
small compiler, why this one gets a library *and* a binary rather than just a
binary, where the modules go, what actually lives in that `Cargo.toml`, and why the
build runs on three operating systems from the first day rather than from the day
it breaks. At the end of it we will have a program that compiles, runs, and does
absolutely nothing — which is a far better place to be than it sounds.
