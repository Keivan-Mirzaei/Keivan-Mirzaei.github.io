---
title: "How big can a cevian triangle be?"
description: "Three lines meet. Three side points make a triangle. Move the meeting point—and discover why a quarter is the most you can get."
date: 2026-10-01 23:44:45 +0000
format: exploration
image: /assets/images/exploration-thumbnails/cevian-triangles.svg
image_alt: An outer triangle with three cevians and a shaded green medial triangle.
tags: [geometry, inequalities, simplexes]
math: true
widgets: [cevian-triangles]
---

Choose a point $$O$$ strictly inside a triangle $$ABC$$. The lines $$AO,BO,CO$$ meet the opposite sides at $$X,Y,Z$$, respectively. **How large can the area of $$XYZ$$ be relative to the area of $$ABC$$?**

A segment from a vertex to the opposite side is a **cevian**. Our three cevians must meet at the same point; their side points cannot be chosen independently.

Explore **Move the meeting point** below, including its Info panel.

{% include widgets/cevian-explorer.html %}

At the centroid, the side points are midpoints. The inner triangle and the three corner triangles then have equal areas, so the inner triangle occupies **one quarter** of the whole. Moving $$O$$ suggests that this is the maximum. Changing the outer triangle’s shape suggests that the bound does not depend on its angles.

Those are useful guesses. To prove them, we need to express both the common meeting point and the area in the same variables.

## The meeting point ties three ratios together

Write the side fractions as

$$
\begin{aligned}
\alpha&=\frac{BX}{BC},\\
\beta&=\frac{CY}{CA},\\
\gamma&=\frac{AZ}{AB}.
\end{aligned}
$$

