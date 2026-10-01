---
title: "How big can a cevian triangle be?"
description: "Three lines meet. Three side points make a triangle. Move the meeting point—and discover why a quarter is the most you can get."
date: 2026-10-01 23:44:45 +0000
format: exploration
tags: [geometry, inequalities, simplexes]
math: true
widgets: [cevian-triangles]
---

Pick a point $$O$$ inside a triangle $$ABC$$. Draw a line from each vertex through $$O$$, continuing to the opposite side. Call the three side points $$X,Y,Z$$, and join them.

The green triangle $$XYZ$$ moves as $$O$$ moves. Sometimes it becomes surprisingly large. Sometimes it almost disappears.

**How much of the original triangle can it occupy?**

{% include widgets/cevian-explorer.html %}

A segment from a vertex to the opposite side is a **cevian**. The three cevians here are **concurrent**: they meet at one point. Their side points form the **cevian triangle**. We require $$O$$ to lie strictly inside $$ABC$$.

Choosing arbitrary points on the three sides is a different problem. Here they must come from the **same** meeting point.

## The answer: one quarter, and only at the midpoints

For every such configuration,

$$
\frac{[XYZ]}{[ABC]}\leq\frac14.
$$

The brackets mean area. Equality holds **exactly** when $$X,Y,Z$$ are the side midpoints, so $$O$$ is the centroid. The midpoint triangle and the three corner triangles then all have the same area.

Try **Show the maximum**, then change the shape of the outer triangle. The answer survives stretching and slanting.

Here is the complete proof. The geometric part finds the area; one small inequality finishes the job.

## 1. Concurrency creates a balance

Measure the fractions of the three sides:

$$
\begin{aligned}
\alpha&=\frac{BX}{BC},\\
\beta&=\frac{CY}{CA},\\
\gamma&=\frac{AZ}{AB}.
\end{aligned}
$$

All three lie between $$0$$ and $$1$$. Ceva’s condition is

$$
\frac{\alpha}{1-\alpha}\,
\frac{\beta}{1-\beta}\,
\frac{\gamma}{1-\gamma}=1,
$$

or, equivalently,

$$
\alpha\beta\gamma
=(1-\alpha)(1-\beta)(1-\gamma).
$$

Why does concurrency give this condition? We can see it using just areas.

{% include widgets/cevian-ceva.html %}

Put $$p=[OBC]$$, $$q=[OCA]$$, and $$r=[OAB]$$. The triangles $$ABO$$ and $$ACO$$ share the base $$AO$$. Replacing that base by $$AX$$ multiplies both areas by the same factor. The triangles $$ABX$$ and $$ACX$$, in turn, have the same altitude to $$BC$$. Therefore

$$
\frac rq
=\frac{[ABO]}{[ACO]}
=\frac{[ABX]}{[ACX]}
=\frac{BX}{XC}.
$$

Repeating the argument at the other two vertices gives

$$
\frac{CY}{YA}=\frac pr,\qquad
\frac{AZ}{ZB}=\frac qp.
$$

Multiplying these three ratios cancels $$p,q,r$$ and gives $$1$$. This proves the part of Ceva’s theorem we need.

## 2. Find the area by removing the corners

The inner triangle is what remains after subtracting the three corner triangles.

{% include widgets/cevian-corners.html %}

For example, $$AYZ$$ and $$ABC$$ share the angle at $$A$$. Since a triangle’s area is half the product of two sides and the sine of their included angle,

$$
\frac{[AYZ]}{[ABC]}
=\frac{AY}{AC}\frac{AZ}{AB}
=(1-\beta)\gamma.
$$

The same argument at $$B$$ and $$C$$ gives

$$
\begin{aligned}
\frac{[BZX]}{[ABC]}&=(1-\gamma)\alpha,\\
\frac{[CXY]}{[ABC]}&=(1-\alpha)\beta.
\end{aligned}
$$

Let $$R=[XYZ]/[ABC]$$. The four areas partition $$ABC$$, so

$$
\begin{aligned}
R&=1-\gamma(1-\beta)\\
 &\quad-\alpha(1-\gamma)-\beta(1-\alpha)\\
 &=1-\alpha-\beta-\gamma\\
 &\quad+\alpha\beta+\beta\gamma+\gamma\alpha.
