---
layout: learning-topic
title: "Trigonometric derivatives"
permalink: /learning/calculus/derivative-foundations/trigonometric-derivatives/
course_key: calculus
module_key: elementary-function-derivatives
position: "3.1"
description: Connect sine and cosine to their slopes, then apply the differentiation rules.
math: true
topic_script: /assets/js/learning-trig.js
sitemap: false
exercises:
  - text: 'For \(y=\sin x+\cos x\), what is the tangent slope at \(x=\pi/4\)?'
    options: ['Zero, because \(\cos(\pi/4)=\sin(\pi/4)\)', 'Positive, because both function values are positive', 'Undefined, because sine and cosine are equal there']
    correct: 0
    why: 'Differentiate the sum: \(y^{\prime}=\cos x-\sin x\). The two rates cancel at \(\pi/4\), giving a horizontal tangent even though the height is positive.'
  - text: 'Let \(D(t)=\sin(\pi t/180)\), so \(t\) records an angle in degrees. What is \(D^{\prime}(0)\)?'
    options: ['\(1\)', '\(180/\pi\)', '\(\pi/180\)', '\(0\)']
    correct: 2
    why: 'The inner angle is in radians. The chain rule gives \(D^{\prime}(t)=(\pi/180)\cos(\pi t/180)\), so the rate per degree at zero is \(\pi/180\), not one.'
  - text: 'A student differentiates \(x\sin x\) and gets \(\cos x\). Which correction is needed?'
    options: ['Only \(\sin x\)', 'Only \(x\)', 'The correct derivative is \(\sin x+x\cos x\)', 'No term is missing']
    correct: 2
    why: 'Both factors depend on the input. The product rule gives \(1\cdot\sin x+x\cos x\); differentiating the two factors separately and multiplying is not valid.'
  - text: 'For \(f(x)=\tan x\), a student reports \(f^{\prime}(\pi/2)=\sec^2(\pi/2)\). What is the problem?'
    options: ['The derivative should have a minus sign', 'The original function is undefined there, so no derivative exists there', 'The derivative is zero there']
    correct: 1
    why: 'Both tangent and secant are undefined where cosine is zero. A derivative formula does not add points to the original domain.'
  - text: 'For \(y=A\sin(\omega t)\), with \(A>0\) and \(\omega>0\), how does doubling \(\omega\) affect the largest magnitude of \(dy/dt\)?'
    options: ['It stays the same', 'It doubles', 'It quadruples', 'It is halved']
    correct: 1
    why: 'The derivative is \(A\omega\cos(\omega t)\), whose largest magnitude is \(A\omega\). Doubling the angular frequency doubles that magnitude.'
  - text: 'A temperature is modelled by \(T(t)=20+4\sin t\). At \(t=\pi\), is it warming, cooling, or momentarily unchanged?'
    options: ['Warming, because \(T(\pi)>0\)', 'Cooling, because \(T^{\prime}(\pi)=-4\)', 'Momentarily unchanged, because \(\sin\pi=0\)']
    correct: 1
    why: 'The derivative is \(T^{\prime}(t)=4\cos t\), giving a negative rate at \(\pi\). The temperature value is not its rate of change.'
---

## The idea

Sine rises, flattens, falls, and repeats. Its tangent slope follows the same repeating pattern as cosine. The paired graphs below connect a function’s height with its rate of change.

<section class="theorem" markdown="1">
<p class="element-label">Rules</p>
<h3>Sine and cosine</h3>

$$\frac{d}{dx}\sin x=\cos x,\qquad \frac{d}{dx}\cos x=-\sin x.$$

Both rules hold for every real input, with the angle in *radians*.

</section>

