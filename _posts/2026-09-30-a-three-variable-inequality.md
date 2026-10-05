---
title: "A three-variable inequality"
description: "Prove a symmetric inequality for arbitrary real x, y, and z."
format: problem
difficulty: 3
tags: [algebra, inequalities]
math: true
---

For all real numbers $$x,y,z$$, prove that

$$
\begin{aligned}
&(x^2+yz)(y^2+zx)(z^2+xy)\\
&\qquad\leq (x^2+y^2)(y^2+z^2)(z^2+x^2).
\end{aligned}
$$

<!-- hint -->

Try writing the difference between the two sides as a sum of squared differences.

<!-- solution -->

Write $$L$$ and $$R$$ for the left and right sides. Expanding and regrouping gives

$$
\begin{aligned}
2(R-L)
&=(x-y)^2(x^2y^2+z^4)\\
&\quad+(y-z)^2(y^2z^2+x^4)\\
&\quad+(z-x)^2(z^2x^2+y^4).
\end{aligned}
$$

Every term is nonnegative for real $$x,y,z$$, so $$L\leq R$$.

<!-- extension -->

Equality holds exactly when $$x=y=z$$ or at least two variables are zero.

If two variables are nonzero, their squared difference must vanish; the remaining terms then force the third variable to equal them. If at most one variable is nonzero, all three terms vanish.
