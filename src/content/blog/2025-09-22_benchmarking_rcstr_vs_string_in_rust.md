---
title: "Benchmarking `Rc<str>` vs `String`"
pubDate: 2025-09-22
tags: ["rust", "strings", "criterion", "pointers"]
---

A while ago, I watched [this Logan Smith video](https://youtu.be/A4cKi7PTJSs) about using `Arc<[T]>` (with `Rc<T>` being a better choice in single-threaded contexts) instead of `Vec<T>` when working with immutable collections. The video also refers to a similar data structure built on top of `Vec<T>`: `String`. We can use `String` and `Rc<str>` interchangeably in those immutable contexts.

---

**tl;dr**: `String` behaves faster thanks to LLVM optimizations.

---

These kinds of micro-optimizations always get stuck in my mind, waiting for the right time to be tested. This one in particular seemed like an easy win, right? A minimal syntax change, semantics untouched, with a substantial difference in performance due to allocation costs. Well, let’s see how these data structures are built under the hood.

## Strings

Strings are a wrapper over a `Vec<u8>`. A simplified version of [std’s `Vec` definition](https://doc.rust-lang.org/src/alloc/vec/mod.rs.html#414) looks like this:

```rust
struct Vec<T> {
    buf: RawVec<T>,
    len: usize,
}

struct RawVec<T> {
    ptr: Unique<T>,
    cap: usize,
}
```

Which essentially gives us the classic “pointer, length, and capacity” of [dynamic arrays](https://x.com/tsoding/status/1762386818861863039). Cloning this data structure implies copying these two stack-allocated structs and duplicating the heap buffer.

- **O(n)** allocation cost  
- Independent ownership

## Rc\<str\>

`Rc<T>` is a kind of smart pointer that stands for *Reference Counted*. It stores a pointer to the heap buffer plus a counter of how many references are currently alive in your program. The buffer doesn’t get freed until this counter reaches 0. Cloning it just increments the reference counter.

- **O(1)** allocation cost  
- Shared ownership, therefore immutable

## Benchmarking the intuition

On paper, this looks like a clear win for `Rc<str>`.

- `String` clones are **O(n)** — they allocate new memory and copy the whole buffer.  
- `Rc<str>` clones are **O(1)** — just bump a counter.

So if all I need is immutable strings, `Rc<str>` should give me cheaper performance almost for free, right?

Time to stop hand-waving and measure it. I built two versions of my Advent of Code Day 7 solution:

- one using plain `String`,  
- one using `Rc<str>`.

Then I wired them up to [Criterion](https://crates.io/crates/criterion) benchmarks, pointed both at the same input file, and ran them head-to-head.

What I expected: `Rc<str>` would crush `String`.  
What I got: well… not exactly.

## Results

*(to be filled with Criterion outputs, graphs, and commentary)*

## Why `String` Wins in Practice

*(section to explain LLVM optimizations, memory layout, branch prediction, cache locality, drop glue, refcount overhead, etc.)*

## Takeaways

- Micro-optimizations can be tricky: intuition doesn’t always match real-world results.  
- `Rc<str>` is elegant in theory but not necessarily faster.  
- Benchmark before refactoring for performance.
