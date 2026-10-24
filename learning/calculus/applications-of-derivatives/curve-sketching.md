---
layout: learning-topic
title: "Curve sketching"
permalink: /learning/calculus/applications-of-derivatives/curve-sketching/
course_key: calculus
module_key: applications-of-derivatives
position: "4.7"
description: "Assemble a graph from domain, limits and derivative signs, with every branch and turning point justified."
epigraph:
  text: "Algebra is but written geometry and geometry is but figured algebra."
  author: "Sophie Germain"
  source: "Pensées diverses; posthumously published in Œuvres philosophiques de Sophie Germain (1879)"
  source_url: "https://old.maa.org/node/3575257"
math: true
sitemap: false
exercises:
  - text: "A curve has \\(f^{\\prime}=0\\) at \\(1\\) and \\(f^{\\prime\\prime}=0\\) at \\(3\\). Which placement is justified without more information?"
    options: ["A maximum at \\(1\\) and inflection at \\(3\\)", "A horizontal tangent at \\(1\\) and an inflection candidate at \\(3\\)", "A minimum at \\(3\\)"]
    correct: 1
    why: "A zero first derivative gives a horizontal tangent. Classification and inflection require further sign information."
  - text: "For \\(x/(x^2+1)\\), why are there no vertical asymptotes?"
    options: ["The numerator has a zero", "The denominator is positive and the function is continuous at every finite input", "A horizontal asymptote prevents them"]
    correct: 1
    why: "Continuity at every finite input precludes an unbounded one-sided limit there. Horizontal and vertical asymptotes can coexist for other functions."
  - text: "What is the graph of \\((x^2-4)/(x-2)\\)?"
    options: ["The whole line \\(y=x+2\\)", "The line \\(y=x+2\\) with a hole at \\((2,4)\\)", "Two branches with a vertical asymptote at \\(x=2\\)"]
    correct: 1
    why: "Cancellation is valid only away from \\(2\\); the finite limiting value creates a hole."
  - text: "Can a horizontal asymptote be crossed at a finite input?"
    options: ["Yes", "No", "Only if the derivative does not exist"]
    correct: 0
    why: "A horizontal asymptote constrains end behaviour, not all finite values."
  - text: "If a function is odd and has a local maximum at \\((2,5)\\), which feature is forced?"
    options: ["A local maximum at \\((-2,-5)\\)", "A local minimum at \\((-2,-5)\\)", "An inflection at \\((-2,5)\\)"]
    correct: 1
    why: "Origin symmetry reverses both the heights and their local order, turning the peak into a valley."
  - text: "What prevents connecting two apparent branches across a missing domain input?"
    options: ["Nothing if their derivatives have the same sign", "The original domain; its boundary limit must be examined", "Only a second derivative test"]
    correct: 1
    why: "A sign chart does not supply a value at an excluded input. Limits decide whether the break is a hole, pole or another discontinuity."
---

<!-- Prerequisites: Asymptotes and end behaviour; extrema; derivative sign tests; concavity. Established here: A coordinated workflow for rational curves; sign charts across domain breaks; holes versus poles. -->

## A sketch is a collection of constraints

A few plotted points can miss a narrow turn or connect branches across a missing input. Calculus supplies stronger information: where a branch exists, which way it travels, how it bends, and where it goes near a boundary.

<mark>The purpose is not to calculate every possible feature. It is to collect enough evidence that the overall shape is forced, then check that the pieces agree.</mark>

1. Find the domain, intercepts and useful symmetry.
2. Examine limits at finite domain boundaries and at infinity.
3. Chart the first derivative for growth and local extrema.
4. Chart the second derivative for concavity and inflections.
5. Place key points and draw each domain branch consistently.

## A complete rational example

Consider $$f(x)=x/(x^2+1)$$.

<section class="worked" markdown="1">
<p class="element-label">Example 1</p>
<h3>Domain, symmetry and tails</h3>

The denominator is positive for every real input, so the domain is $$\mathbb R$$. The only intercept is $$(0,0)$$. Since $$f(-x)=-f(x)$$, the graph has symmetry about the origin: rotating by half a turn leaves it unchanged.

