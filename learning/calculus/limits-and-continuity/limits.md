---
layout: learning-topic
title: "Limits and one-sided limits"
permalink: /learning/calculus/limits-and-continuity/limits/
course_key: calculus
module_key: limits-and-continuity
position: "1.1"
description: What a function approaches, even when its value at the point tells a different story.
math: true
topic_script: /assets/js/learning-limits.js
sitemap: false
exercises:
  - text: 'As \(x\to 3\), what does \(2x+1\) approach?'
    options: ['\(3\)', '\(6\)', '\(7\)', 'The limit does not exist']
    correct: 2
    why: 'A linear function approaches its value at the point: \(2(3)+1=7\).'
  - text: 'For \(x\ne 3\), let \(f(x)=\frac{x^2-9}{x-3}\). Find \(\lim_{x\to3}f(x)\).'
    options: ['\(0\)', '\(3\)', '\(6\)', 'The limit does not exist']
    correct: 2
    why: 'For \(x\ne3\), factor and cancel to get \(f(x)=x+3\), which approaches \(6\).'
  - text: 'A function approaches \(2\) from the left of \(x=0\) and \(5\) from the right. What is its two-sided limit at \(0\)?'
    options: ['\(2\)', '\(5\)', '\(3.5\)', 'The limit does not exist']
    correct: 3
    why: 'The left-hand and right-hand limits must agree. Averaging them does not give a limit.'
  - text: 'Near \(x=2\), a graph approaches height \(4\) from both sides, but \(f(2)=1\). What is \(\lim_{x\to2}f(x)\)?'
    options: ['\(1\)', '\(4\)', '\(5\)', 'The limit does not exist']
    correct: 1
    why: 'A limit depends on nearby values. Changing the value at the point does not change the limit.'
  - text: 'Substituting into a quotient gives \(0/0\). What can you conclude about the limit from this alone?'
    options: ['It is \(0\)', 'It is \(1\)', 'It does not exist', 'More analysis is needed']
    correct: 3
    why: '\(0/0\) is inconclusive. Simplification or another argument is needed.'

---

## The idea

Imagine moving along a graph toward a chosen input. Watch the *height of the graph* as you get closer. If the height settles toward one number, that number is the limit—even if the graph has a hole or a different value at the chosen input.

<div class="topic-widget limits-widget" id="limits-explorer">
<div class="limits-plot">
<svg viewBox="0 0 640 370" role="group" aria-labelledby="limits-graph-title limits-graph-desc">
<title id="limits-graph-title">Move along a graph toward a hole</title>
<desc id="limits-graph-desc">Nearby heights approach 4 as the input approaches 2. At the input 2, the function value is instead 1.</desc>
<g fill="none" stroke="#c4cebf"><path d="M50 340H575M50 340V30"/><path d="M290 340V140M50 140H290" stroke-dasharray="4 5"/></g>
<path d="M50 240L530 40" fill="none" stroke="#285b46" stroke-width="2.5"/>
<path id="limit-guides" d="M170 340V190H50" fill="none" stroke="#82947b" stroke-dasharray="4 5"/>
<circle cx="290" cy="140" r="7" fill="#fcfcf9" stroke="#285b46" stroke-width="2"/>
<circle cx="290" cy="290" r="5" fill="#285b46"/>
<g id="limit-handle" role="slider" tabindex="0" style="outline: none" aria-label="Graph input x" aria-valuemin="0" aria-valuemax="4" aria-valuenow="1" aria-description="Drag horizontally or use Left and Right arrow keys. The point snaps to x equals 2 nearby. Hold Shift for fine movement without snapping.">
<circle id="limit-focus-ring" cx="170" cy="190" r="13" fill="none" stroke="#285b46" stroke-width="1.5"/>
<circle id="limit-hit-target" cx="170" cy="190" r="22" fill="transparent"/>
<circle id="limit-moving-point" cx="170" cy="190" r="7" fill="#285b46" stroke="#fcfcf9" stroke-width="2"/>
</g>
<path d="M290 337V343M47 140H53M47 290H53" fill="none" stroke="#9eac96" stroke-width="1"/>
<g fill="#686e66" font-family="-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif" font-size="14"><text x="283" y="361">2</text><text x="27" y="145">4</text><text x="27" y="295">1</text></g>
</svg>
<div id="limit-legend" class="graph-legend" aria-label="Graph legend"><span class="legend-curve" aria-hidden="true"></span>\(f\)</div>
<div class="graph-feedback" id="limit-feedback"><span>\(x=\) <output id="limit-x">1.000</output></span><span>\(f(x)=\) <output id="limit-y">3.000</output></span></div>
<span class="graph-axis graph-axis-x">\(x\)</span><span class="graph-axis graph-axis-y">\(y\)</span>
</div>

<p class="widget-instruction">Drag toward \(x=2\): nearby values approach \(4\), but the point snaps to \(f(2)=1\).</p>
</div>

<aside class="definition" markdown="1">
<p class="element-label">Definition · intuitive</p>
<h3>Limit of a function</h3>

We write

$$
\lim_{x\to a} f(x)=L
$$