\end{aligned}
$$

Now expand the product from Ceva’s condition:

$$
\begin{aligned}
(1-\alpha)(1-\beta)(1-\gamma)
&=R-\alpha\beta\gamma.
\end{aligned}
$$

That product also equals $$\alpha\beta\gamma$$. Hence the exact area formula is

$$
\boxed{R=2\alpha\beta\gamma.}
$$

The factor **2** matters: at the midpoints, this gives $$2(1/2)^3=1/4$$.

## 3. The small trick that proves the maximum

Use the ratios of the two pieces of each side:

$$
\begin{aligned}
a&=\frac{\alpha}{1-\alpha},\\
b&=\frac{\beta}{1-\beta},\\
c&=\frac{\gamma}{1-\gamma}.
\end{aligned}
$$

They are positive, and concurrency says $$abc=1$$. Solving for the side fractions gives

$$
\begin{aligned}
\alpha&=\frac{a}{1+a},\\
\beta&=\frac{b}{1+b},\\
\gamma&=\frac{c}{1+c}.
\end{aligned}
$$

Substitute them into the area formula:

$$
\begin{aligned}
R&=\frac{2abc}{(1+a)(1+b)(1+c)}\\
 &=\frac{2}{(1+a)(1+b)(1+c)}.
\end{aligned}
$$

Now pair each ratio with $$1$$. For any $$t>0$$,

$$
1+t-2\sqrt t=(\sqrt t-1)^2\geq0.
$$

Thus $$1+t\geq2\sqrt t$$, with equality only when $$t=1$$. This is the two-number arithmetic–geometric mean inequality, with its entire proof written in one line.

{% include widgets/cevian-factors.html %}

Multiply the inequalities for $$a,b,c$$:

$$
\begin{aligned}
(1+a)(1+b)(1+c)
&\geq8\sqrt{abc}\\
&=8.
\end{aligned}
$$

Therefore

$$
\boxed{R\leq\frac28=\frac14.}
$$

Equality requires all three squared gaps to vanish: $$a=b=c=1$$. This means $$\alpha=\beta=\gamma=1/2$$, so all three side points are midpoints. Conversely, the midpoints give equality. **The proof is complete.**

{% include widgets/cevian-landscape.html %}

There is nothing special about an equilateral triangle here. The formulas involve side fractions, so the outer triangle’s angles and side lengths have disappeared from the answer.

## One dimension higher: a tetrahedron

A triangle has three vertices and three opposite sides. A tetrahedron has four vertices and four opposite triangular faces.

Choose an interior point $$O$$. From each vertex $$A_i$$, continue the line through $$O$$ to the opposite face, reaching $$X_i$$. The four contact points form an inner tetrahedron.

The largest possible volume is **$$1/27$$ of the outer volume**, attained when the contact points are the **centers of the four faces**.

{% include widgets/cevian-simplex.html %}

At this configuration, $$O$$ is the centroid $$G$$. Each face center is obtained from its opposite vertex by reflecting through $$G$$ and shrinking lengths by a factor of $$1/3$$. Volume therefore shrinks by $$(1/3)^3=1/27$$.

That explains the value at the candidate maximum. To prove that every other configuration is smaller, we need one more argument.

## The complete proof in any dimension

An **$$n$$-simplex** is the higher-dimensional version of a triangle: it has $$n+1$$ affinely independent vertices $$A_1,\ldots,A_{n+1}$$. A triangle has $$n=2$$; a tetrahedron has $$n=3$$.

Choose an interior point $$O$$, and let $$X_i$$ be the intersection of $$A_iO$$ with the opposite facet. For $$n\geq2$$, the general result is

$$
\boxed{
\frac{\operatorname{Vol}_n(X_1\cdots X_{n+1})}
{\operatorname{Vol}_n(A_1\cdots A_{n+1})}
\leq\frac{1}{n^n}.
}
$$

Equality holds exactly when every contact point is the centroid of its opposite facet. In two dimensions, these facet centers are the side midpoints.

### Describe the common point by weights

Every interior point has unique positive barycentric weights:

