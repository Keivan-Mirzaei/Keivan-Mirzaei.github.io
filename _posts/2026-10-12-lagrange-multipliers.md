---
layout: post
title: "Lagrange multipliers: follow the constraint"
description: "Explore two 3D height fields, their contours and steepest ascent, then solve a constrained minimum and an entropy problem."
date: 2026-10-12 00:00:00 -0600
permalink: /notes/lagrange-multipliers/
format: exploration
image: /assets/images/exploration-thumbnails/lagrange-multipliers.svg
image_alt: A tilted elliptical objective contour touches a quartic oval constraint, with opposite gradient arrows.
tags: [calculus, optimization, information theory]
math: true
widgets: [lagrange-multipliers]
problem_disclosures: true
---

Find the minimum of the scalar function

$$
\begin{aligned}
f(x,y)&=(x-2)^2+(x-2)(y-1)\\
&\quad+3(y-1)^2
\end{aligned}
$$

subject to the curve constraint

$$
g(x,y)=x^2+2y^2+\frac{(x-y)^4}{4}=1.
$$

The objective has tilted elliptical contours. The constraint function has oval contours whose shape changes with their level: the quartic term penalizes separation between the coordinates. Neither family consists of circles. Partial derivatives and the chain rule are enough to follow the central argument; convexity will certify the final minimum.

## An unconstrained attempt

Completing a square gives

$$
\begin{aligned}
f(x,y)&=\left(x-2+\frac{y-1}{2}\right)^2\\
&\quad+\frac{11}{4}(y-1)^2.
\end{aligned}
$$

Without the constraint, the minimum is zero at $$A=(2,1)$$. But $$g(A)=25/4$$, so this point is inadmissible. Setting $$\nabla f=0$$ solves the wrong problem. At a constrained minimum, the gradient need not vanish: an improving direction may leave the allowed curve.

Writing $$d=x-y$$, the two gradients are

$$
\begin{aligned}
\nabla f(x,y)&=\binom{2x+y-5}{x+6y-8},\\[6pt]
\nabla g(x,y)&=\binom{2x+d^3}{4y-d^3}.
\end{aligned}
$$

Their directions vary differently across the plane. Understanding those directions will tell us how the constraint blocks improvement.

## Height, contours, and steepest ascent

For a differentiable scalar function $$h$$, the graph $$z=h(x,y)$$ is a height field. Cutting it with a horizontal plane $$z=c$$ gives a **contour**, the set of inputs satisfying $$h(x,y)=c$$. Thus our constraint is the height-one contour of the second graph; lifting those same inputs onto the first graph gives the objective values we may attain.

A unit input direction $$v$$ through $$P$$ gives the cross section $$t\mapsto h(P+tv)$$. Its slope at zero is

$$
\left.\frac{d}{dt}h(P+tv)\right|_{t=0}
=\nabla h(P)\cdot v.
$$

