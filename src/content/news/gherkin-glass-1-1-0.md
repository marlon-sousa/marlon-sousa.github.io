---
title: 'Gherkin Glass 1.1.0 is released'
date: 2026-11-24
time: '13:17'
project: 'Gherkin Glass'
---

Gherkin Glass can now leave files of your own in the folder it writes the site into: `--keep-in-output`, or `keep_in_output` in `ghg.toml`, names what a build must not remove, such as `.nojekyll` or `CNAME`, in the syntax of a `.gitignore`. `ghg build --message-format json` reports how a build ended as a JSON object for a program to read, and a build that finds no feature file now writes nothing, says so and succeeds, instead of writing an empty site. There is a binary for Windows on ARM64 as well, which makes six platforms.

[The release on GitHub](https://github.com/marlon-sousa/gherkin-glass/releases/tag/v1.1.0) has the notes, and [the project's site](https://marlon-sousa.com/gherkin-glass/) shows what it makes of an example suite.