All lie strictly between $$0$$ and $$1$$. The [three-area diagram](#cv-ceva-title) reveals the constraint imposed by concurrency.

{% include widgets/cevian-ceva.html %}

Let $$p=[OBC]$$, $$q=[OCA]$$, and $$r=[OAB]$$, where brackets denote area. Triangles $$ABO$$ and $$ACO$$ share base $$AO$$. Extending that base to $$AX$$ scales both areas by the same factor. The resulting triangles $$ABX$$ and $$ACX$$ have the same altitude to $$BC$$, so

$$
\begin{aligned}
\frac{BX}{XC}&=\frac rq,\\
\frac{CY}{YA}&=\frac pr,\\
\frac{AZ}{ZB}&=\frac qp.
\end{aligned}
$$

Multiplying cancels all three areas. In terms of the side fractions, this gives the part of Ceva’s theorem we need:

<div id="concurrency-balance" markdown="1">

$$
\begin{aligned}
\alpha\beta\gamma&=(1-\alpha)(1-\beta)\\
&\qquad\cdot(1-\gamma).
\end{aligned}
\tag{1}
$$

</div>

## Remove the corners to find the area

The three corner triangles are easier to measure than $$XYZ$$ itself.

{% include widgets/cevian-corners.html %}

For example, $$AYZ$$ and $$ABC$$ share their angle at $$A$$. The area formula using two sides and their included angle gives

$$
\frac{[AYZ]}{[ABC]}
=\frac{AY}{AC}\frac{AZ}{AB}
=(1-\beta)\gamma.
$$

The other corner fractions are $$(1-\gamma)\alpha$$ and $$(1-\alpha)\beta$$. Thus, for $$R=[XYZ]/[ABC]$$,

$$
\begin{aligned}
R&=1-\gamma(1-\beta)\\
 &\quad-\alpha(1-\gamma)-\beta(1-\alpha)\\
 &=1-\alpha-\beta-\gamma\\
 &\quad+\alpha\beta+\beta\gamma+\gamma\alpha.
\end{aligned}
$$

Expanding the right-hand product in [Ceva’s balance (1)](#concurrency-balance) gives $$R-\alpha\beta\gamma$$. Since that product also equals $$\alpha\beta\gamma$$, the area simplifies to

<div id="cevian-area" markdown="1">

$$
R=2\alpha\beta\gamma.
\tag{2}
$$

</div>

The concurrency constraint has turned a subtraction of three areas into a single product. At the midpoints, it gives $$2(1/2)^3=1/4$$, as expected.

## Make the constraint useful

The side ratios

$$
\begin{aligned}
a&=\frac{\alpha}{1-\alpha},\\
b&=\frac{\beta}{1-\beta},\\
c&=\frac{\gamma}{1-\gamma}.
\end{aligned}
$$

are positive and satisfy $$abc=1$$ by [equation (1)](#concurrency-balance). Since $$\alpha=a/(1+a)$$, and similarly for the other two fractions, [equation (2)](#cevian-area) becomes

$$
R=\frac{2}{(1+a)(1+b)(1+c)}.
$$

We now need a lower bound for the denominator. The identity $$(\sqrt t-1)^2\geq0$$ gives $$1+t\geq2\sqrt t$$ for every positive $$t$$, with equality only at $$t=1$$.

{% include widgets/cevian-factors.html %}

The [paired bars](#cv-factors-title) show those three comparisons. Multiplying them yields

$$
(1+a)(1+b)(1+c)\geq8\sqrt{abc}=8,
$$

so **$$R\leq1/4$$**. Equality requires $$a=b=c=1$$, hence $$\alpha=\beta=\gamma=1/2$$. The midpoints attain the bound, and their cevians meet at the centroid.

{% include widgets/cevian-landscape.html %}

The [area landscape](#cv-landscape-title) gathers the possible meeting points into one picture. Its unique peak now has a proof. The calculation used only side fractions, which also explains why stretching or slanting the outer triangle in the [meeting-point explorer](#cv-explorer-title) leaves the bound unchanged.

## Does the same idea survive in three dimensions?

In a tetrahedron, each vertex has an opposite triangular face. Continue the line from each vertex through an interior point $$O$$ to that face. The four contact points form an inner tetrahedron.

{% include widgets/cevian-simplex.html %}

When $$O$$ is the centroid $$G$$, the contacts are the face centroids. Each is obtained from its opposite vertex by reflecting through $$G$$ and shrinking lengths by $$1/3$$. The volume ratio is therefore $$(1/3)^3=1/27$$.

The [tetrahedron explorer](#cv-simplex-title) suggests that this is again the maximum. The triangle proof depended on cutting off corners; in higher dimensions it is more useful to describe the common point by weights.

## Weights give the bound in every dimension

An **$$n$$-simplex** has $$n+1$$ affinely independent vertices $$A_1,\ldots,A_{n+1}$$. A triangle has $$n=2$$ and a tetrahedron has $$n=3$$. Every interior point is uniquely a weighted average

$$
\begin{gathered}
O=\sum_iw_iA_i,\\
w_i>0,\qquad\sum_iw_i=1.
\end{gathered}
$$

Separating the contribution of vertex $$A_i$$ shows that its opposite contact is

$$
\begin{gathered}
X_i=\sum_{j\ne i}\frac{w_j}{1-w_i}A_j,\\
O=w_iA_i+(1-w_i)X_i.
\end{gathered}
$$

The coefficients of $$X_i$$ are positive and sum to one, so it lies inside the opposite face. These formulas describe every admissible configuration.

To calculate volume, form the matrix $$M$$ of those coefficients: its diagonal is zero and $$M_{ij}=w_j/(1-w_i)$$ for $$i\ne j$$. Appending a final coordinate $$1$$ to each vertex makes the simplex volume proportional to its coordinate determinant. The contact matrix is $$M$$ times the outer coordinate matrix, so the volume ratio is $$\lvert\det M\rvert$$.

Multiplying row $$i$$ by $$1-w_i$$ and dividing column $$j$$ by $$w_j$$ turns $$M$$ into $$J-I$$, where $$J$$ is the all-ones matrix. This matrix multiplies the all-ones vector by $$n$$ and every vector with coordinate sum zero by $$-1$$. Its determinant is $$n(-1)^n$$. Consequently,

<div id="simplex-volume" markdown="1">

$$
R_n=n\prod_{i=1}^{n+1}\frac{w_i}{1-w_i}.
\tag{3}
$$

</div>

Apply the arithmetic–geometric mean inequality to the other $$n$$ weights for each $$i$$:

$$
1-w_i=\sum_{j\ne i}w_j
\geq n\left(\prod_{j\ne i}w_j\right)^{1/n}.
$$

Multiplying all $$n+1$$ inequalities counts each weight $$n$$ times with exponent $$1/n$$, giving

$$
\prod_i(1-w_i)\geq n^{n+1}\prod_iw_i.
$$

Substitution into the [volume formula (3)](#simplex-volume) proves **$$R_n\leq1/n^n$$**. For $$n\geq2$$, equality in every comparison forces all weights to be equal. Each contact is then the centroid of its opposite face, and

$$
X_i=G-\frac1n(A_i-G).
$$

Thus the maximizing inner simplex is a reflected copy of the outer one, scaled by $$1/n$$. Equal weights explain both the maximum and its geometry. In one dimension the contacts simply exchange the segment’s endpoints; the length ratio is always one, with no unique maximizing meeting point.

For related background, see Steven Landy’s [*A Generalization of Ceva’s Theorem to Higher Dimensions*](https://www.tandfonline.com/doi/abs/10.1080/00029890.1988.11972122), *The American Mathematical Monthly* **95** (1988), 936–939.
