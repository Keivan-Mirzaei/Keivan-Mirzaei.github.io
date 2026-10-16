---
layout: learning-topic
title: "Problems"
permalink: /learning/calculus/limits-and-continuity/problems/
course_key: calculus
module_key: limits-and-continuity
position: "1.7"
description: Explore graphs, new algebraic methods, applications, and two challenges using limits and continuity.
math: true
sitemap: false
---

Use algebra, one-sided limits, continuity, and the Intermediate Value Theorem. Give a reason for each conclusion. Open a hint if you need a starting point; the solutions stay hidden until you choose to read them.

<section class="theorem" markdown="1">
<p class="element-label">Rules</p>
<h3>Limit laws used in this set</h3>

When two functions have finite limits, the limit of their sum, difference, or product is the corresponding sum, difference, or product of those limits. For a quotient, the same rule applies provided the denominator's limit is nonzero.

Polynomials and square-root functions are continuous wherever defined. Sums, differences, products, and compositions of continuous functions remain continuous; quotients do too where their denominator is nonzero.

</section>

## Read and construct graphs

<section class="worked" markdown="1">
<p class="element-label">Problem 1</p>
<h3>A hole, a jump, and a product</h3>

Use the graph of $$f$$ below.

<figure class="topic-figure"><img src="{{ '/assets/figures/learning/limits-problem-graph.svg' | relative_url }}" alt="A rising line has a hole at minus one, one and an isolated filled value at minus one, three. At input one, its open endpoint is at height three, while a second rising branch starts at the filled point one, minus one." width="640" height="380"></figure>

1. At each of $$x=-1$$ and $$x=1$$, find the function value and both one-sided limits.
2. Which discontinuity can be repaired by changing one value? Give the new value.
3. Does $$\lim_{x\to1}(x-1)f(x)$$ exist, even though $$\lim_{x\to1}f(x)$$ does not?

<details class="disclosure" markdown="1">
<summary>Hint</summary>

Read each branch separately. For the last part, what does the factor $$x-1$$ approach on either side, and are the corresponding heights of $$f$$ finite?

</details>
<details class="disclosure" markdown="1">
<summary>Solution</summary>

At $$-1$$, both one-sided limits are $$1$$, while $$f(-1)=3$$. Setting $$f(-1)=1$$ repairs this removable discontinuity.

At $$1$$, the left-hand limit is $$3$$, the right-hand limit is $$-1$$, and $$f(1)=-1$$. Changing the value at $$1$$ cannot repair the jump.

On each side, $$x-1\to0$$ while $$f(x)$$ approaches a finite value. The product therefore approaches $$0$$ on both sides:

$$\lim_{x\to1^-}(x-1)f(x)=0\cdot3=0,\qquad
\lim_{x\to1^+}(x-1)f(x)=0\cdot(-1)=0.$$

Thus $$\lim_{x\to1}(x-1)f(x)=0$$. A product can have a limit even when one factor does not have a two-sided limit.

</details>
</section>

<section class="worked" markdown="1">
<p class="element-label">Problem 2</p>
<h3>Three crossings, the same endpoint data</h3>

Sketch a continuous function on $$[-2,2]$$ with $$f(-2)=-1$$, $$f(2)=1$$, and **exactly three zeros**. Then find a polynomial formula that fits your sketch.

What does your construction tell you about the number of solutions guaranteed by the Intermediate Value Theorem?

<details class="disclosure" markdown="1">
<summary>Hint</summary>

Choose three zeros first, write a product with those factors, and multiply by a constant to fit the endpoints.

</details>
<details class="disclosure" markdown="1">
<summary>Solution</summary>

One choice is

$$f(x)=\frac{x(x-1)(x+1)}6=\frac{x^3-x}{6}.$$

It has exactly the zeros $$-1,0,1$$, is continuous, and satisfies $$f(-2)=-1$$ and $$f(2)=1$$.

<figure class="topic-figure"><img src="{{ '/assets/figures/learning/limits-three-zeros.svg' | relative_url }}" alt="A continuous cubic goes from minus two, minus one to two, one, crossing the x-axis at minus one, zero, and one." width="640" height="360"></figure>

The theorem guarantees **at least one** zero between endpoints of opposite signs. It does not guarantee uniqueness.

</details>
</section>

## Limits that need a new step

