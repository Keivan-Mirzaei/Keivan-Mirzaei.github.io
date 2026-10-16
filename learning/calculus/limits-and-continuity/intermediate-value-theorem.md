---
layout: learning-topic
title: "Intermediate value theorem"
permalink: /learning/calculus/limits-and-continuity/intermediate-value-theorem/
course_key: calculus
module_key: limits-and-continuity
position: "1.6"
description: A continuous function cannot skip a height between its endpoint values.
math: true
topic_script: /assets/js/learning-ivt.js
sitemap: false
exercises:
  - text: 'What must be true to apply the Intermediate Value Theorem on \([a,b]\)?'
    options: ['\(f\) is continuous on all of \([a,b]\)', 'Only \(f(a)\) and \(f(b)\) must exist', '\(f\) must be increasing']
    correct: 0
    why: 'Continuity is required across the whole closed interval, including one-sided continuity at its endpoints. Increasing behavior is not required.'
  - text: 'A continuous function on \([1,4]\) has \(f(1)=-2\) and \(f(4)=5\). What is guaranteed?'
    options: ['Exactly one zero in \((1,4)\)', 'At least one zero in \((1,4)\)', 'A zero at \(x=0\)']
    correct: 1
    why: 'The endpoint values straddle zero, so the theorem guarantees at least one input between them where the output is zero. It does not give uniqueness.'
  - text: 'Which interval proves that \(p(x)=x^3+x-1\) has a zero by the Intermediate Value Theorem?'
    options: ['\([0,1]\)', '\([1,2]\)', '\([2,3]\)']
    correct: 0
    why: 'The polynomial is continuous, and \(p(0)=-1\), while \(p(1)=1\). These values have opposite signs.'
  - text: 'Two functions \(f\) and \(g\) are continuous on \([0,2]\), with \(f(0)<g(0)\) and \(f(2)>g(2)\). What is guaranteed?'
    options: ['Their graphs intersect somewhere in \((0,2)\)', 'Their graphs intersect at \(x=1\)', 'Their graphs intersect exactly once']
    correct: 0
    why: 'Apply the theorem to the continuous difference \(h(x)=f(x)-g(x)\). Since \(h(0)<0<h(2)\), some \(c\in(0,2)\) has \(h(c)=0\), meaning \(f(c)=g(c)\).'
  - text: 'For \(f(x)=x^2-1\), both \(f(-2)\) and \(f(2)\) equal \(3\). Do these endpoint values guarantee a zero by the Intermediate Value Theorem?'
    options: ['Yes: positive endpoint values guarantee a zero', 'No: they do not bracket zero, although zeros may exist', 'No: positive endpoint values rule out zeros']
    correct: 1
    why: 'A sign change is sufficient, not necessary. In fact, this function has zeros at \(-1\) and \(1\), despite equal positive endpoint values.'
  - text: 'A temperature changes continuously from \(20\) to \(80\) degrees. What must happen in between?'
    options: ['It reaches \(50\) degrees at least once', 'It reaches \(50\) degrees exactly once', 'It changes at a constant rate']
    correct: 0
    why: 'Every intermediate temperature is attained. Continuity does not require a constant rate or forbid revisiting a temperature.'
---

## The idea

A continuous curve can rise, fall, or turn back, but it cannot skip a height between its endpoint values. <mark>Every intermediate output must occur somewhere in between.</mark>

<section class="theorem" markdown="1">
<p class="element-label">Theorem</p>
<h3>Intermediate Value Theorem</h3>

If $$f$$ is continuous on $$[a,b]$$ and $$k$$ lies strictly between $$f(a)$$ and $$f(b)$$, then there is at least one $$c\in(a,b)$$ such that

$$f(c)=k.$$

</section>

The target $$k$$ is a *height*; the theorem guarantees an *input* $$c$$ that reaches it. It does not tell us the exact input or promise that there is only one.

