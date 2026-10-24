---
layout: learning-topic
title: "Exponential, logarithmic and hyperbolic functions and their derivatives"
permalink: /learning/calculus/derivative-foundations/hyperbolic-functions/
course_key: calculus
module_key: elementary-function-derivatives
position: "3.3"
description: Differentiate exponentials and logarithms, then use exponentials to build hyperbolic functions.
epigraph:
  text: "By shortening the labors, the invention of logarithms doubled the life of the astronomer."
  author: "Pierre-Simon Laplace"
  source: "Observation on logarithms, quoted in the MAA review of Eli Maor, e: The Story of a Number"
  source_url: "https://old.maa.org/press/maa-reviews/e-the-story-of-a-number"
math: true
topic_script: /assets/js/learning-hyperbolic.js
sitemap: false
exercises:
  - text: 'A culture is modelled by \(N(t)=80\cdot3^{t/2}\). What is its instantaneous growth rate at \(t=0\), in cells per hour if \(t\) is in hours?'
    options: ['\(40\ln3\)', '\(80\ln3\)', '\(120\)', '\(40\)']
    correct: 0
    why: 'The fixed-base exponential rule and chain rule give \(N^{\prime}(t)=40\cdot3^{t/2}\ln3\). At zero, the exponential factor is one.'
  - text: 'For \(R(x)=\ln(1/(x+2))\), which derivative and domain are correct?'
    options: ['\(1/(x+2)\), \(x>-2\)', '\(-1/(x+2)\), \(x>-2\)', '\(-1/(x+2)\), \(x\ne-2\)', '\(-1/(x+2)^2\), \(x>-2\)']
    correct: 1
    why: 'A positive logarithm argument requires \(x>-2\). There, \(R=-\ln(x+2)\), so \(R^{\prime}=-1/(x+2)\).'
  - text: 'Let \(A(x)=e^{kx}\), with constant \(k\). Given \(A^{\prime}(0)=-2\), find \(A^{\prime\prime}(0)\).'
    options: ['\(-4\)', '\(-2\)', '\(2\)', '\(4\)']
    correct: 3
    why: 'Successive derivatives are \(ke^{kx}\) and \(k^2e^{kx}\). The first condition gives \(k=-2\), so the second derivative at zero is \(4\).'
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

## Exponentials and logarithms

An **exponential function** has a fixed positive base and a changing exponent. The **natural exponential** $$e^x$$ is distinguished by being its own derivative. Its inverse is the **natural logarithm** $$\ln x$$.

<aside class="prerequisite" markdown="1">
<p class="element-label">Prerequisite</p>
<h3>Inverse identities and logarithm laws</h3>

Here $$e\approx2.71828$$ is the natural exponential base.

$$e^{\ln x}=x\quad(x>0),\qquad\ln(e^x)=x.$$

For positive $$u,v$$ and a real constant $$r$$,

$$\ln(uv)=\ln u+\ln v,\quad\ln(u/v)=\ln u-\ln v,\quad\ln(u^r)=r\ln u.$$

For a constant base $$b>0$$, $$b^x=e^{x\ln b}$$. Logarithm laws do not split sums.

</aside>

<section class="theorem" markdown="1">
<p class="element-label">Rules</p>
<h3>Exponential and logarithmic derivatives</h3>

$$\frac{d}{dx}e^x=e^x,\qquad\frac{d}{dx}\ln x=\frac1x\quad(x>0).$$

For a constant base $$b>0$$,

$$\frac{d}{dx}b^x=b^x\ln b.$$

The exponential rules hold for every real input, including the constant case $$b=1$$.

For a differentiable inner function $$u$$, the chain rule gives

$$\frac{d}{dx}e^{u(x)}=e^{u(x)}u^{\prime}(x),$$

$$\frac{d}{dx}\ln(u(x))=\frac{u^{\prime}(x)}{u(x)},\qquad u(x)>0.$$

<details class="disclosure" markdown="1">
<summary>Derivations from the natural exponential rule (optional)</summary>

Taking $$\frac{d}{dx}e^x=e^x$$ as the starting rule, the inverse derivative theorem gives

$$\frac{d}{dx}\ln x=\frac1{e^{\ln x}}=\frac1x,\qquad x>0.$$

Rewriting the fixed-base exponential gives

$$\frac{d}{dx}b^x=\frac{d}{dx}e^{x\ln b}=e^{x\ln b}\ln b=b^x\ln b,$$

