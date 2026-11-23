---
title: 'snapfit 0.2.0 is released'
date: 2026-11-23
time: '13:49'
project: 'snapfit'
---

A field can now be typed as its trait: `#[singleton(implementation = StripeGateway)] payments: Arc<dyn PaymentGateway>` has the container build `StripeGateway`, while the field, its getter and every service that depends on it see only the trait object, so switching an implementation changes one word. A field whose constructor, builder or factory can fail is marked `fallible = true`, and its container is then built by `try_new()`, which returns an error naming the field that failed. The book's 0.2 edition teaches both, and adds a chapter on testing a service on its own.

[The release on GitHub](https://github.com/marlon-sousa/snapfit-rs/releases/tag/v0.2.0) has the notes, and [the book](https://marlon-sousa.com/snapfit-rs/book/v0.2.0/) has an edition for this version.
