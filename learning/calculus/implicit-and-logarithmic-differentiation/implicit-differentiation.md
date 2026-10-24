---
layout: learning-topic
title: "Implicit differentiation"
permalink: /learning/calculus/implicit-and-logarithmic-differentiation/implicit-differentiation/
course_key: calculus
module_key: elementary-function-derivatives
position: "3.4"
description: Differentiate a relation without first solving it for one variable.
epigraph:
  text: "Mathematicians do not study objects, but relations between objects."
  author: "Henri Poincaré"
  source: "Science and Hypothesis, relations between mathematical objects"
  source_url: "https://mathshistory.st-andrews.ac.uk/Biographies/Poincare/quotations/"
math: true
topic_script: /assets/js/learning-implicit.js
sitemap: false
exercises:
  - text: 'A student calculates a tangent slope for \(xy=6\) at \((2,2)\). What should they check first?'
    options: ['Whether the point lies on the curve', 'Whether both coordinates are positive', 'Whether the curve can be solved using a square root']
    correct: 0
    why: 'Here \(2\cdot2=4\ne6\), so the point is not on the curve. Substituting coordinates into a derivative formula does not create a tangent at a point outside the curve.'
  - text: 'A rectangle keeps area \(12\,\mathrm{m^2}\). When its length \(x\) is \(3\,\mathrm{m}\) and width \(y\) is \(4\,\mathrm{m}\), what is \(dy/dx\)?'
    options: ['\(4/3\)', '\(-4/3\)', '\(-3/4\)', '\(0\)']
    correct: 1
    why: 'The constraint is \(xy=12\). Differentiating gives \(y+xy^{\prime}=0\), hence \(dy/dx=-y/x=-4/3\). The width must shrink as the length grows to preserve the area.'
  - text: 'For \(x+y^2=5\), find \(dx/dy\) at \((1,2)\). Notice which variable is in the denominator.'
    options: ['\(-1/4\)', '\(-4\)', '\(4\)', '\(0\)']
    correct: 1
    why: 'Differentiate with respect to \(y\): \(dx/dy+2y=0\), so \(dx/dy=-2y=-4\). The value \(-1/4\) would instead be \(dy/dx\) at this point.'
  - text: 'When \(y\) depends on \(x\), what is \(d[\cos(x+y)]/dx\)?'
    options: ['\(-\sin(x+y)\)', '\(-\sin(x+y)\cdot y^{\prime}\)', '\(-\sin(x+y)\cdot(1+y^{\prime})\)', '\(\cos(x+y)\cdot(1+y^{\prime})\)']
    correct: 2
    why: 'The inner function is \(x+y(x)\), whose derivative is \(1+y^{\prime}\). The cosine rule and chain rule supply both the minus sign and this whole inner derivative.'
  - text: 'For \(y^2=x^2\), implicit differentiation gives \(y^{\prime}=x/y\) when \(y\ne0\). Does the resulting \(0/0\) at the origin prove there is a vertical tangent?'
    options: ['Yes: every zero denominator means a vertical tangent', 'No: the relation is two crossing lines, each with a finite slope', 'Yes: the slope must be zero']
    correct: 1
    why: 'Factor the relation as \((y-x)(y+x)=0\). It consists of \(y=x\) and \(y=-x\), with slopes \(1\) and \(-1\). The undefined quotient does not determine a tangent at the crossing.'
  - text: 'Near \((1,2)\) on \(x^3+y^3=9\), the input \(x\) increases by \(0.04\). What change in \(y\) does the tangent predict?'
    options: ['About \(-0.01\)', 'About \(0.01\)', 'About \(-0.16\)', 'Exactly \(-0.01\)']
    correct: 0
    why: 'Differentiating gives \(3x^2+3y^2y^{\prime}=0\). At \((1,2)\), the slope is \(-1/4\), so \(\Delta y\approx(-1/4)(0.04)=-0.01\). This is a local approximation, not an exact finite change.'
  - text: 'On the curve \(y^3+xy=2\), the point \((1,1)\) has slope \(y^{\prime}=-1/4\). What is \(y^{\prime\prime}\) there?'
    options: ['\(-1/32\)', '\(1/32\)', '\(0\)', '\(1/4\)']
    correct: 1
    why: 'First, \((3y^2+x)y^{\prime}=-y\). Differentiate again: \((3y^2+x)y^{\prime\prime}+(6yy^{\prime}+1)y^{\prime}=-y^{\prime}\). At the point this gives \(4y^{\prime\prime}=1/2-6/16=1/8\), hence \(y^{\prime\prime}=1/32\).'