<section class="worked" markdown="1">
<p class="element-label">Problem 3</p>
<h3>The conjugate method</h3>

Evaluate

$$\lim_{x\to0}\frac{\sqrt{9+x}-3}{x}.$$

<details class="disclosure" markdown="1">
<summary>Hint</summary>

<aside class="prerequisite" markdown="1">
<p class="element-label">Prerequisite</p>

The difference-of-squares identity is $$(a-b)(a+b)=a^2-b^2$$. The expressions $$a-b$$ and $$a+b$$ are **conjugates**.

</aside>

Multiply the numerator and denominator by $$\sqrt{9+x}+3$$. This changes the form of the quotient without changing its nearby values.

</details>
<details class="disclosure" markdown="1">
<summary>Solution</summary>

For $$x\ne0$$ near $$0$$,

$$\frac{\sqrt{9+x}-3}{x}
=\frac{(9+x)-9}{x(\sqrt{9+x}+3)}
=\frac1{\sqrt{9+x}+3}.$$

The new denominator tends to $$6$$, so

$$\lim_{x\to0}\frac{\sqrt{9+x}-3}{x}
=\lim_{x\to0}\frac1{\sqrt{9+x}+3}=\frac16.$$

Cancellation uses nearby nonzero inputs; it does not assign a value to the original quotient at $$0$$.

</details>
</section>

<section class="worked" markdown="1">
<p class="element-label">Problem 4</p>
<h3>Rationalise and factor</h3>

Evaluate

$$\lim_{x\to4}\frac{\sqrt{x+5}-3}{x^2-16}.$$

<details class="disclosure" markdown="1">
<summary>Hint</summary>

Use the conjugate on the numerator and the difference-of-squares identity on the denominator. Cancel only after the common factor is visible.

</details>
<details class="disclosure" markdown="1">
<summary>Solution</summary>

For nearby $$x\ne4$$,

$$\frac{\sqrt{x+5}-3}{x^2-16}
=\frac{x-4}{(x-4)(x+4)(\sqrt{x+5}+3)}
=\frac1{(x+4)(\sqrt{x+5}+3)}.$$

Therefore,

$$\lim_{x\to4}\frac{\sqrt{x+5}-3}{x^2-16}
=\lim_{x\to4}\frac1{(x+4)(\sqrt{x+5}+3)}
=\frac1{8\cdot6}=\frac1{48}.$$

</details>
</section>

<section class="worked" markdown="1">
<p class="element-label">Problem 5</p>
<h3>A square root that hides two sides</h3>

Find both one-sided limits, then decide whether the two-sided limit exists:

$$\lim_{x\to2}\frac{\sqrt{(x-2)^2}}{x^2-4}.$$

<details class="disclosure" markdown="1">
<summary>Hint</summary>

<aside class="prerequisite" markdown="1">
<p class="element-label">Prerequisite</p>

The principal square root is nonnegative: $$\sqrt{u^2}=\lvert u\rvert$$, not always $$u$$.

</aside>

Determine the sign of $$x-2$$ separately on each side.

</details>
<details class="disclosure" markdown="1">
<summary>Solution</summary>

For $$x\ne2$$ near $$2$$,

$$\frac{\sqrt{(x-2)^2}}{x^2-4}
=\frac{\lvert x-2\rvert}{(x-2)(x+2)}
=\begin{cases}
-\dfrac1{x+2},&x<2,\\
\dfrac1{x+2},&x>2.
\end{cases}$$

Hence

$$\lim_{x\to2^-}\frac{\sqrt{(x-2)^2}}{x^2-4}=-\frac14,\qquad
\lim_{x\to2^+}\frac{\sqrt{(x-2)^2}}{x^2-4}=\frac14.$$

The two-sided limit does not exist.

</details>
</section>

<section class="worked" markdown="1">
<p class="element-label">Problem 6</p>
<h3>A small difference between large quantities</h3>

Evaluate

$$\lim_{x\to+\infty}\left(\sqrt{4x^2+x}-2x\right).$$

Here $$x\to+\infty$$ means that the **input** grows without bound. The question is whether the difference approaches a finite output.

<details class="disclosure" markdown="1">
<summary>Hint</summary>

Rationalise the difference, then divide the numerator and denominator by $$x$$. Since the input is positive here, $$\sqrt{x^2}=x$$.

</details>
<details class="disclosure" markdown="1">
<summary>Solution</summary>