<div class="topic-widget trig-widget" id="trig-explorer">
<div class="limits-plot">
<svg viewBox="0 0 640 440" role="group" aria-labelledby="trig-title trig-desc">
<title id="trig-title">Compare the sine curve with its derivative</title>
<desc id="trig-desc">Drag either point horizontally. The upper point follows sine with an amber tangent. The lower point records that tangent slope on the cosine curve.</desc>
<defs><clipPath id="trig-clip"><rect x="65" y="40" width="510" height="165"/></clipPath></defs>
<g fill="none" stroke="#c9d1c6"><path d="M65 125H590M70 205V40M65 330H590M70 410V245"/></g>
<path id="trig-guide" fill="none" stroke="#c4cebf" stroke-dasharray="3 5"/>
<path id="trig-sine" fill="none" stroke="#285b46" stroke-width="2.6"/>
<path id="trig-cosine" fill="none" stroke="#a67936" stroke-width="2.6"/>
<path id="trig-tangent" fill="none" stroke="#a67936" stroke-width="2" clip-path="url(#trig-clip)"/>
<g id="trig-handle" class="graph-handle" role="slider" tabindex="0" aria-label="Angle in radians" aria-orientation="horizontal" aria-valuemin="0" aria-valuemax="6.283185307179586" aria-valuenow="0.7853981633974483">
<circle id="trig-sine-focus" class="graph-focus-ring" r="13" fill="none" stroke="#285b46" stroke-width="1.5"/>
<circle id="trig-sine-hit" r="22" fill="transparent"/>
<circle id="trig-sine-dot" r="7" fill="#285b46" stroke="#fcfcf9" stroke-width="2"/>
<circle id="trig-cosine-focus" class="graph-focus-ring" r="13" fill="none" stroke="#a67936" stroke-width="1.5"/>
<circle id="trig-cosine-hit" r="22" fill="transparent"/>
<circle id="trig-cosine-dot" r="7" fill="#a67936" stroke="#fcfcf9" stroke-width="2"/>
</g>
<g fill="#686e66" font-family="-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif" font-size="14" text-anchor="end"><text x="53" y="75">1</text><text x="53" y="185">−1</text><text x="53" y="280">1</text><text x="53" y="390">−1</text></g>
<path class="axis-ticks" d="M70 122V128M70 327V333M320 122V128M320 327V333M570 122V128M570 327V333M67 70H73M67 180H73M67 275H73M67 385H73" fill="none" stroke="#9eac96" stroke-width="1"/>
</svg>
<span class="trig-label trig-sine-title">\(f(x)=\sin x\)</span><span class="trig-label trig-cosine-title">\(f^{\prime}(x)=\cos x\)</span>
<span class="trig-label trig-zero trig-upper">\(0\)</span><span class="trig-label trig-pi trig-upper">\(\pi\)</span><span class="trig-label trig-two-pi trig-upper">\(2\pi\)</span><span class="trig-label trig-x trig-upper">\(x\)</span>
<span class="trig-label trig-zero trig-lower">\(0\)</span><span class="trig-label trig-pi trig-lower">\(\pi\)</span><span class="trig-label trig-two-pi trig-lower">\(2\pi\)</span><span class="trig-label trig-x trig-lower">\(x\)</span>
</div>
<div class="trig-readouts"><span>\(x=\) <output id="trig-x">0.79</output> rad</span><span>\(f(x)=\) <output id="trig-value">0.71</output></span><span>\(f^{\prime}(x)=\) <output id="trig-slope">0.71</output></span></div>
<p class="widget-instruction">Drag either point. The amber tangent's slope in the upper graph is the height of the point in the lower graph.</p>
</div>

At $$x=\pi/2$$, sine is at a crest and its slope is $$0$$. At $$x=\pi$$, it crosses zero while falling, and its slope is $$-1$$. The derivative tracks *change*, not height.

## The other four functions

Recall $$\tan x=\sin x/\cos x$$, $$\cot x=\cos x/\sin x$$, $$\sec x=1/\cos x$$, and $$\csc x=1/\sin x$$. Their derivatives follow from the quotient rule.

<section class="theorem" markdown="1">
<p class="element-label">Rules</p>
<h3>Tangent, cotangent, secant, and cosecant</h3>

$$\frac{d}{dx}\tan x=\sec^2 x,\qquad \frac{d}{dx}\cot x=-\csc^2 x.$$

$$\frac{d}{dx}\sec x=\sec x\tan x,\qquad \frac{d}{dx}\csc x=-\csc x\cot x.$$

Use these only where the original functions are defined: $$\cos x\ne0$$ for tangent and secant; $$\sin x\ne0$$ for cotangent and cosecant.

</section>

For example, the quotient rule explains the tangent rule:

$$\frac{d}{dx}\tan x=\frac{\cos x\cos x-\sin x(-\sin x)}{\cos^2x}=\frac{1}{\cos^2x}=\sec^2x.$$

## Worked examples

<section class="worked" markdown="1">
<p class="element-label">Example 1</p>
<h3>An angle that also changes</h3>

For $$y=\sin(x^2)$$, the inner angle is $$x^2$$. Use the chain rule:

$$\frac{dy}{dx}=\cos(x^2)\cdot2x.$$

Differentiate sine at the current angle, then multiply by the rate at which that angle changes.

</section>

<section class="worked" markdown="1">
<p class="element-label">Example 2</p>
<h3>A quotient and an identity</h3>

For $$q(x)=\frac{\cos x}{1+\sin x}$$, where $$1+\sin x\ne0$$,

$$\begin{aligned}
q^{\prime}(x)&=\frac{(-\sin x)(1+\sin x)-\cos x\cos x}{(1+\sin x)^2}\\
&=\frac{-\sin x-(\sin^2x+\cos^2x)}{(1+\sin x)^2}\\
&=-\frac{1}{1+\sin x}.
\end{aligned}$$

The identity $$\sin^2x+\cos^2x=1$$ makes the simplification possible. The original domain restriction remains.

</section>

<section class="worked" markdown="1">
<p class="element-label">Example 3</p>
<h3>Position and velocity in periodic motion</h3>

An object has position $$s(t)=2\cos(3t)$$ metres, with time in seconds and the angle $$3t$$ in radians. Its instantaneous velocity is

$$s^{\prime}(t)=-2\sin(3t)\cdot3=-6\sin(3t)\,\mathrm{m/s}.$$

At $$t=\pi/6$$ seconds, the object has position $$0$$ and velocity $$-6\,\mathrm{m/s}$$. It is passing through the origin in the negative direction, rather than stopping there.

The coefficient $$2$$ is the **amplitude**: maximum displacement from the centre. The coefficient $$3$$ is the **angular frequency**, describing how quickly the angle changes in radians per second.

</section>

<aside class="warning" markdown="1">
<p class="element-label">Warning</p>

The derivative of $$\cos x$$ is *$$-\sin x$$*, not $$\sin x$$. Keep that minus sign, and multiply by the inner derivative when the angle is a function of the input.

</aside>