The two composition rules follow directly from the chain rule. This derives the other formulas from the natural exponential rule; it does not claim to prove that starting rule.

</details>
</section>

<mark>The base stays fixed in an exponential derivative; a changing base and exponent will need logarithmic differentiation.</mark>

<section class="worked" markdown="1">
<p class="element-label">Example 1</p>
<h3>An exponential with a changing exponent</h3>

For $$P(t)=5e^{-t^2}$$,

$$P^{\prime}(t)=5e^{-t^2}(-2t)=-10te^{-t^2}.$$

The exponential factor remains; the inner derivative supplies the factor $$-2t$$. The function and derivative are defined for all real $$t$$.

</section>

<section class="worked" markdown="1">
<p class="element-label">Example 2</p>
<h3>A logarithm and its domain</h3>

Let $$L(x)=\ln(4-x^2)$$. A positive logarithm argument requires $$-2<x<2$$. On this interval,

$$L^{\prime}(x)=\frac{-2x}{4-x^2}.$$

The same restriction applies to the derivative; a formula with a nonzero denominator alone does not extend the original domain.

</section>

<section class="worked" markdown="1">
<p class="element-label">Example 3</p>
<h3>A product with a natural logarithm</h3>

For $$F(x)=x\ln(1+x^2)$$, use the product and chain rules:

$$F^{\prime}(x)=\ln(1+x^2)+\frac{2x^2}{1+x^2}.$$

Both the function and derivative are defined for every real input, since $$1+x^2>0$$.

</section>

## Hyperbolic functions

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

explains the name: taking $$x=\cosh t$$ and $$y=\sinh t$$ places the point on the **unit hyperbola** $$x^2-y^2=1$$. The interactive figure below traces its right-hand branch. The identity follows directly from the definitions:

$$\cosh^2x-\sinh^2x=\frac{(e^x+e^{-x})^2-(e^x-e^{-x})^2}{4}=\frac{4e^xe^{-x}}4=1.$$



<div class="topic-widget hyperbolic-widget" id="hyperbolic-explorer">
<div class="limits-plot">
<svg viewBox="0 0 640 420" role="group" aria-labelledby="hyperbolic-title hyperbolic-desc">
<title id="hyperbolic-title">Trace the right branch of the unit hyperbola</title>
<desc id="hyperbolic-desc">Drag the point vertically along the right branch. Its coordinates are x equals hyperbolic cosine of t and y equals hyperbolic sine of t. Every point stays on x squared minus y squared equals one.</desc>
<defs><clipPath id="hyperbolic-clip"><rect x="60" y="25" width="520" height="350"/></clipPath></defs>
<path d="M65 200H580M100 375V25" fill="none" stroke="#c9d1c6"/>
<g clip-path="url(#hyperbolic-clip)">
<path id="hyperbolic-curve" fill="none" stroke="#285b46" stroke-width="2.6"/>
<path id="hyperbolic-guide" fill="none" stroke="#aab6a3" stroke-dasharray="3 5"/>
</g>
<g id="hyperbolic-handle" class="graph-handle" role="slider" tabindex="0" aria-label="Hyperbola parameter t" aria-valuemin="-1.6" aria-valuemax="1.6" aria-valuenow="0.75">
<circle id="hyperbolic-focus" class="graph-focus-ring" r="13" fill="none" stroke="#285b46" stroke-width="1.5"/><circle id="hyperbolic-hit" r="24" fill="transparent"/><circle id="hyperbolic-dot" r="7" fill="#285b46" stroke="#fcfcf9" stroke-width="2"/>
</g>
<path d="M170 197V203M240 197V203M310 197V203M97 60H103M97 130H103M97 270H103M97 340H103" fill="none" stroke="#9eac96"/>
<g fill="#686e66" font-size="14" font-family="-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif"><g text-anchor="middle"><text x="170" y="244">1</text><text x="240" y="244">2</text><text x="310" y="244">3</text></g><g text-anchor="end"><text x="85" y="65">2</text><text x="85" y="135">1</text><text x="85" y="275">−1</text><text x="85" y="345">−2</text><text x="85" y="225">0</text></g></g>
<g fill="#282e29" font-family="Georgia,serif" font-style="italic" font-size="17"><text x="590" y="206">x</text><text x="111" y="27">y</text></g>
</svg>

