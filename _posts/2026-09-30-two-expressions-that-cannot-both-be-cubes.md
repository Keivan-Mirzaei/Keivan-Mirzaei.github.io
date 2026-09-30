---
title: "Two expressions that cannot both be cubes"
description: "For a natural number n, prove that n + 2 and n² + n + 1 cannot both be perfect cubes."
format: problem
tags: [number theory, perfect powers]
math: true
---

Let $$n$$ be a natural number. Prove that the two numbers

$$
n+2\qquad\text{and}\qquad n^2+n+1
$$

cannot both be perfect cubes.

The statement holds whether or not your convention includes $$0$$ among the natural numbers.

<!-- solution -->

Suppose, for a contradiction, that

$$
n+2=a^3,\qquad n^2+n+1=b^3
$$

for positive integers $$a,b$$. Since $$n\geq 0$$, we have $$a^3\geq 2$$, so $$a\geq 2$$.

Substituting $$n=a^3-2$$ gives

$$
\begin{aligned}
b^3&=(a^3-2)^2+(a^3-2)+1\\
&=a^6-3a^3+3.
\end{aligned}
$$

This number lies strictly between two consecutive cubes. First,

$$
a^6-3a^3+3<a^6=(a^2)^3,
$$

because $$a\geq 2$$. For the lower bound, subtract the preceding cube:

$$
\begin{aligned}
&(a^6-3a^3+3)-(a^2-1)^3\\
&\qquad=3a^4-3a^3-3a^2+4\\
&\qquad=3a^2(a^2-a-1)+4>0.
\end{aligned}
$$

The last inequality follows from $$a\geq 2$$, which gives $$a^2-a-1\geq 1$$. Thus

$$
(a^2-1)^3<b^3<(a^2)^3.
$$

Taking cube roots gives $$a^2-1<b<a^2$$, impossible for an integer $$b$$. Therefore the two expressions cannot both be cubes.
