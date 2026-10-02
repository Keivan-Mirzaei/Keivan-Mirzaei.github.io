---
title: "Differentiability means local linearity"
description: "Understand a derivative as a first-order approximation, even when nearby behavior is irregular."
module_id: derivatives
module_step: 5
breadcrumb: "Derivatives / Lesson 5"
permalink: /notes/derivatives/local-linearity/
math: true
duration: "60–90 minutes, plus problem work"
widgets: [differentiability]
---

**Guiding question.** Must a function be smooth throughout a neighborhood to have a derivative at its center?

## The exact meaning of a tangent approximation

A function is differentiable at $$a$$ with derivative $$L$$ if and only if

$$
f(a+h)=f(a)+Lh+r(h),\qquad
\frac{r(h)}{\lvert h\rvert}\longrightarrow0.
$$

Indeed, subtract $$f(a)+Lh$$ and divide by $$h$$. The quotient tends to zero exactly when the defining derivative quotient tends to $$L$$; using $$\lvert h\rvert$$ changes only a sign, not whether this error tends to zero. The notation $$r(h)=o(\lvert h\rvert)$$ means this precise condition.

The affine function $$f(a)+Lh$$ is therefore the **first-order approximation** to $$f(a+h)$$. Its error must be small relative to the increment. An error that merely tends to zero establishes much less. For $$\lvert h\rvert$$ at zero, the zero-line error is $$\lvert h\rvert$$, so the relative error stays $$1$$. For $$h^2$$, the zero-line relative error is $$\lvert h\rvert$$ and tends to zero.

The slope is unique: if both $$L$$ and $$M$$ satisfy this condition, subtract the two expansions and divide by $$h$$ to conclude $$L-M=0$$.

For a concrete example, the square at $$a=1$$ satisfies $$f(1+h)=1+2h+h^2$$. At $$h=0.01$$, the tangent predicts $$1.02$$ and the exact value is $$1.0201$$. The error is $$0.0001$$, and its ratio to the increment is $$0.01$$. Halving the increment quarters the error and halves this ratio. This is what makes the tangent a first-order model.

## Zooming with the correct scale

Set $$h=\rho u$$, where $$\rho>0$$ is a zoom radius. The graph in magnified coordinates is

$$
u\longmapsto\frac{f(a+\rho u)-f(a)}\rho,
\qquad -1\le u\le1.
$$

Both axes are magnified equally. Differentiability implies that these graphs approach $$v=Lu$$ uniformly on this window. To see why, once $$\lvert r(h)\rvert\le\varepsilon\lvert h\rvert$$ for all sufficiently small $$h$$, their vertical error is at most $$\varepsilon\lvert u\rvert\le\varepsilon$$.

{% include widgets/differentiability.html id='derivative-local' model='square' %}

**Try.** First choose the parabola at $$a=1$$ and use candidate slope $$2$$. Zoom in. Then choose the absolute value at zero and try several slopes. Compare the normalized error bounds. Finally explore the oscillating and rational/irrational examples below. The inequalities, rather than the finite drawing, justify each conclusion.

## Oscillation need not prevent a derivative

Define

$$
w(x)=\begin{cases}x^2\sin(1/x),&x\ne0,\\0,&x=0.\end{cases}
$$

At zero, $$w(h)/h=h\sin(1/h)$$, whose absolute value is at most $$\lvert h\rvert$$. Thus $$w'(0)=0$$. Away from zero,

$$
w'(x)=2x\sin(1/x)-\cos(1/x).
$$

The derivative does not approach $$0$$ as $$x\to0$$. Along $$x_n=1/(2\pi n)$$ it equals $$-1$$; along $$z_n=1/((2n+1)\pi)$$ it equals $$1$$. So $$w$$ is differentiable everywhere, but $$w'$$ is discontinuous at zero. Differentiability of $$w$$ and continuity of $$w'$$ are different requirements.

## Differentiable at one point, discontinuous everywhere else

Let $$\mathbf1_{\mathbb Q}(x)$$ be $$1$$ when $$x$$ is rational and $$0$$ when $$x$$ is irrational. Consider

$$
D(x)=x^2\mathbf1_{\mathbb Q}(x)
=\begin{cases}x^2,&x\in\mathbb Q,\\0,&x\notin\mathbb Q.\end{cases}
$$

**Predict.** Rational and irrational numbers occur in every interval. Does this force $$D$$ to be nondifferentiable at zero?

It does not. Since $$D(0)=0$$,