For $$x\ne0$$, dividing numerator and denominator by $$x^2$$ gives

$$\begin{aligned}
&\lim_{x\to\pm\infty}\frac{x}{x^2+1}\\
&\quad=\lim_{x\to\pm\infty}\frac{1/x}{1+1/x^2}=0.
\end{aligned}$$

Thus $$y=0$$ is a horizontal asymptote. Since $$f(x)$$ has the sign of $$x$$, the left tail approaches it from below and the right tail from above. There are no vertical asymptotes: the function is continuous at every finite input.

</section>
<section class="worked" markdown="1">
<p class="element-label example-continuation">Example 1 · continued</p>
<h3>The turning points</h3>

The quotient rule gives

$$\begin{aligned}
f^{\prime}(x)&=\frac{(x^2+1)-2x^2}{(x^2+1)^2}\\
&=\frac{1-x^2}{(x^2+1)^2}.
\end{aligned}$$

The denominator is positive; only the numerator determines the sign.

<div class="table-scroll" markdown="1" role="region" aria-label="First derivative sign chart" tabindex="0">

| Interval | $$(-\infty,-1)$$ | $$(-1,1)$$ | $$(1,\infty)$$ |
| --- | :---: | :---: | :---: |
| $$f^{\prime}$$ | $$-$$ | $$+$$ | $$-$$ |
| $$f$$ | decreasing | increasing | decreasing |

</div>

There is a local minimum at $$(-1,-1/2)$$ and local maximum at $$(1,1/2)$$. They are also absolute: on the middle interval all values lie between the two, while the outer branches run from an extremum toward the limit zero. This conclusion uses the whole domain, not the local tests alone.

</section>
<section class="worked" markdown="1">
<p class="element-label example-continuation">Example 1 · continued</p>
<h3>The bends between and beyond the turns</h3>

Differentiating the first derivative and simplifying gives

$$f^{\prime\prime}(x)=\frac{2x(x^2-3)}{(x^2+1)^3}.$$

The candidate inflection inputs are $$-\sqrt3,0,\sqrt3$$. The denominator remains positive.

<div class="table-scroll" markdown="1" role="region" aria-label="Second derivative sign chart" tabindex="0">

| Interval | $$(-\infty,-\sqrt3)$$ | $$(-\sqrt3,0)$$ | $$(0,\sqrt3)$$ | $$(\sqrt3,\infty)$$ |
| --- | :---: | :---: | :---: | :---: |
| $$f^{\prime\prime}$$ | $$-$$ | $$+$$ | $$-$$ | $$+$$ |
| Concavity | down | up | down | up |

</div>

Continuity and the three sign changes establish the inflection points

$$\left(-\sqrt3,-\frac{\sqrt3}{4}\right),\quad(0,0),$$

$$\left(\sqrt3,\frac{\sqrt3}{4}\right).$$

Notice the order $$-\sqrt3<-1<0<1<\sqrt3$$. The inflections and extrema are different landmarks.

</section>
<figure class="topic-figure" id="rational-curve-sketch">
<div class="applications-legend" aria-label="Rational curve figure legend">
<span markdown="span"><i class="applications-legend-key" style="border-color:#285b46" aria-hidden="true"></i> $$f(x)=\frac{x}{x^2+1}$$</span>
<span><i class="applications-legend-dot" aria-hidden="true"></i> Extrema</span>
<span><i class="applications-legend-dot" style="background:#617a9a" aria-hidden="true"></i> Inflections</span>
</div>
<img src="{{ '/assets/figures/learning/applications-curve.svg' | relative_url }}" alt="The graph of x divided by x squared plus one. Amber points mark the absolute minimum at minus one, minus one half and maximum at one, one half. Blue points mark inflections at inputs minus square root of three, zero and square root of three." width="640" height="350" loading="lazy">
<figcaption markdown="span">The completed sketch for Example 1. Amber points mark the absolute extrema at $$x=\pm1$$; blue points mark the inflections at $$x=-\sqrt3,0,\sqrt3$$.</figcaption>
</figure>