---

## The idea

An **explicit** equation gives the output directly, such as $$y=x^2$$. An **implicit** equation gives a relation between the variables, such as $$x^2+y^2=4$$.

A relation need not define one function on its whole curve. The circle has an upper branch and a lower branch, for example. Where we can follow a differentiable branch as $$y=y(x)$$, we can differentiate its equation without first solving for that branch.

<aside class="definition" markdown="1">
<p class="element-label">Method</p>
<h3>Implicit differentiation</h3>

Treat $$y$$ as a function of $$x$$ and differentiate both sides with respect to $$x$$. Use the chain rule on expressions involving $$y$$, then collect the terms containing $$y^{\prime}$$ and solve for it.

$$\frac{dy}{dx}=y^{\prime},\qquad \frac{d}{dx}(y^2)=2yy^{\prime},\qquad \frac{d}{dx}(\sin(y))=\cos(y)\cdot y^{\prime}.$$

For a mixed product, use the product rule as well:

$$\frac{d}{dx}(xy)=1\cdot y+x\cdot y^{\prime}.$$

</aside>

<mark markdown="span">The factor $$y^{\prime}$$ comes from the chain rule: the variable $$y$$ changes as $$x$$ changes.</mark> It is not an extra symbol attached arbitrarily.

<section class="worked" markdown="1">
<p class="element-label">Example 1</p>
<h3>Slopes on a circle</h3>

For $$x^2+y^2=4$$, differentiate the two sides:

$$2x+2yy^{\prime}=0.$$

Solving gives

$$y^{\prime}=-\frac{x}{y},\qquad y\ne0.$$

The slope depends on *both coordinates*. At $$(1,\sqrt3)$$ it is $$-1/\sqrt3$$; at $$(1,-\sqrt3)$$ it is $$1/\sqrt3$$. The same input can lie on two branches with different slopes.

</section>

<div class="topic-widget implicit-widget" id="implicit-explorer">

<div class="limits-plot">
<svg viewBox="0 0 640 420" role="group" aria-labelledby="implicit-title implicit-desc">
<title id="implicit-title">Move a point around the circle and inspect its tangent</title>
<desc id="implicit-desc">Drag the point around the whole circle. The tangent can be horizontal, sloping, or vertical. The derivative with respect to x is undefined at the two vertical tangents.</desc>
<defs><clipPath id="implicit-clip"><rect x="90" y="20" width="460" height="380"/></clipPath></defs>
<path d="M90 210H550M320 395V20" fill="none" stroke="#c9d1c6"/>
<circle cx="320" cy="210" r="150" fill="none" stroke="#285b46" stroke-width="2.6" stroke-opacity="0.5"/>
<path id="implicit-guide" fill="none" stroke="#c4cebf" stroke-dasharray="3 5"/>
<path id="implicit-tangent" fill="none" stroke="#a67936" stroke-width="2" clip-path="url(#implicit-clip)"/>
<g id="implicit-handle" class="graph-handle" role="slider" tabindex="0" aria-label="Point around the circle" aria-valuemin="0" aria-valuemax="6.283185307179586" aria-valuenow="0.7853981633974483">
<circle id="implicit-focus" class="graph-focus-ring" r="13" fill="none" stroke="#285b46" stroke-width="1.5"/><circle id="implicit-hit" r="24" fill="transparent"/><circle id="implicit-dot" r="7" fill="#285b46" stroke="#fcfcf9" stroke-width="2"/>
</g>
<g fill="#686e66" font-family="-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif" font-size="14"><text x="170" y="236" text-anchor="middle">−2</text><text x="470" y="236" text-anchor="middle">2</text><text x="302" y="65" text-anchor="end">2</text><text x="302" y="365" text-anchor="end">−2</text></g>
<path class="axis-ticks" d="M170 207V213M470 207V213M317 60H323M317 360H323" fill="none" stroke="#9eac96" stroke-width="1"/>
</svg>
<div class="graph-legend implicit-legend"><span><i class="legend-curve" aria-hidden="true"></i>\(x^2+y^2=4\)</span><span><i class="derivative-tangent-key" aria-hidden="true"></i>Tangent</span></div>
<span class="implicit-axis implicit-axis-x">\(x\)</span><span class="implicit-axis implicit-axis-y">\(y\)</span>
</div>
<div class="implicit-readouts widget-readouts"><span>\(x=\) <output id="implicit-x">1.41</output></span><span>\(y=\) <output id="implicit-y">1.41</output></span><span>\(\frac{dy}{dx}=\) <output id="implicit-slope">−1.00</output></span></div>
<p class="widget-instruction">Drag the point around the circle. Compare the two branches, and watch the tangent turn vertical when \(y=0\).</p>
</div>

