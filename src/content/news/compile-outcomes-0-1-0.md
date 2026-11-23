---
title: 'compile-outcomes 0.1.0 is released'
date: 2026-11-17
time: '15:39'
project: 'compile-outcomes'
---

compile-outcomes is on crates.io. It compiles Rust snippets and hands your tests what the compiler said about each one, as data: whether it compiled, and every error and warning with its message, code and location. It judges nothing, so a plain `#[test]` or a Gherkin scenario decides what is right. It was made for libraries that must test what they tell the people who misuse them, such as the compile errors of snapfit's macros, and an alpha of it checked snapfit's compile-fail fixtures on Linux, macOS and Windows before this release.

[The release on GitHub](https://github.com/marlon-sousa/compile-outcomes-rs/releases/tag/v0.1.0) has the notes.
