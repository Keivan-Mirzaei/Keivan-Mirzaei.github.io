---
layout: learning-topic
title: "Extreme values and critical numbers"
permalink: /learning/calculus/applications-of-derivatives/extreme-values/
course_key: calculus
module_key: applications-of-derivatives
position: "4.3"
description: "Distinguish nearby peaks from global bounds, then find every candidate on a closed interval."
epigraph:
  text: "Nature is thrifty in all its actions."
  author: "Pierre-Louis Moreau de Maupertuis"
  source: "Principle of least action (1744); English wording quoted in Scientific Reports (2022), A unifying physically meaningful relativistic action"
  source_url: "https://www.nature.com/articles/s41598-022-14740-7"
math: true
sitemap: false
exercises:
  - text: "Which statement follows from continuity on \\([2,5]\\)?"
    options: ["The maximum occurs in the interior", "Both absolute extrema are attained", "There is exactly one maximum", "The derivative is zero somewhere"]
    correct: 1
    why: "The extreme-value theorem guarantees attained extrema. A strictly increasing line attains them only at endpoints and never has zero derivative."
  - text: "For \\(f(x)=1/(x-2)\\), is \\(2\\) a critical number?"
    options: ["Yes: the derivative is undefined", "No: \\(2\\) is not in the function’s domain", "Yes: every asymptote is critical"]
    correct: 1
    why: "A critical number must be an input where the original function is defined."
  - text: "Which candidate list is complete for \\(f(x)=|x|\\) on \\([-2,1]\\)?"
    options: ["\\(-2\\) and \\(1\\)", "\\(0\\) only", "\\(-2\\), \\(0\\) and \\(1\\)"]
    correct: 2
    why: "Include both endpoints and the interior corner, where the derivative does not exist."
  - text: "What are the absolute extrema of \\(f(x)=x\\) on \\((0,1]\\)?"
    options: ["Minimum \\(0\\) and maximum \\(1\\)", "Maximum \\(1\\); no minimum", "Neither exists"]
    correct: 1
    why: "The value \\(1\\) is attained. Every positive value in the domain has a smaller positive value, so no minimum is attained."
  - text: "If \\(f^{\\prime}(c)=0\\), what additional fact would establish a local minimum directly from its definition?"
    options: ["\\(f(c)=0\\)", "All sufficiently nearby values are at least \\(f(c)\\)", "\\(c\\) lies in the domain"]
    correct: 1
    why: "Zero slope is a candidate condition. The local comparison of heights is the defining condition."
  - text: "Two distinct inputs give the same smallest value on the domain. How many absolute minimum values are there?"
    options: ["One value, attained twice", "Two different values", "No minimum because it is not unique"]
    correct: 0
    why: "Distinguish the single smallest output value from the possibly multiple inputs at which it is achieved."
---

<!-- Prerequisites: Continuity on intervals, derivatives, domain restrictions. Established here: Local and absolute extrema; extreme-value theorem; Fermat theorem; critical numbers and closed-interval method. -->

## Largest compared with what?

The top of a small hill is higher than nearby ground, but it need not be the highest point in a landscape. Calculus makes the same distinction between a local comparison and an absolute one. The domain is part of the question: restricting the landscape can change its highest and lowest points.

<section class="definition" markdown="1">
<p class="element-label">Definition</p>
<h3>Local and absolute extrema</h3>

A function $$f$$ has an **absolute maximum** at $$c$$ on its stated domain $$D$$ if $$f(x)\le f(c)$$ for every $$x\in D$$. Reverse the inequality for an **absolute minimum**.

It has a **local maximum** at an interior input $$c$$ if the same comparison holds for all domain inputs sufficiently close to $$c$$. Reverse the inequality for a **local minimum**. Together, maxima and minima are called **extrema**.

We use the interior-point convention for local extrema in this course. Endpoints still matter for absolute extrema. The input $$c$$ is the location; $$f(c)$$ is the extremum value.

</section>
<figure class="topic-figure" id="local-and-absolute-extrema">
<img src="{{ '/assets/figures/learning/applications-extrema.svg' | relative_url }}" alt="The cubic x cubed minus three x on minus two to three has a local maximum below the right endpoint. Amber points labelled minus two, minus two and one, minus two share a dashed horizontal guide at height minus two; both attain the absolute minimum." width="640" height="500">
<figcaption markdown="span">On $$[-2,3]$$, the local maximum is below the right endpoint. Both amber points lie on $$y=-2$$ and attain the absolute minimum.</figcaption>
</figure>
<section class="theorem" markdown="1">
<p class="element-label">Theorem</p>
<h3>Extreme-value theorem</h3>

If $$f$$ is continuous on a closed bounded interval $$[a,b]$$, then $$f$$ attains both an absolute maximum and an absolute minimum there.

The theorem guarantees that both values are achieved. It does not say they are unique, that they occur in the interior, or how to locate them. We state this existence theorem without proof.

</section>

Each hypothesis matters. Choose a case below to see how the conclusion can fail.

