---
layout: learning-topic
title: "Exponential, logarithmic and hyperbolic functions and their derivatives"
permalink: /learning/calculus/derivative-foundations/hyperbolic-functions/
course_key: calculus
module_key: elementary-function-derivatives
position: "3.3"
description: Functions built from exponentials, with derivative rules that resemble—but do not copy—the trigonometric rules.
math: true
topic_script: /assets/js/learning-hyperbolic.js
sitemap: false
exercises:
  - text: 'At \(x=0\), is \(p(x)=\cosh x-\sinh x\) increasing, decreasing, or momentarily flat?'
    options: ['Increasing: its slope is \(1\)', 'Decreasing: its slope is \(-1\)', 'Flat: its slope is \(0\)']
    correct: 1
    why: 'The derivative is \(p^{\prime}(x)=\sinh x-\cosh x\). Since \(\sinh0=0\) and \(\cosh0=1\), its slope at zero is \(-1\). In fact, the definitions simplify \(p(x)\) to \(e^{-x}\).'
  - text: 'For a very large positive input, \(\tanh x\) is close to \(1\). What happens to its tangent slope?'
    options: ['It approaches \(1\)', 'It approaches \(0\)', 'It grows without bound', 'It becomes negative']
    correct: 1
    why: 'Its slope is \(1/\cosh^2x\). Since \(\cosh x\) grows without bound, that slope tends to zero. Approaching a height of one does not mean having a slope of one.'
  - text: 'Suppose \(g(2)=0\) and \(g^{\prime}(2)=-3\). For \(H(x)=\sinh(g(x))\), what is \(H^{\prime}(2)\)?'
    options: ['\(0\)', '\(-3\)', '\(3\)', '\(\cosh2\)']
    correct: 1
    why: 'The chain rule gives \(H^{\prime}(2)=\cosh(g(2))g^{\prime}(2)=\cosh0\cdot(-3)=-3\). Evaluate the outer derivative at the inner output.'
  - text: 'What is the fastest way to differentiate \(J(x)=\cosh^2x-\sinh^2x\)?'
    options: ['Use the identity \(J(x)=1\), so \(J^{\prime}(x)=0\)', 'Subtract the derivatives to get \(\sinh^2x-\cosh^2x\)', 'Its derivative is \(1\)']
    correct: 0
    why: 'The identity makes the function constant. Differentiating both squared terms with the chain rule also gives zero, but requires more work.'
  - text: 'The identity \(\cosh(-a)=\cosh a\) holds for every real \(a\). How do the tangent slopes of \(\tanh x\) at \(-a\) and \(a\) compare?'
    options: ['They are equal and positive', 'They are equal in magnitude but have opposite signs', 'One of them is zero']
    correct: 0
    why: 'Both slopes equal \(1/\cosh^2a\), which is positive. The function values have opposite signs when \(a\ne0\), but their rates of change agree.'
  - text: 'At an input \(a\), you know \(\sinh a=2\). What is the tangent slope of \(\tanh x\) there?'
    options: ['\(1/4\)', '\(1/5\)', '\(5\)', '\(2\)']
    correct: 1
    why: 'The identity gives \(\cosh^2a=1+\sinh^2a=5\). The slope there is \(1/\cosh^2a=1/5\), without finding the input \(a\).'

---

## The idea

**Hyperbolic sine** and **hyperbolic cosine** combine the growing exponential $$e^x$$ with the decaying exponential $$e^{-x}$$. Their names resemble sine and cosine, but these functions do not repeat periodically.

<aside class="definition" markdown="1">
<p class="element-label">Definition</p>
<h3>Hyperbolic sine, cosine, and tangent</h3>

$$\sinh x=\frac{e^x-e^{-x}}{2},\qquad \cosh x=\frac{e^x+e^{-x}}{2},\qquad \tanh x=\frac{\sinh x}{\cosh x}.$$

All three are defined for every real input. In particular, $$\cosh x\ge1$$, so the denominator in hyperbolic tangent never vanishes. At zero,

$$\sinh0=0,\qquad \cosh0=1,\qquad \tanh0=0.$$

</aside>

The identity

$$\cosh^2x-\sinh^2x=1$$

explains the name: the point $$(\cosh x,\sinh x)$$ lies on the **unit hyperbola** $$X^2-Y^2=1$$, rather than on a unit circle. The figure below shows the right-hand branch traced by these points. The identity follows directly from the definitions:

$$\cosh^2x-\sinh^2x=\frac{(e^x+e^{-x})^2-(e^x-e^{-x})^2}{4}=\frac{4e^xe^{-x}}4=1.$$

<figure class="topic-figure"><img src="{{ '/assets/figures/learning/unit-hyperbola.svg' | relative_url }}" alt="The unit hyperbola has two branches. A green point on the right branch has coordinates cosh t, sinh t, with dashed projections to the axes." width="640" height="400"><figcaption>The point \(X=\cosh t,\ Y=\sinh t\) lies on the green branch of \(X^2-Y^2=1\). The other branch has \(X\le-1\).</figcaption></figure>

## Derivative rules

The starting exponential rule is

$$\frac{d}{dx}e^x=e^x.$$

Using the chain rule already introduced, $$\frac{d}{dx}e^{-x}=-e^{-x}$$. These rules let us differentiate the definitions above.

<section class="theorem" markdown="1">
<p class="element-label">Rules</p>
<h3>The three main derivatives</h3>

$$\frac{d}{dx}\sinh x=\cosh x,\qquad \frac{d}{dx}\cosh x=\sinh x.$$

$$\frac{d}{dx}\tanh x=\frac{1}{\cosh^2x}=\operatorname{sech}^2x.$$

Here $$\operatorname{sech}x=1/\cosh x$$ is **hyperbolic secant**. These derivatives exist for every real input.

<details class="disclosure" markdown="1">
<summary>Derivations (optional)</summary>

Differentiate the exponential definitions term by term:

$$\frac{d}{dx}\sinh x=\frac{e^x+e^{-x}}2=\cosh x,\qquad \frac{d}{dx}\cosh x=\frac{e^x-e^{-x}}2=\sinh x.$$

For hyperbolic tangent, use the quotient rule and the identity established above:

$$\frac{d}{dx}\tanh x=\frac{\cosh^2x-\sinh^2x}{\cosh^2x}=\frac1{\cosh^2x}.$$

</details>
</section>

The important sign difference is that $$\cosh x$$ differentiates to *positive* $$\sinh x$$; the circular cosine differentiates to $$-\sin x$$.

<div class="topic-widget hyperbolic-widget" id="hyperbolic-explorer">
<fieldset class="scenario-choices"><legend>Choose a function</legend>
<label><input type="radio" name="hyperbolic-function" value="sinh" aria-label="Hyperbolic sine"><span>\(\sinh x\)</span></label>
<label><input type="radio" name="hyperbolic-function" value="cosh" aria-label="Hyperbolic cosine" checked><span>\(\cosh x\)</span></label>
<label><input type="radio" name="hyperbolic-function" value="tanh" aria-label="Hyperbolic tangent"><span>\(\tanh x\)</span></label>
</fieldset>
<div class="limits-plot">
<svg viewBox="0 0 640 410" role="group" aria-labelledby="hyperbolic-title hyperbolic-desc">
<title id="hyperbolic-title">Explore a hyperbolic function and its tangent</title>
<desc id="hyperbolic-desc">Choose hyperbolic sine, cosine, or tangent, then drag the point along the curve. The green curve gives the function value, and the amber tangent shows the derivative.</desc>
<defs><clipPath id="hyperbolic-clip"><rect x="65" y="25" width="510" height="345"/></clipPath></defs>
<g fill="none" stroke="#c9d1c6"><path d="M65 200H590M320 370V25"/></g>
<path d="M65 80H575M65 160H575M65 320H575" fill="none" stroke="#e0e4dc" stroke-dasharray="3 5"/>
<path id="hyperbolic-guide" fill="none" stroke="#c4cebf" stroke-dasharray="3 5"/>
<path id="hyperbolic-curve" fill="none" stroke="#285b46" stroke-width="2.6"/>
<path id="hyperbolic-tangent" fill="none" stroke="#a67936" stroke-width="2" clip-path="url(#hyperbolic-clip)"/>
<g id="hyperbolic-handle" class="graph-handle" role="slider" tabindex="0" aria-label="Curve input" aria-orientation="horizontal" aria-valuemin="-2" aria-valuemax="2" aria-valuenow="0.75">
<circle id="hyperbolic-focus" class="graph-focus-ring" r="13" fill="none" stroke="#285b46" stroke-width="1.5"/><circle id="hyperbolic-hit" r="24" fill="transparent"/><circle id="hyperbolic-dot" r="7" fill="#285b46" stroke="#fcfcf9" stroke-width="2"/>
</g>
<g fill="#686e66" font-family="-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif" font-size="14"><text x="80" y="224" text-anchor="middle">−2</text><text x="200" y="224" text-anchor="middle">−1</text><text x="440" y="224" text-anchor="middle">1</text><text x="560" y="224" text-anchor="middle">2</text><text x="53" y="164" text-anchor="end">1</text><text x="53" y="84" text-anchor="end">3</text><text x="53" y="324" text-anchor="end">−3</text></g>
<path class="axis-ticks" d="M80 197V203M200 197V203M440 197V203M560 197V203M317 160H323M317 80H323M317 320H323" fill="none" stroke="#9eac96" stroke-width="1"/>
</svg>
<span class="hyperbolic-axis hyperbolic-axis-x">\(x\)</span><span class="hyperbolic-axis hyperbolic-axis-y">\(y\)</span>
</div>
<div class="hyperbolic-readouts"><span>\(x=\) <output id="hyperbolic-x">0.75</output></span><span>\(f(x)=\) <output id="hyperbolic-value">1.29</output></span><span>\(f^{\prime}(x)=\) <output id="hyperbolic-slope">0.82</output></span></div>
<p class="widget-instruction">Drag the point to compare height and tangent slope. Switch functions to see which curves flatten, steepen, or turn.</p>
</div>