$$
\begin{gathered}
O=\sum_{i=1}^{n+1}w_iA_i,\\
w_i>0,\qquad \sum_iw_i=1.
\end{gathered}
$$

This says that $$O$$ is a weighted average of the vertices. Isolating the contribution from $$A_i$$ gives

$$
O=w_iA_i+(1-w_i)X_i,
$$

where

$$
X_i=\sum_{j\ne i}\frac{w_j}{1-w_i}A_j.
$$

The coefficients in this last sum are positive and add to $$1$$, so $$X_i$$ is inside the opposite facet. The previous equation puts $$A_i,O,X_i$$ on one line, with $$O$$ between the endpoints. Thus these formulas describe **every** configuration in the theorem.

### Calculate the volume ratio

Let $$P_A$$ be the square matrix whose $$i$$th row contains the $$n$$ coordinates of $$A_i$$ followed by $$1$$. Define $$P_X$$ similarly. The coordinate formula above says

$$
\begin{gathered}
P_X=MP_A,\\[.5em]
M_{ij}=
\begin{cases}
0,&i=j,\\
\dfrac{w_j}{1-w_i},&i\ne j.
\end{cases}
\end{gathered}
$$

The volume of a simplex is the absolute value of this coordinate determinant divided by $$n!$$. Taking determinants cancels both $$n!$$ and the outer determinant, so the volume ratio is $$\lvert\det M\rvert$$.

We can evaluate it without a long expansion. Let $$J$$ be the $$(n+1)\times(n+1)$$ all-ones matrix. Multiplying row $$i$$ of $$M$$ by $$1-w_i$$, then dividing column $$j$$ by $$w_j$$, leaves exactly $$J-I$$. Therefore

$$
|\det M|
=|\det(J-I)|\,
\frac{\prod_iw_i}{\prod_i(1-w_i)}.
$$

The matrix $$J-I$$ multiplies the all-ones vector by $$n$$. On the $$n$$-dimensional subspace of vectors whose components sum to zero, it multiplies by $$-1$$. Its determinant is consequently $$n(-1)^n$$. We obtain the exact formula

$$
\boxed{
R_n=n\prod_{i=1}^{n+1}\frac{w_i}{1-w_i}.
}
$$

### Bound the denominator

For each $$i$$, apply AM–GM to the **other $$n$$ weights**:

$$
\begin{aligned}
1-w_i&=\sum_{j\ne i}w_j\\
&\geq n\left(\prod_{j\ne i}w_j\right)^{1/n}.
\end{aligned}
$$

Multiply all $$n+1$$ inequalities. Each weight appears in exactly $$n$$ of the products, each time with exponent $$1/n$$. Its total exponent is therefore $$1$$:

$$
\prod_i(1-w_i)\geq n^{n+1}\prod_iw_i.
$$

Substituting into the exact volume formula finishes the bound:

$$
R_n
\leq\frac{n}{n^{n+1}}
=\boxed{\frac{1}{n^n}}.
$$

For equality, every AM–GM comparison must be an equality. Since $$n\geq2$$, this forces all the weights to be equal: $$w_i=1/(n+1)$$. Conversely, equal weights make every inequality an equality, and $$X_i$$ is then the average of the other vertices—the opposite facet’s centroid.

Indeed, writing $$G$$ for the outer centroid,

$$
X_i=G-\frac1n(A_i-G).
$$

So the maximizing simplex is reflected through its centroid and scaled by $$1/n$$ in every direction. Its volume is exactly $$1/n^n$$ of the original. **This proves both the general bound and its equality case.**

The one-dimensional case just swaps the two endpoints of a segment; its length ratio is always $$1$$, so it has no unique maximizing meeting point.

## The same balance in every dimension

The geometry lets us move a point freely. Concurrency ties the resulting side or face points together. Once that constraint is written down, balancing the weights makes the inner figure largest.

For triangles, the ceiling is a quarter. For tetrahedra, it is a twenty-seventh. In every dimension, the maximizing picture comes from the same choice: **equal weights, meeting at the centroid**.

For related background, see Steven Landy’s [*A Generalization of Ceva’s Theorem to Higher Dimensions*](https://www.tandfonline.com/doi/abs/10.1080/00029890.1988.11972122), *The American Mathematical Monthly* **95** (1988), 936–939.
