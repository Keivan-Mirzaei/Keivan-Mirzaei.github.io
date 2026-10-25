---
layout: learning-topic
title: "Area as a limit"
permalink: /learning/calculus/integral-foundations/area-as-a-limit/
course_key: calculus
module_key: integral-foundations
position: "5.3"
description: "Refine partitions, let the mesh tend to zero, and connect rectangle estimates to exact area and signed accumulation."
epigraph:
  text: "…the smaller the bits the more of them there will be."
  author: "Silvanus P. Thompson"
  source: "Calculus Made Easy, second edition (1914), Chapter XVII, p. 180. Excerpt."
  source_url: "https://www.gutenberg.org/files/33283/33283-h/33283-h.htm"
math: true
sitemap: false
exercises:
  - text: 'A partition is refined by adding division points. What must happen to its lower and upper sums?'
    options: ['Both must change strictly', 'The lower sum cannot increase and the upper sum cannot decrease', 'The lower sum cannot decrease and the upper sum cannot increase']
    correct: 2
    why: 'On a smaller strip, the minimum cannot be smaller than the old minimum, and the maximum cannot be larger than the old maximum. Equality is possible, so the improvement need not be strict.'
  - text: 'A partition of \([0,1]\) keeps the strip \([0,\tfrac12]\) intact while subdividing the other half more and more. What happens to its mesh?'
    options: ['It tends to zero', 'It remains \(\tfrac12\)', 'It equals the number of strips']
    correct: 1
    why: 'Mesh is the largest strip width. The unchanged half-width strip prevents the mesh from shrinking, however many strips are added elsewhere.'
  - text: 'For a continuous, nonnegative function, partitions have mesh tending to zero. May the sample points change arbitrarily within their strips while the Riemann sums still approach the area?'
    options: ['Yes, every such choice has the same limit', 'No, the same sampling pattern must be kept', 'Only if all strips have equal widths']
    correct: 0
    why: 'Every Riemann sum lies between the lower and upper sums for its partition. As the mesh tends to zero, both bounds approach the area, so the squeeze theorem gives the same limit for any choices of sample points.'
  - text: 'Which function and interval give the upper sum \(\displaystyle\sum_{i=1}^n(1+3i/n)^2(3/n)\) on an equal-width partition?'
    options: ['\(f(x)=x^2\) on \([1,4]\)', '\(f(x)=x^2\) on \([0,3]\)', '\(f(x)=3x^2\) on \([1,3]\)']
    correct: 0
    why: 'The width is \(3/n\), and the division points are \(x_i=1+3i/n\). Thus the interval is \([1,4]\). Since \(x^2\) increases there, the maximum on strip \(i\) is \(x_i^2\).'
  - text: 'A nonnegative flow rate is measured in litres per minute. What units do its lower and upper sums over time have?'
    options: ['Litres per minute', 'Square litres', 'Litres']
    correct: 2
    why: 'Multiplying litres per minute by minutes gives litres. The sums bound the accumulated volume.'
  - text: 'On one strip of width \(0.4\), the minimum function value is \(-3\). What does that strip contribute to the lower sum?'
    options: ['\(1.2\)', '\(-1.2\)', '\(-3\)']
    correct: 1
    why: 'The signed contribution is \((-3)(0.4)=-1.2\). The rectangle has geometric area \(1.2\), but the sum records a negative contribution below the axis.'
---

<!-- Prerequisites: Partitions, general Riemann sums, lower and upper sums and their bounds; continuity; limits and the squeeze theorem; rectangle and triangle area. Established here: Refinement and mesh; the common area limit for continuous nonnegative functions, independent of sample choices; an exact area by squeezing lower and upper sums; units and signed contributions. The general existence theorem is stated without proof. No fundamental theorem or antiderivative evaluation of area is used. -->

## From bounds to area

In the previous lesson, lower and upper rectangles bounded the area, with every sampled sum between those bounds. Narrower strips suggested a way to bring the bounds together. We now make that limiting step precise.

Continue with a continuous, nonnegative function $$f$$ on $$[a,b]$$, where $$a<b$$.

Adding division points while keeping the old ones is called **refining** a partition. A refinement cannot decrease the lower sum or increase the upper sum. On each smaller strip, the minimum can only rise and the maximum can only fall; the smaller widths still add up to the old width. Thus subdivision tightens the bounds, or leaves them unchanged.

To make the bounds approach one another, we need control over the width of every strip.

<aside class="definition" markdown="1">
<p class="element-label">Definition</p>
<h3>Mesh of a partition</h3>

The **mesh** $$\lVert P\rVert$$ is the width of the widest strip:

$$
\lVert P\rVert=\max_{1\le i\le n}\Delta x_i.
$$

For equal widths, $$\lVert P\rVert=(b-a)/n$$, so increasing $$n$$ without bound makes the mesh tend to zero.

</aside>

With unequal widths, simply increasing the number of strips is not enough. For example, keep $$[0,1/2]$$ as one strip while repeatedly subdividing $$[1/2,1]$$. The partition has more and more strips, but its mesh stays $$1/2$$: half the interval never receives a finer approximation.

<section class="theorem" markdown="1">
<p class="element-label">Theorem</p>
<h3>The area limit</h3>

If $$f$$ is continuous and nonnegative on $$[a,b]$$, its lower and upper sums approach a common limit as $$\lVert P\rVert\to0$$, independent of the partitions. We define the **area under the graph** to be that common limit:

$$
\begin{aligned}
A&=\lim_{\lVert P\rVert\to0}\underline{S}(f,P)\\
 &=\lim_{\lVert P\rVert\to0}\overline{S}(f,P).
