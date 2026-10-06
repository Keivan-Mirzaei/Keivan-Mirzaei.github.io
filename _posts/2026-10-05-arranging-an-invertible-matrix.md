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

We use induction on $$n\ge2$$. For $$n=2$$, place a nonzero number in the lower-left corner; one exists because the four numbers are distinct. For $$n>2$$, use the induction hypothesis to arrange $$(n-1)^2$$ of the numbers as an invertible matrix $$B$$ in the lower-left corner. Thus in either case we have an invertible $$(n-1)\times(n-1)$$ block $$B$$. Fill the first row and last column arbitrarily to obtain $$A=(a_{ij})$$, as in [Figure 1](#matrix-block).

<figure id="matrix-block" class="problem-figure">
  <img src="{{ '/assets/figures/invertible-matrix-block.svg' | relative_url }}" alt="An n-by-n matrix with its invertible block B shaded in the lower-left corner. Removing the first row and last column leaves B." width="440" height="330" loading="lazy">
  <figcaption>Figure 1. The shaded block is the minor for the top-right entry.</figcaption>
</figure>

Suppose, for a contradiction, that every arrangement of the given numbers is singular. Let $$C_j$$ denote the first-row cofactors of $$A$$. In particular,

$$
C_n=(-1)^{1+n}\det B\ne0.
$$

For any $$j<n$$, swap $$a_{1j}$$ and $$a_{1n}$$ as in [Figure 2](#matrix-first-row-swap). Every first-row cofactor stays fixed, since it depends only on the lower rows. Expanding the two determinants along the first row and subtracting gives

$$
0=(a_{1j}-a_{1n})(C_j-C_n).
$$

<figure id="matrix-first-row-swap" class="problem-figure">
  <img src="{{ '/assets/figures/invertible-matrix-first-row-swap.svg' | relative_url }}" alt="Two highlighted entries a subscript 1 j and a subscript 1 n exchange places in the first row. Every lower row stays fixed, so all first-row cofactors stay fixed." width="440" height="330" loading="lazy">
  <figcaption>Figure 2. Swap two first-row entries while keeping every cofactor fixed.</figcaption>
</figure>

Since the entries are distinct, $$C_j=C_n$$ for every $$j$$. Write their common nonzero value as $$C$$.

Now interchange $$a_{1n}$$ and $$a_{2n}$$ to obtain $$A'$$, as in [Figure 3](#matrix-last-column-swap). This leaves $$B$$ unchanged. Applying the same first-row swapping argument to $$A'$$ shows that its first-row cofactors are also all equal to $$C$$: its last cofactor is still $$(-1)^{1+n}\det B$$.

<figure id="matrix-last-column-swap" class="problem-figure">
  <img src="{{ '/assets/figures/invertible-matrix-last-column-swap.svg' | relative_url }}" alt="The top two last-column entries exchange places while B stays fixed. In the second row, a subscript 2 n becomes a subscript 1 n; all its other entries stay fixed." width="440" height="330" loading="lazy">
  <figcaption>Figure 3. Only the last entry of the second row changes.</figcaption>
</figure>

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
