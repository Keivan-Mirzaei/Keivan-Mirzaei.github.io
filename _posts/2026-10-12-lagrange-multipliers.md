---
layout: post
title: "Lagrange multipliers: follow the constraint"
description: "Explore the method of Lagrange multipliers for constrained optimization, with a visual perspective."
date: 2026-10-12 00:00:00 -0600
permalink: /notes/lagrange-multipliers/
format: exploration
image: /assets/images/exploration-thumbnails/lagrange-multipliers.svg
image_alt: An elliptical objective contour touches an elliptical constraint, with opposite gradient arrows.
tags: [calculus, optimization, information theory]
math: true
widgets: [lagrange-multipliers]
problem_disclosures: true
---

Find the minimum of

$$
f(x,y)=(x-2)^2+4y^2
$$

subject to

$$
g(x,y)=x^2+2y^2=1.
$$

This is a constrained optimization problem: we want to minimize $$f$$, but only among the points on the ellipse $$g=1$$. Without the constraint, $$f$$ has minimum zero at $$A=(2,0)$$. But $$g(A)=4$$, so this point is inadmissible. Setting $$\nabla f=0$$ does not solve our problem: a direction that decreases $$f$$ may leave the allowed curve. The method of Lagrange multipliers specifies a necessary condition for a constrained extremum: the gradients of $$f$$ and $$g$$ must be parallel. We will explore this condition visually, then solve the problem.



## Height, contours, and steepest ascent

The graph $$z=h(x,y)$$ of a scalar function is a height field. A horizontal cut $$z=c$$ gives a **contour**, the inputs satisfying $$h(x,y)=c$$. Our constraint is the height-one contour of $$g$$. Lifting those same inputs onto the graph of $$f$$ shows the values we may attain.

For a unit input direction $$v$$ through a point $$P$$, the chain rule gives the slope

$$
\left.\frac{d}{dt}h(P+tv)\right|_{t=0}
=\nabla h(P)\cdot v.
$$

This is the **directional derivative** of $$h$$ at $$P$$ in the direction $$v$$. This implies the following three facts:

1. The directional derivative is maximized when $$v$$ points in the direction of the gradient.
2. The directional derivative is minimized when $$v$$ points in the **opposite** direction of the gradient.
3. The directional derivative is zero when $$v$$ is **perpendicular** to the gradient.

To see this, observe that the third fact is immidiate and by Cauchy–Schwarz, for every unit $$v$$,

$$
-\lVert\nabla h(P)\rVert\leq\nabla h(P)\cdot v\leq\lVert\nabla h(P)\rVert.
$$

Given that $$\nabla h(P) \neq 0$$, the equalities hold when $$v$$ is parallel or antiparallel to the gradient. The gradient's magnitude is therefore the largest slope at $$P$$ and the negative of that magnitude is the smallest slope.

On the other hand, if $$v$$ is perpendicular to the gradient, the slope is zero. This means that moving in a direction tangent to a contour does not change the function's value immidiately. The gradient is therefore normal to the contour.

