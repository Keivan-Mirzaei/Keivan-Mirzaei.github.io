---
title: From a secant to a tangent
description: Move a second point toward the first and see a rate of change emerge—without dividing by zero.
format: module
category: math
tags: [calculus, derivatives, limits]
duration: 20 minutes
level: First calculus course
prerequisites: [Slope of a line, Function notation]
objectives:
  - Calculate the slope between two points on a curve.
  - Describe a derivative as a limit of secant slopes.
  - Distinguish the limit from an undefined expression at zero.
widgets: [derivative]
math: true
sample: true
---

## 1. Two points, one slope

For $$f(x)=x^2$$, fix the first point at (1, 1). Put a second point at $$x=1+h$$. The line joining them is a **secant**.

Its slope is change in height divided by change in horizontal position:

$$
\frac{f(1+h)-f(1)}{h}
=\frac{(1+h)^2-1}{h}=2+h,\qquad h\ne0.
$$

At h = 1, the slope is 3. Predict the slopes for h = 0.5 and h = −0.5 before using the slider.

## 2. Approach from both sides

{% include widgets/derivative.html %}

Move the slider slowly toward zero from the right, then approach from the left. The orange secant rotates toward the same dashed tangent in both cases.

| h | Secant slope |
| --- | --- |
| 0.5 | 2.5 |
| 0.1 | 2.1 |
| −0.1 | 1.9 |
| −0.5 | 1.5 |

<details markdown="1">
<summary>What happens exactly at zero?</summary>

The two points coincide. The original quotient becomes 0/0 and is undefined. The orange secant disappears; the dashed tangent remains. Its slope, 2, comes from the limit, not from evaluating that quotient at zero.

</details>

## 3. Name the limiting quantity

The derivative at x = 1 is

$$
f'(1)=\lim_{h\to0}\frac{f(1+h)-f(1)}{h}=2.
$$

The expression $$2+h$$ agrees with the quotient whenever h is nonzero. It lets us calculate the limit without pretending that division by zero is allowed.

## 4. Transfer the idea

Keep the same function, but fix the first point at x = 3. Work out the secant slope and the limiting tangent slope.

<details markdown="1">
<summary>Check your calculation</summary>

For nonzero h, $$((3+h)^2-9)/h=6+h$$. The limit is 6. More generally, at x = a the same calculation gives $$2a+h$$ and hence derivative $$2a$$.

</details>

**Reflection:** a drawing suggests a limit; the algebra establishes it. Can you explain the difference in one sentence to someone who has not studied calculus?
