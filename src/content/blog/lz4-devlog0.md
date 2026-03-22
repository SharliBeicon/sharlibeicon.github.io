---
title: "LZ4 Rust - Devlog #0"
description: "First steps into an [un]safe, FFI journey"
pubDate: 2026-03-17
---

I always wanted to start my own _'Rewrite it in Rust™️'_ project. However, it
always felt overwhelming to me, not only because of its length but also because
of the difficulty of maintaining an aligned implementation in the long run.

That changed when I attended the 2025 edition of
[EuroRust](https://eurorust.eu/). Among dozens of quite interesting talks, the
one given by [Luca Palmieri](https://www.youtube.com/watch?v=XklFGy3aUX4) got me
thinking about starting this project.

## Rewrite, Optimize, Repeat

We don't want a standalone version of the software at the very beginning of the
project. We want two parts living together, coexisting, and interoperating with
each other. A rewrite from scratch is not the solution; replacing isolated
modules until the Rust virus has spread enough to take control of the project
is.

This project is not just about writing Rust code. It is about C, ABIs, build
systems, interoperability, memory layouts, and optimizations while keeping an
eye on possible regressions.

## Project choice

Ok, we know what we want to do. The next question is: what is our target? Since
the main purpose of this project is learning, we don't need to find a project
that hasn't been migrated before or a project that really "needs" it. Also, for
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

First things first: [Fork the repo](https://github.com/SharliBeicon/lz4).

Now let's inspect the surface and see if we can find a good starting point:

```shell
~/D/P/lz4 dev
❯❯❯ tree -L 1
.
├── appveyor.yml
├── build
├── CODING_STYLE
├── contrib
├── doc
├── examples
├── INSTALL
├── lib
├── LICENSE
├── Makefile
├── NEWS
├── ossfuzz
├── programs
├── README.md
├── SECURITY.md
└── tests

9 directories, 8 files
```

- `build`: We can safely ignore it. It includes support for several build
  systems. Since we are going to eventually migrate everything to `cargo`, we'll
  support just `make`.
- `contrib`: Third party stuff not related to the core of the project.
- `examples/`: Useful for testing purposes in the future, not now.
- `ossfuzz/`. Test suite for the
  [Google's OSS Fuzz project](https://github.com/google/oss-fuzz). Also useful
  in future chapters of our lives.
- `programs/`: `lz4` CLI comes from here.

That leaves us with the `lib/` folder, where the algorithm lives and where we
should focus for now, not to start coding yet, but to understand the very basics
of how this is built.

Inside, there is a
[README.md](https://github.com/lz4/lz4/blob/dev/lib/README.md) which is quite
revealing:

```markdown
The `/lib` directory contains many files, but depending on project's objectives,
not all of them are required. Limited systems may want to reduce the nb of
source files to include as a way to reduce binary size and dependencies.

Capabilities are added at the "level" granularity, detailed below.

#### Level 1 : Minimal LZ4 build

The minimum required is **`lz4.c`** and **`lz4.h`**, which provides the fast
compression and decompression algorithms. They generate and decode data using
the [LZ4 block format].

...
```

## Understanding the code

As we explore the [`lz4.h`](https://github.com/lz4/lz4/blob/dev/lib/lz4.h#L174)
file, after a few `#define` and constant declarations, we can find the public
API definitions, separated by sections depending on how fine-grained we want to
interact with this implementation.

This is helpful because it allows us to identify potential entry points for our
rewrite.

Specifically, the following signatures are interesting:

```c
/*-************************************
*  Simple Functions
**************************************/
/*! LZ4_compress_default() :
 * ...
 */
LZ4LIB_API int LZ4_compress_default(const char* src, char* dst, int srcSize, int dstCapacity);

/*! LZ4_decompress_safe() :
 * ...
 */
LZ4LIB_API int LZ4_decompress_safe (const char* src, char* dst, int compressedSize, int dstCapacity);
```

Aha! Functions for compressing and decompressing strings (`const char *`) inside
a compression algorithm implementation. Seems reasonable.

Let's deep dive into the compression one. Exploring that one will give us the
needed context on the types, structures, and helpers that power the compression
function:

```c
int LZ4_compress_default(const char* src, char* dst, int srcSize, int dstCapacity)
{
    return LZ4_compress_fast(src, dst, srcSize, dstCapacity, 1);
}
```

Alright, that was easy... it just calls another `LZ4_compress_fast`, which has a
very similar signature with an extra hardcoded `1`. This is what the function
definition says about it:

> Same as LZ4_compress_default(), but allows selection of "acceleration" factor.
> The larger the acceleration value, the faster the algorithm, but also the
> lesser the compression. It's a trade-off. It can be fine tuned, with each
> successive value providing roughly +~3% to speed. An acceleration value of "1"
> is the same as regular LZ4_compress_default()

Also,
[`LZ4_compress_fast()`](https://github.com/lz4/lz4/blob/5c4c1fb2354133e1f3b087a341576985f8114bd5/lib/lz4.c#L1449)
is just another wrapper over `LZ4_compress_fast_extState()`. Since the latter
receive another extra field, an external `state`; `fast()` just decides how to
allocate that state and then pass it to `extState()`.
