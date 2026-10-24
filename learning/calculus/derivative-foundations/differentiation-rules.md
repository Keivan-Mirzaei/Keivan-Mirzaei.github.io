---
layout: learning-topic
title: "Differentiation rules"
permalink: /learning/calculus/derivative-foundations/differentiation-rules/
course_key: calculus
module_key: derivative-foundations
position: "2.2"
description: Differentiate the parts, then combine them according to the structure of the function.
epigraph:
  text: "It is unworthy of excellent men to lose hours like slaves in the labor of calculation…"
  author: "Gottfried Wilhelm Leibniz"
  source: "Excerpt from his observation on calculating machines"
  source_url: "https://mathshistory.st-andrews.ac.uk/Biographies/Leibniz/quotations/"
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
  - text: 'A rectangular panel has width \(w(t)\) and height \(h(t)\). At one instant they are \(4\,\mathrm{m}\) and \(3\,\mathrm{m}\), with rates \(0.2\,\mathrm{m/s}\) and \(-0.1\,\mathrm{m/s}\). How fast is its area changing?'
    options: ['\(-0.02\,\mathrm{m^2/s}\)', '\(0.2\,\mathrm{m^2/s}\)', '\(0.5\,\mathrm{m^2/s}\)', '\(-0.2\,\mathrm{m^2/s}\)']
    correct: 1
    why: 'Since \(A=wh\), the product rule gives \(A^{\prime}=w^{\prime}h+wh^{\prime}=(0.2)(3)+4(-0.1)=0.2\,\mathrm{m^2/s}\). The growing width outweighs the shrinking height.'
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

The limit definition tells us what a derivative means. Differentiation rules let us calculate it efficiently. <mark>Choose a rule from how the function is built</mark>: a sum, product, or quotient. Compositions will be handled in the next submodule.

## Constants, powers, and sums

<section class="theorem" markdown="1">
<p class="element-label">Rules</p>
<h3>Differentiate term by term</h3>

For a constant $$c$$ and a constant exponent $$n$$,

$$\frac{d}{dx}c=0,\qquad \frac{d}{dx}x^n=nx^{n-1}.$$

For any real exponent $$n$$, the power formula holds for $$x>0$$. For positive integer exponents it also holds at zero and at negative inputs; for negative integer exponents it holds at every $$x\ne0$$. The case $$n=0$$ is the constant rule, with derivative zero.

For rational exponents with an odd denominator in lowest terms, the same power formula also holds at negative inputs. At zero, check whether a finite derivative exists. For other fractional exponents, check the real domain and its endpoint separately. For example, $$\sqrt{x}$$ has derivative $$1/(2\sqrt{x})$$ for $$x>0$$, but no finite right-hand derivative at zero. A formula valid at positive inputs must not be used to assign a derivative at an excluded or singular input.

If $$f$$ and $$g$$ are differentiable, then

$$\frac{d}{dx}\bigl(cf(x)\bigr)=cf^{\prime}(x),\qquad \frac{d}{dx}\bigl(f(x)\pm g(x)\bigr)=f^{\prime}(x)\pm g^{\prime}(x).$$

</section>

As in the definition lesson, $$d/dx$$ means “differentiate with respect to $$x$$.” Multiplying a graph by a constant scales its slopes; adding a constant shifts the graph without changing its slopes.

<aside class="prerequisite" markdown="1">
<p class="element-label">Prerequisite</p>
<h3>Rewrite reciprocals and roots as powers</h3>

For a positive integer $$m$$, $$x^{-m}=1/x^m$$ when $$x\ne0$$. Also $$\sqrt{x}=x^{1/2}$$ for $$x\ge0$$.

</aside>

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
<div class="rules-readouts widget-readouts"><span>\(h=\) <output id="rules-h">0.70</output></span><span>\(\frac{\Delta A}{h}=\) <output id="rules-rate">8.40</output></span><span>\(A^{\prime}(0)=7\)</span></div>
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

## Choose a useful form

<section class="worked" markdown="1">
<p class="element-label">Example 3</p>
<h3>A product with two changing factors</h3>

For $$r(x)=(x^2+2)(x^3-1)$$, both factors change with $$x$$. The product rule gives

$$r^{\prime}(x)=2x(x^3-1)+(x^2+2)3x^2.$$

Expanding first gives $$r(x)=x^5+2x^3-x^2-2$$, so term-by-term differentiation gives

$$r^{\prime}(x)=5x^4+6x^2-2x.$$

Expanding the product-rule answer produces the same expression. Both methods work; choose the form that makes the calculation clearer.

</section>

<aside class="warning" markdown="1">
<p class="element-label">Warning</p>

Products and quotients do not differentiate factor by factor: in general, $$(uv)^{\prime}\ne u^{\prime}v^{\prime}$$ and $$(u/v)^{\prime}\ne u^{\prime}/v^{\prime}$$. Check the domain before using a rule, and distinguish a product from a power of a whole expression. The next submodule introduces the chain rule for differentiating such powers directly.

</aside>
