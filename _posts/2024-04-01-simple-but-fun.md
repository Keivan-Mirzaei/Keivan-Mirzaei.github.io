---
title: "Simple but Fun"
description: "A permutation of an odd-sized set produces an even product. Can you see why?"
format: problem
category: math
tags: ["number theory", "parity"]
kind: Problem & proof
math: true
archived: true
---

Suppose $$n$$ is an odd number and $$a_1, a_2, \dots, a_n$$ is a permutation of $$1, 2, \dots, n$$. Prove that the product

$$
(a_1-1)\cdot(a_2-2)\dots (a_n-n)
$$

is always an even number.

<!-- solution -->

One only needs to observe that

$$
(a_1-1) + (a_2-2) + \dots + (a_n-n) = 0.
$$

As the sum of an odd number of integers results in zero, at least one of them should be even.
