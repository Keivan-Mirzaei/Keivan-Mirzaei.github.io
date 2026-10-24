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

<section class="worked" data-problem-id="a-hole-a-jump-and-a-product" markdown="1">
{% include learning/problem-label.html number=1 difficulty=1 %}

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

<section class="worked" data-problem-id="a-mixture-with-a-limiting-concentration" markdown="1">
{% include learning/problem-label.html number=2 difficulty=1 %}

A tank initially contains $$20\,\mathrm{L}$$ of solution with $$4\,\mathrm{g}$$ of dissolved salt. Solution containing $$3\,\mathrm{g/L}$$ is added at $$2\,\mathrm{L/min}$$, with no outflow and enough tank capacity. Assume the contents are well mixed.

Find the salt concentration $$C(t)$$ after $$t\ge0$$ minutes, its long-term limit, and whether it ever reaches that limit at a finite time. Find exactly which times make its concentration differ from the limit by less than $$0.1\,\mathrm{g/L}$$.

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

The remainder is negative for every finite $$t\ge0$$. The concentration approaches the incoming concentration from below but never equals it at a finite time. To be within $$0.1\,\mathrm{g/L}$$, we need

$$\frac{56}{20+2t}<0.1\quad\Longleftrightarrow\quad t>270\text{ minutes}.$$

At exactly $$270$$ minutes the difference is $$0.1$$; it is strictly smaller at every later time. There is no first time satisfying the strict inequality: $$270$$ is its boundary. Approaching an asymptote does not mean reaching it, but a prescribed accuracy is achieved after a finite wait.

</details>
</section>

<section class="worked" data-problem-id="recover-the-hidden-limits" markdown="1">
{% include learning/problem-label.html number=3 difficulty=2 %}

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

<section class="worked" data-problem-id="two-radicals-two-different-changes" markdown="1">
{% include learning/problem-label.html number=4 difficulty=2 %}

Two measurements are

$$A(h)=\sqrt{9+h}-3,\qquad B(h)=\sqrt{4+h}-2.$$

Both tend to zero as $$h\to0$$. Find $$\displaystyle\lim_{h\to0}A(h)/B(h)$$. Does “both changes vanish” mean that they become equal in relative size?

<details class="disclosure" markdown="1">
<summary>Hint</summary>

Rationalise each change separately before forming the ratio. Keep the common factor $$h$$ until it cancels.

</details>
<details class="disclosure" markdown="1">
<summary>Solution</summary>

For nearby $$h\ne0$$,

$$A(h)=\frac{h}{\sqrt{9+h}+3},\qquad B(h)=\frac{h}{\sqrt{4+h}+2}.$$

Thus

$$\lim_{h\to0}\frac{A(h)}{B(h)}
=\lim_{h\to0}\frac{\sqrt{4+h}+2}{\sqrt{9+h}+3}
=\frac46=\frac23.$$

Both changes vanish, but one is approximately two-thirds of the other for small nonzero $$h$$. Their separate zero limits do not determine the ratio; the algebra does.

</details>
</section>

<section class="worked" data-problem-id="a-square-root-that-hides-two-sides" markdown="1">
{% include learning/problem-label.html number=5 difficulty=2 %}

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

<section class="worked" data-problem-id="zeros-without-sign-changes" markdown="1">
{% include learning/problem-label.html number=6 difficulty=2 %}

Construct a polynomial on $$[-2,2]$$ satisfying $$f(-2)=-1$$ and $$f(2)=1$$, with exactly three zeros: $$-1,0,1$$. Require the graph to *touch* the axis without crossing at $$-1$$ and $$1$$.

Sketch your construction. Which zero can be detected by opposite signs on its two sides? What does this reveal about a sign-change test?

<details class="disclosure" markdown="1">
<summary>Hint</summary>

A squared factor stays nonnegative on both sides of its zero. Choose factors first, then scale the endpoint values.

</details>
<details class="disclosure" markdown="1">
<summary>Solution</summary>

One construction is

$$f(x)=\frac{x(x-1)^2(x+1)^2}{18}.$$

At $$x=2$$ the numerator is $$18$$; at $$x=-2$$ it is $$-18$$. These are its only three zeros.

Away from the zeros, the squared factors are positive, so the sign is the sign of $$x$$. The graph crosses at $$0$$ but only touches at $$-1$$ and $$1$$.