Hyperbolic cosine has a horizontal tangent at $$0$$; hyperbolic sine has slope $$1$$ there. Hyperbolic tangent levels off toward heights $$-1$$ and $$1$$, with its slope tending to $$0$$ in either direction.

## Worked examples

<section class="worked" markdown="1">
<p class="element-label">Example 1</p>
<h3>Keep the inner derivative</h3>

For $$p(x)=\cosh(2x^2)$$, differentiate the outside, then the inside:

$$p^{\prime}(x)=\sinh(2x^2)\cdot4x.$$

There is no minus sign from hyperbolic cosine. The factor $$4x$$ comes from the inner function $$2x^2$$.

</section>

<section class="worked" markdown="1">
<p class="element-label">Example 2</p>
<h3>Two changing factors</h3>

For $$q(x)=x^2\sinh x$$, use the product rule:

$$q^{\prime}(x)=2x\sinh x+x^2\cosh x.$$

The first term differentiates the polynomial factor; the second differentiates hyperbolic sine.

</section>

<section class="worked" markdown="1">
<p class="element-label">Example 3</p>
<h3>The slope of a hanging cable</h3>

An ideal uniform cable hanging under its own weight forms a **catenary**. For a cable model

$$y(x)=2\cosh(x/2)-2,$$

with both coordinates in metres, its slope is

$$y^{\prime}(x)=2\sinh(x/2)\cdot\frac12=\sinh(x/2).$$

At the centre, $$y(0)=0$$ and $$y^{\prime}(0)=0$$: the cable has a horizontal tangent. At $$x=2$$, its slope is $$\sinh1\approx1.175$$, or about $$1.175$$ metres of vertical rise per metre of horizontal change.

</section>

<details class="disclosure" markdown="1">
<summary>Reciprocal hyperbolic functions (optional)</summary>

The remaining functions are $$\operatorname{sech}x=1/\cosh x$$, $$\operatorname{csch}x=1/\sinh x$$, and $$\coth x=\cosh x/\sinh x$$. Their derivatives follow from the quotient rule:

$$\frac{d}{dx}\operatorname{sech}x=-\operatorname{sech}x\tanh x.$$

$$\frac{d}{dx}\operatorname{csch}x=-\operatorname{csch}x\coth x,\qquad \frac{d}{dx}\coth x=-\operatorname{csch}^2x.$$

Hyperbolic secant is defined for every real input; hyperbolic cosecant and cotangent exclude $$0$$, where $$\sinh0=0$$.

</details>

<aside class="warning" markdown="1">
<p class="element-label">Warning</p>

Do not copy the cosine derivative's minus sign into the hyperbolic cosine rule. Keep the inner derivative in compositions, and distinguish a function’s value from its tangent slope.

</aside>
