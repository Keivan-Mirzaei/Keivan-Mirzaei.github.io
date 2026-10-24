---
layout: learning-topic
title: "Continuity and discontinuities"
permalink: /learning/calculus/limits-and-continuity/continuity/
course_key: calculus
module_key: limits-and-continuity
position: "1.5"
description: When the value at a point agrees with what the nearby values approach.
epigraph:
  text: "Upon those who step into the same rivers, different and again different waters flow."
  author: "Heraclitus"
  source: "Fragment B12, A Presocratics Reader, selection 39, quoting Arius Didymus"
  source_url: "https://users.manchester.edu/Facstaff/SSNaragon/Online/texts/316/Presocratics/Heraclitus.pdf"
math: true
topic_script: /assets/js/learning-continuity.js
sitemap: false
exercises:
  - text: 'Is \(f(x)=x^2-3x+2\) continuous at \(x=1\)?'
    options: ['Yes', 'No: its value is zero', 'No: its limit does not exist']
    correct: 0
    why: 'A polynomial is continuous everywhere. Both its value and its limit at \(1\) are \(0\). A zero value is not a discontinuity.'
  - text: 'Suppose \(\lim_{x\to2}f(x)=4\), but \(f(2)=1\). What fails?'
    options: ['The function value is undefined', 'The limit does not exist', 'The limit and function value do not agree']
    correct: 2
    why: 'Both quantities exist, but \(4\ne1\). Continuity requires equality.'
  - text: 'For \(x\ne3\), let \(h(x)=\frac{x^2-9}{x-3}\). Which choice of \(h(3)\) makes it continuous at \(3\)?'
    options: ['\(0\)', '\(3\)', '\(6\)', 'No choice works']
    correct: 2
    why: 'For \(x\ne3\), \(h(x)=x+3\), so its limit at \(3\) is \(6\). Set \(h(3)=6\).'
  - text: 'A function approaches \(1\) from the left of \(0\) and \(3\) from the right. Can assigning a new value to \(f(0)\) make it continuous there?'
    options: ['Yes: set it to \(1\)', 'Yes: set it to \(2\)', 'Yes: set it to \(3\)', 'No']
    correct: 3
    why: 'Changing one value does not change the one-sided limits. Their disagreement cannot be repaired at just one point.'
  - text: 'For which real values of \(x\) is \(r(x)=\frac{1}{x-2}\) continuous?'
    options: ['At every real number', 'At every point except \(2\)', 'Only at \(2\)', 'Nowhere']
    correct: 1
    why: 'A rational function is continuous wherever its denominator is nonzero. Here \(x=2\) is outside the domain.'
  - text: 'Why can we find \(\lim_{x\to4}\sqrt{x+5}\) by substituting \(x=4\)?'
    options: ['Substitution works for every function', 'The square-root expression is continuous at \(4\)', 'The answer is nonzero']
    correct: 1
    why: 'Continuity guarantees that the limit equals the function value at that input.'

  - text: 'Both one-sided limits at \(a\) are finite, but unequal. What type of discontinuity is this?'
    options: ['Removable', 'Jump', 'Infinite', 'Oscillatory']
    correct: 1
    why: 'A jump occurs when the finite left-hand and right-hand limits disagree. Changing the value at the point cannot repair it.'

---

## The idea

In Limits, we separated the value a function *approaches* from the value it *has*. Continuity asks them to agree. At a continuous point, nearby inputs give outputs near the actual value there.

<aside class="definition" markdown="1">
<p class="element-label">Definition</p>
<h3>Continuity at a point</h3>

At an interior point $$a$$ of its domain, a function $$f$$ is **continuous** if:

1. $$f(a)$$ is defined.
2. $$\lim_{x\to a}f(x)$$ exists as a finite number.
3. The two agree:

$$
\lim_{x\to a}f(x)=f(a).
$$

</aside>

A limit alone is not enough. <mark>The value at the point must meet the approaching values.</mark>