<figure class="topic-figure"><img src="{{ '/assets/figures/learning/limits-three-zeros.svg' | relative_url }}" alt="A continuous graph touches the x-axis at minus one and one, and crosses it at zero. Its endpoint heights are minus one and one. A closer view makes the touches and crossing visible." width="640" height="480"></figure>

Opposite signs guarantee a zero for a continuous function. They are *not necessary*: a zero at which the sign stays the same can escape that test.

</details>
</section>

<section class="worked" data-problem-id="oscillation-far-from-the-origin" markdown="1">
{% include learning/problem-label.html number=7 difficulty=2 %}

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

<section class="worked" data-problem-id="how-many-factors-survive" markdown="1">
{% include learning/problem-label.html number=8 difficulty=2 %}

For each positive integer $$n$$, consider

$$F_n(x)=\frac{x^2-9}{(x-3)^n},\qquad x\ne3.$$

Classify the behaviour at $$3$$ for $$n=1,2,3$$: a removable hole or a vertical asymptote? Give both one-sided limits. Then state the pattern for all $$n\ge2$$.

<details class="disclosure" markdown="1">
<summary>Hint</summary>

Factor the numerator before looking at signs. After cancellation, how many factors of $$x-3$$ remain below the line?

</details>
<details class="disclosure" markdown="1">
<summary>Solution</summary>

For $$x\ne3$$,

$$F_n(x)=\frac{x+3}{(x-3)^{n-1}}.$$

The numerator approaches the positive number $$6$$. Therefore:

<div class="table-scroll" markdown="1" role="region" aria-label="Limits for each exponent" tabindex="0">

| $$n$$ | Left-hand limit | Right-hand limit | Behaviour |
| --- | :---: | :---: | --- |
| $$1$$ | $$6$$ | $$6$$ | Hole, repaired by assigning $$F_1(3)=6$$ |
| $$2$$ | $$-\infty$$ | $$+\infty$$ | Vertical asymptote |
| $$3$$ | $$+\infty$$ | $$+\infty$$ | Vertical asymptote |

</div>

For every $$n\ge2$$ there is a vertical asymptote. If $$n$$ is odd, the remaining exponent $$n-1$$ is even and both limits are $$+\infty$$. If $$n$$ is even, the left-hand limit is $$-\infty$$ and the right-hand limit is $$+\infty$$.

The original numerator and denominator both vanish at $$3$$ in every case. It is the *remaining* denominator after cancellation that distinguishes the outcomes.

</details>
</section>

<section class="worked" data-problem-id="height-lost-on-a-circular-track" markdown="1">
{% include learning/problem-label.html number=9 difficulty=2 %}

A point on a circle of radius $$r>0$$ moves through a small angle $$\theta$$ from the top. Its horizontal displacement is $$d=r\sin\theta$$ and its vertical drop is $$h=r(1-\cos\theta)$$. Find

$$\lim_{\theta\to0}\frac{h}{d^2}.$$

<figure class="topic-figure"><img src="{{ '/assets/figures/learning/limits-circle-drop.svg' | relative_url }}" alt="A point moves from the top of a circle. A horizontal segment marks displacement d, and a vertical segment marks the drop h from the original height." width="640" height="360"></figure>

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

<section class="worked" data-problem-id="two-boxes-with-the-same-volume" markdown="1">
{% include learning/problem-label.html number=10 difficulty=2 %}

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

<section class="worked" data-problem-id="one-curve-two-slant-asymptotes" markdown="1">
{% include learning/problem-label.html number=11 difficulty=3 %}

Find the slant asymptote at each end of

$$F(x)=\sqrt{4x^2+x}.$$

A student replaces $$\sqrt{4x^2}$$ by $$2x$$ at both ends and predicts the same line. Correct the sign error, and find the constant vertical offset at each end.

<details class="disclosure" markdown="1">
<summary>Hint</summary>

At the negative end, $$\sqrt{x^2}=\lvert x\rvert=-x$$. Rationalise $$F(x)-2x$$ on the right and $$F(x)+2x$$ on the left.

</details>
<details class="disclosure" markdown="1">
<summary>Solution</summary>

At the positive end,

$$\begin{aligned}
\lim_{x\to+\infty}(F(x)-2x)
&=\lim_{x\to+\infty}\frac{x}{\sqrt{4x^2+x}+2x}\\
&=\lim_{x\to+\infty}\frac1{\sqrt{4+1/x}+2}=\frac14.
\end{aligned}$$

