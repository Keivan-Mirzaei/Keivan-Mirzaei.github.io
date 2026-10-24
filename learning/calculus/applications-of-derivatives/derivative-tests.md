---
layout: learning-topic
title: "Increasing, decreasing and concavity"
permalink: /learning/calculus/applications-of-derivatives/derivative-tests/
course_key: calculus
module_key: applications-of-derivatives
position: "4.5"
description: "Use signs to read motion of a graph, distinguish a turn from a flattening, and locate changes of concavity."
math: true
sitemap: false
topic_script: /assets/js/learning-applications.js
exercises:
  - text: "On an interval, \\(f^{\\prime}<0\\) and \\(f^{\\prime\\prime}<0\\). How does the graph behave?"
    options: ["Decreasing and concave up", "Decreasing and concave down", "Increasing and concave down"]
    correct: 1
    why: "Negative slopes mean decreasing; becoming more negative means the derivative decreases, giving concave down behaviour."
  - text: "For \\(f^{\\prime}(x)=(x-2)^2\\), what happens at \\(2\\)?"
    options: ["A local minimum", "A local maximum", "No extremum: the derivative is positive on both sides"]
    correct: 2
    why: "The squared factor touches zero without a sign change. The function continues increasing through the stationary input."
  - text: "If \\(f^{\\prime\\prime}(c)=0\\), what must be checked to establish an inflection?"
    options: ["That \\(f(c)=0\\)", "That concavity changes across \\(c\\) and \\(f\\) is continuous there", "That the first derivative also vanishes"]
    correct: 1
    why: "An inflection is about a change in bending, not about the height or a horizontal tangent."
  - text: "For \\(f(x)=1/x\\), concavity changes across zero. Is zero an inflection input?"
    options: ["Yes", "No: the function is undefined there"]
    correct: 1
    why: "There is no point of the graph at zero, so no inflection point can occur there."
  - text: "If \\(f^{\\prime}(c)=0\\) and \\(f^{\\prime\\prime}(c)=5\\), with the test hypotheses satisfied, what follows?"
    options: ["A strict local minimum", "An absolute minimum on the entire domain", "An inflection"]
    correct: 0
    why: "The second derivative test gives a local minimum. It does not compare values far from \\(c\\)."
  - text: "Which function is strictly increasing on the real line although its derivative vanishes at zero?"
    options: ["\\(x^3\\)", "\\(x^2\\)", "\\(x^4\\)"]
    correct: 0
    why: "The derivative \\(3x^2\\) is positive on either side and the function rises through zero. The strict-positive derivative condition is sufficient but not necessary."
  - text: "Can a local minimum be located where the derivative fails to exist?"
    options: ["Yes: for example \\(|x|\\) at zero", "No: all minima have zero derivative", "Only at a missing domain input"]
    correct: 0
    why: "The first derivative test can use signs on either side of a corner; differentiability at the candidate itself is not required."
---

<!-- Prerequisites: Mean value theorem, critical numbers, first and second derivatives. Established here: Monotonicity theorem; first derivative test; concavity and inflection; second derivative test. -->

## Two different questions about a graph

A graph can be rising while becoming less steep, or falling while becoming less steep. The first derivative answers *which direction the graph moves*. The second derivative answers *how its slopes change*. Keeping those questions separate makes sign charts useful rather than mechanical.

<section class="theorem" markdown="1">
<p class="element-label">Theorem</p>
<h3>The sign of the first derivative</h3>

Let $$f$$ be continuous on an interval $$I$$ and differentiable at every interior point of $$I$$. Then:

- $$f^{\prime}>0$$ throughout implies $$f$$ is strictly increasing.
- $$f^{\prime}<0$$ throughout implies $$f$$ is strictly decreasing.
- $$f^{\prime}=0$$ throughout implies $$f$$ is constant.

The non-strict conditions $$f^{\prime}\ge0$$ and $$f^{\prime}\le0$$ imply nondecreasing and nonincreasing behaviour, respectively.

Strictly increasing means $$f(u)<f(v)$$ whenever $$u<v$$. Nondecreasing allows equality: $$f(u)\le f(v)$$.

The derivative conditions apply throughout the interior of $$I$$. Continuity at any included endpoints extends the conclusion to those endpoints.

<details class="disclosure" markdown="1">
<summary>Proof (optional)</summary>

Take any $$u<v$$ in the interval. The mean value theorem gives

$$f(v)-f(u)=f^{\prime}(c)(v-u)$$

for some $$c\in(u,v)$$. Since $$v-u>0$$, the derivative sign gives the appropriate comparison of the values.

</details>

</section>

The strict derivative sign is sufficient, but is not necessary: $$x^3$$ is strictly increasing even though its derivative is zero at one input.

## Turning points from a sign change

<section class="theorem" markdown="1">
<p class="element-label">Test</p>
<h3>First derivative test</h3>

