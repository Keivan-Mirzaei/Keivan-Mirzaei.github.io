---
layout: learning-topic
title: "Differentiation rules"
permalink: /learning/calculus/derivative-foundations/differentiation-rules/
course_key: calculus
module_key: derivative-foundations
position: "2.2"
description: Differentiate the parts, then combine them according to the structure of the function.
math: true
topic_script: /assets/js/learning-rules.js
sitemap: false
exercises:
  - text: 'A delivery cost is modelled by \(C(x)\), where \(x\) is distance. A fixed booking fee changes it to \(D(x)=C(x)+12\). How does the rate of cost per kilometre change?'
    options: ['It increases by \(12\)', 'It stays the same', 'It is multiplied by \(12\)']
    correct: 1
    why: 'The derivative of a constant is zero, so \(D^{\prime}(x)=C^{\prime}(x)\). A fixed fee changes the cost, but not its rate with respect to distance.'
  - text: 'A graph of \(f\) is reflected across the horizontal axis and stretched vertically by a factor of \(3\), giving \(g(x)=-3f(x)\). What happens to its tangent slopes?'
    options: ['\(g^{\prime}(x)=3f^{\prime}(x)\)', '\(g^{\prime}(x)=-3f^{\prime}(x)\)', '\(g^{\prime}(x)=f^{\prime}(x)-3\)', '\(g^{\prime}(x)=-f^{\prime}(x)/3\)']
    correct: 1
    why: 'Vertical scaling multiplies the change in output while leaving the change in input unchanged. Every tangent slope is multiplied by \(-3\), so its sign reverses and its magnitude triples.'
  - text: 'At an input \(a\), suppose \(f(a)=4\), \(f^{\prime}(a)=2\), \(g(a)=2\), and \(g^{\prime}(a)=1\). What is \((f/g)^{\prime}(a)\)?'
    options: ['\(2\)', '\(1\)', '\(0\)', '\(1/2\)']
    correct: 2
    why: 'The quotient rule gives \([2\cdot2-4\cdot1]/2^2=0\). The ratio has zero instantaneous rate here; dividing the derivatives would give the wrong answer.'
  - text: 'Let \(H(x)=f(g(x))\). You know \(g(2)=3\), \(g^{\prime}(2)=-2\), \(f^{\prime}(2)=9\), and \(f^{\prime}(3)=4\). Find \(H^{\prime}(2)\).'
    options: ['\(-18\)', '\(-8\)', '\(4\)', '\(8\)']
    correct: 1
    why: 'Evaluate the outer derivative at the inner output: \(H^{\prime}(2)=f^{\prime}(g(2))g^{\prime}(2)=f^{\prime}(3)(-2)=-8\). The value \(f^{\prime}(2)\) is not used.'
  - text: 'For \(x\ne0\), let \(q(x)=x/x\). Which statement is correct?'
    options: ['\(q^{\prime}(x)=1\) wherever it is defined', '\(q^{\prime}(x)=0\) for \(x\ne0\), but the original function is undefined at \(0\)', '\(q^{\prime}(0)=0\), because the factors cancel']
    correct: 1
    why: 'On its domain, \(q(x)=1\), so its derivative is zero. Simplifying does not add zero to the original domain.'
  - text: 'For \(r(x)=\sqrt{x}\), what is the tangent slope at \(x=9\)?'
    options: ['\(3\)', '\(1/3\)', '\(1/6\)', '\(6\)']
    correct: 2
    why: 'Write \(r(x)=x^{1/2}\). The power rule gives \(r^{\prime}(x)=\tfrac12 x^{-1/2}=1/(2\sqrt{x})\) for \(x>0\), so \(r^{\prime}(9)=1/6\).'
  - text: 'At \(a\), you know \(f(a)=0\), \(f^{\prime}(a)=3\), and \(g(a)=5\). Can you find \((fg)^{\prime}(a)\) without knowing \(g^{\prime}(a)\), assuming both functions are differentiable there?'
    options: ['Yes: it is \(0\)', 'Yes: it is \(15\)', 'No: both derivative values are always needed']
    correct: 1
    why: 'The product rule gives \(f^{\prime}(a)g(a)+f(a)g^{\prime}(a)=3\cdot5+0\cdot g^{\prime}(a)=15\). A product can be zero while its derivative is nonzero.'
