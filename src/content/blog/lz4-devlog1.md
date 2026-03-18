---
title: "LZ4 Rust - Devlog #1"
description: "First steps into an [un]safe, FFI journey"
pubDate: 2026-03-17
---

I always wanted to start my own _'Rewrite it in Rust™️'_ project. However, it
always felt overwhelming to me due not only to its length, but also to the
difficulty of maintaining an aligned implementation in the long run.

That changed when I attended the 2025 edition of
[EuroRust](https://eurorust.eu/). Among dozens of quite interesting talks, the
one given by [Luca Palmieri](https://www.youtube.com/watch?v=XklFGy3aUX4) kept
me thinking about starting this project.

## Rewrite, Optimize, Repeat

We don't want a standalone version of the software at the very beginning of the
project. We want two parts living together, coexisting, interoperating with each
other. A rewrite from scratch is not the solution; replacing isolated modules
until the Rust virus has spread enough to take control of the project is.

This project is not just about writing Rust code. It is about C, ABIs, build
systems, interoperability, memory layouts, and optimizations while keeping an
eye on possible regressions.

## Project choice

Ok, we know what we want to do. The next question is: what is our target? Since
the main purpose of this project is learning, we don't need to find a project
that hasn't been migrated before, or a project that really "needs" it. Also, for
personal interest, if the project has some algorithmic complexity to make the
development fun and full of lessons, that would be nice as well!

We should look for a not-too-large project, assumable by a solo dev during their
side-project hours; with a clear, scoped division into modules to make it easier
to squeeze ourselves into it. We also want it to be well tested and documented
so we do not drift away from the specification.

Given these constraints, and after a quick search, I believe the
[LZ4 compression algorithm](https://lz4.org/) and its official C implementation
are a pretty good candidate. Its
[`lib/`](https://github.com/lz4/lz4/tree/dev/lib) folder, where the core of the
algorithm is located, has just `~7k` LoC, which sounds like quite a feasible
task.

```shell
~/D/P/l/lib dev ◼   via  v17.0.0-clang
❯❯❯ tokei
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 Language              Files        Lines         Code     Comments       Blanks
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 Autoconf                  2           50           40            7            3
 C                         5         8639         6261         1345         1033
 C Header                  6         2569          731         1549          289
 Makefile                  2          324          200           75           49
 Markdown                  2          262            0          194           68
 Visual Studio Pro|        1          182          182            0            0
 Visual Studio Sol|        1           25           25            0            0
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 Total                    19        12051         7439         3170         1442
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

If the project succeeds (success == not getting bored too soon), we could think
about migrating the rest of the codebase, which includes other programs and
utilities.

## Let's start

> [!WIP]
