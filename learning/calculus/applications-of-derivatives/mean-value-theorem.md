---
layout: learning-topic
title: "Rolle’s theorem and mean value theorem"
permalink: /learning/calculus/applications-of-derivatives/mean-value-theorem/
course_key: calculus
module_key: applications-of-derivatives
position: "4.4"
description: "Find the instantaneous rate hidden inside an average rate, and use derivative bounds to control actual changes."
epigraph:
  text: "As for my methods, I have sought to give them all the rigour which is demanded in geometry…"
  author: "Augustin-Louis Cauchy"
  source: "Cours d’Analyse (1821), Introduction, on his methods; translated excerpt"
  source_url: "https://mathshistory.st-andrews.ac.uk/Extras/Cauchy_Calculus/"
math: true
sitemap: false
topic_script: /assets/js/learning-applications.js
exercises:
  - text: "For \\(f(x)=x^3\\) on \\([0,2]\\), what equation locates a mean-value point?"
    options: ["\\(3c^2=4\\)", "\\(3c^2=8\\)", "\\(c^3=4\\)"]
    correct: 0
    why: "The secant slope is \\(\\frac{8-0}{2-0}=4\\). Match this with the derivative, rather than with the function value."
  - text: "Which condition is required for Rolle’s theorem in addition to the mean value theorem hypotheses?"
    options: ["Equal endpoint derivatives", "Equal endpoint values", "A positive derivative"]
    correct: 1
    why: "Equal endpoint values make the average slope zero."
  - text: "If \\(-2\\le f^{\\prime}(x)\\le5\\) on \\((1,1.4)\\) and the theorem applies, what is guaranteed?"
    options: ["\\(-0.8\\le f(1.4)-f(1)\\le2\\)", "\\(-2\\le f(1.4)\\le5\\)", "\\(f(1.4)-f(1)=3\\)"]
    correct: 0
    why: "Multiply both derivative bounds by the interval length \\(0.4\\). This bounds a change, not the absolute height."
  - text: "Does the theorem guarantee exactly one matching tangent?"
    options: ["Yes", "No: it guarantees at least one", "No: it guarantees none if the endpoints differ"]
    correct: 1
    why: "For \\(x^3\\) on \\([-1,1]\\), two interior tangents have the secant slope."
  - text: "Let \\(f\\) be defined on \\(\\mathbb{R}\\setminus\\{0\\}\\), with \\(f^{\\prime}=0\\) everywhere on its domain. Must all values of \\(f\\) agree?"
    options: ["Yes", "No: each interval may have a different constant"]
    correct: 1
    why: "The theorem compares points within an interval. It cannot bridge the missing input zero."
  - text: "Why can’t the mean value theorem be applied to \\(f(x)=1/x\\) on \\([-1,1]\\)?"
    options: ["The endpoint derivatives are different", "The function is undefined at \\(0\\)", "The endpoint values are different"]
    correct: 1
    why: "At zero the function is neither defined nor differentiable. It therefore fails continuity on the closed interval and differentiability throughout the interior. Equal endpoint values are not required by the mean value theorem."
---

<!-- Prerequisites: Continuity, differentiability, extreme-value theorem, Fermat theorem. Established here: Rolle theorem; mean value theorem; zero-derivative corollary and bounds on change. -->

## What an average rate forces

A trip covering $$120\text{ km}$$ in two hours has average speed $$60\text{ km/h}$$. Under a continuous differentiable position model for travel in one direction, there must be an instant when the velocity equals that average. The velocity may reach that value more than once; the total distance and time do not tell us when.

The **mean value theorem** makes this connection for any differentiable function. We first prove the equal-endpoint case.

<section class="theorem" markdown="1">
<p class="element-label">Theorem</p>
<h3>Rolle's theorem</h3>

Suppose $$a<b$$, $$f$$ is continuous on $$[a,b]$$ and differentiable on $$(a,b)$$, and $$f(a)=f(b)$$. Then at least one $$c\in(a,b)$$ satisfies $$f^{\prime}(c)=0$$.

<details class="disclosure" markdown="1">
<summary>Proof (optional)</summary>

The extreme-value theorem gives an attained maximum and minimum. If $$f$$ is constant, its derivative is zero throughout $$(a,b)$$. Otherwise at least one extremum value differs from the common endpoint value, so it must occur at an interior input. Fermat's theorem makes the derivative there zero.

</details>

</section>

A graph that returns to its starting height must either be flat throughout or have an interior highest or lowest point. Differentiability turns that interior turn into a horizontal tangent.