---

## The idea

The limit definition tells us what a derivative means. Differentiation rules let us calculate it efficiently. <mark>Choose a rule from how the function is built</mark>: a sum, product, quotient, or composition.

## Constants, powers, and sums

<section class="theorem" markdown="1">
<p class="element-label">Rules</p>
<h3>Differentiate term by term</h3>

For constants $$c$$ and $$n$$,

$$\frac{d}{dx}c=0,\qquad \frac{d}{dx}x^n=nx^{n-1}.$$

The power rule holds wherever the real power and its derivative are defined. In particular, negative powers exclude $$0$$, and fractional powers require care with their domains.

If $$f$$ and $$g$$ are differentiable, then

$$\frac{d}{dx}\bigl(cf(x)\bigr)=cf^{\prime}(x),\qquad \frac{d}{dx}\bigl(f(x)\pm g(x)\bigr)=f^{\prime}(x)\pm g^{\prime}(x).$$

</section>

The symbol $$d/dx$$ means “differentiate with respect to $$x$$.” Multiplying a graph by a constant scales its slopes; adding a constant shifts the graph without changing its slopes.

<section class="worked" markdown="1">
<p class="element-label">Example 1</p>
<h3>Rewrite before differentiating</h3>

For $$x\ne0$$, differentiate

$$p(x)=3x^4-\frac{2}{x^2}+7=3x^4-2x^{-2}+7.$$

Apply the power rule to each term:

$$p^{\prime}(x)=12x^3+4x^{-3}=12x^3+\frac{4}{x^3}.$$

The constant disappears, and the negative exponent produces another negative factor, giving a positive second term.

</section>

## Products: both factors can change

<section class="theorem" markdown="1">
<p class="element-label">Rule</p>
<h3>Product rule</h3>

For differentiable functions $$u$$ and $$v$$,

$$\frac{d}{dx}(uv)=u^{\prime}v+uv^{\prime}.$$

</section>

Each term accounts for the change in one factor while using the current value of the other. To see why there are two terms, let a rectangle have side lengths $$u(t)=2+t$$ and $$v(t)=3+2t$$. At $$t=0$$, its area is $$6$$. After an increment $$h>0$$, two strips and a small corner are added.

<div class="topic-widget rules-widget" id="rules-explorer">
<div class="limits-plot">
<svg viewBox="0 0 640 350" role="group" aria-labelledby="rules-title rules-desc">
<title id="rules-title">Two strips explain the product rule</title>
<desc id="rules-desc">Drag the upper right corner toward the original rectangle. The two strips have areas four h and three h. The extra corner has area two h squared.</desc>
<g transform="translate(90 0)">
<rect x="80" y="130" width="200" height="150" fill="#edf3e7"/>
<rect id="rules-top" x="80" y="60" width="200" height="70" fill="#e3eaf4"/>
<rect id="rules-right" x="280" y="130" width="70" height="150" fill="#e3eaf4"/>
<rect id="rules-corner" x="280" y="60" width="70" height="70" fill="#f4e5bc"/>
<path d="M80 130H280V280H80Z" fill="none" stroke="#285b46" stroke-width="2"/>
<path id="rules-outline" d="M80 130V60H350V280H280" fill="none" stroke="#285b46" stroke-width="2" stroke-dasharray="5 5"/>
<g id="rules-handle" class="graph-handle" role="slider" tabindex="0" aria-label="Time increment" aria-valuemin="0" aria-valuemax="1" aria-valuenow="0.7">
<circle id="rules-focus" class="graph-focus-ring" cx="350" cy="60" r="13" fill="none" stroke="#285b46" stroke-width="1.5"/>
<circle id="rules-hit" cx="350" cy="60" r="24" fill="transparent"/>
<circle id="rules-dot" cx="350" cy="60" r="7" fill="#285b46" stroke="#fcfcf9" stroke-width="2"/>
</g>
</g>
</svg>
<span class="rules-label rules-base">\(u(0)=2\)</span><span class="rules-label rules-side">\(v(0)=3\)</span>
<span id="rules-top-label" class="rules-label">\(4h\)</span><span id="rules-right-label" class="rules-label">\(3h\)</span><span id="rules-corner-label" class="rules-label">\(2h^2\)</span>
</div>
<div class="rules-readouts"><span>\(h=\) <output id="rules-h">0.70</output></span><span>\(\frac{\Delta A}{h}=\) <output id="rules-rate">8.40</output></span><span>\(A^{\prime}(0)=7\)</span></div>
<p class="widget-instruction">Drag the corner toward the original rectangle. The blue strips give the two product-rule terms; the amber corner contributes less and less after dividing by \(h\). At \(h=0\), the quotient is undefined.</p>
</div>

