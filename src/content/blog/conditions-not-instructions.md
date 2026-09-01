---
title: 'Conditions, not instructions'
description: 'What I actually typed on the first night, and why almost none of it was an instruction. Five moves, quoted from the record — including the ones where I told the agent I did not understand a word of what it had just proposed.'
pubDate: 'Aug 30 2026 21:00'
series: 'you-are-now-the-whole-team'
seriesPart: 5
tags: ['ai engineering', 'ai', 'software engineering', 'rust', 'accessibility']
draft: false
---

[Last time](article:the-night-that-produced-no-code) I showed you an evening that
produced five hundred and forty lines of documentation and no code, and six jobs
being done by one person who did not notice he was switching between them.

And I left a question sitting there, which is the one I would have asked.

Fine. But **what did you type?**

Because "I decided the architecture and wrote it down" describes precisely
nothing. Somewhere in there, a human being had to hold a machine — a machine that
was ready, willing and extremely able to start writing Rust immediately — in a
conversation it was not naturally inclined to have. For three hours. The four
documents are what came *out*. They are not what went in.

So this one is about what goes in.

Two warnings before I start, because I want you to know what you are reading.

The first: I cannot quote that night. As I said last time, the transcript was
swept by a thirty-day retention default before it occurred to me that anybody
would want it. What I have is my own memory of what I did, four documents that
fossilise it, and — this is the part that saves the article — **the same method
on the record in dozens of later sessions that I still have.** So where I am
telling you what I remember, I will say so. Everything in a quotation block with
a date on it is verbatim from a real transcript, both sides, exactly as it
happened.

The second warning: my prompts are ugly. They have typos, they are often two
lines long, and one of them is the single word "drive!". I have not cleaned them
up, and I want to be explicit about why. If I tidied them, this article would
quietly be arguing that the method is *eloquence* — that you get good software out
of an agent by writing beautifully to it. That is not the claim. Not remotely.

## First, the idea that has to go

The word "prompt" has been doing a lot of damage, and here is the shape of it.

A prompt, in the way most people mean it, is an **instruction**. You want a thing;
you describe the thing; the better you describe it, the better the thing you get.
So the skill must be description. Hence prompt engineering, hence lists of magic
phrases, hence "act as a senior architect", hence people getting genuinely upset
that a machine did not do what they meant.

Let's follow that all the way down, because it fails in an interesting way.

If a prompt is an instruction, then a *good* prompt is a complete one. So write a
complete one. Specify the module layout. Specify the error handling. Specify what
happens when the config file is missing, and what the message says, and whether
it saves on change or on close…

And now go back and read [*The gap between what you said and what you
meant*](article:the-gap-between-what-you-said-and-what-you-meant), because we have
arrived exactly where that article ends up. An instruction detailed enough to
remove the agent's judgement is not a prompt any more. **It is source code,
written slowly, in English, in a language that cannot check it.** You have
reinvented programming and made it worse.

Ooops. Calm down. Back up.

The value of the thing is that it extrapolates — that it fills the space between
what you said and what you meant. So the job was never to close that space. The
job, as I put it last time, is to decide **where it should be wide and where it
must be narrow**, in advance.

Which turns out to be a completely different act from instructing. Here is what
it actually looks like.

## Move one: state conditions, not architecture

Here is what I typed on the first night. From memory, but the shape is right,
because the documents that came out of it still carry it.

I said what had to be **true** of the finished thing:

- It has to be compiled.
- If at all possible it ships as **one executable**, because the people who need
  this should not have to assemble a runtime to get a terminal.
- It has to have a frontend.
- I think it should be **Rust** — it is memory-safe by design, so a whole family of
  errors we would otherwise have to be careful about simply cannot happen; it is
  cross-platform; and it is fast.

Now look at what is *not* in that list.

No crates. No module layout. No framework. No file structure. No pattern with a
name. Not one of the things you would find in `ARCHITECTURE.md` twelve hours
later is in there — and `ARCHITECTURE.md` is 600 lines today and still describes
the code.

That is the first move, and it is the one everything else stands on. **A
condition fences the space without choosing inside it.** "One executable" rules
out an Electron app and a Python script with fourteen dependencies, and it does
not tell anybody which crate to reach for. "Memory-safe by design" is a property I
can hold the result to. "Use Rust" would have been an instruction; "it must not
be possible to use memory after freeing it, so I think Rust" is a condition with
its reason attached, and the reason is the part that keeps working when the
question changes.

And notice which of the six jobs from last time is being done here, because it is
not the architect. It is the **product owner**, deciding what this thing has to be
for the people who will use it. The architect has not spoken yet. That is
deliberate: the architecture was the *second* conversation, and it was better for
being second.