For $$x>0$$,

$$\sqrt{4x^2+x}-2x
=\frac{x}{\sqrt{4x^2+x}+2x}
=\frac1{\sqrt{4+1/x}+2}.$$

Since $$1/x\to0$$ as $$x\to+\infty$$,

$$\lim_{x\to+\infty}\left(\sqrt{4x^2+x}-2x\right)
=\lim_{x\to+\infty}\frac1{\sqrt{4+1/x}+2}
=\frac14.$$

Both original terms grow without bound, but their difference approaches a finite number. Subtracting the symbol $$\infty$$ from itself would not determine that number.

</details>
</section>

<section class="worked" markdown="1">
<p class="element-label">Problem 7</p>
<h3>Oscillation inside a shrinking envelope</h3>

The function $$\sin(1/x)$$ has no limit at $$0$$. Does multiplying it by $$x$$ repair the limit?

$$\lim_{x\to0}x\sin(1/x).$$

<details class="disclosure" markdown="1">
<summary>Hint</summary>

<aside class="prerequisite" markdown="1">
<p class="element-label">Prerequisite</p>

For every real angle $$t$$, $$\lvert\sin t\rvert\le1$$.

</aside>

How far from zero can the product be?

</details>
<details class="disclosure" markdown="1">
<summary>Solution</summary>

For $$x\ne0$$,

$$\lvert x\sin(1/x)\rvert\le\lvert x\rvert.$$

As $$x\to0$$, the right side tends to zero. Given any desired closeness to zero, taking $$\lvert x\rvert$$ smaller than that distance forces the product to be at least as close. Thus

$$\lim_{x\to0}x\sin(1/x)=0.$$

This is a **squeezing argument**: oscillations can continue while their entire envelope shrinks to a single height.

</details>
</section>

## Continuity and models

<section class="worked" markdown="1">
<p class="element-label">Problem 8</p>
<h3>Build a continuous bridge</h3>

Choose $$a,b$$ so that the following function is continuous everywhere:

$$f(x)=
\begin{cases}
\dfrac{x^2-1}{x-1},&x<1,\\
ax+b,&1\le x\le2,\\
\sqrt{x+7}+2,&x>2.
\end{cases}$$

<details class="disclosure" markdown="1">
<summary>Hint</summary>

The separate formulas are continuous within their pieces. Match the two approached heights at each joining point.

</details>
<details class="disclosure" markdown="1">
<summary>Solution</summary>

At the first join,

$$\lim_{x\to1^-}\frac{x^2-1}{x-1}
=\lim_{x\to1^-}(x+1)=2,$$

so $$a+b=2$$. At the second join,

$$\lim_{x\to2^+}(\sqrt{x+7}+2)=5,$$

so $$2a+b=5$$. Solving gives $$a=3$$ and $$b=-1$$.

The middle formula then has the same values as the adjacent limits at both joins. Each individual piece is continuous on its own interval, so the assembled function is continuous everywhere.

</details>
</section>

<section class="worked" markdown="1">
<p class="element-label">Problem 9</p>
<h3>The area of a thin ring</h3>

A circular plate has radius $$10\,\mathrm{cm}$$. A narrow ring extends its radius by $$h>0$$ centimetres. Let $$A(h)$$ be the area of the added ring.

<aside class="prerequisite" markdown="1">
<p class="element-label">Prerequisite</p>

A circle of radius $$r$$ has area $$\pi r^2$$.

</aside>

Find $$\lim_{h\to0^+}A(h)/h$$, include its units, and explain its relation to the original circumference.

<details class="disclosure" markdown="1">
<summary>Hint</summary>

Subtract the inner disk's area from the outer disk's area, then expand before dividing by $$h$$.

</details>
<details class="disclosure" markdown="1">
<summary>Solution</summary>

The added area is

$$A(h)=\pi\bigl((10+h)^2-10^2\bigr)=20\pi h+\pi h^2.$$

Consequently,

$$\lim_{h\to0^+}\frac{A(h)}h
=\lim_{h\to0^+}(20\pi+\pi h)=20\pi\,\mathrm{cm}.$$

Area divided by radial thickness has units $$\mathrm{cm^2}/\mathrm{cm}=\mathrm{cm}$$. The limit equals the original circumference: for a sufficiently thin ring, its area divided by its thickness is close to the length around the plate.

</details>
</section>

