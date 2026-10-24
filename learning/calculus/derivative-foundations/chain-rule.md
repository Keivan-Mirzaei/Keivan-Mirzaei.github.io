---
layout: learning-topic
title: "Chain rule"
permalink: /learning/calculus/derivative-foundations/chain-rule/
course_key: calculus
module_key: derivative-foundations
position: "2.3"
description: Follow a change through nested functions by multiplying their local rates.
epigraph:
  text: "…divide each of the difficulties under examination into as many parts as possible…"
  author: "René Descartes"
  source: "A Discourse on Method, Part II; John Veitch translation, excerpt"
  source_url: "https://www.gutenberg.org/files/59/59-h/59-h.htm"
math: true
topic_script: /assets/js/learning-chain-rule.js
sitemap: false
exercises:
  - text: 'Let \(H(x)=f(g(x))\). Given \(g(2)=-1\), \(g^{\prime}(2)=3\), \(f^{\prime}(-1)=-4\), and \(f^{\prime}(2)=5\), find \(H^{\prime}(2)\).'
    options: ['\(15\)', '\(-4\)', '\(-12\)', '\(3\)']
    correct: 2
    why: 'The outer derivative is evaluated at the inner output: \(H^{\prime}(2)=f^{\prime}(-1)g^{\prime}(2)=(-4)(3)=-12\). The value \(f^{\prime}(2)\) is not used.'
  - text: 'A cart of mass \(2\,\mathrm{kg}\) has kinetic energy \(E=\frac12mv^2\). When its speed is \(3\,\mathrm{m/s}\) and increases at \(0.5\,\mathrm{m/s^2}\), how fast is its energy increasing?'
    options: ['\(3\,\mathrm{J/s}\)', '\(6\,\mathrm{J/s}\)', '\(9\,\mathrm{J/s}\)', '\(0.5\,\mathrm{J/s}\)']
    correct: 0
    why: 'Energy changes through speed: \(dE/dt=(dE/dv)(dv/dt)=mv(dv/dt)=2(3)(0.5)=3\,\mathrm{J/s}\). Here mass is constant; the energy formula is provided.'
  - text: 'Suppose \(g^{\prime}(a)=0\), and \(f\) is differentiable at \(g(a)\). What must be true of \(H(x)=f(g(x))\) at \(a\)?'
    options: ['\(H(a)=0\)', '\(H\) is constant near \(a\)', '\(H^{\prime}(a)\) is undefined', '\(H^{\prime}(a)=0\)']
    correct: 3
    why: 'The chain rule gives \(H^{\prime}(a)=f^{\prime}(g(a))\cdot0=0\). A zero rate at one input does not make the output zero or the function locally constant.'
  - text: 'A student differentiates \(y=1/(x^2+4)\) as \(y^{\prime}=-(x^2+4)^{-2}\). Which factor is missing?'
    options: ['\(x^2\)', '\(2x\)', '\(2\)', '\(x^2+4\)']
    correct: 1
    why: 'The inner function is \(x^2+4\), whose derivative is \(2x\). Thus \(y^{\prime}=-2x/(x^2+4)^2\). The student differentiated with respect to the inner input rather than \(x\).'
  - text: 'Two position models are \(p(t)=s(2t)\) and \(q(t)=2s(t)\). Given \(s^{\prime}(6)=7\) and \(s^{\prime}(3)=4\), find their velocities at \(t=3\).'
    options: ['Both are \(8\)', 'Both are \(14\)', '\(p^{\prime}(3)=14\), \(q^{\prime}(3)=8\)', '\(p^{\prime}(3)=7\), \(q^{\prime}(3)=8\)']
    correct: 2
    why: 'Changing the input gives \(p^{\prime}(t)=2s^{\prime}(2t)\); scaling the output gives \(q^{\prime}(t)=2s^{\prime}(t)\). At \(3\), these are \(2(7)=14\) and \(2(4)=8\), in the position model’s distance units per unit time.'
  - text: 'Which formula and domain describe the finite derivative of \(y=\sqrt{5-x}\)?'
    options: ['\(y^{\prime}=-1/(2\sqrt{5-x})\), \(x<5\)', '\(y^{\prime}=1/(2\sqrt{5-x})\), \(x<5\)', '\(y^{\prime}=-1/(2\sqrt{5-x})\), \(x\le5\)', '\(y^{\prime}=-1/(2\sqrt{5-x})\), all real \(x\)']
    correct: 0
    why: 'The outer square-root derivative is multiplied by the inner derivative \(-1\). The original function is defined for \(x\le5\), but its derivative is finite only for \(x<5\); the endpoint has an unbounded one-sided slope.'
  - text: 'Let \(P(x)=x f(x^2)\), with \(f(4)=3\) and \(f^{\prime}(4)=-1\). Find \(P^{\prime}(2)\).'
    options: ['\(-8\)', '\(-1\)', '\(1\)', '\(-5\)']
    correct: 3
    why: 'Use both rules: \(P^{\prime}(x)=f(x^2)+x f^{\prime}(x^2)(2x)\). At \(2\), this gives \(3+2(-1)(4)=-5\).'