<div class="topic-widget continuity-widget" id="continuity-explorer">
<div class="limits-plot">
<svg viewBox="0 0 640 370" role="group" aria-labelledby="continuity-title continuity-desc">
<title id="continuity-title">Compare the two approached heights and the value at the point</title>
<desc id="continuity-desc">Drag the left branch, right branch, and function value independently. Continuity requires all three heights to agree.</desc>
<g fill="none" stroke="#c4cebf"><path d="M50 340H575M50 340V25"/><path d="M290 340V50" stroke-dasharray="4 5"/></g>
<g id="continuity-left-handle" class="graph-handle continuity-branch" role="slider" tabindex="0" aria-label="Left-hand approached height" aria-valuemin="0" aria-valuemax="5.5" aria-valuenow="3">
<path id="continuity-left-branch" d="M70 235C145 245 205 140 290 190" class="continuity-curve" fill="none" stroke-width="2.5"/>
<path id="continuity-left-hit" d="M70 235C145 245 205 140 290 190" fill="none" stroke="transparent" stroke-width="28" pointer-events="stroke"/>
<circle id="continuity-left-end" cx="290" cy="190" r="7" fill="#fcfcf9" stroke="currentColor" stroke-width="2"/>
</g>
<g id="continuity-right-handle" class="graph-handle continuity-branch" role="slider" tabindex="0" aria-label="Right-hand approached height" aria-valuemin="0" aria-valuemax="5.5" aria-valuenow="4">
<path id="continuity-right-branch" d="M290 140C365 200 450 75 550 110" class="continuity-curve" fill="none" stroke-width="2.5"/>
<path id="continuity-right-hit" d="M290 140C365 200 450 75 550 110" fill="none" stroke="transparent" stroke-width="28" pointer-events="stroke"/>
<circle id="continuity-right-end" cx="290" cy="140" r="7" fill="#fcfcf9" stroke="currentColor" stroke-width="2"/>
</g>
<g id="continuity-point-handle" class="graph-handle" role="slider" tabindex="0" style="outline:none" aria-label="Function value at input 2" aria-valuemin="0" aria-valuemax="5.5" aria-valuenow="1">
<circle id="continuity-join-glow" cx="290" cy="290" r="19" fill="#285b46" opacity="0"/>
<circle id="continuity-point-focus" class="graph-focus-ring" cx="290" cy="290" r="13" fill="none" stroke="currentColor" stroke-width="1.5"/>
<circle id="continuity-point-hit" cx="290" cy="290" r="22" fill="transparent"/>
<circle id="continuity-point-dot" cx="290" cy="290" r="7" fill="currentColor" stroke="#fcfcf9" stroke-width="2"/>
</g>
<text x="283" y="361" fill="#686e66" font-family="-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif" font-size="14">2</text>
<path class="axis-ticks" d="M290 337V343" fill="none" stroke="#9eac96" stroke-width="1"/>
</svg>
<span class="graph-axis graph-axis-x">\(x\)</span><span class="graph-axis graph-axis-y">\(y\)</span>
</div>
<div class="continuity-readouts widget-readouts"><span>Left: <output id="continuity-left-value">3.0</output></span><span>\(f(2)=\) <output id="continuity-point-value">1.0</output></span><span>Right: <output id="continuity-right-value">4.0</output></span></div>
<output id="continuity-state" class="sr-only" aria-live="polite">Not continuous</output>
<p class="widget-instruction">Drag either curve up or down, and move the point at \(x=2\). They turn green when all three heights agree.</p>
</div>

## Why direct substitution works

<mark>Continuity is the reason we can evaluate a limit by substitution.</mark> If $$f$$ is continuous at $$a$$, then

$$
\lim_{x\to a}f(x)=f(a).
$$

So, for a polynomial, we can substitute the approaching input. For a rational function, we can do this wherever its denominator is nonzero. <mark>Substitution is justified by continuity; it is not a rule that applies to every function.</mark>

<section class="theorem" markdown="1">
<p class="element-label">Rules</p>
<h3>Building continuous functions</h3>

Polynomials are continuous everywhere. Rational functions are continuous wherever their denominator is nonzero. The square-root function is continuous on its domain, with a right-hand limit at its endpoint. Sine and cosine are continuous everywhere.

Sums, differences, and products of continuous functions are continuous. Quotients are continuous where the denominator is nonzero. A composition $$f(g(x))$$ is continuous at $$a$$ when $$g$$ is continuous at $$a$$ and $$f$$ is continuous at $$g(a)$$, using inputs within the relevant domains.

These rules follow from the limit laws; continuity of sine and cosine follows from the trigonometric limits and angle-addition identities. For a piecewise definition, the rules apply within each piece; the joins still need checking.

</section>

## Checking continuity

When continuity is not already known, find the function value and the limit *separately*, then compare them. For a piecewise function, check the two sides at each joining point.

<section class="worked" markdown="1">
<p class="element-label">Example 1</p>
<h3 class="worked-title">A value that already fits</h3>

For $$p(x)=x^3-2x+1$$ at $$x=-1$$,

$$
p(-1)=2,\qquad \lim_{x\to-1}p(x)=2.
$$

Because polynomials are continuous, substitution gives the limit directly: $$\lim_{x\to-1}p(x)=p(-1)=2$$. We do not need a separate limit calculation.

</section>

<section class="worked" markdown="1">
<p class="element-label">Example 2</p>
<h3 class="worked-title">Filling a hole</h3>

Choose $$k$$ so that

$$
h(x)=\begin{cases}\dfrac{x^2+x-6}{x-2},&x\ne2,\\k,&x=2\end{cases}
$$

is continuous at $$2$$. For nearby inputs,

$$
\frac{x^2+x-6}{x-2}=x+3,\qquad x\ne2.
$$

Taking the limit,

$$\lim_{x\to2}h(x)=\lim_{x\to2}(x+3)=5.$$

Since $$h(2)=k$$, continuity requires *$$k=5$$*.

</section>

