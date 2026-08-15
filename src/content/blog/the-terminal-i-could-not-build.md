---
title: 'The terminal I could not build'
description: 'The thing I wanted for years and could not afford to build, what it sounds like when a terminal is navigable by heading, and why I still did not start by asking an agent to write it.'
pubDate: 'Aug 13 2026 21:00'
series: 'you-are-now-the-whole-team'
seriesPart: 2
tags: ['ai engineering', 'ai', 'accessibility', 'nvda', 'rust']
draft: false
---

[Last time](/blog/at-long-last-only-an-engineer/) I claimed something unpopular:
that building professional software with an agent asks *more* of you than
building it by hand ever did. That we were always both the engineer and the
bricklayer, because in our trade putting the walls up is itself an
ultra-qualified job and there was nobody cheaper to hand it to. That laying
bricks ate the hours the engineering needed. And that now something else can lay
them — which does not make you less of an engineer, it makes you *only* an
engineer, which is the harder job you never had time to do properly.

That is a belief, and beliefs are cheap. So let me back it the only honest way I
know, which is by showing you the actual work.

Two repositories, on GitHub, with their full history —
[acter](https://github.com/marlon-sousa/acter), an accessible terminal, and
[screen-readers-mcp](https://github.com/marlon-sousa/screen-readers-mcp), the
tool I had to stop and build so that the first one could be tested. Every claim I
make points at something you can go and read: a commit, a document, a CI job, a
conversation.

And about those conversations — one decision first, because it changes what any
of this can prove.

**I am going to show you both sides.** Not just what I typed, which is easy to
curate and makes anyone look clever, but what the machine answered, quoted
exactly. Including the times it was right and I was slow to see it, and the times
it was wrong in a way that sounded completely convincing. My own words are quoted
exactly as I typed them too — typos, missing letters, lowercase and all. They
were written fast, at night, in the middle of doing something else, and cleaning
them up would misrepresent what this actually looks like.

Because here is the thing: the argument I am making lives *in the gap* between
what the machine proposed and what I accepted. If you only see my half, you have
to take my word for it. If you see both halves, you can judge for yourself
whether holding that gap open takes skill.

One more note before we start, in the spirit of not overselling. I am not writing
a methodology here, and I am definitely not in a position to tell anyone the
right way to work with agents — all of this is very new, and every one of us is
still working it out, including the people who have been at it longest. What I
have is one person's record of two real projects, some things that worked, and
some things that got past every mechanism I had built. For very experienced
engineers reading this: I am making simplifications, on purpose, because I am
more interested in the shape of the thing than in exhausting it. Your advice
would be worth more to me than your criticism, but I will take both.

## Something that had been bothering me for years

I use a terminal every day. I am blind, so I use it through a screen reader, and
I have never been happy with how that goes.

Let me explain the problem, because if you are sighted it is easy to miss.

A terminal is a wall of text. That is fine for you — your eye lands on the block
you want, because the shape of the screen tells you where one command ended and
the next began. Blank lines, indentation, colour, position. You are not reading;
you are *looking*, and then reading the small part you looked at.

A screen reader cannot look. It reads. It tells you what is on the line where the
cursor is, and then the next line, and then the next one.

So: you run one command, you hear one answer, everything is fine. Now you want
the output of the command you ran four commands ago. Where is it? It is up there,
somewhere, in a wall of undifferentiated lines with nothing to mark where it
starts. There are no headings, no landmarks, no boundaries. So you arrow up.
Line, line, line, line. Was that the start of it? Line, line. Too far. Down
again.

Every day. For years.

And the annoying part is that the fix is not mysterious at all. Web pages solved
this a long time ago. A web page has headings, and a screen reader user does not
read a web page from the top — they press H and jump, heading to heading, until
they land where they want. It is fast, and it is the single most useful thing
about browsing non-visually.

So what if a terminal session were structured like that? What if every command
you ran became a *heading*, with its output underneath it, and you navigated your
session the way you navigate a page?

That is [acter](https://github.com/marlon-sousa/acter). You type into an edit
field, the result lands in a reviewable buffer, and each command is a level two
heading. Output short enough to listen to gets read to you automatically;
anything bigger gets announced as big and signalled with a beep, so you are
*told* there is a wall of text instead of having it poured over you. One
keystroke drops into real terminal emulation for when you need `nano` or anything
else built on curses.

Let me make that concrete, because "each command is a heading" is one of those
sentences that means nothing at all until you have heard it.

Today, wanting the output of a build I ran a few commands back, I start working my
way back up through the buffer, and my reader gives me this one line at a time, at
whatever speed I have it set to:

> *(blank)*
> `Compiling serde v1.0.219`
> `Compiling proc-macro2 v1.0.95`
> `Compiling unicode-ident v1.0.18`
> *(blank)*
> `warning: unused variable: cx`

Somewhere in there is the boundary between one command and the previous one, and
the only way to find it is to keep going and notice when things stop making sense.

What I wanted instead is this. I press **H** — the same key I press on every web
page, the key my hands already know — and I hear:

> "heading level two, cargo build"

Not far enough. **H** again:

> "heading level two, git status"

There. Down arrow, and I am reading the output of that command, which begins
exactly where the heading said it would.

<figure>
	<picture>
		<source media="(max-width: 720px)" srcset="/diagrams/acter-headings-stacked.svg" width="360" height="632" />
		<img src="/diagrams/acter-headings.svg" alt="" width="720" height="306" loading="lazy" />
	</picture>
	<figcaption>
		The same session twice. Nothing was added and nothing was hidden — the
		command line was already there, in both. All that changed is that it stopped
		being one more line and became a heading.
	</figcaption>
</figure>

That is the entire idea. It is not clever. It is a structure that has existed on
the web for twenty-five years, applied to the one place I spend my working day
where nobody had bothered to apply it.

Rust, Tauri 2 — an HTML frontend over WebView2 — Windows first.

## So why didn't I build it years ago?

Because I could not afford it, and I want to be precise about what that means.

It is not that I did not know how. It is what the thing actually is if you write
it honestly: a terminal emulator, a genuinely accessible interface layered on top
of it, Windows integration, and — the part everybody forgets — some way to *test*
that any of it works. That is not a weekend. That is not ten weekends.

I have a full-time job. I have a family. What I have to spend on this is
evenings, in slices, when I am already tired. The gap between that and what the
project required was simply too wide, and I was not going to ship half an
accessible terminal, because half an accessible terminal is worse than none —
people would try it, it would fail them, and they would conclude the idea does
not work.

So it sat on the list. For years.

What changed is that the coding agents got good enough — the ones I described
last time, that take a task and go away and do it. Not "autocompletes a
function" good. Good enough that one person, working evenings, could credibly
take on something that previously needed a team.

I want to be honest about my motive here, because it colours everything that
follows: **I did not adopt agents because they were interesting. I adopted them
because they were the difference between building this and not building it.** I
am not a neutral observer. I am someone who got something he wanted.

Which is exactly why I am being careful about what I claim.

## One idea to rule them all

So — time to ask the AI to write it!

Well. No.

Not if anyone is going to depend on the result.

And this is the point where I have to stop and explain something properly,
because it is the foundation of everything else I am going to write here, and I
almost never see it explained anywhere. Every single thing about the way I work
with agents — the documents, the specifications, the gates, the arguments at
midnight about where a trait belongs — comes out of one idea.

The idea is called extrapolation, and it is what I want to talk about next, in
[*The gap between what you said and what you
meant*](/blog/the-gap-between-what-you-said-and-what-you-meant/).
