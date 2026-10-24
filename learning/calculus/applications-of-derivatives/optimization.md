---
layout: learning-topic
title: "Applied optimization"
permalink: /learning/calculus/applications-of-derivatives/optimization/
course_key: calculus
module_key: applications-of-derivatives
position: "4.8"
description: "Choose a feasible design, express its objective in one variable, and show why its best value beats every competitor."
epigraph:
  text: "…nothing at all takes place in the universe in which some rule of the maximum or minimum does not appear."
  author: "Leonhard Euler"
  source: "Methodus inveniendi (1744), Additamentum I, excerpt"
  source_url: "https://mathshistory.st-andrews.ac.uk/Biographies/Euler/quotations/"
math: true
sitemap: false
topic_script: /assets/js/learning-applications.js
exercises:
  - text: "A cost model has two variables linked by a fixed-volume requirement. What is the next useful step?"
    options: ["Differentiate while holding both variables constant", "Use the constraint to express cost in one variable and state its feasible domain", "Ignore the constraint until the end"]
    correct: 1
    why: "Optimization is over allowed choices. Eliminating a variable incorporates the constraint before calculus selects candidates."
  - text: "For \\(A(x)=x(30-2x)\\), \\(0<x\\le6\\), which input maximizes area?"
    options: ["\\(6\\)", "\\(7.5\\)", "\\(15\\)"]
    correct: 0
    why: "The unconstrained stationary input \\(7.5\\) is infeasible. The derivative \\(30-4x\\) is positive throughout the allowed interval, so the included endpoint \\(6\\) is best."
  - text: "What does a negative second derivative at a stationary input establish under the test hypotheses?"
    options: ["A local maximum", "An absolute maximum over any domain", "That no endpoint comparison is needed"]
    correct: 0
    why: "The test is local. A global optimization claim needs a comparison over the entire feasible domain."
  - text: "For an open box with \\(V=x(10-2x)^2\\), which is the physical domain?"
    options: ["\\(x>0\\)", "\\(0<x<5\\)", "\\(0\\le x\\le10\\)"]
    correct: 1
    why: "Both the height and the base side lengths must be positive."
  - text: "For fixed positive cylinder volume, why can surface area become large at both small and large radius?"
    options: ["The constraint forces a very tall narrow cylinder; wide ends become large at the other extreme", "The volume increases", "The derivative must always be positive"]
    correct: 0
    why: "The competing geometric contributions explain the interior minimum; the volume remains fixed."
  - text: "Does \\(\\lim_{x\\to+\\infty}1/x=0\\) give a minimum of zero on \\(x>0\\)?"
    options: ["Yes", "No: zero is never attained"]
    correct: 1
    why: "A limiting lower bound does not supply a feasible input achieving it."
---

<!-- Prerequisites: Extreme values, first and second derivative tests, algebraic and geometric constraints. Established here: Objective and constraint; feasible interval; comparison of candidates and global optimality. -->

## The derivative cannot choose the model

A fencing problem may ask for the greatest area; a packaging problem may ask for the least material. Before differentiating, identify the quantity being optimized and the choices allowed. The same formula on a different domain can have a different best value, or no attained best value at all.

An **objective function** measures what we want to maximize or minimize. A **constraint** relates or restricts the choices. The **feasible domain** contains only choices that satisfy the problem's requirements.

<section class="worked" markdown="1" id="fenced-pen-example">
<p class="element-label">Example 1</p>
<h3>A pen against a wall</h3>

There are $$40\text{ m}$$ of fencing for three sides of a rectangular pen; the fourth side lies against a straight wall. Let $$x$$ be each perpendicular side and $$y$$ the fenced side parallel to the wall. Then

$$2x+y=40,\qquad A=xy.$$

Use the constraint to remove $$y$$:

$$A(x)=x(40-2x),$$

with $$0<x<20$$.

The strict inequalities require a pen with positive width and length.

<div class="topic-widget applications-widget" data-applications="pen">
<figure class="applications-plot">
<div class="applications-legend" aria-label="Pen area graph legend">
<span markdown="span"><i class="applications-legend-key" style="border-color:#285b46" aria-hidden="true"></i> $$A(x)=x(40-2x)$$</span>
<span><i class="applications-legend-dot" style="background:#285b46" aria-hidden="true"></i> Selected pen</span>
<span><i class="applications-legend-dot" aria-hidden="true"></i> Maximum</span>
</div>
<svg viewBox="0 0 640 500" role="group" aria-label="A rectangular pen and its area graph"><title>A rectangular pen and its area graph</title><desc>The rectangle uses forty metres of fencing on three sides. As its depth changes, its length changes and the area moves along a downward parabola.</desc><image data-applications-fallback href="{{ '/assets/figures/learning/applications-pen.svg' | relative_url }}" width="640" height="500"/></svg>
</figure>
<div class="applications-controls" hidden></div>
<div class="widget-readouts applications-values" hidden></div>
<p class="widget-instruction" markdown="span">Drag the green point on the area graph, or focus it and use the arrow keys; hold Shift for finer steps. The amber point marks the maximum. Open endpoints represent collapsed pens, excluded from the feasible domain.</p>
</div>
Differentiate the area:

$$A^{\prime}(x)=40-4x.$$

The only critical number is $$x=10$$. The derivative is positive on $$(0,10)$$ and negative on $$(10,20)$$. Thus area increases all the way to this input and decreases all the way afterward: it is the absolute maximum on the feasible domain.

The dimensions are $$x=10\text{ m}$$ and $$y=20\text{ m}$$, giving $$A=200\text{ m}^2$$. The endpoint limits are zero, consistent with a collapsed pen at either boundary.

