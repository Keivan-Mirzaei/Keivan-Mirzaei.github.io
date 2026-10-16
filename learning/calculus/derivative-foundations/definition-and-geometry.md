---
layout: learning-topic
title: "Definition and geometry of the derivative"
permalink: /learning/calculus/derivative-foundations/definition-and-geometry/
course_key: calculus
module_key: derivative-foundations
position: "2.1"
description: From the slope between two points to the rate of change at one instant.
math: true
topic_script: /assets/js/learning-derivative.js
sitemap: false
exercises:
  - text: 'A rangefinder records a cart whose position increases by \(0.39\,\mathrm{m}\) from \(t=1.9\) to \(2.0\,\mathrm{s}\), then by \(0.41\,\mathrm{m}\) from \(2.0\) to \(2.1\,\mathrm{s}\). Which is a reasonable estimate of its velocity at \(2.0\,\mathrm{s}\), assuming smooth motion?'
    options: ['About \(4\,\mathrm{m/s}\)', 'About \(0.4\,\mathrm{m/s}\)', 'Exactly \(4\,\mathrm{m/s}\), guaranteed by these readings']
    correct: 0
    why: 'The neighboring secant slopes are \(0.39/0.1=3.9\) and \(0.41/0.1=4.1\,\mathrm{m/s}\), suggesting about \(4\,\mathrm{m/s}\). Finite measurements estimate an instantaneous rate; they do not determine the exact derivative.'
  - text: 'A tank contains \(V(t)\) litres of water after \(t\) minutes, with \(V^{\prime}(10)=3\,\mathrm{L/min}\). If this rate changes little, approximately how much water is added over the next \(0.2\) minutes?'
    options: ['\(0.6\,\mathrm{L}\)', '\(3\,\mathrm{L}\)', '\(15\,\mathrm{L}\)', 'The tank contains \(0.6\,\mathrm{L}\) in total']
    correct: 0
    why: 'The estimated change is \(V^{\prime}(10)\Delta t=(3)(0.2)=0.6\,\mathrm{L}\). This is water added, not the total amount already in the tank.'
  - text: 'A drone has \(s^{\prime}(4)=0\). What follows from this information alone?'
    options: ['Its instantaneous velocity is zero at \(t=4\)', 'It stays at rest after \(t=4\)', 'Its position is zero at \(t=4\)', 'It must reverse direction at \(t=4\)']
    correct: 0
    why: 'A zero derivative describes the rate at that instant. It does not determine position, future motion, or whether the drone reverses direction.'
  - text: 'A continuous graph has a sharp corner at \(x=a\). Its left-hand slope is \(2\), and its right-hand slope is \(5\). Does \(f^{\prime}(a)\) exist?'
    options: ['Yes, it is \(3.5\)', 'Yes, because the graph is continuous', 'No, the two limiting slopes disagree']
    correct: 2
    why: 'The derivative requires a single finite limit of the difference quotient from both sides. Averaging the slopes does not define a derivative at the corner.'
  - text: 'For a population \(N(t)\), what does \([N(6+h)-N(6)]/h\) measure when \(h\ne0\)?'
    options: ['The population at \(t=6\)', 'The average rate of population change between \(6\) and \(6+h\)', 'The instantaneous growth rate for every \(h\)']
    correct: 1
    why: 'This is a finite change in population divided by a finite change in time: an average rate. Taking its limit as \(h\to0\), if it exists, gives the instantaneous rate at \(6\).'
  - text: 'A graph passes through \((3,7)\) and has \(f^{\prime}(3)=-4\). Which line is tangent there?'
    options: ['\(y=-4x\)', '\(y=7-4(x-3)\)', '\(y=7+4(x-3)\)']
    correct: 1
    why: 'The tangent must have slope \(-4\) and pass through \((3,7)\). Its equation is \(y-f(3)=f^{\prime}(3)(x-3)\).'

---

## The idea

A **secant line** joins two points on a graph. Its slope is an **average rate of change**: change in output divided by change in input. Move the second point toward the first. If the secant slopes approach one finite value, that value is the **derivative**—the slope of the **tangent line** and the **instantaneous rate of change**.

