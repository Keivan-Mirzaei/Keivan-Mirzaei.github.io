---
layout: learning-topic
title: "Riemann sums and area bounds"
permalink: /learning/calculus/integral-foundations/area-and-riemann-sums/
course_key: calculus
module_key: integral-foundations
position: "5.2"
description: "Choose sample points, form Riemann sums, and bound area with lower and upper sums."
epigraph:
  text: "One use of the integral calculus is to enable us to ascertain the values of areas bounded by curves."
  author: "Silvanus P. Thompson"
  source: "Calculus Made Easy, second edition (1914), Chapter XIX, p. 204."
  source_url: "https://www.gutenberg.org/files/33283/33283-h/33283-h.htm"
math: true
sitemap: false
topic_script: /assets/js/learning-riemann.js
topic_controls: true
exercises:
  - text: 'Divide \([2,5]\) into six equal subintervals. What are the width and the third division point \(x_3\)?'
    options: ['\(\Delta x=\tfrac12,\ x_3=\tfrac72\)', '\(\Delta x=\tfrac56,\ x_3=\tfrac52\)', '\(\Delta x=\tfrac12,\ x_3=\tfrac32\)']
    correct: 0
    why: 'The width is \((5-2)/6=1/2\), and division points start at \(a=2\): \(x_3=2+3/2=7/2\).'
  - text: 'A positive function is strictly decreasing on a strip. Where are its minimum and maximum?'
    options: ['Minimum at the left end; maximum at the right end', 'Minimum at the right end; maximum at the left end', 'Both at the centre of the strip']
    correct: 1
    why: 'The heights decrease as the input increases. The smallest height is therefore at the right end and the largest at the left end. These supply the lower and upper rectangles, respectively.'
  - text: 'Two strips have widths \(1\) and \(3\), with sampled heights \(4\) and \(2\). What is their Riemann sum?'
    options: ['\(6\)', '\(12\)', '\(10\)']
    correct: 2
    why: 'Each sampled height needs its own strip width: \(4\cdot1+2\cdot3=10\). Adding heights alone loses the widths; using one average width gives incorrect weights.'
  - text: 'For \(f(x)=(x-1)^2\) on \([0,2]\), use a single strip. What are the lower and upper sums?'
    options: ['Both are \(2\)', 'Lower \(0\), upper \(2\)', 'Lower \(0\), upper \(1\)']
    correct: 1
    why: 'The minimum is \(0\) at the interior point \(x=1\), and the maximum is \(1\) at the ends. Multiplying by the width \(2\) gives the sums \(0\) and \(2\).'
  - text: 'For a continuous, nonnegative function, a lower sum is \(5.2\) and an upper sum is \(5.6\). What is guaranteed about the area estimate \(5.4\)?'
    options: ['Its absolute error is at most \(0.2\)', 'Its absolute error is exactly \(0.2\)', 'Its error is zero']
    correct: 0
    why: 'The area lies in \([5.2,5.6]\), so its distance from \(5.4\) is at most \(0.2\). The bounds do not determine the actual error.'
  - text: 'A partition has lower sum \(5\) and upper sum \(7\). What must hold for every Riemann sum \(S\) on that same partition?'
    options: ['\(5\le S\le7\)', 'It equals the area', 'It cannot exceed the area']
    correct: 0
    why: 'Each sampled height lies between the minimum and maximum on its strip. Multiplying by the positive widths and adding gives \(5\le S\le7\). This does not determine whether \(S\) is above or below the area.'
---

<!-- Prerequisites: Rectangle area; function values; continuity and the extreme-value theorem; monotonicity; summation notation (recalled in a prerequisite panel). Established here: Partitions, sample points and general Riemann sums; lower and upper Darboux sums and their bounds on sampled sums and area; unequal strip widths. Infimum and supremum are explained only in an optional extension. Refinement, mesh and the area limit follow in the next lesson. -->

## Explore a curved area

We know the area of a rectangle: width times height. How could rectangles help us find the area beneath a curved graph? Start with the region under $$f(x)=x^2$$ from $$0$$ to $$2$$ and explore it below.

{% include learning/riemann-sums.html %}

The lower rectangles fit inside the curved region; the upper rectangles cover it with some extra area. Their totals put the area between two numbers. Narrower strips suggest a way to bring those numbers together. The calculus question is what happens as *every strip becomes narrow*.

We can also choose other heights from the curve within each strip. Those choices give estimates between the lower and upper sums. We will now give these observations precise names and notation.