The second derivative $$A^{\prime\prime}=-4$$ would establish a local maximum, but the full-domain sign analysis explains why no other feasible pen does better.

<section class="attention" markdown="1">
<p class="element-label">Attention</p>
<h3>A constraint can move the optimum</h3>

Suppose the pen's depth is additionally limited to $$x\le8\text{ m}$$. The old critical number $$10$$ is now infeasible. Since $$A^{\prime}>0$$ throughout $$0<x\le8$$, the best allowed design has $$x=8$$ and $$y=24$$, with area $$192\text{ m}^2$$. A boundary introduced by the problem can determine the answer.

</section>
</section>

## A reusable modelling sequence

1. Name the objective and define variables with units.
2. Write the constraints and eliminate variables where possible.
3. State the feasible domain before solving derivative equations.
4. Find interior critical numbers and assess boundaries as appropriate.
5. Justify the best value globally and translate it back to the requested design.

<mark>A stationary point is a candidate. A global comparison makes it a solution to the design problem.</mark>

<section class="worked" markdown="1">
<p class="element-label">Example 2</p>
<h3>Cutting an open box</h3>

Remove squares of side $$x$$ from the four corners of a $$12\text{ cm}$$ square sheet, then fold up its sides. The resulting box has height $$x$$ and base sides $$12-2x$$. Therefore

$$V(x)=x(12-2x)^2,$$

with $$0<x<6$$.

<figure class="topic-figure" id="open-box-design">
<div class="applications-legend" aria-label="Open box diagram legend">
<span><i class="applications-legend-key" style="border-color:#285b46" aria-hidden="true"></i> Sheet and box edges</span>
<span><svg class="applications-legend-line" width="20" height="6" viewBox="0 0 20 6" aria-hidden="true" focusable="false"><line x1="0" y1="3" x2="20" y2="3" stroke="#617a9a" stroke-width="2.4" stroke-dasharray="6 5" stroke-linecap="butt" vector-effect="non-scaling-stroke"/></svg> Fold lines</span>
</div>
<img src="{{ '/assets/figures/learning/applications-open-box.svg' | relative_url }}" alt="A twelve centimetre square sheet with four corner squares of side x removed. Dashed fold lines enclose the square base of side twelve minus two x. The folded open box has the same square base and height x." width="640" height="330" loading="lazy">
<figcaption markdown="span">Each base edge loses $$x$$ at both ends. The flap width $$x$$ becomes the vertical height $$x$$ when folded; the base side remains $$12-2x$$.</figcaption>
</figure>

Differentiate using the product and chain rules:

$$\begin{aligned}
V^{\prime}(x)&=(12-2x)^2\\
&\quad-4x(12-2x)\\
&=(12-2x)(12-6x).
\end{aligned}$$

The roots are $$2$$ and $$6$$, but $$6$$ is excluded and gives a collapsed base. The derivative is positive on $$(0,2)$$ and negative on $$(2,6)$$. Thus the unique global maximum occurs at $$x=2$$.

The box is $$8\times8\times2\text{ cm}$$, with volume $$128\text{ cm}^3$$. The limiting volume at either excluded endpoint is zero.

</section>
<section class="worked" markdown="1">
<p class="element-label">Example 3</p>
<h3>A closed cylinder with the least surface area</h3>

A closed cylindrical container holds $$54\pi\text{ cm}^3$$. Assume uniform material thickness and ignore seams and waste, so the material used is proportional to the surface area. Minimize that area.

For radius $$r>0$$ and height $$h>0$$,

$$\pi r^2h=54\pi,$$

$$S=2\pi r^2+2\pi rh.$$

The constraint gives $$h=54/r^2$$, so

$$\begin{aligned}
S(r)&=2\pi r^2+\frac{108\pi}{r},\\
S^{\prime}(r)&=\frac{4\pi(r^3-27)}{r^2}.
\end{aligned}$$

<figure class="topic-figure" id="closed-cylinder-design">
<div class="applications-legend" aria-label="Cylinder surface area figure legend">
<span markdown="span"><i class="applications-legend-key" style="border-color:#285b46" aria-hidden="true"></i> Surface area $$S(r)$$</span>
<span><i class="applications-legend-dot" aria-hidden="true"></i> Minimum</span>
</div>
<img src="{{ '/assets/figures/learning/applications-closed-cylinder.svg' | relative_url }}?v=bb22e086ab5f" alt="A fitted lid and a closed base cover both circular ends. Radius r is marked on the lid and h is the height. The adjacent surface-area curve has its minimum at radius three and area fifty-four pi." width="640" height="350" loading="lazy">
<figcaption markdown="span">The solid lid and base both count toward surface area. With $$h=54/r^2$$, the area is smallest at $$r=3$$.</figcaption>
</figure>

The denominator is positive. The numerator changes from negative to positive at $$r=3$$, giving a global minimum on $$r>0$$. The required height is $$h=6\text{ cm}$$, and the minimum area is $$54\pi\text{ cm}^2$$.

The area tends to infinity as $$r\to0^+$$ and as $$r\to+\infty$$. Very narrow containers need a large side area; very wide ones need large ends. The optimal design balances these costs.

</section>

<section class="warning" markdown="1">
<p class="element-label">Warning</p>

On an open or unbounded domain, the extreme-value theorem is not an existence guarantee. For example, minimizing $$1/x$$ over $$x>0$$ has no solution: its values approach zero without attaining it. Report an attained design only after establishing that one exists.

</section>