<div class="extrema-album graph-album topic-widget" id="extreme-value-hypotheses">
<div class="scenario-panel extrema-open"><figure class="topic-figure">
<img src="{{ '/assets/figures/learning/applications-evt-open.svg' | relative_url }}" alt="The line y equals x on the open interval zero to one has open circles at both endpoints. Neither zero nor one is attained." width="640" height="360">
<figcaption markdown="span"><strong>The interval is not closed.</strong> On $$(0,1)$$, $$f(x)=x$$ approaches $$0$$ and $$1$$ without reaching either. There is no absolute minimum or maximum.</figcaption>
</figure></div>
<div class="scenario-panel extrema-unbounded"><figure class="topic-figure">
<img src="{{ '/assets/figures/learning/applications-evt-unbounded.svg' | relative_url }}" alt="The line y equals x on the interval zero to infinity has a filled point at the origin and an arrow indicating continued growth." width="640" height="360" loading="lazy">
<figcaption markdown="span"><strong>The interval is unbounded.</strong> On $$[0,\infty)$$, $$f(x)=x$$ attains its minimum $$0$$ at $$x=0$$, but has no absolute maximum.</figcaption>
</figure></div>
<div class="scenario-panel extrema-discontinuous"><figure class="topic-figure">
<img src="{{ '/assets/figures/learning/applications-evt-discontinuous.svg' | relative_url }}" alt="On the closed interval zero to one, a filled point gives f of zero equal to zero, while the reciprocal curve for positive inputs rises without bound toward zero." width="640" height="360" loading="lazy">
<figcaption markdown="span"><strong>Continuity fails.</strong> The domain $$[0,1]$$ is closed and bounded, but $$f(0)=0$$ and $$f(x)=1/x$$ for $$0\lt x\le1$$ give a discontinuity at $$0$$. The outputs are unbounded above, so no absolute maximum exists.</figcaption>
</figure></div>
<fieldset class="scenario-choices"><legend>Choose an extreme-value theorem hypothesis to remove</legend>
<label><input type="radio" name="evt-hypothesis" value="open" checked><span>Open interval</span></label>
<label><input type="radio" name="evt-hypothesis" value="unbounded"><span>Unbounded interval</span></label>
<label><input type="radio" name="evt-hypothesis" value="discontinuous"><span>Discontinuous function</span></label>
</fieldset>
</div>

## Why an interior smooth extremum has zero slope

At a smooth local peak, the graph rises toward the point and falls away. We can make the horizontal-tangent conclusion precise directly from the derivative definition.

<section class="theorem" markdown="1">
<p class="element-label">Theorem</p>
<h3>Fermat's theorem</h3>

If $$f$$ has a local extremum at an interior input $$c$$ and is differentiable there, then $$f^{\prime}(c)=0$$.

<details class="disclosure" markdown="1">
<summary>Proof (optional)</summary>

At a local maximum, $$f(c+h)-f(c)\le0$$ for sufficiently small $$h$$. For positive $$h$$ the difference quotient is nonpositive; for negative $$h$$ it is nonnegative. If the common derivative limit exists, it must be both nonpositive and nonnegative, hence zero. At a local minimum the inequalities reverse and yield the same conclusion.

</details>

</section>

There are three ways a candidate can escape the horizontal-tangent picture: it can be an endpoint, a point where the derivative does not exist, or a horizontal tangent that is not an extremum at all.

<section class="definition" markdown="1">
<p class="element-label">Definition</p>
<h3>Critical numbers</h3>

An interior input $$c$$ in the domain of $$f$$ is a **critical number** if $$f^{\prime}(c)=0$$ or $$f^{\prime}(c)$$ does not exist as a finite number. The point $$(c,f(c))$$ is a critical point of the graph.

A missing domain input is not a critical number. Every interior local extremum is critical, but the converse need not hold.

</section>
<section class="worked" markdown="1">
<p class="element-label">Example 1</p>
<h3>Three horizontal or sharp behaviours</h3>

The function $$x^2$$ has derivative zero and a local minimum at zero. The function $$x^3$$ also has derivative zero there, but takes smaller values to the left and larger values to the right: no local extremum occurs. The function $$\lvert x\rvert$$ has no derivative at zero, yet has a minimum there.