For now, take $$f$$ to be continuous and nonnegative on a closed interval $$[a,b]$$, with $$a<b$$. The region lies between the graph, the horizontal axis, and the vertical lines $$x=a$$ and $$x=b$$.

## Naming the pieces

<aside class="definition" markdown="1">
<p class="element-label">Definition</p>
<h3>Partition</h3>

A **partition** $$P$$ of $$[a,b]$$ is an ordered list

$$
a=x_0<x_1<\cdots<x_n=b.
$$

It divides the interval into $$n$$ subintervals. Strip $$i$$ runs from $$x_{i-1}$$ to $$x_i$$ and has width

$$
\Delta x_i=x_i-x_{i-1}.
$$

</aside>

There are $$n$$ strips and $$n+1$$ partition points. The widths need not be equal. If they are equal, then

$$
\Delta x=\frac{b-a}{n},\qquad x_i=a+i\Delta x.
$$

## Riemann sums

<aside class="prerequisite" markdown="1">
<p class="element-label">Prerequisite</p>
<h3>Summation notation</h3>

The **summation symbol** $$\sum$$ is an instruction to add:

$$
\sum_{i=1}^n a_i=a_1+a_2+\cdots+a_n.
$$

The index $$i$$ starts at $$1$$, increases by one, and stops at $$n$$. The expression $$a_i$$ tells us which term to add at each step. For example,

$$
\begin{aligned}
\sum_{i=1}^3 i^2&=1^2+2^2+3^2\\
&=14.
\end{aligned}
$$

</aside>

<aside class="definition" markdown="1">
<p class="element-label">Definition</p>
<h3>Sample points and a Riemann sum</h3>

Choose a **sample point** $$x_i^*$$ in each subinterval:

$$
x_{i-1}\le x_i^*\le x_i.
$$

The star marks the chosen point; it is not an exponent. Either end or any interior point is allowed, and the choice may differ from strip to strip.

The rectangle on strip $$i$$ has height $$f(x_i^*)$$ and width $$\Delta x_i$$. Adding its area to those of the other rectangles gives a **Riemann sum**:

$$
S=\sum_{i=1}^n f(x_i^*)\Delta x_i.
$$

</aside>

A Riemann sum depends on both the partition and the sample points. Its rectangles may cross the curve, and the resulting estimate may be above or below the area.

## Lower and upper sums

<aside class="definition" markdown="1">
<p class="element-label">Definition</p>
<h3>Lower and upper Riemann sums</h3>

On each closed subinterval $$[x_{i-1},x_i]$$, let $$\ell_i$$ be the minimum value of $$f$$ and $$u_i$$ its maximum value. Continuity guarantees that both are attained, by the extreme-value theorem.

The **lower sum** uses the minimum height on each strip:

$$
\underline{S}(f,P)=\sum_{i=1}^n\ell_i\Delta x_i.
$$

The **upper sum** uses the maximum height on each strip:

$$
\overline{S}(f,P)=\sum_{i=1}^n u_i\Delta x_i.
$$

These are also called **Darboux sums**. In our continuous setting, each minimum and maximum is attained, so choosing sample points at those extrema makes both sums particular Riemann sums.

</aside>

Every sampled height satisfies $$\ell_i\le f(x_i^*)\le u_i$$. Multiplying by the positive strip widths and adding gives, for every Riemann sum $$S$$ on the *same partition*,

$$
\underline{S}(f,P)\le S\le\overline{S}(f,P).
$$

The lower rectangles lie inside the curved region, and the upper rectangles cover it. Thus the area $$A$$ satisfies

$$
\underline{S}(f,P)\le A\le\overline{S}(f,P).
$$

For equal-width partitions with $$n$$ strips, we abbreviate these sums as $$\underline{S}_n$$ and $$\overline{S}_n$$. Their difference measures the uncertainty left by these bounds. If the lower and upper sums agree, their common value determines the area exactly.

<mark>Find the minimum and maximum on each whole strip, wherever they occur.</mark>

<details class="disclosure" markdown="1">
<summary>Beyond continuous functions (optional)</summary>

For a bounded function that is not continuous, a strip's function values need not have an attained minimum or maximum. The general definitions use the **infimum**, the greatest lower bound of those values, and the **supremum**, their least upper bound, in place of $$\ell_i$$ and $$u_i$$.

