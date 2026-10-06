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

Place an invertible smaller matrix in the lower-left corner. If every arrangement were singular, what would swapping two entries in the first row tell you about their cofactors? Then swap the top two entries in the last column.

<!-- solution -->

We use induction on $$n\ge2$$. For $$n=2$$, place a nonzero number in the lower-left corner; one exists because the four numbers are distinct. For $$n>2$$, use the induction hypothesis to arrange $$(n-1)^2$$ of the numbers as an invertible matrix $$B$$ in the lower-left corner. Thus in either case we have an invertible $$(n-1)\times(n-1)$$ block $$B$$. Fill the remaining positions arbitrarily to obtain $$A=(a_{ij})$$.

Suppose, for a contradiction, that every arrangement of the given numbers is singular. Let $$C_j$$ denote the first-row cofactors of $$A$$. In particular,

$$
C_n=(-1)^{1+n}\det B\ne0.
$$

Swapping the first-row entries in columns $$j$$ and $$k$$ leaves these cofactors unchanged. Expanding the two determinants along that row and subtracting gives

$$
0=(a_{1j}-a_{1k})(C_j-C_k).
$$

Since the entries are distinct, all the cofactors must have the same value $$C\ne0$$.

Now interchange $$a_{1n}$$ and $$a_{2n}$$ to obtain $$A'$$. This leaves $$B$$ unchanged. Applying the same first-row swapping argument to $$A'$$ shows that its first-row cofactors are also all equal to $$C$$: its last cofactor is still $$(-1)^{1+n}\det B$$.

For either matrix, replacing its first row by its second row produces two identical rows, hence determinant zero. Expanding along the replaced row therefore gives

$$
\sum_{j=1}^{n}a_{2j}C_j=0,
\qquad
\sum_{j=1}^{n}a'_{2j}C_j=0.
$$

The second rows differ only in their last entry. Subtracting these equations yields

$$
0=(a_{1n}-a_{2n})C_n,
$$

which is impossible: the two entries are distinct and $$C_n\ne0$$. This proves the base case and the induction step.
