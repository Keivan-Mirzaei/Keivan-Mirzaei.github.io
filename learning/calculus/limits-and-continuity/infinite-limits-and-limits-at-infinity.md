---
layout: learning-topic
title: "Infinite limits, limits at infinity and asymptotes"
permalink: /learning/calculus/limits-and-continuity/infinite-limits-and-limits-at-infinity/
course_key: calculus
module_key: limits-and-continuity
position: "1.4"
description: Distinguish unbounded outputs from faraway inputs, and describe the lines a graph approaches.
math: true
topic_script: /assets/js/learning-infinite-limits.js
sitemap: false
exercises:
  - text: 'For \(r(x)=\frac{x^2-16}{x-4}\), what happens near \(x=4\)?'
    options: ['There is a vertical asymptote', 'The limit is \(8\), so the missing point is a hole', 'The limit is \(0\)', 'The two sides approach opposite infinities']
    correct: 1
    why: 'For \(x\ne4\), the quotient equals \(x+4\), whose limit is \(8\). A zero denominator alone does not establish a vertical asymptote.'
  - text: 'Find \(\displaystyle\lim_{x\to2}\frac{x+1}{(x-2)^2}\).'
    options: ['\(+\infty\)', '\(-\infty\)', 'The sides have opposite signs', '\(3\)']
    correct: 0
    why: 'The numerator approaches the positive number \(3\), and the squared denominator approaches zero through positive values on both sides. The quotient exceeds every positive bound sufficiently near \(2\).'
  - text: 'Producing \(n\) items costs \(450+12n\) dollars. As production grows without bound, what does the average cost per item approach?'
    options: ['\(450\) dollars', '\(462\) dollars', '\(0\) dollars', '\(12\) dollars']
    correct: 3
    why: 'The average is \((450+12n)/n=450/n+12\). As \(n\to+\infty\), the fixed cost per item tends to zero, leaving \(12\) dollars per item.'
  - text: 'Find \(\displaystyle\lim_{x\to-\infty}\frac{1-3x}{\sqrt{x^2+4}}\).'
    options: ['\(-3\)', '\(0\)', '\(3\)', '\(+\infty\)']
    correct: 2
    why: 'For negative \(x\), \(\sqrt{x^2+4}=-x\sqrt{1+4/x^2}\). Dividing numerator and denominator by \(-x\) gives \((3-1/x)/\sqrt{1+4/x^2}\to3\).'
  - text: 'The function \(g(x)=\frac{x-1}{x^2+1}\) has horizontal asymptote \(y=0\). Can its graph cross that line?'
    options: ['No; an asymptote can never be crossed', 'Yes, at \(x=1\)', 'Only if the limit fails to exist', 'Yes, at \(x=0\)']
    correct: 1
    why: 'At \(x=1\), the numerator is zero and the denominator is nonzero, so \(g(1)=0\). A horizontal asymptote describes the tails, not a barrier at finite inputs.'
  - text: 'For \(p(x)=x-2+1/x\), which statement describes its end behavior?'
    options: ['\(y=-2\) is a horizontal asymptote', 'There is no asymptote because \(p(x)\) is unbounded', '\(y=x\) is an asymptote', '\(y=x-2\) is a slant asymptote at both ends']
    correct: 3
    why: 'The vertical difference \(p(x)-(x-2)=1/x\) tends to zero as \(x\to\pm\infty\). The function itself need not approach a finite height to approach a slant line.'
  - text: 'What is \(\displaystyle\lim_{x\to+\infty}(\sqrt{x^2+6x}-x)\)?'
    options: ['\(0\)', '\(+\infty\)', '\(3\)', '\(6\)']
    correct: 2
    why: 'Rationalize: \(\sqrt{x^2+6x}-x=6x/(\sqrt{x^2+6x}+x)=6/(\sqrt{1+6/x}+1)\) for large positive \(x\). Its limit is \(6/2=3\); subtracting two unbounded terms does not determine the result.'
---

## Two different questions

An **infinite limit** describes outputs that grow without bound while the input approaches a point. A **limit at infinity** describes outputs as the input itself becomes arbitrarily large in magnitude. The output may approach a finite number, grow without bound, or fail to settle.