<figure class="topic-figure" id="rolle-horizontal-tangent">
<div class="applications-legend" aria-label="Rolle's theorem figure legend">
<span markdown="span"><i class="applications-legend-key" style="border-color:#285b46" aria-hidden="true"></i> $$f(x)=x^2$$</span>
<span><svg class="applications-legend-line" width="20" height="6" viewBox="0 0 20 6" aria-hidden="true" focusable="false"><line x1="0" y1="3" x2="20" y2="3" stroke="#617a9a" stroke-width="2.4" stroke-dasharray="6 5" stroke-linecap="butt" vector-effect="non-scaling-stroke"/></svg> Secant</span>
<span><i class="applications-legend-key" style="border-color:#a67936;opacity:.72" aria-hidden="true"></i> Tangent</span>
</div>
<img src="{{ '/assets/figures/learning/applications-rolle.svg' | relative_url }}" alt="On x squared between minus one and one, both endpoints have height one. The dashed blue secant is horizontal, as is the amber tangent at the minimum zero, zero." width="640" height="300" loading="lazy">
<figcaption markdown="span">For $$x^2$$ on $$[-1,1]$$, equal endpoint heights give a horizontal secant. At $$c=0$$, the tangent is horizontal too.</figcaption>
</figure>

<section class="theorem" markdown="1">
<p class="element-label">Theorem</p>
<h3>Mean value theorem</h3>

If $$a<b$$, $$f$$ is continuous on $$[a,b]$$ and differentiable on $$(a,b)$$, then some $$c\in(a,b)$$ satisfies

$$f^{\prime}(c)=\frac{f(b)-f(a)}{b-a}.$$

Geometrically, an interior tangent is parallel to the secant through the endpoints.

<details class="disclosure" markdown="1">
<summary>Proof (optional)</summary>

Let $$m=(f(b)-f(a))/(b-a)$$ and subtract the secant line:

$$\begin{aligned}
g(x)&=f(x)-f(a)\\
&\quad-m(x-a).
\end{aligned}$$

This function is continuous on $$[a,b]$$ and differentiable inside, with $$g(a)=g(b)=0$$. Rolle's theorem gives $$g^{\prime}(c)=0$$. Since $$g^{\prime}(x)=f^{\prime}(x)-m$$, the desired equality follows.

</details>

</section>
<div class="topic-widget applications-widget" data-applications="mvt">
<figure class="applications-plot">
<svg viewBox="0 0 640 360" role="group" aria-label="A secant and parallel tangent to a parabola"><title>A secant and parallel tangent to a parabola</title><desc>On the parabola y equals x squared, a secant from zero to b has slope b. The tangent at b divided by two has the same slope.</desc><image data-applications-fallback href="{{ '/assets/figures/learning/applications-mvt.svg' | relative_url }}" width="640" height="360"/></svg>
</figure>
<div class="applications-controls" hidden></div>
<div class="widget-readouts applications-values" hidden></div>
<p class="widget-instruction" markdown="span">Move the right endpoint, or focus it and use the arrow keys. For $$f(x)=x^2$$ on $$[0,b]$$, the blue secant has slope $$b$$; the amber tangent at $$c=b/2$$ has the same slope.</p>
</div>

The theorem is an existence statement. Solving for the point may be easy, difficult, or impossible in elementary formulas. It does not assert a unique point, nor does it assert that the matching tangent is halfway across the interval for a general function.

<section class="worked" markdown="1">
<p class="element-label">Example 1</p>
<h3>All matching tangents</h3>

For $$f(x)=x^3$$ on $$[-1,1]$$, the hypotheses hold and the average slope is

$$\frac{1-(-1)}{1-(-1)}=1.$$

Solve $$f^{\prime}(c)=3c^2=1$$ to get $$c=\pm1/\sqrt3$$. Both lie inside the interval. The theorem promised at least one point; here there are two.

<figure class="topic-figure" id="two-mean-value-points">
<div class="applications-legend" aria-label="Two matching tangents figure legend">
<span markdown="span"><i class="applications-legend-key" style="border-color:#285b46" aria-hidden="true"></i> $$f(x)=x^3$$</span>
<span><svg class="applications-legend-line" width="20" height="6" viewBox="0 0 20 6" aria-hidden="true" focusable="false"><line x1="0" y1="3" x2="20" y2="3" stroke="#617a9a" stroke-width="2.4" stroke-dasharray="6 5" stroke-linecap="butt" vector-effect="non-scaling-stroke"/></svg> Secant</span>
<span><i class="applications-legend-key" style="border-color:#a67936;opacity:.72" aria-hidden="true"></i> Tangents</span>
</div>
<img src="{{ '/assets/figures/learning/applications-mvt-multiple.svg' | relative_url }}" alt="The cubic x cubed on minus one to one has a blue secant with slope one. Amber tangents at c minus equals minus one over square root three and c plus equals one over square root three are both parallel to that secant." width="640" height="360" loading="lazy">
<figcaption markdown="span">Both $$c_-=-1/\sqrt3$$ and $$c_+=1/\sqrt3$$ give tangents with slope $$1$$. Neither point is the interval's midpoint.</figcaption>
</figure>

