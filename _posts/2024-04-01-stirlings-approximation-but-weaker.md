---
title: "Stirling's Approximation but Weaker"
description: "Compare factorial and exponential growth by proving a limit."
format: problem
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

<!-- solution -->

Fix $$k\in \mathbb N$$. According to the power series representation of the exponential function we should have:

$$
\begin{align*}
e^n
&= 1 + n + \frac{n^2}{2!} + \cdots + \frac{n^n}{n!} + \frac{n^{n+1}}{(n+1)!} + \cdots\\
&\gt \frac{n^n}{n!}\left(1 + \frac {n}{n+1} + \frac {n^2}{(n+1)(n+2)}+ \cdots\right)\\
&\gt \frac{n^n}{n!}\left(1 + \frac {n}{n+1} + \cdots + \frac {n^k}{(n+1)\cdots(n+k)}\right).\tag{1}\label{eq:1}
\end{align*}
$$

Therefore, \ref{eq:1} gives

$$
\liminf_{n\to \infty} \frac{e^nn!}{n^n} \geq k+1 > k
$$

and the conclusion follows from the fact that $$k$$ was an arbitrary number.