<aside class="definition" markdown="1">
<p class="element-label">Definition</p>
<h3>Unbounded outputs</h3>

We write $$\lim_{x\to a^+}f(x)=+\infty$$ when $$f(x)$$ exceeds *any* chosen positive bound for all inputs sufficiently close to $$a$$ from the right. For $$-\infty$$, the outputs fall below any chosen negative bound. Left-hand and two-sided versions have the same meaning on their respective approaches.

The line $$x=a$$ is a **vertical asymptote** if at least one one-sided limit there is $$+\infty$$ or $$-\infty$$.

</aside>

Infinity describes unbounded behavior; it is *not a real-number output*. Opposite infinite one-sided limits do not combine into a two-sided infinite limit.

## Approaching a vertical asymptote

For $$f(x)=1/x$$, a small negative input gives a large negative output; a small positive input gives a large positive output. Squaring the denominator changes that sign behavior.

<div class="topic-widget infinite-widget" id="pole-explorer">
<fieldset class="scenario-choices"><legend>Function</legend>
<label><input type="radio" name="pole-function" value="reciprocal" checked><span>\(f(x)=1/x\)</span></label>
<label><input type="radio" name="pole-function" value="square"><span>\(f(x)=1/x^2\)</span></label>
</fieldset>
<div class="infinite-plot">
<svg viewBox="0 0 640 360" role="img" aria-labelledby="pole-title pole-desc">
<title id="pole-title">Compare both sides of a vertical asymptote</title>
<desc id="pole-desc">The vertical scale expands to reveal the unbounded branches near zero. The reciprocal has opposite signs; the reciprocal square is positive on both sides.</desc>
<defs><clipPath id="pole-clip"><rect x="65" y="35" width="510" height="290"/></clipPath></defs>
<rect id="pole-original-view" x="65" y="55" width="510" height="250" fill="#e8edf4"/>
<path id="pole-reference-ticks" fill="none" stroke="#9eac96"/>
<path d="M65 180H585M320 325V25" fill="none" stroke="#c9d1c6"/>
<path d="M320 35V325" fill="none" stroke="#a67936" stroke-width="1.4" stroke-dasharray="4 5"/>
<g clip-path="url(#pole-clip)"><path id="pole-curve" fill="none" stroke="#285b46" stroke-width="2.5"/></g>
<path d="M200 177V183M440 177V183M317 55H323M317 305H323" fill="none" stroke="#9eac96"/>
<g fill="#686e66" font-family="-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif" font-size="14"><text x="200" y="204" text-anchor="middle">−1</text><text x="440" y="204" text-anchor="middle">1</text><text x="306" y="203" text-anchor="end">0</text><text id="pole-unit-positive" x="305" text-anchor="end">1</text><text id="pole-unit-negative" x="305" text-anchor="end">−1</text><text id="pole-top" x="305" y="60" text-anchor="end">3</text><text id="pole-bottom" x="305" y="310" text-anchor="end">−3</text></g>
<g fill="#282e29" font-family="Georgia,serif" font-style="italic" font-size="17"><text x="598" y="186">x</text><text x="332" y="25">y</text></g>
</svg>
<div class="graph-legend pole-legend" aria-label="Graph legend"><span><i class="legend-curve" aria-hidden="true"></i>\(f\)</span><span><i class="asymptote-key" aria-hidden="true"></i>\(x=0\)</span><span><i class="initial-view-key" aria-hidden="true"></i>Initial view</span></div>
</div>
<div class="widget-controls"><label for="pole-zoom">Zoom out vertically<input id="pole-zoom" type="range" min="0" max="100" value="0"></label></div>
<p class="widget-instruction">Zoom out vertically to follow the branches as their outputs grow without bound near \(x=0\). The pale band marks the initial view.</p>
</div>

<section class="worked" markdown="1">
<p class="element-label">Example 1</p>
<h3>Check the sign on each side</h3>

For $$r(x)=\frac{x+2}{x-1}$$, the numerator stays positive near $$1$$. The denominator is small and negative on the left, small and positive on the right. Hence

