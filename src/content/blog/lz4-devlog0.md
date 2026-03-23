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
side-project hours, with a clear, scoped division into modules to make it easier
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

Let's dive deep into the compression one. Exploring that one will give us the
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
is just another wrapper over `LZ4_compress_fast_extState()`. The latter receives
another extra field, an external `state`; `fast()` just decides how to allocate
that state and then pass it to `extState()`.

## First target

If we take a look at the implementation of
[`LZ4_compress_fast_extState`](https://github.com/lz4/lz4/blob/5c4c1fb2354133e1f3b087a341576985f8114bd5/lib/lz4.c#L1378),
after some initializations and checks, we get to this line:

```c
if (maxOutputSize >= LZ4_compressBound(inputSize)) {
```

Here, `LZ4_compressBound(inputSize)` is a super simple function that we can use
to end this chapter: create our Rust crate, expose a function that behaves the
same, and make the C implementation use our version instead. That would leave us
with a Rust project wired into the main C one, in a really good shape for the
next chapters.

```c
int LZ4_compressBound(int isize)  { return LZ4_COMPRESSBOUND(isize); }

...

#define LZ4_COMPRESSBOUND(isize)  ((unsigned)(isize) > (unsigned)LZ4_MAX_INPUT_SIZE ? 0 : (isize) + ((isize)/255) + 16)
```

Note that this is a compile-time macro, so we are certainly losing efficiency if
we use our custom function instead, since it becomes an externally linked,
runtime-executed function. However, that's acceptable for now, since
outperforming the current implementation is way, way beyond our current scope.

## Code integration

### Rust crate

Ok, so let's create a library crate at the root level of the repo:

```shell
cargo new --lib lz4-rs
```

Then, we need to add the following to `Cargo.toml` to tell Cargo it should treat
our code as a static library, so it emits `liblz4_rs.a` we can link to the C
artifacts.

```toml
[package]
name = "lz4-rs"
version = "0.1.0"
edition = "2024"

[lib]
crate-type = ["staticlib"]
```

Inside `lib.rs`, we are going to create a function that replicates the behavior
of `LZ4_compressBound()`:

```rust
use std::ffi::c_int;

pub const LZ4_MAX_INPUT_SIZE: u32 = 0x7E00_0000;

pub const fn lz4_compress_bound(input_size: c_int) -> c_int {
    if (input_size as u32) > LZ4_MAX_INPUT_SIZE {
        0
    } else {
        input_size + (input_size / 255) + 16
    }
}
```

1. Include `c_int`. We need to match whatever `int` means on the platform that
   executes the code (it can go from 16 bits to 64).
2. `LZ4_MAX_INPUT_SIZE` constant with the same value as in the C implementation.
3. Rust version of the function. Note that we declare it as `const`, because we
   want to match the `#define` from C, which is evaluated at compile time.

Now, we need to add a FFI wrapper to be able to call it from C:

```rust
#[unsafe(no_mangle)]
pub unsafe extern "C" fn LZ4_rs_compressBound(isize: c_int) -> c_int {
    lz4_compress_bound(isize)
}
```

1.  Rust, when compiling, changes symbol names at the binary level. This is used
    to add meta-information and prevent name collisions. However, we don't want
    that to happen here, because otherwise C would not be able to find the
    function. So with `#[unsafe(no_mangle)]` we tell the compiler not to change
    the function name.
2.  The function must be marked with `extern "C"` because Rust's ABI is not
    stabilized. Parameter ordering, how return values are handled, and who
    cleans up the stack can change. With that, we tell the compiler we need to
    stick to the C ABI in order to interoperate properly.

### Call it from C

Going back to `lz4.c`, if we go to the implementation of `LZ4_compressBound()`
We can swap the call of the macro with our Rust version. Declaring first the
existence of the symbol:

```c
extern int LZ4_rs_compressBound(int isize);

int LZ4_compressBound(int isize)  { return LZ4_rs_compressBound(isize); }
```

Now, all the references to `LZ4_compressBound()` across the C implementation
will use our version instead.

There is just another more step. Linking.

### Linking all together

We do not need to reinvent the whole build. We just need to teach `lib/Makefile`
how to build the Rust crate and link its output into `liblz4`.

First, we define where the Rust crate lives and where Cargo will leave the
generated static library:

```make
CARGO ?= cargo

RUSTDIR ?= ../lz4-rs
RUST_PROFILE ?= release
RUST_TARGET_DIR := $(RUSTDIR)/target/$(RUST_PROFILE)
RUST_STATICLIB := $(RUST_TARGET_DIR)/liblz4_rs.a
```

Then we add a rule for building that artifact:

```make
$(RUST_STATICLIB): $(RUSTDIR)/src/lib.rs $(RUSTDIR)/Cargo.toml
	$(CARGO) build --manifest-path $(RUSTDIR)/Cargo.toml --lib --profile $(RUST_PROFILE)
```

And finally, we make the shared `liblz4` target depend on that Rust archive and
link it in:

```make
$(LIBLZ4): $(RUST_STATICLIB)
$(LIBLZ4): LDLIBS += $(RUST_STATICLIB)

$(eval $(call c_dynamic_library,$(LIBLZ4),$(OBJFILES),,echo "$(LIBLZ4) created",$(RUST_STATICLIB)))
```

With that, running `make` from the project root still feels like regular old
`make`, but now there is a tiny Rust island hidden inside the build.

However, `programs/Makefile` and `tests/Makefile` also compile and link targets
that pull in `lz4.c`, so once `LZ4_compressBound()` starts calling into Rust,
they need to link against `liblz4_rs.a` too. Otherwise the library itself builds
fine, but the CLI and test binaries fail at link time with an unresolved symbol.

So the same `RUST_STATICLIB` definition and build rule must be added there as
well, and the corresponding targets need `LDLIBS += $(RUST_STATICLIB)`.

Let's try a `make test` to see if everything works as expected:

```shell
+--------------+------------------------------+--------------+----------------+--------------+--------------+
|Source        |Function Benchmarked          | Total Seconds|  Iterations/sec|  ns/Iteration|  % of default|
+--------------+------------------------------+--------------+----------------+--------------+--------------+
|Normal Text   |LZ4_compress_default()        |   0.016784000|         595,805|         1,678|       100.00%|
|Normal Text   |LZ4_compress_fast()           |   0.016889000|         592,101|         1,688|       100.63%|
|Normal Text   |LZ4_compress_fast_extState()  |   0.016694000|         599,017|         1,669|        99.46%|
|Normal Text   |LZ4_decompress_safe()         |   0.003408000|       2,934,272|           340|        20.31%|
|Normal Text   |LZ4_decompress_fast()         |   0.009859000|       1,014,301|           985|        58.74%|
|              |                              |              |                |              |              |
|Compressible  |LZ4_compress_default()        |   0.002235000|       4,474,272|           223|       100.00%|
|Compressible  |LZ4_compress_fast()           |   0.002402000|       4,163,197|           240|       107.47%|
|Compressible  |LZ4_compress_fast_extState()  |   0.002260000|       4,424,778|           226|       101.12%|
|Compressible  |LZ4_decompress_safe()         |   0.000831000|      12,033,694|            83|        37.18%|
|Compressible  |LZ4_decompress_fast()         |   0.025111000|         398,231|         2,511|     1,123.53%|
+--------------+------------------------------+--------------+----------------+--------------+--------------+
```

Well, it definitely runs!

And it think that's enough for devlog #0: we have not rewritten the compressor,
we have not won any benchmarks; but we do have a very important part done: a Rust
crate compiled by Cargo, linked into the C library, and callable from the
existing codebase without breaking the build.

From here on, things get more interesting.