<aside class="definition" markdown="1">
<p class="element-label">Definition</p>
<h3>Derivative at a point</h3>

At an interior point $$a$$ of the domain, the derivative of $$f$$ is

$$f^{\prime}(a)=\lim_{h\to0}\frac{f(a+h)-f(a)}{h},$$

provided this limit exists as a finite number. Then $$f$$ is **differentiable** at $$a$$. The increment $$h$$ can be positive or negative, but is nonzero in the quotient.

</aside>

<mark>The derivative is a limit of slopes, not a quotient obtained by setting the increment to zero.</mark>

<div class="topic-widget derivative-widget" id="derivative-explorer">
<div class="limits-plot">
<svg viewBox="0 0 640 370" role="group" aria-labelledby="derivative-title derivative-desc">
<title id="derivative-title">A secant approaches the tangent to a parabola</title>
<desc id="derivative-desc">Drag the second point along the parabola toward the fixed point at input one. Approach from either side. The secant slope approaches two.</desc>
<defs><clipPath id="derivative-clip"><rect x="65" y="25" width="510" height="300"/></clipPath></defs>
<path d="M65 320H580M80 320V25" fill="none" stroke="#c9d1c6"/>
<g clip-path="url(#derivative-clip)">
<path id="derivative-curve" fill="none" stroke="#285b46" stroke-width="2.6"/>
<path id="derivative-tangent" d="M80 360L530 160" fill="none" stroke="#a67936" stroke-width="2" stroke-dasharray="5 5"/>
<path id="derivative-secant" fill="none" stroke="#285b46" stroke-width="2"/>
<path id="derivative-triangle" fill="none" stroke="#aab6a3" stroke-dasharray="3 5"/>
</g>
<circle cx="260" cy="280" r="6" fill="#285b46" stroke="#fcfcf9" stroke-width="2"/>
<g id="derivative-handle" class="graph-handle" role="slider" tabindex="0" aria-label="Second point input" aria-valuemin="0" aria-valuemax="2.5" aria-valuenow="2.2">
<circle id="derivative-focus" class="graph-focus-ring" cx="476" cy="126.4" r="13" fill="none" stroke="#285b46" stroke-width="1.5"/>
<circle id="derivative-hit" cx="476" cy="126.4" r="24" fill="transparent"/>
<circle id="derivative-dot" cx="476" cy="126.4" r="7" fill="#285b46" stroke="#fcfcf9" stroke-width="2"/>
</g>
<text x="260" y="344" text-anchor="middle" font-family="-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif" font-size="14" fill="#686e66">1</text>
<path class="axis-ticks" d="M260 317V323" fill="none" stroke="#9eac96" stroke-width="1"/>
</svg>
<span id="derivative-run-label" class="derivative-change derivative-run">\(h\)</span>
<span id="derivative-rise-label" class="derivative-change derivative-rise">\(f(1+h)-f(1)\)</span>
<span class="graph-axis graph-axis-x">\(x\)</span><span class="graph-axis graph-axis-y">\(y\)</span>
</div>
<div class="derivative-readouts"><span>\(h=\) <output id="derivative-h">1.20</output></span><span>\(\frac{f(1+h)-f(1)}{h}=\) <output id="derivative-slope">3.20</output></span><span>\(f^{\prime}(1)=2\)</span></div>
<p class="widget-instruction">For \(f(x)=x^2\), drag the moving point toward the fixed point from either side. The green secant approaches the dashed amber tangent. At \(h=0\), only the tangent is shown; the secant quotient is undefined.</p>
</div>

## Slope, rate, and units

The derivative has units of *output per unit input*. If $$s(t)$$ is position in metres and time is in seconds, $$s^{\prime}(t)$$ is **instantaneous velocity** in metres per second. If $$T(t)$$ is temperature, $$T^{\prime}(t)$$ tells us how quickly it is heating or cooling.

When the derivative exists, the tangent line at $$a$$ is

$$y=f(a)+f^{\prime}(a)(x-a).$$

Near the point of tangency, this line also gives a **local linear approximation**:

$$f(a+h)\approx f(a)+f^{\prime}(a)h.$$

This is an approximation for small increments; the tangent need not match the curve far away. A tangent may cross a curve—it is defined by its limiting slope, not by touching the curve only once.