Hence $$\lim_{x\to+\infty}\bigl(F(x)-(2x+1/4)\bigr)=0$$.

At the negative end, $$F(x)=(-x)\sqrt{4+1/x}$$. Thus

$$\begin{aligned}
\lim_{x\to-\infty}(F(x)+2x)
&=\lim_{x\to-\infty}\frac{x}{\sqrt{4x^2+x}-2x}\\
&=\lim_{x\to-\infty}\frac{-1}{\sqrt{4+1/x}+2}=-\frac14.
\end{aligned}$$

The asymptotes are therefore

$$y=2x+\frac14\quad\text{at }+\infty,\qquad
 y=-2x-\frac14\quad\text{at }-\infty.$$

Keeping only the largest squared term reveals the size but loses the sign of $$x$$ and the constant offset.

</details>
</section>

<section class="worked" data-problem-id="a-hole-and-three-asymptotes" markdown="1">
{% include learning/problem-label.html number=12 difficulty=3 %}

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
&=2x+5+\frac{5x+7}{x^2-1}.
\end{aligned}$$

The cancelled factor leaves a finite limit at $$2$$:

$$\lim_{x\to2}R(x)=\frac{(2+2)(8+2+1)}{4-1}=\frac{44}{3}.$$

Defining $$R(2)=44/3$$ repairs the hole. At $$1$$ and $$-1$$, the simplified numerator is nonzero while the denominator tends to zero and changes sign. Thus $$x=1$$ and $$x=-1$$ are vertical asymptotes.

Finally,

$$\lim_{x\to\pm\infty}\bigl(R(x)-(2x+5)\bigr)
=\lim_{x\to\pm\infty}\frac{5x+7}{x^2-1}=0.$$

The slant asymptote is $$y=2x+5$$ at both ends. There is no horizontal asymptote, since the function grows without bound in magnitude.

</details>
</section>

<section class="worked" data-problem-id="tune-the-first-cancellation" markdown="1">
{% include learning/problem-label.html number=13 difficulty=3 %}

Find every real $$c$$ for which the following limit is finite, and evaluate it:

$$\lim_{x\to0}\frac{\sqrt{1+x}-\sqrt{1-x}-cx}{x^3}.$$

For the other values of $$c$$, decide whether there is a two-sided infinite limit. Use algebra and the limit laws only.

<details class="disclosure" markdown="1">
<summary>Hint 1</summary>

Put $$S=\sqrt{1+x}+\sqrt{1-x}$$. The difference of the roots equals $$2x/S$$. Which value of $$c$$ can cancel the leading term?

</details>
<details class="disclosure" markdown="1">
<summary>Hint 2</summary>

For the remaining case, use $$S^2=2+2\sqrt{1-x^2}$$, then rationalise $$1-\sqrt{1-x^2}$$ as well.

</details>
<details class="disclosure" markdown="1">
<summary>Solution</summary>

For $$0<\lvert x\rvert<1$$, define $$S=\sqrt{1+x}+\sqrt{1-x}$$. Then

$$\frac{\sqrt{1+x}-\sqrt{1-x}-cx}{x^3}
=\frac{2/S-c}{x^2}.$$

Since $$S\to2$$, the numerator tends to $$1-c$$. If $$c<1$$ the quotient tends to $$+\infty$$; if $$c>1$$ it tends to $$-\infty$$. Only $$c=1$$ can give a finite limit.

For that value, rationalise the sum:

$$\begin{aligned}
S^2&=2+2\sqrt{1-x^2},\\
2-S&=\frac{4-S^2}{2+S}
=\frac{2(1-\sqrt{1-x^2})}{2+S}\\
&=\frac{2x^2}{(2+S)(1+\sqrt{1-x^2})}.
\end{aligned}$$

Consequently,

$$\lim_{x\to0}\frac{2/S-1}{x^2}
=\lim_{x\to0}\frac{2}{S(2+S)(1+\sqrt{1-x^2})}
=\frac18.$$

The linear correction removes the first change; a smaller, cubic-sized difference remains.

</details>
</section>

<section class="worked" data-problem-id="equal-heights-and-the-distance-between-them" markdown="1">
{% include learning/problem-label.html number=14 difficulty=4 %}

Suppose $$f$$ is continuous on $$[0,1]$$ and $$f(0)=f(1)$$.