<section class="worked" markdown="1">
<p class="element-label">Problem 10</p>
<h3>Two boxes with the same volume</h3>

Squares of side $$x$$ centimetres are cut from the corners of a $$20\,\mathrm{cm}$$ by $$30\,\mathrm{cm}$$ sheet. Folding the sides makes an open box with volume

$$V(x)=x(20-2x)(30-2x),\qquad 0<x<10.$$

Prove that **at least two different cuts** give volume $$900\,\mathrm{cm^3}$$, without solving the cubic equation.

<details class="disclosure" markdown="1">
<summary>Hint</summary>

Compare the volumes at $$x=2,3,6$$. Look for two separate intervals whose endpoint volumes straddle the target.

</details>
<details class="disclosure" markdown="1">
<summary>Solution</summary>

The volume is a polynomial, hence continuous. The three values are

$$V(2)=832,\qquad V(3)=1008,\qquad V(6)=864.$$

Since $$832<900<1008$$, the Intermediate Value Theorem gives a cut in $$(2,3)$$ with the target volume. Since $$864<900<1008$$, it gives another cut in $$(3,6)$$.

These open intervals do not overlap, so the cuts are distinct. This argument establishes at least two solutions; it does not calculate them.

</details>
</section>

## Challenges

<section class="worked" markdown="1">
<p class="element-label">Problem 11 · Challenge</p>
<h3>Two radicals, one cancellation</h3>

Evaluate

$$\lim_{x\to0}\frac{\sqrt{1+x}+\sqrt{1-x}-2}{x^2}.$$

<details class="disclosure" markdown="1">
<summary>Hint 1</summary>

Call the sum of the two radicals $$S$$. Multiply $$S-2$$ by its conjugate $$S+2$$.

</details>
<details class="disclosure" markdown="1">
<summary>Hint 2</summary>

After squaring $$S$$, a new radical remains: $$\sqrt{1-x^2}-1$$. Rationalise that difference too.

</details>
<details class="disclosure" markdown="1">
<summary>Solution</summary>

For $$0<\lvert x\rvert<1$$, put $$S=\sqrt{1+x}+\sqrt{1-x}$$. Then

$$S^2=2+2\sqrt{1-x^2}.$$

Therefore,

$$S-2=\frac{S^2-4}{S+2}
=\frac{2(\sqrt{1-x^2}-1)}{S+2}
=-\frac{2x^2}{(S+2)(\sqrt{1-x^2}+1)}.$$

Cancel the nonzero factor $$x^2$$ before taking the limit:

$$\begin{aligned}
\lim_{x\to0}\frac{S-2}{x^2}
&=\lim_{x\to0}\frac{-2}{(S+2)(\sqrt{1-x^2}+1)}\\
&=\frac{-2}{(2+2)(1+1)}=-\frac14.
\end{aligned}$$

</details>
</section>

<section class="worked" markdown="1">
<p class="element-label">Problem 12 · Challenge</p>
<h3>Two points half an interval apart</h3>

Suppose $$f$$ is continuous on $$[0,1]$$ and $$f(0)=f(1)$$. Prove that there is some $$c\in[0,1/2]$$ such that

$$f(c)=f(c+1/2).$$

In a sketch, this means that two points on the graph, separated horizontally by $$1/2$$, have the same height. No symmetry is assumed.

<details class="disclosure" markdown="1">
<summary>Hint 1</summary>

Turn “the same height” into a zero of a new function.

</details>
<details class="disclosure" markdown="1">
<summary>Hint 2</summary>

Consider $$g(x)=f(x+1/2)-f(x)$$ on $$[0,1/2]$$. How are $$g(0)$$ and $$g(1/2)$$ related?

</details>
<details class="disclosure" markdown="1">
<summary>Solution</summary>

Define $$g(x)=f(x+1/2)-f(x)$$. It is continuous on $$[0,1/2]$$ because it is a difference of continuous functions. The endpoint condition gives

$$g(0)=f(1/2)-f(0),$$

$$g(1/2)=f(1)-f(1/2)=f(0)-f(1/2)=-g(0).$$

If $$g(0)=0$$, choose $$c=0$$. Otherwise, the endpoint values have opposite signs, so the Intermediate Value Theorem gives a zero $$c\in(0,1/2)$$.

In either case, $$g(c)=0$$ means $$f(c+1/2)=f(c)$$.

</details>
</section>
