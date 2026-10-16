---
layout: learning-topic
problem_set: true
title: "Problems"
permalink: /learning/calculus/limits-and-continuity/problems/
course_key: calculus
module_key: limits-and-continuity
position: "1.7"
description: Connect limit laws, squeezing, asymptotes, continuity, and the Intermediate Value Theorem through problems and applications.
math: true
sitemap: false
---

Choose a method and justify your reasoning. Swipe between problems or use the arrows below. Help reveals hints first, then the solution.

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

Sketch a continuous function on $$[-2,2]$$ with $$f(-2)=-1$$, $$f(2)=1$$, and *exactly three zeros*. Then find a polynomial formula that fits your sketch.

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

The theorem guarantees *at least one* zero between endpoints of opposite signs. It does not guarantee uniqueness.

</details>
</section>

## Limit laws and algebraic methods

<section class="worked" markdown="1">
<p class="element-label">Problem 3</p>
<h3>Recover the hidden limits</h3>

Two functions satisfy

$$\begin{aligned}
\lim_{x\to a}(2f(x)+g(x))&=7,\\
\lim_{x\to a}(f(x)-g(x))&=2.
\end{aligned}$$

Without assuming beforehand that the individual limits exist, find

$$\lim_{x\to a}\frac{f(x)}{g(x)}.$$

<details class="disclosure" markdown="1">
<summary>Hint</summary>

Call the two combinations $$A(x)$$ and $$B(x)$$. Express $$f$$ and $$g$$ in terms of these combinations before using the limit laws.

</details>
<details class="disclosure" markdown="1">
<summary>Solution</summary>

With $$A=2f+g$$ and $$B=f-g$$, algebra gives

$$f=\frac{A+B}{3},\qquad g=\frac{A-2B}{3}.$$

Both right-hand sides have limits, so

$$\lim_{x\to a}f(x)=\frac{7+2}{3}=3,\qquad
\lim_{x\to a}g(x)=\frac{7-4}{3}=1.$$

Since the denominator limit is nonzero, the quotient law now applies:

$$\lim_{x\to a}\frac{f(x)}{g(x)}=\frac31=3.$$

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

Find the finite separation that remains between these two unbounded quantities.

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
<h3>Oscillation far from the origin</h3>

The numerator keeps changing sign. Determine the horizontal asymptote at each end:

$$F(x)=\frac{x\cos x}{x^2+1}.$$

Would applying the product law to $$\cos x$$ and $$x/(x^2+1)$$ be justified?

<details class="disclosure" markdown="1">
<summary>Hint</summary>

Bound the absolute value. For $$\lvert x\rvert\ge1$$, compare $$\lvert x\rvert/(x^2+1)$$ with $$1/\lvert x\rvert$$.

</details>
<details class="disclosure" markdown="1">
<summary>Solution</summary>

Using $$\lvert\cos x\rvert\le1$$ gives

$$0\le\left\lvert\frac{x\cos x}{x^2+1}\right\rvert
\le\frac{\lvert x\rvert}{x^2+1}
\le\frac1{\lvert x\rvert}.$$

The final bound tends to zero at either end. The squeeze theorem therefore gives

$$\lim_{x\to+\infty}F(x)=\lim_{x\to-\infty}F(x)=0.$$

Thus $$y=0$$ is a horizontal asymptote at both ends, even though the graph crosses it infinitely often. The product law cannot be applied directly because $$\cos x$$ has no limit at either infinity.

</details>
</section>

## Infinite limits and asymptotes

<section class="worked" markdown="1">
<p class="element-label">Problem 8</p>
<h3>A vanishing denominator, three outcomes</h3>

For each function, determine both one-sided limits at $$x=3$$ and decide whether a two-sided infinite limit exists:

$$\begin{aligned}
A(x)&=\frac{x-4}{(x-3)^2},\\
B(x)&=\frac{x-4}{x-3},\\
C(x)&=\frac{\sin(x-3)}{x-3}.
\end{aligned}$$

Which graphs have a vertical asymptote there?

<details class="disclosure" markdown="1">
<summary>Hint</summary>

Near $$3$$ the numerator $$x-4$$ is negative. A squared denominator stays positive. For $$C$$, recognise a basic trigonometric limit.

</details>
<details class="disclosure" markdown="1">
<summary>Solution</summary>

For $$A$$, the numerator approaches $$-1$$ and the denominator approaches zero through positive values:

$$\lim_{x\to3^-}A(x)=\lim_{x\to3^+}A(x)=-\infty.$$

Hence $$\lim_{x\to3}A(x)=-\infty$$, and $$x=3$$ is a vertical asymptote.

For $$B$$, the denominator changes sign:

$$\lim_{x\to3^-}B(x)=+\infty,\qquad
\lim_{x\to3^+}B(x)=-\infty.$$

There is a vertical asymptote, but no two-sided infinite limit.

For $$C$$, set $$t=x-3$$. The basic sine limit gives

$$\lim_{x\to3}C(x)=\lim_{t\to0}\frac{\sin t}{t}=1.$$

Both one-sided limits are $$1$$. There is a removable hole, repaired by assigning the value $$1$$, and no vertical asymptote. A zero denominator alone does not tell us which behavior occurs.