$$
\left\lvert\frac{D(h)-D(0)}h\right\rvert
=\lvert h\mathbf1_{\mathbb Q}(h)\rvert
\le\lvert h\rvert\longrightarrow0.
$$

Hence $$D'(0)=0$$. The error from the zero tangent line is at most $$h^2=o(\lvert h\rvert)$$, regardless of the arithmetic type of $$h$$.

At any $$a\ne0$$, rational sequences approaching $$a$$ give values tending to $$a^2$$, while irrational sequences give values zero. These disagree, so $$D$$ is discontinuous at $$a$$ and consequently not differentiable there. Differentiability **at a point** does not assert differentiability, or even continuity, at nearby points.

The graph cannot be faithfully drawn by connecting finitely many sampled points. In the activity, the two branch guides and selected dots show the structure; they do not label every point on a guide as a point of the graph. The bound handles the infinitely many points the drawing cannot show.

## A related example from the reference book

Section 5.1 of *Problems in Real Analysis* gives the function

$$
B(x)=\begin{cases}x,&x\in\mathbb Q,\\x+x^2,&x\notin\mathbb Q.\end{cases}
$$

It is differentiable at zero with $$B'(0)=1$$, because $$\lvert B(h)-h\rvert\le h^2$$. It is discontinuous at every nonzero point. This time the first-order line has a nonzero slope. The mechanism is the same: irregular behavior occurs inside an error that is smaller than the horizontal increment.

## Problems: challenge the intuition

**5.1 — The threshold for arithmetic irregularity.** For $$p>0$$, let $$D_p(x)=\lvert x\rvert^p\mathbf1_{\mathbb Q}(x)$$. Find all points of continuity and all points of differentiability, for every $$p$$. Compare your answer with Problem 2.3.

<details markdown="1">
<summary>Hint</summary>

At zero, bound the quotient when $$p>1$$. For the remaining cases, compare rational and irrational sequences. Away from zero, compare the two limiting branch heights.

</details>

<details markdown="1">
<summary>Solution</summary>

For every $$p>0$$, $$0\le D_p(x)\le\lvert x\rvert^p$$ proves continuity at zero; the two dense branches prove discontinuity at every nonzero point. At zero the quotient has absolute value at most $$\lvert h\rvert^{p-1}$$. Thus for $$p>1$$ the derivative exists and is zero. For $$p=1$$, positive rational increments give quotient $$1$$ and irrational increments give zero. For $$0<p<1$$, positive rational quotients grow without bound while irrational ones remain zero. Therefore differentiability occurs only at zero and only when $$p>1$$.

</details>

**5.2 — A general test for dense branches.** Suppose $$g$$ is differentiable on a neighborhood of $$a$$ and $$G(x)=g(x)\mathbf1_{\mathbb Q}(x)$$. Prove that $$G$$ is differentiable at $$a$$ if and only if $$g(a)=g'(a)=0$$. Determine $$G'(a)$$ when it exists.

<details markdown="1">
<summary>Hint</summary>

First use continuity of $$G$$ and density of both sets to force $$g(a)=0$$. Then compare the derivative quotient along rational and irrational points approaching $$a$$.

</details>

<details markdown="1">
<summary>Solution</summary>

If $$G$$ is differentiable, it is continuous. Since $$g$$ is continuous, its rational branch tends to $$g(a)$$ and its irrational branch tends to zero, forcing $$g(a)=0$$ and $$G(a)=0$$. Along irrational points the derivative quotient is zero, so $$G'(a)=0$$. Along rational points it equals $$[g(x)-g(a)]/(x-a)$$, tending to $$g'(a)$$; hence $$g'(a)=0$$.

Conversely, these two conditions imply $$g(a+h)=o(\lvert h\rvert)$$. Since $$\lvert G(a+h)\rvert\le\lvert g(a+h)\rvert$$ and $$G(a)=0$$, its difference quotient tends to zero as well.

</details>

**5.3 — Is testing rational increments enough?** Suppose $$f$$ is continuous on a neighborhood of $$a$$ and its difference quotient at $$a$$ tends to a finite number $$L$$ as $$h\to0$$ through nonzero rational increments. Prove that $$f'(a)=L$$. Then show that continuity only at $$a$$ is insufficient. This is adapted from Problem 5.2.1 of the reference book.

<details markdown="1">
<summary>Hint</summary>

The function $$q(h)=[f(a+h)-f(a)]/h$$ is continuous at every nonzero sufficiently small $$h$$. A bound on a dense set extends by continuity. For the counterexample, use $$a=0$$ and $$f(x)=x\mathbf1_{\mathbb Q}(x)$$.