Starting at the far left, the graph lies below zero and initially falls while concave down. It changes concavity before reaching its minimum, rises through the origin, reaches its maximum, and then falls toward zero from above. The origin symmetry is a check on all these features.

<mark>A sketch is consistent only when its slopes, bends and boundary behaviour all match the calculations.</mark>

## Domain breaks change how a sign chart is read

<section class="worked" markdown="1">
<p class="element-label">Example 2</p>
<h3>Two decreasing branches do not make one decreasing interval</h3>

For $$g(x)=1/x$$, the domain excludes zero. Its derivative $$-1/x^2$$ is negative on each of $$(-\infty,0)$$ and $$(0,\infty)$$, so each branch decreases.

Yet $$g(-1)=-1<1=g(1)$$. There is no single interval connecting these inputs within the domain. The mean value theorem and derivative sign test cannot bridge the missing point. The vertical asymptote $$x=0$$ separates the branches.

Although $$g^{\prime\prime}(x)=2/x^3$$ changes sign across zero, there is no inflection there: no point of the graph exists at that input.

<figure class="topic-figure" id="separate-decreasing-branches">
<div class="applications-legend" aria-label="Reciprocal graph legend">
<span markdown="span"><i class="applications-legend-key" style="border-color:#285b46" aria-hidden="true"></i> $$g(x)=1/x$$</span>
<span markdown="span"><svg class="applications-legend-line" width="20" height="6" viewBox="0 0 20 6" aria-hidden="true" focusable="false"><line x1="0" y1="3" x2="20" y2="3" stroke="#617a9a" stroke-width="2.4" stroke-dasharray="6 5" stroke-linecap="butt" vector-effect="non-scaling-stroke"/></svg> Asymptote $$x=0$$</span>
<span><i class="applications-legend-dot" aria-hidden="true"></i> Compared points</span>
</div>
<img src="{{ '/assets/figures/learning/applications-reciprocal-branches.svg' | relative_url }}" alt="The two branches of one over x each decrease. Amber points mark minus one, minus one and one, one. A blue dashed vertical asymptote at zero separates the branches." width="640" height="350" loading="lazy">
<figcaption markdown="span">Each branch decreases, yet $$g(-1)<g(1)$$. The excluded input separates two intervals; the derivative sign test applies on each interval individually.</figcaption>
</figure>

</section>
<section class="worked" markdown="1">
<p class="element-label">Example 3</p>
<h3>Cancellation leaves a hole</h3>

For $$h(x)=(x^2-1)/(x-1)$$, the original domain excludes $$1$$. For every other input, $$h(x)=x+1$$. Thus the graph is the line $$y=x+1$$ with $$(1,2)$$ removed.

The finite limit $$\lim_{x\to1}h(x)=2$$ shows a removable hole, not a vertical asymptote. The simplified formula helps draw the graph but does not restore the missing input.

<figure class="topic-figure" id="cancelled-factor-hole">
<div class="applications-legend" aria-label="Removable hole figure legend">
<span markdown="span"><i class="applications-legend-key" style="border-color:#285b46" aria-hidden="true"></i> $$h(x)=\frac{x^2-1}{x-1}$$</span>
<span><i class="applications-legend-dot" style="background:transparent;border:2px solid #285b46" aria-hidden="true"></i> Excluded point</span>
</div>
<img src="{{ '/assets/figures/learning/applications-removable-hole.svg' | relative_url }}" alt="The line y equals x plus one has an open circle at one, two. Light guides connect the missing point to input one and output two." width="640" height="350" loading="lazy">
<figcaption markdown="span">The open point at $$(1,2)$$ preserves the original domain. The graph approaches height $$2$$ from both sides, with no value at $$x=1$$.</figcaption>
</figure>

</section>
<section class="warning" markdown="1">
<p class="element-label">Warning</p>

An asymptote describes limiting behaviour, not a barrier a graph may never cross. The curve in Example 1 crosses its horizontal asymptote at the origin. Keep exact locations such as $$\sqrt3$$ in the analysis; decimal approximations are only aids to placement.

</section>