</details>
</section>

<section class="worked" markdown="1">
<p class="element-label">Problem 9</p>
<h3>A hole and three asymptotes</h3>

Find every vertical and slant asymptote of

$$R(x)=\frac{(x^2-4)(2x^2+x+1)}{(x-2)(x^2-1)}.$$

Locate any removable discontinuity and state the value that would repair it. Does this function have a horizontal asymptote?

<details class="disclosure" markdown="1">
<summary>Hint</summary>

Factor before classifying the excluded inputs. After cancellation, polynomial division separates a line from a remainder that tends to zero.

</details>
<details class="disclosure" markdown="1">
<summary>Solution</summary>

For $$x\ne2,1,-1$$,

$$\begin{aligned}
R(x)&=\frac{(x+2)(2x^2+x+1)}{x^2-1}\\
&=2x+5+\frac{6x+7}{x^2-1}.
\end{aligned}$$

The cancelled factor leaves a finite limit at $$2$$:

$$\lim_{x\to2}R(x)=\frac{(2+2)(8+2+1)}{4-1}=\frac{44}{3}.$$

Defining $$R(2)=44/3$$ repairs the hole. At $$1$$ and $$-1$$, the simplified numerator is nonzero while the denominator tends to zero and changes sign. Thus $$x=1$$ and $$x=-1$$ are vertical asymptotes.

Finally,

$$\lim_{x\to\pm\infty}\bigl(R(x)-(2x+5)\bigr)
=\lim_{x\to\pm\infty}\frac{6x+7}{x^2-1}=0.$$

The slant asymptote is $$y=2x+5$$ at both ends. There is no horizontal asymptote, since the function grows without bound in magnitude.

</details>
</section>

## Trigonometric limits and applications

<section class="worked" markdown="1">
<p class="element-label">Problem 10</p>
<h3>Height lost on a circular track</h3>

A point on a circle of radius $$r>0$$ moves through a small angle $$\theta$$ from the top. Its horizontal displacement is $$d=r\sin\theta$$ and its vertical drop is $$h=r(1-\cos\theta)$$. Find

$$\lim_{\theta\to0}\frac{h}{d^2}.$$

What does this suggest about how the drop changes when a very small horizontal displacement doubles?

<details class="disclosure" markdown="1">
<summary>Hint</summary>

Use both basic trigonometric limits by dividing the numerator and denominator by $$\theta^2$$. Angles are in radians.

</details>
<details class="disclosure" markdown="1">
<summary>Solution</summary>

For nearby nonzero angles,

$$\frac{h}{d^2}=\frac1r\,
\frac{(1-\cos\theta)/\theta^2}{(\sin\theta/\theta)^2}.$$

The denominator tends to $$1\ne0$$, so

$$\lim_{\theta\to0}\frac{h}{d^2}
=\frac1r\frac{1/2}{1^2}=\frac1{2r}.$$

Thus $$h$$ is approximately $$d^2/(2r)$$ for small displacements. Doubling a very small displacement makes the drop approximately four times as large. The ratio has units of inverse length.

</details>
</section>

<section class="worked" markdown="1">
<p class="element-label">Problem 11</p>
<h3>A mixture with a limiting concentration</h3>

A tank initially contains $$20\,\mathrm{L}$$ of solution with $$4\,\mathrm{g}$$ of dissolved salt. Solution containing $$3\,\mathrm{g/L}$$ is added at $$2\,\mathrm{L/min}$$, with no outflow and enough tank capacity. Assume the contents are well mixed.

Find the salt concentration $$C(t)$$ after $$t\ge0$$ minutes, its long-term limit, and whether it ever reaches that limit at a finite time.

<details class="disclosure" markdown="1">
<summary>Hint</summary>

Track salt mass and total volume separately. Then rewrite concentration as its limiting value plus a remainder.

</details>
<details class="disclosure" markdown="1">
<summary>Solution</summary>

The added salt mass is $$6t\,\mathrm{g}$$ and the added volume is $$2t\,\mathrm{L}$$, so

$$C(t)=\frac{4+6t}{20+2t}=3-\frac{56}{20+2t}\quad\mathrm{g/L}.$$

Therefore,

$$\lim_{t\to+\infty}C(t)=3\quad\mathrm{g/L}.$$

The remainder is negative for every finite $$t\ge0$$. The concentration approaches the incoming concentration from below but never equals it at a finite time. The horizontal asymptote is $$C=3$$; the model is only used for nonnegative time.

</details>
</section>

## Continuity and models

<section class="worked" markdown="1">
<p class="element-label">Problem 12</p>
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
<p class="element-label">Problem 13</p>
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
<p class="element-label">Problem 14</p>
<h3>Two boxes with the same volume</h3>

Squares of side $$x$$ centimetres are cut from the corners of a $$20\,\mathrm{cm}$$ by $$30\,\mathrm{cm}$$ sheet. Folding the sides makes an open box with volume

$$V(x)=x(20-2x)(30-2x),\qquad 0<x<10.$$

Prove that *at least two different cuts* give volume $$900\,\mathrm{cm^3}$$, without solving the cubic equation.

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
<p class="element-label">Problem 15 · Challenge</p>
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
<p class="element-label">Problem 16 · Challenge</p>
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