<div class="topic-widget ivt-widget" id="ivt-explorer">
<div class="limits-plot">
<svg viewBox="0 0 640 360" role="group" aria-labelledby="ivt-title ivt-desc">
<title id="ivt-title">Every intermediate height meets a continuous curve</title>
<desc id="ivt-desc">Drag the horizontal target line vertically. Green intersections show where the continuous curve reaches that height between its endpoints.</desc>
<g fill="none" stroke="#c4cebf"><path d="M65 320H575M65 320V30"/><path d="M85 64V320M550 64V320M85 64H550M85 296H550" stroke-dasharray="3 5" opacity=".6"/></g>
<g id="ivt-projections" fill="none" stroke="#285b46" stroke-dasharray="3 5" stroke-opacity=".45" pointer-events="none"></g>
<path id="ivt-curve" fill="none" stroke="#285b46" stroke-width="2.5"/>
<g fill="#285b46"><circle cx="85" cy="296.016" r="4"/><circle cx="550" cy="63.984" r="4"/></g>
<g id="ivt-target" class="graph-handle" role="slider" tabindex="0" aria-label="Target height" aria-valuemin="-4.5" aria-valuemax="4.5" aria-valuenow="0" aria-orientation="vertical">
<path id="ivt-target-line" d="M75 180H560" fill="none" stroke="#a67936" stroke-width="2"/>
<path id="ivt-target-hit" d="M75 180H560" fill="none" stroke="transparent" stroke-width="28" pointer-events="stroke"/>
</g>
<g id="ivt-intersections" fill="#285b46" stroke="#fcfcf9" stroke-width="2" pointer-events="none"></g>
</svg>
<span class="graph-axis graph-axis-x">\(x\)</span><span class="graph-axis graph-axis-y">\(f(x)\)</span>
<span class="ivt-label ivt-label-a">\(a\)</span><span class="ivt-label ivt-label-b">\(b\)</span>
<span id="ivt-c-0" class="ivt-label ivt-c" hidden><span class="ivt-c-single">\(c\)</span><span class="ivt-c-multiple">\(c_1\)</span></span>
<span id="ivt-c-1" class="ivt-label ivt-c" hidden><span class="ivt-c-single">\(c\)</span><span class="ivt-c-multiple">\(c_2\)</span></span>
<span id="ivt-c-2" class="ivt-label ivt-c" hidden><span class="ivt-c-single">\(c\)</span><span class="ivt-c-multiple">\(c_3\)</span></span>
<span id="ivt-k" class="ivt-label ivt-label-k" style="top:50%">\(k\)</span>
<span class="ivt-label ivt-label-low">\(f(a)\)</span><span class="ivt-label ivt-label-high">\(f(b)\)</span>
</div>
<div class="ivt-readouts"><span>\(k=\) <output id="ivt-height">0.0</output></span><output id="ivt-count" aria-live="polite">3 intersections</output></div>
<p class="widget-instruction">Drag the amber line up or down. Every height between \(f(a)\) and \(f(b)\) meets the curve; each marked input \(c\) satisfies \(f(c)=k\).</p>
</div>

## Proving a solution exists

To show that $$f(x)=k$$ has a solution, choose an interval, check continuity throughout it, and show that the endpoint outputs lie on opposite sides of $$k$$. You can prove existence even when solving the equation exactly is difficult.

<section class="worked" markdown="1">
<p class="element-label">Example 1</p>
<h3>A root without solving the equation</h3>

Show that $$x^3+x-1=0$$ has a solution between $$0$$ and $$1$$.

Set $$p(x)=x^3+x-1$$. This polynomial is continuous on $$[0,1]$$, and

$$p(0)=-1<0<1=p(1).$$

By the Intermediate Value Theorem, some $$c\in(0,1)$$ satisfies $$p(c)=0$$. This proves a root exists; it does not calculate it.

<figure class="topic-figure"><img src="{{ '/assets/figures/learning/ivt-root.svg' | relative_url }}" alt="The continuous cubic crosses zero between zero and one." width="640" height="360"></figure>

</section>

<section class="worked" markdown="1">
<p class="element-label">Example 2</p>
<h3>An intermediate temperature</h3>

A sensor records a temperature $$T(t)$$ that varies continuously, with $$T(0)=20$$ and $$T(10)=80$$, measured in degrees Celsius and minutes.

Since $$20<50<80$$, the theorem guarantees a time $$c\in(0,10)$$ when

$$T(c)=50.$$

We cannot conclude $$c=5$$: continuous change need not be linear. The temperature may also reach that value more than once.

</section>

<section class="worked" markdown="1">
<p class="element-label">Example 3</p>
<h3>A sign change across a break</h3>

For $$f(x)=1/x$$, the endpoint values satisfy

$$f(-1)=-1<0<1=f(1).$$

But $$f$$ is undefined at $$0$$, so it is not continuous on $$[-1,1]$$. The theorem does not apply. Indeed, $$1/x=0$$ has no solution.

<figure class="topic-figure"><img src="{{ '/assets/figures/learning/ivt-reciprocal.svg' | relative_url }}" alt="The reciprocal has opposite signs on either side of zero, but neither branch meets the x-axis." width="640" height="360"></figure>

</section>

<aside class="warning" markdown="1">
<p class="element-label">Warning</p>

A sign change guarantees a root only when continuity holds across the interval. The theorem guarantees *at least one* solution, not exactly one. If its hypotheses are not met, it makes no conclusion; a solution may still exist.

</aside>
