---
title: How long until two heads in a row?
description: Two tosses can be enough. Find the average waiting time, and explain why it is longer.
format: problem
category: math
tags: [probability, expectation, recurrences]
math: true
sample: true
---

Toss a fair coin repeatedly, independently each time. Stop as soon as you see two consecutive heads.

What is the expected number of tosses, counting both heads at the end? For example, `T H T H H` stops after five tosses.

<details markdown="1">
<summary>Hint: remember only what matters</summary>

You do not need the entire toss history. Distinguish two states: no current run of heads, or a run consisting of one head.

</details>

<!-- solution -->

Let $$E_0$$ be the expected number of additional tosses when no head is waiting to be matched. Let $$E_1$$ be the expectation after one head.

From the first state, one toss either leaves you there or moves you to the second state:

$$
E_0 = 1 + \frac12 E_0 + \frac12 E_1.
$$

From the second, a tail sends you back to the start and a head finishes the game:

$$
E_1 = 1 + \frac12 E_0.
$$

Substitution gives $$E_0=6$$ and $$E_1=4$$. Thus the answer is **six tosses on average**.

Why can we use finite expectations here? Group tosses into disjoint pairs. Each pair is `HH` with probability 1/4, independently of the other pairs. Waiting for such a pair takes eight tosses on average; our stopping rule can only finish earlier or at the same time.

**Try a variation:** how does the answer change if heads has probability $$p$$, where $$0<p\leq1$$? The same equations give $$(1+p)/p^2$$.