---

## A change through two functions

<aside class="prerequisite" markdown="1">
<p class="element-label">Prerequisite</p>
<h3>Composition</h3>

A **composition** feeds one function’s output into another: $$u=g(x)$$, then $$y=f(u)$$. Thus $$y=f(g(x))$$, with $$g$$ the *inner* function and $$f$$ the *outer* function.

</aside>

A change in $$x$$ first changes $$u$$, which then changes $$y$$. The **chain rule** multiplies these two local rates. For a small change, the idea is

$$\Delta u\approx g^{\prime}(x)\Delta x,\qquad
\Delta y\approx f^{\prime}(u)\Delta u.$$

These approximations motivate the rule; they are not its proof.

<section class="theorem" markdown="1">
<p class="element-label">Rule</p>
<h3>Chain rule</h3>

If $$g$$ is differentiable at $$x$$ and $$f$$ is differentiable at $$g(x)$$, then

$$\frac{d}{dx}f(g(x))=f^{\prime}(g(x))g^{\prime}(x).$$

Equivalently, with $$u=g(x)$$ and $$y=f(u)$$,

$$\frac{dy}{dx}=\frac{dy}{du}\frac{du}{dx}.$$

<mark>Evaluate the outer derivative at the inner output, then multiply by the inner derivative.</mark>

<details class="disclosure" markdown="1">
<summary>Proof (optional)</summary>

Fix $$x=a$$ and write $$b=g(a)$$. Differentiability of $$f$$ means we can write

$$f(b+k)-f(b)=\bigl(f^{\prime}(b)+r(k)\bigr)k,$$

where $$r(k)\to0$$ as $$k\to0$$. For $$k\ne0$$, define $$r(k)=[f(b+k)-f(b)]/k-f^{\prime}(b)$$; set $$r(0)=0$$, so the identity holds at zero too.

Put $$k=g(a+h)-g(a)$$. Since differentiability implies continuity, $$k\to0$$ as $$h\to0$$. For $$h\ne0$$,

$$\frac{f(g(a+h))-f(g(a))}{h}
=\bigl(f^{\prime}(b)+r(k)\bigr)\frac{g(a+h)-g(a)}h.$$

Taking limits gives $$f^{\prime}(b)g^{\prime}(a)=f^{\prime}(g(a))g^{\prime}(a)$$. We never divide by $$k$$ in this last step, so the argument also covers nearby inputs with no inner change.

</details>
</section>

## Filling a widening tank

A conical tank is filled so its water height rises steadily: $$h(t)=1+t/2$$ metres, with $$t$$ in seconds. The tank’s shape gives water-surface radius $$r=h/2$$, so the cone-volume formula gives

$$V=\frac13\pi r^2h=\frac{\pi h^3}{12}.$$

Time changes the height; height changes the volume. By the power rule, $$dh/dt=1/2$$ and $$dV/dh=\pi h^2/4$$. The chain rule connects them:

$$\frac{dV}{dt}=\frac{dV}{dh}\frac{dh}{dt}
=\frac{\pi h^2}{4}\cdot\frac12=\frac{\pi h^2}{8}.$$