In [Surfaces, contours, and gradients](#lagrange-sections), move the point and change the direction. Follow each gradient to compare the chosen arrow with steepest ascent.

{% include widgets/lagrange-multipliers.html id='lagrange-sections' %}

At the starting point $$P=(0,1/\sqrt2)$$, the unit tangent $$T=(-1,0)$$ gives objective slope $$4$$ and constraint slope zero. Yet the largest upward slopes are $$4\sqrt3$$ for $$f$$ and $$2\sqrt2$$ for $$g$$. The tangent is not the steepest ascent direction.



## What the constraint permits

If a path $$\gamma(s)$$ stays on $$g=1$$, differentiating gives

$$
\nabla g(\gamma(s))\cdot\gamma'(s)=0.
$$

The gradient is therefore perpendicular to the constraint's tangent. We can observe this in [Surfaces, contours, and gradients](#lagrange-sections) by looking at the contour of $$g$$ from above and following the tangent. The gradient always stays perpendicular to the tangent.

At an ordinary point, one of the two tangent directions decreases $$f$$. One just needs to follow the constraint in that direction to find a smaller value. But at a constrained extremum, both tangent directions give zero slope for $$f$$. The gradient is therefore perpendicular to the tangent, and the two gradients are parallel.

Equivalently, the objective contour and constraint have the same tangent where they touch. At the minimum, the two gradients point oppositely; at the maximum, they point the same way. Both satisfy the following theorem.

## The Lagrange multiplier theorem

<div id="lagrange-theorem" markdown="1">

Let $$f,g:U\to\mathbb R$$ be continuously differentiable on an open set $$U\subseteq\mathbb R^n$$. Suppose $$a$$ is a local extremum of $$f$$ subject to $$g(x)=c$$, and $$\nabla g(a)\ne0$$. Then a real number $$\lambda$$ exists such that

$$
\begin{gathered}
\nabla f(a)=\lambda\nabla g(a),\\
g(a)=c.
\end{gathered}
\tag{1}
$$

The number $$\lambda$$ is a **Lagrange multiplier**.

</div>

The regularity assumption together with the non-vanishing gradient condition lets the implicit function theorem describe the constraint locally as a smooth surface. Its tangent vectors are exactly those perpendicular to $$\nabla g(a)$$, and each is the velocity of a path on the surface. At an extremum, differentiating $$f$$ along every such path gives zero. Thus $$\nabla f(a)$$ is perpendicular to the whole tangent space and is a multiple of $$\nabla g(a)$$.

Now we can solve the problem. The gradients are

$$
\nabla f=\binom{2(x-2)}{8y},
\qquad
\nabla g=\binom{2x}{4y}.
$$

The constraint gradient vanishes only at the origin, which is not on $$g=1$$. Applying [(1)](#lagrange-theorem) gives

$$
\begin{aligned}
2(x-2)&=2\lambda x,\\
8y&=4\lambda y,\\
x^2+2y^2&=1.
\end{aligned}
$$

If $$y\ne0$$, the second equation forces $$\lambda=2$$. The first then gives $$x=-2$$, impossible on the ellipse. Therefore $$y=0$$, so $$x=\pm1$$. The two candidates are

$$
\begin{array}{c|c|c}
(x,y)&\lambda&f(x,y)\\ \hline
(1,0)&-1&1\\
(-1,0)&3&9
\end{array}
$$

The ellipse is compact and $$f$$ is continuous, so a global minimum and maximum exist. Both must satisfy the multiplier equations, and these are the only candidates. Hence the **unique minimum is $$1$$ at $$(1,0)$$**, and the unique maximum is $$9$$ at $$(-1,0)$$.

Select these points in the [maps](#lagrange-sections). At the minimum, $$\nabla f=(-2,0)$$ and $$\nabla g=(2,0)$$; at the maximum, they are $$(-6,0)$$ and $$(-2,0)$$. The multiplier records their direction and relative magnitude.

## A problem about discrete entropy

Let $$q=(q_1,\ldots,q_n)$$ be a fixed probability distribution with $$q_i>0$$ and $$n\geq2$$. Choose $$p$$ with $$p_i>0$$ and $$\sum_i p_i=1$$. Using natural logarithms, define the **cross entropy**

$$
C_q(p)=\sum_{i=1}^n q_i\log\frac1{p_i}.
$$

Use Lagrange multipliers to find its stationary point, then prove that it is the unique global minimum, attained at $$p=q$$. What is the minimum value?

<div class="problem-disclosures">
<details class="problem-hint">
<summary>Hint</summary>
<div class="solution-content" markdown="1">

Apply [(1)](#lagrange-theorem) to $$g(p)=\sum_i p_i$$. Compare the components of the gradients, then use the strict convexity of $$-\log u$$ for $$u>0$$.

</div>
</details>
<details class="problem-solution">
<summary>Solution</summary>
<div class="solution-content" markdown="1">

Since $$\nabla g=(1,\ldots,1)$$, the multiplier equations are

$$
-\frac{q_i}{p_i}=\lambda
\quad(i=1,\ldots,n).
$$

Multiplying by $$p_i$$ and summing gives $$\lambda=-1$$. Hence $$p_i=q_i$$ for every $$i$$, and

$$
\min_p C_q(p)=\sum_i q_i\log\frac1{q_i}=H(q),
$$

the Shannon entropy of $$q$$, measured in nats.

The Hessian of $$C_q$$ is diagonal with positive entries $$q_i/p_i^2$$, so the function is strictly convex. Its supporting-plane inequality at $$q$$ gives

$$
\begin{aligned}
C_q(p)&\geq C_q(q)\\
&\quad+\nabla C_q(q)\cdot(p-q)\\
&=C_q(q)-\sum_i(p_i-q_i)\\
&=C_q(q).
\end{aligned}
$$

Strict convexity makes equality possible only at $$p=q$$. This certifies the unique global minimum.

</div>
</details>
</div>
