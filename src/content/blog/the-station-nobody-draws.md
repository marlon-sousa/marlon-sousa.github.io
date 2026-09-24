---
title: 'The station nobody draws'
description: 'The loop does not stop at the process. It reaches into the code itself, into the language you chose — and there is one station on the loop that nobody ever bothers to draw, which can take a whole class of mistake away from the human and the agent at the same time.'
pubDate: 'Sep 30 2026'
series: 'is-our-loop-closed'
seriesPart: 5
tags: ['ai engineering', 'ai', 'software engineering', 'rust']
draft: true
---

[Last time](article:the-loop-built-for-real) we went around the loop slowly and
built every station for real: the spec with its conditions written before the
code, the inner loop the agent runs alone while nobody watches, the checkpoint
that is one command, the machine read that happens before the human one, a merge
with a short list of exceptions, and the letters going back to the editor's desk.
Then we put the six jobs one engineer with an agent ends up doing onto the
stations where each of them actually sits.

One station was left out of that walk, on purpose, and it has been waiting since
we [first drew the list](article:the-loop-ran-in-somebodys-head). Before we go
and get it, though, I have to be honest about something I have been leaving out
of this whole series.

## The loop reaches into the code

One more thing before the last station, and I know it makes this longer than I
wanted. There is no way around it. The loop does not stop at the process. It
reaches into the code itself, into the language you chose and the way you wrote
it, and if we are honest about the loop we have to be honest about that too.

Take an interpreted language, and to make it interesting, an untyped one. Now
look at a function like this:

```javascript
function process({ id_nro_sup }) {
  // ...
}
```

What is `id_nro_sup`? Where does it come from? Which objects carry it? Is it a
number or a string, and does anything downstream care? Can it be missing? For the
"human gate", none of this is a problem. They know. They named it, or sat next to
the
person who did, and the whole history of that field lives in their head. Does an
agent know? No. And does a new team member know? Also no, and we have been asking
them to find out the hard way for years. The agent is just the first reader who
cannot be told to go and ask.

"Ah," somebody will say at this point, "but then we would need a linter, or
documentation, or types, because the agents are getting it wrong." Yes. Exactly.
We would. And notice why they are getting it wrong. Not because they are worse
readers than us. Because they are now allowed to touch code that only the "human
gate" used to touch, and they had by memory what nobody else ever had. The agent did
not create the hole. It found it, by walking straight into it.

Now the second example, and this one costs real money. In that same language, a
typo in a field name is not a mistake the build catches. There is no build. The
code is evaluated when it runs, so the typo waits, quietly, until the one path
that reaches it is taken in production, and then it shows up as "cannot read
property x of undefined" at, you guessed it, three in the morning. Can tests catch
it? Yes, if a test walks that exact path. So how big does the test suite have to be
to promise there is no such typo anywhere? Every path. Every branch. Enormous.
And a compiled language, or a typed one with a linter that runs on every save,
would have refused the same typo immediately, in the inner loop, before anybody
was asked to remember anything.

So which languages does a "human gate" prefer? Hard to say. The untyped, unlinted ones do
have a certain appeal when you are the person who remembers, because every hole in
the language is another thing only you can fill. I am not accusing anybody. I am
saying the incentive exists, and that the organisation has a decision to make that
it probably did not know was a decision: do you want agents in safely, or not?
Because the choice of language, and of how strict the tooling around it is, is not
a matter of taste any more. It is a station on the loop.

## The station nobody draws

Now, remember the one I asked you to keep an eye on? *It builds.*

In most of the languages most of us work in, what does this station check? Two
things: that the program is well formed, and that the types line up where the
compiler can see them. And everything else? Walks straight through. A reference
that might be null, and one day is. A collection you are walking while something
else removes from it. A value handed to two threads at the same time, one of them
writing. The compiler shrugs, and the three of them proceed to the next station,
the tests, which can only ask about one place at a time... then to review, where
the context you would need to catch them is not on the screen... then to
production, which will find them for you. At three in the morning, usually.

I was a C++ programmer for many years, and if those years taught me one thing it
is that making these mistakes is *easy*. For beginners? For everybody. I made
them, people I admired made them, and some of them hurt systems and the people
using those systems. Was I careless? No. I was careful. The program was simply
bigger than my head. And remember, back then, my head was the fallback. It was the
station that caught these at three in the morning, because I remembered the code.

So, does an agent make these three mistakes? Of course it does. Because it is
sloppy? No. Not because it is careless, and not more often than we do. It makes
them for exactly the reason we make them: to see that this reference can be null
*here*, you have to hold the whole program in your head, and nobody's head holds
the whole program. Silicon or otherwise. I find that oddly comforting. What is not
comforting is that the agent does not even have the fallback. It will not remember
this code at three in the morning. Nobody will.

What do we do with a class of mistake like that? We have two options.

Option one: chase it downstream, with tests. Write a test for every place a null
could show up, every place a collection is walked, every value that crosses a
thread. Right. How many tests is that? Think about it for a second. If you want to
*claim* that a whole class of mistake is absent, not one instance at one place but
the class, the number is enormous, and when you are done, what have you proved?
That the places you thought of behave. A test shows presence. It never shows the
absence of a *kind* of thing.

Option two: move the whole class *upstream*, into the station that is fast, runs on
every single attempt inside the inner loop, needs no human, remembers nothing
because it needs to remember nothing, and does not argue.

That is what a language with a stricter compiler is, seen from the loop. A harder
language? No. A bigger build station. It takes whole classes of defect, the null
that isn't checked, the use after free, the data race, the error nobody handled,
the enum variant nobody matched, and refuses the program. Before tests. Before
review. Before anybody reads a line. For those classes, and only for those, the
human and the agent both leave the correctness loop, because there is nothing left
for them to check. Do logic bugs stay? Of course they do. The gap between what you
said and what you meant stays. But the three mistakes above, which are hard for a
person and a model for precisely the same reason, stop being anybody's job.
Including mine. After all those years, I will take it.

I have been avoiding the name of the language on purpose. Why? Because the
argument does not depend on it, and because the moment I say it half the room
decides it is not for them. Well, it is Rust. And the next thing I want to show you
is why the half that decided that was told wrong. I was told the same thing. I
believed it for longer than I like to admit.

## Next time

*Write like TypeScript, deploy like Go.* Why Rust's reputation for being hard
belongs to a domain most of us will never set foot in, what it costs to believe it
anyway, and a small program I started in 2022 as a tutorial nobody found, rebuilt
from an empty repository one article at a time, with the compiler reviewing the
agent.
