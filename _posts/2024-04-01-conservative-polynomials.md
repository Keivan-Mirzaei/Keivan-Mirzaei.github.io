---
title: "Conservative Polynomials"
description: "What happens to a polynomial when we take its absolute value?"
format: problem
category: math
tags: ["algebra", "polynomials"]
kind: Problem & proof
math: true
archived: true
---

Suppose that $$P$$ is a polynomial that takes both positive and negative values. Prove that the function $$\lvert P\rvert$$ is not a polynomial anymore.

<!-- solution -->

Suppose to the contrary that $$\lvert P\rvert$$ is a polynomial and without loss of generality also suppose that $$P$$ takes positive values infinitely many times. Therefore the polynomial equality $$\lvert P(x)\rvert - P(x) = 0$$ has infinitely many solutions. Hence the fundamental theorem of algebra gives $$\lvert P(x)\rvert = P(x)$$ which contradicts the fact that $$P$$ takes both positive and negative values.