<div class="topic-widget chain-widget" id="chain-explorer">
<svg class="chain-tank" viewBox="0 0 640 390" role="group" aria-labelledby="chain-tank-title chain-tank-desc">
<title id="chain-tank-title">Water rising in a widening conical tank</title>
<desc id="chain-tank-desc">Drag the water surface up or down to move through time. The height rises at half a metre per second.</desc>
<defs>
<linearGradient id="chain-glass" x1="0" x2="1"><stop stop-color="#dce6eb" stop-opacity=".3"/><stop offset=".55" stop-color="#fcfcf9" stop-opacity=".05"/><stop offset="1" stop-color="#c4d4dd" stop-opacity=".35"/></linearGradient>
<linearGradient id="chain-water-fill" x1="0" x2="1"><stop stop-color="#a9d4ed"/><stop offset=".55" stop-color="#d0e9f7"/><stop offset="1" stop-color="#8fc4e3"/></linearGradient>
</defs>
<ellipse cx="320" cy="45" rx="150" ry="29" fill="none" stroke="#bbc9cf" stroke-width="1.5"/>
<path d="M170 45A150 29 0 0 0 470 45L320 345Z" fill="url(#chain-glass)"/>
<path id="chain-water" fill="url(#chain-water-fill)"/>
<path d="M170 45L320 345L470 45" fill="none" stroke="#8199a6" stroke-width="1.8"/>
<path d="M170 45A150 29 0 0 0 470 45" fill="none" stroke="#8199a6" stroke-width="1.8"/>
<path id="chain-height-guide" d="M320 345H510M510 345V245" fill="none" stroke="#9eac96" stroke-dasharray="4 5"/>
<text id="chain-height-label" x="522" y="300" fill="#282e29" font-size="19" font-family="Georgia,serif" font-style="italic">h</text>
<g id="chain-handle" class="graph-handle" role="slider" tabindex="0" aria-label="Time in seconds, controlled by water height" aria-valuemin="0" aria-valuemax="3" aria-valuenow="1">
<path id="chain-surface-hit" d="M270 245H370" fill="none" stroke="transparent" stroke-width="36"/>
<path id="chain-surface" d="M270 245H370" fill="#b7ddf2" stroke="#438eb9" stroke-width="1.5"/>
</g>
</svg>
<div class="widget-readouts chain-values"><span>\(t=\) <output id="chain-time">1.00</output> \(\mathrm{s}\)</span><span>\(h=\) <output id="chain-height">1.50</output> \(\mathrm{m}\)</span><span>\(V=\) <output id="chain-volume">0.88</output> \(\mathrm{m^3}\)</span></div>
<div class="widget-readouts chain-rates"><span>\(\frac{dV}{dt}=\) <output id="chain-volume-rate">1.77</output> \(\mathrm{m^2}\) × \(0.5\,\mathrm{m/s}=\) <output id="chain-total-rate">0.88</output> \(\mathrm{m^3/s}\)</span></div>
<p class="widget-instruction">Drag the water surface up or down. Higher up, the same rise adds more volume. The strip shows how the height rate and surface area combine to give the inflow rate.</p>
</div>

The height rises at the same speed throughout, but the required inflow increases as the tank widens. The factor $$dV/dh$$ is the water-surface area: it converts a height rate into a volume rate.

## Worked examples

<section class="worked" markdown="1">
<p class="element-label">Example 1</p>
<h3>A power of an expression</h3>

For $$y=(2-x^3)^5$$, choose $$u=2-x^3$$, then $$y=u^5$$. Differentiate each stage:

$$\frac{du}{dx}=-3x^2,\qquad \frac{dy}{du}=5u^4.$$

Combine them and replace $$u$$:

$$\frac{dy}{dx}=5u^4(-3x^2)=-15x^2(2-x^3)^4.$$

The outer derivative alone gives a rate with respect to $$u$$; multiplying by $$du/dx$$ changes it to a rate with respect to $$x$$.

</section>

<section class="worked" markdown="1">
<p class="element-label">Example 2</p>
<h3>More than two layers</h3>

Let $$y=\sqrt{1+(2x-1)^2}$$. The layers, from inside out, are $$2x-1$$, its square plus $$1$$, and the square root. The chain rule applies at each layer:

$$\begin{aligned}
y^{\prime}
&=\frac{1}{2\sqrt{1+(2x-1)^2}}\cdot2(2x-1)\cdot2\\
&=\frac{2(2x-1)}{\sqrt{1+(2x-1)^2}}.
\end{aligned}$$

The expression under the root is at least $$1$$, so the function and derivative are defined for every real $$x$$.

</section>

<section class="worked" markdown="1">
<p class="element-label">Example 3</p>
<h3>Combine the product and chain rules</h3>

For $$x\ne-1/2$$, rewrite

$$R(x)=\frac{x^2}{(1+2x)^3}=x^2(1+2x)^{-3}.$$

The product rule handles the two factors; the chain rule handles the second factor:

$$\begin{aligned}
R^{\prime}(x)
&=2x(1+2x)^{-3}+x^2\bigl[-3(1+2x)^{-4}\cdot2\bigr]\\
&=\frac{2x(1+2x)-6x^2}{(1+2x)^4}\\
&=\frac{2x(1-x)}{(1+2x)^4}.
\end{aligned}$$

The quotient rule gives the same result if applied to the original form, using the chain rule for its denominator. The domain restriction remains.

</section>

<aside class="warning" markdown="1">
<p class="element-label">Warning</p>

The notation $$dy/dx=(dy/du)(du/dx)$$ is a useful way to remember the chain rule, not a proof by cancelling symbols. Check differentiability at the appropriate inputs, keep every inner derivative, and preserve the original function’s domain.

</aside>