## Using the derivative

<section class="worked" markdown="1">
<p class="element-label">Example 2</p>
<h3>A tangent without solving a quadratic</h3>

Find the tangent to $$x^2+xy+y^2=7$$ at $$(1,2)$$. First verify the point: $$1+2+4=7$$. Differentiating gives

$$2x+y+xy^{\prime}+2yy^{\prime}=0.$$

Collect the derivative terms:

$$(x+2y)y^{\prime}=-(2x+y),\qquad y^{\prime}=-\frac{2x+y}{x+2y}.$$

At $$(1,2)$$, the denominator is nonzero and the slope is $$-4/5$$. The tangent is

$$y-2=-\frac45(x-1).$$

</section>

<section class="worked" markdown="1">
<p class="element-label">Example 3</p>
<h3>A trigonometric relation</h3>

For $$\sin(y)+xy=x$$, differentiate each term:

$$\cos(y)\cdot y^{\prime}+y+xy^{\prime}=1.$$

Thus

$$(\cos(y)+x)y^{\prime}=1-y,\qquad y^{\prime}=\frac{1-y}{\cos(y)+x},\qquad \cos(y)+x\ne0.$$

At $$(0,0)$$, the relation holds and the slope is $$1$$. Notice the two different rules: the chain rule supplies $$y^{\prime}$$ in the sine term, while the product rule supplies both terms from $$xy$$.

</section>

## Differentiate again

<section class="worked" markdown="1">
<p class="element-label">Example 4</p>
<h3>A second derivative along the curve</h3>

On the circle $$x^2+y^2=4$$, we already found $$x+yy^{\prime}=0$$. The factor $$y^{\prime}$$ is itself a function of $$x$$. Differentiating the product gives

$$1+(y^{\prime})^2+yy^{\prime\prime}=0.$$

For $$y\ne0$$, substitute $$y^{\prime}=-x/y$$:

$$y^{\prime\prime}=-\frac{1+x^2/y^2}{y}=-\frac{x^2+y^2}{y^3}=-\frac4{y^3}.$$

At $$(0,2)$$, $$y^{\prime}=0$$ while $$y^{\prime\prime}=-1/2$$: the tangent is horizontal, but its slope changes as we move along the upper branch. At the vertical tangents, these derivatives with respect to $$x$$ are not finite.

</section>

## Horizontal and vertical tangents

On the circle, $$y^{\prime}=-x/y$$ is zero when $$x=0$$ and $$y\ne0$$. Hence the top and bottom points $$(0,\pm2)$$ have horizontal tangents.

At $$(\pm2,0)$$, the tangent is vertical, so there is no finite $$dy/dx$$. One way to confirm this is to regard $$x$$ as a function of $$y$$ instead:

$$2x\frac{dx}{dy}+2y=0,\qquad \frac{dx}{dy}=-\frac{y}{x}=0$$

at these points. The tangent direction has no horizontal change there, so its line is $$x=2$$ or $$x=-2$$.

<aside class="warning" markdown="1">
<p class="element-label">Warning</p>

Do not treat $$y$$ as a constant when differentiating with respect to $$x$$. Also, an undefined derivative formula does not by itself prove there is a vertical tangent. If both numerator and denominator vanish, inspect the curve or its branches before drawing a conclusion.

</aside>