Suppose $$f$$ is continuous at an interior critical number $$c$$ and differentiable immediately to either side.

- A sign change $$+\to-$$ in $$f^{\prime}$$ gives a local maximum at $$c$$.
- A sign change $$-\to+$$ gives a local minimum.
- The same nonzero sign on both sides gives neither.

Continuity joins the increasing and decreasing pieces to the actual value at $$c$$. The derivative at $$c$$ itself need not exist.

</section>
<section class="worked" markdown="1">
<p class="element-label">Example 1</p>
<h3>Make a sign chart, not a list of zeros</h3>

For $$f(x)=x^3-3x$$, $$f^{\prime}(x)=3(x-1)(x+1)$$. The critical numbers are $$-1$$ and $$1$$. Split the real line there and determine the sign on each interval:

<div class="table-scroll" markdown="1" role="region" aria-label="First derivative sign test" tabindex="0">

| Input interval | $$(-\infty,-1)$$ | $$(-1,1)$$ | $$(1,\infty)$$ |
| --- | :---: | :---: | :---: |
| Sign of $$x+1$$ | $$-$$ | $$+$$ | $$+$$ |
| Sign of $$x-1$$ | $$-$$ | $$-$$ | $$+$$ |
| Sign of $$f^{\prime}$$ | $$+$$ | $$-$$ | $$+$$ |
| Behaviour of $$f$$ | increasing | decreasing | increasing |

</div>

Thus $$(-1,2)$$ is a local maximum and $$(1,-2)$$ is a local minimum. The derivative signs classify the inputs; substituting into $$f$$ supplies their heights.

</section>
<div class="topic-widget applications-widget graph-album" data-applications="signs">
<div class="applications-controls" hidden></div>
<figure class="applications-plot">
<svg viewBox="0 0 640 730" role="group" aria-label="A function, its first derivative and its second derivative"><title>A function, its first derivative and its second derivative</title><desc>Three aligned plots relate the height of each derivative to the slope of the graph above it. Choose a cubic with turning points, a cubic with a flat crossing, or a quartic with a flat minimum.</desc><image data-applications-fallback href="{{ '/assets/figures/learning/applications-signs.svg' | relative_url }}" width="640" height="730"/></svg>
</figure>
<div class="widget-readouts applications-values" hidden></div>
<p class="widget-instruction" markdown="span">Choose a function above, then drag any green point or focus it and use the arrow keys. The points share the same input $$x$$. Compare each tangent's slope with the height of the next graph. The vertical scales differ, so compare signs and values rather than apparent steepness. At a zero derivative, inspect both sides.</p>
</div>

## Concavity describes the change of slope

A differentiable function is **concave up** on an interval when $$f^{\prime}$$ is nondecreasing, and **concave down** when $$f^{\prime}$$ is nonincreasing. The graph bends toward increasing or decreasing tangent slopes, respectively. On an interval where the second derivative exists, the monotonicity theorem gives:

$$\begin{aligned}
f^{\prime\prime}>0&\ \Longrightarrow\ \text{concave up},\\
f^{\prime\prime}<0&\ \Longrightarrow\ \text{concave down}.
\end{aligned}$$

For example, $$f(x)=e^{-x}$$ has $$f^{\prime}<0$$ and $$f^{\prime\prime}>0$$. It falls, while its negative slopes become less steep: it is decreasing and concave up.

<section class="definition" markdown="1">
<p class="element-label">Definition</p>
<h3>Inflection point</h3>

An **inflection point** is a point $$(c,f(c))$$ on a continuous graph where the concavity changes from one side to the other. Here we check concavity on intervals directly adjacent to $$c$$.

A zero or undefined second derivative identifies a possible location; it does not establish a change. The input must belong to the graph.

</section>
<section class="worked" markdown="1">
<p class="element-label">Example 2</p>
<h3>A change of concavity without a turn</h3>

For $$f(x)=x^3-3x$$, the second derivative is $$6x$$: negative for $$x<0$$ and positive for $$x>0$$. Hence $$(0,0)$$ is an inflection point. The slope there is $$f^{\prime}(0)=-3$$, so the function is decreasing as it passes through the inflection.

<figure class="topic-figure" id="decreasing-inflection">
<div class="applications-legend" aria-label="Inflection point figure legend">
<span markdown="span"><i class="applications-legend-key" style="border-color:#285b46" aria-hidden="true"></i> $$f(x)=x^3-3x$$</span>
<span markdown="span"><i class="applications-legend-key" style="border-color:#a67936;opacity:.72" aria-hidden="true"></i> Tangent $$y=-3x$$</span>
<span><i class="applications-legend-dot" aria-hidden="true"></i> Inflection</span>
</div>
<img src="{{ '/assets/figures/learning/applications-inflection.svg' | relative_url }}" alt="The curve x cubed minus three x bends downward to the left of the origin and upward to the right. It passes through the origin with a downward sloping amber tangent." width="640" height="350" loading="lazy">
<figcaption markdown="span">At $$(0,0)$$, concavity changes from down to up, while the slope remains negative. The tangent is not horizontal.</figcaption>
</figure>