## Worked examples

<section class="worked" markdown="1">
<p class="element-label">Example 1</p>
<h3>From first principles</h3>

Find the derivative of $$f(x)=x^2$$ at $$a$$ using the definition. For $$h\ne0$$,

$$\frac{(a+h)^2-a^2}{h}=\frac{2ah+h^2}{h}=2a+h.$$

Now take the limit:

$$f^{\prime}(a)=\lim_{h\to0}\frac{(a+h)^2-a^2}{h}=\lim_{h\to0}(2a+h)=2a.$$

At $$a=1$$, the tangent has slope $$2$$ and equation

$$y=1+2(x-1)=2x-1.$$

This is the tangent in the widget.

</section>

<section class="worked" markdown="1">
<p class="element-label">Example 2</p>
<h3>Velocity at an instant</h3>

A cart has position $$s(t)=5t^2$$ metres, with time measured in seconds. Its average velocity from $$2$$ to $$2+h$$ is

$$\frac{s(2+h)-s(2)}{h}=\frac{5(2+h)^2-20}{h}=20+5h.$$

Take the limit to obtain the instantaneous velocity:

$$s^{\prime}(2)=\lim_{h\to0}\frac{s(2+h)-s(2)}{h}=\lim_{h\to0}(20+5h)=20\,\mathrm{m/s}.$$

Its position is $$s(2)=20\,\mathrm{m}$$; the equal numerical values represent different physical quantities.

</section>

<section class="worked" markdown="1">
<p class="element-label">Example 3</p>
<h3>A local prediction</h3>

A cooling sample has $$T(5)=60\,{}^\circ\mathrm{C}$$ and $$T^{\prime}(5)=-2.4\,{}^\circ\mathrm{C/min}$$. Estimate its temperature after another $$0.1$$ minutes:

$$T(5.1)\approx T(5)+T^{\prime}(5)(0.1)=60-0.24=59.76\,{}^\circ\mathrm{C}.$$

The negative derivative means cooling. It does not mean a negative temperature, and the estimate assumes that the tangent remains a useful approximation over this short interval.

</section>

## When a derivative fails to exist

For $$f(x)=\lvert x\rvert$$ at $$0$$, the difference quotient is

$$\frac{\lvert h\rvert-0}{h}=\begin{cases}-1,&h<0,\\1,&h>0.\end{cases}$$

The one-sided limits are

$$\lim_{h\to0^-}\frac{\lvert h\rvert}{h}=-1,\qquad \lim_{h\to0^+}\frac{\lvert h\rvert}{h}=1.$$

The left and right slopes disagree, so the graph has a **corner** and no derivative there, even though it is continuous.

<figure class="topic-figure"><img src="{{ '/assets/figures/learning/derivative-corner.svg' | relative_url }}" alt="The absolute value graph has two straight branches meeting at a corner at the origin." width="640" height="360"><figcaption>The left-hand slope is \(-1\); the right-hand slope is \(1\). There is no single tangent slope at the corner.</figcaption></figure>

<section class="theorem" markdown="1">
<p class="element-label">Theorem</p>
<h3>Differentiability implies continuity</h3>

If $$f$$ is differentiable at $$a$$, it is continuous there. The converse is false, as the corner shows.

<details class="disclosure" markdown="1">
<summary>Proof (optional)</summary>

For $$h\ne0$$,

$$f(a+h)-f(a)=\frac{f(a+h)-f(a)}{h}\,h.$$

Taking limits gives

$$\lim_{h\to0}\bigl(f(a+h)-f(a)\bigr)=\left(\lim_{h\to0}\frac{f(a+h)-f(a)}{h}\right)\left(\lim_{h\to0}h\right)=f^{\prime}(a)\cdot0=0.$$

Thus $$\lim_{h\to0}f(a+h)=f(a)$$, which is continuity at $$a$$.

</details>
</section>

<aside class="warning" markdown="1">
<p class="element-label">Warning</p>

Continuity alone does not guarantee differentiability. A jump, a corner, or an infinite limiting slope prevents a finite derivative. At an interior point, both sides must approach the same finite slope.

</aside>
