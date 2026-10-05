---
title: "Stirling’s approximation, but weaker"
description: "Compare factorial and exponential growth by proving a limit."
format: problem
difficulty: 3
category: math
tags: ["analysis", "sequences"]
kind: Problem & proof
math: true
archived: true
---

Show that

$$
\lim_{n\to \infty} \frac{e^nn!}{n^n} = \infty.
$$

You may use the power series for the exponential function.

<!-- hint -->

Keep several terms just after $$n^n/n!$$ in the series for $$e^n$$.

<!-- solution -->

Fix a positive integer $$k$$. Keeping $$k+1$$ terms from the exponential series gives

$$
\frac{e^nn!}{n^n}
\geq 1+\sum_{j=1}^{k}\frac{n^j n!}{(n+j)!}.
\tag{1}\label{eq:factorial-tail}
$$

Each ratio $$n^j n!/(n+j)!$$ is a product of $$j$$ factors $$n/(n+r)$$, each tending to $$1$$. Thus the right-hand side of $$\eqref{eq:factorial-tail}$$ tends to $$k+1$$.

Given any bound $$M$$, choose $$k$$ with $$k+1>M$$. Then $$\eqref{eq:factorial-tail}$$ exceeds $$M$$ for all sufficiently large $$n$$, proving the limit.