\end{aligned}
$$

In particular, equal-width lower and upper sums both approach $$A$$ as $$n\to\infty$$. Their gap tends to zero.

Every Riemann sum lies between these bounds, so the squeeze theorem also gives

$$
\lim_{\lVert P\rVert\to0}\sum_{i=1}^n f(x_i^*)\Delta x_i=A.
$$

The sample points may change freely within their strips as the partition changes. The limit is independent of those choices.

</section>

<mark>As every strip becomes narrow, the lower and upper bounds close in on the same area.</mark>

The general theorem guarantees existence under the stated assumptions. We can also find a common limit directly in a particular case, without using an antiderivative.

<section class="worked" markdown="1">
<p class="element-label">Example 1</p>
<h3>An exact area from the bounds</h3>

For $$f(x)=x^2$$ on $$[0,2]$$, let $$n$$ be any positive integer. Then $$\Delta x=2/n$$ and $$x_i=2i/n$$. Because the function increases, the maximum on strip $$i$$ is $$f(x_i)$$. Hence

$$
\begin{aligned}
\overline{S}_n&=\sum_{i=1}^n\left(\frac{2i}{n}\right)^2\frac2n\\
&=\frac8{n^3}\sum_{i=1}^n i^2.
\end{aligned}
$$

The finite-sum identity

$$
\sum_{i=1}^n i^2=\frac{n(n+1)(2n+1)}6
$$

lets us rewrite this as

$$
\begin{aligned}
\overline{S}_n&=\frac{4(n+1)(2n+1)}{3n^2}\\
&=\frac83+\frac4n+\frac4{3n^2}.
\end{aligned}
$$

<details class="disclosure" markdown="1">
<summary>Derivation of the sum identity (optional)</summary>

First, pairing $$1,2,\ldots,n$$ with the same list in reverse gives $$n$$ pairs, each adding to $$n+1$$. Therefore

$$
\sum_{i=1}^n i=\frac{n(n+1)}2.
$$

Next expand the difference of consecutive cubes:

$$
i^3-(i-1)^3=3i^2-3i+1.
$$

Add this equality for $$i=1,\ldots,n$$. On the left, consecutive cubes cancel, leaving $$n^3$$. On the right, add like terms:

$$
\begin{aligned}
n^3&=3\sum_{i=1}^n i^2\\
&\quad-\frac{3n(n+1)}2+n.
\end{aligned}
$$

Solving for the sum of squares gives the stated identity. This is a finite algebraic calculation; no integration formula is being assumed.

</details>

The minimum on strip $$i$$ is $$f(x_{i-1})$$. Subtracting the lower sum from the upper sum cancels all interior division-point heights, leaving

$$
\begin{aligned}
\overline{S}_n-\underline{S}_n&=\Delta x\bigl(f(2)-f(0)\bigr)\\
&=\frac2n(4-0)=\frac8n.
\end{aligned}
$$

Thus

$$
\underline{S}_n=\frac83-\frac4n+\frac4{3n^2}.
$$

Both bounds have the same limit:

$$
\begin{aligned}
\lim_{n\to\infty}\underline{S}_n&=\frac83,\\
\lim_{n\to\infty}\overline{S}_n&=\frac83.
\end{aligned}
$$

Since $$\underline{S}_n\le A\le\overline{S}_n$$ for every $$n$$, squeezing the area between these bounds gives

$$
A=\frac83.
$$

Here $$n$$ tends to infinity through positive integers. No finite number of these lower or upper rectangles gives the exact area; their limits do.

</section>

## What the products measure

The axes need not both measure length. On a speed–time graph, a rectangle's height is a speed and its width is a duration. Their product has units $$(\mathrm{m/s})\,\mathrm s=\mathrm m$$ and represents a distance.

<section class="worked" markdown="1">
<p class="element-label">Example 2</p>
<h3>Distance from speed readings</h3>

A cyclist's speed increases continuously over six seconds. A sensor records:

<div class="table-scroll" role="region" aria-label="Cyclist's speed readings" tabindex="0" markdown="1">

| Time (s) | Speed (m/s) |
| ---: | ---: |
| $$0$$ | $$0$$ |
| $$2$$ | $$3$$ |
| $$4$$ | $$5$$ |
| $$6$$ | $$6$$ |

</div>

How far did the cyclist travel? Since the speed never decreases, each interval's first and last readings are its minimum and maximum. Multiplying each by the two-second duration and adding gives

$$
\begin{aligned}
\underline{S}&=2(0+3+5)=16\,\mathrm m,\\
\overline{S}&=2(3+5+6)=28\,\mathrm m.
\end{aligned}
$$

Thus the distance $$D$$ satisfies $$16\,\mathrm m\le D\le28\,\mathrm m$$.

</section>

## Below the axis: signs matter

Riemann sums and the lower and upper sum formulas still make sense for a continuous function with negative values. A negative height times a positive width contributes a negative number, so the sums now track *signed* contributions. Minimum heights still give the lower sum and maximum heights the upper sum, enclosing every sampled sum on the same partition.

{% include learning/riemann-signed.html %}

For the line $$f(x)=x-1$$ on $$[0,3]$$, the triangular region below the axis has area $$1/2$$; the one above has area $$2$$. The signed total is $$2-1/2=3/2$$, while the total geometric area is $$2+1/2=5/2$$. Using $$\lvert f(x)\rvert$$ instead of $$f(x)$$ makes every rectangle contribution nonnegative.

The next lesson gives the common limit of lower and upper sums its standard name, the *definite integral*, and develops its properties. The connection with antiderivatives will come with the fundamental theorem of calculus.