<aside class="warning" markdown="1">
<p class="element-label">Warning</p>

Cancelling a factor does not define the original quotient at the missing point. The quotient $$\frac{x^2+x-6}{x-2}$$ is still undefined at $$2$$; assigning the value $$5$$ creates a continuous extension.

</aside>

<section class="worked" markdown="1">
<p class="element-label">Example 3</p>
<h3 class="worked-title">A jump cannot be repaired at one point</h3>

For

$$
g(x)=\begin{cases}x^2,&x<1,\\x+2,&x\ge1,\end{cases}
$$

we have $$g(1)=3$$, but

$$
\lim_{x\to1^-}g(x)=1,\qquad \lim_{x\to1^+}g(x)=3.
$$

The limit does not exist, so $$g$$ is not continuous at $$1$$. Changing $$g(1)$$ cannot make the two approached heights agree.

</section>

## When continuity fails

Discontinuities have different causes. These names describe what happens near an interior point $$a$$.

<aside class="definition" markdown="1">
<p class="element-label">Definition</p>
<h3>Types of discontinuity</h3>

**Removable:** a finite limit $$L=\lim_{x\to a}f(x)$$ exists, but $$f(a)$$ is missing or differs from $$L$$. Defining or changing $$f(a)=L$$ repairs continuity.

**Jump:** both one-sided limits exist as finite numbers, but they are different:

$$
\lim_{x\to a^-}f(x)\ne\lim_{x\to a^+}f(x).
$$

**Infinite:** at least one side tends to $$+\infty$$ or $$-\infty$$. The outputs grow without bound in magnitude rather than approach a finite height.

**Oscillatory:** on at least one side, the outputs keep fluctuating without approaching a finite limit or tending to either infinity. For example, $$\sin(1/x)$$ oscillates near $$0$$.

</aside>

Only a removable discontinuity can be repaired by changing a single function value. Compare the scenarios below.

<div class="continuity-album graph-album topic-widget">

<div class="scenario-panel continuity-missing"><figure class="topic-figure"><img src="{{ '/assets/figures/learning/continuity-missing.svg' | relative_url }}" alt="A line has an open circle at input 2 and height 4, with no filled value at that input." width="640" height="360"><figcaption><strong>Removable discontinuity.</strong> The nearby values approach \(4\), but \(f(2)\) is undefined. Define \(f(2)=4\) to extend the function continuously.</figcaption></figure></div>
<div class="scenario-panel continuity-misplaced"><figure class="topic-figure"><img src="{{ '/assets/figures/learning/continuity-misplaced.svg' | relative_url }}" alt="A line has an open circle at 2,4 and an isolated filled value at 2,1." width="640" height="360"><figcaption><strong>Removable discontinuity.</strong> The limit is \(4\), but \(f(2)=1\). The value exists and the limit exists; their equality fails.</figcaption></figure></div>
<div class="scenario-panel continuity-jump"><figure class="topic-figure"><img src="{{ '/assets/figures/learning/limits-jump.svg' | relative_url }}" alt="The left branch approaches 1 and the right branch approaches 3." width="640" height="360"><figcaption><strong>Jump discontinuity.</strong> The two approached heights disagree. No assignment to the value at the joining point can restore continuity.</figcaption></figure></div>
<div class="scenario-panel continuity-unbounded"><figure class="topic-figure"><img src="{{ '/assets/figures/learning/limits-unbounded.svg' | relative_url }}" alt="One over x squared rises without bound near zero." width="640" height="360"><figcaption><strong>Infinite discontinuity.</strong> For \(f(x)=1/x^2\), there is no finite limit at \(0\). Assigning a finite value there cannot give a continuous extension.</figcaption></figure></div>
<div class="scenario-panel continuity-oscillation"><figure class="topic-figure"><img src="{{ '/assets/figures/learning/limits-oscillation.svg' | relative_url }}" alt="Sine of one over x keeps oscillating near zero from both sides." width="640" height="360"><figcaption><strong>Oscillatory discontinuity.</strong> For \(f(x)=\sin(1/x)\), nearby outputs never settle as \(x\to0\). A new value at \(0\) cannot fix that behavior.</figcaption></figure></div>
<fieldset class="scenario-choices"><legend>Choose a scenario</legend>
<label><input type="radio" name="continuity-scenario" value="missing" checked><span>Missing value</span></label>
<label><input type="radio" name="continuity-scenario" value="misplaced"><span>Wrong value</span></label>
<label><input type="radio" name="continuity-scenario" value="jump"><span>Jump</span></label>
<label><input type="radio" name="continuity-scenario" value="unbounded"><span>Unbounded</span></label>
<label><input type="radio" name="continuity-scenario" value="oscillation"><span>Oscillation</span></label>
</fieldset>
</div>

<aside class="note" markdown="1">
<p class="element-label">Note</p>

A function is continuous on an interval when it is continuous at each point there. At an included endpoint, use the limit from *within the interval*; for example, the right-hand limit at a left endpoint.

</aside>
