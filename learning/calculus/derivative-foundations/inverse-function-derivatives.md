---
layout: learning-topic
title: Derivatives of inverse functions
permalink: /learning/calculus/derivative-foundations/inverse-function-derivatives/
course_key: calculus
module_key: derivative-foundations
position: '2.4'
description: An inverse swaps inputs and outputs, so its tangent slope is reciprocal at the corresponding point.
math: true
topic_script: /assets/js/learning-inverse.js
sitemap: false
exercises:
  - text: 'At a pair of corresponding points, the original graph has tangent slope \(-5\). How does the inverse tangent compare?'
    options: ['It is descending but less steep', 'It is ascending and less steep', 'It is descending and steeper', 'It is horizontal']
    correct: 0
    why: 'The inverse slope is \(-1/5\). The negative sign is preserved, while its magnitude is smaller. Reflection across \(y=x\) does not turn a decreasing branch into an increasing one.'
  - text: 'A thermometer calibration converts voltage \(V\) into temperature \(T(V)\). Near a reading, \(dT/dV=5\,{}^\circ\mathrm{C/V}\), and the inverse rule applies. What is \(dV/dT\) there?'
    options: ['\(5\,\mathrm{V}/{}^\circ\mathrm{C}\)', '\(0.2\,\mathrm{V}/{}^\circ\mathrm{C}\)', '\(-0.2\,\mathrm{V}/{}^\circ\mathrm{C}\)']
    correct: 1
    why: 'The inverse conversion has rate \(1/5=0.2\) volts per degree Celsius. The units reverse along with the slope.'
  - text: 'For \(f(x)=x^3\), does \((f^{-1})^{\prime}(0)\) exist as a finite number?'
    options: ['Yes: the inverse is continuous', 'Yes: its derivative is zero', 'No: its difference quotient grows without bound']
    correct: 2
    why: 'The inverse is \(g(y)=\sqrt[3]{y}\). At zero, \([g(h)-g(0)]/h=1/h^{2/3}\to+\infty\). The inverse is continuous but has a vertical tangent, not a finite derivative.'
  - text: 'What is the sign of the derivative of \(y=\arccos(2x)\) for \(-1/2<x<1/2\)?'
    options: ['Positive', 'Negative', 'It changes sign at zero']
    correct: 1
    why: 'The chain rule gives \(y^{\prime}=-2/\sqrt{1-4x^2}\). The denominator is positive throughout that interval, so the function is decreasing.'
  - text: 'A student claims \(\arcsin(\sin\theta)=\theta\) for every real \(\theta\). What does the left side equal when \(\theta=5\pi/6\)?'
    options: ['\(5\pi/6\)', '\(\pi/6\)', '\(-\pi/6\)', 'It is undefined']
    correct: 1
    why: 'Here \(\sin(5\pi/6)=1/2\), but arcsine returns the angle in \([-\pi/2,\pi/2]\). That angle is \(\pi/6\). The branch restriction matters.'
  - text: 'You need the slope of \(g(x)=\arctan x\) at \(x=2\). Which information from the original tangent function is relevant?'
    options: ['Its slope at angle \(2\)', 'Its slope at angle \(\arctan 2\)', 'Its height at angle \(0\)']
    correct: 1
    why: 'The corresponding original input is \(\arctan 2\), whose tangent is \(2\). Its slope is \(\sec^2(\arctan 2)=1+2^2=5\), so the inverse slope is \(1/5\).'
---

## The idea

An **inverse function** reverses a function: if $$f(a)=b$$, then $$f^{-1}(b)=a$$. It can do this only when each output identifies one input—a **one-to-one** function, possibly after restricting its domain.

Swapping the coordinates reflects a graph across $$y=x$$. A nonzero tangent slope becomes its reciprocal, because the horizontal and vertical changes exchange roles. <mark>Use the slope at the corresponding original input, not at the same numerical input.</mark>

<section class="theorem" markdown="1">
<p class="element-label">Theorem</p>
<h3>Derivative of an inverse</h3>