> An instruction says what to do. A condition says what must be true when you are
> finished. Only one of those survives being wrong about the details.

## Move two: ask for objections

Then the move that does most of the work, and it is four words long.

I asked the agent whether it had objections or better suggestions.

It went and looked. It came back with alternatives I had not been carrying —
other ways to put a GUI on a Rust program — and, having weighed them, it agreed
that Rust was right for the reasons I gave. Tauri was **its** suggestion, and it
made it for a reason I had not articulated: if the interface is HTML in a WebView,
then on Windows it is exposed to screen readers through the same machinery as a
web page, and we inherit twenty-five years of accessibility work instead of
reinventing it.

I cannot quote that conversation. But it left a fossil, and you can go and read
it. This is `DESIGN.md`, from the commit at 23:58 that night:

> **Decided: Tauri 2.**
>
> Rejected:
>
> - Native Rust GUI (egui, iced, Slint): AccessKit is still too immature for an
>   accessibility-first app.
> - Wry directly: Tauri adds windowing/IPC/packaging on top for free.
> - Dioxus: workable, but plain HTML/JS gives the most direct control over ARIA and
>   focus.

That section is not the answer to "which GUI framework should I use". You do not
get a **Rejected** list by asking for a recommendation; you get one by asking
whether anybody disagrees, and then writing down what was argued. Three
alternatives, each with the specific reason it lost. Nine months from now, when
somebody suggests Dioxus — and somebody will, possibly me, in a session with no
memory of tonight — the answer is on file, along with the thing it would cost.

Here is the same move, on a night I *can* quote. This is 27 August, and I open
the session by bringing two worries and no instruction at all:

> **Me:**
> I want to sort lots of things we should do, and see whether we can do them
> together.
>
> We need to fix 27.4.
>
> But here is a thing that worries me kit a lot:
>
> We are assuming that all wsl is bash to begin it. I think the safest would be
> assuming always non integrated, like ssh, until we offer to install (and the
> user accepts) the snippets which will integrate.
>
> I am also, definitely, unconfortable with how we detect powershell in other
> machines than me. Perhaps a crate exist to help with this, I don't know.
>
> **Please, your thoughts.**

Note "I don't know", which is doing real work, and note that there is no task in
that message at all. The reply started like this:

> **The agent:**
> # Three worries, and they are less separate than they look
>
> I read the WSL adapter, `far_end.rs`, `selection.rs`, `installed.rs` and 27.4's
> entry before answering. One finding reframes two of your three worries, so it
> goes first.
>
> ## The machinery you are asking for already exists — and WSL is already inside it
>
> […] So SSH is **not** more conservative than WSL about integration. Both declare
> optimistically and both are corrected by observation.

I was wrong. It read five files and told me so, in the first thirty seconds, with
the line numbers. That is not an agent failing to follow instructions — there was
no instruction. That is what asking for objections gets you, and it is the whole
reason to ask.

## Move three: "don't do it — tell me how you plan to"

Same night, four hours later. This is my favourite prompt I have ever written,
and it is one sentence:

> **Me, 27 August:**
> I want to do powershell recognition. **Don't do it, tell me instead how are you
> planning to recognize** what are the installed versions

Take that apart, because it is small and it is load-bearing.

It names the work. It then explicitly withholds permission to do the work. And it
asks for the plan instead — not "what do you think about X", which invites an
essay, but *how are you planning to do this*, which forces the twenty silent
decisions up to the surface before any of them is in a file.

What came back was not an opinion. It was a measurement:

> **The agent:**
> I took one before writing this, because the obvious plan turns out to be wrong
> for half the problem.
>
> […] **The file lies about Windows PowerShell.** `powershell.exe` reports the
> *Windows build*, 10.0.26100 — not 5.1. The registry told the truth earlier […]
> And for pwsh the file *does* tell the truth, but `PowerShellCore\InstalledVersions`
> **does not exist** on your machine.

So the obvious plan — ask the executable what version it is — was dead, and it
was dead because somebody went and looked at this actual machine rather than
recalling how Windows is supposed to work.

I answered with my own plan, and with a request:

> **Me:**
> perfect. Either this, or:
>
> \* inspect path for powershell.exe or pshl.exe (you know that). Kind of the what
> the which command does.
> 2. Found one or more? Check file signatures.
> 3. List thm as options, the ones that are approved.
>
> **It would be good if you looked in the internet if someone else has found a
> reliable way.**

Typos, a bullet list that starts with an asterisk and continues with a 2, and a
research instruction. Eloquence: still not the mechanism.

And then the third answer killed *both* our plans:

> **The agent:**
> # What others actually do — and it contradicts the obvious plan
>
> I looked. Three findings, and one of them is that Microsoft's own guidance is 17
> years stale. […] The PowerShell Team's detection logic post is the canonical
> reference and it is from **2009**. […] its warning is worth quoting exactly:
>
> > *"Depending on any other registry key(s), or version of PowerShell.exe or the
> > location of PowerShell.exe is not guaranteed to work in the long term."*
>
> […] **Windows Terminal does not look at PATH at all.** I read
> `PowershellCoreProfileGenerator.cpp`. It enumerates known roots instead […]

Three plans, three answers, no code. And at that point — and only at that point —
the work is ready to be written down:

> **Me:**
> ok, perfect. Spec this, then give me the prompt so I can create a new session.

Which produced a spec on its own branch, and a handoff prompt for a fresh session
that would arrive knowing none of this. Two fragments of that prompt, because
they show the boundary policing itself:

> The spec is the contract: its nine decisions were agreed in conversation on
> 2026-08-27 and are not to be relitigated silently.

> Four things are already measured on this machine — do not re-measure them, and
> do not design against them from memory, they are written up in the spec.

That is [the toll booth](article:the-gap-between-what-you-said-and-what-you-meant)
and the whole spec-before-code process from last time, arriving as the *output* of
a conversation rather than as a rule imposed on one.

And it landed. That spec became B5.7, merged as pull request #46 two days later:
"what this machine actually has, and who signed it". You can follow the whole
chain — prompt, measurement, research, spec, handoff, merged code — and nowhere in
it did I describe an implementation.

> "Don't do it, tell me how you plan to" is the cheapest sentence in this entire
> series. It costs one round trip and it buys you every decision that would
> otherwise have been taken silently.

## Move four: argue

Now the part I most want you to take away, because it is the one people leave out
when they describe working with agents — and it is the one that makes the whole
thing work.

**I disagree with it. Constantly. In writing. Rudely, sometimes.**

Here are real ones, verbatim, from the record:

> **Me, 19 August:**
> Then I don't understand why we have the shells adapters at all.

> **Me, 26 August:**
> ok. I don't think hidding the edit field is a good thing at all, explain me why.

> **Me, 27 August:**
> why would we take 5 seconds to capture an already formed virtual buffer? It
> makes no sense.

> **Me, 29 August:**
> I can do it, but I cannot understand why. Not even unintegrated sessions lost
> their headers.

> **Me, 23 August:**
> no, this iis way dangerous by now, I want the back ends built by now and then we
> put these optimizations to work safely latter.

> **Me, 31 July:**
> I don't think this is the way te go. We can create a poe dev which we should use
> here, and a poe ci which ci uses, and then commom stuff goes where they need to
> go (e.e poe dev calls poe ci) perhaps.

Look at that last one for a second. `poe dev` is the gate — the one command I
quoted two articles ago as the best sentence in either repository, the thing that
decides what "done" means. **It exists because I disagreed with a proposal and
suggested a different shape.** It was not designed by the agent and it was not
designed by me. It came out of an argument, at half past ten in the morning, in a
sentence with two typos in it.

Now let me show you a full one, both sides, because the *reply* is the point.

Context: we were building a fake shell — a thing that pretends to be PowerShell so
the rest of the system can be tested without one. The agent had just written a
long, careful spec for it. And I did not understand how it fitted with something
we already had:

> **Me, 19 August:**
> Then I don't understand why we have the shells adapters at all.

> **The agent:**
> Fair confusion — and it's worth answering directly, because the answer also
> explains why the fake doesn't need one.
>
> The short version: **`ShellAdapter` is knowledge about a program someone else
> wrote.** The fake needs none of it because we wrote the fake.

One sentence, and my confusion was gone — and it was gone in a way that made the
distinction permanent, because now I have a *test* for whether something belongs
in an adapter: is this knowledge about a program somebody else wrote?

That is what "I don't understand" is for. It is not a complaint, it is not
politeness, and it is certainly not me being difficult. It is an instrument.
Because there are exactly two possible outcomes and both are wins:

- The agent explains it, the explanation is good, and I have understood my own
  system better than I did a minute ago.
- The agent cannot explain it — and then we have found something that was never
  reasoned through, at the only price it will ever be this cheap to find.

The failure mode is the third path, the one where you do not say it. You skim the
long confident explanation, you notice you did not follow the middle part, you
are tired, it is late, and it looks like it knows what it is doing. **A thing you
did not understand and approved anyway is now in your codebase, and it is
indistinguishable from a thing you understood.**

Note also, in that list above, how many of those are not architecture at all.
"This is way dangerous by now, I want the back ends built by now" is not a
technical objection — it is the **project manager** overruling a sequence. "I
don't think hiding the edit field is a good thing" is the **product owner**.
Every one of those roles from last time shows up as a sentence in a chat window,
which is the only place any of them can show up when the team is one person.

