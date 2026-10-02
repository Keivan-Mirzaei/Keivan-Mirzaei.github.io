---
title: "From average rate to instantaneous rate"
description: "Move from measurable average rates to the finite limit defining a derivative."
module_id: derivatives
module_step: 1
breadcrumb: "Derivatives / Lesson 1"
permalink: /notes/derivatives/rates/
math: true
duration: "60–90 minutes, plus problem work"
widgets: [derivative]
---

**Guiding question.** A moving object has position $$s(t)=t^2$$ metres after $$t$$ seconds. What is its speed at exactly $$t=1$$?

Between two distinct times $$a$$ and $$b$$, we can calculate its **average rate of change**:

$$
\frac{s(b)-s(a)}{b-a}.
$$

The units are metres per second. On a position–time graph, this is the slope of the secant line joining $$(a,s(a))$$ and $$(b,s(b))$$. The numerator measures change in position; the denominator measures elapsed time. Their quotient is a rate, not a position.

For an interval with one endpoint at $$1$$ and the other at $$1+h$$, where $$h\ne0$$,

$$
\frac{s(1+h)-s(1)}{h}
=\frac{(1+h)^2-1}{h}=2+h.
$$

| Increment $$h$$ | Second time $$1+h$$ | Average rate $$2+h$$ |
| --- | --- | --- |
| $$1$$ | $$2$$ | $$3$$ |
| $$0.1$$ | $$1.1$$ | $$2.1$$ |
| $$0.01$$ | $$1.01$$ | $$2.01$$ |
| $$-0.1$$ | $$0.9$$ | $$1.9$$ |
| $$-0.01$$ | $$0.99$$ | $$1.99$$ |

**Predict.** Will approaching $$1$$ from earlier times give the same rate as approaching from later times? What would it mean if the two answers differed?

{% include widgets/derivative.html id='derivative-rates' %}

**Try.** Move the second point from the right, then from the left. Compare $$h=0.5$$ and $$h=-0.5$$. Finally set $$h=0$$. At zero the two points coincide, so there is no secant slope to calculate. The limiting slope can still exist.

This motivates the definition. Let $$a$$ be an interior point of the domain of $$f$$. Its **derivative at $$a$$** is the finite real number

$$
f'(a)=\lim_{h\to0}\frac{f(a+h)-f(a)}{h},
$$

provided this two-sided limit exists. Equivalently, replace $$a+h$$ by $$x$$ and let $$x\to a$$. We call $$f$$ differentiable at $$a$$ when this finite limit exists.

For our example, $$s'(1)=2$$ metres per second. The tangent line has equation $$y=1+2(t-1)$$. We found its slope by taking a limit; substituting $$h=0$$ into the original quotient would only produce an undefined expression.

The **derivative function** $$f'$$ assigns $$f'(a)$$ to every point where it exists. The symbols $$f'(a)$$ and $$\frac{df}{dx}(a)$$ denote the same number. At an endpoint, only a one-sided derivative may be available; throughout the module, an unqualified derivative at a point means a finite two-sided derivative at an interior point.

## Problems: rates and limits

**1.1 — An average that hides a change.** For $$f(x)=x^2$$ and $$a\in\mathbb R$$, calculate the average rates on $$[a-h,a]$$, $$[a,a+h]$$, and $$[a-h,a+h]$$ for $$h>0$$. Which one already equals $$f'(a)$$ for every $$h$$? Explain why that does not make the function linear.

<details markdown="1">
<summary>Hint</summary>

Factor a difference of squares. Keep track of the length of each interval.

</details>

<details markdown="1">
<summary>Solution</summary>

The three rates are $$2a-h$$, $$2a+h$$, and $$2a$$. The symmetric interval's rate equals the derivative because the quadratic errors on opposite sides cancel. Rates on arbitrary intervals still vary with their endpoints, so the function is not linear.

</details>

**1.2 — Two endpoints moving at once.** Let $$f(x)=x^3$$. Find the secant slope between $$x=a-h$$ and $$x=a+2h$$ for $$h\ne0$$, and its limit as $$h\to0$$. Why is the denominator $$3h$$ rather than $$h$$?

<details markdown="1">
<summary>Hint</summary>

Use $$(u^3-v^3)/(u-v)=u^2+uv+v^2$$.

</details>

<details markdown="1">
<summary>Solution</summary>

The horizontal displacement is $$(a+2h)-(a-h)=3h$$. The slope is $$3a^2+3ah+3h^2$$, which tends to $$3a^2$$. This is a secant limit with both endpoints moving, not the defining quotient with one endpoint fixed. Here the explicit calculation shows they have the same limit.

</details>

**1.3 — A tempting replacement definition.** Someone proposes defining the derivative using only

$$
\lim_{h\to0}\frac{f(a+h)-f(a-h)}{2h}.
$$

Test this proposal on $$f(x)=\lvert x\rvert$$ at $$a=0$$. Can this symmetric quotient certify differentiability?

<details markdown="1">
<summary>Hint</summary>

First compute the symmetric quotient. Then compute the original quotient separately for positive and negative $$h$$.

</details>

<details markdown="1">
<summary>Solution</summary>

The symmetric quotient is always zero. The defining quotient is $$\lvert h\rvert/h$$, equal to $$1$$ on the right and $$-1$$ on the left. The derivative therefore does not exist. A symmetric difference can hide incompatible one-sided behavior.

</details>

**1.4 — How close is close enough?** For $$f(x)=x^3$$ at $$a=1$$, find a positive $$\delta$$ such that every $$0<\lvert h\rvert<\delta$$ gives a secant slope within $$0.01$$ of the instantaneous rate. Justify your choice for both signs of $$h$$.

<details markdown="1">
<summary>Hint</summary>

The quotient is $$3+3h+h^2$$. Bound the absolute error instead of checking a few decimal values.

</details>

<details markdown="1">
<summary>Solution</summary>

For $$\lvert h\rvert<1$$, the error is at most $$3\lvert h\rvert+h^2\le4\lvert h\rvert$$. Take $$\delta=0.0025$$. Then every nonzero increment of smaller magnitude gives error strictly less than $$0.01$$. A smaller positive $$\delta$$ also works.

</details>

**Checkpoint.** Explain the distinction between a secant slope, a derivative at a point, and the derivative function. Explain why a list of slopes approaching a number suggests a limit without proving it.
