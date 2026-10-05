---
title: "Hilbert matrices"
description: "A deceptively simple matrix: can you prove it is always nonsingular?"
format: problem
category: math
tags: ["linear algebra", "analysis"]
kind: Problem & proof
math: true
archived: true
---

For a positive integer $$n$$, prove that the Hilbert matrix

$$
H=\left(\frac{1}{i+j-1}\right)_{i,j=1}^{n}
$$

is nonsingular.

The solution uses definite integrals.

<!-- hint -->

Write each entry as the integral of a power of $$t$$.

<!-- solution -->

The entries are inner products of monomials:

$$
H_{ij}=\int_0^1 t^{i-1}t^{j-1}\,dt.
$$

For any nonzero real column vector $$v=(v_1,\ldots,v_n)^\mathsf{T}$$,

$$
v^\mathsf{T}Hv
=\int_0^1\left(\sum_{i=1}^{n}v_it^{i-1}\right)^2\,dt>0.
$$

The polynomial inside the square is nonzero. It has only finitely many roots and is continuous, so its square is positive on some interval in $$(0,1)$$. This justifies the strict inequality.

If $$Hv=0$$, then $$v^\mathsf{T}Hv=0$$, forcing $$v=0$$. Hence $$H$$ is nonsingular.