<div class="extrema-comparison" id="critical-point-comparison">
<figure class="topic-figure">
<div class="applications-legend" aria-label="Parabola legend">
<span markdown="span"><i class="applications-legend-key" style="border-color:#285b46" aria-hidden="true"></i> $$f(x)=x^2$$</span>
<span markdown="span"><i class="applications-legend-key" style="border-color:#a67936" aria-hidden="true"></i> Tangent $$y=0$$</span>
</div>
<img src="{{ '/assets/figures/learning/applications-critical-square.svg' | relative_url }}" alt="The parabola x squared stays above its horizontal amber tangent at the origin, where it has a local minimum." width="280" height="215" loading="lazy">
<figcaption markdown="span">A local minimum with $$f^{\prime}(0)=0$$.</figcaption>
</figure>
<figure class="topic-figure">
<div class="applications-legend" aria-label="Cubic legend">
<span markdown="span"><i class="applications-legend-key" style="border-color:#285b46" aria-hidden="true"></i> $$f(x)=x^3$$</span>
<span markdown="span"><i class="applications-legend-key" style="border-color:#a67936" aria-hidden="true"></i> Tangent $$y=0$$</span>
</div>
<img src="{{ '/assets/figures/learning/applications-critical-cube.svg' | relative_url }}" alt="The curve x cubed crosses its horizontal amber tangent at the origin, so the origin is not a local extremum." width="280" height="215" loading="lazy">
<figcaption markdown="span">No local extremum, although $$f^{\prime}(0)=0$$.</figcaption>
</figure>
<figure class="topic-figure">
<div class="applications-legend" aria-label="Absolute-value legend">
<span markdown="span"><i class="applications-legend-key" style="border-color:#285b46" aria-hidden="true"></i> $$f(x)=\lvert x\rvert$$</span>
</div>
<img src="{{ '/assets/figures/learning/applications-critical-absolute.svg' | relative_url }}" alt="The absolute value of x has a sharp corner and a local minimum at the origin, where the derivative does not exist." width="280" height="215" loading="lazy">
<figcaption markdown="span">A local minimum where $$f^{\prime}(0)$$ does not exist.</figcaption>
</figure>
</div>

So “solve $$f^{\prime}=0$$” is only part of a search. It misses corners and cannot classify the solutions on its own.

</section>

## Find absolute extrema on a closed interval

If $$f$$ is continuous on $$[a,b]$$, existence is guaranteed. Fermat's theorem says that every interior extremum is a critical number. Therefore:

1. Find the critical numbers in $$(a,b)$$, including points with no finite derivative.
2. Evaluate $$f$$ at those inputs and at both endpoints.
3. Compare the *function values*, and report all inputs where the largest and smallest values occur.

<mark>The derivative locates candidates. The original function decides their heights.</mark>

<section class="worked" markdown="1">
<p class="element-label">Example 2</p>
<h3>An interior peak and a larger endpoint</h3>

Find the absolute extrema of $$f(x)=x^3-3x$$ on $$[-2,3]$$. The function is continuous. Its derivative is

$$\begin{aligned}
f^{\prime}(x)&=3(x^2-1)\\
&=3(x-1)(x+1).
\end{aligned}$$

The interior critical numbers are $$-1$$ and $$1$$. Compare all four candidates:

<div class="table-scroll" markdown="1" role="region" aria-label="Extreme-value candidates" tabindex="0">

| Input $$x$$ | $$-2$$ | $$-1$$ | $$1$$ | $$3$$ |
| --- | :---: | :---: | :---: | :---: |
| Value $$f(x)$$ | $$-2$$ | $$2$$ | $$-2$$ | $$18$$ |

</div>

The absolute maximum value is $$18$$ at $$x=3$$. The absolute minimum value is $$-2$$ at both $$x=-2$$ and $$x=1$$. The interior peak at $$x=-1$$ is only local.

</section>
<section class="worked" markdown="1">
<p class="element-label">Example 3</p>
<h3>A candidate where differentiation fails</h3>

Find the absolute extrema of $$f(x)=\lvert x-1\rvert$$ on $$[-1,4]$$. It is continuous. Its derivative is $$-1$$ for $$x<1$$ and $$1$$ for $$x>1$$; no derivative exists at $$1$$.

The candidates are $$-1,1,4$$, with values $$2,0,3$$. Thus the absolute minimum is $$0$$ at $$1$$ and the absolute maximum is $$3$$ at $$4$$. There were no solutions to $$f^{\prime}(x)=0$$, but there was an interior minimum.

<figure class="topic-figure" id="corner-and-endpoint-extrema">
<div class="applications-legend" aria-label="Corner example legend">
<span markdown="span"><i class="applications-legend-key" style="border-color:#285b46" aria-hidden="true"></i> $$f(x)=\lvert x-1\rvert$$</span>
<span><i class="applications-legend-dot" aria-hidden="true"></i> Absolute extrema</span>
</div>
<img src="{{ '/assets/figures/learning/applications-extrema-corner.svg' | relative_url }}" alt="The graph of the absolute value of x minus one on minus one to four has an absolute minimum at the corner one, zero and an absolute maximum at the right endpoint four, three. These two points are amber; the left endpoint minus one, two is green." width="640" height="345" loading="lazy">
<figcaption markdown="span">The minimum value $$0$$ occurs at the corner $$(1,0)$$; the maximum value $$3$$ occurs at the endpoint $$(4,3)$$. Both candidates must be checked even though neither comes from solving $$f^{\prime}(x)=0$$.</figcaption>
</figure>

</section>
<section class="attention" markdown="1">
<p class="element-label">Attention</p>
<h3>When the domain changes</h3>

For $$f(x)=x^2$$ on $$(0,2]$$, the maximum $$4$$ is attained at $$2$$, but there is no minimum: zero is approached and never reached. A boundary limit is not an attained extremum. On an open or unbounded domain, inspect what happens toward its boundaries instead of invoking the extreme-value theorem automatically.

</section>
