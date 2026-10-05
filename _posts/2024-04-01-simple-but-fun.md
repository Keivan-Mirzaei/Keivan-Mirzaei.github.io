---
title: "Simple but fun"
description: "A permutation of an odd-sized set produces an even product. Can you see why?"
format: problem
category: math
tags: ["number theory", "parity"]
kind: Problem & proof
math: true
archived: true
---

Let $$n$$ be a positive odd integer and $$a_1,\ldots,a_n$$ a permutation of $$1,\ldots,n$$. Prove that

$$
\prod_{i=1}^{n}(a_i-i)
$$

is even.

<!-- hint -->

Could all $$n$$ differences be odd?

<!-- solution -->

Permuting the numbers preserves their sum, so

$$
\sum_{i=1}^{n}(a_i-i)=0.
$$

If every difference were odd, their sum would be odd because $$n$$ is odd. Thus at least one factor is even, and so is the product.