In [Surfaces, contours, and gradients](#lagrange-sections), rotate the maps, move the feasible point, and change the section direction. Compare the observed slopes with the reported maximum upward slopes. Follow each gradient to test the proposed maximizing direction; Info explains the arrows and controls.

{% include widgets/lagrange-multipliers.html id='lagrange-sections' %}

At the starting point $$P\approx(0,0.687)$$, the tangent direction gives objective slope about $$4.70$$. Yet the greatest upward slope is about $$5.80$$. For the constraint function the tangent slope is zero, while its greatest upward slope is about $$3.09$$. The tangent to the constraint is therefore generally not the direction of steepest ascent of either function.

This observation has a proof. By Cauchy–Schwarz, for every unit input direction,

$$
\nabla h(P)\cdot v\leq\lVert\nabla h(P)\rVert.
$$

When the gradient is nonzero, equality holds precisely at

$$
v=\frac{\nabla h(P)}{\lVert\nabla h(P)\rVert}.
$$

The gradient points toward the **steepest first-order ascent**, its magnitude is the maximum slope, and its negative gives steepest descent. This is a local statement: a large finite step can behave differently. When the gradient is zero, every first-order directional slope is zero.

The gradient also points normally to the contour. If a path $$\gamma(s)$$ follows $$h=c$$, differentiating the identity gives

$$
\nabla h(\gamma(s))\cdot\gamma'(s)=0.
$$

A regular contour's tangent is perpendicular to its gradient. On the maps, gradients are vectors in the **input plane**. Their lifted arrows lie in the graph's tangent plane and show the resulting slopes; the three-dimensional graph normal is proportional to $$(-h_x,-h_y,1)$$. These are different geometric objects.

## What the constraint permits

At a point $$P$$ with $$g(P)=1$$, choose a unit tangent $$T$$ perpendicular to $$\nabla g(P)$$. Then $$\nabla g(P)\cdot T=0$$: moving in that direction has no first-order effect on the constraint. At an ordinary point, $$\nabla f(P)\cdot T$$ is nonzero, and one direction along the curve improves the objective.

The straight line $$P+tT$$ does **not** remain on the curve. It agrees with a feasible path only to first order. For this strictly convex $$g$$, every nonzero straight tangent step actually gives $$g(P+tT)>1$$. The cross sections show that distinction; the curve profile keeps $$g=1$$ exactly.

At a constrained extremum, both tangent slopes vanish. Both gradients must then lie on the same normal line, making one a scalar multiple of the other. At the minimum in this example they point oppositely; at the maximum they point the same way. “Parallel” allows either sign.

Equivalently, an objective contour just touching the allowed curve has the same tangent there. Its normal $$\nabla f$$ and the constraint normal $$\nabla g$$ are parallel. This tangency condition survives the change from circles to noncircular contours.

## The Lagrange multiplier theorem

<div id="lagrange-theorem" markdown="1">

**One equality constraint.** Let $$f,g:U\to\mathbb R$$ be continuously differentiable on an open set $$U\subseteq\mathbb R^n$$, with $$n\geq2$$. Suppose $$a\in U$$ is a local minimum or maximum of $$f$$ among points satisfying $$g(x)=c$$. If $$\nabla g(a)\ne0$$, then there is a real number $$\lambda$$ such that

$$
\begin{gathered}
\nabla f(a)=\lambda\nabla g(a),\\
g(a)=c.
\end{gathered}
\tag{1}
$$

The number $$\lambda$$ is a **Lagrange multiplier**.

</div>

Why does this hold? The regularity condition $$\nabla g(a)\ne0$$ lets the implicit function theorem describe the constraint near $$a$$ as a smooth surface. Its tangent vectors are exactly those $$v$$ satisfying $$\nabla g(a)\cdot v=0$$, and each is the velocity of a path on that surface. At an extremum, differentiating $$f$$ along every such path gives $$\nabla f(a)\cdot v=0$$. Therefore $$\nabla f(a)$$ lies in the one-dimensional normal space spanned by $$\nabla g(a)$$. This proves [(1)](#lagrange-theorem).

Equivalently, define the **Lagrangian**

$$
\mathcal L(x,\lambda)=f(x)-\lambda(g(x)-c).
$$

Its stationary equations in $$x$$ and $$\lambda$$ are precisely [(1)](#lagrange-theorem). The sign convention is a choice; using a plus sign changes the sign of the multiplier.

These equations give **candidates**, not a minimum certificate. A maximum also satisfies them, and some stationary points are neither. The nonzero-gradient assumption matters too: under $$x^2+y^2=0$$, the only feasible point is the origin, so it minimizes $$f(x,y)=x$$ even though no multiplier can express $$(1,0)$$ as a multiple of $$(0,0)$$.

For another presentation of the tangent-space argument, see [MIT’s proof of Lagrange multipliers](https://ocw.mit.edu/courses/18-02sc-multivariable-calculus-fall-2010/pages/2.-partial-derivatives/part-c-lagrange-multipliers-and-constrained-differentials/session-40-proof-of-lagrange-multipliers/).

## Solve the oval problem

The constraint gradient vanishes only at the origin. For $$P=(x,y)$$, indeed,

$$
P\cdot\nabla g(P)=2x^2+4y^2+d^4,
$$

which is positive away from zero. The origin is not on $$g=1$$, so the theorem applies everywhere on our curve. Its equations are

$$
\begin{aligned}
2x+y-5&=\lambda(2x+d^3),\\
x+6y-8&=\lambda(4y-d^3),\\
x^2+2y^2+\frac{d^4}{4}&=1,\\
d&=x-y.
\end{aligned}
$$

These equations are nonlinear; solving them numerically gives the minimum candidate

$$
\begin{gathered}
P_*\approx(0.708260,\ 0.498943),\\
\lambda_*\approx-2.163538,\\
f(P_*)\approx3.069003.
\end{gathered}
$$

The digits describe a numerical approximation, not a proof that the candidate is the minimum. To make the computation reproducible, intersect a ray $$r(\cos\theta,\sin\theta)$$ with $$g=1$$. Define

$$
\begin{gathered}
a=\cos^2\theta+2\sin^2\theta,\\
b=\frac{(\cos\theta-\sin\theta)^4}{4},\\
r^2=\frac{2}{a+\sqrt{a^2+4b}}.
\end{gathered}
$$

The positive radius gives one feasible point in every direction. The tangent slope of $$f$$ changes sign between $$35^\circ$$ and $$36^\circ$$. Bisection of that zero gives $$\theta_*\approx35.1633^\circ$$ and the candidate above. The multiplier is recovered from

$$
\lambda_*=
\frac{\nabla f(P_*)\cdot\nabla g(P_*)}
{\lVert\nabla g(P_*)\rVert^2}.
$$

For certification, the important extra fact is **convexity**. The Hessians, or matrices of second partial derivatives, satisfy

$$
\nabla^2 f=\begin{pmatrix}2&1\\1&6\end{pmatrix},
$$

and

$$
\begin{aligned}
\nabla^2 g&=\begin{pmatrix}2&0\\0&4\end{pmatrix}\\
&\quad+3d^2\begin{pmatrix}1&-1\\-1&1\end{pmatrix}.
\end{aligned}
$$

Both are positive definite everywhere. An exact negative-multiplier solution exists: the convex compact region $$g\leq1$$ has a unique minimizer of the strictly convex $$f$$. It must lie on the boundary, since the unconstrained minimum $$A$$ lies outside. At that point an inward feasible direction cannot decrease $$f$$, so the multiplier is nonpositive; it cannot be zero because $$\nabla f$$ vanishes only at $$A$$. Thus $$\lambda_*<0$$. Consequently

$$
\begin{aligned}
\mathcal L_*(x,y)&=f(x,y)\\
&\quad-\lambda_*\bigl(g(x,y)-1\bigr)
\end{aligned}
$$

is strictly convex, and its gradient vanishes at $$P_*$$. It therefore has a unique global minimum there. On every feasible point, $$\mathcal L_*=f$$, so **$$P_*$$ uniquely minimizes the constrained objective**. Numerical root-finding locates the candidate; this argument certifies its mathematical role.

The other displayed stationary point is

$$
\begin{gathered}
P^*\approx(-0.627670,\ -0.550464),\\
\lambda^*\approx5.419495,\\
f(P^*)\approx18.190575.
\end{gathered}
$$

Its tangent-slope zero lies between $$221^\circ$$ and $$222^\circ$$. It is the unique global maximum: $$\nabla^2g\geq2I$$, while the largest eigenvalue of $$\nabla^2f$$ is $$4+\sqrt5$$. Because $$\lambda^*>4$$, the corresponding Lagrangian is strictly concave everywhere. The same stationary-point argument now certifies a maximum. Here a matrix inequality means the difference is positive semidefinite, and $$I$$ is the identity matrix.

Selecting the two points in the [maps](#lagrange-sections) exposes the theorem's limitation: both have parallel gradients and zero tangent slopes. Convexity or another classification argument is still needed. In particular, both straight tangent sections of the quadratic $$f$$ curve upward; at the constrained maximum those straight lines leave the feasible curve. To assess a constrained extremum, follow the constraint or use a certificate that accounts for it.

## A problem about discrete entropy

Let $$q=(q_1,\ldots,q_n)$$ be a **fixed** probability distribution with $$q_i>0$$ and $$n\geq2$$. Choose a probability distribution $$p$$ with $$p_i>0$$ and $$\sum_i p_i=1$$. Using natural logarithms, define the **cross entropy**

$$
C_q(p)=\sum_{i=1}^n q_i\log\frac1{p_i}.
$$

This is the expected surprise when outcomes follow $$q$$ but probabilities are assigned using $$p$$. Use Lagrange multipliers to find its stationary point, then prove that it is the unique global **minimum**, attained at $$p=q$$. What is the minimum value? Why is a stationary-point calculation alone insufficient?

The direction of optimization matters: equivalently, $$\sum_i q_i\log p_i=-C_q(p)$$ is **maximized** at $$p=q$$. The logarithmic loss itself becomes arbitrarily large as a positive-weight outcome receives probability approaching zero.

<div class="problem-disclosures">
<details class="problem-hint">
<summary>Hint</summary>
<div class="solution-content" markdown="1">

Apply [(1)](#lagrange-theorem) to $$g(p)=\sum_i p_i$$. Compare the components of $$\nabla C_q(p)$$ and $$\nabla g(p)$$. To certify the result, examine the curvature of $$-\log u$$ for $$u>0$$.

</div>
</details>
<details class="problem-solution">
<summary>Solution</summary>
<div class="solution-content" markdown="1">

The constraint gradient is $$(1,\ldots,1)$$, so it never vanishes. The multiplier equations are

$$
-\frac{q_i}{p_i}=\lambda
\quad(i=1,\ldots,n).
$$

Multiplying by $$p_i$$ and summing gives $$-1=\lambda$$. Hence $$p_i=q_i$$ for every $$i$$, and

$$
\begin{aligned}
\min_p C_q(p)&=C_q(q)\\
&=\sum_i q_i\log\frac1{q_i}=H(q),
\end{aligned}
$$

the Shannon entropy of $$q$$, measured in nats.

For the global claim, the Hessian is diagonal with positive entries $$q_i/p_i^2$$. Thus $$C_q$$ is strictly convex on the positive orthant, and on its convex probability simplex. More explicitly, the supporting-plane inequality at $$q$$ gives

$$
\begin{aligned}
C_q(p)&\geq C_q(q)
+\nabla C_q(q)\cdot(p-q)\\
&=C_q(q)-\sum_i(p_i-q_i)\\
&=C_q(q),
\end{aligned}
$$

with equality only at $$p=q$$ by strict convexity. Approaching the boundary sends at least one positive-weight term to infinity, so no boundary limit improves this value. The theorem finds the candidate; convexity certifies it.

Subtracting the minimum gives a familiar quantity:

$$
\begin{aligned}
C_q(p)-H(q)&=\sum_i q_i\log\frac{q_i}{p_i}\\
&=D(q\Vert p)\geq0.
\end{aligned}
$$

This is Gibbs’ inequality for discrete KL divergence. It measures the extra expected logarithmic loss from choosing $$p$$ instead of the true distribution $$q$$.

</div>
</details>
</div>