when we can make $$f(x)$$ as close to $$L$$ as we wish by taking $$x$$ sufficiently close to $$a$$, with $$x\ne a$$. Here, we allow inputs on either side of $$a$$; their outputs must approach the same $$L$$.

</aside>

The key distinction is <mark>approaching a point is different from evaluating at the point</mark>. A limit may exist even if $$f(a)$$ is missing or has a different value.

## A practical starting point

For a polynomial, substitute the approaching value. For a quotient of polynomials, this also works *when the denominator is nonzero there*. If substitution fails, investigate; it is not automatically a failed limit.

## Worked examples

<section class="worked" markdown="1">
<p class="element-label">Example 1</p>
<h3 class="worked-title">Direct substitution</h3>

Find $$\lim_{x\to 2}(x^2+1)$$. A polynomial has no break at the point, so

$$
\lim_{x\to 2}(x^2+1)=2^2+1=5.
$$

</section>

<section class="worked" markdown="1">
<p class="element-label">Example 2</p>
<h3 class="worked-title">A hole, not a dead end</h3>

Find $$\lim_{x\to 2}\frac{x^2-4}{x-2}$$. Direct substitution gives $$0/0$$. Instead, factor:

$$
\frac{x^2-4}{x-2}
=\frac{(x-2)(x+2)}{x-2}
=x+2,\qquad x\ne 2.
$$

Near $$2$$, this follows the line in the interactive graph, apart from its value at $$2$$. Therefore,

$$
\lim_{x\to 2}\frac{x^2-4}{x-2}=\lim_{x\to 2}(x+2)=4.
$$

Cancellation is valid here because a limit uses nearby points, where $$x-2\ne 0$$. It does *not* define the original quotient at $$2$$.

</section>

<aside class="warning" markdown="1">
<p class="element-label">Warning</p>

$$0/0$$ is not an answer. It means direct substitution is inconclusive, not that the limit is zero or that it does not exist.

</aside>

## Approaching from one side

Sometimes we restrict where the input comes from. A **left-hand limit**, written $$\lim_{x\to a^-}f(x)$$, uses only inputs smaller than $$a$$. A **right-hand limit**, written $$\lim_{x\to a^+}f(x)$$, uses only inputs larger than $$a$$.

The ordinary limit we started with is also called a **two-sided limit**. A *finite* two-sided limit exists exactly when both one-sided limits exist and agree on the same finite value. Infinite limits describe a different kind of behavior, introduced later in this module.

<section class="worked" markdown="1">
<p class="element-label">Example 3</p>
<h3 class="worked-title">Two sides, two answers</h3>

Suppose

$$
g(x)=\begin{cases}1,&x<0,\\3,&x\ge 0.\end{cases}
$$

From the left we stay on the lower branch; from the right we stay on the upper branch. Therefore,

$$
\lim_{x\to 0^-}g(x)=1,
\qquad
\lim_{x\to 0^+}g(x)=3.
$$

The one-sided limits disagree, so *the two-sided limit does not exist*. The fact that $$g(0)=3$$ cannot repair the jump.

</section>

## When a limit fails

For a finite limit, the graph must settle toward one height. A disagreement between sides is only one way this can fail: even a single side may never settle.

<div class="limit-album graph-album topic-widget">

<div class="scenario-panel scenario-jump">
<figure class="topic-figure"><img src="{{ '/assets/figures/learning/limits-jump.svg' | relative_url }}" alt="Different approached heights on the two sides of zero." width="640" height="360"><figcaption>For \(g(x)=1\) when \(x<0\) and \(g(x)=3\) otherwise, the two sides approach different heights. The two-sided limit does not exist.</figcaption></figure>
</div>
<div class="scenario-panel scenario-unbounded">
<figure class="topic-figure"><img src="{{ '/assets/figures/learning/limits-unbounded.svg' | relative_url }}" alt="The two branches of one over x squared rise beyond the graph as x approaches zero." width="640" height="360"><figcaption>For \(f(x)=1/x^2\), outputs grow without bound as \(x\to0\). We write \(\lim_{x\to0}f(x)=+\infty\): there is no finite limiting height.</figcaption></figure>
</div>
<div class="scenario-panel scenario-oscillation">
<figure class="topic-figure"><img src="{{ '/assets/figures/learning/limits-oscillation.svg' | relative_url }}" alt="Sine of one over x oscillates between minus one and one on both sides of zero." width="640" height="360"><figcaption>For \(f(x)=\sin(1/x)\), inputs approaching zero from either side still give the full oscillation between \(-1\) and \(1\). Even a one-sided limit does not exist.</figcaption></figure>
</div>
<fieldset class="scenario-choices"><legend>Choose a scenario</legend>
<label><input type="radio" name="limit-scenario" value="jump" checked><span>A jump</span></label>
<label><input type="radio" name="limit-scenario" value="unbounded"><span>Unbounded growth</span></label>
<label><input type="radio" name="limit-scenario" value="oscillation"><span>Oscillation</span></label>
</fieldset>
</div>

<aside class="note"><p class="element-label">Note</p><p>Graphs suggest a pattern; an algebraic or logical argument establishes the limit. A missing function value alone does not prevent a limit.</p></aside>