## Move five: read it back

One more, and it is the one I would give to somebody who could only take a single
technique away from this article.

This is 17 August, in the screen reader bridge repository, specifying "personas" —
the idea that an agent driving a screen reader should declare who it is pretending
to be. I started by describing not a feature but a *person*:

> **Me:**
> Suppose we are validating a website, as a normal user would do. A normal ser is
> not a screen reader expert. By aria specs, they should be able to navigate using
> arrows, tab. Combos are opened and closed with alt + down or up arrow, items
> selected with arrows. Checkboxes are checked with spaces, edit fields are filed,
> radio buttons are selected with arrows. First letter navigation, focus and
> navigation mode, first letter navigation, that's all.
>
> **If, in this personaa, a say simulate click or object navigation is needed, the
> test must fail**, because the persona isn't supposed to know these commands.
>
> The agend can even suggest as another personaa, but not as that.

That middle sentence is the whole design: a rule with a *failure condition*
attached. Not "the user persona should be realistic" — which is a wish — but "if
it needs a command this person would not know, the test fails", which is
checkable, and which an agent can apply to cases neither of us listed.

And then, several turns later, before agreeing to anything:

> **Me:**
> ok. in general terms here is what I understand you specified:
>
> 1. On connection, one selects a persona with description: normal user, expert,
>    and others.
> 2. All of these profiles will receive a note to access a given resource.
> 3. This resource will have common information […]

I read its specification back to it, in my own words, as a numbered list.

That is not politeness either. That is the only reliable way I know to find the
place where two parties are using the same word for different things — and it
finds it *before* it is a thousand lines of code, which is the entire argument of
this series compressed into one habit. If my summary comes back with a correction
on point three, we just saved a week. If it comes back "yes, exactly", then we
genuinely agree, and I have a numbered list I can hold the result to.

Ordinary life is full of this. You repeat the address back to the taxi driver.
You read the order back at the counter. Nobody thinks either of those is an insult
to a professional.

## The thing that ties all five together

Look at the moves again as a set. State conditions and ask what must be true. Ask
for objections. Refuse to let the work start until you have heard the plan. Say
when you do not understand. Read it back.

Now ask yourself where you have seen that list before.

**That is a conversation with a colleague.** Every single one of those is a thing
a competent engineer does with another competent engineer, and not one of them is
a thing anybody does with a tool. Nobody asks a compiler for objections. Nobody
reads their intent back to a text editor.

I think this is the single most useful frame I have found, and it is why I keep
saying that the roles matter more than the prompts: **the agent is another person
on the team, and you are the rest of it.**

It is worth being precise about how it is and is not like a person, though,
because the differences are exactly where the mechanisms from last time come from.

Like a colleague, it will argue, it has read more than you have, it notices what
you did not, and it will tell you your premise is wrong if you leave room for it
to. Unlike a colleague, it arrives every single morning having forgotten
everything — which is why the knowledge has to live in `CLAUDE.md` and the specs
and the roadmap, rather than in the team's shared memory, because there is no
shared memory. Unlike a colleague, it never gets tired of being asked to justify
itself, so the read-back move that would feel like distrust on the fourth
repetition to a human costs you nothing here. And unlike a colleague — this is the
dangerous one — **it will agree with you when you are wrong, if you let it**,
because agreeing is cheap and it has no stake in the argument.

Which means the disagreement has to be supplied by you. All of it. Every session.
That is the job.

## Which jobs this one was doing

- **Product owner** — the conditions themselves: one executable, memory-safe by
  design, each with its reason attached. And *"I don't think hidding the edit
  field is a good thing at all, explain me why."*
- **Architect** — asking for objections and getting Tauri back, with a
  **Rejected** list and three losing alternatives written down beside it.
- **Project manager** — *"no, this iis way dangerous by now, I want the back ends
  built by now"*: a sequence overruled in one sentence.
- **Platform engineer** — `poe dev` and `poe ci`, which exist because I disagreed
  with a proposal at half past ten in the morning and suggested a different shape.
- **Reviewer** — reading the persona specification back as a numbered list before
  agreeing to any of it.

The six are counted in [*The night that produced no
code*](article:the-night-that-produced-no-code).

## Next time

So that is the method: five moves, none of them longer than a sentence, all of
them happening before there is any code to look at.

And now the fair question, which is the one I would ask if somebody told me all
this. It sounds like a great deal of process for one person working evenings.
Where did the hours actually go? How much of a hundred thousand lines had to
be written twice? And what did an hour a day of this really buy?

Next time, in [*An hour a day*](article:an-hour-a-day), all of that measured
rather than asserted — including the afternoon when a machine that had never
built any of this was ready to work in nine minutes, and I never read an
installation page.
