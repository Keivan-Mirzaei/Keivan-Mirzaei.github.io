---
title: "Hilbert Matrices"
description: "A deceptively simple matrix: can you prove it is always nonsingular?"
format: problem
category: math
tags: ["linear algebra", "analysis"]
kind: Problem & proof
math: true
archived: true
---

Prove that the matrix given by

$$
\begin{bmatrix}
1 & \frac 12 & \dots & \frac 1n\\
\frac 12 & \frac 13 & \dots & \frac 1{n+1}\\
\vdots & \vdots & \ddots & \vdots\\
\frac 1n & \frac 1{n+1} & \dots & \frac 1{2n-1}\\
\end{bmatrix}
$$

is non-singular.

<!-- solution -->

Observe that if we denote the matrix above with $$H = [H_{ij}]$$, then we have

$$
H_{ij} = \int_{0}^{1} t^{i+j-2}\,dt.
$$

Now let $$\vec{x} = (x_1, x_2, \dots, x_n)^\intercal \neq \vec 0$$ be an arbitrary column vector. Some straightforward calculations give:

$$
\begin{align}
\vec{x}^\intercal H \vec{x}
&= \sum_{i, j=1}^{n}x_i x_j\int_{0}^{1} t^{i+j-2}\,dt\\
&= \int_{0}^{1}\left(\sum_{i=1}^{n} x_it^{i-1}\right)^2\,dt > 0.
\end{align}
$$

Therefore, the only solution to the equation $$H\vec x = \vec 0$$ is the trivial solution and the conclusion follows.
