---
title: "When an absolute value stops being a polynomial"
description: "A polynomial takes both positive and negative values. Can its absolute value still be a polynomial?"
format: problem
tags: [algebra, polynomials]
math: true
source_channel: mathematics_society
source_problem: 79
source_url: https://t.me/mathematics_society/314
source_published_at: "2018-10-23T02:18:24+00:00"
source_solution_url: https://t.me/mathematics_society/320
---

Let $$P$$ be a polynomial with real coefficients that takes both positive and negative values on the real line.

Prove that the function $$x \mapsto \lvert P(x)\rvert$$ is not a polynomial.

*Translated from [Problem 79 in @mathematics_society](https://t.me/mathematics_society/314).*

<!-- solution -->

Suppose, for a contradiction, that $$Q(x)=\lvert P(x)\rvert$$ is a polynomial.

At least one of the sets

$$
\{x\in\mathbb R:P(x)\geq 0\}
\qquad\text{and}\qquad
\{x\in\mathbb R:P(x)\leq 0\}
$$

is infinite: together they cover the real line.

If the first set is infinite, then $$P(x)-Q(x)=0$$ at infinitely many real numbers. A nonzero polynomial has only finitely many roots, so $$P-Q$$ must be the zero polynomial. This gives $$P(x)=\lvert P(x)\rvert$$ for every real $$x$$, contradicting the fact that $$P$$ takes negative values.

If the second set is infinite, apply the same argument to $$P+Q$$. It follows that $$P(x)=-\lvert P(x)\rvert$$ for every real $$x$$, contradicting the fact that $$P$$ takes positive values.

Either way, we reach a contradiction.

*Adapted from the [channel's solution](https://t.me/mathematics_society/320). Its [follow-up note](https://t.me/mathematics_society/321) emphasizes that the proof uses no continuity argument—only the elementary fact about roots of a polynomial.*