An inflection need not have a horizontal tangent, and it need not be a local extremum.

</section>

## A shortcut for a stationary point

<section class="theorem" markdown="1">
<p class="element-label">Test</p>
<h3>Second derivative test</h3>

Suppose $$f$$ is twice continuously differentiable near $$c$$ and $$f^{\prime}(c)=0$$. Then:

- $$f^{\prime\prime}(c)>0$$ gives a strict local minimum.
- $$f^{\prime\prime}(c)<0$$ gives a strict local maximum.
- $$f^{\prime\prime}(c)=0$$ leaves the test inconclusive.

<details class="disclosure" markdown="1">
<summary>Why the test works (optional)</summary>

If $$f^{\prime\prime}(c)>0$$, continuity keeps $$f^{\prime\prime}$$ positive on a small interval about $$c$$. Thus $$f^{\prime}$$ is strictly increasing there. Since $$f^{\prime}(c)=0$$, its signs are negative to the left and positive to the right. The first derivative test gives a minimum. The negative case reverses the signs.

</details>

</section>
<section class="worked" markdown="1">
<p class="element-label">Example 3</p>
<h3>The same inconclusive test, three outcomes</h3>

At zero, $$x^4$$, $$-x^4$$ and $$x^3$$ all have first and second derivatives equal to zero. Yet they have, respectively, a local minimum, a local maximum, and neither.

Use the first derivatives $$4x^3$$, $$-4x^3$$ and $$3x^2$$ to distinguish the cases. For $$x^4$$ the second derivative $$12x^2$$ is positive on both sides: its minimum is not an inflection. For $$x^3$$ the second derivative $$6x$$ changes sign: its flat crossing is an inflection.

<div class="extrema-comparison" id="inconclusive-second-derivative">
<figure class="topic-figure">
<div class="applications-legend" aria-label="Quartic minimum legend">
<span markdown="span"><i class="applications-legend-key" style="border-color:#285b46" aria-hidden="true"></i> $$f(x)=x^4$$</span>
<span markdown="span"><i class="applications-legend-key" style="border-color:#a67936;opacity:.72" aria-hidden="true"></i> Tangent $$y=0$$</span>
</div>
<img src="{{ '/assets/figures/learning/applications-flat-minimum.svg' | relative_url }}" alt="The curve x to the fourth stays above its horizontal tangent at zero, where it has a flat local minimum." width="280" height="215" loading="lazy">
<figcaption markdown="span">$$f^{\prime}$$ changes from $$-$$ to $$+$$: a local minimum. Concavity does not change.</figcaption>
</figure>
<figure class="topic-figure">
<div class="applications-legend" aria-label="Quartic maximum legend">
<span markdown="span"><i class="applications-legend-key" style="border-color:#285b46" aria-hidden="true"></i> $$f(x)=-x^4$$</span>
<span markdown="span"><i class="applications-legend-key" style="border-color:#a67936;opacity:.72" aria-hidden="true"></i> Tangent $$y=0$$</span>
</div>
<img src="{{ '/assets/figures/learning/applications-flat-maximum.svg' | relative_url }}" alt="The curve minus x to the fourth stays below its horizontal tangent at zero, where it has a flat local maximum." width="280" height="215" loading="lazy">
<figcaption markdown="span">$$f^{\prime}$$ changes from $$+$$ to $$-$$: a local maximum. Concavity does not change.</figcaption>
</figure>
<figure class="topic-figure">
<div class="applications-legend" aria-label="Stationary inflection legend">
<span markdown="span"><i class="applications-legend-key" style="border-color:#285b46" aria-hidden="true"></i> $$f(x)=x^3$$</span>
<span markdown="span"><i class="applications-legend-key" style="border-color:#a67936" aria-hidden="true"></i> Tangent $$y=0$$</span>
</div>
<img src="{{ '/assets/figures/learning/applications-critical-cube.svg' | relative_url }}" alt="The curve x cubed crosses its horizontal tangent at zero and continues increasing. Concavity changes there, giving an inflection without an extremum." width="280" height="215" loading="lazy">
<figcaption markdown="span">$$f^{\prime}$$ is positive on both sides: no extremum. Concavity changes, giving an inflection.</figcaption>
</figure>
</div>

</section>
<section class="warning" markdown="1">
<p class="element-label">Warning</p>

Never infer an inflection from $$f^{\prime\prime}(c)=0$$ alone. Never infer an extremum from $$f^{\prime}(c)=0$$ alone. Split sign charts at missing domain inputs, but do not turn a missing point into an extremum or inflection.

</section>