</details>

<details markdown="1">
<summary>Solution</summary>

Given $$\varepsilon>0$$, choose $$\delta>0$$ so $$\lvert q(h)-L\rvert<\varepsilon/2$$ for rational $$h$$ with $$0<\lvert h\rvert<\delta$$. At any real nonzero $$h$$ in that window, approximate $$h$$ by such rationals. Continuity of $$q$$ at this $$h$$ gives $$\lvert q(h)-L\rvert\le\varepsilon/2<\varepsilon$$. Hence the full limit is $$L$$.

For the counterexample, $$\lvert x\mathbf1_{\mathbb Q}(x)\rvert\le\lvert x\rvert$$ proves continuity at zero. Rational quotients equal $$1$$, whereas irrational quotients equal zero. The derivative does not exist. Continuity near the point, not just at the point, is what permits the dense-set argument.

</details>

**5.4 — Smoothness has several thresholds.** For $$p>0$$ define

$$
f_p(x)=\begin{cases}\lvert x\rvert^p\sin(1/x),&x\ne0,\\0,&x=0.\end{cases}
$$

Determine exactly when $$f_p'(0)$$ exists and when $$f_p'$$ is continuous at zero. Include the borderline cases. This adapts the oscillatory-family idea in Problem 5.6.18 of the reference book, with an absolute-value amplitude so the function is real on both sides.

<details markdown="1">
<summary>Hint</summary>

For the derivative at zero, divide by $$h$$. Away from zero, the chain rule introduces a term of magnitude up to $$\lvert x\rvert^{p-2}$$. Use sequences with sine equal to $$1$$ or cosine equal to $$1$$ to test necessity.

</details>

<details markdown="1">
<summary>Solution</summary>

The defining quotient is $$\operatorname{sgn}(h)\lvert h\rvert^{p-1}\sin(1/h)$$. For $$p>1$$ it tends to zero. For $$p=1$$, positive increments $$h_n=1/(\pi/2+2\pi n)$$ give quotient $$1$$ and $$k_n=1/(2\pi n)$$ give zero. For $$0<p<1$$ the first sequence gives unbounded quotients. Thus $$f_p'(0)$$ exists exactly when $$p>1$$, with value zero.

For $$x\ne0$$,

$$
f_p'(x)=p\operatorname{sgn}(x)\lvert x\rvert^{p-1}\sin(1/x)
-\lvert x\rvert^{p-2}\cos(1/x).
$$

Both terms tend to zero when $$p>2$$. For $$1<p\le2$$, the sequence $$k_n$$ makes the first term zero and the second equal to $$-k_n^{p-2}$$; this stays $$-1$$ at $$p=2$$ and is unbounded below for $$p<2$$. Therefore the derivative is continuous at zero exactly when $$p>2$$. For $$p\le1$$ it is not defined there in the first place.

</details>

**Checkpoint.** Explain why a corner, rapid oscillation, and discontinuities near a point are three different issues. State an error estimate that proves $$x^2\mathbf1_{\mathbb Q}(x)$$ is differentiable at zero, and explain why the same argument fails for $$x\mathbf1_{\mathbb Q}(x)$$.

## A final synthesis

Before moving to applications, make sure you can complete these tasks without using the solutions above:

1. From the definition, find the derivative of $$\sqrt{1+x}$$ at zero and explain why rationalizing is legitimate for nonzero small increments.
2. Find the derivative of $$P(x)=(1+x^2)^{e^x}\sin(x^3)$$. Keep the answer valid at zeros of the sine; do not divide by that factor without treating those points.
3. Construct a function differentiable only at zero, with value $$4$$ and derivative $$3$$ there. Prove all three claims.

<details markdown="1">
<summary>Compare your answers</summary>

The first quotient simplifies to $$1/(\sqrt{1+h}+1)$$ and tends to $$1/2$$. For the second task,

$$
P'(x)=(1+x^2)^{e^x}\left\{
e^x\left[\ln(1+x^2)+\frac{2x}{1+x^2}\right]\sin(x^3)
+3x^2\cos(x^3)\right\}.
$$

This uses logarithmic differentiation only for the positive power factor, followed by the product rule. It remains valid when $$\sin(x^3)=0$$. For the third task, take $$4+3x+x^2\mathbf1_{\mathbb Q}(x)$$. The quadratic bound proves value $$4$$ and derivative $$3$$ at zero; at every nonzero point the two dense branches have different limits, preventing continuity and hence differentiability.

</details>
