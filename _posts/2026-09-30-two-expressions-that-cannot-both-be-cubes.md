---
title: "Two expressions that cannot both be cubes"
description: "For a natural number n, prove that n + 2 and n² + n + 1 cannot both be perfect cubes."
format: problem
tags: [number theory, perfect powers]
math: true
---

For an integer $$n\geq0$$, prove that

$$
n+2\qquad\text{and}\qquad n^2+n+1
$$

cannot both be perfect cubes.

<!-- hint -->

Assume $$n+2$$ is a cube, then compare the second expression with consecutive cubes.

<!-- solution -->

Suppose $$n+2=a^3$$ and $$n^2+n+1=b^3$$ for positive integers $$a,b$$. Then $$a\geq2$$ and

$$
b^3=a^6-3a^3+3<a^6.
$$

For the preceding cube,

$$
\begin{gathered}
b^3-(a^2-1)^3\\
=3a^2(a^2-a-1)+4>0,
\end{gathered}
$$

since $$a^2-a-1\geq1$$. Thus

$$
(a^2-1)^3<b^3<(a^2)^3.
$$

This traps a perfect cube strictly between consecutive cubes, which is impossible.