$$\begin{aligned}
\lim_{x\to1^-}\frac{x+2}{x-1}&=-\infty,\\
\lim_{x\to1^+}\frac{x+2}{x-1}&=+\infty.
\end{aligned}$$

Thus $$x=1$$ is a vertical asymptote. The two-sided limit is neither $$+\infty$$ nor $$-\infty$$, since the directions disagree.

</section>

## Looking far away

<aside class="definition" markdown="1">
<p class="element-label">Definition</p>
<h3>Limits at infinity</h3>

$$\lim_{x\to+\infty}f(x)=L$$ means that $$f(x)$$ stays as close to $$L$$ as we wish once $$x$$ is sufficiently large. For $$x\to-\infty$$, the input is negative with sufficiently large magnitude.

The line $$y=L$$ is a **horizontal asymptote** if either of these limits equals the finite number $$L$$. Check the two ends separately; they can approach different heights.

</aside>

The basic starting point is $$\lim_{x\to\pm\infty}1/x=0$$: increasing the magnitude of a denominator makes its reciprocal arbitrarily small. Products then give $$\lim_{x\to\pm\infty}1/x^n=0$$ for every positive integer $$n$$. The earlier limit laws and squeeze theorem also apply to these approaches, with their usual conditions.

For the next graph, let $$g(x)=\frac{2x^2+x}{x^2+1}$$. Dividing by $$x^2$$ shows that both tails approach $$2$$. The graph even crosses that height at $$x=2$$.

<div class="topic-widget infinite-widget" id="tails-explorer">
<div class="infinite-plot">
<svg viewBox="0 0 640 360" role="img" aria-labelledby="tails-title tails-desc">
<title id="tails-title">Zoom out to inspect a horizontal asymptote</title>
<desc id="tails-desc">A green rational-function curve approaches the dashed amber line y equals 2 on both tails. Zooming out reveals farther inputs on both tails.</desc>
<defs><clipPath id="tails-clip"><rect x="65" y="35" width="510" height="290"/></clipPath></defs>
<rect id="tails-original-view" x="80" y="35" width="480" height="290" fill="#e8edf4"/>
<path id="tails-reference-ticks" fill="none" stroke="#9eac96"/>
<path d="M65 285H585M320 325V25" fill="none" stroke="#c9d1c6"/>
<path d="M65 145H575" fill="none" stroke="#a67936" stroke-width="1.4" stroke-dasharray="4 5"/>
<g clip-path="url(#tails-clip)"><path id="tails-curve" fill="none" stroke="#285b46" stroke-width="2.5"/></g>
<path d="M80 282V288M560 282V288M317 145H323" fill="none" stroke="#9eac96"/>
<g fill="#686e66" font-family="-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif" font-size="14"><text id="tails-left" x="80" y="310" text-anchor="middle">−4</text><text id="tails-right" x="560" y="310" text-anchor="middle">4</text><text x="306" y="308" text-anchor="end">0</text><text x="305" y="150" text-anchor="end">2</text></g>
<g fill="#282e29" font-family="Georgia,serif" font-style="italic" font-size="17"><text x="598" y="291">x</text><text x="332" y="25">y</text></g>
</svg>
<div class="graph-legend tails-legend" aria-label="Graph legend"><span><i class="legend-curve" aria-hidden="true"></i>\(g\)</span><span><i class="asymptote-key" aria-hidden="true"></i>\(y=2\)</span><span><i class="initial-view-key" aria-hidden="true"></i>Initial view</span></div>
</div>
<div class="widget-controls"><label for="tails-zoom">Zoom out horizontally<input id="tails-zoom" type="range" min="0" max="100" value="0"></label></div>
<p class="widget-instruction">Move the slider right to zoom out along the input axis. The pale region marks the initial view; the vertical scale stays fixed.</p>
</div>

<mark>An asymptote describes limiting behavior, not a line that a graph is forbidden to touch.</mark>

<section class="worked" markdown="1">
<p class="element-label">Example 2</p>
<h3>Divide by the highest denominator power</h3>

$$\begin{aligned}
\lim_{x\to+\infty}\frac{6x^2-x}{3x^2+2}
&=\lim_{x\to+\infty}\frac{6-1/x}{3+2/x^2}\\
&=\frac{6-0}{3+0}=2.
\end{aligned}$$