1. Prove that for every integer $$n\ge2$$ there are two points on its graph, separated horizontally by $$1/n$$, with the same height.
2. Must there also be such a pair separated by $$2/3$$? Either prove it or construct a continuous counterexample with a sketch.

<details class="disclosure" markdown="1">
<summary>Hint 1</summary>

For the first part, consider $$g(x)=f(x+1/n)-f(x)$$. Add its values at $$x=0,1/n,\ldots,(n-1)/n$$.

</details>
<details class="disclosure" markdown="1">
<summary>Hint 2</summary>

For the second part, make the first and last thirds parallel, with different heights at the corresponding inputs. Connect them continuously through the middle third.

</details>
<details class="disclosure" markdown="1">
<summary>Solution</summary>

For $$0\le x\le1-1/n$$, the function

$$g(x)=f(x+1/n)-f(x)$$

is continuous. The sum of its $$n$$ equally spaced values cancels:

$$g(0)+g(1/n)+\cdots+g((n-1)/n)=f(1)-f(0)=0.$$

If any summand is zero, we have the required pair. Otherwise, the summands cannot all have the same sign. Between two sampled inputs with opposite signs, the Intermediate Value Theorem gives a zero of $$g$$. At that input, $$f(x+1/n)=f(x)$$.

The second claim is false. Join the points

$$(0,0),\quad(1/3,1),\quad(2/3,-1),\quad(1,0)$$

with straight segments. A formula is

$$f(x)=\begin{cases}
3x,&0\le x\le1/3,\\
3-6x,&1/3\le x\le2/3,\\
3x-3,&2/3\le x\le1.
\end{cases}$$

<figure class="topic-figure"><img src="{{ '/assets/figures/learning/limits-chord-counterexample.svg' | relative_url }}" alt="Three connected line segments pass through zero zero, one third one, two thirds minus one, and one zero. The first and last segments have the same slope, with heights differing by one at horizontal separation two thirds." width="640" height="360"></figure>

Every possible starting input for a separation of $$2/3$$ lies in $$[0,1/3]$$. There,

$$f(x+2/3)-f(x)=(3x-1)-3x=-1.$$

So no such pair exists. The equal subdivisions in the first part are essential to the cancellation argument.

</details>
</section>

<section class="worked" data-problem-id="a-local-limit-determines-the-whole-function" markdown="1">
{% include learning/problem-label.html number=15 difficulty=4 %}

A function $$f:\mathbb R\to\mathbb R$$ is continuous at $$0$$ and satisfies

$$f(x)+f(2x)=x\qquad\text{for every real }x.$$

Determine $$f(x)$$ for every real input and prove that no other function continuous at zero can satisfy the identity. You are not told that $$f$$ is continuous anywhere else.

<details class="disclosure" markdown="1">
<summary>Hint 1</summary>

First try a linear function. Subtract that candidate from $$f$$ to obtain a new function whose value changes sign when its input is halved.

</details>
<details class="disclosure" markdown="1">
<summary>Hint 2</summary>

For a fixed input $$x$$, show that $$\lvert g(x)\rvert=\lvert g(x/2^n)\rvert$$ for every positive integer $$n$$. Then use continuity only at zero.

</details>
<details class="disclosure" markdown="1">
<summary>Solution</summary>

A linear candidate $$f(x)=kx$$ must satisfy $$3kx=x$$, so $$k=1/3$$. This gives one solution.

To prove uniqueness, let

$$g(x)=f(x)-\frac{x}{3}.$$

Putting $$x=0$$ in the original equation gives $$f(0)=0$$. Hence $$g$$ is continuous at zero with $$g(0)=0$$, and

$$g(x)+g(2x)=0.$$

Apply this identity at $$x/2$$, then at $$x/4$$, and keep halving. For every positive integer $$n$$,

$$g(x)=(-1)^n g(x/2^n),\qquad \lvert g(x)\rvert=\lvert g(x/2^n)\rvert.$$

Fix any real $$x$$. As $$n\to\infty$$, the inputs $$x/2^n\to0$$. Continuity at zero makes the right-hand side tend to zero. The left-hand side is a fixed number, so it must equal zero.

Thus $$g(x)=0$$ for every $$x$$, and

$$f(x)=\frac{x}{3}.$$

Here one limit at a single point, together with the identity linking different inputs, determines the function everywhere.

</details>
</section>
