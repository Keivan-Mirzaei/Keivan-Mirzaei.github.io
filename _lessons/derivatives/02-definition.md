---
title: "Calculating from the definition"
description: "Compute with difference quotients and distinguish continuity from differentiability."
module_id: derivatives
module_step: 2
breadcrumb: "Derivatives / Lesson 2"
permalink: /notes/derivatives/definition/
math: true
duration: "60–90 minutes, plus problem work"
widgets: [differentiability]
---

**Guiding question.** Which algebraic steps let us simplify a difference quotient without ever setting its denominator to zero?

## Three useful calculations

For $$f(x)=x^2$$, at any $$a$$,

$$
\frac{f(a+h)-f(a)}h=2a+h\longrightarrow2a.
$$

Thus $$f'(x)=2x$$. For $$f(x)=1/x$$ and $$a\ne0$$, use sufficiently small $$h$$ so $$a+h\ne0$$:

$$
\frac{1/(a+h)-1/a}{h}
=-\frac1{a(a+h)}\longrightarrow-\frac1{a^2}.
$$

For $$f(x)=\sqrt{x}$$ and $$a>0$$, multiply by the conjugate:

$$
\frac{\sqrt{a+h}-\sqrt a}{h}
=\frac1{\sqrt{a+h}+\sqrt a}
\longrightarrow\frac1{2\sqrt a}.
$$

At $$a=0$$ the square-root domain has an endpoint, and its right-hand quotient $$1/\sqrt h$$ grows without bound. There is no finite derivative there, even in the one-sided sense.

## Why the absolute value fails at zero

For $$f(x)=\lvert x\rvert$$, the quotient at zero is

$$
\frac{f(h)-f(0)}h=
\begin{cases}1,&h>0,\\-1,&h<0.\end{cases}
$$

The right-hand derivative is $$1$$ and the left-hand derivative is $$-1$$. Differentiability requires both finite one-sided derivatives to exist and agree. There is no single tangent slope at the corner. Away from zero the derivative is $$1$$ for $$x>0$$ and $$-1$$ for $$x<0$$.

{% include widgets/differentiability.html id='derivative-corner' model='absolute' %}

**Try.** Zoom toward zero. Does the corner disappear? Adjust the candidate slope. Can any line agree with both sides to first order? The axes in this view magnify both horizontal and vertical displacements by the same factor, so slopes are preserved.

Continuity alone is insufficient. Conversely, differentiability at $$a$$ implies continuity there: for nonzero $$h$$,

$$
f(a+h)-f(a)=h\,\frac{f(a+h)-f(a)}h\longrightarrow0.
$$

Here the quotient has a finite limit and $$h\to0$$. This argument also explains why changing just the value at the point can destroy a derivative.

## Problems: first principles

**2.1 — Beyond the square.** Use the definition to prove $$(x^3)'=3x^2$$. Then prove $$(x^n)'=nx^{n-1}$$ for every positive integer $$n$$ using a factorization or the binomial theorem. State the derivative of a constant separately.

<details markdown="1">
<summary>Hint</summary>

After subtracting $$a^n$$, every term in the numerator contains a factor of $$h$$.

</details>

<details markdown="1">
<summary>Solution</summary>

For the cube the quotient is $$3a^2+3ah+h^2$$. In general, the binomial expansion gives

$$
\frac{(a+h)^n-a^n}{h}
=na^{n-1}+\sum_{k=2}^n\binom nk a^{n-k}h^{k-1}.
$$

The finite sum tends to zero. The same calculation works at $$a=0$$; when $$n=1$$ the derivative is $$1$$. A constant's quotient is zero, hence its derivative is zero.

</details>

**2.2 — A join that has to match twice.** Find all constants $$A,B$$ making

$$
f(x)=\begin{cases}x^2,&x\le1,\\Ax+B,&x>1\end{cases}
$$

differentiable at $$1$$. Prove sufficiency using the difference quotient, not only a sketch.

<details markdown="1">
<summary>Hint</summary>

Continuity matches heights; differentiability must also match slopes.

</details>

<details markdown="1">
<summary>Solution</summary>

Continuity forces $$A+B=1$$. The left quotient tends to $$2$$; the right quotient is $$A+(A+B-1)/h$$ and, after imposing continuity, equals $$A$$. Thus $$A=2$$ and $$B=-1$$. With these values, the left quotient is $$2+h$$ and the right quotient is $$2$$, so the two-sided derivative exists and equals $$2$$.

</details>

**2.3 — A whole family of corners.** For $$p>0$$, classify differentiability at zero of $$f_p(x)=\lvert x\rvert^p$$. Distinguish a finite derivative, unequal finite one-sided limits, and unbounded quotients.

<details markdown="1">
<summary>Hint</summary>

Write the quotient as $$\operatorname{sgn}(h)\lvert h\rvert^{p-1}$$.

</details>

<details markdown="1">
<summary>Solution</summary>

For $$p>1$$ the quotient tends to zero, so $$f_p'(0)=0$$. For $$p=1$$ the one-sided limits are $$-1$$ and $$1$$. For $$0<p<1$$ the quotient tends to $$-\infty$$ from the left and $$+\infty$$ from the right. All these functions are continuous at zero; only those with $$p>1$$ are differentiable there.

</details>

**2.4 — A tiny alteration with a large effect.** Define $$g(0)=c$$ and $$g(x)=x^2$$ for $$x\ne0$$. For which $$c$$ does $$g'(0)$$ exist? Give both a continuity argument and a direct quotient argument.

<details markdown="1">
<summary>Hint</summary>

The difference quotient is $$h-c/h$$.

</details>

<details markdown="1">
<summary>Solution</summary>

Continuity at zero requires $$c=0$$. Directly, $$h-c/h$$ has no finite limit when $$c\ne0$$, whereas for $$c=0$$ it tends to zero. Thus the derivative exists exactly when $$c=0$$, and then equals zero.

</details>

**Checkpoint.** Before simplifying a quotient, state where its formula is valid. Before declaring differentiability, check both sides and finiteness.