These still define lower and upper Darboux sums and bound every sampled Riemann sum on the same partition. If an extreme bound is not attained, no sample point supplies that height, so the corresponding Darboux sum need not itself be a sampled Riemann sum. Continuity avoids this complication in the present lesson.

</details>

<section class="worked" markdown="1">
<p class="element-label">Example 1</p>
<h3>Bounding a parabolic region</h3>

Return to the initial setup in the [opening investigation](#riemann-explorer): $$f(x)=x^2$$ from $$0$$ to $$2$$ with four equal strips. Each width is $$2/4=1/2$$. We can now calculate the two bounds shown there.

Since $$x^2$$ increases on this interval, each strip's minimum occurs at its left end and its maximum at its right end. The minimum heights are $$0,\ 1/4,\ 1,\ 9/4$$, so

$$
\begin{aligned}
\underline{S}_4&=\frac12\left(0+\frac14+1+\frac94\right)\\
&=\frac74=1.75.
\end{aligned}
$$

The maximum heights are $$1/4,\ 1,\ 9/4,\ 4$$, giving

$$
\begin{aligned}
\overline{S}_4&=\frac12\left(\frac14+1+\frac94+4\right)\\
&=\frac{15}{4}=3.75.
\end{aligned}
$$

Therefore

$$
1.75\le A\le3.75.
$$

The calculation is exact for the rectangles. The gap of $$2$$ records how much room these bounds leave for the curved region's area.

</section>

<section class="worked" markdown="1">
<p class="element-label">Example 2</p>
<h3>A maximum inside the strip</h3>

For $$f(x)=4x(2-x)$$ on $$[0,2]$$, use one strip of width $$2$$. The function is nonnegative and has minimum $$0$$ at the ends. Writing

$$
f(x)=4-4(x-1)^2
$$

shows that its maximum is $$4$$ at the interior point $$x=1$$. Thus

$$
\begin{aligned}
\underline{S}_1&=2\cdot0=0,\\
\overline{S}_1&=2\cdot4=8.
\end{aligned}
$$

Choose *Rise and fall* with one rectangle in the [opening investigation](#riemann-explorer). The lower rectangle has zero height; the upper rectangle reaches the peak. These bounds give $$0\le A\le8$$.

</section>

<aside class="warning" markdown="1">
<p class="element-label">Warning</p>
<h3>Inspect the whole strip</h3>

Checking only the two ends can miss an interior extremum. In Example 2 both end heights are zero, but an upper rectangle of height zero would miss the entire curved region. Determine each strip's actual minimum and maximum before calling its rectangles lower and upper bounds.

</aside>

## Unequal widths carry unequal weights

<section class="worked" markdown="1">
<p class="element-label">Example 3</p>
<h3>The middle strip is twice as wide</h3>

Partition $$[0,2]$$ at $$0,\ 1/2,\ 3/2,\ 2$$ for $$f(x)=x^2$$. The widths are $$1/2,\ 1,\ 1/2$$. Since the function increases, the maximum heights are $$1/4,\ 9/4,\ 4$$.

{% include learning/riemann-unequal.html %}

The upper sum is

$$
\begin{aligned}
\overline{S}(f,P)&=\frac14\cdot\frac12+\frac94\cdot1\\
&\quad+4\cdot\frac12\\
&=\frac{35}{8}=4.375.
\end{aligned}
$$

The minimum heights are $$0,\ 1/4,\ 9/4$$, so the lower sum is

$$
\begin{aligned}
\underline{S}(f,P)&=0\cdot\frac12+\frac14\cdot1\\
&\quad+\frac94\cdot\frac12\\
&=\frac{11}{8}=1.375.
\end{aligned}
$$

These bounds give $$1.375\le A\le4.375$$. Each height must be multiplied by *its own strip's width*. Replacing all widths by $$2/3$$ would describe different rectangles.

For a general Riemann sum on this same partition, choose the sample points $$1/4,\ 5/4,\ 7/4$$. Each belongs to its own strip. Their heights are $$1/16,\ 25/16,\ 49/16$$, giving

$$
\begin{aligned}
S&=\frac1{16}\cdot\frac12+\frac{25}{16}\cdot1\\
&\quad+\frac{49}{16}\cdot\frac12\\
&=\frac{25}{8}=3.125.
\end{aligned}
$$

As guaranteed, $$11/8\le25/8\le35/8$$. Different sample points can change $$S$$, but it remains between the same lower and upper sums. These bounds alone do not tell us whether this particular estimate is above or below the area.

</section>
