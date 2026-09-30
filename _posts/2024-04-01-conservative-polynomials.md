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

Suppose, for a contradiction, that $$Q(x)=\lvert P(x)\rvert$$ is a polynomial.

At least one of the sets

$$
\{x\in\mathbb R:P(x)\geq0\}
\qquad\text{and}\qquad
\{x\in\mathbb R:P(x)\leq0\}
$$

is infinite, because together they cover the real line.

If the first set is infinite, the polynomial $$P-Q$$ has infinitely many roots. A nonzero polynomial has only finitely many roots, so $$P=Q=\lvert P\rvert$$ everywhere. This contradicts the fact that $$P$$ takes negative values.

If the second set is infinite, apply the same argument to $$P+Q$$. It follows that $$P=-Q=-\lvert P\rvert$$ everywhere, contradicting the fact that $$P$$ takes positive values.

Either way, $$\lvert P\rvert$$ cannot be a polynomial. The proof uses only the elementary fact about roots of a polynomial; no continuity argument is needed.