<div class="graph-legend hyperbola-legend"><span><i class="legend-curve" aria-hidden="true"></i>\(x^2-y^2=1,\ x\ge1\)</span></div>
</div>

<div class="widget-readouts"><span>\(t=\) <output id="hyperbolic-t">0.75</output></span><span>\(x=\cosh t=\) <output id="hyperbolic-x">1.29</output></span><span>\(y=\sinh t=\) <output id="hyperbolic-y">0.82</output></span></div>
<p class="widget-instruction">Drag the point along the branch. Its coordinates \((\cosh t,\sinh t)\) always satisfy \(x^2-y^2=1\)—the reason for the name <em>hyperbolic</em>.</p>
</div>

The coordinates always satisfy the unit-hyperbola identity. At $$t=0$$ the point is $$(1,0)$$; negative and positive values trace the lower and upper parts of the same branch.


## Graphs of the hyperbolic functions

<div class="hyperbolic-album graph-album topic-widget" id="hyperbolic-graphs">

<div class="scenario-panel hyperbolic-sinh"><figure class="topic-figure"><div class="limits-plot"><img src="{{ '/assets/figures/learning/hyperbolic-sinh.svg' | relative_url }}" alt="Hyperbolic sine passes through the origin and rises from negative to positive values, with symmetry about the origin." width="640" height="380"><div class="graph-legend"><i class="legend-curve" aria-hidden="true"></i>\(y=\sinh x\)</div></div><figcaption>\(\sinh x\) is odd: \(\sinh(-x)=-\sinh x\). It passes through \((0,0)\).</figcaption></figure></div>
<div class="scenario-panel hyperbolic-cosh"><figure class="topic-figure"><div class="limits-plot"><img src="{{ '/assets/figures/learning/hyperbolic-cosh.svg' | relative_url }}" alt="Hyperbolic cosine is symmetric about the vertical axis, with its lowest point at zero, one, and rises on both sides." width="640" height="380"><div class="graph-legend"><i class="legend-curve" aria-hidden="true"></i>\(y=\cosh x\)</div></div><figcaption>\(\cosh x\) is even: \(\cosh(-x)=\cosh x\). Its lowest value is \(1\), at \(x=0\).</figcaption></figure></div>
<div class="scenario-panel hyperbolic-tanh"><figure class="topic-figure"><div class="limits-plot"><img src="{{ '/assets/figures/learning/hyperbolic-tanh.svg' | relative_url }}" alt="Hyperbolic tangent rises through the origin, approaching horizontal asymptotes at minus one and one." width="640" height="380"><div class="graph-legend"><i class="legend-curve" aria-hidden="true"></i>\(y=\tanh x\)</div></div><figcaption>\(\tanh x\) is odd and stays between \(-1\) and \(1\), approaching these horizontal asymptotes at the two ends.</figcaption></figure></div>
<fieldset class="scenario-choices"><legend>Choose a graph</legend>
<label><input type="radio" name="hyperbolic-graph" value="sinh" checked><span>\(\sinh x\)</span></label>
<label><input type="radio" name="hyperbolic-graph" value="cosh"><span>\(\cosh x\)</span></label>
<label><input type="radio" name="hyperbolic-graph" value="tanh"><span>\(\tanh x\)</span></label>
</fieldset>
</div>

## Hyperbolic derivatives

The exponential rules above give $$\frac{d}{dx}e^{-x}=-e^{-x}$$. Differentiate the definitions term by term to obtain the hyperbolic rules.

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

## Hyperbolic examples

<section class="worked" markdown="1">
<p class="element-label">Example 4</p>
<h3>Keep the inner derivative</h3>

For $$p(x)=\cosh(2x^2)$$, differentiate the outside, then the inside:

$$p^{\prime}(x)=\sinh(2x^2)\cdot4x.$$

There is no minus sign from hyperbolic cosine. The factor $$4x$$ comes from the inner function $$2x^2$$.

</section>

<section class="worked" markdown="1">
<p class="element-label">Example 5</p>
<h3>Two changing factors</h3>

For $$q(x)=x^2\sinh x$$, use the product rule:

$$q^{\prime}(x)=2x\sinh x+x^2\cosh x.$$

The first term differentiates the polynomial factor; the second differentiates hyperbolic sine.

</section>

<section class="worked" markdown="1">
<p class="element-label">Example 6</p>
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
