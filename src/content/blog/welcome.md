---
title: 'Welcome'
description: 'Why this site exists, what I am going to write here, and what I will do if any of it breaks for you.'
pubDate: 'Aug 06 2026 14:00'
tags: ['accessibility', 'writing']
---

I have been writing and talking about technology for over a decade — on BlindTec, on podcasts, at conferences, in other people's publications. This is the first time it lives somewhere I control, including control over whether it is actually accessible.

## Where I am coming from

I am a software engineer. Since 2004 I have mostly worked on systems that move people's money: the internet banking platform at Itaú, an entire core banking stack in Rust for a local bank in the Turks and Caicos, cross-border payments at EBANX. I am also blind, and I write add-ons for the NVDA screen reader, published through the NV Access add-on store.

Those are not two careers. Building software people trust, and building software everyone can actually use, is the same problem walked in from two directions.

If there is a pattern to what I build, it is that I like being one layer down — the framework rather than the screen, the test harness rather than the feature, the add-on rather than the app. That is also what I expect to write about.

## What is coming

Two series are coming.

**Engineering with AI.** Not whether agents can write code — they obviously can — but what it takes to get software from one that professionals can depend on. My argument runs against the popular one: doing this well demands *more* of a single engineer, not less, because you are suddenly the product owner, the project manager, the architect, the platform engineer, the manager and the reviewer at once. Every claim in it is measured against two repositories I built that way, with the numbers attached.

**Rust beyond systems programming.** The case that Rust is a reasonable choice for ordinary software — tools, services, desktop applications — and not only for the systems layer people assume it is reserved for.

In between, single posts on screen reader internals, testing things that were never designed to be tested, and the parts of this profession worth arguing about.

## On accessibility

It would be embarrassing to write about accessibility on an inaccessible site, so this one is deliberately plain: semantic HTML, a skip link, real headings, visible keyboard focus, and no JavaScript needed to read anything. Search and comments use it; the words do not.

It is also checked rather than assumed. Every build runs axe against every page in both light and dark mode, and a separate check proves the colour contrast arithmetic. If either fails, the build fails.

That still will not catch everything. So if something here does not work with your screen reader, your browser or your magnifier, tell me. That is a bug, and I will fix it.
