---
title: 'What a outline is?'
description: 'Testing the pages by ear. An evening with a screen reader and the example suite turned up what no checker could: an outline nobody had explained, a heading that said Example over a scenario, examples that could mean two different things, and a disabled button that only looked disabled to assistive technology. How the pages were redesigned around a listener, and how the second alpha went out.'
pubDate: 'Nov 17 2026 12:07'
series: 'gherkin-glass-built-in-use'
seriesPart: 8
tags: ['ai engineering', 'ai', 'software engineering', 'accessibility', 'nvda', 'gherkin-glass']
draft: true
---

[Last time](article:a-friend-tried-to-build-the-project) the first people used the
tool while its architecture was still settling: a friend whose pages came up bare
because they were opened from disk, a README rewritten to teach, the first alpha,
and an agent in a real browser that found twelve layout problems an outside tester
had also found. Every reviewer now looks at the pages when a change can alter them.
This time is the other half of that: what I found by listening to them. It is the
part where the product owner, the tester and the accessibility specialist were the
same person, and the only one in the project who could do the job.

## Which command do I run?

On the fourth day, a few hours after the alpha, I wanted to read the example
suite the way a reader would, with [NVDA](https://github.com/nvaccess/nvda), from a local server. My first question was
not about the pages at all:

> which cargo command should I do to serve the samples?

Then I opened the lending feature, and told the agent what I heard, as I heard it:

> olk. I am at http://localhost:8000/lending/borrowing.html ... amd I will tell you what I see, and whether this all makes sense or not.
>
> I see two scenarius, that I can follow ok. Soon after, at the same heading level, I see a outline. What a outline is?

It is a fair question from a reader, and the page had no answer to it. The pages
had been built by agents who know Gherkin's grammar, and they spoke that grammar
back to whoever was reading.

The agent explained it: a scenario outline is one scenario written as a template,
with placeholders in angle brackets, run once for every row of the tables under it.
I listened to the steps again:

> and then you have books and films? but the step say books ...

The outline's steps said "Given the book" and its second table was films. The agent
agreed at once: "that's a mistake in our example suite, not in ghg." A test suite
that every check had passed, with every page pinned byte for byte, had a scenario
that made no sense to a person reading it. Nothing checks meaning.

## Example, or Examples?

Then I reached a rule.

> then, we have a rule. I understand that we have two scenarius, one scenaraius outline, then a rule. The rule structure is way confusing. An example, then one or more backgrounds, and inside I couldn't find the scenarius

The scenarios were there. They were the two headings that said "Example". Gherkin
lets an author write `Example:` instead of `Scenario:`; they mean the same thing.
And it also has `Examples:`, with an s, for the table of data under an outline. Two
completely different things, one letter apart.

> but how on earth can I know if examples refer to example table, or to a scenarius, in gherkin?

The agent answered from Gherkin's own language file, and then checked what it had
quoted from memory against the version our parser uses, and said so. The answer was
honest: by one letter, and by where the heading sits. I asked the question that
mattered:

> ok. this is very, very confusing. How do you think a po would deal wth this?

Its answer was that most product owners never meet it, because teams pick one word
for each thing and stick to it. True. But a tool that shows any team's files cannot
count on that team's habits. And a screen reader user does not see where a heading
sits on the page. I hear "Example", and then I hear "Examples", and I have to work
out from context which kind of thing I am in.

## Designing for a listener

What followed was half an hour of designing together, and it is a good example of
what the agent is for in a conversation like this. I proposed; it reasoned with me,
agreed with some of it and argued against the rest; I changed my mind on the way.

First I asked whether Gherkin allows nesting at all. It does not: the grammar is
fixed and flat. Then I proposed a shape:

> no, here is what I an thinking, but see if you agree: a globals block, where ruleless scenarius are grouped, if the file have rules. If not, that's ok. Then a rules, with the rules inside. For scenarius outlines, perhaps we list the example tables first, then backgrounds, then scenarius? Let's reason together

It liked the group, with one change, and argued for keeping the outline's order. I
pushed on why the order mattered to me:

> yes, but we need to offer some flexibility. One looking at two, three tables, hardly will get what is going on. So we have to think in a way of presenting these blocks.

And then I found the shape I wanted, without reordering anything:

> I think now it makes sense, still talking about examples and outlines: if we just put a label after all the steps, like runs with the following examples: and then each example name is a expand colapse, each one containing a the table, it would already solve the problem of understanding. No need to flip the examples before or after the steps

Whether each examples block should then be a heading came up next, and this is the
kind of decision only a screen reader user makes with confidence:

> no, actually. These are not headings, they are list items, where one can navegate with i.

NVDA moves between list items with one key, and between headings with another. Two
tables of data under one outline are not sections of the document; they are items
in a list of runs. Making them headings would put them in the same outline as rules
and scenarios, and a reader jumping by heading would land in data when looking for
the next scenario.

Last, the one-letter problem itself:

> or uyou suggested we name the blocks regardless of the keyword used in the file? That could also work

That is what was built. Every block is labelled by what it is, a scenario, a
background, examples, whatever word the author used, and a short note says when the
file used a different keyword, with a button that explains why. Scenarios outside
any rule are grouped under a heading of their own, "Outside any rule", so that a
file with rules has the same shape from top to bottom.

## Checking the checkboxes

The next morning the pull request with all of it was ready, and its description
carried what every pull request that changes what a page says carries in this
project: a list of checks for a screen reader, as checkboxes, left unticked for me.
I went through them one by one, and they kept finding things.

An empty examples block next to a full one:

> I see two examples: empty One I expand and there is a x table, the other nothing. This is confusing

Unnamed examples, which the page could not tell apart:

> this we need to fix, because it facilitates reading: unnamed examples are exampele 1, example 2 and so on. So it is easier to grasp. Evaluate

A word in the note that I had agreed to the day before and now heard differently:

> The as keyword is confusing. I knew I agreed, but now I see it is confusing.

A label that described the mechanism instead of the meaning:

> This here: Examples as scenarios: Scenario outline ... what does it mean?

And an examples block with nothing in it to run, which I had asked to be shown as a
button that does nothing, disabled. Then a question that matters more than it looks:

> and the button must be disabled also for sighted users, nt only an aria mark, right?

A control can be marked disabled for assistive technology alone, and still look and
behave exactly like every other button to someone looking at the screen. That is an
accessibility bug in the other direction. A disabled control has to be disabled for
everyone.

Every one of those became a fix, pushed to the same pull request while I waited and
checked again. In the afternoon one more:

> almost. Don't you think we can group example and its run simulations together? Instead of first listing all examples, then all simulations?

Each examples block now holds its own runs, one per row, right under its table. The
pull request was merged that afternoon. By then its issue held seventeen recorded
decisions about how outlines and examples are presented, and the behaviour document
had the rules that hold them.

## Nothing checks meaning

Every page in that example suite had passed
[axe-core](https://github.com/dequelabs/axe-core) in both colour schemes, the
keyboard check, the contrast check and a byte-for-byte comparison, every day, all
week. The headings were in order. The lists were real lists. The buttons had names.

And a person using a screen reader could not tell which headings were scenarios.

That is not a failure of the checks. They do exactly what they say. It is a reminder
of what they are for. An automated accessibility check proves the page can be used.
It cannot prove the page makes sense. That takes a person who uses the page the way
it will be used, and for a screen reader, that person was me.

## The second alpha

The rest of the weekend and Monday went into the second alpha, and most of it came
from the same kind of listening:

- a search results page, reached by pressing Enter in the search field, using the
  same combobox, after I had worked out with the agent how a screen reader user moves
  between the field and its results;
- `--only`, which builds a site from a chosen list of files, so I can see exactly
  which feature files a pull request on Itinera's conformance suite changes;
- `ghg serve` stopping cleanly on Control+C, instead of reporting an error;
- a hostile fixture, full of markup and odd characters in feature files, to prove the
  pages show them as text;
- a background shown inside a scenario as the same collapsible block it is at the
  top, collapsed, rather than as a link back up the page.

One process rule changed that weekend too. I found that GitHub's stacks can rebase a
whole stack from its interface after a merge, so I stopped the threads from doing it:

> Please, do not try to rebase next prs, I discovered gh stacks can do it through the ui, so I will merge 125 when it is ready and the rest of the stack downards and ask gh to rebase the stack on next one.

The fewer moving hands on a stack, the fewer surprises.

I tagged `0.1.0-alpha.2` on Monday, a little before one in the afternoon. One
release job waited fifteen minutes for a macOS machine that never came, and
re-running the failed job fixed it. After that, other people read the alphas and
told me what they found, and what they found went into 1.0.0, the version this
series went out with.

## What we learned

1. Read your own product the way its users will, with their tools; the questions you ask there are not the ones you ask in code.
2. An automated accessibility check proves a page can be used; only a person can say it makes sense.
3. A format's grammar is not a reader's vocabulary; label things by what they are.
4. Headings are for structure and list items are for runs of the same thing; a screen reader user feels the difference with every key.
5. Disabled for assistive technology only is a bug; disabled means disabled for everyone.
6. Manual checks as unticked checkboxes on the pull request keep the human part of review visible and specific.

## Which jobs this one was doing

Three, and all three were done by the same pair of ears.

- **Product owner** — "How do you think a po would deal wth this?", the "Outside any
  rule" group, examples as list items rather than headings, blocks named by what they
  are, and `--only` for reading what a pull request changed.
- **QA** — finding books and films in one outline, empty examples next to full ones,
  and a button disabled only for assistive technology.
- **Reviewer** — every unticked screen reader checkbox on the pull request, checked
  by hand and sent back until it held.

No architect, no project manager and no platform engineer to speak of: this was the
week's most human part, and it needed nobody else.

The six are counted in [*The night that produced no code*](article:the-night-that-produced-no-code).

## Next time

The whole week in one view: the cycle, the traps it met, the rule each one left
behind in the repository, what stayed human, and my own estimate of what this would
have cost without agents. That is
[*What traps we could avoid*](article:what-traps-we-could-avoid).