</section>

## A bound for actual change

If $$m\le f^{\prime}(x)\le M$$ throughout $$(a,b)$$ and the theorem's hypotheses hold, its conclusion gives

$$\begin{aligned}
m(b-a)&\le f(b)-f(a),\\
f(b)-f(a)&\le M(b-a).
\end{aligned}$$

In particular, $$\lvert f^{\prime}(x)\rvert\le K$$ implies $$\lvert f(b)-f(a)\rvert\le K(b-a)$$. A bound on the rate becomes a bound on the accumulated change.

<section class="worked" markdown="1">
<p class="element-label">Example 2</p>
<h3>Certify a change without calculating the endpoint</h3>

For $$f(x)=\sqrt{x}$$ on $$[4,4.1]$$,

$$0<f^{\prime}(x)=\frac1{2\sqrt{x}}\le\frac14.$$

The theorem gives $$0<\sqrt{4.1}-2\le0.025$$. Thus $$2<\sqrt{4.1}\le2.025$$. The tangent estimate from the first lesson is now a certified upper bound for this particular value, because we bounded the derivative over the *whole interval*.

</section>
<section class="theorem" markdown="1">
<p class="element-label">Consequence</p>
<h3>A zero derivative on an interval</h3>

Let $$f$$ be continuous on an interval $$I$$ and differentiable in its interior. If $$f^{\prime}(x)=0$$ throughout the interior, then $$f$$ is constant on $$I$$. Continuity at any included endpoints is part of the hypothesis.

<details class="disclosure" markdown="1">
<summary>Proof (optional)</summary>

For any two inputs $$u<v$$ in $$I$$, the hypotheses hold on $$[u,v]$$. The mean value theorem yields $$f(v)-f(u)=f^{\prime}(c)(v-u)=0$$. Hence every pair of values agrees.

</details>

</section>
<section class="worked" markdown="1">
<p class="element-label">Example 3</p>
<h3>Why a corner invalidates the argument</h3>

For $$f(x)=\lvert x\rvert$$ on $$[-1,1]$$ the endpoint values agree, so the secant slope is zero. Yet every existing interior derivative is either $$-1$$ or $$1$$. At zero the derivative is missing, so neither Rolle's theorem nor the mean value theorem applies.

Checking hypotheses identifies the precise obstruction. Merely having a continuous graph is not enough.

<figure class="topic-figure" id="corner-without-a-matching-tangent">
<div class="applications-legend" aria-label="Corner counterexample figure legend">
<span markdown="span"><i class="applications-legend-key" style="border-color:#285b46" aria-hidden="true"></i> $$f(x)=\lvert x\rvert$$</span>
<span><svg class="applications-legend-line" width="20" height="6" viewBox="0 0 20 6" aria-hidden="true" focusable="false"><line x1="0" y1="3" x2="20" y2="3" stroke="#617a9a" stroke-width="2.4" stroke-dasharray="6 5" stroke-linecap="butt" vector-effect="non-scaling-stroke"/></svg> Secant</span>
<span><i class="applications-legend-dot" aria-hidden="true"></i> Corner</span>
</div>
<img src="{{ '/assets/figures/learning/applications-mvt-corner.svg' | relative_url }}" alt="The V-shaped absolute-value graph on minus one to one has equal endpoint heights and a horizontal blue secant. An amber point marks the corner at zero, where no tangent exists. The straight branches have slopes minus one and one." width="640" height="300" loading="lazy">
<figcaption markdown="span">The secant has slope $$0$$, while the branches have slopes $$-1$$ and $$1$$. The corner at $$0$$ has no derivative, so no tangent matches the secant.</figcaption>
</figure>

</section>
<section class="warning" markdown="1">
<p class="element-label">Warning</p>

A zero derivative at *one* point says nothing about constancy nearby. A zero derivative at *every* point of an interval does. On a disconnected domain, the constants on different pieces may differ.

</section>
