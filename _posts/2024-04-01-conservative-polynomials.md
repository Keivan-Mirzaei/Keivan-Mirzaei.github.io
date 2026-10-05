---
title: "Conservative polynomials"
description: "What happens to a polynomial when we take its absolute value?"
format: problem
category: math
tags: ["algebra", "polynomials"]
kind: Problem & proof
math: true
archived: true
---

Let $$P$$ be a real polynomial that takes both positive and negative values. Prove that $$\lvert P\rvert$$ is not a polynomial.

<!-- hint -->

If $$Q=\lvert P\rvert$$ were a polynomial, what would squaring tell you?

<!-- solution -->

Suppose $$Q=\lvert P\rvert$$ is a polynomial. Since $$Q^2=P^2$$ at every real number, we have the polynomial identity

$$
(Q-P)(Q+P)=0.
$$

A product of two nonzero polynomials is nonzero, so $$Q=P$$ or $$Q=-P$$. Because $$Q\geq0$$ everywhere, either choice forces $$P$$ to have only one sign—a contradiction.
