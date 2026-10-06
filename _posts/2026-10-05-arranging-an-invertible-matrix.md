---
title: "Arranging an invertible matrix"
description: "Arrange any n² distinct real numbers in a square matrix with nonzero determinant."
format: problem
difficulty: 3
tags: [linear algebra, determinants, induction]
math: true
---

Given $$n^2$$ distinct real numbers, where $$n>1$$, prove that they can be arranged as the entries of an $$n\times n$$ matrix with nonzero determinant.

Prove this by induction on $$n$$.

<!-- hint -->

Place an invertible $$n\times n$$ matrix in the lower-left corner of an $$(n+1)\times(n+1)$$ matrix. Choose the first row to have nonzero sum, order its entries, and consider its cyclic rotations.

<!-- solution -->

For $$n=2$$, choose two of the four numbers $$c,d$$ with $$c+d\ne0$$, and call the remaining numbers $$a,b$$. Such a pair exists: for any chosen $$c$$, at most one other number equals $$-c$$. The determinants of

$$
\begin{pmatrix}a&b\\c&d\end{pmatrix}
\qquad\text{and}\qquad
\begin{pmatrix}b&a\\c&d\end{pmatrix}
$$

differ by $$(a-b)(c+d)\ne0$$, so at least one is nonzero.

Suppose the assertion holds for $$n\ge2$$, and put $$m=n+1$$. From the $$m^2$$ given numbers, reserve $$m$$ for the first row so that their sum is nonzero. This is always possible: if an initial choice has sum zero, replace one entry with an unused number. Distinctness ensures that the sum changes. Order these entries as

$$
x_1<x_2<\cdots<x_m,
\qquad S=x_1+\cdots+x_m\ne0.
$$

By the induction hypothesis, arrange $$n^2$$ of the remaining numbers as an invertible matrix $$B$$ in the lower-left corner. Fill the last column below the first row with the $$n$$ numbers left over.

Let $$C_j$$ be the cofactor of the entry in position $$(1,j)$$. These cofactors do not change when we rotate the first row, and

$$
C_m=(-1)^{1+m}\det B\ne0.
$$

Suppose all $$m$$ cyclic rotations of the first row give determinant zero. Expanding along that row gives the homogeneous system

$$
T\begin{pmatrix}C_1\\C_2\\\vdots\\C_m\end{pmatrix}=0,
\qquad
T=\begin{pmatrix}
x_1&x_2&\cdots&x_m\\
x_m&x_1&\cdots&x_{m-1}\\
\vdots&\vdots&\ddots&\vdots\\
x_2&x_3&\cdots&x_1
\end{pmatrix}.
$$

We show that this cyclic matrix has nonzero determinant. Put

$$
p(z)=x_1+x_2z+\cdots+x_mz^{m-1},
\qquad \omega=e^{2\pi i/m}.
$$

The circulant determinant formula gives

$$
\det T=\prod_{k=0}^{m-1}p(\omega^k).
$$

Indeed, for each $$m$$th root of unity $$z$$, the vector $$(1,z,\ldots,z^{m-1})^{\mathsf T}$$ is an eigenvector of $$T$$ with eigenvalue $$p(z)$$. These vectors form a Vandermonde basis because the roots are distinct.

The factor $$p(1)=S$$ is nonzero. For any other $$m$$th root of unity $$z$$, using $$z^m=1$$ gives

$$
(1-z)p(z)
=\sum_{j=2}^{m}(x_j-x_{j-1})(z^{j-1}-1).
$$

Every difference $$x_j-x_{j-1}$$ is positive. Each summand has nonpositive real part, and the summand with $$j=2$$ has strictly negative real part since $$\operatorname{Re}z<1$$. Thus $$p(z)\ne0$$, so every factor in the determinant formula is nonzero.

Consequently $$\det T\ne0$$, and the homogeneous system has only the trivial solution $$C_1=\cdots=C_m=0$$. This contradicts $$C_m\ne0$$. At least one cyclic rotation therefore has nonzero determinant, completing the induction.
