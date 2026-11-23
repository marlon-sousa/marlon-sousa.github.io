---
title: 'Perhaps one day'
description: 'How compile-outcomes went from "perhaps we do a crate of our own later, one day" to crates.io the same afternoon: a stale build in a home-made test harness, a crate whose maintainer had declined the idea twice and wished somebody would build it, and the questions, most of them ordinary review questions, that turned out to be the design.'
pubDate: 'Nov 23 2026 15:30'
tags: ['rust', 'ai engineering', 'ai', 'software engineering', 'testing']
draft: false
---

How do you test that something does **not** work?

It sounds like a riddle, but it is a real job, and for some libraries it is most of the
job. [snapfit](https://marlon-sousa.com/snapfit-rs/) is one of them. It is dependency
injection for Rust: you declare your application's components as the fields of one
struct, and a macro writes the code that builds them. Much of what it promises is a
refusal. Declare a component that depends on one that does not exist, or two that
depend on each other, and your program must not compile. And not just "not compile": the
compiler has to say why, in a sentence a person understands, pointing at the field that
caused it.

```text
dependency cycle: service_a depends on service_b, which depends on service_a
```

That sentence is a promise, just like a getter returning the right component is a
promise. So it needs a test.

Easy, right? Write the wrong code in a test, and check that it fails...

Ooops. The wrong code does not compile, so the test does not compile, so the whole test
suite does not compile. We have just proved that our suite is broken, which was not quite
the plan.

So the wrong code has to be compiled somewhere else, on its own, and somebody has to read
what the compiler said and hand it back to the test. And since snapfit's promises are
written as Gherkin scenarios, a sentence anyone can read and agree with, whoever wrote the
code behind it, the refusals are scenarios too. Something like this:

```gherkin
Scenario: A user without a name is refused
  Given the snippet "missing_field"
  When it is compiled
  Then it fails with an error that contains "missing field `name`"
```

This is the story of the small library that makes that work, and of the morning it went
from "one day" to crates.io.

## The harness that guessed

Rust has a crate for this, and almost everybody uses it: trybuild, by David Tolnay, the
author of serde and syn. You hand it the files that should fail, it compiles them, and it
compares the compiler's whole output with a file you saved earlier. If they differ, the
test fails.

That last part was our problem. trybuild judges, and it judges the **whole** text. It does
not hand anything back. Our scenarios did not want to compare a screen of compiler output;
they wanted to ask "did it fail, and does the error say *this*, at *that* line?" So we had
written our own harness, which called the compiler directly on each wrong file and kept
what it printed.

One morning, while working on something else entirely, the agent told me this:

> The compile-fail harness links each fixture against the newest `libsnapfit` rlib in
> `target/debug/deps` by modification time. When old builds are still in the target
> directory, two Gherkin scenarios can fail locally against stale macro code.

Hmm. "Newest by modification time." That is a guess. A reasonable one, most days... but a
guess, and our tests were trusting it. I asked:

> is this our implementation or just the way things work? It seems a in house made cache?

> It's our own code. […] Cargo doesn't do any of that, so the staleness comes from our
> harness.

Our own code. Fine. So we fix it... or do we? Before writing a better harness, it seemed
fair to ask whether we needed one at all.

## Can trybuild just give it back?

My first idea was to keep trybuild and work around the judging part:

> Evaluate this: we use tribuild. Because we know ahead of time all our fixtures that should fail, we handle them to trybuild in paralel […] and collect their errors.

The agent went and read trybuild's source, which is the right way to answer a question
about a library, and came back with: no. trybuild has three public functions, everything
runs when its test object is dropped, and a mismatch is a panic. Nothing comes back.

Fine, then somebody must have built the other one:

> isn't there any other crate specializing trybuild to give us back the error instead of hard failing on what we need?

It checked the candidates, trybuild2, ui_test and compiletest_rs. Each of them judges in
its own way, and none hands the errors back as data. But it also found that Cargo itself
can report every compiler message as JSON, and that the `cargo_metadata` crate parses that
JSON into plain Rust structs: the message, the error code, the file, the line, the column.
Already separated. Nothing to search for in a wall of text.

By now I was curious. A crate that everybody uses, and a fork of it, and no way to get the
errors out... Was trybuild abandoned?

> As a curiosity, it seems that either trybuild isn't maintained anymore or its developer isn't queen to new additions, so that a second was creaed?

Not at all. It is very much maintained, with a release the day before. It is simply kept
minimal, on purpose. So, one more question:

> would you check whether issues asking for a try_build instead were already rejected?

They had been, twice, both in 2020. On
[#103](https://github.com/dtolnay/trybuild/issues/103), which asked to check only part of
an error message, almost exactly our need, the answer was "I would prefer not to build
this into this library." And on [#80](https://github.com/dtolnay/trybuild/issues/80), which
proposed a pluggable way of checking results:

> I think I would prefer not to maintain that API as part of this crate, but it would be
> awesome for someone to build it as its own crate (trybuild fork or clean slate).

Which is a perfectly good answer. A maintainer who says no to most things is how a crate
used by almost everybody stays small enough to trust. But keep that last sentence in mind.

I made two more attempts to keep trybuild. Could we fork it? Could we catch the panic?
The panic, it turned out, carries "N of M tests failed" and nothing else; the errors go
straight to the terminal. And a fork would mostly be trybuild's project setup plus a
return value, carried forever against a crate that releases every few weeks.

Then the question that settled it:

> ok. So is that text structured? Or it is json?

JSON, through `cargo_metadata`, and every field already in its place. A step could compare
`message` and `line` directly, and nothing could match by accident. So:

> cargo_netadata. And perhaps we do a crate of our own latter with that idea, one day.

## "One day"

You know what "one day" means. Every engineer has a drawer full of them. *One day* we will
extract that into a library. *One day* we will write the proper docs. *One day* is a polite
word for never, and nobody is lying when they say it. There is a real project waiting, and
a crate of our own means a repository, CI, a README, a release process, a name...
the afternoon is gone, and the week with it.

An hour later I came back to the plan for the new harness, and I found myself asking
questions that did not sound like a harness at all:

> I like what you suggest, but I wouldn't like assertions on this, right? You can perhaps create a no publish crate, so our testing harness calls it? I think it should just return a map of fixture -> result, with result being either succeeded or failed, and alist of errors and warnings? Evaluate

That one sentence, *I wouldn't like assertions on this*, is the whole design of what came
next. The library only reports. It compiles the snippets and says what happened to each
one, and the test, whatever framework it is written in, decides what is right. The agent
agreed, and added a distinction I would have regretted missing: the library itself failing
(Cargo missing, a folder it cannot write) has to be a different kind of answer from "the
snippet failed to compile", or a broken tool could pass as a refusal working as expected.

Then:

> we need to work a better name, and we must not couple, if at all possible, snapfit with it.

Not coupled to snapfit. Named well. Read those two again, because they are not harness
requirements. They are what you ask of something other people will use. The agent proposed
`compile-outcomes`, because it says exactly what you get back and does not promise to test
anything. I asked for `-rs` at the end of the repository's name, to match the others, and
created it:

> There you go.

So *one day* turned out to be about an hour after I said it.

## The questions are the design

Here is the part I want to show you, because it surprised me when I read the conversation
back. I did not write any of the code. The agent wrote it, layer by layer, each layer
checked by an independent reviewer before I saw it. What I did, looking back, was mostly
ask questions. And nearly every question changed something.

> what is the output folder? Is it checked for emptiness or stuff like that?

It was not. The library owns a work folder, and on every run it deleted a `project`
folder inside it and wrote it again. Point it at the wrong place, and it would delete a
folder of yours without looking inside. Now it writes a marker file,
`.owned-by-compile-outcomes`, into every folder it creates, and refuses to touch any folder
holding files it did not write. And the marker that proves ownership is also how you hand a
folder over, so there is one name to remember, not two.

> I need a .cleanTarget() also, to empty target folder to force a clean compilation (you can find a better namming).

It became `.clean_build()`. The reviewer then found that a user's Cargo setting can keep
the compiled dependencies in another folder, so deleting ours would quietly clean nothing.
The fix was to stop deleting things ourselves:

> agree. If cargo can do it, we delegate.

Then normalisation. trybuild rewrites paths in the compiler's output, so a file saved on
Linux matches on Windows. Should we?

> so only the paths, right? For us? It seems so small ...

Small, but every rule you add becomes a promise the moment somebody saves a file that
depends on it. So version 0.1.0 promises the opposite, written into its specification:
what you get back is exactly what the compiler said, untouched. Normalising later, as an
option, breaks nobody. Normalising now, and changing our minds, would.

Then the README, and an example of using it from Gherkin. The agent's first draft ran the
scenarios one at a time. Why?

> Now tell me why it would run one scenarius at a tine, if we can mark multiple fixtures, ask for the compilation, then feed this to world?

> You're right, and your way is better. It's the whole point of the crate.

Its draft compiled each snippet inside its own scenario, so two scenarios running at once
would trip over the same folder. Compile everything once, up front, in one Cargo run, and
each scenario only looks its snippet up. This is that example, as it lives in the
repository today:

```rust
/// Every snippet of tests/ui, compiled once, the first time a scenario asks.
static OUTCOMES: LazyLock<Outcomes> = LazyLock::new(|| {
    let work_dir = Path::new(env!("CARGO_TARGET_TMPDIR")).join("ui");
    let compilation = Compilation::new(Edition::E2021, work_dir)
        .snippets_in("tests/ui")
        .dependency(Dependency::path("my_macros", "."));
    compile(&compilation).expect("the compilation is well described")
});
```

And one step, which is where the judging lives, in your test and not in the library:

```rust
#[then(expr = "it fails with an error that contains {string}")]
fn fails_with(ui: &mut Ui, words: String) {
    let outcome = ui.outcome.expect("the snippet is in tests/ui");
    assert!(outcome.is_failed(), "{outcome:#?}");
    let said = outcome
        .errors()
        .iter()
        .any(|error| error.message.contains(&words));
    assert!(said, "{outcome:#?}");
}
```

None of those questions is clever. Every one of them is something an engineer asks in a
review. That is rather the point.

## The check that found a real bug

One more question, the kind you ask when you have been burnt before:

> We can add a check to verify the example crate, can't we? we would now readme is always correct, and the example crate would be another .feature

So the README's examples became a real crate in the repository, run on every CI platform,
with a check that fails if the README and the files drift apart.

Eight minutes after I asked for that check, it failed. The cause was `rust-cache`, a GitHub
action most Rust projects use to cache their builds. When it saves the cache, it deletes
every file under `target/` but keeps the folders. Our ownership marker is a file. So on the
second CI run, the library found a folder it did not recognise, and refused it. Anybody
who followed our own README, with that cache, would have hit it on their second run.

And here is the honest part. The agent had met the same failure an hour earlier, in its own
scenarios, and said so:

> This is also what our own scenarios hit in layer 4. There I blamed an old cache and
> worked around it in the steps, which was the wrong diagnosis.

A folder holding no files at all, only empty folders, now counts as empty, because nothing
in it can be lost. I asked for one more thing:

> do it, and undo whatever workaround you did, so we see whether it worked.

It worked.

## Three changes of mind

I should be fair to the agent and tell you about my part too.

Should an outcome print itself? A `Display`, so a failing test can show the compiler's text?
The agent thought it was worth having, later, for failure messages only. I said we would
drop the idea. Then I said no, implement it, it gives people the freedom to compare text if
they want to. The agent started. Then:

> hmm, no: we need path normalization otherwize this is going to be useless on multi platform crates.

And in the same minute:

> ok. So we have 0.1.0 as the alpha.1

Three positions in under ten minutes. Was I confused? A little, yes! But look at what each
change cost: nothing. Nothing had been merged, nobody's code depended on it, and the agent
stopped as fast as it started. The idea did not get lost either; it went into the
specification as a later addition, with the path problem written beside it. Changing your
mind used to be expensive enough that we avoided doing it out loud. Here it cost a few
messages.

## By the afternoon

Then it was just the release routine. A first pre-release, on GitHub only. snapfit switched
to it in another thread, ran its whole suite on Linux, macOS and Windows, and needed nothing
changed, so there was no second alpha. Version 0.1.0, identical to the alpha, went to
crates.io before the afternoon was over. Later that afternoon the repository got the
issue-first process the others have, and its releases now publish themselves.

That stale build has a scenario of its own in snapfit now, so it cannot come back quietly:

```gherkin
@regression
Scenario: A fixture keeps its refusal beside a newer snapfit library from another build
  Given a newer snapfit library from another build sits beside the one the suite links to
  And an invalid container fixture "dependency_cycle"
  When the fixture is compiled
  Then compilation should fail with "dependency cycle: service_a depends on service_b, which depends on service_a"
  And the error should point at line 9 of the fixture
```

compile-outcomes has had three more releases since, the newest one able to run clippy
instead of the plain build, so a test can check lints as well as errors. It is
[on crates.io](https://crates.io/crates/compile-outcomes), and the code, the specification
and every pull request are [on GitHub](https://github.com/marlon-sousa/compile-outcomes-rs).

## What stayed with me

Not the speed, although I will not pretend the speed is boring.

What stayed with me is that "one day" used to mean never, because the cost of acting on
an idea was a week we did not have. That cost has collapsed. And when it collapses, what is
left of the work is what was always the valuable part of it: knowing what to ask. Is this
ours? Was this already refused? Should it judge, or only report? Does it touch folders it
does not own? Why one at a time?

None of these needed a genius. They needed an engineer paying attention. Which, I suspect,
is very good news for engineers... don't you think?
