---
title: 'snapfit 0.3.0 is released, with static dispatch'
date: 2026-11-26
time: '09:32'
project: 'snapfit'
---

A trait can now be dispatched through a `match` instead of a vtable: mark it `#[snapfit::static_dispatch]`, declare `#[static_dispatch_for(PriceRule as Prices)]` on the container, and a field typed `Arc<Prices>` holds one of the implementations the container's fields name, while the services that take it carry no type parameter. `Prices::of(value)` builds any variant for a test, and `extend_static_dispatch` adds stand-ins to the list only when the tests are compiled. A trait with a generic method, which no trait object can hold, can be dispatched this way too. The book's 0.3 edition teaches it, and how to choose between static and dynamic dispatch, in two new chapters.

[The release on GitHub](https://github.com/marlon-sousa/snapfit-rs/releases/tag/v0.3.0) has the notes, and [the book](https://marlon-sousa.com/snapfit-rs/book/v0.3.0/13-static-dispatch/) has an edition for this version.