Here $$\Delta A=4h+3h+2h^2$$, so

$$A^{\prime}(0)=\lim_{h\to0}\frac{(2+h)(3+2h)-6}{h}=\lim_{h\to0}(7+2h)=7.$$

This agrees with $$u^{\prime}(0)v(0)+u(0)v^{\prime}(0)=1\cdot3+2\cdot2=7$$. The picture shows positive increments; the same algebra works for negative increments near $$0$$.

## Quotients: order matters

<section class="theorem" markdown="1">
<p class="element-label">Rule</p>
<h3>Quotient rule</h3>

Where $$v\ne0$$,

$$\frac{d}{dx}\left(\frac{u}{v}\right)=\frac{u^{\prime}v-uv^{\prime}}{v^2}.$$

Both functions must be differentiable. The numerator uses the derivative of the top factor first; reversing the subtraction changes the sign.

</section>

<section class="worked" markdown="1">
<p class="element-label">Example 2</p>
<h3>Keep the denominator's restriction</h3>

For $$q(x)=\frac{x^2+1}{x+1}$$, with $$x\ne-1$$,

$$q^{\prime}(x)=\frac{(2x)(x+1)-(x^2+1)(1)}{(x+1)^2}=\frac{x^2+2x-1}{(x+1)^2}.$$

The square on the denominator belongs to the rule. The original function and this derivative are undefined at $$-1$$.

</section>

## Compositions: follow the inside change

A **composition** feeds one function's output into another. In $$f(g(x))$$, $$g$$ is the inner function and $$f$$ is the outer function.

<section class="theorem" markdown="1">
<p class="element-label">Rule</p>
<h3>Chain rule</h3>

If $$g$$ is differentiable at $$x$$ and $$f$$ is differentiable at $$g(x)$$, then

$$\frac{d}{dx}f(g(x))=f^{\prime}(g(x))g^{\prime}(x).$$

</section>

Differentiate the outer function *at the inner output*, then multiply by the inner derivative. A small input change is first scaled by the inner rate, then by the outer rate.

<section class="worked" markdown="1">
<p class="element-label">Example 3</p>
<h3>A power of an expression</h3>

For $$r(x)=(1-3x^2)^4$$, the inner function is $$g(x)=1-3x^2$$ and the outer function is $$f(u)=u^4$$. Thus

$$r^{\prime}(x)=4(1-3x^2)^3(-6x)=-24x(1-3x^2)^3.$$

The factor $$-6x$$ accounts for how the inside changes. Dropping it would differentiate with respect to the inside variable instead of $$x$$.

</section>

<aside class="warning" markdown="1">
<p class="element-label">Warning</p>

Products and quotients do not differentiate factor by factor: in general, $$(uv)^{\prime}\ne u^{\prime}v^{\prime}$$ and $$(u/v)^{\prime}\ne u^{\prime}/v^{\prime}$$. Check the domain before using a rule, and keep the inner derivative when using the chain rule.

</aside>