The same calculation works as $$x\to-\infty$$, so $$y=2$$ is a horizontal asymptote at both ends. We evaluate the *rewritten* quotient; infinity is not substituted as a number.

</section>

<section class="theorem" markdown="1">
<p class="element-label">Rule</p>
<h3>Rational-function end behavior</h3>

For a quotient of nonzero polynomials, compare their degrees (highest powers). As $$x\to\pm\infty$$:

- Lower numerator degree: the quotient tends to $$0$$.
- Equal degrees: it tends to the ratio of leading coefficients.
- Higher numerator degree: its magnitude grows without bound; there is no horizontal asymptote. Determine the sign at each end.

These conclusions follow by dividing numerator and denominator by the highest denominator power, as in Example 2.

</section>

<aside class="prerequisite" markdown="1">
<p class="element-label">Prerequisite</p>
<h3>The square root is nonnegative</h3>

$$\sqrt{x^2}=\lvert x\rvert
=\begin{cases}x,&x\ge0,\\-x,&x<0.\end{cases}$$

</aside>

<section class="worked" markdown="1">
<p class="element-label">Example 3</p>
<h3>The two ends need not agree</h3>

For $$x\ne0$$,

$$\frac{\sqrt{9x^2+1}}{x}=\frac{\lvert x\rvert}{x}\sqrt{9+\frac1{x^2}}.$$

The root tends to $$3$$. But $$\lvert x\rvert/x$$ is $$1$$ for positive inputs and $$-1$$ for negative inputs, so

$$\begin{aligned}
\lim_{x\to+\infty}\frac{\sqrt{9x^2+1}}x&=3,\\
\lim_{x\to-\infty}\frac{\sqrt{9x^2+1}}x&=-3.
\end{aligned}$$

There are two horizontal asymptotes: $$y=3$$ at the right end and $$y=-3$$ at the left end.

</section>

## Approaching a slanted line

<aside class="definition" markdown="1">
<p class="element-label">Definition</p>
<h3>Slant asymptote</h3>

A line $$y=mx+b$$ with $$m\ne0$$ is a **slant asymptote** (or **oblique asymptote**) at an end when

$$\lim_{x\to\pm\infty}\bigl(f(x)-(mx+b)\bigr)=0$$

for that end. The function need not approach a finite height; its *vertical difference from the line* must approach zero.

</aside>

<section class="worked" markdown="1">
<p class="element-label">Example 4</p>
<h3>Divide to expose the line</h3>

Polynomial division gives, for $$x\ne2$$,

$$s(x)=\frac{x^2+1}{x-2}=x+2+\frac5{x-2}.$$

Thus

$$\lim_{x\to\pm\infty}\bigl(s(x)-(x+2)\bigr)
=\lim_{x\to\pm\infty}\frac5{x-2}=0.$$

So $$y=x+2$$ is a slant asymptote at both ends. Here $$s(x)$$ itself tends to $$+\infty$$ on the right and $$-\infty$$ on the left. A numerator degree exactly one higher than the denominator produces a slant line after division.

<figure class="topic-figure slant-figure">
<div class="slant-plot">
<img src="{{ '/assets/figures/learning/slant-asymptote.svg' | relative_url }}" alt="Two green branches approach the amber slant line y equals x plus 2 at opposite ends. A vertical asymptote is at x equals 2." width="640" height="380">
<div class="graph-legend" aria-label="Graph legend"><span><i class="legend-curve" aria-hidden="true"></i>\(s\)</span><span><i class="asymptote-key" aria-hidden="true"></i>\(y=x+2\)</span></div>
</div>
<figcaption>The difference \(s(x)-(x+2)=5/(x-2)\) tends to \(0\), even though the function and line are unbounded.</figcaption>
</figure>

</section>

<aside class="warning" markdown="1">
<p class="element-label">Warning</p>

A zero denominator does not by itself prove a vertical asymptote: a common factor may cancel and leave a finite limit. And forms such as $$\infty/\infty$$ or $$\infty-\infty$$ do not determine an answer. Rewrite the expression before evaluating its limit.

</aside>