Suppose $$f$$ is continuous and strictly monotone on an interval, differentiable at an interior point $$a$$, and $$f^{\prime}(a)\ne0$$. Writing $$b=f(a)$$, its inverse is differentiable at $$b$$, and

$$\bigl(f^{-1}\bigr)^{\prime}(b)=\frac{1}{f^{\prime}(a)}=\frac{1}{f^{\prime}(f^{-1}(b))}.$$

</section>

**Strictly monotone** means always increasing or always decreasing on the interval; this ensures that the function is one-to-one. The nonzero derivative condition lets us take the reciprocal.

<div class="topic-widget inverse-widget" id="inverse-explorer">
<div class="limits-plot">
<svg viewBox="0 0 640 450" role="group" aria-labelledby="inverse-title inverse-desc">
<title id="inverse-title">Reflect a tangent across the line y equals x</title>
<desc id="inverse-desc">Drag either point horizontally. A point on the positive square function and its reflected point on the square root move together. Their tangent slopes are reciprocal.</desc>
<defs><clipPath id="inverse-clip"><rect x="125" y="25" width="370" height="370"/></clipPath></defs>
<path d="M125 390H515M130 395V20" fill="none" stroke="#c9d1c6"/>
<path d="M130 390L490 30" fill="none" stroke="#c4cebf" stroke-dasharray="4 5"/>
<path id="inverse-pair-guide" fill="none" stroke="#c4cebf" stroke-dasharray="3 5"/>
<path id="inverse-original-curve" fill="none" stroke="#285b46" stroke-width="2.6"/>
<path id="inverse-inverse-curve" fill="none" stroke="#a67936" stroke-width="2.6"/>
<g clip-path="url(#inverse-clip)"><path id="inverse-original-tangent" fill="none" stroke="#285b46" stroke-width="2"/><path id="inverse-inverse-tangent" fill="none" stroke="#a67936" stroke-width="2"/></g>
<g id="inverse-original-handle" class="graph-handle" role="slider" tabindex="0" aria-label="Original curve input" aria-orientation="horizontal" aria-valuemin="0.5" aria-valuemax="2" aria-valuenow="1.3">
<circle id="inverse-original-focus" class="graph-focus-ring" r="13" fill="none" stroke="#285b46" stroke-width="1.5"/><circle id="inverse-original-hit" r="22" fill="transparent"/><circle id="inverse-original-dot" r="7" fill="#285b46" stroke="#fcfcf9" stroke-width="2"/>
</g>
<g id="inverse-inverse-handle" class="graph-handle" role="slider" tabindex="0" aria-label="Inverse curve input" aria-orientation="horizontal" aria-valuemin="0.25" aria-valuemax="4" aria-valuenow="1.69">
<circle id="inverse-inverse-focus" class="graph-focus-ring" r="13" fill="none" stroke="#a67936" stroke-width="1.5"/><circle id="inverse-inverse-hit" r="22" fill="transparent"/><circle id="inverse-inverse-dot" r="7" fill="#a67936" stroke="#fcfcf9" stroke-width="2"/>
</g>
<g fill="#686e66" font-family="-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif" font-size="14"><text x="220" y="416" text-anchor="middle">1</text><text x="310" y="416" text-anchor="middle">2</text><text x="400" y="416" text-anchor="middle">3</text><text x="490" y="416" text-anchor="middle">4</text><text x="112" y="305" text-anchor="end">1</text><text x="112" y="215" text-anchor="end">2</text><text x="112" y="125" text-anchor="end">3</text><text x="112" y="35" text-anchor="end">4</text></g>
</svg>
<span class="inverse-axis inverse-axis-x">\(x\)</span><span class="inverse-axis inverse-axis-y">\(y\)</span><span class="inverse-axis inverse-mirror">\(y=x\)</span>
</div>
<div class="inverse-legend"><span>\(f(x)=x^2,\quad x\ge0\)</span><span>\(f^{-1}(x)=\sqrt{x}\)</span></div>
<div class="inverse-readouts"><span>\(a=\) <output id="inverse-a">1.30</output></span><span>\(f^{\prime}(a)=\) <output id="inverse-slope">2.60</output></span><span>\((f^{-1})^{\prime}(a^2)=\) <output id="inverse-reciprocal">0.38</output></span></div>
<p class="widget-instruction">Drag either point. The dotted connector joins \((a,a^2)\) to \((a^2,a)\); the tangents reflect across the dashed line and their slopes multiply to \(1\).</p>
</div>

