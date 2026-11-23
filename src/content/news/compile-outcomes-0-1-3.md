---
title: 'compile-outcomes 0.1.3 runs clippy too'
date: 2026-11-23
time: '08:36'
project: 'compile-outcomes'
---

compile-outcomes can now compile snippets with `cargo clippy` instead of `cargo build`, reporting clippy's lints as warnings, or as errors for a denied lint, each with the lint as its code. Lint levels are set by group or by name, and clippy lints only the snippets, never their dependencies. Code written for 0.1.2 compiles unchanged.

[The release on GitHub](https://github.com/marlon-sousa/compile-outcomes-rs/releases/tag/v0.1.3) has the notes.