<section class="worked" markdown="1">
<p class="element-label">Example 1</p>
<h3>A derivative without solving for the inverse</h3>

Let $$f(x)=x^3+x$$. Both the cubic and linear terms strictly increase as the input increases, so their sum is one-to-one and has an inverse. Its derivative is $$f^{\prime}(x)=3x^2+1$$. At $$a=1$$,

$$f(1)=2,\qquad f^{\prime}(1)=4.$$

The inverse point is $$b=2$$, so

$$\bigl(f^{-1}\bigr)^{\prime}(2)=\frac{1}{f^{\prime}(1)}=\frac14.$$

We did not need a formula for $$f^{-1}$$.

</section>

## Inverse trigonometric functions

Sine and cosine repeat, so they are not one-to-one on the whole real line. Their **principal branches** are the chosen intervals on which we reverse them:

- $$\arcsin x$$ returns an angle in $$[-\pi/2,\pi/2]$$.
- $$\arccos x$$ returns an angle in $$[0,\pi]$$.
- $$\arctan x$$ returns an angle in $$(-\pi/2,\pi/2)$$.

The first two accept inputs in $$[-1,1]$$; arctangent accepts any real input. Angles are in radians.

<section class="theorem" markdown="1">
<p class="element-label">Rules</p>
<h3>Three common inverse trig derivatives</h3>

$$\frac{d}{dx}\arcsin x=\frac{1}{\sqrt{1-x^2}},\qquad -1<x<1.$$

$$\frac{d}{dx}\arccos x=-\frac{1}{\sqrt{1-x^2}},\qquad -1<x<1.$$

$$\frac{d}{dx}\arctan x=\frac{1}{1+x^2},\qquad x\in\mathbb R.$$

<details class="disclosure" markdown="1">
<summary>Arcsine rule: derivation (optional)</summary>

Let $$y=\arcsin x$$ with $$-1<x<1$$. Then $$\sin y=x$$ and $$-\pi/2<y<\pi/2$$. On this interval, $$\cos y>0$$, so the identity $$\cos^2y=1-\sin^2y$$ gives

$$\cos y=\sqrt{1-x^2}.$$

The inverse derivative theorem and the sine derivative therefore give

$$\frac{d}{dx}\arcsin x=\frac{1}{\cos y}=\frac{1}{\sqrt{1-x^2}}.$$

</details>
</section>

Arcsine and arccosine are defined at their endpoints, but have no finite derivative there. Their original trig functions have zero slope at the corresponding angles.

<section class="worked" markdown="1">
<p class="element-label">Example 2</p>
<h3>An inverse trig function inside a composition</h3>

For $$p(x)=\arcsin(x/3)$$, the inner input is $$x/3$$. The chain rule gives

$$p^{\prime}(x)=\frac{1/3}{\sqrt{1-x^2/9}}=\frac{1}{\sqrt{9-x^2}},\qquad -3<x<3.$$

The function itself is defined on $$[-3,3]$$, but this derivative is finite only in the interior.

</section>

<section class="worked" markdown="1">
<p class="element-label">Example 3</p>
<h3>A product with arctangent</h3>

For $$q(x)=x\arctan x$$, use the product rule:

$$q^{\prime}(x)=\arctan x+\frac{x}{1+x^2}.$$

Both terms matter: one differentiates the factor $$x$$, and the other differentiates arctangent. The result holds for every real input.

</section>

<aside class="warning" markdown="1">
<p class="element-label">Warning</p>

$$f^{-1}$$ means an inverse function, not $$1/f$$. Likewise, $$\arcsin x$$ reverses a restricted sine function; it is not $$1/\sin x$$. Check the chosen branch, use the corresponding original input, and do not take the reciprocal of a zero slope.

</aside>
